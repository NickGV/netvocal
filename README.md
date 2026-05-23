# Voice Assistant (Monorepo)

Production-ready monorepo scaffold for a real-time developer voice assistant.

Pipeline: **Microphone → Speech-to-Text → LLM → Text-to-Speech → Speaker**.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI, asyncio, uvicorn, pydantic-settings
- **Tooling:** pnpm workspaces, Python 3.11+

## Prerequisites

- Node.js 20+ and pnpm 9+
- Python 3.11+

## Environment variables

Copy the example env files:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
```

### Backend (`VA_` prefix)

| Var | Default | Description |
|-----|---------|-------------|
| `VA_OPENAI_API_KEY` | `""` | OpenAI API key (required for STT/LLM providers) |
| `VA_STT_PROVIDER` | `mock` | Speech-to-Text provider: `mock` or `openai` |
| `VA_WHISPER_MODEL` | `whisper-1` | Whisper model name (used with `openai` provider) |
| `VA_LLM_PROVIDER` | `mock` | LLM provider: `mock` or `openai` |
| `VA_LLM_MODEL` | `gpt-4o-mini` | LLM model name (used with `openai` provider) |
| `VA_CORS_ALLOW_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |

### Frontend (`NEXT_PUBLIC_` prefix)

| Var | Default | Description |
|-----|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

## Happy path (dev workflow)

### 1. Start the backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

From repo root, start the API:

```bash
pnpm dev:api
```

API runs at http://localhost:8000

### 2. Verify the backend

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### 3. Start the frontend

```bash
pnpm dev:web
```

Web runs at http://localhost:3000

### 4. Open the dashboard

Navigate to http://localhost:3000 — you'll see the voice assistant UI with a mock conversation.

### Alternative: Docker Compose

```bash
docker compose up --build
```

This starts both services (api on :8000, web on :3000) without setting up Python venv or Node locally.

## Running tests

### Frontend (vitest)

```bash
pnpm -C apps/web test
```

Covers: RecordButton, ConversationHistory, useRecorderUI hook.

### Backend (pytest)

```bash
cd apps/api && source .venv/bin/activate && pytest -v
```

21 tests covering: health, voice turns (text + audio), tasks CRUD, meetings CRUD.

## Monorepo structure

```
apps/
  web/         # Next.js frontend (App Router)
  api/         # FastAPI backend (Python 3.11+)
packages/      # Shared code (reserved)
docs/
```
