import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from data import PERSONS, POPULAR_DESTINATIONS
from schemas import Person

app = FastAPI(title="Попутно API", version="0.1.0")

# Comma-separated list of allowed origins, configurable per environment.
# Defaults to the local Next.js dev server.
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)


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