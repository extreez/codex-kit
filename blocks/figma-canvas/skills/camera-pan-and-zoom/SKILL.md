---
name: camera-pan-and-zoom
description: >-
  Строит предсказуемый камера-риг (SCENE-VIEWPORT / CAMERA-PAN / CAMERA-ZOOM)
  вокруг выделенного контента в Figma и, при запросе, анимирует pan/zoom
  моушен-кейфреймами: push-in на карточку, grid tour по сетке, серпантинный
  свип по рядам фото, camera roll и т.д. Использовать по фразам «сделай
  камеру», «анимируй zoom/pan», «камера-риг», «grid tour», «покажи это как
  видео-обзор макета». Требует холст Figma (use_figma/evaluate_script) и
  умеет только рига+анимацию — не путать с flow-explore (структурные
  альтернативы экранов).
---

> Не переведено — см. [`../README.md`](../README.md) за общим правилом.
> Здесь конкретно: точные тайминги, safe-area инсеты, формулы
> центро-масштаба.

# Camera Pan and Zoom

Build a predictable camera rig around the selected content. When animation is requested, think like a motion director before adding keyframes.

## Choose the operating mode

Determine which mode the request requires:

- **Rig only:** Build or repair the camera hierarchy. Do not add keyframes.
- **Animate an existing rig:** Verify the hierarchy, then direct and animate the shot without rebuilding valid layers.
- **Rig and animate:** Build the hierarchy first, verify that the composition is unchanged, then direct and animate the shot.
- **Grid tour:** Establish a grid, choose an item-level or row-level tour based on its content, move through the grid, then zoom back out to the establishing view.

Rig creation is a core capability. Never skip or weaken the rig structure to create an animation more quickly.

## Apply the default directing policy

Do not require the user to restate standard motion-direction and framing practices. Unless explicitly overridden:

- Inspect the composition before choosing transforms, scale, timing, or easing.
- Start from the established composition at its current framing, normally 100% scale.
- Treat named subjects and their order as the narrative sequence.
- Keep discrete focused subjects fully inside an 8% viewport safe area. Use edge-to-edge framing for continuous grid sweeps when appropriate.
- Stabilize the subject visually on any axis the user did not ask to travel along.
- Use the shortest intentional path between subjects.
- Prefer concise timing for simple interface and card movements.
- Preserve a shared scale between similar targets when all targets fit safely.
- Reduce scale rather than crop a requested subject.
- Keep fixed overlays stationary.
- Verify the rendered result instead of assuming numeric transforms produced the intended framing.

A short request such as “Zoom to Card 1, then pan to Card 3” is sufficient when the composition makes those targets clear. Infer the safe framing, stabilized axis, concise timing, and appropriate rig behavior from this policy.

## Run a directing preflight

Before creating animation keyframes:

1. Verify or build the camera rig.
2. Identify the establishing view, target sequence, active travel axis, and fixed overlays.
3. Measure each target's complete visual bounds.
4. Determine safe scale and intended focal placement.
5. Choose a concise sequence of camera beats and estimate the total duration.
6. Check whether the inferred shot conflicts with any explicit user constraint.

Ask one focused validating question only when a meaningful ambiguity remains, such as:

- Multiple plausible focal subjects or target orders
- Snappy versus cinematic pacing that materially changes the result
- Exact centering versus preserving an established subject row or column
- A requested zoom level that would crop the subject
- A choice between consistent scale and individually fitted targets

Include a recommended choice in the question. Do not ask the user to decide values that can be judged confidently from the composition.

## Recommend animation options

Switch to guided direction when the user asks what would work, expresses uncertainty, or requests pan-and-zoom animation without a clear focal sequence.

Inspect the composition, then offer two or three tailored concepts. Do not provide a generic menu disconnected from the selected content.

For each option, include:

- A short descriptive name
- The focal sequence and camera beats
- The approximate total duration
- The intended feeling or communication goal
- Any meaningful framing tradeoff

Recommend one option first and briefly explain why it best fits the composition. Keep the choices meaningfully different, such as:

- **Focused reveal:** Establish the full composition, push into the strongest subject, then settle.
- **Guided path:** Move through a small sequence of related subjects and finish on the primary destination.
- **Grid tour:** Establish the full grid, visit each item, then return to the overview.
- **Continuous sweep:** Use one uninterrupted pan-and-zoom move when momentum matters more than individual reading holds.
- **Overview to detail and back:** Begin and end with context while highlighting one or two details in the middle.

