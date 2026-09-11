> Часть скилла craft-review (см. SKILL.md). Порт Nutlope/hallmark
> `references/hero-enrichment.md`, MIT license, дословно.

# Hero enrichment — when, what, and how much

This file tells you whether to enrich the hero with media at all, and if
so, which archetype and how to build it.

**The promise.** Enrichment is an option, not a default. A typographic-only
hero is *always* an acceptable answer. Visual enrichment — demo video,
illustration, mockup, animated loop, abstract background, photography — has
to *earn its place*. If the hero can be deleted of its enrichment and still
works, the enrichment earned its place. If the hero collapses without the
enrichment, you propped weak typography on a crutch.

**The bar.** Better nothing than bad something. A page that ships a quiet,
well-set typographic hero is always better than a page that ships a stock
illustration, a Lottie checkmark, an aurora-blob background, or a generic
centred demo video block.

---

## Image-need detection — does this brief need imagery at all?

Before picking an enrichment tier, decide whether the brief actually wants
imagery. The default is **typography-only**. Match the brief against this
table; act on the *first* row that fires:

| Brief signal (any of these words / intents) | Image strategy |
| --- | --- |
| e-commerce, shop, store, product catalogue, brand, fashion, lookbook | Real product photos required — placeholder until user provides |
| photography, portfolio, gallery, artist | Imagery *is* the page — placeholder until user provides |
| food, restaurant, menu, dish, coffee, wine, recipe | Hero photo + product crops — placeholder until user provides |
| team, staff, "about us", portraits, hiring, careers | Portrait crops — placeholder until user provides |
| travel, hotel, destination, real estate, listing, property | Cover photo + tile photos — placeholder until user provides |
| news, blog, magazine, journal, publication | Feature image per post — placeholder until user provides |
| SaaS landing, manifesto, agency, studio, atmospheric, slow-and-editorial | **Kit-led.** Use an imagery kit (washes, transparent abstracts, ornaments). |
| API, docs, changelog, CLI, library, dev-tool, SDK, package | **No imagery.** Typography-only. Code blocks if needed. |
| editorial, essay, letter, foundry, type-specimen, broadside | **No imagery.** Display typography is the design. |
| (all other / vague / unspecified) | **Default: typography-only.** When in doubt, no images. |

Rules:

- When the user has attached an image asset, use it. Never overwrite with a
  placeholder.
- When the brief is genuinely ambiguous between a "needs photos" row and a
  "no imagery" row, ask one short question: *"Will you have product photos,
  or should I leave swappable placeholders?"*
- A placeholder must look like a placeholder, not like a confident
  decision. The skill refuses to invent stock photos as if they were the
  final design.

Skipping this gate is what produces "blob illustration on every page"
outputs — exactly the AI-default this file exists to refuse.

---

## The enrichment hierarchy

Reach for the highest tier the brief lets you ship in the time you have.
Skipping tiers is the new tell.

| Tier | What | When |
| --- | --- | --- |
| **0 · Typography only** | No enrichment. Display, lede, optional CTA. | Always acceptable. The strongest fail-state. |
| **A · Custom-built CSS art** | Pure-CSS shapes, gradients, clip-paths, no asset, zero dependency. | Geometric shapes, gradient compositions, glyph-style decoration. |
| **B · Hand-built SVG** | Designed, optimised, animated declaratively. | Illustrations more complex than CSS handles cleanly — a loaf, a mascot, a workflow diagram. |
| **C · Generated illustration** | AI image model, with provenance + post-processing. | Characters or specific scenes that hand-build can't economically reach. Always post-processed. |
| **D · Library illustration** | Storyset / Humaaans / unDraw, customised with brand colours. | When budget and timeline force a shortcut — and even then, never unmodified. |
| **E · Lottie animation** | LAST RESORT. Only when complex character motion can't be hand-built. | Articulated figures, multi-frame mascot loops. Never for "spinning logo" or "checkmark draw" — those are CSS. |

**The discipline.** If you can do it in tier A, do it in tier A. If A can't
reach it, try B. Only drop to C when characters demand it. Only D when the
brief is explicit about "fast and cheap". Only E when E is genuinely the
only option. Reaching for E because it's familiar — and many AI tools do —
is the signature of a templated page.

---

## Eyeball or ask — the decision protocol

```
If the brief contains explicit visual cues, pick from this map:

  • "demo", "show how it works", "product tour"           → E1 / E2 demo video
  • "platform", "tool", "infra", "dashboard", "developer" → E3 / E4 mockup
  • "shop", "store", "menu", "products", "items"          → E8 photography
  • "bakery", "kitchen", "café", "atelier" + craft brief  → E5 custom illustration (Tier B SVG)
  • "agency", "studio", "portfolio"                       → E8 photography or no enrichment
  • "manifesto", "essay", "book", "letter"                → no enrichment (typography only)

Else if the brief is genuinely ambiguous, ask one question:
  "Want me to add a demo video, an illustration, or keep it
   typography-only? I default to typography-only because it's
   the strongest fail-state."

Else default to no enrichment. State the inference in one sentence
in your reply, alongside the macrostructure inference.
```

