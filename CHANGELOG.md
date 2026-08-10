# Changelog

Formát podle [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
verzování podle [Semantic Versioning](https://semver.org/lang/cs/).

## [1.2.0] — 2026-08-10

### Přidáno / Added

- **Barvy podle tělesa** – každé těleso má vlastní paletu oblohy i povrchu
  a ta se propisuje do bočního pohledu, pohledu dalekohledem i do nové
  geometrické konstrukce. Menu tak barevně odpovídá obrázku. Textura povrchu
  se mění podle tělesa (vlnky, tráva, kameny, oblačné pásy) a světy bez
  atmosféry (Merkur, Měsíc, Pluto) mají černou oblohu s hvězdami.
- **Pátý režim „Geometrie“** pro střední školu – abstraktní konstrukce
  kritické polohy: kružnice se středem O, tečna dotýkající se v bodě T kolmo
  na poloměr a z toho plynoucí dva pravoúhlé trojúhelníky. Ke každému kroku
  je symbolický vzorec, dosazení i výsledek (`cos α = R/(R+h₁)`,
  `t = √(h(2R+h))`, `d = R·α`, `D = R(α+β)`) až po přiblížení `d ≈ √(2Rh)`.
  Vstupy jsou přesně tři: velikost tělesa, výška pozorovatele a výška objektu,
  takže se v tomto režimu skrývá ovládání vzdálenosti.
- Kontrola palet těles v CI (platný formát barev, známá textura, názvy ve
  všech jazycích).

### Změněno / Changed

- Záložky jsou při pěti režimech kompaktnější, aby se hlavička zbytečně
  nerozrůstala.

## [1.1.0] — 2026-08-10

### Přidáno / Added

- **Volba tělesa** – jedenáct předvoleb sluneční soustavy (Slunce, všech osm
  planet, Měsíc a Pluto) plus vlastní průměr. Poloměr se propisuje úplně všude:
  do obzoru, bodu zmizení, diagramu, obou grafů i do konstanty pravidla palce
  (3,57 na Zemi, 1,86 na Měsíci, 37,3 na Slunci).
- **Čtvrtý režim „Meze viditelnosti“** – logaritmický graf potřebné výšky podle
  vzdálenosti se svislou asymptotou na mezi dohledu, červeným pásmem „sem
  nedohlédneš nikdy“, objekty ze seznamu ležícími přesně na křivce a tabulkou,
  která vede od člověka až po „nemožné“.
- **Olympus Mons** (21 900 m) jako šestnáctý objekt.

### Opraveno / Fixed

- Vzdálenost se nyní ořezává na protilehlý bod tělesa. Dál už povrchová
  vzdálenost nemá smysl – obchází se druhou stranou.
- Za mezí dohledu (`obzor + čtvrtina obvodu`) aplikace správně hlásí, že
  nepomůže žádná výška, místo aby jen tvrdila „objekt je schovaný“.
- Diagram se u velmi velkých vzdáleností přestal sám přes sebe překrývat –
  oblouk se kreslí nanejvýš čtvrtinu obvodu na každou stranu od středu tetivy.
- Přímka pohledu se konstruuje z oka a bodu dotyku a prodlužuje se až
  v pixelech; dřív se druhý bod počítal z výšky daleko vpravo, která u velkých
  vzdáleností vycházela nekonečná.
- Konstanta „3,57“ už není natvrdo v textech – počítá se z poloměru tělesa.

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

[1.2.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/richardLipka/beyond-the-horizon/releases/tag/v1.0.0
