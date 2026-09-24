"""
Pytest configuration and shared fixtures for IP-SAKTI Sahayak backend tests.
Mocks external services (NVIDIA NIM, Qdrant, Sarvam AI, Supabase) for fast,
deterministic, offline test execution.
"""

import pytest
import pytest_asyncio
from typing import AsyncGenerator, Dict, Any, List
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.models.enums import Language, ConfidenceLevel, Jurisdiction


@pytest.fixture
def sample_context_chunks() -> List[Dict[str, Any]]:
    """Sample knowledge corpus chunks simulating Qdrant search results."""
    return [
        {
            "id": "patents_act_3p",
            "text": (
                "Section 3(p) of the Patents Act, 1970 explicitly states that an invention which in effect "
                "is traditional knowledge or which is an aggregation or duplication of known properties "
                "of traditionally known component or components is not patentable."
            ),
            "source": "The Patents Act, 1970 (Section 3(p))",
            "score": 0.94,
            "jurisdiction": "india",
            "category": "ip_law",
            "confidence_tier": "primary_legislation",
        },
        {
            "id": "tkdl_prior_art_turmeric",
            "text": (
                "TKDL Prior Art Archive reference: Curcuma longa (Haridra/Turmeric) documentation for "
                "wound healing, inflammation, and blood purification in Charaka Samhita (Sutra Sthana) "
                "and Bhavaprakasha Nighantu. Defensive publication against non-novel patent claims."
            ),
            "source": "Traditional Knowledge Digital Library (TKDL)",
            "score": 0.89,
            "jurisdiction": "india",
            "category": "tkdl",
            "confidence_tier": "primary_legislation",
        },
        {
            "id": "biodiversity_act_sec3",
            "text": (
                "Section 3 of the Biological Diversity Act, 2002 mandates that persons who are not Indian citizens "
                "or entities having non-Indian participation cannot obtain biological resources occurring in India "
                "or knowledge associated thereto for research or commercial utilisation without prior approval of NBA."
            ),
            "source": "Biological Diversity Act, 2002 (National Biodiversity Authority)",
            "score": 0.82,
            "jurisdiction": "india",
            "category": "biodiversity",
            "confidence_tier": "primary_legislation",
        },
    ]


@pytest.fixture
def mock_nim_service():
    """Mock NVIDIA NIM service for LLM text generation and embeddings."""
    mock = MagicMock()
    # Mock embedding to return a 2048-dimensional dummy vector
    mock.embed_single = AsyncMock(return_value=[0.05] * 2048)
    mock.embed_batch = AsyncMock(return_value=[[0.05] * 2048])

    async def fake_generate(messages, temperature=0.2, max_tokens=8192, stream=False):
        if stream:
            async def token_generator():
                chunks = [
                    "According to Section 3(p) of the Patents Act, 1970, ",
                    "inventions based on traditional knowledge are barred from patentability. ",
                    "The Traditional Knowledge Digital Library (TKDL) documents Haridra (Turmeric) for wound healing. ",
                    "Therefore, lack of novelty objection will be raised unless non-obvious synergistic efficacy is proven."
                ]
                for chunk in chunks:
                    yield chunk
            return token_generator()

        # Check prompt intent query if intent classification
        user_msg = messages[-1]["content"] if messages else ""
        if "strict intent classifier" in user_msg.lower():
            return "relevant"

        return (
            "According to Section 3(p) of the Patents Act, 1970, an invention that is traditional knowledge "
            "cannot be patented. The Traditional Knowledge Digital Library (TKDL) provides prior art defense. "
            "A patent objection will be raised under Section 3(p) unless synergistic activity is demonstrated."
        )

    mock.generate = AsyncMock(side_effect=fake_generate)
    return mock


@pytest.fixture
def mock_qdrant_service(sample_context_chunks):
    """Mock Qdrant vector database operations."""
    mock = MagicMock()
    mock.search_across_collections = AsyncMock(return_value=sample_context_chunks)
    mock.search = AsyncMock(return_value=sample_context_chunks)
    mock.get_collection_stats = AsyncMock(
        return_value={"total_points": 1420, "estimated_documents": 142}
    )
    mock.ensure_collections = AsyncMock(return_value=None)
    mock.upsert_documents = AsyncMock(return_value=None)
    return mock


@pytest.fixture
def mock_sarvam_service():
    """Mock Sarvam AI translation & language detection."""
    mock = MagicMock()
    mock.detect_language = AsyncMock(return_value=Language.ENGLISH)
    mock.translate = AsyncMock(side_effect=lambda text, src, tgt: f"[{tgt.value}] {text}")
    return mock


@pytest.fixture
def mock_supabase_service():
    """Mock Supabase session/chat storage."""
    mock = MagicMock()
    mock.save_session = AsyncMock(return_value=None)
    mock.save_message = AsyncMock(return_value=None)
    return mock


@pytest_asyncio.fixture
async def async_client(
    mock_nim_service,
    mock_qdrant_service,
    mock_sarvam_service,
    mock_supabase_service,
) -> AsyncGenerator[AsyncClient, None]:
    """
    Async HTTP test client bound to the FastAPI application with mocked external services.
    """
    with patch("app.core.rag_pipeline.nim_service", mock_nim_service), \
         patch("app.core.rag_pipeline.qdrant_service", mock_qdrant_service), \
         patch("app.core.rag_pipeline.sarvam_service", mock_sarvam_service), \
         patch("app.core.rag_pipeline.supabase_service", mock_supabase_service), \
         patch("app.api.routes.stats.qdrant_service", mock_qdrant_service):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            yield client