When in doubt: don't enrich. The hero will be fine. Most great landing
pages are typographic.

---

## Eight enrichment archetypes

Each archetype: one-line definition, "use when", "avoid when", a short code
sketch, and 2-3 within-archetype variation knobs.

### E1 · Demo Video — Clipped-by-viewport-edge

A display headline left, a demo video right, and the rightmost ~10-20% of
the video extending past the viewport so it's intentionally cut off. The
clip *is* the design — it implies "there's more product than fits on this
screen".

*Use when:* the brief is a SaaS / dev tool / dashboard / platform and you
have real footage of the product.
*Avoid when:* you don't have real footage. A clipped-edge video of a
stock-footage city skyline reads as filler.

**Knobs:** clip side (right/left/both), aspect ratio (16/10 · 16/9 · 4/3),
frame treatment (hairline 1px frame · browser chrome · none).

```html
<section class="hero hero--clipped">
  <div class="hero__copy">
    <h1>Plan, build, ship.</h1>
    <p>The project tracker your engineering team won't ignore.</p>
    <a class="btn" href="/signup">Try it free</a>
  </div>
  <figure class="hero__media">
    <video autoplay muted loop playsinline preload="metadata"
           poster="/hero-poster.webp" fetchpriority="high"
           aria-label="Tour of the dashboard interface">
      <source src="/hero.av1.mp4"  type='video/mp4; codecs="av01.0.05M.08"'>
      <source src="/hero.vp9.webm" type="video/webm">
      <source src="/hero.h264.mp4" type="video/mp4">
    </video>
  </figure>
</section>
```

```css
.hero--clipped {
  display: grid;
  grid-template-columns: minmax(20rem, 1fr) 1.4fr;
  gap: var(--space-2xl);
  align-items: center;
  overflow: visible;        /* let the media spill past the page edge */
}
.hero__media {
  width: calc(100% + 12vw);
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  border: var(--rule-hair) solid var(--color-rule);
  overflow: hidden;
}
.hero__media video { width: 100%; height: 100%; object-fit: cover; }

@media (max-width: 60rem) {
  .hero--clipped { grid-template-columns: 1fr; }
  .hero__media { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .hero__media video { display: none; }
  .hero__media { background: url('/hero-poster.webp') center/cover; }
}
```

**Critical:** never `loading="lazy"` on the hero video — that kills LCP.
Use `preload="metadata"` and `fetchpriority="high"`. Always include a
`poster=""` and a `<track kind="captions">` for accessibility.

### E2 · Demo Video — Full-bleed muted loop with ghost overlay

Video fills the fold, ghost-tinted via `mix-blend-mode: multiply` over a
paper-coloured overlay so the type stays readable. The video is wallpaper,
not subject.

*Use when:* the product's *feel* is the message. *Avoid when:* the product
needs to be *seen* clearly — use E1 or E3 instead.

**Knobs:** ghost opacity (0.3/0.5/0.7), text alignment (left-bias/centred),
pause behaviour (always-loop · pause-on-hover · pause-when-out-of-viewport).

### E3 · Mock App Screenshot — Browser-framed split

Display headline left, a browser-frame mockup right, tilted 1-3° for life.

*Use when:* selling a web app with a clean, well-lit screenshot. *Avoid
when:* the screenshot is busy or blurry — the frame draws attention to the
mess.

**Knobs:** frame style, tilt angle (0°/1.5°/3°), screenshot count
(1 · stack-of-3 · orbit-of-3).

### E4 · Mock App Screenshot — Floating no-frame

Same composition as E3 without browser chrome — the screenshot floats with
a soft shadow and 12px corner radius. Cleaner; demands a higher-quality
screenshot since the chrome isn't there to forgive.

**Knobs:** shadow depth, corner radius (0 · 8px · 16px), background reveal.

### E5 · Custom Illustration Centerpiece

A hand-built SVG (default, Tier B) or a generated raster (Tier C, when
characters demand it) sitting on the hero as a single illustrative element.

*Use when:* the brand has a story or a thing-it-makes that benefits from
being drawn. *Avoid when:* the brand is "modern professional team" generic
— illustrating that is the new template.

**Knobs:** build method (Tier A/B/C/D), animation (none · loop ·
scroll-linked), scale (small accent · dominant).

### E6 · Animated Loop — pure CSS / SVG / Motion

