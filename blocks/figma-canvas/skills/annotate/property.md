> Часть скилла annotate (см. SKILL.md — общий read-only invariant, guard-функции
> SAFE/ADOPT/NI/SWEEP и выбор режима описаны там один раз, здесь не дублируются
> заново). Текст ниже — оригинальный источник (Create Property Annotation), не переведён:
> сохраняем формулировки/код/числа дословно ради точности guard-правил.

# Create Property Annotation

Render annotation frame from selected component/set/instance: one exhibit per variant axis, boolean, variable-mode, sub-component, plus summary. Run don't edit. Never pause; pick most defensible. Only legal stop: Step 1 fail-fast.

## Read-only invariant

The documented component is **read-only** — the selected component, its set, variants, sub-components, their main components, and every library asset. Structure, properties, position, name, visibility, text, paints, variable modes: all untouchable. A correct annotation plus a modified source component is a failed run. Exhibits vary properties on *instances*, never on the component.

**Writable scope, exhaustive:** the Step 8 annotation frame and its descendants, plus instances these scripts create. Never the target, never the page.

Never `appendChild`/`insertChild`/`remove`/`clone`/`setProperties`/`setVariantProperties`/`detachInstance`/`swapComponent`/`set`+`clearExplicitVariableModeForCollection`/`setBoundVariable`/`resize()`, or write `name`/`x`/`y`/`visible`/`characters`/`fills`/`strokes`/`layoutMode`, on the target, its ancestors, or its descendants. If a step seems to need one, the step is wrong — skip it, note it in Step 12.

## Configuration

```
PROPERTY_TEMPLATE_KEY = ""      # Empty → auto-resolve.
FONT_FAMILY           = "Inter"
```

