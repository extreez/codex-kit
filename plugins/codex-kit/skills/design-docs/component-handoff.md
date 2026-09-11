> Часть скилла design-docs (см. SKILL.md для роутинга и предупреждения о CONFLICTS.md). Оригинал ниже не переведён — сохраняем формулировки/числа/таблицы дословно.

# Component Handoff · v4

Created by **Mauro Berteri**. Builds a dev-handoff-ready documentation frame from a single selected
`COMPONENT` or `COMPONENT_SET`, in one of 3 styles (Minimal / Brutalist / Card). Output is real, editable
Figma nodes.

Load `/figma-use` before every `use_figma` call.

## Why v4 has no external template file

v2 tried `importComponentByKeyAsync` (needs library access — breaks outside the owning account). v3 tried
reading a shared template file live via `get_metadata`/`get_design_context` on every run (no library
needed, but still needs **file-sharing** access, and — the actual reason it failed for a colleague on a
different account — Figma's MCP server caps **Starter/View/Collab seats at 6 tool calls per month**; this
skill needs 20–35 calls per run, so anyone without a Dev/Full seat on a paid plan hit the ceiling
immediately regardless of file permissions).

**v4 bakes every value directly into this file instead.** Nothing here is invented — every number, color,
and font below was verified pixel-for-pixel against the 3 original templates (`QqQiXQKzlTbJe3bPXVg2MP`,
node ids `51:2`/`51:3`/`51:4`) by building each section with `use_figma` and comparing `screenshot()`
output side-by-side against the template's own render, correcting drift until they matched. `use_figma`
only writes to the person's own file, so it isn't subject to any external-file quota — this is what makes
v4 work for literally anyone, on any Figma plan, in any organization.

**Trade-off:** if the source templates change later, this file won't know. Re-verify by hand (screenshot
diff, the same way this was built) and edit the tables below — never let an agent "re-derive" values from
a screenshot on its own; that reintroduces the exact drift this file exists to prevent.

**Banned, always:** `importComponentByKeyAsync`, `importComponentSetByKeyAsync`, reading any file other
than the one the person is working in, guessing a value not in the tables below.

## Shared structure (identical across all 3 styles)

Every style has the same **9 sections**, always in this order, always all 9 (see Step 5 for trimming rows
*inside* a section — never skip a whole section):

1. Header (component name, description, owner/library/version)
2. Preview
3. Variant Grid — one row per relevant type/variant axis, with the S·Light/M·Light/S·Dark/M·Dark (or
   equivalent) combos per row. **Column count per row is not fixed** — see the cell-sizing rule below;
   the reference Button happens to fit 4 across, a wider component will fit fewer.
4. Do's and Don'ts — 3 Do examples, 3 Don't examples
5. Interaction States — one cell per state that actually exists on the component (6 for the reference
   Button: `Enabled`, `Hover`, `Pressed`, `Focus`, `Loading`, `Disabled`). **Column count per row is not
   fixed** either, same rule.
6. Anatomy
7. Agentic Documentation
8. Code & MCP
9. Copyright

## Shared content (verbatim placeholder copy, same in all 3 styles)

