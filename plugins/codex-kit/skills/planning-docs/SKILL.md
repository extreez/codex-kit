---
name: planning-docs
description: >-
  4 генератора плановых документов продукта/проекта: PRD (8 секций),
  квартальные OKR (3 альтернативных набора), roadmap в формате outcome
  вместо output, справочник по 9 фреймворкам приоритизации (RICE/ICE/Kano/
  MoSCoW/Opportunity Score). Использовать при запросе «напиши PRD»,
  «накидай OKR на квартал», «перепиши roadmap через outcome», «какой
  фреймворк приоритизации выбрать», «сравни RICE и ICE».
---

# Плановые документы

4 шаблона из `pm-skills` (phuryn), связывающие стратегию с исполнением.
Каждый — отдельная задача, не альтернативы друг другу. Файлы в
`templates/` дословно на английском, атрибуция в начале каждого.

## Какой шаблон когда

| Запрос пользователя | Файл | Вход → выход |
|---|---|---|
| «напиши PRD» / «задокументируй требования» | `templates/create-prd.md` | Описание фичи/инициативы → 8-секционный PRD (Summary, Contacts, Background, Objective, Segments, Value Prop, Solution, Release) |
| «накидай OKR на квартал» | `templates/brainstorm-okrs.md` | Контекст команды/стратегии → 3 альтернативных набора Objective + 3 Key Results |
| «перепиши roadmap через outcome» | `templates/outcome-roadmap.md` | Roadmap по фичам → тот же roadmap, каждая строка как outcome-statement («Enable [сегмент] to [outcome] so that [бизнес-эффект]») |
| «какой фреймворк приоритизации выбрать» / «сравни RICE и ICE» | `templates/prioritization-frameworks.md` | Справочник, не генератор — 9 фреймворков с формулами и когда что использовать |

## Как выбирать

`create-prd` и `outcome-roadmap` — разный масштаб: PRD описывает одну
инициативу целиком, roadmap — список инициатив на период. Использовать
`create-prd` первым, если готового PRD ещё нет, `outcome-roadmap` —
когда есть список фич и нужно проверить, что за каждой стоит понятный
исход, а не просто список того, что построить.

`prioritization-frameworks.md` — справочник, не шаблон вывода. Не
генерировать RICE-скор без данных пользователя (reach/impact/confidence/
effort) — сначала спросить цифры или явно пометить как оценочные.

`brainstorm-okrs` даёт три равноценных набора для обсуждения, не один
«правильный» — не схлопывать до одного варианта без запроса пользователя.

Для полноценного стратегического канваса (vision/business model/SWOT) —
см. блок `product-strategy` (кандидат, в NOTES-process.md). Для разбивки
инициативы на бэклог-айтемы — см. `backlog-formats` в этом же блоке.

---

*Источник: phuryn/pm-skills, `pm-execution/skills/{create-prd,brainstorm-okrs,
outcome-roadmap,prioritization-frameworks}`, MIT. Роутер собран заново на
русском; файлы `templates/*.md` — дословно на английском, атрибуция в
начале каждого файла.*

