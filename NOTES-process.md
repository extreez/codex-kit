# Процесс/PM/UX-research: черновик для передачи в другую сессию

## Собрано (весь стек `process` + стек `team-leadership`) — этот заход завершён

Восемь блоков собраны в одной сессии, дословным чтением каждого
SKILL.md, без пропусков:

1. **`product-execution`** — phuryn/pm-skills, `pm-execution` (16 из 16,
   кроме `dummy-dataset`, см. «Отложено»): `planning-docs`,
   `backlog-formats`, `sprint-cycle`, `risk-review`, `delivery-comms`
   (без stakeholder-map — вынесен, см. ниже).
2. **`product-discovery`** — phuryn/pm-skills, остаток
   `pm-product-discovery` (9 из 13, 4 уже в `ux-research`/`metrics` —
   не задублировано): `discovery-cycle`, `backlog-triage`.
3. **`product-strategy`** — phuryn/pm-skills, `pm-product-strategy`
   целиком (12 из 12): `strategy-canvases`, `vision-and-value`,
   `monetization`, `strategic-frameworks`. `pricing-strategy` явно
   разведён с `ux-research/pricing` (стратегия цены vs исследование
   готовности платить, разные стадии).
4. **`program-delivery`** — Owl-Listener/ux-pgm-skills,
   `program-planning`+`delivery-execution` (10 из 30): `program-
   planning`, `delivery-execution`. Обобщено от UX-программы до любого
   проекта.
5. **`cross-functional-alignment`** — Owl-Listener/ux-pgm-skills,
   `cross-functional-alignment`+`stakeholder-comms` (10 из 30):
   `decision-and-roles`, `stakeholder-comms`.
6. **`process-design`** — Owl-Listener/ux-pgm-skills, `process-design`
   целиком (5 из 30): один скилл `process-design` с 5 шаблонами.
7. **`program-metrics`** — Owl-Listener/ux-pgm-skills, `measurement-ops`
   целиком (5 из 30): один скилл `program-metrics` с 5 шаблонами.
   Разведён с существующим `metrics` в CONFLICTS.md (altitude
   программы vs продукта/бизнеса).
8. **`team-leadership`** (отдельный стек `team-leadership`, не
   `process`) — Owl-Listener/design-leadership-skills, все 6 плагинов
   целиком (32 из 32): `people-management`, `team-building`,
   `team-strategy` (переименован с `design-strategy`), `org-influence`,
   `operating-cadence`, `leadership-craft`. Про менеджмент людей, не
   задач — не пересекается со стеком `process`.

**Дубль stakeholder-map закрыт**: было два почти одинаковых скилла
(`pm-execution/stakeholder-map` и `ux-pgm-skills/stakeholder-comms/
stakeholder-map`) — синтезированы в один файл в
`cross-functional-alignment/stakeholder-comms/templates/
stakeholder-map.md`, `product-execution/delivery-comms` на него
ссылается, свою копию не несёт. Записано в CONFLICTS.md.

**Три altitude «ретро» разведены явно** в CONFLICTS.md и в текстах
самих скиллов: `product-execution/sprint-cycle/retro` (спринт),
`program-delivery/delivery-execution/retrospective` (программа),
`process-design/.../process-retrospective` (процесс команды в целом).

Все 8 блоков зарегистрированы в `.claude-plugin/marketplace.json`,
README.md badge обновлён (104 блока). Стеки-папки `stacks/process/` и
`stacks/team-leadership/` не созданы — по прецеденту `ux-research`/
`metrics`/`ab-testing`, блоки только помечены тегом `stacks:` в
block.yaml, скелет стека решается отдельным заходом.

## Автоматизация — добавлена точечно, не на все 8 блоков

Изначальный проход собрал только скиллы, без agents/hooks/commands —
пробел, замеченный пользователем постфактум. Прогнал по всем 8 блокам
на предмет реального (не искусственного) кандидата на команду/loop —
критерий: проверяемый критерий остановки ИЛИ естественная
периодичность, не разовый документ. Нашлось три места, субагенты не
понадобились нигде (ни одна задача внутри этих 8 блоков не распадается
на состязательные/параллельные роли, в отличие от research-deep):

- `product-discovery/commands/discovery-cycle.md` — command фиксирует
  порядок 4 шагов (идея → допущения → приоритизация → эксперимент),
  один проход, LLM иначе может пропустить шаг допущений.
