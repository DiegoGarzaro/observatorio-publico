import asyncio
import csv
import io
import logging
import re
import zipfile
from dataclasses import dataclass, field
from datetime import date, timedelta

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.etl.camara_client import CamaraClient
from app.etl.senado_client import SenadoClient
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.party_repository import PartyRepository
from app.repositories.politician_repository import PoliticianRepository
from app.repositories.proposition_repository import PropositionRepository
from app.repositories.vote_repository import VoteRepository

_PROP_REF_RE = re.compile(r"^([A-ZÁÇÕ]+)\s+(\d+)/(\d{4})$")

logger = logging.getLogger(__name__)

CURRENT_LEGISLATURE = 57
_CONCURRENT_VOTACOES = 8  # max concurrent API calls when fetching votes per votação
_CONCURRENT_PROPS = 8  # max concurrent API calls when fetching proposition details
_ENRICH_BATCH = 200  # propositions fetched per enrichment round


@dataclass
class JobResult:
    """Result summary of a single ETL job run.

    Attributes:
        job (str): Job name.
        processed (int): Total records processed.
        errors (int): Total records that failed.
        messages (list[str]): Human-readable log messages.
    """

    job: str
    processed: int = 0
    errors: int = 0
    messages: list[str] = field(default_factory=list)

    def log(self, msg: str) -> None:
        """Append a message and log it.

        Args:
            msg (str): Message to record.
        """
        self.messages.append(msg)
        logger.info("[%s] %s", self.job, msg)


async def ingest_deputies(session: AsyncSession, client: CamaraClient) -> JobResult:
    """Fetch all active deputies and upsert into the database.

    Each deputy is processed inside its own savepoint so a single failure
    does not abort the entire job.

    Args:
        session (AsyncSession): Active database session.
        client (CamaraClient): Câmara API client.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="ingest_deputies")
    party_repo = PartyRepository(session)
    politician_repo = PoliticianRepository(session)

    async for deputy in client.get_deputies(CURRENT_LEGISLATURE):
        try:
            async with session.begin_nested():
                sigla_partido = deputy.get("siglaPartido") or "SEM PARTIDO"

                party = await party_repo.upsert(
                    abbreviation=sigla_partido,
                    name=sigla_partido,
                )

                await politician_repo.upsert(
                    external_id=deputy["id"],
                    data={
                        "role": "deputado_federal",
                        "source": "camara",
                        "name": deputy.get("nome", ""),
                        "photo_url": deputy.get("urlFoto"),
                        "party_id": party.id,
                        "uf": deputy.get("siglaUf"),
                        "legislature": CURRENT_LEGISLATURE,
                    },
                )

            result.processed += 1

        except Exception as exc:
            result.errors += 1
            logger.warning("Failed to ingest deputy %s: %s", deputy.get("id"), exc)

    await session.commit()
    result.log(f"Done — {result.processed} deputies, {result.errors} errors")
    return result


async def enrich_deputy_details(
    session: AsyncSession,
    client: CamaraClient,
    *,
    politician_ids: list[int] | None = None,
) -> JobResult:
    """Fetch and store full details (email, phone) for each deputy.

    Each deputy is processed inside its own savepoint so a single failure
    does not abort the entire job.

    Args:
        session (AsyncSession): Active database session.
        client (CamaraClient): Câmara API client.
        politician_ids (list[int] | None): If provided, only process deputies
            whose external_id is in this list.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="enrich_deputy_details")
    politician_repo = PoliticianRepository(session)

    politicians, _ = await politician_repo.list(
        legislature=CURRENT_LEGISLATURE, source="camara", page=1, page_size=10_000
    )
    if politician_ids is not None:
        politicians = [p for p in politicians if p.external_id in politician_ids]

    for politician in politicians:
        try:
            detail = await client.get_deputy_detail(politician.external_id)
            dados = detail.get("ultimoStatus", {})
            gabinete = dados.get("gabinete") or {}

            async with session.begin_nested():
                await politician_repo.update_by_external_id(
                    external_id=politician.external_id,
                    data={
                        "email": gabinete.get("email"),
                        "phone": gabinete.get("telefone"),
                    },
                    source="camara",
                )

            result.processed += 1

        except Exception as exc:
            result.errors += 1
            logger.warning("Failed to enrich deputy %d: %s", politician.external_id, exc)

    await session.commit()
    result.log(f"Done — {result.processed} enriched, {result.errors} errors")
    return result


async def ingest_expenses(
    session: AsyncSession,
    client: CamaraClient,
    *,
    year: int | None = None,
    politician_ids: list[int] | None = None,
) -> JobResult:
    """Fetch CEAP expenses for all deputies and bulk-upsert into the database.

    Each deputy's batch is committed in its own savepoint. A failure in one
    deputy's batch does not affect the others.

    Args:
        session (AsyncSession): Active database session.
        client (CamaraClient): Câmara API client.
        year (int | None): Year to fetch. Defaults to all available years.
        politician_ids (list[int] | None): If provided, only fetch expenses for
            deputies whose external_id is in this list.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="ingest_expenses")
    politician_repo = PoliticianRepository(session)
    expense_repo = ExpenseRepository(session)

    politicians, _ = await politician_repo.list(
        legislature=CURRENT_LEGISLATURE, page=1, page_size=10_000
    )
    if politician_ids is not None:
        politicians = [p for p in politicians if p.external_id in politician_ids]

    for politician in politicians:
        batch: list[dict] = []

        try:
            async for expense in client.get_expenses(politician.external_id, year=year):
                doc_number = str(expense.get("numDocumento", ""))
                competence = f"{expense.get('ano')}-{expense.get('mes')}"
                external_id = f"{politician.external_id}-{competence}-{doc_number}"

                raw_value = expense.get("valorLiquido") or 0
                if float(raw_value) <= 0:
                    continue

                batch.append(
                    {
                        "external_id": external_id,
                        "politician_id": politician.id,
                        "year": expense.get("ano"),
                        "month": expense.get("mes"),
                        "category": expense.get("tipoDespesa", "Outros"),
                        "description": expense.get("descricao"),
                        "supplier_name": expense.get("nomeFornecedor"),
                        "supplier_document": expense.get("cnpjCpfFornecedor"),
                        "value": raw_value,
                        "doc_url": expense.get("urlDocumento"),
                    }
                )

            async with session.begin_nested():
                count = await expense_repo.upsert_bulk(batch)

            await session.commit()
            result.processed += count

        except Exception as exc:
            result.errors += 1
            logger.warning(
                "Failed to ingest expenses for deputy %d: %s",
                politician.external_id,
                exc,
            )

    result.log(f"Done — {result.processed} expenses, {result.errors} errors")
    return result


async def ingest_propositions(
    session: AsyncSession,
    client: CamaraClient,
    *,
    year: int | None = None,
    politician_ids: list[int] | None = None,
) -> JobResult:
    """Fetch propositions authored by each deputy and upsert into the database.

    Args:
        session (AsyncSession): Active database session.
        client (CamaraClient): Câmara API client.
        year (int | None): Filter by submission year.
        politician_ids (list[int] | None): If provided, only fetch propositions
            for deputies whose external_id is in this list.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="ingest_propositions")
    politician_repo = PoliticianRepository(session)
    proposition_repo = PropositionRepository(session)

    politicians, _ = await politician_repo.list(
        legislature=CURRENT_LEGISLATURE, page=1, page_size=10_000
    )
    if politician_ids is not None:
        politicians = [p for p in politicians if p.external_id in politician_ids]

    for politician in politicians:
        batch: list[dict] = []

        try:
            async for prop in client.get_propositions_by_author(politician.external_id, year=year):
                batch.append(
                    {
                        "external_id": prop["id"],
                        "author_id": politician.id,
                        "prop_type": prop.get("siglaTipo", ""),
                        "number": prop.get("numero", 0),
                        "year": prop.get("ano", 0),
                        "title": prop.get("ementa"),
                        "status": (
                            (prop.get("statusProposicao") or {}).get("descricaoSituacao")
                            or (prop.get("statusProposicao") or {}).get("descricaoTramitacao")
                        ),
                    }
                )

            # Deduplicate by external_id — the API occasionally returns the
            # same proposition twice (e.g. co-authorship or pagination overlap).
            # Use str key to avoid int/float type divergence from the JSON parser.
            seen: dict[str, dict] = {}
            for item in batch:
                seen[str(item["external_id"])] = item
            unique_batch = list(seen.values())

            async with session.begin_nested():
                count = await proposition_repo.upsert_bulk(unique_batch)

            await session.commit()
            result.processed += count

        except Exception as exc:
            result.errors += 1
            logger.warning(
                "Failed to ingest propositions for deputy %d: %s",
                politician.external_id,
                exc,
            )

    result.log(f"Done — {result.processed} propositions, {result.errors} errors")
    return result


