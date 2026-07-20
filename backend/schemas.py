import re
from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator

# Strangers travel together through this service, so registration is 18+.
MIN_AGE = 18
MAX_AGE = 120


def age_on(birth: date, today: date | None = None) -> int:
    """Full years lived, counting the birthday itself as the day it turns over."""
    today = today or date.today()
    had_birthday = (today.month, today.day) >= (birth.month, birth.day)
    return today.year - birth.year - (0 if had_birthday else 1)


def _validate_birth_date(v: date) -> date:
    today = date.today()
    if v > today:
        raise ValueError("Дата рождения не может быть в будущем")
    age = age_on(v, today)
    if age < MIN_AGE:
        raise ValueError(f"Сервис доступен с {MIN_AGE} лет")
    if age > MAX_AGE:
        raise ValueError("Проверьте дату рождения — она выглядит неправдоподобно")
    return v



_PHONE_ALLOWED = re.compile(r"^[\d\s()+\-.]+$")
_PHONE_ERROR = "Телефон должен быть в формате +7 900 000-00-00"

# Avatars are stored inline as data URIs, so the column holds a whole (small)
# image. The client downscales to 256x256 JPEG, which lands around 20k chars;
# the cap leaves room for that without accepting a full-size upload.
MAX_AVATAR_CHARS = 200_000


class Person(BaseModel):
    id: str
    name: str
    # None for cards that aren't one person (a couple, a group).
    age: int | None
    company_type: str = Field(..., alias="companyType")
    location: str
    dates: str
    description: str
    rating: float
    photo_url: str = Field(..., alias="photoUrl")

    model_config = {"populate_by_name": True}


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    birth_date: date = Field(..., alias="birthDate")

    model_config = {"populate_by_name": True}

    @field_validator("birth_date")
    @classmethod
    def _check_birth_date(cls, v: date) -> date:
        return _validate_birth_date(v)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    """All fields optional — only the provided ones are written."""

    name: str | None = Field(default=None, min_length=1, max_length=80)
    city: str | None = Field(default=None, max_length=80)
    bio: str | None = Field(default=None, max_length=600)
    phone: str | None = Field(default=None, max_length=32)
    birth_date: date | None = Field(default=None, alias="birthDate")
    avatar_url: str | None = Field(
        default=None, alias="avatarUrl", max_length=MAX_AVATAR_CHARS
    )
    interests: list[str] | None = Field(default=None, max_length=12)

    model_config = {"populate_by_name": True}

    @field_validator("birth_date")
    @classmethod
    def _check_birth_date(cls, v: date | None) -> date | None:
        return v if v is None else _validate_birth_date(v)

    @field_validator("phone")
    @classmethod
    def _check_phone(cls, v: str | None) -> str | None:
        # Stored normalised (+<digits>) so the column holds one shape regardless
        # of how the user typed it. Empty string is how the phone gets cleared.
        if v in (None, ""):
            return v
        if not _PHONE_ALLOWED.match(v):
            raise ValueError(_PHONE_ERROR)

        digits = re.sub(r"\D", "", v)
        # Russian numbers are written both as 8XXX... and +7XXX...; keep one.
        if len(digits) == 11 and digits[0] == "8":
            digits = "7" + digits[1:]
        elif len(digits) == 10:
            digits = "7" + digits

        # E.164: country code plus subscriber number, never longer than 15.
        if not 11 <= len(digits) <= 15:
            raise ValueError(_PHONE_ERROR)
        return "+" + digits

    @field_validator("avatar_url")
    @classmethod
    def _check_avatar(cls, v: str | None) -> str | None:
        # The value is interpolated into CSS url(...) on render, so only allow
        # the two shapes the UI produces: an uploaded image or a linked one.
        # Empty string is how the avatar gets cleared.
        if v in (None, ""):
            return v
        if v.startswith("data:image/"):
            return v
        if v.startswith(("http://", "https://")):
            return v
        raise ValueError("Ссылка на фото должна начинаться с http:// или https://")


class PasswordChange(BaseModel):
    current_password: str = Field(..., alias="currentPassword")
    new_password: str = Field(..., min_length=6, max_length=128, alias="newPassword")

    model_config = {"populate_by_name": True}


class UserSettings(BaseModel):
    notify_messages: bool = Field(..., alias="notifyMessages")
    notify_responses: bool = Field(..., alias="notifyResponses")
    notify_email_digest: bool = Field(..., alias="notifyEmailDigest")
    notify_news: bool = Field(..., alias="notifyNews")
    privacy_online: bool = Field(..., alias="privacyOnline")
    privacy_show_age: bool = Field(..., alias="privacyShowAge")
    privacy_in_search: bool = Field(..., alias="privacyInSearch")

    model_config = {"populate_by_name": True}


class SettingsUpdate(BaseModel):
    """All fields optional — only the provided ones are written."""

    notify_messages: bool | None = Field(default=None, alias="notifyMessages")
    notify_responses: bool | None = Field(default=None, alias="notifyResponses")
    notify_email_digest: bool | None = Field(default=None, alias="notifyEmailDigest")
    notify_news: bool | None = Field(default=None, alias="notifyNews")
    privacy_online: bool | None = Field(default=None, alias="privacyOnline")
    privacy_show_age: bool | None = Field(default=None, alias="privacyShowAge")
    privacy_in_search: bool | None = Field(default=None, alias="privacyInSearch")

    model_config = {"populate_by_name": True}


class ProfileCompleteness(BaseModel):
    percent: int
    items: list["CompletenessItem"]


class CompletenessItem(BaseModel):
    key: str
    label: str
    done: bool


class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    username: str
    city: str
    bio: str
    phone: str
    # ISO date, or "" for accounts created before the field existed.
    birth_date: str = Field(..., alias="birthDate")
    age: int | None
    avatar_url: str = Field(..., alias="avatarUrl")
    interests: list[str]
    rating: float
    reviews_count: int = Field(..., alias="reviewsCount")
    email_verified: bool = Field(..., alias="emailVerified")
    phone_verified: bool = Field(..., alias="phoneVerified")
    created_at: str = Field(..., alias="createdAt")
    completeness: ProfileCompleteness
    settings: UserSettings

    model_config = {"populate_by_name": True}


class PublicUser(BaseModel):
    id: str
    name: str
    username: str
    city: str
    bio: str
    # Derived, never the raw birth date: the exact day is nobody else's business.
    # None when unset or when the owner turned "Показывать возраст" off.
    age: int | None
    avatar_url: str = Field(..., alias="avatarUrl")
    interests: list[str]
    rating: float
    reviews_count: int = Field(..., alias="reviewsCount")

    model_config = {"populate_by_name": True}


class AuthResponse(BaseModel):
    token: str
    user: User


ProfileCompleteness.model_rebuild()
