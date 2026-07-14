from datetime import datetime, timezone
from math import ceil

from sqlalchemy import func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.common.utils import generate_order_number
from app.models.notification import Coupon
from app.models.order import CartItem, Order, OrderItem, OrderStatus, Payment, PaymentStatus
from app.models.product import Product, ProductVariant
from app.schemas.order import CartItemAdd, OrderCreate

_SHIPPING_RATES = {
    "phnom_penh": 2.0,
    "kandal": 2.5,
    "siem_reap": 3.5,
    "battambang": 3.0,
    "preah_sihanouk": 3.5,
    "kampong_cham": 3.0,
    "kampong_chhnang": 3.0,
    "kampong_speu": 3.0,
    "kampong_thom": 3.5,
    "kampot": 3.5,
    "kep": 3.5,
    "koh_kong": 4.0,
    "kratie": 3.5,
    "mundo.ulkiri": 4.5,
    "oddar_meanchey": 4.0,
    "pailin": 4.0,
    "preah_vihear": 4.0,
    "prey_veng": 3.0,
    "pursat": 3.5,
    "ratanakiri": 5.0,
    "stung_treng": 4.5,
    "svay_rieng": 3.0,
    "takeo": 3.0,
    "tboung_khmum": 3.0,
}


def _serialize_cart_item(item: CartItem) -> dict:
    product = item.product
    price = float(product.price)
    if item.variant:
        price += float(item.variant.price)
    image = None
    if product.images:
        image = product.images[0].url if hasattr(product.images[0], 'url') else str(product.images[0])
    return {
        "id": str(item.id),
        "productId": str(item.product_id),
        "variantId": str(item.variant_id) if item.variant_id else None,
        "name": product.title_kh or product.title,
        "price": round(price, 2),
        "image": image,
        "quantity": item.quantity,
        "subtotal": round(price * item.quantity, 2),
        "stock": product.stock_quantity or 0,
    }


async def add_to_cart(
    db: AsyncSession, user_id: str, data: CartItemAdd
) -> dict:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.id == data.product_id, Product.is_active == True)
        .with_for_update()
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    if data.variant_id:
        var_result = await db.execute(
            select(ProductVariant).where(
                ProductVariant.id == data.variant_id,
                ProductVariant.product_id == data.product_id,
                ProductVariant.is_active == True,
            ).with_for_update()
        )
        variant = var_result.scalar_one_or_none()
        if not variant:
            raise NotFoundException("Variant not found")
        if variant.stock_quantity is not None and variant.stock_quantity < data.quantity:
            raise BadRequestException(
                f"Insufficient stock for variant. Available: {variant.stock_quantity}"
            )
    else:
        if product.stock_quantity is not None and product.stock_quantity < data.quantity:
            raise BadRequestException(
                f"Insufficient stock. Available: {product.stock_quantity}"
            )

    existing = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.product).selectinload(Product.images))
        .where(
            CartItem.user_id == user_id,
            CartItem.product_id == data.product_id,
            CartItem.variant_id == data.variant_id,
        )
    )
    existing_item = existing.scalar_one_or_none()

    if existing_item:
        existing_item.quantity += data.quantity
        existing_item.updated_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(existing_item)
        return _serialize_cart_item(existing_item)

    item = CartItem(
        user_id=user_id,
        product_id=data.product_id,
        variant_id=data.variant_id,
        quantity=data.quantity,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)

    item_result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant),
        )
        .where(CartItem.id == item.id)
    )
    refreshed = item_result.scalar_one()
    return _serialize_cart_item(refreshed)


async def get_cart(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant),
        )
        .where(CartItem.user_id == user_id)
        .order_by(CartItem.created_at)
    )
    items = list(result.scalars().all())

    serialized = [_serialize_cart_item(item) for item in items]
    subtotal = sum(item["subtotal"] for item in serialized)
    item_count = sum(item["quantity"] for item in serialized)

    return {
        "items": serialized,
        "subtotal": round(subtotal, 2),
        "item_count": item_count,
    }


