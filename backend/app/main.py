"""
IP-SAKTI Sahayak — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import chat, classify, abs_check, sources, translate, feedback, ingest, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown hooks."""
    # --- Startup ---
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    # Initialize services (Qdrant, NIM, etc.) will be done here
    yield
    # --- Shutdown ---
    print(f"👋 Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "RAG-powered IPR assistant for Ayurveda — patents, trademarks, GI, "
        "biodiversity, regulatory classification, and TKDL prior-art search."
    ),
    lifespan=lifespan,
)

# --- CORS ---
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(classify.router, prefix="/api", tags=["Classification"])
app.include_router(abs_check.router, prefix="/api", tags=["ABS Compliance"])
app.include_router(sources.router, prefix="/api", tags=["Sources"])
app.include_router(translate.router, prefix="/api", tags=["Translation"])
app.include_router(feedback.router, prefix="/api", tags=["Feedback"])
app.include_router(ingest.router, prefix="/api", tags=["Ingestion"])