def _quarterly_chunks(date_start: str, date_end: str) -> list[tuple[str, str]]:
    """Split a date range into at-most-90-day chunks.

    The Câmara API rejects /votacoes requests spanning more than 3 months.
    This helper produces non-overlapping (start, end) pairs covering the
    full requested range.

    Args:
        date_start (str): Inclusive start date in YYYY-MM-DD format.
        date_end (str): Inclusive end date in YYYY-MM-DD format.

    Returns:
        list[tuple[str, str]]: List of (chunk_start, chunk_end) string pairs.
    """
    start = date.fromisoformat(date_start)
    end = date.fromisoformat(date_end)
    chunks: list[tuple[str, str]] = []

    current = start
    while current <= end:
        chunk_end = min(current + timedelta(days=89), end)
        chunks.append((current.isoformat(), chunk_end.isoformat()))
        current = chunk_end + timedelta(days=1)

    return chunks


async def ingest_votes(
    session: AsyncSession,
    client: CamaraClient,
    *,
    date_start: str,
    date_end: str,
    politician_ids: list[int] | None = None,
) -> JobResult:
    """Fetch all votações in a date range and store each deputy's vote.

    Collects all votações for each 90-day chunk, then fetches individual votes
    concurrently (up to _CONCURRENT_VOTACOES at a time) using asyncio.Semaphore.
    All results are bulk-upserted in a single DB call per chunk.

    Args:
        session (AsyncSession): Active database session.
        client (CamaraClient): Câmara API client.
        date_start (str): Start date in YYYY-MM-DD format.
        date_end (str): End date in YYYY-MM-DD format.
        politician_ids (list[int] | None): If provided, only store votes for
            deputies whose external_id is in this list.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="ingest_votes")
    politician_repo = PoliticianRepository(session)
    proposition_repo = PropositionRepository(session)
    vote_repo = VoteRepository(session)

    # Build an external_id → internal_id lookup to avoid per-vote DB queries
    politicians, _ = await politician_repo.list(
        legislature=CURRENT_LEGISLATURE, page=1, page_size=10_000
    )
    deputy_map: dict[int, int] = {
        p.external_id: p.id
        for p in politicians
        if politician_ids is None or p.external_id in politician_ids
    }

    semaphore = asyncio.Semaphore(_CONCURRENT_VOTACOES)

    async def _fetch_votacao_batch(votacao: dict) -> tuple[list[dict], int]:
        """Fetch votes for one votação and return (batch, error_count).

        Args:
            votacao (dict): Votação summary from the list endpoint.

        Returns:
            tuple[list[dict], int]: Vote records ready for upsert and error count (0 or 1).
        """
        votacao_id = str(votacao.get("id", ""))
        date_str = (votacao.get("dataHoraRegistro") or "")[:10]
        session_date_raw = date.fromisoformat(date_str) if date_str else None
        # proposicaoObjeto: short identifier e.g. "PL 1234/2023" — what is being voted on.
        # descricao: result text e.g. "Aprovado. Sim: 300..." — stored separately.
        proposition_ref: str | None = votacao.get("proposicaoObjeto") or None
        description: str | None = votacao.get("descricao") or None

        async with semaphore:
            try:
                raw_votes = await client.get_votes_in_votacao(votacao_id)
            except Exception as exc:
                logger.warning("Failed to fetch votes for votacao %s: %s", votacao_id, exc)
                return [], 1

        batch: list[dict] = []
        for raw in raw_votes:
            deputy_data = raw.get("deputado_") or {}
            external_deputy_id = deputy_data.get("id")
            internal_id = deputy_map.get(external_deputy_id)

            if not internal_id:
                continue  # deputy not in our DB yet — skip

            batch.append(
                {
                    "external_votacao_id": votacao_id,
                    "politician_id": internal_id,
                    "proposition_id": None,  # resolved in bulk after fetch
                    "direction": raw.get("tipoVoto", "Desconhecido"),
                    "session_date": session_date_raw,
                    "description": description,
                    "proposition_ref": proposition_ref,
                }
            )

        return batch, 0

    for chunk_start, chunk_end in _quarterly_chunks(date_start, date_end):
        logger.info("[ingest_votes] Fetching chunk %s → %s", chunk_start, chunk_end)

        try:
            # Collect all votações for this chunk before fetching votes concurrently
            votacoes: list[dict] = [
                v async for v in client.get_votacoes(date_start=chunk_start, date_end=chunk_end)
            ]
            logger.info(
                "[ingest_votes] %d votações in chunk — fetching votes (%d concurrent)",
                len(votacoes),
                _CONCURRENT_VOTACOES,
            )

            # Fetch votes for all votações concurrently
            fetch_results = await asyncio.gather(*(_fetch_votacao_batch(v) for v in votacoes))

            # Merge batches and accumulate error counts
            chunk_batch: list[dict] = []
            for batch, errors in fetch_results:
                result.errors += errors
                chunk_batch.extend(batch)

            if chunk_batch:
                # Resolve proposition_id from proposition_ref in bulk.
                # Parse refs like "PL 4614/2024" → (prop_type, number, year) and
                # do a single DB lookup for all unique refs in the chunk.
                unique_refs: set[tuple[str, int, int]] = set()
                for record in chunk_batch:
                    ref = record.get("proposition_ref")
                    if ref:
                        m = _PROP_REF_RE.match(ref.strip())
                        if m:
                            unique_refs.add((m.group(1), int(m.group(2)), int(m.group(3))))

                ref_to_id: dict[tuple[str, int, int], int] = {}
                if unique_refs:
                    ref_to_id = await proposition_repo.get_ids_by_refs(list(unique_refs))
                    logger.info(
                        "[ingest_votes] Resolved %d / %d proposition refs",
                        len(ref_to_id),
                        len(unique_refs),
                    )

                for record in chunk_batch:
                    ref = record.get("proposition_ref")
                    if ref:
                        m = _PROP_REF_RE.match(ref.strip())
                        if m:
                            key = (m.group(1), int(m.group(2)), int(m.group(3)))
                            record["proposition_id"] = ref_to_id.get(key)

                async with session.begin_nested():
                    count = await vote_repo.upsert_bulk(chunk_batch)
                await session.commit()
                result.processed += count
                logger.info(
                    "[ingest_votes] Upserted %d votes for chunk %s → %s",
                    count,
                    chunk_start,
                    chunk_end,
                )

        except Exception as exc:
            result.errors += 1
            logger.warning("Failed to process chunk %s → %s: %s", chunk_start, chunk_end, exc)

    result.log(f"Done — {result.processed} votes, {result.errors} errors")
    return result


async def enrich_propositions_status(
    session: AsyncSession,
    client: CamaraClient,
    *,
    batch_size: int = _ENRICH_BATCH,
) -> JobResult:
    """Fetch and store the current status for propositions that have none.

    Queries propositions with null status in batches of `batch_size`, fetches
    the detail endpoint for each concurrently (up to _CONCURRENT_PROPS at a
    time), then bulk-updates the status column.

    Args:
        session (AsyncSession): Active database session.
        client (CamaraClient): Câmara API client.
        batch_size (int): Propositions processed per round. Defaults to _ENRICH_BATCH.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="enrich_propositions_status")
    proposition_repo = PropositionRepository(session)
    semaphore = asyncio.Semaphore(_CONCURRENT_PROPS)

    async def _fetch_status(prop: object) -> dict | None:
        """Fetch the current status for a single proposition.

        Args:
            prop (object): Proposition ORM instance with external_id attribute.

        Returns:
            dict | None: {'external_id': int, 'status': str} or None on failure.
        """
        async with semaphore:
            try:
                detail = await client.get_proposition_detail(prop.external_id)
                status_obj = detail.get("statusProposicao") or {}
                status = status_obj.get("descricaoSituacao") or status_obj.get(
                    "descricaoTramitacao"
                )
                return {"external_id": prop.external_id, "status": status}
            except Exception as exc:
                logger.warning(
                    "Failed to fetch detail for proposition %d: %s",
                    prop.external_id,
                    exc,
                )
                return None

    while True:
        propositions = await proposition_repo.list_without_status(limit=batch_size)
        if not propositions:
            break

        logger.info(
            "[enrich_propositions_status] Fetching status for %d propositions",
            len(propositions),
        )

        fetch_results = await asyncio.gather(*(_fetch_status(p) for p in propositions))
        updates = [r for r in fetch_results if r is not None and r["status"]]
        errors = sum(1 for r in fetch_results if r is None)

        if updates:
            async with session.begin_nested():
                await proposition_repo.update_status_bulk(updates)
            await session.commit()

        result.processed += len(updates)
        result.errors += errors

        logger.info(
            "[enrich_propositions_status] Updated %d / %d in this batch (%d errors)",
            len(updates),
            len(propositions),
            errors,
        )

        # Stop if fewer propositions were returned than requested
        # (means we've processed all available)
        if len(propositions) < batch_size:
            break

    result.log(f"Done — {result.processed} statuses updated, {result.errors} errors")
    return result


