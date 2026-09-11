---
name: cognitive-accessibility
description: >-
  Когнитивная нагрузка: оценка нагрузки (cognitive-load-assessment.md),
  простой язык (plain-language-design.md), навигация без потери
  ориентации (wayfinding-navigation.md), предотвращение и восстановление
  после ошибок (error-prevention-recovery.md), фокус и внимание
  (focus-attention-design.md), нагрузка на память (memory-load-reduction.md),
  контекстная помощь (contextual-help-design.md). Использовать при
  дизайне многошаговых флоу, сложных форм, дашбордов.
---

# Cognitive Accessibility

Семь скиллов про когнитивную нагрузку — открой нужный файл по
формулировке запроса.

| Запрос | Файл | Что делает |
|---|---|---|
| «оцени когнитивную нагрузку» | `cognitive-load-assessment.md` | intrinsic/extraneous/germane, таблица порогов по 6 измерениям |
| «упрости текст», «жаргон» | `plain-language-design.md` | таблица замен, grade 4-6 для кнопок/ошибок |
| «пользователи теряются в навигации» | `wayfinding-navigation.md` | «Where am I / Where can I go / How do I get back» за 1 секунду |
| «обработка ошибок», «прощающий дизайн» | `error-prevention-recovery.md` | что случилось+почему+что делать, никогда не выдумывать формат |
| «слишком много отвлекающего» | `focus-attention-design.md` | анти-паттерны: таймеры, «Only 2 left!», autoplay |
| «многошаговый флоу», «пользователь забыл» | `memory-load-reduction.md` | рабочая память держит ~4 предмета, persistent context, forward carry |
| «помощь», «tooltip», «onboarding» | `contextual-help-design.md` | помощь без ухода с экрана, эскалация без переспрашивания |

## Известный баг источника

В апстриме файл `adaptive-personalisation.md` на деле дословный дубликат
`contextual-help-design.md` (даже `name:` во frontmatter не поменяли) - не
переносился как отдельная тема, реального контента персонализации там нет.

## Общее

Открой нужный файл целиком, у каждого свой чеклист/вопросы для оценки в
конце.

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
(`cognitive-accessibility`), MIT license, портировано под формат Claude
Code.*

## Проверяемый результат (для /loop-build)

Многое здесь реально скриптуемо: alt-текст на `<img>` (DOM-проверка
пустых/отсутствующих `alt`), touch-target 44×44px (вычислимые размеры),
contrast (`check_contrast.py` из `web-taste/gate-check`), один `<h1>` без
пропуска уровней (парсинг заголовков). Готово — когда автоматический
скан по применимым правилам чист. Когнитивная нагрузка и wayfinding —
не скриптуются, там вердикт verifier-subagent.

