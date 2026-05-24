#!/bin/bash
# Ralph — Sincronizar progress.txt con GitHub Issues
#
# Uso: ./ralph/sync-issues.sh
#   Lee progress.txt y sincroniza el estado con GitHub Issues.
#   - Si una tarea aparece como completada en progress.txt con ref a un
#     issue de GitHub (#N), cierra el issue y agrega un comentario.
#
# Uso: ./ralph/sync-issues.sh --status
#   Solo muestra el estado actual sin modificar GitHub.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

cd "$PROJECT_DIR"

if [ ! -f "$PROGRESS_FILE" ]; then
  echo "❌ No se encuentra ralph/progress.txt"
  exit 1
fi

echo "=== Sync: progress.txt → GitHub Issues ==="
echo ""

# Leer progress.txt y extraer referencias a issues completados
# Formato esperado: YYYY-MM-DD: [#ID] Descripción — <hash>
while IFS= read -r line; do
  # Saltar comentarios y líneas vacías
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue

  # Extraer número de issue (#N)
  if [[ "$line" =~ \[#([0-9]+)\] ]]; then
    issue_num="${BASH_REMATCH[1]}"
    echo "  📌 Issue #$issue_num detectado en progress.txt"

    # Verificar estado actual del issue en GitHub
    state=$(gh issue view "$issue_num" --json state --jq '.state' 2>/dev/null || echo "unknown")

    if [ "$state" == "closed" ]; then
      echo "     ✓ Ya está cerrado."
    elif [ "$state" == "open" ]; then
      if [ "$1" == "--status" ]; then
        echo "     ⏳ Abierto — no se modificará (modo --status)"
      else
        echo "     → Cerrando issue #$issue_num..."
        gh issue close "$issue_num" --comment "Completado por Ralph."
        echo "     ✓ Cerrado."
      fi
    else
      echo "     ? No se pudo determinar estado (gh issue view falló)"
    fi
  fi
done < "$PROGRESS_FILE"

echo ""
echo "=== Sync completado ==="
