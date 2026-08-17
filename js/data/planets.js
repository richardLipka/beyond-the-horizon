/**
 * planets.js - prednastavena telesa slunecni soustavy.
 * Preset bodies of the solar system.
 *
 * Polomery jsou stredni, v METRECH. U plynnych obru a Slunce je "povrch"
 * mysleny jako vrchol oblacne vrstvy (resp. fotosfera) - stat se na nem neda,
 * ale jako ukazka zakriveni to funguje.
 *
 * Radii are mean radii, in METRES. For the gas giants and the Sun the
 * "surface" means the cloud tops (the photosphere); you could not stand there,
 * but it works fine as a demonstration of curvature.
 *
 * Kazde teleso ma vlastni barvy, kterymi se pak obarvi obloha i povrch ve
 * vsech pohledech - vyber v menu tak odpovida tomu, co je videt v obrazku.
 * Each body carries its own palette; the sky and the surface in every view are
 * painted from it, so the menu matches the picture.
 *
 *   sky     tri zastavky prechodu oblohy (shora dolu)
 *   surface tri zastavky prechodu povrchu (shora dolu)
 *   water   nepovinne - pouzije se pro objekty stojici na hladine
 *   accent  barva vlnek / textury povrchu
 *   decor   'waves' | 'rocks' | 'bands' | 'grass'
 *   airless bez atmosfery -> tmava obloha s hvezdami
 *   gm      gravitacni parametr GM [m^3/s^2]
 *   day     hvezdna (sidericka) doba otocky [s]; zaporna = otaci se pozpatku
 *
 * gm a day slouzi jen k vypoctu obeznych drah pozorovatele. Stacionarni draha
 * neni u kazdeho telesa stejne vysoko - zavisi prave na hmotnosti a na tom,
 * jak rychle se teleso toci. Venuse se otoci jednou za 243 dni, takze jeji
 * stacionarni draha je pres pul druheho milionu kilometru vysoko.
 * gm and day exist only to place the observer's orbits. A stationary orbit is
 * not at the same height on every body: it depends on the mass and on how fast
 * the body spins. Venus turns once in 243 days, so its stationary orbit is over
 * a million and a half kilometres up.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  HL.PLANETS = [
    {
      id: 'sun',
      icon: '☀️',
      radius: 695700000,
      gm: 1.32712440018e20,
      day: 2192832,
      gaseous: true,
      name: { cs: 'Slunce', en: 'The Sun' },
      swatch: '#ffb03a',
      decor: 'bands',
      colors: {
        sky: ['#fff3c4', '#ffe08a', '#ffcc63'],
        surface: ['#fff0a8', '#ffab2e', '#bf3d0d'],
        accent: '#fff6d5',
      },
    },
    {
      id: 'mercury',
      icon: '🟤',
      radius: 2439700,
      gm: 2.2032e13,
      day: 5067031.7,
      airless: true,
      name: { cs: 'Merkur', en: 'Mercury' },
      swatch: '#7b7168',
      decor: 'rocks',
      colors: {
        sky: ['#070b14', '#141d2b', '#2b3746'],
        surface: ['#a79c92', '#786e65', '#443d37'],
        accent: '#d5ccc3',
      },
    },
    {
      id: 'venus',
      icon: '🟡',
      radius: 6051800,
      gm: 3.24859e14,
      day: -20997152.6,
      name: { cs: 'Venuše', en: 'Venus' },
      swatch: '#c9a24d',
      decor: 'rocks',
      colors: {
        sky: ['#f6dda4', '#e9c477', '#d8a554'],
        surface: ['#e2c07a', '#b98f4c', '#75581f'],
        accent: '#f9ebc6',
      },
    },
    {
      id: 'earth',
      icon: '🌍',
      radius: 6371008.8,
      gm: 3.986004418e14,
      day: 86164.0905,
      name: { cs: 'Země', en: 'Earth' },
      swatch: '#2e9fbd',
      decor: 'grass',
      colors: {
        sky: ['#9fd6ea', '#d7eef7', '#f2fafc'],
        surface: ['#79b276', '#3f7f56', '#245740'],
        water: ['#2e9fbd', '#14688a', '#0a3d5c'],
        accent: '#ffffff',
      },
    },
    {
      id: 'moon',
      icon: '🌕',
      radius: 1737400,
      gm: 4.9048695e12,
      day: 2360591.5,
      airless: true,
      name: { cs: 'Měsíc', en: 'The Moon' },
      swatch: '#9a958d',
      decor: 'rocks',
      colors: {
        sky: ['#05070d', '#101725', '#1f2836'],
        surface: ['#d2cdc5', '#9a958d', '#5b5751'],
        accent: '#f0ece5',
      },
    },
    {
      id: 'mars',
      icon: '🔴',
      radius: 3389500,
      gm: 4.282837e13,
      day: 88642.663,
      name: { cs: 'Mars', en: 'Mars' },
      swatch: '#a1502f',
      decor: 'rocks',
      colors: {
        sky: ['#f2cfa9', '#e2ab7e', '#cb8a5c'],
        surface: ['#c9744a', '#9d4d2c', '#612b17'],
        accent: '#f4d3b6',
      },
    },
    {
      id: 'jupiter',
      icon: '🟠',
      radius: 69911000,
      gm: 1.26686534e17,
      day: 35729.7,
      gaseous: true,
      name: { cs: 'Jupiter', en: 'Jupiter' },
      swatch: '#c98f5e',
      decor: 'bands',
      colors: {
        sky: ['#faead6', '#ecc9a2', '#dcab7c'],
        surface: ['#eccba2', '#c68a58', '#82522e'],
        accent: '#fff2e0',
      },
    },
    {
      id: 'saturn',
      icon: '🪐',
      radius: 58232000,
      gm: 3.7931187e16,
      day: 38018,
      gaseous: true,
      name: { cs: 'Saturn', en: 'Saturn' },
      swatch: '#c9b273',
      decor: 'bands',
      colors: {
        sky: ['#faf1d4', '#eee0ae', '#dfcd8e'],
        surface: ['#ecdcab', '#c6ad6f', '#87723e'],
        accent: '#fdf7e2',
      },
    },
    {
      id: 'uranus',
      icon: '🔵',
      radius: 25362000,
      gm: 5.793939e15,
      day: -62064,
      gaseous: true,
      name: { cs: 'Uran', en: 'Uranus' },
      swatch: '#6fbecb',
      decor: 'bands',
      colors: {
        sky: ['#d6f2f5', '#aee2ea', '#88cfdb'],
        surface: ['#a9e1e9', '#69b9c7', '#356f7d'],
        accent: '#e6fafc',
      },
    },
    {
      id: 'neptune',
      icon: '🔷',
      radius: 24622000,
      gm: 6.836529e15,
      day: 57996,
      gaseous: true,
      name: { cs: 'Neptun', en: 'Neptune' },
      swatch: '#3557a8',
      decor: 'bands',
      colors: {
        sky: ['#c9dcf8', '#9ab9ec', '#7396dc'],
        surface: ['#5f8ad4', '#33539f', '#182a58'],
        accent: '#d9e6fc',
      },
    },
    {
      id: 'pluto',
      icon: '⚪',
      radius: 1188300,
      gm: 8.71e11,
      day: -551856.7,
      airless: true,
      name: { cs: 'Pluto', en: 'Pluto' },
      swatch: '#a89681',
      decor: 'rocks',
      colors: {
        sky: ['#0a0812', '#191426', '#2b2438'],
        surface: ['#ddcfba', '#a89681', '#665849'],
        accent: '#f2e9dc',
      },
    },
  ];

  /** Nahradni paleta pro "vlastni teleso" - neutralni morska modr. */
  HL.CUSTOM_PALETTE = {
    swatch: '#1f8fa8',
    decor: 'grass',
    colors: {
      sky: ['#9fd6ea', '#d7eef7', '#f2fafc'],
      surface: ['#7fa8b4', '#4a7d8c', '#2a4c5b'],
      water: ['#2e9fbd', '#14688a', '#0a3d5c'],
      accent: '#ffffff',
    },
  };

  HL.DEFAULT_PLANET = 'earth';

  HL.findPlanet = function (id) {
    return HL.PLANETS.find((planet) => planet.id === id) || null;
  };

  HL.planetRadius = function (id, customRadius) {
    if (id === 'custom') return customRadius > 0 ? customRadius : HL.geometry.R_MEAN;
    const planet = HL.findPlanet(id);
    return planet ? planet.radius : HL.geometry.R_MEAN;
  };

  /**
   * Stredni hustota Zeme [kg/m^3] a delka hvezdneho dne [s]. Pouzije se u
   * "vlastniho telesa", o kterem uzivatel zadava jen prumer - pri pozemskem
   * prumeru tak vyjdou presne pozemska cisla.
   * Earth's mean density and sidereal day, used for the custom body, of which
   * the user gives only the diameter; at the Earth's diameter the orbits then
   * come out exactly as the Earth's.
   */
  const EARTH_DENSITY = 5513.6;
  const EARTH_DAY = 86164.0905;

  /**
   * Ctyri stanoviste pozorovatele na obezne draze.
   *
   * Nizka draha je dana zlomkem polomeru: zdola ji omezuje atmosfera, ne
   * obezna doba. Sestnactina polomeru vychazi u Zeme na 398 km (tam lita ISS)
   * a u Jupiteru na 4 369 km (tam ma perijovium sonda Juno).
   * Ostatni tri jsou dane obeznou DOBOU, tedy tim, jak rychle se teleso toci:
   * pul dne (u Zeme presne draha GPS), jeden den (stacionarni) a ctyri dny.
   *
   * The low orbit is a fraction of the radius, because what limits it from
   * below is the atmosphere, not the period; a sixteenth of the radius is
   * 398 km on the Earth (where the ISS flies) and 4 369 km at Jupiter (where
   * Juno's perijove is). The other three are defined by the PERIOD - half a
   * day (exactly the GPS orbit on the Earth), one day (stationary) and four.
   */
  const ORBITS = [
    { key: 'orbit.low', icon: '🛰️', fraction: 1 / 16 },
    { key: 'orbit.medium', icon: '📡', laps: 0.5 },
    { key: 'orbit.geo', icon: '📺', laps: 1 },
    { key: 'orbit.high', icon: '🌌', laps: 4 },
  ];

  /**
   * Vysky obeznych drah nad povrchem daneho telesa, serazene odspodu.
   * Orbit altitudes above the surface of the given body, lowest first.
   *
   * @param {string} id     identifikator telesa ('custom' = vlastni)
   * @param {number} radius polomer telesa [m]
   * @returns {{key: string, icon: string, value: number, period: number}[]}
   */
  HL.orbitPresets = function (id, radius) {
    const R = radius > 0 ? radius : HL.geometry.R_MEAN;
    const planet = HL.findPlanet(id);
    const gm = planet && planet.gm > 0 ? planet.gm : HL.geometry.gmFromDensity(R, EARTH_DENSITY);
    // Venuse, Uran i Pluto se otaci pozpatku; na vysku drahy ma vliv jen
    // delka otocky. / Retrograde spin only changes the direction, not the
    // height of the orbit.
    const day = planet && planet.day ? Math.abs(planet.day) : EARTH_DAY;

    const out = [];
    for (const orbit of ORBITS) {
      const r = orbit.fraction
        ? R * (1 + orbit.fraction)
        : HL.geometry.orbitRadius(gm, day * orbit.laps);
      // Male a rychle rotujici teleso muze mit stacionarni drahu pod povrchem;
      // takovou nabizet nelze. / A small, fast-spinning body can have its
      // stationary orbit below the surface, and that one cannot be offered.
      if (!(r > R)) continue;
      const altitude = r - R;
      out.push({
        key: orbit.key,
        icon: orbit.icon,
        // Nad sto kilometru se zaokrouhluje na cele kilometry. Presna vyska
        // vychazi na 35 793 160,82 m a takove cislo se do policka nevejde ani
        // necte, pritom uz volba stredniho polomeru misto rovnikoveho s nim
        // pohne o sedm kilometru. / Above a hundred kilometres this rounds to
        // whole kilometres: the exact figure is 35,793,160.82 m, which neither
        // fits the input nor reads, while the choice of mean over equatorial
        // radius already moves it by seven kilometres.
        value: altitude >= 100000 ? Math.round(altitude / 1000) * 1000 : Math.round(altitude),
        // Doba obehu patri k presne draze, ne k zaokrouhlene vysce.
        period: HL.geometry.orbitPeriod(gm, r),
      });
    }
    return out.sort((a, b) => a.value - b.value);
  };

  /**
   * Vrati vzhled telesa pro kresleni. U vlastniho telesa se pouzije
   * nahradni paleta. / Returns the look of a body for drawing.
   */
  HL.planetLook = function (id) {
    const planet = HL.findPlanet(id);
    if (!planet) return HL.CUSTOM_PALETTE;
    return { swatch: planet.swatch, decor: planet.decor, colors: planet.colors, airless: !!planet.airless };
  };
})((window.HorizonLab = window.HorizonLab || {}));
