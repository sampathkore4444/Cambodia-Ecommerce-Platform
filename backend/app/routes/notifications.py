from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_current_active_user, get_db
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await notification_service.get_notifications(
        db, str(current_user.id), page, per_page
    )
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await notification_service.mark_as_read(
        db, str(notification_id), str(current_user.id)
    )
    return success_response(message="Notification marked as read")


@router.put("/read-all")
async def mark_all_as_read(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await notification_service.mark_all_as_read(db, str(current_user.id))
    return success_response(message="All notifications marked as read")


@router.get("/unread-count")
async def get_unread_count(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    count = await notification_service.get_unread_count(db, str(current_user.id))
    return success_response(data={"unread_count": count}, message="Unread count retrieved")


@router.post("/register-device")
async def register_fcm_token(
    token: str,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await notification_service.register_fcm_token(db, str(current_user.id), token)
    return success_response(message="Device registered")
