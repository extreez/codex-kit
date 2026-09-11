---
name: ios-app-design
description: >-
  Проектирует или обновляет реальные, editable, production-ориентированные
  iOS-интерфейсы в Figma, которые выглядят как часть существующего продукта
  (не дженерик-шаблон, не имитация Apple). Управляет продуктовым мышлением
  и качеством дизайна поверх Apple HIG. Использовать по фразам «сделай iOS
  экран», «спроектируй флоу под iPhone», «обнови этот iOS-экран по
  гайдлайнам». Сам по себе не пишет на холст — требует companion-скиллы
  figma-use / figma-generate-design / figma-generate-library из плагина
  figma (см. блок figma-mcp), явно ссылается на них по имени.
---

> Не переведено — см. [`../README.md`](../README.md) за общим правилом.
> Здесь конкретно: чек-лист и порядок фаз (Screen Contract → Discovery →
> Model → Design → Validate), QA-гейты.

# iOS app design

Create or update **real, editable, production-oriented iOS interfaces in Figma**. The output must look and behave as if it belongs to the existing product — not like a generic template, a Dribbble concept, or a visual imitation of Apple apps.

This skill governs product reasoning and design quality. For Figma execution rules, also load the required Figma skills listed below.

## 0. Required companion skills

Before any Figma write operation:

1. Load `figma-use` before every `use_figma` call.
2. Load `figma-generate-design` when creating or updating a complete screen, sheet, modal, panel, or multi-section view.
3. Load `figma-generate-library` when creating or modifying any reusable component, component set, variables, styles, or design-system foundations.
4. Use `get_screenshot` and `get_metadata` for visual and structural validation.
5. Use `search_design_system` only after inspecting local components and existing screens, following the discovery order in this skill.

Always include the loaded skill names in the `skillNames` parameter required by the Figma tools.

Communicate in the user's language. When a target Figma file is available and the user asks for design work, default to editing the file rather than returning only written recommendations. If no writable target file is available, complete the Screen Contract and discovery plan, then state the single missing file input without pretending the design was drawn.

For platform rules that may have changed, consult `references/official-sources.md` and prefer current official Apple and Figma documentation.

## 1. Core operating principle

Treat the product's design system as the **visual source of truth** and Apple HIG as the **platform behavior, usability, and accessibility baseline**.

Do not make the interface “more Apple-like” by copying Apple aesthetics, introducing glass, gradients, large titles, floating controls, SF Symbols, or native components that the product does not otherwise use. Apply Apple guidance through familiar behavior, hierarchy, touch ergonomics, accessibility, navigation, content clarity, and system integration.

### Source-of-truth priority

Use this order when making decisions:

1. Explicit user request and product goal.
2. Current production behavior, product requirements, and source code when available.
3. Approved design-system components, semantic tokens, variables, styles, and documentation.
4. The closest approved or shipped screens in the same product.
5. Apple Human Interface Guidelines for the target platform and supported OS versions.
6. General usability heuristics and design judgment.

An accessibility, safety, or platform-behavior problem must never be copied silently. Preserve the product language where possible, identify the conflict, and propose the smallest compatible correction.

## 2. Non-negotiable rules

1. **Inspect before designing.** Do not mutate the canvas until the discovery checklist is complete.
2. **Reuse before creating.** Prefer existing component instances, variables, text styles, effect styles, icons, and established compositions.
3. **Never detach an instance** merely to make editing easier.
4. **Never hardcode a value** when an appropriate design-system token or style exists.
5. **Never overwrite an approved screen** unless the user explicitly asks for direct modification. Default to a duplicate or a new exploration frame.
6. **Never introduce a new visual pattern** just because it appears more modern or attractive.
7. **Never stop at the happy path.** Design all relevant states and edge cases.
8. **Never use rasterized or AI-generated UI** for buttons, controls, cards, navigation, icons, or typography. Core UI must remain editable Figma structure.
9. **Never fabricate product content or behavior** when a reliable source exists in the file, requirements, or code.
10. **Never present an unvalidated result as final.** Every final screen requires visual, structural, interaction, accessibility, content, and implementation QA.

## 3. Phase A — Understand the task

Before opening or editing Figma, form a concise **Screen Contract**.

Record:

- Product and feature.
- Target platform: iPhone, iPad if relevant, supported OS range if known.
- Screen or flow name.
- User's job to be done.
- Entry point and exit points.
- Primary user action.
- Secondary actions.
- Information the user needs before acting.
- Data or content displayed.
- Navigation model.
- Whether the screen scrolls.
- Whether the keyboard, media, camera, microphone, permissions, payments, or other system UI is involved.
- Required states and edge cases.
- Known technical or business constraints.
- What is explicitly in scope and out of scope.

