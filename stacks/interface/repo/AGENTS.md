# {{PROJECT_NAME}}

Тип: интерфейс/фронтенд.

## Куда

| Признак запроса | Блок |
|---|---|
| Полное ревью крафта, финальный вердикт перед сдачей | `web-taste` |
| Гештальт, платформенные конвенции, layout, типографика | `web-fundamentals` |
| Не забыть состояние экрана (loading/empty/error/partial) | `web-states` |
| Проверить функциональную полноту страницы по типу (Login/Paywall/...) | `checklist-design` |
| Цвет: палитра, OKLCH, извлечение с сайта | `web-color` |
| Тёмная тема | `dark-mode-design` |
| Стиль иллюстраций | `illustration-style` |
| Анимация интерфейса | `web-motion` |
| Многослойные тени, hairline-ring | `shadow-plugin` |
| Copy-paste компоненты (shadcn) | `shadcn-official` |
| Иконки | `icons0-dev` |
| Дизайн-система: извлечь/токены/документация/вариации | `design-system-extract`, `design-system-tokens`, `design-system-docs`, `design-system-tweaks` |
| Доступность на стадии проектирования | `web-a11y-design` |
| Доступность на готовом коде (сканер) | `web-a11y-code` |
| Голос/тон, копирайтинг интерфейса | `ux-writing` |
| Работа на холсте Figma | `figma-canvas` (требует `figma-mcp`) |
| Anti-slop детектор, числовая параметризация вкуса | `impeccable`, `taste-skill` |

## Порядок для нового экрана с нуля

`web-fundamentals`/`web-color`/`design-system-tokens` (основа) →
собрать → `web-states` (не забыть состояния) → `web-a11y-design` (в
процессе, не постфактум) → `web-taste` (финальный вердикт) →
`web-a11y-code` (сканер на готовом) → `checklist-design` (функциональная
полнота, если тип страницы есть в каталоге).

Полный аудит существующего интерфейса по доступности или по фундаменту —
`web-a11y-design`/`web-fundamentals` сами знают, как распараллелить по
subagent (см. их SKILL.md).

## Платформенные (не в этом стеке)

`mobile-ui`/`swiftui-ui`/`material3-ui` — ставятся отдельно (`/kit add`)
по факту проекта, не входят в `interface` по умолчанию (см. CONFLICTS.md,
группа `platform-ui`).

