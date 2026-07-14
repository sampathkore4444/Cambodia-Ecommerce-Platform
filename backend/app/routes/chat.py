from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_current_active_user, get_db
from app.schemas.chat import ChatMessageCreate, ChatRoomCreate
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/rooms")
async def get_chat_rooms(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    rooms = await chat_service.get_chat_rooms(
        db, str(current_user.id), current_user.role
    )
    return success_response(data=rooms, message="Chat rooms retrieved")


@router.post("/rooms")
async def create_chat_room(
    data: ChatRoomCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    room = await chat_service.create_chat_room(db, str(current_user.id), data)
    return success_response(data=room, message="Chat room created")


@router.get("/rooms/{room_id}/messages")
async def get_messages(
    room_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await chat_service.get_messages(
        db, str(room_id), str(current_user.id), page, per_page
    )
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.post("/rooms/{room_id}/messages")
async def send_message(
    room_id: UUID,
    data: ChatMessageCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    message = await chat_service.send_message(
        db, str(room_id), str(current_user.id), data
    )
    return success_response(data=message, message="Message sent")


@router.put("/rooms/{room_id}/read")
async def mark_as_read(
    room_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await chat_service.mark_as_read(db, str(room_id), str(current_user.id))
    return success_response(message="Messages marked as read")


@router.get("/unread")
async def get_unread_count(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    count = await chat_service.get_unread_count(db, str(current_user.id))
    return success_response(data={"unread_count": count}, message="Unread count retrieved")
