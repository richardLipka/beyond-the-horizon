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
   key sets and matching `{placeholders}`.

5. **No dependencies.** No npm packages, no CDN links, no web fonts, no
   analytics. The app must work fully offline.

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

**Horizontal and vertical scales differ** in the diagram, by design — real
curvature is invisible at true scale. The factor is computed per render and
printed into the picture. When the object is huge and close the factor drops
below 1, so the wording switches to `diagram.compression` / `diagram.sameScale`.
Never silently drop that note.

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
