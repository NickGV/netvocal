# Anatomía de la Complejidad: Deep vs Shallow Modules en NETVOCAL

## Introducción

Este análisis aplica los principios arquitectónicos de John Ousterhout (A Philosophy of Software Design) para evaluar la estructura del proyecto NETVOCAL. El objetivo es caracterizar los módulos como **deep** o **shallow** según la relación entre interfaz pública e implementación interna, identificar casos de **information leakage** y evaluar el impacto en la complejidad cognitiva del sistema.

### Conceptos Clave

**Deep Module**: La interfaz oculta significativa complejidad tras una abstracción simple. El esfuerzo invertido en implementación es sustancialmente mayor que el necesario para entender y usar la interfaz.

**Shallow Module**: La interfaz expone la complejidad subyacente sin abstraerla. El costo cognitivo de usar el módulo es comparable al esfuerzo de implementación, violando el principio de ocultamiento de información.

**Information Leakage**: Cuando detalles de implementación de un módulo A filtran a los consumidores de A, obligándolos a entender y adaptarse a esos detalles internos.

---

## 1. Deep Modules: Core Abstractions

### 1.1 STTService / LLMService / TTSService (Provider Abstraction Layer)

#### Caracterización: **DEEP MODULE**

Las interfaces base de los servicios de IA representan abstracciones profundas por excelencia.

**Interfaz:**

```python
# apps/api/app/services/stt/base.py
class STTService(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        raise NotImplementedError
```

```python
# apps/api/app/services/llm/base.py
class LLMService(ABC):
    @abstractmethod
    async def generate_reply(self, user_text: str, conversation_history: list[dict] | None = None) -> str:
        raise NotImplementedError
```

```python
# apps/api/app/services/tts/base.py
class TTSService(ABC):
    @abstractmethod
    async def synthesize(self, text: str) -> bytes:
        raise NotImplementedError
```

**Implementación (Ejemplo: OpenAI Whisper STT):**

```python
# apps/api/app/services/stt/openai.py
class OpenAIWhisperSTTService(STTService):
    def __init__(self, api_key: str, model: str = "whisper-1") -> None:
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        transcript = await self._client.audio.transcriptions.create(
            model=self._model,
            file=(filename, audio_bytes),
        )
        return transcript.text
```

#### Por Qué Es Deep

1. **Ocultamiento de Complejidad Externa**: La interfaz oculta completamente la interacción con OpenAI API:
   - Gestión de conexiones asincrónicas (`AsyncOpenAI`)
   - Manejo de rate limiting implícito
   - Serialización de audio para transmisión HTTP
   - Parseo de respuestas JSON de OpenAI

2. **Simplicidad de Contrato**: El consumidor solo necesita pasar `bytes` y recibir `str`. No requiere entender:
   - OAuth/API keys (manejado en `__init__`)
   - Serialización multipart/form-data
   - Formato específico del endpoint `/audio/transcriptions`

3. **Cambio Amplificado Invisible**: Si migramos de OpenAI Whisper a Google Cloud Speech-to-Text, solo `apps/api/app/services/stt/openai.py` cambia. El resto del sistema permanece intacto.

#### Patrón de Inyección de Dependencias

```python
# apps/api/app/core/deps.py
def get_stt_service() -> STTService:
    settings = Settings()
    if settings.stt_provider == "openai":
        return OpenAIWhisperSTTService(
            api_key=settings.openai_api_key,
            model=settings.whisper_model,
        )
    return MockSTTService()
```

El factory pattern centraliza la lógica de switching entre providers. Este es un caso de **deep module composition**: la complejidad de seleccionar e inicializar providers se encapsula en una única ubicación.

#### Impacto Arquitectónico

- **Bajo acoplamiento**: Rutas HTTP dependen solo de abstracciones base, no de implementaciones concretas
- **Testabilidad**: Switching a `MockSTTService` para tests es trivial
- **Extensibilidad**: Agregar un nuevo provider (e.g., Google Cloud) requiere crear solo `GoogleCloudSTTService` e incluirlo en `deps.py`

---

### 1.2 ConversationStore / SQLiteConversationStore (Persistent Storage Abstraction)

#### Caracterización: **DEEP MODULE**

La capa de persistencia es profunda porque oculta complejidad significativa de base de datos tras una interfaz simple.

**Interfaz Abstracta:**