Template (Step 8) three-tier: (1) configured key; (2) local component "Property" (uSpec https://www.figma.com/community/file/1603925462078533207/uspec-template — duplicate, publish, paste key); (3) built scaffold reproducing every `#`-prefixed layer.

## Input Contract

Selection: component/set/instance. Instance → walk to main; in a set → use the set. Standalone valid. Optional prompt: named component, coupling/usage/importance notes.

If nothing resolves, stop with exactly:
> Select the component, component set, or instance you want to annotate (or name the component in your request), then run this skill again.

## Script Conventions

Every fenced JS block = Figma Plugin API script. Substitute `__UPPER_SNAKE__` (`_JSON`=inline JSON, else literals). Scripts referencing saved node ids start with page-loading preamble. Fonts via `tn.fontName`, `.catch(()=>{})`. Chapter scripts wrap in `try/catch` + remove clone on failure. Never mutate `layoutMode`/`fills`/`clipsContent` on `#`-prefixed frames (except `layoutWrap`/`counterAxisSpacing` on `#preview`).

## Workflow

```
1: Resolve target · 2: Extract surface (2a defs+grid, 2b preferred, 2c sub-components) + model · 3: Variant-gated boolean scan · 4: Variable-mode lookup · 5: Normalize (coupled axes, unified slots, siblings) · 6: Validate + plan · 7: Pre-render audit · 8: Template + place frame · 9: Fill header · 10: Render + summary + cleanup · 11: Visual validation · 12: Zoom + summarize
```

### Step 1: Resolve target (fail fast)

```javascript
const NAMED_TARGET='__NAMED_TARGET_OR_EMPTY__';
function isT(n){return n.type==='COMPONENT_SET'||n.type==='COMPONENT'||n.type==='INSTANCE'}
let node=figma.currentPage.selection.find(isT)||null;
if(!node&&NAMED_TARGET){
  const nl=NAMED_TARGET.trim().toLowerCase();
  const m=n=>(n.type==='COMPONENT_SET'||n.type==='COMPONENT')&&n.name.trim().toLowerCase()===nl;
  node=figma.currentPage.findOne(m);
  if(!node){await figma.loadAllPagesAsync();node=figma.root.findOne(m)}
}
if(!node)return {ok:false,reason:'no-target',selectionTypes:figma.currentPage.selection.map(n=>n.type)};
let comp=node;
if(comp.type==='INSTANCE'){const main=await comp.getMainComponentAsync();if(!main)return {ok:false,reason:'unresolvable-instance'};comp=main}
let compSet=comp;
if(comp.type==='COMPONENT'&&comp.parent&&comp.parent.type==='COMPONENT_SET')compSet=comp.parent;
const isComponentSet=compSet.type==='COMPONENT_SET';
let pg=compSet;while(pg.parent&&pg.parent.type!=='DOCUMENT')pg=pg.parent;
const onPage=pg.type==='PAGE';
if(onPage)await figma.setCurrentPageAsync(pg);
const gb=compSet.absoluteBoundingBox||{};let gd='';try{gd=Object.keys(compSet.componentPropertyDefinitions||{}).sort().join(',')}catch(e){}
const guard={name:compSet.name,parentId:compSet.parent?compSet.parent.id:'',kids:('children' in compSet)?compSet.children.length:0,box:[Math.round(gb.x||0),Math.round(gb.y||0),Math.round(gb.width||0),Math.round(gb.height||0)],defs:gd};
return {ok:true,compSetNodeId:compSet.id,componentName:compSet.name,isComponentSet,remote:!!compSet.remote,pageName:onPage?pg.name:null,selectedNodeType:node.type,guard};
```

`ok:false` → stop message verbatim. Save `compSetNodeId`/`componentName`/`isComponentSet`/`remote`/`pageName`, and `guard` verbatim for Step 12's integrity check. Multi-select → first. `remote:true` fine (viewport center placement).

### Step 2: Extract property surface

#### Step 2a: Property defs, variant grid, associated layers

```javascript
const TARGET_ID='__COMP_SET_NODE_ID__';
const target=await figma.getNodeByIdAsync(TARGET_ID);
if(!target)return {error:'Target not found: '+TARGET_ID};
let pg=target;while(pg.parent&&pg.parent.type!=='DOCUMENT')pg=pg.parent;
if(pg.type==='PAGE')await figma.setCurrentPageAsync(pg);
const isSet=target.type==='COMPONENT_SET';
const defaultVariant=isSet?(target.defaultVariant||target.children[0]):target;
let defs={};try{defs=target.componentPropertyDefinitions||{}}catch(e){}
const variantAxes={},propertyDefs={},booleanDefs=[],instanceSwaps=[],textProps=[];
for(const [key,def] of Object.entries(defs)){
  const entry={type:def.type,default:def.defaultValue};
  if(def.type==='VARIANT'){entry.values=def.variantOptions||[];variantAxes[key]=def.variantOptions||[]}
  if(def.type==='INSTANCE_SWAP')entry.preferredValues=(def.preferredValues||[]).map(pv=>({type:pv.type,key:pv.key}));
  propertyDefs[key]=entry;
}
const variantAxesDefaults={};
if(isSet)for(const [k,v] of Object.entries(defaultVariant.variantProperties||{}))variantAxesDefaults[k]=v;
const variantGrid=isSet?target.children.map(c=>c.variantProperties||{}):[];
const refIndex={};
for(const v of (isSet?target.children:[target])){
  for(const n of v.findAll(n=>!!n.componentPropertyReferences)){
    for(const rk of Object.values(n.componentPropertyReferences||{})){
      if(!rk)continue;
      const inD=v===defaultVariant;
      if(!refIndex[rk]||(inD&&!refIndex[rk].inDefault))refIndex[rk]={layerName:n.name,layerId:n.id,layerType:n.type,inDefault:inD};
    }
  }
}
for(const [key,def] of Object.entries(defs)){
  const ref=refIndex[key]||null;
  if(ref){propertyDefs[key].associatedLayerName=ref.layerName;propertyDefs[key].associatedLayerId=ref.layerId}
  if(def.type==='BOOLEAN')booleanDefs.push({key,default:def.defaultValue===true,associatedLayerName:ref?ref.layerName:null,associatedLayerId:ref?ref.layerId:null});
  if(def.type==='INSTANCE_SWAP')instanceSwaps.push({key,default:def.defaultValue,slotName:ref?ref.layerName:key.split('#')[0],slotNodeType:ref?ref.layerType:'INSTANCE',preferredValues:propertyDefs[key].preferredValues||[]});
  if(def.type==='TEXT'||def.type==='NUMBER')textProps.push({key,type:def.type,default:def.defaultValue});
}
for(const sw of instanceSwaps){try{if(sw.default){const dn=await figma.getNodeByIdAsync(String(sw.default));if(dn)sw.defaultName=dn.name}}catch(e){}}
return {component:{componentName:target.name,compSetNodeId:target.id,isComponentSet:isSet},variantAxes,variantAxesDefaults,variantGrid,booleanDefs,instanceSwaps,textProps,propertyDefs};
```

Types: `VARIANT|BOOLEAN|INSTANCE_SWAP|TEXT|NUMBER`. Swap/text surface via "Controls slot" + summary.

#### Step 2b: Resolve slot preferred components

Collect `{type,key}` from `instanceSwaps[].preferredValues`, dedupe. Empty → skip. Else:

```javascript
const PREFERRED_KEYS=__PREFERRED_KEYS_JSON__;
await figma.loadAllPagesAsync();
const byKey={};
for(const n of figma.root.findAll(nn=>nn.type==='COMPONENT'||nn.type==='COMPONENT_SET'))if(n.key)byKey[n.key]=n;
const resolved=[];
for(const pv of PREFERRED_KEYS){
  let node=byKey[pv.key]||null;
  if(!node){try{node=pv.type==='COMPONENT_SET'?await figma.importComponentSetByKeyAsync(pv.key):await figma.importComponentByKeyAsync(pv.key)}catch(e){node=null}}
  if(!node){resolved.push({componentKey:pv.key,componentName:null,unresolved:true});continue}
  const set=node.type==='COMPONENT_SET'?node:(node.parent&&node.parent.type==='COMPONENT_SET'?node.parent:null);
  const src=set||node;
  let defs={};try{defs=src.componentPropertyDefinitions||{}}catch(e){}
  const axes={},bools=[];
  for(const [k,d] of Object.entries(defs)){
    if(d.type==='VARIANT')axes[k]=d.variantOptions||[];
    if(d.type==='BOOLEAN')bools.push({key:k,default:d.defaultValue===true});
  }
  resolved.push({componentKey:pv.key,componentName:src.name,componentId:node.type==='COMPONENT'?node.id:null,componentSetId:set?set.id:null,isComponentSet:!!set,variantAxes:axes,booleanDefs:bools});
}
return {resolved};
```

Assemble `slotContents`: one entry per 2a `instanceSwaps` — `{slotName,slotNodeType,rawKey,preferredComponents}` (drop unresolved; note for summary).

#### Step 2c: Sub-component walk (default variant, one level)

Replace `__COMP_SET_NODE_ID__` + `__BOOLEAN_DEFS_JSON__`:

```javascript
const TARGET_ID='__COMP_SET_NODE_ID__';
const BOOLEAN_DEFS=__BOOLEAN_DEFS_JSON__;
const target=await figma.getNodeByIdAsync(TARGET_ID);
if(!target)return {error:'Target not found: '+TARGET_ID};
let pg=target;while(pg.parent&&pg.parent.type!=='DOCUMENT')pg=pg.parent;
if(pg.type==='PAGE')await figma.setCurrentPageAsync(pg);
const isSet=target.type==='COMPONENT_SET';
const defaultVariant=isSet?(target.defaultVariant||target.children[0]):target;
function nm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
const found=[],queue=[...defaultVariant.children];
while(queue.length>0){const n=queue.shift();if(n.type==='INSTANCE'){found.push(n);continue}if('children' in n)queue.push(...n.children)}
const subComponents=[],seen=new Set();
for(const inst of found){
  let main=null;try{main=await inst.getMainComponentAsync()}catch(e){}
  if(!main)continue;
  const set=main.parent&&main.parent.type==='COMPONENT_SET'?main.parent:null;
  const src=set||main;
  let defs={};try{defs=src.componentPropertyDefinitions||{}}catch(e){}
  const axes={},bools=[];
  for(const [k,d] of Object.entries(defs)){
    if(d.type==='VARIANT')axes[k]=d.variantOptions||[];
    if(d.type==='BOOLEAN')bools.push({name:k.split('#')[0],rawKey:k,defaultValue:d.defaultValue===true});
  }
  if(Object.keys(axes).length===0&&bools.length===0)continue;
  const axesDefaults={};let childGrid=[];
  if(set){
    for(const [k,v] of Object.entries(((set.defaultVariant||set.children[0]).variantProperties)||{}))axesDefaults[k]=v;
    childGrid=set.children.map(c=>c.variantProperties||{});
  }
  const anc=new Set();{let a=inst;while(a&&a.type!=='PAGE'&&a.id!==target.id){anc.add(a.id);a=a.parent}}
  let cbn=null,cbrk=null;
  for(const bd of BOOLEAN_DEFS){if(bd.associatedLayerId&&anc.has(bd.associatedLayerId)){cbn=bd.key.split('#')[0];cbrk=bd.key;break}}
  if(!cbn)for(const bd of BOOLEAN_DEFS){const a=nm(bd.associatedLayerName),b=nm(inst.name);if(a&&b&&(a===b||a.includes(b)||b.includes(a))){cbn=bd.key.split('#')[0];cbrk=bd.key;break}}
  const dedupeId=set?set.id:main.id;
  if(seen.has(dedupeId)){const p=subComponents.find(sc=>(sc.mainComponentSetId||sc.mainComponentId)===dedupeId);if(p)p.blownOut=true;continue}
  seen.add(dedupeId);
  subComponents.push({name:inst.name,mainComponentName:src.name,mainComponentSetId:set?set.id:null,mainComponentId:set?null:main.id,isComponentSet:!!set,remote:!!src.remote,visible:inst.visible!==false,variantAxes:Object.entries(axes).map(([n,o])=>({name:n,options:o,defaultValue:axesDefaults[n]!==undefined?axesDefaults[n]:(o[0]||null)})),variantGrid:childGrid,booleanProps:bools,controllingBooleanName:cbn,controllingBooleanRawKey:cbrk,blownOut:false});
}
return {subComponents,controllingBooleanNames:subComponents.filter(s=>s.controllingBooleanName).map(s=>s.controllingBooleanName)};
```

#### Model assembly (in memory)

Model (exact field names):

- `componentName`/`compSetNodeId`/`isComponentSet` from 2a.
- `variantAxes`: 2a × `variantAxesDefaults` → `[{name,options,defaultValue}]`.
- `defaultProps`: `variantAxesDefaults`. `variantGrid`: 2a's grid.
- `booleanProps`: `{name:key.split('#')[0],defaultValue,associatedLayer,rawKey,controlsSlot,slotPreferredNames}`. `controlsSlot=true` when `associatedLayerName` matches `slotContents[].slotName`; `slotPreferredNames`=slot's `preferredComponents[].componentName`.
- `instanceSwapProps`: `{name,defaultValue:defaultName||default,rawKey}`.
- `slotProps`: `{name,preferredInstances:[{componentKey,componentName,componentId}],rawKey}`.
- `textProps`: `{name,type,defaultValue,rawKey}`. Summary-only.
- `childComponents`: 2c's `subComponents` + `controllingBooleanNames`.

**Scope.** Full child chapters (6e/6f/6g axes) → children with non-null `mainComponentSetId`. Standalone-backed → boolean chapters only. Deeper nesting out of scope.

### Step 3: Variant-Gated Boolean Scan

Standalone target → `requiredVariantOverrides:null` for every boolean. Else:

```javascript
const TARGET_NODE_ID='__COMP_SET_NODE_ID__';
const BOOLEAN_DEFS=__BOOLEAN_DEFS_JSON__;
const node=await figma.getNodeByIdAsync(TARGET_NODE_ID);
if(!node||node.type!=='COMPONENT_SET')return {skip:true,reason:'Not a component set',interpretedBooleans:[]};
let pg=node;while(pg.parent&&pg.parent.type!=='DOCUMENT')pg=pg.parent;
if(pg.type==='PAGE')await figma.setCurrentPageAsync(pg);
const defaultVariant=node.defaultVariant||node.children[0];
const defaultVProps=defaultVariant.variantProperties||{};
function findBound(v,rk){return v.findOne(n=>{const r=n.componentPropertyReferences;return !!r&&Object.values(r).includes(rk)})}
const interpretedBooleans=[];
for(const bd of BOOLEAN_DEFS){
  const rawKey=bd.key||'';
  const result={name:rawKey.split('#')[0],requiredVariantOverrides:null,layerName:bd.associatedLayerName||null};
  const inD=findBound(defaultVariant,rawKey);
  if(inD){result.layerName=inD.name;interpretedBooleans.push(result);continue}
  const suf=rawKey.split('#')[1]||null;
  if(suf){try{const ln=await figma.getNodeByIdAsync(defaultVariant.id.split(';')[0]+';'+suf);if(ln){result.layerName=ln.name;interpretedBooleans.push(result);continue}}catch(e){}}
  for(const child of node.children){
    if(child===defaultVariant)continue;
    const bound=findBound(child,rawKey);
    if(bound){
      const vp=child.variantProperties||{},diff={};
      for(const [k,v] of Object.entries(vp))if(defaultVProps[k]!==v)diff[k]=v;
      if(Object.keys(diff).length>0)result.requiredVariantOverrides=diff;
      result.layerName=bound.name;break;
    }
  }
  interpretedBooleans.push(result);
}
return {interpretedBooleans};
```

`requiredVariantOverrides===null` → 6b normal. Object → variant-gated; store on `booleanProps`; 6b finds base variant + notes dependency.

### Step 4: Variable-Mode Lookup

Local + team-library. Supplies `COLLECTION_ID`/`MODES_JSON` for 6c.

```javascript
const COMPONENT_NAME='__COMPONENT_NAME__';
const nl=COMPONENT_NAME.toLowerCase(),KW=['shape','density'];
function rel(cn){const c=String(cn||'').toLowerCase();return c.includes(nl)||KW.some(k=>c.includes(k))}
const out=[];
for(const col of await figma.variables.getLocalVariableCollectionsAsync()){
  if(!rel(col.name))continue;
  out.push({source:'local',collectionName:col.name,collectionId:col.id,modes:col.modes.map(m=>({modeId:m.modeId,name:m.name})),defaultModeId:col.defaultModeId});
}
try{
  for(const lc of await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()){
    if(!rel(lc.name))continue;
    try{
      const vars=await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lc.key);
      if(vars.length===0)continue;
      const v=await figma.variables.importVariableByKeyAsync(vars[0].key);
      const col=await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
      if(!col)continue;
      out.push({source:'library: '+lc.libraryName,collectionName:col.name,collectionId:col.id,modes:col.modes.map(m=>({modeId:m.modeId,name:m.name})),defaultModeId:col.defaultModeId});
    }catch(e){}
  }
}catch(e){}
return {collections:out};
```

Build `variableModeProps`: `name`=collection minus component; `options`=mode names; `defaultValue`=mode "Default" else matching `defaultModeId` else first; carry `collectionName`/`collectionId`/`modes`. Skip single-mode, color-theme, breakpoint. Empty → `[]`.

### Step 5: Normalize the Model (in memory)

Pure reasoning — no canvas access. Reference algorithm (run in memory over model from Steps 2–4):

```javascript
const PA=__PARENT_VARIANT_AXES_JSON__,CH=__CHILD_COMPONENTS_JSON__,CBN=__CONTROLLING_BOOLEAN_NAMES_JSON__;
for(const ch of CH)for(const a of ch.variantAxes){a.coupled=false;for(const p of PA)if(a.name.toLowerCase()===p.name.toLowerCase()){const cs=new Set(a.options.map(o=>o.toLowerCase())),ps=new Set(p.options.map(o=>o.toLowerCase()));if([...cs].every(o=>ps.has(o))){a.coupled=true;break}}}
const unifiedSlotChapters=[],unifiedSubBooleanNames=[];
function shortName(bn,cn){const pw=cn.toLowerCase().split(/\s+/),bw=bn.split(/\s+/);let s=bw.filter(w=>!pw.includes(w.toLowerCase()));if(s.length===0)s=bw;return s.join(' ')}
function stripVerbs(n){return n.replace(/^(Show|Has|With|Enable|Toggle|Display)\s+/i,'')}
for(const ch of CH){
if(!ch.controllingBooleanName||ch.booleanProps.length===0)continue;
const sb=ch.booleanProps,cbn=ch.controllingBooleanName,cbrk=ch.controllingBooleanRawKey;
const combos=[{label:'None',containerOn:false,subValues:{}}];
if(sb.length<=5){
const c=sb.length,t=1<<c,ce=[];
for(let m=1;m<t;m++){const sv={},on=[];for(let i=0;i<c;i++){const o=Boolean(m&(1<<i));sv[sb[i].name]=o;if(o)on.push(stripVerbs(shortName(sb[i].name,cbn)))}ce.push({label:on.join(' + '),containerOn:true,subValues:sv,onCount:on.length})}
ce.sort((a,b)=>a.onCount-b.onCount);
const cap=ce.length>5?[...ce.slice(0,4),ce[ce.length-1]]:ce;
for(const c of cap){delete c.onCount;combos.push(c)}
}else{
for(const s of sb){const sv={};for(const x of sb)sv[x.name]=(x.name===s.name);combos.push({label:stripVerbs(shortName(s.name,cbn)),containerOn:true,subValues:sv})}
const ao={};for(const s of sb)ao[s.name]=true;
combos.push({label:sb.map(s=>stripVerbs(shortName(s.name,cbn))).join(' + '),containerOn:true,subValues:ao});
}
if(sb.length===1)combos[1].label=stripVerbs(shortName(sb[0].name,cbn));
const pbd=CBN.includes(cbn);let dl='None';
if(pbd){const dsv={};for(const s of sb)dsv[s.name]=s.defaultValue;const mt=combos.find(c=>c.containerOn&&Object.entries(c.subValues).every(([k,v])=>dsv[k]===v));if(mt)dl=mt.label}
unifiedSlotChapters.push({chapterName:ch.name+' -- '+cbn,childName:ch.name,containerBoolName:cbn,containerBoolRawKey:cbrk,subBooleans:sb,previewCombinations:combos,defaultLabel:dl});
for(const s of sb)unifiedSubBooleanNames.push(s.name);
}
const siblingBoolChapters=[],siblingBoolNames=[],cu=new Set(unifiedSubBooleanNames);
for(const ch of CH){
if(ch.controllingBooleanName&&ch.booleanProps.length>0)continue;
const rem=ch.booleanProps.filter(b=>!cu.has(b.name));
if(rem.length<2)continue;
const combos=[],c=rem.length,t=1<<c,ce=[];
for(let m=0;m<t;m++){const sv={},on=[];for(let i=0;i<c;i++){const o=Boolean(m&(1<<i));sv[rem[i].name]=o;if(o)on.push(stripVerbs(rem[i].name))}ce.push({label:on.length===0?'None':on.join(' + '),subValues:sv,onCount:on.length})}
ce.sort((a,b)=>a.onCount-b.onCount);
const cap=ce.length>6?[...ce.slice(0,4),ce[ce.length-2],ce[ce.length-1]]:ce;
for(const c of cap){delete c.onCount;combos.push(c)}
const dsv={};for(const b of rem)dsv[b.name]=b.defaultValue;
const dm=combos.find(c=>Object.entries(c.subValues).every(([k,v])=>dsv[k]===v));
siblingBoolChapters.push({chapterName:ch.name,childName:ch.name,booleans:rem,previewCombinations:combos,defaultLabel:dm?dm.label:'None'});
for(const b of rem)siblingBoolNames.push(b.name);
}
return {childComponents:CH,unifiedSlotChapters,unifiedSubBooleanNames,siblingBoolChapters,siblingBoolNames};
```

### Step 6: Validate + Plan Exhibits (in memory)

Designated reasoning layer — don't rely on Step 11 screenshot as safety net.

**Phase A — Data validation.** User notes: coupling → override 5-i; usage → description; code-only → note; importance → own chapter. Canvas wins over description conflicts EXCEPT user coupling/constraint. **Boolean linkage**: child with `controllingBooleanName===null`+`visible===false` + parent boolean related to layer name → set `controllingBooleanName`/`controllingBooleanRawKey`, add to `controllingBooleanNames`; reset wrong matches. **Variable-mode relevance**: must apply to THIS component. **Semantic coupled axes**: same-named + same count + ≥50% overlap → `coupled:true`. User note → `coupled:true`. **Sparse child matrices**: option only with specific value of another axis → `constrainedBy:{axis:val}` (6e-iii folds into `BASE_PROPS`). Interdependent → `blownOut:true`. **Structural**: 0-renderable-prop children; unified sub-booleans default true + container false → defaultLabel='None'; utility children ("Spacer") → skip. **Counts**: unified >8 → all-off + each-on + all-on; 'None'+one → simple boolean; unclear labels → rewrite.

**Phase B — Exhibit planning.**

**B1. Context axes** (0-1, rarely 2). Changes visual identity enough that chapters repeat previews across context values as grouped rows. Strong: style/color/brand (`variant`/`color`/`theme`/`emphasis`); core state when identity IS state. NOT: dimensional/structural/sparse. Cap 1; 2 only if both small + essential. `contextValues × maxOptions` < ~20. Active: chapters render grouped rows; title=property; description `"{N} options across {M} {contextAxisName}s. Default: {value}"`; context axis gets standalone `6a`; `briefDescription` mentions it. Store `contextAxis:{name,options,defaultValue}` or `null`.

**B2. Triage.** **Illustrate** — non-obvious impact / composite / dev wouldn't intuit (4+ options; changes arrangement; state replacing content; user requested). **Mention only** — self-explanatory (boolean named after layer; uniform; 2-option trivial). **Skip** — internal. All non-skipped surface somewhere.

**B3. Sparse variant pairs.** Per pair use `variantGrid`: all combos → two chapters. Some missing → matrix (6a-matrix) + standalones for both axes. Primary=rows, secondary=cols, missing→N/A. 3+ axes: only sparse pair gets matrix.

**B4. Composite boolean-variant.** Booleans modifying same concept as axis (e.g. `layout` × `leading icon`/`trailing icon` = 5 configs). Heuristics: boolean contains variant word; shared spatial noun; axis "X-only" + booleans toggle non-"only". → composite chapter; drop absorbed standalones unless boolean adds beyond.

**B5. State × layout.** State differs across layouts → context axis or composite.

**B6. Redundancy.** Context standalone → keep `6a`. Matrix + per-axis → both. Composite absorbing → drop absorbed. Overview duplicating primary → merge.

**B7. Coverage.** Every variant/boolean/variable-mode/non-skipped child → entry.

**B8. Plan.** Store `contextAxis` + `exhibitPlan`:

```
{presentation:"illustrate"|"mention"|"skip", type:"variant"|"boolean"|"matrix"|"variableMode"|"childVariant"|"childBoolean"|"unifiedSlot"|"siblingBoolean"|"summary", name, description, template:"6a"|"6a-ctx"|"6a-matrix"|"6b"|"6c"|"6e"|"6f"|"6g"|"6h", axes, options, defaultLabel}
```

`contextAxis` non-null → variant`6a-ctx`, composite`6a-ctx`, boolean`6b` with context options passed; context axis own entry stays `6a`. Null → `6a`, and `6b` with `CONTEXT_OPTIONS=[]`. Matrix/6c/6e/6f/6g unaffected. Append `{type:"summary",template:"6h"}`.

**B9. briefDescription.** ≤15 words. What component IS/does. Don't start with component name.

### Step 7: Pre-Render Audit

Verify: contextAxis relevant or null (set → standalone 6a); no chapter >~20 previews; sparse-context rows omit/N/A; every property has entry; `controllingBooleanNames`/`unifiedSubBooleanNames`/`siblingBoolNames` NOT standalone; coupled axes skipped; unified ≤8, sibling ≤6; sparse → 6a-matrix; composite absorbs → no absorbed standalones; blown-out flagged; correct templates; briefDescription composed; variable-mode relevance confirmed; child titles use `controllingBooleanName`.

**Do NOT.** Mutate `#`-prefixed frames (create children). Use auto-layout for heterogeneous grids (non-auto-layout child in `#preview` with absolute positions; measure sample). Skip missing combos silently (render N/A same dimensions). Modify user's component/library. Pause.

### Step 8: Resolve Template + Place Frame

Placement: right of component on page, or viewport center for remote/no-page.

#### Tier A/B: Configured key, then local "Property"

`__PROPERTY_TEMPLATE_KEY_OR_EMPTY__` empty when auto-resolving:

```javascript
const PROPERTY_TEMPLATE_KEY='__PROPERTY_TEMPLATE_KEY_OR_EMPTY__';
const COMP_NODE_ID='__COMP_SET_NODE_ID__';
const COMPONENT_NAME='__COMPONENT_NAME__';
const compNode=await figma.getNodeByIdAsync(COMP_NODE_ID);
let pg=compNode;while(pg&&pg.parent&&pg.parent.type!=='DOCUMENT')pg=pg.parent;
const onPage=!!pg&&pg.type==='PAGE';
if(onPage)await figma.setCurrentPageAsync(pg);
let tc=null,source=null;
if(PROPERTY_TEMPLATE_KEY){try{tc=await figma.importComponentByKeyAsync(PROPERTY_TEMPLATE_KEY);source='template-key'}catch(e){}}
if(!tc){
  await figma.loadAllPagesAsync();
  function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
  const cands=figma.root.findAll(n=>n.type==='COMPONENT'&&n.name.trim().toLowerCase()==='property'&&!_in(n,COMP_NODE_ID)&&!(compNode&&_in(compNode,n.id)));
  if(cands.length>0){tc=cands[0];source='local-component'}
}
if(!tc)return {ok:false,reason:'no-template'};
const frame=tc.createInstance().detachInstance();
if(onPage&&compNode&&typeof compNode.x==='number'){frame.x=compNode.x+compNode.width+200;frame.y=compNode.y}
else{const c=figma.viewport.center;frame.x=c.x-frame.width/2;frame.y=c.y-frame.height/2}
const req=['#anatomy-section','#section-name','#optional-section-description','#preview','#comp-name-anatomy','#brief-component-description'];
const missing=req.filter(nm=>!frame.findOne(n=>n.name===nm));
if(missing.length>0){frame.remove();return {ok:false,reason:'template-missing-layers',missing}}
frame.name=COMPONENT_NAME+' Properties';
figma.currentPage.selection=[frame];figma.viewport.scrollAndZoomIntoView([frame]);
return {ok:true,source,frameId:frame.id,pageName:figma.currentPage.name};
```

`ok:false` → run Tier C. Pasting a template key upgrades future runs. The candidate filter excludes the documented component and anything inside it — a component of the user's named "Property" is never the template.

#### Tier C: Build scaffold from scratch

Emits: `{Component} Properties` (root), `#comp-name-anatomy`, `#brief-component-description`, `#marker-example`, `#content`, `#anatomy-section` (chapter template — cloned per exhibit, hidden at cleanup), `#section-name`, `#optional-section-description`, `#preview`. Root 1160px, 48 padding, 24 gaps; sections white 1px border 12px radius; `#preview` wraps + clips.

```javascript
const COMP_NODE_ID='__COMP_SET_NODE_ID__',COMPONENT_NAME='__COMPONENT_NAME__',FONT_FAMILY='__FONT_FAMILY__';
async function FF(fam,st,alt){alt=alt||'Regular';const g=(await figma.listAvailableFontsAsync()).filter(f=>f.fontName.family===fam);const fn=((g.find(f=>f.fontName.style===st)||g.find(f=>f.fontName.style===alt)||g[0])||{fontName:{family:'Inter',style:'Regular'}}).fontName;await figma.loadFontAsync(fn);return fn}
const F_TITLE=await FF(FONT_FAMILY,'Semi Bold','Bold'),F_SEMI=await FF(FONT_FAMILY,'Semi Bold','Medium'),F_MED=await FF(FONT_FAMILY,'Medium','Regular'),F_REG=await FF(FONT_FAMILY,'Regular','Regular');
const INK={r:0.067,g:0.067,b:0.067},BODY={r:0.29,g:0.29,b:0.29},MUTED={r:0.42,g:0.42,b:0.42},FAINT={r:0.541,g:0.541,b:0.541},LINE={r:0.898,g:0.898,b:0.898},WHITE={r:1,g:1,b:1};
function txt(f,c,s,col){const t=figma.createText();t.fontName=f;t.characters=c;t.fontSize=s;t.fills=[{type:'SOLID',color:col}];return t}
function fr(nm,mode){const f=figma.createFrame();f.name=nm;if(mode)f.layoutMode=mode;f.primaryAxisSizingMode='AUTO';f.counterAxisSizingMode='AUTO';f.fills=[];return f}
function divider(){const d=figma.createRectangle();d.name='divider';d.resize(100,1);d.fills=[{type:'SOLID',color:LINE}];return d}
const compNode=await figma.getNodeByIdAsync(COMP_NODE_ID);
let pg=compNode;while(pg&&pg.parent&&pg.parent.type!=='DOCUMENT')pg=pg.parent;
const onPage=!!pg&&pg.type==='PAGE';
if(onPage)await figma.setCurrentPageAsync(pg);
const frame=figma.createFrame();
frame.name=COMPONENT_NAME+' Properties';frame.layoutMode='VERTICAL';frame.primaryAxisSizingMode='AUTO';frame.counterAxisSizingMode='FIXED';frame.resize(1160,100);frame.itemSpacing=24;frame.paddingTop=48;frame.paddingBottom=48;frame.paddingLeft=48;frame.paddingRight=48;frame.fills=[{type:'SOLID',color:WHITE}];frame.strokes=[{type:'SOLID',color:LINE}];frame.strokeWeight=1;frame.cornerRadius=16;
const header=fr('header','VERTICAL');header.itemSpacing=8;frame.appendChild(header);header.layoutSizingHorizontal='FILL';
const eyebrow=txt(F_MED,'PROPERTIES',11,FAINT);eyebrow.letterSpacing={value:8,unit:'PERCENT'};header.appendChild(eyebrow);
const nameWrap=fr('#comp-name-anatomy','HORIZONTAL');header.appendChild(nameWrap);nameWrap.appendChild(txt(F_TITLE,'Component',28,INK));
const descWrap=fr('#brief-component-description','HORIZONTAL');header.appendChild(descWrap);descWrap.layoutSizingHorizontal='FILL';
const descText=txt(F_REG,'Brief component description.',14,BODY);descWrap.appendChild(descText);descText.layoutSizingHorizontal='FILL';descText.textAutoResize='HEIGHT';
const marker=fr('#marker-example','HORIZONTAL');marker.counterAxisAlignItems='CENTER';marker.itemSpacing=6;header.appendChild(marker);
const badge=fr('marker-badge','HORIZONTAL');badge.primaryAxisSizingMode='FIXED';badge.counterAxisSizingMode='FIXED';badge.resize(20,20);badge.cornerRadius=10;badge.primaryAxisAlignItems='CENTER';badge.counterAxisAlignItems='CENTER';badge.fills=[{type:'SOLID',color:INK}];marker.appendChild(badge);badge.appendChild(txt(F_MED,'1',11,WHITE));
marker.appendChild(txt(F_REG,'Marker example',12,MUTED));
const hdrDiv=divider();frame.appendChild(hdrDiv);hdrDiv.layoutSizingHorizontal='FILL';
const content=fr('#content','VERTICAL');content.itemSpacing=24;frame.appendChild(content);content.layoutSizingHorizontal='FILL';
const section=fr('#anatomy-section','VERTICAL');section.itemSpacing=12;section.paddingTop=16;section.paddingBottom=16;section.paddingLeft=16;section.paddingRight=16;section.fills=[{type:'SOLID',color:WHITE}];section.strokes=[{type:'SOLID',color:LINE}];section.strokeWeight=1;section.cornerRadius=12;content.appendChild(section);section.layoutSizingHorizontal='FILL';
const secName=fr('#section-name','HORIZONTAL');section.appendChild(secName);secName.appendChild(txt(F_SEMI,'Section',18,INK));
const secDesc=fr('#optional-section-description','HORIZONTAL');section.appendChild(secDesc);secDesc.layoutSizingHorizontal='FILL';
const secDescText=txt(F_REG,'Section description.',13,MUTED);secDesc.appendChild(secDescText);secDescText.layoutSizingHorizontal='FILL';secDescText.textAutoResize='HEIGHT';
const secDiv=divider();section.appendChild(secDiv);secDiv.layoutSizingHorizontal='FILL';
const preview=fr('#preview','HORIZONTAL');preview.itemSpacing=24;preview.paddingTop=16;preview.paddingBottom=16;preview.paddingLeft=16;preview.paddingRight=16;preview.clipsContent=true;section.appendChild(preview);preview.layoutSizingHorizontal='FILL';preview.layoutWrap='WRAP';preview.counterAxisSpacing=24;
if(onPage&&compNode&&typeof compNode.x==='number'){frame.x=compNode.x+compNode.width+200;frame.y=compNode.y}
else{const c=figma.viewport.center;frame.x=c.x-frame.width/2;frame.y=c.y-200}
figma.currentPage.selection=[frame];figma.viewport.scrollAndZoomIntoView([frame]);
return {ok:true,source:'built-scaffold',frameId:frame.id,pageName:figma.currentPage.name};
```

Record `frameId`/`pageName`/`source`.

### Step 9: Fill Header

```javascript
const pg=figma.root.children.find(p=>p.name==='__PAGE_NAME__');
if(pg)await figma.setCurrentPageAsync(pg);
const frame=await figma.getNodeByIdAsync('__FRAME_ID__');
for(const tn of frame.findAll(n=>n.type==='TEXT'))try{const f=tn.fontName;if(f&&f!==figma.mixed)await figma.loadFontAsync(f).catch(()=>{})}catch(e){}
function setLbl(nm,ch){const g=frame.findOne(n=>n.name===nm);if(g){const t=g.findOne(n=>n.type==='TEXT');if(t)t.characters=ch}}
setLbl('#comp-name-anatomy','__COMPONENT_NAME__');
setLbl('#brief-component-description','__BRIEF_DESCRIPTION__');
const me=frame.findOne(n=>n.name==='#marker-example');if(me)me.visible=false;
return {success:true};
```

### Step 10: Render Exhibits

Iterate `exhibitPlan`, render only `illustrate` + final `summary`. Plan handles matrix/composite/context — don't iterate axes then booleans. Routing: variant→6a/6a-ctx; boolean→6b (contextual and not — pass `CONTEXT_OPTIONS`); composite→6a/6a-ctx; matrix→6a-matrix; variable mode→6c; child→6e/6f/6g; summary→6h. `contextAxis` adds `CONTEXT_AXIS_NAME`/`CONTEXT_OPTIONS`/`CONTEXT_DEFAULT`; `[]`/`''` for non-contextual. Composites-with-booleans: `await SP(inst,name,value)` per boolean after `NI`. Labels mark default "(default)".

#### Render helper preamble

Prepend to 6a–6h. Placeholders: `__PAGE_NAME__`, `__FRAME_ID__`.

The guard enforces the read-only invariant. `SAFE` refuses writes outside the annotation frame or an instance this script made; `ADOPT` refuses to move a pre-existing node in, which is what would drag a variant out of the user's set; `NI` is the only instance constructor and registers what it makes; `SWEEP` (every chapter's rollback via `RB`, plus after the last exhibit) deletes registered instances still loose on a page, so a throw mid-chapter can't leave one beside the component; `SP` is the only place a property is set, so every property write passes `SAFE`. Step 8's template tiers correctly keep a bare `createInstance()` — they run before `_F` exists and instantiate the template, which the Tier A/B filter guarantees is never the target.

