from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    seller_id: Mapped[Optional[uuid4]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sellers.id"), nullable=True
    )
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    discount_type: Mapped[str] = mapped_column(String(20), nullable=False)
    discount_value: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    min_order_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    max_discount: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    usage_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    per_user_limit: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    applicable_products: Mapped[Optional[list]] = mapped_column(ARRAY(UUID), nullable=True)
    applicable_categories: Mapped[Optional[list]] = mapped_column(ARRAY(UUID), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    seller: Mapped[Optional["Seller"]] = relationship("Seller", backref="coupons")

    __table_args__ = (
        Index("ix_coupons_seller_id", "seller_id"),
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    title_kh: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    message_kh: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    reference_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[Optional[uuid4]] = mapped_column(UUID(as_uuid=True), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    action_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user: Mapped["User"] = relationship("User", backref="notifications")

    __table_args__ = (
        Index("ix_notifications_user_id_is_read", "user_id", "is_read"),
    )


class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    buyer_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    seller_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    order_id: Mapped[Optional[uuid4]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True
    )
    last_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    buyer_unread: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    seller_unread: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    buyer: Mapped["User"] = relationship("User", foreign_keys=[buyer_id], backref="buyer_chat_rooms")
    seller: Mapped["User"] = relationship("User", foreign_keys=[seller_id], backref="seller_chat_rooms")
    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="room", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_chat_rooms_buyer_id", "buyer_id"),
        Index("ix_chat_rooms_seller_id", "seller_id"),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=False
    )
    sender_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(String(20), default="text", nullable=False)
    attachments: Mapped[Optional[list]] = mapped_column(ARRAY(String), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    room: Mapped["ChatRoom"] = relationship("ChatRoom", back_populates="messages")
    sender: Mapped["User"] = relationship("User")

    __table_args__ = (
        Index("ix_chat_messages_room_id", "room_id"),
    )


from app.models.user import User, Seller  # noqa: E402, F401
from app.models.order import Order  # noqa: E402, F401
