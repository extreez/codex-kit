# Несовместимые блоки

Читается скиллом `kit` при подключении блока. Пока пусто — заполняется по мере
появления блоков, решающих одну задачу разными способами.

## Взаимоисключающие группы

Внутри группы можно держать только один блок.

<!-- Пример заполнения:

### design-taste
impeccable, taste-skill, gpt-tasteskill

Все дают правки по «вкусу» визуала. Вместе спорят друг с другом
и дублируют контекст.

-->

## Стек process

Восемь блоков (`product-execution`, `product-discovery`, `product-
strategy`, `program-delivery`, `cross-functional-alignment`,
`process-design`, `program-metrics`) плюс отдельный стек
`team-leadership` — каждый на своей стадии/зоне, кроме двух точек,
разведённых явно ниже.

### stakeholder-map — был дубль в двух источниках, синтезирован в один

`phuryn/pm-skills` (`pm-execution/stakeholder-map`) и
`Owl-Listener/ux-pgm-skills` (`stakeholder-comms/stakeholder-map`) —
почти одна и та же задача (power/interest grid для стейкхолдеров).
Вместо двух текстов собран один синтез в
`cross-functional-alignment/stakeholder-comms/templates/stakeholder-map.md`
(grid+таблица первого источника + stance/currency второго).
`product-execution/delivery-comms` свою копию не несёт, ссылается на
эту.

### Три altitude «ретро» — не дубли, разный масштаб

- `product-execution/sprint-cycle/retro` — один спринт, 2-3 action item.
- `program-delivery/delivery-execution/retrospective` — одна программа
  целиком, несколько команд.
- `process-design/process-design/templates/process-retrospective.md` —
  сам процесс команды в целом, без привязки к спринту или программе.

Держать все три можно одновременно — разный вход и разный каданс
запуска, не спорят друг с другом. Не путать масштаб при выборе, какой
запускать.

### program-metrics vs metrics — разный altitude, не дубль

`program-metrics` (Owl-Listener/ux-pgm-skills, measurement-ops) меряет
здоровье и трение самой программы/процесса её выполнения (cycle time,
blocker age, impact-репортинг руководству). Существующий блок `metrics`
меряет продукт/бизнес (North Star, атрибуция, аналитика). Та же
формулировка, что для `seo-audit`/`web-fundamentals` выше — общие типы
чисел, разная цель измерения, оба блока держать вместе можно.

### team-leadership — про людей, не про задачи, не пересекается со стеком process

`team-leadership` (Owl-Listener/design-leadership-skills, 32 скилла) —
менеджмент людей и команды (найм, 1:1, performance review, лидерство).
Стек `process` — менеджмент работы (задачи, программы, стратегия
продукта). Разные объекты управления, держать оба можно без конфликта.

## Стек secure

Пять блоков `sec-policy`, `sec-audit`, `sec-tests`, `sec-attack`, `sec-loop`
совместимы и дополняют друг друга. Правила живут только в `sec-policy`,
остальные ссылаются — спорящих пунктов внутри стека нет.

Зависимости: `sec-audit/tests/attack` требуют `sec-policy` (чеклист),
`sec-loop` требует `sec-audit` и `sec-tests` (цикл зовёт их).

### codebase-map
repowise, socraticode, codegraph, graphify, understand-anything

Все пять индексируют один и тот же код для одной задачи — дать агенту карту
проекта без чтения файла за файлом. Держать больше одного одновременно
значит два индекса на одну кодовую базу, спорящих между собой. Сравнение
и рекомендация — `library/codebase-map/README.md`.

### tgrep не входит в группу codebase-map

`tgrep` ускоряет точный regex-поиск триграммным индексом, структуру и связи
не строит. Пятёрка группы отвечает на вопрос «как устроен проект», `tgrep`
на вопрос «где лежит эта строка». Общего индекса у них нет: `.tgrep` хранит
триграммы, а не граф символов.

Держать вместе можно и осмысленно: `repowise` для структуры, `tgrep` для
точного поиска по крупному репозиторию. Порог применимости у `tgrep` свой
(от 15 000 файлов), он записан в его SKILL.md, ниже порога блок не ставится.

