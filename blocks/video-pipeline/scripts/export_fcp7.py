"""Экспорт композиции HyperFrames в FCP 7 XML.

Читает HTML-композицию, отдаёт xmeml версии 5. Такой файл открывают
Premiere Pro, DaVinci Resolve, Final Cut 7 и почти всё остальное.

Что берётся из композиции:
    корень   data-composition-id, data-width, data-height, data-fps
    клипы    class="clip" + data-start, data-duration, data-track-index
    источник src или data-src на самом клипе либо на вложенном
             <video>/<img>
    звук     <audio> с data-start, data-duration, volume

Текстовые клипы файла не имеют. Дорожкой они не становятся, но
попадают в маркеры секвенции, чтобы монтажёр видел их место.

Зависимостей нет, только стандартная библиотека.

Использование:
    python export_fcp7.py composition.html
    python export_fcp7.py composition.html -o out.xml --fps 25
    python export_fcp7.py --demo
"""

from __future__ import annotations

import argparse
import sys
from html.parser import HTMLParser
from pathlib import Path
from xml.sax.saxutils import escape

# Теги без закрывающей пары: глубину вложенности они не меняют.
VOID_TAGS = {"img", "source", "br", "hr", "input", "meta", "link", "track"}

DEFAULT_FPS = 30
DEFAULT_SIZE = (1920, 1080)


class Clip:
    __slots__ = ("start", "duration", "track", "src", "name", "kind", "volume")

    def __init__(self, start, duration, track, src, name, kind, volume=0.0):
        self.start = start
        self.duration = duration
        self.track = track
        self.src = src
        self.name = name
        self.kind = kind          # video | audio | text
        self.volume = volume

    def __repr__(self):
        return (f"Clip({self.kind}, {self.start}-{self.start + self.duration}, "
                f"track={self.track}, src={self.src})")


class CompositionParser(HTMLParser):
    """Собирает клипы и параметры корня из HTML-композиции."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root: dict[str, str] = {}
        self.clips: list[Clip] = []
        self._open: list[dict] = []   # стек незакрытых клипов
        self._depth = 0

    # -- вспомогательное ------------------------------------------------

    @staticmethod
    def _num(attrs: dict, key: str, default: float | None = None):
        raw = attrs.get(key)
        if raw is None or raw == "":
            return default
        try:
            return float(raw)
        except ValueError:
            return default

    @staticmethod
    def _is_clip(attrs: dict) -> bool:
        return "clip" in (attrs.get("class") or "").split()

    # -- обработчики ----------------------------------------------------

    def handle_starttag(self, tag, attrs_list):
        attrs = {k.lower(): (v if v is not None else "") for k, v in attrs_list}
        void = tag in VOID_TAGS

        if not self.root and "data-composition-id" in attrs:
            self.root = attrs

        if tag == "audio" and ("data-start" in attrs or "src" in attrs):
            src = attrs.get("src") or attrs.get("data-src")
            self.clips.append(Clip(
                start=self._num(attrs, "data-start", 0.0),
                duration=self._num(attrs, "data-duration", 0.0),
                track=int(self._num(attrs, "data-track-index", 0)),
                src=src,
                name=Path(src).name if src else "audio",
                kind="audio",
                volume=self._num(attrs, "volume", 1.0),
            ))

        elif self._is_clip(attrs):
            src = attrs.get("src") or attrs.get("data-src")
            self._open.append({
                "depth": self._depth,
                "start": self._num(attrs, "data-start", 0.0),
                "duration": self._num(attrs, "data-duration", 0.0),
                "track": int(self._num(attrs, "data-track-index", 0)),
                "src": src,
                "id": attrs.get("id") or attrs.get("data-clip-id"),
            })

        elif self._open and tag in ("video", "img") and not self._open[-1]["src"]:
            # источник лежит на потомке, а не на самом клипе
            self._open[-1]["src"] = attrs.get("src") or attrs.get("data-src")

        if not void:
            self._depth += 1
            if self._is_clip(attrs) is False and tag == "audio":
                pass  # <audio> закроется своим тегом, глубину уже увеличили

    def handle_startendtag(self, tag, attrs_list):
        # <img ... /> это открывающий и закрывающий разом, глубину не трогаем
        saved = self._depth
        self.handle_starttag(tag, attrs_list)
        self._depth = saved
        if self._open and self._open[-1]["depth"] == saved:
            self._close_top()

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
        self._depth -= 1
        while self._open and self._open[-1]["depth"] == self._depth:
            self._close_top()

    def _close_top(self):
        rec = self._open.pop()
        src = rec["src"]
        self.clips.append(Clip(
            start=rec["start"],
            duration=rec["duration"],
            track=rec["track"],
            src=src,
            name=Path(src).name if src else (rec["id"] or "текст"),
            kind="video" if src else "text",
        ))


# -- сборка XML ---------------------------------------------------------


def assign_lanes(clips: list[Clip], fps: int) -> list[tuple[int, Clip]]:
    """Разложить клипы по дорожкам так, чтобы на одной ничего не пересекалось.

    Объявленный data-track-index уважается как намерение автора. Но
    несколько звуков часто идут без него и садятся на дорожку 0 разом.
    Два clipitem с перекрытием на одной дорожке это невалидный FCP 7:
    монтажка либо ругается, либо молча теряет клип. Поэтому внутри
    каждой объявленной дорожки клипы дораскладываются на подполосы.
    """
    out: list[tuple[int, Clip]] = []
    lane_base = 0
    for declared in sorted({c.track for c in clips}):
        group = sorted([c for c in clips if c.track == declared],
                       key=lambda c: (c.start, c.duration))
        lane_ends: list[int] = []          # конец последнего клипа на подполосе
        for clip in group:
            start_f = to_frames(clip.start, fps)
            end_f = start_f + max(1, to_frames(clip.duration, fps))
            placed = False
            for lane, busy_until in enumerate(lane_ends):
                if start_f >= busy_until:
                    lane_ends[lane] = end_f
                    out.append((lane_base + lane, clip))
                    placed = True
                    break
            if not placed:
                lane_ends.append(end_f)
                out.append((lane_base + len(lane_ends) - 1, clip))
        lane_base += max(1, len(lane_ends))
    return out


def to_frames(seconds: float, fps: int) -> int:
    return int(round(seconds * fps))


def path_url(src: str, base: Path) -> str:
    """FCP ждёт file://localhost/ и прямые слэши даже на Windows."""
    if src.startswith(("http://", "https://", "file://")):
        return escape(src)
    p = (base / src).resolve()
    return escape("file://localhost/" + str(p).replace("\\", "/").lstrip("/"))