async def ingest_ceaps(
    session: AsyncSession,
    client: SenadoClient,
    *,
    year: int,
) -> JobResult:
    """Download the CEAPS CSV for the given year and upsert senator expenses.

    Senators are matched by name using normalized string comparison (ASCII,
    uppercase, collapsed spaces) so minor encoding differences don't break
    the match.

    Args:
        session (AsyncSession): Active database session.
        client (SenadoClient): Senado API client (provides CSV download).
        year (int): Reference year for the CEAPS file.

    Returns:
        JobResult: Summary with counts and messages.
    """
    from app.etl.senado_client import normalize_name

    result = JobResult(job="ingest_ceaps")
    politician_repo = PoliticianRepository(session)
    expense_repo = ExpenseRepository(session)

    # Build a normalized-name → internal-id lookup for all senators
    senators, _ = await politician_repo.list(role="senador", page=1, page_size=10_000)
    name_to_id: dict[str, int] = {normalize_name(s.name): s.id for s in senators}

    try:
        rows = await client.get_ceaps_csv(year)
    except Exception as exc:
        result.log(f"Failed to download CEAPS CSV for {year}: {exc}")
        return result

    batch: list[dict] = []
    unmatched: set[str] = set()

    for row in rows:
        senator_name = row.get("SENADOR", "").strip()
        normalized = normalize_name(senator_name) if senator_name else ""
        politician_id = name_to_id.get(normalized)

        if not politician_id:
            unmatched.add(senator_name)
            result.errors += 1
            continue

        # Parse value — Brazilian format uses comma as decimal separator
        raw_value_str = (row.get("VALOR_REEMBOLSADO") or "0").replace(".", "").replace(",", ".")
        try:
            value = float(raw_value_str)
        except ValueError:
            value = 0.0

        if value <= 0:
            continue

        month_raw = row.get("MES", "0")
        try:
            month = int(month_raw)
        except ValueError:
            month = 0

        doc = (row.get("DOCUMENTO") or "").strip()
        external_id = f"ceaps-{year}-{normalized[:30]}-{month}-{doc}"

        description = (row.get("DETALHAMENTO") or "").strip() or None
        supplier_name = (row.get("FORNECEDOR") or "").strip() or None
        supplier_doc = (row.get("CNPJ_CPF") or "").strip() or None

        batch.append(
            {
                "external_id": external_id[:100],
                "politician_id": politician_id,
                "year": year,
                "month": month,
                "category": (row.get("TIPO_DESPESA") or "Outros").strip()[:255],
                "description": description[:500] if description else None,
                "supplier_name": supplier_name[:255] if supplier_name else None,
                "supplier_document": supplier_doc[:20] if supplier_doc else None,
                "value": value,
                "doc_url": None,
            }
        )

    if unmatched:
        logger.warning(
            "[ingest_ceaps] %d unmatched senator names: %s",
            len(unmatched),
            list(unmatched)[:10],
        )

    if batch:
        # Deduplicate by external_id — the CSV may contain duplicate rows for
        # the same document (e.g. correction entries). Last row wins.
        seen_ceaps: dict[str, dict] = {}
        for record in batch:
            seen_ceaps[record["external_id"]] = record
        batch = list(seen_ceaps.values())

        # asyncpg caps query parameters at 32767. The Expense model has ~10
        # columns, so chunk at 2000 rows (~20k params) to stay well under the limit.
        _CEAPS_CHUNK = 2000
        total_upserted = 0
        for i in range(0, len(batch), _CEAPS_CHUNK):
            chunk = batch[i : i + _CEAPS_CHUNK]
            async with session.begin_nested():
                total_upserted += await expense_repo.upsert_bulk(chunk)
            await session.commit()
        result.processed = total_upserted

    result.log(
        f"Done — {result.processed} expenses upserted, {result.errors} rows unmatched for {year}"
    )
    return result


