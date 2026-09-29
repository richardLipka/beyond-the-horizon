/**
 * math.js - sazba vzorcu pres MathML, bez knihoven.
 * Typesetting formulas as native MathML, with no library.
 *
 * Vzorce byly neproporcionalnim pismem jako kod ("cos a = R / (R + h1)"),
 * coz je citelne pro programatora, ne pro zaka. Prohlizece umi MathML samy
 * (Chrome od verze 109, Firefox a Safari davno), takze zlomky se sazi pod
 * sebe, odmocnina dostane caru nad celym vyrazem a promenne kurzivu - bez
 * jakekoli zavislosti a i z file://.
 *
 * Formulas used to be monospace code ("cos a = R / (R + h1)"), readable for a
 * programmer rather than a pupil. Browsers speak MathML natively (Chrome since
 * 109, Firefox and Safari for years), so fractions stack, a root gets a bar
 * over the whole radicand and variables go italic - with no dependency, and
 * from file:// too.
 *
 * Zapis je male podmnozina TeXu / The notation is a small subset of TeX:
 *   \frac{a}{b}   zlomek / fraction
 *   \sqrt{x}      odmocnina / square root
 *   x^2  x_1  x_{12}^{2}   exponent a index / powers and indices
 *   \num{7 432,6} cislo presne tak, jak ho naformatoval jazyk / a number as
 *                 the locale formatted it (spaces and decimal comma kept)
 *   \text{km}     jednotka nebo slovo stojatym pismem / upright text
 *   \,            uzka mezera / thin space
 *   \ask          otaznik misto hodnoty, kterou ma zak dopocitat (rezim
 *                 pro ucitele) / a question mark in place of a value the
 *                 pupil has to work out (teacher mode)
 * Unicode indexy (h + lower 1) a mocniny (upper 2) se prevedou samy; cos, arccos
 * a spol. se poznaji a sazi stojate.
 * Unicode indices and powers are converted; cos, arccos and friends are
 * recognised and set upright.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const NS = 'http://www.w3.org/1998/Math/MathML';
  const FUNCTIONS = ['arccos', 'arcsin', 'arctan', 'cos', 'sin', 'tan', 'ln'];
  const SUBSCRIPTS = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';
  // Nasobici tecka: v sazbe patri "dot operator", ne tecka uprostred radku.
  // Multiplication: the dot operator, not the typographic middle dot.
  const OPERATORS = { '\u00b7': '\u22c5', '-': '\u2212', '*': '\u22c5' };

  function node(tag, attrs, children) {
    const n = document.createElementNS(NS, tag);
    for (const key of Object.keys(attrs || {})) n.setAttribute(key, attrs[key]);
    for (const child of children || []) n.appendChild(child);
    return n;
  }
  const token = (tag, text, attrs) => {
    const n = node(tag, attrs);
    n.textContent = text;
    return n;
  };

  /** Unicode indexy a mocniny na zapis s _ a ^. */
  function normalise(src) {
    return String(src)
      .replace(/[\u2080-\u2089]+/g, (m) => '_{' + [...m].map((c) => SUBSCRIPTS.indexOf(c)).join('') + '}')
      .replace(/\u00b2/g, '^{2}')
      .replace(/\u00b3/g, '^{3}');
  }

  function parse(src) {
    let i = 0;

    function group() {
      // za '{' az po odpovidajici '}' / from '{' to its matching '}'
      if (src[i] !== '{') throw new Error('math: expected { at ' + i + ' in ' + src);
      i++;
      const nodes = sequence('}');
      i++;
      return nodes.length === 1 ? nodes[0] : node('mrow', null, nodes);
    }

    function raw() {
      if (src[i] !== '{') throw new Error('math: expected { at ' + i + ' in ' + src);
      const end = src.indexOf('}', i);
      const text = src.slice(i + 1, end);
      i = end + 1;
      return text;
    }

    /** Jeden prvek: skupina, cislo, pismeno, prikaz nebo operator. */
    function atom() {
      const c = src[i];
      if (c === '{') return group();
      if (c === '\\') {
        const m = /^\\([a-z]+|,)/.exec(src.slice(i));
        const name = m ? m[1] : '';
        i += 1 + name.length;
        if (name === 'frac') {
          const top = group();
          return node('mfrac', null, [top, group()]);
        }
        if (name === 'sqrt') return node('msqrt', null, [group()]);
        if (name === 'num') return token('mn', raw());
        if (name === 'text') return token('mtext', raw());
        if (name === ',') return node('mspace', { width: '0.17em' });
        if (name === 'ask') return token('mi', '?', { mathvariant: 'normal', class: 'math-ask' });
        throw new Error('math: unknown command \\' + name);
      }
      const rest = src.slice(i);
      const fn = FUNCTIONS.find((f) => rest.startsWith(f));
      if (fn) {
        i += fn.length;
        // Stojate jmeno funkce a neviditelne "aplikace funkce" pro spravnou
        // mezeru. / An upright name plus invisible function application.
        // Za jmenem funkce patri uzka mezera jako v ucebnici (cos alfa).
        // A thin space after a function name, as in a textbook.
        return [token('mi', fn, { mathvariant: 'normal' }), token('mo', '\u2061', { rspace: '0.17em' })];
      }
      const number = /^\d+(?:[.,]\d+)?/.exec(rest);
      if (number) {
        i += number[0].length;
        return token('mn', number[0]);
      }
      i++;
      if (/[A-Za-z\u03b1-\u03c9\u0391-\u03a9]/.test(c)) return token('mi', c);
      // Zavorky tu nikdy neobaluji zlomek, tak se nemaji natahovat - jinak
      // prerostou kvuli indexu uvnitr. / Brackets here never wrap a fraction,
      // so they must not stretch, or an index inside makes them overgrown.
      if (c === '(' || c === ')') return token('mo', c, { stretchy: 'false' });
      return token('mo', OPERATORS[c] || c);
    }

    function sequence(stop) {
      const out = [];
      while (i < src.length && src[i] !== stop) {
        const c = src[i];
        if (c === ' ' || c === '\u00a0' || c === '\u202f') {
          i++;
          continue;
        }
        if (c === '^' || c === '_') {
          i++;
          const base = out.pop();
          const script = atom();
          if (c === '^' && base && base.localName === 'msub') {
            out.push(node('msubsup', null, [base.firstChild, base.lastChild, script]));
          } else {
            out.push(node(c === '^' ? 'msup' : 'msub', null, [base, script]));
          }
          continue;
        }
        if (c === '\u00b0' && out.length && out[out.length - 1].localName === 'mn') {
          // Stupen patri k cislu bez mezery. / A degree sign hugs its number.
          out[out.length - 1].textContent += '\u00b0';
          i++;
          continue;
        }
        const made = atom();
        if (Array.isArray(made)) out.push(...made);
        else out.push(made);
      }
      return out;
    }

    return sequence(null);
  }

  /**
   * Vysazi vzorec jako element <math>. Zdrojovy zapis zustava v data-tex,
   * aby se dal vzorec zkontrolovat i strojove.
   * Typesets a formula as a <math> element. The source stays in data-tex so
   * the formula can be checked by a machine too.
   */
  function render(src, display) {
    const text = normalise(src);
    // displaystyle: zlomky v plne velikosti i v radku - v dosazeni jsou
    // cisla, ktera se maji dat precist. / Full-size fractions inline too:
    // the substitutions carry numbers that have to stay readable.
    const attrs = { displaystyle: 'true' };
    if (display) attrs.display = 'block';
    const math = node('math', attrs, [node('mrow', null, parse(text))]);
    math.setAttribute('data-tex', String(src));
    return math;
  }

  /**
   * Hodnota i s jednotkou z HL.format ("5,03 km", "0,0388 deg") do zapisu:
   * cislo zustane presne tak, jak ho naformatoval jazyk.
   * A value with its unit from HL.format into the notation, keeping the
   * number exactly as the locale formatted it.
   */
  function quantity(text) {
    const m = /^(.*?)\s*(km|m|\u00b0)$/.exec(String(text).trim());
    if (!m) return '\\num{' + text + '}';
    if (m[2] === '\u00b0') return '\\num{' + m[1] + '}\u00b0';
    return '\\num{' + m[1] + '}\\,\\text{' + m[2] + '}';
  }

  HL.math = { render, quantity };
})((window.HorizonLab = window.HorizonLab || {}));
