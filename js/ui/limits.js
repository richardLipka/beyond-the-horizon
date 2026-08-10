/**
 * limits.js - rezim "Meze viditelnosti".
 * The "limits of sight" mode.
 *
 * Ukazuje, jak vysoky musi objekt byt, aby ve dane vzdalenosti vykoukl nad
 * obzor. Krivka roste pres vsechny meze: blizi se svisle asymptote ve
 * vzdalenosti (obzor pozorovatele + ctvrtina obvodu). Za touto mezi uz
 * nepomuze zadna vyska a na protilehlem bode telesa neni videt nikdy nic.
 *
 * Shows how tall an object must be to peek over the horizon at a given
 * distance. The curve grows without bound, approaching a vertical asymptote at
 * (observer's horizon + a quarter of the circumference). Past that limit no
 * height helps at all, and the antipode is never visible from anywhere.
 *
 * Obe osy jsou logaritmicke - jinak by se nekolik radu velikosti do jednoho
 * obrazku nevesle. / Both axes are logarithmic; several orders of magnitude
 * would not fit otherwise.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;
  const svg = HL.dom.svg;
  const G = HL.geometry;

  const VIEW = { w: 900, h: 470 };
  const PAD = { left: 96, right: 28, top: 40, bottom: 82 };
  const AREA = {
    x0: PAD.left,
    y0: PAD.top,
    x1: VIEW.w - PAD.right,
    y1: VIEW.h - PAD.bottom,
  };
  AREA.w = AREA.x1 - AREA.x0;
  AREA.h = AREA.y1 - AREA.y0;

  const decadeBelow = (value) => Math.pow(10, Math.floor(Math.log10(value)));
  const decadeAbove = (value) => Math.pow(10, Math.ceil(Math.log10(value)));

  /** Nejnizsi objekt ze seznamu, ktery by v dane vzdalenosti jeste vykoukl. */
  function shortestTallEnough(objects, required) {
    let best = null;
    for (const item of objects) {
      if (item.height >= required && (!best || item.height < best.height)) best = item;
    }
    return best;
  }

  function mount(container, app) {
    /** Logaritmicky graf potrebne vysky podle vzdalenosti. */
    function renderChart(root, state, result, object) {
      const t = HL.i18n.t;
      const lang = HL.i18n.lang();
      const F = HL.format;
      const R = result.R;

      HL.dom.clear(root);
      root.setAttribute('viewBox', `0 0 ${VIEW.w} ${VIEW.h}`);

      const horizon = result.horizon;
      const maxSight = result.maxSight;
      const antipode = result.antipode;
      const objects = state.data.objects;

      // --- rozsah os / axis ranges ---------------------------------------
      const heights = objects.map((o) => o.height).concat([result.objectHeight]);
      const xMin = decadeBelow(Math.max(horizon, antipode / 1e7, 1));
      const xMax = antipode;
      const yMin = decadeBelow(Math.max(Math.min(1, Math.min.apply(null, heights)), 1e-3));
      const yMax = decadeAbove(Math.max(R * 10, Math.max.apply(null, heights) * 5, 100));

      const logX = Math.log10(xMax / xMin);
      const logY = Math.log10(yMax / yMin);
      const X = (metres) => AREA.x0 + (Math.log10(Math.max(metres, xMin) / xMin) / logX) * AREA.w;
      const Y = (metres) => AREA.y1 - (Math.log10(Math.max(metres, yMin) / yMin) / logY) * AREA.h;

      // --- pasma / bands ---------------------------------------------------
      if (horizon > xMin) {
        root.appendChild(
          svg('rect', {
            x: AREA.x0,
            y: AREA.y0,
            width: X(horizon) - AREA.x0,
            height: AREA.h,
            class: 'ch-band-full',
          })
        );
      }
      const neverWidth = AREA.x1 - X(maxSight);
      if (neverWidth > 1) {
        root.appendChild(
          svg('rect', { x: X(maxSight), y: AREA.y0, width: neverWidth, height: AREA.h, class: 'ch-band-hidden' })
        );
        root.appendChild(
          svg('text', {
            x: Math.min(X(maxSight) + neverWidth / 2, AREA.x1 - 6),
            y: AREA.y0 + 22,
            class: 'ch-band-label',
            'text-anchor': neverWidth < 130 ? 'end' : 'middle',
            text: t('limits.never'),
          })
        );
      }

      // --- mrizka / grid ---------------------------------------------------
      for (let v = xMin; v <= xMax * 1.0001; v *= 10) {
        const x = X(v);
        root.appendChild(svg('line', { x1: x, y1: AREA.y0, x2: x, y2: AREA.y1, class: 'ch-grid' }));
        root.appendChild(
          svg('text', { x: x, y: AREA.y1 + 24, class: 'ch-tick', 'text-anchor': 'middle', text: F.distance(v, lang) })
        );
      }
      for (let v = yMin; v <= yMax * 1.0001; v *= 10) {
        const y = Y(v);
        root.appendChild(svg('line', { x1: AREA.x0, y1: y, x2: AREA.x1, y2: y, class: 'ch-grid' }));
        root.appendChild(
          svg('text', { x: AREA.x0 - 10, y: y + 5, class: 'ch-tick', 'text-anchor': 'end', text: F.distance(v, lang) })
        );
      }

      // --- krivka potrebne vysky / the required-height curve ----------------
      const STEPS = 520;
      let path = '';
      for (let i = 0; i <= STEPS; i++) {
        const distance = xMin * Math.pow(xMax / xMin, i / STEPS);
        const required = G.heightToBeSeen(result.eyeHeight, distance, R);
        if (!(required > 0)) continue;
        const y = isFinite(required) ? Y(Math.min(required, yMax)) : AREA.y0;
        const x = X(distance);
        path += (path ? ' L ' : 'M ') + x.toFixed(2) + ' ' + y.toFixed(2);
        if (!isFinite(required) || required >= yMax) break;
      }
      if (path) {
        root.appendChild(svg('path', { d: path, class: 'ch-curve', fill: 'none' }));
      }

      // --- svisla asymptota / the vertical asymptote ------------------------
      const limitX = X(maxSight);
      root.appendChild(
        svg('line', { x1: limitX, y1: AREA.y0 - 10, x2: limitX, y2: AREA.y1, class: 'ch-marker ch-marker-vanish' })
      );
      root.appendChild(
        svg('text', {
          x: limitX,
          y: AREA.y0 - 18,
          class: 'ch-marker-label',
          'text-anchor': limitX > AREA.x1 - 90 ? 'end' : 'middle',
          text: `${t('limits.asymptote')} · ${F.distance(maxSight, lang)}`,
        })
      );

      // --- objekty ze seznamu lezi presne na krivce ------------------------
      const marks = objects
        .map((item) => ({
          item: item,
          distance: G.vanishDistance(result.eyeHeight, item.height, R),
        }))
        .filter((m) => m.distance >= xMin && m.distance <= xMax && m.item.height >= yMin);

      for (const mark of marks) {
        const active = mark.item.id === state.objectId;
        root.appendChild(
          svg('circle', {
            cx: X(mark.distance),
            cy: Y(mark.item.height),
            r: active ? 7 : 4,
            class: active ? 'lm-dot lm-dot-active' : 'lm-dot',
          })
        );
      }

      // popisek jen u nejnizsiho, nejvyssiho a prave vybraneho objektu,
      // aby se stitky nepremalovaly pres sebe
      const labelled = new Set();
      if (marks.length) {
        const byHeight = marks.slice().sort((a, b) => a.item.height - b.item.height);
        labelled.add(byHeight[0]);
        labelled.add(byHeight[byHeight.length - 1]);
      }
      const activeMark = marks.find((m) => m.item.id === state.objectId);
      if (activeMark) labelled.add(activeMark);

      for (const mark of labelled) {
        const x = X(mark.distance);
        const y = Y(mark.item.height);
        const toLeft = x > AREA.x1 - 150;
        root.appendChild(
          svg('text', {
            x: x + (toLeft ? -11 : 11),
            y: y - 8,
            class: 'lm-dot-label',
            'text-anchor': toLeft ? 'end' : 'start',
            text: HL.i18n.pick(mark.item.name, mark.item.id),
          })
        );
      }

      // --- ramecek a popisy os ---------------------------------------------
      root.appendChild(svg('rect', { x: AREA.x0, y: AREA.y0, width: AREA.w, height: AREA.h, class: 'ch-frame' }));
      root.appendChild(
        svg('text', {
          x: AREA.x1,
          y: VIEW.h - 14,
          class: 'ch-axis-title',
          'text-anchor': 'end',
          text: t('limits.chartX'),
        })
      );
      root.appendChild(
        svg('text', {
          x: 20,
          y: AREA.y0 + AREA.h / 2,
          class: 'ch-axis-title',
          'text-anchor': 'middle',
          transform: `rotate(-90 20 ${AREA.y0 + AREA.h / 2})`,
          text: t('limits.chartY'),
        })
      );
    }

    function buildTable(state, result) {
      const t = HL.i18n.t;
      const lang = HL.i18n.lang();
      const F = HL.format;
      const R = result.R;
      const horizon = result.horizon;
      const span = result.maxSight - horizon;

      const candidates = [
        horizon * 2,
        10000,
        100000,
        1000000,
        horizon + span * 0.9,
        horizon + span * 0.99,
        horizon + span * 0.999,
        result.maxSight,
        result.antipode,
      ];

      const rows = Array.from(new Set(candidates.map((d) => Math.round(d))))
        .filter((d) => d > horizon && d <= result.antipode)
        .sort((a, b) => a - b);

      const body = el('tbody');
      for (const distance of rows) {
        const required = G.heightToBeSeen(result.eyeHeight, distance, R);
        // Presne na mezi vychazi kvuli zaokrouhleni jeste konecne (ale nesmyslne
        // velke) cislo - poctivejsi je rovnou rict, ze to nejde.
        // Exactly at the limit rounding still yields a finite (absurd) number;
        // it is more honest to call it impossible straight away.
        const beyond = !isFinite(required) || distance >= result.maxSight - 0.5;
        const enough = beyond ? null : shortestTallEnough(state.data.objects, required);

        const heightCell = el('td', {}, [
          el('span', { text: beyond ? '∞' : F.distance(required, lang) }),
          !beyond && required >= R / 10
            ? el('span', {
                class: 'row-note',
                text: t('limits.radii', { n: F.number(required / R, 1, lang) }),
              })
            : null,
        ]);

        body.appendChild(
          el('tr', { class: beyond ? 'row-vanish' : '' }, [
            el('td', { text: F.distance(distance, lang) }),
            heightCell,
            el('td', {
              text: beyond
                ? t('limits.impossible')
                : enough
                  ? t('limits.enough', { name: HL.i18n.pick(enough.name, enough.id) })
                  : t('limits.noneEnough'),
            }),
          ])
        );
      }

      return el('table', { class: 'data-table' }, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { text: t('limits.colDistance') }),
            el('th', { text: t('limits.colHeight') }),
            el('th', { text: t('limits.colCompare') }),
          ]),
        ]),
        body,
      ]);
    }

    function update(state, result, object) {
      const t = HL.i18n.t;
      const lang = HL.i18n.lang();
      const F = HL.format;
      const planetName = app.planetName(state);

      HL.dom.clear(container);

      container.appendChild(
        el('header', { class: 'panel-head' }, [
          el('h2', { text: t('limits.heading') }),
          el('p', { class: 'panel-sub', text: t('limits.sub') }),
        ])
      );

      container.appendChild(
        el('div', { class: 'big-results' }, [
          el('div', { class: 'big-result big-vanish' }, [
            el('span', { class: 'big-label', text: t('limits.maxSight') }),
            el('strong', { class: 'big-value', text: F.distance(result.maxSight, lang) }),
            el('span', { class: 'big-sub', text: t('limits.maxSightSub') }),
          ]),
          el('div', { class: 'big-result big-start' }, [
            el('span', { class: 'big-label', text: t('limits.quarter') }),
            el('strong', {
              class: 'big-value',
              text: F.distance(G.maxHorizonDistance(result.R), lang),
            }),
            el('span', { class: 'big-sub', text: t('limits.quarterSub', { planet: planetName }) }),
          ]),
          el('div', { class: 'big-result' }, [
            el('span', { class: 'big-label', text: t('limits.antipode') }),
            el('strong', { class: 'big-value', text: F.distance(result.antipode, lang) }),
            el('span', { class: 'big-sub', text: t('limits.antipodeSub') }),
          ]),
        ])
      );

      const chart = svg('svg', { class: 'chart-svg', xmlns: HL.dom.SVG_NS });
      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title', text: t('limits.chartTitle') }),
          chart,
          el('p', { class: 'hint', text: t('limits.curveNote') }),
          el('p', { class: 'hint', text: t('limits.dotsNote') }),
        ])
      );
      renderChart(chart, state, result, object);

      container.appendChild(
        el('section', { class: 'card explain-card' }, [
          el('h3', { class: 'card-title', text: t('limits.explainTitle') }),
          el('p', {
            text: t('limits.explain', {
              quarter: F.distance(G.maxHorizonDistance(result.R), lang),
              horizon: F.distance(result.horizon, lang),
              max: F.distance(result.maxSight, lang),
              planet: planetName,
            }),
          }),
        ])
      );

      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title', text: t('limits.tableTitle') }),
          el('div', { class: 'table-scroll' }, [buildTable(state, result)]),
        ])
      );

      container.appendChild(
        el('div', { class: 'panel-actions' }, [
          el('button', {
            type: 'button',
            class: 'btn btn-primary',
            text: t('limits.showAntipode'),
            onclick: () => {
              app.setDistance(result.antipode);
              app.setMode('see');
            },
          }),
        ])
      );
    }

    return { update };
  }

  HL.LimitsPanel = { mount };
})((window.HorizonLab = window.HorizonLab || {}));
