from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_db
from app.services import product_service

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
async def search_products(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await product_service.search_products(db, q, page, per_page)
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.get("/suggestions")
async def search_suggestions(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    result = await product_service.search_products(db, q, page=1, per_page=5)
    suggestions = [item.title for item in result["items"]]
    return success_response(data=suggestions, message="Suggestions retrieved")


@router.get("/popular")
async def popular_searches():
    popular = [
        "t-shirt",
        "phone case",
        "sneakers",
        "backpack",
        "krama",
        "silk scarf",
    ]
    return success_response(data=popular, message="Popular searches retrieved")
