/**
 * app.js - propojeni vsech casti dohromady.
 * Wires every module together: one store, one render pass.
 *
 * Tok dat / data flow:
 *   ovladaci prvky -> app.setXxx() -> store -> render(state) -> vsechny pohledy
 *   controls       -> app.setXxx() -> store -> render(state) -> every view
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;
  const qs = HL.dom.qs;

  const UI_KEY = 'horizonlab.ui.v1';

  const DEFAULTS = {
    mode: 'see',
    planet: 'earth',
    // pouzije se jen pri volbe "vlastni teleso"; ulozeno jako PRUMER v metrech
    customDiameter: 12742017.6,
    eyeHeight: 1,
    distance: 22000,
    objectId: 'sailboat',
    customHeight: 50,
    refraction: false,
  };

  const store = HL.createStore(
    Object.assign({}, DEFAULTS, { data: null, dataSource: 'factory', dataStamp: 0 })
  );

  const views = {};
  const nodes = {};

  // ---- pomocne vypocty / derived values ---------------------------------

  /** Neutralni ikonka pro vlastni objekt - merici tyc s praporkem. */
  const CUSTOM_IMAGE =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100">' +
        '<rect x="19" y="16" width="13" height="84" rx="3" fill="#1f8fa8"/>' +
        '<rect x="19" y="30" width="13" height="11" fill="#e4f6fa"/>' +
        '<rect x="19" y="56" width="13" height="11" fill="#e4f6fa"/>' +
        '<rect x="19" y="82" width="13" height="11" fill="#e4f6fa"/>' +
        '<rect x="23.5" y="2" width="4" height="16" rx="2" fill="#0b3549"/>' +
        '<path d="M27 3h17l-5 6 5 6H27z" fill="#f2a93b"/>' +
        '</svg>'
    );

  function customObject(state) {
    return {
      id: '__custom',
      category: 'custom',
      name: { cs: HL.strings.cs['ctrl.custom'], en: HL.strings.en['ctrl.custom'] },
      height: state.customHeight,
      aspect: 0.5,
      baseline: 'ground',
      defaultDistance: null,
      fact: null,
      image: CUSTOM_IMAGE,
    };
  }

  function currentObject(state) {
    if (state.objectId === '__custom') return customObject(state);
    const found = state.data && state.data.objects.find((o) => o.id === state.objectId);
    if (found) return found;
    if (state.data && state.data.objects.length) return state.data.objects[0];
    return customObject(state);
  }

  /** Skutecny polomer zvoleneho telesa [m]. */
  function planetRadius(state) {
    return HL.planetRadius(state.planet, state.customDiameter / 2);
  }

  function currentResult(state) {
    const object = currentObject(state);
    return HL.geometry.solve({
      planetRadius: planetRadius(state),
      eyeHeight: state.eyeHeight,
      objectHeight: object.height,
      distance: state.distance,
      refraction: state.refraction,
    });
  }

  /**
   * Vzdalenost, ve ktere je z objektu videt jen cast - na obrazku
   * nejzajimavejsi. Doporucena hodnota z dat se pouzije jen tehdy, kdyz pri
   * aktualnim telese a vysce oci objekt jeste uplne neschovava.
   */
  function suggestedDistance(state, object) {
    const R = HL.geometry.effectiveRadius(state.refraction, planetRadius(state));
    const vanish = HL.geometry.vanishDistance(state.eyeHeight, object.height, R);
    const suggested = object.defaultDistance
      ? Math.min(object.defaultDistance, vanish * 0.82)
      : vanish * 0.78;
    return Math.max(100, Math.round(suggested));
  }

  /** Horni mez posuvniku vzdalenosti - vzdy trochu za bodem zmizeni. */
  function sliderMaxDistance(state) {
    const object = currentObject(state);
    const radius = planetRadius(state);
    const R = HL.geometry.effectiveRadius(state.refraction, radius);
    const vanish = HL.geometry.vanishDistance(state.eyeHeight, object.height, R);
    const rounded = Math.max(5000, Math.ceil((vanish * 1.35) / 1000) * 1000);
    // dal nez na protilehly bod telesa se jit neda
    return Math.min(HL.geometry.antipodeDistance(radius), Math.max(rounded, state.distance));
  }

  // ---- ukladani nastaveni / remember the last setup ----------------------

  function saveUi(state) {
    try {
      localStorage.setItem(
        UI_KEY,
        JSON.stringify({
          mode: state.mode === 'editor' ? 'see' : state.mode,
          planet: state.planet,
          customDiameter: state.customDiameter,
          eyeHeight: state.eyeHeight,
          distance: state.distance,
          objectId: state.objectId,
          customHeight: state.customHeight,
          refraction: state.refraction,
        })
      );
    } catch (e) {
      /* ignorovat / ignore */
    }
  }

  function loadUi() {
    try {
      const raw = localStorage.getItem(UI_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  // ---- verejne akce / actions used by the UI modules ---------------------

  const app = {
    sliderMaxDistance: sliderMaxDistance,

    /** Aktualni stav - pouziva editor, aby vedel o vlastnich zmenach. */
    state() {
      return store.get();
    },

    setEyeHeight(metres) {
      store.set({ eyeHeight: Math.min(10000, Math.max(0.1, metres)) });
    },

    setDistance(metres) {
      const antipode = HL.geometry.antipodeDistance(planetRadius(store.get()));
      store.set({ distance: Math.min(antipode, Math.max(100, Math.round(metres))) });
    },

    /** Prepne teleso a rovnou srovna vzdalenost, aby obrazek dal daval smysl. */
    setPlanet(id) {
      const state = store.get();
      const next = Object.assign({}, state, { planet: id });
      const object = currentObject(next);
      store.set({ planet: id, distance: suggestedDistance(next, object) });
    },

    /** Prumer vlastniho telesa v METRECH. */
    setCustomDiameter(metres) {
      const state = store.get();
      const diameter = Math.min(4e10, Math.max(100, metres));
      const next = Object.assign({}, state, { planet: 'custom', customDiameter: diameter });
      const object = currentObject(next);
      store.set({
        planet: 'custom',
        customDiameter: diameter,
        distance: suggestedDistance(next, object),
      });
    },

    /** Nazev zvoleneho telesa v aktualnim jazyce. */
    planetName(state) {
      const current = state || store.get();
      const planet = HL.findPlanet(current.planet);
      return planet ? HL.i18n.pick(planet.name, planet.id) : HL.i18n.t('ctrl.planetCustom');
    },

    planetRadius(state) {
      return planetRadius(state || store.get());
    },

    setCustomHeight(metres) {
      store.set({ customHeight: Math.max(0.1, metres) });
    },

    /**
     * Prenese skutecny rozhled do simulace. Vsechno se nastavi NAJEDNOU:
     * selectObject() i setPlanet() si samy dopocitavaji vzdalenost, takze
     * postupne volani by tu zmerenou zase prepsalo.
     * Loads a real-world sightline into the simulation. Everything is set in
     * ONE go: selectObject() and setPlanet() derive a distance of their own,
     * so calling them one by one would overwrite the measured one.
     */
    applySightline(sightline) {
      store.set({
        mode: 'see',
        planet: 'earth',
        objectId: '__custom',
        customHeight: Math.max(0.1, sightline.objectHeight),
        eyeHeight: Math.min(10000, Math.max(0.1, sightline.eyeHeight)),
        distance: Math.round(sightline.distance),
      });
    },

    setRefraction(on) {
      store.set({ refraction: !!on });
    },

    setMode(mode) {
      store.set({ mode: mode });
    },

    selectObject(id) {
      const state = store.get();
      const patch = { objectId: id };
      const object =
        id === '__custom' ? customObject(state) : state.data.objects.find((o) => o.id === id);
      if (object) patch.distance = suggestedDistance(state, object);
      store.set(patch);
    },

    /** Nahradi datovou sadu (pouziva editor pri kazde zmene). */
    applyData(data) {
      const state = store.get();
      const normalised = HL.data.normalise(data);
      const patch = { data: normalised, dataStamp: state.dataStamp + 1 };
      if (
        state.objectId !== '__custom' &&
        !normalised.objects.some((o) => o.id === state.objectId)
      ) {
        patch.objectId = normalised.objects.length ? normalised.objects[0].id : '__custom';
      }
      store.set(patch);
    },

    refreshDataBadge() {
      store.set({ dataSource: HL.data.hasLocal() ? 'local' : store.get().dataSource });
    },

    reset() {
      try {
        localStorage.removeItem(UI_KEY);
      } catch (e) {
        /* ignorovat / ignore */
      }
      const state = store.get();
      const patch = Object.assign({}, DEFAULTS);
      if (!state.data.objects.some((o) => o.id === patch.objectId)) {
        patch.objectId = state.data.objects.length ? state.data.objects[0].id : '__custom';
      }
      store.set(patch);
    },
  };

  // ---- vykresleni / rendering -------------------------------------------

  function renderChrome(state) {
    for (const button of HL.dom.qsa('[data-mode]', nodes.tabs)) {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    }
    for (const panel of HL.dom.qsa('.panel', nodes.main)) {
      panel.hidden = panel.dataset.panel !== state.mode;
    }
    // editor potrebuje celou sirku, ovladaci panel se schova
    nodes.controls.hidden = state.mode === 'editor';
    nodes.main.classList.toggle('is-wide', state.mode === 'editor');
    for (const button of HL.dom.qsa('[data-lang]', nodes.langSwitch)) {
      button.classList.toggle('is-active', button.dataset.lang === HL.i18n.lang());
    }
    nodes.dataBadge.textContent = HL.i18n.t('data.source.' + state.dataSource);
    nodes.dataBadge.className = 'data-badge is-' + state.dataSource;
  }

  function render(state) {
    if (!state.data) return;
    const object = currentObject(state);
    const result = currentResult(state);

    renderChrome(state);
    views.controls.update(state);

    // vzhled telesa (barvy oblohy i povrchu) putuje do vsech pohledu
    const look = HL.planetLook(state.planet);

    if (state.mode === 'see') {
      // Titulek nese nazev telesa, takze ho nelze vyplnit staticky pres
      // data-i18n. / The caption carries the body's name, so a static
      // data-i18n pass cannot fill it in.
      nodes.diagramTitleText.textContent = HL.i18n.t('diagram.title', { planet: app.planetName(state) });
      HL.Diagram.render(nodes.diagram, { result: result, object: object, look: look });
      HL.Telescope.render(nodes.telescope, { result: result, object: object, look: look });
      HL.HorizonMap.render(nodes.horizonMap, {
        result: result,
        object: object,
        look: look,
        objectName: HL.i18n.pick(object.name, object.id),
        planetName: app.planetName(state),
      });
      HL.Results.render(nodes.verdict, nodes.stats, nodes.fact, {
        result: result,
        object: object,
        planet: app.planetName(state),
      });
      views.sightlines.update(state, result);
    } else if (state.mode === 'vanish') {
      views.vanish.update(state, result, object);
    } else if (state.mode === 'limits') {
      views.limits.update(state, result, object);
    } else if (state.mode === 'geometry') {
      views.geometry.update(state, result, object);
    } else if (state.mode === 'editor') {
      views.editor.update(state);
    }

    saveUi(state);
  }

  // ---- start ------------------------------------------------------------

  async function boot() {
    HL.i18n.init();

    nodes.tabs = qs('#modeTabs');
    nodes.main = qs('#main');
    nodes.controls = qs('#controls');
    nodes.langSwitch = qs('#langSwitch');
    nodes.dataBadge = qs('#dataBadge');
    nodes.diagram = qs('#mainDiagram');
    nodes.diagramTitleText = qs('#diagramTitleText');
    nodes.telescope = qs('#telescopeView');
    nodes.horizonMap = qs('#horizonMap');
    nodes.verdict = qs('#verdict');
    nodes.stats = qs('#stats');
    nodes.fact = qs('#fact');

    nodes.tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (button) app.setMode(button.dataset.mode);
    });
    nodes.langSwitch.addEventListener('click', (event) => {
      const button = event.target.closest('[data-lang]');
      if (button) HL.i18n.setLang(button.dataset.lang);
    });

    views.controls = HL.Controls.mount(qs('#controls'), app);
    views.sightlines = HL.Sightlines.mount(qs('#sightlines'), app);

    // Tlacitka pro stazeni obrazku. Karty rezimu "Co uvidim?" jsou napevno
    // v index.html, takze staci pripojit jednou; ostatni rezimy si je
    // pridavaji samy pri vykresleni.
    HL.Exporter.attach(qs('#diagramTitle'), () => nodes.diagram, 'za-obzorem-diagram');
    HL.Exporter.attach(qs('#telescopeTitle'), () => nodes.telescope, 'za-obzorem-dalekohled');
    HL.Exporter.attach(qs('#mapTitle'), () => nodes.horizonMap, 'za-obzorem-mapa');
    views.vanish = HL.VanishPanel.mount(qs('#vanishPanel'), app);
    views.limits = HL.LimitsPanel.mount(qs('#limitsPanel'), app);
    views.geometry = HL.GeometryPanel.mount(qs('#geometryPanel'), app);
    views.editor = HL.Editor.mount(qs('#editorPanel'), app);

    const loaded = await HL.data.load();
    const saved = loadUi() || {};
    const patch = Object.assign({}, DEFAULTS, saved, {
      data: loaded.data,
      dataSource: loaded.source,
      dataStamp: 1,
    });
    if (patch.objectId !== '__custom' && !loaded.data.objects.some((o) => o.id === patch.objectId)) {
      patch.objectId = loaded.data.objects.length ? loaded.data.objects[0].id : '__custom';
      const object = loaded.data.objects[0];
      if (object && object.defaultDistance) patch.distance = object.defaultDistance;
    }
    if (patch.mode === 'editor') patch.mode = 'see';

    store.subscribe(render);
    store.set(patch);

    HL.i18n.onChange(() => {
      HL.i18n.apply();
      render(store.get());
    });

    document.body.classList.remove('is-loading');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  HL.app = app;
})((window.HorizonLab = window.HorizonLab || {}));
