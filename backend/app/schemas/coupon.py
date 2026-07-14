from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str = Field(..., description="percentage or fixed")
    discount_value: float = Field(gt=0)
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    per_user_limit: int = 1
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    applicable_products: Optional[List[UUID]] = None
    applicable_categories: Optional[List[UUID]] = None


class CouponResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    seller_id: Optional[UUID] = None
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    used_count: int
    per_user_limit: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime


class CouponValidate(BaseModel):
    coupon_code: str
    cart_total: float


class CouponValidationResponse(BaseModel):
    valid: bool
    discount_amount: float = 0.0
    message: str = ""
    coupon_id: Optional[UUID] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
