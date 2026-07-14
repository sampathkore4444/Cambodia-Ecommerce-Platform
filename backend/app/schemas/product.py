from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryBase(BaseModel):
    name: str
    name_kh: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    image_url: Optional[str] = None


class CategoryCreate(BaseModel):
    name: str
    name_kh: Optional[str] = None
    parent_id: Optional[UUID] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    image_url: Optional[str] = None
    commission_rate: float = 5.0
    sort_order: int = 0


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    parent_id: Optional[UUID] = None
    name: str
    name_kh: Optional[str] = None
    slug: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    image_url: Optional[str] = None
    level: int = 0
    sort_order: int = 0
    is_active: bool = True
    children: Optional[List[CategoryResponse]] = None


class CategoryTree(BaseModel):
    categories: List[CategoryResponse]


class ProductBase(BaseModel):
    title: str
    title_kh: Optional[str] = None
    description: Optional[str] = None
    description_kh: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    currency: str = "USD"
    condition: str = "new"
    stock_quantity: int = 0
    weight_grams: Optional[int] = None
    is_digital: bool = False
    shipping_class: Optional[str] = None
    min_order_qty: int = 1
    max_order_qty: Optional[int] = None
    location_province: Optional[str] = None
    location_district: Optional[str] = None
    tags: Optional[List[str]] = None
    category_id: Optional[UUID] = None

    @field_validator("category_id", mode="before")
    @classmethod
    def coerce_category_id(cls, v):
        if v is None or v == "":
            return None
        try:
            return UUID(str(v))
        except ValueError:
            return None


class ProductImageCreate(BaseModel):
    url: str
    alt_text: Optional[str] = None
    sort_order: int = 0
    is_primary: bool = False


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    url: str
    alt_text: Optional[str] = None
    sort_order: int
    is_primary: bool


class VariantCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    price: float
    stock_quantity: int = 0
    image_url: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None


class VariantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    sku: Optional[str] = None
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    images: Optional[List[ProductImageCreate]] = None
    variants: Optional[List[VariantCreate]] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    title_kh: Optional[str] = None
    description: Optional[str] = None
    description_kh: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    currency: Optional[str] = None
    condition: Optional[str] = None
    stock_quantity: Optional[int] = None
    weight_grams: Optional[int] = None
    is_digital: Optional[bool] = None
    shipping_class: Optional[str] = None
    min_order_qty: Optional[int] = None
    max_order_qty: Optional[int] = None
    location_province: Optional[str] = None
    location_district: Optional[str] = None
    tags: Optional[List[str]] = None
    category_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    images: Optional[List[ProductImageCreate]] = None
    variants: Optional[List[VariantCreate]] = None

    @field_validator("category_id", mode="before")
    @classmethod
    def coerce_category_id(cls, v):
        if v is None or v == "":
            return None
        try:
            return UUID(str(v))
        except ValueError:
            return None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    seller_id: UUID
    seller_name: Optional[str] = None
    seller_avatar: Optional[str] = None
    category_id: Optional[UUID] = None
    title: str
    title_kh: Optional[str] = None
    slug: str
    description: Optional[str] = None
    description_kh: Optional[str] = None
    price: float
    price_khr: Optional[int] = None
    compare_price: Optional[float] = None
    currency: str = "USD"
    condition: str = "new"
    sku: Optional[str] = None
    stock_quantity: int
    weight_grams: Optional[int] = None
    is_digital: bool = False
    is_active: bool = True
    is_featured: bool = False
    status: str = "active"
    rating_avg: float = 0.0
    rating_count: int = 0
    view_count: int = 0
    sold_count: int = 0
    tags: Optional[List[str]] = None
    shipping_class: Optional[str] = None
    min_order_qty: int = 1
    max_order_qty: Optional[int] = None
    location_province: Optional[str] = None
    location_district: Optional[str] = None
    images: List[ProductImageResponse] = []
    variants: List[VariantResponse] = []
    created_at: datetime
    updated_at: datetime


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    title_kh: Optional[str] = None
    slug: str
    price: float
    price_khr: Optional[int] = None
    compare_price: Optional[float] = None
    currency: str = "USD"
    primary_image: Optional[str] = None
    rating_avg: float = 0.0
    rating_count: int = 0
    sold_count: int = 0
    location_province: Optional[str] = None
    condition: str = "new"


class ProductFilterParams(BaseModel):
    category_id: Optional[UUID] = None
    seller_id: Optional[UUID] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    in_stock: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_by: str = "created_at"
    search: Optional[str] = None
    page: int = 1
    per_page: int = 20

    @field_validator("category_id", mode="before")
    @classmethod
    def coerce_category_id(cls, v):
        if v is None or v == "":
            return None
        try:
            return UUID(str(v))
        except ValueError:
            return None
