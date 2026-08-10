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

  function effectiveRadius(useRefraction) {
    return useRefraction ? R_MEAN * K_REFRACTION : R_MEAN;
  }

  /**
   * Vzdalenost k obzoru merena PO POVRCHU (delka oblouku).
   * Distance to the horizon measured along the surface (arc length).
   * Pro male vysky plati priblizne d ~ sqrt(2*R*h)  ->  3,57 * sqrt(h[m]) km.
   */
  function horizonDistance(height, R) {
    if (!(height > 0)) return 0;
    return R * Math.acos(R / (R + height));
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
    if (angle >= Math.PI / 2) return Infinity;
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
   * Vyska "hrbu" vody uprostred mezi pozorovatelem a objektem (sagitta).
   * Height of the water bulge halfway between observer and object.
   */
  function bulge(distance, R) {
    return R * (1 - Math.cos(distance / (2 * R)));
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
    const R = effectiveRadius(!!input.refraction);
    const eyeHeight = Math.max(0, Number(input.eyeHeight) || 0);
    const objectHeight = Math.max(0, Number(input.objectHeight) || 0);
    const distance = Math.max(0, Number(input.distance) || 0);

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
    effectiveRadius,
    horizonDistance,
    horizonLineOfSight,
    hiddenHeight,
    vanishDistance,
    bulge,
    dip,
    sightLineHeight,
    angularSize,
    chordFrame,
    solve,
  };
})((window.HorizonLab = window.HorizonLab || {}));
