---
name: delivery-comms
description: >-
  2 формата коммуникации вокруг поставки: release notes (техническое →
  пользовательский язык), саммари встречи (транскрипт → решения и action
  items). Для карты стейкхолдеров — см. блок cross-functional-alignment.
  Использовать при запросе «напиши release notes», «суммаризируй эту
  встречу».
---

# Коммуникация вокруг поставки

2 шаблона из `pm-skills` (phuryn) — разные аудитории одной поставки:
пользователи (release notes), команда (саммари встречи). Файлы в
`templates/` дословно на английском, атрибуция в начале каждого.

## Какой шаблон когда

| Запрос пользователя | Файл | Аудитория |
|---|---|---|
| «напиши release notes» | `templates/release-notes.md` | Пользователи продукта — тикеты/PRD/changelog → фичи/улучшения/фиксы/breaking changes на языке пользы, не механики |
| «суммаризируй эту встречу» | `templates/summarize-meeting.md` | Команда, включая отсутствовавших — транскрипт → решения, action items с владельцем, открытые вопросы |

## Как выбирать

`summarize-meeting` по ходу проекта (после каждой значимой встречи),
`release-notes` на выходе (что доехало до пользователя).

`release-notes` — правило «lead with outcome, not mechanics»:
«дашборды грузятся в 3 раза быстрее», не «добавили Redis-кэш». Не
копировать формулировки из тикетов дословно, переформулировать под
пользу.

**Карта стейкхолдеров сюда не входит** — в источнике был дубль:
`pm-execution/stakeholder-map` (power/interest grid) почти совпадал с
`stakeholder-comms/stakeholder-map` (ux-pgm-skills, добавляет
stance/currency). Вместо двух текстов собран один синтез — см.
`cross-functional-alignment/stakeholder-comms/templates/stakeholder-map.md`.

---

*Источник: phuryn/pm-skills, `pm-execution/skills/{release-notes,
summarize-meeting}`, MIT. Роутер собран заново на русском; файлы
`templates/*.md` — дословно на английском, атрибуция в начале каждого
файла.*

