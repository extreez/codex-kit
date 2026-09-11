> Часть скилла annotate (см. SKILL.md — общий read-only invariant, guard-функции
> SAFE/ADOPT/NI/SWEEP и выбор режима описаны там один раз, здесь не дублируются
> заново). Текст ниже — оригинальный источник (Create Color Annotation), не переведён:
> сохраняем формулировки/код/числа дословно ради точности guard-правил.

# Create Color Annotation

Extract color data from selected component/set/instance and render an annotation frame: variant sections, live previews, per-element token tables.

Contract: run, don't edit. Never pause; on ambiguity pick most defensible option, mention in completion. Only legal stop: Step 1 fail-fast.

## Read-only invariant

The documented component is **read-only** — the selected component, its set, variants, sub-components, their main components, and every library asset. Structure, properties, position, name, visibility, text, paints, variable modes: all untouchable. Correct annotation plus modified source is a failed run.

**Writable scope, exhaustive:** the Step 8 annotation frame and its descendants, plus instances these scripts create. Never the target, never the page.

Never `appendChild`/`insertChild`/`remove`/`clone`/`setProperties`/`setVariantProperties`/`detachInstance`/`swapComponent`/`set`+`clearExplicitVariableModeForCollection`/`setBoundVariable`/`resize()`, or write `name`/`x`/`y`/`visible`/`characters`/`fills`/`strokes`/`layoutMode`, on the target, its ancestors, or its descendants. Read a fresh instance instead. If a step seems to need one, the step is wrong — skip it, note it in completion.

### Render preamble

Prepend the whole block to both Step 10 render scripts — the only scripts that build previews. `__FRAME_ID__` = annotation frame id.

```javascript
const _F='__FRAME_ID__',_TMP=[];
function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
function _mine(n){let p=n;while(p){if(_TMP.indexOf(p)>=0)return true;p=p.parent}return false}
function SAFE(n){if(!n||!((_F&&_in(n,_F))||_mine(n)))throw new Error('GUARD: write outside annotation frame refused: '+(n&&n.name));return n}
function ADOPT(p,c){SAFE(p);if(!_mine(c)&&!_in(c,_F))throw new Error('GUARD: refused to move existing node into annotation: '+c.name);p.appendChild(c);return c}
function NI(src,parent){const i=src.createInstance();_TMP.push(i);if(parent)ADOPT(parent,i);return i}
function SWEEP(){for(const n of _TMP){try{if(!n.removed&&n.parent&&n.parent.type==='PAGE')n.remove()}catch(e){}}_TMP.length=0}
async function loadAllFonts(rootNode){
  const textNodes=[],fontSet=new Set(),fontsToLoad=[];
  (function collect(n){try{if(n.type==='TEXT')textNodes.push(n);if('children' in n&&n.children)for(const c of n.children){try{collect(c)}catch{}}}catch{}})(rootNode);
  for(const tn of textNodes){try{const fn=tn.fontName;if(fn&&fn!==figma.mixed&&fn.family){const k=fn.family+'|'+fn.style;if(!fontSet.has(k)){fontSet.add(k);fontsToLoad.push(fn)}}}catch{}}
  await Promise.all(fontsToLoad.map(f=>figma.loadFontAsync(f).catch(()=>{})));
}
async function loadFontWithFallback(family,preferredStyle,fallbackStyle){
  fallbackStyle=fallbackStyle||'Regular';
  const allFonts=await figma.listAvailableFontsAsync(),familyFonts=allFonts.filter(f=>f.fontName.family===family);
  const pick=familyFonts.find(f=>f.fontName.style===preferredStyle)||familyFonts.find(f=>f.fontName.style===fallbackStyle)||familyFonts[0];
  if(pick){await figma.loadFontAsync(pick.fontName);return pick.fontName}
  await figma.loadFontAsync({family:'Inter',style:'Regular'});
  return {family:'Inter',style:'Regular'};
}
function enableNestedBooleans(node){try{if(node.type==='INSTANCE'){try{const cp=node.componentProperties;if(cp){const bp={};for(const [k,v] of Object.entries(cp))if(v.type==='BOOLEAN')bp[k]=true;if(Object.keys(bp).length>0){try{node.setProperties(bp)}catch{}}}}catch{}}if('children' in node&&node.children)for(const c of node.children){try{enableNestedBooleans(c)}catch{}}}catch{}}
function setLbl(root,name,chars){const f=root&&root.findOne(n=>n.name===name);if(f){const t=f.findOne(n=>n.type==='TEXT');if(t)t.characters=chars}}
```

Instances come only from `NI` — never bare `createInstance()`. Pass the parent so the instance is inside the frame before the first `await`; measure-first cases use `NI(src)` then `ADOPT(parent,inst)`. Every write-script body sits in `try{ ... }finally{SWEEP()}` so a throw can't abandon an instance on canvas: `SWEEP` removes registered instances still parented to a page and leaves adopted ones alone. Two script families correctly keep a bare `createInstance()` and must not be "fixed": Steps 1 and 5, whose temp instance already sits inside `try{...}finally{tmp.remove()}`; and Step 8's template tiers, which run before `_F` exists and instantiate the template — Tier 2's filter guarantees that is never the target.

## Configuration

```
COLOR_TEMPLATE_KEY:  (empty — set to your published "Color Annotation" template key to skip discovery)
FONT_FAMILY: Inter   (preview label + scaffold font)
```

`COLOR_TEMPLATE_KEY` set → Step 8 imports; empty → Step 8 searches this file, else builds scaffold. Template: https://www.figma.com/community/file/1603925462078533207/uspec-template — duplicate, publish, paste key. `FONT_FAMILY` falls back to Inter.

## Script conventions

Replace `__UPPER_SNAKE__` before running; JSON placeholders take valid JSON. One script at a time. Keep the page-loading preamble and font-loading fallbacks. One script per variant (extraction) / section (render).

## Data shapes

### Strategy A

```typescript
interface ColorAnnotationData { componentName: string; generalNotes?: string; renderingStrategy: "A"; variants: ColorVariantData[]; }
interface ColorVariantData { name: string; variantProperties?: Record<string, string>; tables: ColorTableData[]; }
interface ColorTableData { name: string; elements: ColorElement[]; }
interface ColorElement { element: string; token: string /* token/style name, "#RRGGBB", or "none" */; notes: string; compositeChildren?: CompositeChildRow[]; }
interface CompositeChildRow { element: string; value: string; notes: string; }
```

### Strategy B

```typescript
interface ConsolidatedColorAnnotationData { componentName: string; generalNotes?: string; renderingStrategy: "B"; stateColumns: string[]; stateAxisName: string; collectionId?: string; variants: ConsolidatedVariantData[]; }
interface ConsolidatedVariantData { name: string; modeId?: string; variantProperties?: Record<string, string>; tables: ConsolidatedTableData[]; }
interface ConsolidatedTableData { name: string; elements: ConsolidatedElement[]; }
interface ConsolidatedElement { element: string; tokensByState: Record<string, string>; notes: string; compositeChildren?: CompositeChildRow[]; }
```

`stateColumns` / `tokensByState` keys = RAW Figma state-axis option names (drive `setProperties`); relabels go in notes.

## Workflow

1. Resolve selection + read structure (fail fast)
2. Classify axes for color relevance (fingerprint)
3. Detect color-controlling variable collections + mode map
4. Choose Strategy A vs B (two-gate) + walk plan
5. Walk each planned variant + boolean-reveal delta
6. Interpret — assemble annotation data
7. Audit render inputs
8. Resolve template (key → named component → scaffold)
9. Fill header fields
10. Render sections (one script per variant/section)
11. Visual validation
12. Completion

### Step 1: Resolve selection, read structure (fail fast)

