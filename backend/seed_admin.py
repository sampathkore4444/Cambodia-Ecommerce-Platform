"""Create default admin user. Run with: python seed_admin.py"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import engine, Base
from app.core.security import hash_password
from app.models.user import User
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
import uuid

ADMIN_EMAIL = "admin@khmermarket.com"
ADMIN_PHONE = "012345678"
ADMIN_PASSWORD = "KhmerMarket@2024"
ADMIN_NAME = "Admin"

async def create_admin():
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        existing = await db.execute(
            select(User).where((User.email == ADMIN_EMAIL) | (User.phone == ADMIN_PHONE))
        )
        if existing.scalar_one_or_none():
            print(f"Admin already exists: {ADMIN_EMAIL}")
            return

        admin = User(
            id=uuid.uuid4(),
            email=ADMIN_EMAIL,
            phone=ADMIN_PHONE,
            password_hash=hash_password(ADMIN_PASSWORD),
            full_name=ADMIN_NAME,
            display_name=ADMIN_NAME,
            role="admin",
            is_verified=True,
            is_active=True,
        )
        db.add(admin)
        await db.commit()
        print(f"Admin created successfully!")
        print(f"  Email:    {ADMIN_EMAIL}")
        print(f"  Phone:    {ADMIN_PHONE}")
        print(f"  Password: {ADMIN_PASSWORD}")

if __name__ == "__main__":
    asyncio.run(create_admin())
