from datetime import datetime, timedelta, timezone
from typing import Optional
import hmac

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import (
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
)
from app.core.config import settings
from app.core.events import get_redis
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_otp,
    hash_password,
    verify_password,
    verify_phone_format,
    verify_token,
)
from app.models.user import User
from app.schemas.user import UserLogin, UserRegister


async def register_user(
    db: AsyncSession, user_data: UserRegister
) -> dict:
    conditions = [User.phone == user_data.phone]
    if user_data.email:
        conditions.append(User.email == user_data.email)
    existing = await db.execute(select(User).where(or_(*conditions)))
    if existing.scalar_one_or_none():
        raise ConflictException("User with this email or phone already exists")

    if user_data.phone and not verify_phone_format(user_data.phone):
        raise BadRequestException("Invalid Cambodian phone number format")

    if user_data.email and not user_data.password:
        raise BadRequestException("Password is required for email registration")
    if user_data.password and len(user_data.password) < 8:
        raise BadRequestException("Password must be at least 8 characters")

    user = User(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        password_hash=hash_password(user_data.password) if user_data.password else None,
        role="buyer",
        is_active=True,
        is_verified=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    tokens = await _create_token_pair(str(user.id), user.role, user.token_version)
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role,
        },
        **tokens,
    }


async def login_user(db: AsyncSession, login_data: UserLogin) -> dict:
    result = await db.execute(
        select(User).where(
            (User.email == login_data.identifier) | (User.phone == login_data.identifier)
        )
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise UnauthorizedException("Invalid credentials")

    if not user.is_active:
        raise UnauthorizedException("Account is disabled. Contact support.")

    tokens = await _create_token_pair(str(user.id), user.role, user.token_version)
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role,
            "avatar_url": user.avatar_url,
        },
        **tokens,
    }


async def login_by_phone(db: AsyncSession, phone: str) -> dict:
    if not verify_phone_format(phone):
        raise BadRequestException("Invalid Cambodian phone number format")

    otp = generate_otp()
    otp_ref = f"otp:{phone}:{datetime.now(timezone.utc).timestamp()}"

    r = await get_redis()
    await r.setex(
        f"otp_session:{phone}",
        300,
        f"{otp}:{otp_ref}",
    )

    return {
        "message": "OTP sent successfully",
        "phone": phone,
        "otp_reference": otp_ref,
        "expires_in": 300,
    }


async def verify_otp_and_login(db: AsyncSession, phone: str, otp: str) -> dict:
    r = await get_redis()

    attempt_key = f"otp_attempts:{phone}"
    attempts = await r.get(attempt_key)
    if attempts and int(attempts) >= 5:
        raise UnauthorizedException("Too many failed attempts. Request a new OTP.")

    stored = await r.get(f"otp_session:{phone}")
    if not stored:
        raise UnauthorizedException("OTP expired or not requested. Request a new OTP.")

    stored_str = stored.decode() if isinstance(stored, bytes) else stored
    stored_otp, stored_ref = stored_str.split(":", 1)

    if not hmac.compare_digest(stored_otp, otp):
        await r.incr(attempt_key)
        await r.expire(attempt_key, 300)
        raise UnauthorizedException("Invalid OTP code")

    await r.delete(f"otp_session:{phone}")
    await r.delete(attempt_key)

    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            phone=phone,
            full_name=f"User-{phone[-4:]}",
            role="buyer",
            is_active=True,
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
    else:
        user.is_verified = True
        user.updated_at = datetime.now(timezone.utc)
        await db.flush()

    tokens = await _create_token_pair(str(user.id), user.role, user.token_version)
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role,
        },
        **tokens,
    }


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> dict:
    try:
        payload = verify_token(refresh_token)
    except ValueError:
        raise UnauthorizedException("Invalid or expired refresh token")

    if payload.type != "refresh":
        raise UnauthorizedException("Token is not a refresh token")

    user_id = payload.sub
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")

    if user.token_version != payload.token_version:
        raise UnauthorizedException("Token has been invalidated. Please log in again.")

    tokens = await _create_token_pair(user_id, user.role, user.token_version)
    return tokens


async def logout_user(db: AsyncSession, user_id: str) -> bool:
    r = await get_redis()
    await r.setex(f"blacklist:user:{user_id}", 86400, "logged_out")
    await r.setex(f"blacklist:token:{user_id}", settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, "revoked")
    return True


async def social_login(
    db: AsyncSession, provider: str, token: str
) -> dict:
    provider = provider.lower().strip()
    if provider == "google":
        user_info = await _verify_google_token(token)
    elif provider == "facebook":
        user_info = await _verify_facebook_token(token)
    else:
        raise BadRequestException(f"Unsupported provider: {provider}")

    social_id = user_info["id"]
    email = user_info.get("email")
    full_name = user_info.get("name", "")
    avatar_url = user_info.get("picture")

    id_field = f"{provider}_id"
    result = await db.execute(
        select(User).where(
            or_(
                getattr(User, id_field) == social_id,
                *( [User.email == email] if email else [] ),
            )
        )
    )
    user = result.scalar_one_or_none()

    if user:
        setattr(user, id_field, social_id)
        if full_name and not user.full_name:
            user.full_name = full_name
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        if email and not user.email:
            user.email = email
        user.last_login_at = datetime.now(timezone.utc)
        user.updated_at = datetime.now(timezone.utc)
    else:
        phone = f"social_{social_id[:10]}"
        user = User(
            email=email,
            phone=phone,
            full_name=full_name,
            avatar_url=avatar_url,
            role="buyer",
            is_active=True,
            is_verified=True,
            **{id_field: social_id},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.flush()
    await db.refresh(user)

    tokens = await _create_token_pair(str(user.id), user.role, user.token_version)
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role,
            "avatar_url": user.avatar_url,
        },
        **tokens,
    }


async def _verify_google_token(token: str) -> dict:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    try:
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        return {
            "id": idinfo["sub"],
            "email": idinfo.get("email"),
            "name": idinfo.get("name", ""),
            "picture": idinfo.get("picture"),
        }
    except Exception as e:
        raise BadRequestException(f"Invalid Google token: {str(e)}")


async def _verify_facebook_token(token: str) -> dict:
    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://graph.facebook.com/me",
            params={"fields": "id,name,email", "access_token": token},
        )
    if resp.status_code != 200:
        raise BadRequestException("Invalid Facebook token")
    data = resp.json()
    if "error" in data:
        raise BadRequestException(data["error"].get("message", "Invalid Facebook token"))

    picture = None
    async with httpx.AsyncClient() as client:
        pic_resp = await client.get(
            "https://graph.facebook.com/me/picture",
            params={"type": "large", "access_token": token, "redirect": "0"},
        )
        if pic_resp.status_code == 200:
            pic_data = pic_resp.json()
            picture = pic_data.get("data", {}).get("url")

    return {
        "id": data["id"],
        "email": data.get("email"),
        "name": data.get("name", ""),
        "picture": picture,
    }


async def _create_token_pair(user_id: str, role: str, token_version: int = 0) -> dict:
    access_token = create_access_token(
        subject=user_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_version=token_version,
    )
    refresh_token = create_refresh_token(subject=user_id, token_version=token_version)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }
