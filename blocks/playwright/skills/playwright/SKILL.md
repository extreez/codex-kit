---
name: playwright
description: >-
  Полноценные браузерные автотесты (регрессия, e2e, CI) через Playwright
  Test — тонкая обёртка, ставится как официальный апстрим-инструмент.
  Использовать при запросе "напиши e2e-тесты", "настрой CI на браузерные
  тесты", "покрой флоу автотестом". Для разовой проверки фичи в браузере
  во время разработки — блок `webapp-testing`.
---

# Playwright (официальный тест-раннер)

Не порт контента — Playwright Test сам по себе полноценный инструмент с
собственной документацией. Этот скилл — тонкая обёртка: как поставить и
с чего начать в проекте.

## Установка

```bash
npm init playwright@latest
```

Ставит `@playwright/test`, конфиг (`playwright.config.ts`), примеры
тестов и браузерные бинарники (`npx playwright install`).

Для Python-проектов:

```bash
pip install pytest-playwright
playwright install
```

## Структура теста (TypeScript/JS)

```ts
import { test, expect } from '@playwright/test';

test('пример флоу', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByText('Добро пожаловать')).toBeVisible();
});
```

## Запуск

```bash
npx playwright test              # весь набор
npx playwright test --ui         # интерактивный UI-режим
npx playwright test --debug      # пошаговая отладка
npx playwright show-report       # HTML-отчёт последнего прогона
```

## В CI

`npx playwright install --with-deps` перед прогоном — ставит системные
зависимости браузеров, которых нет в чистом CI-образе.

## Когда не сюда

- Разовая проверка "работает ли фича в браузере прямо сейчас", без
  сохранения теста → `webapp-testing`.
- Юнит-тесты без браузера → стандартный раннер проекта (jest/vitest/pytest),
  не Playwright.

Дальше — официальная документация: https://playwright.dev/docs/intro

