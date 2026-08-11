# Changelog

Formát podle [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
verzování podle [Semantic Versioning](https://semver.org/lang/cs/).

## [1.4.0] — 2026-08-11

### Přidáno / Added

- **Kruhové schéma „Jak velký kus tělesa vlastně vidíš“** pod pohledem
  dalekohledem. Těleso je nakreslené tak, jak by vypadalo z vesmíru přímo nad
  pozorovatelem, a leží na něm **ve skutečném poměru** dvě kružnice: tvůj obzor
  a vzdálenost, ve které zmizí vybraný objekt. Právě proto jsou z lidské výšky
  obě téměř neviditelné – a to je na tom to podstatné. Vedle je proto ještě
  rovnoměrně zvětšený výřez s vypsaným zvětšením, takže uvnitř něj poměry pořád
  platí. Ke každé kružnici se počítá plocha vrchlíku a její podíl na celém
  povrchu: ze 170 cm na Zemi je vidět 68 km², tedy 1 : 7 495 306 povrchu.
- Když je vidět tak velký kus tělesa, že je znát i na samotné kouli, výřez
  odpadne a koule se posune doprostřed. Když by objekt byl vidět až za okrajem
  polokoule, schéma to napíše.

### Opraveno / Fixed

- **Kresby objektů se v postranním panelu vůbec nezobrazovaly.** Naše SVG mají
  jen `viewBox`, žádnou vlastní šířku a výšku, takže se uvnitř flexboxu se
  samotným `max-height` smrskly na nulovou šířku. Dlaždice tak celou dobu
  ukazovaly jen název a výšku. Výška je teď určená explicitně a `object-position`
  drží objekt dole, aby stál na zemi jako v diagramu.
- Zástupné emoji na dlaždicích (❓ a ✏️) nahradila malá kresba ve stejném stylu
  jako ostatní objekty – emoji vypadají na každé platformě jinak.

## [1.3.0] — 2026-08-11

### Přidáno / Added

- **Odvození obou funkcí** v režimu Geometrie, hned pod postupem výpočtu.
  Z téhož pravoúhlého trojúhelníku se odvodí `D(h₂) = d₁ + R·arccos(R/(R+h₂))`
  (režim „Kdy zmizí?“) i `h₂(D) = R·(1/cos((D−d₁)/R) − 1)` (režim „Meze
  viditelnosti“) včetně směrnice `D′(h₂)` a přiblížení `h₂ ≈ (D−d₁)²/2R`.
  Text popisuje tvar každé křivky a končí tím, že jsou **navzájem inverzní** –
  proto má první vodorovný strop tam, kde má druhá svislou asymptotu.
- **Dva nové grafy v lineárních osách**, ne logaritmických. První se výřezem
  řídí vybraným objektem, aby byl vidět odmocninový tvar u školních výšek;
  druhý pokrývá celý rozsah až k mezi dohledu, takže je vidět svislá asymptota
  – a je z něj hned jasné, proč režim „Meze viditelnosti“ logaritmické osy
  potřebuje.
- **Sedm nových objektů**: Saturn V (110,6 m), Starship se Super Heavy (121 m),
  Velká pyramida v Gíze (138,5 m), Aneto v Pyrenejích (3404 m), Mauna Kea
  (4207 m), Mont Blanc (4806 m) a Kilimandžáro (5895 m). Přibyla kategorie
  **Rakety** 🚀. Celkem je tak v sadě 23 objektů.

### Opraveno / Fixed

- **Přesně na mezi dohledu vracel výpočet obrovské, ale konečné číslo.** Podíl
  `(D − d₁)/R` vyjde po zaokrouhlení o vlásek pod π/2 a sekans pak dá až
  2,5 · 10²⁴ m. Kontrola má nyní úhlovou rezervu 10⁻¹² rad – na Zemi je to
  6 mikrometrů oblouku, zato potřebná výška by v tu chvíli byla 6 · 10¹² km.
  Proměřeno na 180 kombinacích tělesa a výšky očí: nikde už nevyjde konečná.
- Vodorovná osa grafu v režimu „Kdy zmizí?“ se ořezává protilehlým bodem
  tělesa. U malého vlastního tělesa (průměr 0,1 km) osa dřív kvůli spodní mezi
  1 km sahala šestkrát dál, než je celé těleso velké.
- Křivka téhož grafu se v okolí obzoru vzorkuje hustěji. Při vysokém
  pozorovateli a nízkém objektu připadalo na celý zajímavý úsek jen 8 z 260
  bodů.

### Ověřeno / Verified

Tvar obou funkcí proměřen v `check-geometry`: inverznost, monotonie a chování
na mezi dohledu na 5 tělesech × 7 výškách očí × 8 výškách objektu, směrnice
proti numerické derivaci. Vykreslené křivky se shodují s nezávisle dopočítanou
cestou znak po znaku; 440 kombinací jazyka, tělesa, výšky očí a objektu bez
jediného bodu mimo rámeček.

## [1.2.1] — 2026-08-10

### Opraveno / Fixed

- **Popisky v režimu Geometrie se překrývaly.** Kreslená výška vychází jako
  `R·(1/cos θ − 1)`, což roste s druhou mocninou úhlu – při dosavadní dolní
  mezi 0,13 rad měl úsek `h₁` jen 2 px a bod `A`, `A′`, kóta `d₁`, `t₁`
  i úhel `α` splynuly do jednoho místa. Dolní mez je nyní 0,40 rad, takže úsek
  má přes 20 px a bod `A′` je od `T` vzdálený víc než 100 px.
- Kóty `d₁` a `d₂` se přesunuly dovnitř kružnice; dřív se kreslily nad tečnu
  a narážely do `t₁`, `t₂` a bodu `T`.
- Popisky nad tečnou se sázejí ve sloupcích (`A′` → `α` → *pozorovatel*),
  popisek `R` se odsunul od oblouků úhlů.
- Přibyla pojistka, která po vykreslení změří skutečné obálky všech popisků
  a kolidující rozestrčí. Ověřeno na 110 kombinacích jazyka, tělesa, výšky
  očí a objektu: **nula překryvů, nic mimo plátno**.
- Nová kresba katedrály sv. Bartoloměje: úzká věž vlevo vystupuje z lodi
  a tvoří vstup, vysoká špičatá zelená helmice zabírá zhruba polovinu výšky,
  druhá věž chybí – tak jak byla skutečně postavena.

### Ověřeno / Verified

Výkon proměřen, žádný zásah nebyl potřeba: úplné překreslení trvá 0,7–1,5 ms,
při 200 objektech nejhůř 3,2 ms, psaní v editoru 1,1 ms na stisk klávesy.

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

[1.4.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/richardLipka/beyond-the-horizon/releases/tag/v1.0.0
