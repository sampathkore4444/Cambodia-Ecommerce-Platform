from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.common.exceptions import ForbiddenException
from app.common.responses import success_response
from app.core.dependencies import get_current_active_user, get_db
from app.core.webhook import verify_aba_callback, verify_wing_callback, verify_pipay_callback
from app.schemas.payment import PaymentInit
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("")
async def initiate_payment(
    data: PaymentInit,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await payment_service.initiate_payment(
        db, str(data.order_id), str(current_user.id), data
    )
    return success_response(data=payment, message="Payment initiated")


@router.post("/aba/callback")
async def aba_callback(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_aba_signature: Optional[str] = Header(None),
):
    raw_body = await request.body()
    if not verify_aba_callback(raw_body, x_aba_signature):
        raise ForbiddenException("Invalid webhook signature")
    body = await request.json()
    payment = await payment_service.process_payment_callback(db, "aba", body)
    return success_response(data={"status": "processed"}, message="ABA callback processed")


@router.post("/wing/callback")
async def wing_callback(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_wing_signature: Optional[str] = Header(None),
):
    raw_body = await request.body()
    if not verify_wing_callback(raw_body, x_wing_signature):
        raise ForbiddenException("Invalid webhook signature")
    body = await request.json()
    payment = await payment_service.process_payment_callback(db, "wing", body)
    return success_response(data={"status": "processed"}, message="Wing callback processed")


@router.post("/pipay/callback")
async def pipay_callback(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_pipay_signature: Optional[str] = Header(None),
):
    raw_body = await request.body()
    if not verify_pipay_callback(raw_body, x_pipay_signature):
        raise ForbiddenException("Invalid webhook signature")
    body = await request.json()
    payment = await payment_service.process_payment_callback(db, "pipay", body)
    return success_response(data={"status": "processed"}, message="PiPay callback processed")


@router.get("/{payment_id}/status")
async def check_payment_status(
    payment_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await payment_service.check_payment_status(
        db, str(payment_id), str(current_user.id)
    )
    return success_response(data=payment, message="Payment status retrieved")


@router.post("/{payment_id}/refund")
async def request_refund(
    payment_id: UUID,
    reason: str = "",
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await payment_service.request_refund(
        db, str(payment_id), str(current_user.id), reason
    )
    return success_response(data=payment, message="Refund requested")
