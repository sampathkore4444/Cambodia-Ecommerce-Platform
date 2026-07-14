from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import FastAPI

from app.core.config import settings
from app.core.database import Base, engine

logger = logging.getLogger(__name__)

redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return redis_client


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global redis_client

    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    logger.info("Environment: %s", settings.APP_ENV)
    logger.info("Connecting to database...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured")

    await engine.connect()
    logger.info("Database connected")

    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        await redis_client.ping()
        logger.info("Redis connected")
    except Exception as e:
        logger.warning("Redis connection failed: %s", e)

    # Start background scheduler
    from app.core.scheduler import start_scheduler
    start_scheduler()

    logger.info("%s started successfully", settings.APP_NAME)

    yield

    # Stop background scheduler
    from app.core.scheduler import stop_scheduler
    stop_scheduler()

    logger.info("Shutting down %s...", settings.APP_NAME)

    if redis_client is not None:
        await redis_client.close()
        logger.info("Redis disconnected")

    await engine.dispose()
    logger.info("Database disconnected")
    logger.info("%s shutdown complete", settings.APP_NAME)
