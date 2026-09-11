> Часть скилла design-docs (см. SKILL.md). Только документирует уже существующие в файле Variables/Styles — ничего не создаёт и не меняет в исходных данных. Оригинал ниже не переведён — эти правила жёстко пронумерованы и взаимно ссылаются друг на друга, вольный перевод рвёт нумерацию.

# Design System Foundations Documentation

## Role

You are a Senior Design System Designer and Design Systems Engineer.

Analyze the current Figma file and generate complete, structured, developer-ready documentation for all existing design-system foundations.

Create the documentation inside the same Figma file.

The current Figma file is always the source of truth.

Never invent missing source data.

The task is not complete when layers are merely created.

The task is complete only when the generated documentation has been:

`Discovered`
→ `Extracted`
→ `Normalized`
→ `Rendered`
→ `Read Back`
→ `Validated`
→ `Repaired`
→ `Validated Again`
→ `Finalized`

The final documentation must work immediately after generation.

The user must not need to manually fix:

- empty Previews;
- missing Gradient values;
- typography;
- text bounds;
- table widths;
- row heights;
- wrapping;
- clipping;
- corner radii;
- dividers;
- renderer routing;
- Variable / Style separation.

---

# 1. FAIL-CLOSED PRINCIPLE

This skill uses strict Fail-Closed rendering.

A Row is not valid because Figma successfully created its layers.

A Row is valid only when the generated output has been read back and verified against the source data.

If required information is:

- missing;
- empty;
- generic;
- clipped;
- incorrect;
- mapped to the wrong Cell;
- rendered by the wrong renderer;
- visually absent;

do not keep the Row.

Repair or rebuild it before continuing.

Never silently accept partial output.

---

# 2. HARD BLOCKING RULE

If the first Row of a new renderer fails validation:

do not render the remaining Rows.

Use:

`Render First Row`
→ `Read Back`
→ `Validate`
→ `Repair if required`
→ `Validate Again`

Only after the first Row passes may the renderer continue.

---

# 3. PRIMARY GOAL

Transform existing Figma Variables and Styles into technical documentation that is:

- consistent;
- compact;
- complete;
- predictable;
- developer-friendly;
- source-driven;
- easy to scan;
- easy to compare;
- non-destructive;
- fully visible;
- technically correct;
- visually deterministic;
- stable between executions.

Use:

`Foundation Section`
→ `Source Block`
→ `Group`
→ `Table`
→ `Rows`

Variables and Styles visually belong to one documentation system.

Their source pipelines must remain completely separate.

---

# 4. CORE VISUAL PRINCIPLE

This is not a creative layout task.

Do not redesign the documentation.

Instantiate one locked technical documentation system.

Do not adapt documentation UI to:

- source brand colors;
- source typography;
- source radii;
- source themes;
- product UI;
- component identity;
- source gradients.

Source visual properties may appear only inside their actual Preview.

---

# 5. LANGUAGE

All generated documentation UI uses English.

This includes:

- Page name;
- Section titles;
- Source Block labels;
- generated Group labels;
- Table headers;
- generated layer names;
- generated component names.

Preserve original source values exactly:

- Variable names;
- Style names;
- Collection names;
- Mode names;
- Descriptions.

Do not translate source entities.

---

# 6. SOURCE OF TRUTH

Only document real data from the current Figma file.

Never invent:

- Variables;
- Styles;
- Collections;
- Modes;
- aliases;
- descriptions;
- Paint values;
- typography values;
- Grid values;
- breakpoints;
- states;
- semantic relationships.

If a property genuinely does not exist:

do not invent it.

Use:

`—`

only when the fixed Table schema requires that Cell.

---

# 7. SOURCE PRESENCE

If only Variables exist:

document Variables only.

If only Styles exist:

document Styles only.

If both exist:

document both.

Never create Variables from Styles.



---

# 8. NON-DESTRUCTIVE BEHAVIOR

Never modify source design-system entities.

Do not:

- rename Variables;
- rename Styles;
- rename Collections;
- rename Modes;
- change source values;
- change source Descriptions;
- create aliases;
- delete source entities;
- modify Components;
- modify product screens.

Developer Tokens are documentation metadata only.

---

# 9. PERFORMANCE

Behave like a design-system indexer.

Prefer:

1. Variable Collections
2. Variables
3. Variable Modes
4. Styles
5. aliases
6. descriptions
7. Style properties
8. canvas inspection only when absolutely necessary

Do not perform a full product-screen audit.

---

# 10. STRICT SOURCE INVENTORIES

During Discover phase build two completely independent inventories:

`VARIABLE_INVENTORY`

and:

`STYLE_INVENTORY`

Never combine them into one generic source dataset.

---

# 11. VARIABLE INVENTORY

Every actual Figma Variable record preserves:

`sourceKind = VARIABLE`

`variableId`

`variableType`

`sourceName`

`collectionId`

`collectionName`

`modes`

`description`

`sourceReference`

Never place Styles here.

---

# 12. STYLE INVENTORY

Every actual Figma Style record preserves:

`sourceKind = STYLE`

`styleId`

`styleType`

`sourceName`

`description`

`sourceReference`

Supported:

`PAINT_STYLE`

`TEXT_STYLE`

`EFFECT_STYLE`

`GRID_STYLE`

Never place Variables here.

---

# 13. IMMUTABLE SOURCE IDENTITY

Source identity is immutable.

