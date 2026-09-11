---
name: better-accessibility
description: >-
  Практический код-уровень WCAG-доступности: нативные элементы вместо
  ARIA, focus-ring, полная клавиатурная поддержка, минимальный hit-area,
  формы, объявление динамического контента, alt-текст по назначению.
  Использовать при разметке/ревью конкретного HTML-компонента —
  дополняет остальные группы этого блока (проектные принципы) точным
  кодом и значениями.
---

# Better Accessibility

Полный текст источника — [better-accessibility-full.md](better-accessibility-full.md),
дословно: держит native-elements-first, trap/restore focus, accessible
names, "не полагаться только на цвет", alt-текст по назначению, структуру/
навигацию, переживание zoom, таблицу частых ошибок и формат отчёта — то,
что не вынесено ни в один из шести файлов ниже. Шесть файлов — детальные
рецепты для конкретных тем, открывать по формулировке запроса.

| Запрос | Файл | Что делает |
|---|---|---|
| «ARIA», «роли», «`<div onClick>`» | `semantics-and-aria.md` | нативный элемент раньше ARIA; landmarks; button vs link; disabled-состояния |
| «focus ring», «клавиатурная навигация», «roving tabindex» | `focus-and-keyboard.md` | `:focus-visible`, ARIA APG паттерны (Escape/стрелки/Tab/Enter), roving tabindex в composite-виджетах |
| «размер тач-таргета» | `hit-areas.md` | WCAG 2.5.8 AA база 24×24px, 44×44 touch / 40×40 desktop, запрет перекрытия расширенных зон |
| «форма», «label», «autocomplete» | `forms.md` | `<label for>` обязателен, `aria-invalid`+`aria-describedby`, никогда не блокировать paste |
| «reduced motion», «zoom», «200% масштаб» | `motion-and-zoom.md` | `prefers-reduced-motion` опт-ин, reflow на 320px без горизонтального скролла |
| «screen reader», «live region», «alert» | `screen-readers.md` | `aria-describedby`/`role="status"`/`role="alert"` — три механизма, три разные задачи |

## Общее

Большая часть доступности — бесплатна, если использовать платформу:
нативные элементы уже несут клавиатурную поддержку, реальные лейблы сами
себя объявляют, видимый focus ring — одно CSS-правило. Ревью — два
прохода: клавиатурный (весь флоу без мыши) и screen-reader (каждый
контроль объявляет имя/роль/состояние). При сомнении — брать платформенный
дефолт вместо кастомной пересборки, и убирать ARIA, а не добавлять.

Контраст и цветовые фиксы — забота `web-color`. Размер текста и iOS input
zoom — забота `web-fundamentals/typography`. Пространственный RTL-layout —
забота `web-fundamentals/layout-spacing`.

## Соседние группы этого блока

Остальные четыре группы (`accessible-content`, `adaptive-interfaces`,
`cognitive-accessibility`, `inclusive-interaction`) — проектные принципы
до кода («accessibility is a design commitment»). Эта группа — код-уровень
поверх них, ближе по духу к `web-a11y-code` (AccessLint), но текстовый
скилл-справочник, не сканер/аудитор.

---

*Источник: `better-accessibility` (jakubkrehel/skills), MIT license.
Шесть reference-файлов — дословно.*

---

## Проверяемый результат (для /loop-build)

Код-уровневый справочник (semantic HTML, ARIA, focus management) — многое
проверяемо тем же путём, что `web-a11y-code` (AccessLint): невалидный
ARIA, отсутствующий focus-trap в модалках, немой интерактивный элемент —
всё это ловится сканером, не только глазами. Для прогона используй
`web-a11y-code`, этот блок — справочник по написанию, не сканер сам по
себе.

