"""
Audit Middleware — Logs all API queries for compliance and analytics.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import time
import logging

logger = logging.getLogger("ipsakti.audit")


class AuditMiddleware(BaseHTTPMiddleware):
    """Logs all API requests for audit trail."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        # Log API requests (exclude health checks)
        if request.url.path.startswith("/api/") and request.url.path != "/api/health":
            duration = time.time() - start_time
            logger.info(
                f"AUDIT | {request.method} {request.url.path} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration:.3f}s | "
                f"Client: {request.client.host if request.client else 'unknown'}"
            )

        return response
