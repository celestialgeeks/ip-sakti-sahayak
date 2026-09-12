import asyncio
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=os.getenv("NVIDIA_API_KEY")
    )
    models = await client.models.list()
    for m in models.data:
        model = m.id
        print(f"Testing {model}...")
        try:
            res = await client.chat.completions.create(
                model=model,
                messages=[{"role":"user","content":"Hi"}],
                max_tokens=10
            )
            print(f"SUCCESS: {model}")
            return
        except Exception as e:
            if "404" not in str(e) and "410" not in str(e):
                print(f"FAILED: {model} -> {e}")

asyncio.run(main())
