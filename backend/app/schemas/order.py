from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CartItemAdd(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    title_kh: Optional[str] = None
    slug: str
    price: float
    price_khr: Optional[int] = None
    currency: str = "USD"
    primary_image: Optional[str] = None
    rating_avg: float = 0.0
    rating_count: int = 0
    sold_count: int = 0
    location_province: Optional[str] = None
    condition: str = "new"


class CartItemVariant(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product: CartItemProduct
    variant: Optional[CartItemVariant] = None
    quantity: int
    subtotal: float


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float
    item_count: int


class AddressCreate(BaseModel):
    recipient_name: str
    phone: str
    province: str
    district: str
    commune: Optional[str] = None
    village: Optional[str] = None
    street_address: Optional[str] = None
    postal_code: Optional[str] = None
    label: Optional[str] = None
    is_default: bool = False


class OrderCreate(BaseModel):
    shipping_address: AddressCreate
    payment_method: str
    note: Optional[str] = None
    coupon_code: Optional[str] = None
    buy_now_product_id: Optional[str] = None
    buy_now_quantity: Optional[int] = None


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_title: str
    product_image: Optional[str] = None
    variant_name: Optional[str] = None
    price: float
    quantity: int
    total: float
    status: str


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    status: str
    subtotal: float
    shipping_cost: float
    discount_amount: float
    total: float
    currency: str
    payment_method: Optional[str] = None
    payment_status: str
    items: List[OrderItemResponse] = []
    shipping_address: Optional[Dict[str, Any]] = None
    note: Optional[str] = None
    tracking_number: Optional[str] = None
    shipping_partner: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    created_at: datetime


class OrderListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    status: str
    total: float
    currency: str
    item_count: int = 0
    created_at: datetime


class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None
