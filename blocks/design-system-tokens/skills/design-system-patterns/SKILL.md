---
name: design-system-patterns
description: >-
  Архитектура токенов дизайн-системы: примитив→семантика→компонент,
  теминг через CSS custom properties, вариантные системы компонентов
  (CVA), пайплайн Figma→код через Style Dictionary. Использовать при
  создании токенов с нуля или структурировании уже извлечённых значений
  (после `design-system-extract`) в трёхуровневую систему.
---

# Архитектура токенов

Три уровня, не два и не один: **примитивы** (сырые значения — цвета,
размеры, шрифты), **семантика** (контекстное значение — `text-primary`,
`surface-elevated`), **компонент** (конкретное использование —
`button-bg`, `card-border`). Компоненты ссылаются только на семантический
слой, семантика — только на примитивы. Тот же принцип, что в
`better-colors` (блок `web-color`), только применён ко всем токенам, не
только к цвету.

Полный текст (4 паттерна с кодом: иерархия токенов, React-теминг,
CVA-варианты, конфиг Style Dictionary) —
[details.md](details.md), дословно на английском.

## Четыре области

1. **Design Tokens** — примитив/семантика/компонент, конвенции именования,
   мультиплатформенная генерация (CSS, iOS, Android).
2. **Theming** — CSS custom properties, React theme context, определение
   системных настроек (`prefers-color-scheme`), персистентное хранение
   темы, режимы reduced-motion/high-contrast.
3. **Component Architecture** — compound components, полиморфные
   компоненты (`as` prop), вариантные и размерные системы, slot-based
   композиция, headless UI, style props.
4. **Token Pipeline** — синхронизация Figma→код, конфигурация Style
   Dictionary, трансформация токенов, CI/CD-интеграция обновлений.

## Лучшие практики (дословно из источника)

Называть токены по назначению, не по внешнему виду. Держать иерархию
(Primitives > Semantic > Component). Документировать использование.
Версионировать токены (semver). Тестировать комбинации тем. Автоматизировать
пайплайн токенов. Давать пути миграции.

## Частые проблемы

Token Sprawl (разрастание без структуры), несогласованное именование,
отсутствующая тёмная тема, захардкоженные значения, циклические ссылки,
платформенные пробелы.

## Соседние блоки

`design-system-extract` — источник сырых значений (примитивов) с сайта,
до того как строить над ними эту архитектуру. `web-color/better-colors` —
та же логика примитив/семантика, но только для цвета, глубже (правила
построения рампы). `figma-canvas/design-docs` (`build-a-variable-library`)
— та же трёхуровневая модель, но исполнение внутри Figma Variables, не в
коде.

---

*Источник: `design-system-patterns` (wshobson/agents,
`plugins/ui-design/skills/design-system-patterns`), MIT license.
[details.md](details.md) — дословно.*

---

## Проверяемый результат (для /loop-build)

Трёхуровневая архитектура даёт честную команду: hardcoded-значения вне
слоя токенов не должны появляться в компонентах. `grep -rE "#[0-9a-fA-F]{6}|rgba?\(" src/components` — готово, когда пусто (все цвета идут через
токены). Правильность самой семантики токенов (verified naming) —
вердикт, не команда.

## Несколько платформ сразу — распараллелить

Токены выводятся сразу под несколько таргетов (CSS/iOS/Android через
Style Dictionary) — subagent на платформу, каждый читает один и тот же
исходный набор токенов и просто транслирует в свой формат — независимо,
без гонки, источник общий и read-only для всех.

## Synthesized component rules

Component families share radius, border, shadow, spacing, color, and state
logic. Keep those values in the component-token layer, make elevated surfaces
use the same depth scale, and reserve anchor slots in repeated cards and rows
so content length does not move actions around. Components consume semantic
tokens only; raw palette values belong in primitives.