```js
const CONTENT = {
  componentName: 'Component name',
  description: 'Versatile button component supporting 5 visual types (Accent, Primary, Secondary, Tertiary, Destructive), 2 sizes, 6 interaction states, and light/dark backgrounds. Includes configurable label text and optional leading icon.',
  owner: 'Owner',
  systemName: 'Design System Name', // Brutalist header bar only — see Header shell row
  libraryName: 'Library name',
  buttonLabel: 'Label',
  previewCaption: 'Default state — Accent / Size M / Enabled / Light background',
  variantGrid: {
    title: 'Variant Grid',
    desc: 'Showing Enabled state across all types, sizes, and backgrounds',
    rowTypes: ['Accent', 'Primary', 'Secondary', 'Tertiary', 'Destructive'],
    cells: [['S', 'Light'], ['M', 'Light'], ['S', 'Dark'], ['M', 'Dark']],
  },
  dosDonts: {
    title: "Do's and Don'ts",
    desc: 'Recommended patterns and anti-patterns for this component',
    doHeader: 'Do', dontHeader: "Don't",
    dos: [
      { buttons: 1, size: 'M', color: 'green', title: 'Use Accent for primary actions', desc: 'Accent buttons should represent the most important action on the page. Use one per view to maintain visual hierarchy.' },
      { buttons: 1, size: 'M', color: 'pink', title: 'Use Destructive for irreversible actions', desc: 'Reserve the Destructive type for actions like deleting, removing, or permanently modifying data.' },
      { buttons: 1, size: 'M', color: 'dark', title: 'Pair sizes consistently', desc: 'Use Size M for primary page actions and Size S for inline or compact contexts like table rows or toolbars.' },
    ],
    donts: [
      { buttons: 3, size: 'M', color: 'green', title: "Don't use multiple Accent buttons together", desc: 'Having several Accent buttons in the same view creates competing focal points and confuses the user about the primary action.' },
      { buttons: 1, size: 'M', color: 'pink', title: "Don't use Destructive for cancellation", desc: 'Having several Accent buttons in the same view creates competing focal points and confuses the user about the primary action.' },
      { buttons: 1, size: 'S', color: 'dark', title: "Don't mix sizes in the same context", desc: 'Mixing S and M buttons side by side creates visual imbalance and undermines the hierarchy.' },
    ],
  },
  states: {
    title: 'Interaction States',
    desc: 'How this component responds to user interaction',
    cells: [
      { name: 'Enabled', desc: 'Default resting state. Ready for interaction.', bg: '#2bd98e', labelOpacity: 1 },
      { name: 'Hover', desc: 'Triggered on mouse-over. Subtle visual shift to signal interactivity.', bg: '#7af5c0', labelOpacity: 1 },
      { name: 'Pressed', desc: 'Active/clicked state. Provides immediate tactile feedback.', bg: '#affad9', labelOpacity: 1 },
      { name: 'Focus', desc: 'Keyboard focus ring. Essential for accessibility and tab navigation.', bg: '#7af5c0', labelOpacity: 1, focusRing: '#0b6bd9' },
      { name: 'Loading', desc: 'Async action in progress. Spinner replaces label content.', bg: '#2bd98e', labelOpacity: 0 },
      { name: 'Disabled', desc: 'Non-interactive. Reduced opacity communicates unavailability.', bg: '#eaeaeb', labelOpacity: 1, textColor: '#c6c6cc' },
    ],
  },
  anatomy: {
    title: 'Anatomy',
    desc: 'Structure and configurable properties of this component',
    componentSetLabel: 'Component Set', componentSetName: 'Button',
    rows: [
      ['Variants', '120 total'],
      ['Types', 'Accent, Primary, Secondary, Tertiary, Destructive'],
      ['Sizes', 'S, M'],
      ['States', 'Enabled, Hover, Pressed, Focus, Loading, Disabled'],
      ['Backgrounds', 'Light, Dark'],
      ['Properties', 'Label (text), Icon visibility (bool), Icon swap (instance)'],
      ['Nested components', 'Size=(16x16) - S'],
    ],
  },
  agenticDoc: {
    title: 'Agentic Documentation',
    desc: 'Copy and paste the markdown block below for AI agent consumption',
    tag: 'markdown',
    markdown: `# Component Name

## Overview
Brief description of what this component does and when to use it.

