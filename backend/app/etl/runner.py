"""ETL runner — executes all ingestion jobs in sequence.

Usage:
    uv run python -m app.etl.runner
    uv run python -m app.etl.runner --year 2024
    uv run python -m app.etl.runner --year 2024 --skip-votes
    uv run python -m app.etl.runner --skip-senators
    uv run python -m app.etl.runner --enrich-propositions
    uv run python -m app.etl.runner --politician 204554
    uv run python -m app.etl.runner --politician 204554,200869 --year 2024

    # Run a single job in isolation:
    uv run python -m app.etl.runner --only presidents
    uv run python -m app.etl.runner --only vice-presidents
    uv run python -m app.etl.runner --only governors
    uv run python -m app.etl.runner --only stf-ministers
    uv run python -m app.etl.runner --only tse-municipais        # ~65k vereadores + prefeitos
    uv run python -m app.etl.runner --only deputies
    uv run python -m app.etl.runner --only senators
    uv run python -m app.etl.runner --only expenses --year 2024
    uv run python -m app.etl.runner --only votes --year 2024
    uv run python -m app.etl.runner --only propositions --year 2024
    uv run python -m app.etl.runner --only enrich-propositions
    uv run python -m app.etl.runner --only ceaps --year 2024
    uv run python -m app.etl.runner --only senator-votes --year 2024
    uv run python -m app.etl.runner --only news                  # all politicians
    uv run python -m app.etl.runner --only news --role presidente # presidents only
    uv run python -m app.etl.runner --only card-expenses --year 2024
    uv run python -m app.etl.runner --only amendments --year 2024
"""

import asyncio
import logging
import sys
from datetime import datetime

from app.database import AsyncSessionLocal
from app.etl.camara_client import CamaraClient
from app.etl.jobs import (
    enrich_deputy_details,
    enrich_propositions_status,
    ingest_amendments,
    ingest_card_expenses,
    ingest_ceaps,
    ingest_deputies,
    ingest_expenses,
    ingest_news,
    ingest_propositions,
    ingest_senator_votes,
    ingest_senators,
    ingest_tse_municipais,
    ingest_votes,
    seed_governors,
    seed_presidents,
    seed_stf_ministers,
    seed_vice_presidents,
)
from app.etl.senado_client import SenadoClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

VALID_ONLY_VALUES = {
    "presidents",
    "vice-presidents",
    "stf-ministers",
    "governors",
    "tse-municipais",
    "deputies",
    "senators",
    "expenses",
    "votes",
    "propositions",
    "enrich-propositions",
    "ceaps",
    "senator-votes",
    "news",
    "card-expenses",
    "amendments",
}


async def run_only(
    job: str,
    year: int | None = None,
    role: str | None = None,
) -> None:
    """Execute a single ETL job in isolation.

    Args:
        job (str): Job name — one of VALID_ONLY_VALUES.
        year (int | None): Year filter, applicable to expenses, votes and propositions.
        role (str | None): Role filter, applicable to the news job.
    """
    started_at = datetime.now()
    logger.info("ETL (--only %s) started at %s", job, started_at.isoformat())

    if job == "presidents":
        async with AsyncSessionLocal() as session:
            logger.info("==> Job: seed_presidents")
            r = await seed_presidents(session)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "vice-presidents":
        async with AsyncSessionLocal() as session:
            logger.info("==> Job: seed_vice_presidents")
            r = await seed_vice_presidents(session)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "governors":
        async with AsyncSessionLocal() as session:
            logger.info("==> Job: seed_governors")
            r = await seed_governors(session)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "stf-ministers":
        async with AsyncSessionLocal() as session:
            logger.info("==> Job: seed_stf_ministers")
            r = await seed_stf_ministers(session)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "tse-municipais":
        async with AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_tse_municipais (~65k records, downloads from TSE)")
            r = await ingest_tse_municipais(session)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "senators":
        async with SenadoClient() as senado_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_senators")
            r = await ingest_senators(session, senado_client)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "deputies":
        async with CamaraClient() as camara_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_deputies")
            r1 = await ingest_deputies(session, camara_client)
            logger.info("    %s", r1.messages[-1] if r1.messages else "")

            logger.info("==> Job: enrich_deputy_details")
            r2 = await enrich_deputy_details(session, camara_client)
            logger.info("    %s", r2.messages[-1] if r2.messages else "")

    elif job == "expenses":
        async with CamaraClient() as camara_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_expenses (year=%s)", year or "all")
            r = await ingest_expenses(session, camara_client, year=year)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "propositions":
        async with CamaraClient() as camara_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_propositions (year=%s)", year or "all")
            r = await ingest_propositions(session, camara_client, year=year)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "votes":
        ref_year = year or datetime.now().year
        date_start = f"{ref_year}-01-01"
        date_end = f"{ref_year}-12-31"
        async with CamaraClient() as camara_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_votes (%s → %s)", date_start, date_end)
            r = await ingest_votes(
                session,
                camara_client,
                date_start=date_start,
                date_end=date_end,
            )
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "enrich-propositions":
        async with CamaraClient() as camara_client, AsyncSessionLocal() as session:
            logger.info("==> Job: enrich_propositions_status (this may take ~1h)")
            r = await enrich_propositions_status(session, camara_client)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "ceaps":
        ref_year = year or datetime.now().year
        async with SenadoClient() as senado_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_ceaps (year=%s)", ref_year)
            r = await ingest_ceaps(session, senado_client, year=ref_year)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "senator-votes":
        async with SenadoClient() as senado_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_senator_votes (year=%s)", year or "current")
            r = await ingest_senator_votes(session, senado_client, year=year)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "news":
        async with AsyncSessionLocal() as session:
            label = f"role={role}" if role else "all politicians"
            logger.info("==> Job: ingest_news (%s)", label)
            r = await ingest_news(session, role=role)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "card-expenses":
        ref_year = year or datetime.now().year
        async with AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_card_expenses (year=%s)", ref_year)
            r = await ingest_card_expenses(session, year=ref_year)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elif job == "amendments":
        ref_year = year or datetime.now().year
        async with AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_amendments (year=%s)", ref_year)
            r = await ingest_amendments(session, year=ref_year)
            logger.info("    %s", r.messages[-1] if r.messages else "")

    elapsed = (datetime.now() - started_at).total_seconds()
    logger.info("ETL finished in %.1fs", elapsed)


