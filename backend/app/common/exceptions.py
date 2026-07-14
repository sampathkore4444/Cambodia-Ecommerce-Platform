from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class KhmerMarketException(Exception):
    def __init__(
        self,
        detail: str = "An error occurred",
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        errors: Optional[Dict[str, Any]] = None,
    ):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code
        self.errors = errors
        super().__init__(detail)


class NotFoundException(KhmerMarketException):
    def __init__(self, detail: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(detail=detail, status_code=404, error_code=error_code)


class UnauthorizedException(KhmerMarketException):
    def __init__(self, detail: str = "Not authenticated", error_code: str = "UNAUTHORIZED"):
        super().__init__(detail=detail, status_code=401, error_code=error_code)


class ForbiddenException(KhmerMarketException):
    def __init__(self, detail: str = "Forbidden", error_code: str = "FORBIDDEN"):
        super().__init__(detail=detail, status_code=403, error_code=error_code)


class BadRequestException(KhmerMarketException):
    def __init__(self, detail: str = "Bad request", error_code: str = "BAD_REQUEST"):
        super().__init__(detail=detail, status_code=400, error_code=error_code)


class ConflictException(KhmerMarketException):
    def __init__(self, detail: str = "Conflict", error_code: str = "CONFLICT"):
        super().__init__(detail=detail, status_code=409, error_code=error_code)


class ValidationException(KhmerMarketException):
    def __init__(
        self,
        detail: str = "Validation error",
        errors: Optional[Dict[str, Any]] = None,
        error_code: str = "VALIDATION_ERROR",
    ):
        super().__init__(detail=detail, status_code=422, error_code=error_code, errors=errors)


class PaymentException(KhmerMarketException):
    def __init__(self, detail: str = "Payment failed", error_code: str = "PAYMENT_ERROR"):
        super().__init__(detail=detail, status_code=402, error_code=error_code)


class RateLimitException(KhmerMarketException):
    def __init__(self, detail: str = "Rate limit exceeded", error_code: str = "RATE_LIMIT"):
        super().__init__(detail=detail, status_code=429, error_code=error_code)


def exception_handler(app: FastAPI) -> None:
    @app.exception_handler(KhmerMarketException)
    async def khmermarket_exception_handler(request: Request, exc: KhmerMarketException) -> JSONResponse:
        body = {
            "success": False,
            "message": exc.detail,
            "error_code": exc.error_code,
        }
        if exc.errors:
            body["errors"] = exc.errors
        return JSONResponse(status_code=exc.status_code, content=body)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": str(exc.detail),
                "error_code": "HTTP_ERROR",
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors: Dict[str, Any] = {}
        for error in exc.errors():
            loc = ".".join(str(l) for l in error.get("loc", []))
            errors[loc] = error.get("msg", "Invalid value")
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Validation error",
                "error_code": "VALIDATION_ERROR",
                "errors": errors,
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
                "error_code": "INTERNAL_ERROR",
            },
        )
