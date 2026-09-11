> Часть скилла checklist-design (см. SKILL.md). Порт checklist.design (Figma Community, bundle v3.2.0), лицензия не заявлена, дословно.

### Tokens — Design system

The layer of a design system where defined variables are outlined across the platform to enable consistency, theming and alignment with code.

Source: https://www.checklist.design/design-system/tokens

#### Items

##### Three-tier token architecture
Tokens organised into primitive, semantic, and component tiers — primitives store raw values, semantic tokens describe purpose, component tokens scope to a specific element

_Tip: It's okay to start with just primitives and component tokens first, and only utilise semantic for theming_

##### Naming convention
A consistent, predictable naming pattern so any token name communicates its purpose without documentation.

_Tip: A token named blue-500 tells you the value, but a token named color-interactive-primary-default tells you when and where to use it, making that system the scalable one_

##### Token documentation
Each semantic token documented with its intended use, example contexts, and what it can't be used for

##### Token governance
A clear rule for what counts as a token versus a hardcoded value, and a process for reviewing new tokens before they're added

_Tip: New tokens should always be suggested, but have clear reasoning of purpose and scalable use to be genuinely considered_

##### Design tool sync
Tokens maintained in your design tool of choice as variables

_Tip: Aim to find a way to connect your tokens to what is in code — naming convention being 1:1 is ideal for ongoing maintenance_

##### Versioning and changelog
Token changes versioned and communicated so consuming teams know when values change and what the impact will be

---

### Typography — Design system

The type layer of a design system that defines a scale, hierarchy, and set of text styles that is consistent, accessible, and expressive across the full range of product contexts

Source: https://www.checklist.design/design-system/typography

#### Items

##### Type scale
A defined set of font sizes with a consistent ratio, from captions to display headings

_Tip: A modular scale (1.25, 1.333, 1.5 ratio) produces a more harmonious hierarchy than arbitrary size choices_

##### Semantic text styles
Named styles describing role, not size, so usage is driven by meaning — e.g. display-large, body-default, label-small, caption

_Tip: Style names chosen by size — 24px, 18px, 14px — consistently result in designers selecting styles by measurement rather than role, which makes the system harder to evolve when the scale changes._

##### Typeface selection and loading
The chosen typefaces with style and weight, e.g. Inclusive Sans Medium

##### Line height per style
Line height set explicitly per text style, since headings and body text need different values

_Tip: Similar style groups follow a consistent line height e.g. 1.5 for body text, 1.2 for heading and 1.1 for display_

##### Letter spacing per style
Letter spacing set per style where needed

##### Responsive type behaviour
How text styles respond to viewport size — fluid scaling, breakpoint overrides, or fixed sizes with layout compensation

##### Minimum readable size
The smallest text size in use, and how its readability is validated in the actual rendering environment

##### Accessibility responsiveness
How text styles behave at 200% zoom, and whether any style relies on colour alone for meaning

---

### Color System — Design system

The color layer of a design system — defining a palette that is purposeful, accessible, themeable, and expressed as tokens rather than raw values.

Source: https://www.checklist.design/design-system/color-system

#### Items

##### Primitive palette
A base set of named color ramps (blue-100–900, neutral-0–1000) serving as raw material for semantic decisions

_Tip: Systems where components reference primitive values directly are significantly harder to theme — a color change requires updating each component individually rather than a single token definition_

##### Semantic color tokens
Named tokens describing purpose, not appearance, so the system reskins without touching components — e.g. color-background-primary, color-text-danger

_Tip: The semantic layer is what makes a design system actually themeable by defining purpose for colors_

##### Interactive state colors
Colour values for default, hover, pressed, focused, disabled and selected states, consistent across interactive elements

##### Feedback colors
A consistent set of colours for success, warning, error, and info states, used across alerts, validation, badges, and status indicators.

_Tip: Feedback colors that pass contrast in light mode frequently fail in dark mode — testing each token pair against every surface in both themes is where most gaps tend to surface._

##### Contrast ratios (accessibility)
Text and interactive colour combinations verified against WCAG AA minimums — 4.5:1 normal text, 3:1 large text and UI components

_Tip: Not all colors will pair together nicely so defining this for all usage is helpful_

##### Dark and light mode definition
A complete parallel set of semantic token values for the opposite mode

##### Brand color integration
Brand colours mapped into the semantic system in a way that maintains accessibility

_Tip: Where brand values fall below contrast thresholds, they are restricted to decorative contexts, with accessible token values carrying the text and interactive roles._

##### Color blindness considerations
The palette tested against common colour vision deficiencies where colour conveys state

_Tip: It's worthwhile considering relative items to the color if vision is a concern, meaning an icon or text can help further convey a state incase the color is not successfully visible_

---

### Button — Design system

A button is an interactive element that triggers an action when clicked or tapped. It clearly communicates its clickability through visual styling and provides feedback on user interaction, making it a fundamental component for enabling user actions in interfaces.

Source: https://www.checklist.design/design-system/button

#### Items

##### Base style
The default style — fill, outline, or underline

##### Shape
Visual properties of a button: padding, border, border radius, shadow

##### Variants
Visual types representing button structure — e.g. primary and secondary

##### Copy
Text stating what will happen if the button is clicked

_Tip: Users should understand what will happen before clicking a button. Buttons can have generic copy such as 'Okay' or 'Cancel', but only if there is context around that action, in the title or as a label for example._

##### States
How the button changes based on the interaction: hover, focused, disabled

---

