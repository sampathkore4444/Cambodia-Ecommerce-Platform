from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.common.responses import success_response
from app.core.dependencies import get_current_active_user, get_current_seller, get_db
from app.schemas.coupon import CouponCreate, CouponValidate
from app.services import coupon_service

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.post("")
async def create_coupon(
    data: CouponCreate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    coupon = await coupon_service.create_coupon(db, str(current_user.id), data)
    return success_response(data=coupon, message="Coupon created")


@router.post("/validate")
async def validate_coupon(
    data: CouponValidate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await coupon_service.validate_coupon(
        db, data.coupon_code, str(current_user.id), data.cart_total
    )
    return success_response(data=result, message="Coupon validated")


@router.get("/seller")
async def get_seller_coupons(
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    coupons = await coupon_service.get_seller_coupons(db, str(current_user.id))
    return success_response(data=coupons, message="Seller coupons retrieved")


@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: UUID,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    await coupon_service.delete_coupon(db, str(coupon_id), str(current_user.id))
    return success_response(message="Coupon deleted")
