"""
Sarvam AI Service — Multilingual translation for Indian languages.
"""

import httpx
from typing import Optional

from app.config import settings
from app.models.enums import Language


class SarvamService:
    """Client for Sarvam AI translation API."""

    def __init__(self):
        self.api_key = settings.SARVAM_API_KEY
        self.base_url = settings.SARVAM_BASE_URL
        self.headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }

    async def translate(
        self,
        text: str,
        source_language: Language = Language.ENGLISH,
        target_language: Language = Language.HINDI,
    ) -> str:
        """
        Translate text between English and Indian languages.
        
        Args:
            text: Text to translate
            source_language: Source language code
            target_language: Target language code
        
        Returns:
            Translated text string.
        """
        if source_language == target_language:
            return text

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/translate",
                headers=self.headers,
                json={
                    "input": text,
                    "source_language_code": source_language.value,
                    "target_language_code": target_language.value,
                    "mode": "formal",
                    "model": "mayura:v1",
                    "enable_preprocessing": True,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("translated_text", text)

    async def detect_language(self, text: str) -> Language:
        """
        Detect the language of input text.
        Simple heuristic: if text contains Devanagari, it's Hindi, etc.
        For production, use Sarvam's language detection API.
        """
        # TODO: Use Sarvam language detection API
        # For now, simple ASCII check
        if all(ord(c) < 128 for c in text.replace(" ", "")):
            return Language.ENGLISH
        return Language.HINDI  # Default non-English to Hindi for now


# Singleton instance
sarvam_service = SarvamService()
