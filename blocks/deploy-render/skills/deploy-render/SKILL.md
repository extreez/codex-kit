---
name: deploy-render
description: Задеплоить проект на Render через Blueprint (render.yaml). Использовать на «задеплой на Render», «render.yaml», «настрой managed Postgres на Render», «крон/воркер на Render». Не для другого хостинга - deploy-vercel/deploy-azure-appservice/deploy-expo-eas/deploy-openship.
---

# deploy-render

Синтез с нуля по официальной документации render.com - готового Codex
скилла под Render на момент сборки блока не существовало.

## Модель Render - Blueprint, не одна услуга

Render не деплоит "один сервис на один репозиторий" как git-first платформы -
он берёт **один файл `render.yaml`**, который декларативно описывает всю
инфраструктуру проекта сразу: несколько сервисов, БД, переменные окружения,
превью-окружения. Каждый коммит синхронизирует состояние из файла.

## Типы сервисов в render.yaml

| Тип | Что это |
|---|---|
| `web` | веб-сервис или статика, слушает HTTP |
| `pserv` | приватный сервис, недоступен снаружи |
| `worker` | фоновый процесс без HTTP |
| `cron` | задача по расписанию |
| `databases` | managed Postgres, отдельная секция файла |
| Key Value | managed Redis-совместимое хранилище |

Плюс `envVarGroups` - переменные окружения, общие для нескольких сервисов, и
превью-окружения на ветки/PR (как у git-first платформ).

## Минимальный render.yaml

```yaml
databases:
  - name: app-db
    plan: starter

services:
  - type: web
    name: app-web
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: app-db
          property: connectionString
```

## Порядок деплоя

1. Написать/обновить `render.yaml` в корне репозитория.
2. Закоммитить и запушить - Render синхронизирует Blueprint при каждом пуше в
   привязанную ветку.
3. Проверить статус синка в дашборде (Render CLI тоже умеет `render deploys
   list` для последнего статуса).
4. `databases` создаются один раз при первом синке Blueprint - последующие
   правки схемы БД идут через миграции приложения, не через повторное
   объявление в `render.yaml`.

## Отличие от Vercel/git-first PaaS

Vercel/Netlify - фронт/edge-first, конфиг на уровне маршрутов одного сервиса.
Render - традиционный PaaS: постоянно работающие процессы (в отличие от
serverless-функций), managed Postgres как равноправный ресурс внутри того же
файла, что и сервисы. Проекту с бэкендом и БД, которому не нужна edge-модель,
Render часто ближе, чем Vercel.

## Соседи

Другая платформа - `deploy-vercel`/`deploy-azure-appservice`/`deploy-expo-eas`/
`deploy-openship`. Чек-лист общей прод-готовности (health checks, rollback) -
`deployment-readiness`. Правила самого Postgres (индексы, RLS, connection
pooling) - `db-postgres-best-practices`, не переизобретаются здесь.