- `program-delivery/commands/blocker-scan.md` — снимок блокеров+рисков,
  рассчитан на повтор через `/loop <интервал> /blocker-scan` (сам
  интервал не встроен, пользователь выбирает под темп программы).
- `team-leadership/commands/one-on-one-prep.md` — подготовка одной
  встречи, тот же принцип, `/loop <интервал> /one-on-one-prep <имя>`.

Остальные 5 блоков (product-execution, product-strategy,
cross-functional-alignment, process-design, program-metrics) остались
чистыми скиллами осознанно — одноразовые документы без проверяемого
критерия «готово», Stop-хук/loop туда не просится, добавление было бы
инструментированием ради инструментирования.

## Не закрыто, кандидат на будущее

**`sql-queries`** (1 скилл, pm-data-analytics — генерация SQL из
естественного языка) — некуда пристроить отдельным блоком, слишком
маленький. Кандидат в `library/` или как утилита внутрь `metrics`.
Не решено, не строилось.

## Отложено осознанно в этом заходе

- **`dummy-dataset`** (pm-execution) — генератор тестовых данных
  (CSV/JSON/SQL/Python) для QA, случайно попал в PM-плагин апстрима, не
  относится к процессу/менеджменту. Не строить как часть `process`.
- **pm-go-to-market** (6) и остаток **pm-marketing-growth** (4,
  marketing-ideas/positioning-ideas/value-prop-statements/product-name)
  — дублируют уже собранный стек `marketing` (`positioning`,
  `copywriting`, `content-strategy`). Не строить.
- **pm-toolkit** (review-resume, draft-nda, privacy-policy,
  grammar-check) — HR/юридическая рутина, нишевое, вне темы.
- **pm-ai-shipping** (shipping-artifacts, intended-vs-implemented) —
  ближе к стеку `dev` (AI-сгенерированный код), не к процессу/PM.
- **wshobson/agents/monorepo-management** — проверено построчно через
  skills.sh: чистая dev-инфраструктура (Turborepo/Nx/pnpm workspaces,
  CI-кэш, Changesets), не про менеджмент задач. Кандидат для стека `dev`
  или `prod` отдельным заходом, не часть этого кластера.
- **Notion** — не источник для копирования, заметка на будущую
  MCP-интеграцию (`plugin:productivity:notion`, требует OAuth-авторизации
  пользователя, недоступно в неинтерактивной сессии).
- **anthropics/knowledge-work-plugins/task-management** — сверено, это
  тот же `productivity:task-management`, уже установлен плагином у
  пользователя (`TASKS.md`, 4 секции). Ничего строить не нужно, разве
  что расширить существующий плагин, если пользователь попросит.

## Собрано (блоки `ux-research`, `metrics`, `ab-testing`)

Все три стека из «уже решено» ниже реализованы блоками (см. `blocks/ux-research/`,
`blocks/metrics/`, `blocks/ab-testing/`, зарегистрированы в `marketplace.json`).
Источники: `alirezarezvani/claude-skills` (product-team/ux-researcher-designer),
`coreyhaines31/marketingskills`, `phuryn/pm-skills`, `takechanman1228/claude-persona`
(тонкая обёртка) — все MIT, дословно с атрибуцией.

**`ux-research`** (6 скиллов): `persona-and-journey` (рабочий Python-генератор
персон + journey mapping + usability-фреймворки, alirezarezvani, вендорен код →
`THIRD-PARTY-NOTICES.md`), `real-user-research` (методология интервью с
confidence-scoring, marketingskills), `synthetic-research` (тонкая обёртка
claude-persona — AI-панель, когда реальных пользователей нет), `quick-research-
templates` (10 шаблонных генераторов вывода под данные пользователя, pm-skills),
`pricing-research` (Van Westendorp/MaxDiff, marketingskills + ссылка на
synthetic-research как движок симуляции), `competitor-profiling` (URL-конвейер
со скрейпингом, marketingskills).

**`metrics`** (3 скилла): `product-metrics` (North Star + дашборд + cohort,
pm-skills — стратегический слой), `analytics-implementation` (GA4/GTM,
marketingskills — технический слой), `attribution` (модели атрибуции,
marketingskills). Три разных объекта измерения, не пересекаются.