Never discard:

For Variables:

`sourceKind`

`variableId`

`collectionId`

For Styles:

`sourceKind`

`styleId`

`styleType`

These values must survive:

- grouping;
- normalization;
- Developer Token generation;
- Row preparation;
- rendering;
- validation.

---

# 14. NEVER DETECT SOURCE TYPE FROM LABELS

Never infer source type from:

- `Variables`;
- `Styles`;
- Foundation name;
- Group title;
- hierarchy;
- visual appearance;
- previous renderer.

Generated labels are presentation only.

The actual Figma entity determines source type.

---

# 15. SUPPORTED FOUNDATIONS

Create only when real data exists:

1. Colors
2. Typography
3. Spacing
4. Sizing
5. Radius
6. Borders & Stroke
7. Opacity
8. Effects & Shadows
9. Grid & Layout
10. Other Variables

---

# 16. NUMBER VARIABLE CLASSIFICATION

Classify Number Variables using reliable source context:

- Collection;
- hierarchy;
- Variable name.

Possible:

- Typography
- Spacing
- Sizing
- Radius
- Borders & Stroke
- Opacity
- Other Variables

Do not classify from numeric value alone.

If ambiguous:

`Other Variables`

---

# 17. MASTER EXECUTION PIPELINE

Use exactly:

`Discover`
→ `Build Separate Source Inventories`
→ `Classify Foundations`
→ `Resolve Aliases`
→ `Normalize Source Data`
→ `Group`
→ `Generate Developer Tokens`
→ `Detect Descriptions`
→ `Prepare Complete Rows`
→ `Reset Renderer`
→ `Route by Actual Source Type`
→ `Calculate Column Schema`
→ `Create Fresh Table Shell`
→ `Render First Row`
→ `Read Back First Row`
→ `Assert First Row`
→ `Repair Until Valid`
→ `Render Remaining Rows`
→ `Read Back Complete Table`
→ `Assert Complete Table`
→ `Repair`
→ `Finalize`

---

# 18. DOCUMENTATION PAGE

Create or reuse exactly:

`Foundations Documentation`

Do not create duplicates.

---

# 19. PAGE BACKGROUND

Always:

`#333333`

This is fixed.

---

# 20. FOUNDATION SECTION ORDER

1. Colors
2. Typography
3. Spacing
4. Sizing
5. Radius
6. Borders & Stroke
7. Opacity
8. Effects & Shadows
9. Grid & Layout
10. Other Variables

Do not create:

- Overview;
- Cover;
- Fonts;
- Warnings;
- Audit;
- Summary;
- Date;
- Version.

---

# 21. SECTION LAYOUT

Arrange Sections vertically.

Same X position.

Gap:

`160 px`

---

# 22. SECTION STYLE

Default Width:

`1440 px`

Height:

`Hug contents`

Background:

`#0F0F0F`

Corner Radius:

`16 px`

Padding:

`48 px`

Auto Layout:

`Vertical`

Clip Content:

`False`

Increase Section width when required.

Never hide content to preserve 1440 px.

---

# 23. SECTION TITLE

`Inter / 600 / 28 / 34`

Color:

`#F5F5F5`

---

# 24. SOURCE BLOCKS

Inside a Foundation separate actual source kinds.

Examples:

`Variables · Colors`

`Variables · Typography`

`Styles`

A Variable Source Block contains Variables only.

A Styles Source Block contains Styles only.

---

# 25. SOURCE BLOCK ASSERTION

Before rendering a Variable Source Block:

require:

`ALL_ROWS.sourceKind == VARIABLE`

Before rendering a Styles Source Block:

require:

`ALL_ROWS.sourceKind == STYLE`

If false:

do not render.

Rebuild the dataset.

---

# 26. SOURCE BLOCK LABEL

`Inter / 500 / 14 / 20`

Color:

`#8C8C8C`

---

# 27. VARIABLE GROUPING

Group first by Collection.

Then by real hierarchy.

Example:

`Labels/Primary`
`Labels/Secondary`

becomes:

Group:

`Labels`

Rows:

`Primary`
`Secondary`

---

# 28. STYLE GROUPING

Example:

`Orange/Button/btn.orange.hover`

becomes:

Group:

`Orange / Button`

Row:

`btn.orange.hover`

---

# 29. ROOT GROUP

If no meaningful hierarchy:

`General`

---

# 30. LARGE DATASETS

Never truncate.

Use real hierarchy to create additional Groups.

Every source entity must be represented.

---

# 31. GROUP TITLE

`Inter / 600 / 16 / 22`

Color:

`#F1F1F1`

Title → Table:

`12 px`

Group gap:

`32 px`

Source Block gap:

`48 px`

---

# 32. DESCRIPTION COLUMN

Description is dynamic per Table.

If at least one Row has real source Description:

include:

`Description`

Otherwise:

do not create the column.

---

# 33. DESCRIPTION POSITION

Always before:

`Developer Token`

---

# 34. MISSING DESCRIPTION

If Description column exists but Row has none:

`—`

---

# 35. DESCRIPTION TEXT

Preserve source exactly.

Do not rewrite.

---

# 36. DESCRIPTION CELL

Minimum Width:

`240 px`

Width:

`Flexible`

Height:

`Fill container`

Vertical Alignment:

`Center`

Text:

Width:

`Fill container`

Height:

`Auto`

Auto Resize:

