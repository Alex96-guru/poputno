"""Direct messages between two users.

A conversation is just the pair of users, keyed by their two ids sorted and
joined — so the same thread is found whoever opens it. There is no separate
conversations table; the latest row per pair defines the conversation.
"""

import sqlite3
import time
import uuid
from datetime import datetime, timezone

from db import connect

# "Печатает…" is kept in memory rather than the database — it is ephemeral and
# only needs to be right for a few seconds. Keyed by "pair:typist_id" -> monotonic
# time of the last keystroke. (Single-process only; that is fine here.)
_typing: dict[str, float] = {}
TYPING_TTL = 5.0


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def pair_key(a: str, b: str) -> str:
    return ":".join(sorted((a, b)))


def send(
    sender_id: str, recipient_id: str, body: str, image_url: str | None = None
) -> sqlite3.Row:
    message_id = uuid.uuid4().hex
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO messages
                (id, pair, sender_id, recipient_id, body, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                message_id,
                pair_key(sender_id, recipient_id),
                sender_id,
                recipient_id,
                body,
                image_url,
                _now(),
            ),
        )
        return conn.execute(
            "SELECT * FROM messages WHERE id = ?", (message_id,)
        ).fetchone()


def set_typing(typist_id: str, other_id: str) -> None:
    _typing[f"{pair_key(typist_id, other_id)}:{typist_id}"] = time.monotonic()


def is_typing(user_id: str, other_id: str) -> bool:
    """Whether the other party has typed to `user_id` within the TTL."""
    ts = _typing.get(f"{pair_key(user_id, other_id)}:{other_id}")
    return ts is not None and (time.monotonic() - ts) < TYPING_TTL


def list_messages(user_id: str, other_id: str) -> list[sqlite3.Row]:
    with connect() as conn:
        # rowid breaks ties within the same second so order is always stable.
        return conn.execute(
            "SELECT * FROM messages WHERE pair = ? ORDER BY created_at ASC, rowid ASC",
            (pair_key(user_id, other_id),),
        ).fetchall()


def mark_read(user_id: str, other_id: str) -> None:
    """Mark everything the other person sent us as read."""
    with connect() as conn:
        conn.execute(
            "UPDATE messages SET read_at = ?"
            " WHERE recipient_id = ? AND sender_id = ? AND read_at IS NULL",
            (_now(), user_id, other_id),
        )


def unread_total(user_id: str) -> int:
    with connect() as conn:
        row = conn.execute(
            "SELECT COUNT(*) AS n FROM messages"
            " WHERE recipient_id = ? AND read_at IS NULL",
            (user_id,),
        ).fetchone()
        return row["n"]


def list_conversations(user_id: str) -> list[dict[str, object]]:
    """One entry per person the user has messaged, newest first.

    Each carries the other user's card fields, the last message and the count
    of still-unread messages from them.
    """
    with connect() as conn:
        # The other party is whichever side of the row is not the current user.
        rows = conn.execute(
            """
            SELECT
                m.id, m.sender_id, m.recipient_id, m.body, m.image_url,
                m.created_at,
                CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END
                    AS other_id,
                u.name, u.username, u.avatar_url
            FROM messages m
            JOIN users u
              ON u.id = CASE WHEN m.sender_id = ? THEN m.recipient_id
                             ELSE m.sender_id END
            WHERE m.sender_id = ? OR m.recipient_id = ?
            ORDER BY m.created_at DESC, m.rowid DESC
            """,
            (user_id, user_id, user_id, user_id),
        ).fetchall()

        unread = {
            r["other_id"]: r["n"]
            for r in conn.execute(
                "SELECT sender_id AS other_id, COUNT(*) AS n FROM messages"
                " WHERE recipient_id = ? AND read_at IS NULL"
                " GROUP BY sender_id",
                (user_id,),
            )
        }

    conversations: list[dict[str, object]] = []
    seen: set[str] = set()
    for row in rows:  # already newest-first, so the first hit per other is last
        other = row["other_id"]
        if other in seen:
            continue
        seen.add(other)
        conversations.append(
            {
                "user": {
                    "id": other,
                    "name": row["name"],
                    "username": row["username"],
                    "avatarUrl": row["avatar_url"],
                },
                "lastBody": row["body"] or ("📷 Фото" if row["image_url"] else ""),
                "lastAt": row["created_at"],
                "lastMine": row["sender_id"] == user_id,
                "unread": unread.get(other, 0),
            }
        )
    return conversations
