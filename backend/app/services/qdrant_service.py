"""
Qdrant Service — Vector database operations for RAG.
"""

from typing import List, Optional, Dict, Any
import json

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qmodels

from app.config import settings
from app.models.enums import QdrantCollection

class QdrantService:
    """Client for Qdrant vector database operations (using qdrant-client)."""

    def __init__(self):
        self.embed_dim = settings.NVIDIA_EMBED_DIMENSIONS
        
        # Determine if we should use gRPC based on the URL (Qdrant Cloud uses gRPC on 6334)
        url = settings.QDRANT_URL.rstrip("/")
        use_grpc = "6334" in url or "grpc" in url.lower()
        
        self.client = AsyncQdrantClient(
            url=url,
            api_key=settings.QDRANT_API_KEY,
            prefer_grpc=use_grpc,
            timeout=60.0
        )

    async def ensure_collections(self):
        """Create all required collections if they don't exist."""
        try:
            # Qdrant client provides get_collections
            collections_response = await self.client.get_collections()
            existing = {c.name for c in collections_response.collections}
            
            for collection in QdrantCollection:
                if collection.value in existing:
                    continue
                try:
                    await self.client.create_collection(
                        collection_name=collection.value,
                        vectors_config=qmodels.VectorParams(
                            size=self.embed_dim,
                            distance=qmodels.Distance.COSINE
                        )
                    )
                    print(f"✅ Created collection: {collection.value}")
                except Exception as e:
                    print(f"⚠️ Could not create {collection.value}: {e}")
        except Exception as e:
            print(f"Error ensuring collections: {e}")

    async def get_collection_stats(self) -> dict:
        """Get total points across all collections."""
        total_points = 0
        try:
            collections_response = await self.client.get_collections()
            for c in collections_response.collections:
                try:
                    coll_info = await self.client.get_collection(c.name)
                    total_points += coll_info.points_count
                except Exception:
                    pass
        except Exception as e:
            print(f"Error fetching stats: {e}")
            
        return {
            "total_points": total_points,
            "estimated_documents": total_points // 10 if total_points > 0 else 0
        }

    async def upsert_documents(
        self,
        collection: str,
        ids: List[str],
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]],
    ):
        """
        Upsert document chunks into a Qdrant collection.
        """
        points = [
            qmodels.PointStruct(id=doc_id, vector=vector, payload=payload)
            for doc_id, vector, payload in zip(ids, vectors, payloads)
        ]
        await self.client.upsert(
            collection_name=collection,
            points=points
        )

    async def search(
        self,
        collection: str,
        query_vector: List[float],
        limit: int = 10,
        jurisdiction_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents in a Qdrant collection.
        """
        must_conditions = []
        if jurisdiction_filter:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="jurisdiction",
                    match=qmodels.MatchValue(value=jurisdiction_filter)
                )
            )
        if category_filter:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="category",
                    match=qmodels.MatchValue(value=category_filter)
                )
            )

        filter_obj = qmodels.Filter(must=must_conditions) if must_conditions else None

        try:
            hits = await self.client.search(
                collection_name=collection,
                query_vector=query_vector,
                limit=limit,
                query_filter=filter_obj,
                with_payload=True
            )
        except Exception as e:
            if "not found" in str(e).lower():
                raise LookupError(f"collection not found: {collection}")
            raise

        return [
            {
                "id": str(hit.id),
                "score": hit.score,
                "text": hit.payload.get("text", ""),
                "source": hit.payload.get("source", ""),
                "jurisdiction": hit.payload.get("jurisdiction", ""),
                "category": hit.payload.get("category", ""),
                "confidence_tier": hit.payload.get("confidence_tier", ""),
                "metadata": hit.payload or {},
            }
            for hit in hits
        ]

    async def search_across_collections(
        self,
        query_vector: List[float],
        jurisdiction: str = "india",
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Search across all relevant collections based on jurisdiction.

        Args:
            query_vector: Query embedding
            jurisdiction: 'india', 'international', or 'both'
            limit: Max results per collection

        Returns:
            Merged and sorted results from all collections.
        """
        # Guard: never send an empty vector to Qdrant — it crashes
        if not query_vector:
            return []

        collections = []
        if jurisdiction in ("india", "both"):
            collections.extend([
                QdrantCollection.INDIA_IP_LAW.value,
                QdrantCollection.INDIA_REGULATORY.value,
                QdrantCollection.INDIA_BIODIVERSITY.value,
                QdrantCollection.INDIA_TKDL.value,
            ])
        if jurisdiction in ("international", "both"):
            collections.extend([
                QdrantCollection.INTERNATIONAL_IP.value,
                QdrantCollection.INTERNATIONAL_MARKET.value,
            ])
        # Always include case law
        collections.append(QdrantCollection.CASE_LAW.value)

        all_results = []
        for coll in collections:
            try:
                results = await self.search(
                    collection=coll,
                    query_vector=query_vector,
                    limit=limit // len(collections) + 1,
                    jurisdiction_filter=jurisdiction if jurisdiction != "both" else None,
                )
                all_results.extend(results)
            except LookupError:
                # Ephemeral Qdrant was wiped (free-tier sleep/restart):
                # reseed just this collection, then retry once.
                try:
                    from app.core.seed import seed_collection

                    print(f"🔄 {coll} missing, reseeding on demand...")
                    await seed_collection(coll)
                    results = await self.search(
                        collection=coll,
                        query_vector=query_vector,
                        limit=limit // len(collections) + 1,
                        jurisdiction_filter=jurisdiction if jurisdiction != "both" else None,
                    )
                    all_results.extend(results)
                except Exception as e:
                    print(f"⚠️ Error searching {coll}: {e}")
            except Exception as e:
                print(f"⚠️ Error searching {coll}: {e}")

        # Sort by score descending, take top-k
        all_results.sort(key=lambda x: x["score"], reverse=True)
        return all_results[:limit]


# Singleton instance
qdrant_service = QdrantService()
