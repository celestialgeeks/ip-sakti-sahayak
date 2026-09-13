"""
IP-SAKTI Sahayak — Configuration
Reads all settings from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from pydantic import Field, AliasChoices
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- App ---
    APP_NAME: str = "IP-SAKTI Sahayak"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # --- Google Gemini ---
    GEMINI_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("GEMINI_API_KEY", "GOOGLE_API_KEY"),
    )
    GEMINI_LLM_MODEL: str = "gemini-1.5-flash"
    GEMINI_EMBED_MODEL: str = "models/text-embedding-004"
    GEMINI_EMBED_DIMENSIONS: int = 768

    # --- Qdrant ---
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None

    # --- Sarvam AI ---
    SARVAM_API_KEY: str = ""
    SARVAM_BASE_URL: str = "https://api.sarvam.ai"

    # --- SQLite ---
    SQLITE_DB_PATH: str = "./data/ipsakti.db"

    # --- RAG Settings ---
    RAG_TOP_K: int = 10
    RAG_CHUNK_SIZE: int = 500
    RAG_CHUNK_OVERLAP: int = 50
    RAG_CONFIDENCE_HIGH: float = 0.85
    RAG_CONFIDENCE_MEDIUM: float = 0.60

    model_config = {
        "env_file": ("../.env", ".env"),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()