Choose only options that suit the actual composition. For example, do not suggest a grid tour when there is no repeated grid content.

Use this response pattern:

> **Recommended — [option name]:** [camera sequence], approximately [duration]. This works because [composition-specific reason].
>
> **Alternative — [option name]:** [camera sequence], approximately [duration]. This emphasizes [different goal or feeling].
>
> Which direction should I build?

Do not add animation keyframes until the user chooses, unless the user explicitly says to use your judgment. In that case, choose the recommended option and proceed. A rig-only request must remain rig-only and should not trigger animation recommendations.

## Create a grid tour

Use grid-tour behavior when the user asks to tour, showcase, or pan through a gridded set of nested elements.

### Identify the tour

1. Find the grid or auto-layout container and its repeated nested items.
2. Include only the intended tour items. Exclude navigation, titles, captions, and other fixed chrome unless requested.
3. Measure every item's complete visual bounds.
4. Determine traversal order:
   - Follow an order stated by the user.
   - Otherwise, follow meaningful visual reading order, normally left-to-right and top-to-bottom.
   - For a purely visual grid with no semantic order, use a serpentine path when it substantially reduces travel.
5. If there are many items and a complete tour would become tedious, recommend a representative subset or a faster pacing before animating.

### Choose the tour strategy

Do not assume every grid should use individual item waypoints.

- **Item-level tour:** Use when each card or tile contains distinct information that needs an individual reading moment. Frame each complete item safely.
- **Row-level sweep:** Prefer for uniform photo grids, galleries, contact sheets, and repeated visual tiles. Zoom to fit a complete row's height, then pan continuously across the row instead of zooming into each item.

A row-level sweep is usually the better default when item-level framing would create excessive white space, make each image feel isolated, or produce repetitive stop-and-start motion. Ask one validating question if both strategies are plausible and would communicate different ideas.

### Direct the sequence

For an item-level tour, build these beats:

1. **Establish:** Start with the complete grid visible at its original framing.
2. **Enter:** Zoom into the first item and place its complete bounds inside the safe area.
3. **Tour:** Hold a safe scale and pan through each remaining item, treating every item as an intentional camera waypoint.
4. **Exit:** After the final item, zoom back out to the exact establishing framing.

Use a shared zoom level when every item fits safely. Calculate it from the most restrictive item rather than the first item alone. If item sizes differ enough that one shared scale creates poor framing, ask whether to preserve consistent scale or adapt the zoom per item.

For each waypoint:

- Keep the complete item inside the viewport safe area.
- Preserve the row's rendered Y position during horizontal travel.
- Preserve the column's rendered X position during vertical travel.
- Use only enough hold time for the content to register.
- Preserve velocity when the tour should feel continuous.

At row transitions, avoid accidental long diagonal jumps. Follow semantic reading order when it matters. Otherwise, use a shorter serpentine path. A slight zoom-out may be used to provide context during a large row transition, but only when it improves the shot and does not feel like an unintended pulse.

For a row-level serpentine sweep:

1. **Establish:** Start with the complete grid visible at its original framing.
2. Group items into rows using their rendered Y positions and calculate each row's union bounds.
3. **Enter:** Zoom to fit the first row's height in the available viewport height.
4. Align the first row's leading outer edge flush with the corresponding viewport edge.
5. Pan continuously across the complete row until its trailing outer edge is flush with the opposite viewport edge.
6. Move vertically to the next row while staying at the current horizontal edge.
7. Sweep the next row in the opposite direction. Continue alternating directions for a true serpentine path.
8. **Exit:** After the final row, zoom back out to the exact establishing framing.

Calculate row-level scale from row bounds, not individual item bounds:

`row scale = available viewport height ÷ row height`

Use the most restrictive row height when a consistent scale is desired. Avoid per-photo zoom changes unless the user requests them.

When a scaled row is wider than the viewport, use flush horizontal endpoints by default:

- At the start, align the row's leading outer edge to the viewport edge with `0px` gap.
- At the end, align the row's trailing outer edge to the opposite viewport edge with `0px` gap.
- Do not leave a small asymmetric margin such as `15px`; a single visible sliver usually looks accidental.

Safe-area insets still apply when framing a discrete subject. They do not automatically apply to the travel-axis endpoints of a continuous full-bleed row sweep.

For a concise interface tour with no pacing direction, use these starting ranges:

- Initial zoom: approximately 0.5–0.8 seconds
- Nearby item-to-item pan: approximately 0.4–0.8 seconds
- Reading hold: approximately 0–0.25 seconds
- Final zoom-out: approximately 0.5–0.8 seconds

Adjust timing for item distance, density, and readability. Do not multiply a slow default duration across every item.

### Verify the tour

- Confirm the establishing and final transforms match exactly.
- Confirm every intended item or row appears once in the correct order.
- For item tours, confirm no waypoint or transition crops its active item.
- For row sweeps, confirm the complete row height remains visible and the horizontal endpoints are intentionally flush.
- Confirm row and column transitions do not introduce unintended drift.
- Confirm serpentine row changes occur vertically at the current edge rather than jumping diagonally across the grid.
- Confirm the complete tour remains concise and rhythmically consistent.

## Interpret the request

Identify:

- The content that should move with the camera
- The output frame that defines the visible shot
- Any layers, such as UI chrome or captions, that must remain fixed
- The primary and secondary subjects in the composition
- The requested focal point, destination, camera path, pacing, and easing

Inspect the composition rather than relying only on layer names. Consider visual hierarchy, subject size, spacing, reading order, available overscan, and the distance between targets.

If the selection or intended viewport is ambiguous, ask before changing the file. Treat unselected sibling layers as fixed unless the user says otherwise. A named destination such as “pan to Card 3” takes priority over ambiguous directional language.

## Build the rig

Create this hierarchy:

```text
SCENE—VIEWPORT
└── CAMERA—PAN
    └── CAMERA—ZOOM
        └── selected content
```

1. Reuse the existing output frame as `SCENE—VIEWPORT` when one is clearly selected or established. Otherwise, create a frame matching the intended output bounds.
2. Enable clip content on `SCENE—VIEWPORT`.
3. Create `CAMERA—PAN` inside the viewport. Match the viewport's initial bounds.
4. Create `CAMERA—ZOOM` inside `CAMERA—PAN`. If the camera content is a larger frame or canvas, match that content's bounds and center. Otherwise, wrap the selected camera content tightly.
5. Move only the camera content into `CAMERA—ZOOM`. Preserve its appearance, coordinates, layer order, and internal layout.
6. Give both camera frames transparent fills, no strokes, no effects, no auto layout, and clip content disabled.
7. Align the zoom frame's center with the viewport on any axis that should remain stationary during the shot.
8. Preserve fixed overlays as siblings of `CAMERA—PAN` inside the viewport.

The finished hierarchy may include fixed layers:

```text
SCENE—VIEWPORT
├── CAMERA—PAN
│   └── CAMERA—ZOOM
│       └── camera content
└── fixed overlays
```

The rig must look identical to the original composition before animation begins.

## Assign camera controls

- Animate `CAMERA—PAN` for X/Y movement only.
- Animate `CAMERA—ZOOM` for scale and rotation only.
- Do not place camera keyframes on the original content.
- Keep scale uniform unless the user explicitly requests distortion.
- Keep the focal subject inside the viewport and add enough overscan to prevent exposed edges during scale or rotation.
- Stabilize any visual axis the user did not ask the camera to travel along.

### Use center-based scale math

Figma keyframe animation scales `CAMERA—ZOOM` from the node's center, not its top-left corner. Never calculate pan compensation as though the top-left stays fixed.

For uniform scale with no rotation, use:

```text
viewport_x = pan_tx + zoomCenterX + (localX - zoomHalfW) * scale
viewport_y = pan_ty + zoomCenterY + (localY - zoomHalfH) * scale
```

Where:

- `pan_tx` and `pan_ty` are the `CAMERA—PAN` translations in viewport coordinates.
- `zoomCenterX` and `zoomCenterY` are the unscaled `CAMERA—ZOOM` center coordinates inside `CAMERA—PAN`.
- `zoomHalfW` and `zoomHalfH` are half the unscaled zoom-frame width and height.
- `localX` and `localY` are a target point's coordinates inside `CAMERA—ZOOM`.
- `scale` is the uniform `SCALE_X/Y` value.

To place a target point at a desired viewport coordinate, solve for pan:

```text
pan_tx = desiredViewportX - zoomCenterX - (localX - zoomHalfW) * scale
pan_ty = desiredViewportY - zoomCenterY - (localY - zoomHalfH) * scale
```

