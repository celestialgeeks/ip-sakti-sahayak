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

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors (NIM model dim, e.g. 2048).
        """
        if settings.NVIDIA_NIM_API_KEY:
            resp = await _fresh_client().embeddings.create(
                model=self.embed_model, input=texts,
            )
            return [row.embedding for row in resp.data]
        if self.local_embedder:
            embeddings = self.local_embedder.encode(texts)
            return embeddings.tolist()
        return []

    async def embed_single(self, text: str) -> List[float]:
        """Generate embedding for a single text (NIM first, local fallback)."""
        if settings.NVIDIA_NIM_API_KEY:
            resp = await _fresh_client().embeddings.create(
                model=self.embed_model, input=[text],
            )
            return resp.data[0].embedding
        if self.local_embedder:
            embedding = self.local_embedder.encode(text)
            return embedding.tolist()
        return []


# Singleton instance
nim_service = NvidiaIMService()
