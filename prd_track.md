# PRD Track — NetVocal Voice Chatbot

## Sprint: Integración Frontend ↔ Backend (Rama `developKevin`)

### Estado general

| Tarea | Estado | Archivos involucrados |
|---|---|---|
| Fix timestamp schema incompatibility (ISO string) | ✅ | `apps/web/src/features/voice/types.ts` |
| [FE] #4.1 Conectar input/button a endpoint real `/voice/turn` | ✅ | `useRecorderUI.ts`, `page.tsx` |
| [FE] #4.2 Captura real y flujo MediaRecorder API | ✅ | `useRecorderUI.ts`, `RecordButton.tsx`, `page.tsx` |
| [FE] #4.3 Consumir historial real `GET /voice/history` | ✅ | `useRecorderUI.ts` |
| [BE] Endpoint `GET /voice/history` + persistencia en memoria | ✅ | `routes/voice.py`, `schemas/voice.py` |
| [FE] #4.4 Manejo y visualización de errores (Toast system) | ✅ | `Toast.tsx`, `useRecorderUI.ts`, `page.tsx` |

### Resumen de cambios

1. **Schema:** `ConversationItem.timestamp` ahora es ISO string (no UNIX epoch).
2. **Backend:** Nuevo endpoint `GET /voice/history` que retorna la lista de turns en memoria.
   Cada `POST /turn` persiste automáticamente user + assistant turn.
3. **Frontend:**
   - Hook `useRecorderUI` ahora inicia con fetch a `/voice/history` (sin hardcode).
   - Grabación real con `MediaRecorder` API (permisos, start/stop, blobs).
   - Sistema de toasts reemplaza `alert()` y muestra errores de red/API.
   - `RecordButton` refactorizado a props `onStart`/`onStop`.
4. **UI:** Botón graba con micrófono real, muestra toasts en bottom-right.

### Pendientes / Próximos pasos

- [ ] Envío real de blob de audio al backend (cuando BE soporte `/voice/audio`).
- [ ] Soporte de reproducción de audio respuesta (TTS).
- [ ] Tests E2E del flujo completo.
