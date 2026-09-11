---
name: gsap-scrolltrigger-storytelling
description: >-
  Хореография длинных scroll-driven сцен на GSAP ScrollTrigger:
  закреплённые (pinned) секции, прогрессивные раскрытия UI, синхронный со
  скроллом моушен. Использовать для кинематографичного продуктового
  сторителлинга (не для рядового попапа/тултипа — там достаточно `gsap`
  без этого слоя хореографии).
---

# GSAP ScrollTrigger Storytelling

Когда страница должна ощущаться как scroll-driven история продукта, а не
статичный маркетинговый лендинг. ScrollTrigger — главный слой хореографии
для закреплённых секций, прогрессивных раскрытий интерфейса, сцен с
`pin`/scrubbed-таймлайнами и immersive-переходов между секциями. Моушен
усиливает понимание, не прячет за собой базовый контент.

Полный текст — [gsap-scrolltrigger-storytelling.md](gsap-scrolltrigger-storytelling.md),
дословно на английском.

## Реализация

Основной scroll-нарратив — таймлайны с `scrub`, обычные твины — только
для поддерживающих входов/hover. Длинные секции — `pin: true`, каждая
сцена — на явной метке таймлайна. Transform/opacity вместо layout-свойств.
`gsap.context()` в React-компонентах с очисткой на unmount.
`ScrollTrigger.refresh()` после загрузки контента, влияющего на высоту
секций. `matchMedia()` для упрощения десктоп-хореографии на мобильном.

## Паттерны

Sticky product frame (артефакт закреплён, нарратив вокруг меняется
шагами), layer reveal (слои входят по одному с общим языком easing),
section handoff (сцена перетекает в следующую через scale/mask/blur, не
обрывается), smooth interpolation (scrub smoothing/quickSetter/quickTo для
pointer-following), cinematic depth (parallax фон/передний план, лёгкие
движения камеры, без потери читаемости).

## Чего избегать

Триггерить несвязанные анимации на каждый тик скролла без чёткой
сюжетной точки. Держать читателя в pinned-секции слишком долго. Оставлять
живые ScrollTrigger после unmount/смены роута.

## Соседние блоки

`gsap` (этот же блок) — базовый API, на котором построена вся
хореография здесь. `animation-systems` (этот же блок) — числа и решение,
нужен ли вообще такой уровень кинематографичности для задачи.

---

*Источник: `gsap-scrolltrigger-storytelling` (MengTo/Skills), MIT license.
[gsap-scrolltrigger-storytelling.md](gsap-scrolltrigger-storytelling.md) —
дословно.*

