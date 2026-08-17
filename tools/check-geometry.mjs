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

// --- meze viditelnosti / limits of sight ---------------------------------
// I z nekonecne vysky je videt prave na polokouli: obzor se blizi ctvrtine
// obvodu a nikdy ji neprekroci.
check('obzor z obri vysky -> ctvrtina obvodu', G.horizonDistance(1e15, R), (Math.PI / 2) * R, 1);
const quarterR = (Math.PI / 2) * R;
check('obzor z 1e9 m mez neprekroci', G.horizonDistance(1e9, R) < quarterR ? 1 : 0, 1, 0);
check('obzor z 1e9 m se k mezi blizi na 1 %', G.horizonDistance(1e9, R) / quarterR, 1, 0.01);
check('mez dohledu z 1,7 m', G.maxSightDistance(1.7, R), G.horizonDistance(1.7, R) + (Math.PI / 2) * R, 1e-6);

// Za mezi dohledu nepomuze zadna vyska - potrebna vyska je nekonecna.
const limit = G.maxSightDistance(1.7, R);
check('tesne pred mezi je vyska konecna', G.heightToBeSeen(1.7, limit * 0.999, R) > 0 ? 1 : 0, 1, 0);
check(
  'za mezi je potreba nekonecna vyska',
  isFinite(G.heightToBeSeen(1.7, limit * 1.001, R)) ? 0 : 1,
  1,
  0
);
check('na protilehlem bode neni videt nic', isFinite(G.hiddenHeight(1.7, G.antipodeDistance(R), R)) ? 0 : 1, 1, 0);

// Ani dve nekonecne vysoke veze se navzajem neuvidi dal nez pres pul obvodu.
check('dve obri veze -> polovina obvodu', G.vanishDistance(1e15, 1e15, R), Math.PI * R, 2);
check('Everest je porad hluboko pod mezi', G.vanishDistance(1.7, 8849, R) < limit ? 1 : 0, 1, 0);

// --- jina telesa / other bodies -------------------------------------------
const R_MOON = 1737400;
const R_MARS = 3389500;
check('obzor z 1,7 m na Mesici', G.horizonDistance(1.7, R_MOON), Math.sqrt(2 * R_MOON * 1.7), 1);
check('pravidlo palce pro Zemi', G.rootRuleConstant(R), 3.5696, 0.001);
check('pravidlo palce pro Mesic', G.rootRuleConstant(R_MOON), 1.8641, 0.001);
check('pravidlo palce pro Mars', G.rootRuleConstant(R_MARS), 2.6037, 0.001);
check('protilehly bod Marsu', G.antipodeDistance(R_MARS), Math.PI * R_MARS, 1e-6);

// Mensi teleso schova stejny objekt driv.
check(
  'plachetnice zmizi na Mesici driv nez na Zemi',
  G.vanishDistance(1.7, 30, R_MOON) < G.vanishDistance(1.7, 30, R) ? 1 : 0,
  1,
  0
);

// solve() musi vzdalenost oriznout na protilehly bod a oznacit ji jako marnou
const farSide = G.solve({ planetRadius: R, eyeHeight: 1.7, objectHeight: 8849, distance: 1e9 });
check('solve orizne vzdalenost na protilehly bod', farSide.distance, Math.PI * R, 1e-6);
check('solve hlasi beyondReach', farSide.beyondReach ? 1 : 0, 1, 0);
check('solve na protilehlem bode nic nevidi', farSide.visible, 0, 0);

// solve() bez zadaneho polomeru pocita se Zemi
const earthDefault = G.solve({ eyeHeight: 1.7, objectHeight: 30, distance: 20000 });
check('solve bez polomeru pouzije Zemi', earthDefault.physicalRadius, G.R_MEAN, 1e-6);

