"""
Sarvam AI Service — Multilingual translation for Indian languages.
"""

import asyncio
import logging
from typing import Optional

import httpx

from app.config import settings
from app.models.enums import Language

logger = logging.getLogger("app.sarvam")


class SarvamService:
    """Client for Sarvam AI translation API (pooled async HTTP client)."""

    def __init__(self):
        self.base_url = settings.SARVAM_BASE_URL
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def api_key(self) -> str:
        return settings.SARVAM_API_KEY

    def _http(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                headers={
                    "api-subscription-key": self.api_key,
                    "Content-Type": "application/json",
                },
                timeout=httpx.Timeout(30.0, connect=10.0),
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def translate(
        self,
        text: str,
        source_language: Language = Language.ENGLISH,
        target_language: Language = Language.HINDI,
    ) -> str:
        """
        Translate text between English and Indian languages, with retries
        on transient network failures.
        """
        if source_language == target_language:
            return text
        if not self.api_key:
            raise RuntimeError("SARVAM_API_KEY is not configured")

        payload = {
            "input": text,
            "source_language_code": source_language.value,
            "target_language_code": target_language.value,
            "mode": "formal",
            "model": "mayura:v1",
            "enable_preprocessing": True,
        }

        last_err: Optional[Exception] = None
        for attempt in range(3):
            try:
                response = await self._http().post(
                    f"{self.base_url}/translate", json=payload
                )
                if response.status_code == 429 or response.status_code >= 500:
                    raise httpx.TransportError(f"transient {response.status_code}")
                response.raise_for_status()
                return response.json().get("translated_text", text)
            except (httpx.TransportError, httpx.HTTPStatusError) as e:
                last_err = e
                logger.warning("Sarvam translate attempt %d failed: %r", attempt + 1, e)
                await asyncio.sleep(1.0 * (attempt + 1))
        raise last_err  # type: ignore[misc]

    async def detect_language(self, text: str) -> Language:
        """
        Detect the language of input text via Sarvam's predict/detect API,
        falling back to a script-based heuristic when offline/unconfigured.
        """
        stripped = text.strip()
        if not stripped:
            return Language.ENGLISH

        if self.api_key:
            try:
                response = await self._http().post(
                    f"{self.base_url}/predict/detect-transliteration",
                    json={"mode": "detectLanguage", "input": stripped[:500]},
                )
                response.raise_for_status()
                code = (response.json().get("language", "") or "").lower()[:2]
                try:
                    return Language(code)
                except ValueError:
                    pass
            except Exception as e:
                logger.debug("Sarvam language detection unavailable: %r", e)

        # Heuristic fallback: classify by Unicode script ranges.
        return _script_fallback(stripped)


def _script_fallback(text: str) -> Language:
    """Map dominant Unicode script block to a supported Language."""
    ranges = [
        ("\u0900-\u097F", Language.HINDI),      # Devanagari (hi/mr/gu default hi)
        ("\u0B80-\u0BFF", Language.TAMIL),      # Tamil
        ("\u0C00-\u0C7F", Language.TELUGU),     # Telugu
        ("\u0C80-\u0CFF", Language.KANNADA),    # Kannada
        ("\u0D00-\u0D7F", Language.MALAYALAM),  # Malayalam
        ("\u0980-\u09FF", Language.BENGALI),    # Bengali
        ("\u0A00-\u0A7F", Language.PUNJABI),    # Gurmukhi
        ("\u0B00-\u0B7F", Language.ODIA),       # Odia
    ]
    import re as _re

    for rng, lang in ranges:
        pattern = f"[{rng}]"
        count = len(_re.findall(pattern, text))
        if count > len(text) * 0.2:
            return lang
    return Language.ENGLISH


# Singleton instance
sarvam_service = SarvamService()
