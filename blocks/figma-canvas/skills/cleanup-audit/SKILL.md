---
name: cleanup-audit
description: >-
  Наводит порядок в панели слоёв Figma (переименование, удаление пустых
  групп, сборка страев) или строит на холсте полный аудит-документ по всем
  компонентам страницы (инвентарь, ghost-компоненты и стили из внешних
  библиотек, дубликаты, орфаны) и чинит найденное. Использовать по фразам
  «прибери слои», «почисти панель слоёв», «аудит компонентов», «найди
  ghost-компоненты/стили», «что тут от чужой библиотеки». Требует холст
  Figma (use_figma/evaluate_script) — без него не работает.
---

# Cleanup & Audit

Два независимых режима на одном холсте Figma. Выбирай по формулировке
запроса: «почисти слои» → Layer Cleanup, «проаудируй компоненты» /
«ghost-стили» → Component Audit.

Если не уверен прямо спроси у пользователя.

## Режим 1 — Layer Cleanup

Приводит панель слоёв выбранного фрейма (или текущей страницы, если ничего
не выделено) к состоянию документации, а не хаоса.

### Шаг 1 — Аудит

Прочитать дерево узлов выделения. Посчитать и показать пользователю до
внесения правок:
- слои с дефолтными именами (Frame 427, Rectangle 12, Group 8, image 4…)
- скрытые слои
- пустые группы и фреймы
- отсоединённые (detached) инстансы компонентов — только отметить, не чинить
- слои, стоящие далеко за пределами родителя (страи/орфаны)

### Шаг 2 — Семантическое переименование

Переименовать каждый дефолтный слой по его роли и содержимому:

- текстовые слои → их контент, укороченный до ~30 символов: `"Get started today"`, не `Text 14`
- кнопки → `btn/primary/get-started`, `btn/ghost/cancel`
- иконки → `icon/arrow-right`, `icon/close`
- изображения → `img/hero-product`, `img/avatar-user`
- контейнеры → их роль: `nav`, `hero`, `card/pricing`, `footer`, `section/testimonials`
- фоны и декоративные фигуры → `bg/gradient`, `decor/blob-01`

Правила: kebab-case, lowercase, `/` для группировки. Никогда не переименовывать
инстансы компонентов и слои, у которых уже есть осмысленное, не дефолтное имя.
Имена — на английском.

### Шаг 3 — Структурная уборка

- удалить пустые группы и фреймы (0 детей, 0 fills/effects)
- удалить полностью прозрачные слои без эффектов, не несущие функции
- разгруппировать группы с одним ребёнком (кроме тех, что несут стили или constraints)
- вернуть страи в ближайшего логического родителя или собрать их во фрейм
  `_orphans` на краю выделения
- упорядочить слои сверху вниз по визуальному порядку чтения, где это возможно

Никогда:
- не удалять скрытые слои без предварительного списка и подтверждения — это
  могут быть альтернативные состояния
- не отсоединять и не перестраивать инстансы компонентов
- не менять визуальные свойства (позицию внутри родителя, размер, fills, effects)

### Шаг 4 — Отчёт

Короткое before/after: сколько слоёв переименовано, сколько пустых групп
удалено, сколько страев перемещено, что пропущено и почему (например,
скрытые слои оставлены нетронутыми до подтверждения).

---

## Режим 2 — Component Audit

Аудит всех компонентов текущей страницы (или указанной секции): сканирует
внешние/ghost стили, переменные и remote-компоненты, строит структурированный
аудит-документ на холсте и чинит найденные проблемы.

Входные данные: **вся текущая страница** (обходит ВСЕ узлы страницы, не
только выделение) — выделение слоёв игнорируется, аудит всегда покрывает
всю страницу.

### Шаг 1 — Инвентарь компонентов

`evaluate_script` рекурсивно обходит все узлы текущей страницы. Для каждого
инстанса записать: имя компонента и его сета (если это вариант), node ID
главного компонента и сета, remote ли компонент (`mainComponent.remote`),
на какой странице живёт главный компонент, число вариантов, число инстансов
на странице.

