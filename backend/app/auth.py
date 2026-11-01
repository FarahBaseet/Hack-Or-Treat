"""Only people signed in to BrainBridge (Clerk) can use the backend."""

from functools import lru_cache

import jwt
from fastapi import HTTPException, WebSocketException, status
from starlette.requests import HTTPConnection

from app.config import settings


@lru_cache
def _jwks_client() -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{settings.clerk_issuer.rstrip('/')}/.well-known/jwks.json")


def _reject(conn: HTTPConnection, message: str) -> Exception:
    if conn.scope["type"] == "websocket":
        return WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason=message)
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=message)


def require_user(conn: HTTPConnection) -> str:
    """Check the Clerk sign-in token. Returns the user id."""
    if not settings.clerk_issuer:
        raise _reject(conn, "Server sign-in is not set up (CLERK_ISSUER missing)")

    header = conn.headers.get("authorization", "")
    token = header[7:] if header.lower().startswith("bearer ") else conn.query_params.get("token")
    if not token:
        raise _reject(conn, "Sign in required")

    try:
        key = _jwks_client().get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer.rstrip("/"),
            leeway=5,
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        raise _reject(conn, "Sign in required")

    # Tokens must come from our own website, not someone else's.
    azp = claims.get("azp")
    if azp and azp.rstrip("/") not in settings.origins:
        raise _reject(conn, "Sign in required")

    return claims["sub"]