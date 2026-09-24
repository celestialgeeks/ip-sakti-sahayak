"""
Translation endpoint — proxy to Sarvam AI for multilingual support.
"""

import logging

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.enums import Language
from app.models.schemas import TranslateRequest, TranslateResponse
from app.services.sarvam import sarvam_service

logger = logging.getLogger("app.translate")
router = APIRouter()


@router.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """
    Translate text between English and Indian languages via Sarvam AI.
    """
    if not settings.SARVAM_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Translation service is not configured on this server.",
        )

    if request.source_language == request.target_language:
        return TranslateResponse(
            translated_text=request.text,
            source_language=request.source_language,
            target_language=request.target_language,
        )

    try:
        translated = await sarvam_service.translate(
            text=request.text,
            source_language=request.source_language,
            target_language=request.target_language,
        )
    except Exception as e:
        logger.error("Sarvam translation failed: %r", e)
        raise HTTPException(status_code=502, detail="Upstream translation service error.") from e

    return TranslateResponse(
        translated_text=translated,
        source_language=request.source_language,
        target_language=request.target_language,
    )