Замещает `tgrep` не блок каталога, а встроенный Grep. Его хук `PreToolUse`
на `Grep` подсказывает, не блокирует, и молчит, пока в корне нет `.tgrep`.

### platform-ui
mobile-ui, swiftui-ui, material3-ui

Три платформенных гайдлайна одной задачи — нативный UI под конкретную
платформу — но разными системами, не альтернативные реализации одного:
`mobile-ui` без привязки к платформе, `swiftui-ui` под Apple (требует
Xcode, macOS-only), `material3-ui` под Android/Jetpack Compose. Проект
обычно целится в одну платформу — держать больше одной ставит агенту
противоречащие конвенции (например, где `swiftui-ui` требует нативный
`NavigationStack`, `material3-ui` требует Compose Navigation — оба
"правильные", но для разных рантаймов). Не входят в стек `interface` по
умолчанию — ставятся отдельно, по факту проекта.

## Стек interface

22 веб-блока (`checklist-design`, `dark-mode-design`, `design-system-docs`,
`design-system-extract`, `design-system-tokens`, `design-system-tweaks`,
`figma-canvas`, `figma-mcp`, `icons0-dev`, `illustration-style`,
`impeccable`, `shadcn-official`, `shadow-plugin`, `taste-skill`,
`ux-writing`, `web-a11y-code`, `web-a11y-design`, `web-color`,
`web-fundamentals`, `web-motion`, `web-states`, `web-taste`) — каждый на
своей стадии/зоне, зон пересечения нет по построению (см. отдельные
записи выше про `figma-canvas` и про `web-color`/`web-a11y-code`
разделение зоны контраста).

Платформенные (`mobile-ui`/`swiftui-ui`/`material3-ui`, группа
`platform-ui` выше) в стек не входят — ставятся по `/kit add` отдельно,
по факту проекта.

## Стек dev

Восемь блоков `dev-build`, `dev-debug`, `dev-architecture`, `dev-ops`,
`dev-onboarding`, `dev-strategize`, `dev-loop`, `readme-polish` — не спорят
друг с другом, каждый на своей задаче.

Ни один не дублирует `/code-review`, `/simplify`, `/ponytail-audit` (глобальные
скиллы) — те покрывают ревью диффа и поиск переусложнения, `dev-*` работает
раньше (архитектура, стратегия) или рядом (онбординг, пайплайн), не поверх.

Карта кода (`library/codebase-map`) не входит в стек по умолчанию — ставится
по решению, читает её `dev-onboarding` если она есть.

## Стек visualization

Два блока `diagram-schemas`, `chart-selection` не спорят друг с другом,
разные носители (связи/структура против чисел/трендов), не конфликт.

### diagram-schemas не входит в группу codebase-map

`diagram-schemas` рисует диаграмму по уже готовому пониманию структуры
(описанию пользователя или результату блока из группы `codebase-map`), сам
код не сканирует. Граница: кто читает репозиторий - `codebase-map`
(`repowise`/`codegraph`/`graphify`/`socraticode`/`understand-anything`), кто
рисует по готовым данным - `diagram-schemas`. Не взаимоисключающая пара, а
последовательность: сначала карта, потом картинка, если она вообще нужна.

### chart-selection - companion к dataviz, не альтернатива

`chart-selection` не дублирует и не переопределяет встроенный
Anthropic-скилл `dataviz` (не блок codex-kit, но пересекается по теме),
`dataviz` владеет основным методом выбора формы графика, цветовой формулой
и спеками меток, `chart-selection` добавляет только быструю таблицу-подсказку,
композицию нескольких чартов в отчёт и чек-лист честности данных. При
конфликте формулировок приоритет у `dataviz`.

## Стек seo

Десять блоков `seo-audit`, `seo-loop`, `seo-content`,
`seo-content-maintenance`, `seo-offpage`, `seo-local`, `geo-optimize`,
`geo-loop`, `geo-content`, `llms-txt` совместимы (как `secure`) — каждый
на своей зоне, спорящих пунктов внутри стека нет.

Зависимости: `seo-loop` требует `seo-audit` (цикл зовёт его), `geo-loop`
требует `geo-optimize` (цикл зовёт его). `llms-txt` не требует
`geo-content` формально (`needs: []`), но предлагает его (`suggests`) —
`llms.txt` ссылается на `.md`-версии страниц, которые `geo-content`
атомизирует под цитируемость; без него `llms-txt` работает, просто
ссылается на обычные HTML-страницы.

### Пересечение CWV-метрик: seo-audit vs web-fundamentals/web-motion

`seo-audit` (слой Signals) и `web-fundamentals`/`web-motion` (стек
`interface`) оба используют Core Web Vitals (LCP/CLS/INP). Не спор, а
разные цели измерения — та же формулировка, что для
`sec-policy`/`guard-write` выше: `web-fundamentals` меряет CWV ради UX
(насколько плавно пользователю), `seo-audit` — ради ранжирования
(конкретный сигнал алгоритма поиска, с root-cause разбором для SEO-отчёта,
не для UX-фикса). Оба блока можно держать вместе — числа совпадают,
причина, зачем их чинят, разная.

### Пересечение GEO vs SEO

`geo-optimize`/`geo-content` (цитируемость в AI-ответах) и `seo-audit`/
`seo-content` (позиции в органическом поиске) — близкие методики (оба про
видимость сайта), но разная целевая метрика. Не конфликт, оба блока можно
держать одновременно — `geo-optimize` composite score частично опирается
на те же технические сигналы, что `seo-audit` (индексируемость, schema),
не пересобирает их заново с нуля, а ссылается на отчёт `seo-audit`, если
он уже прогонялся (см. `geo-optimize/agents/technical-schema-checker.md`).

## Кластер research/fact-check/writing/academic

Девять блоков не спорят друг с другом — каждый на своей задаче, связаны
графом зависимостей (`needs`), не взаимоисключением:

- `fact-check` — базовый, ни от кого не зависит.
- `de-ai-text` — базовый, ни от кого не зависит.
- `research-deep` требует `fact-check` (шаг верификации цитат делегирован
  туда, не переизобретён).
- `research-loop` требует `research-deep` (цикл зовёт его раундами).
- `academic-research` требует `research-deep`, `fact-check`, `de-ai-text`
  (литобзор, факт-проверка, финальная стилевая правка текста — все три чужие).
- `academic-review` не требует ничего жёстко, `suggests: [academic-research,
  fact-check, de-ai-text]` — ревью может прийти на текст, который эти блоки
  не создавали, поэтому связь не обязательная.
- `academic-loop` требует `academic-research`, `academic-review` (цикл зовёт
  их раундами до вердикта панели — та же роль в стеке `academic`, что
  `research-loop` в `research`).
- `rabbithole`, `transcribe` — независимые as-is подключения, не пересекаются
  ни с чем в кластере по задаче.

Ставить `academic-research`/`research-deep` без их `needs` — плагин-система
Codex сама не подтягивает зависимости блоков автоматически, `/kit add`
должен предупредить и предложить поставить недостающее следом.

### de-ai-text используется трижды, не дублирован

`de-ai-text` содержит единственную копию чек-листа шаблонных формулировок. `academic-research`
(шаг 8) и `academic-review` (ситуативно) вызывают его, а не копируют список
шаблонных слов заново — то же самое верно для `writing-anti-ai`, который лёг в основу
`de-ai-text` при синтезе и больше нигде не переиспользован как отдельный
источник.

### Devil's Advocate — один приём, два места

Порог уступки ≥4 (оценка своего контраргумента 1-5, уступать только при
низкой оценке) введён в `research-deep/agents/research-critic.md` и
переиспользован дословно как приём (не текст) в `academic-review/agents/paper-reviewer.md`.
Не два независимых изобретения — если приём меняется, менять в обоих местах
согласованно.

## Стек prod

### deploy-platform (не взаимоисключающая группа)

