from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.common.responses import success_response, paginated_response
from app.common.serialization import model_to_dict
from app.core.dependencies import get_current_admin, get_db
from app.schemas.admin import AdminCategoryCreate, AdminCategoryUpdate, UserAdminAction
from app.services import admin_service
from app.services import payment_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def get_dashboard_stats(
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stats = await admin_service.get_dashboard_stats(db)
    return success_response(data=stats, message="Dashboard stats retrieved")


@router.get("/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await admin_service.get_all_users(db, page, per_page, search, role)
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.put("/users/{user_id}/ban")
async def ban_user(
    user_id: UUID,
    data: UserAdminAction,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await admin_service.ban_user(db, str(user_id), data.reason or "")
    return success_response(data=model_to_dict(user), message="User banned")


@router.put("/users/{user_id}/unban")
async def unban_user(
    user_id: UUID,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await admin_service.unban_user(db, str(user_id))
    return success_response(data=model_to_dict(user), message="User unbanned")


@router.put("/users/{user_id}/verify")
async def verify_user(
    user_id: UUID,
    current_user=Depends(get_current_admin),
    db=Depends(get_db),
):
    user = await admin_service.verify_user(db, str(user_id))
    return success_response(data=model_to_dict(user), message="User verified")


@router.get("/sellers")
async def get_all_sellers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    verified: Optional[bool] = None,
    current_user=Depends(get_current_admin),
    db=Depends(get_db),
):
    result = await admin_service.get_all_sellers(db, page, per_page, verified)
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.put("/sellers/{seller_id}/verify")
async def verify_seller(
    seller_id: UUID,
    current_user=Depends(get_current_admin),
    db=Depends(get_db),
):
    seller = await admin_service.verify_seller(db, str(seller_id))
    return success_response(data=model_to_dict(seller), message="Seller verified")


@router.get("/products")
async def get_all_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await admin_service.get_all_products(db, page, per_page, status)
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.put("/products/{product_id}/approve")
async def approve_product(
    product_id: UUID,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    product = await admin_service.approve_product(db, str(product_id))
    return success_response(data=model_to_dict(product), message="Product approved")


@router.put("/products/{product_id}/flag")
async def flag_product(
    product_id: UUID,
    reason: str = "",
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    product = await admin_service.flag_product(db, str(product_id), reason)
    return success_response(data=model_to_dict(product), message="Product flagged")


@router.get("/orders")
async def get_all_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await admin_service.get_all_orders(db, page, per_page, status)
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.get("/payments/reports")
async def get_payment_reports(
    start_date: str,
    end_date: str,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime

    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    reports = await admin_service.get_payment_reports(db, start, end)
    return success_response(data=reports, message="Payment reports retrieved")


@router.post("/categories")
async def create_category_admin(
    data: AdminCategoryCreate,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    category = await admin_service.create_category_admin(db, data)
    return success_response(data=model_to_dict(category), message="Category created")


@router.put("/categories/{category_id}")
async def update_category(
    category_id: UUID,
    data: AdminCategoryUpdate,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    category = await admin_service.update_category(db, str(category_id), data)
    return success_response(data=model_to_dict(category), message="Category updated")


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: UUID,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_category(db, str(category_id))
    return success_response(message="Category deleted")


@router.get("/disputes")
async def get_disputes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await admin_service.get_disputes(db, page, per_page)
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.put("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: UUID,
    resolution: str,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.resolve_dispute(db, str(dispute_id), resolution)
    return success_response(message="Dispute resolved")


@router.post("/orders/expire-unpaid")
async def expire_unpaid_orders(
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    count = await payment_service.expire_unpaid_orders(db)
    return success_response(data={"expired": count}, message=f"Expired {count} unpaid orders")
