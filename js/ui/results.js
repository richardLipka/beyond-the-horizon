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
    // Opar, ktery schova i to, co by zakriveni nechalo, ma vlastni verdikt.
    // Haze hiding what the curve would have left gets a verdict of its own.
    const key = r.beyondReach ? 'beyond' : r.lostInHaze ? 'haze' : r.status;
    statusHost.className =
      'verdict verdict-' + (r.beyondReach || r.lostInHaze ? 'hidden' : r.status);
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
      clarity: F.percentAbove(r.clarity, lang),
      range: F.distance(r.hazeRange, lang),
    };
    statusHost.appendChild(el('h3', { class: 'verdict-title', text: t(`status.${key}.title`) }));
    statusHost.appendChild(el('p', { class: 'verdict-text', text: t(`status.${key}.text`, params) }));
    // Prelud se hlasi zvlast: geometrie rika "nic", ohyb svetla rika "neco".
    // A mirage is reported separately: geometry says nothing, bending says something.
    if (r.mirage && !r.lostInHaze) {
      statusHost.appendChild(el('p', { class: 'verdict-text verdict-mirage', text: t('status.mirage') }));
    }

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
        // Nad obzorem ano, ale opar ho schova - dlazdice nesmi tvrdit "vidis".
        // Above the horizon, but the haze hides it: the tile must not say "you see".
        t(r.lostInHaze ? 'res.visibleHazeSub' : 'res.visibleSub', { total: F.height(r.objectHeight, lang) }),
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
    if (r.haze > 0) {
      statsHost.appendChild(
        tile(
          t('res.haze'),
          F.percentAbove(r.clarity, lang),
          t('res.hazeSub', { range: F.distance(r.hazeRange, lang) }),
          'stat-haze'
        )
      );
    }
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