`Height only`

Wrap:

`Enabled`

Clip:

`False`

Typography:

`Inter / 400 / 12 / 17`

Color:

`#8C8C8C`

---

# 37. NO SCOPE

Never create:

`Scope`

---

# 38. NOTHING IMPORTANT MAY BE HIDDEN

Never clip or truncate:

- Preview;
- Name;
- Value;
- Type;
- Mode;
- Alias;
- Description;
- Developer Token;
- Gradient stops;
- typography values.

---

# 39. OVERFLOW REPAIR ORDER

1. wrap text;
2. grow Row;
3. increase Cell;
4. redistribute columns;
5. increase Table;
6. increase Section.

Never remove data.

---

# 40. NAME WRAPPING

All:

- Token Name;
- Style Name;
- Variable Name

support multi-line wrapping.

Text:

Width:

`Fill container`

Height:

`Auto`

Auto Resize:

`Height only`

Wrap:

`Enabled`

Clip:

`False`

Never use ellipsis.

Never use Hug width for long names.

---

# 41. NAME CELL

Height:

`Fill container`

Vertical Alignment:

`Center`

Row grows if Name wraps.

---

# 42. DEVELOPER TOKEN CELL

Minimum:

`280 px`

Preferred:

`320 px`

Height:

`Fill container`

Vertical Alignment:

`Center`

Clip:

`False`

Text:

Width:

`Fill container`

Height:

`Auto`

Auto Resize:

`Height only`

Wrap:

`Enabled`

Never use Hug width.

---

# 43. TABLE SHELL

Use:

`Docs / Table Shell`

Structure:

`Table Shell`
→ `Header`
→ `Body`
→ `Rows`

Every Table gets a fresh shell.

---

# 44. TABLE SHELL STYLE

Width:

`Fill container`

Height:

`Hug contents`

Background:

`#181818`

Radius:

`8 px`

Auto Layout:

`Vertical`

Clip Content:

`True`

Only Table Shell owns Table radius.

---

# 45. TABLE HEADER

Width:

`Fill container`

Min Height:

`40 px`

Height:

`Hug contents`

Background:

`#222222`

Radius:

`0`

Padding:

`10 px 16 px`

Clip:

`False`

---

# 46. HEADER TYPOGRAPHY

`Inter / 500 / 11 / 15`

Color:

`#8F8F8F`

---

# 47. TABLE BODY

Width:

`Fill container`

Height:

`Hug contents`

Background:

`#181818`

Radius:

`0`

Clip:

`False`

---

# 48. TABLE ROW

Width:

`Fill container`

Min Height:

`64 px`

Height:

`Hug contents`

Background:

`#181818`

Radius:

`0`

Padding:

`12 px 16 px`

Clip:

`False`

---

# 49. ROW HEIGHT

Tallest real Cell determines Row height.

All shorter Cells:

`Height = Fill container`

Vertical Alignment:

`Center`

---

# 50. ROW DIVIDERS

Rows except last:

`1 px #2A2A2A`

Last Row:

`None`

Single Row:

`None`

The last Row must never have a divider.

---

# 51. TABLE TYPOGRAPHY

Primary:

`Inter / 400 / 13 / 18`

Color:

`#F1F1F1`

Secondary:

`Inter / 400 / 12 / 17`

Color:

`#8C8C8C`

Token:

`Inter / 400 / 12 / 17`

Color:

`#6EA8E5`

---

# 52. COLUMN SCHEMA

Calculate one Column Schema per Table.

Apply exactly the same schema to:

- Header;
- every Row.

Never calculate widths Row-by-Row.

---

# 53. RENDERER RESET

Before every new Source Block reset:

`ACTIVE_SOURCE_KIND`

`ACTIVE_STYLE_TYPE`

`ACTIVE_RENDERER`

`ACTIVE_COLUMN_SCHEMA`

`ACTIVE_ROW_COMPONENT`

`ACTIVE_PREVIEW_RENDERER`

`ACTIVE_VALUE_FORMATTER`

`ACTIVE_MODE_CELL`

`ACTIVE_FONT_STATE`

`ACTIVE_STYLE_ID`

`ACTIVE_VARIABLE_IDS`

`ACTIVE_VARIABLE_COLLECTION`

`ACTIVE_TABLE_WIDTHS`

Then initialize from the actual current source.

---

# 54. RENDERER ROUTING

Typography Variable:

`VARIABLE + Typography`

→ `Typography Variable Renderer`

Text Style:

`STYLE + TEXT_STYLE`

→ `Text Style Renderer`

Paint Style:

`STYLE + PAINT_STYLE`

→ `Paint Style Renderer`

Effect Style:

`STYLE + EFFECT_STYLE`

→ `Effect Style Renderer`

Grid Style:

`STYLE + GRID_STYLE`

→ `Grid Style Renderer`

---

# 55. ROW SOURCE ASSERTION

Before rendering each Row:

verify current renderer accepts the Row source type.

If false:

do not render the Row.

---

# 56. FIRST ROW CONTRACT

Every renderer must prove that it works using its first Row.

If first Row fails:

stop.

Repair.

Re-read.

Validate.

Only then continue.

---

# 57. FIXED COLOR PREVIEW

Every Color Preview:

`72 × 48 px`

Radius:

`8 px`

Border:

`1 px #3A3A3A`

Applies to:

- Color Variables;
- Solid Styles;
- Transparent Styles;
- Gradient Styles.

