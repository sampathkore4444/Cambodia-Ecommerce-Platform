from __future__ import annotations

import json
import time
from typing import Optional

import httpx


class CurrencyConverter:
    def __init__(self, rate_api_url: str, default_rate: int = 4100):
        self.rate_api_url = rate_api_url
        self.default_rate = default_rate
        self._cached_rate: Optional[float] = None
        self._cache_time: float = 0
        self._cache_ttl: float = 3600.0

    async def get_exchange_rate(self) -> float:
        now = time.time()
        if self._cached_rate is not None and (now - self._cache_time) < self._cache_ttl:
            return self._cached_rate

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.rate_api_url)
                response.raise_for_status()
                data = response.json()
                rates = data.get("rates", {})
                khr_rate = rates.get("KHR", self.default_rate)
                self._cached_rate = float(khr_rate)
                self._cache_time = now
                return self._cached_rate
        except Exception:
            self._cached_rate = float(self.default_rate)
            self._cache_time = now
            return self._cached_rate

    async def usd_to_khr(self, usd: float) -> int:
        rate = await self.get_exchange_rate()
        khr = usd * rate
        return round(khr / 100) * 100

    async def khr_to_usd(self, khr: int) -> float:
        rate = await self.get_exchange_rate()
        return round(khr / rate, 2)

    async def format_price(self, amount: float, currency: str) -> str:
        if currency.upper() == "KHR":
            khr_amount = await self.usd_to_khr(amount)
            formatted = f"{khr_amount:,}"
            return f"{formatted} \u17e1"
        return f"${amount:,.2f}"