def rate_xml(fps: int, indent: str) -> str:
    return (f"{indent}<rate>\n"
            f"{indent}  <timebase>{fps}</timebase>\n"
            f"{indent}  <ntsc>FALSE</ntsc>\n"
            f"{indent}</rate>")


def clipitem_xml(clip: Clip, fps: int, base: Path, idx: int,
                 seen_files: dict[str, str], indent: str) -> str:
    start_f = to_frames(clip.start, fps)
    dur_f = max(1, to_frames(clip.duration, fps))
    end_f = start_f + dur_f

    cid = f"clipitem-{idx}"
    lines = [
        f'{indent}<clipitem id="{cid}">',
        f"{indent}  <name>{escape(clip.name)}</name>",
        f"{indent}  <duration>{dur_f}</duration>",
        rate_xml(fps, indent + "  "),
        f"{indent}  <start>{start_f}</start>",
        f"{indent}  <end>{end_f}</end>",
        f"{indent}  <in>0</in>",
        f"{indent}  <out>{dur_f}</out>",
    ]

    if clip.src in seen_files:
        lines.append(f'{indent}  <file id="{seen_files[clip.src]}"/>')
    else:
        fid = f"file-{len(seen_files) + 1}"
        seen_files[clip.src] = fid
        lines += [
            f'{indent}  <file id="{fid}">',
            f"{indent}    <name>{escape(clip.name)}</name>",
            f"{indent}    <pathurl>{path_url(clip.src, base)}</pathurl>",
            rate_xml(fps, indent + "    "),
            f"{indent}    <duration>{dur_f}</duration>",
            f"{indent}  </file>",
        ]

    if clip.kind == "audio":
        lines += [
            f"{indent}  <sourcetrack>",
            f"{indent}    <mediatype>audio</mediatype>",
            f"{indent}    <trackindex>1</trackindex>",
            f"{indent}  </sourcetrack>",
        ]

    lines.append(f"{indent}</clipitem>")
    return "\n".join(lines)


