#!/usr/bin/env node
/**
 * check-strings.mjs - kontroluje, ze vsechny jazyky maji stejnou sadu klicu
 * a ze kazdy objekt v datech ma nazev ve vsech jazycich.
 *
 * Checks that every language defines the same set of keys and that every
 * object in the data file carries a name in each language.
 *
 * Spusteni / Run:  node tools/check-strings.mjs
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */

import { readFile } from 'node:fs/promises';

globalThis.window = {};
const source = await readFile(new URL('../js/i18n/strings.js', import.meta.url), 'utf8');
new Function(source)();
const strings = globalThis.window.HorizonLab.strings;

const languages = Object.keys(strings);
let failures = 0;

function fail(message) {
  failures++;
  console.log('FAIL ' + message);
}

console.log(`Jazyky / languages: ${languages.join(', ')}`);

// --- 1. stejna sada klicu ve vsech jazycich ------------------------------
const reference = languages[0];
const referenceKeys = new Set(Object.keys(strings[reference]));
console.log(`Klicu v "${reference}" / keys in "${reference}": ${referenceKeys.size}`);

for (const language of languages.slice(1)) {
  const keys = new Set(Object.keys(strings[language]));
  for (const key of referenceKeys) {
    if (!keys.has(key)) fail(`"${language}" nema klic / is missing key: ${key}`);
  }
  for (const key of keys) {
    if (!referenceKeys.has(key)) fail(`"${language}" ma klic navic / has an extra key: ${key}`);
  }
}

// --- 2. zadny prazdny preklad --------------------------------------------
for (const language of languages) {
  for (const [key, value] of Object.entries(strings[language])) {
    if (typeof value !== 'string' || value.trim() === '') {
      fail(`"${language}" ma prazdny text / has an empty string: ${key}`);
    }
  }
}

// --- 3. stejne zastupne znacky {takto} v obou jazycich --------------------
const placeholders = (text) => (text.match(/\{(\w+)\}/g) || []).sort().join(',');
for (const language of languages.slice(1)) {
  for (const key of referenceKeys) {
    if (!strings[language][key]) continue;
    const a = placeholders(strings[reference][key]);
    const b = placeholders(strings[language][key]);
    if (a !== b) fail(`ruzne zastupne znacky / placeholder mismatch at ${key}: "${a}" vs "${b}"`);
  }
}

// --- 4. datovy soubor ma nazvy ve vsech jazycich --------------------------
const data = JSON.parse(await readFile(new URL('../objects.json', import.meta.url), 'utf8'));
console.log(`Objektu v datech / objects in the data file: ${data.objects.length}`);

for (const item of data.objects) {
  for (const language of languages) {
    if (!item.name || !item.name[language]) {
      fail(`objekt "${item.id}" nema nazev v "${language}" / has no name in "${language}"`);
    }
    if (item.fact && !item.fact[language]) {
      fail(`objekt "${item.id}" nema zajimavost v "${language}" / has no fact in "${language}"`);
    }
  }
  if (!item.image) fail(`objekt "${item.id}" nema obrazek / has no image`);
}

for (const category of data.categories || []) {
  for (const language of languages) {
    if (!category.name || !category.name[language]) {
      fail(`kategorie "${category.id}" nema nazev v "${language}" / has no name in "${language}"`);
    }
  }
}

console.log(
  failures === 0 ? '\nVsechny kontroly prosly / all checks passed' : `\n${failures} chyb / failures`
);
process.exit(failures === 0 ? 0 : 1);
