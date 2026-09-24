"""
Supabase Authentication Dependency
Verifies the JWT token from the Authorization header.

Security model:
- If a bearer token is present it MUST pass signature verification
  (HS256 against JWT_SECRET). Unsigned/unverifiable tokens are rejected —
  we never decode unverified payloads, which would allow trivial auth bypass.
- If no token is present, anonymous access is allowed where the route
  opts in via `get_optional_user_id`; routes that require login use
  `get_required_user_id`.
"""

from typing import Any, Dict, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings

security = HTTPBearer(auto_error=False)


def verify_supabase_jwt(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """
    Verify a Supabase JWT. Returns the payload only if the signature and
    claims check out; raises 401 for invalid tokens; returns None when no
    token was supplied.
    """
    if not credentials or not credentials.credentials:
        return None

    if not settings.JWT_SECRET:
        # A token was sent but we cannot verify it — fail closed.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured on this server (JWT_SECRET missing).",
        )

    try:
        return jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"require": ["exp"]},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_optional_user_id(payload: Optional[Dict[str, Any]] = Depends(verify_supabase_jwt)) -> Optional[str]:
    """Extract the user ID (sub) if the caller presented a valid token."""
    return payload.get("sub") if payload else None


def get_current_user_id(payload: Optional[Dict[str, Any]] = Depends(verify_supabase_jwt)) -> str:
    """Require an authenticated user; 401 otherwise."""
    if not payload or not payload.get("sub"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return payload["sub"]