Группировать по component set (ключ — ID сета, иначе ID компонента),
сортировать по числу инстансов по убыванию. Флаги:

- **орфаны**: компоненты не привязаны ни к одной странице (внутренние
  read-only узлы, `page === null`)
- **проблемы именования**: опечатки в именах variant-свойств, generic-имена
  вроде "Property 1"
- **дубликаты сетов**: несколько component sets с одинаковым именем, но
  разными node ID
- **компоненты не на своём месте**: живут не на той странице

### Шаг 1b — Внешние зависимости (стили, переменные, ghost-компоненты)

Второй проход `evaluate_script` — ловит внешние библиотечные зависимости,
которые пропускает шаг 1.

**Ghost-компоненты** (remote-компоненты из внешних библиотек): обойти все
INSTANCE-узлы, для каждого проверить `instance.mainComponent.remote`. Если
true — записать имя компонента/сета, источник библиотеки (по паттерну
именования или префиксу ключа), число инстансов, node ID. «Ghost-компонент»
— любой remote-компонент из библиотеки, которая НЕ является основной
дизайн-системой файла — то есть залётный остаток от другой библиотеки.

**Внешние стили**: обойти все узлы, проверить `fillStyleId`, `strokeStyleId`,
`textStyleId`, `effectStyleId`. Для каждого непустого styleId —
`await figma.getStyleByIdAsync(styleId)`, проверить `style.remote`. Записать
имя, тип (Fill/Stroke/Text/Effect), источник библиотеки (из
`style.description` или паттерна имени), число использований. Разделить на
**стили основной библиотеки** (наибольшее число использований) и
**ghost-стили** (всё остальное).

**Внешние переменные**: обойти все узлы, проверить `node.boundVariables`:

```js
const bv = node.boundVariables;
if (bv) {
  for (const [prop, binding] of Object.entries(bv)) {
    // binding может быть одним VariableAlias или массивом
    const aliases = Array.isArray(binding) ? binding : [binding];
    for (const alias of aliases) {
      if (alias && alias.id) {
        const variable = await figma.variables.getVariableByIdAsync(alias.id);
        if (variable) {
          const collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
          // Записать: имя переменной, имя коллекции, resolved type, число использований
          // Флаг "ghost", если коллекция не из основной библиотеки
        }
      }
    }
  }
}
```

Группировать по коллекции и источнику библиотеки, флагить переменные не из
основной библиотеки как ghost.

### Шаг 2 — Построение аудит-документа

Создать через `evaluate_script` один фрейм 960px на текущей странице.
**Grayscale-оформление везде** — цвет только для severity-бейджей и
статус-тегов.

Структура сверху вниз:

**Header** — заголовок "Component Audit", подзаголовок
"Full page audit | X unique components | Y total instances | Z remote
components | N component pages | M external styles | V external variables".

**How to Read This Document** — светло-серая карточка (bg 0.96 gray, radius
8) с объяснением разделов и легендой severity. Без эмодзи.

**Overview** — заголовок 24px Bold, 4 карточки в ряд (bg 0.96 gray, radius
8, padding 20): Full Page/Screens Audited, component count/Unique
Components, instance count/Total Instances, page count/Component Pages.

**Issues & Actions** (одна таблица) — фиолетовый header (rgb 0.42, 0.28,
0.7), колонки: Severity (100px) | Issue (300px) | Action Required (260px) |
Status (100px) | Result (200px). Severity-бейджи: Critical (red 0.85,0.18,0.18),
Warning (orange 0.9,0.55,0.1), Suggestion (blue 0.2,0.45,0.85). Status-бейджи:
"Done" (green 0.18,0.7,0.35) или "Not Started" (gray 0.6). Чередующийся фон
строк (white/0.96 gray).

