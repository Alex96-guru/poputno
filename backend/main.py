from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import users as users_repo
from config import ALLOWED_ORIGINS
from data import PERSONS, POPULAR_DESTINATIONS
from db import init_db
from schemas import (
    AuthResponse,
    LoginRequest,
    PasswordChange,
    Person,
    ProfileUpdate,
    PublicUser,
    RegisterRequest,
    SettingsUpdate,
    User,
    UserSettings,
)
from security import create_token, decode_token, verify_password


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
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
            payload.name, str(payload.email), payload.password, payload.birth_date
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


# ------------------------------------------------------------------ catalog


@app.get("/api/persons", response_model=list[Person], response_model_by_alias=True)
def list_persons(
    company_type: str | None = Query(default=None, alias="companyType"),
) -> list[Person]:
    if company_type is None:
        return PERSONS
    return [p for p in PERSONS if p.company_type == company_type]


@app.get("/api/destinations", response_model=list[str])
def list_popular_destinations() -> list[str]:
    return POPULAR_DESTINATIONS


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
