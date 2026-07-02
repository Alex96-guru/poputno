# Попутно

Сервис поиска попутчиков в путешествия. Монорепо: Next.js + Python-бэкенд на FastAPI.

```
frontend/   Next.js 15 (App Router) + TypeScript + Tailwind
backend/    FastAPI + Pydantic
```

## Запуск

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API: `http://localhost:8000` (`/api/persons`, `/api/destinations`, `/health`, `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение: `http://localhost:3000`.

Если бэкенд не поднят, фронт использует встроенные мок-данные (`lib/mock-data.ts`), страница остаётся рабочей.

Переопределить адрес API:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## Деплой (Railway)

Монорепо разворачивается двумя сервисами.

### Backend (root directory: `backend`)
- Nixpacks определяет Python по `requirements.txt`.
- Старт: `uvicorn main:app --host 0.0.0.0 --port $PORT` (см. `backend/Procfile`).
- Переменная окружения `ALLOWED_ORIGINS` — список разрешённых origin через запятую, например `https://poputno-frontend.up.railway.app`.

### Frontend (root directory: `frontend`)
- Nixpacks определяет Next.js. Сборка `next build`, старт `next start` (порт берётся из `$PORT`).
- Переменная окружения (на этапе сборки) `NEXT_PUBLIC_API_BASE` — публичный URL backend-сервиса, например `https://poputno-api.up.railway.app`.