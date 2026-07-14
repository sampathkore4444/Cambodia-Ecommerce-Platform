from __future__ import annotations

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="UTC")


async def expire_unpaid_orders_job() -> None:
    """Background job: cancel orders with pending non-COD payments older than 30 min."""
    from app.core.database import async_session_factory
    from app.services.payment_service import expire_unpaid_orders

    try:
        async with async_session_factory() as session:
            count = await expire_unpaid_orders(session)
            await session.commit()
        if count > 0:
            logger.info("Scheduled job expired %d unpaid orders", count)
    except Exception:
        logger.exception("Failed to run expire_unpaid_orders job")


def start_scheduler() -> None:
    scheduler.add_job(
        expire_unpaid_orders_job,
        trigger=IntervalTrigger(minutes=5),
        id="expire_unpaid_orders",
        name="Expire unpaid orders",
        replace_existing=True,
        max_instances=1,
        next_run_time=datetime.now(timezone.utc),
    )
    scheduler.start()
    logger.info("Scheduler started (expire_unpaid_orders every 5 minutes)")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
