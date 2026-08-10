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

  /** Vyska vzdy v metrech. */
  function height(metres, lang) {
    if (!isFinite(metres)) return '∞';
    return number(metres, autoDecimals(metres), lang) + ' m';
  }

  function percent(fraction, lang) {
    const value = fraction * 100;
    const d = value > 0 && value < 1 ? 1 : 0;
    return number(value, d, lang) + ' %';
  }

  /** Uhel v obloukovych minutach nebo stupnich. */
  function angle(radians, lang) {
    const degrees = (radians * 180) / Math.PI;
    if (degrees < 1) return number(degrees * 60, 1, lang) + '′';
    return number(degrees, 2, lang) + '°';
  }

  HL.format = { number, distance, km, height, percent, angle, autoDecimals, LOCALES };
})((window.HorizonLab = window.HorizonLab || {}));
