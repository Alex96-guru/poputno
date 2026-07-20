"""SQLite storage for users."""

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

DB_PATH = Path(os.getenv("DATABASE_PATH", Path(__file__).parent / "poputno.db"))

_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash   TEXT NOT NULL,
    name            TEXT NOT NULL,
    username        TEXT NOT NULL UNIQUE COLLATE NOCASE,
    city            TEXT NOT NULL DEFAULT '',
    bio             TEXT NOT NULL DEFAULT '',
    phone           TEXT NOT NULL DEFAULT '',
    avatar_url      TEXT NOT NULL DEFAULT '',
    interests       TEXT NOT NULL DEFAULT '[]',
    rating          REAL NOT NULL DEFAULT 0,
    reviews_count   INTEGER NOT NULL DEFAULT 0,
    email_verified  INTEGER NOT NULL DEFAULT 0,
    phone_verified  INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL
);
"""

# Columns added after the first release. init_db() ALTERs any that a previously
# created database is missing, since CREATE TABLE IF NOT EXISTS skips it.
_ADDED_COLUMNS = {
    # Bumped on password change; a token carrying an older value stops working.
    "token_version": "INTEGER NOT NULL DEFAULT 0",
    "notify_messages": "INTEGER NOT NULL DEFAULT 1",
    "notify_responses": "INTEGER NOT NULL DEFAULT 1",
    "notify_email_digest": "INTEGER NOT NULL DEFAULT 0",
    "notify_news": "INTEGER NOT NULL DEFAULT 0",
    # ISO date (YYYY-MM-DD). Empty for accounts created before the field existed.
    "birth_date": "TEXT NOT NULL DEFAULT ''",
    "privacy_online": "INTEGER NOT NULL DEFAULT 1",
    "privacy_show_age": "INTEGER NOT NULL DEFAULT 1",
    "privacy_in_search": "INTEGER NOT NULL DEFAULT 1",
}


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect() as conn:
        conn.executescript(_SCHEMA)
        existing = {r["name"] for r in conn.execute("PRAGMA table_info(users)")}
        for column, definition in _ADDED_COLUMNS.items():
            if column not in existing:
                conn.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")
