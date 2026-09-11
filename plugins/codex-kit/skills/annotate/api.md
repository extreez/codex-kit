> Часть скилла annotate (см. SKILL.md — общий read-only invariant, guard-функции
> SAFE/ADOPT/NI/SWEEP и выбор режима описаны там один раз, здесь не дублируются
> заново). Текст ниже — оригинальный источник (Create API Overview), не переведён:
> сохраняем формулировки/код/числа дословно ради точности guard-правил.

# Create API Overview

API overview on canvas for the selected component: main property table, one table per configurable sub-component, and 2-4 examples each with a **live preview instance** matching its table. Input: the selection. Output: one annotation frame beside it.

## Execution Contract (read first)

- Instructions to RUN, not a doc to edit. Never edit this skill mid-run.
- **User's component is read-only** — see the invariant below, which is enforced, not advisory.
- Never pause for confirmation. On ambiguity pick the most defensible option, note it in general notes, continue.
- Only legal stop: **invalid selection** (Step 1). Missing template/fonts/preferred component have defined fallbacks.
- Scripts are Plugin API JS: replace `__LIKE_THIS__` placeholders before running. JSON with straight ASCII quotes; escape apostrophes in single-quoted strings.
- **Batching:** one script per table, per sub-component, per example — merged mega-scripts time out.

## Read-only invariant

The documented component is **read-only** — the selected component, its set, variants, sub-components, their main components, and every library asset. Structure, properties, position, name, visibility, text, paints, variable modes: all untouchable. A correct overview plus a modified source component is a failed run.

**Writable scope, exhaustive:** the Step 7 annotation frame and its descendants, plus instances these scripts create. Never the target, never the page.

Never `appendChild`/`insertChild`/`remove`/`clone`/`setProperties`/`setVariantProperties`/`detachInstance`/`swapComponent`/`set`+`clearExplicitVariableModeForCollection`/`setBoundVariable`/`resize()`, or write `name`/`x`/`y`/`visible`/`characters`/`fills`/`strokes`/`layoutMode`, on the target, its ancestors, or its descendants. Read a fresh instance instead — that is what every preview already does. If a step seems to need one, the step is wrong: skip it and say so in Step 13.

### Render preamble

Prepend to every render script (Steps 8-11, 13). `__FRAME_ID__` = the frame from Step 7.

```javascript
const _F='__FRAME_ID__',_TMP=[];
function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
function _mine(n){let p=n;while(p){if(_TMP.indexOf(p)>=0)return true;p=p.parent}return false}
function SAFE(n){if(!n||!((_F&&_in(n,_F))||_mine(n)))throw new Error('GUARD: write outside annotation frame refused: '+(n&&n.name));return n}
function ADOPT(p,c){SAFE(p);if(!_mine(c)&&!_in(c,_F))throw new Error('GUARD: refused to move existing node into annotation: '+c.name);p.appendChild(c);return c}
function NI(src,parent){const i=src.createInstance();_TMP.push(i);if(parent)ADOPT(parent,i);return i}
function SWEEP(){for(const n of _TMP){try{if(!n.removed&&n.parent&&n.parent.type==='PAGE')n.remove()}catch(e){}}_TMP.length=0}
function textOf(n){if(!n)return null;return n.type==='TEXT'?n:(n.findOne?n.findOne(x=>x.type==='TEXT'):null);}
async function LF(root){const fo={};for(const tn of root.findAll(n=>n.type==='TEXT')){try{const fn=tn.fontName;if(fn&&fn!==figma.mixed&&fn.family)fo[fn.family+'|'+fn.style]=fn}catch(e){}}await Promise.all(Object.keys(fo).map(k=>figma.loadFontAsync(fo[k]).catch(()=>{})));}
async function PAGE(n){let p=n;while(p&&p.parent&&p.parent.type!=='DOCUMENT')p=p.parent;if(p&&p.type==='PAGE')await figma.setCurrentPageAsync(p)}
```

Instances come only from `NI` — never bare `createInstance()`. Pass the parent so the instance is inside the frame before the first `await`; measure-first cases use `NI(src)` then `ADOPT(parent,inst)`. Every render-script body sits in `try{ ... }finally{SWEEP()}` so a throw can't abandon a half-configured instance on canvas: `SWEEP` removes registered instances still parented to a page and leaves adopted ones alone. Extraction scripts (Steps 1-3) write nothing and need no preamble. Step 7's template tiers correctly keep a bare `createInstance()` — they run before `_F` exists and instantiate the template, which 7b's filter guarantees is never the target.

## Configuration

```text
API_TEMPLATE_KEY = ""        # Optional: key of your "API" template.
FONT_FAMILY      = "Inter"   # Used only when building scaffold.
```