Do not force a clarification for minor ambiguity. Infer from product context, neighboring screens, and established patterns, then list the assumption. Ask only when a genuine decision fork would materially change the user flow, data model, or irreversible behavior.

Use the template in `references/screen-contract-template.md`.

## 4. Phase B — Discover the product design language

Complete all items below before creating or modifying nodes.

### B1. Inspect the file structure

Identify:

- Target file, page, section, and selected node if available.
- Pages containing screens, flows, archived work, components, foundations, icons, prototypes, and documentation.
- Canonical device frame sizes used by the product.
- Naming conventions for pages, frames, layers, components, and variants.
- Where approved work ends and explorations begin.

### B2. Inspect the design system

Map the available:

- Variable collections and modes.
- Primitive and semantic color tokens.
- Spacing, sizing, radius, opacity, timing, and motion tokens.
- Text styles and font families.
- Effect styles.
- Grid and layout conventions.
- Components and component sets.
- Component properties: variant, text, boolean, and instance-swap properties.
- Icon source and icon sizing rules.
- Light and dark appearance modes.
- Accessibility-specific modes or tokens if present.
- Linked and available team libraries.

For each needed component, use this discovery order:

1. Existing local instance on a relevant screen.
2. Existing local component or component set.
3. Published product library already linked to the file.
4. Approved organization library.
5. Apple UI kit or SF Symbols only when consistent with the product.
6. A new local proposed component as the final option.

### B3. Inspect reference screens

Inspect at least the closest **three** approved screens when available. Rank references by:

1. Same flow or feature.
2. Same interaction pattern.
3. Same content structure.
4. Similar information density.
5. Most recent approved implementation.

Capture screenshots of the whole reference screens and close views of important components.

Extract a **Design DNA Map**:

- Screen background and surface hierarchy.
- Safe-area behavior.
- Horizontal margins and section spacing.
- Vertical rhythm.
- Typography hierarchy.
- Content density.
- Corner-radius language.
- Border, divider, shadow, blur, and material usage.
- Icon family, optical size, stroke/fill style, and placement.
- Button hierarchy and placement.
- Navigation pattern.
- Card and list patterns.
- Form patterns.
- Sheet, alert, menu, and confirmation patterns.
- Loading, empty, error, success, offline, and disabled states.
- Motion and haptic conventions when visible in prototypes or code.
- Voice and tone of interface copy.

Record the source of every important decision: component name, variable name, style name, reference screen, code location, or HIG rule.

### B4. Resolve conflicts

When the design system, source code, and existing screens disagree:

- Prefer the currently shipped or explicitly approved behavior.
- Prefer semantic tokens over copied visual values.
- Prefer the newer established pattern over a one-off legacy screen.
- Do not silently mix competing patterns.
- Record the conflict and chosen resolution in the decision ledger.

### Discovery exit criteria

Do not draw until all of the following are known or explicitly marked unavailable:

- Canonical screen width.
- Product font and text styles.
- Semantic color and spacing sources.
- Closest reference screens.
- Required components and their source.
- Navigation pattern.
- Primary action hierarchy.
- Relevant state matrix.
- Working page or safe placement for the new design.

Use `references/design-system-discovery.md` for the exact checklist.

## 5. Phase C — Model the experience before drawing

Translate the Screen Contract into a screen model.

### C1. Information hierarchy

Define, in order:

1. What the user must notice first.
2. What they need to understand.
3. What decision or action follows.
4. What supporting details can be deferred.
5. What is optional, advanced, or secondary.

Use progressive disclosure. Do not place every possible option on the first screen.

### C2. Action hierarchy

For every action, classify it as:

- Primary.
- Secondary.
- Tertiary or inline.
- Destructive.
- Navigation.
- System or contextual action.

A single decision context should normally have one visually dominant primary action. Do not invent a primary CTA when the screen is primarily for reading, browsing, monitoring, or passive progress.

### C3. State matrix

Mark each state as Required, Not applicable, or Deferred with a reason:

- Default.
- Initial loading.
- Incremental loading or pagination.
- Empty.
- Error with recovery.
- Offline or poor connection.
- Permission not requested.
- Permission denied or restricted.
- Disabled or unavailable action.
- Validation error.
- Partial completion.
- Success or confirmation.
- Destructive confirmation.
- Long content and long localized strings.
- Large Dynamic Type.
- Dark appearance.
- Keyboard visible.
- Smallest supported device.
- Largest supported device.
- Reduced motion or reduced transparency where relevant.

Do not create irrelevant states merely to fill a checklist, but never omit a state that can realistically block the task.

## 6. Phase D — Design the screen in Figma

### D1. Safe placement

Unless direct modification is explicit:

