# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A bilingual (Czech/English) browser app for elementary-school pupils that shows
how the curvature of the Earth hides distant objects. Plain HTML/CSS/JavaScript,
no dependencies, no bundler, no framework.

## Commands

```bash
npm start          # dev server on http://localhost:8123 (node tools/serve.mjs)
npm run build      # regenerate objects.json + js/data/factory-objects.js
npm test           # geometry self-test against textbook values
node tools/check-strings.mjs   # translation completeness
```

CI runs `check-geometry`, a `build` + `git diff --exit-code` reproducibility
check, and `check-strings`. Run all three before committing.

## Hard rules

1. **No build step for the app.** `index.html`, `css/` and `js/` must run exactly
   as they are. `tools/` only regenerates the data file.

2. **Classic scripts, not ES modules.** Every `js/**.js` file is an IIFE that
   attaches to the `window.HorizonLab` (`HL`) namespace. This is deliberate: the
   app has to work when a teacher double-clicks `index.html` (`file://`), where
   module scripts are blocked by CORS. Never convert to `import`/`export` or add
   `type="module"`.

3. **Never hand-edit `objects.json` or `js/data/factory-objects.js`.** Both are
   generated. Edit `tools/objects.source.json` and `tools/svg/*.svg`, then run
   `npm run build`. The build must stay deterministic — do not add timestamps or
   anything else that changes between runs, or CI's diff check will fail.

4. **All user-visible text lives in `js/i18n/strings.js`, in both `cs` and `en`.**
   Never hardcode a string in a UI module. `check-strings.mjs` enforces matching
   key sets, matching `{placeholders}`, and that every key is actually
   referenced somewhere — dead translations accumulated unnoticed until 13 of
   them were found at once. Keys composed at run time (`status.`, `data.source.`,
   `preset.`, `orbit.`, `editor.baseline.`) are listed as prefixes in that check;
   add to that list rather than deleting a key you cannot find.

   Watch for wording that only holds on the Earth. Eleven bodies are selectable,
   so "how much the Earth ate" or "distance along the Earth's surface" is wrong
   ten times out of eleven. Say *surface*, *body*, or pass `{planet}` — the app
   title and footer credit are the deliberate exceptions.

5. **No dependencies.** No npm packages, no CDN links, no web fonts, no
   analytics. The app must work fully offline. The faculty logo is therefore a
   local file in `assets/`, not a hotlink — and it is a trademark, so it is not
   covered by the repository's MIT licence and must not be recoloured or
   redrawn (see the note at the end of `LICENSE`).

6. **Adding a `js/` file means adding a `<script>` tag** to `index.html` in
   dependency order (core → i18n → data → ui → app).

## Architecture

```
core/     geometry, format, store, dom   — no DOM knowledge above geometry, no language
i18n/     strings + language switching
data/     load / validate / save objects.json (+ factory fallback), planet presets
ui/       diagram, telescope, chart, controls, results, vanish, limits,
          geometry-view, editor
app.js    the only place that wires state to views
```

Each layer knows only the layer beneath it. `geometry.js` has no DOM and no
language. UI modules never talk to each other — they read state and render.
State flows one way: `controls → app.setXxx() → store → render(state) → views`.

## Non-obvious things

**The diagram's coordinate frame** (`geometry.chordFrame`): the chord between
observer and object is horizontal — both stand at `y = 0` — and the surface
bulges *upwards* between them. That is why `frame.point(0, 0).y` and
`frame.point(D, 0).y` are both exactly zero and the midpoint equals `bulge(D)`.
The `y` formula uses the `cos A − cos B` product identity because the naive
version subtracts two numbers near 6.4 × 10⁶ and loses precision.

**Horizontal and vertical scales differ** in the diagram below orbital heights,
by design — real curvature is invisible at true scale. The factor is computed
per render and printed into the picture. When the object is huge and close the factor drops
below 1, so the wording switches to `diagram.compression` / `diagram.sameScale`.
Never silently drop that note.

**The diagram reserves its edge margins in PIXELS, not in distance.** The object
icon and the observer figure have pixel widths that do not follow from the world
coordinates, so a margin expressed as a fraction of the distance does not cover
them — that is how 58 of 92 configurations ended up with the object sliced off
by the clip path. `padLeft`/`padRight` are computed from an *upper bound* on the
icon size (using the provisional scale, so the real icon can only come out
smaller) and the horizontal scale gets what is left. Because the mapping is
inset, the surface is sampled over a wider `uDrawMin…uDrawMax` than the frame
shows; the clip path trims the excess. The quarter-circumference rule still caps
that widening — past it there genuinely is no more surface, and sky at the edge
is the correct picture. The hidden/visible dimension labels pick their side by
being drawn, measured with `getBBox()` and rebuilt on the left if they overflow;
a fixed offset cannot work when the label text differs per language.

