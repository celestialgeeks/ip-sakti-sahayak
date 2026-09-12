"""
Ingest Documents — Read corpus files, chunk, embed, and store in Qdrant.

Usage:
    python -m scripts.ingest_documents
"""

import os
import sys
import json
import asyncio
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.services.nvidia_nim import nim_service
from app.services.qdrant_service import qdrant_service
from app.utils.text_processing import chunk_text


# Map subdirectories to Qdrant collection names
COLLECTION_MAP = {
    "india_ip": "india_ip_law",
    "india_regulatory": "india_regulatory",
    "india_biodiversity": "india_biodiversity",
    "india_tkdl": "india_tkdl",
    "international_ip": "international_ip",
    "case_law": "case_law",
}

DATA_DIR = Path(__file__).parent.parent / "data" / "corpus"


async def ingest_directory(subdir: str, collection: str):
    """Ingest all .txt files from a corpus subdirectory."""
    dir_path = DATA_DIR / subdir
    if not dir_path.exists():
        print(f"  ⏭️  Skipping {subdir} (directory not found)")
        return 0

    txt_files = list(dir_path.glob("*.txt"))
    if not txt_files:
        print(f"  ⏭️  Skipping {subdir} (no .txt files)")
        return 0

    total_chunks = 0

    for filepath in txt_files:
        # Skip metadata files
        if filepath.name.endswith(".meta.json"):
            continue

        # Read document
        text = filepath.read_text(encoding="utf-8")

        # Read metadata if available
        meta_path = filepath.with_suffix(filepath.suffix + ".meta.json")
        metadata = {}
        if meta_path.exists():
            metadata = json.loads(meta_path.read_text(encoding="utf-8"))

        # Chunk the document
        chunks = chunk_text(
            text=text,
            chunk_size=settings.RAG_CHUNK_SIZE,
            chunk_overlap=settings.RAG_CHUNK_OVERLAP,
            metadata={
                "source": metadata.get("source", filepath.stem),
                "jurisdiction": metadata.get("jurisdiction", "india"),
                "category": metadata.get("category", "general"),
                "confidence_tier": metadata.get("confidence_tier", "commentary"),
                "filename": filepath.name,
            },
        )

        if not chunks:
            continue

        # Generate embeddings
        texts = [chunk["text"] for chunk in chunks]
        embeddings = await nim_service.embed(texts)

        # Prepare for Qdrant upsert
        ids = [chunk["id"] for chunk in chunks]
        payloads = [{k: v for k, v in chunk.items() if k != "id"} for chunk in chunks]

        # Upsert to Qdrant
        qdrant_service.upsert_documents(
            collection=collection,
            ids=ids,
            vectors=embeddings,
            payloads=payloads,
        )

        total_chunks += len(chunks)
        print(f"  📄 {filepath.name}: {len(chunks)} chunks")

    return total_chunks


async def main():
    """Run the full ingestion pipeline."""
    print("🔄 IP-SAKTI Sahayak — Document Ingestion")
    print("=" * 60)

    # Ensure Qdrant collections exist
    print("\n📦 Ensuring Qdrant collections...")
    qdrant_service.ensure_collections()

    # Ingest each subdirectory
    grand_total = 0
    for subdir, collection in COLLECTION_MAP.items():
        print(f"\n📁 Processing {subdir} → {collection}...")
        count = await ingest_directory(subdir, collection)
        grand_total += count
        if count > 0:
            print(f"  ✅ {count} chunks ingested into '{collection}'")

    print(f"\n✨ Ingestion complete! {grand_total} total chunks across all collections.")


if __name__ == "__main__":
    asyncio.run(main())
