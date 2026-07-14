from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    phone: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    province: Optional[str] = None
    default_currency: str = "USD"


class UserRegister(BaseModel):
    phone: str
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class UserLogin(BaseModel):
    identifier: str = Field(..., description="Phone number or email")
    password: str


class PhoneLogin(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    phone: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    is_verified: bool
    province: Optional[str] = None
    language_pref: str = "en"
    created_at: datetime


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    full_name: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    commune: Optional[str] = None
    address_detail: Optional[str] = None
    default_currency: Optional[str] = None
    language_pref: Optional[str] = None


class SellerRegister(BaseModel):
    shop_name: str = Field(..., min_length=2, max_length=255)
    shop_name_kh: Optional[str] = None
    national_id: Optional[str] = None
    business_type: Optional[str] = None


class SellerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    shop_name: str
    shop_name_kh: Optional[str] = None
    shop_description: Optional[str] = None
    shop_logo_url: Optional[str] = None
    shop_banner_url: Optional[str] = None
    national_id: Optional[str] = None
    national_id_image: Optional[str] = None
    is_verified: bool
    business_type: Optional[str] = None
    commission_rate: float
    rating_avg: float
    rating_count: int
    total_sales: int
    total_revenue: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None


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


class AddressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    recipient_name: str
    phone: str
    province: str
    district: str
    commune: Optional[str] = None
    village: Optional[str] = None
    street_address: Optional[str] = None
    postal_code: Optional[str] = None
    label: Optional[str] = None
    is_default: bool
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str
