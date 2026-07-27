import re
from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

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

# Single-choice profile fields. The stored value is the label itself, matching
# how interests are stored; "" means the user has not answered. The frontend
# mirrors these lists in lib/profile-options.ts — keep the two in step.
SMOKING_OPTIONS = ("", "Не курю", "Курю")
MARITAL_OPTIONS = (
    "",
    "Не женат / не замужем",
    "В отношениях",
    "Женат / замужем",
    "В разводе",
    "Вдовец / вдова",
)
CHILDREN_OPTIONS = (
    "",
    "Нет детей",
    "Есть, живут со мной",
    "Есть, живут отдельно",
    "Есть, уже взрослые",
)
PETS_OPTIONS = ("", "Нет питомцев", "Собака", "Кошка", "Собака и кошка", "Другой питомец")
LANGUAGE_OPTIONS = (
    "Русский",
    "English",
    "Deutsch",
    "Italiano",
    "Español",
    "Français",
    "Português",
    "Polski",
    "Türkçe",
    "Қазақша",
    "Українська",
    "Беларуская",
    "עברית",
    "中文",
    "日本語",
)

# ---------------------------------------------------------------- listings

# What the listing is for. Mirrors the three shelves on the home page.
LISTING_CATEGORIES = ("Путешествия", "Встречи", "В гости")
# Which side of a visit the author is on, on the "В гости" form.
HOSTING_ROLES = ("Принимаю гостей", "Ищу приём")
DEFAULT_CATEGORY = LISTING_CATEGORIES[0]

# Who is posting, and who they want to travel with.
GENDERS = ("мужчина", "женщина")

AUTHOR_KINDS = (
    "мужчина",
    "женщина",
    "компания",
    "пара или семья",
    "родитель с ребёнком",
)
SEEKING_OPTIONS = (
    "мужчину",
    "женщину",
    "компанию",
    "семью",
    "родителя с ребёнком",
    "кого-нибудь",
)
FINANCE_OPTIONS = (
    "Каждый платит за себя",
    "Предпочитаю спонсорство",
    "Финансы по договорённости",
)
TRIP_TYPES = (
    "Любое путешествие",
    "Пляж",
    "Экскурсии",
    "Автотрип",
    "Тур на выходные",
    "Зимний спорт",
    "Здоровье, фитнес",
    "Зимовка",
    "Поход",
    "Водный туризм",
    "Работа и учёба",
    "Дайвинг",
    "Сёрфинг",
    "Духовные практики",
)

# A listing may name several places; the form caps the picker at ten.
MAX_DESTINATIONS = 10
MAX_DESTINATION_CHARS = 60

# Interests come from a fixed grid of ~50 activity chips, but older accounts
# hold free-typed tags, so the list is length-checked rather than whitelisted.
MAX_INTERESTS = 60
MAX_TAG_CHARS = 40

# 0 clears the field; anything else has to be a plausible human height in cm.
MIN_HEIGHT_CM = 100
MAX_HEIGHT_CM = 250


def _clean_tags(values: list[str]) -> list[str]:
    """Trim, drop blanks and duplicates, keeping the order the user picked."""
    seen: dict[str, None] = {}
    for value in values:
        tag = value.strip()[:MAX_TAG_CHARS]
        if tag:
            seen.setdefault(tag, None)
    return list(seen)