async def run(
    year: int | None = None,
    skip_votes: bool = False,
    skip_senators: bool = False,
    enrich_propositions: bool = False,
    politician_ids: list[int] | None = None,
) -> None:
    """Execute ETL jobs in sequence, optionally scoped to specific politicians.

    When politician_ids is provided, only expenses, propositions and votes for
    those politicians are fetched. Deputy ingestion and enrichment are still
    scoped to the given IDs; senators and presidents jobs are skipped unless
    no filter is set.

    Args:
        year (int | None): Year to filter expenses, propositions and votes.
        skip_votes (bool): Skip the votes ingestion job.
        skip_senators (bool): Skip the senators ingestion job.
        enrich_propositions (bool): Run proposition status enrichment (~1h).
        politician_ids (list[int] | None): Câmara/Senado external IDs to scope
            the run. None means process all politicians.
    """
    started_at = datetime.now()
    if politician_ids:
        logger.info(
            "ETL started at %s — scoped to %d politician(s): %s",
            started_at.isoformat(),
            len(politician_ids),
            politician_ids,
        )
    else:
        logger.info("ETL started at %s", started_at.isoformat())

    async with CamaraClient() as camara_client, AsyncSessionLocal() as session:

        if not politician_ids:
            logger.info("==> Job: ingest_deputies")
            r1 = await ingest_deputies(session, camara_client)
            logger.info("    %s", r1.messages[-1] if r1.messages else "")
        else:
            logger.info("==> Job: ingest_deputies SKIPPED (scoped run)")

        logger.info("==> Job: enrich_deputy_details")
        r2 = await enrich_deputy_details(session, camara_client, politician_ids=politician_ids)
        logger.info("    %s", r2.messages[-1] if r2.messages else "")

        logger.info("==> Job: ingest_expenses (year=%s)", year or "all")
        r3 = await ingest_expenses(session, camara_client, year=year, politician_ids=politician_ids)
        logger.info("    %s", r3.messages[-1] if r3.messages else "")

        if not politician_ids:
            logger.info("==> Job: seed_presidents")
            r_pres = await seed_presidents(session)
            logger.info("    %s", r_pres.messages[-1] if r_pres.messages else "")

            logger.info("==> Job: seed_vice_presidents")
            r_vp = await seed_vice_presidents(session)
            logger.info("    %s", r_vp.messages[-1] if r_vp.messages else "")

            logger.info("==> Job: seed_stf_ministers")
            r_stf = await seed_stf_ministers(session)
            logger.info("    %s", r_stf.messages[-1] if r_stf.messages else "")

            logger.info("==> Job: seed_governors")
            r_gov = await seed_governors(session)
            logger.info("    %s", r_gov.messages[-1] if r_gov.messages else "")

            logger.info("==> Job: ingest_tse_municipais (~65k records)")
            r_tse = await ingest_tse_municipais(session)
            logger.info("    %s", r_tse.messages[-1] if r_tse.messages else "")
        else:
            logger.info("==> Job: seed_presidents SKIPPED (scoped run)")
            logger.info("==> Job: seed_vice_presidents SKIPPED (scoped run)")
            logger.info("==> Job: seed_stf_ministers SKIPPED (scoped run)")
            logger.info("==> Job: seed_governors SKIPPED (scoped run)")
            logger.info("==> Job: ingest_tse_municipais SKIPPED (scoped run)")

        logger.info("==> Job: ingest_propositions (year=%s)", year or "all")
        r4 = await ingest_propositions(session, camara_client, year=year, politician_ids=politician_ids)
        logger.info("    %s", r4.messages[-1] if r4.messages else "")

        if not skip_votes:
            ref_year = year or datetime.now().year
            date_start = f"{ref_year}-01-01"
            date_end = f"{ref_year}-12-31"
            logger.info("==> Job: ingest_votes (%s → %s)", date_start, date_end)
            r5 = await ingest_votes(
                session,
                camara_client,
                date_start=date_start,
                date_end=date_end,
                politician_ids=politician_ids,
            )
            logger.info("    %s", r5.messages[-1] if r5.messages else "")
        else:
            logger.info("==> Job: ingest_votes SKIPPED")

        if enrich_propositions:
            logger.info("==> Job: enrich_propositions_status (this may take ~1h)")
            r6 = await enrich_propositions_status(session, camara_client)
            logger.info("    %s", r6.messages[-1] if r6.messages else "")
        else:
            logger.info("==> Job: enrich_propositions_status SKIPPED (use --enrich-propositions to run)")

    if not skip_senators and not politician_ids:
        async with SenadoClient() as senado_client, AsyncSessionLocal() as session:
            logger.info("==> Job: ingest_senators")
            r_sen = await ingest_senators(session, senado_client)
            logger.info("    %s", r_sen.messages[-1] if r_sen.messages else "")

            ref_year = year or datetime.now().year
            logger.info("==> Job: ingest_ceaps (year=%s)", ref_year)
            r_ceaps = await ingest_ceaps(session, senado_client, year=ref_year)
            logger.info("    %s", r_ceaps.messages[-1] if r_ceaps.messages else "")

            logger.info("==> Job: ingest_senator_votes (year=%s)", ref_year)
            r_sv = await ingest_senator_votes(session, senado_client, year=ref_year)
            logger.info("    %s", r_sv.messages[-1] if r_sv.messages else "")
    elif politician_ids:
        logger.info("==> Job: ingest_senators SKIPPED (scoped run)")
    else:
        logger.info("==> Job: ingest_senators SKIPPED")

    elapsed = (datetime.now() - started_at).total_seconds()
    logger.info("ETL finished in %.1fs", elapsed)


