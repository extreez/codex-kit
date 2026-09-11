> Расчётная часть скилла `make-a-type-scale` (Figma Community), портирована
> без Figma — код-агностичный вариант. Логика расчёта (12 соотношений,
> grid-snap с подсчётом коллизий, split-scale, формула line-height)
> перенесена один в один, дословно, без изменений — см. оригинал с полным
> Figma-workflow (P4-P6, создание FLOAT-переменных и таблицы на холсте) в
> `blocks/figma-canvas/skills/design-docs/type-scale.md`. Здесь P1
> адаптирован (спросить базовый размер вместо чтения выделения в Figma), а
> вывод — CSS custom properties / design-tokens JSON вместо Figma Variables.

# Типографическая шкала (код-агностично)

Строит полный набор размеров шрифта из одного базового значения: разбивку
в чате, таблицу-специмен, вывод как CSS custom properties или JSON токенов.

Выполнять как **серию вопросов**. Один вопрос, ждать ответ, действие,
следующий вопрос. Не объединять вопросы, не пропускать шаги.

Порядок: `P1 → P2 → (P2b) → P3 → A1 → A2 → вывод токенов`

## P1 — Базовый размер

Спросить: "Какой базовый размер шрифта (в px) и семейство использовать
как body-текст?" Если пользователь уже назвал число в исходном запросе —
взять его, не переспрашивать.

## P2 — Какая шкала?

Если уже названа в исходном запросе ("золотое сечение", "perfect fourth",
"Tailwind", "8px grid") — взять её, сказать какую взял, не спрашивать.

Иначе спросить, с номерами:

> **Модульная — одно соотношение, накопительно**
> 1. Major second `1.125` — плотный UI, много рабочих шагов
> 2. **Fifth root of two `1.1487`** — классическая, крупнейший шаг ровно
>    вдвое больше body *(по умолчанию)*
> 3. Minor third `1.2` — безопасная середина
> 4. Perfect fourth `1.333` — редакторский стиль, сильная иерархия
> 5. Golden ratio `1.618` — display и маркетинг
>
> **Другие формы**
> 6. **Grid-snapped** — модульная шкала, округлённая под сетку 4 или 8px
> 7. **Платформенный пресет** — Tailwind, Material 3, Apple HIG, IBM Carbon
> 8. **Split** — тесное соотношение для body, свободное для display
>
> Или назвать любое другое соотношение — доступны все двенадцать.

Всего 12 соотношений живут в `RATIOS` (см. A1) — в вопросе только пять,
меню из двенадцати хуже, чем вариант по умолчанию.

## P2b — Уточнение (только после 6, 7 или 8)

**Если выбрали 6 — grid-snapped.** Сетка и соотношение не независимы,
спросить вместе. Коллизий не даёт ни при одной целой базе от 14 до 26px
только три пары:

> 1. **Сетка 4px**, perfect fourth `1.333` — чисто при любой базе
>    *(по умолчанию)*
> 2. **Сетка 4px**, perfect fifth `1.5` — прыжки крупнее, тоже чисто
> 3. **Сетка 8px**, golden ratio `1.618` — 8px требует очень широкого
>    соотношения, чтобы шаги не слипались

Правило — это пол для соотношения: сетка 4px требует минимум `1.333`,
сетка 8px — минимум `1.618`. Уже теснее — коллизии где-то в обычном
диапазоне базовых размеров.

**Если выбрали 7 — платформенный пресет:**

> 1. **Tailwind** — 12 14 16 18 20 24 30 36 48 60 72 96
> 2. **Material 3** — 11 12 14 16 22 24 28 32 36 45 57
> 3. **Apple HIG** — 11 12 13 15 17 20 22 28 34
> 4. **IBM Carbon** — 12 14 16 20 28 32 42 54

Это буквальные размеры, база игнорируется. Сказать "rebase", если нужно
масштабировать весь пресет под свою базу.

**Если выбрали 8 — split-шкала:**

> 1. `1.125` body / `1.333` display, переход через 2 шага *(по умолчанию)*
> 2. `1.2` body / `1.5` display, переход через 2 шага — заголовки резче
> 3. `1.125` body / `1.618` display, переход через 3 шага — большой скачок
>    к display-размерам

Два предупреждения: grid-snapped шкала перестаёт быть ровным
соотношением (snapping — это и есть цель, но часть шагов становится
неравной). Грубая сетка может съесть соотношение целиком и выродиться в
арифметическую последовательность `+grid` — считать коллизии
(`meta.collisions`), не прятать их.

