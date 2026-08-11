/**
 * derivation.js - odvozeni obou funkci a jejich grafy v linearnich osach.
 * Analytic derivation of the two functions, plotted on plain linear axes.
 *
 * Cely zbytek aplikace stoji na dvou funkcich a obe vypadnou z jedineho
 * pravouhleho trojuhelniku nad tecnou:
 *
 *   D(h2)  = d1 + R * arccos( R / (R + h2) )        "Kdy zmizi?"
 *   h2(D)  = R * ( 1 / cos( (D - d1) / R ) - 1 )    "Meze viditelnosti"
 *
 * Jsou navzajem inverzni - jsou to tytez body, jen s prohozenymi osami.
 * Proto ma prvni vodorovny strop presne tam, kde ma druha svislou asymptotu:
 * v mezi dohledu D_max = d1 + pi*R/2.
 *
 * They are inverses of one another - the same points with the axes swapped -
 * which is why the first has its horizontal ceiling exactly where the second
 * has its vertical asymptote, at the sight limit d1 + pi*R/2.
 *
 * Osy jsou zamerne LINEARNI. Rezim "Meze viditelnosti" kresli tutez druhou
 * funkci logaritmicky, protoze jinak se nekolik radu velikosti do obrazku
 * nevejde; tady je videt, jak funkce doopravdy vypada.
 * The axes are deliberately linear. The "limits of sight" mode draws the same
 * second function on log-log axes because several orders of magnitude do not
 * fit otherwise; here you see the honest shape.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;
  const svg = HL.dom.svg;
  const G = HL.geometry;

  const VIEW = { w: 900, h: 390 };
  const PAD = { left: 96, right: 34, top: 30, bottom: 68 };
  const AREA = {
    x0: PAD.left,
    y0: PAD.top,
    x1: VIEW.w - PAD.right,
    y1: VIEW.h - PAD.bottom,
  };
  AREA.w = AREA.x1 - AREA.x0;
  AREA.h = AREA.y1 - AREA.y0;

  /** Hezky krok mrizky (1, 2, 5, 10, 20, 50, ...). */
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const base = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / base;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * base;
  }

  /** Zaokrouhli horni mez osy nahoru na nasobek kroku mrizky. */
  function niceCeil(value) {
    const step = niceStep(value / 5);
    return Math.ceil(value / step) * step;
  }

  /**
   * Spolecna kostra obou grafu: ramecek, mrizka, popisy os.
   * Vraci prevodni funkce X, Y do pixelu.
   */
  function frame(root, spec) {
    HL.dom.clear(root);
    root.setAttribute('viewBox', `0 0 ${VIEW.w} ${VIEW.h}`);
    root.setAttribute('role', 'img');

    const X = (v) => AREA.x0 + (v / spec.xMax) * AREA.w;
    const Y = (v) => AREA.y1 - (v / spec.yMax) * AREA.h;

    const xStep = spec.xStep || niceStep(spec.xMax / 6);
    for (let v = 0; v <= spec.xMax * 1.0001; v += xStep) {
      const x = X(v);
      root.appendChild(svg('line', { x1: x, y1: AREA.y0, x2: x, y2: AREA.y1, class: 'ch-grid' }));
      root.appendChild(
        svg('text', { x: x, y: AREA.y1 + 24, class: 'ch-tick', 'text-anchor': 'middle', text: spec.xTick(v) })
      );
    }

    const yStep = spec.yStep || niceStep(spec.yMax / 4);
    for (let v = 0; v <= spec.yMax * 1.0001; v += yStep) {
      const y = Y(v);
      root.appendChild(svg('line', { x1: AREA.x0, y1: y, x2: AREA.x1, y2: y, class: 'ch-grid' }));
      root.appendChild(
        svg('text', { x: AREA.x0 - 10, y: y + 5, class: 'ch-tick', 'text-anchor': 'end', text: spec.yTick(v) })
      );
    }

    return { X, Y };
  }

  /** Ramecek a popisy os se kresli az nakonec, aby lezely nad krivkou. */
  function finish(root, spec) {
    root.appendChild(svg('rect', { x: AREA.x0, y: AREA.y0, width: AREA.w, height: AREA.h, class: 'ch-frame' }));
    root.appendChild(
      svg('text', { x: AREA.x1, y: VIEW.h - 12, class: 'ch-axis-title', 'text-anchor': 'end', text: spec.xTitle })
    );
    root.appendChild(
      svg('text', {
        x: 20,
        y: AREA.y0 + AREA.h / 2,
        class: 'ch-axis-title',
        'text-anchor': 'middle',
        transform: `rotate(-90 20 ${AREA.y0 + AREA.h / 2})`,
        text: spec.yTitle,
      })
    );
  }

  /** Spoji body do cesty; hodnoty mimo ramecek se orezou nahore. */
  function polyline(points) {
    let d = '';
    for (const p of points) d += (d ? ' L ' : 'M ') + p.x.toFixed(2) + ' ' + p.y.toFixed(2);
    return d;
  }

  /* ---------------------------------------------------------------------- *
   * Graf 1: vzdalenost zmizeni podle vysky objektu  D(h2)
   * ---------------------------------------------------------------------- */
  function chartVanish(root, model) {
    const t = HL.i18n.t;
    const lang = HL.i18n.lang();
    const F = HL.format;
    const r = model.result;
    const R = r.R;

    // Vyrez se ridi prave vybranym objektem, aby byl videt tvar krivky tam,
    // kde se skutecne pouziva. Strop D_max lezi radove vys - je v popisce.
    const xMax = niceCeil(Math.max(r.objectHeight * 2.5, 10));
    const yMax = niceCeil(G.vanishDistance(r.eyeHeight, xMax, R) * 1.04);

    const spec = {
      xMax: xMax,
      yMax: yMax,
      xTick: (v) => F.height(v, lang),
      yTick: (v) => F.km(v, lang),
      xTitle: t('geo.chartAX'),
      yTitle: t('geo.chartAY'),
    };
    const { X, Y } = frame(root, spec);

    // pas, kterym prispiva sam pozorovatel - je porad stejne siroky
    root.appendChild(
      svg('rect', { x: AREA.x0, y: Y(r.horizon), width: AREA.w, height: AREA.y1 - Y(r.horizon), class: 'ch-band-full' })
    );
    root.appendChild(
      svg('text', {
        x: AREA.x0 + 12,
        y: Math.min(Y(r.horizon) - 8, AREA.y1 - 8),
        class: 'ch-band-label ch-halo',
        'text-anchor': 'start',
        text: `d₁ = ${F.distance(r.horizon, lang)}`,
      })
    );

    const STEPS = 360;
    const points = [];
    for (let i = 0; i <= STEPS; i++) {
      // Odmocninovy tvar je nejstrmejsi u nuly, tak se tam vzorkuje husteji.
      const h = xMax * Math.pow(i / STEPS, 2);
      points.push({ x: X(h), y: Y(Math.min(G.vanishDistance(r.eyeHeight, h, R), yMax)) });
    }
    root.appendChild(svg('path', { d: polyline(points), class: 'ch-curve', fill: 'none' }));

    // prave vybrany objekt / the object currently selected
    if (r.objectHeight > 0 && r.objectHeight <= xMax) {
      const x = X(r.objectHeight);
      const y = Y(Math.min(r.vanishDistance, yMax));
      root.appendChild(svg('line', { x1: x, y1: y, x2: x, y2: AREA.y1, class: 'ch-now' }));
      root.appendChild(svg('line', { x1: AREA.x0, y1: y, x2: x, y2: y, class: 'ch-now' }));
      root.appendChild(svg('circle', { cx: x, cy: y, r: 6, class: 'ch-now-dot' }));
      const toLeft = x > AREA.x0 + AREA.w * 0.68;
      root.appendChild(
        svg('text', {
          x: x + (toLeft ? -14 : 14),
          y: y - 14,
          class: 'ch-marker-label ch-halo',
          'text-anchor': toLeft ? 'end' : 'start',
          text: `${model.objectName} · ${F.distance(r.vanishDistance, lang)}`,
        })
      );
    }

    finish(root, spec);
  }

  /* ---------------------------------------------------------------------- *
   * Graf 2: potrebna vyska podle vzdalenosti  h2(D)
   * ---------------------------------------------------------------------- */
  function chartRequired(root, model) {
    const t = HL.i18n.t;
    const lang = HL.i18n.lang();
    const F = HL.format;
    const r = model.result;
    const R = r.R;

    // Tady naopak cely rozsah az k mezi dohledu, aby byla videt asymptota.
    const xMax = r.maxSight * 1.03;
    const yMax = 3 * R;

    // Svisla osa se deli presne po polomerech, jinak by dva ruzne dilky
    // vysly po zaokrouhleni na tentyz popisek ("2R" dvakrat pod sebou).
    // The vertical axis steps in whole radii; a "nice" step of its own would
    // round two different gridlines to the same label.
    const spec = {
      xMax: xMax,
      yMax: yMax,
      yStep: R,
      xTick: (v) => F.km(v, lang, 0),
      yTick: (v) => {
        const n = Math.round(v / R);
        return n === 0 ? '0' : n === 1 ? 'R' : `${n}R`;
      },
      xTitle: t('geo.chartBX'),
      yTitle: t('geo.chartBY', { r: F.distance(R, lang) }),
    };
    const { X, Y } = frame(root, spec);

    // Krivka se vzorkuje rovnomerne v UHLU beta, ne ve vzdalenosti: blizko
    // asymptoty se vzdalenost skoro nemeni, zato vyska leti vzhuru.
    // Sampled uniformly in the ANGLE beta rather than in distance: near the
    // asymptote the distance barely moves while the height races upwards.
    const STEPS = 900;
    const points = [{ x: X(0), y: Y(0) }, { x: X(r.horizon), y: Y(0) }];
    for (let i = 1; i <= STEPS; i++) {
      const beta = (Math.PI / 2) * (i / STEPS);
      const required = R * (1 / Math.cos(beta) - 1);
      const x = X(r.horizon + R * beta);
      if (required > yMax) {
        points.push({ x: x, y: AREA.y0 });
        break;
      }
      points.push({ x: x, y: Y(required) });
    }
    root.appendChild(svg('path', { d: polyline(points), class: 'ch-curve', fill: 'none' }));

    // svisla asymptota v mezi dohledu / the vertical asymptote
    const limitX = X(r.maxSight);
    root.appendChild(
      svg('line', { x1: limitX, y1: AREA.y0 - 12, x2: limitX, y2: AREA.y1, class: 'ch-marker ch-marker-vanish' })
    );
    root.appendChild(
      svg('text', {
        x: limitX,
        y: AREA.y0 - 18,
        class: 'ch-marker-label ch-halo',
        'text-anchor': 'end',
        text: `${t('geo.markAsymptote')} · ${F.distance(r.maxSight, lang)}`,
      })
    );

    // obzor pozorovatele - odtud teprve krivka odlepi od nuly
    const horizonX = X(r.horizon);
    root.appendChild(
      svg('line', { x1: horizonX, y1: AREA.y0, x2: horizonX, y2: AREA.y1, class: 'ch-marker ch-marker-start' })
    );

    // kam padne prave vybrany objekt / where the selected object lands
    if (r.vanishDistance <= xMax) {
      const x = X(r.vanishDistance);
      const y = Y(Math.min(r.objectHeight, yMax));
      root.appendChild(svg('circle', { cx: x, cy: y, r: 6, class: 'ch-now-dot' }));
      root.appendChild(
        svg('text', {
          x: x + 14,
          y: y - 14,
          class: 'ch-marker-label ch-halo',
          'text-anchor': 'start',
          text: `${model.objectName} · ${F.distance(r.vanishDistance, lang)}`,
        })
      );
    }

    finish(root, spec);
  }

  /* ---------------------------------------------------------------------- */

  /**
   * Radek se vzorcem. Kdyz nema ani dosazeni, ani vysledek, dostane celou
   * sirku - jinak by ho tri sloupce mrizky stlacily a vzorec by se zalomil
   * uprostred vyrazu ("/ R" na samostatnem radku).
   * A formula row. With no substitution and no result it takes the full width;
   * otherwise the three-column grid squeezes it and the expression breaks
   * in the middle.
   */
  function formulaRow(symbolic, substituted, result, cls) {
    const solo = !substituted && !result;
    return el('div', { class: 'formula-row' + (solo ? ' formula-solo' : '') + (cls ? ' ' + cls : '') }, [
      el('code', { class: 'formula-symbolic', text: symbolic }),
      substituted ? el('code', { class: 'formula-sub', text: substituted }) : null,
      result ? el('strong', { class: 'formula-result', text: result }) : null,
    ]);
  }

  function chartCard(title, note, draw, model, fileName) {
    const node = svg('svg', { class: 'chart-svg', xmlns: HL.dom.SVG_NS });
    const card = el('section', { class: 'card' }, [
      el('h3', { class: 'card-title card-title-row' }, [
        document.createTextNode(title),
        HL.Exporter.buttons(() => node, fileName),
      ]),
      node,
      el('p', { class: 'hint', text: note }),
    ]);
    draw(node, model);
    return card;
  }

  /**
   * @param {HTMLElement} container kam se sekce prida
   * @param {{result: object, objectName: string}} model
   */
  function render(container, model) {
    const t = HL.i18n.t;
    const lang = HL.i18n.lang();
    const F = HL.format;
    const r = model.result;
    const R = r.R;
    const num = (value, decimals) => F.number(value, decimals, lang);

    const maxSight = F.distance(r.maxSight, lang);

    // --- 1. vzdalenost zmizeni jako funkce vysky --------------------------
    const one = el('div', { class: 'formula-list' });
    one.appendChild(el('div', { class: 'formula-note', text: t('geo.deriveOneText') }));
    one.appendChild(formulaRow('β = arccos( R / (R + h₂) )', null, null, 'row-object'));
    one.appendChild(
      formulaRow(
        'D(h₂) = d₁ + R · β',
        `= ${F.distance(r.horizon, lang)} + R · arccos( R / (R + h₂) )`,
        null,
        'row-total'
      )
    );
    one.appendChild(
      formulaRow(
        'D′(h₂) = R² / ( (R + h₂) · √( h₂ (2R + h₂) ) )',
        t('geo.deriveSlope'),
        `${num(G.vanishSlope(r.objectHeight, R), 0)} m / m`,
        'row-approx'
      )
    );

    // --- 2. potrebna vyska jako funkce vzdalenosti ------------------------
    const two = el('div', { class: 'formula-list' });
    two.appendChild(el('div', { class: 'formula-note', text: t('geo.deriveTwoText') }));
    two.appendChild(formulaRow('D = d₁ + R · β   ⇒   β = (D − d₁) / R', null, null, 'row-object'));
    two.appendChild(formulaRow('cos β = R / (R + h₂)   ⇒   R + h₂ = R / cos β', null, null, 'row-object'));
    two.appendChild(
      formulaRow('h₂(D) = R · ( 1 / cos((D − d₁) / R) − 1 )', null, null, 'row-total')
    );
    two.appendChild(
      formulaRow(
        'β ≪ 1  ⇒  1/cos β − 1 ≈ β²/2  ⇒  h₂ ≈ (D − d₁)² / (2R)',
        null,
        null,
        'row-approx'
      )
    );

    container.appendChild(
      el('section', { class: 'card explain-card' }, [
        el('h3', { class: 'card-title', text: t('geo.deriveTitle') }),
        el('p', { text: t('geo.deriveIntro') }),
        el('h4', { class: 'sub-title', text: t('geo.deriveOneTitle') }),
        one,
        el('p', { class: 'hint', text: t('geo.deriveOneShape', { max: maxSight }) }),
        el('h4', { class: 'sub-title', text: t('geo.deriveTwoTitle') }),
        two,
        el('p', { class: 'hint', text: t('geo.deriveTwoShape', { max: maxSight }) }),
        el('p', { class: 'derive-inverse', text: t('geo.deriveInverse', { max: maxSight }) }),
      ])
    );

    container.appendChild(
      chartCard(t('geo.chartATitle'), t('geo.chartANote', { max: maxSight }), chartVanish, model,
        'za-obzorem-graf-vzdalenost-zmizeni')
    );
    container.appendChild(
      chartCard(t('geo.chartBTitle'), t('geo.chartBNote', { max: maxSight }), chartRequired, model,
        'za-obzorem-graf-potrebna-vyska')
    );
  }

  HL.Derivation = { render, VIEW };
})((window.HorizonLab = window.HorizonLab || {}));
