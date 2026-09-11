# {{PROJECT_NAME}}

Тип: прод-готовность.

Платформа хостинга — не в этом стеке, ставится отдельно по факту проекта:
`/kit add deploy-vercel` / `deploy-render` / `deploy-azure-appservice` /
`deploy-expo-eas` / `deploy-openship` / `deploy-kubernetes`. Работает на любой
из них поверх `deployment-readiness` (rollout-стратегии, Docker, CI/CD, health
checks, rollback, чек-лист прод-готовности).

БД: `db-postgres-best-practices` работает без привязки к платформе. Проект на
Supabase — сверху `/kit add supabase` (он сам тянет постгрес-блок через `needs`).

Живой прод-инцидент (авария, деградация) — `prod-incident-response`. Долг
кода/тестов/доки — `tech-debt-tracker`.

