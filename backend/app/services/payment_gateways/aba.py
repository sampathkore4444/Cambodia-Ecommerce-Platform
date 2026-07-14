from __future__ import annotations

import hashlib
import json
import logging
import time
from typing import Any, Optional

from app.core.config import settings
from app.services.payment_gateways.base import HTTP_TIMEOUT, PaymentGateway, PaymentResult

logger = logging.getLogger(__name__)

ABA_API_BASE = "https://merchant-api.ababank.com"
ABA_API_VERSION = "v1"


class ABAPayGateway(PaymentGateway):
    """ABA Pay integration.

    Docs: https://developer.ababank.com/
    Auth: HMAC-SHA512 signature of request body using merchant secret key.
    """

    @property
    def name(self) -> str:
        return "aba"

    def _is_configured(self) -> bool:
        return bool(settings.ABA_MERCHANT_ID and settings.ABA_API_KEY and settings.ABA_SECRET_KEY)

    def _generate_signature(self, payload: dict) -> str:
        """Generate HMAC-SHA512 signature for ABA API request."""
        raw = json.dumps(payload, separators=(",", ":"))
        return self._hmac_sha512(settings.ABA_SECRET_KEY, raw.encode("utf-8"))

    def _build_headers(self, signature: str) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-Signature": signature,
            "X-API-Key": settings.ABA_API_KEY,
        }

    async def create_payment(
        self,
        *,
        order_number: str,
        amount: float,
        currency: str,
        callback_url: str,
        return_url: str,
        metadata: Optional[dict[str, Any]] = None,
    ) -> PaymentResult:
        if not self._is_configured():
            logger.warning("ABA Pay credentials not configured, skipping gateway call")
            return PaymentResult(success=False, error_message="ABA Pay not configured")

        # ABA expects amount in cents for USD or riel for KHR
        amount_cents = int(amount * 100) if currency == "USD" else int(amount)

        payload = {
            "merchant_id": settings.ABA_MERCHANT_ID,
            "order_number": order_number,
            "amount": amount_cents,
            "currency": currency,
            "callback_url": callback_url,
            "return_url": return_url,
            "description": f"Payment for order {order_number}",
        }
        if metadata:
            payload["metadata"] = metadata

        signature = self._generate_signature(payload)
        headers = self._build_headers(signature)

        try:
            url = f"{ABA_API_BASE}/{ABA_API_VERSION}/payments"
            resp = await self._post(url, json=payload, headers=headers)

            if resp.get("status") == "success" or resp.get("abapay_url"):
                return PaymentResult(
                    success=True,
                    transaction_id=resp.get("transaction_id") or resp.get("qr_id"),
                    payment_url=resp.get("abapay_url") or resp.get("redirect_url"),
                    raw_response=resp,
                )

            return PaymentResult(
                success=False,
                error_message=resp.get("message", "ABA Pay returned non-success status"),
                raw_response=resp,
            )

        except Exception as e:
            logger.exception("ABA Pay API error for order %s", order_number)
            return PaymentResult(success=False, error_message=str(e))

    async def verify_callback(self, payload: bytes, signature: str) -> bool:
        expected = self._hmac_sha512(settings.ABA_WEBHOOK_SECRET or settings.ABA_SECRET_KEY, payload)
        return self._compare_signatures(expected, signature)

    async def parse_callback(self, payload: dict) -> dict:
        """Normalize ABA callback to standard format."""
        status_map = {
            "completed": "success",
            "paid": "success",
            "pending": "pending",
            "failed": "failed",
            "cancelled": "failed",
            "expired": "failed",
        }
        raw_status = (payload.get("status") or "").lower()
        return {
            "transaction_id": payload.get("transaction_id") or payload.get("txn_id"),
            "order_number": payload.get("order_number"),
            "status": status_map.get(raw_status, raw_status),
            "amount": payload.get("amount"),
            "currency": payload.get("currency"),
            "metadata": payload.get("metadata", {}),
        }

    @staticmethod
    def _compare_signatures(expected: str, received: str) -> bool:
        return hmac.compare_digest(expected, received)


import hmac
