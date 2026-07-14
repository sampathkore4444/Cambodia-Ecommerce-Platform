from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.common.exceptions import BadRequestException, NotFoundException
from app.common.responses import success_response, paginated_response
from app.core.dependencies import get_current_active_user, get_current_seller, get_db
from app.models.user import Seller
from app.schemas.product import (
    ProductCreate,
    ProductFilterParams,
    ProductImageCreate,
    ProductUpdate,
    VariantCreate,
)
from app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])

ALLOWED_UPLOAD_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_seller),
):
    if file.content_type not in ALLOWED_UPLOAD_TYPES:
        raise BadRequestException(
            f"Invalid file type: {file.content_type}. Allowed: JPEG, PNG, WebP, GIF"
        )
    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise BadRequestException(f"File too large. Maximum size: {MAX_UPLOAD_SIZE // (1024*1024)}MB")

    from app.utils.storage import StorageService
    storage = StorageService(provider="local")
    url = await storage.upload_file(file, folder="products", filename=file.filename or "image.jpg")
    return success_response(data={"url": url}, message="Image uploaded")


@router.get("")
async def get_products(
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    location: Optional[str] = None,
    sort_by: str = "created_at",
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    parsed_category_id = None
    if category_id:
        try:
            parsed_category_id = UUID(category_id)
        except ValueError:
            parsed_category_id = None
    filters = ProductFilterParams(
        category_id=parsed_category_id,
        min_price=min_price,
        max_price=max_price,
        condition=condition,
        location=location,
        sort_by=sort_by,
        search=search,
        page=page,
        per_page=per_page,
    )
    result = await product_service.get_products(db, filters)
    return paginated_response(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.get("/trending")
async def get_trending_products(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    products = await product_service.get_trending_products(db, limit)
    return success_response(data=products, message="Trending products retrieved")


@router.get("/flash-sales")
async def get_flash_sales(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    products = await product_service.get_flash_sale_products(db, limit)
    return success_response(data=products, message="Flash sale products retrieved")


@router.get("/{product_id}")
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        uuid_val = UUID(product_id)
    except ValueError:
        raise NotFoundException(detail=f"Product {product_id} not found")
    product = await product_service.get_product(db, str(uuid_val))
    return success_response(data=product, message="Product retrieved")


@router.post("")
async def create_product(
    data: ProductCreate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.create_product(db, str(current_user.id), data)
    return success_response(data=product, message="Product created")


@router.put("/{product_id}")
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.update_product(
        db, str(product_id), str(current_user.id), data
    )
    return success_response(data=product, message="Product updated")


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    await product_service.delete_product(db, str(product_id), str(current_user.id))
    return success_response(message="Product deleted")


@router.post("/{product_id}/images")
async def add_product_image(
    product_id: UUID,
    data: ProductImageCreate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    is_admin = getattr(current_user, 'role', None) == 'admin'
    seller_id = None
    if not is_admin:
        result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
        seller = result.scalar_one_or_none()
        if not seller:
            from app.common.exceptions import ForbiddenException
            raise ForbiddenException("Seller profile not found")
        seller_id = str(seller.id)
    image = await product_service.add_product_image(
        db, str(product_id), seller_id, data.model_dump(), is_admin=is_admin
    )
    return success_response(data=image, message="Image added")


@router.delete("/images/{image_id}")
async def delete_product_image(
    image_id: UUID,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    is_admin = getattr(current_user, 'role', None) == 'admin'
    seller_id = None
    if not is_admin:
        result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
        seller = result.scalar_one_or_none()
        if not seller:
            from app.common.exceptions import ForbiddenException
            raise ForbiddenException("Seller profile not found")
        seller_id = str(seller.id)
    await product_service.delete_product_image(
        db, str(image_id), seller_id, is_admin=is_admin
    )
    return success_response(message="Image deleted")


@router.post("/{product_id}/variants")
async def add_product_variant(
    product_id: UUID,
    data: VariantCreate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    variant = await product_service.add_product_variant(
        db, str(product_id), str(current_user.id), data
    )
    return success_response(data=variant, message="Variant added")


@router.put("/variants/{variant_id}")
async def update_variant(
    variant_id: UUID,
    data: VariantCreate,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    variant = await product_service.update_variant(
        db, str(variant_id), str(current_user.id), data
    )
    return success_response(data=variant, message="Variant updated")


@router.delete("/variants/{variant_id}")
async def delete_variant(
    variant_id: UUID,
    current_user=Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    await product_service.delete_variant(
        db, str(variant_id), str(current_user.id)
    )
    return success_response(message="Variant deleted")


@router.post("/bulk")
async def bulk_upload(
    current_user=Depends(get_current_seller),
):
    return success_response(data=None, message="Bulk upload coming soon")