def _one_of(v: str | None, options: tuple[str, ...]) -> str | None:
    """Shared check for the single-choice fields."""
    if v is None or v in options:
        return v
    raise ValueError("Выберите значение из списка")


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
    gender: str

    model_config = {"populate_by_name": True}

    @field_validator("gender")
    @classmethod
    def _check_gender(cls, v: str) -> str:
        return _one_of(v, GENDERS)

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
    interests: list[str] | None = Field(default=None, max_length=MAX_INTERESTS)
    languages: list[str] | None = Field(
        default=None, max_length=len(LANGUAGE_OPTIONS)
    )
    smoking: str | None = None
    # Centimetres; 0 clears the field.
    height: int | None = None
    marital_status: str | None = Field(default=None, alias="maritalStatus")
    children: str | None = None
    pets: str | None = None
    university: str | None = Field(default=None, max_length=120)
    profession: str | None = Field(default=None, max_length=120)
    music: str | None = Field(default=None, max_length=300)
    gender: str | None = None

    model_config = {"populate_by_name": True}

    @field_validator("birth_date")
    @classmethod
    def _check_birth_date(cls, v: date | None) -> date | None:
        return v if v is None else _validate_birth_date(v)

    @field_validator("interests")
    @classmethod
    def _check_interests(cls, v: list[str] | None) -> list[str] | None:
        return v if v is None else _clean_tags(v)

    @field_validator("languages")
    @classmethod
    def _check_languages(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        cleaned = _clean_tags(v)
        unknown = [lang for lang in cleaned if lang not in LANGUAGE_OPTIONS]
        if unknown:
            raise ValueError("Выберите язык из списка")
        return cleaned

    @field_validator("height")
    @classmethod
    def _check_height(cls, v: int | None) -> int | None:
        if v is None or v == 0:
            return v
        if not MIN_HEIGHT_CM <= v <= MAX_HEIGHT_CM:
            raise ValueError(
                f"Рост должен быть от {MIN_HEIGHT_CM} до {MAX_HEIGHT_CM} см"
            )
        return v

    @field_validator("gender")
    @classmethod
    def _check_profile_gender(cls, v: str | None) -> str | None:
        return _one_of(v, GENDERS)

    @field_validator("smoking")
    @classmethod
    def _check_smoking(cls, v: str | None) -> str | None:
        return _one_of(v, SMOKING_OPTIONS)

    @field_validator("marital_status")
    @classmethod
    def _check_marital(cls, v: str | None) -> str | None:
        return _one_of(v, MARITAL_OPTIONS)

    @field_validator("children")
    @classmethod
    def _check_children(cls, v: str | None) -> str | None:
        return _one_of(v, CHILDREN_OPTIONS)

    @field_validator("pets")
    @classmethod
    def _check_pets(cls, v: str | None) -> str | None:
        return _one_of(v, PETS_OPTIONS)

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
    languages: list[str]
    smoking: str
    # Centimetres, or None when the user has not stated it.
    height: int | None
    marital_status: str = Field(..., alias="maritalStatus")
    children: str
    pets: str
    university: str
    profession: str
    music: str
    gender: str
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
    languages: list[str]
    smoking: str
    height: int | None
    marital_status: str = Field(..., alias="maritalStatus")
    children: str
    pets: str
    university: str
    profession: str
    music: str
    rating: float
    reviews_count: int = Field(..., alias="reviewsCount")
    created_at: str = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True}


class ListingAuthor(BaseModel):
    """The slice of the poster's profile a listing card needs to render."""

    id: str
    name: str
    username: str
    age: int | None
    avatar_url: str = Field(..., alias="avatarUrl")
    city: str
    # Straight from the profile: the catalog matches people by shared interests.
    interests: list[str]
    rating: float
    reviews_count: int = Field(..., alias="reviewsCount")

    model_config = {"populate_by_name": True}


class ListingCreate(BaseModel):
    category: str = DEFAULT_CATEGORY
    author_kind: str = Field(..., alias="authorKind")
    seeking: str
    origin: str = Field(default="", max_length=80)
    destinations: list[str] = Field(
        default_factory=list, max_length=MAX_DESTINATIONS
    )
    description: str = Field(..., min_length=1, max_length=1200)
    # ISO dates, or "" while the traveller has not settled on them.
    start_date: str = Field(default="", alias="startDate")
    end_date: str = Field(default="", alias="endDate")
    finance: str = ""
    trip_type: str = Field(default="", alias="tripType")
    smoking: str = ""
    # Centimetres; 0 means "not stated", as on the profile.
    height: int = 0
    languages: list[str] = Field(
        default_factory=list, max_length=len(LANGUAGE_OPTIONS)
    )
    remind: bool = False
    # "Встречи": what to do together and who is wanted along.
    interests: list[str] = Field(default_factory=list, max_length=MAX_INTERESTS)
    age_min: int = Field(default=0, alias="ageMin")
    age_max: int = Field(default=0, alias="ageMax")
    nearby: bool = False
    # "В гости".
    hosting_role: str = Field(default="", alias="hostingRole")

    model_config = {"populate_by_name": True}

    @field_validator("category")
    @classmethod
    def _check_category(cls, v: str) -> str:
        return _one_of(v, LISTING_CATEGORIES)

    @field_validator("hosting_role")
    @classmethod
    def _check_hosting_role(cls, v: str) -> str:
        return _one_of(v, ("",) + HOSTING_ROLES)

    @field_validator("interests")
    @classmethod
    def _check_listing_interests(cls, v: list[str]) -> list[str]:
        return _clean_tags(v)

    @field_validator("age_min", "age_max")
    @classmethod
    def _check_age(cls, v: int) -> int:
        # 0 means "no bound"; anything else must be a real adult age.
        if v == 0 or MIN_AGE <= v <= MAX_AGE:
            return v
        raise ValueError(f"Возраст должен быть от {MIN_AGE} до {MAX_AGE}")

    @field_validator("author_kind")
    @classmethod
    def _check_author_kind(cls, v: str) -> str:
        return _one_of(v, AUTHOR_KINDS)

    @field_validator("seeking")
    @classmethod
    def _check_seeking(cls, v: str) -> str:
        return _one_of(v, SEEKING_OPTIONS)

    @field_validator("finance")
    @classmethod
    def _check_finance(cls, v: str) -> str:
        return _one_of(v, ("",) + FINANCE_OPTIONS)

    @field_validator("trip_type")
    @classmethod
    def _check_trip_type(cls, v: str) -> str:
        return _one_of(v, ("",) + TRIP_TYPES)

    @field_validator("smoking")
    @classmethod
    def _check_listing_smoking(cls, v: str) -> str:
        return _one_of(v, SMOKING_OPTIONS)

    @field_validator("destinations")
    @classmethod
    def _check_destinations(cls, v: list[str]) -> list[str]:
        cleaned = [d.strip()[:MAX_DESTINATION_CHARS] for d in v]
        return list(dict.fromkeys(d for d in cleaned if d))

    @field_validator("languages")
    @classmethod
    def _check_listing_languages(cls, v: list[str]) -> list[str]:
        cleaned = _clean_tags(v)
        if any(lang not in LANGUAGE_OPTIONS for lang in cleaned):
            raise ValueError("Выберите язык из списка")
        return cleaned

    @field_validator("height")
    @classmethod
    def _check_listing_height(cls, v: int) -> int:
        if v == 0 or MIN_HEIGHT_CM <= v <= MAX_HEIGHT_CM:
            return v
        raise ValueError(
            f"Рост должен быть от {MIN_HEIGHT_CM} до {MAX_HEIGHT_CM} см"
        )

    @field_validator("start_date", "end_date")
    @classmethod
    def _check_date(cls, v: str) -> str:
        if not v:
            return v
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError("Неверный формат даты")
        return v

    @model_validator(mode="after")
    def _check_range(self) -> "ListingCreate":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("Дата окончания раньше даты начала")
        if self.age_min and self.age_max and self.age_max < self.age_min:
            raise ValueError("Верхняя граница возраста меньше нижней")
        # A meeting or a visit happens in a city, not at a destination, so only
        # a trip has to name where it goes.
        if self.category == DEFAULT_CATEGORY and not self.destinations:
            raise ValueError("Выберите хотя бы одно направление")
        return self