**Component Inventory** (ОДНА единая таблица — не делить по категориям):
заголовок 24px Bold, подзаголовок "All X components on this page. Each row
includes an inline preview at default state." Фиолетовый header, колонки:
Preview (160px) | Component (220px) | Category (120px) | Variants (70px) |
Uses (50px) | Page (100px) | Component ID (240px). Каждая строка — все 7
ячеек фиксированной ширины. ВСЕ компоненты в одной плоской таблице,
отсортированной по числу использований по убыванию — без группировки по
категориям. Категории назначать короткой меткой (например "Tags", "Icons",
"Headers", "Audit", "Utility", "Surfaces", "Data Table", "Color", "Changelog",
"Annotations", "Org", "Remote").

**External Dependencies** — разделитель 1px gray, заголовок 20px Bold,
сводка "X ghost components from N libraries | Y external styles from N
libraries | Z external variables from N collections", 4 карточки статистики.

**Ghost Components Table** (только если найдены) — заголовок 16px Semi
Bold красный (0.85,0.18,0.18), красный header (rgb 0.85,0.18,0.18),
колонки: Preview (160px) | Component (200px) | Library Source (150px) |
Instances (70px) | Suggested Action (380px).

**Ghost Styles Table** (только если найдены) — заголовок 16px Semi Bold
оранжевый (0.9,0.55,0.1), оранжевый header, колонки: Ghost Style Name
(260px) | Type (80px) | Uses (60px) | Suggested Replacement (280px) |
Description (280px). Suggested Replacement — синим текстом (rgb
0.2,0.45,0.85), ближайший эквивалент из основной библиотеки.

**Primary Library Styles Table** — заголовок 16px Semi Bold, тёмный header
(rgb 0.2,0.2,0.2), колонки: Style Name (300px) | Type (80px) | Uses (80px) |
Style ID (500px). Топ-20 стилей по использованию, если больше — итоговая
строка "+ N more styles with fewer than X usages each". Style ID — fontSize
9, gray (0.6).

**External Variables Table** (только если найдены) — заголовок 16px Semi
Bold оранжевый, оранжевый header, колонки: Variable Name (250px) |
Collection (200px) | Type (100px) | Uses (70px) | Library Source (340px).
Группировать по коллекции, сортировать по использованию.

### Inline preview-инстансы (критично)

Первая ячейка каждой строки (Preview, 160px) должна содержать **живой
инстанс компонента** в дефолтном состоянии:
1. Найти узел компонента по ID
2. Если COMPONENT_SET — создать инстанс из `defaultVariant` или `children[0]`
3. Если COMPONENT — создать инстанс напрямую
4. Добавить в ячейку preview
5. Выставить `layoutSizingHorizontal: "FIXED"` и `layoutSizingVertical: "FIXED"` на инстансе
6. Уменьшить, если шире 140px или выше 48px, через `instance.rescale()`
7. Центрировать в ячейке через `primaryAxisAlignItems: "CENTER"` и `counterAxisAlignItems: "CENTER"`

### Конструкция ячеек

Каждая ячейка любой строки строится строго так:

```js
const cell = figma.createFrame();
cell.layoutMode = "VERTICAL";
cell.primaryAxisSizingMode = "AUTO";
cell.counterAxisSizingMode = "FIXED";
cell.primaryAxisAlignItems = "CENTER";
cell.fills = [];
cell.paddingLeft = 12;
cell.paddingRight = 4;
cell.resize(COLUMN_WIDTH, 1);  // точная ширина из спеки колонки
row.appendChild(cell);
```

Preview-ячейки используют HORIZONTAL layout вместо VERTICAL.

### Конструкция строк

```js
const row = figma.createFrame();
row.layoutMode = "HORIZONTAL";
row.primaryAxisSizingMode = "FIXED";
row.counterAxisSizingMode = "AUTO";
row.fills = solid(rowIndex % 2 === 0 ? WHITE : GRAY_BG);
row.itemSpacing = 0;
row.minHeight = 52;
row.counterAxisAlignItems = "CENTER";
table.appendChild(row);
row.layoutSizingHorizontal = "FILL";
```

### Правила лейаута

- Фрейм документа: 960px, вертикальный auto-layout, `primaryAxisSizingMode: AUTO`,
  padding 48px, itemSpacing 40px
- Все прямые дети документа: `layoutSizingHorizontal: FILL`
- Контейнер таблицы: вертикальный auto-layout, cornerRadius 8, clipsContent
  true, 1px gray stroke