- Duplicate the nearest approved screen or create a new frame near the references.
- Place work on an existing exploration page or a clearly named `AI Explorations` section.
- Keep the approved original intact.
- Name the frame using the product's convention. If none exists, use:
  `AI / <Flow> / <Screen> / v<YYYY-MM-DD>`.

### D2. Build the wrapper first

Create the root screen frame before its sections.

- Match the canonical device width used in the file.
- Use the product's safe-area and navigation conventions.
- Use Auto Layout for the screen and every structurally related container.
- Use absolute positioning only for true overlays, floating decorations, or intentionally layered media.
- Build one major section per `use_figma` call.
- Return every created or mutated node ID.
- Validate each section with a screenshot before continuing.

### D3. Use the design system correctly

- Instantiate existing components rather than recreating them.
- Use component properties to set labels, icons, state, size, and style.
- Bind fills, strokes, text colors, gaps, padding, radius, opacity, and effects to existing variables or styles.
- Preserve library links.
- Use semantic tokens, not primitive color values, in composed UI.
- Match the product's typography styles exactly.
- Use the product's icon component or source SVG. Do not redraw icons from lines and shapes.
- Use SF Symbols only when no product icon exists and the symbol matches the established icon language.
- Keep repeated content componentized.
- Create a new component only when no compatible component exists and the pattern is reusable or repeated.
- Put new components in a clearly labeled `Proposed` area and do not publish them without explicit approval.

### D4. Content and data

- Use real supplied copy or realistic product copy, never Lorem Ipsum.
- Preserve the product's voice and terminology.
- Use realistic data lengths, values, names, dates, prices, and error messages.
- Include at least one localization stress case when text expansion could break the layout.
- Do not rely on placeholder text as the only field label.
- Do not truncate essential information merely to protect the layout.

### D5. Prototype key behavior

Prototype the interactions needed to understand or validate the flow:

- Primary action.
- Back, close, cancel, and dismissal behavior.
- Navigation to the next meaningful state.
- Selection and deselection.
- Expansion and collapse.
- Loading to success or error when important.
- Destructive confirmation.
- Keyboard or sheet behavior when it affects layout.

Do not prototype every decorative microinteraction. Prototype the behavior that removes ambiguity for product, engineering, or research.

## 7. iOS interaction and component rules

Use the detailed rules in `references/ios-pattern-rules.md`. The following are mandatory defaults.

### Buttons and actions

- Use a hit region of at least 44 × 44 pt for interactive controls.
- Use specific, verb-led labels: `Save changes`, `Continue`, `Delete account`, not vague labels like `OK` when the action can be named.
- Keep short button labels free of unnecessary punctuation.
- Preserve button dimensions during loading to avoid layout jumps.
- Prevent repeated submission while an action is in progress.
- Separate destructive actions from safe primary actions and label them explicitly.
- Confirm irreversible or high-impact destructive actions.
- Use icon-only buttons only for familiar actions or constrained toolbars; document the accessibility label.
- Do not use a disabled state without making the reason understandable.

### Navigation and modality

- Use tab bars for persistent top-level destinations, not task steps.
- Use hierarchical push navigation for drill-down content.
- Use sheets for focused secondary tasks that benefit from retaining context.
- Use full-screen presentation for immersive or substantial multi-step tasks.
- Use alerts for brief, important, blocking decisions.
- Use an action sheet or menu for choices related to an intentional action instead of overloading an alert.
- Avoid stacking modals and avoid trapping the user without a visible dismissal path.
- Preserve state when the user returns from a secondary view.

### Inputs and selection

- Use toggles for immediate binary state changes.
- Do not use a toggle when the change requires a separate confirmation step.
- Use segmented controls for a small set of peer choices.
- Use menus, pickers, or selection lists for longer option sets.
- Use the correct keyboard and content type for the expected input.
- Keep field labels visible when entered content replaces the placeholder.
- Validate close to the field and provide a recovery path.
- Keep controls close to the content they affect.

### Typography and content

- Use existing product text styles; do not create ad hoc sizes to make a layout fit.
- Support Dynamic Type behavior and verify the screen at large accessibility sizes.
- Maintain a clear hierarchy with the fewest necessary type levels.
- Prefer concise, plain language.
- Use sentence case unless the product's established content system specifies otherwise.
- Avoid using color alone, font weight alone, or position alone to communicate a critical state.

### Color, materials, and icons

- Use semantic product colors and appearance modes.
- Verify contrast on the actual background and in every supported appearance.
- Do not introduce glass, blur, gradient, shadow, or translucency unless the product already uses it or the task explicitly requires it.
- Preserve image aspect ratios.
- Prefer existing icons; otherwise use a compatible SF Symbol or imported source SVG.
- Match optical weight and size to neighboring icons, not merely the nominal bounding box.

### Motion and haptics

