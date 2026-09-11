---
name: web-a11y-code
description: >-
  WCAG 2.2 конвейер на готовом коде/странице: scan (авто-скан) → inspect
  (ручная проверка, клавиатура/фокус/reflow) → audit (WCAG-EM на весь
  сайт) → fix (baseline-edit-verify) → diff (регрессия). Использовать при
  запросе «проверь доступность», «аудит WCAG», «почини a11y-находки»,
  «не сломал ли я доступность этим диффом». Не переписывать содержимое —
  офлайн-установка апстрима, инструменты внутри собственный MCP и CLI.
---

# web-a11y-code

Ставится как есть, апстрим не копируется в этот блок. Пять скиллов
завязаны на собственный MCP-сервер (`@accesslint/mcp`) и CLI-пакеты
(`@accesslint/cli`, `@accesslint/chrome`) — переписывать их прозой без
реальной установки бессмысленно, инструменты просто не найдутся.

## Установка

**Спросить подтверждение пользователя перед выполнением** — это меняет
конфигурацию Codex (маркетплейс + установленный плагин), не
локальная правка в проекте. Не выполнять по одному только срабатыванию
триггера из description, даже если запрос явно про доступность —
показать команды и дождаться "да":

```bash
claude plugin marketplace add AccessLint/skills
claude plugin install accesslint@accesslint
```

Ставит MCP-сервер `accesslint` (`npx @accesslint/mcp@latest`) и 5 скиллов:
`accessibility-scan`, `accessibility-inspect`, `accessibility-audit`,
`accessibility-fix`, `accessibility-diff`.

## Конвейер

```
LOCATE                       ASSESS              REMEDIATE      GUARD
scan    (авто-тир)       ┐
                          ├─► audit ────────────► fix ────────► diff
inspect (ручной тир)      ┘   (WCAG-EM зонтик)    (edit→verify)  (регрессия)
```

| Момент | Скилл | Что делает |
|---|---|---|
| Одна страница, быстро | `accessibility-scan` | движок `@accesslint/core` через CDP, worklist: селектор + `file:line` + evidence + fix/`NEEDS HUMAN` |
| Одна страница, вручную | `accessibility-inspect` | клавиатура/фокус, роли/состояния из a11y-дерева, reflow/zoom, requires браузер-MCP (`chrome-devtools`) |
| Весь сайт, методология | `accessibility-audit` | WCAG-EM: Scope→Explore→Sample→Evaluate→Report, композирует scan+inspect по сэмплу через субагентов |
| Почини найденное | `accessibility-fix` | baseline→edit→verify, никогда не выдумывает alt-текст/лейблы — либо механический фикс, либо `TODO` с rule ID |
| Регрессия при изменениях | `accessibility-diff` | stash-based или `--branch`, "N new · M fixed · K pre-existing" |

## Ключевая механика: не бинарный гейт

`inspect`/`audit` закрывают каждый WCAG-критерий одним из пяти исходов, не
просто да/нет:

- **● Verified** — детерминировано, с цитатой селектора и наблюдаемого
  факта.
- **◐ Flagged** — есть свидетельство, решение за человеком.
- **○ Human-required** — нужен assistive technology или живой опыт, не
  эмулируется.
- **N/A** — фича-триггер отсутствует на странице.
- **Not exercised** — фича есть, но не прогонялась; репортится как
  **undetermined**, никогда молча не читается как pass.

Правило при сомнении: брать грейд ниже. Conformance (pass/fail) назначается
только для `●`; всё остальное - undetermined, уходит на человека. Одна
провалившая критерий страница из сэмпла проваливает весь scope на этом
уровне - не усредняется.

## Когда обращаться сюда, а не в `web-a11y-design`

Этот блок про то, что реально сломано в готовом коде/DOM прямо сейчас.
`web-a11y-design` - про то, что заложить в дизайн до кода. Разные стадии,
не конкурируют: design-блок не сканирует DOM, code-блок не решает
архитектуру контента.

---

*Источник: AccessLint/skills, официальный плагин, MIT license, ставится
как есть.*

---

## Проверяемый результат (для /loop-build)

Уже готовый конвейер с ledger: scan→inspect→audit→fix→diff даёт
пятиисходный статус на каждый WCAG-критерий. Готово — когда ledger не
содержит непроверенных/неисправленных пунктов (VERIFIED-FAIL). Режим
"весь сайт" уже сам композирует через субагентов (унаследовано от
AccessLint) — свой agent-паттерн заводить не нужно, инструмент уже умеет.

