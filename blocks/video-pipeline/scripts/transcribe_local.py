"""Локальная транскрипция со словными таймкодами, без облака.

Пишет результат в том же формате и по тому же пути, что и
`helpers/transcribe.py` из video-use. Тот кеширует: если файл уже
существует, в ElevenLabs он не идёт. Значит локальный whisper
подставляется без единой правки чужого кода.

Путь результата: <edit_dir>/transcripts/<имя_видео>.json
Формат: {"words": [{"type","text","start","end"}, ...]}

Движок: whisper.cpp (ggml-org, MIT). Словные таймкоды получаются
флагами `-ml 1 -sow`: сегмент режется по одному слову.

Разделения по спикерам whisper.cpp не даёт. Нужно оно - ставь ключ
ELEVENLABS_API_KEY и используй родной transcribe.py из video-use.

Переменные окружения:
    WHISPER_CLI_PATH  путь к whisper-cli.exe
    WHISPER_MODEL     путь к файлу модели ggml-*.bin

Использование:
    python transcribe_local.py video.mp4
    python transcribe_local.py video.mp4 --edit-dir D:/proj/edit
    python transcribe_local.py video.mp4 --language ru --audio-track 1
    python transcribe_local.py --demo
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def find_binary() -> Path:
    """whisper-cli из переменной окружения или из PATH."""
    env = os.environ.get("WHISPER_CLI_PATH", "").strip().strip('"')
    if env:
        p = Path(env)
        if not p.exists():
            sys.exit(f"WHISPER_CLI_PATH указывает в пустоту: {p}")
        return p
    found = shutil.which("whisper-cli") or shutil.which("main")
    if not found:
        sys.exit(
            "whisper-cli не найден. Задай WHISPER_CLI_PATH или положи бинарник "
            "в PATH. Сборки: github.com/ggml-org/whisper.cpp/releases"
        )
    return Path(found)


def find_model() -> Path:
    env = os.environ.get("WHISPER_MODEL", "").strip().strip('"')
    if not env:
        sys.exit(
            "WHISPER_MODEL не задана. Укажи путь к ggml-модели, например "
            "ggml-base.bin или ggml-small.bin"
        )
    p = Path(env)
    if not p.exists():
        sys.exit(f"модель не найдена: {p}")
    return p


def extract_audio(video: Path, dest: Path, audio_track: int = 0) -> None:
    """Моно 16 кГц PCM, как ждёт whisper.cpp."""
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(video),
         "-map", f"0:a:{audio_track}",
         "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le",
         str(dest)],
        check=True,
    )


def run_whisper(binary: Path, model: Path, wav: Path, out_stem: Path,
                language: str | None, threads: int) -> Path:
    cmd = [
        str(binary),
        "-m", str(model),
        "-f", str(wav),
        "-ml", "1",       # сегмент длиной в одно слово
        "-sow",           # резать по границе слова, не по символу
        "-oj",            # json на выход
        "-of", str(out_stem),
        "-t", str(threads),
        "-np",            # без прогресса в stdout
    ]
    if language:
        cmd += ["-l", language]
    subprocess.run(cmd, check=True)
    produced = out_stem.with_suffix(".json")
    if not produced.exists():
        raise RuntimeError(f"whisper не создал {produced}")
    return produced


def to_scribe_format(whisper_json: dict) -> dict:
    """whisper.cpp -> формат, который читает video-use.

    Берём offsets в миллисекундах, они точнее строковых timestamps.
    Пустые сегменты и служебные метки в квадратных скобках выбрасываем.
    """
    words = []
    for seg in whisper_json.get("transcription", []):
        text = (seg.get("text") or "").strip()
        if not text:
            continue
        if text.startswith("[") and text.endswith("]"):
            continue  # [BLANK_AUDIO], [MUSIC] и прочие метки
        offsets = seg.get("offsets") or {}
        start_ms = offsets.get("from")
        end_ms = offsets.get("to")
        if start_ms is None or end_ms is None:
            continue
        words.append({
            "type": "word",
            "text": text,
            "start": round(start_ms / 1000.0, 3),
            "end": round(end_ms / 1000.0, 3),
        })
    return {"words": words}


def transcribe_one(video: Path, edit_dir: Path, language: str | None,
                   audio_track: int, threads: int, force: bool) -> Path:
    out_dir = edit_dir / "transcripts"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{video.stem}.json"

    if out_path.exists() and not force:
        print(f"уже есть, пропуск: {out_path.name} (--force чтобы перезаписать)")
        return out_path

    binary = find_binary()
    model = find_model()

    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / f"{video.stem}.wav"
        extract_audio(video, wav, audio_track)
        produced = run_whisper(binary, model, wav,
                               Path(tmp) / video.stem, language, threads)
        raw = json.loads(produced.read_text(encoding="utf-8"))

    payload = to_scribe_format(raw)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")

    n = len(payload["words"])
    if n == 0:
        print("предупреждение: слов не распознано. Проверь дорожку "
              f"--audio-track (сейчас {audio_track}) и язык.")
    else:
        last = payload["words"][-1]["end"]
        print(f"записано: {out_path} ({n} слов, до {last:.1f}s)")
    return out_path


def demo() -> None:
    """Самопроверка отображения формата. Ни whisper, ни ffmpeg не нужны."""
    sample = {
        "transcription": [
            {"offsets": {"from": 0, "to": 440}, "text": " привет"},
            {"offsets": {"from": 440, "to": 900}, "text": "мир"},
            {"offsets": {"from": 900, "to": 1200}, "text": "  "},
            {"offsets": {"from": 1200, "to": 2000}, "text": "[BLANK_AUDIO]"},
            {"text": "без offsets"},
        ]
    }
    got = to_scribe_format(sample)
    assert got == {"words": [
        {"type": "word", "text": "привет", "start": 0.0, "end": 0.44},
        {"type": "word", "text": "мир", "start": 0.44, "end": 0.9},
    ]}, got

    assert to_scribe_format({}) == {"words": []}
    assert to_scribe_format({"transcription": []}) == {"words": []}

    # video-use читает эти поля, они обязаны быть на месте.
    w = got["words"][0]
    for field in ("type", "text", "start", "end"):
        assert field in w, f"пропало поле {field}"

    print("transcribe_local: самопроверка пройдена")


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Словные таймкоды локально через whisper.cpp")
    ap.add_argument("video", type=Path, nargs="?", help="Файл видео или аудио")
    ap.add_argument("--edit-dir", type=Path, default=None,
                    help="Каталог edit (по умолчанию <папка видео>/edit)")
    ap.add_argument("--language", type=str, default=None,
                    help="Код языка, например ru. Без него автоопределение")
    ap.add_argument("--audio-track", type=int, default=0,
                    help="Номер аудиодорожки с нуля")
    ap.add_argument("--threads", type=int, default=os.cpu_count() or 4,
                    help="Потоки whisper.cpp")
    ap.add_argument("--force", action="store_true",
                    help="Перезаписать существующий транскрипт")
    ap.add_argument("--demo", action="store_true",
                    help="Самопроверка формата без файлов")
    args = ap.parse_args()

    if args.demo:
        demo()
        return
    if not args.video:
        ap.error("нужен путь к видео или флаг --demo")

    video = args.video.resolve()
    if not video.exists():
        sys.exit(f"файл не найден: {video}")

    edit_dir = (args.edit_dir or (video.parent / "edit")).resolve()
    transcribe_one(video, edit_dir, args.language, args.audio_track,
                   args.threads, args.force)


if __name__ == "__main__":
    main()