def build_xml(clips: list[Clip], fps: int, width: int, height: int,
              name: str, base: Path) -> str:
    video = sorted([c for c in clips if c.kind == "video"],
                   key=lambda c: (c.track, c.start))
    audio = sorted([c for c in clips if c.kind == "audio"],
                   key=lambda c: (c.track, c.start))
    texts = sorted([c for c in clips if c.kind == "text"], key=lambda c: c.start)

    total_f = max(
        [to_frames(c.start + c.duration, fps) for c in clips] or [0]
    )

    seen_files: dict[str, str] = {}
    idx = 0
    out = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<!DOCTYPE xmeml>",
        '<xmeml version="5">',
        '  <sequence id="sequence-1">',
        f"    <name>{escape(name)}</name>",
        f"    <duration>{total_f}</duration>",
        rate_xml(fps, "    "),
        "    <media>",
        "      <video>",
        "        <format>",
        "          <samplecharacteristics>",
        rate_xml(fps, "            "),
        f"            <width>{width}</width>",
        f"            <height>{height}</height>",
        "            <pixelaspectratio>square</pixelaspectratio>",
        "          </samplecharacteristics>",
        "        </format>",
    ]

    video_lanes = assign_lanes(video, fps)
    for lane in sorted({l for l, _ in video_lanes}) or [0]:
        out.append("        <track>")
        for l, clip in video_lanes:
            if l != lane:
                continue
            idx += 1
            out.append(clipitem_xml(clip, fps, base, idx, seen_files,
                                    "          "))
        out.append("        </track>")

    out.append("      </video>")

    if audio:
        out.append("      <audio>")
        audio_lanes = assign_lanes(audio, fps)
        for lane in sorted({l for l, _ in audio_lanes}):
            out.append("        <track>")
            for l, clip in audio_lanes:
                if l != lane:
                    continue
                idx += 1
                out.append(clipitem_xml(clip, fps, base, idx, seen_files,
                                        "          "))
            out.append("        </track>")
        out.append("      </audio>")

    out.append("    </media>")

    # Текст файла не имеет, дорожкой стать не может. Ставим маркер,
    # чтобы монтажёр видел, где он был.
    for clip in texts:
        s = to_frames(clip.start, fps)
        out += [
            "    <marker>",
            f"      <name>{escape(clip.name)}</name>",
            "      <comment>текстовый клип HyperFrames</comment>",
            f"      <in>{s}</in>",
            f"      <out>{s + max(1, to_frames(clip.duration, fps))}</out>",
            "    </marker>",
        ]

    out += ["  </sequence>", "</xmeml>", ""]
    return "\n".join(out)


def convert(html_path: Path, fps_override: int | None) -> tuple[str, dict]:
    parser = CompositionParser()
    parser.feed(html_path.read_text(encoding="utf-8"))
    parser.close()

    root = parser.root
    fps = fps_override or int(float(root.get("data-fps") or DEFAULT_FPS))
    width = int(float(root.get("data-width") or DEFAULT_SIZE[0]))
    height = int(float(root.get("data-height") or DEFAULT_SIZE[1]))
    name = root.get("data-composition-id") or html_path.stem

    xml = build_xml(parser.clips, fps, width, height, name, html_path.parent)
    stats = {
        "video": sum(1 for c in parser.clips if c.kind == "video"),
        "audio": sum(1 for c in parser.clips if c.kind == "audio"),
        "text": sum(1 for c in parser.clips if c.kind == "text"),
        "fps": fps,
        "size": f"{width}x{height}",
    }
    return xml, stats


SAMPLE = """
<div data-composition-id="demo" data-width="1080" data-height="1920"
     data-fps="30" data-start="0">
  <div class="clip" data-start="0" data-duration="2" data-track-index="0">
    <video src="shots/01.mp4"></video>
  </div>
  <div class="clip" data-start="2" data-duration="1.5" data-track-index="0"
       data-src="shots/02.mp4"></div>
  <div class="clip" data-start="0.5" data-duration="1" data-track-index="1"
       id="title-a">Заголовок</div>
  <audio src="vo/line1.wav" data-start="0" data-duration="3.5" volume="0.8">
  </audio>
</div>
"""