---

# 58. TRANSPARENT PREVIEW

Checkerboard:

Tile:

`8 × 8`

A:

`#D9D9D9`

B:

`#F2F2F2`

Preserve actual alpha.

---

# 59. COLOR VARIABLES

Single Mode:

`Token Name | Mode | [Description] | Developer Token`

Multi Mode:

`Token Name | Mode 1 | Mode 2 | ... | [Description] | Developer Token`

---

# 60. COLOR VARIABLE NAME

Preferred Width:

`280 px`

Minimum:

`240 px`

Wrap enabled.

---

# 61. COLOR MODE CELL

Each Mode owns:

- Preview;
- Alias;
- resolved value;
- opacity.

Horizontal Auto Layout.

Width:

`Fill container`

Height:

`Fill container`

Gap:

`12 px`

Vertical Alignment:

`Center`

---

# 62. COLOR MODE STACK

Vertical.

Gap:

`4 px`

Example:

`→ Brand/Blue/50`

`#0E1C34`

`80%`

No empty layers.

---

# 63. COLOR VARIABLE FAIL-CLOSED ASSERTIONS

For every Color Variable Row require:

`Token Name exists`

`Actual Mode count == rendered Mode count`

`Every Mode Cell exists`

`Every Mode Preview exists`

`Every resolved value exists when source value exists`

`Developer Token exists`

If any fail:

Row is invalid.

---

# 64. PAINT STYLES

Use independent Paint Style renderer.

Table:

`Preview | Style Name | Type | Value | [Description] | Developer Token`

---

# 65. PAINT STYLE COLUMNS

Preview:

`96 px minimum`

Style Name:

`280 px preferred`

`240 px minimum`

Type:

`180 px minimum`

Value:

`Fill container`

Description:

`240 px minimum`

Developer Token:

`280 px minimum`

---

# 66. PAINT TYPE

Allowed:

`Solid`

`Transparent`

`Linear Gradient`

`Radial Gradient`

`Angular Gradient`

`Diamond Gradient`

`Multiple Paints`

---

# 67. SOLID PAINT

Type:

`Solid`

Value:

actual HEX

Example:

`#D9470F`

---

# 68. TRANSPARENT PAINT

Type:

`Transparent`

Value:

`HEX · opacity`

Example:

`#FFFFFF · 17%`

---

# 69. GRADIENT PAINT

Type contains actual gradient classification.

Value must contain real Gradient data.

Never use generic:

`Gradient`

as Value.

---

# 70. GRADIENT FAIL-CLOSED RULE

If:

`Type = Linear Gradient`

or any Gradient type,

the Row must not be finalized until actual gradient stops have been extracted.

`Value = "Gradient"`

is explicitly invalid.

`Value = "Linear Gradient"`

is explicitly invalid because Type already contains that information.

---

# 71. GRADIENT STOP EXTRACTION

Read actual Paint data.

Extract every stop.

For every stop preserve:

- position;
- color;
- opacity.

Format:

`Position · Color · Opacity`

Example:

`0% · #FF4700 · 100%`

`87% · #CC3900 · 100%`

---

# 72. GRADIENT DIRECTION

If reliably available:

show angle/direction above stops.

Do not invent it.

---

# 73. GRADIENT STOP COUNT ASSERTION

For every Gradient Row:

`sourceGradientStopCount > 0`

and:

`renderedGradientStopCount == sourceGradientStopCount`

must be true.

If false:

Row is invalid.

---

# 74. GRADIENT VALUE ASSERTION

Gradient Value Cell must contain:

all real Gradient stops.

It must never contain only:

- Gradient;
- Linear Gradient;
- Radial Gradient.

---

# 75. GRADIENT PREVIEW ASSERTION

Preview must visually use the actual source Gradient.

If source is Gradient but Preview is solid:

Row is invalid.

---

# 76. GRADIENT ROW

Standard Row.

Min Height:

`64 px`

Height:

`Hug contents`

Value stack gap:

`2 px`

No oversized card.

---

# 77. MULTIPLE PAINTS

If Style contains multiple Paints:

Type:

`Multiple Paints`

Value documents every Paint.

Never document only first Paint.

---

# 78. PAINT STYLE ID

Preserve:

`styleId`

through the entire pipeline.

---

# 79. PAINT STYLE FIRST ROW ASSERTION

For first Paint Style Row require:

`sourceKind = STYLE`

`styleType = PAINT_STYLE`

`styleId exists`

`Preview exists`

`Type exists`

`Value exists`

For Gradient:

`gradient stop count > 0`

Only then continue.

---

# 80. TYPOGRAPHY SOURCE SPLIT

Typography maintains two completely separate datasets:

`TYPOGRAPHY_VARIABLE_ROWS`

and:

`TEXT_STYLE_ROWS`

Never merge them before rendering.

---

# 81. TYPOGRAPHY TABLE VISUAL SCHEMA

Both use:

`Preview | Style Name | Font | Weight | Size | Line Height | Letter Spacing | [Description] | Developer Token`

Visual schema is shared.

Source application method is different.

---

# 82. TYPOGRAPHY COLUMNS

Preview:

`120 px minimum`

Style Name:

`260 px preferred`

`220 px minimum`

Font:

`140 px minimum`

Weight:

`120 px minimum`

Size:

`100 px minimum`

Line Height:

`110 px minimum`

