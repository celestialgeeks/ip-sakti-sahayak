"""Time the pre-generation stages of the RAG pipeline on the real services."""
import asyncio, sys, time

sys.path.insert(0, ".")
from app.services.sarvam import sarvam_service  # noqa: E402
from app.services.nvidia_nim import nim_service  # noqa: E402
from app.services.qdrant_service import qdrant_service  # noqa: E402

Q = "Verify patent novelty for a Haridra (Curcuma longa) wound-healing formulation under TKDL guidelines."


async def timed(label, coro):
    t = time.perf_counter()
    try:
        r = await coro
        extra = ""
        if isinstance(r, list):
            extra = f" n={len(r)}"
        elif hasattr(r, "value"):
            extra = f" -> {r.value}"
        print(f"{label:34s} {time.perf_counter()-t:6.2f}s{extra}")
        return r
    except Exception as e:
        print(f"{label:34s} {time.perf_counter()-t:6.2f}s FAILED {type(e).__name__}: {str(e)[:70]}")
        return None


async def main():
    lang = await timed("sarvam detect_language", sarvam_service.detect_language(Q))
    vec = await timed("nim embed_single", nim_service.embed_single(Q))
    hits = await timed("qdrant 5 collections (serial)", qdrant_service.search_across_collections(
        query_vector=vec or [], jurisdiction="india", limit=10))

    # Same search, one round trip per collection instead of five in a row.
    if vec:
        from app.models.enums import QdrantCollection  # noqa: E402
        colls = [QdrantCollection.INDIA_IP_LAW.value, QdrantCollection.INDIA_REGULATORY.value,
                 QdrantCollection.INDIA_BIODIVERSITY.value, QdrantCollection.INDIA_TKDL.value,
                 QdrantCollection.CASE_LAW.value]
        t = time.perf_counter()
        parts = await asyncio.gather(*[qdrant_service.search(collection=c, query_vector=vec, limit=3) for c in colls])
        print(f"{'qdrant 5 collections (gather)':34s} {time.perf_counter()-t:6.2f}s n={sum(len(p) for p in parts)}")

    t = time.perf_counter()
    try:
        from app.services.ayurveda_service import get_library
        n = len(get_library().grounding_context(Q, limit=3) or "")
        print(f"{'ayurveda library grounding':34s} {time.perf_counter()-t:6.2f}s chars={n}")
    except Exception as e:
        print(f"{'ayurveda library grounding':34s} FAILED {type(e).__name__}: {str(e)[:70]}")


asyncio.run(main())
