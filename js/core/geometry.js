/**
 * geometry.js - cista matematika zakriveni Zeme.
 * Pure Earth-curvature math: no DOM, no translations, only numbers.
 *
 * Vsechny delky jsou v METRECH, uhly v RADIANECH.
 * All lengths in METRES, all angles in RADIANS.
 *
 * Znaceni / notation:
 *   h1 = vyska oci pozorovatele nad povrchem   (observer eye height)
 *   h2 = vyska objektu nad povrchem            (object height)
 *   D  = vzdalenost merena PO POVRCHU Zeme     (distance along the surface)
 *   R  = (efektivni) polomer Zeme              (effective Earth radius)
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  /** Stredni polomer Zeme podle IUGG [m]. */
  const R_MEAN = 6371008.8;

  /**
   * Standardni koeficient refrakce. Atmosfera ohyba svetlo dolu, takze
   * paprsek "kopiruje" Zemi - pocita se s vetsim, tzv. efektivnim polomerem.
   * Standard refraction coefficient (k = 7/6): light bends downwards, so we
   * model it with a larger, "effective" Earth radius.
   */
  const K_REFRACTION = 7 / 6;

  /** Zdanlivy prumer Mesice na obloze [rad] - hodi se pro porovnani. */
  const MOON_ANGULAR_DIAMETER = 0.0090757; // ~0.52 stupne

  /** Gravitacni konstanta [m^3 kg^-1 s^-2]. / Gravitational constant. */
  const GRAVITY = 6.6743e-11;

  /**
   * Uhlova rezerva u meze dohledu.
   *
   * Presne na mezi vyjde (D - d1)/R kvuli zaokrouhleni o vlasek POD pi/2
   * a sekans pak vrati obrovske, ale konecne cislo - namereno az 2,5e24 m.
   * 1e-12 rad je na Zemi 6 mikrometru oblouku, zato potrebna vyska by v te
   * chvili byla 6e12 km (asi 43 astronomickych jednotek). Obe cisla jsou
   * daleko za hranici jakekoli ulohy, takze je poctivejsi drzet se meze
   * z bezpecne strany a rict rovnou "nekonecno".
   *
   * Angular slack at the sight limit: exactly at the limit rounding can leave
   * (D - d1)/R a hair below pi/2, and the secant then returns a huge but
   * finite number (up to 2.5e24 m was measured). 1e-12 rad is 6 micrometres
   * of arc on the Earth, while the required height there would be 6e12 km,
   * so erring towards "infinite" is the honest choice.
   */
  const ANGLE_EPSILON = 1e-12;

  /**
   * Efektivni polomer telesa. Bez zadaneho polomeru se pocita se Zemi.
   * Effective radius of the body; defaults to the Earth.
   */
  function effectiveRadius(useRefraction, baseRadius) {
    const R = baseRadius > 0 ? baseRadius : R_MEAN;
    return useRefraction ? R * K_REFRACTION : R;
  }

  /**
   * Vzdalenost k obzoru merena PO POVRCHU (delka oblouku).
   * Distance to the horizon measured along the surface (arc length).
   * Pro male vysky plati priblizne d ~ sqrt(2*R*h)  ->  3,57 * sqrt(h[m]) km.
   *
   * S rostouci vyskou se vysledek blizi ctvrtine obvodu (R*pi/2) a nikdy ji
   * neprekroci - i z nekonecne vysky je videt prave na polokouli.
   * As the height grows the result approaches a quarter of the circumference
   * and never exceeds it: even from infinitely high you see exactly one
   * hemisphere.
   */
  function horizonDistance(height, R) {
    if (!(height > 0)) return 0;
    return R * Math.acos(R / (R + height));
  }

  /** Ctvrtina obvodu - mez, ke ktere se obzor blizi v nekonecne vysce. */
  function maxHorizonDistance(R) {
    return (Math.PI / 2) * R;
  }

  /** Vzdalenost k protilehlemu bodu telesa (polovina obvodu). */
  function antipodeDistance(R) {
    return Math.PI * R;
  }

  /**
   * Nejvetsi vzdalenost, ve ktere lze jeste neco spatrit: obzor pozorovatele
   * plus ctvrtina obvodu. Za ni uz nepomuze ani nekonecne vysoky objekt,
   * protoze by musel prosahnout skrz planetu.
   * The furthest anything can ever be seen from: the observer's horizon plus a
   * quarter of the circumference. Beyond it no height whatsoever helps.
   */
  function maxSightDistance(eyeHeight, R) {
    return horizonDistance(eyeHeight, R) + maxHorizonDistance(R);
  }

  /**
   * Konstanta pravidla palce  d[km] = k * odmocnina(h[m]).
   * Pro Zemi vyjde 3,57 (s refrakci 3,86), pro jina telesa jinak.
   */
  function rootRuleConstant(R) {
    return Math.sqrt(2 * R) / 1000;
  }

  /** Prima (vzdusna) vzdalenost od oka k bodu dotyku na obzoru. */
  function horizonLineOfSight(height, R) {
    if (!(height > 0)) return 0;
    return Math.sqrt(height * (2 * R + height));
  }

  /**
   * Jak vysoka cast objektu je schovana za vydutim Zeme.
   * How much of a distant object is hidden by the bulge.
   * Vraci Infinity, pokud je objekt uz "na druhe strane" planety.
   */
  function hiddenHeight(eyeHeight, distance, R) {
    const toHorizon = horizonDistance(eyeHeight, R);
    const beyond = distance - toHorizon;
    if (beyond <= 0) return 0;
    const angle = beyond / R;
    if (angle >= Math.PI / 2 - ANGLE_EPSILON) return Infinity;
    return R * (1 / Math.cos(angle) - 1);
  }

  /**
   * Vzdalenost, ve ktere objekt uplne zmizi (spicka se dotkne obzoru).
   * Distance at which the object disappears completely.
   */
  function vanishDistance(eyeHeight, objectHeight, R) {
    return horizonDistance(eyeHeight, R) + horizonDistance(objectHeight, R);
  }

  /**
   * Smernice krivky D(h2) = d1 + R*arccos(R/(R+h2)), tedy o kolik metru se
   * posune vzdalenost zmizeni na kazdy dalsi metr vysky objektu.
   *
   * Slope of the vanish-distance curve: how much further the object can be
   * seen for each extra metre of its height. Derivative of R*arccos(R/(R+h)).
   * V nule je nekonecna (arccos ma v jednicce svislou tecnu) a s rostouci
   * vyskou klesa k nule - proto ma krivka odmocninovy tvar se stropem.
   */
  function vanishSlope(objectHeight, R) {
    const h = objectHeight;
    if (!(h > 0)) return Infinity;
    return (R * R) / ((R + h) * Math.sqrt(h * (2 * R + h)));
  }

  /**
   * Vyska "hrbu" vody uprostred mezi pozorovatelem a objektem (sagitta).
   * Height of the water bulge halfway between observer and object.
   */
  function bulge(distance, R) {
    return R * (1 - Math.cos(distance / (2 * R)));
  }

  /**
   * Plocha vrchliku o uhlovem polomeru `angle` (mereno ze stredu telesa).
   * Area of the spherical cap of angular radius `angle` - the piece of the
   * surface you can actually see. Za pulkou koule uz vrchlik roste jen na
   * druhe strane, proto se uhel orizne na pi.
   */
  function capArea(angle, R) {
    const a = Math.min(Math.max(angle, 0), Math.PI);
    return 2 * Math.PI * R * R * (1 - Math.cos(a));
  }

  /**
   * Podil vrchliku na celem povrchu telesa (0..1). Nezavisi na polomeru -
   * z 1,7 m na Zemi vyjde asi 1 : 7 500 000.
   * The cap's share of the whole surface; independent of the radius.
   */
  function capShare(angle) {
    const a = Math.min(Math.max(angle, 0), Math.PI);
    return (1 - Math.cos(a)) / 2;
  }

  /** Pokles obzoru pod vodorovnou rovinu [rad]. / Dip of the horizon. */
  function dip(height, R) {
    if (!(height > 0)) return 0;
    return Math.acos(R / (R + height));
  }

  /** Vyska primky pohledu nad povrchem ve vzdalenosti x. */
  function sightLineHeight(eyeHeight, x, R) {
    return hiddenHeight(eyeHeight, x, R);
  }

  /**
   * Jak vysoky musi objekt byt, aby ve vzdalenosti `distance` prave vykoukl
   * nad obzor. Je to tataz velicina jako schovana vyska, jen z druhe strany -
   * pojmenovana zvlast, protoze o tom je cely rezim "Meze viditelnosti".
   *
   * How tall an object must be to just peek over the horizon at `distance`.
   * The same quantity as the hidden height, seen from the other side; it grows
   * beyond all bounds as the distance approaches the sight limit.
   */
  function heightToBeSeen(eyeHeight, distance, R) {
    return hiddenHeight(eyeHeight, distance, R);
  }

  /**
   * Polomer kruhove drahy, po ktere teleso obehne za dobu `period`.
   * Treti Kepleruv zakon: GM * T^2 = 4 * pi^2 * r^3.
   *
   * Radius of the circular orbit whose period is `period`. This is what makes
   * a "stationary" orbit body-specific: it sits where one lap takes exactly as
   * long as the body's own day, and both the mass and the day differ.
   *
   * @param {number} gm     gravitacni parametr GM [m^3/s^2]
   * @param {number} period obezna doba [s]
   */
  function orbitRadius(gm, period) {
    if (!(gm > 0) || !(period > 0)) return 0;
    return Math.cbrt((gm * period * period) / (4 * Math.PI * Math.PI));
  }

  /** Obezna doba kruhove drahy o polomeru `radius` [s]. */
  function orbitPeriod(gm, radius) {
    if (!(gm > 0) || !(radius > 0)) return Infinity;
    return 2 * Math.PI * Math.sqrt((radius * radius * radius) / gm);
  }

  /** Gravitacni parametr koule o polomeru R a stredni hustote rho. */
  function gmFromDensity(radius, density) {
    if (!(radius > 0) || !(density > 0)) return 0;
    return GRAVITY * (4 / 3) * Math.PI * radius * radius * radius * density;
  }

  /**
   * Vzdalenost dvou mist na kouli merena po povrchu (ortodroma).
   * Great-circle distance between two points, along the surface.
   *
   * Pocita se pres haversinus, ktery je presny i pro mala odstupy - naivni
   * vzorec s arccos u blizkych bodu ztraci presnost.
   * Uses the haversine form, which stays accurate for short distances where
   * the naive arccos formula loses precision.
   *
   * @param {number} latA zemepisna sirka ve STUPNICH / latitude in DEGREES
   */
  function greatCircle(latA, lonA, latB, lonB, R) {
    const toRad = Math.PI / 180;
    const dLat = (latB - latA) * toRad;
    const dLon = (lonB - lonA) * toRad;
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latA * toRad) * Math.cos(latB * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /** Zdanlivy uhlovy rozmer predmetu vysokeho `size` ve vzdalenosti `distance`. */
  function angularSize(size, distance) {
    if (!(distance > 0) || !(size > 0)) return 0;
    return 2 * Math.atan(size / (2 * distance));
  }

  /**
   * Souradna soustava pro kresleni: tetiva mezi pozorovatelem a objektem lezi
   * vodorovne (oba stoji na y = 0) a povrch se mezi nimi vydouva nahoru.
   *
   * Drawing frame: the chord between observer and object is horizontal (both
   * feet at y = 0) and the surface bulges upwards between them. This is the
   * classic textbook picture of curvature.
   */
  function chordFrame(distance, R) {
    const theta = distance / R;
    const half = theta / 2;

    /**
     * @param {number} u vzdalenost po povrchu od pozorovatele (0..distance)
     * @param {number} h vyska nad povrchem v danem miste
     */
    function point(u, h) {
      const phi = u / R - half;
      const height = h || 0;
      // y = R*(cos phi - cos half) + h*cos phi, numericky stabilne:
      const y =
        -2 * R * Math.sin((phi + half) / 2) * Math.sin((phi - half) / 2) +
        height * Math.cos(phi);
      return { x: (R + height) * Math.sin(phi), y: y };
    }

    return { theta, half, R, distance, point };
  }

  /**
   * Spocita kompletni vysledek pro jedno nastaveni.
   * Solves one complete scenario. Everything the UI needs, in one object.
   */
  function solve(input) {
    const physicalRadius = input.planetRadius > 0 ? input.planetRadius : R_MEAN;
    const R = effectiveRadius(!!input.refraction, physicalRadius);
    const eyeHeight = Math.max(0, Number(input.eyeHeight) || 0);
    const objectHeight = Math.max(0, Number(input.objectHeight) || 0);

    // Dal nez na protilehly bod telesa se jit neda - za nim uz se vzdalenost
    // po povrchu zase zkracuje z druhe strany.
    // Nothing can be further away than the antipode; past it the surface
    // distance starts shrinking again from the other side.
    const antipode = antipodeDistance(physicalRadius);
    const distance = Math.min(Math.max(0, Number(input.distance) || 0), antipode);

    const horizon = horizonDistance(eyeHeight, R);
    const objectHorizon = horizonDistance(objectHeight, R);
    const vanish = horizon + objectHorizon;

    const beyondHorizon = Math.max(0, distance - horizon);
    const hiddenRaw = hiddenHeight(eyeHeight, distance, R);
    const hidden = Math.min(hiddenRaw, objectHeight);
    const visible = Math.max(0, objectHeight - hiddenRaw);
    const visibleFraction = objectHeight > 0 ? visible / objectHeight : 0;

    let status = 'full';
    if (visible <= 0) status = 'hidden';
    else if (hidden > 0) status = 'partial';

    const apparent = angularSize(visible, distance);

    return {
      R: R,
      physicalRadius: physicalRadius,
      antipode: antipode,
      maxSight: maxSightDistance(eyeHeight, R),
      // true = ani nekonecne vysoky objekt by tu nebyl videt
      // true = not even an infinitely tall object would show here
      beyondReach: !isFinite(hiddenRaw),
      ruleConstant: rootRuleConstant(R),
      refraction: !!input.refraction,
      eyeHeight: eyeHeight,
      objectHeight: objectHeight,
      distance: distance,
      horizon: horizon,
      objectHorizon: objectHorizon,
      vanishDistance: vanish,
      beyondHorizon: beyondHorizon,
      hidden: hidden,
      hiddenRaw: hiddenRaw,
      visible: visible,
      visibleFraction: visibleFraction,
      status: status,
      bulge: bulge(distance, R),
      dip: dip(eyeHeight, R),
      apparentAngle: apparent,
      apparentAngleFull: angularSize(objectHeight, distance),
      moonRatio: apparent / MOON_ANGULAR_DIAMETER,
    };
  }

  HL.geometry = {
    R_MEAN,
    K_REFRACTION,
    MOON_ANGULAR_DIAMETER,
    GRAVITY,
    orbitRadius,
    orbitPeriod,
    gmFromDensity,
    effectiveRadius,
    horizonDistance,
    maxHorizonDistance,
    antipodeDistance,
    maxSightDistance,
    rootRuleConstant,
    horizonLineOfSight,
    hiddenHeight,
    heightToBeSeen,
    vanishDistance,
    vanishSlope,
    bulge,
    capArea,
    capShare,
    greatCircle,
    dip,
    sightLineHeight,
    angularSize,
    chordFrame,
    solve,
  };
})((window.HorizonLab = window.HorizonLab || {}));