def demo() -> None:
    """Самопроверка разбора и арифметики кадров. Файлы не нужны."""
    p = CompositionParser()
    p.feed(SAMPLE)
    p.close()

    kinds = sorted(c.kind for c in p.clips)
    assert kinds == ["audio", "text", "video", "video"], kinds

    vids = sorted([c for c in p.clips if c.kind == "video"],
                  key=lambda c: c.start)
    assert vids[0].src == "shots/01.mp4", vids[0].src
    assert vids[1].src == "shots/02.mp4", vids[1].src
    assert vids[1].track == 0

    txt = [c for c in p.clips if c.kind == "text"][0]
    assert txt.track == 1 and txt.name == "title-a", (txt.track, txt.name)

    aud = [c for c in p.clips if c.kind == "audio"][0]
    assert aud.src == "vo/line1.wav" and aud.duration == 3.5

    assert p.root["data-width"] == "1080"

    # Кадры: 2.0s при 30 fps это 60, 1.5s это 45.
    assert to_frames(2.0, 30) == 60
    assert to_frames(1.5, 30) == 45
    assert to_frames(0.0, 30) == 0

    xml = build_xml(p.clips, 30, 1080, 1920, "demo", Path("."))
    assert xml.startswith('<?xml version="1.0"'), xml[:40]
    assert "<!DOCTYPE xmeml>" in xml
    assert xml.count("<clipitem") == 3        # два видео плюс звук
    assert xml.count("<marker>") == 1         # текст ушёл в маркер
    assert "<width>1080</width>" in xml
    assert "<timebase>30</timebase>" in xml
    # Длительность секвенции по самому дальнему концу: звук до 3.5s.
    assert "<duration>105</duration>" in xml, "3.5s * 30 fps = 105 кадров"

    # Один и тот же файл описывается один раз, дальше по ссылке.
    twice = [Clip(0, 1, 0, "a.mp4", "a.mp4", "video"),
             Clip(1, 1, 0, "a.mp4", "a.mp4", "video")]
    x2 = build_xml(twice, 30, 100, 100, "t", Path("."))
    assert x2.count("<pathurl>") == 1, "файл должен объявляться один раз"
    assert '<file id="file-1"/>' in x2

    # Раскладка по дорожкам: перекрытия обязаны разъезжаться.
    over = [
        Clip(0.0, 4.0, 0, "a.wav", "a.wav", "audio"),
        Clip(3.5, 1.0, 0, "b.wav", "b.wav", "audio"),   # налезает на a
        Clip(6.0, 1.0, 0, "c.wav", "c.wav", "audio"),   # свободно, вернётся на 0
    ]
    lanes = assign_lanes(over, 30)
    by_name = {c.name: l for l, c in lanes}
    assert by_name["a.wav"] == 0, by_name
    assert by_name["b.wav"] == 1, "перекрытие обязано уехать на вторую дорожку"
    assert by_name["c.wav"] == 0, "после освобождения дорожка переиспользуется"

    # Внутри одной дорожки ничего не пересекается, это главный инвариант.
    for lane in {l for l, _ in lanes}:
        spans = sorted((to_frames(c.start, 30),
                        to_frames(c.start + c.duration, 30))
                       for l, c in lanes if l == lane)
        for (s1, e1), (s2, _) in zip(spans, spans[1:]):
            assert e1 <= s2, f"перекрытие на дорожке {lane}: {e1} > {s2}"

    xml3 = build_xml(over, 30, 100, 100, "t", Path("."))
    audio_block = xml3[xml3.index("<audio>"):xml3.index("</audio>")]
    assert audio_block.count("<track>") == 2, "два звука внахлёст дают две дорожки"

    print("export_fcp7: самопроверка пройдена")


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Композиция HyperFrames в FCP 7 XML")
    ap.add_argument("composition", type=Path, nargs="?",
                    help="HTML-композиция")
    ap.add_argument("-o", "--output", type=Path, default=None,
                    help="Куда писать XML (по умолчанию рядом с исходником)")
    ap.add_argument("--fps", type=int, default=None,
                    help="Переопределить частоту кадров")
    ap.add_argument("--demo", action="store_true",
                    help="Самопроверка без файлов")
    args = ap.parse_args()

    if args.demo:
        demo()
        return
    if not args.composition:
        ap.error("нужен путь к композиции или флаг --demo")

    src = args.composition.resolve()
    if not src.exists():
        sys.exit(f"файл не найден: {src}")

    xml, stats = convert(src, args.fps)

    if stats["video"] == 0 and stats["audio"] == 0:
        sys.exit("в композиции не найдено ни одного клипа с источником. "
                 "Проверь, что у элементов есть class=\"clip\" и data-start")

    out = args.output or src.with_suffix(".xml")
    out.write_text(xml, encoding="utf-8")

    print(f"записано: {out}")
    print(f"  видео {stats['video']}, звук {stats['audio']}, "
          f"текст {stats['text']} (в маркеры)")
    print(f"  {stats['size']} при {stats['fps']} fps")
    if stats["text"]:
        print("  текстовые клипы файлами не являются, в XML они маркеры. "
              "Титры пересобираются в монтажке.")


if __name__ == "__main__":
    main()

