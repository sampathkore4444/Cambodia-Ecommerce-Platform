from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
from typing import Any, Optional

from app.core.config import settings
from app.services.payment_gateways.base import HTTP_TIMEOUT, PaymentGateway, PaymentResult

logger = logging.getLogger(__name__)

PIPAY_API_BASE = "https://api.pipay.com.kh"
PIPAY_API_VERSION = "v1"


class PiPayGateway(PaymentGateway):
    """PiPay integration.

    Docs: https://docs.pipay.com/
    Auth: app_id + HMAC-SHA256 signature using app_key.
    """

    @property
    def name(self) -> str:
        return "pipay"

    def _is_configured(self) -> bool:
        return bool(settings.PIPAY_APP_ID and settings.PIPAY_APP_KEY)

    def _generate_signature(self, timestamp: str, payload_str: str) -> str:
        """Generate HMAC-SHA256 signature for PiPay API request.

        PiPay signs: HMAC-SHA256(app_key, app_id + timestamp + payload_json)
        """
        message = (settings.PIPAY_APP_ID + timestamp + payload_str).encode("utf-8")
        return self._hmac_sha256(settings.PIPAY_APP_KEY, message)

    def _build_headers(self, signature: str, timestamp: str) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-App-ID": settings.PIPAY_APP_ID,
            "X-Timestamp": timestamp,
            "X-Signature": signature,
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
            logger.warning("PiPay credentials not configured, skipping gateway call")
            return PaymentResult(success=False, error_message="PiPay not configured")

        timestamp = str(int(time.time()))
        amount_str = f"{amount:.2f}"

        payload = {
            "app_id": settings.PIPAY_APP_ID,
            "order_number": order_number,
            "amount": amount_str,
            "currency": currency,
            "callback_url": callback_url,
            "return_url": return_url,
            "description": f"Payment for order {order_number}",
        }
        if metadata:
            payload["metadata"] = metadata

        payload_str = json.dumps(payload, separators=(",", ":"))
        signature = self._generate_signature(timestamp, payload_str)
        headers = self._build_headers(signature, timestamp)

        try:
            url = f"{PIPAY_API_BASE}/{PIPAY_API_VERSION}/payments/create"
            resp = await self._post(url, json=payload, headers=headers)

            if resp.get("status") == "success" or resp.get("payment_url"):
                return PaymentResult(
                    success=True,
                    transaction_id=resp.get("transaction_id") or resp.get("pipay_txn_id"),
                    payment_url=resp.get("payment_url") or resp.get("redirect_url"),
                    raw_response=resp,
                )

            return PaymentResult(
                success=False,
                error_message=resp.get("message", "PiPay returned non-success status"),
                raw_response=resp,
            )

        except Exception as e:
            logger.exception("PiPay API error for order %s", order_number)
            return PaymentResult(success=False, error_message=str(e))

    async def verify_callback(self, payload: bytes, signature: str) -> bool:
        secret = settings.PIPAY_WEBHOOK_SECRET or settings.PIPAY_APP_KEY
        expected = self._hmac_sha256(secret, payload)
        return hmac.compare_digest(expected, signature)

    async def parse_callback(self, payload: dict) -> dict:
        """Normalize PiPay callback to standard format."""
        status_map = {
            "completed": "success",
            "paid": "success",
            "success": "success",
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
