# Заметки и точки роста каталога

Незакрытые идеи и решения на потом. Не задачи в работе — то, к чему вернуться.

## Стек marketing (собран)

Одиннадцать блоков (`positioning`, `copywriting`, `content-strategy`,
`brand-voice`, `social-media`, `email-outbound`, `paid-ads`,
`cro-funnel`, `retention-growth`, `pr-launch`, `aso`) собраны по 5
источникам (5 параллельных research-агентов, построчный разбор):
`coreyhaines31/marketingskills` (MIT, 50 скиллов, основной источник),
`alirezarezvani/claude-skills` (MIT, marketing-skill/ + marketing/
linkedin+landing, 55 скиллов), `anthropics/knowledge-work-plugins`
(Apache-2.0, plugin `marketing/`, 8 скиллов — уникальные `brand-review`
и `campaign-plan`), `ericosiu/ai-marketing-skills` (MIT, 28 скиллов,
источник видео-кластера и паттернов expert-panel-scoring/
analytics-readback), `membranedev/application-skills` (skip целиком —
3000+ API-коннекторов к платному сервису Membrane, ни строчки
методологии внутри). Плюс расширение существующего `metrics` скиллом
`analytics-readback`, три мелких фикса (`ux-research/pricing`
и `customer-research` переименованы вслед за апстримом,
`metrics/attribution` — три битые перекрёстные ссылки на
несуществующий `ai-seo`).

По прямому запросу пользователя следующим шагом добавлена автоматика:
`cro-funnel-loop`, `content-loop`, `paid-ads-loop` (циклы по образцу
`seo-loop`/`sec-loop`) и `marketing-audit` (4 параллельных субагента →
composite score, по образцу `geo-optimize`). Подробности архитектуры,
форматы трекеров и needs-связи — `CONFLICTS.md`, раздел «Автоматика
(собрана)» внутри «Стек marketing».

### Sales/CRM/финансы — отложено полностью, только заметка

В `ericosiu/ai-marketing-skills` и `alirezarezvani/claude-skills`
нашлось много материала на смежную тему: `sales-pipeline`,
`lead-dossier` (RB2B-конвейер, deal intelligence, speed-to-lead),
`sales-playbook`/`sales-enablement` (питч-дек, объектион-хендлинг,
ROI-калькулятор), `revops` (жизненный цикл лида, deal desk approval
tiers), `prospecting` (4 ветки под SaaS/B2B/Local/demand-signal, явный
compliance-блок против bulk-скрейпинга LinkedIn), `revenue-intelligence`
(Gong-конвейер, revenue attribution), `finance-ops` (CFO-брифинг,
burn rate/runway), `team-ops` («Elon Algorithm» performance-аудит
команды). Пробовал уложить в один скилл по просьбе пользователя — не
сходится: продажи-переговоры, CFO-финансы и менеджмент команды — разная
аудитория и логика, один файл получится нечитаемым винегретом. Осталось
заметкой для будущего отдельного стека (`sales`/`revops`), не блоком.
Источники: `alirezarezvani/claude-skills` (commercial/,
business-growth/, c-level-advisor/ — 61 скилл ролей C-level, не
разбирался), `ericosiu/ai-marketing-skills` (папки выше по имени
скилла), `coreyhaines31/marketingskills` (`sales-enablement`, `revops`,
`prospecting`, `competitor-profiling`/`competitors` — competitor-*
уже частично в `ux-research`/контент-кластере, sales-* не тронуты).

### Видео-производство (собрано): два блока поверх чужих движков

