from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.common.exceptions import exception_handler
from app.core.config import settings
from app.core.events import lifespan
from app.core.rate_limit import RateLimitMiddleware
from app.routes import (
    admin,
    auth,
    bulk_upload,
    cart,
    categories,
    chat,
    chatbot,
    coupons,
    notifications,
    orders,
    payments,
    products,
    reviews,
    search,
    seller,
    shipping,
    users,
    wishlist,
)
from app.routes import ws_chat

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Cambodia's Premier E-Commerce Platform API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.add_middleware(RateLimitMiddleware)

exception_handler(app)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(cart.router, prefix="/api/v1")
app.include_router(wishlist.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(shipping.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(coupons.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(seller.router, prefix="/api/v1")
app.include_router(bulk_upload.router, prefix="/api/v1")
app.include_router(chatbot.router, prefix="/api/v1")
app.include_router(ws_chat.router)

app.mount("/static/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/")
async def root():
    return {
        "message": "Welcome to KhmerMarket API",
        "docs": "/docs",
    }
