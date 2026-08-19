/**
 * chart.js - graf "kolik objektu zustane videt" v zavislosti na vzdalenosti.
 * Chart of the still-visible height against distance.
 *
 * Tri barevna pasma: cely videt / cast schovana / neviditelny.
 * Three coloured bands: fully visible / partly hidden / invisible.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const svg = HL.dom.svg;
  const G = HL.geometry;

  const VIEW = { w: 900, h: 400 };
  const PAD = { left: 78, right: 26, top: 30, bottom: 74 };
  const AREA = {
    x0: PAD.left,
    y0: PAD.top,
    x1: VIEW.w - PAD.right,
    y1: VIEW.h - PAD.bottom,
  };
  AREA.w = AREA.x1 - AREA.x0;
  AREA.h = AREA.y1 - AREA.y0;

  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const exponent = Math.floor(Math.log10(raw));
    const base = Math.pow(10, exponent);
    const n = raw / base;
    const multiple = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return multiple * base;
  }

  /**
   * @param {SVGElement} root
   * @param {{result: object, object: object, onPick: function}} model
   */
  function render(root, model) {
    const t = HL.i18n.t;
    const lang = HL.i18n.lang();
    const F = HL.format;
    const r = model.result;

    HL.dom.clear(root);
    root.setAttribute('viewBox', `0 0 ${VIEW.w} ${VIEW.h}`);

    const objectHeight = Math.max(r.objectHeight, 1e-6);
    // Dal nez na protilehly bod telesa se jit neda - u malych vlastnich telies
    // by jinak spodni mez 1000 m utekla az za nej.
    // Never past the antipode: on a small custom body the 1000 m floor would
    // otherwise run the axis right off the far side of the world.
    const maxDistance = Math.min(Math.max(r.vanishDistance * 1.18, 1000), r.antipode);
    const X = (metres) => AREA.x0 + (metres / maxDistance) * AREA.w;
    const Y = (metres) => AREA.y1 - (metres / objectHeight) * AREA.h;

    // ---- barevna pasma / coloured bands -----------------------------------
    const bands = [
      { from: 0, to: Math.min(r.horizon, maxDistance), cls: 'ch-band-full', label: t('vanish.bandFull') },
      {
        from: Math.min(r.horizon, maxDistance),
        to: Math.min(r.vanishDistance, maxDistance),
        cls: 'ch-band-partial',
        label: t('vanish.bandPartial'),
      },
      { from: Math.min(r.vanishDistance, maxDistance), to: maxDistance, cls: 'ch-band-hidden', label: t('vanish.bandHidden') },
    ];
    for (const band of bands) {
      const width = X(band.to) - X(band.from);
      if (width <= 0.5) continue;
      root.appendChild(
        svg('rect', { x: X(band.from), y: AREA.y0, width: width, height: AREA.h, class: band.cls })
      );
      if (width > 70) {
        root.appendChild(
          svg('text', {
            x: X(band.from) + width / 2,
            y: AREA.y0 + 20,
            class: 'ch-band-label',
            'text-anchor': 'middle',
            text: band.label,
          })
        );
      }
    }

    // ---- mrizka a osy / grid and axes -------------------------------------
    const xStep = niceStep(maxDistance / 7);
    const xDecimals = xStep >= 10000 ? 0 : xStep >= 1000 ? 1 : 2;
    for (let d = 0; d <= maxDistance + 1; d += xStep) {
      const x = X(d);
      if (x > AREA.x1 + 1) break;
      root.appendChild(svg('line', { x1: x, y1: AREA.y0, x2: x, y2: AREA.y1, class: 'ch-grid' }));
      root.appendChild(
        svg('text', {
          x: x,
          y: AREA.y1 + 24,
          class: 'ch-tick',
          'text-anchor': 'middle',
          text: F.km(d, lang, xDecimals),
        })
      );
    }

    const yStep = niceStep(objectHeight / 4);
    for (let h = 0; h <= objectHeight + 1e-6; h += yStep) {
      const y = Y(h);
      root.appendChild(svg('line', { x1: AREA.x0, y1: y, x2: AREA.x1, y2: y, class: 'ch-grid' }));
      root.appendChild(
        svg('text', {
          x: AREA.x0 - 10,
          y: y + 5,
          class: 'ch-tick',
          'text-anchor': 'end',
          text: F.height(h, lang),
        })
      );
    }

    // ---- krivka viditelne vysky / visible-height curve --------------------
    // Zajimavy je jen usek mezi obzorem a zmizenim; pri vysokem pozorovateli
    // a nizkem objektu je to jen par procent osy, takze se tam vzorkuje husteji.
    // Only the stretch between the horizon and the vanishing point matters;
    // with a tall observer and a short object that is a couple of per cent of
    // the axis, so it gets sampled densely.
    const STEPS = 260;
    const KNEE_STEPS = 160;
    const samples = [];
    for (let i = 0; i <= STEPS; i++) samples.push((maxDistance * i) / STEPS);
    const kneeFrom = Math.min(r.horizon, maxDistance);
    const kneeTo = Math.min(r.vanishDistance, maxDistance);
    if (kneeTo > kneeFrom) {
      for (let i = 0; i <= KNEE_STEPS; i++) {
        samples.push(kneeFrom + ((kneeTo - kneeFrom) * i) / KNEE_STEPS);
      }
      samples.sort((a, b) => a - b);
    }

    const points = [];
    for (const distance of samples) {
      const hidden = G.hiddenHeight(r.eyeHeight, distance, r.R);
      const visible = Math.max(0, objectHeight - (isFinite(hidden) ? hidden : Infinity));
      points.push({ x: X(distance), y: Y(visible) });
    }
    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    root.appendChild(
      svg('path', { d: `${path} L ${AREA.x1} ${AREA.y1} L ${AREA.x0} ${AREA.y1} Z`, class: 'ch-area' })
    );
    root.appendChild(svg('path', { d: path, class: 'ch-curve', fill: 'none' }));

    // ---- svisle znacky / vertical markers ---------------------------------
    function marker(distance, cls, label, above) {
      if (distance > maxDistance) return;
      const x = X(distance);
      root.appendChild(svg('line', { x1: x, y1: AREA.y0, x2: x, y2: AREA.y1, class: cls }));
      root.appendChild(
        svg('text', {
          x: x,
          y: above ? AREA.y0 - 10 : AREA.y1 + 46,
          class: 'ch-marker-label',
          'text-anchor': x > AREA.x1 - 90 ? 'end' : 'middle',
          text: label,
        })
      );
    }
    marker(r.horizon, 'ch-marker ch-marker-start', `${t('vanish.starts')} ${F.distance(r.horizon, lang)}`, true);
    marker(
      r.vanishDistance,
      'ch-marker ch-marker-vanish',
      `${t('vanish.big')} ${F.distance(r.vanishDistance, lang)}`,
      false
    );

    // aktualni vzdalenost / the distance currently set in the other mode
    if (r.distance > 0 && r.distance <= maxDistance) {
      const x = X(r.distance);
      root.appendChild(svg('line', { x1: x, y1: AREA.y0, x2: x, y2: AREA.y1, class: 'ch-now' }));
      root.appendChild(
        svg('circle', { cx: x, cy: Y(r.visible), r: 6, class: 'ch-now-dot' })
      );
    }

    // ---- ramecek a popisy os / frame and axis titles ----------------------
    root.appendChild(
      svg('rect', { x: AREA.x0, y: AREA.y0, width: AREA.w, height: AREA.h, class: 'ch-frame' })
    );
    root.appendChild(
      svg('text', {
        x: AREA.x1,
        y: VIEW.h - 12,
        class: 'ch-axis-title',
        'text-anchor': 'end',
        text: t('vanish.chartX'),
      })
    );
    root.appendChild(
      svg('text', {
        x: 18,
        y: AREA.y0 + AREA.h / 2,
        class: 'ch-axis-title',
        'text-anchor': 'middle',
        transform: `rotate(-90 18 ${AREA.y0 + AREA.h / 2})`,
        text: t('vanish.chartY'),
      })
    );

    // ---- odecitani ukazovatkem / the pointer read-out ----------------------
    // Zajimavy usek lezi mezi obzorem a zmizenim a pri vysokem pozorovateli je
    // to jen par procent sirky grafu - odtud se vzdalenost okem neodhadne.
    // The interesting stretch lies between the horizon and the vanishing
    // point, and with a tall observer that is a couple of per cent of the
    // chart's width: no eye reads a distance off that.
    HL.ReadOut.attach(root, {
      view: VIEW,
      area: AREA,
      sample: (px) => {
        const distance = Math.min(maxDistance, Math.max(0, ((px - AREA.x0) / AREA.w) * maxDistance));
        const hidden = G.hiddenHeight(r.eyeHeight, distance, r.R);
        const visible = Math.max(0, objectHeight - (isFinite(hidden) ? hidden : Infinity));
        return {
          x: X(distance),
          y: Y(visible),
          // Viditelna vyska nikdy nevypadne z rozsahu: lezi vzdy mezi nulou
          // a vyskou objektu, tedy presne mezi spodni a horni hranou ramecku.
          // The visible height never leaves the range: it always lies between
          // zero and the object's height, which is exactly the frame.
          onScale: true,
          xLabel: F.distance(distance, lang),
          yLabel: F.height(visible, lang),
        };
      },
    });
  }

  HL.Chart = { render, VIEW };
})((window.HorizonLab = window.HorizonLab || {}));