A small custom-built loop — an orbiting dot, a breathing rectangle, an
animated gradient stop, a type-mask reveal. Small, custom, looped only when
reduced-motion is off.

*Use when:* the page is otherwise still and one small animated element
gives it life. *Avoid when:* the page already has movement — adding more
reads as anxious.

**Knobs:** medium, placement, loop duration (≤4s — anything longer drags).

### E7 · Abstract Background — subtle gradient + grain

A two-colour CSS gradient at low chroma, overlaid with SVG `feTurbulence`
grain at <0.1 opacity. *Not* aurora; *not* purple-to-cyan mesh; *not*
floating orbs. The point is texture you can barely see.

*Use when:* the page would feel synthetic with a flat surface. *Avoid
when:* the theme already has a paper feel — doubling the grain is muddy.

**Knobs:** gradient direction (45°/135°/radial), grain amount, animation
(none · slow drift · scroll-linked parallax).

```css
.hero { position: relative; isolation: isolate; }
.hero__bg {
  position: absolute; inset: 0; z-index: -1;
  background:
    linear-gradient(135deg,
      color-mix(in oklch, var(--color-paper) 100%, var(--color-accent) 4%),
      color-mix(in oklch, var(--color-paper) 100%, var(--color-paper-2) 50%));
}
.hero__bg::after {
  content: ""; position: absolute; inset: 0;
  filter: url(#grain);
  opacity: 0.06;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

### E8 · Hero Photography — single tightly-cropped image

One tightly-cropped photograph, no full-bleed. Always pair photography with
a tone-matched typography pairing — a luxury-tone photo on a brutalist page
jars.

---

## Hero shape polish — patterns beyond enrichment

The eight archetypes above decide *what sits next to the headline*. The
four polish patterns below decide *how the headline itself sits* — layout,
type, motion, not decoration on top. Admissible on top of any hero
macrostructure. Pick one polish pattern when the hero feels shape-flat —
colour-only, symmetric, predictable.

You can ship a hero with one polish pattern *and* one enrichment archetype,
but never two polish patterns at once. The hero is a high-stakes surface;
one structural choice carries it.

### HP1 · Vertical-rail title

The wordmark or a pull-label runs *vertically* alongside the centred body
(`writing-mode: vertical-rl; text-orientation: mixed;`). Reads as studio ·
atelier · editorial.

*Use when:* the hero is otherwise centred/marquee-shaped and wants a
structural anchor that isn't a rule or numeral. *Avoid when:* the body
title is itself big and centred — competing axes.

*Anti-pattern:* vertical text *and* horizontal display title competing at
the same scale. Pick one direction; the rail is supporting voice.

### HP2 · Marquee-overflow

The H1 is intentionally larger than the viewport — `overflow-x: clip` on
the hero container; the title bleeds past the right edge. Reads as
manifesto · brutal · sport.

*Use when:* genre is playful and the title is *short* (≤6 words). Long
titles + overflow = noise. *Avoid when:* the title carries legal
information that must be readable in full.

*Anti-pattern:* `overflow-x: hidden` on `<html>`/`<body>` at the same time
as this hero — breaks horizontal scroll for descendants. Use
`overflow-x: clip` only, scoped to the hero container.

### HP3 · Cursor-spotlight

A radial-gradient background that tracks `mousemove`, scoped to the hero
only. Reads as atmospheric · modern-minimal SaaS.

*Use when:* the page is atmospheric/dark-paper/SaaS marketing with empty
surface to play under. *Avoid when:* the cursor would track over content —
pulls focus from reading. Scope to a backdrop layer beneath text, never
over it.

*Anti-pattern:* tracking the cursor across the *whole page*. Scope to hero
only. Reduced-motion fallback must pin the gradient to a sensible static
position, not just disable the effect.

### HP4 · Decorative-numeral

A huge edition number / year / chapter glyph in display-italic in a hero
corner. The numeral *means something*. Reads as editorial · newsprint ·
almanac.

*Use when:* the page genuinely has an edition/issue/chapter/version
semantic. *Avoid when:* the numeral has no semantic anchor — a random "42"
in the corner reads as decoration, which is slop.

*Anti-pattern:* numerals that mean nothing. If you can't name what the
number *is*, drop it.

---

## Hero space discipline

Every hero — enriched or not, polished or not — obeys these rules.

- **Footprint.** The hero takes 70-90% of the first viewport's height — no
  more, no less. `min-height: 100vh / 100dvh` is the AI fingerprint. Aim
  for `min-height: clamp(60vh, 75dvh, 88dvh)`.
- **Fit the fold — content, not just the box.** On a 13″ laptop (~800px
  tall) the eyebrow + headline + lede + primary CTA must all be visible
  without scrolling. Usual culprits: oversized display `clamp()` max,
  loose display line-height (~1.2 instead of 1.0-1.1), a lede that runs 3+
  lines, bloated `padding-block`. Right-size, don't cramp — a hero that
  already fits needs no shrinking.
- **Asymmetric padding.** `padding-block-end` ≥ 1.3× `padding-block-start`.
  The hero sits *into* the page; symmetric padding floats.
- **Never centre everything.** Eyebrow + title + lede + CTA all stacked
  centred is the AI fingerprint. Pick at most *two* centred elements; break
  alignment for the others.
- **Entrance animation.** Pick one of {fade, sweep, none} per element —
  never both fade *and* sweep on the same element. Duration ≤220ms.
  Disable on `prefers-reduced-motion: reduce`.
- **Headline typography.** Prefer one display weight + tight tracking
  (-0.02em to -0.04em); line-height 0.95-1.05 for display, never 1.2 (which
  inherits the body line-height and reads as un-set type). Avoid two
  display weights on the same headline.
- **One polish pattern, max.** HP1-HP4 are mutually exclusive on a single
  hero.

The decision sequence: pick the hero macrostructure → pick zero-or-one
enrichment archetype (E1-E8) → pick zero-or-one polish pattern (HP1-HP4) →
apply the space discipline rules → stamp the choices.

---

## Animation discipline (hero specifically)

The hero is the highest-stakes animation surface on the page; the rules are
tighter here than elsewhere.

**One orchestrated reveal per page.** Not eight. Not "everything fades in
on scroll". One: the hero settles in 0.4-0.8s with a single coordinated
motion, then stops.

**Banned for hero entrances:** bouncy elastic easing
(`cubic-bezier(0.34, 1.56, ...)`), scroll-fade-everything, mouse-follow
gradients on SaaS landing pages (allowed only on portfolio/creative/agency
work), parallax-on-mouse, particle/starfield backgrounds, auto-rotating
hero carousels (WCAG 2.2.2 fail unless paused-on-hover-and-focus is
implemented).

**Allowed:** a single image-fade-in-late after the headline lands (~0.6s
after, ~0.4s duration), type-unmask on the headline (`clip-path` opening
over text), View Transitions API for state changes, number-tick on a
stat-led hero (≤1.2s), a single subtle Lottie/CSS loop ≤4s with
`prefers-reduced-motion` fallback.

**Reduced-motion is the default.** Every animation gets a
`@media (prefers-reduced-motion: reduce)` block that either disables the
motion or replaces it with a static keyframe. Non-negotiable.

---

## Quality bar — eight pre-flight questions

Every question must answer *yes* before the enrichment ships. If any answer
is *no*, ship the typographic-only hero instead.

1. Does the enrichment **communicate** something the typography can't?
2. Is it under **2 MB** total?
3. Does it have a **`prefers-reduced-motion` fallback**?
4. If video: muted, looped, `playsinline`, with a poster +
   `fetchpriority="high"` + caption track?
5. If illustration: built or generated with intent? Not picked from a
   Lottie library as a shortcut?
6. If background: under one accent colour at <5% footprint?
7. Does it survive being deleted? (If the hero still works without it, it
   earned its place. If the hero collapses without it, you propped weak
   typography on a crutch.)
8. Does its tone match the page's tone?

---

## Output stamp

When you ship enrichment, record the choice:

```css
/* macrostructure: Marquee Hero · H1 hero knobs: size=xxl, alignment=left-bias
 * enrichment: E1 Clipped-Edge Video · clip=right, aspect=16/10, frame=hairline
 * polish: HP3 Cursor-spotlight (scoped to hero, reduced-motion fallback pinned at 50%/30%)
 * craft: tier-A CSS art (no real video — pure custom-built mockup)
 */
```

If no polish pattern is used, omit the `polish:` line — don't fake it. Same
for enrichment.

---

## Common mistakes — and the fixes

- **Defaulting to E5 illustration on every brief.** Most heroes don't want
  an illustration. Reach for Tier 0 first; reach for E1-E4 when there's a
  *thing* to show; reach for E5 only when illustration genuinely matches
  the tone.
- **Using a stock Lottie checkmark as the hero animation.** Build the
  checkmark in pure CSS (`stroke-dasharray` animated to draw the tick); 8
  lines.
- **Adding a grain background everywhere.** Grain is a treatment, not a
  default.
- **Treating the abstract background as the hero.** It isn't. The headline
  is. The background is paper.
- **Shipping the unmodified library SVG.** Customise the colour to your
  anchor hue at minimum.
- **A clipped-edge video on mobile.** Reads as broken on a 375px viewport.
  Always collapse to stacked at <60rem.

