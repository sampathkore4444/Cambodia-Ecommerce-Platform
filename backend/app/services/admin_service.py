from datetime import datetime, timedelta, timezone
from math import ceil
from typing import Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.exceptions import (
    BadRequestException,
    ConflictException,
    NotFoundException,
)
from app.common.serialization import model_to_dict, serialize_items
from app.common.utils import generate_slug
from app.models.notification import Coupon
from app.models.order import Order, OrderItem, Payment
from app.models.product import Category, Product
from app.models.review import Review
from app.models.user import Seller, User


from app.models.order import OrderStatus, PaymentStatus


async def get_dashboard_stats(db: AsyncSession) -> dict:
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_sellers = await db.scalar(select(func.count(Seller.id))) or 0
    total_products = await db.scalar(
        select(func.count(Product.id)).where(Product.is_active == True)
    ) or 0
    total_orders = await db.scalar(select(func.count(Order.id))) or 0

    revenue_result = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.status.in_([
                OrderStatus.DELIVERED,
                OrderStatus.SHIPPED,
                OrderStatus.CONFIRMED,
            ])
        )
    ) or 0.0

    recent_orders_result = await db.execute(
        select(Order)
        .options(selectinload(Order.buyer), selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    recent_orders = serialize_items(list(recent_orders_result.scalars().unique().all()))

    top_products_result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.is_active == True)
        .order_by(Product.sold_count.desc())
        .limit(10)
    )
    top_products = serialize_items(list(top_products_result.scalars().unique().all()))

    new_users_30d = await db.scalar(
        select(func.count(User.id)).where(User.created_at >= thirty_days_ago)
    ) or 0

    orders_30d = await db.scalar(
        select(func.count(Order.id)).where(Order.created_at >= thirty_days_ago)
    ) or 0

    revenue_30d = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.created_at >= thirty_days_ago,
            Order.status.in_([
                OrderStatus.DELIVERED,
                OrderStatus.SHIPPED,
                OrderStatus.CONFIRMED,
            ]),
        )
    ) or 0.0

    pending_orders = await db.scalar(
        select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING)
    ) or 0

    low_stock = await db.scalar(
        select(func.count(Product.id)).where(
            Product.is_active == True, Product.stock_quantity <= 5
        )
    ) or 0

    pending_products = await db.scalar(
        select(func.count(Product.id)).where(Product.is_active == False)
    ) or 0

    pending_sellers = await db.scalar(
        select(func.count(Seller.id)).where(Seller.is_verified == False)
    ) or 0

    return {
        "total_users": total_users,
        "total_sellers": total_sellers,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(float(revenue_result), 2),
        "new_users_30d": new_users_30d,
        "orders_30d": orders_30d,
        "revenue_30d": round(float(revenue_30d), 2),
        "pending_orders": pending_orders,
        "pending_products": pending_products,
        "pending_sellers": pending_sellers,
        "low_stock_products": low_stock,
        "recent_orders": recent_orders,
        "top_products": top_products,
    }


