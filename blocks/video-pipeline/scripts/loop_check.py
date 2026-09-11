"""Проверка бесшовности лупа.

Сравнивает первый и последний кадр двумя метриками сразу.

Первая - перцептивный хеш dHash: ловит расхождение рисунка.
Вторая - среднее отличие цвета на миниатюре 8x8: ловит то, чего dHash
не видит в принципе. dHash строит биты по перепадам яркости внутри
кадра, поэтому ровная заливка любого цвета даёт нулевой хеш. Без второй
метрики переход с синего экрана на красный считался бы бесшовным.

Луп принят, только если прошли обе проверки.

Зависимостей нет: кадры уменьшает сам ffmpeg, хеш считается на чистом
Python. PIL не нужен.

Использование:
    python loop_check.py clip.mp4
    python loop_check.py clip.mp4 --threshold 6
    python loop_check.py clip.mp4 --json
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

# dHash 9x8: сравниваем соседние пиксели по горизонтали, получаем 64 бита.
HASH_W, HASH_H = 9, 8

# Порог по умолчанию. Подобран как «глазом шва не видно»: 0-4 стык чистый,
# 5-10 заметен на статике, больше 10 это разные кадры.
DEFAULT_THRESHOLD = 8

# Миниатюра под цветовую метрику и порог среднего отличия канала (0-255).
# 12 это примерно «глаз разницы не замечает», 25 это уже видимый скачок.
COLOR_W, COLOR_H = 8, 8
DEFAULT_COLOR_THRESHOLD = 12


def duration_sec(video: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(video)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def frame_raw(video: Path, at_sec: float, w: int, h: int,
              pix_fmt: str) -> bytes:
    """Один кадр в момент at_sec, уменьшенный до w x h в нужном формате."""
    channels = 3 if pix_fmt == "rgb24" else 1
    cmd = [
        "ffmpeg", "-v", "error",
        "-ss", f"{at_sec:.4f}", "-i", str(video),
        "-frames:v", "1",
        "-vf", f"scale={w}:{h}:flags=area,format={pix_fmt}",
        "-f", "rawvideo", "-",
    ]
    out = subprocess.run(cmd, capture_output=True, check=True)
    raw = out.stdout
    want = w * h * channels
    if len(raw) != want:
        raise RuntimeError(
            f"ffmpeg вернул {len(raw)} байт вместо {want} "
            f"для позиции {at_sec:.3f}s"
        )
    return raw


def color_diff(a: bytes, b: bytes) -> float:
    """Среднее отличие байтов двух миниатюр, шкала 0-255."""
    if len(a) != len(b):
        raise ValueError("миниатюры разного размера")
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def dhash(raw: bytes) -> int:
    """Бит на каждую пару соседних пикселей: слева ярче значит 1."""
    bits = 0
    for row in range(HASH_H):
        base = row * HASH_W
        for col in range(HASH_W - 1):
            bits <<= 1
            if raw[base + col] > raw[base + col + 1]:
                bits |= 1
    return bits


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def check(video: Path, threshold: int = DEFAULT_THRESHOLD,
          color_threshold: float = DEFAULT_COLOR_THRESHOLD) -> dict:
    dur = duration_sec(video)
    if dur <= 0:
        raise RuntimeError(f"нулевая длительность: {video}")

    # Последний кадр берём с отступом: точный конец часто отдаёт пустоту.
    last_at = max(0.0, dur - 0.04)

    first = dhash(frame_raw(video, 0.0, HASH_W, HASH_H, "gray"))
    last = dhash(frame_raw(video, last_at, HASH_W, HASH_H, "gray"))
    dist = hamming(first, last)

    c_first = frame_raw(video, 0.0, COLOR_W, COLOR_H, "rgb24")
    c_last = frame_raw(video, last_at, COLOR_W, COLOR_H, "rgb24")
    cdiff = color_diff(c_first, c_last)

    shape_ok = dist <= threshold
    color_ok = cdiff <= color_threshold

    if shape_ok and color_ok:
        reason = "стык чистый"
    elif not shape_ok and not color_ok:
        reason = "разошлись и рисунок, и цвет"
    elif not shape_ok:
        reason = "разошёлся рисунок"
    else:
        reason = "разошёлся цвет или яркость"

    return {
        "video": str(video),
        "duration": round(dur, 3),
        "distance": dist,
        "threshold": threshold,
        "color_diff": round(cdiff, 2),
        "color_threshold": color_threshold,
        "seamless": shape_ok and color_ok,
        "reason": reason,
        "first_hash": f"{first:016x}",
        "last_hash": f"{last:016x}",
    }


def demo() -> None:
    """Самопроверка хеш-логики. Видео не нужно."""
    flat = bytes([128] * (HASH_W * HASH_H))
    assert dhash(flat) == 0, "ровная заливка должна давать нулевой хеш"

    # Градиент слева направо: каждый левый пиксель темнее правого, все биты 0.
    grad = bytes(
        [min(255, col * 28) for _row in range(HASH_H) for col in range(HASH_W)]
    )
    assert dhash(grad) == 0, "возрастающий градиент не ставит бит"

    rgrad = bytes(
        [min(255, (HASH_W - 1 - col) * 28)
         for _row in range(HASH_H) for col in range(HASH_W)]
    )
    assert dhash(rgrad) == (1 << 64) - 1, "убывающий градиент ставит все биты"

    assert hamming(0, 0) == 0
    assert hamming(0b1011, 0b0001) == 2
    assert hamming(dhash(grad), dhash(rgrad)) == 64

    # Цветовая метрика ловит ровно то, чего dHash не видит.
    blue = bytes([0, 0, 200] * (COLOR_W * COLOR_H))
    red = bytes([200, 0, 0] * (COLOR_W * COLOR_H))
    same = bytes([40, 90, 120] * (COLOR_W * COLOR_H))

    assert color_diff(same, same) == 0.0
    assert color_diff(blue, red) > DEFAULT_COLOR_THRESHOLD,         "синий против красного обязан провалить цветовую проверку"

    # Обе заливки ровные, поэтому dHash у них нулевой и одинаковый.
    flat_blue_luma = bytes([24] * (HASH_W * HASH_H))
    flat_red_luma = bytes([60] * (HASH_W * HASH_H))
    assert dhash(flat_blue_luma) == dhash(flat_red_luma) == 0,         "dHash слеп к заливке, ради этого и добавлена вторая метрика"

    # Мелкое дрожание цвета лупу не мешает.
    jitter = bytes([42, 92, 122] * (COLOR_W * COLOR_H))
    assert color_diff(same, jitter) <= DEFAULT_COLOR_THRESHOLD

    print("loop_check: самопроверка пройдена")


def main() -> None:
    ap = argparse.ArgumentParser(description="Проверка бесшовности лупа")
    ap.add_argument("video", type=Path, nargs="?", help="Файл клипа")
    ap.add_argument("--threshold", type=int, default=DEFAULT_THRESHOLD,
                    help=f"Порог рисунка, по умолчанию {DEFAULT_THRESHOLD}")
    ap.add_argument("--color-threshold", type=float,
                    default=DEFAULT_COLOR_THRESHOLD,
                    help=f"Порог цвета, по умолчанию {DEFAULT_COLOR_THRESHOLD}")
    ap.add_argument("--json", action="store_true", help="Вывод в JSON")
    ap.add_argument("--demo", action="store_true", help="Самопроверка без видео")
    args = ap.parse_args()

    if args.demo:
        demo()
        return

    if not args.video:
        ap.error("нужен путь к видео или флаг --demo")
    if not args.video.exists():
        sys.exit(f"файл не найден: {args.video}")

    result = check(args.video.resolve(), args.threshold, args.color_threshold)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        verdict = "бесшовный" if result["seamless"] else "шов виден"
        print(f"{args.video.name}: {verdict} ({result['reason']})")
        print(f"  рисунок {result['distance']} при пороге {result['threshold']}")
        print(f"  цвет {result['color_diff']} при пороге "
              f"{result['color_threshold']}")
        print(f"  длительность {result['duration']}s")

    sys.exit(0 if result["seamless"] else 1)


if __name__ == "__main__":
    main()