async def ingest_senator_votes(
    session: AsyncSession,
    client: SenadoClient,
    *,
    year: int | None = None,
) -> JobResult:
    """Fetch voting records for all senators and upsert into the votes table.

    Each senator is fetched individually from the Senado API. A failure in
    one senator's batch does not affect the others.

    Args:
        session (AsyncSession): Active database session.
        client (SenadoClient): Senado API client.
        year (int | None): Filter by year. Defaults to current year.

    Returns:
        JobResult: Summary with counts and messages.
    """
    from datetime import datetime as dt

    result = JobResult(job="ingest_senator_votes")
    politician_repo = PoliticianRepository(session)
    vote_repo = VoteRepository(session)

    ref_year = year or dt.now().year

    senators, _ = await politician_repo.list(role="senador", page=1, page_size=10_000)

    for senator in senators:
        try:
            raw_votes = await client.get_senator_votes(senator.external_id, year=ref_year)

            batch: list[dict] = []
            for vote in raw_votes:
                sessao = vote.get("SessaoPlenaria") or {}
                session_date_str = (sessao.get("DataSessao") or "")[:10]
                session_date = None
                if session_date_str:
                    try:
                        from datetime import date as date_type

                        session_date = date_type.fromisoformat(session_date_str)
                    except ValueError:
                        pass

                materia = vote.get("Materia") or {}
                proposition_ref = materia.get("DescricaoIdentificacao") or None
                materia_codigo = str(materia.get("Codigo") or "")

                # The vote direction for this senator is at the top level of
                # the vote record, not nested under VotosParlamentar.
                # DescricaoVoto is sometimes null — fall back to SiglaDescricaoVoto.
                direction = (
                    vote.get("DescricaoVoto") or vote.get("SiglaDescricaoVoto") or "Desconhecido"
                )

                votacao_id = str(sessao.get("CodigoSessao") or vote.get("CodigoVotacao") or "")
                if not votacao_id:
                    continue

                # Encode the matéria codigo in the external_votacao_id so the
                # API layer can derive the Senado URL without extra DB fields.
                # Format: senado-{senator_external_id}-{session_id}-{materia_codigo}
                external_votacao_id = f"senado-{senator.external_id}-{votacao_id}-{materia_codigo}"

                batch.append(
                    {
                        "external_votacao_id": external_votacao_id,
                        "politician_id": senator.id,
                        "proposition_id": None,
                        "direction": direction,
                        "session_date": session_date,
                        "description": vote.get("DescricaoVotacao") or None,
                        "proposition_ref": proposition_ref,
                    }
                )

            if batch:
                # Deduplicate by external_votacao_id within the batch —
                # last record wins, matching ON CONFLICT behaviour.
                seen_sv: dict[str, dict] = {}
                for record in batch:
                    seen_sv[record["external_votacao_id"]] = record
                unique_batch = list(seen_sv.values())

                async with session.begin_nested():
                    count = await vote_repo.upsert_bulk(unique_batch)
                await session.commit()
                result.processed += count

        except Exception as exc:
            result.errors += 1
            logger.warning(
                "Failed to ingest votes for senator %d: %s",
                senator.external_id,
                exc,
            )

    result.log(f"Done — {result.processed} votes, {result.errors} errors (year={ref_year})")
    return result


