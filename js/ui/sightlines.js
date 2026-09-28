/**
 * sightlines.js (ui) - "Uvidim to doopravdy?" - skutecne rozhledy po Evrope.
 * The real-world "can I see X from Y?" table.
 *
 * Sekce je zamerne samostatna a stoji az uplne dole: nic si sama od sebe
 * nenastavuje, jen pocita a ukazuje. Do simulace se dvojice prenese teprve
 * kliknutim.
 * The section is deliberately self-contained and sits right at the bottom: it
 * changes nothing on its own, it only computes and shows. A pair is loaded
 * into the simulation only when the user clicks.
 *
 * Verdikt se pocita s prave nastavenou refrakci, takze se da prepinacem
 * v panelu ukazat, ze nekolik rozhledu na refrakci opravdu stoji.
 * The verdict uses whatever refraction setting is active, so the switch in the
 * panel visibly flips the borderline cases.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;
  const G = HL.geometry;

  /**
   * Spocita jednu dvojici.
   *
   * Pozor na dva RUZNE polomery. Vzdalenost Plzne od Dachsteinu je dana
   * mapou a s ohybem svetla se nemeni, takze se pocita se SKUTECNYM polomerem
   * Zeme. Efektivni polomer (R * 7/6) patri jen do vypoctu dohledu - popisuje
   * paprsek, ne zemepis. Kdyz se splete, refrakce zacne rozhledy kazit misto
   * aby pomahala.
   *
   * Two DIFFERENT radii, deliberately. The distance from Pilsen to the
   * Dachstein comes from the map and does not change when light bends, so it
   * uses the real radius of the Earth. The effective radius (R * 7/6) belongs
   * only to the sight calculation - it describes the ray, not the geography.
   * Mixing them up makes refraction ruin sightlines instead of helping them.
   */
  function solvePair(pair, R, haze) {
    const from = HL.SIGHTLINE_PLACES[pair.from];
    const to = HL.SIGHTLINE_PLACES[pair.to];
    const eyeHeight = from.elevation + (from.lift || 0) + HL.SIGHTLINE_EYE;
    const distance = G.greatCircle(from.lat, from.lon, to.lat, to.lon, G.R_MEAN);
    const vanish = G.vanishDistance(eyeHeight, to.elevation, R);
    const visible = distance <= vanish;
    // Bez ohybu svetla by mez lezela tady - cokoli mezi ni a `vanish` je
    // videt jen jako prelud. / Without bending the limit would sit here;
    // anything between it and `vanish` shows only as a mirage.
    const vanishPlain = G.vanishDistance(eyeHeight, to.elevation, G.R_MEAN);
    // stejny podil cesty v oparu jako v simulaci / the same hazy share as the simulation
    const hazeShare = Math.min(1, G.HAZE_LAYER / Math.max(eyeHeight, G.HAZE_LAYER));
    const clarity = G.hazeTransmission(haze, distance * hazeShare);
    return {
      pair: pair,
      from: from,
      to: to,
      eyeHeight: eyeHeight,
      objectHeight: to.elevation,
      distance: distance,
      vanish: vanish,
      visible: visible,
      mirage: visible && distance > vanishPlain,
      lostInHaze: visible && clarity < G.CONTRAST_THRESHOLD,
      // O kolik je rozhled uvnitr meze (kladne) nebo za ni (zaporne).
      margin: vanish - distance,
    };
  }

  function mount(container, app) {
    function row(model, lang) {
      const t = HL.i18n.t;
      const F = HL.format;
      const name = (place) => HL.i18n.pick(place.name, '');

      // Tri verdikty: zakriveni to nepusti, opar to schova, nebo je to videt.
      // Three verdicts: the curve blocks it, the haze hides it, or it shows.
      const verdict = !model.visible ? 'no' : model.lostInHaze ? 'haze' : 'yes';
      const badge = el('span', {
        class: 'sl-badge sl-badge-' + verdict,
        text: t('sight.verdict.' + verdict),
      });

      // Tesne pripady stoji za zvlastni zminku - jsou nejzajimavejsi.
      const closeness = Math.abs(model.margin) / model.vanish;
      let marginText = t(model.visible ? 'sight.marginInside' : 'sight.marginOutside', {
        n: F.distance(Math.abs(model.margin), lang),
      });
      if (model.mirage) marginText += ' · ' + t('sight.mirage');
      if (model.lostInHaze) marginText += ' · ' + t('sight.hazeHides');

      return el('li', { class: 'sl-row' + (closeness < 0.05 ? ' is-close' : '') }, [
        el('div', { class: 'sl-where' }, [
          el('strong', { class: 'sl-from', text: name(model.from) }),
          el('span', { class: 'sl-arrow', text: '→' }),
          el('strong', { class: 'sl-to', text: name(model.to) }),
          el('span', {
            class: 'sl-heights',
            text: t('sight.heights', {
              a: F.height(model.eyeHeight, lang),
              b: F.height(model.objectHeight, lang),
            }),
          }),
        ]),
        el('div', { class: 'sl-numbers' }, [
          el('span', { class: 'sl-distance', text: F.distance(model.distance, lang) }),
          el('span', { class: 'sl-margin', text: marginText }),
        ]),
        badge,
        el('button', {
          type: 'button',
          class: 'btn btn-ghost sl-try',
          text: t('sight.try'),
          onclick: () =>
            app.applySightline({
              eyeHeight: model.eyeHeight,
              objectHeight: model.objectHeight,
              distance: model.distance,
              shape: model.to.shape || null,
              name: model.to.name,
            }),
        }),
      ]);
    }

    function update(state, result) {
      const t = HL.i18n.t;
      const lang = HL.i18n.lang();

      HL.dom.clear(container);

      // Rozhledy jsou pozemske, takze se pocitaji vzdy s polomerem Zeme -
      // prepnute teleso je jina uloha a tuhle tabulku by jen zmatlo.
      // These are terrestrial sightlines, so they always use the Earth's
      // radius; a different body would only confuse this table.
      const R = G.effectiveRadius(result.refraction, G.R_MEAN);
      const models = HL.SIGHTLINE_PAIRS.map((pair) => solvePair(pair, R, state.haze));

      const list = el('ul', { class: 'sl-list' });
      for (const model of models) list.appendChild(row(model, lang));

      const notes = el('ul', { class: 'sl-notes' });
      for (const model of models) {
        if (!model.pair.note) continue;
        notes.appendChild(el('li', { text: t('sight.note.' + model.pair.note) }));
      }

      container.appendChild(
        el('section', { class: 'card sightlines-card' }, [
          el('h3', { class: 'card-title', text: t('sight.title') }),
          el('p', { class: 'hint', text: t('sight.intro') }),
          list,
          el('p', {
            class: 'hint sl-warning',
            text: t(result.refraction ? 'sight.withRefraction' : 'sight.withoutRefraction'),
          }),
          state.haze > 0
            ? el('p', {
                class: 'hint sl-warning',
                text: t('sight.withHaze', {
                  p: HL.format.percent(state.haze, lang),
                  range: HL.format.distance(G.hazeRange(state.haze), lang),
                }),
              })
            : null,
          notes,
          el('p', { class: 'hint sl-warning', text: t('sight.terrain') }),
        ])
      );
    }

    return { update };
  }

  HL.Sightlines = { mount, solvePair };
})((window.HorizonLab = window.HorizonLab || {}));
