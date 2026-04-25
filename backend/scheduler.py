"""Daily scheduler — runs the news ETL job once per day at 06:00 UTC.

Run via docker-compose (news-scheduler service) or directly:
    uv run python scheduler.py
"""

import asyncio
import logging
from datetime import UTC, datetime, timedelta

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

_RUN_HOUR_UTC = 6  # 06:00 UTC = 03:00 BRT


def _next_run_at(hour: int) -> datetime:
    """Return the next UTC datetime when the hour-of-day matches.

    Args:
        hour (int): Target hour in UTC (0–23).

    Returns:
        datetime: Next scheduled run, always in the future.
    """
    now = datetime.now(UTC)
    target = now.replace(hour=hour, minute=0, second=0, microsecond=0)
    if now >= target:
        target += timedelta(days=1)
    return target


async def run_news_job() -> None:
    """Execute the news ingestion job inside a fresh DB session.

    Returns:
        None
    """
    from app.database import AsyncSessionLocal
    from app.etl.jobs import ingest_news

    logger.info("Starting daily news ingestion...")
    try:
        async with AsyncSessionLocal() as session:
            result = await ingest_news(session)
            logger.info("News ingestion done: %s", result.messages[-1] if result.messages else "OK")
    except Exception as exc:
        logger.error("News ingestion failed: %s", exc)


async def main() -> None:
    """Loop forever, sleeping until the next scheduled run time.

    Returns:
        None
    """
    logger.info("News scheduler started — daily run at %02d:00 UTC", _RUN_HOUR_UTC)

    while True:
        target = _next_run_at(_RUN_HOUR_UTC)
        wait_seconds = (target - datetime.now(UTC)).total_seconds()
        logger.info(
            "Next news update at %s UTC (in %.0f min)",
            target.strftime("%Y-%m-%d %H:%M"),
            wait_seconds / 60,
        )
        await asyncio.sleep(wait_seconds)
        await run_news_job()


if __name__ == "__main__":
    asyncio.run(main())
