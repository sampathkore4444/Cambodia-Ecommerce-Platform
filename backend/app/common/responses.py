from __future__ import annotations

from typing import Any, Dict, List, Optional


def success_response(
    data: Any = None,
    message: str = "Success",
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    response: Dict[str, Any] = {
        "success": True,
        "message": message,
        "data": data,
    }
    if meta is not None:
        response["meta"] = meta
    return response


def error_response(
    message: str = "An error occurred",
    errors: Optional[Dict[str, Any]] = None,
    error_code: Optional[str] = None,
) -> Dict[str, Any]:
    body: Dict[str, Any] = {
        "success": False,
        "message": message,
    }
    if errors is not None:
        body["errors"] = errors
    if error_code is not None:
        body["error_code"] = error_code
    return body


def paginated_response(
    items: List[Any],
    total: int,
    page: int,
    per_page: int,
) -> Dict[str, Any]:
    total_pages = (total + per_page - 1) // per_page if per_page > 0 else 0
    return {
        "success": True,
        "message": "Success",
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }
