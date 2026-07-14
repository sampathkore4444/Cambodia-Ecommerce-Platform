from datetime import datetime, timezone, timedelta
import logging
import os

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    PaymentException,
)
from app.core.config import settings
from app.models.order import (
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PaymentStatus,
)
from app.schemas.payment import PaymentInit
from app.services.payment_gateways import ABAPayGateway, PiPayGateway, WingGateway

logger = logging.getLogger(__name__)

UNPAID_ORDER_EXPIRY_MINUTES = 30
COD_ORDER_EXPIRY_HOURS = 24

_gateway_registry = {
    "aba": ABAPayGateway(),
    "wing": WingGateway(),
    "pipay": PiPayGateway(),
}


def _get_gateway(name: str):
    return _gateway_registry.get(name)


async def initiate_payment(
    db: AsyncSession, order_id: str, user_id: str, data: PaymentInit
) -> dict:
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.buyer_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order not found")

    if order.status != OrderStatus.PENDING:
        raise BadRequestException(
            f"Cannot initiate payment for order in '{order.status}' status"
        )

    existing = await db.execute(
        select(Payment).where(
            Payment.order_id == order_id,
            Payment.status.in_([PaymentStatus.PENDING]),
        )
    )
    if existing.scalar_one_or_none():
        raise BadRequestException("A payment is already being processed for this order")

    payment = Payment(
        order_id=order_id,
        method=data.method,
        amount=order.total,
        currency=order.currency,
        status=PaymentStatus.PENDING,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    payment_url = None

    if data.method == "cod":
        payment.provider = "cod"
        payment.transaction_id = f"COD_{order.order_number}"
        order.payment_method = "cod"
        payment.status = PaymentStatus.PENDING

    elif data.method == "aba":
        payment.provider = "aba"
        payment.transaction_id = f"ABA_{order.order_number}"
        order.payment_method = "aba"
        payment_url = await _initiate_gateway_payment("aba", order, payment)

    elif data.method == "wing":
        payment.provider = "wing"
        payment.transaction_id = f"WING_{order.order_number}"
        order.payment_method = "wing"
        payment_url = await _initiate_gateway_payment("wing", order, payment)

    elif data.method == "pipay":
        payment.provider = "pipay"
        payment.transaction_id = f"PIPAY_{order.order_number}"
        order.payment_method = "pipay"
        payment_url = await _initiate_gateway_payment("pipay", order, payment)

    elif data.method == "truemoney":
        payment.provider = "truemoney"
        payment.transaction_id = f"TM_{order.order_number}"
        order.payment_method = "truemoney"

    elif data.method == "card":
        payment.provider = "card"
        payment.transaction_id = f"CARD_{order.order_number}"
        order.payment_method = "card"

    else:
        raise BadRequestException(f"Unsupported payment method: {data.method}")

    order.updated_at = datetime.now(timezone.utc)
    db.add(payment)
    await db.flush()
    await db.refresh(payment)

    return {
        "id": str(payment.id),
        "orderId": str(payment.order_id),
        "method": payment.method,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "status": payment.status,
        "transactionId": payment.transaction_id,
        "paymentUrl": payment_url,
        "createdAt": payment.created_at.isoformat(),
    }


async def process_payment_callback(
    db: AsyncSession, provider: str, callback_data: dict
) -> Payment:
    txn_id = callback_data.get("transaction_id") or callback_data.get("txn_id")
    if not txn_id:
        raise BadRequestException("Missing transaction ID in callback")

    result = await db.execute(
        select(Payment).where(
            Payment.transaction_id == txn_id,
            Payment.provider == provider.lower(),
        )
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("Payment not found for this transaction")

    if payment.status == PaymentStatus.PAID:
        logger.info("Payment %s already processed, skipping", txn_id)
        return payment

    status = callback_data.get("status", "failed").lower()
    if status in ("success", "completed", "paid"):
        payment.status = PaymentStatus.PAID
        payment.paid_at = datetime.now(timezone.utc)

        order_result = await db.execute(
            select(Order).where(Order.id == payment.order_id)
        )
        order = order_result.scalar_one_or_none()
        if order:
            order.status = OrderStatus.CONFIRMED
            order.payment_status = PaymentStatus.PAID
            order.updated_at = datetime.now(timezone.utc)

            await db.execute(
                update(OrderItem)
                .where(OrderItem.order_id == order.id)
                .values(status=OrderStatus.CONFIRMED)
            )

    elif status == "pending":
        payment.status = PaymentStatus.PENDING

    elif status in ("failed", "cancelled", "expired"):
        payment.status = PaymentStatus.FAILED

    else:
        payment.status = PaymentStatus.FAILED

    payment.payment_data = {k: v for k, v in callback_data.items() if k not in ("card_number", "cvv", "pin")}
    payment.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(payment)
    return payment


async def check_payment_status(
    db: AsyncSession, payment_id: str, user_id: str
) -> dict:
    result = await db.execute(
        select(Payment)
        .join(Order, Payment.order_id == Order.id)
        .where(Payment.id == payment_id, Order.buyer_id == user_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("Payment not found")
    return {
        "id": str(payment.id),
        "status": payment.status,
        "transactionId": payment.transaction_id,
        "paidAt": payment.paid_at.isoformat() if payment.paid_at else None,
    }


async def request_refund(
    db: AsyncSession, payment_id: str, user_id: str, reason: str
) -> dict:
    result = await db.execute(
        select(Payment)
        .join(Order, Payment.order_id == Order.id)
        .where(Payment.id == payment_id, Order.buyer_id == user_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("Payment not found")

    if payment.status != PaymentStatus.PAID:
        raise BadRequestException("Only paid payments can be refunded")

    payment.status = PaymentStatus.REFUNDED
    payment.refund_reason = reason
    payment.refund_amount = payment.amount
    payment.updated_at = datetime.now(timezone.utc)

    order_result = await db.execute(
        select(Order).where(Order.id == payment.order_id)
    )
    order = order_result.scalar_one_or_none()
    if order:
        order.status = OrderStatus.REFUNDED
        order.payment_status = PaymentStatus.REFUNDED
        order.cancel_reason = f"Payment refunded: {reason}"
        order.cancelled_at = datetime.now(timezone.utc)
        order.updated_at = datetime.now(timezone.utc)

        await _restore_stock(db, order)

    await db.flush()
    await db.refresh(payment)
    return {
        "id": str(payment.id),
        "status": payment.status,
        "refundAmount": float(payment.refund_amount),
    }


async def get_payment_by_order(
    db: AsyncSession, order_id: str
) -> Payment:
    result = await db.execute(
        select(Payment)
        .where(Payment.order_id == order_id)
        .order_by(Payment.created_at.desc())
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("No payment found for this order")
    return payment


async def handle_cod_payment(
    db: AsyncSession, order_id: str
) -> Payment:
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order not found")

    if order.payment_method != "cod":
        raise BadRequestException("Order is not using COD payment")

    existing = await db.execute(
        select(Payment).where(
            Payment.order_id == order_id,
            Payment.method == "cod",
        )
    )
    payment = existing.scalar_one_or_none()

    if payment:
        return payment

    payment = Payment(
        order_id=order_id,
        method="cod",
        provider="cod",
        amount=order.total,
        currency=order.currency,
        status=PaymentStatus.PENDING,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(payment)
    await db.flush()
    await db.refresh(payment)
    return payment


async def expire_unpaid_orders(db: AsyncSession) -> int:
    expiry_cutoff = datetime.now(timezone.utc) - timedelta(minutes=UNPAID_ORDER_EXPIRY_MINUTES)

    result = await db.execute(
        select(Order).where(
            Order.status == OrderStatus.PENDING,
            Order.payment_method != "cod",
            Order.created_at < expiry_cutoff,
        )
    )
    expired_orders = list(result.scalars().all())

    count = 0
    for order in expired_orders:
        order.status = OrderStatus.CANCELLED
        order.cancel_reason = "Payment not received within time limit"
        order.cancelled_at = datetime.now(timezone.utc)
        order.updated_at = datetime.now(timezone.utc)

        await _restore_stock(db, order)

        payment_result = await db.execute(
            select(Payment).where(
                Payment.order_id == str(order.id),
                Payment.status == PaymentStatus.PENDING,
            )
        )
        for payment in payment_result.scalars().all():
            payment.status = PaymentStatus.FAILED
            payment.updated_at = datetime.now(timezone.utc)

        count += 1

    if count > 0:
        await db.flush()
        logger.info("Expired %d unpaid orders", count)

    cod_cutoff = datetime.now(timezone.utc) - timedelta(hours=COD_ORDER_EXPIRY_HOURS)
    cod_result = await db.execute(
        select(Order).where(
            Order.status == OrderStatus.PENDING,
            Order.payment_method == "cod",
            Order.created_at < cod_cutoff,
        )
    )
    cod_expired = list(cod_result.scalars().all())

    for order in cod_expired:
        order.status = OrderStatus.CANCELLED
        order.cancel_reason = "COD order not confirmed within 24 hours"
        order.cancelled_at = datetime.now(timezone.utc)
        order.updated_at = datetime.now(timezone.utc)
        await _restore_stock(db, order)
        count += 1

    if cod_expired:
        await db.flush()
        logger.info("Expired %d stale COD orders", len(cod_expired))

    return count


async def _restore_stock(db: AsyncSession, order: Order) -> None:
    from app.models.product import Product, ProductVariant

    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = items_result.scalars().all()

    for item in items:
        if item.variant_id:
            variant_result = await db.execute(
                select(ProductVariant).where(ProductVariant.id == item.variant_id)
            )
            variant = variant_result.scalar_one_or_none()
            if variant:
                variant.stock_quantity = (variant.stock_quantity or 0) + item.quantity

        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if product:
            product.stock_quantity = (product.stock_quantity or 0) + item.quantity
            product.sold_count = max(0, (product.sold_count or 0) - item.quantity)


async def _initiate_gateway_payment(
    gateway_name: str, order: Order, payment: Payment
) -> str | None:
    gateway = _get_gateway(gateway_name)
    if not gateway:
        logger.warning("No gateway registered for %s", gateway_name)
        return None

    base_url = os.environ.get("APP_BASE_URL", f"http://ecommkh.khmerhomeservices.com")
    callback_url = f"{base_url}/api/v1/payments/{gateway_name}/callback"
    return_url = f"{base_url}/orders/{order.order_number}/confirmation"

    result = await gateway.create_payment(
        order_number=order.order_number,
        amount=float(order.total),
        currency=order.currency,
        callback_url=callback_url,
        return_url=return_url,
        metadata={"order_id": str(order.id), "buyer_id": str(order.buyer_id)},
    )

    if result.success:
        payment.transaction_id = result.transaction_id or payment.transaction_id
        payment.payment_data = result.raw_response
        logger.info(
            "Payment created via %s for order %s (txn: %s)",
            gateway_name,
            order.order_number,
            payment.transaction_id,
        )
        return result.payment_url

    logger.error(
        "Payment creation failed via %s for order %s: %s",
        gateway_name,
        order.order_number,
        result.error_message,
    )
    raise PaymentException(f"Payment gateway error: {result.error_message}")
