from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[Optional[uuid4]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    session_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    product_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    variant_id: Mapped[Optional[uuid4]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=True
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped[Optional["User"]] = relationship("User", backref="cart_items")
    product: Mapped["Product"] = relationship("Product")
    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant")

    __table_args__ = (
        Index("ix_cart_items_user_id", "user_id"),
        Index("ix_cart_items_product_id", "product_id"),
    )


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    buyer_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    shipping_cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payment_status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )
    shipping_address: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    billing_address: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    seller_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    shipping_partner: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    estimated_delivery: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancel_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    buyer: Mapped["User"] = relationship("User", backref="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )
    payments: Mapped[list["Payment"]] = relationship(
        "Payment", back_populates="order", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_orders_status", "status"),
        Index("ix_orders_payment_status", "payment_status"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    order_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    seller_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sellers.id"), nullable=False
    )
    product_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    variant_id: Mapped[Optional[uuid4]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=True
    )
    product_title: Mapped[str] = mapped_column(String(500), nullable=False)
    product_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    variant_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    seller: Mapped["Seller"] = relationship("Seller")
    product: Mapped["Product"] = relationship("Product")

    __table_args__ = (
        Index("ix_order_items_order_id", "order_id"),
        Index("ix_order_items_seller_id", "seller_id"),
    )


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    order_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False
    )
    method: Mapped[str] = mapped_column(String(50), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    transaction_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    payment_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    refund_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    refund_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    order: Mapped["Order"] = relationship("Order", back_populates="payments")

    __table_args__ = (
        Index("ix_payments_order_id", "order_id"),
        Index("ix_payments_transaction_id", "transaction_id"),
        Index("ix_payments_status", "status"),
    )


from app.models.user import User, Seller  # noqa: E402, F401
from app.models.product import Product, ProductVariant  # noqa: E402, F401
