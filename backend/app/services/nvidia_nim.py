"""
NVIDIA NIM Service — LLM inference and embedding generation.
Uses OpenAI-compatible API via the `openai` Python SDK.
"""

import logging
from typing import List, Optional, AsyncGenerator

from httpx import HTTPError, RemoteProtocolError, Timeout
from openai import APIConnectionError, APIStatusError, APITimeoutError, AsyncOpenAI

from app.config import settings

logger = logging.getLogger("app.nim")

# Shared async client (connection pooling + keep-alive). Created lazily so the
# API key can be supplied via env after import in tests.
_client: Optional[AsyncOpenAI] = None


def _nim_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.NVIDIA_NIM_API_KEY or "missing-key",
            base_url=settings.NVIDIA_NIM_BASE_URL,
            timeout=Timeout(120.0, connect=10.0),
        )
    return _client


async def close_nim_client() -> None:
    """Close the pooled client on application shutdown."""
    global _client
    if _client is not None:
        await _client.close()
        _client = None


# Errors worth retrying with backoff (transient network/server failures).
_RETRYABLE = (APIConnectionError, APITimeoutError, RemoteProtocolError, HTTPError)


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
        except Exception as e:
            logger.warning("Local embedder disabled: %s", e)
            self.local_embedder = None

    async def generate(
        self,
        messages: list[dict],
        temperature: float = 0.3,
        max_tokens: int = 8192,
        stream: bool = False,
    ) -> str | AsyncGenerator[str, None]:
        """
        Generate a response from the LLM.
        
        Args:
            messages: List of chat messages [{"role": "...", "content": "..."}]
            temperature: Sampling temperature (lower = more deterministic)
            max_tokens: Maximum tokens in response (default 8192 for thorough answers)
            stream: Whether to stream the response
        
        Returns:
            Generated text or async generator of text chunks.
        """
        if stream:
            return self._stream_generate(messages, temperature, max_tokens)

        last_err = None
        for attempt in range(3):
            if last_err is not None and not isinstance(last_err, _RETRYABLE) \
                    and not (isinstance(last_err, APIStatusError) and last_err.status_code >= 500):
                break  # non-transient error — fail fast
            try:
                kwargs: dict = {
                    "model": self.llm_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "timeout": 120,
                }
                # Attempt to disable thinking trace in Nemotron / reasoning models on NIM
                if attempt == 0:
                    kwargs["extra_body"] = {"chat_template_kwargs": {"enable_thinking": False}}
                
                response = await _nim_client().chat.completions.create(**kwargs)
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

                logger.error("NIM chat attempt %d failed: %r | cause: %r",
                             attempt + 1, e, getattr(e, "__cause__", None))
                await _aio.sleep(1.5 * (attempt + 1))
        raise last_err

    async def _stream_generate(
        self, messages: list[dict], temperature: float, max_tokens: int = 8192
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens."""
        client = _nim_client()
        try:
            stream = await client.chat.completions.create(
                model=self.llm_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                extra_body={"chat_template_kwargs": {"enable_thinking": False}},
            )
        except Exception:
            # Fallback without extra_body if not supported
            stream = await client.chat.completions.create(
                model=self.llm_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings via NVIDIA NIM (cloud, no local deps);
        falls back to local SentenceTransformer for offline dev.
        """
        if settings.NVIDIA_NIM_API_KEY:
            try:
                resp = await _nim_client().embeddings.create(
                    model=self.embed_model, input=texts,
                )
                return [row.embedding for row in resp.data]
            except Exception as e:
                logger.error("NIM embed failed, falling back to local: %r", e)
        if self.local_embedder:
            embeddings = self.local_embedder.encode(texts, show_progress_bar=False)
            return embeddings.tolist()
        return []

    async def embed_single(self, text: str) -> List[float]:
        """Generate embedding for a single text (NIM first, local fallback)."""
        if settings.NVIDIA_NIM_API_KEY:
            try:
                resp = await _nim_client().embeddings.create(
                    model=self.embed_model, input=[text],
                )
                return resp.data[0].embedding
            except Exception as e:
                logger.error("NIM embed_single failed, falling back to local: %r", e)
        if self.local_embedder:
            embedding = self.local_embedder.encode(text)
            return embedding.tolist()
        return []


# Singleton instance
nim_service = NvidiaIMService()