Letter Spacing:

`120 px minimum`

Description:

`240 px minimum`

Developer Token:

`280 px minimum`

---

# 83. TYPOGRAPHY VARIABLE NORMALIZED ROW

Build:

`TypographyVariableRow = {`

`sourceKind: VARIABLE`

`collectionId`

`sourceVariableIds`

`name`

`fontFamily`

`fontStyle`

`fontWeight`

`fontSize`

`lineHeight`

`lineHeightUnit`

`letterSpacing`

`letterSpacingUnit`

`description`

`developerToken`

`}`

---

# 84. TYPOGRAPHY VARIABLE AGGREGATION

Example:

`Large Title / Regular / Font`

`Large Title / Regular / Weight`

`Large Title / Regular / Size`

`Large Title / Regular / Line Height`

`Large Title / Regular / Letter Spacing`

becomes one Row:

Group:

`Large Title`

Row:

`Regular`

Collect all source properties before rendering.

---

# 85. NO PARTIAL VARIABLE TYPOGRAPHY ROW

Do not render one property at a time.

Build complete normalized Row first.

---

# 86. TYPOGRAPHY VARIABLE PREVIEW

The Preview:

`Ag`

must actually use the resolved typography of its Row.

It is not a placeholder.

Apply:

- Font Family;
- Font Style / Weight;
- Font Size;
- Line Height;
- Letter Spacing.

---

# 87. TYPOGRAPHY VARIABLE PREVIEW STRUCTURE

`Preview Cell`
→ `Preview Container`
→ real Figma TEXT node

Characters:

`Ag`

---

# 88. VARIABLE PREVIEW TEXT GEOMETRY

Initial Width:

`96 px`

Minimum Width:

`96 px`

Height:

`Auto`

Text Auto Resize:

`Height only`

Absolute:

`False`

Clip:

`False`

Never:

`Hug width`

Never:

`Width = 0`

---

# 89. VARIABLE TYPOGRAPHY RENDER ORDER

1. Resolve complete TypographyVariableRow.
2. Resolve aliases.
3. Determine Font Family.
4. Determine Font Style / Weight.
5. Load exact font.
6. Create fresh TEXT.
7. Width = 96.
8. Auto Resize = Height only.
9. Set `Ag`.
10. Apply Font.
11. Apply Weight.
12. Apply Size.
13. Apply Line Height.
14. Apply Letter Spacing.
15. Set `Ag` again.
16. Read back actual TEXT properties.
17. Compare with Row.
18. Insert only after parity passes.

---

# 90. VARIABLE TYPOGRAPHY PROPERTY ASSERTIONS

When property exists in source require:

`Preview Font == Row Font`

`Preview Weight == Row Weight`

`Preview Size == Row Size`

`Preview Line Height == Row Line Height`

`Preview Letter Spacing == Row Letter Spacing`

Visible `Ag` is not sufficient.

---

# 91. VARIABLE TYPOGRAPHY GEOMETRY ASSERTION

Require:

`TEXT node exists`

`characters = Ag`

`width >= 96`

`height > 0`

`absolute position = false`

`visible = true`

`inside Preview Cell = true`

---

# 92. VARIABLE TYPOGRAPHY FALLBACK

Fallback only when actual source font cannot be loaded.

Fallback:

`Inter Regular 32`

Preview only.

Technical values preserve actual source.

---

# 93. TEXT STYLE NORMALIZED ROW

Build:

`TextStyleRow = {`

`sourceKind: STYLE`

`styleType: TEXT_STYLE`

`styleId`

`name`

`fontFamily`

`fontStyle`

`fontWeight`

`fontSize`

`lineHeight`

`letterSpacing`

`description`

`developerToken`

`}`

Never convert this into Variable Row.

---

# 94. TEXT STYLE STYLE-ID RULE

`styleId`

must survive:

- grouping;
- normalization;
- Developer Token generation;
- Table preparation;
- Preview rendering.

Do not discard it.

---

# 95. TEXT STYLE PREVIEW CORE RULE

A Text Style Row must use the actual source Text Style for its Preview.

Do not route it through Typography Variable renderer.

Do not use a generic `Ag`.

Do not consider the Row correct simply because Font / Weight / Size columns are populated.

---

# 96. TEXT STYLE RENDER ORDER

For every TextStyleRow:

1. assert `sourceKind = STYLE`;
2. assert `styleType = TEXT_STYLE`;
3. retrieve actual Style by `styleId`;
4. load required font;
5. create fresh real TEXT node;
6. set characters to `Ag`;
7. apply actual source Text Style to the TEXT node when direct Style application is available;
8. read back resulting TEXT;
9. verify Style application;
10. verify resulting typography;
11. insert Preview only after validation passes.

---

# 97. TEXT STYLE DIRECT APPLICATION IS PRIMARY

Primary path:

`Text Style ID`
→ `TEXT node`
→ `Apply actual Text Style`
→ `Ag`

Do not reconstruct the Style from unrelated Variable logic.

---

# 98. TEXT STYLE EXACT-PROPERTY FALLBACK

If direct Style application is technically unavailable:

fallback may reconstruct the Preview from the exact properties of that actual Text Style.

This fallback is allowed only after attempting actual Style application.

It must use:

- Style Font Family;
- Style Font Style / Weight;
- Style Size;
- Style Line Height;
- Style Letter Spacing.

It must still preserve the original:

`styleId`

