"""Environment configuration.

Values come from real environment variables in production; a local .env file
is loaded for development convenience and is never committed.
"""

import os

from dotenv import load_dotenv

load_dotenv()

# Defaults to "production" on purpose: an unset ENVIRONMENT must not silently
# hand out the insecure development fallbacks below.
ENVIRONMENT = os.getenv("ENVIRONMENT", "production").strip().lower()
IS_DEVELOPMENT = ENVIRONMENT == "development"

SITE_URL = os.getenv("SITE_URL", "https://putigo.ru")

_DEV_ORIGINS = "http://localhost:3000"
_PROD_ORIGINS = "https://putigo.ru,https://www.putigo.ru"

_origins_env = os.getenv(
    "ALLOWED_ORIGINS", _DEV_ORIGINS if IS_DEVELOPMENT else _PROD_ORIGINS
)
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()]


def require_secret_key() -> str:
    """Return the JWT signing key, refusing to run insecurely in production."""
    secret = os.getenv("SECRET_KEY", "").strip()
    if secret:
        return secret
    if IS_DEVELOPMENT:
        return "dev-only-insecure-key-not-for-production"
    raise RuntimeError(
        "SECRET_KEY is not set. Generate one with\n"
        '    python -c "import secrets; print(secrets.token_urlsafe(64))"\n'
        "and set it in the environment before starting the server. "
        "(Set ENVIRONMENT=development to use the local dev fallback.)"
    )
