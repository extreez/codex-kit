> Часть скилла annotate (см. SKILL.md — общий read-only invariant, guard-функции
> SAFE/ADOPT/NI/SWEEP и выбор режима описаны там один раз, здесь не дублируются
> заново). Текст ниже — оригинальный источник (Create Anatomy Annotation), не переведён:
> сохраняем формулировки/код/числа дословно ради точности guard-правил.

# Create Anatomy Annotation

Render an anatomy annotation on canvas — a **composition section** (top-level elements + numbered markers + 4-col table), then **per-child sections** for each sub-component instance (including hidden). Canvas in → canvas out.

## Execution Contract

Instructions to RUN, not edit. Never edit this file except the Configuration block on explicit request. Never pause/ask. Only legal stop: Step 1 fail-fast. One script per section — do not merge or split.

## Read-only invariant

The documented component is **read-only** — the selected component, its set, variants, sub-components, their main components, and every library asset. Structure, properties, position, name, visibility, text, paints, variable modes: all untouchable. A correct annotation plus a modified source component is a failed run. This matters most here: Steps 6 and 7 switch to whichever page the component or sub-component lives on, so a leaked node lands in the user's library file, not next to the annotation.

**Writable scope, exhaustive:** the Step 4 annotation frame and its descendants, plus instances these scripts create. Never the target, never the page.

Never `appendChild`/`insertChild`/`remove`/`clone`/`setProperties`/`setVariantProperties`/`detachInstance`/`swapComponent`/`set`+`clearExplicitVariableModeForCollection`/`setBoundVariable`/`resize()`, or write `name`/`x`/`y`/`visible`/`characters`/`fills`/`strokes`/`layoutMode`, on the target, its ancestors, or its descendants. Unhide, populate, and re-point on a fresh instance instead. If a step seems to need one, the step is wrong — skip it, note it in Step 9.

### Render preamble

Prepend to every write script (Steps 5-7, 9). `__FRAME_ID__` = annotation frame id.

```javascript
const _F='__FRAME_ID__',_TMP=[];
function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
function _mine(n){let p=n;while(p){if(_TMP.indexOf(p)>=0)return true;p=p.parent}return false}
function SAFE(n){if(!n||!((_F&&_in(n,_F))||_mine(n)))throw new Error('GUARD: write outside annotation frame refused: '+(n&&n.name));return n}
function ADOPT(p,c){SAFE(p);if(!_mine(c)&&!_in(c,_F))throw new Error('GUARD: refused to move existing node into annotation: '+c.name);p.appendChild(c);return c}
function NI(src,parent){const i=src.createInstance();_TMP.push(i);if(parent)ADOPT(parent,i);return i}
function SWEEP(){for(const n of _TMP){try{if(!n.removed&&n.parent&&n.parent.type==='PAGE')n.remove()}catch(e){}}_TMP.length=0}
async function loadAllFonts(root){
  const tns=root.findAll(n=>n.type==='TEXT');
  const fs=new Set(),fl=[];
  for(const tn of tns){try{const fn=tn.fontName;if(fn&&fn!==figma.mixed&&fn.family){const k=fn.family+'|'+fn.style;if(!fs.has(k)){fs.add(k);fl.push(fn)}}}catch(e){}}
  await Promise.all(fl.map(f=>figma.loadFontAsync(f).catch(()=>{})));
}
async function PAGE(n){let p=n;while(p&&p.parent&&p.parent.type!=='DOCUMENT')p=p.parent;if(p&&p.type==='PAGE')await figma.setCurrentPageAsync(p)}
```

Instances come only from `NI` — never bare `createInstance()`. Steps 6 and 7 must measure the instance before the wrapper exists, so they use `NI(src)` then `ADOPT(wrapper,ci)`; everything between sits in `try{ ... }finally{SWEEP()}`. `SWEEP` removes registered instances still parented to a page and leaves adopted ones alone, so a throw mid-walk cannot strand an instance on the component's own page. Extraction scripts (Steps 1-3) write nothing and need no preamble. Step 4's template tiers correctly keep a bare `createInstance()` — they run before `_F` exists and instantiate the template, which T2's filter guarantees is never the target.

## Configuration

```
ANATOMY_TEMPLATE_KEY: ""
FONT_FAMILY: "Inter"
```

