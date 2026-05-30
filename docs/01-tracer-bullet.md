# Bala Trazadora

## El enfoque de riesgo primero

Siguiendo el concepto de *Tracer Bullet* de John Ousterhout, priorizamos construir el pipeline de voz completo desde el inicio — el componente de mayor riesgo técnico — antes de profundizar en cualquier capa horizontal.

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

### Por qué el pipeline de voz era el riesgo más alto

```
Micrófono → STT (Whisper API) → LLM (OpenAI Chat) → TTS (OpenAI TTS) → Altavoz
```

Ningún miembro del equipo había integrado estos servicios anteriormente. Los riesgos identificados incluían: API keys, timeouts, formatos de audio, latencia y dependencias externas.

### Cómo Ralph forzó el enfoque

Los scripts `ralph/once.sh` y `ralph/once_track.sh` desglosaron el PRD en issues verticales (end-to-end) en vez de capas horizontales, forzando a construir la bala trazadora primero.

### Provider Switching

El sistema de dependencias en `deps.py` permitió alternar entre implementaciones Mock y reales sin cambiar el código de los endpoints:

```python
def get_llm_service() -> LLMService:
    settings = Settings()
    if settings.llm_provider == "openai":
        return OpenAILLMService(api_key=settings.openai_api_key, ...)
    return MockLLMService()
```

Esto habilitó el desarrollo paralelo del frontend mientras se integraban las APIs reales.

### Aprendizajes

- La bala trazadora destrabó incertidumbre técnica rápidamente
- Los mocks permitieron desarrollo frontend sin backend completo
- El enfoque vertical expuso riesgos de integración temprano
