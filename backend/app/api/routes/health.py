"""Health check endpoint, including Ayurvedic library integrity status."""

from fastapi import APIRouter

from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Returns service health plus ayurveda-library load status."""
    library_status = "unknown"
    try:
        from app.services.ayurveda_service import get_library

        lib = get_library()
        library_status = f"ok ({len(lib.plants)} plants, {len(lib.formulations)} formulations)"
    except Exception as e:  # DataIntegrityError etc. — report, don't crash health probe
        library_status = f"error: {e}"
    return {
        "status": "healthy" if not library_status.startswith("error") else "degraded",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ayurveda_library": library_status,
        # Which model a question is actually put to, and the wait budget around it.
        # The blueprint and the service dashboard can disagree about NVIDIA_LLM_MODEL,
        # so the running value has to be readable from outside rather than assumed
        # from a file — that disagreement is what made a slow model hard to diagnose.
        "generation": {
            "model": settings.NVIDIA_LLM_MODEL,
            "fallbacks": settings.llm_model_chain[1:],
            "max_tokens": settings.RAG_MAX_TOKENS,
            "timeout_seconds": settings.NIM_TIMEOUT_SECONDS,
        },
    }
