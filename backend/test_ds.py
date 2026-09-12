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
    models_to_test = [
        "deepseek-ai/deepseek-v4-flash-0731",
        "google/gemma-3-12b-it",
        "meta/llama-3.2-11b-vision-instruct"
    ]
    for model in models_to_test:
        print(f"Testing {model}...")
        try:
            res = await client.chat.completions.create(
                model=model,
                messages=[{"role":"user","content":"Hi"}],
                max_tokens=10
            )
            print(f"SUCCESS: {model}")
        except Exception as e:
            print(f"FAILED: {model} -> {e}")

asyncio.run(main())