async def ingest_senators(session: AsyncSession, client: SenadoClient) -> JobResult:
    """Fetch all active senators and upsert into the database.

    Each senator is processed inside its own savepoint so a single failure
    does not abort the entire job.

    Args:
        session (AsyncSession): Active database session.
        client (SenadoClient): Senado API client.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="ingest_senators")
    party_repo = PartyRepository(session)
    politician_repo = PoliticianRepository(session)

    senators = await client.get_senators()

    for senator in senators:
        try:
            ident = senator.get("IdentificacaoParlamentar", {})
            mandato = senator.get("Mandato", {})

            external_id_raw = ident.get("CodigoParlamentar")
            if not external_id_raw:
                continue

            external_id = int(external_id_raw)
            sigla_partido = ident.get("SiglaPartidoParlamentar") or "SEM PARTIDO"

            # Determine legislature from mandate data
            primeira_leg = mandato.get("PrimeiraLegislaturaDoMandato", {})
            legislature_raw = primeira_leg.get("NumeroLegislatura")
            legislature = int(legislature_raw) if legislature_raw else None

            # Extract phone (first non-fax entry when available)
            telefones = ident.get("Telefones", {}).get("Telefone", [])
            if isinstance(telefones, dict):
                telefones = [telefones]
            phone = next(
                (t.get("NumeroTelefone") for t in telefones if t.get("IndicadorFax") != "Sim"),
                None,
            )

            async with session.begin_nested():
                party = await party_repo.upsert(
                    abbreviation=sigla_partido,
                    name=sigla_partido,
                )
                await politician_repo.upsert(
                    external_id=external_id,
                    data={
                        "role": "senador",
                        "source": "senado",
                        "name": ident.get("NomeParlamentar", ""),
                        "photo_url": ident.get("UrlFotoParlamentar"),
                        "email": ident.get("EmailParlamentar"),
                        "phone": phone,
                        "party_id": party.id,
                        "uf": ident.get("UfParlamentar"),
                        "legislature": legislature,
                    },
                )

            result.processed += 1

        except Exception as exc:
            result.errors += 1
            logger.warning(
                "Failed to ingest senator %s: %s",
                senator.get("IdentificacaoParlamentar", {}).get("CodigoParlamentar"),
                exc,
            )

    await session.commit()
    result.log(f"Done — {result.processed} senators, {result.errors} errors")
    return result


# Curated list of Brazilian presidents. external_id uses the range 90000001+
# to avoid collision with Câmara (100k–200k range) and Senado IDs.
# Source: Presidência da República / TSE.
_PRESIDENTS: list[dict] = [
    {
        "external_id": 90000001,
        "name": "Luiz Inácio Lula da Silva",
        "party": "PT",
        "uf": "DF",
        "photo_url": "https://www.gov.br/planalto/pt-br/conheca-a-presidencia/presidentes-do-brasil/lula/@@images/image",
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 90000002,
        "name": "Jair Messias Bolsonaro",
        "party": "PL",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2019,
        "mandate_end": 2022,
    },
    {
        "external_id": 90000003,
        "name": "Michel Temer",
        "party": "MDB",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2016,
        "mandate_end": 2018,
    },
    {
        "external_id": 90000004,
        "name": "Dilma Rousseff",
        "party": "PT",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2011,
        "mandate_end": 2016,
    },
    {
        "external_id": 90000005,
        "name": "Luiz Inácio Lula da Silva",
        "party": "PT",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2003,
        "mandate_end": 2010,
    },
    {
        "external_id": 90000006,
        "name": "Fernando Henrique Cardoso",
        "party": "PSDB",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 1995,
        "mandate_end": 2002,
    },
    {
        "external_id": 90000007,
        "name": "Itamar Franco",
        "party": "MDB",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 1992,
        "mandate_end": 1994,
    },
    {
        "external_id": 90000008,
        "name": "Fernando Collor de Mello",
        "party": "PRN",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 1990,
        "mandate_end": 1992,
    },
]


# Curated list of Brazilian vice-presidents. external_id uses the range 91000001+
# to avoid collision with presidents (90000001+), Câmara (100k–200k) and Senado IDs.
# Source: Presidência da República / TSE / Wikipedia.
# Note: no VP served during Itamar Franco's presidency (1992–1994) or Temer's
# presidency (2016–2019) — both assumed from the VP seat themselves.
_VICE_PRESIDENTS: list[dict] = [
    {
        "external_id": 91000001,
        "name": "Geraldo Alckmin",
        "party": "PSB",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 91000002,
        "name": "Hamilton Mourão",
        "party": "PRTB",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2019,
        "mandate_end": 2022,
    },
    {
        "external_id": 91000003,
        "name": "Michel Temer",
        "party": "PMDB",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2011,
        "mandate_end": 2016,  # Assumed presidency after Dilma's impeachment
    },
    {
        "external_id": 91000004,
        "name": "José Alencar Gomes da Silva",
        "party": "PL",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2003,
        "mandate_end": 2010,
    },
    {
        "external_id": 91000005,
        "name": "Marco Maciel",
        "party": "PFL",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 1995,
        "mandate_end": 2002,
    },
    {
        "external_id": 91000006,
        "name": "Itamar Franco",
        "party": "PRN",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 1990,
        "mandate_end": 1992,  # Assumed presidency after Collor's resignation
    },
]


async def seed_vice_presidents(session: AsyncSession) -> JobResult:
    """Seed the database with Brazilian vice-presidents from a curated list.

    Uses (external_id, source='manual') as the deduplication key so this job
    is fully idempotent and can be re-run safely at any time.

    Args:
        session (AsyncSession): Active database session.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="seed_vice_presidents")
    party_repo = PartyRepository(session)
    politician_repo = PoliticianRepository(session)

    for vp in _VICE_PRESIDENTS:
        try:
            async with session.begin_nested():
                party = await party_repo.upsert(
                    abbreviation=vp["party"],
                    name=vp["party"],
                )
                await politician_repo.upsert(
                    external_id=vp["external_id"],
                    data={
                        "role": "vice_presidente",
                        "source": "manual",
                        "name": vp["name"],
                        "photo_url": vp["photo_url"],
                        "party_id": party.id,
                        "uf": vp["uf"],
                        "legislature": vp["mandate_start"],
                        "mandate_end": vp["mandate_end"],
                    },
                )
            result.processed += 1
        except Exception as exc:
            result.errors += 1
            logger.warning("Failed to seed vice-president %s: %s", vp["name"], exc)

    await session.commit()
    result.log(f"Done — {result.processed} vice-presidents, {result.errors} errors")
    return result


