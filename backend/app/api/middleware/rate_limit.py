"""
Simple in-memory sliding-window rate limiter middleware.

Protects public, cost-bearing endpoints (/api/chat, /api/translate,
/api/ingest) from abuse. For multi-instance deployments replace the
in-memory store with Redis (interface kept identical for a drop-in swap).
"""

import time
from collections import defaultdict, deque
from typing import Deque, Dict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings

# Paths subject to stricter limiting (LLM / external API cost).
PROTECTED_PREFIXES = ("/api/chat", "/api/translate", "/api/ingest", "/api/classify")


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int | None = None):
        super().__init__(app)
        self.rpm = requests_per_minute or settings.RATE_LIMIT_PER_MINUTE
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)

    @staticmethod
    def _client_key(request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _is_limited(self, key: str, now: float) -> tuple[bool, float]:
        hits = self._hits[key]
        while hits and now - hits[0] >= 60.0:
            hits.popleft()
        if len(hits) >= self.rpm:
            retry_after = 60.0 - (now - hits[0])
            return True, max(retry_after, 1.0)
        hits.append(now)
        return False, 0.0

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        if request.method == "OPTIONS" or not path.startswith(PROTECTED_PREFIXES):
            return await call_next(request)

        limited, retry_after = self._is_limited(self._client_key(request), time.monotonic())
        if limited:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please slow down."},
                headers={"Retry-After": str(int(retry_after))},
            )
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.rpm)
        return response
