#!/usr/bin/env bash
# Проверка внешнего стека видео-конвейера. Ничего не ставит и не меняет.
# Говорит, что есть, чего нет и какой командой это чинится.
#
#   ./check.sh              полная проверка
#   ./check.sh --selftest   проверка своих же функций
#
# Коды выхода: 0 всё на месте, 1 не хватает обязательного,
#              2 не хватает только необязательного.
set -uo pipefail

MISSING_REQUIRED=0
MISSING_OPTIONAL=0

say_ok()   { printf '  [ок]    %s\n' "$1"; }
say_miss() { printf '  [нет]   %s\n' "$1"; }
say_hint() { printf '          чинится: %s\n' "$1"; }

# have <команда> - есть ли исполняемый файл в PATH
have() { command -v "$1" >/dev/null 2>&1; }

# node_major - старшая цифра версии node, или 0 если node нет
node_major() {
  have node || { echo 0; return; }
  node -v 2>/dev/null | sed 's/^v//; s/\..*//'
}

# py_ok <минор> - python 3.<минор> или новее
py_ok() {
  local want="$1"
  have python || return 1
  python -c "import sys;sys.exit(0 if sys.version_info[:2]>=(3,$want) else 1)" 2>/dev/null
}

# env_set <имя> - переменная окружения непустая
env_set() { [ -n "${!1:-}" ]; }

# kie_ready - ключ kie.ai доступен хоть как-нибудь.
# gcv-kie держит ключ в своём конфиге (~/.gcv/config.json), переменная
# окружения ему не нужна. Проверять только переменную значит врать.
kie_ready() {
  if have gcv-kie && gcv-kie doctor 2>/dev/null | grep -q "API key"; then
    return 0
  fi
  env_set KIE_API_KEY
}

# video_use_ready - репо video-use зарегистрировано как скилл агента
video_use_ready() {
  path_exists "$HOME/.agents/skills/video-use/helpers/render.py"
}

# path_exists <путь> - файл или каталог существует, пустая строка это нет
path_exists() { [ -n "${1:-}" ] && [ -e "$1" ]; }

check_required() {
  local label="$1" hint="$2"; shift 2
  if "$@"; then say_ok "$label"; else
    say_miss "$label"; say_hint "$hint"; MISSING_REQUIRED=$((MISSING_REQUIRED+1))
  fi
}

check_optional() {
  local label="$1" hint="$2"; shift 2
  if "$@"; then say_ok "$label"; else
    say_miss "$label (необязательно)"; say_hint "$hint"
    MISSING_OPTIONAL=$((MISSING_OPTIONAL+1))
  fi
}

if [ "${1:-}" = "--selftest" ]; then
  ok=0; n=0
  check() { n=$((n+1)); if [ "$1" = "$2" ]; then ok=$((ok+1)); else echo "FAIL: $3"; fi; }

  have sh && r=y || r=n;              check "$r" y "sh есть в PATH"
  have нет_такой_команды_xyz && r=y || r=n
  check "$r" n "несуществующая команда не находится"

  path_exists "$0" && r=y || r=n;     check "$r" y "свой файл существует"
  path_exists "/no/such/xyz" && r=y || r=n
  check "$r" n "несуществующий путь не проходит"
  path_exists "" && r=y || r=n;       check "$r" n "пустой путь не проходит"

  EMPTY_VAR=""; FULL_VAR="x"
  env_set FULL_VAR && r=y || r=n;     check "$r" y "заполненная переменная"
  env_set EMPTY_VAR && r=y || r=n;    check "$r" n "пустая переменная"
  env_set NEVER_SET_VAR_XYZ && r=y || r=n
  check "$r" n "незаданная переменная"

  m=$(node_major); case "$m" in ''|*[!0-9]*) r=n ;; *) r=y ;; esac
  check "$r" y "node_major вернул число ($m)"

  KIE_API_KEY="x" kie_ready && r=y || r=n
  check "$r" y "kie_ready проходит по переменной окружения"

  video_use_ready && r=y || r=n
  check "$r" y "video_use_ready находит установленный video-use"

  echo "$ok/$n ok"
  [ "$ok" = "$n" ]
  exit
fi

echo "Внешний стек видео-конвейера"
echo

echo "Базовое:"
check_required "ffmpeg" \
  "winget install --id Gyan.FFmpeg -e" \
  have ffmpeg
check_required "ffprobe" \
  "идёт вместе с ffmpeg, перезапусти оболочку" \
  have ffprobe
check_required "node 22 или новее" \
  "nodejs.org, нужен для HyperFrames" \
  test "$(node_major)" -ge 22
check_required "python 3.10 или новее" \
  "python.org, нужен для video-use и скриптов блока" \
  py_ok 10
check_required "git" \
  "git-scm.com" \
  have git
check_optional "uv" \
  "pip install uv, нужен для video-use и Blender MCP" \
  have uv
check_optional "yt-dlp" \
  "pip install yt-dlp, нужен claude-video для чужих роликов" \
  have yt-dlp

echo
echo "Аппаратное кодирование:"
if have ffmpeg && ffmpeg -hide_banner -encoders 2>/dev/null | grep -q h264_qsv; then
  say_ok "h264_qsv (Intel Quick Sync)"
else
  say_miss "h264_qsv"
  say_hint "кодирование пойдёт на CPU, это медленнее, но рабочее"
  MISSING_OPTIONAL=$((MISSING_OPTIONAL+1))
fi

echo
echo "Локальное распознавание речи:"
check_required "WHISPER_CLI_PATH указывает на существующий файл" \
  "whisper-blas-bin-x64.zip из релиза b4938 ggml-org/whisper.cpp, см. README.md" \
  path_exists "${WHISPER_CLI_PATH:-}"
check_required "WHISPER_MODEL указывает на существующий файл" \
  "модель ggml-base.bin или ggml-small.bin с huggingface.co/ggerganov/whisper.cpp" \
  path_exists "${WHISPER_MODEL:-}"

echo
echo "Ключи:"
check_required "ключ kie.ai (конфиг gcv-kie или KIE_API_KEY)" \
  "gcv-kie auth, либо переменная KIE_API_KEY" \
  kie_ready
check_optional "GEMINI_API_KEY" \
  "aistudio.google.com, нужен для глубокого анализа видео со звуком" \
  env_set GEMINI_API_KEY
check_optional "ELEVENLABS_API_KEY" \
  "elevenlabs.io, второй способ транскрипции с разделением спикеров" \
  env_set ELEVENLABS_API_KEY

echo
echo "Инструменты-скиллы (ставятся как есть, см. README.md):"
check_optional "gcv-kie CLI" \
  "npm i -g gcv-kie-cli или см. github.com/extreez/gcv-kie-cli" \
  have gcv-kie
check_optional "hyperframes" \
  "npx skills add heygen-com/hyperframes" \
  have hyperframes
check_optional "video-use" \
  "клонировать в ~/Developer/video-use, uv sync, junction в ~/.agents/skills/" \
  video_use_ready

echo
if [ "$MISSING_REQUIRED" -gt 0 ]; then
  echo "Не хватает обязательного: $MISSING_REQUIRED. Конвейер не поедет."
  exit 1
fi
if [ "$MISSING_OPTIONAL" -gt 0 ]; then
  echo "Обязательное на месте. Необязательного не хватает: $MISSING_OPTIONAL."
  exit 2
fi
echo "Стек полный."

