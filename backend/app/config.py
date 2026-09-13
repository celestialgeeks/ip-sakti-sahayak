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

    # --- NVIDIA NIM ---
    NVIDIA_NIM_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("NVIDIA_NIM_API_KEY", "NVIDIA_API_KEY"),
    )
    NVIDIA_NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_LLM_MODEL: str = "meta/llama-3.1-8b-instruct"
    NVIDIA_EMBED_MODEL: str = "nvidia/nv-embedqa-e5-v5"
    NVIDIA_EMBED_DIMENSIONS: int = 1024

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