```javascript
const pg=figma.root.children.find(p=>p.name==='__PAGE_NAME__');
if(pg)await figma.setCurrentPageAsync(pg);
const _F='__FRAME_ID__',_TMP=[];
function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
function _mine(n){let p=n;while(p){if(_TMP.indexOf(p)>=0)return true;p=p.parent}return false}
function SAFE(n){if(!n||!((_F&&_in(n,_F))||_mine(n)))throw new Error('GUARD: write outside annotation frame refused: '+(n&&n.name));return n}
function ADOPT(p,c){SAFE(p);if(!_mine(c)&&!_in(c,_F))throw new Error('GUARD: refused to move existing node into annotation: '+c.name);p.appendChild(c);return c}
function SWEEP(){for(const n of _TMP){try{if(!n.removed&&n.parent&&n.parent.type==='PAGE')n.remove()}catch(e){}}_TMP.length=0}
function RB(c,e){try{c.remove()}catch(x){}SWEEP();return {error:e.message,rolledBack:true}}
async function LF(r){for(const t of r.findAll(n=>n.type==='TEXT'))try{const f=t.fontName;if(f&&f!==figma.mixed)await figma.loadFontAsync(f).catch(()=>{})}catch(e){}}
async function NI(src,parent){const i=src.createInstance();_TMP.push(i);if(parent)ADOPT(parent,i);await LF(i);return i}
async function SP(node,name,val){if(!node)return false;for(const rk of Object.keys(node.componentProperties||{}))if(rk.split('#')[0]===name){SAFE(node).setProperties({[rk]:val});await LF(node);return true}return false}
function boolDesc(cs,layer,names,ovr){let s='';if(cs){s='. Controls slot: '+layer;if(names.length>0)s+=' (accepts: '+names.join(', ')+')'}else if(layer)s='. Controls layer: '+layer;return s+(ovr?'. Requires '+Object.entries(ovr).map(([k,v])=>k+' = '+v).join(', '):'')}
async function FF(fam,st,alt){alt=alt||'Regular';const g=(await figma.listAvailableFontsAsync()).filter(f=>f.fontName.family===fam);const fn=((g.find(f=>f.fontName.style===st)||g.find(f=>f.fontName.style===alt)||g[0])||{fontName:{family:'Inter',style:'Regular'}}).fontName;await figma.loadFontAsync(fn);return fn}
function wr(nm,p){const w=figma.createFrame();w.name=nm;w.layoutMode='VERTICAL';w.primaryAxisAlignItems='CENTER';w.counterAxisAlignItems='CENTER';w.itemSpacing=12;w.fills=[];w.primaryAxisSizingMode='AUTO';w.counterAxisSizingMode='AUTO';SAFE(p).appendChild(w);return w}
function lbl(font,chars,parent){const l=figma.createText();l.fontName=font;l.characters=chars;l.fontSize=14;l.fills=[{type:'SOLID',color:{r:0.29,g:0.29,b:0.29}}];parent.appendChild(l);return l}
function findV(cs,tp){let best=null,bs=-1;for(const c of cs.children){const cp=c.variantProperties||{};let s=0,ex=true;for(const [k,v] of Object.entries(tp)){if(cp[k]===v)s++;else ex=false}if(ex)return c;if(s>bs){bs=s;best=c}}return best}
function findNC(pi,cn){const q=[...pi.children];while(q.length>0){const n=q.shift();if(n.name===cn)return n;if('children' in n)q.push(...n.children)}return null}
async function na(w,ch,sz,col){const t=figma.createText();await figma.loadFontAsync({family:'Inter',style:'Regular'});t.characters=ch;t.fontSize=sz||14;t.fills=[{type:'SOLID',color:col||{r:0.7,g:0.7,b:0.7}}];w.appendChild(t);return t}
function ch_setup(frame,name){const tpl=frame.findOne(n=>n.name==='#anatomy-section');const chapter=tpl.clone();ADOPT(tpl.parent,chapter);chapter.name=name;chapter.visible=true;return {tpl,chapter}}
function setLbl(chapter,nm,txt){const g=chapter.findOne(n=>n.name===nm);if(g){const t=g.findOne(n=>n.type==='TEXT');if(t)t.characters=txt}}
function preview_reset(chapter){const ap=chapter.findOne(n=>n.name==='#preview');while(ap.children[0])ap.children[0].remove();ap.layoutWrap='WRAP';ap.counterAxisSpacing=ap.itemSpacing;return ap}
function preview_clear(chapter){const ap=chapter.findOne(n=>n.name==='#preview');while(ap.children[0])ap.children[0].remove();return ap}
function ctxCont(ap){const cc=figma.createFrame();cc.name='context-groups';cc.layoutMode='VERTICAL';cc.itemSpacing=32;cc.fills=[];cc.primaryAxisSizingMode='AUTO';cc.counterAxisSizingMode='FILL';ap.appendChild(cc);return cc}
function ctxGroup(cc,ctx,DEF,ROW){const rg=figma.createFrame();rg.name=ctx;rg.layoutMode='VERTICAL';rg.itemSpacing=16;rg.fills=[];rg.primaryAxisSizingMode='AUTO';rg.counterAxisSizingMode='FILL';cc.appendChild(rg);const rl=figma.createText();rl.fontName=ROW;rl.characters=ctx===DEF?ctx+' (default)':ctx;rl.fontSize=12;rl.fills=[{type:'SOLID',color:{r:0.45,g:0.45,b:0.45}}];rg.appendChild(rl);const ir=figma.createFrame();ir.name=ctx+'-instances';ir.layoutMode='HORIZONTAL';ir.layoutWrap='WRAP';ir.itemSpacing=24;ir.counterAxisSpacing=24;ir.fills=[];ir.primaryAxisSizingMode='AUTO';ir.counterAxisSizingMode='AUTO';rg.appendChild(ir);return ir}
```

