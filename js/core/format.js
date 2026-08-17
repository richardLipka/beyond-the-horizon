/**
 * format.js - prevod cisel na retezce podle jazyka.
 * Number formatting per locale (Czech uses a comma as decimal separator).
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const LOCALES = { cs: 'cs-CZ', en: 'en-GB' };
  const cache = new Map();

  function nf(lang, decimals) {
    const key = lang + '|' + decimals;
    if (!cache.has(key)) {
      cache.set(
        key,
        // Zbytecne nuly na konci se neukazuji: "1 m" misto "1,00 m".
        new Intl.NumberFormat(LOCALES[lang] || LOCALES.en, {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimals,
        })
      );
    }
    return cache.get(key);
  }

  function number(value, decimals, lang) {
    if (!isFinite(value)) return '∞';
    return nf(lang, decimals || 0).format(value);
  }

  /** Automaticky voli pocet desetinnych mist podle velikosti cisla. */
  function autoDecimals(value) {
    const a = Math.abs(value);
    if (a === 0) return 0;
    if (a < 1) return 2;
    if (a < 10) return 2;
    if (a < 100) return 1;
    return 0;
  }

  /** Vzdalenost: pod 1 km v metrech, jinak v kilometrech. */
  function distance(metres, lang) {
    if (!isFinite(metres)) return '∞';
    if (Math.abs(metres) < 1000) {
      return number(metres, metres < 10 ? 1 : 0, lang) + ' m';
    }
    const km = metres / 1000;
    return number(km, autoDecimals(km), lang) + ' km';
  }

  /** Vzdalenost vzdy v kilometrech (pro osy a tabulky). */
  function km(metres, lang, decimals) {
    const value = metres / 1000;
    const d = decimals === undefined ? autoDecimals(value) : decimals;
    return number(value, d, lang) + ' km';
  }

  /**
   * Vyska: do sta kilometru v metrech, vys uz v kilometrech.
   *
   * Sto kilometru je Karmanova hranice, tedy zacatek vesmiru - vsechno pozemske
   * (Everest, letadlo, mrakodrap) zustava v metrech, kdezto pozorovatel na
   * obezne draze by jinak dostal necitelnych "35 793 000 m".
   * A hundred kilometres is the Karman line, the start of space: everything
   * earthbound stays in metres, while an observer in orbit would otherwise be
   * given an unreadable "35 793 000 m".
   */
  const HEIGHT_IN_KM_FROM = 100000;

  function height(metres, lang) {
    if (!isFinite(metres)) return '∞';
    if (Math.abs(metres) >= HEIGHT_IN_KM_FROM) {
      const km = metres / 1000;
      return number(km, autoDecimals(km), lang) + ' km';
    }
    return number(metres, autoDecimals(metres), lang) + ' m';
  }

  function percent(fraction, lang) {
    const value = fraction * 100;
    const d = value > 0 && value < 1 ? 1 : 0;
    return number(value, d, lang) + ' %';
  }

  /** Plocha: pod 1 km2 ve ctverecnich metrech, jinak v kilometrech ctverecnich. */
  function area(squareMetres, lang) {
    if (!isFinite(squareMetres)) return '∞';
    if (squareMetres < 1e6) return number(squareMetres, 0, lang) + ' m²';
    const km2 = squareMetres / 1e6;
    return number(km2, autoDecimals(km2), lang) + ' km²';
  }

  /**
   * Velmi maly zlomek se cte lip jako "1 : 7 500 000" nez jako "0,0000134 %".
   * A very small fraction reads better as a ratio than as a percentage.
   */
  function share(value, lang) {
    if (!(value > 0)) return '0';
    if (value >= 0.01) return percent(value, lang);
    return '1 : ' + number(Math.round(1 / value), 0, lang);
  }

  /** Uhel v obloukovych minutach nebo stupnich. */
  function angle(radians, lang) {
    const degrees = (radians * 180) / Math.PI;
    if (degrees < 1) return number(degrees * 60, 1, lang) + '′';
    return number(degrees, 2, lang) + '°';
  }

  HL.format = { number, distance, km, height, percent, area, share, angle, autoDecimals, LOCALES };
})((window.HorizonLab = window.HorizonLab || {}));