`ericosiu/ai-marketing-skills` содержит полный видео-конвейер:
`short-form-pipeline`/`video-clip-pipeline` (скачивание yt-dlp →
Whisper-транскрибация → AI-сегментация Claude (hook-score) → нарезка
FFmpeg → вертикальный кроп с детекцией лица → субтитры — два почти
одинаковых варианта одной задачи, при сборке блока сравнить и выбрать
базу: агент-разведчик рекомендует `video-clip-pipeline` как более
зрелый — 10-экспертная оценка, only cuts 90+ — и забрать
layout-детекцию (talking_head/screen_share/side_by_side/gallery) из
`short-form-pipeline`), `video-content-engine` (портфельная стратегия
— один источник → long/mid/short/тизеры/дерайвативы, режимы редактуры
polish→rebuild), `net-new-video-editor` (свежезаписанный talking-head
footage, детерминированный FFmpeg-рендер по JSON edit plan),
`agentic-video-understanding` (retrieval моментов из видео через
Gemini API без полного покадрового разбора — дешевле full-frame
ingest), `video-caption-generator` (обработка новых MP4 из Google
Drive, транскрибация+подписи+A/B заголовков), `deck-generator`
(генерация слайдов через Imagen 4.0, ~56 центов за 14-слайдовую
колоду — смежная тема content-production, не видео конкретно). Из
этого кластера в блок `social-media` уже взято **только**
`packaging-youtube-thumbnails` и `yt-competitive-analysis` (чистый
копирайтинг/анализ без монтажа) — см. `blocks/social-media/skills/
youtube-packaging`. Пользователь прямо просил не забыть про этот блок.

**Собрано, но не из этого источника.** Блоки `video-watch` и
`video-pipeline` построены на других инструментах: HyperFrames
(Apache 2.0, композиция и рендер, несёт свои 19 скиллов), video-use
(MIT, автовырез по транскрипту), creative-skill с gcv-kie-cli
(генерация через kie.ai со сметой), claude-video (MIT, кадры и
транскрипция), whisper.cpp, MOSS-TTS-Nano, официальный Blender MCP.

Кластер `ericosiu/ai-marketing-skills` в итоге не портировался. Причина:
`short-form-pipeline` и `video-clip-pipeline` пишут свой FFmpeg-конвейер
и свою нарезку, а HyperFrames и video-use те же задачи уже закрывают и
обновляются апстримом. Порт означал бы третью реализацию одного и того
же. Оттуда стоит забрать при случае одну идею: hook-score с отбором
только 90+ и детекцию раскладки кадра (talking_head, screen_share,
side_by_side, gallery). Ни того ни другого в HyperFrames и video-use
нет.

Установка внешнего стека и проверка комплектности: `apps/video-stack`.
Приёмочный прогон: `blocks/video-pipeline/references/acceptance.md`.

### Claude for Commerce Agents — GEO для AI-шопинг-агентов, рано строить

`https://claude.com/blog/claude-for-commerce-agents` и
`github.com/anthropics/commerce-agents` — инженерный blueprint (Shopping
Agent + Merchant Agent, Catalog/Cart/Checkout API), не маркетинговый
скилл. Внутри `SKILL.md`-файлы (`shopping-agent/skills/{search,compare,
plan,cart,orders}`, `merchant-agent/skills/{performance,listings,
inventory,pricing,campaigns}`), но это внутренний формат агентных flow
конкретного проприетарного приложения, не публичная методология —
готовой схемы товарного фида или протокола видимости для AI-агентов
там нет. Единственная связь с уже собранным — тот же принцип, что
«AI-agent readiness» в `ux-research/pricing` (машиночитаемость цены
для LLM-агентов). Вернуться, когда у Anthropic/индустрии появится
публикуемая схема/протокол для листинга товара под AI-шопинг-агентов
— пока строить не из чего.

### Механики не про маркетинг, но методологически интересные

- **marketing-council** (`alirezarezvani/claude-skills`) — симуляция
  совета из 12 маркетинг-гуру с грaunding-правилами против выдуманных
  цитат и обязательным designated dissenter. Не взят как маркетинговый
  скилл — механика (не текст) стоит сравнить с существующим `debate`
  скиллом пользователя при случае, не маркетинговая тема сама по себе.
- **marketing-loops** (`coreyhaines31/marketingskills`) — 43
  операционных цикла с девятью обязательными полями (cadence,
  acts-when, self-check, state/idempotency, stop condition). Структура
  полей может усилить методологию `/loop-build`, не разбирался
  построчно на предмет прямого переноса.
- **personal-strategic-signal-intelligence** (`ericosiu/
  ai-marketing-skills`) — лестница силы сигнала (save→read→highlight→
  note→decision→application→validated), запрет «рекурсивной evidence»
  (нельзя засчитывать собственный вывод как новое доказательство),
  разделение attention vs conviction. Не маркетинговый скилл по своей
  природе (decision intelligence, попал в маркетинговый репозиторий
  через один из семи модулей) — методология полезна для evidence-based
  паттернов в `metrics`/`ux-research`, не разбиралась на предмет прямого
  переноса в этом проходе.

