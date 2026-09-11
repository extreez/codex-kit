---
name: animation-systems
description: >-
  Продуктовый моушен уровня Stripe/Linear/Apple/Vercel: durations/easing
  по умолчанию, choreography-паттерны (hero → supporting elements, section
  reveal, hover lift), performance-правила, reduced motion. Использовать
  как каркас принципов и чисел перед выбором конкретного движка
  (gsap/threejs/CSS) для реализации.
---

# Animation Systems

Не "больше анимации", а анимация лучше: ясность, иерархия, фидбек, восторг
- без рывков. Если анимация не служит ни одной из пяти целей (объяснить
иерархию, подтвердить действие, направить внимание, сохранить
пространственную связность, добавить полировки) - удалить её.

Общая черта Stripe/Linear/Apple/Vercel: сдержанность (один сильный
hero-момент, остальное - поддержка), чёткая хореография (главный элемент
двигается первым, вторичные следуют с небольшим stagger), физично, но не
мультяшно (easing ощущается человеческим, без bounce по умолчанию на
серьёзном продуктовом UI).

Полный текст (примитивы, числа, паттерны, performance) —
[animation-systems.md](animation-systems.md), дословно на английском.

## Числа по умолчанию

**Duration:** микро (hover/press) 120-200ms; смена UI-состояния (toggle,
select) 180-260ms; мелкие переходы (popover, toast) 220-320ms; появление
секции страницы 400-800ms; hero-последовательности 800-1600ms (с
внутренними бит-точками).

**Easing:** входящее — ease-out с мягким затуханием; выходящее — ease-in
(быстрее); избегать elastic/bounce, если бренд не игровой.

**Stagger:** 40-90ms на элемент, меньше на мобильном.

## Примитивы моушена

Fade + rise (дефолтный вход: opacity 0→1, Y 12-24px→0), Scale + fade
(микро-акцент: scale 0.98→1), Slide (навигация: только transform, не
layout), Morph/shared element (высокий крафт: требует согласованной
геометрии).

## Performance (не обсуждается)

Анимировать `transform`/`opacity`, не `width`/`height`/`top`/`left`.
Клампить device pixel ratio в тяжёлых canvas (1-2). Не измерять layout
каждый кадр.

## Соседние блоки

`gsap`/`threejs`/`animation-on-scroll` (этот же блок) — конкретные API под
эти принципы. `apple-design` (этот же блок) — spring-физика глубже, если
нужна прерываемость жестового взаимодействия, не только числа.

---

*Источник: `animation-systems` (MengTo/Skills), MIT license.
[animation-systems.md](animation-systems.md) — дословно.*