- Use motion to explain hierarchy, continuity, cause, and result.
- Avoid decorative motion that delays task completion.
- Provide a reduced-motion interpretation for essential transitions.
- Use haptics only for meaningful confirmation, warning, boundary, or result feedback when consistent with the product.
- Do not trigger haptics for every ordinary tap.

## 8. Accessibility requirements

Every final design must include an accessibility pass.

Verify:

- Interactive targets are at least 44 × 44 pt.
- Adjacent controls have enough separation to avoid accidental activation.
- Text and meaningful icons remain legible at large Dynamic Type sizes.
- Layout reflows instead of clipping or overlapping.
- Color is not the only carrier of meaning.
- Text and controls have sufficient contrast against their actual backgrounds.
- VoiceOver reading order is logical.
- Icon-only controls have explicit accessibility labels.
- Grouped information is represented as a meaningful accessibility unit where appropriate.
- State changes and errors can be announced.
- Images that convey meaning have an accessibility description; decorative imagery is ignored.
- Reduce Motion, Increase Contrast, and Reduce Transparency are considered where relevant.
- The design remains understandable without relying exclusively on audio, haptics, animation, or gesture discovery.

Accessibility problems are not polish issues. Treat critical issues as blockers.

## 9. Implementation feasibility

Design for implementation, not only presentation.

- Prefer patterns that map cleanly to SwiftUI or UIKit.
- Use points and product tokens rather than arbitrary pixel measurements.
- Respect safe areas, keyboard avoidance, scrolling, content insets, and system gestures.
- Ensure the layout can handle live data and asynchronous updates.
- Avoid fixed-height text containers unless the content is guaranteed.
- Avoid impossible blur, masking, blend, or animation effects without an implementation note.
- Document custom behavior that differs from a native control.
- Keep component APIs coherent with existing design-system variants and properties.
- When code is available, compare the Figma component model with the implementation model and record mismatches.

## 10. Validation workflow

Validate incrementally and at the end.

### After each major section

1. Capture a screenshot.
2. Check text clipping, overlaps, spacing, alignment, and incorrect component variants.
3. Check font family and text style.
4. Check bound variables and component instances.
5. Fix targeted issues before building the next section.

### Final visual QA

Compare the new screen side-by-side with the closest reference screens.

Check:

- Does it clearly belong to the same product?
- Is hierarchy understandable in three seconds?
- Is the primary action appropriately dominant?
- Are margins, spacing rhythm, type scale, radii, surfaces, icons, and control density consistent?
- Is any decorative treatment new without justification?
- Are all states visually coherent?
- Is any placeholder, sample title, missing image, or temporary copy still present?

### Final structural QA

Check:

- Root and major containers use Auto Layout.
- Repeated patterns are components or instances.
- No accidental detached instances.
- No hardcoded duplicates where tokens exist.
- No unnamed or misleading layers in the handoff path.
- Component properties are used instead of deep manual overrides.
- Text styles, effect styles, and variables are bound correctly.
- Prototype links work.
- Created and mutated node IDs are recorded.

### Final experience QA

Check:

- Entry and exit are clear.
- Back, close, cancel, retry, and destructive paths are defined.
- Loading, empty, error, offline, permission, and validation behavior is covered when relevant.
- The screen remains usable with the keyboard visible.
- Small and large supported devices are considered.
- Long text and localization do not break the layout.
- Accessibility requirements pass.
- The interaction can be implemented without hidden assumptions.

Use `references/qa-checklist.md` as the final gate.

## 11. Required final deliverables

When Figma work is complete, provide:

1. The final screen or flow frames in Figma.
2. Relevant state frames or component variants.
3. Prototype connections for the key path.
4. A concise design rationale tied to product references and HIG, not personal taste.
5. A list of reused components, variables, and styles.
6. A list of proposed new components or tokens, clearly separated from the approved library.
7. Assumptions and unresolved product decisions.
8. Accessibility and implementation notes.
9. Validation performed and any remaining risks.

Keep the user-facing summary compact. The Figma structure is the primary deliverable.

## 12. Completion criteria

The task is complete only when:

- The result is editable, structured Figma UI rather than a flattened picture.
- The product design system is reused correctly.
- The design matches neighboring approved screens.
- Platform behavior follows current Apple guidance for the supported OS range.
- Relevant non-happy-path states exist.
- Accessibility has been checked.
- The layout survives realistic data, localization, and Dynamic Type stress.
- The design is feasible to implement.
- Screenshots and metadata have been reviewed after the final changes.
- No critical QA issue remains unresolved or unreported.

---

*Адаптировано из скилла Figma Community `ios-app-design`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/ios-app-design). Ссылается на компаньон-скиллы `figma-use`/`figma-generate-design`/`figma-generate-library` из официального плагина figma — см. блок `figma-mcp`.*

