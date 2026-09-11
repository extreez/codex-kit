---
name: animation-vocabulary
description: >-
  Обратный словарь: превращает нечёткое описание эффекта ("пружинистое,
  когда открывается попап", "резиновый скролл как в iOS") в точный термин.
  Использовать, когда нужно назвать эффект, не спроектировать и не
  реализовать его — для промпта другому агенту/дизайнеру.
---

# Словарь анимации

Превращает нечёткое описание в точный термин, чтобы знать, что просить.
Читать по ощущению ("пружинистое", "уезжает", "само дорисовывается"), не
по ключевым словам — сопоставлять с глоссарием.

Полный словарь — [vocabulary.md](vocabulary.md), дословно на английском:
11 категорий (Entrances & Exits, Sequencing & Timing, Movement &
Transforms, Transitions Between States, Scroll, Feedback & Interaction,
Easing, Spring Animations, Looping & Ambient Motion, Polish & Effects,
Performance, Principles to Know), термин — одна строка определения.

Формат ответа: сначала лучшее совпадение, затем 1-2 альтернативы с
пометкой, чем отличаются (например `Pop in` vs `Bounce`, `Clip-path` vs
`Mask`, `Shared element transition` vs `Layout animation`). Если термина в
словаре нет — сказать прямо, не выдумывать.

## Соседние блоки

`apple-design`/`find-animation-opportunities` (этот же блок) — термины
отсюда используются в них без повторного объяснения.

---

*Источник: `animation-vocabulary` (emilkowalski/skills), MIT license.
[vocabulary.md](vocabulary.md) — дословно, снимок страницы emilkowal.ski/
vocabulary на момент порта.*