`deploy-vercel`, `deploy-render`, `deploy-azure-appservice`, `deploy-expo-eas`,
`deploy-openship`, `deploy-kubernetes`, `deploy-terraform` — семь
платформо-специфичных блоков. Не конфликтуют и не альтернативы друг другу в
духе `codebase-map` (там пять блоков решают одну задачу и спорят) — каждый
под свою платформу, и один проект вполне может держать несколько сразу
(например фронт на Vercel, API на Render). По аналогии с `platform-ui`
(`mobile-ui`/`swiftui-ui`/`material3-ui`) эти блоки НЕ входят в стек `prod`
по умолчанию — ставятся отдельно через `/kit add <блок>`, по факту
используемой платформы. `deployment-readiness` стоит НАД любым из них
(`suggests`), не выбирает победителя.

`deploy-terraform` не спорит с `deploy-kubernetes` — разные слои: первый
поднимает инфраструктуру (VPC/кластер/RDS), второй пишет манифесты внутри
уже поднятого кластера. Оба ставятся вместе на типичном AWS/Azure/GCP
проекте с k8s, `deploy-terraform` при этом `suggests` `deploy-kubernetes`.

`deploy-vercel` собран без дословного текста источника (у vercel-labs/agent-skills
нет файла LICENSE) — методология пересказана своими словами, это не влияет на
совместимость с другими блоками группы.

### db-postgres-best-practices и supabase

`supabase` требует (`needs`) `db-postgres-best-practices` — общие правила
Postgres не переизобретены внутри supabase-блока заново. `db-postgres-best-practices`
можно ставить и без `supabase`, на голом Postgres любого хостинга (в том числе
managed Postgres из `deploy-render`).

### prod-incident-response не спорит с sec-audit/sec-attack

Оба про инциденты, но разные классы: `prod-incident-response` — доступность/
надёжность (аварии, деградации), `sec-audit`/`sec-attack` — безопасность
(эксплойт, утечка). Держать вместе можно, зоны не пересекаются.

## Отдельные пары

| Блок | Осторожно с | Почему |
|---|---|---|
| sec-policy (хук guard-write) | внешние линтеры секретов на PreToolUse | оба на Edit/Write, дублируют блокировку. Не конфликт, лишний шум |
| dev-loop (Stop-хук ревью), dev-ops (Stop-хук changelog) | sec-loop (Stop-хук аудита) | несколько сразу — несколько напоминаний на выходе из сессии подряд. Не конфликт, разные вопросы, каждый бьёт один раз |
| dev-build, dev-debug | ponytail (success criterion, root cause) | ponytail уже держит дисциплину «чек + причина в корне» на одной правке. dev-build/dev-debug работают на объёме крупнее одной правки — не спорят, разный масштаб |

Границы, не конфликты:
- `sec-policy/guard-write` (Edit/Write) и глобальный `secret-scan.js` (git push) —
  разные стадии, работают вместе.
- Стек `secure` не тащит официальный плагин `claude-security` и встроенный
  `/security-review`. Их можно держать рядом: второй взгляд, а не спор с чеклистом.

## Стек marketing

Одиннадцать блоков (`positioning`, `copywriting`, `content-strategy`,
`brand-voice`, `social-media`, `email-outbound`, `paid-ads`,
`cro-funnel`, `retention-growth`, `pr-launch`, `aso`) не спорят друг с
другом — каждый на своей зоне. Источники (`coreyhaines31/
marketingskills`, `alirezarezvani/claude-skills`, `anthropics/
knowledge-work-plugins`, `ericosiu/ai-marketing-skills`) дали много
почти одинаковых по методологии скиллов на одну и ту же задачу — они
не установлены параллельно, а синтезированы в один при сборке (не
конфликт для пользователя, но важно для понимания, откуда взят текст):
`content-strategy` (marketingskills + alirezarezvani, идентичный
фреймворк Searchable/Shareable), `email-sequence`, `paid-ads`/
`ad-creative`, `free-tools`/`free-tool-strategy`, `cro-funnel` (шесть
источников form-cro/onboarding-cro/page-cro/paywall-upgrade-cro/
popup-cro/signup-flow-cro + marketingskills cro/signup/onboarding/
paywalls/popups — все в один скилл с тремя reference-чек-листами).

