"""Rank NIM chat candidates by reliability and time-to-first-token under a tight budget.

A model that cannot answer a 60-token request inside the timeout is unusable for an
interactive chat, however good its prose, so failures are as informative as timings.
"""
import asyncio, statistics, sys, time

sys.path.insert(0, ".")
from app.config import settings  # noqa: E402
from openai import AsyncOpenAI  # noqa: E402

PROMPT = [
    {"role": "system", "content": "You are IP-SAKTI Sahayak, an Ayurveda IP legal assistant."},
    {"role": "user", "content": "Context: Section 3(p) of the Patents Act 1970 bars patents on traditional knowledge; "
     "TKDL documents turmeric wound-healing use.\n\nQuestion: Can a turmeric wound-healing formulation be patented "
     "in India? Answer in under 60 words."},
]
CANDIDATES = [
    "nvidia/nemotron-3-super-120b-a12b",
    "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-nano-3-30b-a3b",
    "nvidia/nemotron-3.5-lightning-30b-a3b",
    "deepseek-ai/deepseek-v4.1-flash",
    "z-ai/glm-5.3-flash",
    "openai/gpt-oss-20b",
    "moonshotai/kimi-k2.6",
    "google/gemma-4-31b-it",
    "ibm/granite-3.0-8b-instruct",
]
ROUNDS = 2
BUDGET = 45.0


async def one(client, model):
    t = time.perf_counter()
    first = None
    chars = 0
    try:
        stream = await client.chat.completions.create(
            model=model, messages=PROMPT, temperature=0.2, max_tokens=120, stream=True, timeout=BUDGET)
        async for ch in stream:
            if not ch.choices:
                continue
            d = ch.choices[0].delta
            if d.content:
                if first is None:
                    first = time.perf_counter() - t
                chars += len(d.content)
        return ("ok", first if first is not None else BUDGET, chars)
    except Exception as e:
        return ("fail", time.perf_counter() - t, type(e).__name__)


async def main():
    client = AsyncOpenAI(api_key=settings.NVIDIA_NIM_API_KEY, base_url=settings.NVIDIA_NIM_BASE_URL, timeout=BUDGET)
    print(f"{ROUNDS} rounds, {BUDGET:.0f}s budget per call\n")
    results = []
    for m in CANDIDATES:
        got = await asyncio.gather(*[one(client, m) for _ in range(ROUNDS)])
        ok = [g for g in got if g[0] == "ok"]
        status = f"{len(ok)}/{ROUNDS} ok"
        if ok:
            med = statistics.median(g[1] for g in ok)
            results.append((med, m, status, max(g[2] for g in ok)))
            print(f"{m:42s} {status:9s} median_ttft={med:5.1f}s chars={max(g[2] for g in ok)}")
        else:
            print(f"{m:42s} {status:9s} {got[0][2]}")
    print("\nRanked usable models (fastest first):")
    for med, m, status, chars in sorted(results):
        print(f"  {med:5.1f}s  {m}  ({status}, {chars} chars)")


asyncio.run(main())
