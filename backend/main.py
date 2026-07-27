from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import listings as listings_repo
import messages as messages_repo
import users as users_repo
from cities import CITIES
from config import ALLOWED_ORIGINS
from data import PERSONS, POPULAR_DESTINATIONS
from db import init_db
from schemas import (
    AuthResponse,
    City,
    Conversation,
    Listing,
    ListingCreate,
    LoginRequest,
    Message,
    PasswordChange,
    Person,
    ProfileUpdate,
    PublicUser,
    RegisterRequest,
    SendMessageRequest,
    SettingsUpdate,
    User,
    UserSettings,
)
from security import create_token, decode_token, verify_password


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    listings_repo.backfill_coordinates()
    yield


app = FastAPI(title="Попутно API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

bearer = HTTPBearer(auto_error=False)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
):
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Требуется авторизация")
    claims = decode_token(credentials.credentials)
    if claims is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Недействительный токен")
    row = users_repo.get_by_id(claims.user_id)
    if row is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Пользователь не найден")
    # A password change bumps token_version, retiring tokens issued before it.
    if claims.version != row["token_version"]:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Сессия устарела, войдите заново"
        )
    return row


# ------------------------------------------------------------------ auth


@app.post("/api/auth/register", response_model=AuthResponse, response_model_by_alias=True)
def register(payload: RegisterRequest) -> AuthResponse:
    try:
        row = users_repo.create(
            payload.name,
            str(payload.email),
            payload.password,
            payload.birth_date,
            payload.gender,
        )
    except ValueError:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Пользователь с такой почтой уже существует"
        )
    return AuthResponse(
        token=create_token(row["id"], row["token_version"]),
        user=users_repo.to_user(row),
    )


@app.post("/api/auth/login", response_model=AuthResponse, response_model_by_alias=True)
def login(payload: LoginRequest) -> AuthResponse:
    row = users_repo.get_by_email(str(payload.email))
    if row is None or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверная почта или пароль")
    return AuthResponse(
        token=create_token(row["id"], row["token_version"]),
        user=users_repo.to_user(row),
    )


@app.get("/api/auth/me", response_model=User, response_model_by_alias=True)
def me(row=Depends(current_user)) -> User:
    return users_repo.to_user(row)


# ------------------------------------------------------------------ profile