`ANATOMY_TEMPLATE_KEY` — component key of an "Anatomy" template from a published library (empty → Step 4 searches file, then builds scaffold). Reference: duplicate uSpec Template (https://www.figma.com/community/file/1603925462078533207/uspec-template), publish, select the "Anatomy" component, run:

```javascript
const n=figma.currentPage.selection[0];
if(!n||(n.type!=='COMPONENT'&&n.type!=='COMPONENT_SET'))return 'Select the Anatomy template component first, then run this again.';
return {name:n.name,key:n.key};
```

Paste key into `ANATOMY_TEMPLATE_KEY` (edit this file only on user request). `FONT_FAMILY` used only when building scaffold (Step 4 tier 3).

## Input Contract

Accepts `COMPONENT_SET`/`COMPONENT`/`INSTANCE` (or deep selection — Step 1 climbs). Instance → walks to main → owning set. Named layer supported when nothing valid selected. Else stop with: *"Select the component, component set, or instance you want annotated — or tell me its exact layer name — then ask again."* User context weaves into notes/brief; never replaces canvas facts.

## Workflow

```
- [ ] Step 1: Resolve selection + read property definitions. STOP if invalid.
- [ ] Step 2: Bounded structural walk (re-run if 3.0 picks richer variant)
- [ ] Step 3: Reason over data — validate, synthetics, bind, notes
- [ ] Step 4: Resolve template (key → local → scaffold)
- [ ] Step 5: Fill header + create composition section
- [ ] Step 6: Composition artwork + table
- [ ] Step 7: Per-sub-component sections + cross-refs
- [ ] Step 8: Screenshot validation
- [ ] Step 9: Select, zoom, summarize
```

### Step 1: Resolve selection + read property definitions

Replace `__NAMED_LAYER__` with `null` or `'Button'`:

```javascript
const NAMED_LAYER=__NAMED_LAYER__;
const VALID=['COMPONENT_SET','COMPONENT','INSTANCE'];
let node=null;
const sel=figma.currentPage.selection;
if(sel.length>0){
  node=sel.find(n=>VALID.includes(n.type))||null;
  if(!node){let w=sel[0];while(w&&w.type!=='PAGE'&&w.type!=='DOCUMENT'){if(VALID.includes(w.type)){node=w;break}w=w.parent}}
}
if(!node&&NAMED_LAYER){
  const nl=NAMED_LAYER.toLowerCase();
  const match=n=>VALID.includes(n.type)&&n.name.toLowerCase()===nl;
  node=figma.currentPage.findOne(match);
  if(!node){await figma.loadAllPagesAsync();node=figma.root.findOne(match)}
}
if(!node)return {error:'invalid-selection',selectedTypes:sel.map(n=>n.type+':'+n.name)};
if(node.type==='INSTANCE'){const mc=await node.getMainComponentAsync();if(!mc)return {error:'unresolved-instance',name:node.name};node=mc}
if(node.type==='COMPONENT'&&node.parent&&node.parent.type==='COMPONENT_SET')node=node.parent;
let _p=node;while(_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
const onCanvas=_p.type==='PAGE';
if(onCanvas)await figma.setCurrentPageAsync(_p);
const isComponentSet=node.type==='COMPONENT_SET';
let defs={};try{defs=node.componentPropertyDefinitions||{}}catch(e){defs={}}
const variantAxes={},variantAxesDefaults={},booleanDefs=[],swapDefs=[];
for(const [key,def] of Object.entries(defs)){
  if(def.type==='VARIANT'){variantAxes[key]=def.variantOptions||[];variantAxesDefaults[key]=def.defaultValue}
  else if(def.type==='BOOLEAN')booleanDefs.push({key,propName:key.split('#')[0],defaultValue:def.defaultValue});
  else if(def.type==='INSTANCE_SWAP')swapDefs.push({key,propName:key.split('#')[0],defaultComponentId:def.defaultValue,preferredValues:def.preferredValues||[],preferredComponents:[]});
}
function scanRefs(root,maxDepth){
  const found=[];
  function rec(n,d){
    const refs=n.componentPropertyReferences;
    if(refs){
      if(refs.visible)found.push({kind:'visible',rawKey:refs.visible,layerName:n.name,layerId:n.id});
      if(refs.mainComponent)found.push({kind:'mainComponent',rawKey:refs.mainComponent,layerName:n.name,layerId:n.id});
    }
    if('children' in n&&d<maxDepth)for(const c of n.children)rec(c,d+1);
  }
  rec(root,0);return found;
}
const variantsToScan=isComponentSet?node.children:[node];
let unresolved=booleanDefs.length+swapDefs.length;
for(const v of variantsToScan){
  if(unresolved<=0)break;
  for(const ref of scanRefs(v,8)){
    if(ref.kind==='visible'){const bd=booleanDefs.find(b=>b.key===ref.rawKey&&!b.associatedLayerId);if(bd){bd.associatedLayerName=ref.layerName;bd.associatedLayerId=ref.layerId;unresolved--}}
    else {const sd=swapDefs.find(s=>s.key===ref.rawKey&&!s.associatedLayerId);if(sd){sd.associatedLayerName=ref.layerName;sd.associatedLayerId=ref.layerId;unresolved--}}
  }
}
let localKeyMap=null;
async function getLocalKeyMap(){
  if(localKeyMap)return localKeyMap;
  await figma.loadAllPagesAsync();
  localKeyMap=new Map();
  for(const n of figma.root.findAll(n=>n.type==='COMPONENT'||n.type==='COMPONENT_SET'))if(n.key)localKeyMap.set(n.key,n);
  return localKeyMap;
}
function describeComp(n){
  const isSet=n.type==='COMPONENT_SET';
  const parentSet=(!isSet&&n.parent&&n.parent.type==='COMPONENT_SET')?n.parent:null;
  return {componentId:n.id,componentName:parentSet?parentSet.name:n.name,componentSetId:isSet?n.id:(parentSet?parentSet.id:null),isComponentSet:isSet};
}
for(const sd of swapDefs){
  for(const pv of sd.preferredValues){
    let resolved=null;
    try{resolved=pv.type==='COMPONENT_SET'?await figma.importComponentSetByKeyAsync(pv.key):await figma.importComponentByKeyAsync(pv.key)}
    catch(e){try{const map=await getLocalKeyMap();resolved=map.get(pv.key)||null}catch(e2){}}
    if(resolved)sd.preferredComponents.push(describeComp(resolved));
  }
  if(sd.preferredComponents.length===0&&sd.defaultComponentId){
    try{const dn=await figma.getNodeByIdAsync(String(sd.defaultComponentId));if(dn&&(dn.type==='COMPONENT'||dn.type==='COMPONENT_SET'))sd.preferredComponents.push(describeComp(dn))}catch(e){}
  }
}
const gb=node.absoluteBoundingBox||{};let gd='';try{gd=Object.keys(node.componentPropertyDefinitions||{}).sort().join(',')}catch(e){}
const guard={name:node.name,parentId:node.parent?node.parent.id:'',kids:('children' in node)?node.children.length:0,box:[Math.round(gb.x||0),Math.round(gb.y||0),Math.round(gb.width||0),Math.round(gb.height||0)],defs:gd};
return {compSetNodeId:node.id,componentName:node.name,isComponentSet,onCanvas,variantAxes,variantAxesDefaults,booleanDefs,swapDefs,guard};
```

`invalid-selection`/`unresolved-instance` → stop with Input Contract message. Save: `COMP_SET_ID`, `COMPONENT_NAME`, `IS_COMPONENT_SET`, `ON_CANVAS`, `GUARD` (verbatim, for Step 9), `VARIANT_AXES`+`VARIANT_AXES_DEFAULTS` (drives 3.0), `BOOLEAN_DEFS[]` (`key` raw for `setProperties`), `SWAP_DEFS[]` (`preferredComponents` via library import + local fallback).

### Step 2: Bounded structural walk

Supplies classification of chosen variant's direct children, richest variant, slot default children, wrapper visuals, instance-child identity/axes/booleans. Not recursive into instance internals.

**Sync warning:** single-child auto-layout / SLOT / background-rect traversal appears in three places (this walk, Step 6, Step 7) — keep in sync.

Replace `__COMP_SET_NODE_ID__`, `__PREFERRED_VARIANT_PROPS__` (`null` or `{"variant":"count-forward"}`):

```javascript
const TARGET_NODE_ID='__COMP_SET_NODE_ID__';
const PREFERRED_VARIANT_PROPS=__PREFERRED_VARIANT_PROPS__;
const STRUCTURAL_TYPES=['RECTANGLE','VECTOR','ELLIPSE','LINE','POLYGON','STAR','BOOLEAN_OPERATION'];
const node=await figma.getNodeByIdAsync(TARGET_NODE_ID);
if(!node||(node.type!=='COMPONENT_SET'&&node.type!=='COMPONENT'))return {error:'Node is not a component set or component. Type: '+(node?node.type:'null')};
let _p=node;while(_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
if(_p.type==='PAGE')await figma.setCurrentPageAsync(_p);
function hasVisuals(n){
  const f=n.fills&&n.fills.length>0&&n.fills.some(f=>f.visible!==false);
  const s=n.strokes&&n.strokes.length>0&&n.strokes.some(s=>s.visible!==false);
  const e=n.effects&&n.effects.length>0&&n.effects.some(e=>e.visible!==false);
  return {hasFills:!!f,hasStrokes:!!s,hasEffects:!!e,hasAny:!!f||!!s||!!e};
}
async function resolveInstanceInfo(inst){
  try{
    const mc=await inst.getMainComponentAsync();
    if(!mc)return null;
    const isSet=mc.parent&&mc.parent.type==='COMPONENT_SET';
    const cs=isSet?mc.parent:null;
    const info={mainComponentId:mc.id,mainComponentSetId:cs?cs.id:null,childIsComponentSet:!!cs,componentSetName:cs?cs.name:mc.name,childVariantCount:cs?cs.children.length:1,childVariantAxes:[],childBooleanDefs:[]};
    try{
      const src=cs?cs:mc;
      const csDefs=src.componentPropertyDefinitions||{};
      for(const [ck,cd] of Object.entries(csDefs)){
        if(cd.type==='VARIANT')info.childVariantAxes.push({name:ck.split('#')[0],options:cd.variantOptions||[],defaultValue:cd.defaultValue});
        else if(cd.type==='BOOLEAN')info.childBooleanDefs.push({rawKey:ck,propName:ck.split('#')[0],defaultValue:cd.defaultValue});
      }
    }catch(e){}
    return info;
  }catch(e){return null}
}
async function walkToInnerInstance(n,d){
  if(d>8)return null;
  if(n.type==='INSTANCE')return n;
  if((n.type==='FRAME'||n.type==='GROUP')&&'children' in n&&n.children.length===1)return walkToInnerInstance(n.children[0],d+1);
  return null;
}
async function extractElement(n,index,ax,ay){
  const absX=n.absoluteTransform[0][2],absY=n.absoluteTransform[1][2];
  const el={index,name:n.name,nodeId:n.id,nodeType:n.type,visible:n.visible,bbox:{x:Math.round(absX-ax),y:Math.round(absY-ay),w:Math.round(n.width),h:Math.round(n.height)},notes:'',shouldCreateSection:false};
  if(n.type==='INSTANCE'){
    const info=await resolveInstanceInfo(n);
    if(info){Object.assign(el,info);el.notes=info.componentSetName+' instance'}
    el.classification='instance';
  }else if(n.type==='TEXT'){
    el.classification='text';
    const c=n.characters||'';
    el.notes=(c.length>0&&c.length<=30)?'Text element — "'+c+'"':'Text element';
  }else if(n.type==='FRAME'||n.type==='GROUP'){
    const inner=await walkToInnerInstance(n,0);
    if(inner&&inner!==n){
      const info=await resolveInstanceInfo(inner);
      if(info){
        el.wrappedInstance=info;el.originalName=el.name;el.nodeType='INSTANCE';el.classification='instance-unwrapped';
        el.mainComponentId=info.mainComponentId;el.mainComponentSetId=info.mainComponentSetId;el.childIsComponentSet=info.childIsComponentSet;el.childVariantAxes=info.childVariantAxes;el.childVariantCount=info.childVariantCount;el.childBooleanDefs=info.childBooleanDefs;
        el.notes=el.name+' instance';
      }else{
        el.classification='container';
        const cc=('children' in n)?n.children.length:0;
        el.notes='Container with '+cc+' children';
      }
    }else if('children' in n&&n.children.length===1&&n.children[0].type==='TEXT'){
      const tc=n.children[0];
      el.originalName=el.name;el.nodeType='TEXT';el.classification='text';
      const c=tc.characters||'';
      el.notes=(c.length>0&&c.length<=30)?'Text element — "'+c+'"':'Text element';
    }else{
      const cc=('children' in n)?n.children.length:0;
      el.classification=cc>0?'container':'structural';
      el.notes=cc>0?'Container with '+cc+' children':'Empty container';
    }
  }else if(n.type==='SLOT'){
    el.classification='slot';
    const cc=('children' in n)?n.children.length:0;
    el.notes='Composable slot with '+cc+' children';
  }else if(STRUCTURAL_TYPES.includes(n.type)){el.classification='structural';el.notes=n.type}
  else {el.classification='structural';el.notes=n.type}
  return el;
}
const isComponentSet=node.type==='COMPONENT_SET';
function resolveChildContainer(v){
  let cc=v;
  while(cc.children.length===1&&cc.children[0].type==='FRAME'&&cc.children[0].layoutMode!=='NONE')cc=cc.children[0];
  if(cc.children.length===1&&cc.children[0].type==='SLOT')cc=cc.children[0];
  if(cc===v&&cc.children.length>1){
    const al=cc.children.filter(c=>c.type==='FRAME'&&c.layoutMode!=='NONE'&&('children' in c)&&c.children.length>=2);
    const so=cc.children.filter(c=>STRUCTURAL_TYPES.includes(c.type));
    if(al.length===1&&so.length===cc.children.length-1)cc=al[0];
  }
  return cc;
}
let variant;
if(PREFERRED_VARIANT_PROPS&&isComponentSet){
  variant=node.children.find(v=>{const p=v.variantProperties||{};return Object.entries(PREFERRED_VARIANT_PROPS).every(([k,val])=>p[k]===val)})||node.defaultVariant||node.children[0];
}else variant=isComponentSet?(node.defaultVariant||node.children[0]):node;
let cc=resolveChildContainer(variant);
if(isComponentSet&&cc.children.length===0&&node.children.length>1){
  function countDesc(n){let c=0;if('children' in n)for(const ch of n.children)c+=1+countDesc(ch);return c}
  let best=variant,bestCount=0;
  for(const v of node.children){const cnt=countDesc(v);if(cnt>bestCount){bestCount=cnt;best=v}}
  if(best!==variant){variant=best;cc=resolveChildContainer(variant)}
}
const varAbsX=variant.absoluteTransform[0][2],varAbsY=variant.absoluteTransform[1][2];
const rootVis=hasVisuals(variant);
const rootVariantVisuals={hasFills:rootVis.hasFills,hasStrokes:rootVis.hasStrokes,hasEffects:rootVis.hasEffects,cornerRadius:variant.cornerRadius||0};
const traversedFrames=[];
let walker=variant;
while(walker!==cc){
  if('children' in walker&&walker.children.length===1){
    const c=walker.children[0];const vis=hasVisuals(c);
    const cAX=c.absoluteTransform[0][2],cAY=c.absoluteTransform[1][2];
    traversedFrames.push({name:c.name,nodeType:c.type,hasFills:vis.hasFills,hasStrokes:vis.hasStrokes,hasEffects:vis.hasEffects,cornerRadius:c.cornerRadius||0,bbox:{x:Math.round(cAX-varAbsX),y:Math.round(cAY-varAbsY),w:Math.round(c.width),h:Math.round(c.height)}});
    walker=c;
  }else break;
}
const elements=[];
let idx=1;
for(const c of cc.children)elements.push(await extractElement(c,idx++,varAbsX,varAbsY));
for(const el of elements){
  if(el.classification==='instance'||el.classification==='instance-unwrapped'){
    el.shouldCreateSection=true;
    const UTIL=['spacer','divider','separator','divider line','gap','padding','filler'];
    if(UTIL.includes(el.name.toLowerCase()))el.shouldCreateSection=false;
  }
}
for(const el of elements){
  if(el.classification!=='slot')continue;
  const slotNode=cc.children[el.index-1];
  if(!slotNode)continue;
  const cpRefs=slotNode.componentPropertyReferences||{};
  if(cpRefs.visible)el.slotBooleanBinding={propName:cpRefs.visible.split('#')[0],rawKey:cpRefs.visible};
  if('children' in slotNode&&slotNode.children.length>0){
    el.slotDefaultChildren=[];
    for(const sc of slotNode.children){
      const scInfo={name:sc.name,nodeType:sc.type,visible:sc.visible};
      if(sc.type==='INSTANCE'){
        try{
          const mc=await sc.getMainComponentAsync();
          if(mc){
            scInfo.mainComponentId=mc.id;
            const isSet=mc.parent&&mc.parent.type==='COMPONENT_SET';
            scInfo.componentSetName=isSet?mc.parent.name:mc.name;
            scInfo.componentSetId=isSet?mc.parent.id:null;
            scInfo.isComponentSet=isSet;
          }
        }catch(e){}
      }
      el.slotDefaultChildren.push(scInfo);
    }
  }
}
return {componentName:node.name,variantName:variant.name,selectedVariantId:variant.id,compSetNodeId:TARGET_NODE_ID,isComponentSet,rootSize:{w:Math.round(variant.width),h:Math.round(variant.height)},elements,rootVariantVisuals,traversedFrames,childContainerIsVariant:cc===variant};
```

Save JSON. `selectedVariantId` may differ from default (preferred-variant re-walk or fallback to richest). Elements carry: `classification` (enum: `instance`/`instance-unwrapped`/`text`/`slot`/`container`/`structural`), `name` (live layer; for `instance-unwrapped`=wrapper, inner in `wrappedInstance.componentSetName`), `nodeId`, `wrappedInstance`, `originalName`, `shouldCreateSection`, `childBooleanDefs[]` (Step 7 unhide), `slotBooleanBinding`, `slotDefaultChildren[]`. Walk-level: `rootVariantVisuals`, `traversedFrames[]`, `childContainerIsVariant` (false → Step 3 synthetic).

### Step 3: Reason over data (no scripts, optional re-walk)

Produce enriched `elements` + `briefDescription`.

**3.0 Variant selection:** only when `IS_COMPONENT_SET` and `elements.length` 1–2 — inspect `VARIANT_AXES` for richer variant; re-run Step 2 with `PREFERRED_VARIANT_PROPS`. Additive names ("count-forward", "with-badge", "expanded"). Skip when default has 3+ elements/covers patterns, variants differ stylistically (color/size/theme/state), or no variants. Maximize distinct sub-component types.

**3.1 Validate:** every element has `classification` from enum; every `instance-unwrapped` has `wrappedInstance`+`originalName`+`nodeType==='INSTANCE'`; every `instance`/`instance-unwrapped` has `shouldCreateSection`.

**3.2 Insert synthetics** (`isSynthetic:true`):

1. **Root container (traversed):** if `childContainerIsVariant===false`, insert at index 1: `{isSynthetic:true, name:<comp name or "container">, nodeType:'FRAME', classification:'container', visible:true, bbox:{x:0,y:0,w:rootSize.w,h:rootSize.h}, shouldCreateSection:false}` + layout-role note.
2. **Root fills/effects:** if `rootVariantVisuals.hasFills||hasEffects` (strokes alone never trigger; describe as border in container note): fold into container synthetic; else standalone `"statelayer"` (overlay) or `"backplate"` (solid) `structural` full-size, semantic note.
3. **Traversed frames:** entries with fills/strokes/effects → `structural` synthetic using `name`+`bbox`.
4. **Re-index** sequentially.
5. **Root when `childContainerIsVariant===true`:** insert only when non-trivial role (hosts slots, boolean-gated children, mixed layout). Skip stack of always-visible same-kind sub-components.
6. **None:** true + no meaningful root + no visuals → skip.

**3.3 Bind properties:** For each `BOOLEAN_DEFS`, match by `associatedLayerId===nodeId` else `associatedLayerName` (fallback `key.split('#')[0]`) against `name`/`originalName` → `el.controlledByBoolean={propName, rawKey:key, defaultValue}` (`slotBooleanBinding` counts). Swaps same → `el.swapPropName`, `el.swapPreferredComponents`. Every hidden → `el.unhideStrategy={method:'boolean', booleanName, booleanRawKey}` if `controlledByBoolean` else `{method:'direct'}`. Exclusive booleans still both unhide, note exclusivity. Collect `BOOLEAN_UNHIDES=[{booleanRawKey}]` for boolean method (Step 6). Boolean matching element with no binding → flag in notes.

**3.4 Element roles** (notes express ROLE): Optional slot = `slot`/boolean-gated; Fixed sub-component = always-visible `instance`/`instance-unwrapped`; Content = `text`+icon instances; Structural/decorative = `structural`+synthetics (backgrounds, dividers, state layers, borders); Utility children (Spacer, Divider, Separator, Divider line, Gap, Padding, Filler; case-insensitive) → annotated, no child section, short note.

**3.5 Inline markers:** `inlineMarker:true` when bbox fully contained within another element's bbox (`el.bbox.x>=c.bbox.x && el.bbox.y>=c.bbox.y && el.bbox.x+el.bbox.w<=c.bbox.x+c.bbox.w && el.bbox.y+el.bbox.h<=c.bbox.y+c.bbox.h`). Exclude full-size synthetics from containment. Annotated slot default children always inline. Full-size synthetics never inline. Prefer perimeter on doubt.

**3.6 Enrich slots** per `slot`: (1) `el.slotPreferredComponentId` = first `slotDefaultChildren` instance's `componentSetId`/`mainComponentId`, else first `swapPreferredComponents[].componentId`. (2) Notes: purpose + accepted + preferred + toggle when `slotBooleanBinding`. (3) Hidden/empty AND preferred resolved → `el.populateSlot=true`, `el.populateWith={componentId:el.slotPreferredComponentId}`. (4) `populateSlot` true, or `slotDefaultChildren` points to a component set → `el.shouldCreateSection=true`.

**3.7 Dedup consecutive same-`mainComponentSetId`:** collapse into first with `count` (4 buttons → `count:4`); re-index. Table shows `(xN)`; Step 6 consumes `count` for alignment.

**3.8 Rewrite every note** (semantic, never generic):

- `instance`/`instance-unwrapped`: boolean → ``"{name} sub-component — optional, controlled by `{propName}` toggle"``; swap → ``"{name} sub-component — swappable via `{swapPropName}`"``; fixed → `"{name} sub-component — always present"`.
- `text`: ≤30 chars → `'"{content}" — {role}'`; longer → `"Primary label text"`; append boolean if any.
- Hidden: always name property → ``"{name} sub-component — hidden by default, shown via `{propName}` toggle"``; unresolved → `"{name} — hidden, no controlling property found"`.
- `slot`: purpose + accepted + preferred + toggle.
- `container`: layout purpose. `structural`: visual role. Synthetic root: layout mode + role + fills/strokes/corner radius folded; statelayer/backplate: visual role + radius.
- Repeated (`count>1`): count + pattern → `"Tab item — one per tab option (x5)"`.
- **User context:** usage → composition; behavior → controlling element; architecture → slot/container. Never standalone. **No cross-refs yet** — Step 7.

Never: "X instance", "Container with N children", "Composable slot with N children", raw node types. Examples: Label (fixed) → "Label sub-component — always present"; Leading Icon (hidden) → "Icon sub-component — hidden by default, shown via `leadingIcon` toggle"; Title slot → "Title slot — composable slot. Populated by default with a Title instance."; statelayer → "Statelayer — pressed/hovered state overlay, 12px corner radius".

**3.9 Brief description:** one sentence, ~15 words, what the component IS/does. Weave user context. Examples: "Compact count button used in section heading navigation"; "Composable section header with configurable leading, title, and trailing slots"; "Input field with label, helper text, and optional leading/trailing content". Bad: "Anatomy breakdown of...", just the name.

**3.10 Section eligibility:** direct `instance`/`instance-unwrapped` wrappers / slots with `slotPreferredComponentId` → `shouldCreateSection:true`. False for utility (3.4) + trivial. First element per `mainComponentSetId` only.

**3.11 Checklist:** richer-variant when 1–2 elements on a set; `classification` present + `instance-unwrapped` complete; hidden names property + `unhideStrategy`; no generic notes; synthetics per 3.2 + re-indexed + `count` set; `inlineMarker` per 3.5 + slots per 3.6; `briefDescription` composed; `BOOLEAN_UNHIDES` collected + `childBooleanDefs` ready; no cross-refs yet.

### Step 4: Resolve annotation template

Three tiers. Never pause. **T1 — configured key:** if `ANATOMY_TEMPLATE_KEY` non-empty, use in instantiation. Fail → T2. **T2 — search current file:**

```javascript
const TID='__COMP_SET_NODE_ID__';
function _in(n,id){let p=n;while(p){if(p.id===id)return true;p=p.parent}return false}
await figma.loadAllPagesAsync();
const tgt=await figma.getNodeByIdAsync(TID);
const candidates=figma.root.findAll(n=>(n.type==='COMPONENT'||n.type==='COMPONENT_SET')&&n.name.toLowerCase().includes('anatomy')&&!_in(n,TID)&&!(tgt&&_in(tgt,n.id)));
const usable=[];
for(const c of candidates){
  const probe=c.type==='COMPONENT_SET'?(c.defaultVariant||c.children[0]):c;
  if(!probe)continue;
  const ok=!!probe.findOne(n=>n.name==='#anatomy-section')&&!!probe.findOne(n=>n.name==='#annotation-table')&&!!probe.findOne(n=>n.name==='#marker-example');
  if(ok)usable.push({templateNodeId:probe.id,componentName:c.name,key:probe.key||null});
}
return {usable};
```

Structure check prevents matching unrelated "Anatomy" components; `__COMP_SET_NODE_ID__` excludes the documented component and anything inside it. `usable` non-empty → first `templateNodeId`.

**Instantiation (T1/T2).** Replace `__ANATOMY_TEMPLATE_KEY__`/`__LOCAL_TEMPLATE_ID__` (or `''`), `__COMP_SET_NODE_ID__`, `__COMPONENT_NAME__`:

```javascript
const ANATOMY_TEMPLATE_KEY='__ANATOMY_TEMPLATE_KEY__';
const LOCAL_TEMPLATE_ID='__LOCAL_TEMPLATE_ID__';
const COMP_NODE_ID='__COMP_SET_NODE_ID__';
const COMPONENT_NAME='__COMPONENT_NAME__';
const compNode=await figma.getNodeByIdAsync(COMP_NODE_ID);
let _p=compNode;while(_p&&_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
const onCanvas=_p&&_p.type==='PAGE';
if(onCanvas)await figma.setCurrentPageAsync(_p);
let templateComponent=null;
if(ANATOMY_TEMPLATE_KEY){try{templateComponent=await figma.importComponentByKeyAsync(ANATOMY_TEMPLATE_KEY)}catch(e){templateComponent=null}}
if(!templateComponent&&LOCAL_TEMPLATE_ID){const local=await figma.getNodeByIdAsync(LOCAL_TEMPLATE_ID);if(local&&local.type==='COMPONENT')templateComponent=local}
if(!templateComponent)return {error:'no-template'};
const instance=templateComponent.createInstance();
const frame=instance.detachInstance();
frame.name=COMPONENT_NAME+' Anatomy';
if(onCanvas){
  const cAbsX=compNode.absoluteTransform[0][2],cAbsY=compNode.absoluteTransform[1][2];
  frame.x=Math.round(cAbsX+compNode.width+200);frame.y=Math.round(cAbsY);
}else{const c=figma.viewport.center;frame.x=Math.round(c.x-frame.width/2);frame.y=Math.round(c.y-frame.height/2)}
figma.currentPage.selection=[frame];
figma.viewport.scrollAndZoomIntoView([frame]);
return {frameId:frame.id};
```

`no-template` → T3.

**T3 — build scaffold from scratch.** Must produce every layer Steps 5–7 target: `#comp-name-anatomy`, `#brief-component-description`, `#anatomy-section` (parent's parent = root frame), `#section-name`, `#optional-section-description`, `#preview`, `#annotation-table` with direct child `row` containing `#number`, `#indicator` (with `#instance`/`#text`/`#slot`/`#frame` icons), `#element-name`, `#notes`, root-level `#marker-example` containing TEXT node.

Replace `__FONT_FAMILY__`, `__COMP_SET_NODE_ID__`, `__COMPONENT_NAME__`:

```javascript
const FONT_FAMILY='__FONT_FAMILY__';
const COMP_NODE_ID='__COMP_SET_NODE_ID__';
const COMPONENT_NAME='__COMPONENT_NAME__';
const INK={r:0.102,g:0.102,b:0.122},MUTED={r:0.42,g:0.44,b:0.47},DIVIDER={r:0.898,g:0.898,b:0.898},SURFACE={r:0.969,g:0.969,b:0.973},MARKER_PINK={r:0.922,g:0,b:0.431},WHITE={r:1,g:1,b:1},INSTANCE_PURPLE={r:0.482,g:0.38,b:1},FRAME_GRAY={r:0.55,g:0.57,b:0.6};
function solid(c){return [{type:'SOLID',color:c}]}
async function pickFonts(family){
  const wanted=['Regular','Medium','Semi Bold','Bold'];
  const got={};
  for(const s of wanted){try{await figma.loadFontAsync({family,style:s});got[s]={family,style:s}}catch(e){}}
  if(!got['Regular']){for(const s of wanted){if(got[s])continue;try{await figma.loadFontAsync({family:'Inter',style:s});got[s]={family:'Inter',style:s}}catch(e){}}}
  if(!got['Regular'])throw new Error('Could not load "'+family+'" or Inter');
  got['Medium']=got['Medium']||got['Regular'];got['Semi Bold']=got['Semi Bold']||got['Medium'];got['Bold']=got['Bold']||got['Semi Bold'];
  return got;
}
const F=await pickFonts(FONT_FAMILY);
function mkText(chars,font,size,color){const t=figma.createText();t.fontName=font;t.characters=chars;t.fontSize=size;t.fills=solid(color);return t}
function autoFrame(name,dir,gap){const f=figma.createFrame();f.name=name;f.layoutMode=dir;f.primaryAxisSizingMode='AUTO';f.counterAxisSizingMode='AUTO';f.itemSpacing=gap;f.paddingTop=0;f.paddingRight=0;f.paddingBottom=0;f.paddingLeft=0;f.fills=[];return f}
function textField(name,placeholder,font,size,color){const f=autoFrame(name,'VERTICAL',0);f.appendChild(mkText(placeholder,font,size,color));return f}
function cell(name,w){const c=figma.createFrame();c.name=name;c.layoutMode='HORIZONTAL';c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='AUTO';c.counterAxisAlignItems='CENTER';c.itemSpacing=8;c.paddingTop=12;c.paddingBottom=12;c.paddingLeft=16;c.paddingRight=16;c.fills=[];c.resize(w,44);return c}
function tableRow(name){const r=figma.createFrame();r.name=name;r.layoutMode='HORIZONTAL';r.primaryAxisSizingMode='FIXED';r.counterAxisSizingMode='AUTO';r.itemSpacing=0;r.fills=[];r.strokes=solid(DIVIDER);r.strokeAlign='INSIDE';r.strokeWeight=1;r.strokeTopWeight=0;r.strokeRightWeight=0;r.strokeLeftWeight=0;r.strokeBottomWeight=1;return r}
const root=figma.createFrame();
root.name=COMPONENT_NAME+' Anatomy';
root.layoutMode='VERTICAL';root.primaryAxisSizingMode='AUTO';root.counterAxisSizingMode='AUTO';root.itemSpacing=48;
root.paddingTop=64;root.paddingRight=64;root.paddingBottom=64;root.paddingLeft=64;
root.fills=solid(WHITE);root.cornerRadius=16;
figma.currentPage.appendChild(root);
const header=autoFrame('#header','VERTICAL',12);
root.appendChild(header);
header.appendChild(textField('#comp-name-anatomy','Component name',F['Bold'],48,INK));
const briefField=textField('#brief-component-description','Brief description of the component.',F['Regular'],18,MUTED);
header.appendChild(briefField);
const briefText=briefField.findOne(n=>n.type==='TEXT');
briefText.textAutoResize='HEIGHT';briefText.resize(1200,24);
const sections=autoFrame('#sections','VERTICAL',64);
root.appendChild(sections);
const section=autoFrame('#anatomy-section','VERTICAL',24);
sections.appendChild(section);
section.appendChild(textField('#section-name','Section name',F['Semi Bold'],28,INK));
const sectionDescField=textField('#optional-section-description','Optional description of this section.',F['Regular'],16,MUTED);
section.appendChild(sectionDescField);
const sectionDescText=sectionDescField.findOne(n=>n.type==='TEXT');
sectionDescText.textAutoResize='HEIGHT';sectionDescText.resize(1200,22);
const preview=figma.createFrame();
preview.name='#preview';preview.layoutMode='HORIZONTAL';preview.primaryAxisSizingMode='AUTO';preview.counterAxisSizingMode='AUTO';
preview.itemSpacing=0;preview.fills=solid(SURFACE);preview.cornerRadius=12;preview.clipsContent=false;
section.appendChild(preview);
const table=figma.createFrame();
table.name='#annotation-table';table.layoutMode='VERTICAL';table.primaryAxisSizingMode='AUTO';table.counterAxisSizingMode='FIXED';
table.itemSpacing=0;table.fills=[];
section.appendChild(table);table.resize(1400,100);
const head=tableRow('header');
table.appendChild(head);head.layoutAlign='STRETCH';
const hNum=cell('h-number',64);head.appendChild(hNum);hNum.appendChild(mkText('#',F['Semi Bold'],12,MUTED));
const hType=cell('h-type',64);head.appendChild(hType);hType.appendChild(mkText('Type',F['Semi Bold'],12,MUTED));
const hName=cell('h-element',320);head.appendChild(hName);hName.appendChild(mkText('Element',F['Semi Bold'],12,MUTED));
const hNotes=cell('h-notes',200);head.appendChild(hNotes);hNotes.layoutGrow=1;hNotes.appendChild(mkText('Notes',F['Semi Bold'],12,MUTED));
const row=tableRow('row');
table.appendChild(row);row.layoutAlign='STRETCH';
const cNum=cell('#number',64);row.appendChild(cNum);cNum.primaryAxisAlignItems='CENTER';cNum.appendChild(mkText('1',F['Medium'],14,INK));
const cInd=cell('#indicator',64);row.appendChild(cInd);cInd.primaryAxisAlignItems='CENTER';
const instIcon=figma.createPolygon();instIcon.name='#instance';instIcon.pointCount=4;instIcon.resize(12,12);instIcon.fills=solid(INSTANCE_PURPLE);cInd.appendChild(instIcon);
const textIcon=mkText('T',F['Bold'],12,MUTED);textIcon.name='#text';cInd.appendChild(textIcon);textIcon.visible=false;
const slotIcon=figma.createRectangle();slotIcon.name='#slot';slotIcon.resize(12,12);slotIcon.fills=[];slotIcon.strokes=solid(INSTANCE_PURPLE);slotIcon.strokeWeight=1.5;slotIcon.dashPattern=[3,2];slotIcon.cornerRadius=3;cInd.appendChild(slotIcon);slotIcon.visible=false;
const frameIcon=figma.createRectangle();frameIcon.name='#frame';frameIcon.resize(12,12);frameIcon.fills=[];frameIcon.strokes=solid(FRAME_GRAY);frameIcon.strokeWeight=1.5;frameIcon.cornerRadius=2;cInd.appendChild(frameIcon);frameIcon.visible=false;
const cName=cell('#element-name',320);row.appendChild(cName);
const nameText=mkText('Element name',F['Medium'],14,INK);cName.appendChild(nameText);nameText.layoutGrow=1;nameText.textAutoResize='HEIGHT';
const cNotes=cell('#notes',200);row.appendChild(cNotes);cNotes.layoutGrow=1;
const notesText=mkText('Notes about this element.',F['Regular'],14,MUTED);cNotes.appendChild(notesText);notesText.layoutGrow=1;notesText.textAutoResize='HEIGHT';
const marker=figma.createFrame();
marker.name='#marker-example';marker.layoutMode='HORIZONTAL';marker.primaryAxisSizingMode='FIXED';marker.counterAxisSizingMode='FIXED';
marker.primaryAxisAlignItems='CENTER';marker.counterAxisAlignItems='CENTER';marker.resize(33,33);marker.cornerRadius=99;marker.fills=solid(MARKER_PINK);
marker.appendChild(mkText('1',F['Semi Bold'],14,WHITE));
root.appendChild(marker);
marker.layoutPositioning='ABSOLUTE';marker.x=Math.round(root.width-97);marker.y=24;
const compNode=await figma.getNodeByIdAsync(COMP_NODE_ID);
let _p=compNode;while(_p&&_p.parent&&_p.parent.type!=='DOCUMENT')_p=_p.parent;
if(_p&&_p.type==='PAGE'){
  if(_p!==figma.currentPage){await figma.setCurrentPageAsync(_p);_p.appendChild(root)}
  const cAbsX=compNode.absoluteTransform[0][2],cAbsY=compNode.absoluteTransform[1][2];
  root.x=Math.round(cAbsX+compNode.width+200);root.y=Math.round(cAbsY);
}else{const c=figma.viewport.center;root.x=Math.round(c.x-root.width/2);root.y=Math.round(c.y-root.height/2)}
figma.currentPage.selection=[root];
figma.viewport.scrollAndZoomIntoView([root]);
return {frameId:root.id};
```

Save `frameId` + tier used (for Step 9).

### Step 5: Fill header + create composition section

Clones `#anatomy-section` for composition, fills header, hides original. Replace `__FRAME_ID__`, `__COMPONENT_NAME__`, `__BRIEF_DESCRIPTION__`:

```javascript
const FRAME_ID='__FRAME_ID__';
const COMPONENT_NAME='__COMPONENT_NAME__';
const BRIEF_DESCRIPTION='__BRIEF_DESCRIPTION__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
await loadAllFonts(frame);
const compNameFrame=frame.findOne(n=>n.name==='#comp-name-anatomy');
if(compNameFrame){const t=compNameFrame.findOne(n=>n.type==='TEXT');if(t)t.characters=COMPONENT_NAME}
const descFrame=frame.findOne(n=>n.name==='#brief-component-description');
if(descFrame){const t=descFrame.findOne(n=>n.type==='TEXT');if(t)t.characters=BRIEF_DESCRIPTION}
const anatomySectionTemplate=frame.findOne(n=>n.name==='#anatomy-section');
const compositionSection=anatomySectionTemplate.clone();
SAFE(anatomySectionTemplate.parent).appendChild(compositionSection);
compositionSection.name='Component structure';compositionSection.visible=true;
const sf=compositionSection.findOne(n=>n.name==='#section-name');
if(sf){const t=sf.findOne(n=>n.type==='TEXT');if(t)t.characters='Component structure'}
const sdf=compositionSection.findOne(n=>n.name==='#optional-section-description');
if(sdf){const t=sdf.findOne(n=>n.type==='TEXT');if(t)t.characters='Elements that compose the '+COMPONENT_NAME+' and their key attributes.'}
anatomySectionTemplate.visible=false;
return {success:true,compositionSectionId:compositionSection.id};
```

Save `compositionSectionId`.

### Step 6: Composition artwork + table

Places live instance in `#preview`, applies boolean unhide, populates empty slots, draws outlines, places markers (perimeter with collision avoidance or inline stubs), fills `#annotation-table`.

Replace `__COMPOSITION_SECTION_ID__`, `__SELECTED_VARIANT_ID__`, `__ELEMENTS_JSON__` (with: `index`,`name`,`nodeType`,`classification`,`visible`,`bbox`,`notes` + optional: `count`,`isSynthetic`,`inlineMarker`,`unhideStrategy`,`populateSlot`,`populateWith`), `__BOOLEAN_UNHIDES_JSON__` (`[{booleanRawKey}]` or `[]`). Synthetics skipped in child-to-element alignment; `count>1` consumes that many children. Fonts loaded in phases: template, after `createInstance`, after `setProperties`, after slot population.

```javascript
const COMPOSITION_SECTION_ID='__COMPOSITION_SECTION_ID__';
const SELECTED_VARIANT_ID='__SELECTED_VARIANT_ID__';
const MARKER_COLOR={r:0.922,g:0,b:0.431};
const elements=__ELEMENTS_JSON__;
const BOOLEAN_UNHIDES=__BOOLEAN_UNHIDES_JSON__;
try{
const section=await figma.getNodeByIdAsync(COMPOSITION_SECTION_ID);
await PAGE(section);
const frame=section.parent.parent;
const preview=section.findOne(n=>n.name==='#preview');
const mex=frame.findOne(n=>n.name==='#marker-example');
const MS=33,MO=40,PADDING=80,MIN_W=1400,MIN_H=290,CG=8,IS=16;
const sv=await figma.getNodeByIdAsync(SELECTED_VARIANT_ID);
await PAGE(sv);
const ci=NI(sv);
await loadAllFonts(ci);
let rootW=Math.round(ci.width),rootH=Math.round(ci.height);
const PC=elements.filter(el=>!el.inlineMarker).length;
const mp=Math.ceil(PC/4)*(MS+CG);
const sr=MS+MO+PADDING+mp;
let neededW=rootW+2*sr,neededH=rootH+2*sr;
let AW=Math.max(MIN_W,Math.round(neededW)),AH=Math.max(MIN_H,Math.round(neededH));
const wrapper=figma.createFrame();
wrapper.name='Artwork wrapper';wrapper.layoutMode='NONE';wrapper.resize(AW,AH);wrapper.clipsContent=true;wrapper.fills=[];
SAFE(preview).appendChild(wrapper);
let compX=Math.round((AW-rootW)/2),compY=Math.round((AH-rootH)/2);
ADOPT(wrapper,ci);
ci.x=compX;ci.y=compY;
if(BOOLEAN_UNHIDES.length>0){
  const cp={};for(const bu of BOOLEAN_UNHIDES)cp[bu.booleanRawKey]=true;
  try{ci.setProperties(cp)}catch(e){}
  await loadAllFonts(ci);
}
for(const el of elements){
  if(!el.visible&&(!el.unhideStrategy||el.unhideStrategy.method==='direct')){
    function findAndUnhide(n,name){if(n.name===name&&!n.visible){n.visible=true;return true}if('children' in n)for(const c of n.children)if(findAndUnhide(c,name))return true;return false}
    findAndUnhide(ci,el.name);
  }
}
await loadAllFonts(ci);
await loadAllFonts(mex);
await loadAllFonts(section);
let instAbsX=ci.absoluteTransform[0][2],instAbsY=ci.absoluteTransform[1][2];
let cc=ci;
while(cc.children.length===1&&cc.children[0].type==='FRAME'&&cc.children[0].layoutMode!=='NONE')cc=cc.children[0];
if(cc.children.length===1&&cc.children[0].type==='SLOT')cc=cc.children[0];
if(cc===ci&&cc.children.length>1){
  const LS=['RECTANGLE','VECTOR','ELLIPSE','LINE','POLYGON','STAR','BOOLEAN_OPERATION'];
  const al=cc.children.filter(c=>c.type==='FRAME'&&c.layoutMode!=='NONE'&&('children' in c)&&c.children.length>=2);
  const so=cc.children.filter(c=>LS.includes(c.type));
  if(al.length===1&&so.length===cc.children.length-1)cc=al[0];
}
const pg=[];
let sci=0;
for(const el of elements){
  if(el.isSynthetic)continue;
  if(el.populateSlot&&el.populateWith){
    try{
      const prefNode=await figma.getNodeByIdAsync(el.populateWith.componentId);
      let prefComp=prefNode;
      if(prefComp&&prefComp.type==='COMPONENT_SET')prefComp=prefComp.defaultVariant||prefComp.children[0];
      if(prefComp&&prefComp.type==='COMPONENT'){
        let inserted=false;
        const slotNode=cc.children[sci];
        if(slotNode&&slotNode.type==='SLOT'){
          const inst=NI(prefComp);
          await loadAllFonts(inst);
          try{ADOPT(slotNode,inst);inserted=true}catch(e){}
        }
        if(!inserted)pg.push({el,prefComp});
      }
    }catch(e){}
  }
  sci+=(el.count||1);
}
rootW=Math.round(ci.width);rootH=Math.round(ci.height);
neededW=rootW+2*sr;neededH=rootH+2*sr;
AW=Math.max(MIN_W,Math.round(neededW));AH=Math.max(MIN_H,Math.round(neededH));
wrapper.resize(AW,AH);
compX=Math.round((AW-rootW)/2);compY=Math.round((AH-rootH)/2);
ci.x=compX;ci.y=compY;
instAbsX=ci.absoluteTransform[0][2];instAbsY=ci.absoluteTransform[1][2];
for(const el of elements){
  if(el.isSynthetic&&el.classification==='container')el.bbox={x:0,y:0,w:rootW,h:rootH};
  if(el.isSynthetic&&el.classification==='structural'&&el.bbox.x===0&&el.bbox.y===0){el.bbox.w=rootW;el.bbox.h=rootH}
}
let childIdx=0;
for(let i=0;i<elements.length;i++){
  const el=elements[i];
  if(el.isSynthetic)continue;
  const m=cc.children[childIdx];
  if(m){const absX=m.absoluteTransform[0][2],absY=m.absoluteTransform[1][2];el.bbox={x:Math.round(absX-instAbsX),y:Math.round(absY-instAbsY),w:Math.round(m.width),h:Math.round(m.height)}}
  childIdx+=(el.count||1);
}
for(const ghost of pg){
  try{
    const inst=NI(ghost.prefComp);
    await loadAllFonts(inst);
    ADOPT(wrapper,inst);
    inst.x=Math.round(compX+ghost.el.bbox.x+(ghost.el.bbox.w-inst.width)/2);
    inst.y=Math.round(compY+ghost.el.bbox.y+(ghost.el.bbox.h-inst.height)/2);
    inst.opacity=0.6;
  }catch(e){}
}
const LINE_WIDTH=1;
for(const el of elements){
  const o=figma.createRectangle();
  wrapper.appendChild(o);o.name='Outline '+el.index;
  o.x=Math.round(compX+el.bbox.x);o.y=Math.round(compY+el.bbox.y);
  o.resize(Math.max(1,el.bbox.w),Math.max(1,el.bbox.h));
  o.fills=[];o.strokes=[{type:'SOLID',color:MARKER_COLOR}];o.strokeWeight=1;o.dashPattern=[4,4];
}
function scoreSides(el,rW,rH){const pref={top:0,bottom:1,left:2,right:3};return [{side:'left',dist:el.bbox.x},{side:'top',dist:el.bbox.y},{side:'right',dist:rW-(el.bbox.x+el.bbox.w)},{side:'bottom',dist:rH-(el.bbox.y+el.bbox.h)}].sort((a,b)=>a.dist!==b.dist?a.dist-b.dist:pref[a.side]-pref[b.side])}
function markerPos(side,el,cX,cY,rW,rH,offset){
  const eCX=cX+el.bbox.x+el.bbox.w/2,eCY=cY+el.bbox.y+el.bbox.h/2;
  const eL=cX+el.bbox.x,eR=cX+el.bbox.x+el.bbox.w,eT=cY+el.bbox.y,eB=cY+el.bbox.y+el.bbox.h;
  const off=offset||0;
  if(side==='left')return {dotX:cX-MO-MS,dotY:eCY-MS/2+off,anchorX:eL,anchorY:eCY+off,markerEdgeX:cX-MO,markerEdgeY:eCY+off};
  if(side==='right')return {dotX:cX+rW+MO,dotY:eCY-MS/2+off,anchorX:eR,anchorY:eCY+off,markerEdgeX:cX+rW+MO,markerEdgeY:eCY+off};
  if(side==='top')return {dotX:eCX-MS/2+off,dotY:cY-MO-MS,anchorX:eCX+off,anchorY:eT,markerEdgeX:eCX+off,markerEdgeY:cY-MO};
  return {dotX:eCX-MS/2+off,dotY:eB+MO,anchorX:eCX+off,anchorY:eB,markerEdgeX:eCX+off,markerEdgeY:eB+MO};
}
function overlapsPlaced(dX,dY,placed){for(const p of placed)if(Math.abs(dX-p.x)<MS+CG&&Math.abs(dY-p.y)<MS+CG)return true;return false}
function inBounds(dX,dY,aw,ah){return dX>=-MS&&dY>=-MS&&dX<=aw&&dY<=ah}
const placed=[];
function drawLine(wr,x1,y1,x2,y2,nm){
  if(Math.abs(x1-x2)<1&&Math.abs(y1-y2)<1)return;
  const s=figma.createRectangle();
  wr.appendChild(s);s.name=nm;s.fills=[{type:'SOLID',color:MARKER_COLOR}];
  if(Math.abs(x1-x2)<1){s.x=Math.round(x1-LINE_WIDTH/2);s.y=Math.round(Math.min(y1,y2));s.resize(LINE_WIDTH,Math.max(1,Math.abs(y2-y1)))}
  else{s.x=Math.round(Math.min(x1,x2));s.y=Math.round(y1-LINE_WIDTH/2);s.resize(Math.max(1,Math.abs(x2-x1)),LINE_WIDTH)}
}
for(const el of elements){
  const elCX=compX+el.bbox.x+el.bbox.w/2,elCY=compY+el.bbox.y+el.bbox.h/2;
  const dot=mex.clone();
  wrapper.appendChild(dot);dot.name='Marker '+el.index;dot.visible=true;
  const nt=dot.findOne(n=>n.type==='TEXT');if(nt)nt.characters=String(el.index);
  if(el.inlineMarker){
    const eL=compX+el.bbox.x,eR=eL+el.bbox.w,eT=compY+el.bbox.y,eB=eT+el.bbox.h;
    const best=scoreSides(el,rootW,rootH)[0].side;
    const M=({left:[eL-MS-4,elCY-MS/2,eL-4,elCY,eL+IS,elCY],right:[eR+4,elCY-MS/2,eR+4,elCY,eR-IS,elCY],top:[elCX-MS/2,eT-MS-4,elCX,eT-4,elCX,eT+IS],bottom:[elCX-MS/2,eB+4,elCX,eB+4,elCX,eB-IS]})[best];
    dot.x=Math.round(M[0]);dot.y=Math.round(M[1]);
    drawLine(wrapper,M[2],M[3],M[4],M[5],'Stub '+el.index);
    continue;
  }
  const ranked=scoreSides(el,rootW,rootH);
  let fDX,fDY,fS,fO=0,found=false;
  outer:for(let off=0;off<=PC*(MS+CG);off+=MS+CG){
    for(const {side} of ranked){
      for(const sign of (off===0?[0]:[1,-1])){
        const po=off*sign,p=markerPos(side,el,compX,compY,rootW,rootH,po);
        if(inBounds(p.dotX,p.dotY,AW,AH)&&!overlapsPlaced(p.dotX,p.dotY,placed)){fDX=p.dotX;fDY=p.dotY;fS=side;fO=po;found=true;break outer}
      }
    }
  }
  if(!found){const p=markerPos(ranked[0].side,el,compX,compY,rootW,rootH,0);fDX=p.dotX;fDY=p.dotY;fS=ranked[0].side;fO=0}
  placed.push({x:fDX,y:fDY});
  dot.x=Math.round(fDX);dot.y=Math.round(fDY);
  const p=markerPos(fS,el,compX,compY,rootW,rootH,fO);
  drawLine(wrapper,p.markerEdgeX,p.markerEdgeY,p.anchorX,p.anchorY,'Line '+el.index);
}
mex.visible=false;
const at=section.findOne(n=>n.name==='#annotation-table');
const rows=at.children.filter(c=>c.name==='row');
const rt=rows[rows.length-1];
for(const el of elements){
  const row=rt.clone();
  at.appendChild(row);row.name='Row '+el.index;
  const nc=row.findOne(n=>n.name==='#number');
  if(nc){const t=nc.findOne(n=>n.type==='TEXT');if(t)t.characters=String(el.index)}
  const ind=row.findOne(n=>n.name==='#indicator');
  if(ind){
    const icons={INSTANCE:'#instance',TEXT:'#text',SLOT:'#slot',FRAME:'#frame',GROUP:'#frame'};
    const want=(el.classification==='slot')?'#slot':icons[el.nodeType]||null;
    for(const nm of ['#instance','#text','#slot','#frame']){const ic=ind.findOne(n=>n.name===nm);if(ic)ic.visible=(nm===want)}
  }
  const nmc=row.findOne(n=>n.name==='#element-name');
  if(nmc){const t=nmc.findOne(n=>n.type==='TEXT');if(t){const h=el.visible?'':' (hidden)';const cs=el.count>1?' (x'+el.count+')':'';t.characters=el.name+cs+h}}
  const nc2=row.findOne(n=>n.name==='#notes');
  if(nc2){const t=nc2.findOne(n=>n.type==='TEXT');if(t)t.characters=el.notes||el.nodeType}
}
rt.remove();
return {success:true,markerCount:elements.length};
}finally{SWEEP()}
```

### Step 7: Per-sub-component sections

For each `shouldCreateSection:true` — direct instances, instance-unwrapped wrappers, slots with `slotPreferredComponentId`. Skip entirely if none. Dedup by `mainComponentSetId` (first only). Slot: skip if `slotPreferredComponentId` matches direct child already sectioned. `<=1` guard inside script is safety net.

Per eligible child: `__FRAME_ID__` (Step 4); `__CHILD_NAME__` (element `name`, wrapper's for `instance-unwrapped`); `__CHILD_COMP_ID__` (direct: `mainComponentSetId` if `childIsComponentSet` else `mainComponentId`; wrapper: same from `wrappedInstance`; slot: `slotPreferredComponentId`); `__CHILD_BOOLEAN_PROPS_JSON__` (`childBooleanDefs` as `[{"rawKey":"..."}]` or `[]`).

```javascript
const FRAME_ID='__FRAME_ID__';
const CHILD_NAME='__CHILD_NAME__';
const CHILD_COMP_ID='__CHILD_COMP_ID__';
const MARKER_COLOR={r:0.922,g:0,b:0.431};
const CHILD_BOOLEAN_PROPS=__CHILD_BOOLEAN_PROPS_JSON__;
try{
const frame=await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
const anatomySectionTemplate=frame.findOne(n=>n.name==='#anatomy-section');
const mex=frame.findOne(n=>n.name==='#marker-example');
const childSection=anatomySectionTemplate.clone();
SAFE(anatomySectionTemplate.parent).appendChild(childSection);
childSection.name=CHILD_NAME+' anatomy';childSection.visible=true;
await loadAllFonts(mex);await loadAllFonts(childSection);
const sf=childSection.findOne(n=>n.name==='#section-name');
if(sf){const t=sf.findOne(n=>n.type==='TEXT');if(t)t.characters=CHILD_NAME+' anatomy'}
const sdf=childSection.findOne(n=>n.name==='#optional-section-description');
if(sdf){const t=sdf.findOne(n=>n.type==='TEXT');if(t)t.characters='Internal elements of the '+CHILD_NAME+' sub-component.'}
const ccn=await figma.getNodeByIdAsync(CHILD_COMP_ID);
await PAGE(ccn);
function directUnhide(n){if(!n.visible)n.visible=true;if('children' in n)for(const c of n.children)directUnhide(c)}
let svr=(ccn.type==='COMPONENT_SET')?(ccn.defaultVariant||ccn.children[0]):ccn;
if(ccn.type==='COMPONENT_SET'&&ccn.children.length>1){
  const defC=svr.children?svr.children.length:0;
  if(defC<=1){let best=svr,bestC=defC;for(const v of ccn.children){const cnt=v.children?v.children.length:0;if(cnt>bestC){bestC=cnt;best=v}}if(bestC>defC)svr=best}
}
const ci=NI(svr);
await loadAllFonts(ci);
if(CHILD_BOOLEAN_PROPS.length>0){
  const bp={};for(const b of CHILD_BOOLEAN_PROPS)bp[b.rawKey]=true;
  try{ci.setProperties(bp)}catch(e){}
  await loadAllFonts(ci);
}
directUnhide(ci);
await loadAllFonts(ci);
let gcc=ci;
while(gcc.children.length===1&&gcc.children[0].type==='FRAME'&&gcc.children[0].layoutMode!=='NONE')gcc=gcc.children[0];
if(gcc.children.length===1&&gcc.children[0].type==='SLOT')gcc=gcc.children[0];
if(gcc===ci&&gcc.children.length>1){
  const LS=['RECTANGLE','VECTOR','ELLIPSE','LINE','POLYGON','STAR','BOOLEAN_OPERATION'];
  const al=gcc.children.filter(c=>c.type==='FRAME'&&c.layoutMode!=='NONE'&&('children' in c)&&c.children.length>=2);
  const so=gcc.children.filter(c=>LS.includes(c.type));
  if(al.length===1&&so.length===gcc.children.length-1)gcc=al[0];
}
const LEAF_TYPES=['TEXT','INSTANCE','VECTOR','RECTANGLE','ELLIPSE','LINE','POLYGON','STAR','BOOLEAN_OPERATION'];
function resolveLeafElements(n,d,max,pv){
  const v=pv&&n.visible;
  if(LEAF_TYPES.includes(n.type))return [{node:n,name:n.name,visible:v}];
  if(('children' in n)&&n.children.length>0&&d<max){
    const leaves=[];
    for(const c of n.children){const r=resolveLeafElements(c,d+1,max,v);if(r.length===1&&n.children.length===1)r[0].name=n.name;leaves.push(...r)}
    return leaves;
  }
  return [{node:n,name:n.name,visible:v}];
}
const rawLeaves=[];
for(const gc of gcc.children)rawLeaves.push(...resolveLeafElements(gc,0,4,true));
const gcElements=[];
let gcIdx=1;
for(const leaf of rawLeaves){
  const gc=leaf.node;
  const el={index:gcIdx++,name:leaf.name,nodeType:gc.type,visible:leaf.visible,nodeRef:gc,bbox:{x:0,y:0,w:Math.round(gc.width),h:Math.round(gc.height)},notes:''};
  if(gc.type==='INSTANCE'){
    try{const mc=await gc.getMainComponentAsync();if(mc){const csName=(mc.parent&&mc.parent.type==='COMPONENT_SET')?mc.parent.name:mc.name;el.notes=csName+' instance';el.resolvedCompKey=(mc.parent&&mc.parent.type==='COMPONENT_SET')?mc.parent.id:mc.id}}catch(e){el.notes='Instance'}
  }else if(gc.type==='TEXT'){const c=gc.characters||'';el.notes=(c.length>0&&c.length<=30)?'Text element — "'+c+'"':'Text element'}
  else if(gc.type==='FRAME'||gc.type==='GROUP'){const cc=('children' in gc)?gc.children.length:0;el.notes=cc>0?'Contains '+cc+' elements':'Empty container'}
  else if(['VECTOR','RECTANGLE','ELLIPSE','LINE','POLYGON','STAR','BOOLEAN_OPERATION'].includes(gc.type))el.notes='Illustration';
  gcElements.push(el);
}
const grouped=[];
for(const el of gcElements){
  const key=el.resolvedCompKey||el.name;
  const prev=grouped[grouped.length-1];
  const pk=prev?(prev.resolvedCompKey||prev.name):null;
  if(prev&&prev.name===el.name&&prev.nodeType===el.nodeType&&pk===key)prev.count=(prev.count||1)+1;
  else{el.count=1;grouped.push(el)}
}
let reIdx=1;for(const el of grouped)el.index=reIdx++;
const ge=grouped;
if(ge.length<=1){
  childSection.remove();ci.remove();
  return {success:true,skipped:true,childName:CHILD_NAME,elementCount:ge.length,rawLeafCount:gcElements.length,reason:'Sub-component has 1 or fewer unique element groups - section not needed'};
}
const preview=childSection.findOne(n=>n.name==='#preview');
const MS=33,MO=40,PADDING=80,MIN_W=1400,MIN_H=290,CG=8,IS=16;
const rootW=Math.round(ci.width),rootH=Math.round(ci.height);
const PC=ge.filter(el=>!el.inlineMarker).length;
const mp=Math.ceil(PC/4)*(MS+CG);
const sr=MS+MO+PADDING+mp;
const neededW=rootW+2*sr,neededH=rootH+2*sr;
const AW=Math.max(MIN_W,Math.round(neededW)),AH=Math.max(MIN_H,Math.round(neededH));
const wrapper=figma.createFrame();
wrapper.name='Artwork wrapper';wrapper.layoutMode='NONE';wrapper.resize(AW,AH);wrapper.clipsContent=true;wrapper.fills=[];
SAFE(preview).appendChild(wrapper);
const compX=Math.round((AW-rootW)/2),compY=Math.round((AH-rootH)/2);
ADOPT(wrapper,ci);
ci.x=compX;ci.y=compY;
const instAbsX=ci.absoluteTransform[0][2],instAbsY=ci.absoluteTransform[1][2];
for(const el of ge){
  const n=el.nodeRef;
  if(n&&n.absoluteTransform){const absX=n.absoluteTransform[0][2],absY=n.absoluteTransform[1][2];el.bbox={x:Math.round(absX-instAbsX),y:Math.round(absY-instAbsY),w:Math.round(n.width),h:Math.round(n.height)}}
}
const LINE_WIDTH=1;
function scoreSides(el,rW,rH){const pref={top:0,bottom:1,left:2,right:3};return [{side:'left',dist:el.bbox.x},{side:'top',dist:el.bbox.y},{side:'right',dist:rW-(el.bbox.x+el.bbox.w)},{side:'bottom',dist:rH-(el.bbox.y+el.bbox.h)}].sort((a,b)=>a.dist!==b.dist?a.dist-b.dist:pref[a.side]-pref[b.side])}
function markerPos(side,el,cX,cY,rW,rH,offset){
  const eCX=cX+el.bbox.x+el.bbox.w/2,eCY=cY+el.bbox.y+el.bbox.h/2;
  const eL=cX+el.bbox.x,eR=cX+el.bbox.x+el.bbox.w,eT=cY+el.bbox.y,eB=cY+el.bbox.y+el.bbox.h;
  const off=offset||0;
  if(side==='left')return {dotX:cX-MO-MS,dotY:eCY-MS/2+off,anchorX:eL,anchorY:eCY+off,markerEdgeX:cX-MO,markerEdgeY:eCY+off};
  if(side==='right')return {dotX:cX+rW+MO,dotY:eCY-MS/2+off,anchorX:eR,anchorY:eCY+off,markerEdgeX:cX+rW+MO,markerEdgeY:eCY+off};
  if(side==='top')return {dotX:eCX-MS/2+off,dotY:cY-MO-MS,anchorX:eCX+off,anchorY:eT,markerEdgeX:eCX+off,markerEdgeY:cY-MO};
  return {dotX:eCX-MS/2+off,dotY:eB+MO,anchorX:eCX+off,anchorY:eB,markerEdgeX:eCX+off,markerEdgeY:eB+MO};
}
function overlapsPlaced(dX,dY,placed){for(const p of placed)if(Math.abs(dX-p.x)<MS+CG&&Math.abs(dY-p.y)<MS+CG)return true;return false}
function inBounds(dX,dY,aw,ah){return dX>=-MS&&dY>=-MS&&dX<=aw&&dY<=ah}
const placed=[];
function drawLine(wr,x1,y1,x2,y2,nm){
  if(Math.abs(x1-x2)<1&&Math.abs(y1-y2)<1)return;
  const s=figma.createRectangle();
  wr.appendChild(s);s.name=nm;s.fills=[{type:'SOLID',color:MARKER_COLOR}];
  if(Math.abs(x1-x2)<1){s.x=Math.round(x1-LINE_WIDTH/2);s.y=Math.round(Math.min(y1,y2));s.resize(LINE_WIDTH,Math.max(1,Math.abs(y2-y1)))}
  else{s.x=Math.round(Math.min(x1,x2));s.y=Math.round(y1-LINE_WIDTH/2);s.resize(Math.max(1,Math.abs(x2-x1)),LINE_WIDTH)}
}
for(const el of ge){
  const o=figma.createRectangle();
  wrapper.appendChild(o);o.name='Outline '+el.index;
  o.x=Math.round(compX+el.bbox.x);o.y=Math.round(compY+el.bbox.y);
  o.resize(Math.max(1,el.bbox.w),Math.max(1,el.bbox.h));
  o.fills=[];o.strokes=[{type:'SOLID',color:MARKER_COLOR}];o.strokeWeight=1;o.dashPattern=[4,4];
}
for(const el of ge){
  const elCX=compX+el.bbox.x+el.bbox.w/2,elCY=compY+el.bbox.y+el.bbox.h/2;
  const dot=mex.clone();
  wrapper.appendChild(dot);dot.visible=true;dot.name='Marker '+el.index;
  const nt=dot.findOne(n=>n.type==='TEXT');if(nt)nt.characters=String(el.index);
  if(el.inlineMarker){
    const eL=compX+el.bbox.x,eR=eL+el.bbox.w,eT=compY+el.bbox.y,eB=eT+el.bbox.h;
    const best=scoreSides(el,rootW,rootH)[0].side;
    const M=({left:[eL-MS-4,elCY-MS/2,eL-4,elCY,eL+IS,elCY],right:[eR+4,elCY-MS/2,eR+4,elCY,eR-IS,elCY],top:[elCX-MS/2,eT-MS-4,elCX,eT-4,elCX,eT+IS],bottom:[elCX-MS/2,eB+4,elCX,eB+4,elCX,eB-IS]})[best];
    dot.x=Math.round(M[0]);dot.y=Math.round(M[1]);
    drawLine(wrapper,M[2],M[3],M[4],M[5],'Stub '+el.index);
    continue;
  }
  const ranked=scoreSides(el,rootW,rootH);
  let fDX,fDY,fS,fO=0,found=false;
  outer:for(let off=0;off<=PC*(MS+CG);off+=MS+CG){
    for(const {side} of ranked){
      for(const sign of (off===0?[0]:[1,-1])){
        const po=off*sign,p=markerPos(side,el,compX,compY,rootW,rootH,po);
        if(inBounds(p.dotX,p.dotY,AW,AH)&&!overlapsPlaced(p.dotX,p.dotY,placed)){fDX=p.dotX;fDY=p.dotY;fS=side;fO=po;found=true;break outer}
      }
    }
  }
  if(!found){const p=markerPos(ranked[0].side,el,compX,compY,rootW,rootH,0);fDX=p.dotX;fDY=p.dotY;fS=ranked[0].side;fO=0}
  placed.push({x:fDX,y:fDY});
  dot.x=Math.round(fDX);dot.y=Math.round(fDY);
  const p=markerPos(fS,el,compX,compY,rootW,rootH,fO);
  drawLine(wrapper,p.markerEdgeX,p.markerEdgeY,p.anchorX,p.anchorY,'Line '+el.index);
}
const at=childSection.findOne(n=>n.name==='#annotation-table');
const rows=at.children.filter(c=>c.name==='row');
const rt=rows[rows.length-1];
for(const el of ge){
  const row=rt.clone();
  at.appendChild(row);row.name='Row '+el.index;
  const nc=row.findOne(n=>n.name==='#number');
  if(nc){const t=nc.findOne(n=>n.type==='TEXT');if(t)t.characters=String(el.index)}
  const ind=row.findOne(n=>n.name==='#indicator');
  if(ind){
    const icons={INSTANCE:'#instance',TEXT:'#text',SLOT:'#slot',FRAME:'#frame',GROUP:'#frame'};
    const want=icons[el.nodeType]||null;
    for(const nm of ['#instance','#text','#slot','#frame']){const ic=ind.findOne(n=>n.name===nm);if(ic)ic.visible=(nm===want)}
  }
  const nmc=row.findOne(n=>n.name==='#element-name');
  if(nmc){const t=nmc.findOne(n=>n.type==='TEXT');if(t){const h=el.visible?'':' (hidden)';const cs=el.count>1?' (x'+el.count+')':'';t.characters=el.name+cs+h}}
  const nc2=row.findOne(n=>n.name==='#notes');
  if(nc2){const t=nc2.findOne(n=>n.type==='TEXT');if(t)t.characters=el.notes||el.nodeType}
}
rt.remove();
return {success:true,childSectionId:childSection.id,childName:CHILD_NAME,elementCount:ge.length,groupedElements:ge.map(el=>({index:el.index,name:el.name,nodeType:el.nodeType,visible:el.visible,notes:el.notes,count:el.count}))};
}finally{SWEEP()}
```

Save `childSectionId` + `groupedElements`. Note `skipped:true` children.

**Enrich per-child notes:** script writes generic ("Label instance"). Rewrite each grouped `notes` per 3.8 (`count>1` → "Star sub-component — rating indicator (5 instances)"). Push via notes-update (`__SECTION_ID__`=`childSectionId`, `__UPDATED_NOTES_JSON__`=`[{"index":1,"notes":"..."},...]`):

```javascript
const SECTION_ID='__SECTION_ID__';
const UPDATED_NOTES=__UPDATED_NOTES_JSON__;
const section=await figma.getNodeByIdAsync(SECTION_ID);
await PAGE(section);
const at=section.findOne(n=>n.name==='#annotation-table');
const rows=at.children.filter(c=>c.name.startsWith('Row '));
await loadAllFonts(at);
for(const u of UPDATED_NOTES){
  const row=rows.find(r=>r.name==='Row '+u.index);
  if(!row)continue;
  const nc=row.findOne(n=>n.name==='#notes');
  if(nc){const t=nc.findOne(n=>n.type==='TEXT');if(t)t.characters=u.notes}
}
return {success:true,updated:UPDATED_NOTES.length};
```

**Cross-references (after ALL child sections):** for each composition element whose section was created (`shouldCreateSection:true` AND not `skipped:true`), append `" — See {childName} anatomy section"`. Push via same script with `__SECTION_ID__`=`compositionSectionId`.

### Step 8: Screenshot self-validation

Screenshot `frameId`, verify: every element has pink dashed outline, markers aligned, lines touch edges; numbers match rows, numbering restarts per section; 4 columns filled, no placeholder text ("Element name", "Notes about this element.", "Section name"); icons diamond=instance/T=text/dashed square=slot/outline square=frame, none for structural; hidden shows "(hidden)"; grouped shows "(xN)"; each eligible child has section, no section for ineligible; no overlapping markers/text, markers within artwork; `#anatomy-section` template + `#marker-example` hidden. Fix with small scripts, up to 3 iterations.

### Step 9: Select, zoom, summarize

Replace `__FRAME_ID__`:

Also replace `__COMP_SET_NODE_ID__` and `__GUARD_JSON__` (Step 1's `guard`, verbatim). The second half re-reads the source and proves it is untouched:

```javascript
const FRAME_ID='__FRAME_ID__';
const frame=await figma.getNodeByIdAsync(FRAME_ID);
await PAGE(frame);
figma.currentPage.selection=[frame];
figma.viewport.scrollAndZoomIntoView([frame]);
const t=await figma.getNodeByIdAsync('__COMP_SET_NODE_ID__'),B=__GUARD_JSON__,ch=[];
if(!t)ch.push('source missing');
else{const gb=t.absoluteBoundingBox||{};let gd='';try{gd=Object.keys(t.componentPropertyDefinitions||{}).sort().join(',')}catch(e){}
const a={name:t.name,parentId:t.parent?t.parent.id:'',kids:('children' in t)?t.children.length:0,box:[Math.round(gb.x||0),Math.round(gb.y||0),Math.round(gb.width||0),Math.round(gb.height||0)],defs:gd};
for(const k in B)if(String(a[k])!==String(B[k]))ch.push(k)}
return {done:true,frameName:frame.name,pageName:figma.currentPage.name,intact:ch.length===0,changed:ch};
```

`intact:false` is a failure, not a footnote: name what changed, tell the user to undo (Cmd+Z) before trusting the annotation, and don't report success. `intact:true` needs no mention.

Summarize: component + variant, sections rendered, marker counts, skipped children + reason (utility/single-element/duplicate set), template resolution (imported/found/scaffold), placement. If scaffold: mention template key can be saved in Configuration.

## Hard Rules

- Composition = direct children (+ synthetics); internals = child sections.
- No child sections for utility children or duplicate component sets.
- No generic notes.
- No cross-refs before Step 7 completes.
- No re-walk for stylistic variants.
- Don't modify user's component/set/properties — see Read-only invariant; the guard preamble enforces it and Step 9 verifies it.
- Don't rename/unhide/repurpose `#anatomy-section` or `#marker-example` beyond clone-then-hide.
- Don't pause; don't edit this file during a run (Configuration only on user request).
- Don't merge sections into one script; don't fabricate element data.

---

Adapted from uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license.

---

*Адаптировано из uSpec (https://github.com/redongreen/uSpec) by Ian Guisard, MIT license — скилл Figma Community `create-anatomy`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/annotate).*

