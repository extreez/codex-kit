---
name: analytics-implementation
description: >-
  Настройка, аудит и починка трекинга аналитики: план событий, naming
  conventions, GA4/Google Tag Manager, UTM-параметры, отладка (события не
  срабатывают, дубли, DebugView/Preview Mode). Использовать по фразам
  «настрой трекинг», «GA4», «Google Analytics», «отслеживание конверсий»,
  «event tracking», «UTM-метки», «tag manager», «GTM», «план трекинга»,
  «Search Console», «рэнк-трекинг», «позиции в поиске», «GSC»,
  «как понять, что это работает», «мои события не срабатывают». Про выбор
  и интерпретацию модели атрибуции, сверку конфликтующих цифр между
  инструментами — блок `attribution`. Про то, какие метрики выбирать
  стратегически (North Star, дашборд) — блок `product-metrics`.
---

# Analytics Implementation

Скилл про техническое внедрение трекинга: что именно измерять и почему,
как называть события, как настроить GA4/GTM, как проверить, что данные
не врут.

## Принципы

1. **Трекай для решений, не ради данных** — у каждого события должно быть
   решение, которое оно информирует. Вэнити-метрики не считать.
2. **Начинай с вопроса, не с события** — что нужно узнать, какое действие
   последует за ответом, и только потом — что для этого трекать.
3. **Единый naming** — до реализации закрепить конвенцию именования,
   задокументировать.
4. **Качество данных важнее объёма** — валидировать внедрение, следить
   за дублями и мусором.

## Naming convention: Object-Action

```
signup_completed
button_clicked
form_submitted
checkout_payment_completed
```

Нижний регистр, подчёркивания, конкретика в имени (`cta_hero_clicked`,
а не `button_clicked`), контекст — в properties, не в имени события.
Полный список событий по типу бизнеса — `references/event-library.md`.

## План трекинга

Таблица: Event Name | Category | Properties | Trigger | Notes.
Типы событий: pageviews (автоматически), user actions (клики, отправки
форм), system events (регистрация, покупка), custom conversions
(достижение цели, этап воронки).

## Стандартные properties

Page (page_title, page_location, page_referrer), User (user_id, user_type,
account_id, plan_type), Campaign (source, medium, campaign, content, term),
Product (product_id, product_name, category, price). Не дублировать
автоматические свойства, не класть PII в properties.

## GA4 и Google Tag Manager

Быстрый старт GA4: создать property и data stream, поставить gtag.js или
GTM, включить enhanced measurement, настроить custom events, отметить
конверсии в Admin. Пример события:

```javascript
gtag('event', 'signup_completed', { method: 'email', plan: 'free' });
```

GTM: Tags (что выполняется) / Triggers (когда) / Variables (динамические
значения). Data layer:

```javascript
dataLayer.push({ event: 'form_submitted', form_name: 'contact', form_location: 'footer' });
```

Подробности — `references/ga4-implementation.md` и
`references/gtm-implementation.md`.

## UTM-параметры

utm_source (google, newsletter), utm_medium (cpc, email, social),
utm_campaign, utm_content (различать версии, например hero_cta),
utm_term (платный поиск). Нижний регистр, конкретно, документировать
все UTM в таблице.

## Отладка

GA4 DebugView — события в реальном времени. GTM Preview Mode — проверка
триггеров до публикации. Чек-лист: события срабатывают на нужный триггер,
properties заполняются верно, нет дублей, работает в разных браузерах,
конверсии засчитываются, PII не утекает. Частые проблемы: события не
срабатывают (проверить триггер и загрузку GTM), неверные значения
(проверить путь переменной и структуру data layer), дубли (несколько
контейнеров или двойной триггер).

## Search Console и рэнк-трекинг

Отдельная узкая SEO-аналитика — данные о запросах/позициях/индексации,
которых нет в GA4 (Google не передаёт сырые позиции через обычную
аналитику). Настройка, регулярные отчёты, связка с рэнк-трекингом —
`references/search-console-tracking.md`. Не дублирует `product-metrics`/
`attribution` — те шире (весь продукт/вся атрибуция), этот раздел только
про органический канал до клика.

## Приватность

Cookie consent обязателен в EU/UK/CA, PII не класть в аналитику,
настроить retention данных, дать пользователю возможность удаления.
Использовать consent mode (ждать согласия), анонимизацию IP, собирать
только необходимое.

## Формат вывода — Tracking Plan Document

```markdown
# [Продукт] Tracking Plan
## Overview — Tools: GA4, GTM. Last updated: [дата]
## Events — Event Name | Description | Properties | Trigger
## Custom Dimensions — Name | Scope | Parameter
## Conversions — Conversion | Event | Counting
```

## Что спросить перед внедрением

Какие инструменты используются (GA4, Mixpanel...)? Какие ключевые
действия трекать? Какие решения это данные информируют? Кто внедряет —
разработка или маркетинг? Есть требования приватности/consent? Что уже
трекается?

## Смежные блоки

`attribution` — выбор модели атрибуции и сверка цифр между инструментами
(атрибуция предполагает, что трекинг уже настроен). `product-metrics` —
что измерять стратегически (North Star, дашборд, когорты) — этот скилл
только про техническую реализацию.

---

*Router для скилла coreyhaines31/marketingskills `skills/analytics`,
портировано под формат Codex. Оригинальные технические reference-
файлы (`references/*.md`) — на английском, дословно, см. атрибуцию в
каждом файле.*

