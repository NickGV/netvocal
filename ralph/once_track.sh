#!/bin/bash
# Ralph Track — Una iteración para un track específico
#
# Uso: ./ralph/once_track.sh
#   Lee ralph/PRD_TRACK.md + ralph/progress_track.txt
#   Identifica e implementa la siguiente tarea.
#
# Uso: ./ralph/once_track.sh --dry
#   Muestra el prompt sin ejecutar.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Fijar rutas — usar PRD_TRACK.md y progress_track.txt
PRD_FILE="ralph/PRD_TRACK.md"
PROGRESS_FILE="ralph/progress_track.txt"

if [ ! -f "$PRD_FILE" ] || [ ! -f "$PROGRESS_FILE" ]; then
  echo "❌ ERROR: No se encuentran $PRD_FILE o $PROGRESS_FILE"
  echo "   Asegurate de estar en la raíz del proyecto."
  exit 1
fi

echo "╔══════════════════════════════════════════════╗"
echo "║   Ralph Track: Una iteración                 ║"
echo "║   PRD: $PRD_FILE"
echo "║   Progress: $PROGRESS_FILE"
echo "╚══════════════════════════════════════════════╝"
echo ""

CONTENT=$(cat "$PRD_FILE")
PROGRESS=$(cat "$PROGRESS_FILE")

# Construir prompt de una sola línea para opencode run
PROMPT="Eres Ralph, un ingeniero implementando features en el proyecto DevVoice Assistant. 
Tu MISIÓN: Lee la lista de tareas y el progreso. Identifica la SIGUIENTE tarea incompleta con dependencias satisfechas. IMPLEMENTALA COMPLETAMENTE. NO preguntes, NO pidas confirmación, SOLO ejecuta.

Tareas del track:
$CONTENT

Progreso actual:
$PROGRESS

INSTRUCCIONES:
1. Encuentra la siguiente tarea incompleta de prioridad más alta con dependencias satisfechas
2. IMPLEMENTALA AHORA - escribe el código necesario
3. Corre tests: python -m pytest apps/api/tests/ -v (backend) y pnpm --filter @voice-assistant/web test (frontend si existe)
4. Actualiza ralph/progress_track.txt con: YYYY-MM-DD: [#ID] Descripción - <commit-hash>
5. Haz commit con conventional commits

REGLAS:
- SOLO UNA TAREA A LA VEZ
- No modifiques ralph/PRD_TRACK.md ni scripts de ralph/
- Si todas completas, responde '<promise>COMPLETE</promise>'
- NO preguntes, NO pidas permiso - ACTUA"

if [ "$1" == "--dry" ]; then
  echo "=== DRY RUN ==="
  echo "$PROMPT"
  exit 0
fi

# Ejecutar: pasar PRD_TRACK y progress_track como contexto, y el prompt
echo "$PROMPT" | opencode run --dangerously-skip-permissions \
  -f "$PRD_FILE" \
  -f "$PROGRESS_FILE" \
  - 2>&1

echo ""
echo "=== Ralph Track: Iteración completada ==="
