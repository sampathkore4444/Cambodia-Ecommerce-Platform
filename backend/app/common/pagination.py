from __future__ import annotations

from typing import Any, Generic, Optional, Sequence, TypeVar

from pydantic import BaseModel, Field
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: str = Field(default="created_at", description="Sort field")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$", description="Sort direction")


async def paginate(
    db: AsyncSession,
    query: Select,
    params: PaginationParams,
) -> dict[str, Any]:
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar() or 0

    offset = (params.page - 1) * params.per_page

    if hasattr(query.column_descriptions, "__iter__"):
        pass

    sort_column = getattr(query.column_descriptions[0].get("entity", None), params.sort_by, None)

    if sort_column is not None:
        if params.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

    query = query.offset(offset).limit(params.per_page)

    result = await db.execute(query)
    items = list(result.scalars().all())

    total_pages = (total + params.per_page - 1) // params.per_page if params.per_page > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "total_pages": total_pages,
        "has_next": params.page < total_pages,
        "has_prev": params.page > 1,
    }
