"""
Request Context — one correlation identity for every backend log line.

A degraded RAG request (empty embedding, skipped grounding, failed audit write) has
to be traceable from the answer a user reports to the server lines that produced it.
This module owns that identity in one place:

* :class:`RequestIdMiddleware` binds a request id into a ``ContextVar`` before the
  rest of the stack runs — the caller's ``X-Request-Id`` when present, otherwise a
  fresh fragment — and echoes it back on the response.
* :class:`RequestIdFilter` stamps that id onto records from the application loggers,
  so one grep over the id returns the whole request path.
* :func:`install_request_id_logging` wires the filter onto those loggers at import
  time, once the API/core/service modules have created them.
"""

import logging
import uuid
from contextvars import ContextVar, Token
from typing import Iterable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Header carrying the correlation id in and out of the API.
REQUEST_ID_HEADER = "X-Request-Id"

# Marker for log lines emitted outside a request (boot, seeding, CLI scripts).
NO_REQUEST_ID = "-"

_request_id: ContextVar[str] = ContextVar("request_id", default=NO_REQUEST_ID)

# Logger-name roots whose records should carry the correlation id. ``app`` covers
# the core/services/api modules, ``ipsakti`` covers the audit trail.
DEFAULT_LOGGER_ROOTS = ("app", "ipsakti")


def get_request_id() -> str:
    """The bound correlation id, or ``NO_REQUEST_ID`` outside a request."""
    return _request_id.get()


def bind_request_id(request_id: str) -> Token:
    """Bind a correlation id to the current context; returns the reset token."""
    return _request_id.set(request_id or NO_REQUEST_ID)


def reset_request_id(token: Token) -> None:
    """Undo a :func:`bind_request_id` for the current context."""
    _request_id.reset(token)


class RequestIdFilter(logging.Filter):
    """Attach the current request id to a log record.

    The id is exposed both as a structured ``record.request_id`` attribute and as
    a ``[req=<id>] `` message prefix, so it survives whichever formatter or capture
    route renders the line. A logger-level filter runs exactly once — for the
    logger that emitted the record — and the prefix check keeps repeated installs
    from stacking.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        request_id = get_request_id()
        record.request_id = request_id
        if (
            request_id != NO_REQUEST_ID
            and isinstance(record.msg, str)
            and not record.msg.startswith("[req=")
        ):
            record.msg = f"[req={request_id}] {record.msg}"
        return True


def install_request_id_logging(logger_roots: Iterable[str] = DEFAULT_LOGGER_ROOTS) -> int:
    """Add :class:`RequestIdFilter` to every existing logger under ``logger_roots``.

    Run this once at application import time, after the API/core/service modules
    have been imported so their module loggers exist. Returns the number of
    loggers patched.
    """
    roots = tuple(logger_roots)
    filter_ = RequestIdFilter()
    patched = 0
    for name, logger in list(logging.Logger.manager.loggerDict.items()):
        # Placeholders for not-yet-imported loggers are not Logger instances.
        if not isinstance(logger, logging.Logger):
            continue
        if not any(name == root or name.startswith(f"{root}.") for root in roots):
            continue
        if any(isinstance(existing, RequestIdFilter) for existing in logger.filters):
            continue
        logger.addFilter(filter_)
        patched += 1
    return patched


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Bind one correlation id per request and echo it back on the response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex[:12]
        request.state.request_id = request_id

        token = bind_request_id(request_id)
        try:
            response = await call_next(request)
        finally:
            reset_request_id(token)

        response.headers[REQUEST_ID_HEADER] = request_id
        return response
