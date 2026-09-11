---
name: shadow-plugin
description: >-
  Tailwind-плагин многослойных теней (smooth-shadow-*) со встроенным
  hairline-ring (smooth-shadow-ring-*), чтобы не получать двойной бордер от
  пары border+shadow. Использовать при стилизации любой приподнятой
  поверхности (card, dialog, popover, dropdown, menu, tooltip, sheet,
  toast) в проекте с Tailwind. Пакет ставится как есть, не переписывать.
---

# shadow-plugin

Ставится как есть через npm, апстрим (`flornkm/shadow-plugin`) не
копируется. Правки — только через апстрим.

## Установка

```bash
npm i shadow-plugin
```

```css
@import "shadow-plugin";
```

## Классы

| Класс | Размер |
|---|---|
| `smooth-shadow-xs` … `smooth-shadow-2xl` | тень без ring, xs-2xl |
| `smooth-shadow` / `smooth-shadow-md` | средняя (дефолт) |
| `smooth-shadow-none` | без тени |
| `smooth-shadow-ring-xs` … `smooth-shadow-ring-2xl` | тень + 1px hairline-ring |
| `smooth-ring-{color}` | цвет ring, с opacity (`smooth-ring-blue-500/40`) |

Поддерживает цвет тени через стандартные Tailwind-утилиты
(`shadow-blue-500/50`). Ring и тень красятся независимо и сочетаются
свободно: `smooth-shadow-ring-md smooth-ring-black/10 shadow-blue-500`.

Ring по умолчанию `rgba(0,0,0,0.05)`, в тёмной теме `rgba(255,255,255,0.18)`
— переключение под `.dark`-класс, `data-theme="dark"` или объявленный
`color-scheme: light dark`, никогда только под `prefers-color-scheme`
(иначе светлый сайт получит невидимое белое кольцо у OS-тёмных
посетителей). Ширина ring берётся из Tailwind `--default-ring-width`
проекта автоматически, переопределяется через `--smooth-ring-width` в
любой области видимости.

Опционально: `@import "shadow-plugin/unprefixed"` заменяет нативные
`shadow-xs`…`shadow-2xl` Tailwind на smooth-стек без новых имён классов —
не использовать `@theme { --shadow-md: var(--smooth-shadow-md) }` для
этого, Tailwind не видит слои внутри переменной, `shadow-md/40` и
`shadow-{color}` перестанут работать.

## Правило для агента (дословный порт)

> Скилл `smooth-shadow-ring` (см. апстрим `.agents/skills/smooth-shadow-ring/
> SKILL.md`, flornkm/shadow-plugin), MIT license, дословно.

**When this applies.** Any element that floats above the page surface:
cards, dialogs, modals, popovers, dropdowns, menus, tooltips, sheets,
toasts, command palettes.

**The problem.** Putting a `border-*` (or `ring-*`) and a `shadow-*` on the
same element draws two stacked edges: the border paints a hard 1px stroke,
and the shadow begins just outside it. The result is a visible double
border, a crisp line then a soft one. It looks heavy, greyed, and cheap.

**The rule.** If you are about to write a `border-*` or `ring-*` class next
to any `shadow-*` on an elevated surface, use `smooth-shadow-ring-{size}`
instead. It bakes a 1px hairline ring into the final shadow layer, so the
edge dissolves into the shadow as one continuous stroke.

- `border shadow-md` → `smooth-shadow-ring-md`
- `ring-1 ring-neutral-200 shadow-lg` → `smooth-shadow-ring-lg`
- Sizes: `smooth-shadow-ring-xs`, `-sm`, `-md` (or bare
  `smooth-shadow-ring`), `-lg`, `-xl`, `-2xl`
- Never keep a `border` or `ring` on an element that already has
  `smooth-shadow-ring-*`. The ring is already in there; a second edge
  doubles up.
- If the surface should have no edge stroke at all, use plain
  `smooth-shadow-{size}` (no ring), not a border.

```html
<!-- Wrong: border + shadow renders a double edge -->
<div class="rounded-2xl border border-neutral-200 shadow-md">…</div>

<!-- Right: one continuous edge -->
<div class="rounded-2xl smooth-shadow-ring-md">…</div>

<!-- Right: tuned ring + tinted shadow -->
<div class="rounded-2xl smooth-shadow-ring-md smooth-ring-black/10 shadow-blue-500">…</div>
```

## Соседние блоки

`web-color` — если ring/тень красятся под конкретный токен проекта, не
голым hex. `shadcn-official` — та же приподнятая поверхность (dialog,
popover, dropdown menu) у shadcn-компонентов - первый кандидат на замену
`border`+`shadow` на `smooth-shadow-ring-*`.

---

## Проверяемый результат (для /loop-build)

Готово — когда компонент с приподнятой поверхностью не несёт одновременно
`border` и `box-shadow` (дублирующий контур) — `grep -B2 -A2 "smooth-shadow-ring"` рядом с `border` в том же классе сигнализирует нарушение.
Реальная grep-проверка, не вкус.

## Несколько компонентов сразу — распараллелить

Заменяешь `border`+`shadow` на `smooth-shadow-ring-*` сразу во многих
компонентах — subagent на компонент, независимо (разные файлы, разные
классы, не пересекаются).