// --- vrchlik / the visible spherical cap -----------------------------------
// Cely povrch, polokoule a nic.
check('vrchlik pres celou kouli', G.capArea(Math.PI, R), 4 * Math.PI * R * R, 1);
check('vrchlik pres polokouli', G.capArea(Math.PI / 2, R), 2 * Math.PI * R * R, 1);
check('nulovy vrchlik', G.capArea(0, R), 0, 0);
check('podil cele koule', G.capShare(Math.PI), 1, 1e-12);
check('podil polokoule', G.capShare(Math.PI / 2), 0.5, 1e-12);
// Ze stejne vysky je na mensim telese videt VETSI podil jeho povrchu - obzor
// je sice bliz, ale teleso je jeste mensi.
check(
  'na Mesici je z 1,7 m videt vetsi podil nez na Zemi',
  G.capShare(G.dip(1.7, R_MOON)) > G.capShare(G.dip(1.7, R)) ? 1 : 0,
  1,
  0
);
// Maly vrchlik je prakticky kruh o polomeru rovnem vzdalenosti k obzoru.
const capAlpha = G.dip(1.7, R);
check(
  'maly vrchlik ~ kruh pi*d^2',
  G.capArea(capAlpha, R),
  Math.PI * Math.pow(G.horizonDistance(1.7, R), 2),
  1000
);
// Z ocni vysky je videt asi 68 km2, tedy zhruba 1 : 7,5 milionu povrchu.
check('vrchlik z 1,7 m na Zemi [km2]', G.capArea(capAlpha, R) / 1e6, 68.1, 0.2);
check('podil povrchu z 1,7 m', 1 / G.capShare(capAlpha) / 1e6, 7.5, 0.05);

// --- tvar obou funkci / the shape of the two plotted functions -------------
// Cely zbytek aplikace kresli jen dve funkce a jsou navzajem inverzni:
//   D(h2)  = d1 + R * arccos(R/(R+h2))       "Kdy zmizi?"
//   h2(D)  = R * (1/cos((D-d1)/R) - 1)       "Meze viditelnosti"
const BODIES = [R, R_MOON, R_MARS, 1188300, 695700000];
const EYE_SET = [0.1, 1, 1.7, 10, 100, 1000, 100000];
const HEIGHT_SET = [1.75, 30, 93, 330, 828, 1603, 8849, 21900];

let worstInverse = 0;
let notRising = 0;
let notFallingVisible = 0;
let finiteAtLimit = 0;

for (const radius of BODIES) {
  for (const h1 of EYE_SET) {
    const d1 = G.horizonDistance(h1, radius);
    const sightLimit = G.maxSightDistance(h1, radius);

    // Presne NA mezi dohledu musi vyjit nekonecno. Bez uhlove rezervy tu
    // zaokrouhleni vraci obrovske, ale konecne cislo.
    if (isFinite(G.heightToBeSeen(h1, sightLimit, radius))) finiteAtLimit++;

    // Potrebna vyska roste s kazdym metrem vzdalenosti.
    let previous = -1;
    for (let i = 1; i < 200; i++) {
      const value = G.heightToBeSeen(h1, d1 + ((sightLimit - d1) * i) / 200, radius);
      if (!(value > previous)) notRising++;
      previous = value;
    }

    for (const h2 of HEIGHT_SET) {
      // Inverze: ve vzdalenosti zmizeni je potrebna vyska prave h2.
      const vanishAt = G.vanishDistance(h1, h2, radius);
      worstInverse = Math.max(worstInverse, Math.abs(G.heightToBeSeen(h1, vanishAt, radius) - h2) / h2);

      // Viditelna vyska h2 - h_potrebna nesmi nikde vzrust.
      let last = h2 + 1;
      for (let i = 0; i <= 100; i++) {
        const visible = Math.max(0, h2 - G.heightToBeSeen(h1, d1 + ((vanishAt - d1) * i) / 100, radius));
        if (visible > last + 1e-9) notFallingVisible++;
        last = visible;
      }
    }
  }
}

check('obe funkce jsou navzajem inverzni', worstInverse, 0, 1e-6);
check('potrebna vyska nikde neklesa', notRising, 0, 0);
check('viditelna vyska nikde neroste', notFallingVisible, 0, 0);
check('na mezi dohledu vzdy nekonecno', finiteAtLimit, 0, 0);

// Smernice krivky D(h2) proti numericke derivaci. Krok je pomerny k vysce;
// chyba centralni diference je pak radove (krok/vyska)^2 / 8, tedy 1e-7.
for (const h2 of [1, 100, 8849]) {
  const step = h2 * 1e-3;
  const numeric = (G.vanishDistance(0, h2 + step, R) - G.vanishDistance(0, h2 - step, R)) / (2 * step);
  check(`smernice D(h2) v ${h2} m`, G.vanishSlope(h2, R), numeric, Math.abs(numeric) * 1e-5);
}
// Odmocninovy tvar: u nuly nekonecne strma, ve velke vysce skoro vodorovna.
check('smernice u nuly je nekonecna', isFinite(G.vanishSlope(0, R)) ? 0 : 1, 1, 0);
check('smernice ve velke vysce klesa k nule', G.vanishSlope(1e9, R), 0, 0.01);