#### 6a: Standard VARIANT axis chapter

```javascript
const FRAME_ID='__FRAME_ID__',COMP_SET_ID='__COMP_SET_NODE_ID__',PROPERTY_NAME='__PROPERTY_NAME__',OPTIONS=__OPTIONS_JSON__,DEFAULT_VALUE='__DEFAULT_VALUE__',DEFAULT_PROPS=__DEFAULT_PROPS_JSON__,FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,PROPERTY_NAME);
try{
await LF(chapter);
setLbl(chapter,'#section-name',PROPERTY_NAME);
setLbl(chapter,'#optional-section-description',OPTIONS.length+' options. Default: '+DEFAULT_VALUE);
const ap=preview_reset(chapter);
const compSet=await figma.getNodeByIdAsync(COMP_SET_ID);
const LBL=await FF(FONT_FAMILY,'Medium');
for(const option of OPTIONS){
  const tp={...DEFAULT_PROPS};tp[PROPERTY_NAME]=option;
  let tv=null,bf=null,bs=-1;
  for(const c of compSet.children){const vp=c.variantProperties||{};if(vp[PROPERTY_NAME]!==option)continue;let s=0,ex=true;for(const [k,v] of Object.entries(tp)){if(vp[k]===v)s++;else ex=false}if(ex){tv=c;break}if(s>bs){bs=s;bf=c}}
  if(!tv)tv=bf;
  const w=wr(option,ap);
  if(tv)await NI(tv,w);
  else await na(w,'Variant unavailable',12,{r:0.6,g:0.6,b:0.6});
  lbl(LBL,option===DEFAULT_VALUE?option+' (default)':option,w);
}
SWEEP();
return {success:true,property:PROPERTY_NAME};
}catch(e){return RB(chapter,e)}
```