## P3 — Сколько шагов?

Посчитать предложение через `suggestStepsUp(base, r)` — наибольшее число
шагов до 5, не пересекающее сразу порог тайтенинга в 120px, спросить:

> Сколько шагов? **<k> вверх** от body и **1 вниз** — крупнейший на
> **<size>px** *(предложено)*, или назвать своё число.

Пропустить полностью для пресета (у него фиксированное число шагов по
определению) — сказать, что пропускаешь, а не промолчать.

## A1 — Расчёт шкалы (дословно, не менять логику)

```js
// ---------------------------------------------------------------- family 1: modular ratios
// `octave: k` means the ratio is 2^(1/k), so the scale hits an exact doubling every k steps.
const RATIOS = [
  { key: "minor-second",   name: "Minor second",       r: 1.067 },
  { key: "root6",          name: "Sixth root of two",  octave: 6 },
  { key: "major-second",   name: "Major second",       r: 1.125 },
  { key: "root5",          name: "Fifth root of two",  octave: 5 },
  { key: "root4",          name: "Fourth root of two", octave: 4 },
  { key: "minor-third",    name: "Minor third",        r: 1.2 },
  { key: "major-third",    name: "Major third",        r: 1.25 },
  { key: "root3",          name: "Cube root of two",   octave: 3 },
  { key: "perfect-fourth", name: "Perfect fourth",     r: 1.333 },
  { key: "aug-fourth",     name: "Augmented fourth",   r: Math.SQRT2 },
  { key: "perfect-fifth",  name: "Perfect fifth",      r: 1.5 },
  { key: "golden",         name: "Golden ratio",       r: (1 + Math.sqrt(5)) / 2 },
];
const DEFAULT_RATIO = "root5";

// ---------------------------------------------------------------- family 2: platform presets
const PRESETS = {
  tailwind: { name: "Tailwind", base: 16, steps: [
    ["xs", 12], ["sm", 14], ["base", 16], ["lg", 18], ["xl", 20], ["2xl", 24],
    ["3xl", 30], ["4xl", 36], ["5xl", 48], ["6xl", 60], ["7xl", 72], ["8xl", 96]] },
  material: { name: "Material 3", base: 16, steps: [
    ["label-small", 11], ["body-small", 12], ["body-medium", 14], ["body-large", 16],
    ["title-large", 22], ["headline-small", 24], ["headline-medium", 28],
    ["headline-large", 32], ["display-small", 36], ["display-medium", 45],
    ["display-large", 57]] },
  hig: { name: "Apple HIG", base: 17, steps: [
    ["caption2", 11], ["caption1", 12], ["footnote", 13], ["subheadline", 15],
    ["body", 17], ["title3", 20], ["title2", 22], ["title1", 28], ["largeTitle", 34]] },
  carbon: { name: "IBM Carbon", base: 16, steps: [
    ["label-01", 12], ["body-01", 14], ["body-02", 16], ["heading-03", 20],
    ["heading-04", 28], ["heading-05", 32], ["heading-06", 42], ["heading-07", 54]] },
};

const TIGHT_ABOVE_PX = 120;      // over this, display type needs tighter leading
const TIGHT_LINE_HEIGHT = 1.05;
const TAPER_BASE = 1.5;          // line height at the body size
const TAPER_STEP = 0.06;         // ...falling this much per step up

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function findRatio(key) {
  const hit = RATIOS.filter(function (x) { return x.key === key; })[0];
  if (!hit) throw new Error("unknown ratio: " + key);
  return hit;
}
function ratioValue(spec) {
  return spec.octave ? Math.pow(2, 1 / spec.octave) : spec.r;
}
function ratioLabel(spec) {
  return spec.name + " (" + Number(ratioValue(spec).toFixed(4)) + ")";
}

// h1 is always the LARGEST step. Beyond six there are no CSS heading names, so the extra top
// steps become display-1 (largest), display-2, ... and h1-h6 pick up below them.
function tokenName(n, stepsUp) {
  if (n === 0) return "p";
  if (n < 0) return n === -1 ? "small" : new Array(-n).join("x") + "small";
  const extras = Math.max(0, stepsUp - 6);
  const fromTop = stepsUp - n + 1;               // 1 = largest
  return fromTop <= extras ? "display-" + fromTop : "h" + (fromTop - extras);
}

function modularMultiplier(spec, n) {
  return spec.octave ? Math.pow(2, n / spec.octave) : Math.pow(ratioValue(spec), n);
}

// ---------------------------------------------------------------- family 4: split two-ratio
function splitMultiplier(bodySpec, dispSpec, crossover, n) {
  if (n <= crossover) return modularMultiplier(bodySpec, n);
  return modularMultiplier(bodySpec, crossover) *
         modularMultiplier(dispSpec, n - crossover);
}

// ---------------------------------------------------------------- family 3: grid-snapped
// Snap to the grid, ANCHORED at the body size so the one number the user confirmed survives.
// Collisions are counted, not hidden.
function snapAscending(sizesAsc, grid, anchorIndex) {
  const snap = function (v) { return Math.max(grid, Math.round(v / grid) * grid); };
  const a = anchorIndex == null ? 0 : anchorIndex;
  const out = sizesAsc.slice();
  let collisions = 0;
  out[a] = snap(sizesAsc[a]);
  for (let i = a + 1; i < out.length; i++) {                    // upward from the anchor
    let v = snap(sizesAsc[i]);
    if (v <= out[i - 1]) { v = out[i - 1] + grid; collisions++; }
    out[i] = v;
  }
  for (let i = a - 1; i >= 0; i--) {                            // downward from the anchor
    let v = snap(sizesAsc[i]);
    if (v >= out[i + 1]) { v = out[i + 1] - grid; collisions++; }
    out[i] = Math.max(grid, v);
  }
  return { sizes: out, collisions: collisions };
}

function minGap(sizesAsc) {
  let g = Infinity;
  for (let i = 1; i < sizesAsc.length; i++) g = Math.min(g, sizesAsc[i] - sizesAsc[i - 1]);
  return g;
}

// A step count that will not immediately trip the tightening threshold.
function suggestStepsUp(base, r) {
  for (let k = 5; k >= 1; k--) if (base * Math.pow(r, k) <= TIGHT_ABOVE_PX) return k;
  return 1;
}

function lineHeightFor(sizePx, n) {
  const tapered = clamp(TAPER_BASE - TAPER_STEP * n, 1.15, 1.6);
  const tightened = sizePx > TIGHT_ABOVE_PX;
  return {
    ratio: Math.round((tightened ? Math.min(tapered, TIGHT_LINE_HEIGHT) : tapered) * 100) / 100,
    tightened: tightened,
  };
}

function effectiveN(sizePx, base) {
  return Math.log(sizePx / base) / Math.log(Math.pow(2, 1 / 5));
}

function round2(v) { return Math.round(v * 100) / 100; }

// ---------------------------------------------------------------- the one entry point
// buildScale(base) with no options is the classical scale: 2^(n/5), five up, one down.
function buildScale(base, opts) {
  const o = opts || {};
  let rows, meta;

  if (o.preset) {
    const preset = PRESETS[o.preset];
    if (!preset) throw new Error("unknown preset: " + o.preset);
    const factor = o.rebase ? base / preset.base : 1;
    rows = preset.steps.map(function (st) {
      return { token: st[0], sizePx: st[1] * factor, n: null };
    });
    meta = { kind: "preset", label: preset.name, presetBase: preset.base * factor };
  } else {
    const stepsUp = o.stepsUp == null ? 5 : o.stepsUp;
    const stepsDown = o.stepsDown == null ? 1 : o.stepsDown;
    const bodySpec = findRatio(o.ratio || DEFAULT_RATIO);
    const dispSpec = o.displayRatio ? findRatio(o.displayRatio) : null;
    const crossover = o.crossover == null ? 2 : o.crossover;

    rows = [];
    for (let n = -stepsDown; n <= stepsUp; n++) {
      const m = dispSpec ? splitMultiplier(bodySpec, dispSpec, crossover, n)
                         : modularMultiplier(bodySpec, n);
      rows.push({ token: tokenName(n, stepsUp), n: n, sizePx: base * m });
    }
    let gridInfo = null;
    if (o.grid) {
      const raw = rows.map(function (x) { return x.sizePx; });          // ascending by n
      const bodyIndex = stepsDown;                                     // where n === 0 sits
      const snap = snapAscending(raw, o.grid, bodyIndex);
      gridInfo = {
        grid: o.grid,
        collisions: snap.collisions,
        minGap: round2(minGap(raw)),
        tooCoarse: snap.collisions > 0,
      };
      rows = rows.map(function (x, i) {
        return { token: x.token, n: x.n, sizePx: snap.sizes[i], snapped: snap.sizes[i] !== x.sizePx };
      });
    }
    meta = dispSpec
      ? { kind: "split", label: ratioLabel(bodySpec) + " body / " + ratioLabel(dispSpec) +
          " display, crossing at n=" + crossover, crossover: crossover }
      : { kind: o.grid ? "snapped" : "modular", label: ratioLabel(bodySpec), ratio: ratioValue(bodySpec) };
    meta.stepsUp = stepsUp;
    meta.stepsDown = stepsDown;
    if (gridInfo) {
      meta.grid = gridInfo.grid;
      meta.collisions = gridInfo.collisions;
      meta.minGap = gridInfo.minGap;
      meta.tooCoarse = gridInfo.tooCoarse;
      meta.label += " snapped to " + gridInfo.grid + "px";
    }
  }

  rows.sort(function (a, b) { return b.sizePx - a.sizePx; });     // largest first

  return rows.map(function (x) {
    const n = x.n == null ? effectiveN(x.sizePx, base) : x.n;
    const lh = lineHeightFor(x.sizePx, n);
    const multiplier = x.sizePx / base;
    return {
      token: x.token,
      n: x.n,
      multiplier: multiplier,
      multiplierLabel: round2(multiplier) === 1 ? "1em" : Number(multiplier.toFixed(4)) + "em",
      sizePx: x.sizePx,
      sizeLabel: round2(x.sizePx),
      lineHeightRatio: lh.ratio,
      lineHeightPx: round2(x.sizePx * lh.ratio),
      tightened: lh.tightened,
      snapped: x.snapped === true,
    };
  });
}
```

