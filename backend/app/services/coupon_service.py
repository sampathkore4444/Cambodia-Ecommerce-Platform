from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.models.notification import Coupon
from app.models.user import Seller
from app.schemas.coupon import CouponCreate


async def create_coupon(
    db: AsyncSession, seller_id: str, data: CouponCreate
) -> Coupon:
    seller_result = await db.execute(
        select(Seller).where(Seller.id == seller_id)
    )
    if not seller_result.scalar_one_or_none():
        raise NotFoundException("Seller not found")

    existing = await db.execute(
        select(Coupon).where(Coupon.code == data.code.upper())
    )
    if existing.scalar_one_or_none():
        raise BadRequestException("Coupon code already exists")

    coupon = Coupon(
        seller_id=seller_id,
        code=data.code.upper(),
        description=data.description,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        max_discount=data.max_discount,
        min_order_amount=data.min_order_amount or 0,
        usage_limit=data.usage_limit,
        used_count=0,
        per_user_limit=data.per_user_limit or 1,
        start_date=data.start_date,
        end_date=data.end_date,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(coupon)
    await db.flush()
    await db.refresh(coupon)
    return coupon


async def validate_coupon(
    db: AsyncSession, coupon_code: str, user_id: str, cart_total: float
) -> dict:
    result = await db.execute(
        select(Coupon).where(
            Coupon.code == coupon_code.upper(),
            Coupon.is_active == True,
        )
    )
    coupon = result.scalar_one_or_none()

    if not coupon:
        return {
            "valid": False,
            "message": "Invalid coupon code",
            "message_kh": "លេខកូដបញ្ចុះតម្លៃមិនត្រឹមត្រូវ",
        }

    now = datetime.now(timezone.utc)

    if coupon.start_date and now < coupon.start_date:
        return {
            "valid": False,
            "message": "Coupon is not yet valid",
            "message_kh": "កូដបញ្ចុះតម្លៃមិនទាន់អាចប្រើបានទេ",
        }

    if coupon.end_date and now > coupon.end_date:
        return {
            "valid": False,
            "message": "Coupon has expired",
            "message_kh": "កូដបញ្ចុះតម្លៃផុតសុពលភាព",
        }

    if coupon.usage_limit and (coupon.used_count or 0) >= coupon.usage_limit:
        return {
            "valid": False,
            "message": "Coupon usage limit reached",
            "message_kh": "កូដបញ្ចុះតម្លៃត្រូវបានប្រើប្រាស់អស់",
        }

    if cart_total < (coupon.min_order_amount or 0):
        return {
            "valid": False,
            "message": f"Minimum order amount of ${coupon.min_order_amount:.2f} required",
            "message_kh": f"តម្លៃកម្ម៉ង់អប្បបរមា ${coupon.min_order_amount:.2f}",
        }

    if coupon.discount_type == "percentage":
        discount = cart_total * (coupon.discount_value / 100)
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = coupon.discount_value

    discount = min(discount, cart_total)

    return {
        "valid": True,
        "coupon": coupon,
        "discount": round(discount, 2),
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value,
        "message": "Coupon applied successfully",
        "message_kh": "បានអនុវត្តកូដបញ្ចុះតម្លៃដោយជោគជ័យ",
    }


async def apply_coupon(
    db: AsyncSession, coupon_code: str, user_id: str
) -> bool:
    result = await db.execute(
        select(Coupon).where(
            Coupon.code == coupon_code.upper(),
            Coupon.is_active == True,
        )
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise BadRequestException("Invalid coupon code")

    coupon.used_count = (coupon.used_count or 0) + 1
    coupon.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return True


async def get_seller_coupons(
    db: AsyncSession, seller_id: str
) -> list:
    result = await db.execute(
        select(Coupon)
        .where(Coupon.seller_id == seller_id)
        .order_by(Coupon.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_coupon(
    db: AsyncSession, coupon_id: str, seller_id: str
) -> bool:
    result = await db.execute(
        select(Coupon).where(
            Coupon.id == coupon_id,
            Coupon.seller_id == seller_id,
        )
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise NotFoundException("Coupon not found")

    coupon.is_active = False
    coupon.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return True