#### 6a-ctx: Contextual VARIANT axis chapter

Outer loop over `CONTEXT_OPTIONS` → row groups. Composite-with-context: pass composite options as `OPTIONS`, set booleans via `setProperties`.

```javascript
const FRAME_ID='__FRAME_ID__',COMP_SET_ID='__COMP_SET_NODE_ID__',PROPERTY_NAME='__PROPERTY_NAME__',OPTIONS=__OPTIONS_JSON__,DEFAULT_VALUE='__DEFAULT_VALUE__',DEFAULT_PROPS=__DEFAULT_PROPS_JSON__,CONTEXT_AXIS_NAME='__CONTEXT_AXIS_NAME__',CONTEXT_OPTIONS=__CONTEXT_OPTIONS_JSON__,CONTEXT_DEFAULT='__CONTEXT_DEFAULT__',FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,PROPERTY_NAME);
try{
await LF(chapter);
setLbl(chapter,'#section-name',PROPERTY_NAME);
setLbl(chapter,'#optional-section-description',OPTIONS.length+' options across '+CONTEXT_OPTIONS.length+' '+CONTEXT_AXIS_NAME+'s. Default: '+DEFAULT_VALUE);
const ap=preview_clear(chapter);
const compSet=await figma.getNodeByIdAsync(COMP_SET_ID);
const LBL=await FF(FONT_FAMILY,'Medium'),ROW=await FF(FONT_FAMILY,'Bold');
const cc=ctxCont(ap);
for(const ctx of CONTEXT_OPTIONS){
  const ir=ctxGroup(cc,ctx,CONTEXT_DEFAULT,ROW);
  for(const option of OPTIONS){
    const tp={...DEFAULT_PROPS};tp[PROPERTY_NAME]=option;tp[CONTEXT_AXIS_NAME]=ctx;
    const tv=findV(compSet,tp);
    const w=wr(option,ir);
    const vp=tv?(tv.variantProperties||{}):{};
    if(tv&&vp[PROPERTY_NAME]===option&&vp[CONTEXT_AXIS_NAME]===ctx)await NI(tv,w);
    else await na(w,'N/A',12,{r:0.6,g:0.6,b:0.6});
    lbl(LBL,option===DEFAULT_VALUE?option+' (default)':option,w);
  }
}
SWEEP();
return {success:true,property:PROPERTY_NAME};
}catch(e){return RB(chapter,e)}
```

