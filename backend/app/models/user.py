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
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.BUYER, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    province: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    commune: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address_detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    default_currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    language_pref: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    facebook_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    fcm_token: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    token_version: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    seller_profile: Mapped[Optional["Seller"]] = relationship(
        "Seller", back_populates="user", uselist=False
    )
    addresses: Mapped[List["UserAddress"]] = relationship(
        "UserAddress", back_populates="user", cascade="all, delete-orphan"
    )


class Seller(Base):
    __tablename__ = "sellers"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False
    )
    shop_name: Mapped[str] = mapped_column(String(255), nullable=False)
    shop_name_kh: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    shop_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    shop_logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    shop_banner_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    national_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    national_id_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    business_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    commission_rate: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_sales: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_revenue: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="seller_profile")


class UserAddress(Base):
    __tablename__ = "user_addresses"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[uuid4] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    recipient_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    province: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    commune: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    village: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    street_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    label: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="addresses")