**Object icons are sized by height only.** Widths use the icon's own aspect
ratio (read from the SVG `viewBox` at build time), clamped so a 269 m Titanic
does not fill the frame. The telescope view instead scales *uniformly* so wide
ships are never distorted — the visible/hidden ratio must stay exact there.

**The editor works on its own copy** of the data and previews every keystroke
via `app.applyData()`. After applying, it resyncs its own `signature` to the new
`dataStamp` so an unrelated re-render does not rebuild the form and throw away
what the user is typing. If you touch `editor.js` or `app.applyData`, keep that
invariant or typing will lose focus.

**`controls.js` rebuilds only when `lang|objectCount|dataStamp` changes**; other
state changes just sync input values, and inputs that currently have focus are
skipped so typing is not fought.

**Heights switch to kilometres at the Kármán line** (100 km) in
`format.height`. Everything earthbound stays in metres exactly as before; only
an observer in orbit crosses it, and "35 793 000 m" cannot be read.

**Nothing is hardcoded to the Earth.** Every calculation takes the radius of the
selected body. `effectiveRadius(refraction, baseRadius)` and `solve({planetRadius,
…})` must always be given one; they only fall back to the Earth when it is
omitted. Watch for Earth-specific *numbers in text*: the "3.57 · √h" rule of
thumb is `rootRuleConstant(R)` and is passed into the strings as `{k}` — never
write the constant into a translation.

**The sight limit is real geometry, not a guard clause.** `horizonDistance`
approaches `πR/2` as the height grows, so nothing beyond
`horizon + πR/2` is ever visible and the antipode (`πR`) is unreachable at any
height. `hiddenHeight` returns `Infinity` there and `solve` reports
`beyondReach: true`; `distance` is clamped to the antipode.

That `Infinity` needs `ANGLE_EPSILON` (1e-12 rad) to be reliable. Exactly at the
limit, `(D − d₁)/R` rounds a hair *below* `π/2` and the secant returns a huge but
finite number — 2.5 × 10²⁴ m was measured, and it happened in 14 of 180
body/eye-height combinations. Comparing arc lengths instead of angles only fixes
11 of them, so the slack is the fix. It is physically invisible (6 µm of arc on
Earth) and numerically decisive (the required height there would be 6 × 10¹² km).
Do not remove it, and keep treating "at or past `maxSight`" as impossible in the
UI as well.

**Above a thirty-second of the radius the side view stops exaggerating and
draws a ball.** Stretching heights against distances is honest only where the
curvature is otherwise invisible; from orbit the same stretch would squash the
body exactly where it is most obviously round. `globeMode` therefore locks
`sx = sy`, samples the *whole* circle (the centre sits at `(0, −R·cos(D/2R))`
in the chord frame, so the surface really is a circle there), fills it with a
radial gradient, and paints a black starry sky whenever the *observer* is that
high. Do not re-introduce a linear gradient for the disc — it reads as a flat
coin. The threshold is 1/32 and not the 1/16 that defines the low orbit,
because the low orbit's altitude is rounded to whole kilometres and landed
just under it.

Framing in globe mode: include the eye while the picture stays within
`MAX_SPAN_RADII` (9) of the body, otherwise drop it from the bounds entirely
and close in on the body — Venus's stationary orbit is 253 radii up and framing
the eye would leave the planet smaller than a pixel. When the eye falls outside,
the figure is clamped to where its mast crosses the frame and gets a break mark,
the eye dot is not drawn, but **the line of sight is still built from the eye's
true position**: shift it and it stops being a tangent, which is the whole point
of the picture. At the heights where this happens the mast and the ray are only
a few degrees apart, so they enter the frame together anyway.

The ruler's labels are skipped when they come within 58 px of the previous one.
The horizontal scale in globe mode is a projection, not a linear axis, so the
ticks crowd towards the limb and the whole chord can land in a few dozen pixels.
Ticks are still drawn for every step; only the text is thinned.