For a flush left-to-right row sweep, calculate the scaled row edges using the same center-based formula. Set the start pan so the scaled left edge equals viewport `0`, and set the end pan so the scaled right edge equals the viewport width. Reverse those endpoints for a right-to-left row.

These formulas assume no rotation and a viewport origin of `(0, 0)`. When rotation or additional transformed ancestors are present, inspect the rendered result or use the complete transform matrix rather than applying top-left approximations.

Interpret directions as camera directions:

- Pan right: move the content left.
- Pan left: move the content right.
- Pan up: move the content down.
- Pan down: move the content up.
- Zoom in: increase the content scale.
- Zoom out: decrease the content scale.
- Camera roll: rotate the content opposite the camera's stated direction.

If the user describes the desired movement of the content rather than the camera, follow the visible content direction without inversion.

## Preserve axis continuity

Zooming must not introduce an unintended pan.

- Lock the subject's visible position, not necessarily the raw X/Y transform value.
- For a zoom-only shot, keep the chosen focal anchor at the same rendered X and Y throughout the zoom.
- For a horizontal pan and zoom, preserve the target or card row's rendered Y position throughout the shot.
- For a vertical pan and zoom, preserve the target column's rendered X position throughout the shot.
- Scale `CAMERA—ZOOM` uniformly around its stable center.
- If scaling around the zoom frame's center would shift the focal anchor, apply compensating pan on the locked visual axis. This compensation prevents visible drift; it is not an intentional pan.

When the camera content is wider than the viewport, align the intended subject row or focal anchor with a stable horizontal line in the viewport. Preserve that rendered alignment through every scale keyframe. Do not assume the center of the larger content frame is also the visual center of the subject.

If exact target centering conflicts with the requested axis lock, stabilize the subject on the locked visual axis and center it on the active travel axis. Ask a validating question when this materially changes the intended framing.

## Keep the subject in frame

“Keep this card in frame” means the complete subject bounds must remain inside a safe area at every relevant keyframe.

1. Measure the full visual bounds of the requested subject, including its container, rounded corners, stroke, shadow, labels, and controls—not only an image or child layer.
2. Define a safe area inside the viewport. Unless the composition suggests otherwise, leave approximately 5–10% inset on each edge.
3. Calculate the largest scale that fits the complete subject inside that safe area:

   `maximum scale = min(safe width ÷ subject width, safe height ÷ subject height)`

4. Clamp the proposed zoom to that maximum scale.
5. After scaling, stabilize the focal anchor and adjust pan so every subject edge remains inside the safe area.
6. If the desired emphasis cannot fit without cropping, reduce the scale rather than silently cutting off the subject.

When moving between multiple targets, calculate safe framing for each target. Use a shared scale only when every target fits; otherwise ask whether to vary scale or preserve consistent zoom.

## Direct the shot

Before adding keyframes, form an intentional shot plan:

1. Identify the establishing view, focal subjects, destination, and intended final framing.
2. Measure each target's complete visual bounds and center relative to the viewport.
3. Decide whether the movement should be simultaneous or divided into beats such as establish, push in, settle, and pan.
4. Choose scale from the target's size and desired framing. Do not default blindly to a fixed value such as `1.5×`.
5. Choose the shortest clear camera path that preserves context and avoids dead space.
6. Identify the active travel axis and stabilize the subject's visible position on the other axis unless the user requests diagonal or multi-axis movement.
7. Choose timing based on travel distance, content density, and the user's tone.

For a simple UI or card showcase with no pacing direction, prefer a concise starting point:

- Push in: approximately 0.5–0.9 seconds
- Settle or hold: approximately 0.1–0.25 seconds
- Pan to the next nearby subject: approximately 0.6–1.1 seconds

These are judgment ranges, not mandatory values. Use longer timing only when the distance, reading time, number of subjects, or requested cinematic tone supports it.

For cards and similar discrete subjects, a useful initial framing is for the target to occupy approximately 65–75% of the viewport while retaining breathing room. Adjust for the composition instead of forcing this range.

Ask one concise validating question before animating when multiple plausible focal subjects, sequences, framings, or pacing choices would produce materially different shots. Include a recommendation:

> I recommend a quick push into Card 1, a short settle, then a smooth pan to Card 3 in about 1.7 seconds. Should this feel snappy or cinematic?

If the user's intent is already clear, proceed without unnecessary questions.

## Shape the easing

Easing must support the shot's intent, weight, and continuity.

