from __future__ import annotations

import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union

import phonenumbers
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str = "access"
    token_version: int = 0
    jti: str = ""


def _all_jwt_keys() -> list[str]:
    """Return current secret + previous secrets for verification."""
    keys = [settings.JWT_SECRET_KEY]
    keys.extend(settings.JWT_PREVIOUS_SECRET_KEYS)
    return keys


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    token_version: int = 0,
) -> str:
    now = datetime.now(timezone.utc)
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = now + expires_delta
    payload = {
        "sub": str(subject),
        "exp": expire,
        "type": "access",
        "token_version": token_version,
        "jti": secrets.token_hex(16),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: Union[str, Any], token_version: int = 0) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(subject),
        "exp": expire,
        "type": "refresh",
        "token_version": token_version,
        "jti": secrets.token_hex(16),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> TokenPayload:
    last_error: Exception | None = None
    for secret in _all_jwt_keys():
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=[settings.JWT_ALGORITHM],
            )
            return TokenPayload(
                sub=payload["sub"],
                exp=payload["exp"],
                type=payload.get("type", "access"),
                token_version=payload.get("token_version", 0),
                jti=payload.get("jti", ""),
            )
        except JWTError as e:
            last_error = e
            continue
    raise ValueError(f"Invalid token: {last_error}")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_otp() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))


def generate_jwt_secret() -> str:
    """Generate a cryptographically secure 64-byte hex secret for JWT signing."""
    return secrets.token_hex(64)


def verify_phone_format(phone: str) -> bool:
    try:
        parsed = phonenumbers.parse(phone, "KH")
        return phonenumbers.is_valid_number(parsed)
    except phonenumbers.NumberParseException:
        return False
