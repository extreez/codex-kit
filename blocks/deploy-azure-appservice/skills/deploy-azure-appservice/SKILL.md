---
name: deploy-azure-appservice
description: Задеплоить Python (Flask/Django/FastAPI) на Azure App Service Linux. Использовать на «Flask App Service», «Django App Service», «FastAPI App Service», «задеплой Python на Azure». Не для Container Apps, Functions, не-Python, Terraform/Bicep/IaC — тогда нужна отдельная azure-подготовка инфраструктуры, не этот блок.
---

# deploy-azure-appservice

Дословный порт `python-appservice-deploy` из microsoft/azure-skills (MIT,
Microsoft), версия 1.1.1.

Деплоит Python (Flask, Django, FastAPI, generic) на Azure App Service Linux
(P0v3, Python 3.14). Создаёт Resource Group + Plan + Web App, если их нет.

## Порядок

1. **Определить контекст** - интерактивно спросить только имя приложения,
   остальное вывести по умолчанию: Resource Group `<app>-rg`, Plan
   `<app>-plan`, регион - текущий `az`-дефолт или `eastus2`.
2. **Определить фреймворк** - совещательно, никогда не блокирует шаг.
3. **Выбрать путь** - если есть `azure.yaml` с хостом `appservice` → `azd
   deploy`; иначе - `az cli`.
4. **Создать по цепочке** Resource Group → Plan (`--is-linux`) → Web App
   (`--runtime "PYTHON:3.14"`), если их ещё нет.
5. **Настроить команду запуска**: Flask/Django - ничего не нужно, Oryx сам
   определяет; FastAPI - всегда явно `python -m uvicorn main:app --host
   0.0.0.0`; прочее - предупредить.
6. Выставить `SCM_DO_BUILD_DURING_DEPLOYMENT=true`.
7. **Задеплоить** - `azd deploy` или `az webapp deploy --type zip
   --track-status false`.
8. **Стоп.** Вывести финальное сообщение и закончить ход - без верификации.

## Жёсткие правила

- **Никакой пост-деплой проверки.** После `deploy` не запускать `az webapp log
  tail`, `curl`, `Invoke-WebRequest`, никакие health-пробы. Приложению нужно
  2-3 минуты на прогрев - тихий лог или ранний 5xx это не провал.
- **Безопасность шелла.** `--runtime` всегда `"PYTHON:3.14"` с двоеточием.
  Никогда `"PYTHON|3.14"` с пайпом - это шелл-оператор.
- **Никогда `az webapp up`** - устарела. Только команды шага 7.
- Финальные ссылки - в формате `https://...`.

## Обработка ошибок

Быстрая сверка: нет плана/приложения → повторить шаг 4; таймаут пинга
контейнера на порту 8000 → поправить команду запуска (шаг 5);
`ModuleNotFoundError` после деплоя → убедиться, что сработал шаг 6, передеплоить.

## Соседи

За пределами "код на App Service" - VNet, Key Vault, база данных, полный IaC -
другой скилл (`azure-prepare` в исходном репозитории), передать управление
туда явно, не пытаться сделать самому. Другая платформа - `deploy-vercel`/
`deploy-render`/`deploy-expo-eas`/`deploy-openship`. Общая прод-готовность -
`deployment-readiness`.

