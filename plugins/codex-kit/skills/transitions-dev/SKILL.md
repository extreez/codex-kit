---
name: transitions-dev
description: >-
  32 готовых CSS-переходов (dropdown, modal, toast, skeleton, tabs, success
  check, error shake и т.д.), каждый — самодостаточный сниппет с
  `prefers-reduced-motion`-гардом. Использовать, когда нужен конкретный,
  часто встречающийся UI-переход — не изобретать заново, взять готовый.
  Не переписывать содержимое — офлайн-установка апстрима.
---

# transitions-dev

Ставится как есть через `npx skills add`, апстрим (`Jakubantalik/
transitions.dev`) не копируется в этот блок. У репозитория нет лицензии
(нет файла LICENSE) — поэтому именно установка, не дословный порт: снипеты
остаются у апстрима, мы только подключаем.

## Установка скилла (агентские инструкции + decision rules)

```bash
npx skills add Jakubantalik/transitions.dev -s transitions-dev
```

Имя скилла именно `transitions-dev`, не `transitions-polish` (это другой,
второй скилл в том же репозитории — `-s transitions-polish`, набор правил
для ревью/доводки уже применённых переходов, `_refine-rules.md`).

## Альтернатива — CLI без скилла, точечный снипет

Если нужен ровно один переход, без загрузки правил выбора:

```bash
npx transitions-pro add card-resize      # бесплатно, без аккаунта
npx transitions-pro list                 # список всех 32 + Pro-набора
```

Pro-переходы (за пределами 32 бесплатных) открываются passwordless-логином
в браузере, без API-ключа в терминале.

## Что внутри (для справки, не переносится)

32 сниппета, каждый — CSS custom properties на `:root` + правила под
`t-*`-классами + `@media (prefers-reduced-motion: reduce)`. Без
фреймворк-зависимостей, без демо-разметки — вставляется в любой проект.
Полный список: card-resize, number-pop-in, notification-badge,
text-states-swap, menu-dropdown, modal, panel-reveal, page-side-by-side,
icon-swap, success-check, avatar-group-hover, error-state-shake,
input-clear-dissolve, skeleton-reveal, shimmer-text, tabs-sliding,
tooltip, texts-reveal, card-tilt, plus-menu-morph, accordion, toast,
like-button, learn-more-hover, checkbox-check, spinning-counter, toggle,
thinking-states, reasoning-stream, streaming-text, matrix-loader,
banner-stacking.

## Соседние блоки

`apple-design` (этот же блок, `web-motion`) — принципы, откуда снипеты
здесь ведут родословную (прерываемость, spring-физика). Если готового
снипета нет под задачу — строить по принципам `apple-design`, не
изобретать с нуля мимо обоих источников. `better-interface` (этот же
блок) — точные числа (`0.96`, `bounce: 0`, `cubic-bezier(0.2,0,0,1)`) для
частных случаев, которых нет в 32 снипетах (scale-on-press, contextual
icon animation).

