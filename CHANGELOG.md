# Changelog

Formát podle [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
verzování podle [Semantic Versioning](https://semver.org/lang/cs/).

## [1.0.0] — 2026-08-10

První veřejné vydání. / First public release.

### Přidáno / Added

- **Režim „Co uvidím?" / "What can I see?"** — okótovaný boční pohled na
  zakřivenou Zemi s pozorovatelem, přímkou pohledu, bodem obzoru, vyboulením
  hladiny, měřítkem vzdálenosti a měřítkovou úsečkou; kulatý pohled
  dalekohledem se schovanou částí nakreslenou čárkovaně; osm dlaždic s čísly
  a slovní vysvětlení výsledku.
- **Režim „Kdy zmizí?" / "When does it vanish?"** — vzdálenost zmizení rozepsaná
  jako součet obou obzorů, graf viditelné výšky podle vzdálenosti se třemi
  pásmy, tabulka po krocích a klikací srovnání všech objektů.
- **Editor objektů** — přidávání, úpravy, duplikace a mazání objektů, nahrávání
  obrázků s automatickým zjištěním poměru stran, náhled JSONu, stažení
  `objects.json`, uložení do prohlížeče a obnovení tovární sady.
- **Dvojjazyčnost** — kompletní čeština a angličtina včetně názvů objektů
  a zajímavostí; jazyk se pamatuje mezi návštěvami.
- **Patnáct objektů** s ručně kreslenou SVG grafikou: od člověka a plachetnice
  přes Titanic, katedrálu sv. Bartoloměje v Plzni a Eiffelovu věž až po Sněžku
  a Mount Everest.
- **Volitelná refrakce** (efektivní poloměr `R · 7/6`).
- **Zabudovaná tovární záloha dat**, aby aplikace fungovala i po otevření
  přímo z disku (`file://`), kde `fetch()` na lokální soubor selže.
- **Nástroje** — `build-objects` (deterministické sestavení datového souboru ze
  zdrojových SVG), `check-geometry` (13 kontrol proti hodnotám z učebnic),
  `check-strings` (úplnost překladů) a `serve` (statický server bez závislostí).
- **CI** kontrolující výpočty, úplnost překladů a reprodukovatelnost
  vygenerovaného `objects.json`.

[1.0.0]: https://github.com/richardLipka/beyond-the-horizon/releases/tag/v1.0.0