- Строки таблицы: горизонтальный auto-layout, FILL ширина, AUTO (hug) высота
- Ячейки: FIXED ширина по спеке колонки, AUTO (hug) высота — НИКОГДА не
  давать ячейкам hug по ширине, иначе колонки разъедутся
- Все текстовые узлы: `textAutoResize: "HEIGHT"`, `layoutSizingHorizontal: "FILL"` внутри своей ячейки
- Бейджи: auto-layout фреймы с `primaryAxisSizingMode: AUTO` (hug текста), cornerRadius 4
- Разделители: 1px прямоугольники с `layoutSizingHorizontal: FILL`
- Без эмодзи
- Шрифт: Inter (Regular, Semi Bold, Bold) — загрузить все три начертания до создания текста
- Колонка Component ID: fontSize 9, gray (0.6)
- Колонка имени компонента: Semi Bold
- Весь остальной текст: Regular, fontSize 11

### Батчинг

Если компонентов больше 40 — разбить создание строк на несколько вызовов
`evaluate_script` (пачками по ~40 строк). Фрейм документа и header-строку
создать в первом вызове, затем добавлять строки в последующих через node ID
таблицы.

### Шаг 3 — Исправление проблем

Продолжать исправления сразу после построения аудита, без запроса
подтверждения.

**Орфаны**: клонировать орфанный узел (`node.clone()` — read-only узлы
нельзя перемещать), разместить клон на подходящей странице компонентов
(Utility или ближайшее соответствие), заменить все инстансы по файлу
(`instance.swapComponent(clone)`), залогировать число замен.

**Проблемы именования** (опечатки в именах компонентов или variant-свойств):
для имён компонентов — переименовать напрямую, если можно писать
(`node.name = corrected`); для variant-свойств —
`componentSet.editComponentProperty(key, { name: corrected })` и
переименовать дочерние варианты. Посчитать затронутые инстансы.

**Дубликаты component sets**: выбрать один канонический сет; если
орфанный/read-only — клонировать, поправить на клоне, разместить на
странице компонентов; заменить все инстансы по совпадению значений
variant-свойств; залогировать число замен по каждому старому сету.

**После исправлений** — обновить таблицу Issues & Actions: статус-бейджи на
"Done" (зелёный), заполнить колонку Result числом замен и деталями.

### Шаг 4 — Финальный проход по размерам

После построения всех секций (включая External Dependencies) выполнить
рекурсивный bottom-up проход по всему документу, чтобы ничего не обрезалось:

```js
function fixSizing(node) {
  if (!("children" in node) || node.type === "INSTANCE") return;
  for (const child of node.children) fixSizing(child);
  if (node.type !== "FRAME" || !node.layoutMode) return;

  // Корневой фрейм документа: фиксированная ширина, hug высота
  if (node.id === docFrame.id) {
    node.primaryAxisSizingMode = "AUTO";
    return;
  }

  // Строки таблиц (горизонтальный layout внутри таблиц)
  if (node.layoutMode === "HORIZONTAL" && node.parent && node.parent.layoutMode === "VERTICAL") {
    node.counterAxisSizingMode = "AUTO"; // hug высота
    for (const cell of node.children) {
      if (cell.type === "FRAME" && cell.layoutMode) {
        cell.primaryAxisSizingMode = "AUTO"; // hug высота
        const w = cell.width;
        cell.counterAxisSizingMode = "FIXED";
        cell.layoutSizingHorizontal = "FIXED";
        cell.resize(w, cell.height);
      }
    }
    return;
  }

  // Вертикальные контейнеры (таблицы, секции): hug высота
  if (node.layoutMode === "VERTICAL") {
    node.primaryAxisSizingMode = "AUTO";
  }
}
```

Проход обязательно снизу вверх (дети раньше родителей), чтобы родительские
фреймы корректно измеряли детей. Сохраняет FIXED ширину ячеек, позволяя
всему остальному hug'аться по вертикали.

Запустить `fixSizing(docFrame)` последней операцией, затем сделать
скриншот документа для проверки.

