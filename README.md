# Voice Assistant (Monorepo)

Production-ready monorepo scaffold for a real-time developer voice assistant.

Planned pipeline: **Microphone → Speech-to-Text → LLM → Text-to-Speech → Speaker**.

This repository focuses on **structure, clarity, and scalability**. Core STT/LLM/TTS integrations are **mocked** for now.

## Monorepo structure

```
apps/
  web/         # Next.js frontend (App Router)
  api/         # FastAPI backend (Python 3.11+)
packages/      # Shared code (reserved for future)
infra/         # Infrastructure (reserved for future)
docs/
```

## Tech stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: FastAPI, asyncio, uvicorn
- Tooling: pnpm workspaces

## Prerequisites

- Node.js 20+ and pnpm
- Python 3.11+

## Environment variables

Copy the example env file at the repo root:

```bash
cp .env.example .env
```

The web app uses `NEXT_PUBLIC_API_URL`.

Also copy the web env example:

```bash
cp apps/web/.env.example apps/web/.env.local
```

## Run the frontend

```bash
pnpm dev:web
```

Web runs at http://localhost:3000

## Run the backend

Install Python deps (from `apps/api`):

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

Run API (from repo root):

```bash
pnpm dev:api
```

API runs at http://localhost:8000

### Health check

```bash
curl http://localhost:8000/health
```