in the Row data.

Never use generic typography.

---

# 99. TEXT STYLE PREVIEW FAIL-CLOSED RULE

A Text Style Row is invalid if the Preview Cell is empty.

Do not continue with the next Row.

Do not continue with the next Group.

Repair the first failed Style Preview.

---

# 100. TEXT STYLE PREVIEW CHILD ASSERTION

For every Text Style Preview require:

`Preview Cell child count > 0`

and:

`Preview contains TEXT node`

and:

`TEXT.characters == "Ag"`

If any fail:

Row is invalid.

---

# 101. TEXT STYLE PROPERTY ASSERTION

When source property exists require:

`Preview Font == Text Style Font`

`Preview Weight == Text Style Weight`

`Preview Size == Text Style Size`

`Preview Line Height == Text Style Line Height`

`Preview Letter Spacing == Text Style Letter Spacing`

---

# 102. TEXT STYLE BLANK PREVIEW RULE

The following output is explicitly invalid:

Header:

`Preview | Style Name | Font | ...`

Rows:

Preview Cell empty

Style Name populated

Font populated

Weight populated

This must never be finalized.

---

# 103. TEXT STYLE REPAIR

If Preview is empty or wrong:

delete the generated Preview.

Create a fresh TEXT node.

Apply actual source Style or exact Style properties.

Read back.

Validate again.

---

# 104. VARIABLE VS STYLE TYPOGRAPHY PIPELINES

Variable:

`Variable Values`
→ normalized Row
→ apply resolved properties to Ag

Style:

`Actual Text Style`
→ apply Style to Ag

Never swap them.

---

# 105. TYPOGRAPHY SOURCE BLOCK RESET

When transition occurs:

`Typography Variables`
→ `Styles`

do:

Finish Variable Table
→ validate
→ close Table
→ reset all renderer state
→ load TEXT_STYLE dataset
→ assert Style source
→ initialize Text Style Renderer
→ new Table
→ validate first Style Row
→ continue

---

# 106. TYPOGRAPHY FIRST STYLE ROW GATE

Before rendering all Text Styles:

the first Text Style Row must prove:

`Preview Cell not empty`

`TEXT node exists`

`characters = Ag`

`source styleId preserved`

`Style properties match`

If not:

stop.

---

# 107. TYPOGRAPHY FOUNDATION FINAL ASSERTION

For Variable Source Blocks:

all Rows must be `VARIABLE`.

For Styles:

all Rows must be `STYLE + TEXT_STYLE`.

No Text Style Row may pass through Variable renderer.

No Variable Row may pass through Style renderer.

---

# 108. OTHER PREVIEW SIZES

Spacing:

`120 × 48`

Sizing:

`96 × 64`

Radius:

`48 × 48`

Border:

`96 × 48`

Opacity:

`96 × 48`

Effect:

`96 × 64`

---

# 109. SPACING VARIABLES

Mode-aware.

Single:

`Token Name | Mode | [Description] | Developer Token`

Multi:

`Token Name | Mode 1 | Mode 2 | ... | [Description] | Developer Token`

---

# 110. SIZING VARIABLES

Same Mode-aware structure.

---

# 111. RADIUS VARIABLES

Same Mode-aware structure.

Preview uses same sample shape.

Only radius changes.

---

# 112. BORDER VARIABLES

Same Mode-aware structure.

Only Stroke properties change.

---

# 113. OPACITY VARIABLES

Same Mode-aware structure.

Preserve actual opacity.

---

# 114. OTHER VARIABLES

String and Boolean Variables:

`Other Variables`

Mode-aware Tables.

---

# 115. EFFECT STYLES

Table:

`Preview | Style Name | Effect Data | [Description] | Developer Token`

---

# 116. EFFECT DATA

Compact stack:

`Drop Shadow`

`X 0 · Y 4`

`Blur 16 · Spread 0`

`#000000 · 16%`

---

# 117. GRID & LAYOUT

Use separate property columns.

Table:

`Style Name | Columns | Column Size | Gutter | Alignment | Margin | [Description] | Developer Token`

Never create one Grid Data stack.

---

# 118. GRID COLUMNS

Style Name:

`220 px minimum`

Columns:

`90 px`

Column Size:

`120 px`

Gutter:

`100 px`

Alignment:

`120 px`

Margin:

`100 px`

Description:

`240 px`

Developer Token:

`280 px`

---

# 119. GRID VALUES

Columns:

`12`

not:

`12 Columns`

Column Size:

`116px`

or:

`Stretch`

Gutter:

`24px`

Alignment:

`Center`

Margin:

`Auto`

---

# 120. GRID TOKEN RANGES

Preserve range separators.

`1919–1536px`

→

`--grid-1919-1536`

Never:

`--grid-19191536`

---

# 121. GRID RANGE NORMALIZATION

Treat:

`-`

`–`

`—`

as separators.

Normalize:

`-`

Remove:

`px`

Preserve both numbers.

---

# 122. GRID TOKEN EXAMPLES

`1920px and above`
→ `--grid-1920-up`

`1919–1536px`
→ `--grid-1919-1536`

`1535–1280px`
→ `--grid-1535-1280`

`1279–1024px`
→ `--grid-1279-1024`

`1023–960px`
→ `--grid-1023-960`

`959–768px`
→ `--grid-959-768`

`767–360px`
→ `--grid-767-360`

---

