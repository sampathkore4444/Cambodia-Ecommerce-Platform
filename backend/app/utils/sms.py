from __future__ import annotations

import re
from typing import Optional

import httpx


class SmsService:
    def __init__(self, provider: str, api_key: str, api_secret: str):
        self.provider = provider
        self.api_key = api_key
        self.api_secret = api_secret

    def _format_cambodian_phone(self, phone: str) -> str:
        cleaned = re.sub(r"[^\d]", "", phone)
        if cleaned.startswith("855"):
            return cleaned
        if cleaned.startswith("0"):
            return "855" + cleaned[1:]
        return "855" + cleaned

    async def send_otp(self, phone: str, otp: str) -> bool:
        formatted_phone = self._format_cambodian_phone(phone)
        message = f"Your KhmerMarket verification code is: {otp}. Valid for 5 minutes. Do not share this code."
        return await self._send_sms(formatted_phone, message)

    async def send_notification(self, phone: str, message: str) -> bool:
        formatted_phone = self._format_cambodian_phone(phone)
        return await self._send_sms(formatted_phone, message)

    async def _send_sms(self, phone: str, message: str) -> bool:
        try:
            if self.provider == "cellcard":
                return await self._send_cellcard(phone, message)
            elif self.provider == "smart":
                return await self._send_smart(phone, message)
            elif self.provider == "metfone":
                return await self._send_metfone(phone, message)
            elif self.provider == "http_sms":
                return await self._send_http_sms(phone, message)
            return False
        except Exception:
            return False

    async def _send_cellcard(self, phone: str, message: str) -> bool:
        url = "https://api.cellcard.com.kh/sms/v1/send"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "from": "KhmerMarket",
            "to": phone,
            "text": message,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                return response.status_code in (200, 201, 202)
        except Exception:
            return False

    async def _send_smart(self, phone: str, message: str) -> bool:
        url = "https://sms-api.smart.com.kh/api/v1/send"
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "sender": "KhmerMarket",
            "to": phone,
            "message": message,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                return response.status_code in (200, 201, 202)
        except Exception:
            return False

    async def _send_metfone(self, phone: str, message: str) -> bool:
        url = "https://sms.metfone.com.kh/api/send"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "msisdn": phone,
            "message": message,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                return response.status_code in (200, 201, 202)
        except Exception:
            return False

    async def _send_http_sms(self, phone: str, message: str) -> bool:
        url = "https://apihttpsms.com/api/v1/send"
        headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "from": "KhmerMarket",
            "to": phone,
            "body": message,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                return response.status_code in (200, 201, 202)
        except Exception:
            return False
