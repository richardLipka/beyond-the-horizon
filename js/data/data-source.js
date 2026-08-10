/**
 * data-source.js - nacitani, kontrola a ukladani datoveho souboru objects.json.
 * Loading, validating and saving the objects.json data file.
 *
 * Poradi zdroju / source priority:
 *   1. uprava ulozena v prohlizeci (localStorage)   - "local"
 *   2. soubor objects.json vedle index.html         - "file"
 *   3. tovarni sada zabudovana v js/data/…          - "factory"
 *
 * Treti zdroj je zaloha pro pripad, kdy se stranka otevre primo z disku
 * (file://) a prohlizec fetch() na lokalni soubor nepovoli.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const STORAGE_KEY = 'horizonlab.data.v1';
  const DATA_FILE = 'objects.json';

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function factory() {
    return clone(HL.FACTORY_DATA);
  }

  /** Doplni chybejici nepovinna pole, aby zbytek aplikace nemusel hlidat. */
  function normalise(data) {
    const out = clone(data);
    out.schemaVersion = out.schemaVersion || 1;
    out.categories = Array.isArray(out.categories) ? out.categories : [];
    out.objects = (Array.isArray(out.objects) ? out.objects : []).map((raw) => ({
      id: String(raw.id),
      category: raw.category || 'other',
      name: raw.name || { cs: raw.id, en: raw.id },
      height: Number(raw.height),
      aspect: Number(raw.aspect) > 0 ? Number(raw.aspect) : 1,
      baseline: raw.baseline === 'sea' ? 'sea' : 'ground',
      defaultDistance: Number(raw.defaultDistance) > 0 ? Number(raw.defaultDistance) : null,
      fact: raw.fact || null,
      image: raw.image || null,
    }));
    return out;
  }

  /**
   * Zkontroluje strukturu dat. Vraci popisy chyb jako {key, params},
   * aby modul nemusel znat jazyk. / Returns translatable error descriptors.
   */
  function validate(data) {
    const errors = [];
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, errors: [{ key: 'err.notObject' }] };
    }
    if (!Array.isArray(data.objects)) {
      return { ok: false, errors: [{ key: 'err.noObjects' }] };
    }
    const seen = new Set();
    data.objects.forEach((item, index) => {
      const validShape =
        item &&
        typeof item === 'object' &&
        item.id &&
        item.name &&
        Number(item.height) > 0;
      if (!validShape) {
        errors.push({ key: 'err.objectShape', params: { i: index + 1 } });
        return;
      }
      if (seen.has(item.id)) errors.push({ key: 'err.duplicateId', params: { id: item.id } });
      seen.add(item.id);
    });
    return { ok: errors.length === 0, errors };
  }

  function parse(text) {
    try {
      return { ok: true, data: JSON.parse(text) };
    } catch (error) {
      return { ok: false, errors: [{ key: 'err.parse', params: { error: error.message } }] };
    }
  }

  function readLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return validate(parsed).ok ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function saveLocal(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearLocal() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignorovat / ignore */
    }
  }

  function hasLocal() {
    return readLocal() !== null;
  }

  /** Nacte data z nejlepsiho dostupneho zdroje. / Loads from the best source. */
  async function load() {
    const local = readLocal();
    if (local) return { data: normalise(local), source: 'local' };

    try {
      const response = await fetch(DATA_FILE, { cache: 'no-cache' });
      if (response.ok) {
        const parsed = await response.json();
        if (validate(parsed).ok) return { data: normalise(parsed), source: 'file' };
      }
    } catch (e) {
      // file:// nebo chybejici soubor - spadneme na tovarni data
    }

    return { data: normalise(factory()), source: 'factory' };
  }

  /** Nabidne stazeni souboru objects.json. */
  function download(data, filename) {
    const text = JSON.stringify(data, null, 2) + '\n';
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || DATA_FILE;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Precte soubor vybrany uzivatelem (File API). */
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error || new Error('read failed'));
      reader.readAsText(file);
    });
  }

  /** Precte obrazek jako data URI (base64) pro ulozeni primo do JSON. */
  function readImageAsDataUri(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error || new Error('read failed'));
      reader.readAsDataURL(file);
    });
  }

  HL.data = {
    STORAGE_KEY,
    DATA_FILE,
    load,
    factory,
    normalise,
    validate,
    parse,
    saveLocal,
    clearLocal,
    hasLocal,
    download,
    readFile,
    readImageAsDataUri,
    clone,
  };
})((window.HorizonLab = window.HorizonLab || {}));
