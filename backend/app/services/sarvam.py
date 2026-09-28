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


# Sarvam's translate API rejects bare ISO codes — it only accepts region-tagged
# values ("hi-IN", not "hi"), so the app-wide Language enum is mapped here.
# Note Odia is "od-IN" upstream, not the ISO "or".
_SARVAM_LANGUAGE_CODES: dict[Language, str] = {
    Language.ENGLISH: "en-IN",
    Language.HINDI: "hi-IN",
    Language.TAMIL: "ta-IN",
    Language.TELUGU: "te-IN",
    Language.KANNADA: "kn-IN",
    Language.MALAYALAM: "ml-IN",
    Language.BENGALI: "bn-IN",
    Language.MARATHI: "mr-IN",
    Language.GUJARATI: "gu-IN",
    Language.PUNJABI: "pa-IN",
    Language.ODIA: "od-IN",
    Language.SANSKRIT: "sa-IN",
}


def sarvam_code(language: Language) -> str:
    """Map a Language to the region-tagged code Sarvam expects."""
    return _SARVAM_LANGUAGE_CODES.get(language, f"{language.value}-IN")


# Sarvam's mayura:v1 model rejects inputs over 1000 characters — stricter than the
# 2000-character cap its request schema advertises — so stay below it with headroom.
SARVAM_MAX_CHARS = 900


def _split_within_limit(
    text: str, limit: int = SARVAM_MAX_CHARS
) -> list[str]:
    """
    Break text into pieces of at most `limit` characters, cutting at the most natural
    boundary available (blank line, line break, sentence, clause, word) and leaving
    each separator with the piece that owns it, so joining reproduces the original.
    """
    if len(text) <= limit:
        return [text]

    pieces: list[str] = []
    rest = text
    while rest:
        if len(rest) <= limit:
            pieces.append(rest)
            break
        window = rest[:limit]
        cut = 0
        for sep in ("\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " "):
            idx = window.rfind(sep)
            if idx != -1:
                cut = idx + len(sep)
                break
        if cut <= 0:
            # No boundary at all inside the window: hard slice to keep progressing.
            cut = limit
        pieces.append(rest[:cut])
        rest = rest[cut:]
    return pieces


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

    async def _post_translate(self, payload: dict) -> str:
        """POST one within-limit payload, retrying transient failures only."""
        last_err: Optional[Exception] = None
        for attempt in range(3):
            try:
                response = await self._http().post(
                    f"{self.base_url}/translate", json=payload
                )
                if response.status_code == 429 or response.status_code >= 500:
                    raise httpx.TransportError(f"transient {response.status_code}")
                # Any other 4xx is a request defect — retrying only adds latency.
                response.raise_for_status()
                return response.json().get("translated_text", payload["input"])
            except (httpx.TransportError, httpx.HTTPStatusError) as e:
                last_err = e
                # HTTPStatusError here is a 4xx other than 429, so retrying cannot help.
                if isinstance(e, httpx.HTTPStatusError):
                    logger.warning(
                        "Sarvam translate rejected the request (%s): %s",
                        e.response.status_code,
                        e.response.text[:200],
                    )
                    break
                logger.warning("Sarvam translate attempt %d failed: %r", attempt + 1, e)
                await asyncio.sleep(1.0 * (attempt + 1))
        raise last_err  # type: ignore[misc]

    async def translate(
        self,
        text: str,
        source_language: Language = Language.ENGLISH,
        target_language: Language = Language.HINDI,
    ) -> str:
        """
        Translate text between English and Indian languages, with retries
        on transient network failures.

        Sarvam caps `input` at 2000 characters, so longer answers are translated in
        paragraph-aligned pieces and reassembled — a full RAG answer must not fail
        just because it exceeds one request.
        """
        if source_language == target_language:
            return text
        if not self.api_key:
            raise RuntimeError("SARVAM_API_KEY is not configured")

        pieces = _split_within_limit(text)
        codes = {
            "source_language_code": sarvam_code(source_language),
            "target_language_code": sarvam_code(target_language),
            "mode": "formal",
            "model": "mayura:v1",
            "enable_preprocessing": True,
        }

        if len(pieces) == 1:
            return await self._post_translate({**codes, "input": pieces[0]})

        # Bounded concurrency keeps a long answer to roughly one round trip's worth
        # of extra latency without tripping the plan's rate limit.
        semaphore = asyncio.Semaphore(3)

        async def translate_piece(piece: str) -> str:
            async with semaphore:
                return await self._post_translate({**codes, "input": piece})

        return "".join(await asyncio.gather(*(translate_piece(p) for p in pieces)))

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