Классическая шкала, `buildScale(16)`:

| Token | `n` | Multiplier | Size | Line height |
|---|---|---|---|---|
| `h1` | 5 | `2em` | 32 | 1.20 → 38.4 |
| `h2` | 4 | `1.7411em` | 27.86 | 1.26 → 35.1 |
| `h3` | 3 | `1.5157em` | 24.25 | 1.32 → 32.0 |
| `h4` | 2 | `1.3195em` | 21.11 | 1.38 → 29.1 |
| `h5` | 1 | `1.1487em` | 18.38 | 1.44 → 26.5 |
| `p` | 0 | `1em` | 16 | 1.50 → 24 |
| `small` | −1 | `.8706em` | 13.93 | 1.56 → 21.7 |

## A2 — Показать разбивку в чате, до генерации токенов

**Напечатать шкалу таблицей в чате. Не генерировать файл, пока не
показал.**

1. Какая шкала использована — `meta.label` (например, `Fifth root of
   two (1.1487)`) и сколько шагов.
2. Таблица: token, multiplier, size, line height. Крупнейший первым.
3. Всё, что отклонилось от простого правила: `tightened`-строки (порог
   120px), `snapped`-строки (соотношение больше не ровное; если
   `meta.tooCoarse` — сказать число коллизий и что результат по сути
   арифметический, не пропорциональный), пресет (размеры буквальные, не
   расчётные), split (где переход).