```python
# apps/api/app/db/sqlite_store.py
class ConversationStore:
    """Abstract interface for conversation storage."""
    
    def create_session(self) -> str:
        raise NotImplementedError
    
    def add_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        raise NotImplementedError
    
    def get_history(self, session_id: str) -> list[dict]:
        raise NotImplementedError
```

**Implementación Concreta (SQLite):**

```python
# apps/api/app/db/sqlite_store.py (excerpt)
class SQLiteConversationStore(ConversationStore):
    def _init_db(self) -> None:
        """Initialize database schema if not exists."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS turns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                text TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES conversations(session_id)
                    ON DELETE CASCADE
            )
        """)
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_turns_session_id ON turns(session_id)"
        )
        conn.commit()

    def add_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        now = datetime.now(UTC).isoformat()
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Ensure session exists
        cursor.execute(
            "SELECT session_id FROM conversations WHERE session_id = ?",
            (session_id,)
        )
        if cursor.fetchone() is None:
            cursor.execute(
                "INSERT INTO conversations (session_id, created_at, updated_at) VALUES (?, ?, ?)",
                (session_id, now, now)
            )
        
        # Add user and assistant turns with transaction semantics
        cursor.execute(
            "INSERT INTO turns (session_id, role, text, timestamp) VALUES (?, ?, ?, ?)",
            (session_id, "user", user_text, now)
        )
        cursor.execute(
            "INSERT INTO turns (session_id, role, text, timestamp) VALUES (?, ?, ?, ?)",
            (session_id, "assistant", assistant_text, now)
        )
        cursor.execute(
            "UPDATE conversations SET updated_at = ? WHERE session_id = ?",
            (now, session_id)
        )
        conn.commit()
```

#### Por Qué Es Deep

1. **Complejidad Oculta**:
   - Gestión de conexiones SQLite (pooling, thread-safety via `check_same_thread=False`)
   - Schema con relaciones (foreign keys, cascade delete)
   - Transacciones implícitas (llamadas a `commit()`)
   - Indexes para optimización de queries

2. **Interfaz Minimalista**: El consumidor solo:
   ```python
   store.add_turn(session_id, "hola", "¿qué tal?")
   history = store.get_history(session_id)
   ```

3. **Invariantes Encapsuladas**: 
   - Validación de referencias (existe session_id)
   - Atomicidad: usuario + asistente siempre se escriben juntos
   - Timestamp sincronizado en UTC
   - Ordenamiento implícito por `id ASC` al recuperar

#### Patrón de Abstracción con Memoria

```python
# apps/api/app/db/sqlite_store.py
class MemoryConversationStore(ConversationStore):
    """In-memory implementation for testing."""
    
    def __init__(self) -> None:
        self._store: dict[str, list[dict]] = {}
    
    def create_session(self) -> str:
        session_id = uuid4().hex[:12]
        self._store[session_id] = []
        return session_id
```

La existencia de `MemoryConversationStore` demuestra que la abstracción es **suficientemente profunda**: puede tener múltiples implementaciones sin que los consumidores lo noten.

#### Uso en Rutas

```python
# apps/api/app/api/routes/voice.py
@router.post("/turn", response_model=VoiceTurnResponse)
async def voice_turn(
    payload: VoiceTurnRequest,
    store: ConversationStore = Depends(get_conversation_store),
) -> VoiceTurnResponse:
    session_id = payload.session_id or store.create_session()
    history = store.get_history(session_id)
    assistant_text = await llm.generate_reply(payload.utterance, conversation_history=history)
    store.add_turn(session_id, payload.utterance, assistant_text)
    return VoiceTurnResponse(assistant_text=assistant_text, session_id=session_id)
```

La ruta no sabe si está usando SQLite o memoria. Este es **information hiding genuino**.

---

### 1.3 Provider Factory (deps.py) — Deep Module Composition

#### Caracterización: **SEMI-DEEP MODULE** (enfoque composicional)

```python
# apps/api/app/core/deps.py
def get_stt_service() -> STTService:
    settings = Settings()
    if settings.stt_provider == "openai":
        return OpenAIWhisperSTTService(
            api_key=settings.openai_api_key,
            model=settings.whisper_model,
        )
    return MockSTTService()
```

#### Por Qué Contribuye a Profundidad

1. **Centralización de Decisiones**: La lógica de "qué provider usar" está en **un solo lugar**
2. **Configuración Basada en Entorno**: Extrae decisiones del código hacia `.env` variables
3. **Aislamiento de Switching**: Si añadimos 10 nuevos providers, solo `deps.py` crece

#### Potencial Débil: Escalabilidad

