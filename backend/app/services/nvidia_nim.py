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
            timeout=Timeout(settings.NIM_TIMEOUT_SECONDS, connect=10.0),
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


def _is_transient(err: Exception) -> bool:
    """
    Whether the same model is worth asking again.

    A 404 means the endpoint is no longer deployed and a 4xx means the request is
    wrong, so retrying the same model just burns the caller's patience; those move
    straight to the next model in the chain.
    """
    if isinstance(err, _RETRYABLE):
        return True
    # getattr rather than a direct read: the status attribute has moved between
    # openai major versions, and a predicate that raises while deciding whether an
    # error is retryable would replace the real failure with a confusing one.
    return isinstance(err, APIStatusError) and getattr(err, "status_code", 0) >= 500


class NvidiaIMService:
    """Client for NVIDIA NIM API (LLM + Embeddings)."""

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.NVIDIA_NIM_API_KEY,
            base_url=settings.NVIDIA_NIM_BASE_URL,
        )
        self.llm_model = settings.NVIDIA_LLM_MODEL
        self.embed_model = settings.NVIDIA_EMBED_MODEL
        # Offline fallback only. Building a SentenceTransformer reaches for
        # HuggingFace at import time and the NIM embedding id is not a public repo,
        # so attempting it whenever the cloud is configured only slows the boot and
        # logs a 401 that reads like a real fault.
        self.local_embedder = None
        if not settings.NVIDIA_NIM_API_KEY:
            try:
                from sentence_transformers import SentenceTransformer
                self.local_embedder = SentenceTransformer(self.embed_model)
            except Exception as e:
                logger.warning("Local embedder disabled: %s", e)

    def model_chain(self) -> list[str]:
        """The configured model followed by its fallbacks, in order."""
        return settings.llm_model_chain

    async def generate(
        self,
        messages: list[dict],
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
        stream: bool = False,
    ) -> str | AsyncGenerator[str, None]:
        """
        Generate a response from the LLM.

        Args:
            messages: List of chat messages [{"role": "...", "content": "..."}]
            temperature: Sampling temperature (lower = more deterministic)
            max_tokens: Response budget; defaults to settings.RAG_MAX_TOKENS
            stream: Whether to stream the response

        Returns:
            Generated text or async generator of text chunks.

        Each model in the chain is tried before the next is given up on, because a
        shared serverless endpoint is intermittently 404 or 503 and a single model
        there is a single point of failure on every question.
        """
        if max_tokens is None:
            max_tokens = settings.RAG_MAX_TOKENS
        if stream:
            return self._stream_generate(messages, temperature, max_tokens)

        import asyncio as _aio

        last_err: Optional[Exception] = None
        for model in self.model_chain():
            for attempt in range(settings.NIM_MAX_ATTEMPTS):
                kwargs: dict = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "timeout": settings.NIM_TIMEOUT_SECONDS,
                    # Ask Nemotron / reasoning models to skip their thinking trace.
                    # Not every endpoint honours it, hence the fallback chain.
                    "extra_body": {"chat_template_kwargs": {"enable_thinking": False}},
                }
                try:
                    response = await _nim_client().chat.completions.create(**kwargs)
                    msg = response.choices[0].message
                    content = msg.content
                    if not content:
                        # Reasoning models put the answer in a separate field.
                        content = getattr(msg, "reasoning_content", None) or (
                            msg.model_extra or {}
                        ).get("reasoning_content", "")
                    return content or ""
                except Exception as e:
                    last_err = e
                    transient = _is_transient(e)
                    logger.warning(
                        "NIM chat failed on %s (attempt %d/%d, transient=%s): %r | cause: %r",
                        model, attempt + 1, settings.NIM_MAX_ATTEMPTS, transient,
                        e, getattr(e, "__cause__", None),
                    )
                    if not transient:
                        break  # wrong model or bad request — go straight to the next
                    await _aio.sleep(0.5 * (attempt + 1))
        assert last_err is not None
        raise last_err

    async def _stream_generate(
        self, messages: list[dict], temperature: float, max_tokens: Optional[int] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens, failing over across the model chain."""
        if max_tokens is None:
            max_tokens = settings.RAG_MAX_TOKENS
        client = _nim_client()
        stream = None
        last_err: Optional[Exception] = None

        for model in self.model_chain():
            # `enable_thinking` is a chat-template argument: some endpoints reject
            # the whole request for carrying it, so the plain call is retried once
            # before the model itself is considered unusable.
            attempts = [
                {"extra_body": {"chat_template_kwargs": {"enable_thinking": False}}},
                {},
            ]
            for extra in attempts:
                try:
                    stream = await client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        stream=True,
                        timeout=settings.NIM_TIMEOUT_SECONDS,
                        **extra,
                    )
                    break
                except Exception as e:
                    last_err = e
                    logger.warning("NIM stream open failed on %s: %r", model, e)
                    if not _is_transient(e):
                        break  # not deployed / bad request — try the next model
            if stream is not None:
                break

        if stream is None:
            assert last_err is not None
            raise last_err

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
