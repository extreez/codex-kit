> Часть скилла design-docs (см. SKILL.md — предупреждение про CONFLICTS.md с variable-library.md). Ниже — оригинальный файл целиком (у него уже был свой frontmatter в источнике, он не является отдельной точкой входа в этом блоке — входная точка design-docs/SKILL.md).

---
name: design-system-gen
description: Create a design system from selected brand assets — extracts actual fonts, colors, and styles before generating
---

# Design System Generator

## Step 1: Extract properties from selected layers (REQUIRED — do this before anything else)

Use evaluate_script to inspect ALL selected layers and extract:
- Exact font families and styles (fontName)
- Font sizes and weights used
- Fill colors (hex values)
- Stroke colors and weights
- Corner radii
- Any other distinctive visual properties

Store these extracted values and use them as the source of truth for the entire design system. NEVER substitute "similar" fonts or colors — use exactly what was found.

## Step 2: Generate the design system

Refer attached assets. Create a simple design system consisting of buttons, input fields, switch fields, radios, checkboxes, modals, text and color tokens.

Requirements:
- Use the EXACT typefaces and colors extracted in Step 1
- 2-level token system (primitives → semantic)
- Follow accessibility standards — every color pairing must have at least 4:1 contrast ratio (WCAG AA)
- Light and dark mode variants
- All components shown in both modes

---

*Адаптировано из скилла Figma Community `design-system-gen`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/design-docs).*