Зависимости мягкие (`suggests`, не `needs`): `positioning/
product-marketing-context` создаёт `.agents/product-marketing.md`,
на который ссылаются остальные 10 блоков — работают и без него, но
переспрашивают контекст (аудиторию, конкурентов, голос бренда) заново
при каждом запуске.

### growth-engine — альтернатива ab-testing, не установлен

Источник `ericosiu/ai-marketing-skills` содержит `growth-engine` —
собственный статистический движок A/B-тестирования (bootstrap
confidence interval + Mann-Whitney U вместо, возможно, других тестов
в существующем блоке `ab-testing`), с порогом продвижения ≥15% lift и
собственным хранилищем плейбука. Не установлен как отдельный блок —
прямо конкурирует с `ab-testing` за одну и ту же задачу (статзначимость
экспериментов), решать одну задачу двумя параллельными блоками не
нужно. Если методология `ab-testing` окажется недостаточной для
конкретного проекта (например нужна устойчивость к выбросам, которую
даёт Mann-Whitney лучше, чем t-test) — сравнить точечно перед заменой,
не ставить оба сразу.

### Пересечение с существующими ux-research/metrics/ab-testing

`positioning` дополняет `ux-research/competitor-profiling` (battlecard-
шаблон и positioning map, которых там не было), не дублирует сбор
данных о конкуренте — профилирование остаётся в `ux-research`,
`positioning/positioning-gtm` строит поверх уже собранного профиля.
`paid-ads`/`social-media`/`email-outbound` ссылаются на `metrics/
attribution` и новый `metrics/analytics-readback` за измерением
результата, не переизобретают атрибуцию заново. `cro-funnel` ссылается
на `ab-testing` за статистикой самого теста — сам даёт только
диагностику и приоритизацию гипотез (Issue/Impact/Fix/Priority), не
считает значимость.

### Пересечение с web-taste/web-color кластером (стек interface)

`copywriting`/`references/mental-models.md` и `brand-voice` — про
текст и голос, не про визуал. Не пересекаются с `web-taste`/
`impeccable`/`taste-skill` (визуальный вкус) и `design:design-system`/
`design:ux-copy` (дизайн-система и UI-текст интерфейса) — `copywriting`
явно исключает продающий контент из зоны `design:ux-copy` разделением
аудитории (использование продукта vs решение купить).

### Видео/SMM — сознательно неполный на этом проходе

`social-media/youtube-packaging` взял из `ericosiu/ai-marketing-skills`
только маркетинговую часть (копирайтинг заголовка/превью, метод
анализа выбросов конкурентов) — весь видео-производственный конвейер
того же источника (скачивание/транскрибация/монтаж/субтитры) не
установлен, отложен как будущий отдельный блок (см. NOTES.md). Не
конфликт, а явная граница: `social-media` не производит видео, только
упаковывает и планирует.

## Видео: моушн-движок, только один

### hyperframes vs remotion

Оба превращают веб-разметку в MP4. Оба хотят быть местом, где живёт
композиция. Держать два значит развести титры, переходы и аудио-микс по
двум несовместимым проектам.

Каталог выбрал **HyperFrames**. Причины по порядку веса:

| Признак | HyperFrames | Remotion |
|---|---|---|
| Лицензия | Apache 2.0 | платная от 4 сотрудников |
| Заявленная цель | сделан под агентов | сделан под разработчиков |
| Свои скиллы | 19 в комплекте | нет |
| Lottie, GSAP, Three.js | из коробки | через свои обёртки |
| Поддержка в video-use | родная | родная |

Remotion ставится, только если у тебя уже есть Remotion-проект, который
надо доделать. Тогда переносить его в HyperFrames помогает их же скилл
`/remotion-to-hyperframes`.

Блок `video-pipeline` в обоих случаях один и тот же: он оркестрирует, а не
рисует.

### video-watch vs transcribe vs claude-video

Не конфликт, разные области. Граница проходит так:

| Блок | Область |
|---|---|
| `transcribe` | только распознавание речи, ничего больше |
| `video-watch` | что происходит на экране и что звучит, плюс словные таймкоды |
| `claude-video` | скачивание чужих роликов, кадры, транскрипция |

