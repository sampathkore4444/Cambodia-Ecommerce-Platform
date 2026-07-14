from datetime import datetime, timezone
from math import ceil

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.exceptions import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.models.order import OrderItem
from app.models.product import Product
from app.models.review import Review
from app.models.user import Seller, User
from app.schemas.review import ReviewCreate, ReviewUpdate


async def create_review(
    db: AsyncSession, product_id: str, user_id: str, data: ReviewCreate
) -> Review:
    product_result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.is_active == True
        )
    )
    product = product_result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    order_item_result = await db.execute(
        select(OrderItem).where(
            OrderItem.product_id == product_id,
        )
    )
    order_item = order_item_result.scalar_one_or_none()
    if not order_item:
        raise BadRequestException(
            "You must purchase and receive this product before reviewing"
        )

    existing = await db.execute(
        select(Review).where(
            Review.product_id == product_id,
            Review.user_id == user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise ConflictException("You have already reviewed this product")

    review = Review(
        product_id=product_id,
        user_id=user_id,
        order_item_id=order_item.id,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        images=data.images or [],
        is_verified=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(review)
    await db.flush()
    await db.refresh(review)

    await _update_product_rating(db, product_id)
    return review


async def get_product_reviews(
    db: AsyncSession, product_id: str, page: int = 1, per_page: int = 20
) -> dict:
    rating_stats = await db.execute(
        select(
            func.count(Review.id),
            func.coalesce(func.avg(Review.rating), 0),
            func.sum(func.case((Review.rating == 5, 1), else_=0)),
            func.sum(func.case((Review.rating == 4, 1), else_=0)),
            func.sum(func.case((Review.rating == 3, 1), else_=0)),
            func.sum(func.case((Review.rating == 2, 1), else_=0)),
            func.sum(func.case((Review.rating == 1, 1), else_=0)),
        ).where(
            Review.product_id == product_id,
            Review.is_active == True,
        )
    )
    stats_row = rating_stats.one()
    total_reviews = stats_row[0] or 0
    avg_rating = round(float(stats_row[1]), 1) if total_reviews > 0 else 0.0

    query = (
        select(Review)
        .options(selectinload(Review.user))
        .where(
            Review.product_id == product_id,
            Review.is_active == True,
        )
        .order_by(Review.created_at.desc())
    )

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    reviews = list(result.scalars().all())

    return {
        "items": reviews,
        "total": total_reviews,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total_reviews / per_page) if total_reviews > 0 else 0,
        "rating_summary": {
            "average": avg_rating,
            "total": total_reviews,
            "distribution": {
                "5": stats_row[2] or 0,
                "4": stats_row[3] or 0,
                "3": stats_row[4] or 0,
                "2": stats_row[5] or 0,
                "1": stats_row[6] or 0,
            },
        },
    }


async def update_review(
    db: AsyncSession, review_id: str, user_id: str, data: ReviewUpdate
) -> Review:
    result = await db.execute(
        select(Review).where(Review.id == review_id, Review.user_id == user_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise NotFoundException("Review not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    review.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(review)

    await _update_product_rating(db, review.product_id)
    return review


async def delete_review(
    db: AsyncSession, review_id: str, user_id: str
) -> bool:
    result = await db.execute(
        select(Review).where(Review.id == review_id, Review.user_id == user_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise NotFoundException("Review not found")

    product_id = review.product_id
    await db.delete(review)
    await db.flush()

    await _update_product_rating(db, product_id)
    return True


async def mark_helpful(
    db: AsyncSession, review_id: str
) -> Review:
    result = await db.execute(
        select(Review).where(Review.id == review_id, Review.is_active == True)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise NotFoundException("Review not found")

    review.helpful_count = (review.helpful_count or 0) + 1
    review.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(review)
    return review


async def respond_to_review(
    db: AsyncSession, review_id: str, seller_id: str, response: str
) -> Review:
    result = await db.execute(
        select(Review)
        .join(Product, Review.product_id == Product.id)
        .where(Review.id == review_id, Product.seller_id == seller_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise NotFoundException("Review not found")

    review.seller_response = response
    review.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(review)
    return review


async def _update_product_rating(
    db: AsyncSession, product_id: str
) -> None:
    stats = await db.execute(
        select(
            func.coalesce(func.avg(Review.rating), 0),
            func.count(Review.id),
        ).where(
            Review.product_id == product_id,
            Review.is_active == True,
        )
    )
    row = stats.one()
    avg_rating = round(float(row[0]), 1)
    total_reviews = row[1] or 0

    await db.execute(
        update(Product)
        .where(Product.id == product_id)
        .values(
            rating_avg=avg_rating,
            rating_count=total_reviews,
            updated_at=datetime.now(timezone.utc),
        )
    )
    await db.flush()
