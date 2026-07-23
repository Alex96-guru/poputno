"""Listing persistence.

A listing always belongs to a user, and every response carries the slice of
that user's profile a card needs, so the client never has to join them itself.
"""

import json
import sqlite3
import uuid
from datetime import date, datetime, timezone

from cities import coordinates
from db import connect
from schemas import Listing, ListingAuthor, age_on

_COLUMNS = (
    "category",
    "author_kind",
    "seeking",
    "origin",
    "destinations",
    "description",
    "start_date",
    "end_date",
    "finance",
    "trip_type",
    "smoking",
    "height",
    "languages",
    "remind",
    "interests",
    "age_min",
    "age_max",
    "nearby",
    "hosting_role",
    "origin_lat",
    "origin_lon",
)

_JSON_COLUMNS = ("destinations", "languages", "interests")


def _to_author(row: sqlite3.Row) -> ListingAuthor:
    # Empty for accounts created before the profile carried a birth date.
    birth = row["birth_date"]
    return ListingAuthor(
        id=row["author_id"],
        name=row["name"],
        username=row["username"],
        age=age_on(date.fromisoformat(birth)) if birth else None,
        avatar_url=row["avatar_url"],
        city=row["city"],
        interests=json.loads(row["author_interests"]),
        rating=row["rating"],
        reviews_count=row["reviews_count"],
    )


def to_listing(row: sqlite3.Row) -> Listing:
    return Listing(
        id=row["id"],
        author=_to_author(row),
        category=row["category"],
        author_kind=row["author_kind"],
        seeking=row["seeking"],
        origin=row["origin"],
        destinations=json.loads(row["destinations"]),
        description=row["description"],
        start_date=row["start_date"],
        end_date=row["end_date"],
        finance=row["finance"],
        trip_type=row["trip_type"],
        smoking=row["smoking"],
        height=row["height"],
        languages=json.loads(row["languages"]),
        remind=bool(row["remind"]),
        interests=json.loads(row["interests"]),
        age_min=row["age_min"],
        age_max=row["age_max"],
        nearby=bool(row["nearby"]),
        hosting_role=row["hosting_role"],
        created_at=row["created_at"],
        origin_lat=row["origin_lat"],
        origin_lon=row["origin_lon"],
    )


# The author's profile travels with every row so to_listing needs no second read.
_SELECT = """
SELECT l.*, u.name, u.username, u.avatar_url, u.city, u.birth_date,
       u.interests AS author_interests, u.rating, u.reviews_count
FROM listings l
JOIN users u ON u.id = l.author_id
"""


def create(author_id: str, payload: dict[str, object]) -> sqlite3.Row:
    values = {k: payload.get(k) for k in _COLUMNS}
    for key in _JSON_COLUMNS:
        values[key] = json.dumps(values[key] or [], ensure_ascii=False)
    values["remind"] = int(bool(values["remind"]))
    values["nearby"] = int(bool(values["nearby"]))

    # Pin the origin on the map once, so the radius filter never geocodes.
    point = coordinates(str(payload.get("origin") or ""))
    values["origin_lat"], values["origin_lon"] = point or (None, None)

    listing_id = uuid.uuid4().hex
    with connect() as conn:
        conn.execute(
            f"""
            INSERT INTO listings (id, author_id, created_at, {", ".join(_COLUMNS)})
            VALUES (?, ?, ?, {", ".join("?" for _ in _COLUMNS)})
            """,
            (
                listing_id,
                author_id,
                datetime.now(timezone.utc).isoformat(timespec="seconds"),
                *(values[k] for k in _COLUMNS),
            ),
        )
        return conn.execute(
            f"{_SELECT} WHERE l.id = ?", (listing_id,)
        ).fetchone()


def backfill_coordinates() -> int:
    """Pin listings created before the origin was resolved to a point.

    Idempotent: it only touches rows whose coordinates are still unset, so it
    is safe to run on every start. Returns how many rows it filled.
    """
    with connect() as conn:
        pending = conn.execute(
            "SELECT id, origin FROM listings WHERE origin_lat IS NULL AND origin <> ''"
        ).fetchall()
        filled = 0
        for row in pending:
            point = coordinates(row["origin"])
            if point is None:
                continue
            conn.execute(
                "UPDATE listings SET origin_lat = ?, origin_lon = ? WHERE id = ?",
                (*point, row["id"]),
            )
            filled += 1
        return filled


def get(listing_id: str) -> sqlite3.Row | None:
    with connect() as conn:
        return conn.execute(f"{_SELECT} WHERE l.id = ?", (listing_id,)).fetchone()


def list_all(limit: int = 60) -> list[sqlite3.Row]:
    with connect() as conn:
        return conn.execute(
            f"{_SELECT} ORDER BY l.created_at DESC LIMIT ?", (limit,)
        ).fetchall()


def list_by_author(author_id: str) -> list[sqlite3.Row]:
    with connect() as conn:
        return conn.execute(
            f"{_SELECT} WHERE l.author_id = ? ORDER BY l.created_at DESC",
            (author_id,),
        ).fetchall()


def delete(listing_id: str, author_id: str) -> bool:
    """Remove a listing. Returns False when it is missing or not the caller's."""
    with connect() as conn:
        cursor = conn.execute(
            "DELETE FROM listings WHERE id = ? AND author_id = ?",
            (listing_id, author_id),
        )
        return cursor.rowcount > 0


# ------------------------------------------------------------------ saved


class SaveError(Exception):
    """Raised when a save cannot be performed, carrying a machine-readable code."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


def save(user_id: str, listing_id: str) -> None:
    """Add a listing to the user's saved set. Idempotent.

    Raises SaveError("not_found") if the listing is gone and SaveError("own")
    if it belongs to the user — you cannot save your own listing.
    """
    with connect() as conn:
        row = conn.execute(
            "SELECT author_id FROM listings WHERE id = ?", (listing_id,)
        ).fetchone()
        if row is None:
            raise SaveError("not_found")
        if row["author_id"] == user_id:
            raise SaveError("own")
        conn.execute(
            "INSERT OR IGNORE INTO saved_listings (user_id, listing_id, created_at)"
            " VALUES (?, ?, ?)",
            (
                user_id,
                listing_id,
                datetime.now(timezone.utc).isoformat(timespec="seconds"),
            ),
        )


def unsave(user_id: str, listing_id: str) -> None:
    """Remove a listing from the saved set. A no-op if it was not saved."""
    with connect() as conn:
        conn.execute(
            "DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?",
            (user_id, listing_id),
        )


def saved_ids(user_id: str) -> list[str]:
    """The ids the user has saved, for hydrating the heart icons."""
    with connect() as conn:
        return [
            r["listing_id"]
            for r in conn.execute(
                "SELECT listing_id FROM saved_listings WHERE user_id = ?",
                (user_id,),
            )
        ]


def list_saved(user_id: str) -> list[sqlite3.Row]:
    """Saved listings in newest-saved-first order, skipping any since deleted."""
    with connect() as conn:
        return conn.execute(
            f"""
            {_SELECT}
            JOIN saved_listings s ON s.listing_id = l.id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC
            """,
            (user_id,),
        ).fetchall()
