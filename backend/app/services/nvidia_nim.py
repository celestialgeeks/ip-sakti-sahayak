"""
NVIDIA NIM Service — LLM inference and embedding generation.
Uses OpenAI-compatible API via the `openai` Python SDK.
"""

from typing import List, Optional, AsyncGenerator
from openai import AsyncOpenAI

from app.config import settings


def _fresh_client() -> AsyncOpenAI:
    """Fresh client per call — avoids reusing server-closed pooled connections."""
    return AsyncOpenAI(
        api_key=settings.NVIDIA_NIM_API_KEY,
        base_url=settings.NVIDIA_NIM_BASE_URL,
    )


class NvidiaIMService:
    """Client for NVIDIA NIM API (LLM + Embeddings)."""

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.NVIDIA_NIM_API_KEY,
            base_url=settings.NVIDIA_NIM_BASE_URL,
        )
        self.llm_model = settings.NVIDIA_LLM_MODEL
        self.embed_model = settings.NVIDIA_EMBED_MODEL
        try:
            from sentence_transformers import SentenceTransformer
            self.local_embedder = SentenceTransformer(self.embed_model)
        except ImportError:
            self.local_embedder = None

    async def generate(
        self,
        messages: list[dict],
        temperature: float = 0.3,
        max_tokens: int = 1024,
        stream: bool = False,
    ) -> str | AsyncGenerator[str, None]:
        """
        Generate a response from the LLM.
        
        Args:
            messages: List of chat messages [{"role": "...", "content": "..."}]
            temperature: Sampling temperature (lower = more deterministic)
            max_tokens: Maximum tokens in response
            stream: Whether to stream the response
        
        Returns:
            Generated text or async generator of text chunks.
        """
        if stream:
            return self._stream_generate(messages, temperature, max_tokens)

        last_err = None
        for attempt in range(3):
            try:
                response = await _fresh_client().chat.completions.create(
                    model=self.llm_model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    timeout=120,
                )
                msg = response.choices[0].message
                content = msg.content
                if not content:
                    # Reasoning models (e.g. deepseek-v4-flash) put output here
                    content = getattr(msg, "reasoning_content", None) or (
                        msg.model_extra or {}
                    ).get("reasoning_content", "")
                return content or ""
            except Exception as e:
                last_err = e
                import asyncio as _aio
                import logging as _logging

                cause = getattr(e, "__cause__", None)
                _logging.getLogger("uvicorn.error").error(
                    "NIM chat attempt %d failed: %r | cause: %r | cause-cause: %r",
                    attempt + 1, e, cause, getattr(cause, "__cause__", None),
                )
                await _aio.sleep(2 * (attempt + 1))
        raise last_err

    async def _stream_generate(
        self, messages: list[dict], temperature: float, max_tokens: int
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens."""
        stream = await _fresh_client().chat.completions.create(
            model=self.llm_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings via NVIDIA NIM (cloud, no local deps);
        falls back to local SentenceTransformer for offline dev.
        """
        if settings.NVIDIA_NIM_API_KEY:
            try:
                resp = await _fresh_client().embeddings.create(
                    model=self.embed_model, input=texts,
                )
                return [row.embedding for row in resp.data]
            except Exception as e:
                import logging as _log
                _log.getLogger("uvicorn.error").error(
                    "NIM embed failed, falling back to local: %r", e
                )
        if self.local_embedder:
            embeddings = self.local_embedder.encode(texts, show_progress_bar=False)
            return embeddings.tolist()
        return []

    async def embed_single(self, text: str) -> List[float]:
        """Generate embedding for a single text (NIM first, local fallback)."""
        if settings.NVIDIA_NIM_API_KEY:
            try:
                resp = await _fresh_client().embeddings.create(
                    model=self.embed_model, input=[text],
                )
                return resp.data[0].embedding
            except Exception as e:
                import logging as _log
                _log.getLogger("uvicorn.error").error(
                    "NIM embed_single failed, falling back to local: %r", e
                )
        if self.local_embedder:
            embedding = self.local_embedder.encode(text)
            return embedding.tolist()
        return []


# Singleton instance
nim_service = NvidiaIMService()
