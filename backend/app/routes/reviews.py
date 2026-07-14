from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_current_active_user, get_current_seller, get_db
from app.schemas.review import ReviewCreate, ReviewUpdate
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/product/{product_id}")
async def get_product_reviews(
    product_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await review_service.get_product_reviews(
        db, str(product_id), page, per_page
    )
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.post("/product/{product_id}")
async def create_review(
    product_id: UUID,
    data: ReviewCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    review = await review_service.create_review(
        db, str(product_id), str(current_user.id), data
    )
    return success_response(data=review, message="Review created")


@router.put("/{review_id}")
async def update_review(
    review_id: UUID,
    data: ReviewUpdate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    review = await review_service.update_review(
        db, str(review_id), str(current_user.id), data
    )
    return success_response(data=review, message="Review updated")


@router.delete("/{review_id}")
async def delete_review(
    review_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await review_service.delete_review(db, str(review_id), str(current_user.id))
    return success_response(message="Review deleted")


@router.post("/{review_id}/helpful")
async def mark_helpful(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    review = await review_service.mark_helpful(db, str(review_id))
    return success_response(data=review, message="Marked as helpful")


@router.post("/{review_id}/respond")
async def respond_to_review(
    review_id: UUID,
    response: str,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    review = await review_service.respond_to_review(
        db, str(review_id), str(current_user.id), response
    )
    return success_response(data=review, message="Response added")