#### 6a-matrix: Sparse VARIANT MATRIX chapter

Absolute positioning in non-auto-layout child frame; measure sample for cell size; N/A same dimensions.

```javascript
const FRAME_ID='__FRAME_ID__',COMP_SET_ID='__COMP_SET_NODE_ID__',PRIMARY_AXIS='__PRIMARY_AXIS_NAME__',SECONDARY_AXIS='__SECONDARY_AXIS_NAME__',PRIMARY_OPTIONS=__PRIMARY_OPTIONS_JSON__,SECONDARY_OPTIONS=__SECONDARY_OPTIONS_JSON__,DEFAULT_PROPS=__DEFAULT_PROPS_JSON__,FONT_FAMILY='__FONT_FAMILY__',CHAPTER_NAME='__CHAPTER_NAME__',DESCRIPTION='__DESCRIPTION__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,CHAPTER_NAME);
try{
await LF(chapter);
setLbl(chapter,'#section-name',CHAPTER_NAME);setLbl(chapter,'#optional-section-description',DESCRIPTION);
const ap=chapter.findOne(n=>n.name==='#preview');
while(ap.children[0])ap.children[0].remove();
const compSet=await figma.getNodeByIdAsync(COMP_SET_ID);
const sample=await NI(compSet.children[0]);
const CELL_W=Math.ceil(sample.width)+40,CELL_H=Math.ceil(sample.height)+40;
sample.remove();
const LABEL_H=20,HEADER_H=24,GAP=8,ROW_LABEL_W=120,GRID_LEFT=ROW_LABEL_W+GAP;
const totalW=GRID_LEFT+SECONDARY_OPTIONS.length*(CELL_W+GAP),totalH=HEADER_H+GAP+PRIMARY_OPTIONS.length*(CELL_H+LABEL_H+GAP);
ap.layoutWrap='WRAP';
const gf=figma.createFrame();gf.name=CHAPTER_NAME+'-grid';gf.layoutMode='NONE';gf.fills=[];gf.resize(totalW,totalH);ap.appendChild(gf);
const LBL=await FF(FONT_FAMILY,'Medium'),HDR=await FF(FONT_FAMILY,'Bold');
for(let ci=0;ci<SECONDARY_OPTIONS.length;ci++){
  const h=figma.createText();h.fontName=HDR;h.characters=SECONDARY_OPTIONS[ci];h.fontSize=12;h.fills=[{type:'SOLID',color:{r:0.4,g:0.4,b:0.4}}];gf.appendChild(h);
  h.x=GRID_LEFT+ci*(CELL_W+GAP)+CELL_W/2-h.width/2;h.y=0;
}
for(let ri=0;ri<PRIMARY_OPTIONS.length;ri++){
  const rowY=HEADER_H+GAP+ri*(CELL_H+LABEL_H+GAP);
  const rl=figma.createText();rl.fontName=LBL;rl.characters=PRIMARY_OPTIONS[ri];rl.fontSize=14;rl.fills=[{type:'SOLID',color:{r:0.29,g:0.29,b:0.29}}];gf.appendChild(rl);
  rl.x=0;rl.y=rowY+CELL_H/2-rl.height/2;
  for(let ci=0;ci<SECONDARY_OPTIONS.length;ci++){
    const vp={...DEFAULT_PROPS};vp[PRIMARY_AXIS]=PRIMARY_OPTIONS[ri];vp[SECONDARY_AXIS]=SECONDARY_OPTIONS[ci];
    let tv=null;
    for(const c of compSet.children){
      const cp=c.variantProperties||{};let m=true;
      for(const [k,v] of Object.entries(vp)){if(cp[k]!==v){m=false;break}}
      if(m){tv=c;break}
    }
    const w=figma.createFrame();w.layoutMode='VERTICAL';w.primaryAxisAlignItems='CENTER';w.counterAxisAlignItems='CENTER';w.itemSpacing=8;w.fills=[];w.primaryAxisSizingMode='AUTO';w.counterAxisSizingMode='FIXED';w.resize(CELL_W,CELL_H+LABEL_H);
    SAFE(gf).appendChild(w);
    if(tv)await NI(tv,w);
    else await na(w,'N/A',14,{r:0.7,g:0.7,b:0.7});
    w.x=GRID_LEFT+ci*(CELL_W+GAP);w.y=rowY;
  }
}
SWEEP();
return {success:true,chapter:CHAPTER_NAME};
}catch(e){return RB(chapter,e)}
```

#### 6b / 6b-ctx: BOOLEAN chapter

One script for both. Skip booleans in `controllingBooleanNames` (absorbed by 6e/6f). `__VARIANT_OVERRIDES_OR_NULL__`=object or `null`. `__CONTROLS_SLOT_BOOL__`=true/false, `__SLOT_PREFERRED_NAMES_JSON__`=array or `[]`. **6b** — `__CONTEXT_OPTIONS_JSON__`=`[]`, `__CONTEXT_AXIS_NAME__`/`__CONTEXT_DEFAULT__`=`''`: one true/false pair, no row groups. **6b-ctx** — context options non-empty: a true/false pair per context row, sparse rows reading "Not available for {ctx}".

```javascript
const FRAME_ID='__FRAME_ID__',COMP_SET_ID='__COMP_SET_NODE_ID__',PROPERTY_NAME='__PROPERTY_NAME__',DEFAULT_VALUE=__DEFAULT_BOOL_VALUE__,ASSOCIATED_LAYER='__ASSOCIATED_LAYER__',CONTROLS_SLOT=__CONTROLS_SLOT_BOOL__,SLOT_PREFERRED_NAMES=__SLOT_PREFERRED_NAMES_JSON__,VARIANT_OVERRIDES=__VARIANT_OVERRIDES_OR_NULL__,CONTEXT_AXIS_NAME='__CONTEXT_AXIS_NAME__',CONTEXT_OPTIONS=__CONTEXT_OPTIONS_JSON__,CONTEXT_DEFAULT='__CONTEXT_DEFAULT__',FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,PROPERTY_NAME);
try{
const CTX=CONTEXT_OPTIONS&&CONTEXT_OPTIONS.length>0;
await LF(chapter);
setLbl(chapter,'#section-name',PROPERTY_NAME);
setLbl(chapter,'#optional-section-description','Boolean toggle'+(CTX?' across '+CONTEXT_OPTIONS.length+' '+CONTEXT_AXIS_NAME+'s':'')+'. Default: '+(DEFAULT_VALUE?'true':'false')+boolDesc(CONTROLS_SLOT,ASSOCIATED_LAYER,SLOT_PREFERRED_NAMES,VARIANT_OVERRIDES));
const ap=CTX?preview_clear(chapter):preview_reset(chapter);
const compNode=await figma.getNodeByIdAsync(COMP_SET_ID);
const isSet=compNode.type==='COMPONENT_SET';
const LBL=await FF(FONT_FAMILY,'Medium'),ROW=CTX?await FF(FONT_FAMILY,'Bold'):null;
const cc=CTX?ctxCont(ap):null;
for(const ctx of (CTX?CONTEXT_OPTIONS:[null])){
  const ir=CTX?ctxGroup(cc,ctx,CONTEXT_DEFAULT,ROW):ap;
  let base;
  if(isSet){
    const dvp=(compNode.defaultVariant||compNode.children[0]).variantProperties||{};
    const bp=VARIANT_OVERRIDES?{...dvp,...VARIANT_OVERRIDES}:{...dvp};
    if(CTX)bp[CONTEXT_AXIS_NAME]=ctx;
    base=(VARIANT_OVERRIDES||CTX)?findV(compNode,bp):(compNode.defaultVariant||compNode.children[0]);
  }else base=compNode;
  if(CTX&&(!base||(base.variantProperties||{})[CONTEXT_AXIS_NAME]!==ctx)){const sk=figma.createText();sk.fontName=LBL;sk.characters='Not available for '+ctx;sk.fontSize=12;sk.fills=[{type:'SOLID',color:{r:0.6,g:0.6,b:0.6}}];SAFE(ir).appendChild(sk);continue}
  for(const bval of [true,false]){
    const w=wr(PROPERTY_NAME+' = '+bval,ir);
    await SP(await NI(base,w),PROPERTY_NAME,bval);
    lbl(LBL,String(bval)+(bval===DEFAULT_VALUE?' (default)':''),w);
  }
}
SWEEP();
return {success:true,property:PROPERTY_NAME};
}catch(e){return RB(chapter,e)}
```

#### 6c: VARIABLE MODE chapter

Wrapper per mode via `setExplicitVariableModeForCollection`. Collection object required (local, fallback `getVariableCollectionByIdAsync`). Recursively clear modes on instance internals.

