"""
Qdrant Service — Vector database operations for RAG.
"""

from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient, models
from qdrant_client.http.exceptions import UnexpectedResponse

from app.config import settings
from app.models.enums import QdrantCollection


class QdrantService:
    """Client for Qdrant vector database operations."""

    def __init__(self):
        # Use local file-based Qdrant since Docker is not available in this environment
        self.client = QdrantClient(
            path="./data/qdrant"
        )
        self.embed_dim = settings.NVIDIA_EMBED_DIMENSIONS

    def ensure_collections(self):
        """Create all required collections if they don't exist."""
        for collection in QdrantCollection:
            try:
                self.client.get_collection(collection.value)
            except (UnexpectedResponse, Exception):
                self.client.create_collection(
                    collection_name=collection.value,
                    vectors_config=models.VectorParams(
                        size=self.embed_dim,
                        distance=models.Distance.COSINE,
                    ),
                )
                print(f"✅ Created collection: {collection.value}")

    def upsert_documents(
        self,
        collection: str,
        ids: List[str],
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]],
    ):
        """
        Upsert document chunks into a Qdrant collection.
        
        Args:
            collection: Collection name
            ids: Document chunk IDs
            vectors: Embedding vectors
            payloads: Metadata payloads for each chunk
        """
        points = [
            models.PointStruct(
                id=doc_id,
                vector=vector,
                payload=payload,
            )
            for doc_id, vector, payload in zip(ids, vectors, payloads)
        ]
        self.client.upsert(
            collection_name=collection,
            points=points,
        )

    def search(
        self,
        collection: str,
        query_vector: List[float],
        limit: int = 10,
        jurisdiction_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents in a Qdrant collection.
        
        Args:
            collection: Collection name
            query_vector: Query embedding vector
            limit: Number of results to return
            jurisdiction_filter: Filter by jurisdiction ('india' or 'international')
            category_filter: Filter by IP category
        
        Returns:
            List of search results with scores and payloads.
        """
        # Build filters
        must_conditions = []
        if jurisdiction_filter:
            must_conditions.append(
                models.FieldCondition(
                    key="jurisdiction",
                    match=models.MatchValue(value=jurisdiction_filter),
                )
            )
        if category_filter:
            must_conditions.append(
                models.FieldCondition(
                    key="category",
                    match=models.MatchValue(value=category_filter),
                )
            )

        query_filter = models.Filter(must=must_conditions) if must_conditions else None

        response = self.client.query_points(
            collection_name=collection,
            query=query_vector,
            limit=limit,
            query_filter=query_filter,
        )
        
        results = response.points

        return [
            {
                "id": str(hit.id),
                "score": hit.score,
                "text": hit.payload.get("text", ""),
                "source": hit.payload.get("source", ""),
                "jurisdiction": hit.payload.get("jurisdiction", ""),
                "category": hit.payload.get("category", ""),
                "confidence_tier": hit.payload.get("confidence_tier", ""),
                "metadata": hit.payload,
            }
            for hit in results
        ]

    def search_across_collections(
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
                results = self.search(
                    collection=coll,
                    query_vector=query_vector,
                    limit=limit // len(collections) + 1,
                    jurisdiction_filter=jurisdiction if jurisdiction != "both" else None,
                )
                all_results.extend(results)
            except Exception as e:
                print(f"⚠️ Error searching {coll}: {e}")

        # Sort by score descending, take top-k
        all_results.sort(key=lambda x: x["score"], reverse=True)
        return all_results[:limit]


# Singleton instance
qdrant_service = QdrantService()
