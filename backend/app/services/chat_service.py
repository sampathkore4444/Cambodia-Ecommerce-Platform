from datetime import datetime, timezone
from math import ceil

from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.models.notification import ChatMessage, ChatRoom
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import Seller, User
from app.schemas.chat import ChatMessageCreate, ChatRoomCreate


async def create_chat_room(
    db: AsyncSession, buyer_id: str, data: ChatRoomCreate
) -> ChatRoom:
    seller_result = await db.execute(
        select(Seller).where(Seller.id == data.seller_id)
    )
    seller = seller_result.scalar_one_or_none()
    if not seller:
        raise NotFoundException("Seller not found")

    if str(data.seller_id) == buyer_id:
        raise BadRequestException("Cannot create a chat room with yourself")

    existing = await db.execute(
        select(ChatRoom).where(
            ChatRoom.buyer_id == buyer_id,
            ChatRoom.seller_id == data.seller_id,
            ChatRoom.is_active == True,
        )
    )
    room = existing.scalar_one_or_none()
    if room:
        return room

    room = ChatRoom(
        buyer_id=buyer_id,
        seller_id=data.seller_id,
        order_id=data.order_id,
        is_active=True,
        buyer_unread=0,
        seller_unread=0,
        created_at=datetime.now(timezone.utc),
    )
    db.add(room)
    await db.flush()
    await db.refresh(room)
    return room


async def get_chat_rooms(
    db: AsyncSession, user_id: str, role: str
) -> list:
    if role == "seller":
        query = (
            select(ChatRoom)
            .options(
                selectinload(ChatRoom.buyer),
            )
            .where(
                ChatRoom.seller_id == user_id,
                ChatRoom.is_active == True,
            )
            .order_by(ChatRoom.last_message_at.desc().nullslast())
        )
    else:
        query = (
            select(ChatRoom)
            .options(
                selectinload(ChatRoom.seller),
            )
            .where(
                ChatRoom.buyer_id == user_id,
                ChatRoom.is_active == True,
            )
            .order_by(ChatRoom.last_message_at.desc().nullslast())
        )

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_messages(
    db: AsyncSession,
    room_id: str,
    user_id: str,
    page: int = 1,
    per_page: int = 20,
) -> dict:
    room_result = await db.execute(
        select(ChatRoom).where(ChatRoom.id == room_id)
    )
    room = room_result.scalar_one_or_none()
    if not room:
        raise NotFoundException("Chat room not found")

    if str(room.buyer_id) != user_id and str(room.seller_id) != user_id:
        raise ForbiddenException("Access denied to this chat room")

    query = (
        select(ChatMessage)
        .where(ChatMessage.room_id == room_id)
        .order_by(ChatMessage.created_at.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    messages = list(reversed(result.scalars().all()))

    return {
        "items": messages,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
        "room_id": room_id,
    }


async def send_message(
    db: AsyncSession,
    room_id: str,
    sender_id: str,
    data: ChatMessageCreate,
) -> ChatMessage:
    room_result = await db.execute(
        select(ChatRoom).where(ChatRoom.id == room_id, ChatRoom.is_active == True)
    )
    room = room_result.scalar_one_or_none()
    if not room:
        raise NotFoundException("Chat room not found or inactive")

    if str(room.buyer_id) != sender_id and str(room.seller_id) != sender_id:
        raise ForbiddenException("Access denied to this chat room")

    is_buyer = str(room.buyer_id) == sender_id

    message = ChatMessage(
        room_id=room_id,
        sender_id=sender_id,
        message=data.message,
        message_type=data.message_type or "text",
        attachments=data.attachments,
        is_read=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)

    if is_buyer:
        room.seller_unread = (room.seller_unread or 0) + 1
    else:
        room.buyer_unread = (room.buyer_unread or 0) + 1

    room.last_message = data.message[:200] if data.message else "[Attachment]"
    room.last_message_at = datetime.now(timezone.utc)
    room.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return message


async def mark_as_read(
    db: AsyncSession, room_id: str, user_id: str
) -> bool:
    room_result = await db.execute(
        select(ChatRoom).where(ChatRoom.id == room_id)
    )
    room = room_result.scalar_one_or_none()
    if not room:
        raise NotFoundException("Chat room not found")

    is_buyer = str(room.buyer_id) == user_id

    if is_buyer:
        room.buyer_unread = 0
    elif str(room.seller_id) == user_id:
        room.seller_unread = 0
    else:
        raise ForbiddenException("Access denied to this chat room")

    await db.execute(
        update(ChatMessage)
        .where(
            ChatMessage.room_id == room_id,
            ChatMessage.sender_id != user_id,
            ChatMessage.is_read == False,
        )
        .values(is_read=True)
    )

    room.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return True


async def get_unread_count(db: AsyncSession, user_id: str) -> int:
    seller_result = await db.execute(
        select(Seller).where(Seller.user_id == user_id)
    )
    seller = seller_result.scalar_one_or_none()

    total = 0

    buyer_count = await db.scalar(
        select(func.coalesce(func.sum(ChatRoom.buyer_unread), 0)).where(
            ChatRoom.buyer_id == user_id,
            ChatRoom.is_active == True,
        )
    )
    total += buyer_count or 0

    if seller:
        seller_count = await db.scalar(
            select(func.coalesce(func.sum(ChatRoom.seller_unread), 0)).where(
                ChatRoom.seller_id == seller.id,
                ChatRoom.is_active == True,
            )
        )
        total += seller_count or 0

    return total