### Не проверено построчно в этом проходе

`positioning/positioning-gtm` — April Dunford positioning methodology
пересказана по общеизвестной публичной структуре (5 шагов из
«Obviously Awesome»), не сверялась построчно с текстом книги (её нет
в списке источников-репозиториев, только упоминалась косвенно через
`marketing-strategy-pmm`). `copywriting/references/mental-models.md` —
синтезированная компиляция моделей поведенческой экономики, не
дословный перенос ни одного конкретного источника (в отчётах агентов
`marketing-psychology` описан только по названиям моделей, не по
содержанию каждой). `content-strategy/references/tactics-catalog.md`
— аналогично, компиляция по структуре `marketing-ideas` (16 категорий),
не точный список 139 пунктов (агент не получил построчный список,
только категории и примеры из README).

## Стек prod: деплой, БД, прод-готовность (собран)

12 блоков собраны по 20 источникам (5 параллельных research-агентов): шесть
платформенных деплоев (`deploy-vercel` `deploy-render` `deploy-azure-appservice`
`deploy-expo-eas` `deploy-openship` `deploy-kubernetes`), платформо-независимый
`deployment-readiness`, БД (`db-postgres-best-practices` `supabase`),
`prod-incident-response`, `tech-debt-tracker`, `improve-codebase-architecture`
плюс обогащение существующих `dev-architecture` (словарь deep-module) и
`dev-ops` (формат ADR). Стек `stacks/prod` несёт только платформо-независимые
четыре блока — платформа хостинга и Supabase ставятся отдельно (см.
CONFLICTS.md, группа deploy-platform).

### deploy-terraform — новый блок, dev-ops довнесён

По запросу пользователя разобран `github.com/DevCloudNinjas/DevOps-Projects`
(MIT, 54 hands-on проекта, 15 обучающих треков, справочники — учебная
лаборатория, не готовые Claude-скиллы). Решение по роли источника: не
отдельный стек и не library-кандидат целиком, а точечный синтез в существующую
структуру `prod` — по прямому решению пользователя вытаскивать лучшее, не
тащить весь объём, новый блок заводить только там, где дополнять нечего.

Пробел закрыт один — Terraform/IaC не было представлено в каталоге вообще:
собран блок `deploy-terraform` (структура модулей через ссылки на output,
remote state с блокировкой, типизация/`sensitive` переменных, `terraform
plan -detailed-exitcode` как гейт CI, OpenTofu) по паттернам project-11
(модульный two-tier AWS), project-33/34 (`plan`→`apply`-по-дрейфу в GitHub
Actions), project-37/46/48 (EKS), project-52 (OpenTofu). Входит в группу
`deploy-platform` (CONFLICTS.md) — опционален, не в стек `prod` по умолчанию.

Раздел CI/CD в `dev-ops` уже был — не задваивать роутером рядом,
довнесён конкретным гейтом (test→build→terraform plan/apply→deploy) и
подразделом GitOps (ArgoCD/Flux как альтернатива push-деплою) по
project-33. Docker/Kubernetes/мониторинг/security-сканеры из источника не
тронуты в этом проходе — `deploy-kubernetes` уже покрывает K8s-манифесты,
мониторинг и security-сканеры (Trivy/SonarQube/Snyk/Vault) пересекаются с
`sec-audit`/`sec-policy` и наблюдаемостью `dev-ops` — не разбирались
построчно, вернуться отдельным проходом, если понадобится глубже.

Найденный в исходнике антипаттерн (project-11 `variables.tf`: пароль RDS
без `sensitive`, переменные без `type`) не скопирован — в `deploy-terraform`
явно назван как то, чего делать не надо, а не как образец.

### Прод-готовность больше не отложена

Раньше в этом файле Incident Commander/Runbook Generator (alirezarezvani/claude-skills)
ждали появления реального прода с мониторингом. Пользователь запросил тему
явно — `prod-incident-response` собран (incident-commander MIT за живую фазу,
awesome-copilot incident-postmortem MIT за 5 Whys постмортем, без вендоринга
Python-скриптов incident-commander — блок промпт-методология). Runbook
Generator отдельно не строился — его функция (генерация раннбука по паттерну
"Detection → Response → Recovery playbooks") оказалась уже внутри
incident-commander, дублировать не стали.

