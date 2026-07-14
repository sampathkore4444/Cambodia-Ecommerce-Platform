from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ChatRoomCreate(BaseModel):
    seller_id: UUID
    order_id: Optional[UUID] = None


class ChatUserInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class ChatRoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    buyer: ChatUserInfo
    seller: ChatUserInfo
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime


class ChatMessageCreate(BaseModel):
    message: str
    message_type: str = "text"
    attachments: Optional[List[str]] = None


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sender_id: UUID
    message: str
    message_type: str
    attachments: Optional[List[str]] = None
    is_read: bool
    created_at: datetime