async def get_all_users(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
) -> dict:
    query = select(User)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            User.full_name.ilike(search_term)
            | User.email.ilike(search_term)
            | User.phone.ilike(search_term)
        )
    if role:
        query = query.where(User.role == role)

    query = query.order_by(User.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    users = serialize_items(list(result.scalars().all()))

    return {
        "items": users,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def ban_user(db: AsyncSession, user_id: str, reason: str) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    if not user.is_active:
        raise BadRequestException("User is already banned")

    user.is_active = False
    user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(user)
    return model_to_dict(user)


async def unban_user(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    if user.is_active:
        raise BadRequestException("User is not banned")

    user.is_active = True
    user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(user)
    return model_to_dict(user)


async def verify_user(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    user.is_verified = True
    user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(user)
    return model_to_dict(user)


async def get_all_sellers(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 20,
    verified: Optional[bool] = None,
) -> dict:
    query = select(Seller).options(selectinload(Seller.user))

    if verified is not None:
        query = query.where(Seller.is_verified == verified)

    query = query.order_by(Seller.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    sellers = serialize_items(list(result.scalars().unique().all()))

    return {
        "items": sellers,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def verify_seller(db: AsyncSession, seller_id: str) -> dict:
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise NotFoundException("Seller not found")

    seller.is_verified = True
    seller.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(seller)

    if seller.user_id:
        user_result = await db.execute(select(User).where(User.id == seller.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user.is_verified = True
            user.updated_at = datetime.now(timezone.utc)

    await db.flush()
    return model_to_dict(seller)


async def get_all_products(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 20,
    status: Optional[str] = None,
) -> dict:
    query = select(Product).options(
        selectinload(Product.seller),
        selectinload(Product.category),
    )

    if status == "active":
        query = query.where(Product.is_active == True)
    elif status == "inactive":
        query = query.where(Product.is_active == False)

    query = query.order_by(Product.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    products = serialize_items(list(result.scalars().unique().all()))

    return {
        "items": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def approve_product(db: AsyncSession, product_id: str) -> dict:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    product.is_active = True
    product.status = "active"
    product.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(product)
    return model_to_dict(product)


async def flag_product(db: AsyncSession, product_id: str, reason: str) -> dict:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    product.is_active = False
    product.status = "paused"
    product.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(product)
    return model_to_dict(product)


async def get_all_orders(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 20,
    status: Optional[str] = None,
) -> dict:
    query = select(Order).options(
        selectinload(Order.buyer),
        selectinload(Order.items),
    )

    if status:
        query = query.where(Order.status == status)

    query = query.order_by(Order.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    orders = serialize_items(list(result.scalars().unique().all()))

    return {
        "items": orders,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def get_payment_reports(
    db: AsyncSession, start_date: datetime, end_date: datetime
) -> dict:
    total_revenue = await db.scalar(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
            Payment.status == PaymentStatus.PAID,
        )
    ) or 0.0

    total_transactions = await db.scalar(
        select(func.count(Payment.id)).where(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
        )
    ) or 0

    completed = await db.scalar(
        select(func.count(Payment.id)).where(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
            Payment.status == PaymentStatus.PAID,
        )
    ) or 0

    failed = await db.scalar(
        select(func.count(Payment.id)).where(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
            Payment.status == PaymentStatus.FAILED,
        )
    ) or 0

    refunded = await db.scalar(
        select(func.count(Payment.id)).where(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
            Payment.status == PaymentStatus.REFUNDED,
        )
    ) or 0

    method_breakdown_result = await db.execute(
        select(
            Payment.method,
            func.count(Payment.id),
            func.coalesce(func.sum(Payment.amount), 0),
        )
        .where(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
        )
        .group_by(Payment.method)
    )
    method_breakdown = [
        {
            "method": row[0],
            "count": row[1],
            "total": round(float(row[2]), 2),
        }
        for row in method_breakdown_result.all()
    ]

    return {
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
        },
        "total_revenue": round(float(total_revenue), 2),
        "total_transactions": total_transactions,
        "completed": completed,
        "failed": failed,
        "refunded": refunded,
        "success_rate": round(
            (completed / total_transactions * 100) if total_transactions > 0 else 0,
            1,
        ),
        "method_breakdown": method_breakdown,
    }


async def create_category_admin(db: AsyncSession, data) -> dict:
    if data.parent_id:
        parent_result = await db.execute(
            select(Category).where(Category.id == data.parent_id)
        )
        if not parent_result.scalar_one_or_none():
            raise NotFoundException("Parent category not found")

    existing = await db.execute(
        select(Category).where(Category.slug == generate_slug(data.name))
    )
    if existing.scalar_one_or_none():
        raise ConflictException("Category with this name already exists")

    category = Category(
        name=data.name,
        name_kh=data.name_kh,
        slug=generate_slug(data.name),
        description=data.description,
        icon_url=data.icon_url,
        image_url=data.image_url,
        commission_rate=data.commission_rate or 5.0,
        parent_id=data.parent_id,
        sort_order=data.sort_order or 0,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return model_to_dict(category)


async def update_category(db: AsyncSession, category_id: str, data) -> dict:
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise NotFoundException("Category not found")

    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != category.name:
        update_data["slug"] = generate_slug(update_data["name"])

    if "parent_id" in update_data and update_data["parent_id"]:
        if update_data["parent_id"] == category_id:
            raise BadRequestException("Category cannot be its own parent")
        parent_result = await db.execute(
            select(Category).where(Category.id == update_data["parent_id"])
        )
        if not parent_result.scalar_one_or_none():
            raise NotFoundException("Parent category not found")

    for field, value in update_data.items():
        setattr(category, field, value)

    category.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(category)
    return model_to_dict(category)


async def delete_category(db: AsyncSession, category_id: str) -> bool:
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise NotFoundException("Category not found")

    children = await db.execute(
        select(Category).where(Category.parent_id == category_id)
    )
    if children.scalar_one_or_none():
        raise BadRequestException(
            "Cannot delete category with subcategories. Move or delete them first."
        )

    products = await db.execute(
        select(Product).where(Product.category_id == category_id)
    )
    if products.scalar_one_or_none():
        raise BadRequestException(
            "Cannot delete category with associated products. Reassign them first."
        )

    category.is_active = False
    category.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return True


async def get_disputes(
    db: AsyncSession, page: int = 1, per_page: int = 20
) -> dict:
    return {
        "items": [],
        "total": 0,
        "page": page,
        "per_page": per_page,
        "pages": 0,
        "message": "Dispute management not yet implemented",
    }


async def resolve_dispute(
    db: AsyncSession, dispute_id: str, resolution: str
) -> bool:
    raise NotImplementedError("Dispute resolution not yet implemented")