Si el proyecto creciera significativamente, podrían existir múltiples factories o DI containers más sofisticados. Por ahora, la simplicidad es una fortaleza.

---

## 2. Shallow Modules: Problemas Arquitectónicos

### 2.1 Duplicación de Arquitecturas (routers/ vs app/api/routes/)

#### Caracterización: **SHALLOW PATTERN — Information Leakage**

Existen dos estructuras de routing paralelas:

**Arquitectura 1 (apps/api/routers/):**
```
apps/api/
├── routers/
│   ├── tasks.py
│   ├── meetings.py
│   └── intent.py
├── services/
│   ├── task_service.py
│   └── meeting_service.py
└── schemas/
    ├── task_schema.py
    ├── meeting_schema.py
    └── intent_schema.py
```

**Arquitectura 2 (apps/api/app/api/routes/):**
```
apps/api/app/
├── api/
│   └── routes/
│       ├── tasks.py
│       ├── meetings.py
│       ├── intent.py
│       ├── voice.py
│       └── health.py
├── services/
│   ├── stt/
│   ├── llm/
│   └── tts/
└── schemas/
    ├── tasks.py
    ├── voice.py
    └── meetings.py
```

#### Comparación: tasks.py

**Estilo Legacy (apps/api/routers/tasks.py):**
```python
@router.get("/", response_model=List[Task])
def list_tasks():
    return task_service.get_tasks()

@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate):
    return task_service.add_task(task)
```

**Estilo Moderno (apps/api/app/api/routes/tasks.py):**
```python
@router.get("/", response_model=list[Task])
async def list_tasks() -> list[Task]:
    return list(_tasks.values())

@router.post("/", response_model=Task)
async def create_task(payload: TaskCreate) -> Task:
    task = Task(id=str(uuid4()), title=payload.title, due_at=payload.due_at)
    _tasks[task.id] = task
    return task
```

#### Impacto Negativo

| Aspecto | Impacto |
|--------|--------|
| **Discoverabilidad** | Un desarrollador debe buscar en dos lugares para entender "cómo se hacen tasks" |
| **Consistencia** | Diferentes patrones de error handling, validación e ID generation |
| **Mantenimiento** | Fix en `apps/api/routers/tasks.py` no se refleja en `app/api/routes/tasks.py` |
| **Carga Cognitiva** | Necesidad de entender DOS filosofías: "¿por qué existen dos versiones?" |

#### Causa Probable

Esto sugiere una **migración incompleta** de arquitectura legacy hacia un diseño moderno, sin deprecación clara del código antiguo.

#### Evaluación Técnica

Este patrón es un ejemplo directo de **shallow module proliferation**: ambas implementaciones exponen la complejidad de routing sin un propósito claro de por qué coexisten.

---

### 2.2 Fragmentación de Schemas — Shallow Module Problem

#### Caracterización: **SHALLOW MODULES**

Existen múltiples archivos de schemas muy pequeños:

```
apps/api/schemas/
├── task_schema.py       (34 líneas)
├── meeting_schema.py
├── intent_schema.py     (17 líneas)

apps/api/app/schemas/
├── tasks.py             (14 líneas)
├── voice.py             (22 líneas)
├── meetings.py
```

#### Análisis: task_schema.py vs tasks.py

**Versión Legacy (34 líneas, full-featured):**
```python
class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=500)
    due_date: Optional[datetime] = Field(None)
    status: TaskStatus = TaskStatus.PENDING
    
    @validator("due_date", pre=True, always=True)
    def parse_due_date(cls, value):
        # ... validation logic
```

**Versión Moderna (14 líneas, minimalista):**
```python
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    due_at: datetime | None = None

class Task(BaseModel):
    id: str
    title: str
    due_at: datetime | None = None
```

#### Por Qué Son Shallow

1. **Bajo Valor de Abstracción**: 14 líneas de Pydantic son apenas una capa sobre tipos Python
2. **Facilidad de Duplicación**: Copiar/pegar los schemas es más simple que refactorizar
3. **Discoverability Débil**: "¿Dónde está la definición de Task?" → respuesta ambigua
4. **Mantenimiento Fragmentado**: Cambios en reglas de validación podrían olvidarse en una versión

#### Carga Cognitiva

Un desarrollador pregunta: "¿Debo usar `TaskCreate` de `apps/api/schemas/task_schema.py` o de `apps/api/app/schemas/tasks.py`?"

Sin documentación clara, esta decisión se convierte en un **friction point**.

---

### 2.3 Information Leakage: Exposición de Detalles SQLite

