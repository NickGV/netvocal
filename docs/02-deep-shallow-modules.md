# Deep vs Shallow Modules

## Módulos Profundos (Deep Modules)

### STTService / LLMService / TTSService

Interfaz extremadamente simple (1 método, 2 parámetros) que oculta complejidad significativa: llamadas HTTP a APIs externas, manejo de formatos, autenticación y timeouts.

```python
class LLMService(ABC):
    @abstractmethod
    async def generate_reply(self, user_text: str,
                             conversation_history: list[dict] | None = None) -> str: ...
```

Ratio interfaz/implementación excepcionalmente alto.

### ConversationStore → SQLiteConversationStore

3 métodos simples (`create_session`, `add_turn`, `get_history`) que ocultan esquema SQLite, conexiones, transacciones y serialización:

```python
class ConversationStore(ABC):
    @abstractmethod
    def get_history(self, session_id: str) -> list[dict]: ...
```

### deps.py — Provider Factory

Oculta la lógica de selección de proveedor y configuración detrás de funciones simples:

```python
def get_stt_service() -> STTService: ...
def get_llm_service() -> LLMService: ...
def get_tts_service() -> TTSService: ...
```

## Módulos Superficiales (Shallow Modules)

### Duplicación de estructura de rutas

Conviven dos estructuras con los mismos endpoints:
- `apps/api/routers/` (plana, sin `__init__.py`)
- `apps/api/app/api/routes/` (anidada, con `__init__.py`)

Esto crea confusión sobre qué módulo importar y duplica mantenimiento. Se recomienda consolidar en la estructura anidada `app/`.

### Schemas planos individuales

Archivos como `apps/api/schemas/task_schema.py` contienen una sola clase Pydantic. Son módulos extremadamente superficiales que podrían unificarse.

## Fuga de Información (Information Leakage)

En `app/db/memory.py`, el módulo importa directamente `SQLiteConversationStore` en vez de usar una factory, filtrando detalles de implementación a capas superiores.

## Recomendaciones

- Mantener el diseño profundo de los servicios base (STT, LLM, TTS)
- Consolidar la duplicación de rutas a una sola estructura
- Unificar schemas pequeños en archivos más cohesivos
- Usar factories para el store en vez de imports directos
