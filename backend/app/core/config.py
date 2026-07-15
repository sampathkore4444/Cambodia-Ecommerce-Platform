from __future__ import annotations

import os
import secrets
import sys
from typing import List, Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "KhmerMarket"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = False
    SECRET_KEY: Optional[str] = None
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3002", "http://localhost:8001", "http://localhost:8080", "http://localhost:8083"]

    DATABASE_URL: str = "postgresql+asyncpg://khmermarket:khmermarket@localhost:5432/khmermarket"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: Optional[str] = None
    JWT_PREVIOUS_SECRET_KEYS: List[str] = []
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    SMS_PROVIDER: str = "cellcard"
    SMS_API_KEY: str = ""
    SMS_API_SECRET: str = ""

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    STORAGE_PROVIDER: str = "local"
    LOCAL_STORAGE_PATH: str = "./uploads"
    S3_BUCKET: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_REGION: str = "ap-southeast-1"

    ABA_MERCHANT_ID: str = ""
    ABA_API_KEY: str = ""
    ABA_SECRET_KEY: str = ""
    ABA_WEBHOOK_SECRET: str = ""
    WING_MERCHANT_ID: str = ""
    WING_API_KEY: str = ""
    WING_WEBHOOK_SECRET: str = ""
    PIPAY_APP_ID: str = ""
    PIPAY_APP_KEY: str = ""
    PIPAY_WEBHOOK_SECRET: str = ""

    EXCHANGE_RATE_API_URL: str = "https://api.exchangerate-api.com/v4/latest/USD"
    DEFAULT_CURRENCY: str = "USD"
    KHR_USD_RATE: int = 4100

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "phi3:mini"
    CHATBOT_MAX_HISTORY: int = 20
    CHATBOT_SYSTEM_PROMPT: str = (
        "You are KhmerMarket's customer support assistant. "
        "You help customers with questions about products, orders, payments, "
        "shipping, returns, and general marketplace usage. "
        "KhmerMarket is Cambodia's premier e-commerce platform supporting "
        "Khmer and English languages, USD/KHR currency, and local payment "
        "gateways (ABA Bank, Wing, Pi Pay). "
        "Be helpful, concise, and friendly. If you don't know the answer, "
        "say so and suggest contacting human support."
    )

    GOOGLE_CLIENT_ID: str = ""
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @model_validator(mode="after")
    def validate_secrets(self) -> "Settings":
        is_production = self.APP_ENV == "production"

        if not self.SECRET_KEY:
            if is_production:
                print("FATAL: SECRET_KEY must be set in production. Generate with: python -c \"import secrets; print(secrets.token_hex(64))\"", file=sys.stderr)
                sys.exit(1)
            self.SECRET_KEY = secrets.token_hex(64)

        if not self.JWT_SECRET_KEY:
            if is_production:
                print("FATAL: JWT_SECRET_KEY must be set in production. Generate with: python -c \"import secrets; print(secrets.token_hex(64))\"", file=sys.stderr)
                sys.exit(1)
            self.JWT_SECRET_KEY = secrets.token_hex(64)

        if is_production:
            weak_secrets = {
                "SECRET_KEY": self.SECRET_KEY,
                "JWT_SECRET_KEY": self.JWT_SECRET_KEY,
            }
            for name, value in weak_secrets.items():
                if value and len(value) < 32:
                    print(f"FATAL: {name} is too short ({len(value)} chars). Must be at least 32 characters.", file=sys.stderr)
                    sys.exit(1)

        if is_production:
            payment_gateways = {
                "ABA": (self.ABA_MERCHANT_ID, self.ABA_WEBHOOK_SECRET or self.ABA_SECRET_KEY),
                "WING": (self.WING_MERCHANT_ID, self.WING_WEBHOOK_SECRET),
                "PIPAY": (self.PIPAY_APP_ID, self.PIPAY_WEBHOOK_SECRET),
            }
            for name, (merchant_id, webhook_secret) in payment_gateways.items():
                if merchant_id and not webhook_secret:
                    print(f"WARNING: {name} payment gateway is configured but webhook secret is empty. Payment callbacks will be rejected.", file=sys.stderr)

        return self


settings = Settings()
