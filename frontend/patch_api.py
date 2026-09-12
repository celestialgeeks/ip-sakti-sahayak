import re

with open("src/lib/api.ts", "r") as f:
    content = f.read()

replacement = """function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const nv = localStorage.getItem("NVIDIA_API_KEY");
    if (nv) headers["x-nvidia-api-key"] = nv;
    const sa = localStorage.getItem("SARVAM_API_KEY");
    if (sa) headers["x-sarvam-api-key"] = sa;
  }
  return headers;
}"""

content = content.replace('const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";', f'const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";\n\n{replacement}')

content = content.replace(
    'headers: { "Content-Type": "application/json" },',
    'headers: getHeaders(),'
)

with open("src/lib/api.ts", "w") as f:
    f.write(content)
