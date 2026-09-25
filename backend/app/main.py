"""
IP-SAKTI Sahayak — FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings, validate_settings
from app.api.middleware.rate_limit import RateLimitMiddleware
from app.api.routes import chat, classify, abs_check, sources, translate, feedback, ingest, health, stats, ayurveda, formulation_lab, wizard

logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown hooks."""
    # --- Startup ---
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    for problem in validate_settings():
        logger.warning("Config problem: %s", problem)

    try:
        from app.services.sqlite_service import sqlite_service

        await sqlite_service.initialize()
    except Exception as e:
        logger.error("SQLite initialization failed: %s", e)

    # Fail-fast load of the curated Ayurvedic library (surfaces bad data loudly).
    try:
        from app.services.ayurveda_service import get_library

        get_library()
    except Exception as e:
        logger.error("Ayurvedic library failed to load: %s", e)
        raise

    # Self-heal ephemeral Qdrant (free tier wipes on restart): reseed if empty.
    try:
        from app.core.seed import seed_corpus_if_empty

        await seed_corpus_if_empty()
    except Exception as e:
        logger.warning("Boot seed failed (chat will report low confidence): %s", e)

    yield
    # --- Shutdown ---
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "RAG-powered IPR assistant for Ayurveda — patents, trademarks, GI, "
        "biodiversity, regulatory classification, and TKDL prior-art search."
    ),
    lifespan=lifespan,
)

# --- CORS (origins strictly from env config; never a wildcard with credentials) ---
_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
assert "*" not in _origins, "CORS_ORIGINS must not contain '*' while allow_credentials=True"
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- Rate limiting on cost-bearing endpoints ---
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)

# --- Routes ---
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(stats.router, prefix="/api", tags=["Stats"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(classify.router, prefix="/api", tags=["Classification"])
app.include_router(abs_check.router, prefix="/api", tags=["ABS Compliance"])
app.include_router(formulation_lab.router, prefix="/api", tags=["Formulation Lab"])
app.include_router(wizard.router, prefix="/api", tags=["Registration & Compliance Wizard"])
app.include_router(ayurveda.router, prefix="/api", tags=["Ayurvedic Library"])
app.include_router(sources.router, prefix="/api", tags=["Sources"])
app.include_router(translate.router, prefix="/api", tags=["Translation"])
app.include_router(feedback.router, prefix="/api", tags=["Feedback"])
app.include_router(ingest.router, prefix="/api", tags=["Ingestion"])
