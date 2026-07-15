from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import success_response
from app.core.database import get_db
from app.schemas.chatbot import ChatbotRequest
from app.services import chatbot_service

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/chat")
async def chat(
    data: ChatbotRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await chatbot_service.chat(data, db)
    return success_response(data=result, message="Reply generated")
