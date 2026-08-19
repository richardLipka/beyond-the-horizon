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

  /** O kolik podklad odecitaneho popisku presahuje text do stran. */
  const PLATE_PAD = 7;

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
      // Krivka zacina presne na obzoru pozorovatele, ne az u prvniho vzorku za
      // nim. Tesne za obzorem roste potrebna vyska od nuly kvadraticky, takze
      // na logaritmicke ose miri skoro svisle vzhuru; vzorkovani po stejnych
      // dilech logaritmu z toho uselo tolik, ze odectena hodnota lezela az
      // 23 px pod zacatkem nakreslene cary.
      //
      // The curve starts exactly at the observer's horizon rather than at the
      // first sample beyond it. Just past the horizon the required height
      // grows quadratically from zero, which on a log axis is a near-vertical
      // rise; sampling in equal steps of the logarithm cut off enough of it
      // that the read-out sat as much as 23 px below the drawn line's start.
      let path = horizon > xMin ? 'M ' + X(horizon).toFixed(2) + ' ' + AREA.y1.toFixed(2) : '';
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

      // --- odecitani ukazovatkem / the pointer read-out ---------------------
      //
      // Obe osy jsou logaritmicke, takze z tvaru krivky se cisla precist
      // nedaji: u asymptoty odpovida par pixelu nekolika radum. Ukazovatko
      // proto dopocita presnou dvojici k mistu, na ktere se ukazuje, a polozi
      // ji na obe osy.
      //
      // Both axes are logarithmic, so the shape alone does not give the
      // numbers away - near the asymptote a few pixels are several orders of
      // magnitude. The pointer therefore computes the exact pair for the spot
      // being pointed at and lays it on both axes.
      const hover = svg('g', { class: 'lm-hover' });
      root.appendChild(hover);

      /**
       * Hodnota na ose s vlastnim podkladem, aby prekryla rysku pod sebou.
       * Sirka popisku zavisi na jazyku i na poctu cislic, takze se text
       * nejdriv vykresli, pak zmeri a teprve potom zasune do obrazku.
       *
       * An axis value on its own plate so it covers the decade tick beneath.
       * The width depends on the language and on how many digits the value
       * has, so the text is drawn, measured and only then pushed inside.
       */
      function plate(x, y, anchor, value) {
        const label = svg('text', { x: x, y: y, class: 'lm-hover-value', 'text-anchor': anchor, text: value });
        hover.appendChild(label);
        let box = label.getBBox();
        if (!(box.width > 0)) return null;
        // Do okraje se musi vejit i podklad, ktery text presahuje o PLATE_PAD.
        // The margin has to hold the plate too, not just the text it wraps.
        const edge = PLATE_PAD + 4;
        const shift = Math.max(0, edge - box.x) + Math.min(0, VIEW.w - edge - (box.x + box.width));
        if (shift) {
          label.setAttribute('x', x + shift);
          box = label.getBBox();
        }
        const back = svg('rect', {
          x: box.x - PLATE_PAD,
          y: box.y - 3,
          width: box.width + 2 * PLATE_PAD,
          height: box.height + 6,
          rx: 5,
          class: 'lm-hover-plate',
        });
        hover.insertBefore(back, label);
        return { label: label, back: back };
      }

      /**
       * U spodniho okraje si oba popisky lezou do cesty. Uhyba ten na svisle
       * ose, protoze rysky vodorovne osy maji pevny radek. Meri se skutecne
       * obalky, takze to plati v obou jazycich i pro libovolne dlouhe cislo.
       *
       * Near the bottom edge the two labels get in each other's way. The one
       * on the vertical axis gives way, because the horizontal axis's tick row
       * is fixed. Measured from the real boxes, so it holds in both languages
       * and for a value of any length.
       */
      function lift(target, other) {
        if (!target || !other) return;
        const a = target.back.getBBox();
        const b = other.back.getBBox();
        if (a.x + a.width < b.x || b.x + b.width < a.x) return;
        if (a.y + a.height < b.y || b.y + b.height < a.y) return;
        const by = a.y + a.height - b.y + 3;
        target.label.setAttribute('y', Number(target.label.getAttribute('y')) - by);
        target.back.setAttribute('y', a.y - by);
      }

      function readOut(px) {
        HL.dom.clear(hover);

        const distance = Math.min(xMax, Math.max(xMin, xMin * Math.pow(10, ((px - AREA.x0) / AREA.w) * logX)));
        const required = G.heightToBeSeen(result.eyeHeight, distance, R);
        const x = X(distance);
        // Y() si spodni mez orizne sam, horni se orezava tady: za mezi dohledu
        // vyjde nekonecno a bod ma sednout na horni okraj ramecku.
        // Y() clamps at the bottom itself; the top is clamped here, so past
        // the sight limit the infinite value lands on the frame's top edge.
        const y = Math.max(AREA.y0, Y(required));
        // Prazdny krouzek znamena "skutecny bod lezi az za okrajem meritka" -
        // plati pred obzorem (nula), pod spodni dekadou i nad horni.
        // A hollow dot means the true point is off this scale: before the
        // horizon (zero), below the bottom decade, and above the top one.
        const onScale = required >= yMin && required <= yMax;

        hover.appendChild(svg('line', { x1: x, y1: AREA.y0, x2: x, y2: AREA.y1, class: 'lm-hover-line' }));
        if (onScale) {
          hover.appendChild(svg('line', { x1: AREA.x0, y1: y, x2: x, y2: y, class: 'lm-hover-line' }));
        }
        hover.appendChild(
          svg('circle', { cx: x, cy: y, r: 5.5, class: onScale ? 'lm-hover-dot' : 'lm-hover-dot lm-hover-out' })
        );

        const onX = plate(x, AREA.y1 + 24, 'middle', F.distance(distance, lang));
        lift(plate(AREA.x0 - 10, y + 5, 'end', F.distance(required, lang)), onX);
      }

      // Prirazenim, ne addEventListener: pri pripadnem druhem vykresleni tehoz
      // uzlu se posluchac nahradi, misto aby se nabaloval dalsi.
      // Assigned rather than added, so a second render of the same node
      // replaces the handler instead of stacking another one on top of it.
      root.onpointermove = (event) => {
        const rect = root.getBoundingClientRect();
        if (!(rect.width > 0) || !(rect.height > 0)) return;
        const px = ((event.clientX - rect.left) / rect.width) * VIEW.w;
        const py = ((event.clientY - rect.top) / rect.height) * VIEW.h;
        if (px < AREA.x0 || px > AREA.x1 || py < AREA.y0 || py > AREA.y1) HL.dom.clear(hover);
        else readOut(px);
      };
      root.onpointerleave = () => HL.dom.clear(hover);
      root.onpointercancel = () => HL.dom.clear(hover);
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

      const chart = svg('svg', { class: 'chart-svg lm-chart', xmlns: HL.dom.SVG_NS });
      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title card-title-row' }, [
            document.createTextNode(t('limits.chartTitle')),
            HL.Exporter.buttons(() => chart, 'za-obzorem-meze-viditelnosti'),
          ]),
          chart,
          el('p', { class: 'hint', text: t('limits.curveNote') }),
          el('p', { class: 'hint', text: t('limits.dotsNote') }),
          el('p', { class: 'hint', text: t('limits.hoverNote') }),
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
