from __future__ import annotations

import abc
import hashlib
import hmac
import logging
from dataclasses import dataclass, field
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

HTTP_TIMEOUT = 30.0


@dataclass
class PaymentResult:
    success: bool
    transaction_id: Optional[str] = None
    payment_url: Optional[str] = None
    redirect_url: Optional[str] = None
    raw_response: dict = field(default_factory=dict)
    error_message: Optional[str] = None


class PaymentGateway(abc.ABC):
    """Abstract base for all payment gateway integrations."""

    @property
    @abc.abstractmethod
    def name(self) -> str: ...

    @abc.abstractmethod
    async def create_payment(
        self,
        *,
        order_number: str,
        amount: float,
        currency: str,
        callback_url: str,
        return_url: str,
        metadata: Optional[dict[str, Any]] = None,
    ) -> PaymentResult: ...

    @abc.abstractmethod
    async def verify_callback(
        self,
        payload: bytes,
        signature: str,
    ) -> bool: ...

    @abc.abstractmethod
    async def parse_callback(self, payload: dict) -> dict: ...

    @staticmethod
    def _hmac_sha256(secret: str, data: bytes) -> str:
        return hmac.new(secret.encode("utf-8"), data, hashlib.sha256).hexdigest()

    @staticmethod
    def _hmac_sha512(secret: str, data: bytes) -> str:
        return hmac.new(secret.encode("utf-8"), data, hashlib.sha512).hexdigest()

    @staticmethod
    def _md5(data: bytes) -> str:
        return hashlib.md5(data).hexdigest()

    @staticmethod
    async def _post(url: str, json: dict, headers: dict | None = None) -> dict:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.post(url, json=json, headers=headers or {})
            resp.raise_for_status()
            return resp.json()

    @staticmethod
    async def _get(url: str, headers: dict | None = None, params: dict | None = None) -> dict:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(url, headers=headers or {}, params=params or {})
            resp.raise_for_status()
            return resp.json()