### tech-debt-tracker и db-designer — сняты с "нишевые, не запрошены явно"

Из раздела «Стек dev» ниже: `tech-debt-tracker` теперь собран (awesome-copilot
tech-debt-remediation-plan, MIT). `db-designer` не поднимался — источника под
него в этом проходе не было, остаётся нишевым до отдельного запроса.

### deploy-to-vercel без лицензии

`vercel-labs/agent-skills` не несёт файла LICENSE — по решению пользователя
текст скилла не копировался дословно, `deploy-vercel` пересказывает
методологию своими словами. Если позже появится подтверждение лицензии от
Vercel — можно свериться дословно и обновить блок.

### codebase-design не стал отдельным блоком

По решению пользователя словарь deep-module из mattpocock/skills codebase-design
(MIT) влит в существующий `dev-architecture` (deletion test, правило двух
адаптеров, тестируемость, design-it-twice), а не оформлен конкурирующим
блоком на том же этапе — так формулировки не расходятся. `improve-codebase-architecture`
(другой этап — сканирование готового кода) собран отдельным блоком без спора.

### Не проверено построчно в этом проходе

`db-postgres-best-practices` - роутер на 33 файла в исходном репозитории,
скопирована структура (8 категорий, приоритеты), не все 33 файла examples.
`improve-codebase-architecture` - оригинал генерирует HTML-отчёт
(Tailwind+Mermaid через CDN, отдельный HTML-REPORT.md со скаффолдом), здесь
упрощено до текстового описания карточки кандидата - добавить HTML-версию,
если понадобится визуальный отчёт.

## Кластер research/fact-check/writing/academic (собран)

Шесть блоков (`fact-check`, `de-ai-text`, `research-deep`, `research-loop`,
`academic-research`, `academic-review`) плюс два as-is-подключения
(`rabbithole`, `transcribe`) и пять library-советчиков (`web-scrape-stealth`,
`url-to-markdown`, `pdf-parse`, `research-search-mcp`, `transcribe-alt`)
собраны по 28 источникам (разведка + самостоятельный поиск транскрибатора).
Полный отчёт разведки в этой сессии не сохранён отдельным файлом каталога —
если понадобится восстановить, источники и лицензии перечислены в
`source:`/`summary:` каждого нового `block.yaml`.

### Аналитика — пропущено осознанно

Прямых источников почти нет (ближайшее — научная статистика внутри
`claude-scholar`/OmniScientist, не бизнес/продуктовая аналитика). По решению
пользователя не строится отдельным блоком — существующий блок `metrics`
считается достаточным. Вернуться, если появятся источники именно по этой теме.

### Написание текстов вне науки — пропущено осознанно

Все писательские источники из брифа (`claude-scholar`, `claude-scientific-writer`,
`academic-research-skills`) завязаны на академический формат. По решению
пользователя блок «письмо вообще» не строится. `de-ai-text` покрывает стилевую
правку любого текста независимо от жанра — это не то же самое, что
конструктивная помощь в написании нового текста с нуля.

### OmniScientist — не блок, только упоминание

Тяжёлая автономная система (гипотеза → код → анализ → статья с
provenance-трекингом, MIT), не промпт-скилл — не вписывается в формат
«блок = скилл/плагин Codex». По решению пользователя не строится и не
разбирается подробнее. Если появится конкретная задача, которую не закрывают
`research-deep`/`academic-research`, вернуться и разобрать прицельно.

### google-deepmind/science-skills — нишевые научные домены

Геномика, структурная биология, хемоинформатика (Apache-2.0 + CC-BY) — не
общий academic writing, другая ниша. Не взято ни блоком, ни в library —
кандидат, если у пользователя появится проект именно в одном из этих доменов.

### lightpanda — исключён из library по лицензии

AGPL-3.0 обязывает открывать код при встраивании в сервис. По решению
пользователя не включён даже как кандидат в `library/web-scrape-stealth`
(там только CloakBrowser/obscura/Botasaurus). Если проект открытый (сам под
AGPL/GPL) или встраивание не подпадает под требования copyleft — можно
пересмотреть точечно, не по умолчанию.

