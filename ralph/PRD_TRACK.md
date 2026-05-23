# PRD Track D — Frontend UI + Infraestructura

> **Proyecto:** NETVOCAL
> **Developer:** D
> **Branch:** feat/frontend-ui
> **Stack:** FastAPI (backend) + Next.js (frontend) + pnpm monorepo

## Tareas

### Fase INFRA: Infraestructura y Documentación

- [ ] `[INFRA]` **#6.1** Configurar variables de entorno completas — [#8](https://github.com/NickGV/netvocal/issues/8)
  - `.env.example` con todas las vars necesarias (backend + frontend)
  - Documentar en README (cuando toque INFRA-6.3)
  - Prioridad: ALTA (no bloquea nada)

- [ ] `[INFRA]` **#6.2** Agregar tests de frontend (vitest) — [#9](https://github.com/NickGV/netvocal/issues/9)
  - Tests para componentes existentes (RecordButton, ConversationHistory)
  - Tests para hooks (useRecorderUI)
  - Prioridad: ALTA (no bloquea nada)

- [ ] `[INFRA]` **#6.3** Documentar happy path completo en README
  - Cómo levantar backend + frontend
  - Cómo ejecutar tests
  - Variables de entorno requeridas
  - Dependencia: INFRA-6.1

- [ ] `[INFRA]` **#6.4** Docker Compose para dev
  - Dockerfile para backend (FastAPI)
  - Dockerfile para frontend (Next.js)
  - docker-compose.yml
  - Prioridad: BAJA (opcional)

### Fase FE-2: Frontend — Tasks & Meetings UI

- [ ] `[FE]` **#5.1** UI para listar y crear tareas desde el dashboard
  - Lista de tareas pendientes
  - Formulario inline de creación
  - Dependencia: BE-2.1 (esperar merge Track B)
  - Prioridad: MEDIA

- [ ] `[FE]` **#5.2** UI para listar y crear reuniones desde el dashboard
  - Vista de reuniones agendadas
  - Dependencia: BE-2.2 (esperar merge Track B)
  - Prioridad: MEDIA

- [ ] `[FE]` **#5.3** Integrar comandos de voz con tasks/meetings
  - "Crea una tarea..." → llama a POST /tasks
  - "Agenda una reunión..." → llama a POST /meetings
  - Dependencia: FE-5.1, FE-5.2, BE-2.3
  - Prioridad: MEDIA

---

## Dependencias entre tareas

```
INFRA-6.1 (independiente — puede empezar ya)
INFRA-6.2 (independiente — puede empezar ya)

FE-5.1 → BE-2.1 (esperar merge Track B)
FE-5.2 → BE-2.2 (esperar merge Track B)
FE-5.3 → FE-5.1, FE-5.2, BE-2.3

INFRA-6.3 → INFRA-6.1
INFRA-6.4 (independiente)
```

## Criterios de éxito

- [ ] `.env.example` completo con vars de backend y frontend
- [ ] Tests de frontend pasando (vitest)
- [ ] Dashboard de tareas funcionando con backend real
- [ ] Dashboard de reuniones funcionando con backend real
- [ ] Comandos de voz crean tareas y reuniones automáticamente
- [ ] README documenta todo el flujo
- [ ] Docker Compose levanta todo con un comando