**The geometry figure enlarges angles but never shrinks them below true.**
`layout()` scales small angles up to `DRAW_MAX` and lifts the tiniest to
`DRAW_MIN`, but `scale` is `Math.max(1, …)`: from orbit α is over eighty
degrees and squeezing it back to 0.72 rad made the figure claim something other
than what was being computed. The drawn radius gives way instead — A′ sits
`R·tan α` from T, so `R_DRAW` is whatever makes the figure fit the width, down
to `R_MIN`; only past that does the angle itself get compressed. `O`, `TOP_Y`,
`R_DRAW` and `point()` are therefore per-render, not module constants, and at
full size they still evaluate to exactly the old 450/216/236. Arc radii and
label insets scale with `k = R_DRAW / R_MAX`; below `k = 0.7` the three long
dimensions (d₁, d₂, R) move out of the ball and stack under the tangent on the
left, where a small ball has left room. The caption distinguishes all three
cases — enlarged, true, squeezed — and must keep doing so.

**The diagram's frame must contain the actors, not just the surface between
them.** At the end of the chord the local vertical tilts by half the central
angle, so an eye at height `h` sits `h · sin(D/2R)` to the *side* of its own
feet. Below about `0.08 R` that is nothing next to the width of the arc, which
is why bounding the frame by the surface alone worked for years — but from
orbit it dominates. From the Moon's medium orbit the eye lands 30 570 km left
of an arc only 2 108 km wide, fourteen and a half arc-widths outside the old
frame, and the observer was clipped away completely. `xMin`/`xMax` therefore
take the minimum and maximum over the surface *and* `eyePoint`, `basePoint`,
`topPoint`. Two labels follow from the same tilt: the "YOU" caption is placed
under the figure's real position (it rides the mast, so the caption must too),
and the eye-height dimension falls back to a plain label whenever the mast
leans more than 26 px sideways, because a vertical line beside a leaning mast
measures something other than what is drawn.

**The observer's orbits are computed, never typed in** (`HL.orbitPresets`).
Only the low one is a fraction of the radius — a sixteenth, because what limits
it from below is the atmosphere, not the period; that lands on the ISS for the
Earth and on Juno's perijove for Jupiter. The other three are defined by the
*period* (half a day, one day, four days) via `orbitRadius(gm, T)`, so they
follow each body's `gm` and `day` and come out at a different height on every
one — 35 793 km at the Earth, 17 038 km at Mars, 1 530 517 km at Venus, which
turns once in 243 days. Do not replace them with fixed altitudes: "geostationary
at 35 786 km" is wrong on ten of the eleven bodies. A custom body has neither
mass nor day, so its `gm` is estimated from the Earth's mean density and its
day taken as the Earth's; that is deliberate, because it makes an Earth-sized
custom body reproduce the Earth's orbits exactly. Retrograde spin (Venus,
Uranus, Pluto) is stored as a negative `day` and only its magnitude matters
here. `app.maxEyeHeight` is the topmost orbit, so the eye-height ceiling is
per-body — from 46 thousand km at Pluto to 63 million at the Sun.

**The eye-height slider is deliberately in two pieces.** The first 62 % of the
track is exactly the old mapping (0.1 m to 10 km) and the rest reaches orbit.
One logarithm across the whole range would be nine decades at the Earth and
twelve at the Sun, leaving human heights — the thing the app is actually about
— a third of the track or less. `eyeToSlider`/`sliderToEye` must always be given
the same ceiling, or the knob jumps on the first drag; `eyeCeiling(state)`
exists for exactly that.

**The diagram may only span a quarter of the circumference either side of the
chord midpoint.** Past that the arc curves back on itself and the surface path
folds over. `uMin`/`uMax` are clamped for exactly this reason. The line of sight
is built from the eye and the tangency point and extended in *pixel* space —
never from a far-away height, which goes infinite near the limit.

**Colours belong to the body, not to the view.** Each entry in `planets.js`
carries `colors` (`sky`, `surface`, optional `water`, `accent`), a `swatch`, a
`decor` style and an `airless` flag. `HL.planetLook(id)` feeds the side view,
the telescope and the geometry figure so all three agree with the menu. Because
the palette is per-body, the SVG stylesheet must **not** set `stroke`/`fill` on
anything painted from it — pass the colour as an attribute and let CSS handle
only width and opacity, or the class will win over the attribute.

**The geometry figure exaggerates its angles on purpose.** Real α is a
fraction of a degree, so `geometry-view.js` scales the larger of α/β up to
`DRAW_MAX` (keeping their ratio) and lifts anything below `DRAW_MIN`. The figure
stays internally consistent — the right angle really is a right angle and the
tangent really is tangent — and every printed number is the true one. Keep the
"angles are enlarged" note whenever you touch it.