#### Caracterización: **PARTIAL INFORMATION LEAKAGE**

La dependencia en `SQLiteConversationStore` en `apps/api/app/db/memory.py`:

```python
# apps/api/app/db/memory.py
from app.db.sqlite_store import ConversationStore, SQLiteConversationStore

_store = SQLiteConversationStore()

def get_conversation_store() -> ConversationStore:
    return _store
```

#### Análisis

**Lo Bueno (information hiding correcto):**
- La función retorna `ConversationStore` (interfaz abstracta)
- El código de rutas nunca ve `SQLiteConversationStore` directamente
- Cambiar a PostgreSQL solo requiere crear `PostgresConversationStore`

**Lo Preocupante (leakage potencial):**
- El archivo `memory.py` importa explícitamente `SQLiteConversationStore`
- Si la migración a otra BD requiere cambios en transacciones o schema, esos cambios se "filtran" hacia `memory.py` como actualizaciones obligatorias
- El nombre del archivo `memory.py` es engañoso: sugiere in-memory, pero es realmente un wrapper de SQLite

#### Riesgo Arquitectónico

Si en futuro se decide migrar a PostgreSQL:

```python
# Futuro cambio requerido en memory.py:
from app.db.postgres_store import ConversationStore, PostgresConversationStore

_store = PostgresConversationStore()  # ← information leakage
```

Este archivo actuaría como punto de fricción en la migración. La solución ideal sería:

```python
# Better approach: factory basado en settings
from app.core.settings import Settings

def get_conversation_store() -> ConversationStore:
    settings = Settings()
    if settings.db_provider == "postgres":
        return PostgresConversationStore()
    return SQLiteConversationStore()
```

---

## 3. Análisis de Errores y Fronteras de Módulos

### 3.1 Error Handling — Información Sensible en Respuestas

#### Caracterización: **SELECTIVE INFORMATION HIDING**

En `apps/api/app/api/routes/tasks.py`:

```python
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    if task_id not in _tasks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    del _tasks[task_id]
```

**Buena Práctica**: Expone `404` sin revelar estructura interna de `_tasks`

**Comparar con Legacy** (`apps/api/routers/tasks.py`):

```python
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str):
    task_service.delete_task(task_id)
    return
```

Sin error handling explícito, las excepciones internas de `task_service` potencialmente se exponen.

### 3.2 Timestamps e IDs en Responses

#### Análisis

```python
# apps/api/app/schemas/voice.py
class HistoryEntry(BaseModel):
    role: str
    text: str
    timestamp: str  # ← Expone ISO8601 timestamp del storage
```

**Evaluación**: El timestamp es **información legítima** (no es leakage peligroso). Pero representa la estructura interna de SQLite (timestamp TEXT) filtrándose hacia el cliente.

---

## 4. Patrones Positivos — Abstracciones Sostenibles

### 4.1 Inyección de Dependencias en Rutas

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
```

**Por Qué Es Deep**:
- Interfaz clara: recibe abstracciones, no implementaciones
- Responsabilidad separada: deps.py maneja provider resolution
- Testabilidad: inyectar mocks es trivial
- Cambio amplificado invisible: reemplazar OpenAI por Anthropic requiere solo cambios en `deps.py`

---

## 5. Evaluación de Complejidad Cognitiva por Módulo

| Módulo | Tipo | Interfaz Lines | Impl Lines | Profundidad | Riesgo |
|--------|------|---|---|---|---|
| STTService (base) | Abstract | 3 | - | **DEEP** | Bajo |
| OpenAIWhisperSTTService | Concrete | 16 | 16 | DEEP | Bajo |
| ConversationStore (abstract) | Abstract | 9 | - | **DEEP** | Bajo |
| SQLiteConversationStore | Concrete | 154 | 154 | DEEP | Bajo (si bien abstraída) |
| tasks.py (modern) | Schema | 14 | 14 | **SHALLOW** | Medio |
| task_schema.py (legacy) | Schema | 34 | 34 | **SHALLOW** | Medio |
| deps.py | Factory | 41 | 41 | SEMI-DEEP | Bajo |
| memory.py (misnomer) | Wrapper | 8 | 8 | SHALLOW | Bajo-Medio |

---

## 6. Recomendaciones Arquitectónicas

### 6.1 Consolidar Arquitecturas: Deprecar routers/ a favor de app/api/routes/

**Acción**: Crear Plan de Migración

1. **Mantener Feature Parity**: Asegurar que `app/api/routes/` tenga todas las features de `routers/`
2. **Deprecation Period**: Mantener `routers/` durante 1-2 sprints con warnings en logs
3. **Single Source of Truth**: Una vez migrado, eliminar `routers/` completamente

**Beneficio**: Eliminar el "cognitive overhead" de dos arquitecturas paralelas.

### 6.2 Consolidar Schemas: Unificar Validaciones

**Acción**: Centralizar schemas en `apps/api/app/schemas/`

```python
# Propuesta: apps/api/app/schemas/tasks.py (mejorado)
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(None, max_length=500)
    due_at: datetime | None = None
    status: TaskStatus = TaskStatus.PENDING  # ← reutilizar del legacy

