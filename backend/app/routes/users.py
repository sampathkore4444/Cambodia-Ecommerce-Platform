from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.common.responses import success_response
from app.core.dependencies import get_current_active_user, get_db
from app.schemas.user import AddressCreate, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_profile(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_user_profile(db, str(current_user.id))
    return success_response(data=user, message="Profile retrieved")


@router.put("/me")
async def update_profile(
    data: UserUpdate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.update_user_profile(db, str(current_user.id), data)
    return success_response(data=user, message="Profile updated")


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    url = await user_service.upload_avatar(db, str(current_user.id), file)
    return success_response(data={"avatar_url": url}, message="Avatar uploaded")


@router.get("/{user_id}")
async def get_public_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_user_profile(db, str(user_id))
    return success_response(data=user, message="User profile retrieved")


@router.get("/me/addresses")
async def get_addresses(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    addresses = await user_service.get_user_addresses(db, str(current_user.id))
    return success_response(data=addresses, message="Addresses retrieved")


@router.post("/me/addresses")
async def create_address(
    data: AddressCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    address = await user_service.create_address(db, str(current_user.id), data)
    return success_response(data=address, message="Address created")


@router.put("/me/addresses/{address_id}")
async def update_address(
    address_id: UUID,
    data: AddressCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    address = await user_service.update_address(
        db, str(current_user.id), str(address_id), data
    )
    return success_response(data=address, message="Address updated")


@router.delete("/me/addresses/{address_id}")
async def delete_address(
    address_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await user_service.delete_address(db, str(current_user.id), str(address_id))
    return success_response(message="Address deleted")


@router.put("/me/addresses/{address_id}/default")
async def set_default_address(
    address_id: UUID,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await user_service.set_default_address(
        db, str(current_user.id), str(address_id)
    )
    return success_response(message="Default address set")