```javascript
const sel=figma.currentPage.selection;
function sg(n,p){try{return n[p]}catch{}}
function nearestEligible(node){let n=node;while(n&&n.type!=='PAGE'&&n.type!=='DOCUMENT'){if(n.type==='COMPONENT_SET'||n.type==='COMPONENT'||n.type==='INSTANCE')return n;n=n.parent}return null}
if(!sel||sel.length===0)return {error:'NO_SELECTION',message:'Nothing is selected. Select a component, a component set, or an instance of one, then run the color annotation again.'};
let picked=null;
for(const s of sel){const e=nearestEligible(s);if(e){picked=e;break}}
if(!picked)return {error:'INVALID_SELECTION',message:'The selection is not a component, component set, or instance (and has no such ancestor). Select one and run again.'};
let target=picked;
if(target.type==='INSTANCE'){const mc=await target.getMainComponentAsync();if(!mc)return {error:'NO_MAIN_COMPONENT',message:'This instance has no reachable main component (it may be detached, or its library is unavailable). Select the component itself and run again.'};target=mc}
if(target.type==='COMPONENT'&&target.parent&&target.parent.type==='COMPONENT_SET')target=target.parent;
let _p=target;
while(_p&&_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
if(_p&&_p.type==='PAGE')await figma.setCurrentPageAsync(_p);
const targetPageId=_p&&_p.type==='PAGE'?_p.id:null;
const isSet=target.type==='COMPONENT_SET';
const axes={};
try{if(isSet&&target.variantGroupProperties)for(const [k,v] of Object.entries(target.variantGroupProperties))axes[k]=v.values}catch{}
let defaultVariant=target;
if(isSet){try{defaultVariant=target.defaultVariant||target.children[0]}catch{defaultVariant=target.children[0]}}
const defaultProps=(isSet&&defaultVariant.variantProperties)?defaultVariant.variantProperties:{};
const axisDefaults={};
for(const [a,vals] of Object.entries(axes))axisDefaults[a]=defaultProps[a]||vals[0];
let booleanDefs=[],defsSource='componentPropertyDefinitions';
try{
  const defs=target.componentPropertyDefinitions;
  for(const [key,def] of Object.entries(defs))if(def.type==='BOOLEAN')booleanDefs.push({key,defaultValue:def.defaultValue});
}catch{
  // Library components can refuse this read — derive from a temporary instance.
  defsSource='instance-fallback';
  try{const tmp=defaultVariant.createInstance();try{const props=tmp.componentProperties;for(const [key,v] of Object.entries(props))if(v.type==='BOOLEAN')booleanDefs.push({key,defaultValue:v.value})}finally{tmp.remove()}}catch{}
}
const variants=isSet?target.children.map(c=>({id:c.id,name:c.name,variantProperties:c.variantProperties||{}})):[{id:target.id,name:target.name,variantProperties:{}}];
const bb=picked.absoluteBoundingBox||null;
const anchor=bb?{x:Math.round(bb.x),y:Math.round(bb.y),width:Math.round(bb.width),height:Math.round(bb.height)}:{x:Math.round(figma.viewport.center.x),y:Math.round(figma.viewport.center.y),width:0,height:0};
const gb=target.absoluteBoundingBox||{};let gd='';try{gd=Object.keys(target.componentPropertyDefinitions||{}).sort().join(',')}catch{}
const guard={name:target.name,parentId:target.parent?target.parent.id:'',kids:('children' in target)?target.children.length:0,box:[Math.round(gb.x||0),Math.round(gb.y||0),Math.round(gb.width||0),Math.round(gb.height||0)],defs:gd};
return {componentName:target.name,componentSetId:target.id,isComponentSet:isSet,isRemote:sg(target,'remote')===true,targetPageId,axes,axisDefaults,defaultVariantId:defaultVariant.id,defaultVariantName:defaultVariant.name,booleanDefs,defsSource,variantCount:variants.length,variants,anchorNodeId:picked.id,anchor,guard};
```

On `error`, relay `message` verbatim and stop (only legal stop). Reuse: `componentName`, `componentSetId`, `axes`, `axisDefaults`, `defaultVariantId`, `booleanDefs` (raw keys), `variants`, `anchorNodeId`, `guard` (Step 12 integrity check — keep verbatim). `isRemote: true` = team library; if bindings resolve to null names, tell user to enable the published library. Standalone `COMPONENT` → one variant, empty axes, single-section A.

### Step 2: Classify axes

Skip when `axes` empty. Axis is color-relevant only if changing its option changes some element's color with other axes pinned at default. Irrelevant (Size, Density, Shape, content toggles) → collapse.

Replace `__COMPONENT_SET_ID__`, `__AXES_JSON__`, `__AXIS_DEFAULTS_JSON__`:

```javascript
const COMPONENT_SET_ID='__COMPONENT_SET_ID__',AXES=__AXES_JSON__,AXIS_DEFAULTS=__AXIS_DEFAULTS_JSON__;
function sg(n,p){try{return n[p]}catch{}}
function sid(n,p){try{const v=n[p];return typeof v==='string'?v:''}catch{return ''}}
function hx(c){return '#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase()}
function shortHash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(16)}
const target=await figma.getNodeByIdAsync(COMPONENT_SET_ID);
if(!target)return {error:'Component set not found: '+COMPONENT_SET_ID};
let _p=target;
while(_p&&_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
if(_p&&_p.type==='PAGE')await figma.setCurrentPageAsync(_p);
const allVariants=target.type==='COMPONENT_SET'?target.children:[target];
const varNameCache={};
async function tokenName(id){if(!id)return null;if(varNameCache[id]!==undefined)return varNameCache[id];let out=null;try{const v=await figma.variables.getVariableByIdAsync(id);if(v)out=(v.codeSyntax&&v.codeSyntax.WEB)||v.name}catch{}varNameCache[id]=out;return out}
const boundVariableIds=new Set(),styleIds=new Set();
async function fingerprint(root){
  const marks=new Set();
  async function walk(n){
    if(sg(n,'visible')===false)return;
    const fills=sg(n,'fills');
    if(Array.isArray(fills)){const fsid=sid(n,'fillStyleId');if(fsid){marks.add('fs:'+fsid);styleIds.add(fsid)}for(const f of fills){if(f.visible===false)continue;const bid=f.boundVariables&&f.boundVariables.color&&f.boundVariables.color.id;if(bid){boundVariableIds.add(bid);marks.add('fv:'+((await tokenName(bid))||bid))}else if(f.type==='SOLID')marks.add('fh:'+hx(f.color))}}
    const strokes=sg(n,'strokes');
    if(Array.isArray(strokes)){const ssid=sid(n,'strokeStyleId');if(ssid){marks.add('ss:'+ssid);styleIds.add(ssid)}for(const s of strokes){if(s.visible===false)continue;const bid=s.boundVariables&&s.boundVariables.color&&s.boundVariables.color.id;if(bid){boundVariableIds.add(bid);marks.add('sv:'+((await tokenName(bid))||bid))}else if(s.type==='SOLID')marks.add('sh:'+hx(s.color))}}
    const effects=sg(n,'effects');
    if(Array.isArray(effects)){const esid=sid(n,'effectStyleId');if(esid)marks.add('es:'+esid);for(const e of effects){if(e.visible===false||!e.color)continue;const bid=e.boundVariables&&e.boundVariables.color&&e.boundVariables.color.id;if(bid){boundVariableIds.add(bid);marks.add('ev:'+((await tokenName(bid))||bid))}else marks.add('eh:'+hx(e.color))}}
    const kids=sg(n,'children');
    if(kids)for(const c of kids)await walk(c);
  }
  await walk(root);
  return Array.from(marks).sort().join('|');
}
const fpCache={};
async function variantFingerprint(v){if(fpCache[v.id]===undefined)fpCache[v.id]=await fingerprint(v);return fpCache[v.id]}
function findVariant(props){return allVariants.find(v=>{const vp=v.variantProperties||{};return Object.entries(props).every(([k,x])=>vp[k]===x)})||null}
const STATE_KEYWORDS=['enabled','hover','hovered','pressed','disabled','active','rest','focused','focus','selected','dragged','error','loading'];
const axisClassification={};
for(const [axis,values] of Object.entries(AXES)){
  const perOption={};
  for(const val of values){
    const pinned=Object.assign({},AXIS_DEFAULTS);pinned[axis]=val;
    let v=findVariant(pinned);if(!v)v=allVariants.find(x=>(x.variantProperties||{})[axis]===val)||null;
    perOption[val]=v?await variantFingerprint(v):null;
  }
  const uniq=new Set(Object.values(perOption).filter(x=>x!==null)),hashes={};
  for(const [val,fp] of Object.entries(perOption))hashes[val]=fp===null?null:shortHash(fp);
  axisClassification[axis]={values,isState:/state|status/i.test(axis)||values.some(v=>STATE_KEYWORDS.includes(String(v).toLowerCase())),colorRelevant:uniq.size>1,fingerprintHashByOption:hashes};
}
return {axisClassification,stateAxis:Object.keys(axisClassification).find(a=>axisClassification[a].isState)||null,boundVariableIds:Array.from(boundVariableIds),styleIds:Array.from(styleIds)};
```

`colorRelevant: false` → axis collapses. `isState: true` → per-state columns in B (two match → prefer literal `state`/`status`). Non-color-relevant state axis stays only on user request. `fingerprintHashByOption` = audit trail. Keep `boundVariableIds` for Step 3. On timeout, split `AXES`, run twice, union.

### Step 3: Detect variable-mode collections

Colors can switch via variable modes (Tag color: Gray/Orange; Badge: Neutral/Positive; Theme: Light/Dark). Skip when Step 2's `boundVariableIds` empty.

Replace `__BOUND_VARIABLE_IDS_JSON__`:

```javascript
const BOUND_VARIABLE_IDS=__BOUND_VARIABLE_IDS_JSON__;
function hx(c){return '#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase()}
const varCache={},colCache={};
async function getVar(id){if(varCache[id]!==undefined)return varCache[id];let v=null;try{v=await figma.variables.getVariableByIdAsync(id)}catch{}varCache[id]=v;return v}
async function getCol(id){if(colCache[id]!==undefined)return colCache[id];let c=null;try{c=await figma.variables.getVariableCollectionByIdAsync(id)}catch{}colCache[id]=c;return c}
function defaultModeId(col){if(!col)return null;return col.defaultModeId||(col.modes&&col.modes[0]&&col.modes[0].modeId)||null}
async function resolveForMode(vid,colId,modeId,depth){
  if(depth>10)return null;
  const v=await getVar(vid);if(!v)return null;
  const own=await getCol(v.variableCollectionId);if(!own)return null;
  const useMode=(colId&&own.id===colId)?modeId:defaultModeId(own);
  let raw=useMode!==null?v.valuesByMode[useMode]:undefined;
  if(raw===undefined){const keys=Object.keys(v.valuesByMode);raw=keys.length>0?v.valuesByMode[keys[0]]:undefined}
  if(raw&&typeof raw==='object'&&raw.type==='VARIABLE_ALIAS'){const t=await getVar(raw.id);const deeper=await resolveForMode(raw.id,colId,modeId,depth+1);return {aliasName:t?((t.codeSyntax&&t.codeSyntax.WEB)||t.name):null,hex:deeper?deeper.hex:null}}
  if(raw&&typeof raw==='object'&&'r' in raw)return {aliasName:null,hex:hx(raw)};
  return null;
}
const candidates={};
async function examineChain(vid,depth){
  if(depth>10)return;
  const v=await getVar(vid);if(!v||v.resolvedType!=='COLOR')return;
  const col=await getCol(v.variableCollectionId);if(!col)return;
  if(col.modes&&col.modes.length>=2&&!candidates[col.id]){
    const perModeHex=[];
    for(const m of col.modes){const r=await resolveForMode(vid,col.id,m.modeId,0);perModeHex.push(r?r.hex:null)}
    if(new Set(perModeHex.filter(x=>x!==null)).size>1){
      const modeNames=col.modes.map(m=>String(m.name).toLowerCase()),themeLike=/theme|scheme|appearance/i.test(col.name)||(modeNames.length>0&&modeNames.every(n=>/light|dark|dim|contrast|day|night/.test(n)));
      candidates[col.id]={id:col.id,name:col.name,modes:col.modes.map(m=>({name:m.name,modeId:m.modeId})),themeLike,cellMap:{}};
    }
  }
  const dm=defaultModeId(col),raw=dm!==null?v.valuesByMode[dm]:undefined;
  if(raw&&typeof raw==='object'&&raw.type==='VARIABLE_ALIAS')await examineChain(raw.id,depth+1);
}
for(const vid of BOUND_VARIABLE_IDS)await examineChain(vid,0);
for(const cand of Object.values(candidates)){
  for(const vid of BOUND_VARIABLE_IDS){
    const v=await getVar(vid);if(!v||v.resolvedType!=='COLOR')continue;
    const displayName=(v.codeSyntax&&v.codeSyntax.WEB)||v.name,ownColId=v.variableCollectionId,perMode={};
    for(const m of cand.modes){const r=await resolveForMode(vid,cand.id,m.modeId,0);const useAlias=ownColId===cand.id&&r&&r.aliasName;perMode[m.name]={name:useAlias?r.aliasName:displayName,hex:r?r.hex:null}}
    cand.cellMap[vid]={name:displayName,perMode};
  }
}
return {candidates:Object.values(candidates)};
```

Each candidate = collection whose modes change colors; `cellMap[variableId].perMode[modeName] = { name, hex }`. Component-specific (`themeLike: false`, e.g. "Tag color") = mode multiplier — one section per mode. Theme (`themeLike: true`) NOT exploded; record in `generalNotes` ("Colors respond to the 'Theme' collection (Light, Dark); tokens shown resolve in Light."); explode only on user request. Multiple non-theme candidates: pick one referencing the component (or most modes); note others in `generalNotes`. Library variables may not resolve if library disabled — mention enabling when names null. Step 5 new bound ids → re-run with union.

### Step 4: Strategy + walk plan

Color-irrelevant axes never create sections — pin at default. **Two-gate:** (1) collect color-relevant axes + state axis (Step 2) + mode multiplier (Step 3: non-theme, 2+ modes). (2) **Gate 1 — viability:** NON-state color multiplier must exist (mode collection with 2+ modes OR non-state color-relevant axis with 2+ values). Neither → **A**. (3) **Gate 2 — benefit:** section count = product of ALL color-relevant axis counts (incl. state) × mode count. ≤ 6 → **A**; > 6 → **B** (states = columns, sections = remaining axes × modes). Soft: >~7 columns → reconsider A.

Examples: Text Field 11 states / no multiplier → A, 11 sections. Button 4 states → A, 4 sections. Tag 5 states × 2 types × 11 modes = 110 → B, 22 sections × 5 cols. Badge 3 states × 5 modes = 15 → B, 5 sections × 3 cols. Switch 4 states → A.

**Walk plan.** A: one walk per color-relevant axis combination (irrelevant at defaults), match `variants` by `variantProperties`. B: one walk per (non-state combo × state option); modes DO NOT multiply walks — bindings identical, Step 3 `cellMap` supplies per-mode token data. Static: one walk of default, one section named after component. Sparse: drop missing combos, note in `generalNotes`. >~24 walks → re-check classification.

### Step 5: Walk each planned variant

Per entry, replace `__VARIANT_ID__`, `__VARIANT_LABEL__`:

```javascript
const VARIANT_ID='__VARIANT_ID__',VARIANT_LABEL='__VARIANT_LABEL__';
function sg(n,p){try{return n[p]}catch{}}
function sid(n,p){try{const v=n[p];return typeof v==='string'?v:''}catch{return ''}}
function hx(c){return '#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase()}
const root=await figma.getNodeByIdAsync(VARIANT_ID);
if(!root)return {error:'Variant not found: '+VARIANT_ID};
let _p=root;
while(_p&&_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
if(_p&&_p.type==='PAGE')await figma.setCurrentPageAsync(_p);
const styleCache={},varCache={};
async function styleName(id){if(!id)return null;if(styleCache[id]!==undefined)return styleCache[id];let out=null;try{const s=await figma.getStyleByIdAsync(id);if(s)out=s.name}catch{}styleCache[id]=out;return out}
async function tokenInfo(id){if(!id)return null;if(varCache[id]!==undefined)return varCache[id];let out=null;try{const v=await figma.variables.getVariableByIdAsync(id);if(v)out={id,name:(v.codeSyntax&&v.codeSyntax.WEB)||v.name}}catch{}varCache[id]=out;return out}
const entries=[];
async function buildPaintEntry(node,path,property,paint,sId,sub){
  const bid=paint.boundVariables&&paint.boundVariables.color&&paint.boundVariables.color.id,t=bid?await tokenInfo(bid):null;
  const entry={nodeId:node.id,element:node.name,path,property,paintType:paint.type||null,hex:paint.color?hx(paint.color):null,styleName:sId?await styleName(sId):null,tokenName:t?t.name:null,tokenId:t?t.id:null,opacity:paint.opacity!==undefined?paint.opacity:null,blendMode:paint.blendMode||'NORMAL'};
  if(paint.type&&paint.type.startsWith('GRADIENT_')){
    if(paint.gradientTransform)entry.angleDegrees=Math.round(Math.atan2(paint.gradientTransform[0][1],paint.gradientTransform[0][0])*(180/Math.PI));
    entry.stops=[];
    for(const s of(paint.gradientStops||[])){const sBid=s.boundVariables&&s.boundVariables.color&&s.boundVariables.color.id,st=sBid?await tokenInfo(sBid):null;entry.stops.push({position:Math.round(s.position*1000)/1000,color:'rgba('+Math.round(s.color.r*255)+', '+Math.round(s.color.g*255)+', '+Math.round(s.color.b*255)+', '+Math.round(s.color.a*1000)/1000+')',tokenName:st?st.name:null})}
  }
  if(paint.type==='IMAGE')entry.image=true;
  if(sub)entry.subComponentName=sub;
  return entry;
}
async function walk(node,path,sub){
  if(sg(node,'visible')===false)return;
  const fills=sg(node,'fills'),fillStyleId=sid(node,'fillStyleId'),visibleFills=[];
  if(Array.isArray(fills))for(const f of fills){if(f.visible===false)continue;const e=await buildPaintEntry(node,path,node.type==='TEXT'?'text fill':'fill',f,fillStyleId,sub);visibleFills.push(e);entries.push(e)}
  // Composite: 2+ visible layers sharing one style. Figma stores index 0 at BOTTOM — reverse.
  if(fillStyleId&&visibleFills.length>=2)entries.push({nodeId:node.id,element:node.name,path,property:'fill-composite',styleName:await styleName(fillStyleId),layerCount:visibleFills.length,layers:visibleFills.slice().reverse(),subComponentName:sub||undefined});
  const strokes=sg(node,'strokes'),strokeStyleId=sid(node,'strokeStyleId');
  if(Array.isArray(strokes))for(const s of strokes){if(s.visible===false)continue;entries.push(await buildPaintEntry(node,path,'stroke',s,strokeStyleId,sub))}
  const effects=sg(node,'effects'),effectStyleId=sid(node,'effectStyleId');
  if(Array.isArray(effects))for(const e of effects){if(e.visible===false||!e.color)continue;const bid=e.boundVariables&&e.boundVariables.color&&e.boundVariables.color.id,t=bid?await tokenInfo(bid):null;const entry={nodeId:node.id,element:node.name,path,property:e.type==='DROP_SHADOW'?'drop shadow':(e.type==='INNER_SHADOW'?'inner shadow':e.type),paintType:null,hex:hx(e.color),styleName:effectStyleId?await styleName(effectStyleId):null,tokenName:t?t.name:null,tokenId:t?t.id:null,opacity:e.color.a!==undefined?Math.round(e.color.a*1000)/1000:null,blendMode:e.blendMode||'NORMAL'};if(sub)entry.subComponentName=sub;entries.push(entry)}
  let currentSub=sub;
  if(node.type==='INSTANCE'){try{const mc=await node.getMainComponentAsync();if(mc&&mc.parent&&mc.parent.type==='COMPONENT_SET')currentSub=mc.parent.name;else if(mc)currentSub=mc.name}catch{}}
  const kids=sg(node,'children');
  if(kids)for(const c of kids)await walk(c,path?path+' > '+node.name:node.name,currentSub);
}
await walk(root,'',null);
return {variantId:VARIANT_ID,label:VARIANT_LABEL,variantProperties:root.variantProperties||{},entryCount:entries.length,entries};
```

