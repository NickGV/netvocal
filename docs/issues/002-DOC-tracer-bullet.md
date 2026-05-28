# [DOC] Sección 1: La Bala Trazadora y el Enrutamiento de Skills

## 🎯 Objetivo
Narrar cómo la estrategia de exploración con Ralph y el desglose de issues refinaron las assumptions del equipo ANTES de escribir código, usando la analogía de la "Bala Trazadora" de Ousterhout.

## 📋 Tareas

### 1.1 El árbol de diseño y las assumptions iniciales
- Revisar el PRD original: `ralph/PRD.md`
- Analizar cómo se desglosó en issues verticales usando Ralph
- Explicar cómo los scripts `once.sh` y `once_track.sh` forzaron a pensar en *vertical slices* (end-to-end) en vez de capas horizontales
- Mostrar código de referencia: `ralph/once.sh`, `ralph/once_track.sh`

### 1.2 Identificación del riesgo más alto
- Documentar por qué el pipeline de voz completo era lo más incierto:
  ```
  Micrófono → STT (Whisper API) → LLM (OpenAI Chat) → TTS (OpenAI TTS) → Altavoz
  ```
- Listar riesgos específicos: API keys, timeouts, formatos de audio, latencia, dependencias externas
- Evidenciar que ningún developer del equipo había integrado estos servicios antes

### 1.3 La Bala Trazadora en acción
- Detallar cómo los issues #7 (STT real), #4 (LLM real), #10 (TTS real) se atacaron PRIMERO
- Analizar el endpoint `POST /voice/turn` como la bala trazadora:
  ```python
  # apps/api/app/api/routes/voice.py
  @router.post("/turn", response_model=VoiceTurnResponse)
  async def voice_turn(
      payload: VoiceTurnRequest,
      stt: STTService = Depends(get_stt_service),
      llm: LLMService = Depends(get_llm_service),
      tts: TTSService = Depends(get_tts_service),
      store: ConversationStore = Depends(get_conversation_store),
  ) -> VoiceTurnResponse:
      history = store.get_history(payload.session_id)
      assistant_text = await llm.generate_reply(payload.utterance, history)
      store.add_turn(payload.session_id, payload.utterance, assistant_text)
      return VoiceTurnResponse(assistant_text=assistant_text, ...)
  ```
- Explicar cómo esto demostró que la arquitectura funcionaba y destrabó el desarrollo paralelo

### 1.4 Feedback temprano y corrección de rumbo
- Describir cómo los mocks permitieron desarrollo frontend en paralelo
- Analizar el provider-switching en `deps.py` que permitió probar sin APIs reales
- Documentar aprendizajes obtenidos durante esta fase

### 1.5 Conclusión
- Evaluar si la bala trazadora cumplió su propósito
- Lecciones aprendidas para futuros proyectos

## 📄 Archivo de salida
Crear: `docs/01-tracer-bullet.md`

## ✅ Definition of Done
- [ ] Archivo `docs/01-tracer-bullet.md` creado con narrativa completa
- [ ] Usa terminología de Ousterhout (Tracer Bullet, vertical slices)
- [ ] Incluye snippets de código reales del proyecto
- [ ] Explica claramente cómo Ralph forzó el enfoque de riesgo primero
- [ ] Concluye con aprendizajes concretos