```javascript
const FRAME_ID='__FRAME_ID__',COMP_SET_ID='__COMP_SET_NODE_ID__',PROPERTY_NAME='__PROPERTY_NAME__',DEFAULT_VALUE='__DEFAULT_VALUE__',COLLECTION_NAME='__COLLECTION_NAME__',COLLECTION_ID='__COLLECTION_ID__',MODES=__MODES_JSON__,FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,PROPERTY_NAME);
try{
const cols=await figma.variables.getLocalVariableCollectionsAsync();
let collection=cols.find(c=>c.id===COLLECTION_ID)||null;
if(!collection){try{collection=await figma.variables.getVariableCollectionByIdAsync(COLLECTION_ID)}catch(e){}}
if(!collection)return RB(chapter,new Error('Variable collection not found: '+COLLECTION_ID));
function clearModes(n,col){try{n.clearExplicitVariableModeForCollection(col)}catch(e){}if('children' in n)for(const c of n.children)clearModes(c,col)}
await LF(chapter);
setLbl(chapter,'#section-name',PROPERTY_NAME);
setLbl(chapter,'#optional-section-description',MODES.length+' options. Default: '+DEFAULT_VALUE+'. Controlled via \''+COLLECTION_NAME+'\' variable mode.');
const ap=preview_reset(chapter);
const compNode=await figma.getNodeByIdAsync(COMP_SET_ID);
const dv=compNode.type==='COMPONENT_SET'?(compNode.defaultVariant||compNode.children[0]):compNode;
const LBL=await FF(FONT_FAMILY,'Medium');
for(const mode of MODES){
  const w=wr(mode.name,ap);
  w.setExplicitVariableModeForCollection(collection,mode.modeId);
  const inst=await NI(dv,w);
  clearModes(inst,collection);
  lbl(LBL,mode.name===DEFAULT_VALUE?mode.name+' (default)':mode.name,w);
}
SWEEP();
return {success:true,property:PROPERTY_NAME};
}catch(e){return RB(chapter,e)}
```

#### 6e: Child component chapters

