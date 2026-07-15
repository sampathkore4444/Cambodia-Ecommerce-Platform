from datetime import datetime, timezone
from math import ceil

from sqlalchemy import case, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.common.exceptions import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.common.utils import generate_slug
from app.models.product import Category, Product, ProductImage, ProductVariant
from app.models.user import Seller
from app.utils.khmer_text import contains_khmer, search_query_build
from app.schemas.product import (
    CategoryCreate,
    ProductCreate,
    ProductFilterParams,
    ProductUpdate,
    VariantCreate,
)


def _escape_ilike(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


async def _unique_slug(db: AsyncSession, base_slug: str) -> str:
    slug = base_slug
    suffix = 1
    while True:
        result = await db.execute(
            select(Product.id).where(Product.slug == slug)
        )
        if not result.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


async def create_product(
    db: AsyncSession, seller_id: str, data: ProductCreate
) -> Product:
    seller_result = await db.execute(
        select(Seller).where(Seller.user_id == seller_id)
    )
    seller = seller_result.scalar_one_or_none()
    if not seller:
        raise NotFoundException("Seller not found")
    if not seller.is_verified:
        raise ForbiddenException("Seller account is not verified")

    if data.category_id:
        cat_result = await db.execute(
            select(Category).where(Category.id == data.category_id)
        )
        if not cat_result.scalar_one_or_none():
            raise NotFoundException("Category not found")

    product = Product(
        seller_id=seller.id,
        title=data.title,
        title_kh=data.title_kh,
        slug=await _unique_slug(db, generate_slug(data.title)),
        description=data.description,
        description_kh=data.description_kh,
        category_id=data.category_id,
        price=data.price,
        compare_price=data.compare_price,
        currency=data.currency or "USD",
        condition=data.condition or "new",
        stock_quantity=data.stock_quantity or 0,
        min_order_qty=data.min_order_qty or 1,
        weight_grams=data.weight_grams,
        is_active=False,
        is_featured=False,
        status="draft",
        view_count=0,
        sold_count=0,
        rating_avg=0.0,
        rating_count=0,
        tags=data.tags,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)

    if data.images:
        for idx, img in enumerate(data.images):
            img_obj = ProductImage(
                product_id=product.id,
                url=img.url if hasattr(img, 'url') else img,
                alt_text=img.alt_text if hasattr(img, 'alt_text') else None,
                is_primary=idx == 0,
                sort_order=img.sort_order if hasattr(img, 'sort_order') else idx,
                created_at=datetime.now(timezone.utc),
            )
            db.add(img_obj)
        await db.flush()

    await db.flush()

    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants))
        .where(Product.id == product.id)
    )
    return result.scalar_one()


async def update_product(
    db: AsyncSession, product_id: str, seller_id: str, data: ProductUpdate
) -> Product:
    result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.seller_id == seller_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    update_data = data.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"]:
        cat_result = await db.execute(
            select(Category).where(Category.id == update_data["category_id"])
        )
        if not cat_result.scalar_one_or_none():
            raise NotFoundException("Category not found")

    if "title" in update_data and update_data["title"] != product.title:
        update_data["slug"] = generate_slug(update_data["title"])

    for field, value in update_data.items():
        setattr(product, field, value)

    product.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(product)
    return product


async def delete_product(
    db: AsyncSession, product_id: str, seller_id: str
) -> bool:
    result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.seller_id == seller_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    await db.execute(
        update(ProductImage)
        .where(ProductImage.product_id == product_id)
        .values(is_active=False)
    )
    await db.execute(
        update(ProductVariant)
        .where(ProductVariant.product_id == product_id)
        .values(is_active=False)
    )
    product.is_active = False
    product.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return True


