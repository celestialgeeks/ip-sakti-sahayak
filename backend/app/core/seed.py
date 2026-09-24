"""
Boot-time + lazy corpus self-seed.

Render free-tier Qdrant has no disk: every sleep/restart wipes it.
Two hooks cover this:
  1. lifespan → seed_corpus_if_empty() (fast path when data present)
  2. search() → on missing collection, seed_collection() then retry once
Embeddings go through NIM (no local deps). Deterministic UUID5 point
ids make re-seeds idempotent.
"""

import logging

logger = logging.getLogger("app.seed")

import json
import uuid
from pathlib import Path
from qdrant_client.http import models as qmodels

from app.config import settings
from app.services.nvidia_nim import nim_service
from app.services.qdrant_service import qdrant_service
from app.utils.text_processing import chunk_text

CORPUS_DIR = Path(__file__).parent.parent.parent / "data" / "corpus"

COLLECTION_MAP = {
    "india_ip": "india_ip_law",
    "india_regulatory": "india_regulatory",
    "india_biodiversity": "india_biodiversity",
    "india_tkdl": "india_tkdl",
    "international_ip": "international_ip",
    "case_law": "case_law",
}

COLLECTION_TO_SUBDIR = {v: k for k, v in COLLECTION_MAP.items()}


async def _points_count(collection: str) -> int:
    try:
        coll_info = await qdrant_service.client.get_collection(collection)
        return coll_info.points_count
    except Exception:
        return -1  # missing or unreachable


async def seed_collection(collection: str) -> int:
    """Seed one collection from its corpus dir. Returns chunk count."""
    subdir = COLLECTION_TO_SUBDIR.get(collection)
    if subdir is None:
        return 0
    d = CORPUS_DIR / subdir
    if not d.exists() or not settings.NVIDIA_NIM_API_KEY:
        return 0
    try:
        await qdrant_service.client.create_collection(
            collection_name=collection,
            vectors_config=qmodels.VectorParams(
                size=settings.NVIDIA_EMBED_DIMENSIONS,
                distance=qmodels.Distance.COSINE
            )
        )
    except Exception:
        pass  # already exists
    # Query API requires keyword indexes for filtered fields
    for field in ("jurisdiction", "category"):
        try:
            await qdrant_service.client.create_payload_index(
                collection_name=collection,
                field_name=field,
                field_schema=qmodels.PayloadSchemaType.KEYWORD
            )
        except Exception:
            pass  # already indexed
    total = 0
    files = sorted(f for f in d.glob("*.txt") if not f.name.endswith(".meta.json"))
    for fp in files:
        text = fp.read_text(encoding="utf-8")
        meta_path = fp.with_suffix(fp.suffix + ".meta.json")
        meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
        chunks = chunk_text(
            text=text,
            chunk_size=settings.RAG_CHUNK_SIZE,
            chunk_overlap=settings.RAG_CHUNK_OVERLAP,
            metadata={
                "source": meta.get("source", fp.stem),
                "jurisdiction": meta.get("jurisdiction", "india"),
                "category": meta.get("category", "general"),
                "confidence_tier": meta.get("confidence_tier", "commentary"),
                "filename": fp.name,
            },
        )
        if not chunks:
            continue
        vectors = await nim_service.embed([c["text"] for c in chunks])
        points = [
            qmodels.PointStruct(
                id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{fp.name}:{i}")),
                vector=vec,
                payload={k: v for k, v in c.items() if k != "id"}
            )
            for i, (c, vec) in enumerate(zip(chunks, vectors))
        ]
        await qdrant_service.client.upsert(
            collection_name=collection,
            points=points
        )
        total += len(chunks)
        logger.info("  🌱 {fp.name}: {len(chunks)} chunks → {collection}")
    return total


async def seed_corpus_if_empty() -> int:
    """Seed corpus dirs whose collection is missing/empty. Returns chunk count."""
    if not settings.NVIDIA_NIM_API_KEY:
        logger.info("⏭️  Seed skipped: no NVIDIA key (offline dev, Qdrant stays as-is)")
        return 0
    total = 0
    for subdir, collection in COLLECTION_MAP.items():
        if not (CORPUS_DIR / subdir).exists():
            continue
        if await _points_count(collection) > 0:
            continue
        total += await seed_collection(collection)
    if total:
        logger.info("✨ Boot seed complete: {total} chunks")
    else:
        logger.info("✅ Corpus already present, seed skipped")
    return total
