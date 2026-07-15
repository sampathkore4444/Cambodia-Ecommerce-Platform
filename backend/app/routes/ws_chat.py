from __future__ import annotations

import json
import logging
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from app.core.config import settings
from app.core.database import async_session_factory
from app.models.notification import ChatMessage, ChatRoom
from app.services import chat_service
from sqlalchemy import select

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat WebSocket"])


class ConnectionManager:
    def __init__(self):
        self._rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, ws: WebSocket, room_id: str):
        await ws.accept()
        self._rooms.setdefault(room_id, set()).add(ws)

    def disconnect(self, ws: WebSocket, room_id: str):
        if room_id in self._rooms:
            self._rooms[room_id].discard(ws)
            if not self._rooms[room_id]:
                del self._rooms[room_id]

    async def broadcast(self, room_id: str, message: dict):
        if room_id not in self._rooms:
            return
        dead = []
        for ws in self._rooms[room_id]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._rooms[room_id].discard(ws)


manager = ConnectionManager()


def _verify_ws_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub")
    except JWTError:
        return None


@router.websocket("/ws/chat/{room_id}")
async def websocket_chat(ws: WebSocket, room_id: str, token: str = ""):
    user_id = _verify_ws_token(token)
    if not user_id:
        await ws.close(code=4001, reason="Unauthorized")
        return

    async with async_session_factory() as db:
        room = await db.scalar(
            select(ChatRoom).where(
                ChatRoom.id == room_id,
                ChatRoom.is_active == True,
            )
        )
        if not room:
            await ws.close(code=4004, reason="Room not found")
            return
        if str(room.buyer_id) != user_id and str(room.seller_id) != user_id:
            await ws.close(code=4003, reason="Forbidden")
            return

    await manager.connect(ws, room_id)
    try:
        while True:
            raw = await ws.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await ws.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            message_text = data.get("message", "").strip()
            if not message_text:
                continue

            async with async_session_factory() as db:
                from app.schemas.chat import ChatMessageCreate

                msg_create = ChatMessageCreate(message=message_text)
                msg = await chat_service.send_message(
                    db, room_id, user_id, msg_create
                )
                await db.commit()

            await manager.broadcast(room_id, {
                "type": "message",
                "id": str(msg.id),
                "sender_id": user_id,
                "message": msg.message,
                "message_type": msg.message_type,
                "created_at": msg.created_at.isoformat(),
            })

    except WebSocketDisconnect:
        manager.disconnect(ws, room_id)
    except Exception:
        logger.exception("WebSocket error in room %s", room_id)
        manager.disconnect(ws, room_id)
