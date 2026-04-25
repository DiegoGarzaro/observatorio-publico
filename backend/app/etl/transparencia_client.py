"""HTTP client for the Portal da Transparência API.

Documentation: https://api.portaldatransparencia.gov.br/api-de-dados
Free API key required — register at https://portaldatransparencia.gov.br/api-de-dados

Rate limits (government official):
  00:00–06:00 UTC-3: 700 req/min
  06:00–24:00 UTC-3: 400 req/min
  Restricted APIs:   180 req/min (independent of time)
"""

import asyncio
import logging
import time as _time
from collections.abc import AsyncGenerator
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_BASE_URL = "https://api.portaldatransparencia.gov.br/api-de-dados"
_TIMEOUT = httpx.Timeout(60.0)
_PAGE_SIZE = 500
_RETRY_STATUSES = {429, 500, 502, 503, 504}
_MAX_RETRIES = 5
_BACKOFF_BASE = 2.0

# Restricted endpoints — hard limit of 180 req/min regardless of time of day.
# Source: https://portaldatransparencia.gov.br/api-de-dados
_RESTRICTED_PATHS: frozenset[str] = frozenset(
    {
        "/despesas/documentos-por-favorecido",
        "/bolsa-familia-disponivel-por-cpf-ou-nis",
        "/bolsa-familia-por-municipio",
        "/bolsa-familia-sacado-por-nis",
        "/auxilio-emergencial-beneficiario-por-municipio",
        "/auxilio-emergencial-por-cpf-ou-nis",
        "/auxilio-emergencial-por-municipio",
        "/seguro-defeso-codigo",
    }
)


def _max_rpm(path: str) -> int:
    """Return the maximum requests-per-minute allowed for the given API path.

    Args:
        path (str): API path relative to the base URL (e.g. '/cartoes').

    Returns:
        int: Maximum requests per minute.
    """
    for restricted in _RESTRICTED_PATHS:
        if restricted in path:
            return 180
    # BRT = UTC-3. Night window 00:00–06:00 local time.
    hour_brt = (datetime.utcnow().hour - 3) % 24
    return 700 if hour_brt < 6 else 400


def _min_interval(path: str) -> float:
    """Return the minimum seconds between requests for the given API path.

    Args:
        path (str): API path.

    Returns:
        float: Minimum interval in seconds.
    """
    return 60.0 / _max_rpm(path)


def parse_br_decimal(value: str | float | int | None) -> Decimal:
    """Parse a Brazilian-formatted decimal string into a Decimal.

    Brazilian number format uses '.' as thousands separator and ',' as
    decimal separator — e.g. '2.550,75' → Decimal('2550.75').

    Args:
        value (str | float | int | None): Raw value from the API.

    Returns:
        Decimal: Parsed value. Returns Decimal('0') on any parse failure.
    """
    if value is None:
        return Decimal("0")
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    cleaned = str(value).strip().replace(".", "").replace(",", ".")
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return Decimal("0")


def parse_br_date(value: str | None):
    """Parse a Brazilian-formatted date string (DD/MM/YYYY) into a date object.

    Args:
        value (str | None): Date string in DD/MM/YYYY format.

    Returns:
        date | None: Parsed date, or None if value is missing or unparseable.
    """
    from datetime import date

    if not value:
        return None
    try:
        day, month, year = value.strip().split("/")
        return date(int(year), int(month), int(day))
    except (ValueError, AttributeError):
        return None


