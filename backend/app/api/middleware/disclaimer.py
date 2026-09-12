"""
Disclaimer Middleware — Ensures every response includes the legal disclaimer.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import json


DISCLAIMER = (
    "This is information, not legal advice. "
    "Verified against Ministry of Ayush & TKDL digital archives. "
    "Validate with registered patent attorneys."
)


class DisclaimerMiddleware(BaseHTTPMiddleware):
    """Injects legal disclaimer into API responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Add disclaimer header to all API responses
        if request.url.path.startswith("/api/"):
            response.headers["X-Legal-Disclaimer"] = DISCLAIMER

        return response