// --- obezne drahy pozorovatele / the observer's orbits --------------------
// Vysky drah se nezadavaji rucne, pocitaji se z hmotnosti a doby otocky
// telesa - musi tedy vyjit skutecne drahy skutecnych druzic.
const planetsSource = await readFile(new URL('../js/data/planets.js', import.meta.url), 'utf8');
new Function(planetsSource)();
const HL = globalThis.window.HorizonLab;

// Treti Kepleruv zakon tam a zpatky.
const GM_EARTH = 3.986004418e14;
check(
  'obezna doba a polomer jsou navzajem inverzni',
  G.orbitPeriod(GM_EARTH, G.orbitRadius(GM_EARTH, 86164.0905)),
  86164.0905,
  1e-6
);
// Nizka draha Zeme = 400 km, jeden oblet za 92 minut (ISS).
check('nizka draha obehne Zemi za 92 minut', G.orbitPeriod(GM_EARTH, 6371008.8 + 398188) / 60, 92.4, 0.3);

const orbitOf = (id, key) => {
  const radius = HL.planetRadius(id);
  return HL.orbitPresets(id, radius).find((o) => o.key === key);
};

// Geostacionarni draha: 35 786 km nad rovnikem (tady nad strednim polomerem).
check('geostacionarni draha Zeme', orbitOf('earth', 'orbit.geo').value, 35793e3, 20e3);
// Draha GPS je presne puldenni, tedy "stredni draha".
check('stredni draha Zeme je draha GPS', orbitOf('earth', 'orbit.medium').value, 20191e3, 60e3);
// Areostacionarni draha Marsu je 17 032 km - Mars se toci o neco pomaleji.
check('areostacionarni draha Marsu', orbitOf('mars', 'orbit.geo').value, 17038e3, 20e3);
// Jupiter se toci za necelych 10 hodin, presto je jeho draha vys nez zemska.
check('stacionarni draha Jupiteru', orbitOf('jupiter', 'orbit.geo').value, 90098e3, 200e3);
// Venuse se otoci jednou za 243 dni - draha je pres milion a pul kilometru.
check('stacionarni draha Venuse', orbitOf('venus', 'orbit.geo').value / 1e6, 1530.5, 5);

// Kazda stacionarni draha musi mit obeznou dobu presne rovnou dni telesa.
let wrongPeriod = 0;
let wrongOrder = 0;
for (const planet of HL.PLANETS) {
  const orbits = HL.orbitPresets(planet.id, planet.radius);
  if (orbits.length !== 4) wrongOrder++;
  const geo = orbits.find((o) => o.key === 'orbit.geo');
  if (!geo || Math.abs(geo.period - Math.abs(planet.day)) > 1e-3) wrongPeriod++;
  for (let i = 1; i < orbits.length; i++) {
    if (!(orbits[i].value > orbits[i - 1].value)) wrongOrder++;
  }
  // Ani z nejvyssi drahy neni videt vic nez polokoule.
  const top = orbits[orbits.length - 1].value;
  if (G.horizonDistance(top, planet.radius) >= (Math.PI / 2) * planet.radius) wrongOrder++;
}
check('stacionarni draha obehne za jeden den telesa', wrongPeriod, 0, 0);
check('drahy jdou vzdy vzestupne a jsou ctyri', wrongOrder, 0, 0);

// Vlastni teleso: bez hmotnosti se odhaduje ze stredni hustoty Zeme, takze
// pri pozemskem polomeru musi vyjit pozemska cisla.
check(
  'vlastni teleso velikosti Zeme ma zemske drahy',
  orbitOf('custom', 'orbit.geo') ? 0 : 1,
  0,
  0
);
check(
  'vlastni teleso: stacionarni draha jako u Zeme',
  HL.orbitPresets('custom', 6371008.8).find((o) => o.key === 'orbit.geo').value,
  35793e3,
  20e3
);

console.log(failures === 0 ? '\nVsechny kontroly prosly / all checks passed' : `\n${failures} chyb / failures`);
process.exit(failures === 0 ? 0 : 1);
