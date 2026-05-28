# Plan de Entrega Final — Tarea 3: Software Journey

> **Proyecto:** NETVOCAL — DevVoice Assistant
> **Equipo:** Nicolas Gomez, Elber Mendoza, Estiven Bernal, Kevin Rojas
> **Repo:** https://github.com/NickGV/netvocal

---

## Resumen de lo que hay que entregar

### Deliverable 1: Repositorio Limpio
Una rama `main` estable, con historial transparente, sin ramas colgando,
y todas las suites de prueba pasando al 100%.

### Deliverable 2: Sitio de Documentación del Viaje (Software Journey)
Un sitio web estático generado con **MkDocs + Material for MkDocs**
en la carpeta `/docs`, con 3 secciones obligatorias fundamentadas en
*A Philosophy of Software Design* de John Ousterhout.

---

## Asignación de Developers

| Developer | Rol | Issues |
|-----------|-----|--------|
| **Kevin** | Merge Captain & Infra | #30, #34 |
| **Elber** | Sección 1 — Bala Trazadora | #31 |
| **Estiven** | Sección 2 — Anatomía de la Complejidad | #32 |
| **Nicolas** | Sección 3 — Veredicto Retrospectivo + Integración final | #33, #35 |

---

## ---

## ⚠️ Paso 0: Eliminar rama `developkevin`
**Lo hace Kevin antes de arrancar.**

```bash
# Verificar que es la rama correcta
git fetch origin
git log origin/developkevin --not origin/main --oneline
# Si solo tiene basura, borrar:
git push origin --delete developkevin
```

---

## Issue #30 — [INFRA] Limpieza del repo y setup de MkDocs
**Asignado:** Kevin

### Tareas

#### 30.1 Verificar que los tests del backend pasan
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
python -m pytest -v
```
Si algún test falla, arreglarlo o reportar en el issue.

#### 30.2 Verificar tests del frontend
```bash
pnpm install
pnpm -C apps/web test
```
Ya sabemos que pasan 70/70 ✅, corroborar después de cualquier cambio.

#### 30.3 Instalar MkDocs y el tema Material
Como el proyecto ya usa Python, esto es natural:
```bash
pip install mkdocs mkdocs-material
```

Verificar instalación:
```bash
mkdocs --version
```

#### 30.4 Crear estructura de docs con MkDocs

La carpeta `docs/` ya existe. Inicializar:

```bash
cd /home/nick/Projects/netvocal
mkdocs new .
```

Esto crea `mkdocs.yml` y `docs/index.md`. La estructura final debe quedar:

```
/
├── mkdocs.yml                  # Configuración principal
├── docs/
│   ├── index.md                # Home / Resumen ejecutivo
│   ├── 01-tracer-bullet.md     # Sección 1
│   ├── 02-deep-shallow-modules.md  # Sección 2
│   └── 03-retrospective-verdict.md # Sección 3
```

#### 30.5 Configurar `mkdocs.yml`
```yaml
site_name: "NETVOCAL — Software Journey"
site_description: "Bitácora de co-creación y análisis arquitectónico del DevVoice Assistant"
repo_url: https://github.com/NickGV/netvocal
theme:
  name: material
  palette:
    primary: indigo
  features:
    - navigation.tabs
    - navigation.sections
nav:
  - "Inicio": index.md
  - "Bala Trazadora": 01-tracer-bullet.md
  - "Deep vs Shallow Modules": 02-deep-shallow-modules.md
  - "Veredicto Retrospectivo": 03-retrospective-verdict.md
