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
        "meta/llama-3.1-8b-instruct",
        "meta/llama3-chatqa-1.5-70b",
        "nvidia/llama-3.1-nemotron-70b-instruct",
        "mistralai/mistral-large-2-instruct",
        "ibm/granite-3.0-8b-instruct",
        "meta/llama2-70b"
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
            print(res.choices[0].message.content)
            return
        except Exception as e:
            print(f"FAILED: {model} -> {e}")

asyncio.run(main())
