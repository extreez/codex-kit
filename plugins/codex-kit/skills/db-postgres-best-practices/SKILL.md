---
name: db-postgres-best-practices
description: Правила Postgres для любого проекта, не только Supabase — индексы, connection pooling, RLS, схема, локи, паттерны доступа к данным, мониторинг. Загружать ПЕРЕД любой правкой таблиц/колонок/миграций/RLS-политик/индексов/триггеров/pgvector, а не только при жалобе на производительность. Применимо и к проектам без Supabase.
---

# db-postgres-best-practices

Порт роутера `supabase-postgres-best-practices` (supabase/agent-skills, MIT,
v1.1.1) - применим к Postgres где угодно, не только внутри Supabase, поэтому
здесь отдельный блок, а не часть `supabase`.

## Когда применять

При написании SQL-запросов, проектировании схемы, работе с индексами,
настройке connection pooling, любой правке RLS-политик, диагностике
производительности - даже на одну колонку или один запрос.

## Категории правил по приоритету

| Приоритет | Категория | Влияние | Префикс |
|---|---|---|---|
| 1 | Query Performance | CRITICAL | `query-` |
| 2 | Connection Management | CRITICAL | `conn-` |
| 3 | Security & RLS | CRITICAL | `security-` |
| 4 | Schema Design | HIGH | `schema-` |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 6 | Data Access Patterns | MEDIUM | `data-` |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
| 8 | Advanced Features | LOW | `advanced-` |

## Что покрывает каждая категория

**Query (CRITICAL)** - недостающие индексы, композитные/частичные/покрывающие
индексы, выбор типа индекса под тип запроса.

**Connection (CRITICAL)** - pooling, лимиты соединений, idle timeout,
подготовленные запросы.

**Security & RLS (CRITICAL)** - основы RLS, производительность RLS-политик
(предикат в политике выполняется на каждую строку - дорогие вызовы функций в
`USING`/`WITH CHECK` умножаются на N строк), привилегии ролей.

**Schema (HIGH)** - первичные ключи, индексы на внешних ключах (Postgres не
создаёт их автоматически, в отличие от индекса на PK), типы данных,
constraints, партиционирование, регистр идентификаторов (lowercase - иначе
приходится everywhere ставить кавычки).

**Concurrency & Locking (MEDIUM-HIGH)** - advisory locks, предотвращение
deadlock, короткие транзакции, `SKIP LOCKED` для очередей.

**Data Access (MEDIUM)** - N+1 запросы, пагинация, batch insert, upsert.

**Monitoring (LOW-MEDIUM)** - `EXPLAIN ANALYZE`, `pg_stat_statements`,
`VACUUM`/`ANALYZE`.

**Advanced (LOW)** - full-text search, индексация JSONB.

## Как применять на практике

Для каждой находки: неправильный SQL и почему он плохой → правильный SQL →
разбор через `EXPLAIN` при возможности → метрика эффекта, если применимо.
Полный набор конкретных примеров (33 файла в источнике, по несколько на
категорию) не переносился построчно в этот блок - за деталями конкретного
правила смотреть `references/<категория>-<правило>.md` в
supabase/agent-skills (открытый репозиторий, MIT), здесь зафиксирован
приоритетный фреймворк и что именно проверять.

## Соседи

Специфика самого Supabase (CLI, MCP, RLS-security-checklist для
`user_metadata`/`SECURITY DEFINER`, workflow миграций declarative/imperative) -
блок `supabase`, который на этот блок ссылается (`needs`). Платформа хостинга
БД - `deploy-render` (managed Postgres) или любая другая, не влияет на эти
правила.

