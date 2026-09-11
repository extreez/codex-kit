---
name: gsap
description: >-
  API-справочник GSAP (GreenSock): твины, таймлайны, ScrollTrigger,
  stagger, типичные ошибки (jank от layout-свойств, утечки в SPA, FOUC).
  Использовать при добавлении/отладке анимации через GSAP в HTML/CSS/JS/
  React — не выбор паттерна (для этого animation-systems), а конкретные
  вызовы.
---

# GSAP (GreenSock)

Когда брать: высококачественный UI-моушен (входы, микро-интеракции,
переходы страниц), таймлайн-последовательности вместо разрозненных CSS
transitions, scroll-driven storytelling (через ScrollTrigger), сложный
easing/stagger/оркестрация по многим элементам.

Полный текст (API, рецепты, типичные ошибки) — [gsap.md](gsap.md),
дословно на английском.

## Ключевые API

Твины: `gsap.to(targets, vars)`, `gsap.from(...)`, `gsap.fromTo(...)`.
Таймлайн: `gsap.timeline({ defaults, repeat, yoyo, paused })`, чейнинг
`tl.to(...).from(...).addLabel('x')`, позиция — абсолютная `1.2`,
относительная `"+=0.5"`, оверлап `"-=0.3"`, метка `"intro"`. Easing:
`"power2.out"`, `"expo.inOut"`, `"elastic.out(1, 0.3)"`. Stagger: `0.05`
или `{ each, from: "start|center|end|random", grid }`. Производительные
свойства: transforms (`x`, `y`, `scale`, `rotation`) и `autoAlpha` вместо
`opacity`+`visibility`.

ScrollTrigger: `gsap.registerPlugin(ScrollTrigger)`, инлайн
`scrollTrigger: ".box"`, продвинутый конфиг `{ trigger, start, end,
scrub, pin, snap, markers }`, отдельно `ScrollTrigger.create(...)`.

## Типичные ошибки

Анимация layout-свойств (top/left/width/height) → jank, использовать
transforms + `will-change: transform`. ScrollTrigger "не срабатывает" —
проверить размер триггера и scroll-контейнер. Утечки в SPA/React —
`gsap.context()` + revert на unmount, `ScrollTrigger.getAll().forEach(t =>
t.kill())`. FOUC — инициализировать после стабилизации layout,
`ScrollTrigger.refresh()` после загрузки картинок/шрифтов.

## Соседние блоки

`gsap-scrolltrigger-storytelling` (этот же блок) — паттерны хореографии
поверх того же API, для длинных scroll-нарративов. `animation-systems`
(этот же блок) — числа и принципы выбора, до того как писать код.

---

*Источник: `gsap` (MengTo/Skills), MIT license. [gsap.md](gsap.md) —
дословно.*

