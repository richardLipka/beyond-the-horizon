/**
 * factory-objects.js - AUTOMATICKY GENEROVANO / AUTO-GENERATED
 * Needitovat rucne. Zdroj: tools/objects.source.json + tools/svg/*.svg
 * Do not edit by hand. Regenerate with:  node tools/build-objects.mjs
 *
 * Tato kopie slouzi jako tovarni zaloha, kdyz aplikace bezi z file://
 * a prohlizec nedovoli nacist objects.json pres fetch().
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
window.HorizonLab = window.HorizonLab || {};
window.HorizonLab.FACTORY_DATA = {
  "schemaVersion": 1,
  "meta": {
    "name": {
      "cs": "Výchozí sada objektů",
      "en": "Default object set"
    },
    "license": "MIT",
    "copyright": "(c) 2026 Richard Lipka <lipka@fav.zcu.cz>"
  },
  "categories": [
    {
      "id": "people",
      "icon": "🧍",
      "name": {
        "cs": "Lidé a domy",
        "en": "People & houses"
      }
    },
    {
      "id": "ships",
      "icon": "⛵",
      "name": {
        "cs": "Lodě",
        "en": "Ships"
      }
    },
    {
      "id": "buildings",
      "icon": "🏗️",
      "name": {
        "cs": "Stavby a věže",
        "en": "Towers & buildings"
      }
    },
    {
      "id": "rockets",
      "icon": "🚀",
      "name": {
        "cs": "Rakety",
        "en": "Rockets"
      }
    },
    {
      "id": "mountains",
      "icon": "⛰️",
      "name": {
        "cs": "Hory",
        "en": "Mountains"
      }
    }
  ],
  "objects": [
    {
      "id": "person",
      "category": "people",
      "name": {
        "cs": "Člověk",
        "en": "A person"
      },
      "height": 1.75,
      "baseline": "ground",
      "defaultDistance": 4000,
      "fact": {
        "cs": "Kamarád na pláži zmizí za obzorem už po několika kilometrech. Zkus si to!",
        "en": "A friend on the beach vanishes over the horizon after just a few kilometres. Try it!"
      },
      "aspect": 0.4,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAxMDAiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTIiIHI9IjkiIGZpbGw9IiMxNDQyNWMiLz48cmVjdCB4PSIxMS41IiB5PSIyMyIgd2lkdGg9IjE3IiBoZWlnaHQ9IjM0IiByeD0iNiIgZmlsbD0iIzFmN2E4YyIvPjxyZWN0IHg9IjQiIHk9IjI2IiB3aWR0aD0iNyIgaGVpZ2h0PSIyNSIgcng9IjMuNSIgZmlsbD0iIzE0NDI1YyIvPjxyZWN0IHg9IjI5IiB5PSIyNiIgd2lkdGg9IjciIGhlaWdodD0iMjUiIHJ4PSIzLjUiIGZpbGw9IiMxNDQyNWMiLz48cmVjdCB4PSIxMi41IiB5PSI1NCIgd2lkdGg9IjciIGhlaWdodD0iNDYiIHJ4PSIzLjIiIGZpbGw9IiMxNDQyNWMiLz48cmVjdCB4PSIyMC41IiB5PSI1NCIgd2lkdGg9IjciIGhlaWdodD0iNDYiIHJ4PSIzLjIiIGZpbGw9IiMxNDQyNWMiLz48L3N2Zz4="
    },
    {
      "id": "house",
      "category": "people",
      "name": {
        "cs": "Rodinný dům",
        "en": "Family house"
      },
      "height": 8,
      "baseline": "ground",
      "defaultDistance": 10000,
      "fact": {
        "cs": "Obyčejný dům s komínem má asi 8 metrů – jako čtyři dospělí na sobě.",
        "en": "An ordinary house with a chimney is about 8 metres – like four grown-ups standing on each other."
      },
      "aspect": 1.4,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDAgMTAwIj48cmVjdCB4PSIyMCIgeT0iNDQiIHdpZHRoPSIxMDAiIGhlaWdodD0iNTYiIGZpbGw9IiNmNGVhZDYiLz48cmVjdCB4PSI5OCIgeT0iMTIiIHdpZHRoPSIxNCIgaGVpZ2h0PSIyOCIgZmlsbD0iIzdkOGVhMyIvPjxwYXRoIGQ9Ik03MCAyIDEzNiA0OCA0IDQ4WiIgZmlsbD0iI2UyNzI1YiIvPjxyZWN0IHg9IjM0IiB5PSI1OCIgd2lkdGg9IjI2IiBoZWlnaHQ9IjIyIiByeD0iMiIgZmlsbD0iIzUyYjdjOSIvPjxyZWN0IHg9IjgwIiB5PSI1OCIgd2lkdGg9IjI2IiBoZWlnaHQ9IjIyIiByeD0iMiIgZmlsbD0iIzUyYjdjOSIvPjxyZWN0IHg9IjYwIiB5PSI3NCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjI2IiByeD0iMiIgZmlsbD0iIzE0NDI1YyIvPjwvc3ZnPg=="
    },
    {
      "id": "sailboat",
      "category": "ships",
      "name": {
        "cs": "Plachetnice",
        "en": "Sailing boat"
      },
      "height": 30,
      "baseline": "sea",
      "defaultDistance": 22000,
      "fact": {
        "cs": "Námořníci už ve starověku věděli, že loď mizí od trupu a naposled je vidět špička stěžně.",
        "en": "Ancient sailors already knew a ship disappears hull first – the mast tip is the last thing you see."
      },
      "aspect": 1,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSI0NyIgeT0iMiIgd2lkdGg9IjQiIGhlaWdodD0iODAiIHJ4PSIyIiBmaWxsPSIjOGE2YTRhIi8+PHBhdGggZD0iTTQ1IDggNDUgNzYgOSA3NloiIGZpbGw9IiNmN2YyZTYiLz48cGF0aCBkPSJNNTMgMjIgNTMgNzYgODYgNzZaIiBmaWxsPSIjZTRlZGYyIi8+PHJlY3QgeD0iNSIgeT0iNzYiIHdpZHRoPSI5MCIgaGVpZ2h0PSI2IiByeD0iMi41IiBmaWxsPSIjMWY3YThjIi8+PHBhdGggZD0iTTUgODJoOTBsLTEzIDE4SDE4WiIgZmlsbD0iIzE0NDI1YyIvPjwvc3ZnPg=="
    },
    {
      "id": "lighthouse",
      "category": "ships",
      "name": {
        "cs": "Maják",
        "en": "Lighthouse"
      },
      "height": 40,
      "baseline": "sea",
      "defaultDistance": 30000,
      "fact": {
        "cs": "Majáky se stavějí vysoké schválně – čím výš, tím dál je jejich světlo vidět přes zakřivení.",
        "en": "Lighthouses are built tall on purpose – the higher the lamp, the further its light reaches over the curve."
      },
      "aspect": 0.5,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPjxjbGlwUGF0aCBpZD0ibGhUb3dlciI+PHBhdGggZD0iTTE4IDI0aDE0bDUgNjZIMTNaIi8+PC9jbGlwUGF0aD48cGF0aCBkPSJNMTggMjRoMTRsNSA2NkgxM1oiIGZpbGw9IiNmN2YyZTYiLz48ZyBjbGlwLXBhdGg9InVybCgjbGhUb3dlcikiIGZpbGw9IiNlMjcyNWIiPjxyZWN0IHg9IjEwIiB5PSIzOCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjEyIi8+PHJlY3QgeD0iMTAiIHk9IjYyIiB3aWR0aD0iMzAiIGhlaWdodD0iMTIiLz48L2c+PHJlY3QgeD0iMTIiIHk9IjIwIiB3aWR0aD0iMjYiIGhlaWdodD0iNSIgcng9IjIiIGZpbGw9IiMxNDQyNWMiLz48cmVjdCB4PSIxNiIgeT0iMTAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YyYjU0NCIvPjxwYXRoIGQ9Ik0xMyAxMCAyNSAxIDM3IDEwWiIgZmlsbD0iIzE0NDI1YyIvPjxyZWN0IHg9IjciIHk9IjkwIiB3aWR0aD0iMzYiIGhlaWdodD0iMTAiIHJ4PSIyIiBmaWxsPSIjN2Q4ZWEzIi8+PC9zdmc+"
    },
    {
      "id": "titanic",
      "category": "ships",
      "name": {
        "cs": "Titanic",
        "en": "Titanic"
      },
      "height": 53,
      "baseline": "sea",
      "defaultDistance": 35000,
      "fact": {
        "cs": "Od hladiny ke špičce komínů měl Titanic asi 53 metrů. Byl dlouhý 269 metrů!",
        "en": "From the waterline to the funnel tops the Titanic was about 53 metres. She was 269 metres long!"
      },
      "aspect": 3.6,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMTAwIj48cmVjdCB4PSI0NCIgeT0iMCIgd2lkdGg9IjMiIGhlaWdodD0iNzQiIGZpbGw9IiMzZDRhNTUiLz48cmVjdCB4PSIzMTYiIHk9IjYiIHdpZHRoPSIzIiBoZWlnaHQ9IjY4IiBmaWxsPSIjM2Q0YTU1Ii8+PHJlY3QgeD0iNTgiIHk9IjU0IiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjdmMmU2Ii8+PGcgZmlsbD0iI2U4YjA0YiI+PHJlY3QgeD0iMTA0IiB5PSIxMiIgd2lkdGg9IjI2IiBoZWlnaHQ9IjQ0IiByeD0iMyIvPjxyZWN0IHg9IjE1MiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSI0NCIgcng9IjMiLz48cmVjdCB4PSIyMDAiIHk9IjEyIiB3aWR0aD0iMjYiIGhlaWdodD0iNDQiIHJ4PSIzIi8+PHJlY3QgeD0iMjQ4IiB5PSIxMiIgd2lkdGg9IjI2IiBoZWlnaHQ9IjQ0IiByeD0iMyIvPjwvZz48ZyBmaWxsPSIjMTQ0MjVjIj48cmVjdCB4PSIxMDQiIHk9IjEyIiB3aWR0aD0iMjYiIGhlaWdodD0iOSIgcng9IjMiLz48cmVjdCB4PSIxNTIiIHk9IjEyIiB3aWR0aD0iMjYiIGhlaWdodD0iOSIgcng9IjMiLz48cmVjdCB4PSIyMDAiIHk9IjEyIiB3aWR0aD0iMjYiIGhlaWdodD0iOSIgcng9IjMiLz48cmVjdCB4PSIyNDgiIHk9IjEyIiB3aWR0aD0iMjYiIGhlaWdodD0iOSIgcng9IjMiLz48L2c+PHJlY3QgeD0iMTQiIHk9Ijc0IiB3aWR0aD0iMzMyIiBoZWlnaHQ9IjciIGZpbGw9IiNmN2YyZTYiLz48cGF0aCBkPSJNMTQgODFoMzMybC0yNiAxOUg0MFoiIGZpbGw9IiMxNDQyNWMiLz48ZyBmaWxsPSIjNTJiN2M5Ij48cmVjdCB4PSI3MCIgeT0iNjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjgiLz48cmVjdCB4PSI4OCIgeT0iNjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjgiLz48cmVjdCB4PSIxMDYiIHk9IjYwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4Ii8+PHJlY3QgeD0iMTI0IiB5PSI2MCIgd2lkdGg9IjkiIGhlaWdodD0iOCIvPjxyZWN0IHg9IjE0MiIgeT0iNjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjgiLz48cmVjdCB4PSIxNjAiIHk9IjYwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4Ii8+PHJlY3QgeD0iMTc4IiB5PSI2MCIgd2lkdGg9IjkiIGhlaWdodD0iOCIvPjxyZWN0IHg9IjE5NiIgeT0iNjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjgiLz48cmVjdCB4PSIyMTQiIHk9IjYwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4Ii8+PHJlY3QgeD0iMjMyIiB5PSI2MCIgd2lkdGg9IjkiIGhlaWdodD0iOCIvPjxyZWN0IHg9IjI1MCIgeT0iNjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjgiLz48cmVjdCB4PSIyNjgiIHk9IjYwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4Ii8+PHJlY3QgeD0iMjg2IiB5PSI2MCIgd2lkdGg9IjkiIGhlaWdodD0iOCIvPjwvZz48L3N2Zz4="
    },
    {
      "id": "containership",
      "category": "ships",
      "name": {
        "cs": "Kontejnerová loď",
        "en": "Container ship"
      },
      "height": 60,
      "baseline": "sea",
      "defaultDistance": 40000,
      "fact": {
        "cs": "Největší kontejnerové lodě uvezou přes 20 000 kontejnerů. S naskládaným nákladem čnějí přes 60 metrů nad hladinu.",
        "en": "The biggest container ships carry over 20,000 containers and stand more than 60 metres above the water."
      },
      "aspect": 3.2,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMTAwIj48Zz48cmVjdCB4PSIzMCIgeT0iMzQiIHdpZHRoPSIzNCIgaGVpZ2h0PSIxOCIgZmlsbD0iI2UyNzI1YiIvPjxyZWN0IHg9IjY4IiB5PSIzNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjZjJiNTQ0Ii8+PHJlY3QgeD0iMTA2IiB5PSIzNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjNTJiN2M5Ii8+PHJlY3QgeD0iMTQ0IiB5PSIzNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjZTI3MjViIi8+PHJlY3QgeD0iMTgyIiB5PSIzNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjN2ZiZjZhIi8+PHJlY3QgeD0iMzAiIHk9IjU0IiB3aWR0aD0iMzQiIGhlaWdodD0iMTgiIGZpbGw9IiM1MmI3YzkiLz48cmVjdCB4PSI2OCIgeT0iNTQiIHdpZHRoPSIzNCIgaGVpZ2h0PSIxOCIgZmlsbD0iI2UyNzI1YiIvPjxyZWN0IHg9IjEwNiIgeT0iNTQiIHdpZHRoPSIzNCIgaGVpZ2h0PSIxOCIgZmlsbD0iI2YyYjU0NCIvPjxyZWN0IHg9IjE0NCIgeT0iNTQiIHdpZHRoPSIzNCIgaGVpZ2h0PSIxOCIgZmlsbD0iIzUyYjdjOSIvPjxyZWN0IHg9IjE4MiIgeT0iNTQiIHdpZHRoPSIzNCIgaGVpZ2h0PSIxOCIgZmlsbD0iI2UyNzI1YiIvPjxyZWN0IHg9IjY4IiB5PSIxNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjN2ZiZjZhIi8+PHJlY3QgeD0iMTA2IiB5PSIxNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjZTI3MjViIi8+PHJlY3QgeD0iMTQ0IiB5PSIxNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjZjJiNTQ0Ii8+PC9nPjxyZWN0IHg9IjIzNiIgeT0iMjYiIHdpZHRoPSI0NiIgaGVpZ2h0PSI0NiIgZmlsbD0iI2Y3ZjJlNiIvPjxyZWN0IHg9IjI1MiIgeT0iMiIgd2lkdGg9IjE0IiBoZWlnaHQ9IjI2IiBmaWxsPSIjZTI3MjViIi8+PGcgZmlsbD0iIzE0NDI1YyI+PHJlY3QgeD0iMjQyIiB5PSIzNCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjciLz48cmVjdCB4PSIyNDIiIHk9IjQ2IiB3aWR0aD0iMzQiIGhlaWdodD0iNyIvPjxyZWN0IHg9IjI0MiIgeT0iNTgiIHdpZHRoPSIzNCIgaGVpZ2h0PSI3Ii8+PC9nPjxyZWN0IHg9IjEyIiB5PSI3MiIgd2lkdGg9IjI5NiIgaGVpZ2h0PSI4IiBmaWxsPSIjM2Q0YTU1Ii8+PHBhdGggZD0iTTEyIDgwaDI5NmwtMjIgMjBIMzRaIiBmaWxsPSIjMTQ0MjVjIi8+PC9zdmc+"
    },
    {
      "id": "petrin",
      "category": "buildings",
      "name": {
        "cs": "Petřínská rozhledna",
        "en": "Petřín Lookout Tower"
      },
      "height": 63.5,
      "baseline": "ground",
      "defaultDistance": 35000,
      "fact": {
        "cs": "Petřínská rozhledna v Praze je menší sestra Eiffelovky – měří 63,5 m a stojí na kopci.",
        "en": "Prague’s Petřín tower is the Eiffel Tower’s little sister – 63.5 m tall, standing on a hill."
      },
      "aspect": 0.5,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPjxjbGlwUGF0aCBpZD0icHRTaGFwZSI+PHBhdGggZD0iTTUgMTAwIDE3IDI0aDE2bDEyIDc2WiIvPjwvY2xpcFBhdGg+PGcgY2xpcC1wYXRoPSJ1cmwoI3B0U2hhcGUpIiBzdHJva2U9IiMyYjZkOGMiIHN0cm9rZS13aWR0aD0iMS44IiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCAyNiA1MCA0ME01MCAyNiAwIDQwTTAgNDAgNTAgNTRNNTAgNDAgMCA1NE0wIDU0IDUwIDY4TTUwIDU0IDAgNjhNMCA2OCA1MCA4Mk01MCA2OCAwIDgyTTAgODIgNTAgOTZNNTAgODIgMCA5NiIvPjxwYXRoIGQ9Ik0wIDQwaDUwTTAgNTRoNTBNMCA2OGg1ME0wIDgyaDUwTTAgOTZoNTAiIHN0cm9rZS13aWR0aD0iMS40Ii8+PC9nPjxwYXRoIGQ9Ik01IDEwMCAxNyAyNGgxNmwxMiA3NloiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE0NDI1YyIgc3Ryb2tlLXdpZHRoPSIzIi8+PHJlY3QgeD0iOSIgeT0iMTgiIHdpZHRoPSIzMiIgaGVpZ2h0PSI2IiByeD0iMS41IiBmaWxsPSIjMTQ0MjVjIi8+PHJlY3QgeD0iMTYiIHk9IjEwIiB3aWR0aD0iMTgiIGhlaWdodD0iOCIgZmlsbD0iI2Y3ZjJlNiIvPjxwYXRoIGQ9Ik0xNCAxMCAyNSAzIDM2IDEwWiIgZmlsbD0iI2UyNzI1YiIvPjxyZWN0IHg9IjI0IiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMTQ0MjVjIi8+PC9zdmc+"
    },
    {
      "id": "liberty",
      "category": "buildings",
      "name": {
        "cs": "Socha Svobody",
        "en": "Statue of Liberty"
      },
      "height": 93,
      "baseline": "ground",
      "defaultDistance": 45000,
      "fact": {
        "cs": "I s podstavcem měří 93 metrů. Samotná socha má 46 metrů od pat k pochodni.",
        "en": "With its pedestal it reaches 93 metres. The statue alone is 46 metres from heel to torch."
      },
      "aspect": 0.45,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSAxMDAiPjxwYXRoIGQ9Ik00IDEwMCA4IDk0aDI5bDQgNloiIGZpbGw9IiM3ZDhlYTMiLz48cmVjdCB4PSI5IiB5PSI2NiIgd2lkdGg9IjI3IiBoZWlnaHQ9IjI4IiBmaWxsPSIjOWFhN2IzIi8+PHJlY3QgeD0iMTIiIHk9IjYwIiB3aWR0aD0iMjEiIGhlaWdodD0iNiIgZmlsbD0iIzg0OTNhMSIvPjxwYXRoIGQ9Ik0xNyA2NiAxOSA0MGg4bDIgMjZaIiBmaWxsPSIjNmZiOWE4Ii8+PHBhdGggZD0iTTE0IDY2cTggNCAxNyAwbC0xIDRIMTVaIiBmaWxsPSIjNWZhOTk3Ii8+PGNpcmNsZSBjeD0iMjMiIGN5PSIzMyIgcj0iNS40IiBmaWxsPSIjNmZiOWE4Ii8+PGcgc3Ryb2tlPSIjNmZiOWE4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48cGF0aCBkPSJNMjMgMjZ2LTRNMTggMjhsLTItM00yOCAyOGwyLTNNMTUgMzJsLTQtMU0zMSAzMmw0LTEiLz48L2c+PHBhdGggZD0iTTI3IDQwIDM0IDIyIiBzdHJva2U9IiM2ZmI5YTgiIHN0cm9rZS13aWR0aD0iMy42IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTkgNDIgMTQgNTQiIHN0cm9rZT0iIzZmYjlhOCIgc3Ryb2tlLXdpZHRoPSIzLjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsbD0ibm9uZSIvPjxyZWN0IHg9IjMyLjQiIHk9IjEyIiB3aWR0aD0iNCIgaGVpZ2h0PSIxMSIgcng9IjEiIGZpbGw9IiM4ZWNmYzAiLz48cGF0aCBkPSJNMzQuNCAwcTUgNiAyLjYgMTAtMi42IDMtMi42IDN0MC0zUTMyIDYgMzQuNCAwWiIgZmlsbD0iI2YyYjU0NCIvPjwvc3ZnPg=="
    },
    {
      "id": "jested",
      "category": "buildings",
      "name": {
        "cs": "Vysílač Ještěd",
        "en": "Ještěd Tower"
      },
      "height": 94,
      "baseline": "ground",
      "defaultDistance": 48000,
      "fact": {
        "cs": "Ještěd je hotel i vysílač zároveň. Jeho tvar plynule pokračuje ve tvaru hory pod ním.",
        "en": "Ještěd is a hotel and a TV transmitter in one. Its shape smoothly continues the mountain beneath it."
      },
      "aspect": 0.7,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MCAxMDAiPjxwYXRoIGQ9Ik04IDEwMEMxNSA2NCAyNyA0NiAzMCAyMGgxMGMzIDI2IDE1IDQ0IDIyIDgwWiIgZmlsbD0iI2RmZThlZSIvPjxwYXRoIGQ9Ik04IDEwMEMxNSA2NCAyNyA0NiAzMCAyMGg0Yy0zIDI2LTEzIDQ0LTE4IDgwWiIgZmlsbD0iI2MzZDNkZSIvPjxyZWN0IHg9IjIyIiB5PSI0NiIgd2lkdGg9IjI2IiBoZWlnaHQ9IjYiIGZpbGw9IiM3ZDhlYTMiLz48ZyBmaWxsPSIjNTJiN2M5Ij48cmVjdCB4PSIyNiIgeT0iNTQiIHdpZHRoPSIxOCIgaGVpZ2h0PSI2IiByeD0iMSIvPjxyZWN0IHg9IjI0IiB5PSI2NiIgd2lkdGg9IjIyIiBoZWlnaHQ9IjYiIHJ4PSIxIi8+PC9nPjxyZWN0IHg9IjMwIiB5PSI4IiB3aWR0aD0iMTAiIGhlaWdodD0iMTQiIHJ4PSIyIiBmaWxsPSIjOWFhN2IzIi8+PHJlY3QgeD0iMzMuNiIgeT0iMCIgd2lkdGg9IjIuOCIgaGVpZ2h0PSI5IiBmaWxsPSIjMTQ0MjVjIi8+PHJlY3QgeD0iNCIgeT0iOTYiIHdpZHRoPSI2MiIgaGVpZ2h0PSI0IiByeD0iMS41IiBmaWxsPSIjN2Q4ZWEzIi8+PC9zdmc+"
    },
    {
      "id": "pilsen",
      "category": "buildings",
      "name": {
        "cs": "Katedrála sv. Bartoloměje (Plzeň)",
        "en": "St Bartholomew's Cathedral (Pilsen)"
      },
      "height": 102.3,
      "baseline": "ground",
      "defaultDistance": 50000,
      "fact": {
        "cs": "S výškou 102,3 m je to nejvyšší kostelní věž v Česku. Nahoru vede 301 schodů.",
        "en": "At 102.3 m this is the tallest church tower in Czechia. 301 steps lead to the top."
      },
      "aspect": 0.6,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAxMDAiPjxyZWN0IHg9IjEzIiB5PSI3OSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjIxIiBmaWxsPSIjZWZlNGNkIi8+PHBhdGggZD0iTTExIDc5IDM1LjUgNjQgMzUuNSA3OVoiIGZpbGw9IiM0ZTljNzgiLz48cGF0aCBkPSJNMzUuNSA2NCA2MCA3OSAzNS41IDc5WiIgZmlsbD0iIzNkODA2MiIvPjxnIGZpbGw9IiNlMmQ1YmEiPjxyZWN0IHg9IjI3IiB5PSI4MCIgd2lkdGg9IjIuNCIgaGVpZ2h0PSIyMCIvPjxyZWN0IHg9IjM4IiB5PSI4MCIgd2lkdGg9IjIuNCIgaGVpZ2h0PSIyMCIvPjxyZWN0IHg9IjQ5IiB5PSI4MCIgd2lkdGg9IjIuNCIgaGVpZ2h0PSIyMCIvPjwvZz48Y2lyY2xlIGN4PSIzNS41IiBjeT0iODUuNSIgcj0iMy4yIiBmaWxsPSIjZjJiNTQ0Ii8+PGNpcmNsZSBjeD0iMzUuNSIgY3k9Ijg1LjUiIHI9IjEuNSIgZmlsbD0iIzJiNmQ4YyIvPjxnIGZpbGw9IiMyYjZkOGMiPjxyZWN0IHg9IjMxLjQiIHk9Ijg5IiB3aWR0aD0iNC4yIiBoZWlnaHQ9IjExIiByeD0iMi4xIi8+PHJlY3QgeD0iNDIuNCIgeT0iODkiIHdpZHRoPSI0LjIiIGhlaWdodD0iMTEiIHJ4PSIyLjEiLz48cmVjdCB4PSI1My40IiB5PSI4OSIgd2lkdGg9IjQuMiIgaGVpZ2h0PSIxMSIgcng9IjIuMSIvPjwvZz48cmVjdCB4PSI2IiB5PSI1NiIgd2lkdGg9IjE0IiBoZWlnaHQ9IjQ0IiBmaWxsPSIjZjdlZmRkIi8+PGcgZmlsbD0iI2U2ZDliZCI+PHJlY3QgeD0iNiIgeT0iNTYiIHdpZHRoPSIyLjIiIGhlaWdodD0iNDQiLz48cmVjdCB4PSIxNy44IiB5PSI1NiIgd2lkdGg9IjIuMiIgaGVpZ2h0PSI0NCIvPjwvZz48cGF0aCBkPSJNMTMgNSA0LjggNTUgMTMgNTVaIiBmaWxsPSIjNGU5Yzc4Ii8+PHBhdGggZD0iTTEzIDUgMjEuMiA1NSAxMyA1NVoiIGZpbGw9IiMzZDgwNjIiLz48cmVjdCB4PSI0LjIiIHk9IjU0LjQiIHdpZHRoPSIxNy42IiBoZWlnaHQ9IjMiIGZpbGw9IiNkOGM5YTgiLz48cmVjdCB4PSI0LjIiIHk9IjU0LjQiIHdpZHRoPSIxNy42IiBoZWlnaHQ9IjEiIGZpbGw9IiNjNGIxOGMiLz48cmVjdCB4PSIxMi4zIiB5PSIwIiB3aWR0aD0iMS40IiBoZWlnaHQ9IjgiIGZpbGw9IiMxNDQyNWMiLz48cmVjdCB4PSIxMC40IiB5PSIyLjIiIHdpZHRoPSI1LjIiIGhlaWdodD0iMS40IiBmaWxsPSIjMTQ0MjVjIi8+PGNpcmNsZSBjeD0iMTMiIGN5PSI2NCIgcj0iMy44IiBmaWxsPSIjZjJiNTQ0Ii8+PHBhdGggZD0iTTEzIDYxLjJ2Mi45bDIgMS4zIiBzdHJva2U9IiMxNDQyNWMiIHN0cm9rZS13aWR0aD0iMC45IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cmVjdCB4PSIxMC42IiB5PSI3MyIgd2lkdGg9IjQuOCIgaGVpZ2h0PSIxMiIgcng9IjIuNCIgZmlsbD0iIzJiNmQ4YyIvPjxyZWN0IHg9IjkiIHk9Ijg4IiB3aWR0aD0iOCIgaGVpZ2h0PSIxMiIgcng9IjQiIGZpbGw9IiMxNDQyNWMiLz48L3N2Zz4="
    },
    {
      "id": "saturn5",
      "category": "rockets",
      "name": {
        "cs": "Raketa Saturn V",
        "en": "Saturn V rocket"
      },
      "height": 110.6,
      "baseline": "ground",
      "defaultDistance": 52000,
      "fact": {
        "cs": "Raketa, která vozila lidi na Měsíc. Se 110,6 m je vyšší než nejvyšší kostelní věž v Česku.",
        "en": "The rocket that carried people to the Moon. At 110.6 m it stands taller than the tallest church tower in Czechia."
      },
      "aspect": 0.18,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOCAxMDAiPjxyZWN0IHg9IjguNSIgeT0iMSIgd2lkdGg9IjEiIGhlaWdodD0iNyIgZmlsbD0iIzU3NjQ2ZiIvPjxwYXRoIGQ9Ik05IDYgMTEgMTRIN1oiIGZpbGw9IiM1NzY0NmYiLz48cGF0aCBkPSJNOSAxMyAxMiAyM0g2WiIgZmlsbD0iI2YxZjVmOCIvPjxyZWN0IHg9IjYiIHk9IjIyIiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iI2YxZjVmOCIvPjxyZWN0IHg9IjYiIHk9IjMxIiB3aWR0aD0iNiIgaGVpZ2h0PSIzLjQiIGZpbGw9IiMzMzQxNGMiLz48cGF0aCBkPSJNNSA0MCA2IDM0aDZsMSA2WiIgZmlsbD0iI2YxZjVmOCIvPjxyZWN0IHg9IjUiIHk9IjM5IiB3aWR0aD0iOCIgaGVpZ2h0PSIyMiIgZmlsbD0iI2YxZjVmOCIvPjxyZWN0IHg9IjUiIHk9IjQzLjUiIHdpZHRoPSI4IiBoZWlnaHQ9IjMuNiIgZmlsbD0iI2M4NTQzZiIvPjxyZWN0IHg9IjUiIHk9IjU4IiB3aWR0aD0iOCIgaGVpZ2h0PSIzLjQiIGZpbGw9IiMzMzQxNGMiLz48cGF0aCBkPSJNNCA2OCA1IDYxaDhsMSA3WiIgZmlsbD0iI2YxZjVmOCIvPjxyZWN0IHg9IjQiIHk9IjY3IiB3aWR0aD0iMTAiIGhlaWdodD0iMjkiIGZpbGw9IiNmMWY1ZjgiLz48cmVjdCB4PSI0IiB5PSI3MSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjUiIGZpbGw9IiMzMzQxNGMiLz48cmVjdCB4PSI0IiB5PSI4NiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjQuNCIgZmlsbD0iIzMzNDE0YyIvPjxwYXRoIGQ9Ik00IDg3IDAuNCAxMDBINFoiIGZpbGw9IiMzMzQxNGMiLz48cGF0aCBkPSJNMTQgODcgMTcuNiAxMDBIMTRaIiBmaWxsPSIjMzM0MTRjIi8+PHJlY3QgeD0iNC42IiB5PSI5NSIgd2lkdGg9IjguOCIgaGVpZ2h0PSI1IiByeD0iMSIgZmlsbD0iIzdkOGVhMyIvPjwvc3ZnPg=="
    },
    {
      "id": "starship",
      "category": "rockets",
      "name": {
        "cs": "Starship se Super Heavy",
        "en": "Starship with Super Heavy"
      },
      "height": 121,
      "baseline": "ground",
      "defaultDistance": 54000,
      "fact": {
        "cs": "Celá sestava Super Heavy + Starship měří 121 m – zatím nejvyšší raketa, jaká kdy odstartovala. Falcon Heavy je jiná, menší raketa SpaceX (70 m).",
        "en": "The full Super Heavy + Starship stack is 121 m – the tallest rocket ever to fly. Falcon Heavy is a different, smaller SpaceX rocket (70 m)."
      },
      "aspect": 0.16,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxMDAiPjxwYXRoIGQ9Ik00LjQgOC41IDAuOCAxNXY2LjVsMy42LTNaIiBmaWxsPSIjYTliNmMxIi8+PHBhdGggZD0iTTExLjYgOC41IDE1LjIgMTV2Ni41bC0zLjYtM1oiIGZpbGw9IiNhOWI2YzEiLz48cGF0aCBkPSJNNC40IDI5IDAuNCAzNS41djYuNWw0LTNaIiBmaWxsPSIjOTdhNmIxIi8+PHBhdGggZD0iTTExLjYgMjkgMTUuNiAzNS41djYuNWwtNC0zWiIgZmlsbD0iIzk3YTZiMSIvPjxwYXRoIGQ9Ik04IDBxMy42IDcuNiAzLjYgMTVINC40UTQuNCA3LjYgOCAwWiIgZmlsbD0iI2U4ZWVmMyIvPjxyZWN0IHg9IjQuNCIgeT0iMTQiIHdpZHRoPSI3LjIiIGhlaWdodD0iMjQiIGZpbGw9IiNkYWUyZTkiLz48cmVjdCB4PSI0LjQiIHk9IjM3IiB3aWR0aD0iNy4yIiBoZWlnaHQ9IjMuMiIgZmlsbD0iIzMzNDE0YyIvPjxyZWN0IHg9IjMuOCIgeT0iNDAiIHdpZHRoPSI4LjQiIGhlaWdodD0iNTYiIGZpbGw9IiNlOGVlZjMiLz48cGF0aCBkPSJNMy44IDQ1LjUgMS4yIDQzLjZ2NS42bDIuNi0xLjdaIiBmaWxsPSIjOGI5YWE1Ii8+PHBhdGggZD0iTTEyLjIgNDUuNSAxNC44IDQzLjZ2NS42bC0yLjYtMS43WiIgZmlsbD0iIzhiOWFhNSIvPjxyZWN0IHg9IjMuOCIgeT0iOTIiIHdpZHRoPSI4LjQiIGhlaWdodD0iMy40IiBmaWxsPSIjMzM0MTRjIi8+PHBhdGggZD0iTTQuMiA5NWg3LjZsMS43IDVIMi41WiIgZmlsbD0iIzViNjg3NCIvPjwvc3ZnPg=="
    },
    {
      "id": "pyramid",
      "category": "buildings",
      "name": {
        "cs": "Velká pyramida v Gíze",
        "en": "Great Pyramid of Giza"
      },
      "height": 138.5,
      "baseline": "ground",
      "defaultDistance": 58000,
      "fact": {
        "cs": "Dnes měří 138,5 m, původně 146,6 m – špička a hladký obklad se ztratily. Přes 3800 let byla nejvyšší stavbou světa.",
        "en": "Today it is 138.5 m tall, originally 146.6 m – the tip and the smooth casing are gone. For over 3,800 years it was the tallest building in the world."
      },
      "aspect": 1.66,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjYgMTAwIj48cGF0aCBkPSJNODMgMCAxNjYgMTAwSDgzWiIgZmlsbD0iI2MzYTA2NSIvPjxwYXRoIGQ9Ik04MyAwIDAgMTAwaDgzWiIgZmlsbD0iI2UyYzc4YyIvPjxnIHN0cm9rZT0iI2E4ODczZiIgc3Ryb2tlLXdpZHRoPSIwLjkiIG9wYWNpdHk9IjAuNDUiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik02NiAyMGgzNE01MCA0MGg2Nk0zMyA2MGgxMDBNMTcgODBoMTMyIi8+PC9nPjxwYXRoIGQ9Ik04MyAwIDkxIDEwSDc1WiIgZmlsbD0iI2YwZGZiMiIvPjxwYXRoIGQ9Ik0wIDEwMGgxNjYiIHN0cm9rZT0iI2E4ODczZiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4="
    },
    {
      "id": "windturbine",
      "category": "buildings",
      "name": {
        "cs": "Větrná elektrárna",
        "en": "Wind turbine"
      },
      "height": 150,
      "baseline": "ground",
      "defaultDistance": 60000,
      "fact": {
        "cs": "Měří se ke špičce vrtule, když míří vzhůru. Proto jsou větrné elektrárny vidět hodně zdaleka.",
        "en": "We measure to the blade tip pointing up. That is why wind turbines are visible from far away."
      },
      "aspect": 0.55,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NSAxMDAiPjxwYXRoIGQ9Ik0yMy42IDEwMGg3LjhsLTEuOS02OGgtNFoiIGZpbGw9IiNlZWY0ZjgiIHN0cm9rZT0iI2MzZDBkYSIgc3Ryb2tlLXdpZHRoPSIwLjciLz48ZyBmaWxsPSIjZjhmYmZkIiBzdHJva2U9IiNiOWM4ZDQiIHN0cm9rZS13aWR0aD0iMC44Ij48cGF0aCBkPSJNMjcuNSAzMFEzMSAxNiAyOC45IDJRMjYgMTYgMjcuNSAzMFoiLz48cGF0aCBkPSJNMjcuNSAzMFEzMSAxNiAyOC45IDJRMjYgMTYgMjcuNSAzMFoiIHRyYW5zZm9ybT0icm90YXRlKDEyMCAyNy41IDMwKSIvPjxwYXRoIGQ9Ik0yNy41IDMwUTMxIDE2IDI4LjkgMlEyNiAxNiAyNy41IDMwWiIgdHJhbnNmb3JtPSJyb3RhdGUoMjQwIDI3LjUgMzApIi8+PC9nPjxyZWN0IHg9IjI2IiB5PSIyNyIgd2lkdGg9IjkiIGhlaWdodD0iNiIgcng9IjIuNSIgZmlsbD0iI2NkZDllMiIvPjxjaXJjbGUgY3g9IjI3LjUiIGN5PSIzMCIgcj0iMy4yIiBmaWxsPSIjN2Q4ZWEzIi8+PHJlY3QgeD0iMTkiIHk9Ijk2IiB3aWR0aD0iMTciIGhlaWdodD0iNCIgcng9IjEuNSIgZmlsbD0iIzlhYTdiMyIvPjwvc3ZnPg=="
    },
    {
      "id": "eiffel",
      "category": "buildings",
      "name": {
        "cs": "Eiffelova věž",
        "en": "Eiffel Tower"
      },
      "height": 330,
      "baseline": "ground",
      "defaultDistance": 80000,
      "fact": {
        "cs": "330 metrů. V horkém létě se ocel roztahuje a věž je až o 15 cm vyšší než v zimě.",
        "en": "330 metres. On a hot summer day the steel expands and the tower is up to 15 cm taller than in winter."
      },
      "aspect": 0.45,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSAxMDAiPjxnIHN0cm9rZT0iIzE0NDI1YyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSI0LjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTUgOThDMTAgNjYgMTkgNDQgMjEgMjAiLz48cGF0aCBkPSJNNDAgOThDMzUgNjYgMjYgNDQgMjQgMjAiLz48L2c+PGcgc3Ryb2tlPSIjMmI2ZDhjIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEyLjUgNzggMjEgNTBNMzIuNSA3OCAyNCA1ME0xNiA0NiAyMS41IDI2TTI5IDQ2IDIzLjUgMjZNOCA5MiAzNyA5MiIvPjwvZz48cmVjdCB4PSIxOS42IiB5PSI1IiB3aWR0aD0iNS44IiBoZWlnaHQ9IjE3IiBmaWxsPSIjMTQ0MjVjIi8+PHJlY3QgeD0iMjEuNCIgeT0iMCIgd2lkdGg9IjIuMiIgaGVpZ2h0PSI2IiBmaWxsPSIjMTQ0MjVjIi8+PHJlY3QgeD0iMTQiIHk9IjE5IiB3aWR0aD0iMTciIGhlaWdodD0iNCIgcng9IjEuMiIgZmlsbD0iIzE0NDI1YyIvPjxyZWN0IHg9IjkuNSIgeT0iNDUiIHdpZHRoPSIyNiIgaGVpZ2h0PSI0LjIiIHJ4PSIxLjIiIGZpbGw9IiMxNDQyNWMiLz48cmVjdCB4PSIzLjUiIHk9Ijc3IiB3aWR0aD0iMzgiIGhlaWdodD0iNSIgcng9IjEuNSIgZmlsbD0iIzE0NDI1YyIvPjxwYXRoIGQ9Ik05IDgycTEzLjUtMTUgMjcgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTQ0MjVjIiBzdHJva2Utd2lkdGg9IjMuMiIvPjwvc3ZnPg=="
    },
    {
      "id": "burj",
      "category": "buildings",
      "name": {
        "cs": "Burdž Chalífa",
        "en": "Burj Khalifa"
      },
      "height": 828,
      "baseline": "ground",
      "defaultDistance": 130000,
      "fact": {
        "cs": "Nejvyšší budova světa (828 m). Lidé dole u paty vidí západ slunce dřív než ti na střeše.",
        "en": "The world’s tallest building (828 m). People at the base see the sunset earlier than those on the roof."
      },
      "aspect": 0.28,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOCAxMDAiPjxnIGZpbGw9IiNhOWM5ZDgiPjxwYXRoIGQ9Ik0zIDEwMCA1IDc0aDE4bDIgMjZaIi8+PHBhdGggZD0iTTUgNzQgNi42IDU0aDE0LjhMMjMgNzRaIi8+PHBhdGggZD0iTTYuNiA1NCA4IDM4aDEybDEuNCAxNloiLz48cGF0aCBkPSJNOCAzOCA5LjIgMjRoOS42TDIwIDM4WiIvPjxwYXRoIGQ9Ik05LjIgMjQgMTAuNCAxM2g3LjJMMTguOCAyNFoiLz48L2c+PHBhdGggZD0iTTEyLjggMTNoMi40bC0wLjUgLTloLTEuNFoiIGZpbGw9IiM4ZmIyYzQiLz48cmVjdCB4PSIxMy42IiB5PSIwIiB3aWR0aD0iMC44IiBoZWlnaHQ9IjUiIGZpbGw9IiMxNDQyNWMiLz48ZyBzdHJva2U9IiM3ZmE4YmQiIHN0cm9rZS13aWR0aD0iMC43IiBvcGFjaXR5PSIwLjg1Ij48cGF0aCBkPSJNOSA5OFYyNk0xNCAxMDBWMTNNMTkgOThWMjYiLz48L2c+PGcgc3Ryb2tlPSIjYzdkZGU4IiBzdHJva2Utd2lkdGg9IjAuNiI+PHBhdGggZD0iTTQgODhoMjBNNC42IDgwaDE4LjhNNS42IDY2aDE2LjhNNiA2MGgxNk03IDQ4aDE0TTcuNCA0NGgxMy4yTTguNCAzMmgxMS4yTTkuNiAxOWg4LjgiLz48L2c+PC9zdmc+"
    },
    {
      "id": "snezka",
      "category": "mountains",
      "name": {
        "cs": "Sněžka",
        "en": "Mount Sněžka"
      },
      "height": 1603,
      "baseline": "ground",
      "defaultDistance": 180000,
      "fact": {
        "cs": "Nejvyšší hora Česka, 1603 m nad mořem. Výška se tu počítá od hladiny moře.",
        "en": "The highest mountain in Czechia, 1,603 m above sea level. Here we measure from sea level."
      },
      "aspect": 2.2,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjAgMTAwIj48cGF0aCBkPSJNMCAxMDBDNDYgOTQgNzQgNzIgMTE4IDM0YzI2IDMwIDU0IDU4IDEwMiA2NloiIGZpbGw9IiM0ZjcxODMiLz48cGF0aCBkPSJNMCAxMDBDNDYgOTQgNzQgNzIgMTE4IDM0djY2WiIgZmlsbD0iIzVkODI5NiIvPjxwYXRoIGQ9Ik0xMTggMzRjLTExIDEwLTIwIDE5LTI4IDI2IDE3IDcgMzggNyA1Ni0xLTktOC0xOC0xNi0yOC0yNVoiIGZpbGw9IiNmMmY4ZmIiLz48cGF0aCBkPSJNMTA0IDIwaDI4djZoLTI4WiIgZmlsbD0ibm9uZSIvPjxlbGxpcHNlIGN4PSIxMTgiIGN5PSIyNyIgcng9IjE1IiByeT0iNS4yIiBmaWxsPSIjZDk0ZjQ1Ii8+PGVsbGlwc2UgY3g9IjExOCIgY3k9IjI0LjUiIHJ4PSI5IiByeT0iNCIgZmlsbD0iI2YwZjVmOCIvPjxyZWN0IHg9IjEyOSIgeT0iMTQiIHdpZHRoPSIyLjQiIGhlaWdodD0iMTEiIGZpbGw9IiM3ZDhlYTMiLz48cGF0aCBkPSJNMTA0IDMwaDV2LTZsLTIuNS0zLTIuNSAzWiIgZmlsbD0iI2VmZTRjZCIvPjwvc3ZnPg=="
    },
    {
      "id": "aneto",
      "category": "mountains",
      "name": {
        "cs": "Aneto (Pyreneje)",
        "en": "Aneto (Pyrenees)"
      },
      "height": 3404,
      "baseline": "ground",
      "defaultDistance": 240000,
      "fact": {
        "cs": "Nejvyšší hora Pyrenejí, 3404 m. Leží ve Španělsku a nese poslední velký ledovec celého pohoří.",
        "en": "The highest peak of the Pyrenees, 3,404 m. It lies in Spain and carries the last big glacier in the whole range."
      },
      "aspect": 2.1,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMTAgMTAwIj48cGF0aCBkPSJNMCAxMDAgMzYgNzAgNjAgODIgOTIgNDggMTIwIDY0IDE1MiA0MCAxODYgNzQgMjEwIDEwMFoiIGZpbGw9IiM4ZmEwOGUiLz48cGF0aCBkPSJNMTUyIDQwIDEzNiA1OHExMiA2IDI0IDR0MTYtOFoiIGZpbGw9IiNlOGYwZWUiLz48cGF0aCBkPSJNMjAgMTAwQzU2IDkyIDc4IDUyIDEwNCAyMmMyNiAzMCA0OCA3MCA4NiA3OFoiIGZpbGw9IiM2Zjg0NzQiLz48cGF0aCBkPSJNMjAgMTAwQzU2IDkyIDc4IDUyIDEwNCAyMnY3OFoiIGZpbGw9IiM3ZDk0N2YiLz48cGF0aCBkPSJNMTA0IDIyIDg2IDQycTE4IDEwIDM4IDZsLTIwLTI2WiIgZmlsbD0iI2Y0ZjlmOCIvPjxwYXRoIGQ9Ik0xMDQgMjJjOCA5IDE1IDE4IDIwIDI2IDEwIDQgMjAgNCAyOCAxLTE0LTEwLTMyLTIxLTQ4LTI3WiIgZmlsbD0iI2RmZWNlYiIvPjxnIHN0cm9rZT0iIzVjNmY2MyIgc3Ryb2tlLXdpZHRoPSIxLjQiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNSI+PHBhdGggZD0iTTkyIDU0IDg0IDEwME0xMTYgNTYgMTI0IDEwME0xMzggNzAgMTUwIDEwMCIvPjwvZz48L3N2Zz4="
    },
    {
      "id": "maunakea",
      "category": "mountains",
      "name": {
        "cs": "Mauna Kea",
        "en": "Mauna Kea"
      },
      "height": 4207,
      "baseline": "ground",
      "defaultDistance": 255000,
      "fact": {
        "cs": "Nad hladinou má 4207 m, ale ode dna Tichého oceánu přes 10 200 m – od paty je to nejvyšší hora Země. Tady počítáme jen tu část nad mořem.",
        "en": "It rises 4,207 m above the sea, but more than 10,200 m from the Pacific floor – measured from its base it is the tallest mountain on Earth. Here we count only the part above the water."
      },
      "aspect": 3.2,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMTAwIj48cGF0aCBkPSJNMCAxMDBDODAgOTYgMTMwIDQ0IDE2MCAxOGMzMCAyNiA4MCA3OCAxNjAgODJaIiBmaWxsPSIjN2E2YTYyIi8+PHBhdGggZD0iTTAgMTAwQzgwIDk2IDEzMCA0NCAxNjAgMTh2ODJaIiBmaWxsPSIjOGM3YjcwIi8+PHBhdGggZD0iTTE2MCAxOGMtMTAgOS0xOSAxNy0yNyAyNCAxOCA2IDM4IDYgNTQtMS05LTgtMTgtMTUtMjctMjNaIiBmaWxsPSIjYTg5NjhhIi8+PGcgZmlsbD0iI2Y0ZjhmYSI+PGNpcmNsZSBjeD0iMTQ2IiBjeT0iMjgiIHI9IjQuMiIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjI0IiByPSI1Ii8+PGNpcmNsZSBjeD0iMTc0IiBjeT0iMjkiIHI9IjQiLz48L2c+PGcgZmlsbD0iI2Q3ZTJlOCI+PHJlY3QgeD0iMTQxLjgiIHk9IjI4IiB3aWR0aD0iOC40IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSIxNTUiIHk9IjI0IiB3aWR0aD0iMTAiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjE3MCIgeT0iMjkiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiLz48L2c+PGcgc3Ryb2tlPSIjNjY1OTUwIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMTEyIDU0IDkyIDEwME0xMzggNDYgMTMyIDEwME0xODggNDggMjAwIDEwME0yMTYgNjIgMjM2IDEwMCIvPjwvZz48cGF0aCBkPSJNMCAxMDBoMzIwIiBzdHJva2U9IiM2NjU5NTAiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC4zNSIvPjwvc3ZnPg=="
    },
    {
      "id": "montblanc",
      "category": "mountains",
      "name": {
        "cs": "Mont Blanc (Alpy)",
        "en": "Mont Blanc (Alps)"
      },
      "height": 4806,
      "baseline": "ground",
      "defaultDistance": 265000,
      "fact": {
        "cs": "Nejvyšší hora Alp. Vrchol tvoří ledová čepice, takže naměřená výška se rok od roku o kousek liší – kolem 4806 m.",
        "en": "The highest mountain in the Alps. Its summit is a cap of ice, so the measured height changes a little from year to year – around 4,806 m."
      },
      "aspect": 2.2,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjAgMTAwIj48cGF0aCBkPSJNMCAxMDAgMjggNjYgNTAgODAgODIgNDIgMTA2IDU4IDE0MCAzMiAxNzggNzIgMjIwIDEwMFoiIGZpbGw9IiM4YmE0YjUiLz48cGF0aCBkPSJNMTQwIDMyIDEyMiA1MHExMyA3IDI3IDV0MTgtOVoiIGZpbGw9IiNlNmYwZjYiLz48cGF0aCBkPSJNODIgNDIgNjggNThxOSA2IDIwIDR0MTMtN1oiIGZpbGw9IiNlNmYwZjYiLz48cGF0aCBkPSJNMTAgMTAwQzUyIDk0IDc0IDU0IDk2IDMycTE4LTE1IDM2IDBjMjIgMjIgNDQgNjAgNzggNjhaIiBmaWxsPSIjNmQ4ZWEzIi8+PHBhdGggZD0iTTEwIDEwMEM1MiA5NCA3NCA1NCA5NiAzMnExMS05IDIwLTd2NzVaIiBmaWxsPSIjN2Q5Y2IwIi8+PHBhdGggZD0iTTk2IDMycTE4LTE1IDM2IDBjOSA5IDE3IDIwIDI0IDMxLTI1IDktNTcgOS03OS0yIDUtMTEgMTEtMjEgMTktMjlaIiBmaWxsPSIjZjVmYWZkIi8+PHBhdGggZD0iTTEwMyAyNnExMy02IDIyIDEtMTEtMS0yMiAyWiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC43NSIvPjxnIHN0cm9rZT0iIzVkN2Q5MiIgc3Ryb2tlLXdpZHRoPSIxLjYiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNDUiPjxwYXRoIGQ9Ik04NCA2NiA2NiAxMDBNMTE4IDY4IDExNiAxMDBNMTQ4IDcwIDE2NCAxMDAiLz48L2c+PHBhdGggZD0iTTc4IDY0cTM0IDEyIDc4IDMiIHN0cm9rZT0iI2NmZTBlYSIgc3Ryb2tlLXdpZHRoPSIyLjIiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNzUiLz48L3N2Zz4="
    },
    {
      "id": "kilimanjaro",
      "category": "mountains",
      "name": {
        "cs": "Kilimandžáro",
        "en": "Kilimanjaro"
      },
      "height": 5895,
      "baseline": "ground",
      "defaultDistance": 290000,
      "fact": {
        "cs": "Nejvyšší hora Afriky, 5895 m. Je to samostatná sopka uprostřed roviny, takže je vidět opravdu z veliké dálky.",
        "en": "The highest mountain in Africa, 5,895 m. It is a lone volcano in the middle of a plain, so it really can be seen from a great distance."
      },
      "aspect": 2.8,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyODAgMTAwIj48cGF0aCBkPSJNMjA0IDEwMCAyMzIgNTJsMTQgMTYgMTYtMjQgMjQgNTZaIiBmaWxsPSIjN2Y2ZjYzIi8+PHBhdGggZD0iTTI2MiA0NCAyNTIgNjBxOCA0IDE2IDJaIiBmaWxsPSIjZWVmMmYwIi8+PHBhdGggZD0iTTAgMTAwQzU4IDk2IDkyIDYwIDEyMiAzMGg0NGMzMCAzMCA2MiA2NiAxMTQgNzBaIiBmaWxsPSIjOGE3YTZiIi8+PHBhdGggZD0iTTAgMTAwQzU4IDk2IDkyIDYwIDEyMiAzMGgyMmMtMTYgMjYtNDAgNTItNjYgNzBaIiBmaWxsPSIjOWM4YjdhIi8+PHBhdGggZD0iTTEyMiAzMGg0NGM4IDggMTYgMTYgMjQgMjQtMzIgMTAtNzAgMTAtOTgtMiAxMC04IDIwLTE1IDMwLTIyWiIgZmlsbD0iI2Y0ZjhmYSIvPjxwYXRoIGQ9Ik0xMjIgMzBoNDRsNiA2aC01NloiIGZpbGw9IiNkZmU5ZWUiLz48ZyBzdHJva2U9IiM2ZjYwNTMiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjQ1Ij48cGF0aCBkPSJNOTYgNTggODIgMTAwTTE0OCA1NiAxNDYgMTAwTTE4NiA2MiAyMDAgMTAwIi8+PC9nPjxwYXRoIGQ9Ik0wIDEwMGgyODAiIHN0cm9rZT0iIzZmNjA1MyIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjM1Ii8+PC9zdmc+"
    },
    {
      "id": "everest",
      "category": "mountains",
      "name": {
        "cs": "Mount Everest",
        "en": "Mount Everest"
      },
      "height": 8849,
      "baseline": "ground",
      "defaultDistance": 340000,
      "fact": {
        "cs": "8849 m nad mořem. I tak obrovská hora se schová za zakřivení Země, když je dost daleko.",
        "en": "8,849 m above sea level. Even a mountain this huge hides behind the Earth’s curve if it is far enough away."
      },
      "aspect": 2.6,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNjAgMTAwIj48cGF0aCBkPSJNMCAxMDAgNDAgNTggNzAgNzYgMTA0IDQwIDEzMiA2MiAxNjggMjYgMjA2IDY2IDI2MCAxMDBaIiBmaWxsPSIjN2Q5OWFiIi8+PHBhdGggZD0iTTEwNCA0MCA4OCA1OHE5IDUgMjAgNHQxNi02WiIgZmlsbD0iI2UzZWRmMyIvPjxwYXRoIGQ9Ik0xNjggMjYgMTUyIDQ2cTEwIDYgMjIgNHQxNC04WiIgZmlsbD0iI2UzZWRmMyIvPjxwYXRoIGQ9Ik0yOCAxMDAgOTYgNDAgMTI4IDYyIDE1OCA0IDE5NiA1NCAyNDAgMTAwWiIgZmlsbD0iIzVkN2Q5MCIvPjxwYXRoIGQ9Ik0yOCAxMDAgOTYgNDAgMTI4IDYyIDE1OCA0djk2WiIgZmlsbD0iIzZiOGI5ZSIvPjxwYXRoIGQ9Ik0xNTggNCAxMzIgNDRxMTIgOSAzMCA4dDI4LTEwWiIgZmlsbD0iI2Y0ZjlmYyIvPjxwYXRoIGQ9Ik0xMjYgNjYgMTA4IDUyIDk2IDYybDE0IDEyWiIgZmlsbD0iI2Y0ZjlmYyIgb3BhY2l0eT0iLjg1Ii8+PHBhdGggZD0iTTE1OCA0cTIyIDMgNDAtMi0xOCAxMC0zMyAxMloiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9Ii43NSIvPjwvc3ZnPg=="
    },
    {
      "id": "olympus",
      "category": "mountains",
      "name": {
        "cs": "Olympus Mons (Mars)",
        "en": "Olympus Mons (Mars)"
      },
      "height": 21900,
      "baseline": "ground",
      "defaultDistance": 600000,
      "fact": {
        "cs": "Nejvyšší sopka sluneční soustavy, skoro 22 km. Přepni těleso na Mars a uvidíš, že na menším světě zmizí za obzorem mnohem dřív.",
        "en": "The tallest volcano in the solar system, almost 22 km. Switch the planet to Mars and see how a smaller world hides it far sooner."
      },
      "aspect": 3,
      "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTAwIj48cGF0aCBkPSJNMCAxMDBDNTggOTIgOTYgMzQgMTIwIDhoNjBjMjQgMjYgNjIgODQgMTIwIDkyWiIgZmlsbD0iI2IwNmE0YSIvPjxwYXRoIGQ9Ik0wIDEwMEM1OCA5MiA5NiAzNCAxMjAgOGgyMmMtMTQgMjgtNDAgNjYtNjAgOTJaIiBmaWxsPSIjYzA3YzU4Ii8+PGcgc3Ryb2tlPSIjOGU1MTM4IiBzdHJva2Utd2lkdGg9IjEuNiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC41NSI+PHBhdGggZD0iTTEwNCA0NCA5NiAxMDBNMTM2IDI2IDEzMiAxMDBNMTcwIDMwIDE3OCAxMDBNMTk4IDUyIDIxNCAxMDAiLz48L2c+PGVsbGlwc2UgY3g9IjE1MCIgY3k9IjkiIHJ4PSIzMSIgcnk9IjciIGZpbGw9IiM4ZTUxMzgiLz48ZWxsaXBzZSBjeD0iMTUwIiBjeT0iOCIgcng9IjIyIiByeT0iNC42IiBmaWxsPSIjNjYzOTJhIi8+PHBhdGggZD0iTTAgMTAwaDMwMCIgc3Ryb2tlPSIjOGU1MTM4IiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNCIvPjwvc3ZnPg=="
    }
  ]
};
