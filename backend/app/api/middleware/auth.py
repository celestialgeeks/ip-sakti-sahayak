"""
Supabase Authentication Dependency
Verifies the JWT token from the Authorization header.

Security model:
- A bearer token that is present MUST pass signature verification. The unverified
  header is read only to choose which key and algorithm to verify *with*; no claim is
  ever trusted before the signature checks out, so there is no `alg: none` bypass.
- Supabase signs user access tokens with short-lived **ES256** keys published as a
  JWKS on the project URL, while older projects and the API keys use an **HS256**
  shared secret. Both are accepted, each pinned to its own key source. Verifying
  only HS256 against `JWT_SECRET` rejects every ES256 token outright, which is how
  production came to answer signed-in users with `401 Invalid token` while
  anonymous requests worked fine.
- If no token is present, anonymous access is allowed where the route opts in via
  `get_optional_user_id`; routes that require login use `get_current_user_id`.
"""

import logging
from typing import Any, Dict, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings

logger = logging.getLogger("app.auth")

security = HTTPBearer(auto_error=False)

# One client per process: it caches the JWKS set and the resolved keys, so the
# remote fetch happens on the first signed request rather than on every one.
_jwks_client: Optional[jwt.PyJWKClient] = None


def _jwks() -> jwt.PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = jwt.PyJWKClient(settings.supabase_jwks_url, cache_keys=True, timeout=10)
    return _jwks_client


def _unauthorized(reason: str) -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token ({reason})")


def verify_supabase_jwt(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """
    Verify a Supabase JWT. Returns the payload only if the signature and claims
    check out; raises 401 for an invalid token and 503 when the identity provider
    cannot be reached; returns None when no token was supplied.
    """
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    # Header only, and only to pick a key source. The signature is still verified
    # below against a key we fetched from a host we trust.
    try:
        algorithm = jwt.get_unverified_header(token).get("alg")
    except jwt.InvalidTokenError as e:
        logger.warning("Bearer token is not a readable JWT: %r", e)
        raise _unauthorized("malformed") from e

    try:
        if algorithm == "HS256":
            if not settings.JWT_SECRET:
                raise HTTPException(
                    status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Authentication is not configured on this server (JWT_SECRET missing).",
                )
            key = settings.JWT_SECRET
            allowed = ["HS256"]
        elif algorithm == "ES256":
            key = _jwks().get_signing_key_from_jwt(token).key
            allowed = ["ES256"]
        else:
            logger.warning("Unsupported token algorithm %r presented", algorithm)
            raise _unauthorized(f"unsupported algorithm {algorithm!r}")

        return jwt.decode(
            token,
            key,
            algorithms=allowed,
            audience="authenticated",
            options={"require": ["exp"]},
        )
    except HTTPException:
        raise
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Token expired") from e
    except jwt.PyJWKClientError as e:
        # Supabase's keys could not be fetched. That is our outage, not the user's
        # bad credential — answering 401 here would send them into a login loop.
        logger.error("Could not fetch Supabase JWKS from %s: %r", settings.supabase_jwks_url, e)
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify the token: the identity provider is unreachable.",
        ) from e
    except jwt.InvalidSignatureError as e:
        logger.warning("Token signature did not verify: %r", e)
        raise _unauthorized("bad signature") from e
    except jwt.InvalidAlgorithmError as e:
        logger.warning("Token algorithm rejected: %r", e)
        raise _unauthorized("algorithm mismatch") from e
    except jwt.InvalidAudienceError as e:
        # The likeliest way this breaks after a change on Supabase's side, so name it
        # rather than burying it in the generic branch below.
        logger.warning("Token audience rejected: %r", e)
        raise _unauthorized("audience") from e
    except jwt.MissingRequiredClaimError as e:
        logger.warning("Token is missing a required claim: %s", e)
        raise _unauthorized("missing claim") from e
    except jwt.InvalidTokenError as e:
        logger.warning("Token rejected: %r", e)
        raise _unauthorized("unreadable") from e


def get_optional_user_id(payload: Optional[Dict[str, Any]] = Depends(verify_supabase_jwt)) -> Optional[str]:
    """Extract the user ID (sub) if the caller presented a valid token."""
    return payload.get("sub") if payload else None


def get_current_user_id(payload: Optional[Dict[str, Any]] = Depends(verify_supabase_jwt)) -> str:
    """Require an authenticated user; 401 otherwise."""
    if not payload or not payload.get("sub"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return payload["sub"]
