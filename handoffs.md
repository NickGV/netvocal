# Bitácora de Transferencia (handoffs)

---

## Handoff 2026-05-21 — DevVoice Assistant

### Estado del proyecto

Pipeline de voz: 3/4 módulos implementados (STT ✅ LLM ✅ TTS ⏳)

**Commits:**
| Commit | Feature | Issue |
|--------|---------|-------|
| `5eb9e47` | BE-1.4 Conversation history en memoria | [#5](https://github.com/NickGV/netvocal/issues/5) |
| `3588897` | BE-1.1 STT real (OpenAI Whisper API) | [#7](https://github.com/NickGV/netvocal/issues/7) |
| `d7c154a` | BE-1.2 LLM real (OpenAI Chat Completions) | [#4](https://github.com/NickGV/netvocal/issues/4) |

**Working tree:** Limpio | **Tests:** 25/25 pasando (21 BE + 4 FE)

### Pendiente crítico
Frontend espera `ts` (número UNIX epoch) pero backend guarda `timestamp` (string ISO) — romperá al conectar FE con BE real.

### Próximas tareas (en orden)
1. BE-1.3 TTS real (completa pipeline backbone)
2. BE-2.1 Tasks CRUD
3. FE-4.1 Conectar frontend al backend (requiere BE-1.3)
4. INFRA-6.1 Env vars + INFRA-6.3 README actualizado
5. Crear issues faltantes: BE-1.3, BE-2.2, BE-2.3, FE-4.x, FE-5.x

### Referencias
- **PRD:** `ralph/PRD.md`
- **Progreso:** `ralph/progress.txt`
- **Issues:** https://github.com/NickGV/netvocal/issues
- **Handoff completo:** `/tmp/ralph-handoff-2026-05-21.md`
