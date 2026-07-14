from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_current_active_user, get_current_seller, get_db
from app.schemas.order import OrderStatusUpdate
from app.schemas.user import SellerRegister, UserUpdate
from app.services import order_service, product_service, user_service

router = APIRouter(prefix="/seller", tags=["Seller"])


@router.post("/register")
async def register_as_seller(
    data: SellerRegister,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    seller = await user_service.register_as_seller(
        db, str(current_user.id), data
    )
    return success_response(data=seller, message="Seller registration submitted")


@router.get("/dashboard")
async def get_seller_dashboard(
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    products = await product_service.get_seller_products(
        db, str(current_user.id), page=1, per_page=5
    )
    orders = await order_service.get_seller_orders(
        db, str(current_user.id), page=1, per_page=5
    )
    return success_response(
        data={
            "recent_products": products["items"],
            "total_products": products["total"],
            "recent_orders": orders["items"],
            "total_orders": orders["total"],
        },
        message="Seller dashboard retrieved",
    )


@router.get("/products")
async def get_seller_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    result = await product_service.get_seller_products(
        db, str(current_user.id), page, per_page
    )
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.get("/orders")
async def get_seller_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    result = await order_service.get_seller_orders(
        db, str(current_user.id), page, per_page, status
    )
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.put("/orders/{order_id}/items/{item_id}/status")
async def update_order_item_status(
    order_id: UUID,
    item_id: UUID,
    data: OrderStatusUpdate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    item = await order_service.update_order_item_status(
        db, str(order_id), str(current_user.id), str(item_id), data.status
    )
    return success_response(data=item, message="Order item status updated")


@router.put("/shop")
async def update_shop_profile(
    data: UserUpdate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.update_user_profile(
        db, str(current_user.id), data
    )
    return success_response(data=user, message="Shop profile updated")


@router.get("/analytics")
async def get_seller_analytics(
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    products = await product_service.get_seller_products(
        db, str(current_user.id), page=1, per_page=100
    )
    orders = await order_service.get_seller_orders(
        db, str(current_user.id), page=1, per_page=100
    )
    return success_response(
        data={
            "total_products": products["total"],
            "total_orders": orders["total"],
            "products": products["items"],
            "orders": orders["items"],
        },
        message="Seller analytics retrieved",
    )
