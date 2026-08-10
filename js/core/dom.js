/**
 * dom.js - male pomocniky pro tvorbu HTML a SVG uzlu.
 * Small helpers for building HTML and SVG nodes.
 * Zadna zavislost na zbytku aplikace. / No dependency on the rest of the app.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function applyAttrs(node, attrs) {
    if (!attrs) return;
    for (const key of Object.keys(attrs)) {
      const value = attrs[key];
      if (value === null || value === undefined || value === false) continue;

      if (key === 'class' || key === 'className') {
        node.setAttribute('class', value);
      } else if (key === 'text') {
        node.textContent = String(value);
      } else if (key === 'html') {
        node.innerHTML = value;
      } else if (key === 'dataset') {
        for (const d of Object.keys(value)) node.dataset[d] = value[d];
      } else if (key === 'style' && typeof value === 'object') {
        for (const s of Object.keys(value)) node.style.setProperty(s, value[s]);
      } else if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        node.setAttribute(key, String(value));
      }
    }
  }

  function append(node, children) {
    if (children === null || children === undefined) return;
    const list = Array.isArray(children) ? children : [children];
    for (const child of list) {
      if (child === null || child === undefined || child === false) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }

  /** Vytvori HTML element. / Creates an HTML element. */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    applyAttrs(node, attrs);
    append(node, children);
    return node;
  }

  /** Vytvori SVG element. / Creates an SVG element. */
  function svg(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag);
    applyAttrs(node, attrs);
    append(node, children);
    return node;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  const qs = (selector, root) => (root || document).querySelector(selector);
  const qsa = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  HL.dom = { el, svg, clear, qs, qsa, SVG_NS };
})((window.HorizonLab = window.HorizonLab || {}));
