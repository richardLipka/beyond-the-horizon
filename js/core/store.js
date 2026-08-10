/**
 * store.js - minimalisticke ulozeni stavu s odberateli.
 * Tiny observable state container. One source of truth for the whole app;
 * UI moduly se jen prihlasi k odberu a prekresli se. / UI modules subscribe
 * and re-render, nothing talks to anything else directly.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  function createStore(initialState) {
    let state = Object.assign({}, initialState);
    const listeners = new Set();

    function get() {
      return state;
    }

    /** Slouci zmeny do stavu a upozorni odberatele. */
    function set(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      let changed = false;
      for (const key of Object.keys(next)) {
        if (state[key] !== next[key]) {
          changed = true;
          break;
        }
      }
      if (!changed) return state;
      const previous = state;
      state = Object.assign({}, state, next);
      for (const listener of Array.from(listeners)) listener(state, previous);
      return state;
    }

    function subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }

    return { get, set, subscribe };
  }

  HL.createStore = createStore;
})((window.HorizonLab = window.HorizonLab || {}));
