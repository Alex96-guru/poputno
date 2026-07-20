"""Password hashing and JWT issuing/verification."""

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import NamedTuple

import jwt

from config import require_secret_key

_ITERATIONS = 200_000
_ALGORITHM = "HS256"

SECRET_KEY = require_secret_key()
TOKEN_TTL = timedelta(days=int(os.getenv("TOKEN_TTL_DAYS", "30")))


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), _ITERATIONS
    ).hex()
    return f"pbkdf2_sha256${_ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt, digest = stored.split("$")
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), int(iterations)
    ).hex()
    return hmac.compare_digest(candidate, digest)


class TokenClaims(NamedTuple):
    user_id: str
    version: int


def create_token(user_id: str, version: int = 0) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": user_id, "ver": version, "iat": now, "exp": now + TOKEN_TTL}
    return jwt.encode(payload, SECRET_KEY, algorithm=_ALGORITHM)


def decode_token(token: str) -> TokenClaims | None:
    """Return the claims carried by the token, or None if it is not valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[_ALGORITHM])
    except jwt.PyJWTError:
        return None
    sub = payload.get("sub")
    if not isinstance(sub, str):
        return None
    version = payload.get("ver", 0)
    return TokenClaims(sub, version if isinstance(version, int) else 0)