# 123. DEVELOPER TOKEN PREFIXES

Colors:

`--color-`

Typography:

`--font-`

Spacing:

`--space-`

Sizing:

`--size-`

Radius:

`--radius-`

Opacity:

`--opacity-`

Border:

`--border-`

Grid:

`--grid-`

Effect:

`--effect-`

Other:

`--var-`

---

# 124. TOKEN CHARACTER RULES

Tokens:

- lowercase;
- no spaces;
- no `/`;
- no `.`;
- no `_`;
- no duplicate hyphens;
- unique;
- stable.

---

# 125. REDUNDANT SEGMENTS

`Orange/orange.default`

→

`--color-orange`

---

# 126. ABBREVIATIONS

When reliable:

`btn → button`

`bg → background`

`txt → text`

---

# 127. DEFAULT STATE

Standalone:

`orange.default`
→ `--color-orange`

State family:

`button/primary/default`
→ `--color-button-primary-default`

---

# 128. GRADIENT TOKEN

If actual Paint is Gradient:

`btn.orange.gr.default`

→

`--color-button-orange-gradient-default`

Do not infer Gradient from name alone.

---

# 129. TRANSPARENCY TOKEN

`cream.transparent.06`

→

`--color-cream-alpha-06`

---

# 130. SEMANTIC TOKEN

`Labels/Primary`

→

`--color-labels-primary`

Do not replace semantic name with primitive alias.

---

# 131. TYPOGRAPHY TOKEN

`heading.48`

→

`--font-heading-48`

`Large Title / Regular`

→

`--font-large-title-regular`

---

# 132. TOKEN COLLISION

Preserve meaningful hierarchy.

Never append arbitrary:

- 2;
- copy;
- new.

---

# 133. INTERNAL COMPONENTS

Create or reuse:

`Docs / Section`

`Docs / Source Block`

`Docs / Group`

`Docs / Group Title`

`Docs / Table Shell`

`Docs / Table Header`

`Docs / Table Body`

`Docs / Variable Row`

`Docs / Paint Style Row`

`Docs / Typography Row`

`Docs / Grid Row`

`Docs / Effect Row`

`Docs / Mode Cell`

`Docs / Preview / Color`

`Docs / Preview / Typography`

`Docs / Preview / Spacing`

`Docs / Preview / Sizing`

`Docs / Preview / Radius`

`Docs / Preview / Border`

`Docs / Preview / Opacity`

`Docs / Preview / Effect`

---

# 134. COMPLETE DATASET RULE

Collect all source Rows before rendering the Group.

Never discover new Rows during Table drawing.

---

# 135. ROW COUNT ASSERTION

Require:

`Rendered Row Count == Prepared Source Row Count`

---

# 136. MODE COUNT ASSERTION

For Variables require:

`Rendered Mode Count == Source Mode Count`

---

# 137. DESCRIPTION ASSERTION

If source Description exists in Table:

column must exist.

If no Description exists:

column must not exist.

---

# 138. GENERAL PREVIEW ASSERTION

When Table schema includes Preview:

every Row must contain a valid Preview.

Empty Preview Cell = invalid Row.

---

# 139. TEXT WRAPPING ASSERTION

Verify all:

- Names;
- Tokens;
- Description

remain fully visible.

No ellipsis.

No clipping.

---

# 140. WIDTH ASSERTION

Require:

Header width = Table width

Body width = Table width

Row width = Table width

Column schema aligned

No required child outside Table

---

# 141. HEIGHT ASSERTION

Require:

Rows use content-driven height

Table Body uses Hug contents

Table Shell uses Hug contents

Final Row fully visible

---

# 142. TABLE RADIUS ASSERTION

Require:

Shell radius = 8

Shell clip = true

Header radius = 0

Body radius = 0

Row radius = 0

Top corners visible

Bottom corners visible

---

# 143. LAST ROW ASSERTION

Require:

`lastRow.bottomDivider == NONE`

---

# 144. READ-BACK VALIDATION

After rendering a Row:

read the generated output back.

Do not validate only the intended input data.

Validate the actual created layers.

---

# 145. GRADIENT READ-BACK CONTRACT

After rendering Gradient Row read back:

- Preview;
- Type;
- Value.

Require:

Type = actual Gradient type

Value stop count = source stop count

Preview uses actual Gradient

If not:

rebuild Row.

---

# 146. TEXT STYLE READ-BACK CONTRACT

After rendering Text Style Row read back:

- Preview Cell;
- TEXT node;
- characters;
- actual typography.

Require:

Preview child exists

TEXT exists

characters = Ag

typography matches source Style

If direct Style application was available:

Style application must be present.

---

# 147. TYPOGRAPHY VARIABLE READ-BACK CONTRACT

Require Preview TEXT properties to match normalized Variable Row.

Do not trust the technical Table values alone.

---

# 148. AUTOMATIC HORIZONTAL REPAIR

1. fix wrapping;
2. grow Cell;
3. redistribute;
4. grow Table;
5. grow Section.

---

# 149. AUTOMATIC VERTICAL REPAIR

1. fix Auto Height;
2. grow Row;
3. grow Body;
4. grow Shell;
5. grow Section.

---

# 150. GRADIENT REPAIR

If Gradient Value is generic or empty:

discard the generated Value.

Re-read actual Paint Style.

Extract every stop.

Rebuild Value.

Validate stop count.

---

