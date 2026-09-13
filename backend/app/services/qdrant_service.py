"""
Qdrant Service — Vector database operations for RAG.
"""

from typing import List, Optional, Dict, Any
import json
import urllib.request
import urllib.error

from app.config import settings
from app.models.enums import QdrantCollection


class QdrantService:
    """Client for Qdrant vector database operations (raw REST via urllib)."""

    def __init__(self):
        self.base_url = settings.QDRANT_URL.rstrip("/")
        self.api_key = settings.QDRANT_API_KEY or None
        self.embed_dim = settings.NVIDIA_EMBED_DIMENSIONS

    def _rest(self, method: str, path: str, body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        data = json.dumps(body).encode() if body is not None else None
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["api-key"] = self.api_key
        req = urllib.request.Request(self.base_url + path, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as e:
            # Missing collection (ingest only seeds dirs that exist) — not fatal
            detail = ""
            try:
                detail = e.read().decode()[:500]
            except Exception:
                pass
            if e.code == 404:
                raise LookupError(f"collection not found: {path}")
            raise RuntimeError(f"Qdrant {e.code} on {path}: {detail}")

    def ensure_collections(self):
        """Create all required collections if they don't exist."""
        existing = set()
        try:
            data = self._rest("GET", "/collections")
            existing = {c["name"] for c in data.get("result", {}).get("collections", [])}
        except Exception:
            pass
        for collection in QdrantCollection:
            if collection.value in existing:
                continue
            try:
                self._rest("PUT", f"/collections/{collection.value}", {
                    "vectors": {"size": self.embed_dim, "distance": "Cosine"}
                })
                print(f"✅ Created collection: {collection.value}")
            except Exception as e:
                print(f"⚠️ Could not create {collection.value}: {e}")

    def get_collection_stats(self) -> dict:
        """Get total points across all collections."""
        total_points = 0
        try:
            data = self._rest("GET", "/collections")
            collections = data.get("result", {}).get("collections", [])
            for c in collections:
                name = c["name"]
                try:
                    c_data = self._rest("GET", f"/collections/{name}")
                    points = c_data.get("result", {}).get("points_count", 0)
                    total_points += points
                except Exception:
                    pass
        except Exception as e:
            print(f"Error fetching stats: {e}")
            
        # Hardcode corpus file count for the prototype or calculate it
        # Since this is a prototype, we can use a realistic estimate based on chunks if needed
        # Assuming avg 50 chunks per PDF, we could say (total_points // 50) + base count.
        # But we'll just return total_points.
        return {
            "total_points": total_points,
            "estimated_documents": total_points // 10 if total_points > 0 else 0
        }

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
            {"id": doc_id, "vector": vector, "payload": payload}
            for doc_id, vector, payload in zip(ids, vectors, payloads)
        ]
        self._rest("PUT", f"/collections/{collection}/points", {"points": points})

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
        # Raw REST via urllib: the qdrant-client SDK transport 404s from
        # Render's egress while plain HTTPS works. Body mirrors Query API.
        must_conditions = []
        if jurisdiction_filter:
            must_conditions.append(
                {"key": "jurisdiction", "match": {"value": jurisdiction_filter}}
            )
        if category_filter:
            must_conditions.append(
                {"key": "category", "match": {"value": category_filter}}
            )

        body: Dict[str, Any] = {"query": query_vector, "limit": limit, "with_payload": True}
        if must_conditions:
            body["filter"] = {"must": must_conditions}

        try:
            data = self._rest("POST", f"/collections/{collection}/points/query", body)
        except RuntimeError as e:
            if "Index required" not in str(e):
                raise
            # Newer Qdrant Query API mandates keyword indexes for filtered
            # fields — create them, then retry once.
            for field in ("jurisdiction", "category"):
                try:
                    self._rest(
                        "PUT", f"/collections/{collection}/index",
                        {"field_name": field, "field_schema": "keyword"},
                    )
                except Exception:
                    pass  # already indexed
            data = self._rest("POST", f"/collections/{collection}/points/query", body)
        points = data.get("result", {}).get("points", [])

        return [
            {
                "id": str(hit["id"]),
                "score": hit["score"],
                "text": (hit.get("payload") or {}).get("text", ""),
                "source": (hit.get("payload") or {}).get("source", ""),
                "jurisdiction": (hit.get("payload") or {}).get("jurisdiction", ""),
                "category": (hit.get("payload") or {}).get("category", ""),
                "confidence_tier": (hit.get("payload") or {}).get(
                    "confidence_tier", ""
                ),
                "metadata": hit.get("payload") or {},
            }
            for hit in points
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
                results = self.search(
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
                    results = self.search(
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