`hex` = rendered color (resolved binding). Root entries carry raw variant name as `element` — rename to "Container fill"/"Container stroke" in interpretation. Only chain-visible captured; boolean-gated via delta below.

**Boolean-reveal delta** (run once, only when `booleanDefs` non-empty): temp instance, force all booleans on, walk, diff vs default variant baseline.

`BASELINE_KEYS` from default variant's Step 5: `entries.map(e => e.element + '|' + e.property + '|' + (e.tokenName || e.styleName || e.hex || 'none'))`.

Replace `__DEFAULT_VARIANT_ID__`, `__BOOLEAN_KEYS_JSON__`, `__BASELINE_KEYS_JSON__`:

```javascript
const DEFAULT_VARIANT_ID='__DEFAULT_VARIANT_ID__',BOOLEAN_KEYS=__BOOLEAN_KEYS_JSON__,BASELINE_KEYS=__BASELINE_KEYS_JSON__;
function sg(n,p){try{return n[p]}catch{}}
function sid(n,p){try{const v=n[p];return typeof v==='string'?v:''}catch{return ''}}
function hx(c){return '#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase()}
const defVar=await figma.getNodeByIdAsync(DEFAULT_VARIANT_ID);
if(!defVar)return {error:'Default variant not found: '+DEFAULT_VARIANT_ID};
let _p=defVar;
while(_p&&_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
if(_p&&_p.type==='PAGE')await figma.setCurrentPageAsync(_p);
const styleCache={},varCache={};
async function styleName(id){if(!id)return null;if(styleCache[id]!==undefined)return styleCache[id];let out=null;try{const s=await figma.getStyleByIdAsync(id);if(s)out=s.name}catch{}styleCache[id]=out;return out}
async function tokenName(id){if(!id)return null;if(varCache[id]!==undefined)return varCache[id];let out=null;try{const v=await figma.variables.getVariableByIdAsync(id);if(v)out=(v.codeSyntax&&v.codeSyntax.WEB)||v.name}catch{}varCache[id]=out;return out}
function enableNestedBooleans(node){try{if(node.type==='INSTANCE'){try{const cp=node.componentProperties;if(cp){const bp={};for(const [k,v] of Object.entries(cp))if(v.type==='BOOLEAN')bp[k]=true;if(Object.keys(bp).length>0){try{node.setProperties(bp)}catch{}}}}catch{}}if('children' in node&&node.children)for(const c of node.children){try{enableNestedBooleans(c)}catch{}}}catch{}}
const entries=[];
async function push(node,path,property,paint,sId,sub){
  const bid=paint.boundVariables&&paint.boundVariables.color&&paint.boundVariables.color.id;
  const entry={nodeId:node.id,element:node.name,path,property,paintType:paint.type||null,hex:paint.color?hx(paint.color):null,styleName:sId?await styleName(sId):null,tokenName:bid?await tokenName(bid):null,tokenId:bid||null,opacity:paint.opacity!==undefined?paint.opacity:(paint.color&&paint.color.a!==undefined?Math.round(paint.color.a*1000)/1000:null),blendMode:paint.blendMode||'NORMAL'};
  if(sub)entry.subComponentName=sub;
  entries.push(entry);
}
async function walk(node,path,sub){
  if(sg(node,'visible')===false)return;
  const fills=sg(node,'fills');
  if(Array.isArray(fills))for(const f of fills){if(f.visible===false)continue;await push(node,path,node.type==='TEXT'?'text fill':'fill',f,sid(node,'fillStyleId'),sub)}
  const strokes=sg(node,'strokes');
  if(Array.isArray(strokes))for(const s of strokes){if(s.visible===false)continue;await push(node,path,'stroke',s,sid(node,'strokeStyleId'),sub)}
  const effects=sg(node,'effects');
  if(Array.isArray(effects))for(const e of effects){if(e.visible===false||!e.color)continue;await push(node,path,e.type==='DROP_SHADOW'?'drop shadow':(e.type==='INNER_SHADOW'?'inner shadow':e.type),e,sid(node,'effectStyleId'),sub)}
  let currentSub=sub;
  if(node.type==='INSTANCE'){try{const mc=await node.getMainComponentAsync();if(mc&&mc.parent&&mc.parent.type==='COMPONENT_SET')currentSub=mc.parent.name;else if(mc)currentSub=mc.name}catch{}}
  const kids=sg(node,'children');
  if(kids)for(const c of kids)await walk(c,path?path+' > '+node.name:node.name,currentSub);
}
const inst=defVar.createInstance();
let delta=[],revealedCount=0;
try{
  const enable={};
  for(const k of BOOLEAN_KEYS)enable[k]=true;
  try{inst.setProperties(enable)}catch{}
  enableNestedBooleans(inst);await walk(inst,'',null);revealedCount=entries.length;
  const base=new Set(BASELINE_KEYS),key=e=>e.element+'|'+e.property+'|'+(e.tokenName||e.styleName||e.hex||'none');
  delta=entries.filter(e=>!base.has(key(e)));
}finally{try{inst.remove()}catch{}}
return {revealedCount,deltaCount:delta.length,delta};
```

`delta` = entries visible only with booleans on; merge with note naming the boolean (strip `#...` suffix: `"Visible when showIcon is on"`). Save `BOOLEAN_UNHIDES = booleanDefs.map(b => ({ booleanRawKey: b.key }))` (ALL defs); `[]` when none.

### Step 6: Assemble annotation data

Build `ColorAnnotationData` (A) or `ConsolidatedColorAnnotationData` (B). Row = one visual element (fill+stroke = two rows; repeated siblings collapse). Cell = `styleName || tokenName || hex || "none"`; never invent. **A:** `variants[]` per section = `{ name, variantProperties, tables: [{ name: "Spec", elements }] }`; irrelevant axes at defaults. **B:** per non-state section, merge per-state walks — `tokensByState[rawStateValue]` = cell (`"none"` if absent); `stateColumns` = raw state options in Figma order; `stateAxisName` = state axis name; `variantProperties` = non-state axes only. **Mode-controlled (B):** one per (type × mode), name `"{Type} / {Mode}"` (or mode alone); all modes share bindings — reuse walks, substitute the mode's name from Step 3 `cellMap[tokenId].perMode[modeName]`; unbound cells identical across modes; set top-level `collectionId`, per-section `modeId` (`''` if not). **Boolean delta:** merge Step 5 `delta` into default section (A) or across all states (B); notes name the toggle. **Composite:** `property: 'fill-composite'` → parent's `compositeChildren`; parent cell = composite style name. **Sub-components:** ownership framework (include leaves, exclude full sub-components, note in `generalNotes`); apply hidden-in-composition filter. **`generalNotes`:** color-specific cross-cutting only; omit when empty.

### Step 7: Audit render inputs

Verify (fix by re-reading walks or re-running, never guessing): strategy matches two-gate; sections match walk plan; every cell traces to a Step 5 entry or Step 3 `cellMap` (no invented names; exactly token/style name, bare uppercase `#RRGGBB`, or `none`); styles beat variables; composite children preserve top-to-bottom order for every kept `fill-composite`; B `stateColumns` raw, each `tokensByState` has exactly those keys; mode-controlled sections carry `modeId` + `collectionId`; delta merged when `deltaCount > 0`; `BOOLEAN_UNHIDES` covers ALL defs; names consistent, 3-8 word notes, no all-`none` rows, no layout-only elements; `generalNotes` flags hardcoded colors, excluded sub-components, theme collections, dropped combos.

### Step 8: Resolve template

Three tiers. Never stop — mention tier in completion.

**Tier 1 — configured key.** If `COLOR_TEMPLATE_KEY` non-empty, run instantiation with `__COLOR_TEMPLATE_KEY__` set, `__TEMPLATE_NODE_ID__` empty.

**Tier 2 — local template.** Search for component named "Color Annotation". Replace `__COMPONENT_SET_ID__` — a match that is, contains, or sits inside the target is never a template (instantiating it would document the annotation instead of the component):

