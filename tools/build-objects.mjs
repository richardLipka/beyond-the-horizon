#!/usr/bin/env node
/**
 * build-objects.mjs
 * ---------------------------------------------------------------------------
 * Sestavi datovy soubor aplikace z lidsky editovatelnych zdroju.
 * Builds the app's data file from human-editable sources.
 *
 *   tools/objects.source.json  +  tools/svg/*.svg
 *        |
 *        +--> objects.json                  (datovy soubor vedle index.html)
 *        +--> js/data/factory-objects.js    (tovarni zaloha pro rezim file://)
 *
 * Pomer stran ikony (aspect = sirka/vyska) se cte primo z viewBox SVG,
 * takze ho neni treba udrzovat rucne.
 *
 * Spusteni / Run:  node tools/build-objects.mjs
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

/** Precte viewBox a spocita pomer stran kresby. */
function aspectFromViewBox(svgText, file) {
  const m = /viewBox\s*=\s*"([^"]+)"/i.exec(svgText);
  if (!m) throw new Error(`${file}: chybi viewBox / missing viewBox`);
  const [, , w, h] = m[1].trim().split(/[\s,]+/).map(Number);
  if (!(w > 0) || !(h > 0)) throw new Error(`${file}: nevalidni viewBox / invalid viewBox`);
  return Math.round((w / h) * 1000) / 1000;
}

/** Zmensi SVG (komentare, prebytecne bile znaky) pred zakodovanim. */
function minifySvg(svgText) {
  return svgText
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function toDataUri(svgText) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svgText, 'utf8').toString('base64');
}

const source = JSON.parse(await readFile(join(HERE, 'objects.source.json'), 'utf8'));

const objects = [];
for (const item of source.objects) {
  const svgPath = join(HERE, 'svg', item.svg);
  const raw = await readFile(svgPath, 'utf8');
  const svg = minifySvg(raw);
  const { svg: _drop, ...rest } = item;
  objects.push({
    ...rest,
    aspect: aspectFromViewBox(raw, item.svg),
    image: toDataUri(svg),
  });
}

// Vystup je zamerne DETERMINISTICKY (zadne datum sestaveni), aby se dal
// v CI porovnat se zdroji. / Output is deliberately deterministic - no build
// timestamp - so CI can diff it against the sources.
const data = {
  schemaVersion: source.schemaVersion,
  meta: {
    name: { cs: 'Výchozí sada objektů', en: 'Default object set' },
    license: 'MIT',
    copyright: '(c) 2026 Richard Lipka <lipka@fav.zcu.cz>',
  },
  categories: source.categories,
  objects,
};

const json = JSON.stringify(data, null, 2);
await writeFile(join(ROOT, 'objects.json'), json + '\n', 'utf8');

const banner = `/**
 * factory-objects.js - AUTOMATICKY GENEROVANO / AUTO-GENERATED
 * Needitovat rucne. Zdroj: tools/objects.source.json + tools/svg/*.svg
 * Do not edit by hand. Regenerate with:  node tools/build-objects.mjs
 *
 * Tato kopie slouzi jako tovarni zaloha, kdyz aplikace bezi z file://
 * a prohlizec nedovoli nacist objects.json pres fetch().
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
`;
await writeFile(
  join(ROOT, 'js', 'data', 'factory-objects.js'),
  `${banner}window.HorizonLab = window.HorizonLab || {};\nwindow.HorizonLab.FACTORY_DATA = ${json};\n`,
  'utf8'
);

const kb = (json.length / 1024).toFixed(1);
console.log(`OK  ${objects.length} objektu / objects  ->  objects.json + js/data/factory-objects.js  (${kb} kB)`);
