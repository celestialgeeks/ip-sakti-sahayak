"""
Chat latency and model-failover tests.

The pipeline used to make two serial LLM calls per answer against a shared, flaky
serverless endpoint, each with three 120s attempts. Measured on the live service that
was 483s for a 5-token intent label and 232s before the answer's first visible token,
which is what made the chat look dead. These tests pin the shape that replaced it:
one generation call per answer, a chain that moves off a dead model immediately, and
a bounded budget.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from openai import APIConnectionError, APIStatusError

from app.config import Settings, settings
from app.services import nvidia_nim
from app.services.nvidia_nim import NvidiaIMService, _is_transient
from app.services.qdrant_service import QdrantService

RELEVANT = "Can I patent a turmeric and neem formulation for wound healing in India?"


def _chat_payload(query: str) -> dict:
    return {"query": query, "jurisdiction": "india", "language": "en"}


def _http():
    """
    The httpx module the installed openai actually raises against.

    openai 1.x (what requirements.txt pins, so what production runs) uses httpx;
    3.x uses httpx2. Tests build real SDK errors, so they have to use whichever the
    local environment actually resolved rather than assuming the pinned one.
    """
    try:
        import httpx

        return httpx
    except ModuleNotFoundError:  # pragma: no cover - depends on the local venv
        import httpx2

        return httpx2


def _status_error(code: int) -> APIStatusError:
    httpx = _http()
    response = httpx.Response(code, request=httpx.Request("POST", "https://nim.invalid/v1/chat/completions"))
    try:
        return APIStatusError(f"status {code}", request=response.request, response=response)
    except TypeError:  # openai 3.x dropped `request` from the constructor
        return APIStatusError(f"status {code}", response=response, body=None)


def _connection_error() -> APIConnectionError:
    httpx = _http()
    request = httpx.Request("POST", "https://nim.invalid")
    try:  # openai 1.x takes the message positionally
        return APIConnectionError("socket closed", request=request)
    except TypeError:  # openai 3.x made every argument keyword-only
        return APIConnectionError(message="socket closed", request=request)


def _completion(content: str):
    """A chat.completions.create() result for the non-streaming path."""
    message = SimpleNamespace(content=content, model_extra={})
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


def _delta_stream(*texts: str):
    """A streamed response: an async iterator over chunk objects."""
    async def generator():
        for text in texts:
            yield SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])
    return generator()


# ── one model call per answer ────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_a_relevant_answer_makes_exactly_one_llm_call(
    async_client, mock_nim_service, mock_qdrant_service
):
    """
    The intent classifier used to cost a full second round trip per question, then
    return text that was normalised to "relevant" anyway. Ambiguous queries now go
    straight to retrieval, so the answer is the only model call on the path.
    """
    response = await async_client.post("/api/chat", json=_chat_payload(RELEVANT))

    assert response.status_code == 200
    assert mock_nim_service.generate.await_count == 1, (
        "an answer must cost one generation, not a classification plus a generation"
    )
    assert "Section 3(p)" in response.json()["answer"]


@pytest.mark.asyncio
async def test_a_greeting_never_reaches_the_model(async_client, mock_nim_service):
    """Keyword routing must settle pleasantries without spending any model call."""
    response = await async_client.post("/api/chat", json=_chat_payload("Hello"))

    assert response.status_code == 200
    mock_nim_service.generate.assert_not_awaited()
    mock_nim_service.embed_single.assert_not_called()


@pytest.mark.asyncio
async def test_generation_uses_the_configured_budget_not_an_open_ended_one(
    async_client, mock_nim_service, mock_qdrant_service
):
    """An unbounded answer is unbounded waiting, so the cap is a product decision."""
    await async_client.post("/api/chat", json=_chat_payload(RELEVANT))

    assert mock_nim_service.generate.await_args.kwargs["max_tokens"] == settings.RAG_MAX_TOKENS


# ── the model chain ──────────────────────────────────────────────────────────


def test_model_chain_puts_the_primary_first_and_drops_duplicates():
    s = Settings(NVIDIA_LLM_MODEL="a/one", NVIDIA_LLM_FALLBACK_MODELS="a/one, b/two ,, c/three")
    assert s.llm_model_chain == ["a/one", "b/two", "c/three"]


def test_only_server_side_and_network_faults_are_worth_repeating():
    assert _is_transient(_status_error(503)), "congestion can clear"
    assert _is_transient(_connection_error()), "a dropped socket can reconnect"
    assert not _is_transient(_status_error(404)), "a retired endpoint cannot come back mid-request"
    assert not _is_transient(_status_error(400)), "a rejected request will be rejected again"


@pytest.fixture
def nim_chain(monkeypatch):
    """A service whose client records every model it is asked to use, in order."""
    monkeypatch.setattr(nvidia_nim.settings, "NVIDIA_NIM_API_KEY", "test-key", raising=False)
    monkeypatch.setattr(nvidia_nim.settings, "NVIDIA_LLM_MODEL", "primary/model", raising=False)
    monkeypatch.setattr(nvidia_nim.settings, "NVIDIA_LLM_FALLBACK_MODELS", "fallback/model", raising=False)
    monkeypatch.setattr(nvidia_nim.settings, "NIM_MAX_ATTEMPTS", 2, raising=False)

    service = NvidiaIMService()
    tried: list[str] = []

    def wire(handler):
        client = MagicMock()
        client.chat.completions.create = AsyncMock(side_effect=handler)
        monkeypatch.setattr(nvidia_nim, "_nim_client", lambda: client)

    return service, tried, wire


@pytest.mark.asyncio
async def test_a_dead_model_is_abandoned_after_a_single_attempt(nim_chain):
    service, tried, wire = nim_chain

    async def handler(**kwargs):
        tried.append(kwargs["model"])
        if kwargs["model"] == "primary/model":
            raise _status_error(404)
        return _completion("from fallback")

    wire(handler)
    answer = await service.generate([{"role": "user", "content": "q"}])

    assert answer == "from fallback"
    assert tried == ["primary/model", "fallback/model"], "a 404 must not be retried against the same model"


@pytest.mark.asyncio
async def test_congestion_is_retried_then_failed_over(nim_chain):
    service, tried, wire = nim_chain

    async def handler(**kwargs):
        tried.append(kwargs["model"])
        if kwargs["model"] == "primary/model":
            raise _status_error(503)
        return _completion("recovered")

    wire(handler)
    answer = await service.generate([{"role": "user", "content": "q"}])

    assert answer == "recovered"
    assert tried.count("primary/model") == 2, "a transient fault gets its retries, bounded by NIM_MAX_ATTEMPTS"
    assert tried[-1] == "fallback/model"


@pytest.mark.asyncio
async def test_streaming_opens_on_the_first_model_that_answers(nim_chain):
    service, tried, wire = nim_chain

    async def handler(**kwargs):
        tried.append(kwargs["model"])
        if kwargs["model"] == "primary/model":
            raise _status_error(503)
        return _delta_stream("streamed ", "answer")

    wire(handler)
    chunks = [c async for c in service._stream_generate([{"role": "user", "content": "q"}], 0.2, 64)]

    assert "".join(chunks) == "streamed answer"
    assert tried[-1] == "fallback/model"


@pytest.mark.asyncio
async def test_the_offline_embedder_is_not_downloaded_when_the_cloud_is_configured(monkeypatch):
    """
    Constructing the local embedder reaches for HuggingFace at import time and the
    NIM embedding id is not a public repo, so every boot used to pay for a doomed
    download and log a 401 that read like a real fault.
    """
    monkeypatch.setattr(nvidia_nim.settings, "NVIDIA_NIM_API_KEY", "test-key", raising=False)
    sentence_transformers = MagicMock()
    with patch.dict("sys.modules", {"sentence_transformers": sentence_transformers}):
        service = NvidiaIMService()

    assert service.local_embedder is None
    sentence_transformers.SentenceTransformer.assert_not_called()


# ── retrieval ────────────────────────────────────────────────────────────────


def _hit(source: str, score: float) -> dict:
    return {
        "id": source, "text": "t", "source": source, "score": score,
        "jurisdiction": "india", "category": "c", "confidence_tier": "high",
    }


@pytest.fixture
def bare_qdrant():
    """A QdrantService without a client: only the fan-out and merge logic is under test."""
    return QdrantService.__new__(QdrantService)


@pytest.mark.asyncio
async def test_collections_are_searched_concurrently_and_merged(bare_qdrant, monkeypatch):
    """Five awaits in a row measured 2.79s against a 0.35s concurrent floor."""
    inflight = {"now": 0, "peak": 0}

    async def fake_search(collection, query_vector, limit, jurisdiction_filter=None, category_filter=None):
        inflight["now"] += 1
        inflight["peak"] = max(inflight["peak"], inflight["now"])
        await asyncio.sleep(0.01)
        inflight["now"] -= 1
        return [_hit(collection, 0.5)]

    monkeypatch.setattr(bare_qdrant, "search", fake_search)
    results = await bare_qdrant.search_across_collections(
        query_vector=[0.1] * 8, jurisdiction="india", limit=10
    )

    assert len(results) == 5, "four india collections plus case law"
    assert inflight["peak"] > 1, f"searches must overlap, saw peak {inflight['peak']}"


@pytest.mark.asyncio
async def test_a_vanished_collection_is_reseeded_and_retried(bare_qdrant, monkeypatch):
    """Free-tier Qdrant sleeps and loses collections; the answer must not silently lose them."""
    reseeded: list[str] = []

    async def fake_search(collection, query_vector, limit, jurisdiction_filter=None, category_filter=None):
        if collection == "india_tkdl" and "india_tkdl" not in reseeded:
            raise LookupError("no such collection")
        return [_hit(collection, 0.9)]

    async def fake_seed(collection):
        reseeded.append(collection)

    monkeypatch.setattr(bare_qdrant, "search", fake_search)
    with patch("app.core.seed.seed_collection", side_effect=fake_seed):
        results = await bare_qdrant.search_across_collections(
            query_vector=[0.1] * 8, jurisdiction="india", limit=10
        )

    assert reseeded == ["india_tkdl"]
    assert any(r["source"] == "india_tkdl" for r in results), "the reseeded collection must come back"


@pytest.mark.asyncio
async def test_one_unreachable_collection_does_not_sink_the_answer(bare_qdrant, monkeypatch):
    async def fake_search(collection, query_vector, limit, jurisdiction_filter=None, category_filter=None):
        if collection == "india_regulatory":
            raise RuntimeError("cluster unreachable")
        return [_hit(collection, 0.7)]

    monkeypatch.setattr(bare_qdrant, "search", fake_search)
    results = await bare_qdrant.search_across_collections(
        query_vector=[0.1] * 8, jurisdiction="india", limit=10
    )

    assert len(results) == 4, "the other collections still answer; a partial search beats no search"


# ── operability ──────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_health_reports_the_model_actually_running(async_client):
    """
    The blueprint and the service dashboard can disagree about NVIDIA_LLM_MODEL, so
    the effective value has to be readable from outside rather than inferred from a
    file — that ambiguity is what made the slow model hard to diagnose.
    """
    response = await async_client.get("/api/health")

    generation = response.json()["generation"]
    assert generation["model"] == settings.NVIDIA_LLM_MODEL
    assert generation["max_tokens"] == settings.RAG_MAX_TOKENS
    assert generation["fallbacks"] == settings.llm_model_chain[1:]