`DRAW_MIN` cannot be lowered casually. The drawn height is `R·(1/cos θ − 1)`,
**quadratic** in the angle: at 0.13 rad it is a 2 px stub and `A`, `A′`, `d₁`,
`t₁` and `α` all land on top of each other. 0.40 rad keeps the segment above
20 px. Every label also goes through the single `put()` helper so `spreadLabels()`
can measure the real `getBBox()` boxes afterwards and step colliding ones apart;
labels are only tested against *earlier* ones, so the pass always terminates.
If you add a label, add it via `put()` with a sensible direction.

**`horizon-map.js` draws the two circles at TRUE scale, and that is the whole
point.** From 1.7 m on the Earth the horizon is 0.12 px on a 150 px globe — it
is *meant* to be invisible, so never "helpfully" enlarge it. Readability comes
from the uniformly magnified inset instead, which prints its magnification. Two
consequences to preserve: the observer dot is clamped so it can never outgrow
the horizon circle (with a very tall object the horizon circle is ~1.5 px and a
fixed dot would paint over it), and when the visible cap is big enough to show
on the sphere itself the inset is dropped and the globe moves to the centre.
Legend entries are two lines (label + right-aligned value, then the detail) and
the label is measured and ellipsised, because object names come from the editor
and can be any length.

**Any SVG in an `<img>` needs an explicit height.** Our drawings carry only a
`viewBox`, so they have an intrinsic ratio but no intrinsic size; inside a flex
container with only `max-height`/`max-width` they collapse to zero width and
vanish silently. That is exactly what happened to every object thumbnail in the
sidebar. Set `height` explicitly and let `object-fit`/`object-position` place
the drawing.

**`derivation.js` renders the two functions on LINEAR axes on purpose.** The
whole app plots only two curves and they are inverses of one another:
`D(h₂) = d₁ + R·arccos(R/(R+h₂))` and `h₂(D) = R·(sec((D−d₁)/R) − 1)`. The first
chart's window follows the selected object (the far field is off-scale and named
in the caption); the second spans the full range so the asymptote at `maxSight`
is visible. Chart 2 samples uniformly in the **angle β**, not in distance — near
the asymptote the distance barely moves while the height races away — and its
y-axis steps in whole radii, because a "nice" step of its own rounds two
different gridlines to the same `2R` label. If a formula row has neither a
substitution nor a result, `formulaRow` gives it `formula-solo` so the
three-column grid does not break the expression mid-line.

**Real sightlines use TWO different radii, and mixing them is a physics bug.**
In `sightlines.js` the distance between two towns comes from the map and does
not change when light bends, so `greatCircle` gets `R_MEAN`; only the visibility
limit gets the effective radius. Computing the distance with `R·7/6` made
refraction *shorten* the list of visible sightlines instead of lengthening it.
The section is deliberately inert — it renders at the bottom of *see* mode,
changes nothing on its own, and only writes to the store through
`app.applySightline()`, which sets every field in one `store.set()` because
`selectObject`/`setPlanet` derive a distance of their own and would overwrite
the measured one.

**Export buttons live inside the card title, so the title text needs its own
`<span>`.** Anything that assigns `textContent` to the whole caption — the
`data-i18n` pass on a language switch, or app.js writing the body name into the
diagram caption — wipes the buttons out. Two of the six disappeared exactly that
way. `HL.Exporter` inlines *computed* styles onto a clone rather than fetching a
stylesheet, because under `file://` neither `fetch` nor `document.styleSheets`
is available.

**Breakpoints are two, and they are independent.** `.stage-row` (telescope beside
the numbers) stacks at 1100 px because it needs more room than the panel alone;
the whole `#main` grid only stacks at **820 px**, so the sidebar is still beside
the content at 1000 px. Do not merge them back into one query — that is what
made a 1000 px window stack the sidebar prematurely.

**Data source priority** is localStorage → `objects.json` → built-in factory
copy. The third exists purely for `file://`, where `fetch()` of a local file
fails. The header badge tells the user which one is live.

## Style

- Comments are bilingual: a Czech line, then an English line. Keep code comments
  ASCII (no diacritics) — full Czech spelling belongs in `strings.js`, JSON data
  and Markdown.
- 2-space indent, LF endings, single quotes in JS.
- Czech is the primary UI language; English is the fallback for missing keys.
- Czech declines nouns, so never drop a `{planet}` placeholder straight into a
  case-bearing slot ("skrz **Země**" is wrong). Put it in apposition or
  parentheses — "skrz celé těleso ({planet})" — so every body reads correctly.

## Attribution

Do not add AI co-author trailers or "generated with" footers to commits or PRs.
