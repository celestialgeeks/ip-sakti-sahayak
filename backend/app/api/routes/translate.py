"""
Translation endpoint — proxy to Sarvam AI for multilingual support.
"""

from fastapi import APIRouter

from app.models.schemas import TranslateRequest, TranslateResponse

router = APIRouter()


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """
    Translate text between English and Indian languages via Sarvam AI.
    """
    # TODO: Call Sarvam AI translation API
    return TranslateResponse(
        translated_text=request.text,
        source_language=request.source_language,
        target_language=request.target_language,
    )
