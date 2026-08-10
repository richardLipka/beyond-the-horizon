# 🌍 Beyond the Horizon · Za obzorem

**A classroom simulator that shows how the curvature of the Earth hides distant things.**
Built for elementary-school pupils. Czech and English. No dependencies, no build step — open `index.html` and it works.

[![CI](https://github.com/richardLipka/beyond-the-horizon/actions/workflows/ci.yml/badge.svg)](https://github.com/richardLipka/beyond-the-horizon/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](package.json)

🇨🇿 **[Česká verze tohoto souboru →](README.cs.md)**
▶️ **[Live demo](https://richardlipka.github.io/beyond-the-horizon/)**

![The main diagram: an observer 1.7 m tall looking at the Titanic 25 km away, with 32.9 m hidden behind the bulge of the Earth](docs/preview-diagram.svg)

---

## What it does

Set how high your eyes are, pick something to look at, and slide it away from
you. The app draws the answer three ways at once — as a labelled side view of
the curved Earth, as the view through a telescope, and as numbers.

### 👁️ What can I see?

The side view carries **every measurement on the picture itself**: distance to
your horizon, how far the object lies beyond it, how much of it is hidden, how
much is left, the bulge of water halfway across, a distance ruler with ticks and
a scale bar. Next to it, a round eyepiece view shows what your eyes would
actually see — the hidden part drawn as a dashed ghost below the waterline.

<img src="docs/preview-telescope.svg" width="330" alt="The telescope view: the top 20.1 m of the Titanic above the horizon, the rest a dashed ghost below">

### 🌊 When does it vanish?

The distance at which an object disappears completely, shown as the sum that
produces it (`your horizon + horizon from the object's top`), a chart of visible
height against distance with three coloured bands, a step-by-step table, and a
clickable comparison of every object in the data file.

### 🧰 Object editor

Add your own church, tower or ship — picture included. Upload an image and it is
stored straight into the JSON as base64, with the aspect ratio detected
automatically. Edits preview live in the diagram. Save into the browser or
download a fresh `objects.json`.

---

## Quick start

**The simple way** — double-click `index.html`. Works offline, no server, no
install. Object data comes from the built-in factory copy.

**With the data file** — a browser will not `fetch()` a local file over
`file://`, so to load `objects.json` you need a server. A dependency-free one is
included:

```bash
npm start
```

Then open <http://localhost:8123>. The badge in the header always tells you which
data source is live.

---

## What ships in the box

Fifteen objects, each with a hand-drawn SVG, a height, and a fun fact in both
languages:

| | |
| --- | --- |
| **People & houses** | a person (1.75 m), a family house (8 m) |
| **Ships** | sailing boat (30 m), lighthouse (40 m), Titanic (53 m), container ship (60 m) |
| **Towers & buildings** | Petřín Lookout Tower (63.5 m), Statue of Liberty (93 m), Ještěd (94 m), St Bartholomew's Cathedral in Pilsen (102.3 m), wind turbine (150 m), Eiffel Tower (330 m), Burj Khalifa (828 m) |
| **Mountains** | Sněžka (1603 m), Mount Everest (8849 m) |

---

## The maths

Everything lives in [`js/core/geometry.js`](js/core/geometry.js). Earth radius
6 371 km, distances measured **along the surface**, heights **perpendicular to
it**.

| Quantity | Formula |
| --- | --- |
| distance to the horizon | `d = R · arccos(R / (R + h))` ≈ 3.57 · √h  (h in m, d in km) |
| height hidden by the bulge | `R · (sec(d₂ / R) − 1)`, where `d₂` is the part beyond the horizon |
| distance of disappearance | your horizon + the horizon from the object's top |
| bulge halfway across | `R · (1 − cos(D / 2R))` ≈ D² / 8R |

A **refraction** switch replaces the radius with an effective `R · 7/6` — air
bends light downwards, so you really see about 8 % further, and the rule of
thumb becomes 3.86 · √h.

Verified against textbook values on every push:

```bash
npm test
```

### Honesty about the picture

Real curvature is invisible at true scale, so the diagram uses **different
horizontal and vertical scales**. The factor is never hidden — it is computed per
render and printed into the image ("Heights are stretched 182×"). Object widths
are not to scale; **heights and distances are**. The model assumes a perfect
sphere with a smooth surface between observer and object.

---

## The data file

`objects.json` sits next to `index.html` and is self-contained — pictures are
embedded as base64.

```jsonc
{
  "schemaVersion": 1,
  "categories": [
    { "id": "ships", "icon": "⛵", "name": { "cs": "Lodě", "en": "Ships" } }
  ],
  "objects": [
    {
      "id": "titanic",
      "category": "ships",
      "name": { "cs": "Titanic", "en": "Titanic" },
      "height": 53,               // metres above the surface
      "aspect": 3.6,              // drawing width ÷ height
      "baseline": "sea",          // "sea" = waterline, "ground" = land
      "defaultDistance": 35000,   // suggested distance in metres
      "fact": { "cs": "…", "en": "…" },
      "image": "data:image/svg+xml;base64,…"
    }
  ]
}
```

### Adding an object — two routes

**In the editor** (for teachers and pupils): the 🧰 tab → *New object* → fill in,
upload a picture, *Download objects.json*, and save it next to `index.html`.

**Through the build** (for maintaining the shipped set): drop a drawing into
`tools/svg/`, describe the object in `tools/objects.source.json`, then

```bash
npm run build
```

The script reads each `viewBox`, derives `aspect`, encodes the SVG as base64 and
rewrites both `objects.json` and the factory fallback. Output is deterministic,
and CI checks it still matches its sources.

> Drawings work best when the object **rests exactly on the bottom edge** of the
> `viewBox` and its **tip touches the top edge** — the image height then equals
> the object height.

---

## Project layout

```
index.html          the page and the script order
objects.json        object data (generated — do not hand-edit)

css/                theme · layout · components · diagram
js/core/            geometry · format · store · dom
js/i18n/            strings (cs + en) · language switching
js/data/            factory fallback (generated) · loading & validation
js/ui/              diagram · telescope · chart · controls · results · vanish · editor
js/app.js           wires state to views

tools/svg/          editable source drawings
tools/              build-objects · check-geometry · check-strings · serve
```

Each layer knows only the one beneath it: `geometry.js` has no DOM and no
language, `strings.js` has no logic, `diagram.js` never touches the controls.
Adding a fourth mode or a fifth language means touching one place.

---

## Adding a language

1. Add another key (e.g. `de`) to `js/i18n/strings.js` with the same key set.
2. Add `<button data-lang="de">DE</button>` to the language switch in `index.html`.
3. Add a `"de"` variant to names and facts in `tools/objects.source.json`, then rebuild.

Missing keys fall back to English automatically. `node tools/check-strings.mjs`
reports anything you forgot.

---

## Development

```bash
npm start                       # dev server
npm run build                   # regenerate the data file
npm test                        # geometry self-test (13 checks)
node tools/check-strings.mjs    # translation completeness
```

See [CLAUDE.md](CLAUDE.md) for the architectural rules — most importantly that
the app uses classic scripts rather than ES modules so it keeps working from
`file://`.

---

## Contributing

Issues and pull requests are welcome, especially new objects from other
countries, translations, and corrections from teachers who have used it in a
lesson. Please run the three checks above before opening a PR.

## Licence

[MIT](LICENSE) © 2026 Richard Lipka &lt;lipka@fav.zcu.cz&gt;

Free to use, copy and modify in schools and anywhere else.