async def update_cart_item(
    db: AsyncSession, user_id: str, item_id: str, quantity: int
) -> dict:
    if quantity < 1:
        raise BadRequestException("Quantity must be at least 1")

    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant),
        )
        .where(CartItem.id == item_id, CartItem.user_id == user_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise NotFoundException("Cart item not found")

    if quantity > item.quantity:
        if item.variant_id:
            stock = item.variant.stock_quantity
            if stock is not None and stock < quantity:
                raise BadRequestException(
                    f"Insufficient stock. Available: {stock}"
                )
        else:
            stock = item.product.stock_quantity
            if stock is not None and stock < quantity:
                raise BadRequestException(
                    f"Insufficient stock. Available: {stock}"
                )

    item.quantity = quantity
    item.updated_at = datetime.now(timezone.utc)
    await db.flush()

    refreshed_result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant),
        )
        .where(CartItem.id == item.id)
    )
    refreshed = refreshed_result.scalar_one()
    return _serialize_cart_item(refreshed)


async def remove_from_cart(
    db: AsyncSession, user_id: str, item_id: str
) -> bool:
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == item_id, CartItem.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise NotFoundException("Cart item not found")

    await db.delete(item)
    await db.flush()
    return True


async def clear_cart(db: AsyncSession, user_id: str) -> bool:
    await db.execute(
        delete(CartItem).where(CartItem.user_id == user_id)
    )
    await db.flush()
    return True