# Governors elected in 2022, serving 2023–2026. External IDs 93000001–93000027.
# Source: TSE / portais das Assembleias Legislativas.
_GOVERNORS: list[dict] = [
    # Norte
    {
        "external_id": 93000001,
        "name": "Gladson Cameli",
        "party": "PP",
        "uf": "AC",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000002,
        "name": "Wilson Lima",
        "party": "União Brasil",
        "uf": "AM",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000003,
        "name": "Clécio Luís",
        "party": "Solidariedade",
        "uf": "AP",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000004,
        "name": "Helder Barbalho",
        "party": "MDB",
        "uf": "PA",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000005,
        "name": "Marcos Rocha",
        "party": "União Brasil",
        "uf": "RO",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000006,
        "name": "Arthur Henrique",
        "party": "MDB",
        "uf": "RR",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000007,
        "name": "Wanderlei Barbosa",
        "party": "Republicanos",
        "uf": "TO",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    # Nordeste
    {
        "external_id": 93000008,
        "name": "Paulo Dantas",
        "party": "MDB",
        "uf": "AL",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000009,
        "name": "Jerônimo Rodrigues",
        "party": "PT",
        "uf": "BA",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000010,
        "name": "Elmano de Freitas",
        "party": "PT",
        "uf": "CE",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000011,
        "name": "Carlos Brandão",
        "party": "PSB",
        "uf": "MA",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000012,
        "name": "João Azevêdo",
        "party": "PSB",
        "uf": "PB",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000013,
        "name": "Raquel Lyra",
        "party": "PSDB",
        "uf": "PE",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000014,
        "name": "Rafael Fonteles",
        "party": "PT",
        "uf": "PI",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000015,
        "name": "Fátima Bezerra",
        "party": "PT",
        "uf": "RN",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000016,
        "name": "Fábio Mitidieri",
        "party": "PSD",
        "uf": "SE",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    # Centro-Oeste
    {
        "external_id": 93000017,
        "name": "Ibaneis Rocha",
        "party": "MDB",
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000018,
        "name": "Ronaldo Caiado",
        "party": "União Brasil",
        "uf": "GO",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000019,
        "name": "Eduardo Riedel",
        "party": "PSDB",
        "uf": "MS",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000020,
        "name": "Mauro Mendes",
        "party": "União Brasil",
        "uf": "MT",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    # Sudeste
    {
        "external_id": 93000021,
        "name": "Renato Casagrande",
        "party": "PSB",
        "uf": "ES",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000022,
        "name": "Romeu Zema",
        "party": "Novo",
        "uf": "MG",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000023,
        "name": "Cláudio Castro",
        "party": "PL",
        "uf": "RJ",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000024,
        "name": "Tarcísio de Freitas",
        "party": "Republicanos",
        "uf": "SP",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    # Sul
    {
        "external_id": 93000025,
        "name": "Ratinho Junior",
        "party": "PSD",
        "uf": "PR",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000026,
        "name": "Eduardo Leite",
        "party": "PSDB",
        "uf": "RS",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 93000027,
        "name": "Jorginho Mello",
        "party": "PL",
        "uf": "SC",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
]


async def seed_governors(session: AsyncSession) -> JobResult:
    """Seed the database with current Brazilian state governors (2023–2026).

    Uses (external_id, source='manual') as the deduplication key so this job
    is fully idempotent and can be re-run safely at any time.

    Args:
        session (AsyncSession): Active database session.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="seed_governors")
    party_repo = PartyRepository(session)
    politician_repo = PoliticianRepository(session)

    for gov in _GOVERNORS:
        try:
            async with session.begin_nested():
                party = await party_repo.upsert(
                    abbreviation=gov["party"],
                    name=gov["party"],
                )
                await politician_repo.upsert(
                    external_id=gov["external_id"],
                    data={
                        "role": "governador",
                        "source": "manual",
                        "name": gov["name"],
                        "photo_url": gov["photo_url"],
                        "party_id": party.id,
                        "uf": gov["uf"],
                        "legislature": gov["mandate_start"],
                        "mandate_end": gov["mandate_end"],
                    },
                )
            result.processed += 1
        except Exception as exc:
            result.errors += 1
            logger.warning("Failed to seed governor %s: %s", gov["name"], exc)

    await session.commit()
    result.log(f"Done — {result.processed} governors, {result.errors} errors")
    return result


_STF_MINISTERS: list[dict] = [
    {
        "external_id": 92000001,
        "name": "Luís Roberto Barroso",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2013,
        "mandate_end": None,
    },
    {
        "external_id": 92000002,
        "name": "Edson Fachin",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2015,
        "mandate_end": None,
    },
    {
        "external_id": 92000003,
        "name": "Alexandre de Moraes",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2017,
        "mandate_end": None,
    },
    {
        "external_id": 92000004,
        "name": "Gilmar Mendes",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2002,
        "mandate_end": None,
    },
    {
        "external_id": 92000005,
        "name": "Cármen Lúcia",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2006,
        "mandate_end": None,
    },
    {
        "external_id": 92000006,
        "name": "Dias Toffoli",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2009,
        "mandate_end": None,
    },
    {
        "external_id": 92000007,
        "name": "Luiz Fux",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2011,
        "mandate_end": None,
    },
    {
        "external_id": 92000008,
        "name": "Nunes Marques",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2020,
        "mandate_end": None,
    },
    {
        "external_id": 92000009,
        "name": "André Mendonça",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2021,
        "mandate_end": None,
    },
    {
        "external_id": 92000010,
        "name": "Cristiano Zanin",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2023,
        "mandate_end": None,
    },
    {
        "external_id": 92000011,
        "name": "Flávio Dino",
        "party": None,
        "uf": "DF",
        "photo_url": None,
        "mandate_start": 2024,
        "mandate_end": None,
    },
]


async def seed_stf_ministers(session: AsyncSession) -> JobResult:
    """Seed the database with current STF ministers from a curated list.

    Uses (external_id, source='manual') as the deduplication key so this job
    is fully idempotent and can be re-run safely at any time. STF ministers
    do not have party affiliation while in office.

    Args:
        session (AsyncSession): Active database session.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="seed_stf_ministers")
    politician_repo = PoliticianRepository(session)

    for minister in _STF_MINISTERS:
        try:
            async with session.begin_nested():
                await politician_repo.upsert(
                    external_id=minister["external_id"],
                    data={
                        "role": "ministro_stf",
                        "source": "manual",
                        "name": minister["name"],
                        "photo_url": minister["photo_url"],
                        "party_id": None,
                        "uf": minister["uf"],
                        "legislature": minister["mandate_start"],
                        "mandate_end": minister["mandate_end"],
                    },
                )
            result.processed += 1
        except Exception as exc:
            result.errors += 1
            logger.warning("Failed to seed STF minister %s: %s", minister["name"], exc)

    await session.commit()
    result.log(f"Done — {result.processed} STF ministers, {result.errors} errors")
    return result


async def ingest_news(
    session: AsyncSession,
    *,
    role: str | None = None,
    delay: float = 2.0,
) -> JobResult:
    """Pre-warm the Redis news cache for politicians.

    Fetches the 5 latest Google News RSS articles for each matching politician
    and stores them in Redis with a 24-hour TTL. Runs sequentially with a
    configurable delay between requests to avoid rate-limiting.

    Args:
        session (AsyncSession): Active database session.
        role (str | None): Filter politicians by role (e.g. "presidente").
            None fetches news for all politicians.
        delay (float): Seconds to sleep between each Google News request.
            Defaults to 2.0 to stay well under rate limits.

    Returns:
        JobResult: Summary with counts and messages.
    """
    import asyncio

    from app.cache import get_redis_client
    from app.services.news_service import NewsService

    result = JobResult(job="ingest_news")
    politician_repo = PoliticianRepository(session)
    redis = get_redis_client()
    news_service = NewsService(redis)

    politicians, _ = await politician_repo.list(
        role=role,
        page=1,
        page_size=10_000,
    )

    for politician in politicians:
        try:
            items, _, _cached_at = await news_service.get_news(
                politician_id=politician.id,
                politician_name=politician.name,
                ttl=8 * 3600,  # 8 h — runner executes 3× per day
            )
            result.processed += 1
            logger.info(
                "[ingest_news] %s → %d articles cached",
                politician.name,
                len(items),
            )
        except Exception as exc:
            result.errors += 1
            logger.warning("[ingest_news] Failed for %s: %s", politician.name, exc)

        await asyncio.sleep(delay)

    result.log(
        f"Done — {result.processed} politicians cached, {result.errors} errors"
        + (f" (role={role})" if role else "")
    )
    return result


async def ingest_card_expenses(
    session: AsyncSession,
    *,
    organ_code: str = "20101",  # SIAFI code for Presidência da República
    year: int | None = None,
) -> JobResult:
    """Fetch CPGF (government credit card) transactions from Portal da Transparência.

    Ingests all card transactions for the given organ and year into the
    card_expenses table. Uses upsert by external_id for idempotency.

    The Portal da Transparência API requires a free API key set via the
    TRANSPARENCIA_API_KEY environment variable.

    Args:
        session (AsyncSession): Active database session.
        organ_code (str): Government organ code. Defaults to '20000' (Presidência).
        year (int | None): Year to ingest. Defaults to current year.

    Returns:
        JobResult: Summary with counts and messages.
    """
    from datetime import datetime as dt

    from sqlalchemy.dialects.postgresql import insert as pg_insert

    from app.etl.transparencia_client import TransparenciaClient, parse_br_date, parse_br_decimal
    from app.models.card_expense import CardExpense

    result = JobResult(job="ingest_card_expenses")
    ref_year = year or dt.now().year

    try:
        client = TransparenciaClient()
    except Exception as exc:
        result.log(f"Failed to initialise TransparenciaClient: {exc}")
        result.errors += 1
        return result

    # Fetch month by month to stay within API pagination limits
    batch: list[dict] = []
    async with client:
        for month in range(1, 13):
            period = f"{month:02d}/{ref_year}"
            try:
                async for item in client.get_card_expenses(
                    organ_code=organ_code,
                    month_year_start=period,
                    month_year_end=period,
                ):
                    # Map API fields to model columns
                    portador = item.get("portador") or {}
                    ugr = item.get("unidadeGestora") or {}
                    estabelecimento = item.get("estabelecimento") or {}

                    raw_id = str(item.get("id") or "")
                    if not raw_id:
                        continue

                    # Dates come as "DD/MM/YYYY" — use parse_br_date
                    transaction_date = parse_br_date(item.get("dataTransacao"))
                    # statement month used as fallback when transaction date is missing
                    stmt_month, stmt_year = month, ref_year

                    # Values come as Brazilian strings e.g. "2.550,75" — use parse_br_decimal
                    value = parse_br_decimal(item.get("valorTransacao"))

                    portador = item.get("portador") or {}
                    ugr = item.get("unidadeGestora") or {}
                    orgao_vinculado = ugr.get("orgaoVinculado") or {}
                    orgao_maximo = ugr.get("orgaoMaximo") or {}
                    estabelecimento = item.get("estabelecimento") or {}

                    record = {
                        "external_id": raw_id,
                        "organ_code": str(orgao_vinculado.get("codigoSIAFI") or organ_code),
                        "organ_name": (
                            orgao_vinculado.get("nome") or orgao_maximo.get("nome") or ""
                        )[:255],
                        "management_unit_code": str(ugr.get("codigo") or "")[:20] or None,
                        "management_unit_name": (ugr.get("nome") or "")[:255] or None,
                        "holder_name": (portador.get("nome") or "")[:255] or None,
                        "holder_cpf": (portador.get("cpfFormatado") or portador.get("cpf") or "")[
                            :20
                        ]
                        or None,
                        "holder_role": (portador.get("cargo") or "")[:255] or None,
                        "card_number": (item.get("numeroCartao") or "")[:30] or None,
                        "transaction_date": transaction_date,
                        "transaction_year": transaction_date.year
                        if transaction_date
                        else stmt_year,
                        "transaction_month": transaction_date.month
                        if transaction_date
                        else stmt_month,
                        "supplier_name": (
                            estabelecimento.get("nome")
                            or estabelecimento.get("razaoSocialReceita")
                            or ""
                        )[:255]
                        or None,
                        "supplier_cnpj": (
                            estabelecimento.get("cnpjFormatado")
                            or estabelecimento.get("cnpj")
                            or ""
                        )[:20]
                        or None,
                        "value": value,
                        "installments": int(item.get("numeroParcelas") or 1),
                        "raw_data": item,
                    }
                    batch.append(record)

            except Exception as exc:
                result.errors += 1
                logger.warning(
                    "[ingest_card_expenses] Failed to fetch %s for organ %s: %s",
                    period,
                    organ_code,
                    exc,
                )

    if not batch:
        result.log(f"No card expenses found for organ={organ_code} year={ref_year}")
        return result

    # Deduplicate by external_id — last record wins
    seen: dict[str, dict] = {}
    for record in batch:
        seen[record["external_id"]] = record
    deduped = list(seen.values())

    # Chunk to stay under asyncpg's 32767 parameter limit
    _CHUNK = 1000
    for i in range(0, len(deduped), _CHUNK):
        chunk = deduped[i : i + _CHUNK]
        stmt = pg_insert(CardExpense).values(chunk)
        stmt = stmt.on_conflict_do_update(
            index_elements=["external_id"],
            set_={
                col: stmt.excluded[col]
                for col in (
                    "organ_code",
                    "organ_name",
                    "management_unit_code",
                    "management_unit_name",
                    "holder_name",
                    "holder_cpf",
                    "holder_role",
                    "card_number",
                    "transaction_date",
                    "transaction_year",
                    "transaction_month",
                    "supplier_name",
                    "supplier_cnpj",
                    "value",
                    "installments",
                    "raw_data",
                )
            },
        )
        async with session.begin_nested():
            await session.execute(stmt)
        await session.commit()
        result.processed += len(chunk)

    result.log(
        f"Done — {result.processed} transactions upserted for organ={organ_code} year={ref_year}"
    )
    return result


async def ingest_amendments(
    session: AsyncSession,
    *,
    year: int | None = None,
) -> JobResult:
    """Fetch all parliamentary amendments (emendas) for a year from Portal da Transparência.

    Covers individual amendments (deputados/senadores), bancada, committee
    and 'Emenda Pix' types. Attempts to link each amendment to a tracked
    politician by normalised name matching. Uses upsert by external_code.

    Args:
        session (AsyncSession): Active database session.
        year (int | None): Reference year. Defaults to current year.

    Returns:
        JobResult: Summary with counts and messages.
    """
    import unicodedata
    from datetime import datetime as dt

    from sqlalchemy.dialects.postgresql import insert as pg_insert

    from app.etl.transparencia_client import TransparenciaClient, parse_br_decimal
    from app.models.amendment import Amendment

    _PIX_TYPES = frozenset(
        {
            "Emenda Pix",
            "Emenda de Relator",
            "Emenda RP 9",
        }
    )

    def _normalise(name: str) -> str:
        """Normalise a name for fuzzy matching: uppercase, no accents, collapsed spaces."""
        nfkd = unicodedata.normalize("NFKD", name)
        ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
        return " ".join(ascii_str.upper().split())

    result = JobResult(job="ingest_amendments")
    ref_year = year or dt.now().year

    # Build a normalised name → politician_id lookup for matching
    politician_repo = PoliticianRepository(session)
    all_politicians, _ = await politician_repo.list(page=1, page_size=100_000)
    name_to_id: dict[str, int] = {_normalise(p.name): p.id for p in all_politicians if p.name}

    try:
        client = TransparenciaClient()
    except Exception as exc:
        result.log(f"Failed to initialise TransparenciaClient: {exc}")
        result.errors += 1
        return result

    batch: list[dict] = []
    async with client:
        try:
            async for item in client.get_amendments(year=ref_year):
                external_code = str(item.get("codigoEmenda") or "")
                if not external_code:
                    continue

                amendment_type = (item.get("tipoEmenda") or "").strip() or None
                author_name = (item.get("nomeAutor") or "").strip() or None

                # Try to link to a tracked politician by normalised name
                politician_id: int | None = None
                if author_name:
                    politician_id = name_to_id.get(_normalise(author_name))

                is_pix = amendment_type in _PIX_TYPES if amendment_type else False

                record = {
                    "external_code": external_code,
                    "year": ref_year,
                    "amendment_type": amendment_type,
                    "author": (item.get("autor") or "")[:255] or None,
                    "author_name": author_name[:255] if author_name else None,
                    "politician_id": politician_id,
                    "amendment_number": (item.get("numeroEmenda") or "")[:20] or None,
                    "locality": (item.get("localidadeDoGasto") or "")[:255] or None,
                    "function_name": (item.get("funcao") or "")[:100] or None,
                    "subfunction_name": (item.get("subfuncao") or "")[:100] or None,
                    "committed_value": parse_br_decimal(item.get("valorEmpenhado")),
                    "liquidated_value": parse_br_decimal(item.get("valorLiquidado")),
                    "paid_value": parse_br_decimal(item.get("valorPago")),
                    "remainder_inscribed": parse_br_decimal(item.get("valorRestoInscrito")),
                    "remainder_canceled": parse_br_decimal(item.get("valorRestoCancelado")),
                    "remainder_paid": parse_br_decimal(item.get("valorRestoPago")),
                    "is_pix": is_pix,
                    "raw_data": item,
                }
                batch.append(record)

        except Exception as exc:
            result.errors += 1
            logger.warning("[ingest_amendments] Fetch error for year %s: %s", ref_year, exc)

    if not batch:
        result.log(f"No amendments found for year={ref_year}")
        return result

    # Deduplicate by external_code
    seen: dict[str, dict] = {}
    for record in batch:
        seen[record["external_code"]] = record
    deduped = list(seen.values())

    linked = sum(1 for r in deduped if r["politician_id"] is not None)
    pix_count = sum(1 for r in deduped if r["is_pix"])

    _CHUNK = 500
    for i in range(0, len(deduped), _CHUNK):
        chunk = deduped[i : i + _CHUNK]
        stmt = pg_insert(Amendment).values(chunk)
        stmt = stmt.on_conflict_do_update(
            index_elements=["external_code"],
            set_={
                col: stmt.excluded[col]
                for col in (
                    "year",
                    "amendment_type",
                    "author",
                    "author_name",
                    "politician_id",
                    "amendment_number",
                    "locality",
                    "function_name",
                    "subfunction_name",
                    "committed_value",
                    "liquidated_value",
                    "paid_value",
                    "remainder_inscribed",
                    "remainder_canceled",
                    "remainder_paid",
                    "is_pix",
                    "raw_data",
                )
            },
        )
        async with session.begin_nested():
            await session.execute(stmt)
        await session.commit()
        result.processed += len(chunk)

    result.log(
        f"Done — {result.processed} amendments upserted for year={ref_year} "
        f"({linked} linked to politicians, {pix_count} Emenda Pix)"
    )
    return result


async def seed_presidents(session: AsyncSession) -> JobResult:
    """Seed the database with Brazilian presidents from a curated list.

    Uses (external_id, source='manual') as the deduplication key so this job
    is fully idempotent and can be re-run safely at any time.

    Args:
        session (AsyncSession): Active database session.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="seed_presidents")
    party_repo = PartyRepository(session)
    politician_repo = PoliticianRepository(session)

    for president in _PRESIDENTS:
        try:
            async with session.begin_nested():
                party = await party_repo.upsert(
                    abbreviation=president["party"],
                    name=president["party"],
                )
                await politician_repo.upsert(
                    external_id=president["external_id"],
                    data={
                        "role": "presidente",
                        "source": "manual",
                        "name": president["name"],
                        "photo_url": president["photo_url"],
                        "party_id": party.id,
                        "uf": president["uf"],
                        "legislature": president["mandate_start"],
                        "mandate_end": president["mandate_end"],
                    },
                )
            result.processed += 1
        except Exception as exc:
            result.errors += 1
            logger.warning("Failed to seed president %s: %s", president["name"], exc)

    await session.commit()
    result.log(f"Done — {result.processed} presidents, {result.errors} errors")
    return result


# ─── TSE — Municipal elections 2024 ──────────────────────────────────────────

_TSE_ROLE_MAP = {
    "PREFEITO": "prefeito",
    "VEREADOR": "vereador",
}


async def ingest_tse_municipais(session: AsyncSession) -> JobResult:
    """Download and ingest elected prefeitos and vereadores from TSE 2024 data.

    Downloads the single national zip from the TSE bulk data repository, filters
    for elected candidates (DS_CARGO in PREFEITO/VEREADOR and DS_SIT_TOT_TURNO
    starting with ELEITO), and upserts into the database with source='tse'.

    Args:
        session (AsyncSession): Active database session.

    Returns:
        JobResult: Summary with counts and messages.
    """
    result = JobResult(job="ingest_tse_municipais")
    party_repo = PartyRepository(session)
    politician_repo = PoliticianRepository(session)

    url = "https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2024.zip"

    async with httpx.AsyncClient(timeout=300.0, follow_redirects=True) as client:
        try:
            logger.info("[ingest_tse_municipais] Downloading national file...")
            response = await client.get(url)
            response.raise_for_status()
        except Exception as exc:
            result.errors += 1
            logger.warning("[ingest_tse_municipais] Failed to download: %s", exc)
            result.log(f"Done — {result.processed} politicians imported, {result.errors} errors")
            return result

        try:
            zip_bytes = io.BytesIO(response.content)
            with zipfile.ZipFile(zip_bytes) as zf:
                csv_names = [n for n in zf.namelist() if n.lower().endswith(".csv")]
                for csv_name in csv_names:
                    raw = zf.read(csv_name).decode("latin-1")
                    reader = csv.DictReader(io.StringIO(raw), delimiter=";")

                    for row in reader:
                        cargo = (row.get("DS_CARGO") or "").strip().upper()
                        if cargo not in _TSE_ROLE_MAP:
                            continue

                        sit = (row.get("DS_SIT_TOT_TURNO") or "").strip().upper()
                        if not sit.startswith("ELEITO"):
                            continue

                        sq_raw = (row.get("SQ_CANDIDATO") or "").strip()
                        if not sq_raw:
                            result.errors += 1
                            continue
                        try:
                            sq_cand = int(sq_raw)
                        except ValueError:
                            result.errors += 1
                            continue

                        nome = (row.get("NM_CANDIDATO") or "").strip()
                        if not nome:
                            result.errors += 1
                            continue

                        partido = (row.get("SG_PARTIDO") or "SEM PARTIDO").strip() or "SEM PARTIDO"
                        uf_row = (row.get("SG_UF") or "").strip().upper()
                        municipio = (row.get("NM_UE") or "").strip().title()
                        role = _TSE_ROLE_MAP[cargo]

                        try:
                            async with session.begin_nested():
                                party = await party_repo.upsert(
                                    abbreviation=partido,
                                    name=partido,
                                )
                                await politician_repo.upsert(
                                    external_id=sq_cand,
                                    data={
                                        "role": role,
                                        "source": "tse",
                                        "name": nome,
                                        "photo_url": None,
                                        "party_id": party.id,
                                        "uf": uf_row,
                                        "municipality": municipio,
                                        "legislature": 2025,
                                        "mandate_end": 2028,
                                    },
                                )
                            result.processed += 1
                        except Exception as exc:
                            result.errors += 1
                            logger.warning(
                                "[ingest_tse_municipais] Upsert failed for %s (%s/%s): %s",
                                nome,
                                municipio,
                                uf_row,
                                exc,
                            )

            await session.commit()
            logger.info("[ingest_tse_municipais] %d politicians imported", result.processed)

        except Exception as exc:
            result.errors += 1
            logger.warning("[ingest_tse_municipais] Failed to process zip: %s", exc)

    result.log(f"Done — {result.processed} politicians imported, {result.errors} errors")
    return result