## Usage
\`\`\`jsx
<ComponentName variant="primary" size="md" />
\`\`\`

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | "primary" | Visual style variant |
| size | string | "md" | Component size |
| disabled | boolean | false | Disables interaction |

## Do's
- Use for primary actions
- Keep labels concise
- Maintain consistent sizing

## Don'ts
- Don't use multiple primary buttons
- Don't override internal styles
- Don't nest interactive elements

## Accessibility
- Supports keyboard navigation
- Includes ARIA labels
- Meets WCAG 2.1 AA contrast`,
  },
  codeMcp: {
    title: 'Code & MCP',
    desc: 'MCP link and dev references for agent and developer consumption',
    mcpLinkLabel: 'MCP Link', mcpLinkValue: 'mcp://figma/components/component-name-key',
    devModeLabel: 'Dev Mode',
    devRows: [
      "Import: import  from '@ds/components';",
      'File: src/components/ComponentName/index.tsx',
      'Storybook: https://storybook.ds.com/?path=/docs/component-name',
    ],
  },
  copyright: 'Generated with /component-handoff · Mauro Berteri',
};
```

## Font-role rule (applies to every style)

Two roles only. Get this right and every typography value below follows automatically:

- **Title role** — hero title, section titles (Preview/Variant Grid/Do's and Don'ts/etc.), variant-grid
  row-group labels (`Accent`/`Primary`/...), and Do/Don't example card titles. Uses the **style's title
  font** (table below). This is a deliberate normalization: the original Minimal template's own row-group
  labels used IBM Plex Sans in the source file (a template inconsistency), overridden here to Inter per an
  explicit design-owner correction so Minimal is internally consistent (title role = Inter everywhere,
  since Inter *is* Minimal's title font).
- **Body role** — everything else: descriptions, metadata pill/box text, captions (`S · Light`, state
  names), do/don't body copy, anatomy property rows, agentic doc, code & mcp, copyright. **Always Inter**,
  in all 3 styles, no exceptions. **Never Roboto Mono**, even though the original template's agentic-doc
  text node uses it — this was an explicit design-owner override.
- **One more named exception, body role, all styles:** the component name shown *inside* Anatomy (`Button`)
  is Inter SemiBold 24px regardless of style — unlike the hero title, it does not switch to the style's
  title font.
- **One more named exception, title role, all styles:** the **version value** (`v1.0` / `V.1.0.0`) uses the
  style's title font, not Inter — even though Owner/Library values next to it stay Inter.

| Style | Title font | Weight names used |
|-------|-----------|--------------------|
| Minimal (modo-1) | Inter | Bold (hero), Semi Bold (everything else title-role) |
| Brutalist (modo-2) | IBM Plex Sans | Medium (hero), SemiBold (everything else title-role) |
| Card (modo-3) | Geist | Medium (hero, section titles), SemiBold (row labels, do/dont card titles) |

## Color tokens

```js
const COLOR = {
  green: '#2bd98e', pink: '#bf1d4b', dark: '#252529',
  textOnGreenGrid: '#1a1e1b',      // text color on green buttons INSIDE the variant grid specifically
  textOnGreenStandalone: '#252529', // text color on green buttons everywhere else (preview, anatomy, do's/don'ts, states)
  textOnDark: '#ffffff',
  bodyText: '#1a1e1b', secondaryText: '#646464', mutedText: '#8c8c8c',
  agenticText: '#212126', agenticTag: '#737378',
  checkGreen: '#21b873', xRed: '#e54040',
  doStroke: '#00b894', dontStroke: '#e54040',
  focusRing: '#0b6bd9',
  disabledBg: '#eaeaeb', disabledText: '#c6c6cc',
};
```

## Default sizing rule — HUG unless a fixed number is written down here

**A wrapper frame with no explicit width/height documented in this file must be `layoutSizingHorizontal:
'HUG'` and `layoutSizingVertical: 'HUG'` on whichever axis isn't otherwise constrained.** This wasn't
stated before and, without it, the agent building a section invents a plausible-looking fixed number for
any wrapper this file doesn't explicitly size — which happened identically across all 3 styles: the
`Cells · {type}` row wrapper (Variant Grid) and the per-state description text wrapper (Interaction
States, e.g. `Enabled Desc`) both got hardcoded to a fixed `100px` height that appears nowhere in this
file, cutting off taller content (an Error-state cell that's naturally 176px tall inside a row fixed at
100) or leaving dead space for shorter content.

Two wrappers this affects by name, to close the exact bug that already happened:

- **`Cells · {type}` (Variant Grid row wrapper):** `layoutSizingVertical: 'HUG'`. Cells in the same row can
  have different heights (an Error/expanded variant is taller than a plain Filled one) — the row must grow
  to whichever cell is tallest, never be fixed at any specific number.
- **`{State} Desc` (Interaction States description wrapper):** `layoutSizingVertical: 'HUG'`, sized to
  however many lines the actual description text needs — never a fixed height regardless of copy length.

If a container's size genuinely needs to be fixed, it's already written down explicitly elsewhere in this
file (variant/state cell padding, Do/Don't card behavior, root/body padding, etc.) — if you can't find a
number for it here, the answer is HUG, not a number you make up to look plausible.

**`cornerRadius: 16` applies to every card/container box in this system, in all 3 styles**, unless the
table below says otherwise for that specific element:

- Preview container, Anatomy container, Agentic Documentation container, Code & MCP container
- Every variant-grid cell, every interaction-state cell
- Do/Don't example cards (already noted below, restated here for completeness)

**Exceptions** (don't apply 16 to these): buttons and pills use `cornerRadius: 1000` (fully round — see
`BUTTON.cornerRadius` and the version/Documentation pills). The root frame itself uses `cornerRadius: 0`
in Minimal and Brutalist, `48` in Card (see "Root fill" row below). Check/X circles use `cornerRadius`
equal to half their own size (12, for a 24×24 circle) — or just use `figma.createEllipse()`.

**Every container that has both a `cornerRadius` and an absolute-positioned child sitting flush against
its edge (variant-grid cells, state cells — see the caption/label pattern below) needs `clipsContent =
true` set explicitly.** This is not the Plugin API default for programmatically created frames. Without
it, a caption/label box with square corners sits flush against a rounded cell and its corners visibly
poke out past the cell's rounded edge — the source template avoids this because its container clips
content by default; a frame built with `figma.createAutoLayout`/`figma.createFrame` does not, unless you
set it yourself:

```js
cell.clipsContent = true;
```

## Per-style structural spec

Read this table alongside `CONTENT` and `COLOR` above — it's the only place style-specific numbers live.

**Brutalist header bar, spelled out (this was under-specified before and got built wrong — Documentation
ended up alone, left-aligned, with no System Name Box at all):** the header bar is 3 items in one 70px-tall
horizontal row, `#f5f0e9` fill + 0.5px `#1a1e1b` stroke, sharing the row's full width:

1. `System Name Box` — HUG width, pad 0/24, text `CONTENT.systemName`, left edge of the row.
2. A `FILL`-sized spacer between them (empty, no content) — this is what pushes item 3 to the far right.
3. `Documentation Box` — HUG width, pad 0/24, `CONTENT.` text `"Documentation"` + the arrow icon, **flush
   to the right edge of the row**, never left-aligned.

`Component Details` (Owner/Library/Version, the second bar at the bottom of the header) is separate from
this — don't merge Documentation into it, and don't drop the System Name Box to save a step.

| Property | Minimal (M1) | Brutalist (M2) | Card (M3) |
|---|---|---|---|
| Root width | 1200 | 1200 | 1200 |
| Root fill | white | **`#f5f0e9` on the entire root frame — header AND body, the whole page background, not just the header sub-pieces** | white, `cornerRadius: 48` |
| Root padding | 64 all sides | top 0 / sides 0 / bottom 64 | top 24 / sides 24 / bottom 64 |
| Header-to-body gap | n/a — Minimal has no separate `Body` wrapper at all; every section (header included) is a direct sibling in one flat stack with `itemSpacing: 64` between all of them | **64** — `Container` (header) and `Preview Section` (body-equivalent) are direct siblings of the root, `itemSpacing: 64` between them | **48** — verified against source (`OgCpdTFA2rbOJlVQ5Ec9nR`, node `3:97`): `Component Info` ends at y=488, `Body` starts at y=536. This was never written down before and the agent building it either nested `Component Info` inside `Body` or guessed a different gap, both wrong — `Component Info` and `Body` must be **direct sibling children of the root**, never one nested inside the other, with `itemSpacing: 48` between them |
| Body inner padding (beyond root) | — (root padding is the only inset) | **sides 64** (verified against source — do not assume this matches Card's 48; each style's own padding was independently wrong twice during development from copy-pasting between styles instead of checking the source per style) | sides 48 |
| Content width | 1072 | 1072 | 1056 |
| Header shell | `Component Info` autolayout, gap 24, no fill, no border | See "Brutalist header bar" note below | `Component Info` card, `#d0b6ff` fill, `cornerRadius 32`, pad 48, gap 81 |
| Hero title size/color | 64px `#1c1c1f` | 81px `#1a1e1b` | 81px `#54299b` |
| Hero desc size/lh/color | 16px / 150% / `#8c8c8c` | 24px / 140% / `#1a1e1b` | 24px / 140% / `#1a1e1b` |
| Section title size/color | 40px `#1c1c1f` | 48px `#1a1e1b` | 48px `#54299b` |
| Section desc size/lh | 20px / 140% `#1a1e1b` (all styles, unchanged) |
| Owner/Library value font | Inter **Regular** 20px | Inter **Medium** 20px | Inter **Medium** 20px |
| Version value | pill, `#00b894` fill, `cornerRadius 100`, pad 6/14, Inter SemiBold 16px white, text `v1.0` | box, pad 0/24, height 70, HUG width, title-font SemiBold 20px, text `V.1.0.0` | pill, white fill, `cornerRadius 80`, pad 16/24, Geist SemiBold 20px, text `V.1.0.0` |
| Metadata layout | `Header Top` (title+version) then `Component Details` row, gap 24 | `Owner Container` FILL spacer + `Owner`/`Library`/`Version` HUG boxes, no gap (borders touch) | `Component Details` row `justify-between`: pills wrap (Owner/Version/Library) vs. Documentation pill |
| Documentation button | *none* | box in header bar, pad 0/24, Inter Medium 20px `#1a1e1b`, arrow 32×32 dark stroke | pill, `#54299b` fill, `cornerRadius 80`, pad 16/24, gap 10, Inter Medium 20px white, arrow 32×32 white stroke |
| Preview/Anatomy/Agentic/Code&MCP container fill | `#f2f2f5` (Preview) / `#f4f4f4` (others) | white + 0.5px `#1a1e1b` stroke | `#f4f4f4` |
| Preview padding | 80 all sides | 81 all sides | 81 all sides |
| Preview internal structure | `Preview Label` title, then `Preview` container (cornerRadius 16, fill per row above) holding the button instance centered, then **exactly one** `previewCaption` text directly below the button, inside the same container. Do not add a second caption anywhere in this section — `CONTENT.previewCaption` is written once. |
## Cell sizing rule — must scale with the real component, never with the reference numbers

