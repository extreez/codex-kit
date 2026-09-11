---
name: material3-ui
description: >-
  Material Design 3 (Material You) — компоненты, дизайн-токены, теминг,
  responsive layout, MD3 compliance audit. Основной фокус — Jetpack
  Compose (MaterialTheme, Material3 composables, adaptive layouts,
  edge-to-edge/insets). Вторично — Flutter. Web ограниченно (Material Web
  в maintenance mode, M3 Expressive на вебе не реализован — не выбирать
  этот источник для чисто веб-проекта). Не переизобретает — офлайн-
  установка апстрима.
---

# material3-ui

Ставится как есть, апстрим (`hamen/material-3-skill`) не копируется.
Ситуативный блок, платформенный.

## Установка

```bash
npx --yes skills add hamen/material-3-skill --skill material-3 -y
```

Альтернатива через маркетплейс самого Codex (в интерактивной
сессии):

```
/plugin marketplace add hamen/material-3-skill
/plugin install material-3@material-3-skill
```

Старая команда `claude plugin install github:hamen/material-3-skill` из
более ранних версий README не работает (issue #8 апстрима, манифест
переехал) — не использовать, только команды выше.

## Платформенный охват (важно перед стартом)

| Платформа | Роль | Примечание |
|---|---|---|
| Jetpack Compose | Основная | Лучшее соответствие текущим API Material 3, Expressive-моушен где доступен |
| Flutter | Вторичная | `ThemeData(useMaterial3: true)`, `ColorScheme.fromSeed` |
| Web (`@material/web`) | Ограниченная | Maintenance mode, M3 Expressive не реализован на вебе — использовать зная, что экосистема не развивается активно |

Для чисто веб-проекта MD3 через этот источник — не первый выбор, веб-путь
здесь вторичен и не обновляется вместе со спекой.

## Что внутри

30+ компонентов (Compose-ориентированные, плюс веб-имена элементов где
применимо) в `references/component-catalog.md`. MD3 compliance audit —
оценка по 10 категориям, работает для Compose/Kotlin, Flutter/Dart и
web/CSS источников. Источник сам прямо называет себя «best-effort
distillation» из официальной документации m3.material.io, Android
Developers и `@material/web` — не первоисточник, дистилляция, может
отставать от актуальной спеки Google.

## Соседние блоки

`mobile-ui` — общие принципы мобильного UI без привязки к платформе.
`swiftui-ui` — тот же формат под Apple/SwiftUI, не пересекается (разные
платформы, ставить по факту проекта).

---

## Проверяемый результат (для /loop-build)

MD3 compliance audit на 10 категорий уже описан в источнике — готово,
когда пройдены все 10 (реальный чеклист, не общее впечатление). Список
категорий и критерий "пройдено" — в самом файле блока.

## Полный compliance-аудит — распараллелить

Просят проверить экран/приложение по всем 10 категориям MD3 сразу —
subagent на категорию, тем же принципом, что 4 группы в web-a11y-design:
спросить модель/эффорт, собрать в одну таблицу без дублей.

