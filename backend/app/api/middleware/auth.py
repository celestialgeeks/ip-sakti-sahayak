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
    Uses the JWT_SECRET from Supabase (the same one that signs the tokens).
    """
    if not credentials:
        return None # Optional during migration
        
    token = credentials.credentials
    jwt_secret = settings.JWT_SECRET

    if not jwt_secret:
        return None # Fallback for dev without JWT Secret

    try:
        # Supabase uses HS256 by default for its JWTs
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_id(payload: Optional[Dict[str, Any]] = Depends(verify_supabase_jwt)) -> Optional[str]:
    """Extracts the user ID (sub) from the verified token payload."""
    if not payload:
        return None
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject (user ID)"
        )
    return sub
