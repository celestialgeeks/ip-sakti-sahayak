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
    try:
        res = await client.chat.completions.create(
            model="google/gemma-2b",
            messages=[{"role":"user","content":"Hi"}],
            max_tokens=10
        )
        print("SUCCESS")
        print(res)
    except Exception as e:
        print("FAILED:", e)

asyncio.run(main())
