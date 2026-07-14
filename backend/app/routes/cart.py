from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.common.responses import success_response
from app.core.dependencies import get_current_active_user, get_db
from app.schemas.order import CartItemAdd, CartItemUpdate
from app.services import order_service

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
async def get_cart(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await order_service.get_cart(db, str(current_user.id))
    return success_response(data=cart, message="Cart retrieved")


@router.post("/items")
async def add_to_cart(
    data: CartItemAdd,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    item = await order_service.add_to_cart(db, str(current_user.id), data)
    return success_response(data=item, message="Item added to cart")


@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: UUID,
    data: CartItemUpdate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    item = await order_service.update_cart_item(
        db, str(current_user.id), str(item_id), data.quantity
    )
    return success_response(data=item, message="Cart item updated")


@router.delete("/items/{item_id}")
async def remove_from_cart(
    item_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await order_service.remove_from_cart(db, str(current_user.id), str(item_id))
    return success_response(message="Item removed from cart")


@router.delete("")
async def clear_cart(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await order_service.clear_cart(db, str(current_user.id))
    return success_response(message="Cart cleared")
