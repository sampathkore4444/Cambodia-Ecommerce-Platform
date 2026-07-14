from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


class ProductCondition(str, enum.Enum):
    NEW = "new"
    USED_LIKE_NEW = "used_like_new"
    USED_GOOD = "used_good"
    USED_FAIR = "used_fair"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parent_id: Mapped[Optional[uuid4]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_kh: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    commission_rate: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    parent: Mapped[Optional["Category"]] = relationship(
        "Category", remote_side="Category.id", back_populates="children"
    )
    children: Mapped[List["Category"]] = relationship("Category", back_populates="parent")
    products: Mapped[List["Product"]] = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    seller_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sellers.id"), nullable=False, index=True
    )
    category_id: Mapped[Optional[uuid4]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_kh: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    slug: Mapped[str] = mapped_column(String(500), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_kh: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    price_khr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    compare_price: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    cost_price: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    condition: Mapped[str] = mapped_column(String(20), default="new", nullable=False)
    sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    barcode: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    weight_grams: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_digital: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    digital_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sold_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tags: Mapped[Optional[list]] = mapped_column(ARRAY(String), nullable=True)
    meta_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    shipping_class: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    min_order_qty: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    max_order_qty: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location_province: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location_district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    seller: Mapped["Seller"] = relationship("Seller", backref="products")
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="products")
    images: Mapped[List["ProductImage"]] = relationship(
        "ProductImage", back_populates="product", cascade="all, delete-orphan"
    )
    variants: Mapped[List["ProductVariant"]] = relationship(
        "ProductVariant", back_populates="product", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_products_is_active", "is_active"),
        Index("ix_products_is_featured", "is_featured"),
        Index("ix_products_is_active_category", "is_active", "category_id"),
        Index("ix_products_sold_count", "sold_count"),
        Index("ix_products_rating_avg", "rating_avg"),
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    product_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    alt_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    product: Mapped["Product"] = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    product_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    attributes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    product: Mapped["Product"] = relationship("Product", back_populates="variants")


from app.models.user import Seller  # noqa: E402, F401