**`ab-testing`** (2 скилла): `experiment-design` (гипотеза, ICE, playbook,
marketingskills), `experiment-analysis` (статанализ готовых данных, SRM,
sample size, pm-skills). Разные фазы одного процесса.

Стеки-папки (`stacks/ux-research/` и т.д.) не созданы — блоки только
помечены тегом `stacks:` в `block.yaml`, сам скелет стека решается отдельно
(см. вопрос «что класть в стек» в общем списке задач).

## Осознанно отложено, не строить без явной просьбы

- **Owl-Listener/ux-pgm-skills** (30 скиллов) и **design-leadership-skills**
  (32 скилла) целиком — процессный/лидерский кластер, не про исследование
  пользователя или продуктовые метрики. Кандидат в будущий `process`/
  `product`-стек.
- **`program-kpis`/`designops-metrics`/`research-ops-coordination`**
  (Owl-Listener/measurement-ops, 3 скилла) — пограничные, меряют программу
  и дизайн-операции, не продукт. Решено держать рядом с process-кластером,
  не в `metrics`.
- **~40 скиллов pm-skills** (pm-execution, pm-product-strategy,
  pm-go-to-market, pm-toolkit, pm-ai-shipping) — общий PM-процесс (PRD,
  OKR, Lean Canvas, спринты), не про ux-research/metrics/ab-testing.
- **ishwarjha/claude-marketing-research-skill** целиком — заточен под
  подготовку к копирайтингу (avatar/awareness/sophistication framing для
  продающего текста), не под продуктовое исследование. Кандидат в будущий
  кластер positioning/copy.
- **marketingskills остальное**: `churn-prevention`, `onboarding`,
  `marketing-council`, `offers`, `revops`, `sales-enablement`, `competitors`
  (SEO-страницы, это уже контент-кластер, не исследование) — маркетинговая
  операционка вне периметра трёх собранных стеков.

## Уже решено (историческое, для контекста выше)

- Минимум три новых стека, не один блок: `ux-research`, `metrics`,
  `ab-testing`. Пользователь просил явно не забыть их завести. — Готово,
  см. «Собрано» выше.
- Возможно нужен стек `process`/`product` под остальное (роадмапы,
  стратегия, лидерство) - решить при разборе, не раньше.
- Подход тот же, что у web-*: не выбирать одного победителя из
  пересекающихся источников, синтезировать своё, атрибуция обязательна.

## Источники (не разобраны, только по описанию README)

- **Owl-Listener/ux-pgm-skills** - 30 скиллов, 6 плагинов:
  program-planning, stakeholder-comms, delivery-execution,
  cross-functional-alignment, measurement-ops, process-design
- **Owl-Listener/design-leadership-skills** - 32 скилла, 12 команд:
  people-management, team-building, design-strategy, org-influence,
  operating-cadence, leadership-craft
- **phuryn/pm-skills** - 100+ скиллов, discovery → strategy → execution
  → launch → growth
