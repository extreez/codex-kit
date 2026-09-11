---
name: discovery-cycle
description: >-
  Цикл continuous discovery в трёх шагах, каждый в варианте «для
  существующего продукта» и «для нового продукта»: генерация идей
  (PM/дизайнер/инженер), маппинг рискованных допущений (Value/Usability/
  Viability/Feasibility или 8 категорий для стартапа), дизайн дешёвых
  экспериментов (A/B, спайк, прототип, лендинг, pretotype). Использовать
  при запросе «накидай идеи фич», «какие тут риски/допущения», «придумай
  дешёвый эксперимент проверить эту идею», «сделай pretotype».
---

# Цикл продуктового discovery

6 шаблонов из `pm-skills` (phuryn) — три шага одного цикла (идея →
допущение → эксперимент), каждый в двух вариантах: продукт уже
существует или это новая идея с нуля. Файлы в `templates/` дословно на
английском, атрибуция в начале каждого.

## Какой шаблон когда

| Шаг | Существующий продукт | Новый продукт/стартап |
|---|---|---|
| Генерация идей | `templates/brainstorm-ideas-existing.md` | `templates/brainstorm-ideas-new.md` |
| Маппинг допущений | `templates/identify-assumptions-existing.md` (Value/Usability/Viability/Feasibility) | `templates/identify-assumptions-new.md` (8 категорий, включая Go-to-Market и команду) |
| Дизайн экспериментов | `templates/brainstorm-experiments-existing.md` (A/B, спайк, прототип) | `templates/brainstorm-experiments-new.md` (pretotype: лендинг, explainer-видео, pre-order — Alberto Savoia) |

## Как выбирать

Сначала спросить (если не очевидно из контекста), продукт уже
существует или это идея с нуля — от этого зависит, какой из пары
файлов брать. Не смешивать существующий и новый вариант в одном
запросе.

Порядок шагов имеет значение: идея → допущения → эксперимент. Не
пропускать маппинг допущений и сразу предлагать эксперимент — без
явного списка допущений эксперимент не будет знать, что именно
проверяет.

Все три шага используют multi-perspective подход (PM/дизайнер/
инженер или devil's advocate) — не давать один ответ от одного лица,
явно проговаривать минимум две точки зрения.

После допущений — приоритизация, какое проверять первым: см.
`backlog-triage/prioritize-assumptions` в этом же блоке.

---

*Источник: phuryn/pm-skills, `pm-product-discovery/skills/{brainstorm-
ideas-existing,brainstorm-ideas-new,identify-assumptions-existing,
identify-assumptions-new,brainstorm-experiments-existing,
brainstorm-experiments-new}`, MIT. Роутер собран заново на русском;
файлы `templates/*.md` — дословно на английском, атрибуция в начале
каждого файла.*

