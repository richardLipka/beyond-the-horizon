/**
 * controls.js - ovladaci panel: vyska oci, vyber objektu, vzdalenost.
 * The control sidebar: eye height, object picker, distance.
 *
 * Panel se cely prestavi jen pri zmene jazyka nebo dat; jinak se
 * pouze srovnaji hodnoty vstupu se stavem.
 * The panel is rebuilt only when the language or the data change; otherwise
 * the inputs are just synced with the state.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;

  const EYE_PRESETS = [
    { key: 'preset.lying', value: 0.2, icon: '🏖️' },
    { key: 'preset.child', value: 1.2, icon: '🧒' },
    { key: 'preset.adult', value: 1.7, icon: '🧑' },
    { key: 'preset.balcony', value: 12, icon: '🏢' },
    { key: 'preset.tower', value: 40, icon: '🗼' },
    { key: 'preset.cliff', value: 100, icon: '🧗' },
    { key: 'preset.plane', value: 10000, icon: '✈️' },
  ];

  const EYE_MIN = 0.1;
  /** Konec "pozemskych" vysek - dal uz zacinaji obezne drahy. */
  const GROUND_MAX = 10000;
  /**
   * Podil drahy posuvniku, ktery pripada na pozemske vysky.
   *
   * Cely rozsah az k nejvyssi obezne draze je u Zeme devet radu (0,1 m az
   * 100 000 km) a u Slunce dvanact. Jednim logaritmem pres celou dratku by na
   * lidske vysky - to hlavni, s cim se tu hraje - zbyla treti a mensi cast.
   * Posuvnik je proto zlomeny na dve casti: prvnich 62 % je presne to, co mel
   * driv (0,1 m az 10 km), zbytek dojede na obeznou drahu.
   *
   * The full range up to the highest orbit is nine decades on the Earth and
   * twelve on the Sun. One logarithm across the whole track would leave human
   * heights - the thing this app is actually about - a third of it or less. The
   * slider is therefore in two pieces: the first 62 % is exactly what it used
   * to be, and the rest reaches orbit.
   */
  const GROUND_SHARE = 0.62;
  const SLIDER_STEPS = 1000;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /**
   * Zastupna kresba na dlazdici objektu. Emoji se mezi platformami lisi
   * a nesedi k rucne kresleným objektum, tak je i tady male SVG - stejne
   * jako u vsech ostatnich objektu.
   * The placeholder on an object card. Emoji look different on every platform
   * and clash with the hand-drawn objects, so this is a small SVG too.
   *
   * @param {boolean} dashed carkovane = vlastni objekt / dashed = custom object
   */
  function placeholderThumb(dashed) {
    const shape = HL.dom.svg('path', {
      d: 'M20 8 32 30v64H8V30Z',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 6,
      'stroke-linejoin': 'round',
    });
    if (dashed) shape.setAttribute('stroke-dasharray', '11 8');
    return HL.dom.svg('svg', { viewBox: '0 0 40 100', class: 'thumb-placeholder', xmlns: HL.dom.SVG_NS }, [shape]);
  }

  /** Horni konec druhe casti posuvniku; nikdy nesmi splynout s prvni. */
  const orbitTop = (max) => Math.max(max, GROUND_MAX * 1.0001);

  /** Logaritmicky posuvnik ve dvou usecich - male vysky potrebuji jemnejsi krok. */
  function eyeToSlider(metres, max) {
    const v = clamp(metres, EYE_MIN, orbitTop(max));
    if (v <= GROUND_MAX) {
      const f = Math.log10(v / EYE_MIN) / Math.log10(GROUND_MAX / EYE_MIN);
      return Math.round(f * GROUND_SHARE * SLIDER_STEPS);
    }
    const f = Math.log10(v / GROUND_MAX) / Math.log10(orbitTop(max) / GROUND_MAX);
    return Math.round((GROUND_SHARE + f * (1 - GROUND_SHARE)) * SLIDER_STEPS);
  }

  function sliderToEye(slider, max) {
    const f = slider / SLIDER_STEPS;
    const raw =
      f <= GROUND_SHARE
        ? EYE_MIN * Math.pow(GROUND_MAX / EYE_MIN, f / GROUND_SHARE)
        : GROUND_MAX * Math.pow(orbitTop(max) / GROUND_MAX, (f - GROUND_SHARE) / (1 - GROUND_SHARE));
    if (raw < 1) return Math.round(raw * 100) / 100;
    if (raw < 10) return Math.round(raw * 10) / 10;
    if (raw < 100) return Math.round(raw);
    if (raw < 1000) return Math.round(raw / 5) * 5;
    if (raw < 100000) return Math.round(raw / 50) * 50;
    // Na obezne draze uz je metr smesne jemny - zaokrouhli se na kilometry.
    return Math.round(raw / 1000) * 1000;
  }

  function mount(container, app) {
    const refs = {};
    let listSignature = null;
    let orbitSignature = null;

    /** Horni konec posuvniku vysky oci pro aktualni stav. */
    const eyeCeiling = (state) => Math.max(app.maxEyeHeight(state), state.eyeHeight);

    function field(labelKey, inputRow, hintKey) {
      return el('div', { class: 'field' }, [
        el('label', { class: 'field-label', text: HL.i18n.t(labelKey) }),
        inputRow,
        hintKey ? el('p', { class: 'hint', text: HL.i18n.t(hintKey) }) : null,
      ]);
    }

    function buildObjectList(state) {
      const list = el('div', { class: 'object-list' });
      const grouped = new Map();
      for (const item of state.data.objects) {
        if (!grouped.has(item.category)) grouped.set(item.category, []);
        grouped.get(item.category).push(item);
      }

      const categoryById = new Map((state.data.categories || []).map((c) => [c.id, c]));
      const order = (state.data.categories || []).map((c) => c.id);
      for (const key of grouped.keys()) if (!order.includes(key)) order.push(key);

      for (const categoryId of order) {
        const items = grouped.get(categoryId);
        if (!items || !items.length) continue;
        const category = categoryById.get(categoryId);
        list.appendChild(
          el('h4', { class: 'object-group' }, [
            category && category.icon ? el('span', { class: 'group-icon', text: category.icon }) : null,
            document.createTextNode(category ? HL.i18n.pick(category.name, categoryId) : categoryId),
          ])
        );
        const grid = el('div', { class: 'object-grid' });
        for (const item of items) {
          grid.appendChild(objectCard(item, state));
        }
        list.appendChild(grid);
      }

      list.appendChild(customCard(state));
      return list;
    }

    function objectCard(item, state) {
      const card = el(
        'button',
        {
          type: 'button',
          class: 'object-card' + (state.objectId === item.id ? ' is-active' : ''),
          dataset: { objectId: item.id },
          title: HL.i18n.pick(item.name, item.id),
          onclick: () => app.selectObject(item.id),
        },
        [
          el('span', { class: 'object-thumb' }, [
            item.image ? el('img', { src: item.image, alt: '' }) : placeholderThumb(false),
          ]),
          el('span', { class: 'object-name', text: HL.i18n.pick(item.name, item.id) }),
          el('span', { class: 'object-height', text: HL.format.height(item.height, HL.i18n.lang()) }),
        ]
      );
      return card;
    }

    function customCard(state) {
      return el(
        'button',
        {
          type: 'button',
          class: 'object-card object-card-custom' + (state.objectId === '__custom' ? ' is-active' : ''),
          dataset: { objectId: '__custom' },
          onclick: () => app.selectObject('__custom'),
        },
        [
          el('span', { class: 'object-thumb' }, [placeholderThumb(true)]),
          el('span', { class: 'object-name', text: HL.i18n.t('ctrl.custom') }),
          el('span', { class: 'object-height', text: HL.format.height(state.customHeight, HL.i18n.lang()) }),
        ]
      );
    }

    function build(state) {
      HL.dom.clear(container);

      // --- teleso / the body ------------------------------------------------
      refs.planetGrid = el('div', { class: 'planet-grid' });
      for (const planet of HL.PLANETS) {
        refs.planetGrid.appendChild(
          el(
            'button',
            {
              type: 'button',
              class: 'planet-card',
              dataset: { planet: planet.id },
              title: HL.i18n.pick(planet.name, planet.id),
              onclick: () => app.setPlanet(planet.id),
            },
            [
              el('span', { class: 'planet-icon', text: planet.icon }),
              el('span', { class: 'planet-name', text: HL.i18n.pick(planet.name, planet.id) }),
              // barevny prouzek = presne ta barva, kterou pak ma povrch
              // v obrazcich / the strip is the colour the surface will take
              el('span', { class: 'planet-swatch', style: { background: planet.swatch } }),
            ]
          )
        );
      }

      refs.planetDiameter = el('input', {
        type: 'number',
        class: 'num-input',
        min: 0.1,
        step: 10,
        oninput: (e) => {
          const value = parseFloat(e.target.value);
          if (isFinite(value) && value > 0) app.setCustomDiameter(value * 1000);
        },
      });
      refs.planetInfo = el('p', { class: 'hint planet-info' });
      refs.planetGaseous = el('p', { class: 'hint', text: HL.i18n.t('ctrl.planetGaseous') });

      container.appendChild(
        el('section', { class: 'control-group' }, [
          el('h3', { class: 'control-title control-title-plain' }, [
            el('span', { class: 'step-badge step-badge-planet', text: '🪐' }),
            document.createTextNode(HL.i18n.t('ctrl.planet')),
          ]),
          refs.planetGrid,
          el('div', { class: 'field custom-diameter' }, [
            el('label', { class: 'field-label', text: HL.i18n.t('ctrl.planetDiameter') }),
            el('div', { class: 'input-row' }, [
              refs.planetDiameter,
              el('span', { class: 'unit', text: HL.i18n.t('unit.km') }),
            ]),
          ]),
          refs.planetInfo,
          refs.planetGaseous,
          el('p', { class: 'hint', text: HL.i18n.t('ctrl.planetHelp') }),
        ])
      );

      // --- 1. pozorovatel ---------------------------------------------------
      refs.eyeNumber = el('input', {
        type: 'number',
        class: 'num-input',
        min: EYE_MIN,
        step: 0.1,
        oninput: (e) => {
          const value = parseFloat(e.target.value);
          // Horni mez zna app - lisi se teleso od telesa.
          if (isFinite(value)) app.setEyeHeight(Math.max(EYE_MIN, value));
        },
      });
      refs.eyeRange = el('input', {
        type: 'range',
        class: 'range-input',
        min: 0,
        max: SLIDER_STEPS,
        step: 1,
        oninput: (e) => app.setEyeHeight(sliderToEye(Number(e.target.value), eyeCeiling(app.state()))),
      });
      refs.eyeChips = el('div', { class: 'chips' });
      for (const preset of EYE_PRESETS) {
        refs.eyeChips.appendChild(
          el('button', {
            type: 'button',
            class: 'chip',
            dataset: { value: String(preset.value) },
            onclick: () => app.setEyeHeight(preset.value),
            html: `<span aria-hidden="true">${preset.icon}</span> ${HL.i18n.t(preset.key)}`,
          })
        );
      }

      // Obezne drahy se stavi az v sync() - jejich vysky patri telesu, a to se
      // meni casteji nez jazyk nebo data.
      // The orbits are built in sync(): their altitudes belong to the body,
      // which changes more often than the language or the data do.
      refs.orbitChips = el('div', { class: 'chips chips-orbit' });

      container.appendChild(
        el('section', { class: 'control-group' }, [
          el('h3', { class: 'control-title' }, [
            el('span', { class: 'step-badge', text: '1' }),
            document.createTextNode(HL.i18n.t('ctrl.observer')),
          ]),
          field(
            'ctrl.eyeHeight',
            el('div', { class: 'input-row' }, [
              refs.eyeNumber,
              el('span', { class: 'unit', text: HL.i18n.t('unit.m') }),
            ]),
            null
          ),
          refs.eyeRange,
          el('p', { class: 'hint', text: HL.i18n.t('ctrl.eyeHelp') }),
          refs.eyeChips,
          el('div', { class: 'chips-group' }, [
            el('span', { class: 'chips-title', text: HL.i18n.t('ctrl.orbit') }),
            refs.orbitChips,
            el('p', { class: 'hint', text: HL.i18n.t('ctrl.orbitHelp') }),
          ]),
        ])
      );

      // --- 2. objekt --------------------------------------------------------
      refs.search = el('input', {
        type: 'search',
        class: 'search-input',
        placeholder: HL.i18n.t('ctrl.search'),
        oninput: (e) => filterList(e.target.value),
      });
      refs.listHost = el('div', { class: 'object-list-host' }, [buildObjectList(state)]);
      refs.noResults = el('p', { class: 'hint no-results', text: HL.i18n.t('ctrl.noResults'), style: { display: 'none' } });

      refs.customHeight = el('input', {
        type: 'number',
        class: 'num-input',
        min: 0.1,
        step: 0.5,
        oninput: (e) => {
          const value = parseFloat(e.target.value);
          if (isFinite(value) && value > 0) app.setCustomHeight(value);
        },
      });
      refs.customRow = el('div', { class: 'field custom-height' }, [
        el('label', { class: 'field-label', text: HL.i18n.t('ctrl.customHeight') }),
        el('div', { class: 'input-row' }, [
          refs.customHeight,
          el('span', { class: 'unit', text: HL.i18n.t('unit.m') }),
        ]),
      ]);

      container.appendChild(
        el('section', { class: 'control-group' }, [
          el('h3', { class: 'control-title' }, [
            el('span', { class: 'step-badge', text: '2' }),
            document.createTextNode(HL.i18n.t('ctrl.object')),
          ]),
          refs.search,
          refs.listHost,
          refs.noResults,
          refs.customRow,
        ])
      );

      // --- 3. vzdalenost ----------------------------------------------------
      refs.distanceNumber = el('input', {
        type: 'number',
        class: 'num-input',
        min: 0.1,
        step: 0.5,
        oninput: (e) => {
          const value = parseFloat(e.target.value);
          if (isFinite(value) && value > 0) app.setDistance(value * 1000);
        },
      });
      refs.distanceRange = el('input', {
        type: 'range',
        class: 'range-input',
        min: 100,
        max: 100000,
        step: 100,
        oninput: (e) => app.setDistance(Number(e.target.value)),
      });

      // Vzdalenost je vstup jen pro rezimy, ktere ji potrebuji - v Geometrii
      // se dopocitava, takze se tam skryva.
      refs.distanceGroup = el('section', { class: 'control-group' }, [
        el('h3', { class: 'control-title' }, [
          el('span', { class: 'step-badge', text: '3' }),
          document.createTextNode(HL.i18n.t('ctrl.distance')),
        ]),
        field(
          'ctrl.distanceLabel',
          el('div', { class: 'input-row' }, [
            refs.distanceNumber,
            el('span', { class: 'unit', text: HL.i18n.t('unit.km') }),
          ]),
          null
        ),
        refs.distanceRange,
        el('p', { class: 'hint', text: HL.i18n.t('ctrl.distanceHelp') }),
      ]);
      container.appendChild(refs.distanceGroup);

      // --- nastaveni --------------------------------------------------------
      refs.refraction = el('input', {
        type: 'checkbox',
        onchange: (e) => app.setRefraction(e.target.checked),
      });
      container.appendChild(
        el('section', { class: 'control-group' }, [
          el('h3', { class: 'control-title control-title-plain', text: HL.i18n.t('ctrl.options') }),
          el('label', { class: 'switch' }, [
            refs.refraction,
            el('span', { class: 'switch-track' }, [el('span', { class: 'switch-knob' })]),
            el('span', { class: 'switch-text', text: HL.i18n.t('ctrl.refraction') }),
          ]),
          el('p', { class: 'hint', text: HL.i18n.t('ctrl.refractionHelp') }),
          el('button', {
            type: 'button',
            class: 'btn btn-ghost btn-block',
            text: HL.i18n.t('ctrl.reset'),
            onclick: () => app.reset(),
          }),
        ])
      );
    }

    function filterList(query) {
      const needle = String(query || '').trim().toLowerCase();
      let visible = 0;
      for (const card of HL.dom.qsa('.object-card', refs.listHost)) {
        const name = (card.textContent || '').toLowerCase();
        const match = !needle || name.indexOf(needle) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      }
      for (const heading of HL.dom.qsa('.object-group', refs.listHost)) {
        const grid = heading.nextElementSibling;
        const any = grid && HL.dom.qsa('.object-card', grid).some((c) => c.style.display !== 'none');
        heading.style.display = any ? '' : 'none';
        if (grid) grid.style.display = any ? '' : 'none';
      }
      refs.noResults.style.display = visible ? 'none' : '';
    }

    /**
     * Dlazdice obeznych drah. Prestavi se, jen kdyz se zmeni teleso (a s nim
     * vysky drah) nebo jazyk - jinak by kazde tahnuti posuvnikem zahodilo
     * tlacitko prave pod kurzorem.
     * Rebuilt only when the body (and with it the altitudes) or the language
     * changes; otherwise every drag of a slider would throw away the button
     * under the cursor.
     */
    function syncOrbits(state, lang) {
      const radius = app.planetRadius(state);
      const signature = `${state.planet}|${radius}|${lang}`;
      if (signature !== orbitSignature) {
        orbitSignature = signature;
        HL.dom.clear(refs.orbitChips);
        for (const orbit of HL.orbitPresets(state.planet, radius)) {
          refs.orbitChips.appendChild(
            el(
              'button',
              {
                type: 'button',
                class: 'chip chip-orbit',
                dataset: { value: String(orbit.value) },
                onclick: () => app.setEyeHeight(orbit.value),
              },
              [
                el('span', { 'aria-hidden': 'true', text: orbit.icon }),
                document.createTextNode(' ' + HL.i18n.t(orbit.key) + ' '),
                el('span', { class: 'chip-value', text: HL.format.height(orbit.value, lang) }),
              ]
            )
          );
        }
      }
      for (const chip of HL.dom.qsa('.chip', refs.orbitChips)) {
        chip.classList.toggle('is-active', Math.abs(Number(chip.dataset.value) - state.eyeHeight) < 1e-9);
      }
    }

    function sync(state) {
      const active = document.activeElement;
      const lang = HL.i18n.lang();

      for (const card of HL.dom.qsa('.planet-card', refs.planetGrid)) {
        card.classList.toggle('is-active', card.dataset.planet === state.planet);
      }
      const radius = app.planetRadius(state);
      if (active !== refs.planetDiameter) {
        refs.planetDiameter.value = String(Math.round((radius * 2) / 10) / 100);
      }
      refs.planetInfo.textContent = HL.i18n.t('ctrl.planetInfo', {
        r: HL.format.distance(radius, lang),
        c: HL.format.distance(2 * Math.PI * radius, lang),
      });
      const planet = HL.findPlanet(state.planet);
      refs.planetGaseous.style.display = planet && planet.gaseous ? '' : 'none';
      refs.distanceGroup.style.display = state.mode === 'geometry' ? 'none' : '';

      // Strop vysky oci je u kazdeho telesa jinde; kdyz uzivatel prijde z jineho
      // telesa vys, nez kam tohle dosahne, posuvnik se natahne za nim.
      // The ceiling differs per body; if the user arrives from another body
      // higher than this one reaches, the slider stretches to follow.
      const eyeMax = eyeCeiling(state);
      refs.eyeNumber.max = String(eyeMax);
      if (active !== refs.eyeNumber) refs.eyeNumber.value = String(state.eyeHeight);
      refs.eyeRange.value = String(eyeToSlider(state.eyeHeight, eyeMax));
      for (const chip of HL.dom.qsa('.chip', refs.eyeChips)) {
        chip.classList.toggle('is-active', Math.abs(Number(chip.dataset.value) - state.eyeHeight) < 1e-9);
      }
      syncOrbits(state, lang);

      for (const card of HL.dom.qsa('.object-card', refs.listHost)) {
        card.classList.toggle('is-active', card.dataset.objectId === state.objectId);
      }
      refs.customRow.style.display = state.objectId === '__custom' ? '' : 'none';
      if (active !== refs.customHeight) refs.customHeight.value = String(state.customHeight);
      const customCardNode = HL.dom.qs('.object-card-custom .object-height', refs.listHost);
      if (customCardNode) {
        customCardNode.textContent = HL.format.height(state.customHeight, HL.i18n.lang());
      }

      const maxDistance = app.sliderMaxDistance(state);
      refs.distanceRange.max = String(maxDistance);
      refs.distanceRange.step = String(Math.max(50, Math.round(maxDistance / 600 / 50) * 50));
      refs.distanceRange.value = String(Math.min(state.distance, maxDistance));
      if (active !== refs.distanceNumber) {
        refs.distanceNumber.value = String(Math.round((state.distance / 1000) * 1000) / 1000);
      }

      refs.refraction.checked = !!state.refraction;
    }

    function update(state) {
      const signature = `${HL.i18n.lang()}|${state.data ? state.data.objects.length : 0}|${state.dataStamp}`;
      if (signature !== listSignature) {
        listSignature = signature;
        build(state);
      }
      sync(state);
    }

    return { update };
  }

  HL.Controls = { mount };
})((window.HorizonLab = window.HorizonLab || {}));
