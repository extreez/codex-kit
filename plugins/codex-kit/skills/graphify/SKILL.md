---
name: graphify
description: Разовый статический граф проекта (HTML-визуализация, MD-отчёт, JSON) через команду /graphify. Использовать, когда нужен один экспорт для просмотра человеком, не живой источник данных для агента на каждый запрос.
---

# graphify

Ставится как есть — готовый CLI (PyPI-пакет `graphifyy`, команда `graphify`).
Источник: https://github.com/Graphify-Labs/graphify

## Шаг 0. Есть — используй, нет — поставь сам

Хук блока при старте сессии скажет, стоит ли `graphify` на машине. Не стоит —
поставь сам:

```bash
uv tool install graphifyy   # предпочтительно
# или: pipx install graphifyy
# или: pip install graphifyy
graphify install            # регистрирует /graphify в Codex
```

Ставится один раз на машину. `graphify install` сам пишет skill-файл и
`PreToolUse`-хук, чтобы `/graphify` появилась в чате — вручную ничего не
прописывать.

## Использование

```
/graphify .
```

Выход: `graphify-out/graph.html` (визуализация), `GRAPH_REPORT.md` (отчёт),
`graph.json` (для программных запросов).

## Прежде чем ставить

По сравнению задачи «карта кода» (`library/codebase-map/README.md`) —
статический экспорт файлами, не живой MCP: агент не может опросить его
точечно на каждый шаг, только открыть готовый отчёт. Для того, что нужно
`repowise` (запрос от агента посреди работы), не подходит. Годится для
разового человекочитаемого снимка структуры.

## Конфликт

Одна задача с `repowise`, `socraticode`, `codegraph`, `understand-anything` —
группа зафиксирована в `CONFLICTS.md`.

