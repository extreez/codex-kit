---
name: better-interface-motion
description: >-
  Точные числа и код для частых случаев анимации: прерываемость (CSS
  transitions vs keyframes), stagger-появление, exit-анимации, contextual
  icon animation (0.25→1, spring bounce:0), scale on press (0.96), skip
  animation on load. Использовать при реализации конкретного перехода в
  коде — не выбор паттерна (для этого transitions-dev), а точные значения,
  когда паттерн уже выбран.
---

# Точные числа моушена (better-interface)

Домен Motion из `better-interface.md` (Figma Community) — та часть,
которую `web-taste/craft-review` сознательно не взял себе (см. его футер:
"Motion... владеет web-fundamentals/ux-writing/web-motion"). Разница с
`transitions-dev`: там готовые сниппеты под конкретный UI-паттерн
(dropdown, modal, toast), здесь — числа и код для случаев, которых там нет
(contextual icon animation, scale on press) и общие правила выбора между
CSS transitions и keyframes.

Полный текст — [motion.md](motion.md), дословно на английском (плотный
код и точные значения, вольный перевод рискует сдвинуть число).

## Что внутри, коротко

- **CSS transitions vs keyframes** — transitions для интерактивных
  состояний (прерываемые), keyframes только для one-shot последовательностей.
- **Enter: split + stagger** — ~100ms между группами, только для нечастых
  входов.
- **Exit мягче enter** — короче по длительности (150ms vs 300ms), меньшее
  движение.
- **Contextual icon animation** — точные значения: `scale` `0.25→1`,
  `opacity` `0→1`, `blur(4px)→blur(0px)`, `{ type: "spring", duration: 0.3,
  bounce: 0 }` (bounce всегда `0`).
- **Scale on press** — всегда `0.96`, никогда меньше `0.95`.
- **Skip animation on load** — `initial={false}` на `AnimatePresence` для
  элементов с дефолтным состоянием на маунте, не для намеренных staged-входов.

## Перед использованием

`prefers-reduced-motion` — забота `web-a11y-design`, применять её ко
всему в этом файле, не только к тому, что помечено явно.

## Соседние блоки

`transitions-dev` (этот же блок) — готовые сниппеты под конкретный
UI-паттерн, брать сначала оттуда. `apple-design` (этот же блок) —
принципы, откуда эти числа логически следуют (прерываемость,
spring-физика). `web-taste/craft-review` — тот же источник, домены
Surfaces/Icons, не Motion.

---

*Источник: `better-interface.md` (Figma Community), домен Motion —
уникальная часть после вычета Accessibility/Layout/Writing/Typography
(которыми владеют другие блоки) и Surfaces/Icons (которыми владеет
`web-taste/craft-review`). [motion.md](motion.md) — дословно.*

