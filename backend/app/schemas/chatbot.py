from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatbotRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


class ChatbotResponse(BaseModel):
    reply: str
    model: str
