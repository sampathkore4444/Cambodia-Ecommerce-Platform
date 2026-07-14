import csv
import io
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.common.responses import success_response
from app.core.dependencies import get_current_seller, get_db
from app.schemas.product import ProductCreate
from app.services import product_service

router = APIRouter(prefix="/seller/bulk", tags=["Seller Bulk"])


@router.post("/upload")
async def bulk_upload_products(
    file: UploadFile = File(...),
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith('.csv'):
        return success_response(data={"uploaded": 0, "errors": ["File must be CSV"]}, message="Invalid file")

    content = await file.read()
    text = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(text))

    uploaded = 0
    errors = []
    for i, row in enumerate(reader, start=2):
        try:
            data = ProductCreate(
                title=row.get("title", ""),
                title_kh=row.get("title_kh") or None,
                description=row.get("description") or None,
                price=float(row.get("price", 0)),
                compare_price=float(row.get("compare_price", 0)) or None,
                stock_quantity=int(row.get("stock_quantity", 0)),
                category_id=row.get("category_id") or None,
            )
            await product_service.create_product(db, str(current_user.id), data)
            uploaded += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    return success_response(
        data={"uploaded": uploaded, "errors": errors},
        message=f"Uploaded {uploaded} products"
    )
