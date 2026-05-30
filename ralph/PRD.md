# PRD: DevVoice Assistant

> **Proyecto:** NETVOCAL
> **Cliente Brief:** `client-brief.md`
> **Stack:** FastAPI (backend) + Next.js (frontend) + pnpm monorepo

## Estado actual del códigobase

- ✅ Backend scaffold con FastAPI, routers para health/voice/tasks/meetings
- ✅ STT / LLM / TTS service interfaces (abstract) con mocks
- ✅ Schemas Pydantic para voice, tasks, meetings
- ✅ Health endpoint funcional con 1 test
- ✅ Frontend scaffold con Next.js, Tailwind
- ✅ Componentes UI: RecordButton, ConversationHistory, useRecorderUI hook
- ✅ ApiClient para comunicación HTTP
- ❌ Todo el pipeline de audio es mock (sin integración real STT/LLM/TTS)
- ❌ Frontend usa datos mock, no conectado al backend real
- ✅ Tests de backend: health, voice, tasks, meetings (9 tests)
- ✅ Frontend vitest configurado con @testing-library/react
- ❌ Sin CI/CD
- ❌ Sin Docker, sin vars de entorno completas

---

## Tareas

### Fase BE-1: Backend — Pipeline de voz real

- [ ] `[BE]` **#1.1** Integrar STT real (Whisper / API externa) en `/voice/turn` — [#7](https://github.com/NickGV/netvocal/issues/7)
  - Implementar `transcribe(audio_bytes)` en servicio STT
  - Aceptar audio binario en endpoint (multipart o base64)
  - Mock actual como fallback
- [ ] `[BE]` **#1.2** Integrar LLM real (OpenAI / Claude API) en `/voice/turn` — [#4](https://github.com/NickGV/netvocal/issues/4)
  - Implementar `generate_reply(user_text)` contra API externa
  - Mantener MockLLMService como fallback configurable
- [ ] `[BE]` **#1.3** Integrar TTS real (API externa) en `/voice/turn`
  - Implementar `synthesize(text)` → audio bytes
  - Devolver audio en respuesta o streaming
  - Mock actual como fallback
- [ ] `[BE]` **#1.4** Persistir historial de conversación en memoria — [#5](https://github.com/NickGV/netvocal/issues/5)
  - Almacenar turns (usuario + asistente) por sesión
  - Endpoint `GET /voice/history` para recuperar historial
- [ ] `[BE]` **#1.5** Migrar historial a persistencia duradera (SQLite / archivo)
  - Reemplazar almacenamiento en memoria
  - Mantener interfaz intercambiable

### Fase BE-2: Backend — Tasks & Meetings

- [ ] `[BE]` **#2.1** Implementar CRUD real de tareas (con persistencia en memoria) — [#6](https://github.com/NickGV/netvocal/issues/6)
  - GET /tasks, POST /tasks, DELETE /tasks/:id
  - Validación de fechas, estados
- [ ] `[BE]` **#2.2** Implementar CRUD real de reuniones (con persistencia en memoria)
  - GET /meetings, POST /meetings, DELETE /meetings/:id
- [ ] `[BE]` **#2.3** Parsear intenciones del usuario vía LLM
  - Detectar si el texto del usuario es: "crear tarea", "agendar reunión", "consulta", etc.
  - Ejecutar acción correspondiente automáticamente

### Fase BE-3: Backend — Tests

- [ ] `[BE]` **#3.1** Tests unitarios para servicios STT, LLM, TTS (con mocks)
- [ ] `[BE]` **#3.2** Tests de integración para endpoints voice, tasks, meetings
- [ ] `[BE]` **#3.3** Tests de error handling (timeouts, API caídas, validación)

### Fase FE-1: Frontend — Pipeline real

- [ ] `[FE]` **#4.1** Conectar botón de grabación al endpoint real `/voice/turn`
  - Enviar texto (y luego audio) al backend
  - Mostrar respuesta real en el historial
- [ ] `[FE]` **#4.2** Capturar audio real del micrófono (MediaRecorder API)
  - Reemplazar el estado `isRecording` mock por grabación real
  - Enviar audio blob al backend
- [ ] `[FE]` **#4.3** Consumir historial real desde `GET /voice/history`
  - Reemplazar datos mock en ConversationHistory
- [ ] `[FE]` **#4.4** Manejar y mostrar errores del backend en UI
  - Timeout, conexión rechazada, errores HTTP
  - Feedback visual al usuario

### Fase FE-2: Frontend — Tasks & Meetings UI

- [ ] `[FE]` **#5.1** UI para listar y crear tareas desde el dashboard
  - Lista de tareas pendientes
  - Formulario inline de creación
- [ ] `[FE]` **#5.2** UI para listar y crear reuniones desde el dashboard
  - Vista de reuniones agendadas
- [ ] `[FE]` **#5.3** Integrar comandos de voz con tasks/meetings
  - "Crea una tarea..." → llama a POST /tasks
  - "Agenda una reunión..." → llama a POST /meetings

### Fase INFRA: Infraestructura y Documentación

- [x] `[DOC]` **#31** Software Journey section (“Tracer Bullet”) en docs/01-tracer-bullet.md

- [ ] `[INFRA]` **#6.1** Configurar variables de entorno completas — [#8](https://github.com/NickGV/netvocal/issues/8)
  - `.env.example` con todas las vars necesarias
  - Documentar en README
- [ ] `[INFRA]` **#6.2** Agregar tests de frontend (vitest) — [#9](https://github.com/NickGV/netvocal/issues/9)
  - Configurar vitest en apps/web
  - Tests para componentes y hooks
- [ ] `[INFRA]` **#6.3** Documentar happy path completo en README
  - Cómo levantar backend + frontend
  - Cómo ejecutar tests
  - Variables de entorno requeridas
- [ ] `[INFRA]` **#6.4** Docker Compose para dev (opcional)
  - Dockerfile para backend
  - Dockerfile para frontend
  - docker-compose.yml

---

## Dependencias entre tareas

```
# Fase BE-1 (backbone del pipeline)
BE-1.1 → BE-1.2 → BE-1.3
BE-1.4 → BE-1.5

# Fase BE-2 (productividad)
BE-2.1, BE-2.2 (independientes entre sí)
BE-2.3 → BE-2.1, BE-2.2

# Fase BE-3 (tests — pueden empezar en paralelo con BE-2)
BE-3.1 → BE-3.2 → BE-3.3

# Fase FE-1 (depende del backend)
FE-4.1 → BE-1.3 (necesita /voice/turn funcional)
FE-4.2 → FE-4.1 (primero texto, luego audio)
FE-4.3 → BE-1.4 (necesita historial en backend)
FE-4.4 → FE-4.1 (necesita conexión real)

# Fase FE-2
FE-5.1 → BE-2.1
FE-5.2 → BE-2.2
FE-5.3 → FE-5.1, FE-5.2

# Infra
INFRA-6.1 (independiente)
INFRA-6.2 (independiente)
INFRA-6.3 → INFRA-6.1
INFRA-6.4 (independiente)
```

## Criterios de éxito

- [ ] El pipeline completo Micrófono → STT → LLM → TTS → Altavoz funciona end-to-end
- [ ] El usuario puede crear/consultar tareas y reuniones por voz
- [ ] La UI muestra historial real, errores manejados, estado de grabación
- [ ] Tests en backend y frontend pasan
- [ ] README documenta cómo levantar y usar el sistema