Template source: uSpec Template Community file (https://www.figma.com/community/file/1603925462078533207/uspec-template) — duplicate, publish as library, copy "API" key. With no key, the skill searches this file for a component named "API" with expected layers, else builds a scaffold (Step 7c).

## Input

Exactly one of: **component**, **component set**, or **instance** (walks back to main + enclosing set — library instances work). Anything else — nothing selected, multi-select, plain frame, group, section, text — is invalid. Tell the user:

> Select the component you want documented — a component, a component set, or an instance of one — then run this skill again. Plain frames, groups, and multi-selections can't be documented because they have no property definitions to read.

and **stop**. Only legal stop.

## How It Works

**Extract** property surface (1-3) → **reason** into engineering API and author examples (4-6) → **render** into template/scaffold (7-11) → **validate** by screenshot (12-13).

## Workflow

```text
- [ ] Step 1: Validate selection; resolve target (STOP if invalid)
- [ ] Step 2: Extract property surface (defs, layer bindings, text-node listing)
- [ ] Step 3: Extract nested sub-components, slots, variable modes
- [ ] Step 4: Author API (main table, sub-component tables, general notes)
- [ ] Step 5: Author 2-4 examples + project to raw property keys
- [ ] Step 6: Audit spec against extraction
- [ ] Step 7: Resolve template (7a key -> 7b local "API" -> 7c scaffold)
- [ ] Step 8: Fill header
- [ ] Step 9: Fill main table
- [ ] Step 10: Fill sub-component tables (or hide the section)
- [ ] Step 11: Fill configuration examples with live previews; hide templates
- [ ] Step 12: Screenshot self-validation (up to 3 iterations)
- [ ] Step 13: Complete - select frame, zoom, summarize
```

### Step 1: Validate the Selection

```javascript
const sel = figma.currentPage.selection;
if (sel.length !== 1) return { ok: false, error: 'NEED_SELECTION', selectedCount: sel.length };
const selected = sel[0];
let target = selected;
if (target.type === 'INSTANCE') { try { target = await target.getMainComponentAsync(); } catch (e) { target = null; } }
if (target && target.type === 'COMPONENT' && target.parent && target.parent.type === 'COMPONENT_SET') target = target.parent;
if (!target || (target.type !== 'COMPONENT' && target.type !== 'COMPONENT_SET')) return { ok: false, error: 'INVALID_SELECTION', selectedType: selected.type, selectedName: selected.name };
const gb = target.absoluteBoundingBox || {}; let gd = '';
try { gd = Object.keys(target.componentPropertyDefinitions || {}).sort().join(','); } catch (e) {}
const guard = { name: target.name, parentId: target.parent ? target.parent.id : '', kids: ('children' in target) ? target.children.length : 0, box: [Math.round(gb.x||0), Math.round(gb.y||0), Math.round(gb.width||0), Math.round(gb.height||0)], defs: gd };
return { ok: true, targetId: target.id, targetType: target.type, componentName: target.name, isRemote: !!target.remote, anchorId: selected.id, guard };
```

- `ok: false` → deliver invalid-selection message (say what was selected), **stop**.
- `ok: true` → save `targetId`, `componentName`, `anchorId` (frame placed next to it — matters when main component is remote), and `guard` verbatim for Step 13's integrity check.
- Clean the name for display: strip version numbers, leading emoji/status glyphs, library prefixes ("DS / Button" → "Button"). Use as `COMPONENT_NAME`.

### Step 2: Extract the Property Surface

Replace `__TARGET_ID__` with `targetId` from Step 1.

```javascript
const TARGET_ID = '__TARGET_ID__';
const node = await figma.getNodeByIdAsync(TARGET_ID);
if (!node) return { ok: false, error: 'TARGET_NOT_FOUND' };
let _p = node; while (_p.parent && _p.parent.type !== 'DOCUMENT') _p = _p.parent;
if (_p.type === 'PAGE') await figma.setCurrentPageAsync(_p);
const isSet = node.type === 'COMPONENT_SET';
const defaultVariant = isSet ? (node.defaultVariant || node.children[0]) : node;
try { await figma.loadAllPagesAsync(); } catch (e) {}
const localByKey = {};
try {
  const locals = figma.root.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] });
  for (const c of locals) { if (c.key) localByKey[c.key] = c; }
} catch (e) {}
const out = { ok: true, name: node.name, targetType: node.type, targetId: node.id, defaultVariantId: defaultVariant.id, defaultVariantName: defaultVariant.name, variantAxes: [], booleans: [], textProps: [], instanceSwaps: [], textNodes: [] };
let defs = {};
try { defs = node.componentPropertyDefinitions; } catch (e) { try { defs = defaultVariant.componentPropertyDefinitions; } catch (e2) {} }
for (const rawKey of Object.keys(defs)) {
  const def = defs[rawKey], humanName = rawKey.split('#')[0];
  if (def.type === 'VARIANT') out.variantAxes.push({ rawKey, name: humanName, options: def.variantOptions || [], defaultValue: def.defaultValue });
  else if (def.type === 'BOOLEAN') out.booleans.push({ rawKey, name: humanName, defaultValue: def.defaultValue, associatedLayers: [] });
  else if (def.type === 'TEXT') out.textProps.push({ rawKey, name: humanName, defaultValue: def.defaultValue, associatedLayers: [] });
  else if (def.type === 'INSTANCE_SWAP') {
    const preferred = [];
    for (const pv of (def.preferredValues || []).slice(0, 6)) {
      let resolvedName = null, resolvedId = null;
      const local = localByKey[pv.key];
      if (local) { resolvedName = local.name; resolvedId = local.id; }
      else {
        try {
          const imp = pv.type === 'COMPONENT_SET' ? await figma.importComponentSetByKeyAsync(pv.key) : await figma.importComponentByKeyAsync(pv.key);
          resolvedName = imp.name; resolvedId = imp.id;
        } catch (e) {}
      }
      preferred.push({ key: pv.key, type: pv.type, componentName: resolvedName, componentId: resolvedId });
    }
    let defaultComponentName = null;
    try { const dn = await figma.getNodeByIdAsync(String(def.defaultValue)); if (dn) defaultComponentName = dn.name; } catch (e) {}
    out.instanceSwaps.push({ rawKey, name: humanName, defaultValue: def.defaultValue, defaultComponentName, preferredComponents: preferred, associatedLayers: [] });
  }
}
const byRef = {};
for (const b of out.booleans) byRef[b.rawKey] = b;
for (const t of out.textProps) byRef[t.rawKey] = t;
for (const s of out.instanceSwaps) byRef[s.rawKey] = s;
const allNodes = [defaultVariant].concat(defaultVariant.findAll(() => true));
for (const n of allNodes) {
  const refs = n.componentPropertyReferences;
  if (!refs) continue;
  const pairs = [['visible', refs.visible], ['characters', refs.characters], ['mainComponent', refs.mainComponent]];
  for (const pair of pairs) {
    const entry = pair[1] ? byRef[pair[1]] : null;
    if (entry) entry.associatedLayers.push({ layerName: n.name, layerId: n.id, layerType: n.type, controls: pair[0] });
  }
}
const textLayers = defaultVariant.findAll(n => n.type === 'TEXT');
out.textNodes = textLayers.map(tn => ({ name: tn.name, characters: tn.characters, visible: tn.visible }));
return out;
```

Save the full result — the **raw-key dictionary**: every `rawKey` is exactly what `setProperties()` expects in Step 11; every `name` (before `#`) is normalized in Step 4. `textNodes` carries exact, case-sensitive TEXT layer names — never guess; if not in this listing (or a property's `associatedLayers`), it doesn't exist.

### Step 3: Extract Nested Sub-components, Slots, and Variable Modes

```javascript
const TARGET_ID = '__TARGET_ID__';
const node = await figma.getNodeByIdAsync(TARGET_ID);
if (!node) return { ok: false, error: 'TARGET_NOT_FOUND' };
let _p = node; while (_p.parent && _p.parent.type !== 'DOCUMENT') _p = _p.parent;
if (_p.type === 'PAGE') await figma.setCurrentPageAsync(_p);
const defaultVariant = node.type === 'COMPONENT_SET' ? (node.defaultVariant || node.children[0]) : node;
const out = { ok: true, nestedInstances: [], slots: [], variableCollections: [] };
const topLevel = defaultVariant.findAll(n => n.type === 'INSTANCE').filter(inst => {
  let p = inst.parent;
  while (p && p.id !== defaultVariant.id) { if (p.type === 'INSTANCE') return false; p = p.parent; }
  return true;
});
for (const inst of topLevel.slice(0, 12)) {
  let main = null;
  try { main = await inst.getMainComponentAsync(); } catch (e) {}
  if (!main) continue;
  const set = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : null;
  let propertySurface = [];
  try {
    const defs = (set || main).componentPropertyDefinitions;
    propertySurface = Object.keys(defs).map(k => { const d = defs[k]; return { rawKey: k, name: k.split('#')[0], type: d.type, options: d.variantOptions || null, defaultValue: d.defaultValue === undefined ? null : String(d.defaultValue) }; });
  } catch (e) {}
  let contextValues = [];
  try { const props = inst.componentProperties; contextValues = Object.keys(props).map(k => ({ rawKey: k, name: k.split('#')[0], value: String(props[k].value) })); } catch (e) {}
  const refs = inst.componentPropertyReferences || {};
  out.nestedInstances.push({ layerName: inst.name, instanceId: inst.id, visibleByDefault: inst.visible, componentName: main.name, componentId: main.id, componentSetName: set ? set.name : null, componentSetId: set ? set.id : null, isRemote: !!((set || main).remote), visibilityBoundToProperty: refs.visible || null, swapBoundToProperty: refs.mainComponent || null, propertySurface, contextValues });
}
for (const s of defaultVariant.findAll(n => n.type === 'SLOT')) {
  const children = [];
  for (const c of (s.children || [])) {
    let mainId = null, mainName = null;
    if (c.type === 'INSTANCE') { try { const m = await c.getMainComponentAsync(); if (m) { mainId = m.id; mainName = m.name; } } catch (e) {} }
    children.push({ layerName: c.name, nodeType: c.type, componentId: mainId, componentName: mainName });
  }
  out.slots.push({ slotName: s.name, slotId: s.id, defaultChildren: children });
}
try {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  out.variableCollections = collections.filter(c => c.modes && c.modes.length > 1).map(c => ({ name: c.name, modes: c.modes.map(m => m.name) }));
} catch (e) {}
return out;
```

Save the result. `nestedInstances[]` = composable children with layer names, backing components (local/library), property surfaces, and **contextual values** (what the designer set in this parent). `visibilityBoundToProperty` = root boolean showing/hiding a child; `swapBoundToProperty` = instance-swap that replaces it. `slots[]` = slot areas with default children (backing ids used for slot insertions); treat instance-swap properties from Step 2 as another "content slot". `variableCollections[]` = every multi-mode local collection; one named after the component or a property idea ("Button shape", "Density") signals a mode-controlled property (4.9). Only local collections visible — a library's mode collections may live in its home file; document from prompt and say so in Notes.

If Steps 2-3 both return empty surfaces, the component is single-state: API is text layers and nested children. Document what exists — a two-row honest table beats an invented one.

### Step 4: Author the API (the reasoning pass)

Turn raw evidence into an **engineering API**, not a Figma transliteration. Decide the shape an engineer would design if they'd never opened Figma. Test: if any property or value can only be understood by someone who has seen the Figma file, the pass has failed.

Outputs: `GENERAL_NOTES` (optional, 4.12), `PROPERTIES` (main table `{ property, values, required, default, notes, isSubProperty }`), `SUB_COMPONENT_TABLES` (zero or more `{ name, description, properties: [...] }`, 4.13).

#### 4.0 Five most-violated rules

1. **Promote child properties that affect parent contract.** Walk every `nestedInstances[].contextValues`.
2. **Merge booleans into enums.** Never expose boolean + type pair or master + sub-booleans separately — single enum with `none` (4.3).
3. **Decompose broad State axes.** Drop transient; keep persistent (4.1-4.2).
4. **Check variable collections** for mode-controlled props (density, shape) — invisible in variant names (4.9).
5. **Use engineer-friendly names.** Strip versions, camelCase, drop redundant prefixes (4.11).

#### 4.1 Classify states: transient vs persistent

- **Transient runtime states** — **excluded entirely** as properties and values: `hovered`, `pressed`, `focused`, plus "typing", "filled/has value", "scrolled".
- **Persistent states** ARE API booleans: `isDisabled`, `isSelected`, `isLoading`, `isExpanded`, `isReadOnly`, `isRequired`, `isInvalid`, `isIndeterminate`.
- Figma axis `State: Enabled, Hovered, Pressed, Disabled` → one row: `isDisabled: true, false` (default `false`). "Enabled" is the boolean's default, not an enum value.
- Exception: explicit `isFocused` (designer-modeled a11y switch) may be kept — never resurrect `focused` from a variant axis.

#### 4.2 Decompose broad variant axes

When one axis mixes concerns (`State: Rest, Focused, Filled, Error, Success, Disabled`): (1) drop transient options; (2) group remaining — 2+ values of one concern → **enum** (`validationState: none, error, success` — always add `none`); isolated persistent options → **booleans**; (3) **record the mapping** in the property's Notes (or `GENERAL_NOTES` if long): `Decomposed from Figma axis 'State': Error -> validationState=error; Disabled -> isDisabled=true; Rest/Focused/Filled are runtime (not API).` Reader must reconstruct which runtime each old option maps to. Skip if axis is already 1:1 (`Size: Large, Medium, Small` → `size`).

#### 4.3 Merge booleans into enums (Boolean Relationship Protocol)

Figma models a content slot as boolean visibility + child `Type` variant (`Leading artwork: true/false` + child `Type: Icon, Vector, Custom`). Never mirror as `hasLeadingArtwork` + separate type — merge into **single enum with `none`**: `leadingArtwork: none, icon, vector, custom` (boolean `false` → `none`, `true` → selected type).

Classify each cluster:

- **Orthogonal** — independent booleans; any combination valid. → Each as its own property; keep master as simple boolean or drop.
- **Mutually exclusive** — only one on at a time. → One enum with `none` + one value per sibling: `content: none, flag, icon, label`.
- **Progression** — sub-boolean only meaningful when master is on. → One enum with `none` + one value per reachable combination (`content: none, artworkOnly, artworkAndLabel`). A genuine sub-*value* (number/string/icon name) stays as its own row with `isSubProperty: true` (4.6).

Evidence (cite one): (1) naming containment (`Foo` with `Foo bar`, `Foo baz` → progression/mutex); (2) shared wrapper under master → progression; (3) sibling vs nested layers — siblings = orthogonal/mutex; nested = progression; (4) prompt hints ("one at a time", "only when", "either/or"); (5) toggle test — throwaway instance, toggle, delete. Never toggle user's nodes.

Resulting property is an engineer **noun** (`leadingArtwork`, `trailingContent`), never the master's label. `showLeadingContent` as final enum name is an audit failure.

#### 4.4 One shape per slot (Slot Merger Rule)

When booleans/enums describe the same visual slot, expose **either** declarative enum **or** behavioral booleans — never both at same level:

- **Shape A — declarative:** enum only (`trailingContent: none, label, loading, clear`), resolver in `GENERAL_NOTES`: `trailingContent resolves to 'loading' when isLoading=true, else 'clear' when focused && value !== '', else 'label' when trailingLabel is set, else 'none'.`
- **Shape B — behavioral:** booleans/strings only (`isLoading`, `showClear`, `trailingLabel`), priority in `GENERAL_NOTES`: `loading -> clear -> label`.

Prefer **Shape B** when a sibling `is*` boolean is already in the API; else **Shape A**. Merged enum AND behavioral inputs at same level = audit failure.

#### 4.5 Ownership: parent API vs sub-component table

| Situation | Parent row? | Sub-component row? |
|---|---|---|
| Changes external contract or common usage | Yes | Optional |
| Only describes internal child config | No | Yes |
| Parent exposes child capability, engineers need both | Yes | Yes |
| Purely contextual default inside child | No | Yes |

Tie-break: **parent** for public contract, validation, content, common usage; **child** for local implementation; **both** for parent + drill-down.

Canonical: text field's `isInvalid`, `errorMessage`, `maxLength`, `showCharacterCount` → **parent** though visuals render in Label/Input/Hint. Button's `leadingContentType` → parent; chosen content config → sub-component table.

**Parent-owned prop dedup.** Child boolean fully driven by parent — child table must NOT re-expose. Collapse to reference row:

```json
{ "property": "showLeadingIcon", "values": "–", "required": false, "default": "–", "notes": "Controlled by parent's leadingContent; do not set directly." }
```

Use parent's canonical name; drop child's alternate Figma name.

#### 4.6 Nested rows: `isSubProperty` and its Notes template

`isSubProperty: true` when a row is only meaningful given a parent — renders indented, sits **immediately after** its parent row.

**Notes template (mandatory for every sub-property row):**

> Only meaningful when {parentProperty} = {triggerValue}. {rest of the note}

Example: `Only meaningful when characterCount = visible. Caps input length.`

Level choice: **top-level** — stands alone (`size`, `label`, `isDisabled`); **nested** — only makes sense given parent (`maxLength` under `characterCount`); **sub-component table** — belongs to a nested component with its own surface (4.13). Table supports one indent level; if API is deeper, pick most useful grouping and explain rest in Notes.

#### 4.7 Numbered slots collapse into arrays

Figma can't model dynamic arrays; designers use numbered slots (`tab1`-`tab8`). Detect: same prefix + sequential numbers + same sub-component type. Collapse into **one** array (`items: TabItem[]`) with `minItems`/`maxItems` in Notes; document item shape as a sub-component table. Array position + `label` provide identity — do **not** add `key` unless stable IDs differing from labels are genuinely required.

#### 4.8 Layer-name parentheticals promote to booleans

A layer name ending in a semantic parenthetical — `Label (required)`, `Button (disabled)`, `Icon (loading)`, `Input (readonly)` — is a first-class state. Promote to parent `is*` boolean (default `false` unless evidence differs); Notes cover visual change and accessibility effect (`aria-required=true` / announced disabled/busy). Not promoting requires an explicit reason in the audit.

#### 4.9 Variable-mode properties

Container-level via variable collection modes — invisible in variant names/instance panels. Patterns: `shape` (Rectangular/Rounded — corner radius); `density` (Default/Compact/Spacious — padding, min-height). Document in main table with values from mode names, Notes `Controlled via '[Collection name]' variable mode, not per-instance.`, and a `GENERAL_NOTES` line noting container-level setting. Light/Dark handled by semantic tokens — never a property. Corner radius/spacing varying with no matching variant axis is the classic tell.

#### 4.10 Exclusions

- **No event handlers** (`onPress`, `onClick`, `onChange`, `onSelectionChange`, `onClose`, `onExpandedChange`) — code-level.
- **No transient states** as properties or values (4.1). **No `key` on array items** (4.7).
- **No internal/private layers** — skip anything an engineer can't configure externally.
- **Single-value properties still documented** (note "single variant") — signal future variation.
- **Never guess defaults.** No evidence → `–` and mark required.

#### 4.11 Naming normalization (and the canonical library)

Examples: Leading artwork → `leadingArtwork` (camelCase); Is selected → `isSelected` (prefix kept); Button label → `label` (drop redundant prefix); "Trailing content — Text button" → `trailingContent` (property name, not variant value).

Conventions:

- **camelCase**, platform-agnostic (no `NS`, no `@`, no snake_case).
- **Booleans use exactly one:** `is*` — persistent state (`isDisabled`, `isLoading`); `has*` — static capability (`hasDivider`); `show*` — single visibility toggle for a decorative one-form element (`showBadge`). Boolean fitting none = usually an enum via 4.3.
- **Enums, slots, strings, numbers are nouns:** `trailingContent`, `validationState`, `size`, `label`, `maxLength`. Off-value = `none`, never `false`. `showTrailingContent` + `trailingContentType` coexisting = audit failure — merge into `trailingContent` enum.
- **Remove redundant component prefixes** (`label`, not `buttonLabel`).
- **Preserve semantic meaning:** Figma "Hierarchy" → keep `hierarchy`.
- Ambiguous: "Type" → `variant` (reserve `type` for HTML button type); "Style" → `variant`/`appearance`; "Asset" → `icon`/`image`/`artwork`; "Content" → position-qualified. Note original Figma name in Notes when translation is non-obvious.

**Canonical library.** Cross-check common properties. Universal booleans on interactive components: `isDisabled`, `isSelected`, `isRequired`, `isInvalid`, `isReadOnly`, `isLoading` (aria-busy), `isExpanded`.

| Archetype | Canonical properties |
|---|---|
| Button | `variant`: primary, secondary, tertiary, outline, ghost, danger = primary; `size`: large, medium, small, xsmall = medium; `isDisabled`, `isLoading`, `isSelected` = false; `label`: string; `leadingIcon`/`trailingIcon`: none, icon = none; `widthType`: hug, fill = hug |
| Text field / Input | `label` (required), `placeholder`, `value`; `isDisabled`/`isReadOnly`/`isRequired`/`isInvalid` = false (or `validationState`: none, error, success, ...); `errorMessage`, `description`; `showCharacterCount` = false; `maxLength`: number; `leadingContent`/`trailingContent`: none, icon, text = none; `inputType`: text, password, email, number, tel, url, search = text. Fixed children: Label, Input, Hint text |
| Checkbox | `isSelected`, `isIndeterminate`, `isDisabled`, `isInvalid` = false; `label` |
| Switch | `isSelected`, `isDisabled` = false; `label`. Switch = immediate; Checkbox = deferred |
| Radio group | container: `value`; `orientation`: vertical, horizontal = vertical; `isDisabled`, `isRequired` = false; `label`. Item: `value`, `label`, `isDisabled` = false |
| Select / Dropdown | `label`, `placeholder`, `selectedKey`; `isDisabled`/`isRequired`/`isInvalid` = false; `size`: large, medium, small = medium; `description`, `errorMessage`; `items`: array |
| Tabs | container: `size`: medium, small = medium; `widthDistribution`: content, equal = content; `orientation`: horizontal, vertical = horizontal; `items`: TabItem[]. TabItem: `label` (required); `isSelected`, `isDisabled` = false; `leadingArtwork`: none, icon = none; `badge`: slot |
| List item | `primaryLabel` (required); `secondaryLabel`; `leadingContent`: none, icon, avatar, image, checkbox, radio = none; `trailingContent`: none, chevron, icon, button, switch, text = none; `isSelected`, `isDisabled` = false; `density`: default, compact, spacious = default (often variable-mode) |
| Dialog / Modal | `title`; `size`: small, medium, large, fullscreen = medium; `isDismissable` = true. Fixed children: Header, Body, Footer/Actions |
| Tooltip | `content` (required); `placement`: top, bottom, left, right, start, end = top |
| Chip / Tag | `label` (required); `variant`: assist, filter, input, suggestion; `isSelected`, `isDisabled` = false; `colorVariant`: default, success, warning, error, info = default; `leadingIcon`: none, icon, avatar = none |
| Badge | `content`: string/number; `variant`: default, dot, count = default; `colorVariant`: neutral, positive, negative, info, warning = neutral; `maxCount` = 99 |
| Avatar | `size`: xsmall, small, medium, large, xlarge = medium; `shape`: circle, square, rounded = circle; `fallback`; `badge`: slot |
| Progress indicator | `value`; `maxValue` = 100; `variant`: linear, circular = linear; `size`: small, medium, large = medium; `isIndeterminate`, `showValue` = false |
| Snackbar / Toast | `message` (required); `action`; `variant`: default, info, success, warning, error = default; `duration`: short, long, indefinite = short |
| Accordion | container: `allowsMultipleExpanded`, `isDisabled` = false. Item: `title` (required); `isExpanded`, `isDisabled` = false; content slot |

#### 4.12 Authoring the table rows

Every row: `{ property, values, required, default, notes, isSubProperty }`.

**Values:** boolean → `true, false`; enum → camelCase list; string → `string`; number → `number`; icon → `IconName`; instance-swap/slot → preferred names (`Icon, Avatar, Image`) or `ComponentName instance`.

**Required and Default:** evidenced default → `required: false` + that default; no default → `required: true`, `default` = `–`. Never invent (4.10).

**Notes:** one brief sentence; `–` only when self-explanatory. Sub-property rows use 4.6 template; decomposed axes carry 4.2 mapping; variable modes the 4.9 note; non-obvious renames `Figma: '{original name}'.`

**`GENERAL_NOTES`** — optional; omit when empty. Required for **prop interaction priority** (2+ booleans/enums competing for same slot/affordance/announcement). Write a precedence paragraph — slot name, then arrow chain from highest to lowest priority using real property names, runtime gates in parens:

> trailingContent resolves by priority: isLoading -> showClear (when focused && value !== '') -> trailingLabel (when set) -> none. When isDisabled=true the whole slot is suppressed.

Also used for: variable-mode (4.9), slot resolver (4.4), state-axis mappings too long for Notes (4.2). Not required when every property is orthogonal.

**Edge cases:**

| Situation | Action |
|---|---|
| One value | Document; note "single variant" |
| Unclear boolean vs enum | Exactly two true/false-like values → boolean; else enum |
| No clear default variant | Most common/neutral; note uncertainty |
| Sub-component has 20+ props | List 3-8 configurable in this context |
| Sits on images in mockups | Look for `isElevated` / `backgroundSafe` |

#### 4.13 Sub-component tables

**Pattern A — slot content types.** Slot has interchangeable options (`leadingContentType: none, icon, avatar`). Slot property in **main table**; each type with configurable properties gets its own table named `"{Slot} — {Content type}"`. Documents configuration FOR a chosen type — not which to select.

**Pattern B — fixed sub-components.** Always-present children (text field = Label + Input + Hint). Each configurable child gets a table named by the child. Button with a leading icon does NOT need one; text field's three children DO.

**Descriptions reference source** (`nestedInstances[].componentSetName`/`componentName`): `"Instance of {Component}. See the {Component} API for full details."` — append `"Defaults below reflect contextual overrides for this slot."` when designer overrode values. Pattern B prepends `"Always-present child. "`. Library children: list 3-8 configured props (from `contextValues`), point at source — never re-expand entire API.

**Contextual defaults.** `default` = what designer set **in this context** (`contextValues`), not standalone. If different: `Contextual default; standalone default is medium.`

**Ordering:** fixed sub-components first, visual/DOM order; then slot content types, leading → middle → trailing.

**Skip when:** no configurable properties, type is `none`, or child documented elsewhere and this context configures nothing — Notes reference on parent is enough.

#### 4.14 Worked decision examples

**1. Mixed state axis.** `State: Rest, Focused, Typing, Filled, Error, Success, Disabled, Read-only` → Rest/Focused/Typing/Filled dropped. Error/Success → `validationState: none, error, success` (default `none`). Disabled, Read-only → `isDisabled`, `isReadOnly`. Note per 4.2.

**2. Progression merge.** Label child has master `Character count` + numeric `Max length` only meaningful when on. Progression. Promote (4.5):

```json
{ "property": "characterCount", "values": "none, visible", "required": false, "default": "none", "notes": "Merged from Label child's master. 'visible' renders counter (e.g. '0/25')." },
{ "property": "maxLength", "values": "number", "required": false, "default": "–", "notes": "Only meaningful when characterCount = visible. Caps input length.", "isSubProperty": true }
```

**3. Boolean + sub-variant trap.** Root boolean `Leading artwork` + Artwork variant `Type: Icon, Vector, Custom`. Wrong: `hasLeadingArtwork` + separate `type`. Right: `leadingArtwork: none, icon, vector, custom` (default `none`). Sub-component tables only for types with configurable properties.

### Step 5: Author Configuration Examples

**2-4 examples**: default config, a rich config exercising slots/content, one or two key states/variants. Representative beats exhaustive.

Each example:

```json
{
  "title": "Example 1 — Primary button",
  "variantProps": { "Hierarchy": "Primary", "Size": "Medium", "Leading icon#43744:0": true },
  "textOverrides": { "Label": "Submit" },
  "properties": [
    { "property": "label", "value": "\"Submit\"", "notes": "Action text" },
    { "property": "variant", "value": "primary", "notes": "–" }
  ]
}
```

Rules:

1. **Title:** `"Example N — {Brief description}"`.
2. **`properties`** use **Step 4 API names**, only relevant properties, string values quoted (`"\"Submit\""`), notes brief or `–`.
3. **`variantProps`** maps **Step 2 raw keys** verbatim (`#suffix` included) to values, for every variant axis and boolean. Variant values must match extraction's `options` spelling. Project through Step 4 merges: `leadingArtwork: none` → master boolean raw key `false`; `validationState: error` → original axis raw key at `Error`.
4. **`childOverrides`** (optional): per-child raw-key override objects for composable slot children (index 0 = first). Use when configuring children away from defaults. `properties` must include matching `item N propertyName` rows so table and preview agree. `[]` when unused.
5. **`textOverrides`** (optional): maps **exact TEXT layer names from `textNodes`** (or `associatedLayers[].layerName`) to new content. Case-sensitive; TEXT node's name, not parent frame's. Never guess. When example shows text values, provide matching overrides. `{}` when unused.
6. **`slotInsertions`** (optional): `{ slotName, componentNodeId, nestedOverrides, textOverrides }` placing content into slots. `slotName` from `slots[].slotName`; `componentNodeId` from `slots[].defaultChildren[].componentId`, `preferredComponents[].componentId`, or `nestedInstances[].componentId`. `nestedOverrides` uses child's raw keys; `textOverrides` its TEXT names. When you need different text/props on a slot's default child, insert a fresh configured instance — default slot children get compound IDs after adoption. `[]` when unused.

If projection can't be satisfied, simplify — accurate modest preview beats broken rich one.

### Step 6: Pre-render Audit

Verify against extraction. Fix by re-reasoning — never invent.

- [ ] **Variable modes** — 4.9 applied to Step 3 collections.
- [ ] **Instance booleans captured** — every Step 2 boolean is a row, merged (4.3), or excluded with reason.
- [ ] **No transient states** — 4.1: hovered/pressed/focused/typing/filled appear nowhere.
- [ ] **Broad axes decomposed** — 4.2: no mixed State verbatim; every decomposition has its mapping note.
- [ ] **Boolean protocol applied** — 4.3: every cluster classified with evidence; merged enums use `none`.
- [ ] **Slot merger rule** — 4.4: no slot exposes merged enum AND behavioral inputs at same level.
- [ ] **Ownership resolved** — 4.5: parent contract not buried; child-only mechanics not promoted; every `contextValues` walked.
- [ ] **Parent-owned dedup** — 4.5: no child re-exposes parent-driven boolean except as reference row.
- [ ] **Parentheticals promoted** — 4.8: every `Layer (state)` has an `is*` row or explicit non-promotion reason.
- [ ] **Numbered slots collapsed** — 4.7: no `tab1`-`tab8` rows; arrays documented once with item sub-table.
- [ ] **No event handlers, no array `key`** — 4.10, 4.7.
- [ ] **Naming lint** — 4.11: camelCase; `is*`/`has*`/`show*` correct; enums/strings/numbers are nouns; no redundant prefixes; no `show*` coexisting with `*Content`/`*Type` for same slot.
- [ ] **Library cross-check** — 4.11 canonical table used.
- [ ] **Required/default** — defaults ⇒ `required: false`; no default ⇒ `required: true` + `–`; no guesses.
- [ ] **Notes complete** — every row has note or `–`; sub-property rows use 4.6 template + sit directly after parent.
- [ ] **Sub-component tables** — 4.13: Pattern A/B correct; named per convention; descriptions reference source; contextual defaults with standalone noted; fixed-first then slots leading→trailing; 3-8 properties each.
- [ ] **`GENERAL_NOTES`** — 4.12: present whenever props compete; consistent with per-row notes.
- [ ] **Examples** — 5: 2-4 examples; every `variantProps`/`childOverrides`/`nestedOverrides` key is verbatim raw key; variant values match extraction spelling; every `textOverrides` key is verbatim TEXT layer name; every `slotInsertions[].componentNodeId` resolves; `item N propertyName` rows wherever `childOverrides` used.
- [ ] **Payload hygiene** — straight ASCII quotes; apostrophes escaped in single-quoted strings.

### Step 7: Resolve the Template

Render scripts (8-11) target the layer names below. All three tiers satisfy this contract.

**Layer-name contract:**

| Region | Node names |
|---|---|
| Header | `#compName`, `#general-api-notes` |
| Main table | `#main-api-table`, `#api-row-template`, `#property-name`, `#property-values`, `#property-required`, `#property-default`, `#property-notes`, `#hierarchy-indicator` |
| Sub-component | `#subcomponent-chapter-template`, `#subcomponent-title`, `#subcomponent-description`, `#subcomponent-table`, `#subcomponent-row-template`, `#subprop-name`, `#subprop-values`, `#subprop-required`, `#subprop-default`, `#subprop-notes`, `#subprop-hierarchy-indicator` |
| Example | `#config-example-chapter-template`, `#example-title`, `Preview`, `#example-asset-description`, `#example-table`, `#example-row-template`, `#example-prop-name`, `#example-prop-value`, `#example-prop-notes` |

Try tiers in order; first `ok: true` wins. Save `frameId` for later scripts.

#### Step 7a: Import by template key (only when `API_TEMPLATE_KEY` is set)

Skip if empty. Else replace `__API_TEMPLATE_KEY__`, `__ANCHOR_ID__`, `__COMPONENT_NAME__`:

```javascript
const TEMPLATE_KEY = '__API_TEMPLATE_KEY__';
const ANCHOR_ID = '__ANCHOR_ID__';
const COMPONENT_NAME = '__COMPONENT_NAME__';
let anchor = null;
try { anchor = await figma.getNodeByIdAsync(ANCHOR_ID); } catch (e) {}
if (anchor) { let _p = anchor; while (_p.parent && _p.parent.type !== 'DOCUMENT') _p = _p.parent; if (_p.type === 'PAGE') await figma.setCurrentPageAsync(_p); }
let templateComponent = null;
try { templateComponent = await figma.importComponentByKeyAsync(TEMPLATE_KEY); } catch (e) { return { ok: false, error: 'IMPORT_FAILED', detail: String(e) }; }
const instance = templateComponent.createInstance();
const frame = instance.detachInstance();
if (!frame.findOne(n => n.name === '#main-api-table')) { frame.remove(); return { ok: false, error: 'TEMPLATE_MISSING_LAYERS' }; }
if (anchor && anchor.absoluteBoundingBox) { const bb = anchor.absoluteBoundingBox; frame.x = bb.x + bb.width + 200; frame.y = bb.y; }
else { frame.x = figma.viewport.center.x; frame.y = figma.viewport.center.y; }
frame.name = COMPONENT_NAME + ' API';
figma.currentPage.selection = [frame];
figma.viewport.scrollAndZoomIntoView([frame]);
return { ok: true, frameId: frame.id, source: 'template-key' };
```

On `ok: false`, fall through to 7b.

#### Step 7b: Find a template component in this file

`__TARGET_ID__` excludes the documented component from the candidate list — a component of the user's named "API" is never the template.

```javascript
const ANCHOR_ID = '__ANCHOR_ID__';
const COMPONENT_NAME = '__COMPONENT_NAME__';
try { await figma.loadAllPagesAsync(); } catch (e) {}
let anchor = null;
try { anchor = await figma.getNodeByIdAsync(ANCHOR_ID); } catch (e) {}
if (anchor) { let _p = anchor; while (_p.parent && _p.parent.type !== 'DOCUMENT') _p = _p.parent; if (_p.type === 'PAGE') await figma.setCurrentPageAsync(_p); }
const TID = '__TARGET_ID__';
function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
const tgt = await figma.getNodeByIdAsync(TID);
const candidates = figma.root.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] }).filter(c => c.name.trim().toLowerCase() === 'api' && !_in(c, TID) && !(tgt && _in(tgt, c.id)));
let template = null;
for (const c of candidates) {
  const comp = c.type === 'COMPONENT_SET' ? (c.defaultVariant || c.children[0]) : c;
  if (comp && comp.findOne && comp.findOne(n => n.name === '#main-api-table')) { template = comp; break; }
}
if (!template) return { ok: false, error: 'NO_LOCAL_TEMPLATE' };
const instance = template.createInstance();
const frame = instance.detachInstance();
if (anchor && anchor.absoluteBoundingBox) { const bb = anchor.absoluteBoundingBox; frame.x = bb.x + bb.width + 200; frame.y = bb.y; }
else { frame.x = figma.viewport.center.x; frame.y = figma.viewport.center.y; }
frame.name = COMPONENT_NAME + ' API';
figma.currentPage.selection = [frame];
figma.viewport.scrollAndZoomIntoView([frame]);
return { ok: true, frameId: frame.id, source: 'local-template' };
```

On `ok: false`, fall through to 7c. Mention template-key option in Step 13 when scaffolding — don't stop to ask.

#### Step 7c: Build the scaffold from scratch

Neutral frame satisfying full layer-name contract: 24px section gaps, 16px cell padding, 1px #E5E5E5 dividers, 13px body. Replace `__COMPONENT_NAME__`, `__ANCHOR_ID__`, `__FONT_FAMILY__`:

```javascript
const COMPONENT_NAME = '__COMPONENT_NAME__';
const ANCHOR_ID = '__ANCHOR_ID__';
const FONT_FAMILY = '__FONT_FAMILY__';
let FONT = FONT_FAMILY;
try {
  await figma.loadFontAsync({ family: FONT, style: 'Regular' });
  await figma.loadFontAsync({ family: FONT, style: 'Bold' });
} catch (e) {
  FONT = 'Inter';
  await figma.loadFontAsync({ family: FONT, style: 'Regular' });
  await figma.loadFontAsync({ family: FONT, style: 'Bold' });
}
const INK = { r: 0.067, g: 0.067, b: 0.067 }, GRAY = { r: 0.40, g: 0.40, b: 0.40 };
const LINE = { r: 0.898, g: 0.898, b: 0.898 }, HEAD_BG = { r: 0.980, g: 0.980, b: 0.980 };
const WELL_BG = { r: 0.969, g: 0.969, b: 0.969 }, WHITE = { r: 1, g: 1, b: 1 };
function solid(c) { return [{ type: 'SOLID', color: c }]; }
function txt(content, size, bold, color) {
  const t = figma.createText();
  t.fontName = { family: FONT, style: bold ? 'Bold' : 'Regular' };
  t.fontSize = size; t.characters = content; t.fills = solid(color || INK); t.textAutoResize = 'HEIGHT';
  return t;
}
function vstack(name, spacing) {
  const f = figma.createFrame();
  f.name = name; f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.itemSpacing = spacing; f.fills = []; return f;
}
function cell(name, width, content, opts) {
  opts = opts || {};
  const f = figma.createFrame();
  f.name = name; f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(width, 40);
  f.paddingTop = 12; f.paddingBottom = 12; f.paddingRight = 16;
  f.paddingLeft = opts.padLeft === undefined ? 16 : opts.padLeft;
  f.fills = [];
  const t = txt(content, opts.size || 13, !!opts.bold, opts.color);
  f.appendChild(t); t.layoutSizingHorizontal = 'FILL';
  return f;
}
function tableRow(name, cells, bg) {
  const r = figma.createFrame();
  r.name = name; r.layoutMode = 'HORIZONTAL';
  r.primaryAxisSizingMode = 'AUTO'; r.counterAxisSizingMode = 'AUTO';
  r.counterAxisAlignItems = 'MIN'; r.itemSpacing = 0;
  r.fills = bg ? solid(bg) : []; r.strokes = solid(LINE); r.strokeAlign = 'INSIDE';
  r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 1;
  for (const c of cells) r.appendChild(c);
  return r;
}
function buildTable(tableName, headerDefs, rowTemplateName, dataCells) {
  const table = vstack(tableName, 0);
  table.counterAxisSizingMode = 'AUTO';
  table.fills = solid(WHITE); table.strokes = solid(LINE); table.strokeAlign = 'INSIDE'; table.strokeWeight = 1;
  table.cornerRadius = 8; table.clipsContent = true;
  const headCells = headerDefs.map(h => cell('Header ' + h.label, h.w, h.label.toUpperCase(), { bold: true, size: 11, color: GRAY, padLeft: h.padLeft }));
  table.appendChild(tableRow('Header row', headCells, HEAD_BG));
  table.appendChild(tableRow(rowTemplateName, dataCells, null));
  return table;
}
function nameCellWithIndicator(cellName, indicatorName, width) {
  const f = cell(cellName, width, 'property', { padLeft: 28 });
  const ind = txt('└', 12, false, GRAY);
  ind.name = indicatorName; f.appendChild(ind);
  ind.layoutPositioning = 'ABSOLUTE'; ind.x = 10; ind.y = 12; ind.visible = false;
  return f;
}
const root = figma.createFrame();
root.name = COMPONENT_NAME + ' API'; root.layoutMode = 'VERTICAL';
root.primaryAxisSizingMode = 'AUTO'; root.counterAxisSizingMode = 'FIXED';
root.resize(1080, 100);
root.paddingTop = 40; root.paddingBottom = 40; root.paddingLeft = 40; root.paddingRight = 40;
root.itemSpacing = 24; root.fills = solid(WHITE); root.cornerRadius = 16;
const eyebrow = txt('API OVERVIEW', 11, true, GRAY);
root.appendChild(eyebrow);
const compName = vstack('#compName', 0);
const cnText = txt('Component name', 28, true, INK);
compName.appendChild(cnText); root.appendChild(compName);
compName.layoutSizingHorizontal = 'FILL'; cnText.layoutSizingHorizontal = 'FILL';
const genNotes = vstack('#general-api-notes', 0);
genNotes.paddingTop = 16; genNotes.paddingBottom = 16; genNotes.paddingLeft = 16; genNotes.paddingRight = 16;
genNotes.cornerRadius = 8; genNotes.fills = solid(WELL_BG);
const gnText = txt('General implementation notes.', 13, false, INK);
genNotes.appendChild(gnText); root.appendChild(genNotes);
genNotes.layoutSizingHorizontal = 'FILL'; gnText.layoutSizingHorizontal = 'FILL';
const propsLabel = txt('Properties', 18, true, INK);
root.appendChild(propsLabel);
const MAIN_HEADERS = [
  { label: 'Property', w: 220, padLeft: 28 },
  { label: 'Values', w: 240 },
  { label: 'Required', w: 90 },
  { label: 'Default', w: 130 },
  { label: 'Notes', w: 320 }
];
const mainCells = [
  nameCellWithIndicator('#property-name', '#hierarchy-indicator', 220),
  cell('#property-values', 240, 'values'),
  cell('#property-required', 90, 'No'),
  cell('#property-default', 130, '–'),
  cell('#property-notes', 320, 'notes', { color: GRAY })
];
root.appendChild(buildTable('#main-api-table', MAIN_HEADERS, '#api-row-template', mainCells));
const subChapter = vstack('#subcomponent-chapter-template', 12);
const subTitle = vstack('#subcomponent-title', 0);
const stText = txt('Sub-component', 16, true, INK);
subTitle.appendChild(stText); subChapter.appendChild(subTitle);
subTitle.layoutSizingHorizontal = 'FILL'; stText.layoutSizingHorizontal = 'FILL';
const subDesc = vstack('#subcomponent-description', 0);
const sdText = txt('Sub-component description.', 13, false, GRAY);
subDesc.appendChild(sdText); subChapter.appendChild(subDesc);
subDesc.layoutSizingHorizontal = 'FILL'; sdText.layoutSizingHorizontal = 'FILL';
const subCells = [
  nameCellWithIndicator('#subprop-name', '#subprop-hierarchy-indicator', 220),
  cell('#subprop-values', 240, 'values'),
  cell('#subprop-required', 90, 'No'),
  cell('#subprop-default', 130, '–'),
  cell('#subprop-notes', 320, 'notes', { color: GRAY })
];
subChapter.appendChild(buildTable('#subcomponent-table', MAIN_HEADERS, '#subcomponent-row-template', subCells));
root.appendChild(subChapter);
subChapter.layoutSizingHorizontal = 'FILL';
const exChapter = vstack('#config-example-chapter-template', 12);
const exTitle = vstack('#example-title', 0);
const etText = txt('Example', 16, true, INK);
exTitle.appendChild(etText); exChapter.appendChild(exTitle);
exTitle.layoutSizingHorizontal = 'FILL'; etText.layoutSizingHorizontal = 'FILL';
const preview = figma.createFrame();
preview.name = 'Preview'; preview.layoutMode = 'VERTICAL';
preview.primaryAxisSizingMode = 'AUTO'; preview.counterAxisSizingMode = 'FIXED';
preview.primaryAxisAlignItems = 'CENTER'; preview.counterAxisAlignItems = 'CENTER';
preview.paddingTop = 32; preview.paddingBottom = 32; preview.paddingLeft = 32; preview.paddingRight = 32;
preview.cornerRadius = 8; preview.fills = solid(WELL_BG);
const adText = txt('Live component preview', 13, false, GRAY);
adText.name = '#example-asset-description';
preview.appendChild(adText); exChapter.appendChild(preview);
preview.layoutSizingHorizontal = 'FILL';
const EXAMPLE_HEADERS = [
  { label: 'Property', w: 280 },
  { label: 'Value', w: 300 },
  { label: 'Notes', w: 420 }
];
const exCells = [
  cell('#example-prop-name', 280, 'property'),
  cell('#example-prop-value', 300, 'value'),
  cell('#example-prop-notes', 420, 'notes', { color: GRAY })
];
exChapter.appendChild(buildTable('#example-table', EXAMPLE_HEADERS, '#example-row-template', exCells));
root.appendChild(exChapter);
exChapter.layoutSizingHorizontal = 'FILL';
let anchor = null;
try { anchor = await figma.getNodeByIdAsync(ANCHOR_ID); } catch (e) {}
if (anchor && anchor.absoluteBoundingBox) { const bb = anchor.absoluteBoundingBox; root.x = bb.x + bb.width + 200; root.y = bb.y; }
else { root.x = figma.viewport.center.x; root.y = figma.viewport.center.y; }
figma.currentPage.appendChild(root);
figma.currentPage.selection = [root];
figma.viewport.scrollAndZoomIntoView([root]);
return { ok: true, frameId: root.id, source: 'scaffold', fontUsed: FONT };
```

### Step 8: Fill Header Fields

Replace `__FRAME_ID__`, `__COMPONENT_NAME__`, `__HAS_GENERAL_NOTES__` (`true`/`false`), `__GENERAL_NOTES__`.

```javascript
const FRAME_ID = '__FRAME_ID__';
const COMPONENT_NAME = '__COMPONENT_NAME__';
const HAS_GENERAL_NOTES = __HAS_GENERAL_NOTES__;
const GENERAL_NOTES = '__GENERAL_NOTES__';
const frame = await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
await LF(frame);
const compNameNode = frame.findOne(n => n.name === '#compName');
const compNameText = textOf(compNameNode);
if (compNameText) compNameText.characters = COMPONENT_NAME;
const notesNode = frame.findOne(n => n.name === '#general-api-notes');
if (notesNode) { if (!HAS_GENERAL_NOTES) notesNode.visible = false; else { const t = textOf(notesNode); if (t) t.characters = GENERAL_NOTES; } }
return { ok: true };
```

### Step 9: Fill the Main API Table

Replace `__FRAME_ID__`; `__PROPERTIES_JSON__` = Step 4 `PROPERTIES` array.

```javascript
const FRAME_ID = '__FRAME_ID__';
const PROPERTIES = __PROPERTIES_JSON__;
const frame = await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
const mainTable = frame.findOne(n => n.name === '#main-api-table');
const rowTemplate = mainTable.findOne(n => n.name === '#api-row-template');
await LF(mainTable);
for (const prop of PROPERTIES) {
  const row = rowTemplate.clone();
  SAFE(mainTable).appendChild(row); row.name = 'Row ' + prop.property;
  const nameText = textOf(row.findOne(n => n.name === '#property-name')); if (nameText) nameText.characters = prop.property;
  const valuesText = textOf(row.findOne(n => n.name === '#property-values')); if (valuesText) valuesText.characters = prop.values;
  const requiredText = textOf(row.findOne(n => n.name === '#property-required')); if (requiredText) requiredText.characters = prop.required ? 'Yes' : 'No';
  const defaultText = textOf(row.findOne(n => n.name === '#property-default')); if (defaultText) defaultText.characters = prop.default;
  const notesText = textOf(row.findOne(n => n.name === '#property-notes')); if (notesText) notesText.characters = prop.notes;
  const hierarchyIndicator = row.findOne(n => n.name === '#hierarchy-indicator'); if (hierarchyIndicator) hierarchyIndicator.visible = !!prop.isSubProperty;
}
rowTemplate.remove();
return { ok: true, rows: PROPERTIES.length };
```

### Step 10: Fill Sub-component Tables

Render sub-components **before** examples — cloned sections append, so render order = visual order.

#### 10a: One script per sub-component table

For each `SUB_COMPONENT_TABLES` entry, replace `__FRAME_ID__`, `__SUBCOMPONENT_NAME__`, `__SUBCOMPONENT_DESCRIPTION__`, `__HAS_DESCRIPTION__` (`true`/`false`), `__SUBCOMPONENT_PROPERTIES_JSON__` (same row shape as Step 9):

```javascript
const FRAME_ID = '__FRAME_ID__';
const SUB_NAME = '__SUBCOMPONENT_NAME__';
const SUB_DESCRIPTION = '__SUBCOMPONENT_DESCRIPTION__';
const HAS_DESCRIPTION = __HAS_DESCRIPTION__;
const SUB_PROPERTIES = __SUBCOMPONENT_PROPERTIES_JSON__;
const frame = await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
const subTemplate = frame.findOne(n => n.name === '#subcomponent-chapter-template');
const section = subTemplate.clone();
SAFE(subTemplate.parent).appendChild(section);
section.name = SUB_NAME;
section.visible = true;
try { section.layoutSizingHorizontal = 'FILL'; } catch (e) {}
await LF(section);
const titleText = textOf(section.findOne(n => n.name === '#subcomponent-title'));
if (titleText) titleText.characters = SUB_NAME;
const descNode = section.findOne(n => n.name === '#subcomponent-description');
if (descNode) { if (!HAS_DESCRIPTION) descNode.visible = false; else { const t = textOf(descNode); if (t) t.characters = SUB_DESCRIPTION; } }
const subTable = section.findOne(n => n.name === '#subcomponent-table');
const rowTemplate = subTable.findOne(n => n.name === '#subcomponent-row-template');
for (const prop of SUB_PROPERTIES) {
  const row = rowTemplate.clone();
  SAFE(subTable).appendChild(row); row.name = 'Row ' + prop.property;
  const nameText = textOf(row.findOne(n => n.name === '#subprop-name')); if (nameText) nameText.characters = prop.property;
  const valuesText = textOf(row.findOne(n => n.name === '#subprop-values')); if (valuesText) valuesText.characters = prop.values;
  const requiredText = textOf(row.findOne(n => n.name === '#subprop-required')); if (requiredText) requiredText.characters = prop.required ? 'Yes' : 'No';
  const defaultText = textOf(row.findOne(n => n.name === '#subprop-default')); if (defaultText) defaultText.characters = prop.default;
  const notesText = textOf(row.findOne(n => n.name === '#subprop-notes')); if (notesText) notesText.characters = prop.notes;
  const hierarchyIndicator = row.findOne(n => n.name === '#subprop-hierarchy-indicator'); if (hierarchyIndicator) hierarchyIndicator.visible = !!prop.isSubProperty;
}
rowTemplate.remove();
return { ok: true, subComponent: SUB_NAME, rows: SUB_PROPERTIES.length };
```

#### 10b: When there are no sub-component tables

Render nothing here. Section template is hidden by Step 11's final hide script either way.

### Step 11: Fill Configuration Examples

One script per example. JSON placeholders come from that example's Step 5 fields; `__COMPONENT_TARGET_ID__` = Step 1 `targetId`.

```javascript
const FRAME_ID = '__FRAME_ID__';
const EXAMPLE_TITLE = '__EXAMPLE_TITLE__';
const COMPONENT_TARGET_ID = '__COMPONENT_TARGET_ID__';
const VARIANT_PROPS = __VARIANT_PROPERTIES_JSON__;
const CHILD_OVERRIDES = __CHILD_OVERRIDES_JSON__;
const TEXT_OVERRIDES = __TEXT_OVERRIDES_JSON__;
const SLOT_INSERTIONS = __SLOT_INSERTIONS_JSON__;
const EXAMPLE_PROPERTIES = __EXAMPLE_PROPERTIES_JSON__;
try {
const frame = await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
const loadAllFonts = LF;
const exampleTemplate = frame.findOne(n => n.name === '#config-example-chapter-template');
const section = exampleTemplate.clone();
SAFE(exampleTemplate.parent).appendChild(section);
section.name = EXAMPLE_TITLE;
section.visible = true;
try { section.layoutSizingHorizontal = 'FILL'; } catch (e) {}
await loadAllFonts(section);
const titleText = textOf(section.findOne(n => n.name === '#example-title'));
if (titleText) titleText.characters = EXAMPLE_TITLE;
const preview = section.findOne(n => n.name === 'Preview');
if (preview) {
  const assetDesc = preview.findOne(n => n.name === '#example-asset-description');
  if (assetDesc) assetDesc.remove();
  const compNode = await figma.getNodeByIdAsync(COMPONENT_TARGET_ID);
  const defaultVariant = compNode.type === 'COMPONENT_SET' ? (compNode.defaultVariant || compNode.children[0]) : compNode;
  const instance = NI(defaultVariant);
  await loadAllFonts(instance);
  if (Object.keys(VARIANT_PROPS).length > 0) { instance.setProperties(VARIANT_PROPS); await loadAllFonts(instance); }
  if (CHILD_OVERRIDES && CHILD_OVERRIDES.length > 0) {
    let slot = instance.findOne(n => n.type === 'SLOT');
    if (!slot) slot = instance.children[0];
    if (slot && slot.children) {
      for (let i = 0; i < Math.min(CHILD_OVERRIDES.length, slot.children.length); i++) {
        const child = slot.children[i];
        if (child.type === 'INSTANCE' && Object.keys(CHILD_OVERRIDES[i]).length > 0) { try { child.setProperties(CHILD_OVERRIDES[i]); } catch (e) {} }
      }
    }
    await loadAllFonts(instance);
  }
  if (TEXT_OVERRIDES && Object.keys(TEXT_OVERRIDES).length > 0) {
    await loadAllFonts(instance);
    for (const layerName of Object.keys(TEXT_OVERRIDES)) {
      const textNode = instance.findOne(n => n.type === 'TEXT' && n.name === layerName);
      if (textNode) { try { textNode.characters = TEXT_OVERRIDES[layerName]; } catch (e) {} }
    }
  }
  // Slot insertions: configure BEFORE appendChild — after adoption, child nodes get compound IDs
  if (SLOT_INSERTIONS && SLOT_INSERTIONS.length > 0) {
    for (const insertion of SLOT_INSERTIONS) {
      const slotNode = instance.findOne(n => n.type === 'SLOT' && n.name === insertion.slotName);
      if (slotNode) {
        const comp = await figma.getNodeByIdAsync(insertion.componentNodeId);
        if (comp && comp.type === 'COMPONENT') {
          const child = NI(comp);
          await loadAllFonts(child);
          if (insertion.nestedOverrides && Object.keys(insertion.nestedOverrides).length > 0) { try { child.setProperties(insertion.nestedOverrides); await loadAllFonts(child); } catch (e) {} }
          if (insertion.textOverrides && Object.keys(insertion.textOverrides).length > 0) {
            for (const layerName of Object.keys(insertion.textOverrides)) {
              const tn = child.findOne(n => n.type === 'TEXT' && n.name === layerName);
              if (tn) { try { tn.characters = insertion.textOverrides[layerName]; } catch (e) {} }
            }
          }
          ADOPT(slotNode, child);
          await loadAllFonts(instance);
        }
      }
    }
    await loadAllFonts(instance);
  }
  ADOPT(preview, instance);
  instance.layoutAlign = 'INHERIT';
}
const exampleTable = section.findOne(n => n.name === '#example-table');
const rowTemplate = exampleTable.findOne(n => n.name === '#example-row-template');
for (const prop of EXAMPLE_PROPERTIES) {
  const row = rowTemplate.clone();
  SAFE(exampleTable).appendChild(row); row.name = 'Row ' + prop.property;
  const nameText = textOf(row.findOne(n => n.name === '#example-prop-name')); if (nameText) nameText.characters = prop.property;
  const valueText = textOf(row.findOne(n => n.name === '#example-prop-value')); if (valueText) valueText.characters = prop.value;
  const notesText = textOf(row.findOne(n => n.name === '#example-prop-notes')); if (notesText) notesText.characters = prop.notes;
}
rowTemplate.remove();
return { ok: true, example: EXAMPLE_TITLE, rows: EXAMPLE_PROPERTIES.length };
} finally { SWEEP() }
```

After ALL examples are rendered, hide both section templates (or ghost "Sub-component"/"Example" sections remain):

```javascript
const frame = await figma.getNodeByIdAsync('__FRAME_ID__');
let _p = frame; while (_p.parent && _p.parent.type !== 'DOCUMENT') _p = _p.parent;
if (_p.type === 'PAGE') await figma.setCurrentPageAsync(_p);
const subTemplate = frame.findOne(n => n.name === '#subcomponent-chapter-template');
if (subTemplate) subTemplate.visible = false;
const exampleTemplate = frame.findOne(n => n.name === '#config-example-chapter-template');
if (exampleTemplate) exampleTemplate.visible = false;
return { ok: true };
```

### Step 12: Screenshot Self-validation

Screenshot the frame and check:

1. Main table: every property with correct values/required/default/notes; hierarchy indicator only on `isSubProperty` rows, directly under parent.
2. Sub-component sections: one per authored table; template hidden (no ghost heading).
3. Examples: one per example; no ghost section; each Preview holds a **live instance**; each preview matches its table.
4. Layout: no clipped text, no overlaps, no collapsed sections, tables aligned.

Fix with targeted scripts and re-screenshot — up to 3 iterations, then ship and note remaining issues.

### Step 13: Complete

Also replace `__TARGET_ID__` and `__GUARD_JSON__` (Step 1's `guard`, verbatim). The second half re-reads the source and proves it is untouched:

```javascript
const FRAME_ID = '__FRAME_ID__';
const frame = await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
figma.currentPage.selection = [frame];
figma.viewport.scrollAndZoomIntoView([frame]);
const t = await figma.getNodeByIdAsync('__TARGET_ID__'), B = __GUARD_JSON__, ch = [];
if (!t) ch.push('source missing');
else {
  const gb = t.absoluteBoundingBox || {}; let gd = '';
  try { gd = Object.keys(t.componentPropertyDefinitions || {}).sort().join(','); } catch (e) {}
  const a = { name: t.name, parentId: t.parent ? t.parent.id : '', kids: ('children' in t) ? t.children.length : 0, box: [Math.round(gb.x||0), Math.round(gb.y||0), Math.round(gb.width||0), Math.round(gb.height||0)], defs: gd };
  for (const k in B) if (String(a[k]) !== String(B[k])) ch.push(k);
}
return { ok: true, frameId: frame.id, frameName: frame.name, intact: ch.length === 0, changed: ch };
```

`intact: false` is a failure, not a footnote: name what changed, tell the user to undo (Cmd+Z) before trusting the overview, and don't report success. `intact: true` needs no mention.

Summarize in chat: component documented and where placed; property count (and sub-property count); sub-component tables (names) or "none"; examples rendered (titles), each with a live preview; notable reasoning (e.g. "State axis decomposed into validationState + isDisabled; hover/pressed/focused are runtime"); which template tier rendered it. If scaffold (7c), add: a polished template is available — duplicate the uSpec Template Community file, publish as library, paste the "API" component's key into Configuration for next time.

## Notes

- **Both target types work:** `COMPONENT_SET` or standalone `COMPONENT` — instance creation handles both via `compNode.type === 'COMPONENT_SET' ? (defaultVariant || children[0]) : compNode`.
- **Keys are sacred.** `setProperties()` accepts only exact keys from `componentPropertyDefinitions` (`#suffix` included) and variant options with exact spelling. Text overrides: case-sensitive TEXT names from `textNodes` (or `associatedLayers`), never frame names.
- **Recovery:** if fill script died mid-run, delete frame and re-run from Step 7. Spec stays valid.
- **Order:** cloned sections append — sub-components first, then examples.
- **Timeouts:** split scripts. Never inline more than one example per script.
- **Ghost sections** = Step 11's final hide script was skipped.

---

Adapted from uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license.

---

*Адаптировано из uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license — скилл Figma Community `create-api`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/annotate).*