### Важные технические заметки

- Использовать `primaryAxisAlignItems` (НЕ `primaryAlignItems` — последнее
  крашится)
- Внутренние read-only узлы нельзя перемещать — всегда клонировать сначала
- Загружать шрифты через `figma.loadFontAsync()` до любых изменений текста
- При создании инстансов всегда выставлять `layoutSizingHorizontal: "FIXED"`
  и `layoutSizingVertical: "FIXED"`, чтобы они не растягивались
- Ячейки таблиц должны иметь FIXED ширину (`counterAxisSizingMode: "FIXED"`)
  — никогда не hug, иначе колонки разъедутся
- Строки должны иметь FIXED primary axis (`primaryAxisSizingMode: "FIXED"`)
  и FILL по горизонтали, AUTO по counter axis (hug высоты)
- Для component sets — `figma.combineAsVariants(components, parent)`, после
  чего на каждом ребёнке выставить `layoutPositioning: "AUTO"`
- Предпочитать живые инстансы скриншотам — хэши изображений из
  `figma.createImage()` могут не пережить разные вызовы скрипта
- Обнаружение внешних стилей: проверить `fillStyleId`, `strokeStyleId`,
  `textStyleId`, `effectStyleId` на каждом узле, затем
  `await figma.getStyleByIdAsync(id)` и `style.remote`
- Обнаружение переменных: итерировать записи `node.boundVariables` — каждое
  значение может быть одиночным `VariableAlias` или массивом, всегда
  нормализовать в массив перед обработкой
- `figma.variables.getVariableByIdAsync()` и
  `figma.variables.getVariableCollectionByIdAsync()` — асинхронные, всегда
  await
- Эвристика ghost: библиотека с наибольшим суммарным использованием
  стилей/переменных — "основная", все остальные — ghost/залётные
- При сканировании стилей/переменных группировать по источнику библиотеки и
  сортировать по использованию по убыванию внутри группы
- Таблицы внешних зависимостей следуют той же конструкции ячеек/строк/таблиц,
  что и Component Inventory — FIXED ширина ячеек, FILL ширина строк, hug
  высота везде
- Между крупными секциями документа всегда добавлять разделитель 1px gray
  (`layoutSizingHorizontal: FILL`)

---

## Инструменты

Оба режима используют `use_figma`/`evaluate_script` официального Figma
MCP (плагин `figma`, см. блок `figma-mcp`). Лимит вызовов инструмента у
Figma MCP зависит от типа сиденья (Starter/View/Collab — 6 вызовов/месяц,
Dev/Full — без лимита); Component Audit при 40+ компонентах легко расходует
десятки вызовов за прогон — см. предупреждение в блоке `figma-mcp`.

---

*Адаптировано из скиллов Figma Community `layer-cleanup` и
`analyze-components` под формат Codex и инструменты `figma-mcp`.*

---

## Проверяемый результат (для /loop-build)

Разное по скиллу: `cleanup-audit` — готово, когда повторное чтение
component/ghost-style audit возвращает пустой список находок (реальная
команда через Plugin API). `design-docs`/`type-scale` уже несут
собственный Pass 6 self-check (см. type-scale.md) — используй его как
критерий. `annotate`/`flow-explore`/`reporting`/`camera-pan-and-zoom`/
`ios-app-design` — вердикт verifier-subagent по итоговому виду холста,
команды для "красиво ли аннотировано" не существует.

## Все 7 скиллов — НЕ параллелить

Все семь работают через `use_figma`/`evaluate_script` на **одном и том же
открытом файле Figma**. Параллельные вызовы Plugin API на общий холст
топчут друг друга (выделение, undo-стек, только что созданные ноды) —
это не независимые зоны, как в `sec-audit`, это одна общая шина.
Даже если пользователь просит несколько задач сразу (убрать слои И
задокументировать И расставить аннотации) — вести последовательно в
одной сессии, не раздавать по subagent. Единственное безопасное
распараллеливание — не внутри файла, а между разными файлами Figma
(subagent на файл, если их несколько).

