---
name: animation-on-scroll
description: >-
  Reveal-on-scroll через чистый IntersectionObserver + Tailwind-совместимые
  keyframes, без зависимости от GSAP. Использовать для лёгкого появления
  элементов при входе во viewport, когда не нужна вся хореография
  ScrollTrigger — тот же результат, меньше веса.
---

# Animation On Scroll

Лёгкая альтернатива `gsap-scrolltrigger-storytelling` для простого случая
"появись, когда докрутили" — без подключения GSAP. Один
`IntersectionObserver` на всю страницу, класс `animate-on-scroll` +
Tailwind-запись keyframe-анимации на элементе.

Полный текст (JS-сниппет, keyframes, пример) —
[animation-on-scroll.md](animation-on-scroll.md), дословно на английском.

## Механика

Анимация по умолчанию на паузе (`animation-play-state: paused`),
observer при пересечении viewport добавляет класс `.animate`, который её
запускает. `once = true` — снять observer после первого срабатывания.

```html
<div class="animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]">
  ...
</div>
```

Дефолтные keyframes: `opacity 0→1`, `translateY(30px)→0`,
`blur(8px)→blur(0px)`.

## Настройка

`threshold`/`rootMargin` — раньше/позже триггер. `once = false` — повтор
при повторном входе в viewport. `translateY`/`blur` в keyframes — сила
движения. `duration`/`delay` в Tailwind-записи — тайминг.

## Частые ошибки

Забыть вставить keyframes раньше JS-сниппета. Разное имя keyframe в CSS и
в Tailwind-классе. Элемент уже во viewport до инициализации observer'а —
анимация не запускается.

## Соседние блоки

`gsap-scrolltrigger-storytelling` (этот же блок) — когда нужна не просто
разовая появление, а хореография сцен с pin/scrub. `animation-systems`
(этот же блок) — числа для fade+rise (12-24px, 300-700ms), если дефолт
здесь (30px, 800ms) не подходит под контекст.

---

*Источник: `animation-on-scroll` (MengTo/Skills), MIT license.
[animation-on-scroll.md](animation-on-scroll.md) — дословно.*

