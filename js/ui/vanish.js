/**
 * vanish.js - rezim "Kdy zmizí?": vzdalenost zmizeni, graf, tabulka, srovnani.
 * The "when does it vanish?" mode: the distance, a chart, a table and a
 * comparison of every object in the data file.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;
  const svg = HL.dom.svg;
  const G = HL.geometry;

  function mount(container, app) {
    let chartSvg = null;

    function bigNumber(label, value, sub, cls) {
      return el('div', { class: 'big-result' + (cls ? ' ' + cls : '') }, [
        el('span', { class: 'big-label', text: label }),
        el('strong', { class: 'big-value', text: value }),
        sub ? el('span', { class: 'big-sub', text: sub }) : null,
      ]);
    }

    function buildTable(result, lang) {
      const t = HL.i18n.t;
      const F = HL.format;
      const marks = [0.2, 0.4, 0.6, 0.8, 0.9, 1, 1.1].map((f) => result.vanishDistance * f);
      marks.push(result.horizon);
      const rows = Array.from(new Set(marks.map((m) => Math.round(m))))
        .filter((m) => m > 0)
        .sort((a, b) => a - b);

      const body = el('tbody');
      for (const distance of rows) {
        const hiddenRaw = G.hiddenHeight(result.eyeHeight, distance, result.R);
        const hidden = Math.min(hiddenRaw, result.objectHeight);
        const visible = Math.max(0, result.objectHeight - hiddenRaw);
        const fraction = result.objectHeight > 0 ? visible / result.objectHeight : 0;
        const isHorizon = Math.abs(distance - result.horizon) < 1;
        const isVanish = Math.abs(distance - result.vanishDistance) < 1;
        body.appendChild(
          el(
            'tr',
            { class: isVanish ? 'row-vanish' : isHorizon ? 'row-horizon' : '' },
            [
              el('td', { text: F.distance(distance, lang) }),
              el('td', { text: F.height(hidden, lang) }),
              el('td', { text: F.height(visible, lang) }),
              el('td', {}, [
                el('span', { class: 'mini-bar' }, [
                  el('span', { class: 'mini-bar-fill', style: { width: (fraction * 100).toFixed(1) + '%' } }),
                ]),
                el('span', { class: 'mini-bar-text', text: F.percent(fraction, lang) }),
              ]),
            ]
          )
        );
      }

      return el('table', { class: 'data-table' }, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { text: t('vanish.colDistance') }),
            el('th', { text: t('vanish.colHidden') }),
            el('th', { text: t('vanish.colVisible') }),
            el('th', { text: t('vanish.colPercent') }),
          ]),
        ]),
        body,
      ]);
    }

    function buildComparison(state, result, lang) {
      const F = HL.format;
      const R = result.R;
      const items = state.data.objects.map((item) => ({
        item: item,
        distance: G.vanishDistance(result.eyeHeight, item.height, R),
      }));
      items.sort((a, b) => a.distance - b.distance);
      const max = items.length ? items[items.length - 1].distance : 1;

      const list = el('div', { class: 'compare-list' });
      for (const entry of items) {
        const active = entry.item.id === state.objectId;
        list.appendChild(
          el(
            'button',
            {
              type: 'button',
              class: 'compare-row' + (active ? ' is-active' : ''),
              onclick: () => app.selectObject(entry.item.id),
            },
            [
              el('span', { class: 'compare-thumb' }, [
                entry.item.image ? el('img', { src: entry.item.image, alt: '' }) : null,
              ]),
              el('span', { class: 'compare-name', text: HL.i18n.pick(entry.item.name, entry.item.id) }),
              el('span', { class: 'compare-track' }, [
                el('span', {
                  class: 'compare-fill',
                  style: { width: Math.max(2, (entry.distance / max) * 100).toFixed(1) + '%' },
                }),
              ]),
              el('span', { class: 'compare-value', text: F.distance(entry.distance, lang) }),
            ]
          )
        );
      }
      return list;
    }

    function update(state, result, object) {
      const t = HL.i18n.t;
      const lang = HL.i18n.lang();
      const F = HL.format;
      const objectName = HL.i18n.pick(object.name, object.id);

      HL.dom.clear(container);

      container.appendChild(
        el('header', { class: 'panel-head' }, [
          el('h2', { text: t('vanish.heading') }),
          el('p', {
            class: 'panel-sub',
            text: `${objectName} · ${F.height(object.height, lang)} · ${t('ctrl.eyeHeight')}: ${F.height(
              result.eyeHeight,
              lang
            )}`,
          }),
        ])
      );

      container.appendChild(
        el('div', { class: 'big-results' }, [
          bigNumber(
            t('vanish.big'),
            F.distance(result.vanishDistance, lang),
            objectName,
            'big-vanish'
          ),
          bigNumber(
            t('vanish.starts'),
            F.distance(result.horizon, lang),
            t('vanish.startsSub'),
            'big-start'
          ),
        ])
      );

      // soucet obou obzoru / the two horizons added up
      container.appendChild(
        el('div', { class: 'sum-strip' }, [
          el('div', { class: 'sum-part' }, [
            el('span', { class: 'sum-label', text: t('vanish.yourHorizon') }),
            el('strong', { text: F.distance(result.horizon, lang) }),
          ]),
          el('span', { class: 'sum-op', text: '+' }),
          el('div', { class: 'sum-part' }, [
            el('span', { class: 'sum-label', text: t('vanish.objectHorizon') }),
            el('strong', { text: F.distance(result.objectHorizon, lang) }),
          ]),
          el('span', { class: 'sum-op', text: '=' }),
          el('div', { class: 'sum-part sum-total' }, [
            el('span', { class: 'sum-label', text: t('vanish.big') }),
            el('strong', { text: F.distance(result.vanishDistance, lang) }),
          ]),
        ])
      );

      // graf / chart
      chartSvg = svg('svg', { class: 'chart-svg', xmlns: HL.dom.SVG_NS });
      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title card-title-row' }, [
            document.createTextNode(t('vanish.chartTitle')),
            HL.Exporter.buttons(() => chartSvg, 'za-obzorem-graf-zmizeni'),
          ]),
          chartSvg,
        ])
      );
      HL.Chart.render(chartSvg, { result: result, object: object });

      // vysvetleni / explanation
      const explain = el('section', { class: 'card explain-card' }, [
        el('h3', { class: 'card-title', text: t('vanish.explainTitle') }),
        el('p', {
          text: t('vanish.explain', {
            // konstanta pravidla palce zavisi na telese, nesmi byt napevno 3,57
            k: F.number(result.ruleConstant, 2, lang),
            a: F.distance(result.horizon, lang),
            b: F.distance(result.objectHorizon, lang),
            c: F.distance(result.vanishDistance, lang),
          }),
        }),
      ]);
      if (result.refraction) {
        explain.appendChild(
          el('p', {
            class: 'hint',
            text: t('vanish.explainRefraction', {
              k0: F.number(G.rootRuleConstant(result.physicalRadius), 2, lang),
              k1: F.number(result.ruleConstant, 2, lang),
            }),
          })
        );
      }
      explain.appendChild(
        el('p', {
          class: 'hint',
          text: t('vanish.explainPlanet', {
            k: F.number(result.ruleConstant, 2, lang),
            planet: app.planetName(state),
          }),
        })
      );
      container.appendChild(explain);

      // tabulka / table
      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title', text: t('vanish.tableTitle') }),
          el('div', { class: 'table-scroll' }, [buildTable(result, lang)]),
        ])
      );

      // srovnani vsech objektu / comparison of every object
      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title', text: t('vanish.compare') }),
          el('p', { class: 'hint', text: t('vanish.compareHint') }),
          buildComparison(state, result, lang),
        ])
      );

      container.appendChild(
        el('div', { class: 'panel-actions' }, [
          el('button', {
            type: 'button',
            class: 'btn btn-primary',
            text: t('vanish.tryIt'),
            onclick: () => {
              app.setDistance(Math.round(result.vanishDistance * 0.8));
              app.setMode('see');
            },
          }),
        ])
      );
    }

    return { update };
  }

  HL.VanishPanel = { mount };
})((window.HorizonLab = window.HorizonLab || {}));
