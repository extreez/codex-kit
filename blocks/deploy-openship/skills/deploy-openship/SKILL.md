---
name: deploy-openship
description: Задеплоить проект через self-hosted Openship (open-source альтернатива Vercel/Heroku). Использовать на «подними свой Openship», «self-hosted деплой», «не хочу зависеть от Vercel/Heroku», «openship up». Не для облачных SaaS-платформ — deploy-vercel/deploy-render/deploy-azure-appservice/deploy-expo-eas.
---

# deploy-openship

Синтез по README github.com/oblien/openship (Apache 2.0).

Openship - open-source, self-hostable платформа деплоя со встроенным CI/CD:
указываешь на репозиторий, она сама собирает, разворачивает, роутит трафик и
терминирует TLS. Управляется из десктоп-приложения, веб-дашборда или CLI.

## Первое решение - как запускать сам control plane

| Ситуация | Запускать как | Где живут приложения |
|---|---|---|
| Один человек, без DevOps | Десктоп-приложение | сервер по SSH или Openship Cloud |
| Команда, нужен push-to-deploy или хостинг на своей машине | Self-hosted сервер (`openship up`) | на этой же машине (Compose-режим) или наружу |
| Не хочется ничего поднимать самому | Openship Cloud | управляемые песочницы |

Десктоп-приложение работает только пока открыто, ничего не остаётся висеть на
всегда включённом сервере, ничего не торчит наружу. Always-on сервер нужен
только под push-to-deploy (CI/CD), доступ команды или хостинг приложений на
этой же машине.

## Установка always-on сервера

```bash
curl -fsSL https://get.openship.io | sh     # или: npm i -g openship (Node 22+)
openship                                     # мастер настройки, затем панель управления
```

Для CI/безголовых машин - без мастера, сразу:

```bash
openship up
openship up --public-url https://openship.example.com   # + домен с автоматическим TLS
```

`openship up` сам выбирает режим:

- **Linux + Docker → Compose-режим** (по умолчанию). Поднимает весь стек -
  Postgres, Redis, API, дашборд, контейнеризованный OpenResty edge на
  :80/:443. Этот режим хостит задеплоенные приложения на той же машине, с
  автоматическими доменами и Let's Encrypt TLS. Форсируется флагом `--compose`.
- **Остальное (macOS, Windows, Linux без Docker) → bare-режим.** Один лёгкий
  процесс со встроенной БД - control plane деплоит наружу (SSH или Cloud), как
  десктоп-приложение, но всегда включён и требует логина. Форсируется
  `--bare`.

Self-hosted инстанс всегда требует логина (админ создаётся при настройке).

## Методология деплоя одного приложения

1. Detect - Openship сам определяет фреймворк и стек по репозиторию.
2. Build - собирает неизменяемый (immutable) образ.
3. Provision - разворачивает managed-сервисы, которые нужны приложению.
4. Route/TLS - настраивает домен и SSL.
5. Push-to-deploy - дальнейшие пуши деплоятся сами, без ручных YAML-пайплайнов.

## Соседи

Облачная SaaS-платформа вместо self-hosted - `deploy-vercel`/`deploy-render`/
`deploy-azure-appservice`/`deploy-expo-eas`. Общая прод-готовность -
`deployment-readiness`.

