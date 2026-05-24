#!/bin/bash
# Ralph AFK — Loop automático: N iteraciones desatendidas
#
# Uso: ./ralph/afk.sh <iteraciones>
#   Ejecuta N iteraciones de Ralph de forma automática.
#   Se detiene si todas las tareas están completas.
#
# Ejemplo: ./ralph/afk.sh 10
#   Corre hasta 10 iteraciones o hasta que el PRD esté completo.

set -e

if [ -z "$1" ]; then
  echo "Uso: $0 <iteraciones>"
  echo ""
  echo "Ejecuta Ralph en bucle automático por N iteraciones."
  echo "Ejemplo: $0 10"
  exit 1
fi

MAX_ITERATIONS="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "╔══════════════════════════════════════════════╗"
echo "║   Ralph AFK — Loop Automático                ║"
echo "║   Iteraciones máximas: $MAX_ITERATIONS         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo "──────────────────────────────────────────────"
  echo "  Iteración $i de $MAX_ITERATIONS"
  echo "──────────────────────────────────────────────"

  result=$(bash "$SCRIPT_DIR/once.sh" 2>&1)
  echo "$result"

  if echo "$result" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "🎉 ¡PRD completado después de $i iteraciones!"
    exit 0
  fi

  echo ""
  echo "  Iteración $i finalizada. Esperando 2 segundos..."
  sleep 2
done

echo ""
echo "⏹️  Ralph AFK terminó después de $MAX_ITERATIONS iteraciones."
echo "   Si quedan tareas pendientes, ejecutá de nuevo:"
echo "   ./ralph/afk.sh <N>"