**This was never tested against a component wider than the ~65–98px reference Button used to build this
skill, and it breaks on anything wider.** A 320px-wide component (a phone input, a search bar, a table
row) placed inside a cell sized for the reference Button overflows the cell and bleeds into the neighbors.

The `4 columns` (Variant Grid) and `3 columns` (Interaction States) counts, and any specific cell-width
pixel value implied elsewhere in this file, are **illustrative reference values for the demo Button only.**
For every real build:

1. Read the actual rendered width/height of the selected component's largest relevant variant
   (`instance.width`/`instance.height` after `createInstance()`, before placing it — check the widest
   variant that will appear in the grid, since Error/expanded states can be taller or wider than Enabled).
2. Compute `cellWidth = componentWidth + 2 * cellPadding` (24px padding each side, per the padding rule
   above), with a **sensible floor** around 200px so very narrow components (icons, small badges) don't
   produce cramped cells.
3. Set the row wrapper (`Cells · {type}` in Variant Grid, each `States Row` in Interaction States) to
   `layoutWrap: 'WRAP'` and give each cell a fixed width via `cellWidth` above (not `layoutSizingHorizontal:
   'FILL'`, which is what silently produced the 4-and-3-column reference counts in the first place — FILL
   divides the row's total width evenly by a column count baked in from the reference build, instead of
   sizing to content). With `WRAP`, however many columns actually fit at `cellWidth` will fit per row, and
   the rest flow to additional rows automatically — this replaces "4 across" / "3 across" as a fixed
   assumption with "however many actually fit," which is correct for both a narrow icon and a wide input.
4. Never assume a column count when writing the build code — derive it, or let `WRAP` derive it for you.

