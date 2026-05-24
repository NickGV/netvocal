# PRD Track D — Frontend UI + Infraestructura

> **Proyecto:** NETVOCAL
> **Developer:** D
> **Branch:** develop (todo mergeado)
> **Stack:** FastAPI (backend) + Next.js (frontend) + pnpm monorepo

## Tareas

### ✅ Fase INFRA: Completada

- [x] `[INFRA]` **#6.1** Configurar variables de entorno completas — [#8](https://github.com/NickGV/netvocal/issues/8)
- [x] `[INFRA]` **#6.2** Agregar tests de frontend (vitest) — [#9](https://github.com/NickGV/netvocal/issues/9)
- [x] `[INFRA]` **#6.3** Documentar happy path completo en README
- [x] `[INFRA]` **#6.4** Docker Compose para dev

### Fase FE-1: Frontend — Pipeline real

- [x] `[FE]` **#4.1** Conectar botón de grabación al endpoint real `/voice/turn` (texto) — [#16](https://github.com/NickGV/netvocal/issues/16)

- [ ] `[FE]` **#4.2** Capturar audio real del micrófono (MediaRecorder API) — [#17](https://github.com/NickGV/netvocal/issues/17)
  - Reemplazar el estado `isRecording` mock por grabación real
  - Enviar audio blob al backend POST /voice/turn/audio
  - Dependencia: FE-4.1

- [x] `[FE]` **#4.3** Consumir historial real desde `GET /voice/history` — [#18](https://github.com/NickGV/netvocal/issues/18)
  - Eliminar mock greeting ("Hi — I'm ready when you are.")
  - Agregar `historyLoading` state para feedback de carga
  - Loading indicator en Conversation mientras se obtiene historial
  - Dependencia: BE-1.4 ✅

- [ ] `[FE]` **#4.4** Manejar y mostrar errores del backend en UI — [#19](https://github.com/NickGV/netvocal/issues/19)
  - Timeout, conexión rechazada, errores HTTP
  - Feedback visual al usuario
  - Dependencia: FE-4.1

### ✅ Fase FE-2: Frontend — Tasks & Meetings UI

- [x] `[FE]` **#5.1** UI para listar y crear tareas desde el dashboard — [#20](https://github.com/NickGV/netvocal/issues/20)
  - Lista de tareas pendientes (GET /tasks)
  - Formulario inline de creación (POST /tasks)
  - Dependencia: BE-2.1 ✅ (ya integrado)

- [x] `[FE]` **#5.2** UI para listar y crear reuniones desde el dashboard — [#21](https://github.com/NickGV/netvocal/issues/21)
  - Vista de reuniones agendadas (GET /meetings)
  - Formulario inline de creación (POST /meetings)
  - Dependencia: BE-2.2 ✅

- [x] `[FE]` **#5.3** Integrar comandos de voz con tasks/meetings — [#22](https://github.com/NickGV/netvocal/issues/22)
  - `parseIntent()` en ApiClient para POST /intent/parse
  - `addSystemMessage()` en useRecorderUI para mensajes externos
  - Componente QuickCommand con input de texto + parsing de intentos
  - Callbacks de refresco de tareas y reuniones por intento
  - Dependencia: FE-5.1, FE-5.2

---

## Dependencias entre tareas

```
FE-4.1 (independiente)
FE-4.2 → FE-4.1
FE-4.3 (independiente — necesita BE-1.4 ✅)
FE-4.4 → FE-4.1

FE-5.1 (independiente — necesita BE-2.1 ✅)
FE-5.2 (independiente — necesita BE-2.2 ✅)
FE-5.3 → FE-5.1, FE-5.2
```

## Criterios de éxito

- [x] `.env.example` completo
- [x] Tests de frontend pasando (vitest)
- [x] README documentado
- [x] Docker Compose funcional
- [ ] La UI envía texto al backend y muestra respuesta real
- [ ] La grabación de audio funciona end-to-end
- [ ] El historial se recupera al recargar la página
- [ ] Los errores se muestran con mensajes claros al usuario
- [ ] Dashboard de tareas funcionando con backend real
- [ ] Dashboard de reuniones funcionando con backend real
- [ ] Comandos de voz crean tareas y reuniones automáticamente