### Узкие/справочные источники — не самостоятельные блоки

- **xmcp** (X/Twitter API) — узкоспециализирован, кандидат в library только
  если у пользователя появится проект именно с Twitter-данными.
- **browser-trace** (browserbase) — не парсер, а отладочный CDP-наблюдатель
  поверх уже работающей браузерной автоматизации; спутник для
  `web-scrape-stealth`-инструментов при отладке, не отдельная задача.
- **osint.juanmathewsrebellosantos.com** — каталог 2300 бразильских
  OSINT-инструментов, справочный материал, не структурированный источник для
  синтеза скилла.

### claude-video — пересечение с `transcribe`, не конфликт

`claude-video` (MIT, скачивание видео + Whisper-транскрипция + кадры) не
взят как отдельный блок в этом проходе — область частично пересекается с
`transcribe`, но `claude-video` про весь конвейер видео, `transcribe` только
про распознавание речи. Ставить `claude-video` отдельно, если понадобится
полный видео-конвейер, не только транскрипция.

## Стек seo (собран)

Десять блоков `seo-*`/`geo-*`/`llms-txt` реализованы (см. `blocks/`,
зарегистрированы в `marketplace.json`, скелет `stacks/seo/`). Источники
и синтез — см. `blocks/*/block.yaml` каждого блока и исследовательский
отчёт по ~20 источникам (сессия сборки). Ниже — что сознательно отложено.

### Core Web Vitals — детали не дублированы

`seo-audit` (слой Signals, root-cause LCP/CLS/INP) ссылается на CWV как
SEO-сигнал, но не переизобретает то, что уже есть в `web-fundamentals`/
`web-motion` (стек `interface`) — измерительный инструментарий (Lighthouse/
CrUX) сознательно не встроен по умолчанию (см. `seo-audit/SKILL.md`, шаг
8: Lighthouse выключен). Пересечение зафиксировано в `CONFLICTS.md`,
раздел «Стек seo».

### useosint recon-методология — будущий референс для seo-offpage

Из отчёта: `useosint/skills` (28 скиллов деанонимизации/расследований,
MIT) не по теме SEO напрямую, но методология «passive recon + source
attribution» может усилить `seo-offpage` (поиск площадок-доноров,
оценка внешних сигналов) при углублении блока — не разобрана построчно
в этом проходе, источник не читался дальше README.

### kostja94/marketing-skills SEO-категория — не проверено построчно

160+ скиллов заявлено (technical/on-page/content/off-page/local,
markdown-only). Из полученного README не видно глубины конкретных файлов
(robots-txt, meta-description и т.д. — только названия). Не взято в
синтез блоков `seo-*` без точечной проверки — вернуться, если текущих
источников (seojuice, open-seo, aaron, coreyhaines31) окажется мало для
конкретного проекта.

### orchestrator/coach-скилл для стека seo — не построен

`every-app/open-seo` содержит готовый паттерн `seo-coach` — «что
запускать дальше» (роутер по остальным SEO-скиллам). Кандидат в будущий
блок `seo-coach`, аналогичный по роли `library/codebase-map`-подсказчику
или встроенному роутингу codex-kit, но не построен в этом проходе — по
прямому решению пользователя не расширять утверждённый список из 10
блоков.

### Платные API — только через library, не встроены

`DataForSEO`/`SerpApi`/MCP-сервер `open-seo` — опция для тех, у кого уже
есть подписка, описана в `library/seo-crawler-tool/README.md` и
`library/seo-audit-approach/README.md`. Ни один блок `seo-*`/`geo-*` не
требует их по умолчанию (`requires_env: []` везде) — все работают
промпт-методологией на статически доступных данных.

## Визуализация (собрано)

Два блока `diagram-schemas` (архитектура/workflow/sequence/dataflow/
lifecycle, синтез Archify-Labs/archify + cathrynlavery/diagram-design, MIT)
и `chart-selection` (companion к встроенному `dataviz`, синтез конспекта
ниже + идеи lieflat-charts без кода) собраны, зарегистрированы в
`marketplace.json`, скелет `stacks/visualization/`. Разведка: archify,
diagram-design, lieflat-charts, effective-html, foglamp.dev/scan (5
источников) плюс конспект Owl-Listener ниже.

