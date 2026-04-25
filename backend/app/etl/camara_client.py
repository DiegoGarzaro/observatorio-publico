import asyncio
import logging
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_HEADERS = {"Accept": "application/json"}
_TIMEOUT = httpx.Timeout(60.0)
_PAGE_SIZE = 100
_RETRY_STATUSES = {429, 500, 502, 503, 504}
_MAX_RETRIES = 6
_BACKOFF_BASE = 2.0


class CamaraClient:
    """Async HTTP client for the Câmara dos Deputados open API.

    Handles pagination and basic rate-limit-friendly delays automatically.
    """

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url=settings.camara_api_base_url,
            headers=_HEADERS,
            timeout=_TIMEOUT,
        )

    async def __aenter__(self) -> "CamaraClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self._client.aclose()

    async def _get(self, path: str, params: dict | None = None) -> dict:
        """Perform a GET request and return parsed JSON, retrying on transient errors.

        Args:
            path (str): API path (e.g. '/deputados').
            params (dict | None): Query parameters.

        Returns:
            dict: Parsed JSON response.

        Raises:
            httpx.HTTPStatusError: On non-2xx responses after all retries exhausted.
            httpx.TimeoutException: On timeout after all retries exhausted.
        """
        last_exc: Exception | None = None
        for attempt in range(_MAX_RETRIES):
            try:
                response = await self._client.get(path, params=params)
                if response.status_code in _RETRY_STATUSES:
                    delay = _BACKOFF_BASE**attempt
                    logger.warning(
                        "Transient %d from %s (attempt %d/%d) — retrying in %.1fs",
                        response.status_code,
                        path,
                        attempt + 1,
                        _MAX_RETRIES,
                        delay,
                    )
                    await asyncio.sleep(delay)
                    last_exc = httpx.HTTPStatusError(
                        f"Server error '{response.status_code}' for url '{response.url}'",
                        request=response.request,
                        response=response,
                    )
                    continue
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException as exc:
                delay = _BACKOFF_BASE**attempt
                logger.warning(
                    "Timeout on %s (attempt %d/%d) — retrying in %.1fs",
                    path,
                    attempt + 1,
                    _MAX_RETRIES,
                    delay,
                )
                await asyncio.sleep(delay)
                last_exc = exc
        raise last_exc  # type: ignore[misc]

    async def paginate(
        self, path: str, params: dict | None = None
    ) -> AsyncGenerator[dict, None]:
        """Iterate through all pages of a paginated endpoint.

        Args:
            path (str): API path.
            params (dict | None): Additional query parameters.

        Yields:
            dict: Each item from the 'dados' array across all pages.
        """
        page = 1
        base_params = {**(params or {}), "itens": _PAGE_SIZE}

        while True:
            data = await self._get(path, {**base_params, "pagina": page})
            items = data.get("dados", [])

            if not items:
                break

            for item in items:
                yield item

            links = data.get("links", [])
            has_next = any(link.get("rel") == "next" for link in links)
            if not has_next:
                break

            page += 1
            logger.debug("Paginating %s — page %d", path, page)

    async def get_deputies(self, legislature: int = 57) -> AsyncGenerator[dict, None]:
        """Iterate over all active deputies for a given legislature.

        Args:
            legislature (int): Legislature number. Defaults to 57 (current).

        Yields:
            dict: Deputy summary data.
        """
        async for item in self.paginate("/deputados", {"idLegislatura": legislature}):
            yield item

    async def get_deputy_detail(self, deputy_id: int) -> dict:
        """Return full detail for a single deputy.

        Args:
            deputy_id (int): Câmara API deputy ID.

        Returns:
            dict: Deputy detail from 'dados' key.
        """
        data = await self._get(f"/deputados/{deputy_id}")
        return data.get("dados", {})

    async def get_expenses(
        self, deputy_id: int, *, year: int | None = None
    ) -> AsyncGenerator[dict, None]:
        """Iterate over all CEAP expenses for a deputy.

        Args:
            deputy_id (int): Câmara API deputy ID.
            year (int | None): Filter by year. Fetches all years if None.

        Yields:
            dict: Expense record.
        """
        params = {}
        if year:
            params["ano"] = year

        async for item in self.paginate(f"/deputados/{deputy_id}/despesas", params):
            yield item

    async def get_propositions_by_author(
        self, deputy_id: int, *, year: int | None = None
    ) -> AsyncGenerator[dict, None]:
        """Iterate over propositions authored by a deputy.

        Args:
            deputy_id (int): Câmara API deputy ID.
            year (int | None): Filter by submission year.

        Yields:
            dict: Proposition summary data.
        """
        params: dict = {"idDeputadoAutor": deputy_id, "ordem": "DESC", "ordenarPor": "ano"}
        if year:
            params["ano"] = year

        async for item in self.paginate("/proposicoes", params):
            yield item

    async def get_votacoes(
        self, *, date_start: str, date_end: str
    ) -> AsyncGenerator[dict, None]:
        """Iterate over all plenary vote sessions in a date range.

        Args:
            date_start (str): Start date in YYYY-MM-DD format.
            date_end (str): End date in YYYY-MM-DD format.

        Yields:
            dict: Votação summary data.
        """
        params = {"dataInicio": date_start, "dataFim": date_end, "ordem": "DESC"}
        async for item in self.paginate("/votacoes", params):
            yield item

    async def get_proposition_detail(self, proposition_id: int) -> dict:
        """Return full detail for a single proposition.

        Args:
            proposition_id (int): Câmara API proposition ID.

        Returns:
            dict: Proposition detail from 'dados' key.
        """
        data = await self._get(f"/proposicoes/{proposition_id}")
        return data.get("dados", {})

    async def get_votes_in_votacao(self, votacao_id: str) -> list[dict]:
        """Return all individual votes cast in a votação.

        Args:
            votacao_id (str): Votação ID from the Câmara API.

        Returns:
            list[dict]: All vote records for the session.
        """
        data = await self._get(f"/votacoes/{votacao_id}/votos")
        return data.get("dados", [])
