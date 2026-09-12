import re

with open("app/services/nvidia_nim.py", "r") as f:
    content = f.read()

content = content.replace(
    "async def generate(\n        self,\n        messages: list[dict],\n        temperature: float = 0.3,\n        max_tokens: int = 1024,\n        stream: bool = False,\n    ) -> str | AsyncGenerator[str, None]:",
    "async def generate(\n        self,\n        messages: list[dict],\n        temperature: float = 0.3,\n        max_tokens: int = 1024,\n        stream: bool = False,\n        api_key: str = None,\n    ) -> str | AsyncGenerator[str, None]:"
)
content = content.replace(
    "response = await self.client.chat.completions.create(",
    "client = AsyncOpenAI(api_key=api_key, base_url=settings.NVIDIA_NIM_BASE_URL) if api_key else self.client\n        response = await client.chat.completions.create("
)
content = content.replace(
    "async def embed_single(self, text: str) -> List[float]:",
    "async def embed_single(self, text: str, api_key: str = None) -> List[float]:"
)

with open("app/services/nvidia_nim.py", "w") as f:
    f.write(content)