`video-watch` вызывает `claude-video` как движок дешёвого режима, поэтому
ставится вместе с ним. `transcribe` остаётся, если нужна расшифровка
аудио без всего видео-контура: он легче и не тянет ffmpeg-конвейер.

Двойной установки бояться не надо, но одну и ту же расшифровку дважды
делать незачем. Скрипт `transcribe_local.py` из `video-pipeline` пишет
результат туда, откуда его читает video-use, и второй прогон не нужен.

### Автоматика (собрана): 3 цикла + кросс-канальный аудит

По прямому запросу пользователя добавлена автоматизация поверх уже
собранных 11 блоков — по образцу `seo-loop`/`sec-loop` (команда +
Stop-хук-напоминание, не автономный бесконечный цикл) и `geo-optimize`
(параллельные субагенты → взвешенный composite score).

- `cro-funnel-loop` (needs `cro-funnel`) — Stop-хук по grep-эвристике
  на изменённые файлы воронки (signup/onboard/checkout/paywall/popup/
  pricing/form в пути), тот же принцип, что у `seo-loop`.
- `content-loop` (needs `content-strategy`) — Stop-хук парсит
  `docs/marketing/content-pipeline.md` (точный формат таблицы
  зафиксирован дважды: в `content-strategy/content-governance/
  SKILL.md` и в самом хуке — не менять порядок/названия 5 колонок
  раздельно, иначе разойдутся).
- `paid-ads-loop` (needs `paid-ads`) — Stop-хук по дате в
  `docs/marketing/paid-ads-tests.md`, не по git diff (рекламная
  кампания не файл в репозитории, триггер временной, не диффовый —
  единственный `-loop` блок каталога с таким типом гейта).
- `marketing-audit` — не `-loop`, диагностика без фикса. 4 субагента
  (`positioning-checker`/`content-checker`/`channel-checker`/
  `paid-cro-checker`) читают файлы двух `-loop`-трекеров выше и бэклог
  `/cro-funnel` для оценки, не создают собственных данных — если
  трекеры не ведутся, зона помечается «не проверено», не занижается
  до 0 (см. `references/health-rubric.md`).

Все три `-loop` и `marketing-audit` пишут в общий
`docs/marketing/readback-log.md` — один файл на весь стек `marketing`,
не заводить отдельный лог на каждый блок.

## figma-canvas: variable-library.md vs design-system-gen.md

Оба скилла блока `figma-canvas` (skills/design-docs) создают токен-коллекции
в Figma поверх пустого/нового файла — но разной архитектуры:

- `variable-library.md` (build-a-variable-library, UI Collective) — строгая
  3-уровневая система `brand`/`alias`/`mapped`, 152 mapped-токена, точные
  имена и scopes. **Сам себя блокирует**: в Step 0 проверяет, есть ли уже
  коллекция `brand`/`alias`/`mapped` или любая коллекция с >~20 переменными,
  и отказывается работать поверх существующей системы.
- `design-system-gen.md` — простой 2-уровневый набор (примитивы → семантика)
  плюс сразу компоненты (кнопки/инпуты/модалки), извлекая цвета/шрифты из
  выделенных слоёв. **Такой проверки не делает.**

Порядок запуска на одном файле имеет значение: `variable-library.md` первым
— безопасно, сам откажется, если что-то уже есть. `design-system-gen.md`
первым, затем `variable-library.md` на том же файле — тоже безопасно
(guard второго сработает). Но `design-system-gen.md` **после**
`variable-library.md`, или оба независимо на одном файле без проверки —
конфликт: design-system-gen создаст вторую, несовместимую систему токенов
поверх первой, с дублирующимися/расходящимися именами. Рекомендация: выбрать
один подход на проект, не запускать оба на одном файле подряд.

`foundations-documentation.md` (третий скилл той же темы, design-system-documentation)
конфликта не создаёт — он read-only относительно исходных Variables/Styles,
просто документирует то, что уже получилось от любого из двух генераторов
выше.

