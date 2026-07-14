from datetime import datetime, timezone
from math import ceil
from typing import Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import NotFoundException
from app.models.notification import Notification as NotificationModel
from app.models.order import Order, OrderStatus


async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    title_kh: str,
    message: str,
    message_kh: str,
    notification_type: str = "system",
    reference_type: Optional[str] = None,
    reference_id: Optional[str] = None,
    action_url: Optional[str] = None,
) -> NotificationModel:
    notification = NotificationModel(
        user_id=user_id,
        title=title,
        title_kh=title_kh,
        message=message,
        message_kh=message_kh,
        type=notification_type,
        reference_type=reference_type,
        reference_id=reference_id,
        action_url=action_url,
        is_read=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    await db.flush()
    await db.refresh(notification)
    return notification


async def get_notifications(
    db: AsyncSession, user_id: str, page: int = 1, per_page: int = 20
) -> dict:
    query = (
        select(NotificationModel)
        .where(NotificationModel.user_id == user_id)
        .order_by(NotificationModel.created_at.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    notifications = list(result.scalars().all())

    return {
        "items": notifications,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def mark_as_read(
    db: AsyncSession, notification_id: str, user_id: str
) -> bool:
    result = await db.execute(
        select(NotificationModel).where(
            NotificationModel.id == notification_id,
            NotificationModel.user_id == user_id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise NotFoundException("Notification not found")

    notification.is_read = True
    await db.flush()
    return True


async def mark_all_as_read(db: AsyncSession, user_id: str) -> bool:
    await db.execute(
        update(NotificationModel)
        .where(
            NotificationModel.user_id == user_id,
            NotificationModel.is_read == False,
        )
        .values(
            is_read=True,
        )
    )
    await db.flush()
    return True


async def get_unread_count(db: AsyncSession, user_id: str) -> int:
    count = await db.scalar(
        select(func.count(NotificationModel.id)).where(
            NotificationModel.user_id == user_id,
            NotificationModel.is_read == False,
        )
    )
    return count or 0


async def send_order_notification(
    db: AsyncSession, order: Order, status: str
) -> None:
    notification_map = {
        OrderStatus.CONFIRMED: {
            "title": "Order Confirmed",
            "title_kh": "ការបញ្ជាទិញត្រូវបានបញ្ជាក់",
            "message": f"Your order #{order.order_number} has been confirmed and is being processed.",
            "message_kh": f"ការបញ្ជាទិញ #{order.order_number} របស់អ្នកត្រូវបានបញ្ជាក់រួចរាល់",
        },
        OrderStatus.PROCESSING: {
            "title": "Order Processing",
            "title_kh": "កំពុងរៀបចំការបញ្ជាទិញ",
            "message": f"Your order #{order.order_number} is now being prepared.",
            "message_kh": f"ការបញ្ជាទិញ #{order.order_number} របស់អ្នកកំពុងត្រូវបានរៀបចំ",
        },
        OrderStatus.SHIPPED: {
            "title": "Order Shipped",
            "title_kh": "ការបញ្ជាទិញត្រូវបានដឹកជញ្ជូន",
            "message": f"Your order #{order.order_number} has been shipped and is on its way!",
            "message_kh": f"ការបញ្ជាទិញ #{order.order_number} របស់អ្នកត្រូវបានដឹកជញ្ជូន",
        },
        OrderStatus.DELIVERED: {
            "title": "Order Delivered",
            "title_kh": "ការបញ្ជាទិញបានទទួល",
            "message": f"Your order #{order.order_number} has been delivered. Enjoy!",
            "message_kh": f"ការបញ្ជាទិញ #{order.order_number} របស់អ្នកបានទទួលហើយ",
        },
        OrderStatus.CANCELLED: {
            "title": "Order Cancelled",
            "title_kh": "ការបញ្ជាទិញត្រូវបានបោះបង់",
            "message": f"Your order #{order.order_number} has been cancelled.",
            "message_kh": f"ការបញ្ជាទិញ #{order.order_number} របស់អ្នកត្រូវបានបោះបង់",
        },
    }

    info = notification_map.get(status)
    if not info:
        return

    await create_notification(
        db=db,
        user_id=str(order.buyer_id),
        title=info["title"],
        title_kh=info["title_kh"],
        message=info["message"],
        message_kh=info["message_kh"],
        notification_type="order",
        reference_type="order",
        reference_id=str(order.id),
        action_url=f"/orders/{order.id}",
    )


async def register_fcm_token(
    db: AsyncSession, user_id: str, token: str
) -> bool:
    from sqlalchemy import update
    from app.models.user import User

    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(fcm_token=token)
    )
    await db.flush()
    return True
