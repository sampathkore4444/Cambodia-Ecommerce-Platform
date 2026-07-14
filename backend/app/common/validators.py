from __future__ import annotations

import re
from typing import Optional

import phonenumbers


def validate_cambodian_phone(phone: str) -> str:
    cleaned = re.sub(r"[\s\-()]", "", phone)

    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]
    elif cleaned.startswith("0") and not cleaned.startswith("00"):
        cleaned = "+855" + cleaned[1:]
    elif not cleaned.startswith("+"):
        cleaned = "+855" + cleaned

    try:
        parsed = phonenumbers.parse(cleaned, "KH")
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError(f"Invalid Cambodian phone number: {phone}")
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except phonenumbers.NumberParseException:
        raise ValueError(f"Invalid phone number format: {phone}")


def validate_price(price: float) -> float:
    if price < 0:
        raise ValueError("Price must be non-negative")
    rounded = round(price, 2)
    if rounded * 100 != int(rounded * 100):
        raise ValueError("Price must have at most 2 decimal places")
    return rounded


def validate_khr_price(price: int) -> int:
    if price < 0:
        raise ValueError("Price must be non-negative")
    rounded = round(price, -2)
    return rounded


def validate_image_file(file) -> bool:
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    max_size_bytes = 10 * 1024 * 1024  # 10MB

    filename = getattr(file, "filename", None)
    if filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in allowed_extensions:
            raise ValueError(f"File extension {ext} not allowed. Allowed: {', '.join(allowed_extensions)}")

    content = getattr(file, "file", None)
    if content and hasattr(content, "seek") and hasattr(content, "tell"):
        content.seek(0, 2)
        size = content.tell()
        content.seek(0)
        if size > max_size_bytes:
            raise ValueError(f"File size {size} bytes exceeds maximum {max_size_bytes} bytes")

    return True


def validate_password_strength(password: str) -> bool:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")
    return True
