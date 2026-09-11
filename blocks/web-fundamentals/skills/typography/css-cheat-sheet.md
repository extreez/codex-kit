> Часть скилла typography (см. SKILL.md). Порт jakubkrehel/skills
> `better-typography/css-cheat-sheet.md`, MIT license.

# CSS cheat sheet

Однострочный справочник по каждому типографическому CSS-объявлению из
этого скилла, с эквивалентом Tailwind 4. Где утилиты нет — показана
arbitrary-value форма. Выбирать колонку под проект: объявление для
обычного CSS, CSS Modules, styled-components или StyleX, утилиту — для
Tailwind-кодовых баз.

## Шрифт

| Объявление | Что делает | Tailwind |
| --- | --- | --- |
| `font-family: sans-serif` | Sans-семейство | `font-sans` |
| `font-family: serif` | Serif-семейство | `font-serif` |
| `font-family: monospace` | Моноширинное семейство | `font-mono` |
| `font-size` | Размер из типографической шкалы | `text-*` |
| `font-weight` | Любое значение от 1 до 1000 | `font-*` |
| `font-style: italic` | Переключить на курсив | `italic` |
| `-webkit-font-smoothing` + `-moz-osx-font-smoothing` | Сгладить рендер шрифта на macOS; применять один раз на корне | `antialiased` |
| `font-synthesis: none` | Отключить все синтезированные формы после проверки фолбэков и акцентов | `[font-synthesis:none]` |
| `font-feature-settings` | Переключить OpenType-фичи | `[font-feature-settings:"ss01"]` |
| `font-variation-settings` | Настроить оси переменного шрифта | `[font-variation-settings:"GRAD"_80]` |
| `font-optical-sizing` | Подстроить детали под размер | `[font-optical-sizing:auto]` |
| `font-variant-caps` | Настоящая капитель | `[font-variant-caps:small-caps]` |
| `font-variant-position` | Настоящие над/подстрочные | `[font-variant-position:super]` |
| `font-variant-numeric: tabular-nums` | Цифры одной ширины | `tabular-nums` |
| `font-variant-numeric: slashed-zero` | Отличить 0 от O | `slashed-zero` |

## Отступы и layout

| Объявление | Что делает | Tailwind |
| --- | --- | --- |
| `letter-spacing` | Пространство между буквами | `tracking-*` |
| `line-height` | Пространство между строками | `leading-*` |
| `font-kerning` | Кернинг вкл/выкл | `[font-kerning:none]` |
| `text-box: trim-both` | Обрезать пространство сверху и снизу | `[text-box:trim-both_cap_alphabetic]` |
| `max-width` на текстовых колонках | Предел ~60-75 символов в строке | `max-w-xl` / `max-w-2xl` / `max-w-[65ch]` |
| `text-align` | Где начинаются и кончаются строки | `text-start` / `text-center` |

## Перенос и переполнение

| Объявление | Что делает | Tailwind |
| --- | --- | --- |
| `text-wrap: balance` | Выровнять строки заголовка | `text-balance` |
| `text-wrap: pretty` | Избежать висячих слов | `text-pretty` |
| `text-overflow: ellipsis` | Многоточие для обрезанного текста | `truncate` |
| `line-clamp` | Обрезать после N строк | `line-clamp-*` |
| `overflow-wrap: break-word` | Переносить длинные строки | `break-words` |
| `white-space: nowrap` | Остановить перенос | `whitespace-nowrap` |
| `text-transform` | Сменить регистр | `uppercase` / `capitalize` |

## Оформление и взаимодействие

| Объявление | Что делает | Tailwind |
| --- | --- | --- |
| `text-decoration-line: underline` | Нарисовать подчёркивание | `underline` |
| `text-decoration-color` | Цвет подчёркивания | `decoration-*` |
| `text-decoration-thickness` | Толщина подчёркивания | `decoration-1` / `decoration-2` |
| `text-underline-offset` | Сдвинуть линию вниз | `underline-offset-*` |
| `text-underline-position: from-font` | Позиция подчёркивания из шрифта | `[text-underline-position:from-font]` |
| `text-decoration-style` | Точки, штрихи или волна | `decoration-dotted` / `decoration-wavy` |
| `text-decoration-thickness: from-font` | Толщина подчёркивания из шрифта | `decoration-from-font` |
| `text-decoration-skip-ink` | Разрывы вокруг descender'ов | `[text-decoration-skip-ink:auto]` |
| `caret-color` | Цвет текстового курсора | `caret-*` |
| `user-select: none` | Подавить выделение только на проверенном конфликте drag/жеста | `select-none` |
| `text-shadow` | Тень за буквами | `text-shadow-*` |
| `-webkit-text-stroke` | Обводка букв | `[-webkit-text-stroke:1px_black]` |
| `background-clip: text` | Обрезать фон по буквам | `bg-clip-text` |
| `initial-letter` | Размер буквицы | `[initial-letter:3]` |

