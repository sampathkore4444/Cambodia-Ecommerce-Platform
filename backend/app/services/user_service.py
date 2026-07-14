from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import (
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
)
from app.common.utils import generate_slug
from app.models.user import Seller, User, UserAddress
from app.schemas.user import AddressCreate, SellerRegister, UserUpdate


async def get_user_profile(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    return user


async def update_user_profile(
    db: AsyncSession, user_id: str, data: UserUpdate
) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    update_data = data.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != user.email:
        existing = await db.execute(
            select(User).where(User.email == update_data["email"], User.id != user_id)
        )
        if existing.scalar_one_or_none():
            raise ConflictException("Email already in use")

    if "phone" in update_data and update_data["phone"] != user.phone:
        existing = await db.execute(
            select(User).where(User.phone == update_data["phone"], User.id != user_id)
        )
        if existing.scalar_one_or_none():
            raise ConflictException("Phone number already in use")

    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(user)
    return user


async def upload_avatar(db: AsyncSession, user_id: str, file) -> str:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    url = f"/uploads/avatars/{user_id}_{int(datetime.now(timezone.utc).timestamp())}.jpg"
    user.avatar_url = url
    user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return url


async def get_user_addresses(
    db: AsyncSession, user_id: str
) -> list[UserAddress]:
    result = await db.execute(
        select(UserAddress)
        .where(UserAddress.user_id == user_id)
        .order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc())
    )
    return list(result.scalars().all())


async def create_address(
    db: AsyncSession, user_id: str, data: AddressCreate
) -> UserAddress:
    existing = await db.execute(
        select(UserAddress).where(
            UserAddress.user_id == user_id,
            UserAddress.is_default == True,
        )
    )
    has_default = existing.scalar_one_or_none() is not None

    address = UserAddress(
        user_id=user_id,
        label=data.label,
        recipient_name=data.recipient_name,
        phone=data.phone,
        province=data.province,
        district=data.district,
        commune=data.commune,
        village=data.village,
        street_address=data.street_address,
        postal_code=data.postal_code,
        is_default=data.is_default if data.is_default is not None else not has_default,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    if address.is_default:
        await db.execute(
            update(UserAddress)
            .where(UserAddress.user_id == user_id)
            .values(is_default=False)
        )

    db.add(address)
    await db.flush()
    await db.refresh(address)
    return address


async def update_address(
    db: AsyncSession, user_id: str, address_id: str, data: AddressCreate
) -> UserAddress:
    result = await db.execute(
        select(UserAddress).where(
            UserAddress.id == address_id, UserAddress.user_id == user_id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundException("Address not found")

    update_data = data.model_dump(exclude_unset=True)

    if update_data.get("is_default"):
        await db.execute(
            update(UserAddress)
            .where(UserAddress.user_id == user_id)
            .values(is_default=False)
        )

    for field, value in update_data.items():
        setattr(address, field, value)

    address.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(address)
    return address


async def delete_address(
    db: AsyncSession, user_id: str, address_id: str
) -> bool:
    result = await db.execute(
        select(UserAddress).where(
            UserAddress.id == address_id, UserAddress.user_id == user_id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundException("Address not found")

    await db.delete(address)
    await db.flush()
    return True


async def set_default_address(
    db: AsyncSession, user_id: str, address_id: str
) -> bool:
    result = await db.execute(
        select(UserAddress).where(
            UserAddress.id == address_id, UserAddress.user_id == user_id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundException("Address not found")

    await db.execute(
        update(UserAddress)
        .where(UserAddress.user_id == user_id)
        .values(is_default=False)
    )
    address.is_default = True
    address.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return True


async def register_as_seller(
    db: AsyncSession, user_id: str, data: SellerRegister
) -> Seller:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    existing = await db.execute(
        select(Seller).where(Seller.user_id == user_id)
    )
    if existing.scalar_one_or_none():
        raise ConflictException("User is already registered as a seller")

    seller = Seller(
        user_id=user_id,
        shop_name=data.shop_name,
        shop_name_kh=data.shop_name_kh,
        is_verified=False,
        is_active=True,
        rating_avg=0.0,
        rating_count=0,
        total_sales=0,
        total_revenue=0.0,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(seller)
    await db.flush()
    await db.refresh(seller)

    user.role = "seller"
    user.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return seller


async def get_seller_profile(db: AsyncSession, seller_id: str) -> Seller:
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise NotFoundException("Seller not found")
    return seller
