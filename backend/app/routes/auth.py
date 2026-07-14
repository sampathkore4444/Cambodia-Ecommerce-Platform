from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import success_response
from app.core.dependencies import get_current_active_user, get_db
from app.schemas.user import (
    OTPVerify,
    PhoneLogin,
    RefreshTokenRequest,
    UserLogin,
    UserRegister,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


class SocialLoginRequest(BaseModel):
    provider: str
    token: str


@router.post("/register")
async def register(
    data: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    result = await auth_service.register_user(db, data)
    return success_response(data=result, message="Registration successful")


@router.post("/login")
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    result = await auth_service.login_user(db, data)
    return success_response(data=result, message="Login successful")


@router.post("/login/phone")
async def login_by_phone(
    data: PhoneLogin,
    db: AsyncSession = Depends(get_db),
):
    result = await auth_service.login_by_phone(db, data.phone)
    return success_response(data=result, message="OTP sent successfully")


@router.post("/verify-otp")
async def verify_otp(
    data: OTPVerify,
    db: AsyncSession = Depends(get_db),
):
    result = await auth_service.verify_otp_and_login(db, data.phone, data.otp)
    return success_response(data=result, message="OTP verified successfully")


@router.post("/refresh")
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await auth_service.refresh_access_token(db, data.refresh_token)
    return success_response(data=result, message="Token refreshed successfully")


@router.post("/logout")
async def logout(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await auth_service.logout_user(db, str(current_user.id))
    return success_response(message="Logged out successfully")


@router.post("/social")
async def social_login(
    data: SocialLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await auth_service.social_login(db, data.provider, data.token)
    return success_response(data=result, message="Social login successful")
