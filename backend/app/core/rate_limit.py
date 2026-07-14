from __future__ import annotations

import time
from typing import Callable, Optional, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.common.exceptions import RateLimitException


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        default_limit: int = 100,
        default_window: int = 60,
    ):
        super().__init__(app)
        self.default_limit = default_limit
        self.default_window = default_window
        self._endpoint_limits: dict[str, Tuple[int, int]] = {
            "/api/v1/payments/aba/callback": (10, 60),
            "/api/v1/payments/wing/callback": (10, 60),
            "/api/v1/payments/pipay/callback": (10, 60),
            "/api/v1/auth/login": (5, 60),
            "/api/v1/auth/register": (3, 60),
            "/api/v1/auth/otp/verify": (5, 300),
            "/api/v1/orders": (10, 60),
            "/api/v1/payments": (10, 60),
        }

    def _get_client_ip(self, request: Request) -> str:
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        return request.client.host if request.client else "unknown"

    def _get_limits(self, path: str) -> Tuple[int, int]:
        for pattern, limits in self._endpoint_limits.items():
            if path.startswith(pattern):
                return limits
        return self.default_limit, self.default_window

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        if not path.startswith("/api/v1/"):
            return await call_next(request)

        try:
            from app.core.events import get_redis
            r = await get_redis()
        except Exception:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        limit, window = self._get_limits(path)
        key = f"rate:{client_ip}:{path}"

        now = time.time()
        pipe = r.pipeline()
        pipe.zremrangebyscore(key, 0, now - window)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window)
        results = await pipe.execute()

        request_count = results[2]

        if request_count > limit:
            raise RateLimitException(
                detail="Too many requests. Please try again later."
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, limit - request_count)
        )
        return response