class _RateLimiter:
    """Async token-bucket rate limiter, time-of-day and endpoint aware.

    Enforces the Portal da Transparência official rate limits:
    - Restricted paths: 180 req/min
    - Night (00:00–06:00 BRT): 700 req/min
    - Day  (06:00–00:00 BRT): 400 req/min

    A single lock serialises all requests through the client so that
    concurrent coroutines cannot collectively exceed the limit.

    Attributes:
        _lock (asyncio.Lock): Serialises access to _last_request.
        _last_request (float): Monotonic timestamp of the last dispatched request.
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._last_request: float = 0.0

    async def wait(self, path: str) -> None:
        """Sleep until it is safe to send the next request for the given path.

        Args:
            path (str): API path — used to determine the applicable rate limit.

        Returns:
            None
        """
        async with self._lock:
            now = _time.monotonic()
            elapsed = now - self._last_request
            interval = _min_interval(path)
            if elapsed < interval:
                await asyncio.sleep(interval - elapsed)
            self._last_request = _time.monotonic()


class TransparenciaClient:
    """Async HTTP client for the Portal da Transparência API.

    Handles authentication, rate limiting, pagination and retry logic.
    All endpoints require a free API key via the TRANSPARENCIA_API_KEY env var.

    Rate limits are enforced automatically per the government's published
    guidelines — no external library required.

    Attributes:
        _client (httpx.AsyncClient): Underlying HTTP client.
        _limiter (_RateLimiter): Request-rate enforcer.
    """

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url=_BASE_URL,
            headers={
                "Accept": "application/json",
                "chave-api-dados": settings.transparencia_api_key,
            },
            timeout=_TIMEOUT,
        )
        self._limiter = _RateLimiter()

    async def __aenter__(self) -> "TransparenciaClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self._client.aclose()

    async def _get(self, path: str, params: dict | None = None) -> list[dict] | dict:
        """Perform a rate-limited GET request with retry on transient errors.

        Args:
            path (str): API path (e.g. '/cartoes').
            params (dict | None): Query parameters.

        Returns:
            list[dict] | dict: Parsed JSON response.

        Raises:
            httpx.HTTPStatusError: On non-2xx responses after all retries.
            RuntimeError: If API key is not configured.
        """
        if not settings.transparencia_api_key:
            raise RuntimeError(
                "TRANSPARENCIA_API_KEY is not set. "
                "Register at https://portaldatransparencia.gov.br/api-de-dados"
            )

        last_exc: Exception | None = None
        for attempt in range(_MAX_RETRIES):
            await self._limiter.wait(path)
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
                        f"HTTP {response.status_code}",
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
        self, path: str, params: dict | None = None, page_size: int = _PAGE_SIZE
    ) -> AsyncGenerator[dict, None]:
        """Iterate through all pages of a paginated endpoint.

        The Portal da Transparência API uses 1-based `pagina` pagination.
        Some endpoints ignore `tamanhoPagina` and always return a fixed number
        of items (e.g. /emendas returns 15 per page). To handle both cases:

        - If the first page returns fewer items than requested AND pages keep
          returning the same fixed count, we use that observed count as the
          effective page size.
        - Stops when a page returns zero items or fewer than the effective size.

        Rate limiting is applied automatically inside `_get`.

        Args:
            path (str): API path.
            params (dict | None): Additional query parameters.
            page_size (int): Requested items per page. The API may return fewer.

        Yields:
            dict: Each item across all pages.
        """
        page = 1
        base_params = {**(params or {}), "pagina": page, "tamanhoPagina": page_size}
        effective_size: int | None = None  # detected after first full page

        while True:
            base_params["pagina"] = page
            data = await self._get(path, base_params)

            items: list[dict] = data if isinstance(data, list) else []
            if not items:
                break

            for item in items:
                yield item

            # Detect effective page size from the first page
            if effective_size is None:
                effective_size = len(items)

            # Stop when the page is shorter than what the API consistently returns
            if len(items) < effective_size:
                break

            page += 1
            logger.debug(
                "Paginating %s — page %d (effective_size=%d, rpm_limit=%d)",
                path,
                page,
                effective_size,
                _max_rpm(path),
            )

    # ─── Domain-specific helpers ──────────────────────────────────────────────

    async def get_card_expenses(
        self,
        *,
        organ_code: str,
        month_year_start: str,
        month_year_end: str,
    ) -> AsyncGenerator[dict, None]:
        """Iterate over credit card (CPGF/CPCC) transactions for an organ.

        Note: The API filter is on `mesExtrato` (statement month), not on
        the actual transaction date. Values are returned as Brazilian-formatted
        strings — use `parse_br_decimal` to convert.

        Args:
            organ_code (str): SIAFI organ code (e.g. '20101' for Presidência).
            month_year_start (str): Start period in MM/YYYY format.
            month_year_end (str): End period in MM/YYYY format.

        Yields:
            dict: Card transaction record.
        """
        params = {
            "codigoOrgao": organ_code,
            "mesAnoInicio": month_year_start,
            "mesAnoFim": month_year_end,
        }
        async for item in self.paginate("/cartoes", params):
            yield item

    async def get_amendments(
        self,
        *,
        year: int,
        amendment_type: str | None = None,
    ) -> AsyncGenerator[dict, None]:
        """Iterate over all parliamentary amendments (emendas) for a given year.

        Covers individual emendas (deputados/senadores), bancada emendas,
        committee emendas and the controversial "Emenda Pix" type.
        Values are Brazilian-formatted strings — use `parse_br_decimal`.

        Args:
            year (int): Reference year.
            amendment_type (str | None): Filter by type (e.g. 'Emenda Individual').

        Yields:
            dict: Amendment record.
        """
        params: dict = {"ano": year}
        if amendment_type:
            params["tipoEmenda"] = amendment_type
        async for item in self.paginate("/emendas", params):
            yield item

    async def get_official_travels(
        self,
        *,
        organ_code: str,
        date_start: str,
        date_end: str,
    ) -> AsyncGenerator[dict, None]:
        """Iterate over official travel records (diárias + passagens) for an organ.

        Args:
            organ_code (str): SIAFI organ code.
            date_start (str): Start date in YYYY-MM-DD format.
            date_end (str): End date in YYYY-MM-DD format.

        Yields:
            dict: Travel record.
        """
        params = {
            "codigoOrgao": organ_code,
            "dataIdaDe": date_start,
            "dataIdaAte": date_end,
            "dataRetornoDe": date_start,
            "dataRetornoAte": date_end,
        }
        async for item in self.paginate("/viagens", params):
            yield item
