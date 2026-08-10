#!/usr/bin/env node
/**
 * check-geometry.mjs - rychla kontrola vypoctu proti znamym hodnotam.
 * Quick self-test of the curvature maths against textbook values.
 *
 * Spusteni / Run:  node tools/check-geometry.mjs
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */

import { readFile } from 'node:fs/promises';

globalThis.window = {};
const source = await readFile(new URL('../js/core/geometry.js', import.meta.url), 'utf8');
new Function(source)();
const G = globalThis.window.HorizonLab.geometry;

const R = G.effectiveRadius(false);
let failures = 0;

function check(label, actual, expected, tolerance) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (!ok) failures++;
  const mark = ok ? 'OK  ' : 'FAIL';
  console.log(`${mark} ${label.padEnd(52)} ${actual.toFixed(3)}  (ocekavano ${expected.toFixed(3)} ±${tolerance})`);
}

// Pravidlo palce: vzdalenost k obzoru [km] = 3.57 * sqrt(vyska [m]).
check('obzor z 1 m', G.horizonDistance(1, R), 3570, 5);
check('obzor z 1,7 m', G.horizonDistance(1.7, R), 4654, 5);
check('obzor z 100 m', G.horizonDistance(100, R), 35700, 40);

// Priblizna varianta d^2 / (2R) pro skryvanou vysku.
const eye = 1.7;
const distance = 30000;
const beyond = distance - G.horizonDistance(eye, R);
check('skryta vyska ve 30 km z 1,7 m', G.hiddenHeight(eye, distance, R), (beyond * beyond) / (2 * R), 0.05);

// Vydutí uprostred tetivy: D^2 / (8R).
check('vydutí na 30 km', G.bulge(30000, R), (30000 * 30000) / (8 * R), 0.02);
check('vydutí na 100 km', G.bulge(100000, R), (100000 * 100000) / (8 * R), 0.5);

// Stozar 30 m zmizi z ocni vysky 1,7 m asi ve 24 km.
check('plachetnice 30 m zmizi', G.vanishDistance(1.7, 30, R), 24205, 60);

// Pred obzorem se neschovava nic.
check('nic schovaneho pred obzorem', G.hiddenHeight(1.7, 4000, R), 0, 1e-9);

// Refrakce prodluzuje dohled asi o 8 %.
const Rr = G.effectiveRadius(true);
check('refrakce prodlouzi obzor', G.horizonDistance(1.7, Rr) / G.horizonDistance(1.7, R), Math.sqrt(7 / 6), 0.001);

// Konzistence: v bode zmizeni se skryva prave cela vyska objektu.
const vanish = G.vanishDistance(1.7, 53, R);
check('v bode zmizeni je skryto cele', G.hiddenHeight(1.7, vanish, R), 53, 0.02);

// Kreslici soustava: krajni body lezi na y = 0, uprostred je vyduti.
const frame = G.chordFrame(30000, R);
check('tetiva - levy kraj', frame.point(0, 0).y, 0, 1e-6);
check('tetiva - pravy kraj', frame.point(30000, 0).y, 0, 1e-6);
check('tetiva - vrchol vyduti', frame.point(15000, 0).y, G.bulge(30000, R), 1e-6);

console.log(failures === 0 ? '\nVsechny kontroly prosly / all checks passed' : `\n${failures} chyb / failures`);
process.exit(failures === 0 ? 0 : 1);
