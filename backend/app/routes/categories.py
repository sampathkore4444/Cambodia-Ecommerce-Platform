from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_db
from app.services import product_service

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
async def get_category_tree(
    db: AsyncSession = Depends(get_db),
):
    tree = await product_service.get_category_tree(db)
    return success_response(data=tree, message="Categories retrieved")


@router.get("/{category_id}")
async def get_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    category = await product_service.get_category(db, str(category_id))
    return success_response(data=category, message="Category retrieved")


@router.get("/{category_id}/products")
async def get_products_by_category(
    category_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await product_service.get_products_by_category(
        db, str(category_id), page, per_page
    )
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )
