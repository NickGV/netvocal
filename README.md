# Voice Assistant (Monorepo)

Production-ready monorepo scaffold for a real-time developer voice assistant.

Planned pipeline:  
**Microphone → Speech-to-Text → LLM → Text-to-Speech → Speaker**

> This repository focuses on structure, clarity, and scalability.  
> Core STT/LLM/TTS integrations are mocked for now.

---

## Monorepo structure

```
apps/
  web/         # Next.js frontend (App Router)
  api/         # FastAPI backend (Python 3.11+)
packages/      # Shared code (reserved for future)
infra/         # Infrastructure (reserved for future)
docs/          # Documentation and guides
```

---

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI, asyncio, uvicorn
- **Tooling:** pnpm workspaces

---

## Prerequisites

- Node.js 20+ and pnpm
- Python 3.11+

---

## Environment variables

1. Copy the example env file at the repo root:

    ```bash
    cp .env.example .env
    ```

    The web app uses `NEXT_PUBLIC_API_URL`.

2. Also copy the web env example:

    ```bash
    cp apps/web/.env.example apps/web/.env.local
    ```

---

## Run the frontend

```bash
pnpm dev:web
```

- Web runs at [http://localhost:3000](http://localhost:3000)

---

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

- API runs at [http://localhost:8000](http://localhost:8000)

---

## Health check

```bash
curl http://localhost:8000/health
```

---

## Productividad Backend — Track B

Este módulo implementa el subsystema de Productividad sobre FastAPI siguiendo práctica limpia, modular y profesional.

### Endpoints principales

#### Tareas
- `GET /tasks` — Lista todas las tareas.
- `POST /tasks` — Crea una nueva tarea.
- `DELETE /tasks/{id}` — Elimina una tarea por su ID.

#### Reuniones
- `GET /meetings` — Lista todas las reuniones.
- `POST /meetings` — Agenda una reunión.
- `DELETE /meetings/{id}` — Elimina una reunión.

#### Intent Parser (NLP)
- `POST /intent/parse` — Analiza texto natural e interpreta intención, ejecutando la acción relevante (crear tarea, agendar reunión o consulta de estado).

### Detalles técnicos

- Persistencia en memoria
- Manejo de IDs únicos (UUID)
- Validaciones robustas en schemas
- Separación router/service/store limpia
- Cobertura de pruebas con `pytest`
- Modular y fácil de extender

---

## Progreso y pruebas

- Todos los endpoints Productividad tienen pruebas automatizadas.
- Corre todas las pruebas con:

    ```bash
    python -m pytest apps/api/tests/ -v
    ```

- El progreso del backend productivo está documentado en:  
  `ralph/progress_track.txt`

---

## Autores y reglas de contribución

- Implementación conforme a la rama: `develop-elberB`.
- Solo código backend de Track B (Productividad).
- Commits convencionales y manejo estricto de reglas.
- Listo para integración y extensión.

---

> “Track B terminado y validado. Listo para integración o extensión.”