### Что не взято и почему

- **lieflat-charts** - только идеи (дерево выбора чарта, файл токенов как
  источник правды, режим отчёта). Лицензия PolyForm Noncommercial запрещает
  коммерческое использование кода, ни строки не перенесено.
- **effective-html** - не отдельный блок, дублирует `artifact-design`/
  `dataviz`/`artifact-diagramming` по большей части содержания. Два признака
  ИИ-эстетики, которых не было в `web-taste/gate-check`, добавлены туда
  отдельным разделом "Дополнительно" (не внутрь дословных 58 гейтов
  hallmark, чтобы не портить их нумерацию).
- **foglamp.dev/scan** - закрытый SaaS, кода нет. JSON-схема графа сервисов
  (entry/agent/model/tool/service/store, edges calls/reads/writes/triggers)
  похожа по назначению на то, что уже делает `graphify` (статический
  HTML/MD/JSON экспорт), не новый блок, а точка роста для `graphify`,
  отложена: правка чужого рабочего блока без проверки на реальном проекте
  сейчас не оправдана.

### Конспект-источник (Owl-Listener/designer-skills)

Источник: Owl-Listener/designer-skills, `ui-design/skills/data-visualization`,
MIT, разобран в ходе работы над `web-fundamentals`, использован при синтезе
`chart-selection`. Конспект оставлен ниже как есть, для справки:

**Выбор чарта по задаче:**
- Сравнение: bar chart (категориальные), grouped bars (мультисерия),
  bullet chart (цель vs факт)
- Тренд во времени: line chart (непрерывные), area chart (объём),
  sparkline (инлайн)
- Часть от целого: pie/donut (мало категорий), stacked bar (много
  категорий), treemap (иерархические)
- Распределение: histogram, box plot, scatter plot
- Отношение: scatter plot, bubble chart, heat map

**Принципы дизайна:** data-ink ratio — максимум данных, минимум декора;
чёткие подписи осей и легенды; согласованное цветовое кодирование across
views; ось Y бар-чарта начинается с нуля; аннотации для ключевых инсайтов.

**Цвет в data viz:** sequential (светлый→тёмный для упорядоченных данных),
diverging (двухцветная шкала для выше/ниже медианы), categorical
(отличимые оттенки для несвязанных категорий), colorblind-safe палитры
(избегать чисто red-green).

**Accessibility:** не полагаться только на цвет — паттерны/лейблы/формы;
текстовые альтернативы для чартов; keyboard-навигируемые интерактивные
чарты; достаточный контраст элементов данных.

**Responsive:** упрощать на маленьких размерах (меньше точек данных,
крупнее лейблы); альтернативные представления для мобильного (таблица
вместо чарта); touch-дружелюбные тултипы.

**Best practices:** выбирать простейший чарт, доносящий инсайт; подписывать
прямо на чарте, избегая легенды где возможно; давать контекст
(бенчмарки, цели, тренды); тестировать на реальных данных, не идеальных
сэмплах; давать возможность исследовать детали по запросу.

Категориальная цветовая рампа — забота будущего `web-color`, этот файл
владеет только выбором типа чарта и энкодингом.

## ux-writing собран, но не из тех источников, что были в брифе

`balise-ux-writing.md` и `spec-notes.md` (изначальные источники `ux-writing`
из первого брифа, лежат в `test/figma/`) при полном прочтении оказались
Figma-canvas-специфичными — работают с фреймами/слоями внутри открытого
файла Figma («selected layers, frames, components», «share a frame or
flow»), не портативны на код. Блок `ux-writing` вместо них собран из
`jakubkrehel/skills/better-writing` (портативный, код-агностичный,
дословно, MIT) — источник, который был в исходном списке репозиториев
целиком, но агент пропустил его чтение в сессии сборки `web-taste` ради
экономии времени.

Оба Figma-файла остаются непристроенными — по содержанию (annotate
frames, dev-handoff notes, review/rewrite/generate/harmonize внутри
Figma-файла) больше похожи на кандидатов в `figma-canvas` (например,
рядом с `annotate`/`design-docs`), чем на отдельный блок. Не пристроены,
решение по ним не принято.

