"""
Gemini AI Service — LLM inference and embedding generation via Google Gemini API.

File kept as nvidia_nim.py to preserve existing import paths.
Exports: nim_service (backward-compatible singleton).
"""

import logging
from typing import List, Optional, AsyncGenerator

import google.generativeai as genai

from app.config import settings

_log = logging.getLogger("uvicorn.error")


def _configure():
    """Configure the Gemini SDK once."""
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)


_configure()


class NvidiaIMService:
    """
    LLM + embedding service backed by Google Gemini.
    Named NvidiaIMService for import compatibility.
    """

    def __init__(self):
        self.llm_model_name = settings.GEMINI_LLM_MODEL
        self.embed_model_name = settings.GEMINI_EMBED_MODEL

    async def generate(
        self,
        messages: list[dict],
        temperature: float = 0.3,
        max_tokens: int = 1024,
        stream: bool = False,
    ) -> str | AsyncGenerator[str, None]:
        """
        Generate a response from Gemini Flash.

        Args:
            messages: List of chat messages [{"role": "...", "content": "..."}]
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            stream: Not currently used (Gemini async streaming not needed for Render free tier)

        Returns:
            Generated text string.
        """
        import asyncio

        if not settings.GEMINI_API_KEY:
            _log.error("GEMINI_API_KEY is not set — LLM generation skipped.")
            return "I cannot answer at the moment: the AI backend is not configured."

        # Convert from OpenAI-style messages to Gemini format
        system_text = ""
        gemini_history = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                system_text = content
            elif role == "user":
                gemini_history.append({"role": "user", "parts": [content]})
            elif role == "assistant":
                gemini_history.append({"role": "model", "parts": [content]})

        # If there's a system prompt, prepend it to the first user message
        if system_text and gemini_history and gemini_history[0]["role"] == "user":
            gemini_history[0]["parts"][0] = f"{system_text}\n\n{gemini_history[0]['parts'][0]}"

        last_user_msg = ""
        history_to_send = gemini_history
        if gemini_history and gemini_history[-1]["role"] == "user":
            last_user_msg = gemini_history[-1]["parts"][0]
            history_to_send = gemini_history[:-1]

        last_err = None
        for attempt in range(3):
            try:
                model = genai.GenerativeModel(
                    model_name=self.llm_model_name,
                    generation_config=genai.types.GenerationConfig(
                        temperature=temperature,
                        max_output_tokens=max_tokens,
                    ),
                )
                chat = model.start_chat(history=history_to_send)
                # Run sync Gemini call in executor to keep it non-blocking
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None, lambda: chat.send_message(last_user_msg)
                )
                return response.text or ""
            except Exception as e:
                last_err = e
                _log.error(
                    "Gemini LLM attempt %d failed: %r", attempt + 1, e
                )
                await asyncio.sleep(2 * (attempt + 1))

        raise last_err

    async def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts using Gemini text-embedding-004.
        """
        import asyncio

        if not settings.GEMINI_API_KEY:
            _log.warning("GEMINI_API_KEY not set — embeddings skipped.")
            return []
        try:
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: genai.embed_content(
                    model=self.embed_model_name,
                    content=texts,
                    task_type="retrieval_document",
                )
            )
            embeddings = results.get("embedding", [])
            # embed_content with a list returns a list of embeddings
            if embeddings and isinstance(embeddings[0], float):
                # single text returned flat — wrap it
                embeddings = [embeddings]
            return embeddings
        except Exception as e:
            _log.error("Gemini embed failed: %r", e)
            return []

    async def embed_single(self, text: str) -> List[float]:
        """Generate embedding for a single query text using Gemini."""
        import asyncio

        if not settings.GEMINI_API_KEY:
            _log.warning("GEMINI_API_KEY not set — embed_single skipped.")
            return []
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: genai.embed_content(
                    model=self.embed_model_name,
                    content=text,
                    task_type="retrieval_query",
                )
            )
            return result.get("embedding", [])
        except Exception as e:
            _log.error("Gemini embed_single failed: %r", e)
            return []


# Singleton — backward-compatible name
nim_service = NvidiaIMService()
