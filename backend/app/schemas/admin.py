from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AdminDashboardStats(BaseModel):
    total_users: int = 0
    total_sellers: int = 0
    total_products: int = 0
    total_orders: int = 0
    total_revenue: float = 0.0
    recent_orders: List[Dict[str, Any]] = []
    top_products: List[Dict[str, Any]] = []


class UserAdminAction(BaseModel):
    action: Optional[str] = Field(None, description="ban, unban, or verify")
    reason: Optional[str] = None


class ProductAdminAction(BaseModel):
    action: Optional[str] = Field(None, description="approve, flag, or archive")
    reason: Optional[str] = None


class AdminCategoryCreate(BaseModel):
    name: str
    name_kh: Optional[str] = None
    parent_id: Optional[UUID] = None
    slug: Optional[str] = None
    commission_rate: float = 5.0
    icon_url: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0


class AdminCategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_kh: Optional[str] = None
    parent_id: Optional[UUID] = None
    slug: Optional[str] = None
    commission_rate: Optional[float] = None
    icon_url: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
