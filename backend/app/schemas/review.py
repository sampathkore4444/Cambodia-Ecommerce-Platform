from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    images: Optional[List[str]] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user: ReviewUser
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    images: Optional[List[str]] = None
    seller_response: Optional[str] = None
    is_verified: bool
    helpful_count: int
    created_at: datetime
