from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.common.responses import success_response
from app.common.exceptions import NotFoundException, BadRequestException
from app.core.dependencies import get_current_active_user, get_db
from app.models.product import Product
from app.models.review import Wishlist

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


class WishlistAdd(BaseModel):
    product_id: UUID


@router.get("")
async def get_wishlist(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.product).selectinload(Product.images))
        .where(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
    )
    wishlists = list(result.scalars().all())
    items = [w.product for w in wishlists]
    return success_response(data=items, message="Wishlist retrieved")


@router.post("")
async def add_to_wishlist(
    data: WishlistAdd,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    product_id = data.product_id
    product_result = await db.execute(
        select(Product).where(Product.id == product_id, Product.is_active == True)
    )
    product = product_result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
    )
    if existing.scalar_one_or_none():
        raise BadRequestException("Product is already in your wishlist")

    wishlist = Wishlist(
        user_id=current_user.id,
        product_id=product_id,
    )
    db.add(wishlist)
    await db.flush()
    await db.refresh(wishlist)
    return success_response(
        data={"id": str(wishlist.id), "product_id": str(product_id)},
        message="Product added to wishlist",
    )


@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
    )
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise NotFoundException("Product not found in wishlist")

    await db.delete(wishlist)
    await db.flush()
    return success_response(message="Product removed from wishlist")