- Prefer connected easing variables from the user's motion system.
- Prefer smooth ease-in-out for a complete camera move that begins and ends at rest.
- Use a stronger ease-out when arriving at a focal subject.
- Avoid linear easing unless the user requests mechanical, scanning, or constant-speed motion.
- Avoid springs, bounce, and overshoot for camera movement unless the user explicitly requests a playful treatment. Overshoot can weaken framing, reveal clipped edges, and make the camera feel unstable.
- Coordinate pan and scale curves when they animate simultaneously so the focal subject follows one coherent path.
- Match easing across repeated target-to-target moves unless a change in narrative emphasis justifies a different curve.
- Treat duration and easing as one decision. A strong curve cannot rescue a move that is unnecessarily long.

For continuous movement across multiple phases, preserve velocity through intermediate keyframes. Do not apply ease-in-out independently to every segment if it creates an unintended full stop. Use a complete stop only for an intentional settle or reading hold.

When a hold is intentional:

- Ease out into the focal subject.
- Hold only as long as the content needs.
- Ease into the departure without an abrupt velocity jump.

When no design-system easing or user preference exists, use these as starting points:

- Balanced camera move: `cubic-bezier(0.65, 0, 0.35, 1)`
- Gentle arrival: `cubic-bezier(0.22, 1, 0.36, 1)`
- Familiar UI motion: `cubic-bezier(0.4, 0, 0.2, 1)`

Choose one based on the composition and shot plan; do not cycle through fallback curves arbitrarily.

## Add motion

If the user specifies a move, add keyframes to the appropriate camera frame:

1. Start from the established composition, normally at 100% scale and its neutral pan position, unless the user requests otherwise.
2. Set initial keyframes without creating a visual jump.
3. At each focal keyframe, set the intended scale on `CAMERA—ZOOM`.
4. Measure the target's complete rendered bounds and focal anchor after scaling.
5. Move `CAMERA—PAN` by the required delta on active travel axes.
6. Apply compensating pan on stabilized axes when needed to keep the focal anchor visually stationary.
7. Confirm the complete target fits within the safe area; reduce scale or correct framing if it does not.
8. Add holds or settling beats only when they improve legibility or rhythm.
9. Use the user's easing or a connected motion-system easing variable when available.
10. When no easing is specified, choose easing that supports the shot rather than applying one curve mechanically to every phase.

Centering an off-center target during a push-in may require transform changes on both axes. Judge success by stable visual framing, not by whether a transform property remained numerically unchanged.

When moving between named targets:

- Hold scale if the subjects need consistent framing.
- Recalculate pan from the destination target's measured center.
- End with the destination intentionally framed, not merely moved in its general direction.

If the user asks only to set up the rig, create the hierarchy without inventing a camera move.

## Verify

Before finishing:

- Scrub the full timeline.
- Confirm there is no jump at the first frame.
- Confirm fixed overlays do not move.
- Confirm no empty canvas or clipped content is revealed.
- Confirm pans remain independent from zoom scale and rotation.
- Confirm stabilized focal anchors remain on the same rendered axis throughout the zoom.
- Confirm scaling does not introduce visible vertical or horizontal drift.
- Confirm every edge of each requested subject remains inside the safe area.
- Confirm each named target reaches its intended framing.
- Check both keyframes and the movement between them for temporary cropping or drift.
- Confirm simultaneous pan and scale feel coordinated.
- Confirm intermediate keyframes do not create unintended stops or velocity jumps.
- Confirm the duration and pacing are proportional to the visual distance traveled.
- Confirm the original content's internal structure and layout still work.
- Leave the playhead at the beginning and select `SCENE—VIEWPORT`.

If validation fails, correct the scale, pan, or timing and validate again. Do not report completion until the rendered shot satisfies the requested framing.

Briefly report the rig created, the shot plan, the layers animated, and the resulting timing, framing, and easing.

## Example requests

- “Set up a camera pan-and-zoom rig around this website.”
- “Zoom into the selected card while panning right over 1.5 seconds.”
- “Create a grid tour through these cards and return to the full grid.”
- “Create a slow camera roll across this grid, but keep the title fixed.”
- “Rig this composition only; do not add keyframes yet.”

---

*Адаптировано из скилла Figma Community `camera-pan-and-zoom`, портировано под формат Codex и инструменты `figma-mcp` (block figma-canvas/skills/camera-pan-and-zoom).*

