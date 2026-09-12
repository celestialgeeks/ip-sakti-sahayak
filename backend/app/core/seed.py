"""
Boot-time corpus self-seed.

Render free-tier Qdrant has no disk: every restart/sleep wipes it.
This runs in the FastAPI lifespan hook and reseeds ONLY when a
collection is missing or empty. Embeddings go through NIM (no local
deps), so it works on Render. Deterministic UUID5 point ids make
re-seeds idempotent.
"""

import json
import uuid
from pathlib import Path

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


def _points_count(collection: str) -> int:
    try:
        data = qdrant_service._rest("GET", f"/collections/{collection}")
        return int(data.get("result", {}).get("points_count", 0))
    except Exception:
        return -1  # missing or unreachable


async def seed_corpus_if_empty() -> int:
    """Seed corpus dirs whose collection is missing/empty. Returns chunk count."""
    if not settings.NVIDIA_NIM_API_KEY:
        print("⏭️  Seed skipped: no NVIDIA key (offline dev, Qdrant stays as-is)")
        return 0
    total = 0
    for subdir, collection in COLLECTION_MAP.items():
        d = CORPUS_DIR / subdir
        if not d.exists():
            continue
        if _points_count(collection) > 0:
            continue
        try:
            qdrant_service._rest(
                "PUT", f"/collections/{collection}",
                {"vectors": {"size": settings.NVIDIA_EMBED_DIMENSIONS,
                             "distance": "Cosine"}},
            )
        except Exception:
            pass  # already exists
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
                {
                    "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"{fp.name}:{i}")),
                    "vector": vec,
                    "payload": {k: v for k, v in c.items() if k != "id"},
                }
                for i, (c, vec) in enumerate(zip(chunks, vectors))
            ]
            qdrant_service._rest(
                "PUT", f"/collections/{collection}/points", {"points": points}
            )
            total += len(chunks)
            print(f"  🌱 {fp.name}: {len(chunks)} chunks → {collection}")
    if total:
        print(f"✨ Boot seed complete: {total} chunks")
    else:
        print("✅ Corpus already present, seed skipped")
    return total
