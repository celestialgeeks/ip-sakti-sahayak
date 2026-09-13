import asyncio
import sys
from openai import AsyncOpenAI

API_KEY = "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"
BASE_URL = "https://integrate.api.nvidia.com/v1"

async def test_embeds():
    client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)
    
    models = [
        "nvidia/embed-qa-4",
        "snowflake/arctic-embed-l",
        "nvidia/nv-embedqa-mistral-7b-v2",
        "nvidia/nemotron-3-embed-1b"
    ]
    
    for model in models:
        try:
            resp = await client.embeddings.create(
                model=model,
                input=["Test phrase"]
            )
            print(f"✅ {model} works! Dimension: {len(resp.data[0].embedding)}")
        except Exception as e:
            print(f"❌ {model} failed: {e}")

async def test_llms():
    client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)
    
    models = [
        "nvidia/llama-3.1-nemotron-51b-instruct",
        "nvidia/nemotron-4-340b-instruct"
    ]
    
    for model in models:
        try:
            resp = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=5
            )
            print(f"✅ {model} works!")
        except Exception as e:
            print(f"❌ {model} failed: {e}")

async def main():
    print("Testing embeddings...")
    await test_embeds()
    print("\nTesting LLMs...")
    await test_llms()

asyncio.run(main())