async def create_order(
    db: AsyncSession, user_id: str, data: OrderCreate
) -> Order:
    if data.buy_now_product_id:
        product_result = await db.execute(
            select(Product)
            .options(selectinload(Product.images))
            .where(Product.id == data.buy_now_product_id, Product.is_active == True)
            .with_for_update()
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise NotFoundException("Product not found")

        qty = data.buy_now_quantity or 1
        if (product.stock_quantity or 0) < qty:
            raise BadRequestException(
                f"Insufficient stock for '{product.title}'. Available: {product.stock_quantity}"
            )

        price = float(product.price)
        item_total = price * qty
        subtotal = item_total

        order_items_data = [{
            "product_id": product.id,
            "product_title": product.title,
            "product_image": product.images[0].url if product.images else None,
            "variant_id": None,
            "variant_name": None,
            "quantity": qty,
            "price": round(price, 2),
            "total": round(item_total, 2),
            "seller_id": product.seller_id,
        }]

        shipping_address_dict = data.shipping_address.model_dump()
        shipping = _calculate_shipping(subtotal, data.shipping_address.province)
        discount = 0.0
        total = round(subtotal + shipping - discount, 2)

        order = Order(
            order_number=generate_order_number(),
            buyer_id=user_id,
            subtotal=round(subtotal, 2),
            shipping_cost=shipping,
            discount_amount=discount,
            total=total,
            currency="USD",
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            payment_method=data.payment_method,
            shipping_address=shipping_address_dict,
            note=data.note,
        )
        db.add(order)
        await db.flush()

        for item_data in order_items_data:
            db.add(OrderItem(order_id=order.id, **item_data))
        await db.flush()

        if data.payment_method == "cod":
            order.payment_status = PaymentStatus.PENDING
        else:
            order.payment_status = PaymentStatus.PENDING

        await db.commit()
        await db.refresh(order)
        return order

    cart_result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant),
        )
        .where(
            CartItem.user_id == user_id,
        )
    )
    cart_items = list(cart_result.scalars().all())

    if not cart_items:
        raise BadRequestException("Cart is empty")

    product_ids = list(set(
        ci.product_id for ci in cart_items if not ci.variant_id
    ))
    variant_ids = list(set(
        ci.variant_id for ci in cart_items if ci.variant_id
    ))
    if product_ids:
        await db.execute(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
    if variant_ids:
        from app.models.product import ProductVariant
        await db.execute(
            select(ProductVariant).where(ProductVariant.id.in_(variant_ids)).with_for_update()
        )

    subtotal = 0.0
    order_items_data = []

    for cart_item in cart_items:
        product = cart_item.product
        if not product.is_active:
            raise BadRequestException(
                f"Product '{product.title}' is no longer available"
            )

        price = float(product.price)
        if cart_item.variant:
            price += float(cart_item.variant.price)
            if (cart_item.variant.stock_quantity or 0) < cart_item.quantity:
                raise BadRequestException(
                    f"Insufficient stock for '{product.title}' variant. "
                    f"Available: {cart_item.variant.stock_quantity}"
                )
        else:
            if (product.stock_quantity or 0) < cart_item.quantity:
                raise BadRequestException(
                    f"Insufficient stock for '{product.title}'. "
                    f"Available: {product.stock_quantity}"
                )

        item_total = price * cart_item.quantity
        subtotal += item_total

        order_items_data.append({
            "product_id": product.id,
            "product_title": product.title,
            "product_image": product.images[0].url if product.images else None,
            "variant_id": cart_item.variant_id,
            "variant_name": cart_item.variant.name if cart_item.variant else None,
            "quantity": cart_item.quantity,
            "price": round(price, 2),
            "total": round(item_total, 2),
            "seller_id": product.seller_id,
        })

    shipping_address_dict = data.shipping_address.model_dump()
    shipping = _calculate_shipping(subtotal, data.shipping_address.province)
    discount = 0.0

    if data.coupon_code:
        discount = await _apply_coupon(
            db, data.coupon_code, user_id, subtotal
        )

    total = round(subtotal + shipping - discount, 2)

    order = Order(
        order_number=generate_order_number(),
        buyer_id=user_id,
        subtotal=round(subtotal, 2),
        shipping_cost=shipping,
        discount_amount=discount,
        total=total,
        currency="USD",
        status=OrderStatus.PENDING,
        payment_status=PaymentStatus.PENDING,
        payment_method=data.payment_method,
        shipping_address=shipping_address_dict,
        note=data.note,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(order)
    await db.flush()
    await db.refresh(order)

    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            product_title=item_data["product_title"],
            product_image=item_data["product_image"],
            variant_id=item_data["variant_id"],
            variant_name=item_data["variant_name"],
            quantity=item_data["quantity"],
            price=item_data["price"],
            total=item_data["total"],
            seller_id=item_data["seller_id"],
            status=OrderStatus.PENDING,
            created_at=datetime.now(timezone.utc),
        )
        db.add(order_item)

    for cart_item in cart_items:
        product = cart_item.product
        qty = cart_item.quantity
        if cart_item.variant:
            cart_item.variant.stock_quantity -= qty
        product.stock_quantity = (product.stock_quantity or 0) - qty
        product.sold_count = (product.sold_count or 0) + qty
        product.updated_at = datetime.now(timezone.utc)

    await _clear_user_cart(db, user_id)

    if data.coupon_code:
        coupon_result = await db.execute(
            select(Coupon).where(Coupon.code == data.coupon_code).with_for_update()
        )
        coupon = coupon_result.scalar_one_or_none()
        if coupon:
            if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
                raise BadRequestException("Coupon usage limit reached")
            coupon.used_count = (coupon.used_count or 0) + 1

    await db.flush()

    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.payments),
        )
        .where(Order.id == order.id)
    )
    return result.scalar_one()