| Variant cell padding (all 4 sides) | **24** (not the template's original 81/113 — explicit design-owner correction, applies to all 3 styles) |
| Variant cell light bg | `#f2f2f5` | white + 0.5px `#1a1e1b` stroke | `#f4f4f4` |
| Variant cell dark bg | `#2e2e33` | `#1a1e1b` | `#1d1a1e` |
| Variant caption box | **absolute overlay, flush bottom** (`x:0, y: cell.height-32, width: cell.width, height: 32`), no fill/border, text **centered**, 20px inset from the very bottom edge in M1 specifically (`y: cell.height - 32 - 20`... i.e. positioned 20px above the flush edge) | absolute overlay flush bottom (0/-0.5px offsets), `#f5f0e9` fill + 0.5px `#1a1e1b` stroke, text centered | absolute overlay flush bottom, **no fill/border**, text **right-aligned**, pad-right 16 |
| Do/Don't card | white fill, 0.5px stroke (`doStroke`/`dontStroke`), `cornerRadius 16`, pad 24, gap 24. **Use `layoutSizingVertical: 'HUG'`, not a fixed height** — the reference build's 195px only happened to fit because every reference title was one line; a real component's title can wrap to 2 lines and a fixed height then crowds the description against it. Let the card grow to fit its own content instead. **If a Do/Don't example embeds a component instance and the component is wider than the card, apply the same cell-sizing rule** (widen the card or drop to fewer cards per row via `WRAP`) rather than letting the instance overflow. If the instance genuinely doesn't fit two per row at a readable size, it's fine for a Do/Don't card to skip the instance and use icon+title+description only, same as the reference build already does when appropriate. |
| States cell bg | `#f2f2f5` | white + 0.5px `#1a1e1b` stroke | `#f4f4f4` |
| States label box | absolute overlay flush bottom, `#e1e1e1`-ish neutral fill(*), text centered | absolute overlay flush bottom, `#f5f0e9` fill + 0.5px stroke, text centered | absolute overlay flush bottom, **no fill/border**, text **centered** (unlike this style's own variant-grid captions, which are right-aligned — verify independently, don't assume one inherited the other) |
| Row-group / Do-Don't-card title font | Inter SemiBold 24px / 18px | IBM Plex Sans SemiBold 24px / 18px | Geist SemiBold 24px / 18px |

(*) M1 states label fill was not re-verified as precisely as the rest of this table — confirm against a
fresh screenshot compare before treating it as final if a discrepancy shows up.

## Shared component/typography sizing (identical across all 3 styles)

```js
const BUTTON = {
  S: { padX: 12, padY: 8, fontSize: 12, lineHeight: 16, tracking: 0.24 },
  M: { padX: 16, padY: 12, fontSize: 14, lineHeight: 20, tracking: 0.14 },
  cornerRadius: 1000,
};
const TYPE = {
  caption: { family: 'Inter', style: 'Medium', size: 11 },          // "S · Light", state names
  bodyDesc: { family: 'Inter', style: 'Regular', size: 13, lineHeight: 150 }, // do/dont + state descriptions, color secondaryText
  anatomyLabel: { family: 'Inter', style: 'Medium', size: 12, color: 'secondaryText' },
  anatomyValue: { family: 'Inter', style: 'Regular', size: 18, lineHeight: 150, color: 'bodyText' },
  anatomyEyebrow: { family: 'Inter', style: 'Semi Bold', size: 12, tracking: 0.6, color: 'secondaryText' },
  anatomyComponentName: { family: 'Inter', style: 'Semi Bold', size: 24, color: 'bodyText' }, // named exception, see font-role rule
  agenticTag: { family: 'Inter', style: 'Regular', size: 12, lineHeight: 16, color: 'agenticTag' },
  agenticBody: { family: 'Inter', style: 'Regular', size: 13, lineHeight: 22, color: 'agenticText' },
  codeLabel: { family: 'Inter', style: 'Medium', size: 12, color: 'secondaryText' },
  codeValue: { family: 'Inter', style: 'Regular', size: 18, lineHeight: 150, color: 'bodyText' },
  codeDevRow: { family: 'Inter', style: 'Regular', size: 14, lineHeight: 150, color: 'bodyText' },
  copyright: { family: 'Inter', style: 'Regular', size: 12, color: 'secondaryText' },
};
```

## Icons (embedded, no external asset needed)

```js
const ICONS = {
  check: (fill) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.3911 5.48922C11.563 5.66106 11.563 5.93965 11.3911 6.11148L6.99112 10.5115C6.81929 10.6833 6.5407 10.6833 6.36887 10.5115L4.60887 8.75148C4.43704 8.57965 4.43704 8.30105 4.60887 8.12922C4.7807 7.95739 5.05929 7.95739 5.23112 8.12922L6.68 9.5781L10.7689 5.48922C10.9407 5.31739 11.2193 5.31739 11.3911 5.48922Z" fill="${fill}"/></svg>`,
  close: (fill) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.04886 5.04879C5.22069 4.87696 5.49929 4.87696 5.67112 5.04879L7.99999 7.37767L10.3289 5.04879C10.5007 4.87696 10.7793 4.87696 10.9511 5.04879C11.1229 5.22063 11.1229 5.49922 10.9511 5.67105L8.62224 7.99992L10.9511 10.3288C11.1229 10.5006 11.1229 10.7792 10.9511 10.951C10.7793 11.1229 10.5007 11.1229 10.3289 10.951L7.99999 8.62218L5.67112 10.951C5.49929 11.1229 5.22069 11.1229 5.04886 10.951C4.87703 10.7792 4.87703 10.5006 5.04886 10.3288L7.37774 7.99992L5.04886 5.67105C4.87703 5.49922 4.87703 5.22063 5.04886 5.04879Z" fill="${fill}"/></svg>`,
  arrow: (stroke) => `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.33325 22.6666L22.6666 9.33325M22.6666 22.6666V9.33325H9.33325" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
```

Check/X glyphs go inside a 24×24 solid-color circle (`checkGreen`/`xRed`), white glyph, `figma.createNode
FromSvg`, `resize(16,16)`, `layoutPositioning = 'ABSOLUTE'` **then** `x = 4, y = 4` (see gotcha 2 below).
**A bare `figma.createEllipse()` with no vector child is not a valid Do/Don't icon — it happened once during
development and shipped as a plain colored dot with nothing inside.** The `figma.createNodeFromSvg(...)`
call for the check/X path is not optional decoration, it's the icon; don't skip it even when the rest of
the card (icon + title, no instance) is otherwise simple to build.
Arrow (M2/M3 only, M1 has no Documentation button) recolors per its own button background: dark
(`#1a1e1b`) on M2's light box, white on M3's solid purple pill.

## Plugin API gotchas (read before Step 2 — these caused real bugs during development)

**1. Absolute overlays must be resized/positioned AFTER the parent row's width has settled, not at
creation time.** If cell 1 of a row gets its absolute label box `resize()`d using `cell.width` immediately,
before cells 2–4 exist, that width can be stale once the row's final layout resolves — producing a
too-narrow or too-wide label on exactly the cells built first. Fix: build every cell in the row, collect
`{ cell, labelBox }` pairs, then in a **second pass** after all of them exist:

```js
for (const { cell, labelBox } of pendingLabels) {
  labelBox.resize(cell.width, 32);
  labelBox.x = 0;
  labelBox.y = cell.height - 32;
}
```

**2. `layoutPositioning = 'ABSOLUTE'` must be set BEFORE `x`/`y`**, or auto layout keeps controlling the
node's position and silently ignores the coordinates:

```js
child.layoutPositioning = 'ABSOLUTE'; // first
child.x = 4; child.y = 4;             // then
```

**3. Padding at every level of the root→body→section chain must match the table above exactly** — a single
wrong padding value (e.g. body padding 24 instead of Card's 48) makes `layoutSizingHorizontal: 'FILL'`
stretch every section wider than it was built for, which then breaks any absolute overlay sized in a
previous step (gotcha 1) even though nothing about that section itself was touched. If a caption/label
looks subtly wrong after assembly, check padding up the chain before touching the section's own code.

## Step 0 — Discovery (2 widgets)

`show_widget` + `sendPrompt()`. Load `interactive` module silently first.

| Widget | Content | `sendPrompt` on confirm |
|--------|---------|--------------------------|
| **1 — Style** | 3 cards: Minimal / Brutalist / Card, each with a **Select** button and a short description pulled from the structural spec above (hero font, container treatment) — no external screenshot needed, describe them in words. | `Style: modo-1` (etc.) |
| **2 — Metadata** | Language (`Español`/`English`, default `Español`), Version, Owner (`Me` chip or type), Library name, Description (`Keep`/`Trim`/`Replace`) | `Language: es · Version: 1.0 · Owner: me · Library: Acme DS · Description: keep` |

**Resolving "Me" for Owner:** run `return figma.currentUser` in the first `use_figma` call and use `.name`.
That real name — never the literal word "Owner"/"Propietario" — is what gets written into the owner field.
If the person typed a name instead, use exactly what they typed.

Never present per-section checkboxes — all 9 sections build every time; trimming (Step 5) is automatic.

**Language:** translate visible label/section text only (`CONTENT` above is in English; translate the
*values* you write, never the object's own key names or this file's own prose). Never translate the
component name, owner, library, or URLs.

## Step 1 — Inspect the selection

Read `componentPropertyDefinitions`, variants, and `description` off the selected `COMPONENT`/
`COMPONENT_SET` in the person's own file (this is a normal local read, not an external-file call — no
quota concern). Generate the MCP link:

```
https://www.figma.com/design/{fileKey}/{fileName}?node-id={nodeId with : replaced by -}
```

## Step 2 — Build section by section (one `use_figma` call per section)

For each of the 9 sections, in order — Header → Preview → Variant Grid → Do's and Don'ts → Interaction
States → Anatomy → Agentic Documentation → Code & MCP → Copyright — write the section using only `CONTENT`,
`COLOR`, the structural-spec row for the chosen style, `BUTTON`, `TYPE`, and `ICONS` above. Use
`figma.createAutoLayout` for any container with related children. Populate placeholder text now (`Label`,
`Component name`) — Step 3 swaps in real content. `await frame.screenshot()` at the end of each call and
compare mentally against the structural-spec description for that section before moving on; don't
accumulate 9 sections on top of one that's already wrong.

Don't batch more than ~10 logical operations per call (see `/figma-use` rule 5) — this maps naturally to
one section per call, sometimes two calls for Variant Grid (5 rows × 4 cells) and Do's and Don'ts (6
cards).

## Step 3 — Populate real content (AI's only job)

The AI fills **content**, never **layout** — every geometry value already came from the tables above.

- Swap `Label` placeholders inside variant/state/do's-donts button instances with the real component's
  variants (`variant.createInstance()`), matched by the closest available prop combination.
- Header: real component name, version, library, description (per Step 0 answers), owner resolved per the
  note above.
- Variant grid: real variant names as row labels; captions reflect actual size/background combos that
  exist on the component (trim per Step 4 when an axis doesn't exist).
- Do's/Don'ts: generate 2–3 plausible pairs from the component's actual props if no design-system guidance
  exists; mark them as suggestions, not validated rules.
- Interaction states: read `reactions` if present; otherwise map existing state variants. Note (don't
  invent) any standard state the component is missing.
- Anatomy: real `componentPropertyDefinitions`, variant count, nested component names.
- Agentic Documentation: real markdown — component name, real props table, real Do's/Don'ts, accessibility
  notes inferred from the component type. Font stays Inter regardless (see font-role rule).
- Code & MCP: the real MCP link from Step 1. `—` for any field left empty in Step 0.

## Step 4 — Auto-trim (no user picker)

Trim rows/cells whose axis doesn't exist on the real component (e.g. no dark-background variant, no state
variants at all) — never remove a whole section; all 9 always build.

## Step 5 — Final QA (mandatory)

- `get_screenshot` every major section and compare it against the structural-spec description for that
  style/section above.
- Confirm: no Roboto Mono anywhere; title font matches the style; every absolute caption/label box has the
  correct fill/alignment for its style *and* section (variant grid vs. states grid can differ within the
  same style — don't assume one inherited the other); every wrapper has explicit `layoutSizing*` set after
  its children were appended; all created/mutated node IDs are returned.
- Name the root `[Component name] · Handoff`.

## Self-check before finishing

- [ ] No external file was read. Every value came from this file's tables, `figma.currentUser`, or the
      person's own selected component.
- [ ] No `importComponentByKeyAsync`/`importComponentSetByKeyAsync` anywhere.
- [ ] No Roboto Mono; title font matches the style (font-role rule, including both named exceptions);
      body/labels are Inter everywhere.
- [ ] Every absolute-positioned caption/label box was resized/positioned in a second pass, after all
      sibling cells in its row were created (gotcha 1) — not at creation time.
- [ ] Every `layoutPositioning = 'ABSOLUTE'` assignment happened before its `x`/`y` assignment (gotcha 2).
- [ ] Padding at every level of the root → body → section chain matches the structural-spec table exactly
      for the chosen style (gotcha 3) — Card's body padding is 48, not 24; don't copy Brutalist's number.
- [ ] Variant-grid cell padding is 24 all sides in every style (explicit correction, not the template
      original 81/113).
- [ ] Icons (check/close/arrow) are real vector paths from `ICONS`, not empty placeholder frames.
- [ ] Owner field shows an actual name (`figma.currentUser.name` or what the person typed) — never the
      literal word "Owner"/"Propietario".
- [ ] All 9 sections present; trimmed rows/cells only where the component's real data doesn't support them.
- [ ] Every container (Preview, Anatomy, Agentic Doc, Code&MCP, variant cells, state cells, Do/Don't cards)
      has `cornerRadius: 16` — none of them left sharp-cornered by default.
- [ ] Brutalist's root fill (`#f5f0e9`) was applied to the whole root frame, not only the header pieces.
- [ ] Body/content padding matches the structural-spec table **per style** exactly (Minimal 64 on root
      directly, Brutalist 64 inside the body, Card 48 inside the body) — never copy one style's padding
      number into another without checking this table first; this exact mistake happened twice with
      Brutalist alone during development.
- [ ] Every variant-grid cell and state cell has `clipsContent = true` set explicitly, so the flush-bottom
      caption/label box's square corners don't poke out past the cell's rounded corners.
- [ ] Variant-grid and interaction-states cell widths were computed from the **real selected component's**
      rendered width (plus padding), not copied from the reference Button's 256px/341px numbers — checked
      by actually reading `instance.width` after creating it, not assumed. Row wrappers use `layoutWrap:
      'WRAP'` so column count adapts instead of being fixed at 4 or 3.
- [ ] Card style (Modo 3): `Component Info` and `Body` are direct sibling children of the root — never one
      nested inside the other — with exactly `itemSpacing: 48` between them. Don't reuse Brutalist's 64.
- [ ] Brutalist header bar has all 3 pieces (System Name Box, spacer, Documentation Box) with Documentation
      flush right — never just Documentation alone or left-aligned.
- [ ] Every check/X icon is a real inserted vector glyph — never a bare `figma.createEllipse()` with
      nothing inside it.
- [ ] Do/Don't cards use `layoutSizingVertical: 'HUG'`, not a fixed height — checked with a component whose
      real title is long enough to wrap to 2 lines, not just the single-line reference copy.
- [ ] Every wrapper without an explicit fixed size documented in this file is `HUG` on both axes — in
      particular `Cells · {type}` row wrappers and `{State} Desc` text wrappers, which both got wrongly
      hardcoded to 100px once already. No fixed number was invented for anything this file doesn't specify.

---

*Адаптировано из скилла Figma Community `component-handoff` (Mauro Berteri, v4), портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/design-docs).*