class Task(TaskCreate):
    id: str
    created_at: datetime
    updated_at: datetime
```

**Beneficio**: Single source of truth, no duplicación.

### 6.3 Aplicar Factory Pattern a Storage

**Acción**: Mejorar `apps/api/app/db/memory.py` → `get_store.py` o integrar en `deps.py`

```python
# apps/api/app/core/deps.py (propuesta)
def get_conversation_store() -> ConversationStore:
    settings = Settings()
    if settings.db_provider == "postgres":
        return PostgresConversationStore(settings.db_url)
    elif settings.db_provider == "memory":
        return MemoryConversationStore()
    return SQLiteConversationStore(settings.sqlite_path)
```

**Beneficio**: Consistencia con patrón de providers (STT/LLM/TTS).

### 6.4 Estandarizar Async/Await

**Observación**: 
- `apps/api/app/api/routes/tasks.py` usa `async def` correctamente
- `apps/api/routers/tasks.py` usa `def` sincrónico

**Acción**: Todas las rutas deben ser `async`. FastAPI y el stack moderno asume asyncio.

---

## 7. Impacto de Coautoría con IA

El proyecto NETVOCAL presenta características que sugieren coautoría con IA:

1. **Fragmentación Arquitectónica**: Dos versiones de cada módulo (legacy y moderna) podrían indicar regeneración/refactor con prompts separados
2. **Inconsistencia de Nombrado**: `memory.py` no representa lo que hace (es SQLite wrapper, no memory store)
3. **Schemas Duplicados**: Copia/pega sin consolidación sugiere falta de refactor unificado
4. **Good News**: Las abstracciones core (STTService, LLMService, ConversationStore) son de alta calidad

**Aprendizaje**: La IA generó bien interfaces profundas, pero no consolidó bien arquitectura duplicada. Esto refuerza la importancia de **revisión arquitectónica post-generación**.

---

## 8. Conclusiones

### Módulos Deep (Sostenibles)

✅ **STTService, LLMService, TTSService** — Abstracciones bien diseñadas que ocultan complejidad de APIs externas
✅ **ConversationStore + SQLiteConversationStore** — Persistencia abstracta con interfaz limpia  
✅ **deps.py Factory** — Centralización de provider resolution

### Módulos Shallow (Requieren Atención)

⚠️ **routers/ vs app/api/routes/** — Duplicación arquitectónica sin propósito claro
⚠️ **Fragmentación de schemas** — Múltiples definiciones del mismo concepto  
⚠️ **memory.py** — Wrapper débil, debería ser parte de factory centralizado

### Information Leakage Identificado

🔴 **Partial**: `memory.py` acoplado a `SQLiteConversationStore`  
🟡 **Controlled**: Errores HTTP exponen estructura de decisiones, pero no datos sensibles  
🟢 **Good**: Rutas nunca ven detalles de providers concretos

### Recomendaciones Prioritarias

1. **Consolidar Arquitecturas**: Un único estilo de routing (`app/api/routes/`)
2. **Centralizar Schemas**: Eliminar duplicación en `apps/api/schemas/` / `app/schemas/`
3. **Aplicar Factory Unificado**: `deps.py` maneja storage, STT, LLM, TTS, logging
4. **Documentar Decisiones**: ADR para explicar por qué ciertos módulos son deep vs shallow

### Reflexión Final

NETVOCAL demuestra que **profundidad modular es alcanzable en proyectos co-creados con IA**, pero requiere disciplina post-generación. Las interfaces bien diseñadas (STTService, ConversationStore) reducen significativamente el costo cognitivo de cambios futuros. La duplicación arquitectónica es el mayor riesgo actual, y consolidarla sería el mayor impacto en mantenibilidad.

**Complejidad cognitiva** del sistema actual: **Moderada, con oportunidades claras de mejora**.
