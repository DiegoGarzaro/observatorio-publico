"""Redis client singleton.

Usage in FastAPI endpoints and services:

    from app.cache import get_redis_client

    redis = get_redis_client()
    await redis.setex("key", 3600, "value")
    value = await redis.get("key")
"""

import redis.asyncio as aioredis

from app.config import settings

_client: aioredis.Redis | None = None


def get_redis_client() -> aioredis.Redis:
    """Return the shared Redis client, creating it on first call.

    The client uses an asyncio connection pool — safe to call multiple times;
    the same pool is always returned.

    Returns:
        aioredis.Redis: Async Redis client with string decode enabled.
    """
    global _client
    if _client is None:
        _client = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _client
