from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    title_kh: Optional[str] = None
    message: str
    message_kh: Optional[str] = None
    type: str
    reference_type: Optional[str] = None
    reference_id: Optional[UUID] = None
    is_read: bool
    action_url: Optional[str] = None
    created_at: datetime


class NotificationCount(BaseModel):
    unread_count: int
