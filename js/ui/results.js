/**
 * results.js - slovni shrnuti a dlazdice s cisly.
 * The plain-language verdict plus the tiles of numbers.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;

  function tile(label, value, sub, cls) {
    return el('div', { class: 'stat' + (cls ? ' ' + cls : '') }, [
      el('span', { class: 'stat-label', text: label }),
      el('strong', { class: 'stat-value', text: value }),
      sub ? el('span', { class: 'stat-sub', text: sub }) : null,
    ]);
  }

  /**
   * @param {HTMLElement} statusHost misto pro barevny pruh se shrnutim
   * @param {HTMLElement} statsHost  misto pro dlazdice
   * @param {HTMLElement} factHost   misto pro zajimavost o objektu
   */
  function render(statusHost, statsHost, factHost, model) {
    const t = HL.i18n.t;
    const lang = HL.i18n.lang();
    const F = HL.format;
    const r = model.result;
    const objectName = HL.i18n.pick(model.object.name, model.object.id);

    // ---- barevny pruh se slovnim vysvetlenim -----------------------------
    HL.dom.clear(statusHost);
    // Za mezi dohledu uz nejde o "schovany objekt", ale o principialni
    // nemoznost - proto ma vlastni text.
    const key = r.beyondReach ? 'beyond' : r.status;
    statusHost.className = 'verdict verdict-' + (r.beyondReach ? 'hidden' : r.status);
    const params = {
      eye: F.height(r.eyeHeight, lang),
      horizon: F.distance(r.horizon, lang),
      object: objectName,
      distance: F.distance(r.distance, lang),
      beyond: F.distance(r.beyondHorizon, lang),
      hidden: F.height(r.hidden, lang),
      visible: F.height(r.visible, lang),
      percent: F.percent(r.visibleFraction, lang),
      vanish: F.distance(r.vanishDistance, lang),
      maxSight: F.distance(r.maxSight, lang),
      planet: model.planet || '',
    };
    statusHost.appendChild(el('h3', { class: 'verdict-title', text: t(`status.${key}.title`) }));
    statusHost.appendChild(el('p', { class: 'verdict-text', text: t(`status.${key}.text`, params) }));

    // ---- dlazdice s cisly ------------------------------------------------
    HL.dom.clear(statsHost);
    statsHost.appendChild(
      tile(t('res.horizon'), F.distance(r.horizon, lang), t('res.horizonSub'), 'stat-horizon')
    );
    statsHost.appendChild(
      tile(t('res.beyond'), F.distance(r.beyondHorizon, lang), t('res.beyondSub'), 'stat-beyond')
    );
    statsHost.appendChild(
      tile(t('res.hidden'), F.height(r.hidden, lang), t('res.hiddenSub'), 'stat-hidden')
    );
    statsHost.appendChild(
      tile(
        t('res.visible'),
        `${F.height(r.visible, lang)} · ${F.percent(r.visibleFraction, lang)}`,
        t('res.visibleSub', { total: F.height(r.objectHeight, lang) }),
        'stat-visible'
      )
    );
    statsHost.appendChild(tile(t('res.bulge'), F.height(r.bulge, lang), t('res.bulgeSub')));
    statsHost.appendChild(
      tile(t('res.vanish'), F.distance(r.vanishDistance, lang), t('res.vanishSub'), 'stat-vanish')
    );
    statsHost.appendChild(
      tile(
        t('res.apparent'),
        F.angle(r.apparentAngle, lang),
        t('res.apparentSub', { n: F.number(r.moonRatio, r.moonRatio < 10 ? 2 : 0, lang) })
      )
    );
    statsHost.appendChild(tile(t('res.dip'), F.angle(r.dip, lang), t('res.dipSub')));
    statsHost.appendChild(
      tile(
        t('res.planet'),
        model.planet || '',
        t('res.planetSub', { r: F.distance(r.physicalRadius, lang) }),
        'stat-planet'
      )
    );

    // ---- zajimavost o objektu --------------------------------------------
    HL.dom.clear(factHost);
    const fact = model.object.fact ? HL.i18n.pick(model.object.fact, '') : '';
    if (fact) {
      factHost.style.display = '';
      factHost.appendChild(el('span', { class: 'fact-icon', text: '💡' }));
      factHost.appendChild(
        el('p', {}, [el('strong', { text: objectName + ': ' }), document.createTextNode(fact)])
      );
    } else {
      factHost.style.display = 'none';
    }
  }

  HL.Results = { render };
})((window.HorizonLab = window.HorizonLab || {}));
