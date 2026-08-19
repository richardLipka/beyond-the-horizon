# Changelog

Formát podle [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
verzování podle [Semantic Versioning](https://semver.org/lang/cs/).

## [1.11.0] — 2026-08-19

### Přidáno / Added

- **Odečítání hodnot myší i v grafu „Kdy zmizí?“.** Stejné jako v mezích
  viditelnosti: najetím do grafu se ke sloupci pod ukazovátkem dopočítá přesná
  dvojice a položí se na obě osy – vzdálenost dole, kolik z objektu je v ní
  ještě vidět vlevo. Tady to není kvůli logaritmickým osám, ale kvůli tomu, že
  zajímavý úsek leží mezi obzorem a zmizením a při vysokém pozorovateli je to
  jen pár procent šířky grafu.
  - Viditelná výška z rozsahu nikdy nevypadne (leží mezi nulou a výškou
    objektu, tedy přesně mezi spodní a horní hranou rámečku), takže se tu
    prázdný kroužek nikdy neobjeví.

### Změněno / Changed

- Odečítání se přestěhovalo do vlastního modulu `js/ui/readout.js`, který si
  oba grafy sdílejí – stejně, jako už sdílejí `export.js`. Volající dodává
  jedinou funkci `sample(px)`, která ze sloupce udělá bod a jeho dva popisky;
  kreslení, meze popisků i posluchače řeší modul. Kdyby se odečítání někdy
  hodilo i do grafů v režimu Geometrie, je to jedno volání.

## [1.10.0] — 2026-08-19

### Přidáno / Added

- **Odečítání hodnot myší v grafu „Meze viditelnosti“.** Najetím do grafu se
  ke sloupci pod ukazovátkem dopočítá přesná dvojice čísel a položí se rovnou
  na obě osy: vzdálenost dole, potřebná výška vlevo. Bod na křivce a nitkový
  kříž ukazují, odkud se čte. Obě osy jsou logaritmické, takže z tvaru křivky
  se hodnoty odhadnout nedají – u asymptoty odpovídá pár pixelů několika
  řádům, a právě tam je odečítání nejvíc potřeba.
  - Prázdný kroužek říká, že skutečný bod leží až za okrajem měřítka: před
    obzorem (nula), pod nejnižší dekádou i nad nejvyšší. Číslo se vypíše
    správně i tehdy – mezi 9 630 a 10 012 km je ze Země potřebná výška
    konečná, ale nad horní dekádou grafu.
  - Za mezí dohledu se vypíše ∞.
  - Popisky mají vlastní podklad, aby přebily rysku pod sebou. Vykreslí se,
    změří a teprve pak zasunou do obrázku a uhnou si navzájem – délka čísla
    ani jazyk se dopředu vědět nedají.

### Opraveno / Fixed

- **Křivka potřebné výšky nezačínala na obzoru**, ale až u prvního vzorku za
  ním. Těsně za obzorem roste potřebná výška od nuly kvadraticky, což je na
  logaritmické ose skoro svislý start, a vzorkování po stejných dílech
  logaritmu z něj ukrojilo znatelný kus – u Uranu z výšky 400 km ležela
  správná hodnota **23 px** pod začátkem nakreslené čáry. Křivka teď vyrůstá
  ze spodní osy přesně na obzoru pozorovatele; odchylka klesla na 0,4 px.

## [1.9.0] — 2026-08-19

### Opraveno / Fixed

- **Nakreslená křivka nikdy nebyla kruh, ani když měla být.** Kouli spouštěla
  jen VÝŠKA pozorovatele, ne vzdálenost. Zvětšení výšek proti vzdálenostem sice
  s rostoucí vzdáleností klesá, ale ne k jedničce: na Zemi je při 1000 km ještě
  17,8×, při 6371 km 2,73×, kolem 15 000 km projde jedničkou a pokračuje dál –
  na protilehlém bodě vycházel obrázek o třetinu **stlačený**. Tvar byl tedy
  vždycky elipsa, a to právě tam, kde už je zakřivení samo o sobě zjevné.
  Koule se nově kreslí i tehdy, když **vzdálenost po povrchu dosáhne jednoho
  poloměru tělesa** (jeden radián oblouku) – přesně to znamená „srovnatelné
  s velikostí tělesa“. Proložením nejlepší kružnice vychází nakreslená cesta
  jako kruh s odchylkou do **0,01 px**; pod mezí se od kruhu lišila o 28 až
  37 px.
- Pozadí je vesmír vždy, když je v obrázku celé těleso: díváme se na ně zvenku.
  Dřív se řídilo jen výškou pozorovatele.

Popisky, které visely na bodech konstrukce, potřebovaly kontrolu mezí, jakmile
rámečku začalo vládnout oko mimo obrázek:

- Ryska obzoru mířila vždy vzhůru, jenže na kouli může bod dotyku ležet kdekoli
  po obvodu – teď trčí **ven z povrchu**, tedy směrem od středu.
- Popisek vyboulení se překlopí doleva, když střed tětivy dojede k pravému
  okraji.
- Kóta výšky očí se vůbec nekreslí, když je oko mimo obrázek; její popisek
  uprostřed končil tisíc pixelů nad rámečkem.
- Varování „za hranicí dohledu“ se vykreslí, změří a **teprve pak** zasune do
  rámečku: pevný odstup nemohl stačit, když objekt může stát kdekoli a věta je
  v každém jazyce jinak dlouhá.
- Postavička se u okraje zastavuje s odstupem podle **své vlastní velikosti** –
  u vysoké dráhy Měsíce míří stožár skoro vodorovně a postavička ležela přes
  okraj.
- Ořezání popisků k hornímu okraji potřebuje 22 px, ne 14: obálka písma sahá
  asi 20 px nad účaří.

## [1.8.0] — 2026-08-18

### Změněno / Changed

- **Z výšky se kreslí koule, ve skutečném poměru.** Zvětšovat výšky proti
  vzdálenostem je poctivé jen tam, kde je zakřivení jinak neviditelné. Jakmile
  je pozorovatel (nebo objekt) výš než **třicetdvojina poloměru** – na Zemi
  199 km, tedy pohodlně pod nejnižší oběžnou dráhou a stejně pohodlně nad
  letadlem – přepne boční pohled na **jedno měřítko pro obě osy** a nakreslí
  **celé těleso jako kouli** na černé obloze plné hvězd. Koule dostane
  radiální přechod, aby nevypadala jako plochý kotouč, a v popisku se to řekne.
  - Těleso se s rostoucí výškou zmenšuje, jak se sluší: 348 px z nízké dráhy,
    151 ze střední, 108 ze stacionární.
  - Nad devět poloměrů se pozorovatel do záběru nebere – obrázek se sevře na
    samotné těleso a stožár vede pryč přes horní okraj se značkou přerušené
    čáry. Držet ho v záběru by u Venuše, jejíž stacionární dráha je 253
    poloměrů vysoko, znamenalo těleso menší než pixel. Přímka pohledu se ale
    kreslí ze **skutečné** polohy oka: posunout ji znamená přestat být tečnou.
- **Geometrie kreslí velký úhel ve skutečné velikosti.** Úhly se zvětšují, jen
  dokud jsou malé; z oběžné dráhy je α přes osmdesát stupňů a dosud se
  stlačovala zpátky na 41°, takže obrázek tvrdil něco jiného, než co se počítá.
  Teď se místo úhlu zmenší koule a poloměr se dopočítá tak, aby se celá figura
  vešla na šířku. Popisek pod obrázkem rozlišuje tři případy: úhly zvětšené,
  velký úhel skutečný, nebo velký úhel naopak zmenšený, aby se vešel.
- Výšky nad sto kilometrů se v celém obrázku vypisují v kilometrech.

### Opraveno / Fixed

- Rysky měřítka vzdálenosti se v režimu koule slévaly: celá tětiva se promítne
  do několika desítek pixelů. Rysky zůstávají všechny, popisky se vypisují jen
  tam, kde je od předchozího dost místa.
- Tři dlouhé kóty (d₁, d₂, R) se do malé koule nevešly a u Neptunu z vysoké
  dráhy se překrývaly. Když je koule malá, srovnají se vlevo pod tečnu, kde je
  volno.

## [1.7.0] — 2026-08-17

### Přidáno / Added

- **Čtyři oběžné dráhy jako stanoviště pozorovatele** – nízká, střední,
  stacionární a vysoká. Nejsou zadané ručně: nízká leží šestnáctinu poloměru
  nad povrchem (zdola ji omezuje atmosféra, ne oběžná doba), zbylé tři jsou
  dané oběžnou **dobou** a počítají se ze třetího Keplerova zákona
  `∛(GM · T² / 4π²)`, takže vycházejí z hmotnosti a rychlosti otáčení tělesa.
  U Země padnou přesně na skutečné dráhy: 398 km a 92 minut je ISS, půldenní
  dráha ve 20 191 km je GPS a jednodenní ve 35 793 km je geostacionární.
  U Marsu vyjde areostacionárních 17 038 km, u Jupiteru 90 098 km a u Venuše,
  která se otočí jednou za 243 dní, 1 530 517 km.
  - Žebřík vypráví přesně to, o čem je celá aplikace: vidíš 2,9 % → 38,0 % →
    42,4 % → 47,0 % povrchu, a **nikdy ne polovinu**.
  - Tělesa proto nesou `gm` a `day`; u vlastního tělesa se hmotnost odhaduje
    ze střední hustoty Země, takže při pozemském průměru vyjdou zemská čísla.
- Posuvník výšky očí dosáhne až k nejvyšší nabízené dráze daného tělesa – od
  46 tisíc km u Pluta po 63 milionů km u Slunce.

### Změněno / Changed

- Posuvník výšky očí je **zlomený na dvě části**: prvních 62 % dráhy je přesně
  to, co měl dřív (0,1 m až 10 km), zbytek dojede na oběžnou dráhu. Jedním
  logaritmem přes celý rozsah – u Země devět řádů, u Slunce dvanáct – by na
  lidské výšky zbyla třetina dráhy a méně.
- Výšky nad sto kilometrů (Kármánova hranice) se vypisují v kilometrech.
  Pozemské výšky zůstávají v metrech; „35 793 000 m“ se nedá přečíst.
- „Výška očí nad hladinou“ → „nad povrchem“: hladina je na deseti z jedenácti
  těles nesmysl.

### Opraveno / Fixed

- **Pozorovatel na oběžné dráze vypadl z bočního pohledu.** Rámeček se počítal
  jen z oblouku povrchu, jenže místní svislice se na kraji tětivy odklání
  o polovinu středového úhlu, takže oko ve výšce `h` leží `h · sin(D/2R)`
  stranou od paty. Do výšky asi 0,08 R je to proti šířce oblouku nic, na
  oběžné dráze to všechno převálcuje: ze střední dráhy Měsíce leželo oko
  30 570 km vlevo od oblouku širokého 2 108 km, tedy čtrnáct a půl jeho šířky
  za okrajem. Meze rámečku teď počítají i s oběma aktéry.
- Popisek „TY“ zůstával na povrchu, i když postavička vyjela na stozár. Teď
  jede s ní.
- Kóta výšky očí byla svislá i tehdy, když stožár mířil silně šikmo – měřila
  tedy něco jiného, než co bylo nakreslené. V takovém případě se místo ní píše
  popisek u oka.
- Klíč `ctrl.observer` byl v obou jazycích uvedený dvakrát.

## [1.6.0] — 2026-08-11

### Přidáno / Added

- **„Uvidím to doopravdy?“ – skutečné rozhledy po Evropě.** Samostatná sekce
  úplně dole v režimu „Co uvidím?“ počítá čtrnáct skutečných dvojic: skutečná
  místa, jejich skutečné nadmořské výšky a vzdálenost počítanou po povrchu
  ze zeměpisných souřadnic (haversinus). Výška očí je všude 1,7 m nad zemí,
  jedním kliknutím se řádek přenese do simulace nahoře. Sekce si sama od sebe
  nic nenastavuje.
  - Alpy z Plzně vycházejí s rezervou pouhých **5 km** – proto jsou odsud
    vidět jen výjimečně.
  - Alpy z Petřína **nevyjdou** (chybí 30 km) a nepomůže ani refrakce.
  - Korsika z pláže v Nice je přesně na hraně: **bez refrakce ne, s ní ano**.
    Je to jediný řádek, který se přepínačem překlápí.
  - Praha z Mont Blancu: 734 km proti dohledu 312 km.
- **Malá tlačítka pro stažení obrázku** (SVG a PNG) u každé vizualizace –
  bočního pohledu, dalekohledu, kruhového schématu, obou grafů i geometrické
  konstrukce. Stažený soubor stojí sám o sobě: styly se do něj zapisují
  natvrdo, protože při běhu z `file://` se stylopis načíst nedá.
- Odkaz na **domovskou stránku autora** a **logo FAV ZČU** v patičce. Logo je
  místní soubor, ne odkaz na cizí server – aplikace musí fungovat offline.
  Značka univerzity není součástí licence MIT, což je poznamenáno v `LICENSE`.

### Opraveno / Fixed

- Refrakce v tabulce rozhledů fungovala **obráceně**: vzdálenost mezi dvěma
  místy se počítala s efektivním poloměrem, takže se se zapnutou refrakcí
  „natáhla“ o 17 % a rozhledy se místo zlepšení kazily. Zeměpisná vzdálenost
  se nyní počítá se skutečným poloměrem Země, efektivní patří jen do výpočtu
  dohledu.
- Tlačítka exportu v titulku karty mizela při každém překreslení a při změně
  jazyka – text titulku se zapisoval přes `textContent`, což smazalo i je.
  Text má teď vlastní `<span>`.

## [1.5.0] — 2026-08-11

### Opraveno / Fixed

- **Objekt v bočním pohledu se ořezával o rámeček.** Okraje se rezervovaly
  procentem ze vzdálenosti, jenže ikona objektu i postavička mají šířku
  v pixelech, která ze světových souřadnic neplyne. U širokých objektů (hory,
  lodě) tak zmizelo až 70 px kresby – ve **58 z 92** zkoušených nastavení.
  Okraje se teď počítají v pixelech z horního odhadu velikosti ikony a měřítko
  dostane, co zbyde; povrch se kreslí širší než rámeček, aby pod nimi nezůstal
  prázdný klín. Ověřeno na 345 nastaveních: **nic mimo rámeček**.
- Kóty „schováno“ a „vidíš“ si stranu vybíraly podle pevného odstupu 74 px,
  jenže popisky jsou delší a v každém jazyce jinak dlouhé. Nově se vykreslí,
  změří a v případě přetečení překreslí na druhou stranu.
- **Postranní panel se skládal pod obsah předčasně.** Zlom byl na 1100 px,
  takže okno široké 1000 px panel zbytečně odsunulo dolů. Rozvrh se teď skládá
  až pod 820 px; dalekohled a čísla vedle sebe mají vlastní zlom na 1100 px.
- **Texty, které platily jen na Zemi.** „Kolik ukrojila Země“, „Vzdálenost po
  povrchu Země“, „za vyboulením Země“ nebo „Boční pohled na Zemi“ jsou na
  ostatních deseti tělesech nepravdivé – nově mluví o povrchu, tělese, nebo
  doplňují název vybraného tělesa. Poznámka v patičce také už netvrdí, že je
  ovládací panel „vlevo“ (při úzkém okně je nahoře).
- Odstraněno 13 překladových klíčů, které se nikde nepoužívaly. `check-strings`
  nově hlídá i to, aby se každý klíč někde volal.

### Přidáno / Added

- Do kruhového schématu přibyla **čárkovaná kružnice nastavené vzdálenosti** –
  jediná, která se hýbe s posuvníkem. Je z ní hned vidět, jestli objekt stojí
  ještě před obzorem, nebo už za ním. Měřítko výřezu ji bere v potaz až do
  dvojnásobku bodu zmizení; dál by oba zajímavé kruhy sklouzly do středu.

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

[1.11.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.10.0...v1.11.0
[1.10.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.9.0...v1.10.0
[1.9.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/richardLipka/beyond-the-horizon/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/richardLipka/beyond-the-horizon/releases/tag/v1.0.0