Preferred **in-context** (parent instance, child prop varied on nested). Use **blown-out** (isolated from child's set) when `blownOut:true`, `setProperties()` on nested fails, or user requests. Blown-out uses `mainComponentSetId` + `findV` (6e-iii, 6e-iii-b). Child with controlling boolean: first preview is off state `"No {controllingBooleanName}"` — "(default)" when it defaults false. Titles `"{childName} – {propertyName}"`, descriptions `"Sub-component: {mainComponentName}"`.

##### 6e-i / 6e-ii: Child variant axes and child booleans (in-context)

One script for both, one chapter per `EXHIBITS` entry. **Variant axes** (skip `coupled===true`): `{name,options,defaultValue}`. **Booleans** (skip those in `unifiedSubBooleanNames`/`siblingBoolNames`): `{name,options:[true,false],defaultValue,isBool:true}`. Mixing both kinds in one call is fine. `__CONTROLLING_BOOL_RAW_KEY_OR_NULL__`=quoted key or `null` (null → `CONTROLLING_BOOL_NAME`=empty); the off-state preview leads variant-axis chapters only. `__COMP_SET_NODE_ID__`=**parent**.

```javascript
const FRAME_ID='__FRAME_ID__',COMP_SET_ID='__COMP_SET_NODE_ID__',CHILD_NAME='__CHILD_LAYER_NAME__',MAIN_COMP_NAME='__MAIN_COMPONENT_NAME__',CONTROLLING_BOOL_NAME='__CONTROLLING_BOOL_NAME__',CONTROLLING_BOOL_RAW_KEY=__CONTROLLING_BOOL_RAW_KEY_OR_NULL__,EXHIBITS=__EXHIBITS_JSON__,FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const tpl=frame.findOne(n=>n.name==='#anatomy-section');
const compNode=await figma.getNodeByIdAsync(COMP_SET_ID);
const parentDV=compNode.type==='COMPONENT_SET'?(compNode.defaultVariant||compNode.children[0]):compNode;
const LBL=await FF(FONT_FAMILY,'Medium');
for(const ex of EXHIBITS){
const chapter=tpl.clone();ADOPT(tpl.parent,chapter);chapter.name=CHILD_NAME+' – '+ex.name;chapter.visible=true;
try{
await LF(chapter);
setLbl(chapter,'#section-name',CHILD_NAME+' – '+ex.name);
const off=!ex.isBool&&!!CONTROLLING_BOOL_RAW_KEY;
const desc=ex.isBool?'Boolean toggle. Default: '+(ex.defaultValue?'true':'false'):(ex.options.length+(off?1:0))+' options'+(off?' (includes off state)':'')+'. Default: '+ex.defaultValue;
setLbl(chapter,'#optional-section-description','Sub-component: '+MAIN_COMP_NAME+'. '+desc);
const ap=preview_reset(chapter);
if(off){
  const w=wr('No '+CONTROLLING_BOOL_NAME,ap);
  await SP(await NI(parentDV,w),CONTROLLING_BOOL_NAME,false);
  lbl(LBL,'No '+CONTROLLING_BOOL_NAME+' (default)',w);
}
for(const option of ex.options){
  const w=wr(ex.isBool?ex.name+' = '+option:String(option),ap);
  const inst=await NI(parentDV,w);
  if(CONTROLLING_BOOL_RAW_KEY)await SP(inst,CONTROLLING_BOOL_NAME,true);
  await SP(findNC(inst,CHILD_NAME),ex.name,option);
  lbl(LBL,String(option)+(option===ex.defaultValue?' (default)':''),w);
}
}catch(e){return RB(chapter,e)}
}
SWEEP();
return {success:true,childComponent:CHILD_NAME};
```

##### 6e-iii: Blown-out child variant axes

`BASE_PROPS`=child defaults for OTHER axes + `constrainedBy`. `__SUB_COMP_SET_ID__`=child's `mainComponentSetId`.

```javascript
const FRAME_ID='__FRAME_ID__',SUB_COMP_SET_ID='__SUB_COMP_SET_ID__',CHAPTER_NAME='__CHAPTER_NAME__',MAIN_COMP_NAME='__MAIN_COMPONENT_NAME__',AXIS_NAME='__AXIS_NAME__',OPTIONS=__OPTIONS_JSON__,DEFAULT_VALUE='__DEFAULT_VALUE__',BASE_PROPS=__BASE_PROPS_JSON__,FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,CHAPTER_NAME);
try{
const subCS=await figma.getNodeByIdAsync(SUB_COMP_SET_ID);
await LF(chapter);
setLbl(chapter,'#section-name',CHAPTER_NAME);
setLbl(chapter,'#optional-section-description','Sub-component: '+MAIN_COMP_NAME+' (shown isolated). '+OPTIONS.length+' options. Default: '+DEFAULT_VALUE);
const ap=preview_reset(chapter);
const LBL=await FF(FONT_FAMILY,'Medium');
for(const option of OPTIONS){
  const tp={...BASE_PROPS};tp[AXIS_NAME]=option;
  const v=subCS.type==='COMPONENT_SET'?findV(subCS,tp):subCS;
  const w=wr(option,ap);
  if(v)await NI(v,w);
  else await na(w,'N/A',14,{r:0.7,g:0.7,b:0.7});
  lbl(LBL,option===DEFAULT_VALUE?option+' (default)':option,w);
}
SWEEP();
return {success:true,chapter:CHAPTER_NAME};
}catch(e){return RB(chapter,e)}
```

##### 6e-iii-b: Blown-out boolean combinations

For child booleans + 6f/6g on `blownOut:true`. `containerOn:false`→"Hidden". Single child boolean: `[{label:"true",subValues:{Name:true}},{label:"false",subValues:{Name:false}}]`. 6f blown-out: unified `previewCombinations` (None `containerOn:false`). 6g: sibling combos (no `containerOn`). `BASE_PROPS`=child default axes + `constrainedBy`.

```javascript
const FRAME_ID='__FRAME_ID__',SUB_COMP_SET_ID='__SUB_COMP_SET_ID__',CHAPTER_NAME='__CHAPTER_NAME__',MAIN_COMP_NAME='__MAIN_COMPONENT_NAME__',DEFAULT_LABEL='__DEFAULT_LABEL__',PREVIEW_COMBINATIONS=__PREVIEW_COMBINATIONS_JSON__,BASE_PROPS=__BASE_PROPS_JSON__,FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,CHAPTER_NAME);
try{
const subCS=await figma.getNodeByIdAsync(SUB_COMP_SET_ID);
const baseVariant=subCS.type==='COMPONENT_SET'?(findV(subCS,BASE_PROPS)||subCS.defaultVariant||subCS.children[0]):subCS;
await LF(chapter);
setLbl(chapter,'#section-name',CHAPTER_NAME);
setLbl(chapter,'#optional-section-description','Sub-component: '+MAIN_COMP_NAME+' (shown isolated). '+PREVIEW_COMBINATIONS.length+' combinations. Default: '+DEFAULT_LABEL);
const ap=preview_reset(chapter);
const LBL=await FF(FONT_FAMILY,'Medium');
for(const combo of PREVIEW_COMBINATIONS){
  const w=wr(combo.label,ap);
  if(combo.containerOn===false)await na(w,'Hidden',12,{r:0.6,g:0.6,b:0.6});
  else{
    const inst=await NI(baseVariant,w);
    for(const [sN,sV] of Object.entries(combo.subValues||{}))await SP(inst,sN,sV);
  }
  lbl(LBL,combo.label+(combo.label===DEFAULT_LABEL?' (default)':''),w);
}
SWEEP();
return {success:true,chapter:CHAPTER_NAME};
}catch(e){return RB(chapter,e)}
```

##### 6f / 6g: Unified slot and sibling boolean (combinatorial)

One script for both. **6f** — per `unifiedSlotChapters`: pass `__CONTAINER_BOOL_NAME__`=`containerBoolName`; combos carry `containerOn`, and a `containerOn:false` combo renders the container off with no sub-values. **6g** — per `siblingBoolChapters`: pass `__CONTAINER_BOOL_NAME__`=`''`; combos have no `containerOn`, so every one applies its sub-values. Child `blownOut:true` → use 6e-iii-b instead. `__COMP_SET_NODE_ID__`=**parent**.

```javascript
const FRAME_ID='__FRAME_ID__',COMP_SET_ID='__COMP_SET_NODE_ID__',CHILD_NAME='__CHILD_LAYER_NAME__',CHAPTER_NAME='__CHAPTER_NAME__',CONTAINER_BOOL_NAME='__CONTAINER_BOOL_NAME__',DEFAULT_LABEL='__DEFAULT_LABEL__',PREVIEW_COMBINATIONS=__PREVIEW_COMBINATIONS_JSON__,FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,CHAPTER_NAME);
try{
const compNode=await figma.getNodeByIdAsync(COMP_SET_ID);
const parentDV=compNode.type==='COMPONENT_SET'?(compNode.defaultVariant||compNode.children[0]):compNode;
await LF(chapter);
setLbl(chapter,'#section-name',CHAPTER_NAME);
setLbl(chapter,'#optional-section-description',PREVIEW_COMBINATIONS.length+' combinations. Default: '+DEFAULT_LABEL);
const ap=preview_reset(chapter);
const LBL=await FF(FONT_FAMILY,'Medium');
for(const combo of PREVIEW_COMBINATIONS){
  const w=wr(combo.label,ap);
  const inst=await NI(parentDV,w);
  if(CONTAINER_BOOL_NAME)await SP(inst,CONTAINER_BOOL_NAME,combo.containerOn);
  if(combo.containerOn!==false){
    const nc=findNC(inst,CHILD_NAME);
    for(const [sN,sV] of Object.entries(combo.subValues))await SP(nc,sN,sV);
  }
  lbl(LBL,combo.label+(combo.label===DEFAULT_LABEL?' (default)':''),w);
}
SWEEP();
return {success:true,chapter:CHAPTER_NAME};
}catch(e){return RB(chapter,e)}
```

#### 6h: Property summary table

One row per property across surface (mention/skip/swap/text/variable-mode included). `__SUMMARY_ROWS_JSON__`: `[{property,type,options,default,note},...]`. Types: Variant/Boolean/Instance swap/Text/Number/Variable mode/Sub-component. `note` carries gating, slot acceptance, "documented in text only", constraints.

```javascript
const FRAME_ID='__FRAME_ID__',SUMMARY_ROWS=__SUMMARY_ROWS_JSON__,FONT_FAMILY='__FONT_FAMILY__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
const {chapter}=ch_setup(frame,'Summary');
try{
await LF(chapter);
const F_HEAD=await FF(FONT_FAMILY,'Semi Bold','Bold'),F_MED=await FF(FONT_FAMILY,'Medium','Regular'),F_REG=await FF(FONT_FAMILY,'Regular','Regular');
const INK={r:0.067,g:0.067,b:0.067},BODY={r:0.29,g:0.29,b:0.29},MUTED={r:0.42,g:0.42,b:0.42},LINE={r:0.898,g:0.898,b:0.898};
const COLS=[{l:'PROPERTY',w:220},{l:'TYPE',w:140},{l:'OPTIONS',w:420},{l:'DEFAULT',w:180}];
const TABLE_W=960;
function cell(w,f,c,s,col){const cf=figma.createFrame();cf.name='cell';cf.layoutMode='VERTICAL';cf.primaryAxisSizingMode='AUTO';cf.counterAxisSizingMode='FIXED';cf.resize(w,10);cf.paddingTop=12;cf.paddingBottom=12;cf.paddingLeft=16;cf.paddingRight=16;cf.fills=[];const t=figma.createText();t.fontName=f;t.characters=c;t.fontSize=s;t.fills=[{type:'SOLID',color:col}];cf.appendChild(t);t.layoutSizingHorizontal='FILL';t.textAutoResize='HEIGHT';return cf}
function rd(){const d=figma.createRectangle();d.name='divider';d.resize(TABLE_W,1);d.fills=[{type:'SOLID',color:LINE}];return d}
setLbl(chapter,'#section-name','Property summary');
setLbl(chapter,'#optional-section-description',SUMMARY_ROWS.length+' properties. Rows without an exhibit above are documented here only.');
const ap=chapter.findOne(n=>n.name==='#preview');
while(ap.children[0])ap.children[0].remove();
ap.layoutWrap='WRAP';
const table=figma.createFrame();table.name='summary-table';table.layoutMode='VERTICAL';table.primaryAxisSizingMode='AUTO';table.counterAxisSizingMode='FIXED';table.resize(TABLE_W,10);table.itemSpacing=0;table.fills=[];ap.appendChild(table);
const hr=figma.createFrame();hr.name='head-row';hr.layoutMode='HORIZONTAL';hr.primaryAxisSizingMode='AUTO';hr.counterAxisSizingMode='AUTO';hr.counterAxisAlignItems='MIN';hr.itemSpacing=0;hr.fills=[];table.appendChild(hr);
for(const col of COLS)hr.appendChild(cell(col.w,F_HEAD,col.l,11,MUTED));
table.appendChild(rd());
for(const row of SUMMARY_ROWS){
  const r=figma.createFrame();r.name='row';r.layoutMode='HORIZONTAL';r.primaryAxisSizingMode='AUTO';r.counterAxisSizingMode='AUTO';r.counterAxisAlignItems='MIN';r.itemSpacing=0;r.fills=[];table.appendChild(r);
  const opt=row.note?String(row.options||'')+'\n'+row.note:String(row.options||'');
  r.appendChild(cell(COLS[0].w,F_MED,String(row.property||''),13,INK));
  r.appendChild(cell(COLS[1].w,F_REG,String(row.type||''),13,BODY));
  r.appendChild(cell(COLS[2].w,F_REG,opt,13,BODY));
  r.appendChild(cell(COLS[3].w,F_REG,String(row.default||''),13,BODY));
  table.appendChild(rd());
}
return {success:true,rows:SUMMARY_ROWS.length};
}catch(e){return RB(chapter,e)}
```

#### 6d: Clean up — hide `#anatomy-section` after all exhibits:

```javascript
const pg=figma.root.children.find(p=>p.name==='__PAGE_NAME__');
if(pg)await figma.setCurrentPageAsync(pg);
const frame=await figma.getNodeByIdAsync('__FRAME_ID__');
const tpl=frame.findOne(n=>n.name==='#anatomy-section');
if(tpl)tpl.visible=false;
return {success:true};
```

### Step 11: Visual Validation

Screenshot. Verify: variant axis previews per option; boolean on/off (except absorbed); variable-mode previews visibly distinct (identical → baked-in modes not cleared); child chapters show child prop varied; child+controlling boolean has off state "No {name}" first (in-context); one "(default)" per exhibit; instances render; child titles use `controllingBooleanName` not internal ("v2"); items don't clip; contextAxis set → chapters grouped rows + context axis standalone non-contextual; summary present + includes mention/skip rows; no overlaps/placeholder text. Fix + re-capture, ≤3 iterations. Scripts idempotent.

### Step 12: Completion

Also replace `__COMP_SET_NODE_ID__` and `__GUARD_JSON__` (Step 1's `guard`, verbatim) — the tail re-reads the source and proves it is untouched.

```javascript
const pg=figma.root.children.find(p=>p.name==='__PAGE_NAME__');
if(pg)await figma.setCurrentPageAsync(pg);
const frame=await figma.getNodeByIdAsync('__FRAME_ID__');
if(!frame)return {error:'Annotation frame not found'};
figma.currentPage.selection=[frame];figma.viewport.scrollAndZoomIntoView([frame]);
const tpl=frame.findOne(n=>n.name==='#anatomy-section');
const host=tpl?tpl.parent:frame;
const chapters=host.children.filter(c=>c.visible&&c.name!=='#anatomy-section');
let previewInstances=0;
for(const inst of frame.findAll(n=>n.type==='INSTANCE')){
  let a=inst.parent,nested=false;
  while(a&&a.id!==frame.id){if(a.type==='INSTANCE'){nested=true;break}a=a.parent}
  if(!nested)previewInstances++;
}
const t=await figma.getNodeByIdAsync('__COMP_SET_NODE_ID__'),B=__GUARD_JSON__,ch=[];
if(!t)ch.push('source missing');
else{const gb=t.absoluteBoundingBox||{};let gd='';try{gd=Object.keys(t.componentPropertyDefinitions||{}).sort().join(',')}catch(e){}
const a={name:t.name,parentId:t.parent?t.parent.id:'',kids:('children' in t)?t.children.length:0,box:[Math.round(gb.x||0),Math.round(gb.y||0),Math.round(gb.width||0),Math.round(gb.height||0)],defs:gd};
for(const k in B)if(String(a[k])!==String(B[k]))ch.push(k)}
return {frameId:frame.id,frameName:frame.name,chapterCount:chapters.length,chapterNames:chapters.map(c=>c.name),previewInstances,intact:ch.length===0,changed:ch};
```

`intact:false` is a failure, not a footnote: name what changed, tell the PM to undo (Cmd+Z) before trusting the annotation, and don't report success. `intact:true` needs no mention.

Summarize: component + placement; exhibit list + preview count; template source; judgment calls + gaps.

## Notes

Target: set or standalone. Variant defaults from `defaultVariant.variantProperties`. Lookup: set children matching `variantProperties`, best-match fallback. Swap/text: no chapters — boolean "Controls slot" + summary. `appendChild` (never index); roll back on failure. Bounded live reads: Step 3 boolean scan + Step 4 collection lookup. Baked-in variable modes override wrapper — 6c clears recursively. Steps 5-6 pure in-memory.

---

Adapted from uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license.

---

*Адаптировано из uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license — скилл Figma Community `create-property`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/annotate).*