4. **Line height — эвристика**, `clamp(1.5 − 0.06n, 1.15, 1.6)`, не
   закон. **Порог 120px может перевернуть абсолютный line-height** — при
   базе 64px `h1` даёт 128 × 1.05 = 134.4px, а `h2` даёт 111.4 × 1.26 =
   140.4px, то есть у более крупного текста line-box меньше. Сказать
   это прямо, не дожидаясь, пока найдут сами и решат, что это баг.

## Вывод: CSS custom properties или design-tokens JSON

Вместо Figma FLOAT-переменных (оригинал) — на выбор:

**CSS custom properties:**
```css
:root {
  --font-size-h1: 32px; --line-height-h1: 38.4px;
  --font-size-p: 16px;  --line-height-p: 24px;
  --font-size-small: 13.93px; --line-height-small: 21.7px;
  /* ...остальные шаги */
}
```

**design-tokens JSON** (совместимо с большинством token-пайплайнов):
```json
{
  "font-size": { "h1": { "value": "32px" }, "p": { "value": "16px" } },
  "line-height": { "h1": { "value": "38.4px" }, "p": { "value": "24px" } }
}
```

Спросить пользователя, какой формат нужен, если не очевидно из контекста
проекта (наличие `tokens.json`, Style Dictionary, Tailwind config и т.п.).
Переиспользовать имена токенов из `A1` (`token` поле) без изменений.

