from __future__ import annotations

import html
import os
import secrets
import re
import unicodedata
from datetime import datetime, timezone, timedelta
from typing import Optional


def generate_order_number() -> str:
    now = datetime.now(timezone.utc)
    date_part = now.strftime("%Y%m%d")
    random_part = secrets.token_hex(4).upper()
    return f"KM-{date_part}-{random_part}"


def generate_slug(text: str) -> str:
    text = text.strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("utf-8")
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-")


def format_usd(amount: float) -> str:
    return f"${amount:,.2f}"


def format_khr(amount: int) -> str:
    formatted = f"{amount:,}"
    return f"{formatted} \u17e1"


def usd_to_khr(usd_amount: float, rate: int = 4100) -> int:
    khr = usd_amount * rate
    return round(khr / 100) * 100


def khr_to_usd(khr_amount: int, rate: int = 4100) -> float:
    return round(khr_amount / rate, 2)


def get_cambodian_time() -> datetime:
    utc_now = datetime.now(timezone.utc)
    utc_plus_7 = timezone(timedelta(hours=7))
    return utc_now.astimezone(utc_plus_7)


def format_phone_display(phone: str) -> str:
    cleaned = re.sub(r"[^\d]", "", phone)
    if cleaned.startswith("855"):
        cleaned = cleaned[3:]
    elif cleaned.startswith("0"):
        cleaned = cleaned[1:]
    if len(cleaned) == 9:
        return f"0{cleaned[:2]} {cleaned[2:5]} {cleaned[5:8]} {cleaned[8:]}"
    elif len(cleaned) >= 8:
        return f"0{cleaned[:2]} {cleaned[2:5]} {cleaned[5:]}"
    return phone


def sanitize_html(text: str) -> str:
    allowed_tags = {"b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li", "a", "span"}
    text = html.escape(text)
    return text


def truncate_text(text: str, max_length: int) -> str:
    if len(text) <= max_length:
        return text
    truncated = text[: max_length - 3]
    last_space = truncated.rfind(" ")
    if last_space > max_length * 0.6:
        truncated = truncated[:last_space]
    return truncated + "..."


def get_file_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower().lstrip(".")
