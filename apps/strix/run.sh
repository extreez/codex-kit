#!/usr/bin/env bash
# Обёртка над Strix (usestrix/strix). Гонит скан только по своему проекту,
# отчёт кладёт в docs/security. Предохранитель: цель — локальный путь, не URL,
# не чужой адрес.
#
#   ./run.sh <путь-к-проекту>   скан своего проекта
#   ./run.sh --selftest         проверка функции is_local_target
set -euo pipefail

# Цель разрешена, только если это существующий локальный каталог.
# URL, чужой адрес, несуществующий путь — отказ.
is_local_target() {
  local t="$1"
  case "$t" in
    http://*|https://*|*://*) return 1 ;;   # не сеть
    "") return 1 ;;
  esac
  [ -d "$t" ]
}

if [ "${1:-}" = "--selftest" ]; then
  ok=0; n=0
  check() { n=$((n+1)); if [ "$1" = "$2" ]; then ok=$((ok+1)); else echo "FAIL: $3"; fi; }
  is_local_target "." && r=y || r=n; check "$r" y "текущая папка разрешена"
  is_local_target "https://example.com" && r=y || r=n; check "$r" n "URL запрещён"
  is_local_target "/no/such/dir/xyz" && r=y || r=n; check "$r" n "несуществующий путь запрещён"
  is_local_target "" && r=y || r=n; check "$r" n "пусто запрещено"
  echo "$ok/$n ok"; [ "$ok" = "$n" ]; exit
fi

TARGET="${1:-}"
if ! is_local_target "$TARGET"; then
  echo "Предохранитель: цель '$TARGET' не локальный каталог. Скан только своего проекта." >&2
  echo "Использование: ./run.sh <путь-к-проекту>" >&2
  exit 1
fi

: "${STRIX_LLM:?Задай STRIX_LLM, например openai/gpt-5.4}"
: "${LLM_API_KEY:?Задай LLM_API_KEY}"

command -v strix >/dev/null 2>&1 || { echo "strix не установлен. См. README.md, раздел Установка." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "нужен Docker (Strix поднимает песочницу образом)." >&2; exit 1; }

OUT="${TARGET%/}/docs/security"
mkdir -p "$OUT"
echo "Strix: скан $TARGET, отчёт в $OUT"
# -n headless, quick — быстрый режим. Меняй под задачу по README strix.
strix -n -t "$TARGET" --scan-mode quick | tee "$OUT/strix-$(date +%Y%m%d).log"

