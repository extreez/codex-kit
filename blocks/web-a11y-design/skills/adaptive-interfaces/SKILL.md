---
name: adaptive-interfaces
description: >-
  Интерфейс, подстраивающийся под пользователя: цвет никогда не единственный
  канал (colour-independence.md), гибкая типографика (flexible-typography.md),
  регулируемая плотность (information-density.md), responsive на 200% zoom
  (responsive-accessibility.md), системные `prefers-*` (user-preference-respect.md),
  упрощённые виды (simplified-views.md). Использовать при дизайне
  дашбордов, настроек, любого UI с системными предпочтениями пользователя.
---

# Adaptive Interfaces

Шесть скиллов про то, как интерфейс реагирует на условия и предпочтения,
не только про статичный вид. Открой нужный файл по формулировке запроса.

| Запрос | Файл | Что делает |
|---|---|---|
| «цвет не единственный индикатор» | `colour-independence.md` | двойное кодирование: цвет+иконка+текст, greyscale-тест |
| «гибкая типографика», «rem vs px» | `flexible-typography.md` | rem/em обязательны, line-height ≥1.5, тест на 200% масштаб |
| «плотность интерфейса», «compact/comfortable» | `information-density.md` | спектр плотности, но touch-target 44×44px не меняется никогда |
| «responsive на zoom», «reflow» | `responsive-accessibility.md` | reflow в одну колонку на 200% zoom без горизонтального скролла (WCAG 1.4.10) |
| «prefers-reduced-motion», «системные настройки» | `user-preference-respect.md` | таблица под каждый `prefers-*`/`forced-colors` media query |
| «упрощённый вид», «basic mode» | `simplified-views.md` | feature layering, не «урезанная», а сфокусированная версия |

## Общее

Все шесть про адаптацию, не про один фиксированный дизайн. Открой нужный
файл целиком, у каждого свой чеклист в конце.

## Полный аудит интерфейса, не один вопрос

Просят проверить весь экран/продукт по доступности, не один конкретный
пункт — это работа на 4 независимых блока (`accessible-content`,
`adaptive-interfaces`, `cognitive-accessibility`, `inclusive-interaction`),
каждый смотрит на свой канал и не блокирует остальные. Раздай по subagent
на блок, тем же принципом, что зоны в `sec-audit`: спроси модель и эффорт,
дождись всех, собери находки в одну таблицу без дублей (одна и та же
проблема может всплыть в двух блоках сразу — например, alt-текст
касается и `accessible-content`, и `adaptive-interfaces`).

---

*Роутер для скиллов Owl-Listener/inclusive-design-skills
(`adaptive-interfaces`), MIT license, портировано под формат Codex.*

## Проверяемый результат (для /loop-build)

Многое здесь реально скриптуемо: alt-текст на `<img>` (DOM-проверка
пустых/отсутствующих `alt`), touch-target 44×44px (вычислимые размеры),
contrast (`check_contrast.py` из `web-taste/gate-check`), один `<h1>` без
пропуска уровней (парсинг заголовков). Готово — когда автоматический
скан по применимым правилам чист. Когнитивная нагрузка и wayfinding —
не скриптуются, там вердикт verifier-subagent.