```javascript
const TID='__COMPONENT_SET_ID__';
function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
await figma.loadAllPagesAsync();
const tgt=await figma.getNodeByIdAsync(TID);
const matches=figma.root.findAll(n=>(n.type==='COMPONENT'||n.type==='COMPONENT_SET')&&n.name.trim().toLowerCase()==='color annotation'&&!_in(n,TID)&&!(tgt&&_in(tgt,n.id)));
return matches.map(m=>{let p=m;while(p&&p.parent&&p.parent.type!=='DOCUMENT')p=p.parent;return {id:m.id,name:m.name,page:p&&p.type==='PAGE'?p.name:null}});
```

If matched, run instantiation with `__TEMPLATE_NODE_ID__` = first match id, key empty.

**Instantiation** (Tiers 1-2; replace `__COLOR_TEMPLATE_KEY__`, `__TEMPLATE_NODE_ID__`, `__ANCHOR_NODE_ID__`, `__COMPONENT_NAME__`):

```javascript
const TEMPLATE_KEY='__COLOR_TEMPLATE_KEY__',TEMPLATE_NODE_ID='__TEMPLATE_NODE_ID__',ANCHOR_NODE_ID='__ANCHOR_NODE_ID__',COMPONENT_NAME='__COMPONENT_NAME__';
let templateComponent=null;
if(TEMPLATE_KEY){try{templateComponent=await figma.importComponentByKeyAsync(TEMPLATE_KEY)}catch{}}
else if(TEMPLATE_NODE_ID){const n=await figma.getNodeByIdAsync(TEMPLATE_NODE_ID);if(n)templateComponent=n.type==='COMPONENT_SET'?(n.defaultVariant||n.children[0]):n}
if(!templateComponent)return {error:'TEMPLATE_UNAVAILABLE'};
const anchor=await figma.getNodeByIdAsync(ANCHOR_NODE_ID);
let ax=figma.viewport.center.x,ay=figma.viewport.center.y;
if(anchor&&anchor.absoluteBoundingBox){ax=anchor.absoluteBoundingBox.x+anchor.absoluteBoundingBox.width+200;ay=anchor.absoluteBoundingBox.y}
const instance=templateComponent.createInstance();
const frame=instance.detachInstance();
frame.x=Math.round(ax);frame.y=Math.round(ay);frame.name=COMPONENT_NAME+' Color';
figma.currentPage.selection=[frame];figma.viewport.scrollAndZoomIntoView([frame]);
return {frameId:frame.id,pageId:figma.currentPage.id,pageName:figma.currentPage.name};
```

On `TEMPLATE_UNAVAILABLE`, fall through to Tier 3.

**Tier 3 — build scaffold.** Creates every named layer render scripts target. `__FRAME_WIDTH__` = `1160` (A) or `1160 + 150 × max(0, stateColumnCount − 2)` (B). Replace `__FONT_FAMILY__`, `__ANCHOR_NODE_ID__`, `__COMPONENT_NAME__`.

```javascript
const FONT_FAMILY='__FONT_FAMILY__',ANCHOR_NODE_ID='__ANCHOR_NODE_ID__',COMPONENT_NAME='__COMPONENT_NAME__',FRAME_WIDTH=__FRAME_WIDTH__;
async function loadFontWithFallback(family,preferredStyle,fallbackStyle){
  fallbackStyle=fallbackStyle||'Regular';
  const allFonts=await figma.listAvailableFontsAsync(),familyFonts=allFonts.filter(f=>f.fontName.family===family);
  const pick=familyFonts.find(f=>f.fontName.style===preferredStyle)||familyFonts.find(f=>f.fontName.style===fallbackStyle)||familyFonts[0];
  if(pick){await figma.loadFontAsync(pick.fontName);return pick.fontName}
  await figma.loadFontAsync({family:'Inter',style:'Regular'});
  return {family:'Inter',style:'Regular'};
}
const F_REGULAR=await loadFontWithFallback(FONT_FAMILY,'Regular'),F_MEDIUM=await loadFontWithFallback(FONT_FAMILY,'Medium'),F_SEMIBOLD=await loadFontWithFallback(FONT_FAMILY,'Semi Bold','Medium'),F_BOLD=await loadFontWithFallback(FONT_FAMILY,'Bold','Medium');
const INK={r:0.07,g:0.07,b:0.07},MUTED={r:0.4,g:0.4,b:0.4},FAINT={r:0.898,g:0.898,b:0.898},PANEL={r:0.969,g:0.969,b:0.969},HEADER_BG={r:0.98,g:0.98,b:0.98},LINE={r:0.78,g:0.78,b:0.78},WHITE={r:1,g:1,b:1};
const solid=c=>[{type:'SOLID',color:c}];
function frameNode(name,mode){const f=figma.createFrame();f.name=name;f.fills=[];if(mode&&mode!=='NONE'){f.layoutMode=mode;f.itemSpacing=0;f.primaryAxisSizingMode='AUTO';f.counterAxisSizingMode='AUTO'}return f}
function text(font,chars,size,color){const t=figma.createText();t.fontName=font;t.characters=chars;t.fontSize=size;t.fills=solid(color);return t}
function bottomBorder(f){f.strokes=solid(FAINT);f.strokeWeight=1;f.strokeAlign='INSIDE';f.strokeTopWeight=0;f.strokeLeftWeight=0;f.strokeRightWeight=0;f.strokeBottomWeight=1}
function fillText(t){t.textAutoResize='HEIGHT';t.layoutSizingHorizontal='FILL'}
function pad(f,v){f.paddingTop=v;f.paddingBottom=v;f.paddingLeft=v;f.paddingRight=v}
const rootFrame=frameNode('Color Annotation','VERTICAL');
rootFrame.fills=solid(WHITE);rootFrame.strokes=solid(FAINT);rootFrame.strokeWeight=1;rootFrame.cornerRadius=12;pad(rootFrame,48);rootFrame.itemSpacing=24;
figma.currentPage.appendChild(rootFrame);
rootFrame.resize(FRAME_WIDTH,100);
rootFrame.primaryAxisSizingMode='AUTO';rootFrame.counterAxisSizingMode='FIXED';
const compName=frameNode('#compName','HORIZONTAL');rootFrame.appendChild(compName);compName.appendChild(text(F_BOLD,'Component name',28,INK));
const genNotes=frameNode('#general-color-assignment-description','VERTICAL');rootFrame.appendChild(genNotes);
genNotes.layoutSizingHorizontal='FILL';genNotes.fills=solid(PANEL);genNotes.cornerRadius=8;pad(genNotes,16);
const gnText=text(F_REGULAR,'General color notes',13,MUTED);genNotes.appendChild(gnText);fillText(gnText);
const variantTpl=frameNode('#variant-template','VERTICAL');rootFrame.appendChild(variantTpl);
variantTpl.layoutSizingHorizontal='FILL';variantTpl.itemSpacing=16;
const variantTitle=frameNode('#variant-title','HORIZONTAL');variantTpl.appendChild(variantTitle);variantTitle.appendChild(text(F_SEMIBOLD,'Variant',20,INK));
const preview=frameNode('#preview','VERTICAL');variantTpl.appendChild(preview);
preview.layoutSizingHorizontal='FILL';preview.fills=solid(PANEL);preview.cornerRadius=8;pad(preview,24);preview.counterAxisAlignItems='CENTER';
const previewHolder=frameNode('Light theme preview placeholder','HORIZONTAL');preview.appendChild(previewHolder);
previewHolder.itemSpacing=24;previewHolder.counterAxisAlignItems='CENTER';
const ph=text(F_REGULAR,'Preview',13,MUTED);ph.name='Placeholder';previewHolder.appendChild(ph);
const previewInstruction=frameNode('#preview-instruction-light','VERTICAL');variantTpl.appendChild(previewInstruction);previewInstruction.itemSpacing=4;
previewInstruction.appendChild(text(F_REGULAR,'No live preview available for',13,MUTED));previewInstruction.appendChild(text(F_MEDIUM,'Component name',13,INK));previewInstruction.visible=false;
const tableTpl=frameNode('#color-table-template','VERTICAL');variantTpl.appendChild(tableTpl);
tableTpl.layoutSizingHorizontal='FILL';tableTpl.itemSpacing=8;
const tableTitle=frameNode('#table-title','HORIZONTAL');tableTpl.appendChild(tableTitle);tableTitle.appendChild(text(F_MEDIUM,'Spec',14,INK));
const colorTable=frameNode('#color-table','VERTICAL');tableTpl.appendChild(colorTable);
colorTable.layoutSizingHorizontal='FILL';colorTable.strokes=solid(FAINT);colorTable.strokeWeight=1;colorTable.cornerRadius=8;colorTable.clipsContent=true;
function cellFrame(name,chars,font,size,color){const c=frameNode(name,'HORIZONTAL');c.paddingTop=12;c.paddingBottom=12;c.paddingLeft=16;c.paddingRight=16;const t=text(font,chars,size,color);c.appendChild(t);return {cell:c,txt:t}}
const headerRow=frameNode('#header-row','HORIZONTAL');colorTable.appendChild(headerRow);
headerRow.layoutSizingHorizontal='FILL';headerRow.fills=solid(HEADER_BG);bottomBorder(headerRow);
const hElement=cellFrame('#element-title','Element',F_MEDIUM,12,MUTED);headerRow.appendChild(hElement.cell);
hElement.cell.resize(240,hElement.cell.height);hElement.cell.counterAxisSizingMode='AUTO';
const hState=cellFrame('#state-title','State',F_MEDIUM,12,MUTED);headerRow.appendChild(hState.cell);hState.cell.layoutSizingHorizontal='FILL';fillText(hState.txt);
const hNotes=cellFrame('#notes-title','Notes',F_MEDIUM,12,MUTED);headerRow.appendChild(hNotes.cell);hNotes.cell.layoutSizingHorizontal='FILL';fillText(hNotes.txt);
const rowTpl=frameNode('#element-row-template','HORIZONTAL');colorTable.appendChild(rowTpl);
rowTpl.layoutSizingHorizontal='FILL';rowTpl.fills=solid(WHITE);bottomBorder(rowTpl);
const indicator=frameNode('#hierarchy-indicator','NONE');rowTpl.appendChild(indicator);indicator.resize(24,40);indicator.fills=[];
const lineV=figma.createRectangle();lineV.name='within-group';lineV.resize(1,40);lineV.x=11;lineV.y=0;lineV.fills=solid(LINE);lineV.constraints={horizontal:'MIN',vertical:'STRETCH'};indicator.appendChild(lineV);lineV.visible=false;
const elbow=frameNode('#hierarchy-indicator-last','NONE');indicator.appendChild(elbow);elbow.resize(24,40);elbow.x=0;elbow.y=0;elbow.fills=[];
const elbowV=figma.createRectangle();elbowV.resize(1,20);elbowV.x=11;elbowV.y=0;elbowV.fills=solid(LINE);elbow.appendChild(elbowV);
const elbowH=figma.createRectangle();elbowH.resize(9,1);elbowH.x=11;elbowH.y=19;elbowH.fills=solid(LINE);elbow.appendChild(elbowH);elbow.visible=false;indicator.visible=false;
const cElement=cellFrame('#element-name','Element',F_REGULAR,13,INK);rowTpl.appendChild(cElement.cell);cElement.cell.resize(240,cElement.cell.height);cElement.cell.counterAxisSizingMode='AUTO';fillText(cElement.txt);
const cState=cellFrame('#state-name','token',F_REGULAR,13,INK);rowTpl.appendChild(cState.cell);cState.cell.layoutSizingHorizontal='FILL';fillText(cState.txt);
const cNotes=cellFrame('#element-notes','Notes',F_REGULAR,13,MUTED);rowTpl.appendChild(cNotes.cell);cNotes.cell.layoutSizingHorizontal='FILL';fillText(cNotes.txt);
tableTpl.visible=false;variantTpl.visible=false;
const anchor=await figma.getNodeByIdAsync(ANCHOR_NODE_ID);
let ax=figma.viewport.center.x,ay=figma.viewport.center.y;
if(anchor&&anchor.absoluteBoundingBox){ax=anchor.absoluteBoundingBox.x+anchor.absoluteBoundingBox.width+200;ay=anchor.absoluteBoundingBox.y}
rootFrame.x=Math.round(ax);rootFrame.y=Math.round(ay);rootFrame.name=COMPONENT_NAME+' Color';
figma.currentPage.selection=[rootFrame];figma.viewport.scrollAndZoomIntoView([rootFrame]);
return {frameId:rootFrame.id,pageId:figma.currentPage.id,pageName:figma.currentPage.name};
```

