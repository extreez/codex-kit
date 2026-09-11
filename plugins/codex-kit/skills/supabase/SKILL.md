---
name: supabase
description: Любая задача с Supabase — Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues, supabase-js/@supabase/ssr в Next.js/React/SvelteKit/Astro/Remix, RLS-сюрпризы, CLI/MCP, миграции, отладка ошибок Postgres/PostgREST. Использовать при любом упоминании Supabase.
---

# supabase

Дословный порт скилла `supabase` из supabase/agent-skills (MIT), версия 0.1.2.

## Базовые принципы

**1. Supabase меняется часто.** Не полагаться на память о версии API. Перед
реализацией сверяться с `https://supabase.com/changelog.md` (лёгкий индекс),
искать теги `breaking-change` по своей задаче.

**2. Проверять результат.** После любого фикса - тестовый запрос, подтверждающий
что он сработал. Фикс без проверки не закончен.

**3. Не зацикливаться на повторе одного и того же.** Если подход не сработал
2-3 раза - остановиться, сменить метод, проверить документацию/логи.

**4. Data API-доступ к таблице отдельно от RLS.** Новая таблица не всегда
автоматически видна через REST API (настройки Data API проекта) - при жалобе
на недоступность таблицы проверить и это, и explicit `GRANT` для
`anon`/`authenticated`. Публичный доступ без RLS не давать никогда.

**5. RLS в экспонируемых схемах - обязательна.** Схема `public` экспонируется
по умолчанию. Не ставить всем таблицам один и тот же паттерн `auth.uid()` -
политика должна отражать реальную модель доступа.

## Чек-лист безопасности (проверять при любой задаче на auth/RLS/views/storage)

- **Никогда не использовать `user_metadata` в решениях авторизации.**
  `raw_user_meta_data` редактируется пользователем и попадает в `auth.jwt()` -
  небезопасно для RLS. Хранить решения авторизации в `raw_app_meta_data`/
  `app_metadata`.
- **Удаление пользователя не инвалидирует его токены.** Сначала разлогинить/
  отозвать сессии, короткий TTL JWT для чувствительных приложений.
- **Никогда не светить `service_role`/секретный ключ на фронте.** Publishable
  key для клиентского кода. В Next.js любой `NEXT_PUBLIC_` уходит в браузер.
- **Views обходят RLS по умолчанию.** Postgres 15+ -
  `CREATE VIEW ... WITH (security_invoker = true)`. Раньше - отзывать доступ
  у `anon`/`authenticated` или прятать view в неэкспонируемую схему.
- **UPDATE требует SELECT-политику.** Без неё UPDATE тихо возвращает 0 строк,
  без ошибки.
- **`auth.role()` устарел** - использовать `TO authenticated`/`TO anon` в
  политике напрямую. `auth.role() = 'authenticated'` ломается тихо при
  включённых анонимных входах (у анонимов тоже роль `authenticated`).
- **`TO authenticated` без предиката - это аутентификация без авторизации**
  (BOLA/IDOR). Всегда сочетать с ownership-условием:
  ```sql
  create policy "example" on table_name for select
  to authenticated using ( (select auth.uid()) = user_id );
  ```
- **UPDATE-политике нужны и `USING`, и `WITH CHECK`** - без `WITH CHECK`
  пользователь может переписать `user_id` на чужой.
- **`SECURITY DEFINER` обходит RLS.** Никогда не добавлять его для устранения
  ошибки доступа - это тихо снимает контроль. Предпочитать `SECURITY INVOKER`.
- **`SECURITY DEFINER` в `public` вызываем кем угодно** - Postgres даёт
  `EXECUTE` роли `PUBLIC` по умолчанию для новых функций. Если нужен -
  держать в неэкспонируемой схеме, всегда с явной проверкой `auth.uid()`
  внутри, прогнать `supabase db advisors` после изменений.
- **Storage upsert требует INSERT + SELECT + UPDATE.** Только INSERT
  разрешает загрузку, но замена файла тихо не сработает.
- **Пиновать версии пакетов и коммитить lockfile** для `supabase-js`,
  `@supabase/ssr`, `supabase-py`.

## Supabase CLI

Всегда узнавать команды через `--help`, не угадывать - структура CLI меняется
между версиями. `supabase db query` требует CLI v2.79.0+ (иначе MCP
`execute_sql` или `psql`). `supabase db advisors` требует v2.81.3+ (иначе MCP
`get_advisors`). В imperative-проектах - новый файл миграции только через
`supabase migration new <name>`, никогда не выдумывать имя файла руками.

## Supabase MCP Server

Настройка - `https://supabase.com/docs/guides/getting-started/mcp`.
Диагностика подключения по порядку: доступность сервера (`curl -so /dev/null
-w "%{http_code}" https://mcp.supabase.com/mcp`, 401 - сервер жив), корректный
`.mcp.json`, OAuth 2.1 авторизация в браузере.

## Изменение схемы

**Вариант A - declarative** (есть `supabase/schemas/` или `schema_paths` в
`config.toml`): править состояние в этих файлах, генерировать и просматривать
миграцию. Не начинать с ручной миграции.

**Вариант B - imperative**: менять схему через `execute_sql` (MCP) или
`supabase db query` (CLI) - без записи в историю миграций, можно итерировать
свободно. **Не использовать `apply_migration` для локальной итерации** - он
пишет запись истории на каждый вызов, `supabase db diff`/`db pull` дадут
пустой или конфликтующий дифф.

Перед коммитом миграции: `supabase db advisors`, сверка с чек-листом
безопасности выше, `supabase db pull <name> --local --yes`, проверка
`supabase migration list --local`.

## Отладка

При любой ошибке Supabase (REST API, Postgres, PostgREST, неожиданный RLS-блок,
Auth/Realtime/Edge Functions/Storage) - **обязательно** сначала прочитать
`https://supabase.com/docs/monitoring-and-debugging.md`, не диагностировать по
памяти.

## Соседи

Общие правила самого Postgres (индексы, connection pooling, схема, локи) -
`db-postgres-best-practices` (`needs`), не переизобретены здесь заново.

