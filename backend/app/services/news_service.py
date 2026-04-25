"""News fetching service backed by Google News RSS + Redis cache.

Google News RSS endpoint (no API key required):
  https://news.google.com/rss/search?q="name"&hl=pt-BR&gl=BR&ceid=BR:pt-419

The RSS feed returns up to ~10 articles per query. We cache results in Redis
to avoid hammering Google and to keep latency low on the hot path.
"""

import contextlib
import json
import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from urllib.parse import quote

import httpx
import redis.asyncio as aioredis

from app.schemas.news import NewsItem

logger = logging.getLogger(__name__)

_GOOGLE_NEWS_RSS = "https://news.google.com/rss/search?q={query}&hl=pt-BR&gl=BR&ceid=BR:pt-419"
_CACHE_TTL = 6 * 3600  # 6 hours — live endpoint
_RUNNER_TTL = 8 * 3600  # 8 hours — pre-warmed 3× per day by runner
_MAX_ITEMS = 5
_TIMEOUT = httpx.Timeout(15.0)
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; ObservatorioPublico/1.0; "
        "+https://github.com/observatorio-publico)"
    )
}


def _cache_key(politician_id: int) -> str:
    return f"news:{politician_id}"


def _parse_rss(xml_text: str) -> list[NewsItem]:
    """Parse a Google News RSS feed and return up to _MAX_ITEMS articles.

    Args:
        xml_text (str): Raw XML response body.

    Returns:
        list[NewsItem]: Parsed news articles.
    """
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as exc:
        logger.warning("Failed to parse RSS XML: %s", exc)
        return []

    channel = root.find("channel")
    if channel is None:
        return []

    items: list[NewsItem] = []
    for item_el in channel.findall("item")[:_MAX_ITEMS]:
        title_el = item_el.find("title")
        link_el = item_el.find("link")
        pub_el = item_el.find("pubDate")
        source_el = item_el.find("source")

        title = (title_el.text or "").strip() if title_el is not None else ""
        url = (link_el.text or "").strip() if link_el is not None else ""
        source = (source_el.text or "").strip() if source_el is not None else ""

        # Google News appends " - Source Name" to every title — strip it.
        if source and title.endswith(f" - {source}"):
            title = title[: -(len(source) + 3)].strip()

        published_at: datetime | None = None
        if pub_el is not None and pub_el.text:
            with contextlib.suppress(Exception):
                published_at = parsedate_to_datetime(pub_el.text)

        if title and url:
            items.append(NewsItem(title=title, url=url, source=source, published_at=published_at))

    return items


class NewsService:
    """Fetches and caches recent news articles for a politician.

    Attributes:
        _redis (aioredis.Redis): Async Redis client.
    """

    def __init__(self, redis: aioredis.Redis) -> None:
        self._redis = redis

    async def get_news(
        self,
        *,
        politician_id: int,
        politician_name: str,
        ttl: int = _CACHE_TTL,
    ) -> tuple[list[NewsItem], bool, datetime | None]:
        """Return up to 5 recent news articles for the given politician.

        Checks Redis first; fetches from Google News RSS on cache miss and
        stores the result with the given TTL.

        Args:
            politician_id (int): Internal politician ID (used as cache key).
            politician_name (str): Name used to query Google News.
            ttl (int): Cache TTL in seconds. Defaults to 6 hours.

        Returns:
            tuple[list[NewsItem], bool, datetime | None]: Articles, whether
            result was served from cache, and the timestamp of the last cache
            write (None when freshly fetched before first store).
        """
        key = _cache_key(politician_id)
        raw = await self._redis.get(key)

        if raw:
            try:
                payload = json.loads(raw)
                if isinstance(payload, list):
                    # Legacy format (plain list) — migrate to new format in place
                    items = [NewsItem.model_validate(d) for d in payload]
                    now = datetime.utcnow()
                    new_payload = json.dumps(
                        {
                            "items": [item.model_dump(mode="json") for item in items],
                            "cached_at": now.isoformat(),
                        }
                    )
                    ttl_remaining = await self._redis.ttl(key)
                    if ttl_remaining > 0:
                        await self._redis.setex(key, ttl_remaining, new_payload)
                    cached_at = now
                else:
                    items = [NewsItem.model_validate(d) for d in payload["items"]]
                    cached_at_raw = payload.get("cached_at")
                    cached_at = datetime.fromisoformat(cached_at_raw) if cached_at_raw else None
                return items, True, cached_at
            except Exception:
                pass  # fall through to fresh fetch

        items = await self._fetch(politician_name)
        now = datetime.utcnow()

        if items:
            payload = json.dumps(
                {
                    "items": [item.model_dump(mode="json") for item in items],
                    "cached_at": now.isoformat(),
                }
            )
            await self._redis.setex(key, ttl, payload)

        return items, False, now

    async def invalidate(self, politician_id: int) -> None:
        """Remove cached news for a politician.

        Args:
            politician_id (int): Internal politician ID.
        """
        await self._redis.delete(_cache_key(politician_id))

    async def _fetch(self, name: str) -> list[NewsItem]:
        """Fetch news from Google News RSS for the given name.

        Args:
            name (str): Politician name used as the search query.

        Returns:
            list[NewsItem]: Parsed articles, or empty list on error.
        """
        query = quote(f'"{name}"')
        url = _GOOGLE_NEWS_RSS.format(query=query)

        try:
            async with httpx.AsyncClient(headers=_HEADERS, timeout=_TIMEOUT) as client:
                response = await client.get(url, follow_redirects=True)
                response.raise_for_status()
            return _parse_rss(response.text)
        except Exception as exc:
            logger.warning("Failed to fetch news for '%s': %s", name, exc)
            return []
