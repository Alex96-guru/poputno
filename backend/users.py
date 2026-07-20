"""User persistence and profile shaping."""

import json
import re
import sqlite3
import uuid
from datetime import date, datetime, timezone

from db import connect
from schemas import (
    CompletenessItem,
    ProfileCompleteness,
    PublicUser,
    User,
    UserSettings,
    age_on,
)
from security import hash_password, verify_password

# Each item contributes an equal share of the completeness percentage shown on
# the profile page.
_COMPLETENESS_FIELDS = (
    ("avatar", "Фото профиля", lambda r: bool(r["avatar_url"])),
    ("bio", "Описание «о себе»", lambda r: bool(r["bio"])),
    ("email", "Почта подтверждена", lambda r: bool(r["email_verified"])),
    ("phone", "Добавить телефон", lambda r: bool(r["phone"])),
)


def _slugify(name: str) -> str:
    translit = str.maketrans(
        {
            "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
            "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
            "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
            "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
            "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
        }
    )
    slug = re.sub(r"[^a-z0-9_]+", "_", name.strip().lower().translate(translit))
    return slug.strip("_") or "user"


def _unique_username(conn: sqlite3.Connection, base: str) -> str:
    candidate = base
    n = 1
    while conn.execute(
        "SELECT 1 FROM users WHERE username = ?", (candidate,)
    ).fetchone():
        n += 1
        candidate = f"{base}_{n}"
    return candidate


def _completeness(row: sqlite3.Row) -> ProfileCompleteness:
    items = [
        CompletenessItem(key=key, label=label, done=check(row))
        for key, label, check in _COMPLETENESS_FIELDS
    ]
    done = sum(1 for i in items if i.done)
    return ProfileCompleteness(
        percent=round(done * 100 / len(items)), items=items
    )


_SETTINGS_FIELDS = (
    "notify_messages",
    "notify_responses",
    "notify_email_digest",
    "notify_news",
    "privacy_online",
    "privacy_show_age",
    "privacy_in_search",
)


def to_settings(row: sqlite3.Row) -> UserSettings:
    return UserSettings(**{f: bool(row[f]) for f in _SETTINGS_FIELDS})


def _age(row: sqlite3.Row) -> int | None:
    """None for accounts predating the field, whose birth_date is ''."""
    if not row["birth_date"]:
        return None
    return age_on(date.fromisoformat(row["birth_date"]))


def to_user(row: sqlite3.Row) -> User:
    return User(
        id=row["id"],
        name=row["name"],
        email=row["email"],
        username=row["username"],
        city=row["city"],
        bio=row["bio"],
        phone=row["phone"],
        birth_date=row["birth_date"],
        # Owners always see their own age, whatever the privacy toggle says.
        age=_age(row),
        avatar_url=row["avatar_url"],
        interests=json.loads(row["interests"]),
        rating=row["rating"],
        reviews_count=row["reviews_count"],
        email_verified=bool(row["email_verified"]),
        phone_verified=bool(row["phone_verified"]),
        created_at=row["created_at"],
        completeness=_completeness(row),
        settings=to_settings(row),
    )


def to_public_user(row: sqlite3.Row) -> PublicUser:
    return PublicUser(
        id=row["id"],
        name=row["name"],
        username=row["username"],
        city=row["city"],
        bio=row["bio"],
        # Honours the "Показывать возраст" privacy toggle.
        age=_age(row) if row["privacy_show_age"] else None,
        avatar_url=row["avatar_url"],
        interests=json.loads(row["interests"]),
        rating=row["rating"],
        reviews_count=row["reviews_count"],
    )


def get_by_id(user_id: str) -> sqlite3.Row | None:
    with connect() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def get_by_email(email: str) -> sqlite3.Row | None:
    with connect() as conn:
        return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def create(
    name: str, email: str, password: str, birth_date: date
) -> sqlite3.Row:
    """Insert a new user. Raises ValueError if the email is already taken."""
    with connect() as conn:
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise ValueError("email_taken")
        user_id = uuid.uuid4().hex
        conn.execute(
            """
            INSERT INTO users
                (id, email, password_hash, name, username, birth_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                email,
                hash_password(password),
                name,
                _unique_username(conn, _slugify(name)),
                birth_date.isoformat(),
                datetime.now(timezone.utc).isoformat(timespec="seconds"),
            ),
        )
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


_UPDATABLE = {
    "name": "name",
    "city": "city",
    "bio": "bio",
    "phone": "phone",
    "birth_date": "birth_date",
    "avatar_url": "avatar_url",
    "interests": "interests",
}


def update(user_id: str, changes: dict[str, object]) -> sqlite3.Row | None:
    fields = {k: v for k, v in changes.items() if k in _UPDATABLE and v is not None}
    if "interests" in fields:
        fields["interests"] = json.dumps(fields["interests"], ensure_ascii=False)
    if "birth_date" in fields:
        # sqlite3 has no date type, and its implicit adapters are deprecated.
        fields["birth_date"] = fields["birth_date"].isoformat()

    with connect() as conn:
        if fields:
            assignments = ", ".join(f"{_UPDATABLE[k]} = ?" for k in fields)
            conn.execute(
                f"UPDATE users SET {assignments} WHERE id = ?",
                (*fields.values(), user_id),
            )
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def update_settings(user_id: str, changes: dict[str, object]) -> sqlite3.Row | None:
    fields = {
        k: int(bool(v))
        for k, v in changes.items()
        if k in _SETTINGS_FIELDS and v is not None
    }
    with connect() as conn:
        if fields:
            assignments = ", ".join(f"{k} = ?" for k in fields)
            conn.execute(
                f"UPDATE users SET {assignments} WHERE id = ?",
                (*fields.values(), user_id),
            )
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def change_password(user_id: str, current: str, new: str) -> sqlite3.Row:
    """Replace the password, invalidating tokens issued before the change.

    Raises ValueError if the current password does not match.
    """
    with connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if row is None or not verify_password(current, row["password_hash"]):
            raise ValueError("wrong_password")
        conn.execute(
            "UPDATE users SET password_hash = ?, token_version = token_version + 1"
            " WHERE id = ?",
            (hash_password(new), user_id),
        )
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def delete(user_id: str) -> None:
    with connect() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
