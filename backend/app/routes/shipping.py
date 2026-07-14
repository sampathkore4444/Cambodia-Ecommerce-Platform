from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.common.responses import success_response
from app.core.dependencies import get_current_active_user, get_db
from app.services import shipping_service

router = APIRouter(prefix="/shipping", tags=["Shipping"])


@router.post("/calculate")
async def calculate_shipping_cost(
    items: list[dict],
    destination_province: str,
    destination_district: str,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await shipping_service.calculate_shipping_cost(
        db, items, destination_province, destination_district
    )
    return success_response(data=result, message="Shipping options calculated")


@router.get("/provinces")
async def get_shipping_provinces():
    provinces = await shipping_service.get_shipping_provinces()
    return success_response(data=provinces, message="Provinces retrieved")


@router.post("/track/{tracking_number}")
async def track_shipment(
    tracking_number: str,
    partner: str = Query("jtexpress"),
):
    result = await shipping_service.track_shipment(tracking_number, partner)
    return success_response(data=result, message="Tracking info retrieved")
