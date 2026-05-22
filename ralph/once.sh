#!/bin/bash
# Ralph — Human-in-the-loop: una iteración de implementación autónoma
#
# Uso: ./ralph/once.sh
#   Ejecuta una iteración: lee PRD.md + progress.txt, implementa la siguiente
#   tarea, corre tests, actualiza progress.txt y hace commit.
#
# Uso: ./ralph/once.sh --dry
#   Muestra el prompt sin ejecutar (útil para inspeccionar antes de correr)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if [ ! -f ralph/PRD.md ] || [ ! -f ralph/progress.txt ]; then
  echo "❌ ERROR: No se encuentran ralph/PRD.md o ralph/progress.txt"
  echo "   Asegurate de estar en la raíz del proyecto."
  exit 1
fi

PROMPT="
Eres un ingeniero implementando features en el proyecto DevVoice Assistant.

Lee estos archivos:
  - ralph/PRD.md: la lista maestra de tareas con dependencias
  - ralph/progress.txt: qué se ha completado hasta ahora

## Instrucciones

1. Encuentra la SIGUIENTE tarea incompleta en PRD.md cuya prioridad sea
   la más alta y cuyas dependencias estén satisfechas (mira el grafo de
   dependencias en la sección 'Dependencias entre tareas').

2. Implementa la tarea por completo:
   - Sigue la arquitectura existente del proyecto (FastAPI o Next.js)
   - No introduzcas acoplamientos innecesarios
   - Mantén la legibilidad humana del código
   - Si la tarea requiere cambios en backend (apps/api) o frontend (apps/web),
     asegúrate de tocar solo los archivos necesarios

3. Ejecuta los tests existentes para verificar que no rompes nada:
   - Backend: python -m pytest apps/api/tests/ -v
   - Frontend: pnpm --filter @voice-assistant/web test (si existe)

4. Actualiza ralph/progress.txt con una línea como esta:
   2026-05-21: [#ID] Descripción de lo implementado — <primeros-7-chars-del-commit>

5. Haz commit con un mensaje descriptivo siguiendo conventional commits:
   Ejemplo: feat(#1.1): integrate real STT service via Whisper API

## Reglas importantes

- SOLO UNA TAREA A LA VEZ. No te adelantes ni hagas dos tareas.
- No modifiques ralph/PRD.md ni los scripts de ralph/.
- Si una tarea ya está completa según progress.txt, saltá a la siguiente.
- Si TODAS las tareas están completas, incluí '<promise>COMPLETE</promise>'
  en tu respuesta final y no hagas ningún cambio.
- Si encontrás un bug o deuda técnica durante la implementación, anotalo
  en tu respuesta pero NO lo corrijas a menos que sea necesario para
  completar la tarea actual.
"

if [ "$1" == "--dry" ]; then
  echo "=== DRY RUN — Prompt que se enviaría a opencode ==="
  echo ""
  echo "$PROMPT"
  exit 0
fi

echo "=== Ralph: Una iteración ==="
echo ""

opencode run \
  --dangerously-skip-permissions \
  -f ralph/PRD.md \
  -f ralph/progress.txt \
  "$PROMPT"

echo ""
echo "=== Ralph: Iteración completada ==="
