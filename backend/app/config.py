"""
IP-SAKTI Sahayak — Configuration
Reads all settings from environment variables / .env file.
"""

import logging
import sys

from pydantic_settings import BaseSettings
from pydantic import Field, AliasChoices
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- App ---
    APP_NAME: str = "IP-SAKTI Sahayak"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"
    RATE_LIMIT_PER_MINUTE: int = 30
    SQLITE_DB_PATH: str = "data/ipsakti.db"

    # --- NVIDIA NIM ---
    NVIDIA_NIM_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("NVIDIA_NIM_API_KEY", "NVIDIA_API_KEY"),
    )
    NVIDIA_NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_LLM_MODEL: str = "nvidia/nemotron-3.5-lightning-30b-a3b"
    NVIDIA_EMBED_MODEL: str = "nvidia/nemotron-3-embed-1b"
    NVIDIA_EMBED_DIMENSIONS: int = 2048

    # --- Qdrant ---
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None

    # --- Sarvam AI ---
    SARVAM_API_KEY: str = ""
    SARVAM_BASE_URL: str = "https://api.sarvam.ai"

    # --- Supabase ---
    NEXT_PUBLIC_SUPABASE_URL: str = ""
    NEXT_PUBLIC_SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    JWT_SECRET: str = "" # (Optional) If validating JWTs manually without the Supabase client

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


def validate_settings(s: Optional[Settings] = None) -> list[str]:
    """
    Fail-fast validation of required configuration.

    Returns a list of human-readable problems. In production (DEBUG=False)
    any problem is fatal; in development mode they are logged as warnings so
    the app can still boot for offline UI work.
    """
    s = s or settings
    problems: list[str] = []

    if not s.NVIDIA_NIM_API_KEY:
        problems.append(
            "NVIDIA_NIM_API_KEY is not set — embeddings/LLM calls will fail and the corpus cannot be seeded."
        )
    if not s.JWT_SECRET:
        problems.append(
            "JWT_SECRET is not set — authenticated endpoints cannot verify Supabase tokens."
        )
    if "*" in [o.strip() for o in s.CORS_ORIGINS.split(",")]:
        problems.append("CORS_ORIGINS must not contain '*' when allow_credentials is enabled.")
    if not s.SARVAM_API_KEY:
        problems.append("SARVAM_API_KEY is not set — multilingual translation will be unavailable.")
    return problems


def setup_logging(level: Optional[str] = None) -> logging.Logger:
    """Configure structured root logging once at startup."""
    log_level = (level or settings.LOG_LEVEL).upper()
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    root = logging.getLogger()
    if not root.handlers:
        root.addHandler(handler)
    root.setLevel(log_level)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    return logging.getLogger("app")


logger = setup_logging()

_startup_problems = validate_settings()
if _startup_problems:
    if settings.DEBUG:
        for p in _startup_problems:
            logger.warning("Config warning: %s", p)
    else:
        for p in _startup_problems:
            logger.error("Config error: %s", p)
        raise RuntimeError(
            "Refusing to start with invalid configuration (set DEBUG=true to override): "
            + "; ".join(_startup_problems)
        )