- **alirezarezvani/claude-skills** - 380 скиллов всего (уже источник
  для incident-commander/runbook-generator в стеке dev, см. NOTES.md),
  релевантна секция product-team/ux-researcher-designer
  (https://alirezarezvani.github.io/claude-skills/skills/product-team/ux-researcher-designer/)
- **takechanman1228/claude-persona** - AI-панели персон, virtual
  customer research, concept testing, вдохновлено TinyTroupe
- **ishwarjha/claude-marketing-research-skill** - конкурентный анализ,
  avatar profiling, позиционирование, value propositions
- **coreyhaines31/marketingskills** - CRO, копирайтинг, SEO, аналитика,
  growth engineering

Мета-списки, если этих источников не хватит на AB-testing/metrics
конкретно: BehiSecc/awesome-claude-skills, VoltAgent/awesome-agent-skills
(1000+ скиллов, не разбирались).

## Из уже разобранного web-* кластера, применимо и здесь

- `figma/usability-test-guide.md` (в test/figma этой рабочей директории) -
  генератор discussion guide для юзабилити-тестов, полностью портативный,
  не завязан на Figma. Кандидат для `ux-research`.
- `figma/catch-me-up.md`, `figma/daily-report.md` - отчётность по
  активности в файле, Figma-специфичны (comments API), но паттерн
  "синтез сигналов → отчёт для клиента/команды" может пригодиться в
  `metrics`/`process`.

## Inclusive personas + accessibility decisions (Owl-Listener/inclusive-design-skills)

Разобраны в ходе работы над `web-a11y-design` (та же тема, но эти два
плагина процессные/документационные, не про сам интерфейс) - перенесено
сюда полностью, дословно, MIT license.

### inclusive-personas (6 реальных скиллов, без оркестраторов generate/audit-stories/scenario-map)

**disability-inclusive-personas.** Против отдельных "accessibility персон":
инвалидность - обычное измерение персоны (как возраст, техническая
уверенность), не отдельный слайд. "Sarah is blind" плохо; "Sarah is a
project manager who has been blind since birth. She uses JAWS screen
reader on her work laptop... She's fast with keyboard shortcuts and gets
frustrated by interfaces that waste her time" хорошо. Правило минимума:
на набор из 4+ персон минимум одна с постоянной инвалидностью, минимум
одна с ситуативным нарушением, минимум две с разной технической
уверенностью.

**situational-impairment-mapping.** Аргумент для стейкхолдеров "наши
пользователи не инвалиды": "Every user on a train has a motor impairment",
"Every user in a loud café has a hearing impairment", "Every user at the
end of a long day has a cognitive impairment". Таблица permanent/temporary/
situational по пяти каналам (зрение/слух/моторика/когниция/речь) плюс
context audit template (commuting/at desk/at home/outdoors × visual/hearing/
motor/cognitive impact).

**edge-case-identification.** "That's an edge case" - самый частый способ
депприоритизировать доступность. Пять категорий edge case (input/output/
content/context/timing), "the inversion test" (взять happy path и
инвертировать каждое допущение: "user is on desktop" → screen reader,
"user has fast internet" → slow/intermittent/offline).

**ability-spectrum-mapping, assistive-technology-scenarios,
inclusive-user-stories** — по frontmatter: спектр способностей вместо
бинарного can/can't use; сценарии со скринридерами/switch/eye-tracking;
user stories с acceptance criteria, учитывающими инвалидность с самого
начала. Не читались построчно, при необходимости — дочитать с нуля.

### accessibility-decisions (6 реальных скиллов, без оркестраторов document/handoff/review)

**decision-documentation.** "Documentation is the immune system" против
того, что решения тихо отменяются новыми людьми в команде. Формат записи:
Title / Date & Author / Context / Decision / Alternatives Considered /
Accessibility Impact / Risks and Tradeoffs / Evidence. Хранить в коде
рядом с реализацией (предпочтительно) или в общем decision log, никогда
только в чьей-то голове или Slack-треде.

**tradeoff-analysis.** Framework из 6 вопросов: кто выигрывает от A, кто
выигрывает от B, кто теряет от каждого, severity asymmetry (blocked hуже
friction, постоянная инвалидность приоритетнее ситуативной — у ситуативных
есть другие варианты), reversibility (обратимо → берём быстрый вариант +
план улучшения; необратимо → берём инклюзивный вариант, принимаем
задержку), precedent (разовый компромисс без документации становится
стандартом). Red Lines: никогда не отгружать фичу, полностью недоступную с
клавиатуры; никогда не убирать существующую доступность ради дедлайна;
никогда не считать "починим потом" приемлемым без тикета и даты.

**compliance-mapping.** Таблицы design decision → WCAG success criterion
(contrast → 1.4.3, focus visible → 2.4.7, target size → 2.5.8, error
identification → 3.3.1 и т.д.) по 4 категориям (цвет/визуал,
взаимодействие, контент/структура, motion/timing). Плюс обзор правовых
рамок: ADA (US, суды ссылаются на WCAG 2.1 AA), EAA (EU, с июня 2025,
через EN 301 549), Section 508 (US government, WCAG 2.0 AA).

**accessibility-debt-tracking, accessibility-testing-strategy,
stakeholder-communication** — по frontmatter: трекинг накопленного долга
по доступности; планирование стратегии тестирования (авто+ручное+screen
reader+user testing); коммуникация со стейкхолдерами. Не читались
построчно, при необходимости — дочитать с нуля.

## Как продолжить

Тот же цикл, что для web-*: WebFetch README/SKILL.md каждого источника →
категоризация по кластерам → обсуждение с пользователем поэтапно, что
берём как есть, что синтезируем, что не по теме. Ничего не читалось
построчно, только по описанию. Скормить эту сессию файл целиком и
попросить продолжить с раздела "Источники".

