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

  function currentResult(state) {
    const object = currentObject(state);
    return HL.geometry.solve({
      eyeHeight: state.eyeHeight,
      objectHeight: object.height,
      distance: state.distance,
      refraction: state.refraction,
    });
  }

  /** Horni mez posuvniku vzdalenosti - vzdy trochu za bodem zmizeni. */
  function sliderMaxDistance(state) {
    const object = currentObject(state);
    const R = HL.geometry.effectiveRadius(state.refraction);
    const vanish = HL.geometry.vanishDistance(state.eyeHeight, object.height, R);
    const rounded = Math.max(5000, Math.ceil((vanish * 1.35) / 1000) * 1000);
    return Math.max(rounded, state.distance);
  }

  // ---- ukladani nastaveni / remember the last setup ----------------------

  function saveUi(state) {
    try {
      localStorage.setItem(
        UI_KEY,
        JSON.stringify({
          mode: state.mode === 'editor' ? 'see' : state.mode,
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
      store.set({ distance: Math.min(5000000, Math.max(100, Math.round(metres))) });
    },

    setCustomHeight(metres) {
      store.set({ customHeight: Math.max(0.1, metres) });
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
      if (object) {
        // Vybereme vzdalenost, kde je z objektu videt jen cast - to je na
        // obrazku nejzajimavejsi. Doporucena vzdalenost z dat se pouzije jen
        // tehdy, kdyz pri aktualni vysce oci objekt uz uplne neschovava.
        // Pick a distance where part of the object is still visible; the
        // curated default is used only when it is not already past vanishing.
        const R = HL.geometry.effectiveRadius(state.refraction);
        const vanish = HL.geometry.vanishDistance(state.eyeHeight, object.height, R);
        const suggested = object.defaultDistance
          ? Math.min(object.defaultDistance, vanish * 0.82)
          : vanish * 0.78;
        patch.distance = Math.max(100, Math.round(suggested));
      }
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

    if (state.mode === 'see') {
      HL.Diagram.render(nodes.diagram, { result: result, object: object });
      HL.Telescope.render(nodes.telescope, { result: result, object: object });
      HL.Results.render(nodes.verdict, nodes.stats, nodes.fact, { result: result, object: object });
    } else if (state.mode === 'vanish') {
      views.vanish.update(state, result, object);
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
    nodes.telescope = qs('#telescopeView');
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
    views.vanish = HL.VanishPanel.mount(qs('#vanishPanel'), app);
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
