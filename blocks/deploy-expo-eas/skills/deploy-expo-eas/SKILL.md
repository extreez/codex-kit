---
name: deploy-expo-eas
description: Задеплоить Expo-приложение в App Store/Google Play/TestFlight через EAS. Использовать на «eas build», «eas submit», «TestFlight», «бампни версию сборки», «настрой store listing». Для веб-хостинга/API-роутов Expo — другой скилл (eas-hosting в исходном репозитории), не этот.
---

# deploy-expo-eas

Дословный порт `eas-app-stores` из expo/skills (MIT), версия 1.0.0. На
skills.sh страница называется "expo-deployment" - в актуальной версии
репозитория expo/skills скилл переименован в `eas-app-stores`, содержимое
референс-файлов совпадает дословно.

> **EAS - платный сервис.** `eas build` и `eas submit` тратят билд-минуты
> тарифа, публикация в сторы требует платных аккаунтов Apple Developer и
> Google Play. Свериться с https://expo.dev/pricing перед облачными командами.

## Быстрый старт

```bash
npm install -g eas-cli
eas login
npx eas-cli@latest init   # создаёт eas.json с build-профилями
```

## Сборка и отправка

```bash
npx eas-cli@latest build -p ios --profile production
npx eas-cli@latest build -p android --profile production
npx eas-cli@latest build --profile production           # обе платформы

# Сборка + отправка одной командой
npx eas-cli@latest build -p ios --profile production --submit
npx testflight                                            # шорткат для iOS TestFlight
```

## eas.json под прод

```json
{
  "cli": { "version": ">= 16.0.1", "appVersionSource": "remote" },
  "build": {
    "production": { "autoIncrement": true, "ios": { "resourceClass": "m-medium" } },
    "development": { "developmentClient": true, "distribution": "internal" }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "your@email.com", "ascAppId": "1234567890" },
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "internal" }
    }
  }
}
```

## Платформенные детали

**iOS**: `npx testflight` для быстрой отправки в TestFlight, credentials -
через `eas credentials`.

**Android**: сервис-аккаунт Google Play Console, треки идут по цепочке
internal → closed → open → production.

Версии управляются автоматически при `appVersionSource: "remote"`:
`eas build:version:get`, `eas build:version:set -p ios --build-number 42`.

## Мониторинг

```bash
eas build:list
eas build:view
eas submit:list
```

## Автоматизация

EAS Workflows автоматизируют пайплайн build → submit → update для CI/CD -
отдельный скилл под YAML воркфлоу (`eas-workflows` в исходном репозитории),
если понадобится валидация схемы.

## Соседи

Веб-хостинг и API routes Expo (`npx expo export -p web` + `eas deploy`) - не
этот блок, отдельная зона (`eas-hosting`). Другая мобильная/веб-платформа -
`deploy-vercel`/`deploy-render`/`deploy-azure-appservice`/`deploy-openship`.
Общая прод-готовность - `deployment-readiness`.