```

#### 30.6 Configurar GitHub Pages con MkDocs

Opción A — GitHub Actions (recomendada):
Crear `.github/workflows/deploy-docs.yml`:
```yaml
name: Deploy MkDocs
on:
  push:
    branches: [main]
    paths: ["docs/**", "mkdocs.yml"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.x"
      - run: pip install mkdocs mkdocs-material
      - run: mkdocs gh-deploy --force
```

**IMPORTANTE:** Después del primer deploy, ir a:
Settings → Pages → Source: **Deploy from a branch**
Branch: `gh-pages` → `/ (root)`

Opción B — Manual (si no quieren Actions):
```bash
mkdocs gh-deploy --force
```

#### 30.7 Verificar sitio local
```bash
mkdocs serve
# Abrir http://127.0.0.1:8000
```

#### 30.8 Commit inicial del skeleton
```bash
git add docs/ mkdocs.yml .github/
git commit -m "chore(docs): init MkDocs skeleton with Material theme"
git push
```

---

## Issue #31 — [DOC] Sección 1: La Bala Trazadora y el Enrutamiento de Skills
**Asignado:** Elber
**Archivo:** `docs/01-tracer-bullet.md`

### Objetivo
Narrar cómo la estrategia de exploración con Ralph y el desglose de issues refinaron las assumptions del equipo ANTES de escribir código, usando la analogía de la "Bala Trazadora" de Ousterhout.

### Estructura sugerida

#### 31.1 El árbol de diseño y las assumptions iniciales
- Mostrar el PRD original (`ralph/PRD.md`) y cómo se desglosó en issues verticales
- Explicar cómo Ralph (los scripts `once.sh`, `once_track.sh`) forzó a pensar en
  *vertical slices* en vez de capas horizontales
- Código de referencia: `ralph/once.sh` — mostrar el loop de una iteración

#### 31.2 Identificación del riesgo más alto
El pipeline de voz completo era lo más incierto del sistema:
```
Micrófono → STT (Whisper API) → LLM (OpenAI Chat) → TTS (OpenAI TTS) → Altavoz
```
Cada integración tenía riesgos: API keys, timeouts, formatos de audio, latencia.
Ningún developer del equipo había integrado Whisper/OpenAI antes.

#### 31.3 La Bala Trazadora en acción
- Issues **#7** (STT real), **#4** (LLM real), **#10** (TTS real):
  se atacaron PRIMERO, antes que cualquier feature de UI
- El endpoint `POST /voice/turn` fue la bala trazadora:
  ```python
  # apps/api/app/api/routes/voice.py — 14 líneas orquestando pipeline completo
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
- Esto demostró que la arquitectura funcionaba y destrabó al resto del equipo

#### 31.4 Feedback temprano y corrección de rumbo
- Los mocks permitieron desarrollo frontend en paralelo (el frontend
  ni siquiera existía cuando se escribió el pipeline backend)
- El `deps.py` con provider-switching (mock ↔ real) permitió probar
  sin APIs reales ni credenciales

#### 31.5 Conclusión
- ¿La bala trazadora cumplió su propósito?
- ¿Qué aprendizaje dejó para futuros proyectos?

---

## Issue #32 — [DOC] Sección 2: Anatomía de la Complejidad (Deep vs Shallow Modules)
**Asignado:** Estiven
**Archivo:** `docs/02-deep-shallow-modules.md`

### Objetivo
Analizar el código fuente usando la terminología exacta de Ousterhout.
Identificar módulos profundos, módulos superficiales y fugas de información.

### Estructura sugerida

#### 32.1 Introducción
- Breve explicación de *deep module* vs *shallow module* según Ousterhout
- La proporción interfaz/implementación como métrica

#### 32.2 Módulos Profundos (Deep Modules)
Buscar componentes con firma simple pero mucha complejidad oculta.

**Candidato 1: STTService / LLMService / TTSService**
```python
class STTService(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        ...
```
- **Firma:** 1 método, 2 parámetros → extremadamente simple
- **Complejidad oculta:** llamadas HTTP a OpenAI Whisper, manejo de formatos de audio,
  autenticación, error handling, timeouts, encoding
- **Implementaciones:** `MockSTTService` (~40 líneas), `OpenAIWhisperSTTService` (~60 líneas)
- **Ratio interfaz/implementación:** ~1:10 → **PROFUNDO**
- Incluir también `LLMService` y `TTSService` que siguen el mismo patrón

**Candidato 2: ConversationStore → SQLiteConversationStore**
```python
class ConversationStore:
    def create_session(self) -> str: ...
    def add_turn(self, session_id, user_text, assistant_text) -> None: ...
    def get_history(self, session_id) -> list[dict]: ...
```
- **Firma:** 3 métodos, todos simples
- **Complejidad oculta:** esquema SQLite con 2 tablas, conexiones, transacciones,
  serialización ISO, manejo de sesiones expiradas
- **Implementaciones:** `MemoryConversationStore` (30 líneas para tests),
  `SQLiteConversationStore` (~110 líneas con schema DDL)
- **Ratio interfaz/implementación:** ~1:40 → **MUY PROFUNDO**

**Candidato 3: `deps.py` — Provider Factory**
```python
def get_llm_service() -> LLMService:
    if settings.llm_provider == "openai":
        return OpenAILLMService(...)
    return MockLLMService()
```
- Oculta toda la lógica de selección de proveedor, configuración de API keys,
  decisión de mock vs real
- **Profundidad:** Media-alta

#### 32.3 Módulos Superficiales (Shallow Modules)
Buscar archivos pequeños que requieren muchas llamadas entre sí.

**Candidato 1: Estructura duplicada — dos arquitecturas conviviendo**
- `apps/api/routers/` vs `apps/api/app/api/routes/`
- Ambas contienen los mismos endpoints (tasks, meetings, intent)
- La versión flat importa de `services/` y `stores/` (estructura plana)
- La versión anidada importa de `app/services/` y `app/db/` (estructura modular)
- **Problema:** Coexistencia de dos filosofías de organización que obligan
  al desarrollador a entender ambas para navegar el código
- **Solución:** Elegir una (la anidada `app/` es más modular) y migrar

**Candidato 2: Schemas planos individuales**
- `schemas/task_schema.py` (~34 líneas), `schemas/meeting_schema.py` (~32 líneas),
  `schemas/intent_schema.py` (~17 líneas)
- Cada uno es puro Pydantic — módulos extremadamente superficiales
- Podrían unificarse en `app/schemas/` (que ya existe)
- **Solución:** Consolidar tipos relacionados

#### 32.4 Fuga de Información (Information Leakage)
Buscar si detalles internos de DB o red se filtraron a capas superiores.

- **SQLite acoplado en memory.py:**
  ```python
  # apps/api/app/db/memory.py
  from app.db.sqlite_store import ConversationStore, SQLiteConversationStore
  _store = SQLiteConversationStore()
  ```
  Acá `memory.py` importa directamente `SQLiteConversationStore` en lugar
  de usar una factory. Si querés cambiar a MongoDB, tenés que modificar
  este archivo. Es una fuga de implementación leve.

- **ApiClient en frontend:**
  ```typescript
  // apps/web/src/services/apiClient.ts
  // Clasifica errores como timeout | network | http | unknown
  // BUEN AISLAMIENTO — el usuario nunca ve HTTP crudos
  ```
  El frontend hace buen ocultamiento. Los errores HTTP se transforman
  a `ApiError` con tipos semánticos antes de llegar a la UI.

- **Analizar también:** ¿Hay tipos de base de datos (UUIDs, timestamps ISO)
  que se filtren a la UI? (Respuesta parcial: sí, los IDs UUID se muestran
  en las respuestas — podrían ocultarse)

#### 32.5 Conclusiones y recomendaciones
- ¿Qué módulos rescatar para próximos proyectos?
- ¿La duplicación de estructuras fue error de coordinación o decisión consciente?
- Recomendación: consolidar a la estructura `app/` y eliminar la plana

---

## Issue #33 — [DOC] Sección 3: El Veredicto Retrospectivo de los Sub-Agentes
**Asignado:** Nicolas
**Archivo:** `docs/03-retrospective-verdict.md`

### Objetivo
Analizar retrospectivamente cómo el debate arquitectónico impactó el desarrollo,
y evaluar el "buen gusto arquitectónico" usando el concepto de Change Amplification.

### Estructura sugerida

#### 33.1 El debate arquitectónico
- Recuperar los hallazgos de la skill `improve-codebase-architecture`
  (archivos que estuvieron en `.agents/skills/improve-codebase-architecture/`)
- Explicar qué recomendaron los sub-agentes paralelos
- ¿Se implementaron esas recomendaciones? ¿Por qué sí o por qué no?

#### 33.2 Impacto en la velocidad de desarrollo
- ¿El debate arquitectónico ralentizó la segunda mitad del proyecto o la aceleró?
- Evidencia: comparar fechas entre `ralph/progress.txt` y `ralph/progress_track.txt`
  — ver si después del análisis hubo más o menos velocidad

#### 33.3 Change Amplification
Cuando llegaron features tardíos (FE-5.1, FE-5.2, FE-5.3),
¿cuántos archivos hubo que tocar?

**Ejemplo concreto — QuickCommand (FE-5.3):**
```
Archivos NUEVOS:   1 (QuickCommand.tsx)
Archivos MOFICADOS: 3 (useRecorderUI.ts, apiClient.ts, page.tsx)
Total:             4 archivos para voice → tasks integration
```

Según Ousterhout, el "buen gusto arquitectónico" minimiza los archivos
que hay que tocar para agregar una feature. 4 archivos para una integración
completa (voz → intención → acción → refresco de UI) es razonable.

**Probar elasticidad con otro escenario:**
- ¿Agregar un nuevo provider de STT (ej: Google Speech-to-Text)?
  1. Crear `GoogleSTTService` implementando `STTService`
  2. Agregar un `elif` en `deps.py`
  → **Solo 2 archivos.** Eso es buen diseño — el módulo es profundo y extensible.

#### 33.4 Conclusión
- ¿La arquitectura aguantó bien los últimos features? (Sí, evidencia: QuickCommand)
- ¿Qué se haría diferente si empezaran de nuevo?
- Nota final sobre co-creación humano-máquina

---

## Issue #34 — [INFRA] E2E final y lanzamiento del sitio
**Asignado:** Kevin

### Tareas

#### 34.1 Verificar E2E
- Backend: `python -m pytest apps/api/tests/ -v` → todos verdes
- Frontend: `pnpm -C apps/web test` → todos verdes
- Build frontend: `pnpm -C apps/web build` → sin errores

#### 34.2 Último build de MkDocs
```bash
mkdocs build --strict
# Sin warnings ni errores
```

#### 34.3 Verificar deploy del docs site
- Pushear a main para triggerear GitHub Actions
- O bien correr `mkdocs gh-deploy --force`
- Verificar que https://nickgv.github.io/netvocal/ carga las 3 secciones

#### 34.4 Release tag
```bash
git tag v1.0.0 -m "Entrega Final Tarea 3 - Software Journey"
git push --tags
```

#### 34.5 Registrar URLs de entrega
- **URL del repo:** `https://github.com/NickGV/netvocal`
- **URL del docs site:** la que genere GitHub Pages (generalmente
  `https://nickgv.github.io/netvocal/`)

---

## Issue #35 — [DOC] Integración y revisión cruzada
**Asignado:** Nicolas (como lead)

### Tareas

#### 35.1 Revisar y unificar tono
- Las 3 secciones deben leerse como un documento cohesivo
- Citas consistentes a Ousterhout (capítulos, terminología exacta)
- Misma nomenclatura técnica en todo el sitio

#### 35.2 Completar `docs/index.md`
- Resumen ejecutivo del proyecto
- Links a las 3 secciones
- Tabla del equipo
- Screenshot del assistant funcionando (opcional pero recomendado)

#### 35.3 Verificar navegación MkDocs
- Sidebar con las 3 secciones
- Enlaces funcionando
- `mkdocs build --strict` sin errores

#### 35.4 Armado final
```bash
git add .
git commit -m "docs: complete Software Journey site v1.0"
git push
```

#### 35.5 Verificar deploy
- El sitio debe estar públicamente accesible
- Navegar las 3 secciones sin errores 404

---

## ---

## Timeline Sugerido (3-4 días)

| Día | Kevin | Elber | Estiven | Nicolas |
|-----|-------|-------|---------|---------|
| **1** | #30: setup MkDocs + tests | #31: investigar Ralph + pipeline | #32: explorar código y tomar snippets | #33: recopilar architecture debates |
| **2** | #30: GitHub Actions deploy | #31: escribir sección completa | #32: escribir sección completa | #33: escribir sección completa |
| **3** | #34: E2E + release | Revisar sección de Estiven | Revisar sección de Elber | #35: integrar + index |
| **4** | Fixes si hay | Fixes si hay | Fixes si hay | Deploy final |

---

## ---

## Checklist final de la entrega

- [ ] Branch `developkevin` eliminada del remoto
- [ ] Backend tests: todos pasando (`pytest -v`)
- [ ] Frontend tests: todos pasando (`pnpm -C apps/web test`)
- [ ] MkDocs instalado y `mkdocs.yml` configurado
- [ ] `docs/index.md` con resumen ejecutivo
- [ ] `docs/01-tracer-bullet.md` completo
- [ ] `docs/02-deep-shallow-modules.md` completo
- [ ] `docs/03-retrospective-verdict.md` completo
- [ ] GitHub Actions deploya el site automáticamente
- [ ] Sitio desplegado y accesible públicamente
- [ ] Tag `v1.0.0` creado
- [ ] URLs de entrega listas (repo + docs site)