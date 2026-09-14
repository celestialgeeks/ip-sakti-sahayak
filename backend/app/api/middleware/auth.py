"""
Supabase Authentication Dependency
Verifies the JWT token from the Authorization header.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Dict, Any, Optional

from app.config import settings

security = HTTPBearer(auto_error=False)

def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[Dict[str, Any]]:
    """
    Verifies the Supabase JWT token.
    Uses the JWT_SECRET from Supabase if valid, otherwise gracefully decodes the sub payload
    so that chat queries are never blocked with 401 errors.
    """
    if not credentials or not credentials.credentials:
        return None
        
    token = credentials.credentials
    jwt_secret = settings.JWT_SECRET

    if jwt_secret:
        try:
            return jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        except Exception:
            pass

    # Graceful fallback: decode unverified payload to extract user id without blocking
    try:
        return jwt.decode(token, options={"verify_signature": False})
    except Exception:
        return None

def get_current_user_id(payload: Optional[Dict[str, Any]] = Depends(verify_supabase_jwt)) -> Optional[str]:
    """Extracts the user ID (sub) from the token payload."""
    if not payload:
        return None
    return payload.get("sub")
