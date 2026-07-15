from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ForbiddenException, UnauthorizedException
from app.core.database import get_db
from app.core.security import TokenPayload, verify_token

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> "User":
    from app.models.user import User

    if credentials is None:
        raise UnauthorizedException("Not authenticated")

    try:
        payload = verify_token(credentials.credentials)
        if payload.type != "access":
            raise UnauthorizedException("Invalid token type")
    except ValueError:
        raise UnauthorizedException("Invalid or expired token")

    from app.core.events import get_redis
    r = await get_redis()
    if payload.jti:
        is_blacklisted = await r.get(f"blacklist:token:{payload.jti}")
        if is_blacklisted:
            raise UnauthorizedException("Token has been revoked")

    result = await db.execute(
        select(User).where(User.id == payload.sub)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise UnauthorizedException("User not found")
    return user


async def get_current_active_user(
    current_user: "User" = Depends(get_current_user),
) -> "User":
    if not current_user.is_active:
        raise ForbiddenException("Account is deactivated")
    return current_user


async def get_current_seller(
    current_user: "User" = Depends(get_current_active_user),
) -> "User":
    from app.models.user import Seller

    if current_user.role not in ("seller", "admin"):
        raise ForbiddenException("Seller access required")

    from fastapi import Request
    from app.core.database import async_session_factory

    async with async_session_factory() as db:
        result = await db.execute(
            select(Seller).where(Seller.user_id == current_user.id)
        )
        seller = result.scalar_one_or_none()

        if seller is None:
            raise ForbiddenException("Seller profile not found")
        if not seller.is_active:
            raise ForbiddenException("Seller account is deactivated")

    return current_user


async def get_current_admin(
    current_user: "User" = Depends(get_current_active_user),
) -> "User":
    if current_user.role != "admin":
        raise ForbiddenException("Admin access required")
    return current_user
