import re

with open("app/core/rag_pipeline.py", "r") as f:
    content = f.read()

content = content.replace(
    "async def run_rag_pipeline(",
    "async def run_rag_pipeline(\n    query: str,\n    jurisdiction: Jurisdiction = Jurisdiction.INDIA,\n    language: Language = Language.ENGLISH,\n    session_id: str | None = None,\n    nvidia_api_key: str | None = None,\n    sarvam_api_key: str | None = None,\n):"
)
content = re.sub(
    r"async def run_rag_pipeline\(\s*query: str,\s*jurisdiction: Jurisdiction = Jurisdiction.INDIA,\s*language: Language = Language.ENGLISH,\s*session_id: str \| None = None,\s*\):",
    "",
    content
)

# And pass it to generate
content = content.replace(
    "answer = await nim_service.generate(messages, temperature=0.3, max_tokens=1024)",
    "answer = await nim_service.generate(messages, temperature=0.3, max_tokens=1024, api_key=nvidia_api_key)"
)
content = content.replace(
    "query_embedding = await nim_service.embed_single(query)",
    "query_embedding = await nim_service.embed_single(query, api_key=nvidia_api_key)"
)

with open("app/core/rag_pipeline.py", "w") as f:
    f.write(content)