@app.patch("/api/users/me", response_model=User, response_model_by_alias=True)
def update_me(payload: ProfileUpdate, row=Depends(current_user)) -> User:
    updated = users_repo.update(row["id"], payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Пользователь не найден")
    return users_repo.to_user(updated)


@app.patch(
    "/api/users/me/settings", response_model=UserSettings, response_model_by_alias=True
)
def update_my_settings(payload: SettingsUpdate, row=Depends(current_user)) -> UserSettings:
    updated = users_repo.update_settings(row["id"], payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Пользователь не найден")
    return users_repo.to_settings(updated)


@app.post(
    "/api/users/me/password", response_model=AuthResponse, response_model_by_alias=True
)
def change_my_password(payload: PasswordChange, row=Depends(current_user)) -> AuthResponse:
    try:
        updated = users_repo.change_password(
            row["id"], payload.current_password, payload.new_password
        )
    except ValueError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Текущий пароль неверен")
    # Every other session is now logged out; keep this one alive with a fresh token.
    return AuthResponse(
        token=create_token(updated["id"], updated["token_version"]),
        user=users_repo.to_user(updated),
    )


@app.delete("/api/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(row=Depends(current_user)) -> Response:
    users_repo.delete(row["id"])
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/users/{user_id}", response_model=PublicUser, response_model_by_alias=True)
def get_user(user_id: str) -> PublicUser:
    row = users_repo.get_by_id(user_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Пользователь не найден")
    return users_repo.to_public_user(row)


# ------------------------------------------------------------------ listings


@app.post(
    "/api/listings",
    response_model=Listing,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
def create_listing(payload: ListingCreate, row=Depends(current_user)) -> Listing:
    created = listings_repo.create(row["id"], payload.model_dump())
    return listings_repo.to_listing(created)


@app.get("/api/listings", response_model=list[Listing], response_model_by_alias=True)
def list_listings() -> list[Listing]:
    return [listings_repo.to_listing(r) for r in listings_repo.list_all()]


@app.get(
    "/api/users/me/listings",
    response_model=list[Listing],
    response_model_by_alias=True,
)
def list_my_listings(row=Depends(current_user)) -> list[Listing]:
    return [
        listings_repo.to_listing(r) for r in listings_repo.list_by_author(row["id"])
    ]


@app.get("/api/users/me/saved", response_model=list[Listing], response_model_by_alias=True)
def list_saved(row=Depends(current_user)) -> list[Listing]:
    return [listings_repo.to_listing(r) for r in listings_repo.list_saved(row["id"])]


@app.get("/api/users/me/saved/ids", response_model=list[str])
def list_saved_ids(row=Depends(current_user)) -> list[str]:
    """Just the ids, so the client can paint the hearts without the full rows."""
    return listings_repo.saved_ids(row["id"])


@app.post("/api/users/me/saved/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def save_listing(listing_id: str, row=Depends(current_user)) -> Response:
    try:
        listings_repo.save(row["id"], listing_id)
    except listings_repo.SaveError as err:
        if err.code == "own":
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "Нельзя сохранить своё объявление"
            )
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Объявление не найдено")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.delete("/api/users/me/saved/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_listing(listing_id: str, row=Depends(current_user)) -> Response:
    listings_repo.unsave(row["id"], listing_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Declared after /api/users/me/listings so that "me" is not taken as a user id.
@app.get(
    "/api/users/{user_id}/listings",
    response_model=list[Listing],
    response_model_by_alias=True,
)
def list_user_listings(user_id: str) -> list[Listing]:
    """Everything this traveller has posted, for their public profile."""
    return [listings_repo.to_listing(r) for r in listings_repo.list_by_author(user_id)]


@app.get(
    "/api/listings/{listing_id}", response_model=Listing, response_model_by_alias=True
)
def get_listing(listing_id: str) -> Listing:
    found = listings_repo.get(listing_id)
    if found is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Объявление не найдено")
    return listings_repo.to_listing(found)


@app.delete("/api/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: str, row=Depends(current_user)) -> Response:
    if not listings_repo.delete(listing_id, row["id"]):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Объявление не найдено")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ------------------------------------------------------------------ messages


def _to_message(row, me: str) -> Message:
    return Message(
        id=row["id"],
        body=row["body"],
        image_url=row["image_url"],
        created_at=row["created_at"],
        mine=row["sender_id"] == me,
        read=row["read_at"] is not None,
    )


@app.get(
    "/api/conversations",
    response_model=list[Conversation],
    response_model_by_alias=True,
)
def list_conversations(row=Depends(current_user)) -> list[Conversation]:
    return [Conversation(**c) for c in messages_repo.list_conversations(row["id"])]


@app.get("/api/messages/unread")
def unread_count(row=Depends(current_user)) -> dict[str, int]:
    return {"unread": messages_repo.unread_total(row["id"])}


@app.get(
    "/api/conversations/{user_id}/messages",
    response_model=list[Message],
    response_model_by_alias=True,
)
def get_thread(user_id: str, row=Depends(current_user)) -> list[Message]:
    me = row["id"]
    # Opening the thread clears its unread badge.
    messages_repo.mark_read(me, user_id)
    return [_to_message(m, me) for m in messages_repo.list_messages(me, user_id)]


@app.post(
    "/api/conversations/{user_id}/messages",
    response_model=Message,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    user_id: str, payload: SendMessageRequest, row=Depends(current_user)
) -> Message:
    me = row["id"]
    if user_id == me:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Нельзя написать самому себе"
        )
    if users_repo.get_by_id(user_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Пользователь не найден")
    created = messages_repo.send(me, user_id, payload.body, payload.image_url)
    return _to_message(created, me)


@app.post(
    "/api/conversations/{user_id}/typing", status_code=status.HTTP_204_NO_CONTENT
)
def set_typing(user_id: str, row=Depends(current_user)) -> Response:
    messages_repo.set_typing(row["id"], user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/conversations/{user_id}/typing")
def typing_status(user_id: str, row=Depends(current_user)) -> dict[str, bool]:
    return {"typing": messages_repo.is_typing(row["id"], user_id)}


# ------------------------------------------------------------------ catalog


@app.get("/api/persons", response_model=list[Person], response_model_by_alias=True)
def list_persons(
    company_type: str | None = Query(default=None, alias="companyType"),
) -> list[Person]:
    if company_type is None:
        return PERSONS
    return [p for p in PERSONS if p.company_type == company_type]


@app.get("/api/cities", response_model=list[City])
def list_cities() -> list[City]:
    """Cities the radius filter can measure from."""
    return [City(name=name, lat=lat, lon=lon) for name, lat, lon in CITIES]


@app.get("/api/destinations", response_model=list[str])
def list_popular_destinations() -> list[str]:
    return POPULAR_DESTINATIONS


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