async def get_product(db: AsyncSession, product_id: str) -> Product:
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.category),
            selectinload(Product.seller),
        )
        .where(Product.id == product_id, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    product.view_count = (product.view_count or 0) + 1
    await db.flush()
    return product


async def get_products(
    db: AsyncSession, filters: ProductFilterParams
) -> dict:
    query = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.category),
        )
        .where(Product.is_active == True)
    )

    if filters.category_id:
        query = query.where(Product.category_id == filters.category_id)
    if filters.min_price is not None:
        query = query.where(Product.price >= filters.min_price)
    if filters.max_price is not None:
        query = query.where(Product.price <= filters.max_price)
    if filters.search:
        escaped = _escape_ilike(filters.search)
        search_term = f"%{escaped}%"
        query = query.where(
            or_(
                Product.title.ilike(search_term),
                Product.title_kh.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )
    if filters.seller_id:
        query = query.where(Product.seller_id == filters.seller_id)
    if filters.in_stock:
        query = query.where(Product.stock_quantity > 0)
    if filters.is_featured is not None:
        query = query.where(Product.is_featured == filters.is_featured)

    sort_map = {
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
        "newest": Product.created_at.desc(),
        "oldest": Product.created_at.asc(),
        "best_selling": Product.sold_count.desc(),
        "top_rated": Product.rating_avg.desc(),
        "most_viewed": Product.view_count.desc(),
    }
    order = sort_map.get(filters.sort_by, Product.created_at.desc())
    query = query.order_by(order)

    page = filters.page or 1
    per_page = filters.per_page or 20

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    result = await db.execute(query)
    products = list(result.scalars().all())

    return {
        "items": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def get_seller_products(
    db: AsyncSession, seller_id: str, page: int = 1, per_page: int = 20
) -> dict:
    query = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants))
        .where(Product.seller_id == seller_id)
        .order_by(Product.created_at.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    products = list(result.scalars().all())

    return {
        "items": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def get_trending_products(
    db: AsyncSession, limit: int = 20
) -> list:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.is_active == True)
        .order_by(
            Product.sold_count.desc(),
            Product.view_count.desc(),
            Product.rating_avg.desc(),
        )
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_flash_sale_products(
    db: AsyncSession, limit: int = 20
) -> list:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(
            Product.is_active == True,
            Product.compare_price.isnot(None),
            Product.compare_price > 0,
            Product.compare_price > Product.price,
        )
        .order_by(Product.sold_count.desc(), Product.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_products_by_category(
    db: AsyncSession, category_id: str, page: int = 1, per_page: int = 20
) -> dict:
    subcats = await db.execute(
        select(Category.id).where(
            or_(
                Category.id == category_id,
                Category.parent_id == category_id,
            )
        )
    )
    cat_ids = [row[0] for row in subcats.all()]
    cat_ids.append(category_id)

    query = (
        select(Product)
        .options(selectinload(Product.images))
        .where(
            Product.category_id.in_(cat_ids),
            Product.is_active == True,
        )
        .order_by(Product.created_at.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    products = list(result.scalars().all())

    return {
        "items": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def search_products(
    db: AsyncSession, query: str, page: int = 1, per_page: int = 20
) -> dict:
    enhanced_query = search_query_build(query)
    escaped_query = _escape_ilike(query)
    escaped_enhanced = _escape_ilike(enhanced_query)

    if contains_khmer(query):
        terms = [f"%{_escape_ilike(t)}%" for t in enhanced_query.split() if t]
        search_conditions = []
        for term in terms:
            search_conditions.extend([
                Product.title.ilike(term),
                Product.title_kh.ilike(term),
                Product.description.ilike(term),
                Product.description_kh.ilike(term),
            ])
        where_clause = or_(*search_conditions)
    else:
        search_term = f"%{escaped_enhanced}%"
        where_clause = or_(
            Product.title.ilike(search_term),
            Product.title_kh.ilike(search_term),
            Product.description.ilike(search_term),
            Product.description_kh.ilike(search_term),
        )

    q = (
        select(Product)
        .options(selectinload(Product.images))
        .where(
            Product.is_active == True,
            where_clause,
        )
        .order_by(
            case(
                (Product.title.ilike(f"{escaped_query}%"), 0),
                (Product.title_kh.ilike(f"{escaped_query}%"), 1),
                else_=2,
            ),
            Product.sold_count.desc(),
        )
    )

    count_query = select(func.count()).select_from(q.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * per_page
    result = await db.execute(q.offset(offset).limit(per_page))
    products = list(result.scalars().all())

    return {
        "items": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
    }


async def add_product_image(
    db: AsyncSession, product_id: str, seller_id: str, image_data, is_admin: bool = False
) -> ProductImage:
    query = select(Product).where(Product.id == product_id)
    if not is_admin:
        query = query.where(Product.seller_id == seller_id)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    count_result = await db.execute(
        select(func.count(ProductImage.id)).where(
            ProductImage.product_id == product_id
        )
    )
    count = count_result.scalar() or 0

    image = ProductImage(
        product_id=product_id,
        url=image_data.get("url", image_data) if isinstance(image_data, dict) else image_data,
        is_primary=count == 0,
        sort_order=count,
        created_at=datetime.now(timezone.utc),
    )
    db.add(image)
    await db.flush()
    await db.refresh(image)
    return image


async def delete_product_image(
    db: AsyncSession, image_id: str, seller_id: str, is_admin: bool = False
) -> bool:
    query = (
        select(ProductImage)
        .join(Product, ProductImage.product_id == Product.id)
        .where(ProductImage.id == image_id)
    )
    if not is_admin:
        query = query.where(Product.seller_id == seller_id)
    result = await db.execute(query)
    image = result.scalar_one_or_none()
    if not image:
        raise NotFoundException("Image not found")

    await db.delete(image)
    await db.flush()
    return True


async def add_product_variant(
    db: AsyncSession,
    product_id: str,
    seller_id: str,
    data: VariantCreate,
) -> ProductVariant:
    result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.seller_id == seller_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    existing = await db.execute(
        select(ProductVariant).where(
            ProductVariant.product_id == product_id,
            ProductVariant.sku == data.sku,
        )
    )
    if existing.scalar_one_or_none():
        raise ConflictException("Variant with this SKU already exists")

    variant = ProductVariant(
        product_id=product_id,
        sku=data.sku,
        name=data.name,
        price=data.price,
        stock_quantity=data.stock_quantity or 0,
        attributes=data.attributes or {},
        image_url=data.image_url,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(variant)
    await db.flush()
    await db.refresh(variant)
    return variant


async def update_variant(
    db: AsyncSession, variant_id: str, seller_id: str, data
) -> ProductVariant:
    result = await db.execute(
        select(ProductVariant)
        .join(Product, ProductVariant.product_id == Product.id)
        .where(ProductVariant.id == variant_id, Product.seller_id == seller_id)
    )
    variant = result.scalar_one_or_none()
    if not variant:
        raise NotFoundException("Variant not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(variant, field, value)

    variant.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(variant)
    return variant


async def delete_variant(
    db: AsyncSession, variant_id: str, seller_id: str
) -> bool:
    result = await db.execute(
        select(ProductVariant)
        .join(Product, ProductVariant.product_id == Product.id)
        .where(ProductVariant.id == variant_id, Product.seller_id == seller_id)
    )
    variant = result.scalar_one_or_none()
    if not variant:
        raise NotFoundException("Variant not found")

    variant.is_active = False
    variant.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return True


async def check_stock(
    db: AsyncSession,
    product_id: str,
    variant_id: str,
    quantity: int,
) -> bool:
    if variant_id:
        result = await db.execute(
            select(ProductVariant).where(
                ProductVariant.id == variant_id,
                ProductVariant.product_id == product_id,
                ProductVariant.is_active == True,
            )
        )
        variant = result.scalar_one_or_none()
        if not variant or variant.stock_quantity < quantity:
            return False
    else:
        result = await db.execute(
            select(Product).where(
                Product.id == product_id, Product.is_active == True
            )
        )
        product = result.scalar_one_or_none()
        if not product or (product.stock_quantity or 0) < quantity:
            return False
    return True


async def create_category(
    db: AsyncSession, data: CategoryCreate
) -> Category:
    if data.parent_id:
        parent_result = await db.execute(
            select(Category).where(Category.id == data.parent_id)
        )
        if not parent_result.scalar_one_or_none():
            raise NotFoundException("Parent category not found")

    existing = await db.execute(
        select(Category).where(Category.slug == generate_slug(data.name))
    )
    if existing.scalar_one_or_none():
        raise ConflictException("Category with this name already exists")

    category = Category(
        name=data.name,
        name_kh=data.name_kh,
        slug=generate_slug(data.name),
        description=data.description,
        icon_url=data.icon_url,
        image_url=data.image_url,
        commission_rate=data.commission_rate or 5.0,
        parent_id=data.parent_id,
        sort_order=data.sort_order or 0,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def get_category_tree(db: AsyncSession) -> list:
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.sort_order, Category.name)
    )
    categories = list(result.scalars().all())

    cat_map: dict = {}
    tree = []

    for cat in categories:
        cat_dict = {
            "id": str(cat.id),
            "name": cat.name,
            "name_kh": cat.name_kh,
            "slug": cat.slug,
            "icon_url": cat.icon_url,
            "image_url": cat.image_url,
            "parent_id": str(cat.parent_id) if cat.parent_id else None,
            "sort_order": cat.sort_order,
            "children": [],
        }
        cat_map[str(cat.id)] = cat_dict

    for cat_dict in cat_map.values():
        parent_id = cat_dict["parent_id"]
        if parent_id and parent_id in cat_map:
            cat_map[parent_id]["children"].append(cat_dict)
        else:
            tree.append(cat_dict)

    return tree


async def get_category(db: AsyncSession, category_id: str) -> Category:
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.is_active == True)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise NotFoundException("Category not found")

    children_result = await db.execute(
        select(Category)
        .where(
            Category.parent_id == category_id, Category.is_active == True
        )
        .order_by(Category.sort_order)
    )
    category._children = list(children_result.scalars().all())
    return category
