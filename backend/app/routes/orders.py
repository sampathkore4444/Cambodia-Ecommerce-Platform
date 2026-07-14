from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_current_active_user, get_db
from app.schemas.order import OrderCreate
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("")
async def create_order(
    data: OrderCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    order = await order_service.create_order(db, str(current_user.id), data)
    return success_response(data=order, message="Order created")


@router.get("")
async def get_user_orders(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await order_service.get_user_orders(
        db, str(current_user.id), page, per_page, status
    )
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.get("/{order_id}")
async def get_order(
    order_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    order = await order_service.get_order(db, str(order_id), str(current_user.id))
    return success_response(data=order, message="Order retrieved")


@router.put("/{order_id}/cancel")
async def cancel_order(
    order_id: UUID,
    reason: str = "",
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    order = await order_service.cancel_order(
        db, str(order_id), str(current_user.id), reason
    )
    return success_response(data=order, message="Order cancelled")


@router.post("/{order_id}/confirm-receipt")
async def confirm_delivery(
    order_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    order = await order_service.confirm_delivery(
        db, str(order_id), str(current_user.id)
    )
    return success_response(data=order, message="Delivery confirmed")


@router.get("/{order_id}/tracking")
async def get_order_tracking(
    order_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    tracking = await order_service.get_order_tracking(db, str(order_id), str(current_user.id))
    return success_response(data=tracking, message="Tracking retrieved")
