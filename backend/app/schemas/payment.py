from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PaymentInit(BaseModel):
    order_id: UUID
    method: str


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_id: UUID
    method: str
    amount: float
    currency: str
    status: str
    transaction_id: Optional[str] = None
    payment_url: Optional[str] = None
    created_at: datetime


class PaymentCallback(BaseModel):
    transaction_id: str
    status: str
    amount: float
    order_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