## Стек dev

Восемь блоков собраны в `stacks/dev/` и `blocks/dev-*`, `readme-polish` —
черновики (`status: черновик`), не проверены на реальном проекте.

Не взято намеренно: frontend-ui-engineering — фронт не в фокусе;
supergoal/unlazy — сверены с `/loop-build`/`/orchestrate`, полезное уже
перенесено (гейт-условие в `orchestrate`); RAG/Agent Designer — не трогать
по прямому решению; incident-commander/runbook-generator — см. раздел
«Прод-готовность» ниже (теперь собрана, см. «Стек prod» в начале файла,
`tech-debt-tracker` там же); db-designer — нишевый, не запрошен явно.

**Playwright готов** — блоки `playwright` (тонкая обёртка над официальным
Playwright Test, под e2e/регрессионные автотесты и CI) и `webapp-testing`
(порт официального anthropics/skills, Apache 2.0 — проверка фичи в
браузере на лету, не набор тестов). `Webwright` (microsoft/Webwright) из
исходного «трио» пропущен осознанно — это не тестовый инструмент, а
автономный browser-agent фреймворк для долгих веб-задач, другая
категория задач, не «тесты».

## Стек secure

### Точки роста (агенты)

- **fixer-агент.** Сейчас фикс находок делает родительская сессия под контролем
  пользователя. Осознанно: автопочинку дыр опасно отдавать субагенту. Если ручной
  фикс станет узким местом — завести `sec-fixer` с жёсткими рамками (только под
  подтверждённый CONFIRMED, тест до и после, откат при красном).
- **completeness-critic.** Аудит может дать «всё чисто» на дырявом проекте. Если
  начнёт — завести агента, который спрашивает «что не проверено: зона без файлов,
  claim без верификации, непрочитанный источник». Его находки — вход в новый
  проход. Пока трёх агентов (hunter/verifier/redteam) хватает.

### AGENTS.md стека secure — под вопросом

`stacks/secure/repo/AGENTS.md` несёт раздел «Безопасность» в проект. Возможно
лишний: правила дублируются в `sec-policy` и записываются через `/sec-init`.
Решение отложено — пользователь посмотрит после нескольких прогонов, оставлять
или убрать (тогда политику ставит только `/sec-init`).

### Не взято из Cloudflare security-audit

- **Memory safety** (buffer overflow, use-after-free) — класс для C/C++/бинарников.
  Вайб-стек пользователя на JS/Python, не релевантно. Добавить, если появится
  нативный код.
- Взято: шкала severity, правило слоёв (defense-in-depth), анти-паттерны отчёта,
  требование конкретного эксплойта, `findings.json`, интеграция прошлого прохода.

## Прод-готовность (собрана — см. «Стек prod» в начале файла)

Раньше здесь ждали появления реального прода с дежурствами. Incident Commander
лёг в основу `prod-incident-response` (живая фаза инцидента), Runbook
Generator отдельно не строился — его функция уже внутри incident-commander
(секция "Runbook Generation Framework"). Источник:
https://github.com/alirezarezvani/claude-skills

### Материалы, прочитанные частично

Чеклист собран из: 15 вайб-угроз, 30 правил хардненинга, security-baseline
(rampstack), security-and-hardening (addyosmani). Не читались построчно: Gruyere
(учебные упражнения Google), dwheeler secure-programs (книга по C/Unix — низкий
приоритет для веб-стека). При необходимости углубить — оттуда.

## web-visual / website - осиротевшие записи, закрыто

Блок `blocks/web-visual` и стек `stacks/website` удалены в 87c519c
(«чистка обломков»): блок был рыбой со `status: рыба` и TODO вместо шагов,
стек нёс только его. Запись в `marketplace.json` и два упоминания в README
тем коммитом не дочистили. Убраны: запись плагина, пример подключения на
`web-visual` (заменён на `dev-debug`), строка стека `website` в таблице.
Заодно ссылка на `docs/brief.md` «из стека website» в блоке `positioning`
переведена на живой стек `visualization`. Восстанавливать нечего: тему
покрывают `web-fundamentals`/`web-color`.

