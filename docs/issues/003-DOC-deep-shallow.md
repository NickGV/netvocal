# [DOC] Sección 2: Anatomía de la Complejidad (Deep vs Shallow Modules)

## 🎯 Objetivo
Analizar el código fuente usando la terminología exacta de John Ousterhout de *A Philosophy of Software Design*.
Identificar módulos profundos, módulos superficiales y fugas de información.

## 📋 Tareas

### 2.1 Módulos Profundos (Deep Modules)
Buscar componentes con interfaz simple pero mucha complejidad oculta.

**Candidato 1: STTService / LLMService / TTSService**
- Revisar: `apps/api/app/services/stt/base.py`, `llm/base.py`, `tts/base.py`
- Analizar firma: 1 método, 2 parámetros (extremadamente simple)
- Documentar complejidad oculta: llamadas HTTP a APIs externas, manejo de formatos, autenticación, timeouts
- Incluir implementaciones: Mock vs OpenAI variants
- Calcular ratio interfaz/implementación

**Candidato 2: ConversationStore → SQLiteConversationStore**
- Revisar: `apps/api/app/db/memory.py`, `apps/api/app/db/sqlite_store.py`
- Analizar firma: 3 métodos simples (create_session, add_turn, get_history)
- Documentar complejidad oculta: esquema SQLite, conexiones, transacciones, serialización
- Comparar implementaciones: Memory (para tests) vs SQLite (producción)

**Candidato 3: `deps.py` — Provider Factory**
- Revisar: `apps/api/app/core/deps.py`
- Analizar cómo oculta lógica de selección de proveedor y configuración

### 2.2 Módulos Superficiales (Shallow Modules)
Buscar archivos pequeños que requieren muchas llamadas entre sí.

**Candidato 1: Estructura duplicada**
- Comparar: `apps/api/routers/` vs `apps/api/app/api/routes/`
- Documentar cómo ambas contienen los mismos endpoints pero conviven
- Analizar imports: flat vs estructura anidada
- Proponer consolidación a una estructura (recomendar la anidada `app/`)

**Candidato 2: Schemas planos individuales**
- Revisar: `apps/api/schemas/task_schema.py`, `meeting_schema.py`, `intent_schema.py`
- Documentar cada uno como módulo extremadamente superficial
- Sugerir unificación en `app/schemas/` o similar

### 2.3 Fuga de Información (Information Leakage)
Buscar si detalles internos se filtran a capas superiores.

- **En memory.py:** Analizar si importa directamente `SQLiteConversationStore` en vez de usar factory
- **En ApiClient frontend:** Verificar clasificación de errores (timeout|network|http|unknown) como buen aislamiento
- **Buscar otros ejemplos:** UUIDs, timestamps, detalles de red que aparecen en UI

### 2.4 Conclusiones y recomendaciones
- ¿Qué módulos ejemplifican buen diseño profundo?
- ¿La duplicación de estructuras fue error o decisión?
- Recomendaciones para futuros proyectos basado en el análisis

## 📄 Archivo de salida
Crear: `docs/02-deep-shallow-modules.md`

## ✅ Definition of Done
- [ ] Archivo `docs/02-deep-shallow-modules.md` creado
- [ ] Usa terminología exacta de Ousterhout: deep module, shallow module, information leakage
- [ ] Incluye snippets de código reales del proyecto
- [ ] Analiza al menos 2 deep modules y 2 shallow modules con evidencia
- [ ] Identifica al menos 1 fuga de información y propone corrección
- [ ] Concluye con recomendaciones concretas