if __name__ == "__main__":
    year_arg: int | None = None
    role_arg: str | None = None
    skip_votes_arg = False
    skip_senators_arg = False
    enrich_propositions_arg = False
    politician_ids_arg: list[int] | None = None
    only_arg: str | None = None

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        arg = args[i]
        if arg.startswith("--year="):
            year_arg = int(arg.split("=", 1)[1])
        elif arg == "--year" and i + 1 < len(args):
            year_arg = int(args[i + 1])
            i += 1
        elif arg.startswith("--role="):
            role_arg = arg.split("=", 1)[1]
        elif arg == "--role" and i + 1 < len(args):
            role_arg = args[i + 1]
            i += 1
        elif arg.startswith("--politician="):
            raw = arg.split("=", 1)[1]
            politician_ids_arg = [int(x) for x in raw.split(",") if x.strip()]
        elif arg == "--politician" and i + 1 < len(args):
            raw = args[i + 1]
            politician_ids_arg = [int(x) for x in raw.split(",") if x.strip()]
            i += 1
        elif arg.startswith("--only="):
            only_arg = arg.split("=", 1)[1]
        elif arg == "--only" and i + 1 < len(args):
            only_arg = args[i + 1]
            i += 1
        elif arg == "--skip-votes":
            skip_votes_arg = True
        elif arg == "--skip-senators":
            skip_senators_arg = True
        elif arg == "--enrich-propositions":
            enrich_propositions_arg = True
        i += 1

    if only_arg is not None:
        if only_arg not in VALID_ONLY_VALUES:
            print(
                f"Error: unknown job '{only_arg}'.\n"
                f"Valid values: {', '.join(sorted(VALID_ONLY_VALUES))}",
                file=sys.stderr,
            )
            sys.exit(1)
        asyncio.run(run_only(only_arg, year=year_arg, role=role_arg))
    else:
        asyncio.run(run(
            year=year_arg,
            skip_votes=skip_votes_arg,
            skip_senators=skip_senators_arg,
            enrich_propositions=enrich_propositions_arg,
            politician_ids=politician_ids_arg,
        ))
