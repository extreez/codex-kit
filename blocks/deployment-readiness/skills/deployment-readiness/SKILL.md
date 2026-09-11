---
name: deployment-readiness
description: Платформо-независимая прод-готовность — стратегии rollout, Docker, CI/CD, health checks, rollback, чек-лист перед релизом. Использовать на «готовы к проду?», «настрой CI/CD», «докеризуй приложение», «rollback plan», «health check endpoint». Стоит НАД платформенными блоками deploy-* — вызывать вместе с ними, не вместо.
---

# deployment-readiness

Синтез: `deployment-patterns` из affaan-m/ecc (MIT) как основа + структура
формального rollout-плана из `devops-rollout-plan` (github/awesome-copilot,
MIT) для случаев, когда одного чек-листа мало.

## Стратегии деплоя

**Rolling** (по умолчанию) - инстансы обновляются по очереди, старая и новая
версия работают одновременно во время раскатки. Требует обратной
совместимости изменений. Нулевой даунтайм.

**Blue-Green** - два идентичных окружения, переключение трафика атомарно.
Мгновенный откат (переключить обратно на blue), нужна 2x инфраструктура на
время деплоя. Для критичных сервисов с нулевой терпимостью к сбоям.

**Canary** - сначала небольшой процент трафика на новую версию, дальше
постепенно увеличивать при хороших метриках. Ловит проблемы на реальном
трафике до полного релиза. Нужна инфраструктура сплита трафика.

## Docker

Multi-stage сборка, non-root пользователь, `.dockerignore`, HEALTHCHECK,
пиновать версии базовых образов (`node:22-alpine`, не `:latest`).

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --production

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

Хорошо: конкретные версии тегов, non-root, слои с зависимостями отдельно от
кода (кэш), HEALTHCHECK. Плохо: root, `:latest`, весь репозиторий одним `COPY`,
dev-зависимости в проде, секреты внутри образа.

## CI/CD

```
PR:          lint → typecheck → unit → integration → preview deploy
main merge:  lint → typecheck → unit → integration → build image →
             deploy staging → smoke tests → deploy production
```

Секреты пайплайна - через переменные окружения CI, не в файле пайплайна (тот
же принцип, что в `sec-policy`, если стек `secure` подключён).

## Health checks

```typescript
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/health/detailed", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
  };
  const ok = Object.values(checks).every(c => c.status === "ok");
  res.status(ok ? 200 : 503).json({ status: ok ? "ok" : "degraded", checks });
});
```

Kubernetes-пробы (если платформа - `deploy-kubernetes`): `livenessProbe`,
`readinessProbe`, `startupProbe` с `failureThreshold` под ожидаемое время
старта.

## Конфигурация окружения

Twelve-factor: весь конфиг через переменные окружения, ничего в коде.
Валидировать при старте, падать быстро при неверном конфиге:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});
export const env = envSchema.parse(process.env);
```

## Откат

```bash
kubectl rollout undo deployment/app       # k8s
vercel rollback                            # Vercel
railway up --commit <previous-sha>         # Railway
npx prisma migrate resolve --rolled-back <name>   # откат миграции, если обратима
```

Чек-лист готовности к откату: предыдущий образ доступен и помечен тегом,
миграции БД обратно совместимы (без деструктивных изменений), фича-флаги могут
выключить новую функциональность без деплоя, откат протестирован на стейджинге
до продакшена.

## Чек-лист прод-готовности перед релизом

**Приложение**: все тесты зелёные, нет секретов в коде/конфигах, обработка
ошибок покрывает крайние случаи, структурные логи без PII, health-эндпоинт
осмысленный.

**Инфраструктура**: образ собирается воспроизводимо (пиновые версии),
переменные окружения задокументированы и валидируются при старте, лимиты
ресурсов заданы, горизонтальное масштабирование настроено, TLS включён везде.

**Мониторинг**: экспортируются метрики (rate/latency/errors), алерты на
превышение error rate, логи агрегируются и ищутся, uptime-мониторинг
health-эндпоинта.

**Безопасность**: зависимости просканированы на CVE, CORS ограничен нужными
источниками, rate limiting на публичных эндпоинтах, security-заголовки
(CSP/HSTS/X-Frame-Options).

**Операции**: план отката задокументирован и протестирован, миграция БД
проверена на данных прод-объёма, есть раннбук для типовых сбоев, дежурство и
эскалация определены.

## Формальный rollout-план (для рискованных/регулируемых релизов)

Когда чек-листа выше мало - большой блaст-радиус, требуется согласование,
регуляторные требования - собрать документ по структуре: executive summary
(что/зачем/когда/риск/время отката) → preflight-чеки (go/no-go) → пошаговая
процедура по фазам (pre-deployment/deployment/progressive verification) →
сигналы верификации по времени (0-2 мин / 2-5 мин / 5-15 мин / 15+ мин) →
процедура отката с критериями принятия решения → план коммуникации по
стейкхолдерам (кто/когда/как) → пост-деплой задачи (1ч/24ч/неделя) →
контингент-сценарии (частичный отказ, деградация, рассинхрон данных).

Никогда не деплоить в пятницу вечером без крайней необходимости. Никогда не
пропускать шаг верификации. Никогда не считать "должно сработать" достаточным
основанием.

## Соседи

Платформенная специфика конкретного хостинга - `deploy-vercel`/`deploy-render`/
`deploy-azure-appservice`/`deploy-expo-eas`/`deploy-openship`/`deploy-kubernetes`,
этот блок работает НАД ними, не вместо. Живой инцидент в проде -
`prod-incident-response`. CI/CD-гейты и ADR того же уровня - `dev-ops`, не
дублируются здесь заново.

