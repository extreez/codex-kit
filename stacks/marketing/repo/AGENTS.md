# {{PROJECT_NAME}}

## Маркетинг

- Перед копирайтингом/контентом/соцсетями прогони `positioning` (скилл
  `product-marketing-context`) — остальные 10 блоков читают
  `.agents/product-marketing.md` первым шагом, чтобы не переспрашивать
  аудиторию/конкурентов/голос бренда заново в каждом скилле.
- Не публикуй/не отправляй ничего от имени пользователя без явного
  подтверждения — особенно `social-media/linkedin` (политика
  no-auto-send) и `email-outbound/cold-email` (human review gate перед
  отправкой).
- Любое маркетинговое изменение — гипотеза, не факт, пока не измерен
  результат после публикации: закрывай цикл через `metrics/
  analytics-readback` (promote/rollback), не считай playbook доказанным
  по интуиции.
- SEO/GEO (позиции в поиске, цитируемость в AI-ответах) — отдельный
  стек `seo`, не дублируется здесь. Пересечения (например атрибуция
  AI-трафика) — см. `CONFLICTS.md` каталога.
- Отчёты/брифы — в `docs/marketing/`.

### Как работает стек marketing

- `positioning` — контекст продукт-маркетинга, позиционирование по
  April Dunford, боевые карточки, GTM-запуск (ORB+SLC).
- `copywriting` — продающий текст и редактура (Seven Sweeps + AI-детект).
- `content-strategy` — Searchable/Shareable планирование, конвейер
  статьи, governance-цикл, панель экспертной оценки.
- `brand-voice` — голос бренда, ревью на соответствие.
- `social-media` — SMM-стратегия, LinkedIn, X/Twitter, упаковка YouTube.
- `email-outbound` — email-цепочки, холодный email, SMS.
- `paid-ads` — Meta/Google/LinkedIn/ABM плейбуки, креативы.
- `cro-funnel` — диагностика воронки (регистрация→онбординг→paywall→
  попап→страница→форма) единым шаблоном.
- `retention-growth` — churn, рефералы, community, лид-магниты.
- `pr-launch` — PR, события, co-marketing, инфлюенсеры, листинги.
- `aso` — App Store Optimization (только для проектов с мобильным
  приложением).

### Автоматика

- `cro-funnel-loop` — цикл диагностика→фикс→перепроверка до нуля
  находок Priority=High (needs `cro-funnel`).
- `content-loop` — цикл продвижения по стадиям content-governance,
  обязательный readback после публикации (needs `content-strategy`,
  трекер `docs/marketing/content-pipeline.md`).
- `paid-ads-loop` — цикл тест→readback→promote/rollback для рекламы
  (needs `paid-ads`, трекер `docs/marketing/paid-ads-tests.md`).
- `marketing-audit` — `/marketing-audit`, 4 параллельных субагента
  (фундамент/контент/каналы/реклама-CRO) → взвешенный composite score,
  снимок состояния без фикса, по образцу `geo-optimize`.

Три `-loop`-блока и `marketing-audit` пишут решения в общий
`docs/marketing/readback-log.md` — один лог на весь стек, не заводить
отдельный на каждый блок.

Зависимости: `positioning/product-marketing-context` ставится первым
у любого нового проекта — остальные блоки на него ссылаются, но не
требуют жёстко (`suggests`, не `needs`), работают и без него, просто
переспрашивают контекст каждый раз. Подробности пересечений/
конфликтов (например `growth-engine` как альтернатива `ab-testing`) —
`CONFLICTS.md` каталога, раздел «Стек marketing».

Видео-производство (монтаж/съёмка/транскрибация) сознательно не входит
в этот стек — см. `NOTES.md` каталога, будущий отдельный блок.