Save `frameId`. Named layers render scripts target (must exist in template AND scaffold): `#compName`, `#general-color-assignment-description`, `#variant-template`, `#variant-title`, `#preview`, `Light theme preview placeholder`, `Placeholder`, `#preview-instruction-light`, `#color-table-template`, `#table-title`, `#color-table`, `#header-row`, `#state-title`, `#notes-title`, `#element-row-template`, `#hierarchy-indicator`, `within-group`, `#hierarchy-indicator-last`, `#element-name`, `#state-name`, `#element-notes`.

### Step 9: Fill header fields

Replace `__FRAME_ID__`, `__COMPONENT_NAME__`, `__GENERAL_NOTES__` (escaped), `__HAS_GENERAL_NOTES__` (`true`/`false`):

```javascript
const frame=await figma.getNodeByIdAsync('__FRAME_ID__');
const textNodes=frame.findAll(n=>n.type==='TEXT');
const fontSet=new Set(),fontsToLoad=[];
for(const tn of textNodes){try{const fn=tn.fontName;if(fn&&fn!==figma.mixed&&fn.family){const key=fn.family+'|'+fn.style;if(!fontSet.has(key)){fontSet.add(key);fontsToLoad.push(fn)}}}catch{}}
await Promise.all(fontsToLoad.map(f=>figma.loadFontAsync(f).catch(()=>{})));
function setLbl(root,name,chars){const f=root&&root.findOne(n=>n.name===name);if(f){const t=f.findOne(n=>n.type==='TEXT');if(t)t.characters=chars}}
setLbl(frame,'#compName','__COMPONENT_NAME__');
const notesFrame=frame.findOne(n=>n.name==='#general-color-assignment-description');
if(notesFrame){if(!__HAS_GENERAL_NOTES__)notesFrame.visible=false;else{const t=notesFrame.findOne(n=>n.type==='TEXT');if(t)t.characters='__GENERAL_NOTES__'}}
return {success:true};
```

### Step 10: Render sections

One script per variant (A) / section (B). Inputs from Steps 1-6.

#### Strategy A: Simple Layout

Prepend the guard preamble. Replace `__FRAME_ID__`, `__VARIANT_NAME__`, `__COMPONENT_NAME__`, `__COMPONENT_SET_NODE_ID__` (`''` if unavailable), `__VARIANT_PROPERTIES_JSON__`, `__TABLES_JSON__` (elements: `element`, `token`, `notes`, optional `compositeChildren` `{element, value, notes}`), `__FONT_FAMILY__`, `__BOOLEAN_UNHIDES_JSON__` (`[]` if none).

```javascript
const FRAME_ID='__FRAME_ID__',VARIANT_NAME='__VARIANT_NAME__',COMPONENT_NAME='__COMPONENT_NAME__',COMPONENT_SET_ID='__COMPONENT_SET_NODE_ID__',VARIANT_PROPS=__VARIANT_PROPERTIES_JSON__,TABLES=__TABLES_JSON__,FONT_FAMILY='__FONT_FAMILY__',BOOLEAN_UNHIDES=__BOOLEAN_UNHIDES_JSON__;
try{
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const variantTemplate=frame.findOne(n=>n.name==='#variant-template');
const variant=variantTemplate.clone();
SAFE(variantTemplate.parent).appendChild(variant);variant.name=VARIANT_NAME;variant.visible=true;
await loadAllFonts(variant);
setLbl(variant,'#variant-title',VARIANT_NAME);
const previewContainer=variant.findOne(n=>n.name==='#preview');
if(previewContainer&&COMPONENT_SET_ID){
  const componentSet=await figma.getNodeByIdAsync(COMPONENT_SET_ID);
  if(componentSet){
    const isCompSet=componentSet.type==='COMPONENT_SET';
    let targetVariant=null;
    if(isCompSet&&VARIANT_PROPS&&Object.keys(VARIANT_PROPS).length>0){
      let bestFallback=null,bestScore=-1;
      for(const child of componentSet.children){
        const vp=child.variantProperties||{};let score=0,exactMatch=true;
        for(const [k,v] of Object.entries(VARIANT_PROPS)){if(vp[k]===v)score++;else exactMatch=false}
        if(exactMatch){targetVariant=child;break}
        if(score>bestScore){bestScore=score;bestFallback=child}
      }
      if(!targetVariant)targetVariant=bestFallback;
    }
    if(!targetVariant)targetVariant=isCompSet?(componentSet.defaultVariant||componentSet.children[0]):componentSet;
    const LABEL_FONT=await loadFontWithFallback(FONT_FAMILY,'Medium');
    const container=previewContainer.findOne(n=>n.name==='Light theme preview placeholder');
    if(container){
      const placeholder=container.findOne(n=>n.name==='Placeholder');if(placeholder)placeholder.remove();
      const wrapper=figma.createFrame();
      wrapper.name=VARIANT_NAME;wrapper.layoutMode='VERTICAL';wrapper.primaryAxisAlignItems='CENTER';wrapper.counterAxisAlignItems='CENTER';wrapper.itemSpacing=8;wrapper.fills=[];wrapper.primaryAxisSizingMode='AUTO';wrapper.counterAxisSizingMode='AUTO';
      SAFE(container).appendChild(wrapper);
      const instance=NI(targetVariant,wrapper);await loadAllFonts(instance);
      if(BOOLEAN_UNHIDES.length>0){const bp={};for(const bu of BOOLEAN_UNHIDES)bp[bu.booleanRawKey]=true;instance.setProperties(bp);await loadAllFonts(instance)}
      enableNestedBooleans(instance);await loadAllFonts(instance);
      const label=figma.createText();
      label.fontName=LABEL_FONT;label.characters=VARIANT_NAME;label.fontSize=14;label.fills=[{type:'SOLID',color:{r:0.29,g:0.29,b:0.29}}];
      wrapper.appendChild(label);
    }
  }
}else{
  const previewText=VARIANT_NAME===COMPONENT_NAME?COMPONENT_NAME:COMPONENT_NAME+' '+VARIANT_NAME;
  const lightFrame=variant.findOne(n=>n.name==='#preview-instruction-light');
  if(lightFrame){const tns=lightFrame.children.filter(c=>c.type==='TEXT');if(tns[1])tns[1].characters=previewText}
}
const tableTemplate=variant.findOne(n=>n.name==='#color-table-template');
for(const tableData of TABLES){
  const tableClone=tableTemplate.clone();
  tableTemplate.parent.appendChild(tableClone);tableClone.name=tableData.name;tableClone.visible=true;
  setLbl(tableClone,'#table-title',tableData.name);
  const colorTable=tableClone.findOne(n=>n.name==='#color-table');
  const headerRow=colorTable.findOne(n=>n.name==='#header-row');
  if(headerRow)setLbl(headerRow,'#state-title','Token');
  const rowTemplate=colorTable.findOne(n=>n.name==='#element-row-template');
  function showIndicator(row,isLast){const ind=row.findOne(n=>n.name==='#hierarchy-indicator');if(ind){ind.visible=true;const wg=ind.findOne(n=>n.name==='within-group');const last=ind.findOne(n=>n.name==='#hierarchy-indicator-last');if(wg)wg.visible=!isLast;if(last)last.visible=isLast}}
  for(const element of tableData.elements){
    const row=rowTemplate.clone();colorTable.appendChild(row);row.name='Row '+element.element;
    setLbl(row,'#element-name',element.element);setLbl(row,'#state-name',element.token);setLbl(row,'#element-notes',element.notes);
    if(element.compositeChildren&&element.compositeChildren.length>0)for(let ci=0;ci<element.compositeChildren.length;ci++){
      const child=element.compositeChildren[ci];
      const childRow=rowTemplate.clone();colorTable.appendChild(childRow);childRow.name='Row '+child.element;
      showIndicator(childRow,ci===element.compositeChildren.length-1);
      setLbl(childRow,'#element-name',child.element);setLbl(childRow,'#state-name',child.value);setLbl(childRow,'#element-notes',child.notes);
    }
  }
  rowTemplate.remove();
}
tableTemplate.remove();
return {success:true,variant:VARIANT_NAME};
}finally{SWEEP()}
```