async def get_user_orders(
    db: AsyncSession,
    user_id: str,
    page: int = 1,
    per_page: int = 20,
    status: str = None,
) -> dict:
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.buyer_id == user_id)
    )

    if status:
        query = query.where(Order.status == status)

    query = query.order_by(Order.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    orders = list(result.scalars().all())

    return {
        "items": orders,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def get_order(
    db: AsyncSession, order_id: str, user_id: str
) -> Order:
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.payments),
        )
        .where(Order.id == order_id, Order.buyer_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order not found")
    return order


async def cancel_order(
    db: AsyncSession, order_id: str, user_id: str, reason: str
) -> Order:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.buyer_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order not found")

    if order.status not in (
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
    ):
        raise BadRequestException(
            f"Cannot cancel order in '{order.status}' status"
        )

    order.status = OrderStatus.CANCELLED
    order.cancel_reason = reason
    order.cancelled_at = datetime.now(timezone.utc)
    order.updated_at = datetime.now(timezone.utc)

    product_ids = [item.product_id for item in order.items]
    variant_ids = [item.variant_id for item in order.items if item.variant_id]

    if product_ids:
        products_result = await db.execute(
            select(Product).where(Product.id.in_(product_ids))
        )
        products_map = {str(p.id): p for p in products_result.scalars().all()}

        product_qty_delta: dict[str, int] = {}
        for item in order.items:
            pid = str(item.product_id)
            product_qty_delta[pid] = product_qty_delta.get(pid, 0) + item.quantity

        now = datetime.now(timezone.utc)
        for pid, delta in product_qty_delta.items():
            product = products_map.get(pid)
            if product:
                product.stock_quantity = (product.stock_quantity or 0) + delta
                product.sold_count = max(0, (product.sold_count or 0) - delta)
                product.updated_at = now

    if variant_ids:
        variants_result = await db.execute(
            select(ProductVariant).where(ProductVariant.id.in_(variant_ids))
        )
        variants_map = {str(v.id): v for v in variants_result.scalars().all()}

        variant_qty_delta: dict[str, int] = {}
        for item in order.items:
            if item.variant_id:
                vid = str(item.variant_id)
                variant_qty_delta[vid] = variant_qty_delta.get(vid, 0) + item.quantity

        for vid, delta in variant_qty_delta.items():
            variant = variants_map.get(vid)
            if variant:
                variant.stock_quantity = (variant.stock_quantity or 0) + delta

    for item in order.items:
        item.status = OrderStatus.CANCELLED

    await db.flush()
    return order


async def confirm_delivery(
    db: AsyncSession, order_id: str, user_id: str
) -> Order:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.buyer_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order not found")

    if order.status != OrderStatus.SHIPPED:
        raise BadRequestException(
            "Order must be in 'shipped' status to confirm delivery"
        )

    order.status = OrderStatus.DELIVERED
    order.delivered_at = datetime.now(timezone.utc)
    order.updated_at = datetime.now(timezone.utc)

    for item in order.items:
        item.status = OrderStatus.DELIVERED

    await db.flush()
    return order


async def get_order_tracking(db: AsyncSession, order_id: str, user_id: str = None) -> dict:
    query = select(Order).where(Order.id == order_id)
    if user_id:
        query = query.where(Order.buyer_id == user_id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order not found")

    status_order = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
    ]
    status_labels = {
        OrderStatus.PENDING: ("Order Placed", "បានបញ្ជាទិញ"),
        OrderStatus.CONFIRMED: ("Order Confirmed", "បានបញ្ជាក់"),
        OrderStatus.PROCESSING: ("Processing", "កំពុងរៀបចំ"),
        OrderStatus.SHIPPED: ("Shipped", "បានដឹកជញ្ជូន"),
        OrderStatus.DELIVERED: ("Delivered", "បានទទួល"),
    }

    current_index = status_order.index(order.status) if order.status in status_order else -1

    tracking = []
    for i, s in enumerate(status_order):
        label_en, label_kh = status_labels[s]
        completed = i <= current_index and order.status != OrderStatus.CANCELLED
        tracking.append({
            "status": s,
            "label": label_en,
            "label_kh": label_kh,
            "completed": completed,
        })

    if order.status == OrderStatus.CANCELLED:
        tracking.append(
            {
                "status": OrderStatus.CANCELLED,
                "label": "Cancelled",
                "label_kh": "បានបោះបង់",
                "timestamp": order.cancelled_at.isoformat() if order.cancelled_at else None,
                "reason": order.cancel_reason,
                "completed": True,
            }
        )

    return {
        "order_number": order.order_number,
        "current_status": order.status,
        "tracking": tracking,
    }


async def get_seller_orders(
    db: AsyncSession,
    seller_id: str,
    page: int = 1,
    per_page: int = 20,
    status: str = None,
) -> dict:
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.items.any(OrderItem.seller_id == seller_id))
    )

    if status:
        query = query.where(Order.status == status)

    query = query.order_by(Order.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    orders = list(result.scalars().all())

    return {
        "items": orders,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def update_order_item_status(
    db: AsyncSession,
    order_id: str,
    seller_id: str,
    item_id: str,
    status: str,
) -> OrderItem:
    valid_transitions = {
        OrderStatus.PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        OrderStatus.CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
        OrderStatus.PROCESSING: [OrderStatus.SHIPPED],
        OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
    }

    result = await db.execute(
        select(OrderItem).where(
            OrderItem.id == item_id,
            OrderItem.order_id == order_id,
            OrderItem.seller_id == seller_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise NotFoundException("Order item not found")

    allowed = valid_transitions.get(item.status, [])
    if status not in allowed:
        raise BadRequestException(
            f"Cannot transition from '{item.status}' to '{status}'"
        )

    item.status = status

    all_items_result = await db.execute(
        select(OrderItem.status).where(OrderItem.order_id == order_id)
    )
    item_statuses = {row[0] for row in all_items_result.all()}

    if len(item_statuses) == 1:
        single_status = item_statuses.pop()
        order_result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = order_result.scalar_one_or_none()

        if order:
            now = datetime.now(timezone.utc)
            status_map = {
                (OrderStatus.CONFIRMED, OrderStatus.PENDING): OrderStatus.CONFIRMED,
                (None, OrderStatus.PROCESSING): OrderStatus.PROCESSING,
                (None, OrderStatus.SHIPPED): OrderStatus.SHIPPED,
                (None, OrderStatus.DELIVERED): OrderStatus.DELIVERED,
            }
            new_status = status_map.get(
                (single_status if single_status != OrderStatus.CONFIRMED else None, single_status)
            )
            if single_status == OrderStatus.CONFIRMED and order.status == OrderStatus.PENDING:
                order.status = OrderStatus.CONFIRMED
            elif single_status in (OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED):
                order.status = single_status
            order.updated_at = now

    await db.flush()
    await db.refresh(item)
    return item


def _calculate_shipping(subtotal: float, province: str) -> float:
    normalized = province.lower().replace(" ", "_").replace("-", "_")
    base_rate = _SHIPPING_RATES.get(normalized, 4.0)

    if subtotal >= 50:
        return 0.0
    if subtotal >= 30:
        return round(base_rate * 0.5, 2)

    return round(base_rate, 2)


async def _apply_coupon(
    db: AsyncSession, coupon_code: str, user_id: str, subtotal: float
) -> float:
    result = await db.execute(
        select(Coupon).where(
            Coupon.code == coupon_code,
            Coupon.is_active == True,
        )
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        return 0.0

    now = datetime.now(timezone.utc)
    if coupon.start_date and now < coupon.start_date:
        return 0.0
    if coupon.end_date and now > coupon.end_date:
        return 0.0
    if coupon.usage_limit and (coupon.used_count or 0) >= coupon.usage_limit:
        return 0.0
    if subtotal < (coupon.min_order_amount or 0):
        return 0.0

    if coupon.discount_type == "percentage":
        discount = subtotal * (coupon.discount_value / 100)
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = coupon.discount_value

    return round(min(discount, subtotal), 2)


async def _clear_user_cart(db: AsyncSession, user_id: str) -> None:
    await db.execute(
        delete(CartItem).where(CartItem.user_id == user_id)
    )
