from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def verify_webhook_signature(
    payload: bytes,
    signature: Optional[str],
    secret: str,
    algorithm: str = "sha256",
) -> bool:
    if not signature or not secret:
        return False
    expected = hmac.new(
        secret.encode("utf-8"),
        payload,
        getattr(hashlib, algorithm),
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_aba_callback(payload: bytes, signature: Optional[str]) -> bool:
    return verify_webhook_signature(payload, signature, settings.ABA_WEBHOOK_SECRET or settings.ABA_SECRET_KEY)


def verify_wing_callback(payload: bytes, signature: Optional[str]) -> bool:
    return verify_webhook_signature(payload, signature, settings.WING_WEBHOOK_SECRET or settings.WING_API_KEY)


def verify_pipay_callback(payload: bytes, signature: Optional[str]) -> bool:
    return verify_webhook_signature(payload, signature, settings.PIPAY_WEBHOOK_SECRET or settings.PIPAY_APP_KEY)