class City(BaseModel):
    name: str
    lat: float
    lon: float


class Listing(ListingCreate):
    id: str
    author: ListingAuthor
    created_at: str = Field(..., alias="createdAt")
    # Resolved from `origin` on creation; None when the city is not in the
    # city table, in which case distance cannot be measured for this listing.
    origin_lat: float | None = Field(default=None, alias="originLat")
    origin_lon: float | None = Field(default=None, alias="originLon")

    model_config = {"populate_by_name": True}


class MessageUser(BaseModel):
    """The other party's card fields, carried with a conversation."""

    id: str
    name: str
    username: str
    avatar_url: str = Field(..., alias="avatarUrl")

    model_config = {"populate_by_name": True}


# Data URI photos travel inline like avatars; keep the cap generous enough for
# a downscaled ~1280px JPEG but far short of a full-size upload.
MAX_MESSAGE_IMAGE_CHARS = 700_000


class Message(BaseModel):
    id: str
    body: str
    image_url: str | None = Field(default=None, alias="imageUrl")
    created_at: str = Field(..., alias="createdAt")
    # True when the current user sent it — drives which side the bubble sits on.
    mine: bool
    # True once the recipient has opened the thread — shown as a read receipt.
    read: bool

    model_config = {"populate_by_name": True}


class Conversation(BaseModel):
    user: MessageUser
    last_body: str = Field(..., alias="lastBody")
    last_at: str = Field(..., alias="lastAt")
    last_mine: bool = Field(..., alias="lastMine")
    unread: int

    model_config = {"populate_by_name": True}


class SendMessageRequest(BaseModel):
    body: str = Field(default="", max_length=2000)
    image_url: str | None = Field(
        default=None, alias="imageUrl", max_length=MAX_MESSAGE_IMAGE_CHARS
    )

    model_config = {"populate_by_name": True}

    @field_validator("body")
    @classmethod
    def _trim(cls, v: str) -> str:
        return v.strip()

    @field_validator("image_url")
    @classmethod
    def _check_image(cls, v: str | None) -> str | None:
        if v in (None, ""):
            return None
        if v.startswith("data:image/"):
            return v
        raise ValueError("Недопустимое изображение")

    @model_validator(mode="after")
    def _need_content(self) -> "SendMessageRequest":
        if not self.body and not self.image_url:
            raise ValueError("Сообщение не может быть пустым")
        return self


class AuthResponse(BaseModel):
    token: str
    user: User


ProfileCompleteness.model_rebuild()
