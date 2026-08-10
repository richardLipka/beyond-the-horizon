/**
 * i18n.js - prepinani jazyka a doplnovani textu do DOM.
 * Language switching and DOM text substitution.
 *
 * V HTML staci na prvek napsat data-i18n="klic" (text),
 * pripadne data-i18n-attr="placeholder:klic;title:klic".
 * In HTML just mark an element with data-i18n="key" (text content) or
 * data-i18n-attr="placeholder:key;title:key" for attributes.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const FALLBACK = 'en';
  const STORAGE_KEY = 'horizonlab.lang';
  const listeners = new Set();
  let current = 'cs';

  function available() {
    return Object.keys(HL.strings);
  }

  function detect() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && HL.strings[saved]) return saved;
    } catch (e) {
      /* prohlizec muze mit zakazane uloziste / storage may be blocked */
    }
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('cs') || nav.startsWith('sk')) return 'cs';
    return HL.strings[nav.slice(0, 2)] ? nav.slice(0, 2) : 'cs';
  }

  /** Prelozi klic a doplni zastupne znacky. */
  function t(key, params) {
    const table = HL.strings[current] || HL.strings[FALLBACK];
    let text = table[key];
    if (text === undefined) text = (HL.strings[FALLBACK] || {})[key];
    if (text === undefined) return key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    );
  }

  /** Vytahne spravnou jazykovou variantu z objektu {cs: ..., en: ...}. */
  function pick(localised, fallbackText) {
    if (!localised) return fallbackText || '';
    if (typeof localised === 'string') return localised;
    return localised[current] || localised[FALLBACK] || localised.cs || fallbackText || '';
  }

  function lang() {
    return current;
  }

  function setLang(next) {
    if (!HL.strings[next] || next === current) return;
    current = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignorovat / ignore */
    }
    document.documentElement.setAttribute('lang', next);
    apply();
    for (const listener of Array.from(listeners)) listener(next);
  }

  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /** Projde DOM a doplni vsechny prelozitelne texty. */
  function apply(root) {
    const scope = root || document;
    for (const node of scope.querySelectorAll('[data-i18n]')) {
      node.textContent = t(node.getAttribute('data-i18n'));
    }
    for (const node of scope.querySelectorAll('[data-i18n-attr]')) {
      const pairs = node.getAttribute('data-i18n-attr').split(';');
      for (const pair of pairs) {
        const [attr, key] = pair.split(':').map((s) => s && s.trim());
        if (attr && key) node.setAttribute(attr, t(key));
      }
    }
  }

  function init() {
    current = detect();
    document.documentElement.setAttribute('lang', current);
    apply();
  }

  HL.i18n = { t, pick, lang, setLang, onChange, apply, init, available };
})((window.HorizonLab = window.HorizonLab || {}));
