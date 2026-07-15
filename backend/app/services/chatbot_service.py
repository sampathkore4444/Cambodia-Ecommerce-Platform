from __future__ import annotations

import logging
from typing import List

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import BadRequestException
from app.core.config import settings
from app.models.product import Category, Product
from app.schemas.chatbot import ChatMessage, ChatbotRequest, ChatbotResponse

logger = logging.getLogger(__name__)

MAX_HISTORY = settings.CHATBOT_MAX_HISTORY
OLLAMA_URL = f"{settings.OLLAMA_BASE_URL}/api/chat"
MODEL = settings.OLLAMA_MODEL

SYSTEM_PROMPT_TEMPLATE = """\
You are KhmerMarket's customer support assistant.

CRITICAL RULES:
- NEVER fabricate, guess, or invent data such as product counts, prices, order numbers, or any statistics.
- If you do not have the specific information, say "I don't have that information" and offer to connect the user with human support.
- Only use the REAL DATA provided below. Do not add numbers or facts that are not in the data.
- Do not use placeholder text like [DATA] or [/DATA] in your responses.

PLATFORM FACTS:
- KhmerMarket is Cambodia's premier e-commerce platform.
- Supports Khmer and English languages.
- Supports USD and KHR currency (1 USD ≈ 4,100 KHR).
- Payment methods: ABA Bank, Wing, Pi Pay.
- Sellers can list products in various categories.

REAL-TIME PLATFORM DATA:
{platform_data}

Be helpful, concise, and friendly. Answer in the same language the user writes in.\
"""


async def _fetch_platform_data(db: AsyncSession) -> str:
    try:
        total_products = await db.scalar(
            select(func.count(Product.id)).where(Product.is_active == True)
        ) or 0

        category_rows = await db.execute(
            select(Category.name, func.count(Product.id))
            .join(Product, Product.category_id == Category.id, isouter=True)
            .where(Category.is_active == True, Product.is_active == True)
            .group_by(Category.name)
            .order_by(func.count(Product.id).desc())
            .limit(10)
        )
        categories = [
            f"  - {name}: {count} products"
            for name, count in category_rows.all()
        ]

        top_products = await db.execute(
            select(Product.title, Product.price, Product.currency, Product.rating_avg)
            .where(Product.is_active == True)
            .order_by(Product.sold_count.desc())
            .limit(5)
        )
        popular = [
            f"  - {title}: {price} {currency} (rating: {rating:.1f}/5)"
            for title, price, currency, rating in top_products.all()
        ]

        lines = [f"Total active products: {total_products}"]
        if categories:
            lines.append("Categories with product counts:")
            lines.extend(categories)
        if popular:
            lines.append("Top selling products:")
            lines.extend(popular)

        return "\n".join(lines)
    except Exception:
        logger.exception("Failed to fetch platform data for chatbot")
        return "(Platform data unavailable at this time)"


async def chat(
    request: ChatbotRequest, db: AsyncSession
) -> ChatbotResponse:
    platform_data = await _fetch_platform_data(db)
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(platform_data=platform_data)

    messages: List[dict] = [{"role": "system", "content": system_prompt}]

    if request.history:
        for msg in request.history[-MAX_HISTORY:]:
            messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": request.message})

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(
                OLLAMA_URL,
                json={"model": MODEL, "messages": messages, "stream": False},
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.ConnectError:
        raise BadRequestException(
            "Cannot connect to Ollama. Make sure Ollama is running "
            f"at {settings.OLLAMA_BASE_URL}"
        )
    except httpx.HTTPStatusError as exc:
        logger.exception("Ollama HTTP error")
        raise BadRequestException(
            f"Ollama returned an error: {exc.response.status_code}"
        )

    reply = data.get("message", {}).get("content", "")
    if not reply:
        raise BadRequestException("Ollama returned an empty response")

    return ChatbotResponse(reply=reply, model=MODEL)
