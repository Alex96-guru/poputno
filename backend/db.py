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

CREATE TABLE IF NOT EXISTS listings (
    id            TEXT PRIMARY KEY,
    author_id     TEXT NOT NULL,
    author_kind   TEXT NOT NULL DEFAULT '',
    seeking       TEXT NOT NULL DEFAULT '',
    origin        TEXT NOT NULL DEFAULT '',
    destinations  TEXT NOT NULL DEFAULT '[]',
    description   TEXT NOT NULL DEFAULT '',
    start_date    TEXT NOT NULL DEFAULT '',
    end_date      TEXT NOT NULL DEFAULT '',
    finance       TEXT NOT NULL DEFAULT '',
    trip_type     TEXT NOT NULL DEFAULT '',
    smoking       TEXT NOT NULL DEFAULT '',
    height        INTEGER NOT NULL DEFAULT 0,
    languages     TEXT NOT NULL DEFAULT '[]',
    remind        INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS listings_author ON listings (author_id);

CREATE TABLE IF NOT EXISTS saved_listings (
    user_id     TEXT NOT NULL,
    listing_id  TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS saved_user ON saved_listings (user_id);
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
    # Fields of the "Заполнение профиля" screen. Languages are a JSON list like
    # interests; the single-choice ones store the chosen label, '' when unset.
    "languages": "TEXT NOT NULL DEFAULT '[]'",
    "smoking": "TEXT NOT NULL DEFAULT ''",
    # Centimetres. 0 is "not stated" — the column is NOT NULL like its siblings.
    "height": "INTEGER NOT NULL DEFAULT 0",
    "marital_status": "TEXT NOT NULL DEFAULT ''",
    "children": "TEXT NOT NULL DEFAULT ''",
    "pets": "TEXT NOT NULL DEFAULT ''",
    "university": "TEXT NOT NULL DEFAULT ''",
    "profession": "TEXT NOT NULL DEFAULT ''",
    "music": "TEXT NOT NULL DEFAULT ''",
    # Chosen at registration; also fills "Я" on every listing the user posts.
    "gender": "TEXT NOT NULL DEFAULT ''",
}


# Same idea as _ADDED_COLUMNS, for the listings table.
_ADDED_LISTING_COLUMNS = {
    # Resolved from the origin city on creation; NULL when it is not in the
    # city table, which makes the radius filter fall back to a name match.
    "origin_lat": "REAL",
    "origin_lon": "REAL",
    # ALTER ... DEFAULT backfills existing rows, so listings posted before the
    # three shelves existed become "Путешествия" without a migration step.
    "category": "TEXT NOT NULL DEFAULT 'Путешествия'",
    # Fields of the "Встречи" form: what to do together, who is wanted and
    # whether the meeting is meant to happen near the author.
    "interests": "TEXT NOT NULL DEFAULT '[]'",
    "age_min": "INTEGER NOT NULL DEFAULT 0",
    "age_max": "INTEGER NOT NULL DEFAULT 0",
    "nearby": "INTEGER NOT NULL DEFAULT 0",
    # "В гости": which side of the visit the author is on.
    "hosting_role": "TEXT NOT NULL DEFAULT ''",
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


def _add_missing(conn: sqlite3.Connection, table: str, columns: dict[str, str]) -> None:
    existing = {r["name"] for r in conn.execute(f"PRAGMA table_info({table})")}
    for column, definition in columns.items():
        if column not in existing:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect() as conn:
        conn.executescript(_SCHEMA)
        _add_missing(conn, "users", _ADDED_COLUMNS)
        _add_missing(conn, "listings", _ADDED_LISTING_COLUMNS)