# 151. TEXT STYLE REPAIR

If Text Style Preview is empty:

discard the Row Preview.

Recreate fresh TEXT.

Set Ag.

Apply actual Style.

Read back.

Validate.

Do not continue until valid.

---

# 152. TYPOGRAPHY VARIABLE REPAIR

If Preview typography differs:

delete Preview TEXT.

Create fresh TEXT.

Reapply full normalized Row.

Read back.

Validate.

---

# 153. REPAIR LIMIT

Use structured repair.

Attempt 1:

repair child configuration.

Attempt 2:

rebuild Row.

Attempt 3:

rebuild Table renderer from clean source dataset.

Do not endlessly repeat the same broken action.

---

# 154. COMPLETION GATE

The skill may finish only when:

`All source entities represented = True`

`All Rows use correct sourceKind = True`

`No Style rendered by Variable renderer = True`

`No Variable rendered by Style renderer = True`

`All Modes rendered = True`

`All required Previews exist = True`

`All Gradient Rows contain real stops = True`

`No Gradient Value equals generic "Gradient" = True`

`All Text Style Preview Cells contain TEXT = True`

`All Text Style Preview characters equal Ag = True`

`All Text Style Previews match source Style = True`

`All Typography Variable Previews match normalized Variable typography = True`

`No required text Width = 0 = True`

`No required text Height = 0 = True`

`No source Name clipped = True`

`No Developer Token clipped = True`

`No Description clipped = True`

`No required content outside Cell = True`

`Last Row divider removed = True`

`Table radius correct = True`

`Final Row visible = True`

If any condition is false:

do not finalize.

---

# 155. VISUAL CHECKSUM

Fixed values:

`PAGE_BG = #333333`

`SECTION_WIDTH_DEFAULT = 1440`

`SECTION_BG = #0F0F0F`

`SECTION_RADIUS = 16`

`SECTION_PADDING = 48`

`SECTION_GAP = 160`

`TABLE_BG = #181818`

`TABLE_HEADER_BG = #222222`

`TABLE_RADIUS = 8`

`ROW_DIVIDER = #2A2A2A`

`LAST_ROW_DIVIDER = NONE`

`TITLE_FONT = Inter / 600 / 28`

`BODY_FONT = Inter / 400 / 13`

`META_FONT = Inter / 400 / 12`

`TOKEN_COLOR = #6EA8E5`

`COLOR_PREVIEW = 72 × 48`

`TYPOGRAPHY_PREVIEW_INITIAL_WIDTH = 96`

`TYPOGRAPHY_PREVIEW_MIN_HEIGHT = 56`

Do not change between executions.

---

# 156. EXPLICITLY INVALID OUTPUTS

The following are invalid and must be repaired:

Gradient Row:

`Type = Linear Gradient`

`Value = Gradient`

Invalid.

---

Gradient Row:

`Type = Linear Gradient`

`Value = empty`

Invalid.

---

Text Style Row:

Style Name populated

Font populated

Weight populated

Preview empty

Invalid.

---

Text Style Row:

Preview contains generic `Ag`

but source Text Style properties are not applied

Invalid.

---

Typography Variable Row:

Preview visible

but Preview Font / Weight / Size do not match Row

Invalid.

---

Any Row:

Developer Token partially clipped

Invalid.

---

Any Row:

long Name extends into next column

Invalid.

---

Any Table:

last Row has divider

Invalid.

---

# 157. FORBIDDEN OUTPUTS

Never leave:

- generic Gradient Value;
- missing Gradient stops;
- empty Text Style Preview;
- generic Text Style Preview;
- Text Style routed through Variable renderer;
- Variable routed through Style renderer;
- lost styleId;
- fake styleId;
- Width = 0 Preview;
- Height = 0 Preview;
- Typography Preview using Hug width;
- manual Text Tool required;
- clipped Names;
- clipped Tokens;
- omitted Modes;
- omitted Rows;
- final Row divider;
- broken Table corners;
- random layout redesign;
- Page background other than #333333.

---

# 158. CRITICAL RULES

Source entity type always wins.

Labels never determine renderer.

Every Source Block begins from clean renderer state.

Variables and Styles never share source pipelines.

Paint Style Gradient Rows must contain actual Gradient stops.

`Value = Gradient`

is never acceptable.

Text Styles must generate a real `Ag` Preview.

The actual Text Style is the primary source for that Preview.

A populated technical Row with an empty Preview is invalid.

Typography Variables must apply resolved typography directly to `Ag`.

Visible Preview alone is not proof of correctness.

Always read the generated result back.

Always compare generated output against source data.

If it does not match:

repair it before continuing.

---

# FINAL INSTRUCTION

Instantiate the locked documentation system.

Do not creatively redesign it.

Use:

`Discover Actual Figma Source`
→ `Separate Variables and Styles`
→ `Normalize`
→ `Route Correct Renderer`
→ `Render First Row`
→ `Read Back`
→ `Assert`
→ `Repair Until Valid`
→ `Render Complete Table`
→ `Read Back Complete Table`
→ `Assert`
→ `Finalize`

Do not stop when Figma says the layers were created.

Stop only when the actual generated documentation passes every blocking assertion.

The final result must be:

consistent, compact, complete, fully visible, source-correct, renderer-correct, technically accurate, visually stable, and developer-ready.

---

*Адаптировано из скилла Figma Community `design-system-documentation`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/design-docs).*

