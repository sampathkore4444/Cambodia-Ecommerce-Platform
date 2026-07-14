from __future__ import annotations

import enum
from datetime import datetime, date
from typing import Any
from uuid import UUID

from sqlalchemy import Row
from sqlalchemy.orm import DeclarativeBase


def model_to_dict(obj: Any, depth: int = 1) -> dict | Any:
    """Convert a SQLAlchemy model instance (or similar) to a plain dict.

    - Recursively serializes relationships up to `depth` levels.
    - Handles UUID, datetime, date, enum, and nested models.
    - Lists of models are converted to lists of dicts.
    - Primitives are returned as-is.
    """
    if obj is None or isinstance(obj, (int, float, str, bool)):
        return obj
    if isinstance(obj, UUID):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, enum.Enum):
        return obj.value
    if isinstance(obj, dict):
        return {k: model_to_dict(v, depth) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [model_to_dict(item, depth) for item in obj]

    # SQLAlchemy Row (from .all() on a select)
    if isinstance(obj, Row):
        return model_to_dict(obj._mapping, depth)

    # SQLAlchemy model instance
    if hasattr(obj, "__tablename__") and hasattr(obj, "__dict__"):
        result = {}
        for key in obj.__dict__:
            if key.startswith("_"):
                continue
            value = getattr(obj, key, None)
            if depth > 0 and hasattr(value, "__tablename__"):
                result[key] = model_to_dict(value, depth - 1)
            elif isinstance(value, list) and value and hasattr(value[0], "__tablename__"):
                result[key] = [model_to_dict(item, depth - 1) for item in value]
            else:
                result[key] = model_to_dict(value, depth)
        return result

    # Pydantic model
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()

    return obj


def serialize_items(items: list, depth: int = 1) -> list[dict]:
    """Serialize a list of model instances to a list of dicts."""
    return [model_to_dict(item, depth) for item in items]