#### Strategy B: Consolidated Multi-Column Layout

Prepend the guard preamble. All A placeholders plus `__STATE_COLUMNS_JSON__` (raw Figma state values — headers AND drive `setProperties`), `__STATE_AXIS_NAME__`, `__COLLECTION_ID__` (`''` if not mode-controlled), `__MODE_ID__` (section's mode id, `''` if not). `VARIANT_PROPS` = non-state axes only.

```javascript
const FRAME_ID='__FRAME_ID__',VARIANT_NAME='__VARIANT_NAME__',COMPONENT_NAME='__COMPONENT_NAME__',COMPONENT_SET_ID='__COMPONENT_SET_NODE_ID__',VARIANT_PROPS=__VARIANT_PROPERTIES_JSON__,STATE_COLUMNS=__STATE_COLUMNS_JSON__,STATE_AXIS_NAME='__STATE_AXIS_NAME__',TABLES=__TABLES_JSON__,COLLECTION_ID='__COLLECTION_ID__',MODE_ID='__MODE_ID__',FONT_FAMILY='__FONT_FAMILY__',BOOLEAN_UNHIDES=__BOOLEAN_UNHIDES_JSON__;
try{
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const variantTemplate=frame.findOne(n=>n.name==='#variant-template');
const variant=variantTemplate.clone();
SAFE(variantTemplate.parent).appendChild(variant);variant.name=VARIANT_NAME;variant.visible=true;
await loadAllFonts(variant);
setLbl(variant,'#variant-title',VARIANT_NAME);
let collection=null;
if(COLLECTION_ID){
  try{collection=await figma.variables.getVariableCollectionByIdAsync(COLLECTION_ID)}catch{}
  if(!collection){const collections=await figma.variables.getLocalVariableCollectionsAsync();collection=collections.find(c=>c.id===COLLECTION_ID)||null}
}
function clearModesRecursive(node,col){try{node.clearExplicitVariableModeForCollection(col)}catch{}if('children' in node)for(const child of node.children)clearModesRecursive(child,col)}
const previewContainer=variant.findOne(n=>n.name==='#preview');
if(previewContainer&&COMPONENT_SET_ID){
  const componentSet=await figma.getNodeByIdAsync(COMPONENT_SET_ID);
  if(componentSet){
    const isCompSet=componentSet.type==='COMPONENT_SET';
    const LABEL_FONT=await loadFontWithFallback(FONT_FAMILY,'Medium');
    const container=previewContainer.findOne(n=>n.name==='Light theme preview placeholder');
    if(container){
      const placeholder=container.findOne(n=>n.name==='Placeholder');if(placeholder)placeholder.remove();
      container.itemSpacing=24;
      for(let s=0;s<STATE_COLUMNS.length;s++){
        const stateProps={...VARIANT_PROPS};stateProps[STATE_AXIS_NAME]=STATE_COLUMNS[s];
        let targetVariant=null,bestFallback=null,bestScore=-1;
        for(const child of componentSet.children){
          const vp=child.variantProperties||{};let score=0,exactMatch=true;
          for(const [k,v] of Object.entries(stateProps)){if(vp[k]===v)score++;else exactMatch=false}
          if(exactMatch){targetVariant=child;break}
          if(score>bestScore){bestScore=score;bestFallback=child}
        }
        if(!targetVariant)targetVariant=bestFallback;
        if(!targetVariant)targetVariant=isCompSet?(componentSet.defaultVariant||componentSet.children[0]):componentSet;
        const wrapper=figma.createFrame();
        wrapper.name=STATE_COLUMNS[s];wrapper.layoutMode='VERTICAL';wrapper.primaryAxisAlignItems='CENTER';wrapper.counterAxisAlignItems='CENTER';wrapper.itemSpacing=8;wrapper.fills=[];wrapper.primaryAxisSizingMode='AUTO';wrapper.counterAxisSizingMode='AUTO';
        SAFE(container).appendChild(wrapper);
        if(collection&&MODE_ID)wrapper.setExplicitVariableModeForCollection(collection,MODE_ID);
        const inst=NI(targetVariant,wrapper);await loadAllFonts(inst);
        if(BOOLEAN_UNHIDES.length>0){const bp={};for(const bu of BOOLEAN_UNHIDES)bp[bu.booleanRawKey]=true;inst.setProperties(bp);await loadAllFonts(inst)}
        if(collection)clearModesRecursive(inst,collection);
        enableNestedBooleans(inst);await loadAllFonts(inst);
        const label=figma.createText();
        label.fontName=LABEL_FONT;label.characters=STATE_COLUMNS[s];label.fontSize=14;label.fills=[{type:'SOLID',color:{r:0.29,g:0.29,b:0.29}}];
        wrapper.appendChild(label);
      }
    }
  }
}else{
  const previewText=VARIANT_NAME===COMPONENT_NAME?COMPONENT_NAME:COMPONENT_NAME+' '+VARIANT_NAME;
  const lightFrame=variant.findOne(n=>n.name==='#preview-instruction-light');
  if(lightFrame){const tns=lightFrame.children.filter(c=>c.type==='TEXT');if(tns[1])tns[1].characters=previewText}
}
const N=STATE_COLUMNS.length;
const tableTemplate=variant.findOne(n=>n.name==='#color-table-template');
for(const tableData of TABLES){
  const tableClone=tableTemplate.clone();
  tableTemplate.parent.appendChild(tableClone);tableClone.name=tableData.name;tableClone.visible=true;
  setLbl(tableClone,'#table-title',tableData.name);
  const colorTable=tableClone.findOne(n=>n.name==='#color-table');
  const headerRow=colorTable.findOne(n=>n.name==='#header-row');
  if(headerRow){
    const stateTitle=headerRow.findOne(n=>n.name==='#state-title'),notesTitle=headerRow.findOne(n=>n.name==='#notes-title'),notesIndex=notesTitle?headerRow.children.indexOf(notesTitle):-1;
    if(stateTitle){
      const headerClones=[];
      for(let s=0;s<N;s++){const col=stateTitle.clone();headerClones.push(col);if(notesIndex>=0)headerRow.insertChild(notesIndex+s,col);else headerRow.appendChild(col)}
      stateTitle.remove();
      for(let s=0;s<headerClones.length;s++){headerClones[s].name='state-col-'+s;headerClones[s].layoutSizingHorizontal='FILL';const txt=headerClones[s].findOne(n=>n.type==='TEXT');if(txt)txt.characters=STATE_COLUMNS[s]}
    }
    if(notesTitle)notesTitle.layoutSizingHorizontal='FILL';
  }
  const rowTemplate=colorTable.findOne(n=>n.name==='#element-row-template');
  function showIndicator(row,isLast){const ind=row.findOne(n=>n.name==='#hierarchy-indicator');if(ind){ind.visible=true;const wg=ind.findOne(n=>n.name==='within-group');const last=ind.findOne(n=>n.name==='#hierarchy-indicator-last');if(wg)wg.visible=!isLast;if(last)last.visible=isLast}}
  function expandStateCols(row,values){
    const stateCell=row.findOne(n=>n.name==='#state-name'),notesFrame=row.findOne(n=>n.name==='#element-notes'),notesCellIndex=notesFrame?row.children.indexOf(notesFrame):-1;
    if(stateCell){
      const cellClones=[];
      for(let s=0;s<N;s++){const col=stateCell.clone();cellClones.push(col);if(notesCellIndex>=0)row.insertChild(notesCellIndex+s,col);else row.appendChild(col)}
      stateCell.remove();
      for(let s=0;s<cellClones.length;s++){cellClones[s].name='state-val-'+s;cellClones[s].layoutSizingHorizontal='FILL';const txt=cellClones[s].findOne(n=>n.type==='TEXT');if(txt)txt.characters=values[s]||'none'}
    }
    if(notesFrame)notesFrame.layoutSizingHorizontal='FILL';
  }
  for(const element of tableData.elements){
    const row=rowTemplate.clone();colorTable.appendChild(row);row.name='Row '+element.element;
    setLbl(row,'#element-name',element.element);
    expandStateCols(row,STATE_COLUMNS.map(s=>element.tokensByState[s]||'none'));
    setLbl(row,'#element-notes',element.notes);
    if(element.compositeChildren&&element.compositeChildren.length>0)for(let ci=0;ci<element.compositeChildren.length;ci++){
      const child=element.compositeChildren[ci];
      const childRow=rowTemplate.clone();colorTable.appendChild(childRow);childRow.name='Row '+child.element;
      showIndicator(childRow,ci===element.compositeChildren.length-1);
      setLbl(childRow,'#element-name',child.element);
      expandStateCols(childRow,STATE_COLUMNS.map(()=>child.value));
      setLbl(childRow,'#element-notes',child.notes);
    }
  }
  rowTemplate.remove();
}
tableTemplate.remove();
return {success:true,variant:VARIANT_NAME};
}finally{SWEEP()}
```

### Step 11: Validate

Screenshot frame. Verify: section headings (mode-controlled: one per Type × Mode); cells match data; B previews show state instances side-by-side with matching labels; A previews one labeled instance per section; mode previews show correct colors; composite hierarchy indicators (line+elbow middle, last=elbow); general notes visible/hidden; header = component name.

Fix: correct render input, remove bad section clone, re-run script. Wrong values → re-run Step 5 walk. Re-screenshot (up to 3 iterations).

### Step 12: Completion

Replace `__FRAME_ID__`, `__COMPONENT_SET_ID__`, `__GUARD_JSON__` (Step 1's `guard`, verbatim). The second half re-reads the source and proves it is untouched:

```javascript
const frame=await figma.getNodeByIdAsync('__FRAME_ID__');
if(frame){figma.currentPage.selection=[frame];figma.viewport.scrollAndZoomIntoView([frame])}
const t=await figma.getNodeByIdAsync('__COMPONENT_SET_ID__'),B=__GUARD_JSON__,ch=[];
if(!t)ch.push('source missing');
else{const gb=t.absoluteBoundingBox||{};let gd='';try{gd=Object.keys(t.componentPropertyDefinitions||{}).sort().join(',')}catch{}
const a={name:t.name,parentId:t.parent?t.parent.id:'',kids:('children' in t)?t.children.length:0,box:[Math.round(gb.x||0),Math.round(gb.y||0),Math.round(gb.width||0),Math.round(gb.height||0)],defs:gd};
for(const k in B)if(String(a[k])!==String(B[k]))ch.push(k)}
return {done:true,frameId:frame?frame.id:null,intact:ch.length===0,changed:ch};
```

`intact:false` is a failure, not a footnote: name what changed, tell the PM to undo (Cmd+Z) before trusting the annotation, and don't report success. `intact:true` needs no mention.

Summarize:

```
Color annotation complete: {ComponentName} — Strategy {A|B}, {N} sections, {M} unique tokens, modes: {list or "none"}.
Template: {imported by key | found in this file | built from scratch}.
{One line per judgment call: excluded sub-components, theme noted, dropped combos, un-tokenized colors, library gaps.}
```

`M` = distinct token/style names across cells (bare hexes excluded).

---

## Reference

**Element eligibility:** only color-bearing (fills incl. text, strokes, effect shadows); skip layout, spacers, invisible wrappers. Root paints → "Container fill"/"Container stroke" (never raw variant name). Names consistent across sections, unique per table, repeated siblings collapse. Common: Background/Container/Surface fill; Primary/Secondary label, Title, Description; stroke, Icon, Artwork, Indicator, Checkmark; State layer (+backplate), Focus ring, Overlay; Shadow, Elevation, Drop shadow.

**Token resolution:** style > variable > raw hex (flag in `generalNotes`). Styles beat variable bindings. Effect styles same rule.

**Cell format (strict):** exactly a token/style name, bare uppercase `#RRGGBB` only when unbound, or `none`. Bound names never include resolved hex. Path names (`background/primary`) OK; never editorialize. Opacity/blend → Notes. Mode-controlled: name from Step 3 `cellMap` for that mode.

**Composite** (`fill-composite`) = fill style with 2+ visible layers. Style name → parent cell; layers → `compositeChildren` top-to-bottom (already reversed). Row shapes — Solid: `"Solid fill"`, value = cell, notes `"{blend} blend, {opacity}% opacity"` + `"Top layer."`/`"Bottom layer."`. Linear: `"Linear gradient"`, `linear-gradient({angle}deg, ...)`. Stop: `"Stop at {position}%"`, `rgba(...)` or token, `"Transparent"`/`"Opaque"`. Radial/Angular/Diamond: `"{Type} gradient"`, same. Image: `"Image fill"`, `image`. Gradient layers followed by one child row per stop. Single-layer style = named token alone. B: single `value` across all state columns. Render scripts drive indicator visibility (middle=line, last=elbow). 2+ visible fills without shared style ≠ composite — each as own row with layer qualifier.

**Special cases.** `none` = no fill/stroke, absent, or intentionally empty. Not-in-all-states: A includes only where present; B needs every column (`"none"` if absent). Grouped/nested: descriptive names. Sub-components (`subComponentName`) — ownership: full component with own variants/states → **exclude**, note in `generalNotes`; leaf (Icon, Divider, Shape) → **include**, parent owns; slot-hosted → lean **exclude**, note slot + default; parent override → **include** override. Included: group rows, order visually. Excluded: one `generalNotes` line, no placeholder rows. Hidden-in-composition: element never visible under any walked variant/state (all columns `none`) → drop row, move to `generalNotes` (`"{subComponentName} contains {elementName} tokens that are never visible in this component's compositions (condition: {boolean/variant}); see the {subComponentName} annotation for details."`); visible in SOME states → stays with `none` cells. Slot components: extraction covers default; boolean-gated via delta; note slot.

**Variant structure.** Irrelevant axes (Step 2 fingerprints) pin at default. Section shape: static → one section (name or "Default"); interactive one visual variant → per state; multiple variants → per variant × state; mode-controlled → per mode or Type × Mode; mode + interactive → two-gate. Section names: `"Enabled"`, `"Default / Enabled"`, `"isNegative / Hovered"`, `"Success"`, `"Primary / Gray"`, `"{Type} / {Mode}"`. Common states: Button (Enabled/Hovered/Pressed/Disabled/Loading), Checkbox/Switch (E/H/P/D), Tab (E/H/P), Input (E/H/Focused/D/Error). Collection "[Component] color" → per Type × Mode, render ALL modes. Tag/Badge/Alert → trust Step 3. 4+ axes, 50+ variants → classify first.

**Notes:** 3-8 words on function, not element name. Thumb "Draggable indicator showing current value"; Track "Background bar showing total range"; State layer "Hovered/pressed feedback overlay"; stroke "Border around the control"; Icon "Visual indicator for the action"; Checkmark "Selected state indicator". Add impl detail only when relevant: optional, conditional visibility, boolean gating ("Visible when showIcon is on."), opacity/blend.

**`generalNotes`** = color/token cross-cutting only: mode behavior, theme collections, conditional styling, cross-variant, hardcoded colors, excluded sub-components and slots. Never size/layout/prop/non-color. Omit when empty.

**Do NOT:** invent token names; blindly include/exclude sub-component tokens; empty or dash-only notes; include elements without color; document non-existent states; use placeholder text; modify user's component; rename elements between states; miss states (document ALL state-axis options); miss boolean-gated (merge delta when `deltaCount > 0`); miss component color modes (Tag/Badge/Alert "single-colored" is the classic miss); render only one mode; use variable when style exists; miss composite breakdown; leave all-`none` rows; relabel state columns (raw Figma keys only); nest states as tables under one A section; curly quotes in JSON; pass hardcoded hexes without flagging in `generalNotes`.

---

*Adapted from uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license.*

---

*Адаптировано из uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license — скилл Figma Community `create-color`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/annotate).*

