# 01. La Bala Trazadora y el Enrutamiento de Skills

## 1. Introducción

### ¿Qué es una “Tracer Bullet”?
La técnica de “Tracer Bullet” (bala trazadora) en ingeniería de software consiste en construir rápidamente una implementación funcional mínima de un flujo crítico para validar la viabilidad arquitectónica antes de avanzar hacia un sistema completo. Inspirada por la metáfora balística—donde la bala trazadora permite ver el trayecto real y ajustar el disparo—, esta estrategia ayuda a identificar problemas fundamentales en integración, dependencias y acoplamientos tempranos en el ciclo de vida del proyecto.

### Contexto de Aplicación: Ousterhout y NETVOCAL
En su obra *A Philosophy of Software Design*, John Ousterhout enfatiza la importancia de evitar el diseño excesivamente especulativo, que puede producir complejidad accidental, promoviendo ciclos de retroalimentación cortos y validaciones estructurales tempranas. El equipo NETVOCAL adoptó esta filosofía, enfocado en implementar primero el pipeline de voz end-to-end, antes de invertir en la interfaz avanzada o funcionalidades periféricas. La bala trazadora fue la evidencia experimental de la factibilidad arquitectónica central.

## 2. El árbol de diseño y las assumptions iniciales

La estrategia de NETVOCAL inició con el despiece cuidadoso del Product Requirements Document (PRD) en vertical slices: bloques funcionales autónomos que implementan de punta a punta un flujo de valor tangible para el usuario. Este enfoque contrastó con la construcción por capas (API, lógica, UI por separado), favoreciendo la validación continua y riesgos controlados.

Herramientas como los scripts `once.sh` y `once_track.sh` de Ralph garantizaron esta disciplina. Por ejemplo, `ralph/once.sh`:

```bash
# Fragmento de once.sh
1: # Ralph — Human-in-the-loop: una iteración de implementación autónoma
...
33: 1. Encuentra la SIGUIENTE tarea incompleta en PRD.md cuya prioridad sea
34:    la más alta y cuyas dependencias estén satisfechas (mira el grafo de
35:    dependencias en la sección 'Dependencias entre tareas').
...
56: - SOLO UNA TAREA A LA VEZ. No te adelantes ni hagas dos tareas.
```

Así, el equipo se obligaba a implementar ciclos verticales completos, privilegiando la integración temprana del pipeline de voz sobre la creación anticipada de componentes de UI.

## 3. Identificación del mayor riesgo técnico

Desde el arranque, se identificó el pipeline completo de voz como el mayor foco de incertidumbre:

```
Micrófono → STT (Speech to Text) → LLM (Language Model) → TTS (Text to Speech) → Altavoz
```

Los principales riesgos incluían:
- **STT (Whisper API):** riesgo en rendimiento, formatos de audio, calidad de transcripción y dependencias externas.
- **LLM (OpenAI):** manejo de latencia, límites de contexto, credencialización.
- **TTS (OpenAI):** variabilidad en tiempos de síntesis y retorno de audio.
- **Integración asíncrona:** asegurar manejo de timeouts y errores en cada eslabón del pipeline.
- **Audio:** normalización de archivos, integridad de los blobs y compatibilidad cross-browser/front.

Estos factores confluían en el endpoint `/voice/turn`, base de cualquier experiencia usable para el usuario final.

## 4. La Bala Trazadora en acción

Al revisar el backlog, las primeras issues priorizadas fueron:
- **[#7](https://github.com/NickGV/netvocal/issues/7):** Integrar **STT** real.
- **[#4](https://github.com/NickGV/netvocal/issues/4):** Integrar **LLM** real.
- **[#10](https://github.com/NickGV/netvocal/issues/10):** Integrar **TTS** real.

Esto se materializó en la implementación del endpoint crítico, tal como se observa en `apps/api/app/api/routes/voice.py`:

```python
@router.post("/turn", response_model=VoiceTurnResponse)
async def voice_turn(
    payload: VoiceTurnRequest,
    stt: STTService = Depends(get_stt_service),
    llm: LLMService = Depends(get_llm_service),
    tts: TTSService = Depends(get_tts_service),
    store: ConversationStore = Depends(get_conversation_store),
) -> VoiceTurnResponse:
    session_id = payload.session_id or store.create_session()
    history = store.get_history(session_id)
    assistant_text = await llm.generate_reply(payload.utterance, conversation_history=history)
    store.add_turn(session_id, payload.utterance, assistant_text)
    return VoiceTurnResponse(assistant_text=assistant_text, session_id=session_id)
```
**Explicación técnica:**
- Uso explícito de inyección de dependencias para facilitar el switching de providers.
- Abstracción conversacional desacoplada: `ConversationStore` permite swap entre memoria y persistencia.
- Flujo asíncrono de extremo a extremo: cada request se orquesta sin bloqueo y persiste historial.
- El mismo patrón fue replicado para `/turn/audio`, soportando entrada de audio real.

## 5. Feedback temprano y corrección de rumbo

Una clave para el éxito fue la estructura orientada a mocks y providers intercambiables, desacoplados vía settings y `deps.py`:

```python
# apps/api/app/core/deps.py
from app.services.stt.mock import MockSTTService
from app.services.stt.openai import OpenAIWhisperSTTService
...
def get_stt_service() -> STTService:
    settings = Settings()
    if settings.stt_provider == "openai":
        return OpenAIWhisperSTTService(...)  # integración real
    return MockSTTService()  # fallback para desarrollo
```

Esto permitió:
- Desarrollar y testear frontend sobre endpoints funcionales aunque el backend estuviera aun en mock.
- Reactivar el pipeline completo apenas un solo eslabón (STT, LLM, TTS) estuviera disponible real por settings.
- Reducir tiempos de bloqueo: desarrollo verdaderamente paralelo.
- Minimizar deuda técnica al migrar de memory store a SQLite sin reescribir la UI ni la API (`ConversationStore` como interfaz estable).

### Ejemplo de Mocks

```python
# apps/api/app/services/llm/mock.py
class MockLLMService(LLMService):
    async def generate_reply(self, user_text: str, conversation_history: list[dict] | None = None) -> str:
        _ = conversation_history
        return f"(mock) You said: {user_text}".strip()
```

## 6. Conclusión

La implementación disciplinada de la bala trazadora en NETVOCAL validó, de manera empírica y rápida, la viabilidad de la arquitectura central. Los beneficios fueron claros:

- **Reducción de riesgo:** Posibilitó detectar problemas de integración, performance y desacople antes de invertir recursos en la UI o features secundarias.
- **Desarrollo paralelo real:** Los mocks y el switching permitieron progresar sin cuellos de botella inter-equipo.
- **Simplicidad y claridad** (Ousterhout): El foco en el “happy path” primero redujo la tentación de overengineering o diseñar para todos los casos posibles desde el inicio.
- **Escalabilidad y testabilidad:** La arquitectura modular y desacoplada facilita ya el crecimiento y mantenimiento futuro.

**Lección para proyectos futuros:**
Comenzar validando el flujo crítico, con tracer bullets verticales, es la estrategia de mayor retorno/riesgo. Permite iterar, obtener feedback extremo a extremo y sentar bases robustas para el crecimiento del producto.
