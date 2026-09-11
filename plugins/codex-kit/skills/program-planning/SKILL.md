---
name: program-planning
description: >-
  5 инструментов планирования программы/проекта до старта работы:
  capacity-planning (спрос на людей vs реальная доступность),
  dependency-map (кросс-командные зависимости и критический путь),
  prioritisation-framework (прозрачная модель приоритизации конкурирующих
  запросов), program-roadmap (outcomes → фазы → milestones →
  workstreams → зависимости), scoping-framework (что входит и явно не
  входит в программу). Использовать при запросе «спланируй capacity
  команды», «построй карту зависимостей», «как приоритизировать
  запросы», «собери roadmap программы», «зафиксируй scope проекта».
---

# Планирование программы

5 инструментов из `Owl-Listener/ux-pgm-skills`, изначально под UX-
программы, здесь обобщены до любого проекта/программы с несколькими
командами. Файлы в `templates/` дословно на английском (общий текст, не
UX-специфика), атрибуция в начале каждого.

## Какой инструмент когда

| Запрос пользователя | Файл | Что даёт |
|---|---|---|
| «спланируй capacity команды» | `templates/capacity-planning.md` | Спрос (person-weeks по workstream) vs реальное предложение (после overhead, буфер 60-70% от номинала) → где перегруз |
| «построй карту зависимостей» | `templates/dependency-map.md` | Producer/consumer, артефакт, needed-by дата, уверенность → критический путь, риски по зависимостям |
| «как приоритизировать запросы» | `templates/prioritisation-framework.md` | Прозрачная модель (RICE/Value-vs-Effort/Weighted scoring/Cost of delay) вместо кулуарных решений |
| «собери roadmap программы» | `templates/program-roadmap.md` | Outcomes → фазы (discovery/definition/delivery/launch/learn) → проверяемые milestones → workstreams → зависимости |
| «зафиксируй scope проекта» | `templates/scoping-framework.md` | Problem/in scope/out of scope/assumptions/constraints/success criteria — с явным акцентом на out of scope |

## Как выбирать

Порядок по умолчанию: `scoping-framework` (что вообще делаем) →
`program-roadmap` (как это распределено во времени) →
`prioritisation-framework` (если запросов больше, чем capacity) →
`capacity-planning` + `dependency-map` (можем ли физически это
выполнить). Не обязательно проходить все пять — брать нужный под
конкретный запрос.

`program-roadmap` здесь — масштаб программы/квартала. Для отдельного
спринта — `product-execution/sprint-cycle`, не этот файл. Для перевода
roadmap с output на outcome-формулировки — `product-execution/
planning-docs/outcome-roadmap`, применяется до или после этого шаблона.

Хороший milestone проверяем («flow validated in 5 usability sessions»),
плохой — это активность («work on checkout»). Не принимать формулировку
milestone, если её нельзя проверить фактом.

---

*Источник: Owl-Listener/ux-pgm-skills, `program-planning/skills/*`, MIT.
Роутер собран заново на русском, обобщён от UX-программы до любого
проекта; файлы `templates/*.md` — дословно на английском (текст уже не
UX-специфичен), атрибуция в начале каждого файла.*

