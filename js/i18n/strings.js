/**
 * strings.js - vsechny texty aplikace na jednom miste.
 * Every user-visible string of the app, in one place.
 *
 * Pridani dalsiho jazyka = pridani dalsiho klice do tohoto objektu
 * a jednoho tlacitka v index.html.
 * Adding a language = add another key here plus one button in index.html.
 *
 * V textech lze pouzit zastupne znacky {takto}. / Placeholders look {like this}.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  HL.strings = {
    cs: {
      'app.title': 'Za obzorem',
      'app.subtitle': 'Prozkoumej, jak zakřivení Země schovává věci',
      'app.langLabel': 'Jazyk',

      'mode.see': 'Co uvidím?',
      'mode.vanish': 'Kdy zmizí?',
      'mode.limits': 'Meze viditelnosti',
      'mode.geometry': 'Geometrie',
      'mode.editor': 'Editor objektů',

      'geo.heading': 'Odkud se ty vzorce berou',
      'geo.sub':
        'Celý výpočet stojí na jediné myšlence: tečna je kolmá na poloměr. Zbytek je kosinus a Pythagorova věta.',
      'geo.observerLabel': 'pozorovatel',
      'geo.objectLabel': 'objekt',
      'geo.exaggerated':
        'Úhly jsou zvětšené (menší z nich víc), aby byly vidět. Čísla jsou skutečná.',
      'geo.tangentTitle': 'Klíčová myšlenka',
      'geo.tangentText':
        'Přímka pohledu se dotýká povrchu v jediném bodě T. Tečna je vždy kolmá na poloměr vedený do bodu dotyku, takže úhel u T je pravý. Tím vzniknou dva pravoúhlé trojúhelníky – O T A′ pro pozorovatele a O T B′ pro objekt – a v nich už stačí kosinus a Pythagorova věta.',
      'geo.stepsTitle': 'Postup výpočtu',
      'geo.rowRight': 'Trojúhelník O T A′ má u vrcholu T pravý úhel, protože tečna ⟂ poloměr.',
      'geo.furtherTitle': 'A když je objekt ještě dál?',
      'geo.furtherText':
        'Pak se jeho spodek propadne pod obzor. Označíme γ úhel, o který objekt přesahuje bod dotyku, a schovanou výšku spočítáme ze stejného pravoúhlého trojúhelníku:',

      'map.title': 'Jak velký kus tělesa vlastně vidíš',
      'map.hint':
        'Kružnice na tělese jsou ve skutečném poměru – proto jsou z lidské výšky tak malé. Výřez vedle je jen zvětšenina téhož místa, uvnitř něj poměry pořád platí.',
      'map.trueScale': 'skutečný poměr',
      'map.zoom': 'výřez zvětšený {n}×',
      'map.noZoom': 'Vidíš takovou část tělesa, že je dobře vidět i na samotné kouli.',
      'map.ringHorizon': 'Tvůj obzor',
      'map.ringVanish': 'Kde zmizí {name}',
      'map.areaShare': 'plocha {area} · {share} povrchu',
      'map.overTheEdge': 'Objekt je tak vysoký, že by ho bylo vidět až za okrajem polokoule.',

      'geo.deriveTitle': 'Odvození obou funkcí',
      'geo.deriveIntro':
        'Z jediného pravoúhlého trojúhelníku nad tečnou vypadnou obě funkce, na kterých stojí celá aplikace. Stačí se pokaždé zeptat na něco jiného: jednou na vzdálenost, podruhé na výšku.',
      'geo.deriveOneTitle': '1. Vzdálenost zmizení jako funkce výšky objektu',
      'geo.deriveOneText':
        'Otázka režimu „Kdy zmizí?“: jak daleko dohlédnu na objekt vysoký h₂? Objekt zmizí přesně ve chvíli, kdy jeho špička leží na tečně. Vzdálenost po povrchu je pak součet obou oblouků.',
      'geo.deriveSlope': 'o kolik metrů se posune zmizení na každý další metr výšky',
      'geo.deriveOneShape':
        'Tvar křivky: v nule začíná na d₁, tedy na obzoru samotného pozorovatele, a hned vystřelí vzhůru – směrnice je tam nekonečná, protože arkuskosinus má v jedničce svislou tečnu. Pak se křivka stále víc ohýbá a nad hodnotu D_max = d₁ + πR/2 = {max} se nikdy nedostane. Je to odmocninová křivka, která nakonec narazí na strop.',
      'geo.deriveTwoTitle': '2. Potřebná výška jako funkce vzdálenosti',
      'geo.deriveTwoText':
        'Otázka režimu „Meze viditelnosti“: objekt je ve vzdálenosti D, jak vysoký musí být, aby vykoukl nad obzor? Ze stejné rovnice jen vyjádříme h₂ místo D.',
      'geo.deriveTwoShape':
        'Tvar křivky: až do vzdálenosti d₁ je nula – objekt je ještě před obzorem a je vidět celý. Hned za obzorem roste jako parabola, protože pro malé úhly je 1/cos β − 1 ≈ β²/2. Čím dál, tím strměji, a ve vzdálenosti D_max = {max} má svislou asymptotu: tam už nepomůže žádná výška.',
      'geo.deriveInverse':
        'Obě funkce jsou navzájem inverzní – jsou to tytéž body, jen s prohozenými osami. Proto má první křivka vodorovný strop přesně tam, kde má druhá svislou asymptotu: v D_max = {max}.',

      'geo.chartATitle': 'Graf 1: vzdálenost zmizení podle výšky objektu',
      'geo.chartAX': 'výška objektu h₂',
      'geo.chartAY': 'vzdálenost zmizení D',
      'geo.chartANote':
        'Obyčejné (lineární) osy, žádné logaritmy. Výřez se řídí vybraným objektem, aby byl vidět tvar křivky u výšek, které se opravdu používají. Zelený pás dole je příspěvek pozorovatele – ten je pořád stejný, ať je objekt jakkoli vysoký. Strop D_max = {max} leží daleko nad tímto výřezem.',
      'geo.chartBTitle': 'Graf 2: potřebná výška podle vzdálenosti',
      'geo.chartBX': 'vzdálenost D',
      'geo.chartBY': 'potřebná výška h₂ (v násobcích R = {r})',
      'geo.chartBNote':
        'Tentýž typ os, ale celý rozsah až k mezi dohledu {max}, aby byla vidět svislá asymptota. Všechno školní – Sněžka, Everest, plavba přes moře – se vejde do levého dolního rohu u nuly. Přesně proto kreslí režim „Meze viditelnosti“ tutéž křivku v logaritmických osách: jinak by na ní nebylo nic vidět.',
      'geo.markAsymptote': 'mez dohledu',

      'ctrl.observer': 'Kde stojíš ty',

      'ctrl.planet': 'Na jakém tělese jsi',
      'ctrl.planetHelp':
        'Menší těleso je zakřivené víc, takže obzor je mnohem blíž. Zkus Měsíc a pak Jupiter!',
      'ctrl.planetCustom': 'Vlastní',
      'ctrl.planetDiameter': 'Průměr tělesa (km)',
      'ctrl.planetInfo': 'poloměr {r} · obvod {c}',
      'ctrl.planetGaseous':
        'U Slunce a plynných obrů se „povrchem“ myslí vrchol mraků – stát se na něm nedá.',
      'ctrl.planetRefraction': 'Refrakce používá hodnotu pro pozemský vzduch.',

      'ctrl.observer': 'Kde stojíš ty',
      'ctrl.eyeHeight': 'Výška očí nad hladinou',
      'ctrl.eyeHelp': 'Čím výš máš oči, tím dál dohlédneš. Zkus si to!',
      'ctrl.presets': 'Rychlá volba',
      'preset.lying': 'Ležím na pláži',
      'preset.child': 'Dítě',
      'preset.adult': 'Dospělý',
      'preset.balcony': 'Balkon',
      'preset.tower': 'Rozhledna',
      'preset.cliff': 'Útes',
      'preset.plane': 'Letadlo',

      'ctrl.object': 'Na co se díváš',
      'ctrl.search': 'Hledat objekt…',
      'ctrl.custom': 'Vlastní objekt',
      'ctrl.customHeight': 'Výška objektu',
      'ctrl.noResults': 'Nic takového tu není.',

      'ctrl.distance': 'Jak daleko to je',
      'ctrl.distanceLabel': 'Vzdálenost po povrchu Země',
      'ctrl.distanceHelp': 'Táhni posuvníkem a sleduj, jak objekt klesá za obzor.',

      'ctrl.options': 'Nastavení',
      'ctrl.refraction': 'Počítat s ohybem světla (refrakce)',
      'ctrl.refractionHelp':
        'Vzduch ohýbá paprsky mírně dolů, takže ve skutečnosti dohlédneš asi o 8 % dál, než říká čistá geometrie.',
      'ctrl.reset': 'Vrátit na začátek',

      'res.heading': 'Čísla',
      'res.horizon': 'Tvůj obzor',
      'res.horizonSub': 'kam až dohlédneš',
      'res.beyond': 'Za obzorem',
      'res.beyondSub': 'o kolik je objekt dál',
      'res.hidden': 'Schováno',
      'res.hiddenSub': 'kolik ukrojila Země',
      'res.visible': 'Vidíš',
      'res.visibleSub': 'z celkových {total}',
      'res.bulge': 'Vyboulení',
      'res.bulgeSub': 'hrb vody uprostřed cesty',
      'res.vanish': 'Úplně zmizí',
      'res.vanishSub': 've vzdálenosti',
      'res.apparent': 'Zdánlivá velikost',
      'res.apparentSub': '{n}× Měsíc v úplňku',
      'res.dip': 'Pokles obzoru',
      'res.dipSub': 'o kolik je obzor níž než vodorovno',
      'res.planet': 'Těleso',
      'res.planetSub': 'poloměr {r}',

      'status.full.title': 'Vidíš celý objekt! 🎉',
      'status.full.text':
        'Z výšky {eye} dohlédneš {horizon} daleko. {object} stojí {distance} od tebe, tedy ještě před obzorem. Zakřivení Země ti zatím nic nebere.',
      'status.partial.title': 'Spodek je schovaný 🌊',
      'status.partial.text':
        'Z výšky {eye} dohlédneš {horizon} daleko. {object} stojí o {beyond} dál, takže spodních {hidden} je schováno za vyboulením Země. Zbývá ti horních {visible}, to je {percent} objektu.',
      'status.hidden.title': 'Nevidíš vůbec nic 🙈',
      'status.hidden.text':
        '{object} je {distance} daleko. Úplně zmizí už od {vanish}, takže se celý schoval za zakřivení Země. Vylez výš, nebo se přibliž!',
      'status.beyond.title': 'Za hranicí dohledu 🌑',
      'status.beyond.text':
        '{object} je {distance} daleko – to je dál než {maxSight}. Tady už nepomůže žádná výška: i nekonečně vysoká věž by musela prorůst skrz celé těleso. Ať vylezeš kamkoli, vidíš vždycky jen polovinu tělesa ({planet}) a druhá polovina zůstane schovaná.',

      'diagram.title': 'Boční pohled na Zemi',
      'diagram.you': 'TY',
      'diagram.horizon': 'obzor',
      'diagram.sightline': 'přímý pohled',
      'diagram.chord': 'přímá spojnice',
      'diagram.bulge': 'vyboulení',
      'diagram.hidden': 'schováno',
      'diagram.visible': 'vidíš',
      'diagram.eye': 'oči',
      'diagram.toHorizon': 'k obzoru',
      'diagram.beyond': 'za obzorem',
      'diagram.total': 'vzdálenost',
      'diagram.exaggeration': 'Výšky jsou {n}× zvětšené, jinak by zakřivení nebylo vidět.',
      'diagram.compression': 'Vzdálenosti jsou {n}× zvětšené oproti výškám.',
      'diagram.sameScale': 'Výšky i vzdálenosti mají tady stejné měřítko.',
      'diagram.widthNote': 'Šířky objektů nejsou v měřítku – přesné jsou výšky a vzdálenosti.',
      'diagram.beyondReach': 'za hranicí dohledu – tady nepomůže žádná výška',
      'diagram.antipode': 'protilehlý bod tělesa',
      'diagram.scalebar': 'měřítko vzdálenosti',
      'diagram.legendSurface': 'povrch Země',
      'diagram.legendSight': 'paprsek k tvému oku',
      'diagram.legendChord': 'přímá spojnice',

      'telescope.title': 'Pohled dalekohledem',
      'telescope.caption': 'Takhle to uvidíš na vlastní oči.',
      'telescope.nothing': 'Nad obzorem není vidět nic.',
      'telescope.ghost': 'čárkovaně = schovaná část',

      'vanish.heading': 'Kdy objekt zmizí za obzorem?',
      'vanish.big': 'Zmizí úplně ve vzdálenosti',
      'vanish.starts': 'Začne se schovávat od',
      'vanish.startsSub': 'do této vzdálenosti ho vidíš celý',
      'vanish.yourHorizon': 'Tvůj obzor',
      'vanish.objectHorizon': 'Obzor od špičky objektu',
      'vanish.explainTitle': 'Jak se to počítá?',
      'vanish.explain':
        'Vzdálenost k obzoru se spočítá jako {k} × odmocnina z výšky (výška v metrech, výsledek v kilometrech). Objekt zmizí, když se sečte tvůj obzor a obzor od jeho špičky: {a} + {b} = {c}.',
      'vanish.explainRefraction':
        'Se zapnutou refrakcí se místo {k0} počítá s {k1} – vzduch ohýbá světlo a vidíš o kousek dál.',
      'vanish.explainPlanet':
        'Číslo {k} platí pro těleso {planet}. Na menším tělese je menší, na větším větší.',
      'vanish.chartTitle': 'Kolik zůstane vidět podle vzdálenosti',
      'vanish.chartX': 'vzdálenost',
      'vanish.chartY': 'viditelná výška',
      'vanish.bandFull': 'celý vidět',
      'vanish.bandPartial': 'část schovaná',
      'vanish.bandHidden': 'neviditelný',
      'vanish.tableTitle': 'Tabulka po krocích',
      'vanish.colDistance': 'Vzdálenost',
      'vanish.colHidden': 'Schováno',
      'vanish.colVisible': 'Vidíš',
      'vanish.colPercent': 'Podíl',
      'vanish.tryIt': 'Ukaž mi to na obrázku',
      'vanish.compare': 'Porovnání: kdy zmizí ostatní objekty',
      'vanish.compareHint': 'Klikni na sloupec a objekt se rovnou nastaví.',

      'limits.heading': 'Jak vysoké to musí být, aby to bylo vidět?',
      'limits.sub': 'Čím dál je objekt, tím vyšší musí být. A od jisté vzdálenosti nepomůže už vůbec nic.',
      'limits.maxSight': 'Dál než sem nedohlédneš',
      'limits.maxSightSub': 'ani z nekonečně vysoké věže',
      'limits.antipode': 'Opačná strana tělesa',
      'limits.antipodeSub': 'polovina obvodu – tam není vidět nikdy nic',
      'limits.quarter': 'Obzor z nekonečné výšky',
      'limits.quarterSub': 'čtvrtina obvodu tělesa ({planet})',
      'limits.chartTitle': 'Jak vysoký objekt potřebuješ',
      'limits.chartX': 'vzdálenost',
      'limits.chartY': 'potřebná výška',
      'limits.never': 'sem nedohlédneš nikdy',
      'limits.asymptote': 'mez dohledu',
      'limits.curveNote':
        'Obě osy mají násobné měřítko – každý dílek je 10× větší než předchozí. Jinak by se křivka do obrázku nevešla.',
      'limits.dotsNote': 'Tečky jsou objekty z tvého seznamu. Leží přesně na křivce.',
      'limits.tableTitle': 'Kolik je potřeba',
      'limits.colDistance': 'Vzdálenost',
      'limits.colHeight': 'Potřebná výška',
      'limits.colCompare': 'Co by stačilo',
      'limits.enough': 'stačil by {name}',
      'limits.noneEnough': 'nic z tvého seznamu',
      'limits.explainTitle': 'Proč to nejde donekonečna?',
      'limits.explain':
        'Ať vylezeš jakkoli vysoko, uvidíš vždycky nanejvýš polovinu tělesa – přesně čtvrtinu obvodu na každou stranu. Obzor se proto nikdy nedostane dál než {quarter}. Když k tomu přičteš svůj vlastní obzor ({horizon}), vyjde mez {max}. Za ní by objekt musel prorůst skrz celé těleso ({planet}), a to nejde.',
      'limits.showAntipode': 'Postavit objekt na opačnou stranu',
      'limits.impossible': 'nemožné',
      'limits.radii': '{n}× poloměr tělesa',
      'limits.yourObject': 'tvůj objekt',

      'editor.heading': 'Editor objektů',
      'editor.intro':
        'Tady vzniká soubor objects.json. Přidej si vlastní kostel, rozhlednu nebo loď – i s obrázkem.',
      'editor.list': 'Objekty',
      'editor.add': '+ Nový objekt',
      'editor.duplicate': 'Duplikovat',
      'editor.delete': 'Smazat',
      'editor.deleteConfirm': 'Opravdu smazat „{name}“?',
      'editor.empty': 'Vyber objekt v seznamu, nebo přidej nový.',
      'editor.newObject': 'Nový objekt',
      'editor.section.basics': 'Základní údaje',
      'editor.section.texts': 'Texty',
      'editor.section.image': 'Obrázek',
      'editor.field.id': 'Kód (id)',
      'editor.field.category': 'Kategorie',
      'editor.field.nameCs': 'Název česky',
      'editor.field.nameEn': 'Název anglicky',
      'editor.field.height': 'Výška (m)',
      'editor.field.baseline': 'Stojí na',
      'editor.baseline.ground': 'souši',
      'editor.baseline.sea': 'moři',
      'editor.field.defaultDistance': 'Výchozí vzdálenost (km)',
      'editor.field.aspect': 'Poměr šířky k výšce obrázku',
      'editor.field.factCs': 'Zajímavost česky',
      'editor.field.factEn': 'Zajímavost anglicky',
      'editor.field.image': 'Obrázek objektu',
      'editor.image.choose': 'Vybrat obrázek…',
      'editor.image.clear': 'Odebrat obrázek',
      'editor.image.hint':
        'Obrázek se uloží přímo do JSON jako base64. Nejlépe funguje SVG, kde objekt stojí přesně na spodní hraně a špička se dotýká horní hrany.',
      'editor.image.none': 'Zatím bez obrázku',
      'editor.toolbar': 'Soubor',
      'editor.save': 'Uložit do prohlížeče',
      'editor.saved': 'Uloženo ✔',
      'editor.download': 'Stáhnout objects.json',
      'editor.load': 'Načíst ze souboru',
      'editor.factory': 'Obnovit výchozí sadu',
      'editor.factoryConfirm': 'Zahodit všechny změny a vrátit výchozí sadu objektů?',
      'editor.raw': 'Ukázat celý JSON',
      'editor.rawHide': 'Skrýt JSON',
      'editor.rawApply': 'Použít tento JSON',
      'editor.invalid': 'V datech je chyba:',
      'editor.storageNote':
        'Změny se ukládají do tohoto prohlížeče. Aby je měli i ostatní, stáhni objects.json a ulož ho vedle index.html.',
      'editor.previewTitle': 'Náhled objektu',
      'editor.previewNote': 'Takhle bude vypadat v diagramu.',
      'editor.count': 'objektů: {n}',

      'data.source.file': 'Data načtena ze souboru objects.json',
      'data.source.local': 'Data z tvých úprav v prohlížeči',
      'data.source.factory': 'Výchozí data zabudovaná v aplikaci',
      'data.source.fileFailed':
        'Soubor objects.json se nepodařilo načíst (stránka běží přímo z disku), použila se zabudovaná sada.',
      'data.readError': 'Soubor se nepodařilo přečíst: {error}',

      'err.notObject': 'Data musí být objekt JSON.',
      'err.noObjects': 'Chybí seznam „objects“.',
      'err.objectShape': 'Objekt č. {i}: musí mít id, název a kladnou výšku.',
      'err.duplicateId': 'Dvakrát stejné id: {id}',
      'err.parse': 'JSON se nepodařilo přečíst: {error}',

      'unit.m': 'm',
      'unit.km': 'km',
      'footer.note':
        'Všechny výpočty počítají s dokonalou koulí a hladkým povrchem mezi tebou a objektem. Těleso i jeho průměr se dají přepnout v panelu vlevo.',
      'footer.made': 'Za obzorem · školní pomůcka pro objevování zakřivení Země',
      'footer.license': 'Volně k použití ve školách (licence MIT)',
    },

    en: {
      'app.title': 'Beyond the Horizon',
      'app.subtitle': "Explore how the Earth's curve hides things from you",
      'app.langLabel': 'Language',

      'mode.see': 'What can I see?',
      'mode.vanish': 'When does it vanish?',
      'mode.limits': 'Limits of sight',
      'mode.geometry': 'The geometry',
      'mode.editor': 'Object editor',

      'geo.heading': 'Where the formulas come from',
      'geo.sub':
        'The whole calculation rests on one idea: a tangent is perpendicular to the radius. The rest is cosine and Pythagoras.',
      'geo.observerLabel': 'observer',
      'geo.objectLabel': 'object',
      'geo.exaggerated':
        'Angles are enlarged (the smaller one more) so they can be seen. The numbers are real.',
      'geo.tangentTitle': 'The key idea',
      'geo.tangentText':
        'The line of sight touches the surface at a single point T. A tangent is always perpendicular to the radius drawn to the point of contact, so the angle at T is a right angle. That gives two right triangles — O T A′ for the observer and O T B′ for the object — and cosine plus Pythagoras finish the job.',
      'geo.stepsTitle': 'The calculation',
      'geo.rowRight': 'Triangle O T A′ has a right angle at T, because the tangent ⟂ the radius.',
      'geo.furtherTitle': 'And if the object is further still?',
      'geo.furtherText':
        'Then its base sinks below the horizon. Call γ the angle by which the object overshoots the point of contact; the hidden height comes from the very same right triangle:',

      'map.title': 'How much of the body you actually see',
      'map.hint':
        'The circles on the body are at true scale — which is why they are so small from human height. The inset beside it is only a magnified view of the same spot; the ratios inside it still hold.',
      'map.trueScale': 'true scale',
      'map.zoom': 'inset magnified {n}×',
      'map.noZoom': 'You can see so much of this body that it shows up on the sphere itself.',
      'map.ringHorizon': 'Your horizon',
      'map.ringVanish': 'Where {name} vanishes',
      'map.areaShare': 'area {area} · {share} of the surface',
      'map.overTheEdge': 'The object is so tall it would still show from beyond the edge of the hemisphere.',

      'geo.deriveTitle': 'Deriving the two functions',
      'geo.deriveIntro':
        'One right triangle above the tangent yields both functions the whole app is built on. You only have to ask a different question each time: once for a distance, once for a height.',
      'geo.deriveOneTitle': '1. Vanishing distance as a function of the object’s height',
      'geo.deriveOneText':
        'The question behind “When does it vanish?”: how far can an object of height h₂ still be seen? It vanishes exactly when its top lies on the tangent, and the distance along the surface is then the sum of the two arcs.',
      'geo.deriveSlope': 'extra distance gained per extra metre of height',
      'geo.deriveOneShape':
        'The shape: at zero it starts at d₁, the observer’s own horizon, and immediately shoots upwards — the slope there is infinite, because arccosine has a vertical tangent at one. The curve then bends over more and more and never rises above D_max = d₁ + πR/2 = {max}. It is a square-root curve that finally hits a ceiling.',
      'geo.deriveTwoTitle': '2. Required height as a function of distance',
      'geo.deriveTwoText':
        'The question behind “Limits of sight”: the object sits at distance D, how tall must it be to peek over the horizon? The same equation, solved for h₂ instead of D.',
      'geo.deriveTwoShape':
        'The shape: it is flat zero out to d₁ — the object is still short of the horizon and fully visible. Just past the horizon it grows like a parabola, because for small angles 1/cos β − 1 ≈ β²/2. The further out, the steeper, and at D_max = {max} it has a vertical asymptote: beyond that no height helps at all.',
      'geo.deriveInverse':
        'The two functions are inverses of each other — the same points with the axes swapped. That is why the first curve has its horizontal ceiling exactly where the second has its vertical asymptote, at D_max = {max}.',

      'geo.chartATitle': 'Chart 1: vanishing distance against the object’s height',
      'geo.chartAX': 'height of the object h₂',
      'geo.chartAY': 'vanishing distance D',
      'geo.chartANote':
        'Plain linear axes, no logarithms. The window follows the selected object so the shape is visible at the heights actually used. The green band at the bottom is the observer’s own contribution — it stays the same however tall the object gets. The ceiling D_max = {max} lies far above this window.',
      'geo.chartBTitle': 'Chart 2: required height against distance',
      'geo.chartBX': 'distance D',
      'geo.chartBY': 'required height h₂ (in multiples of R = {r})',
      'geo.chartBNote':
        'The same kind of axes, but the full range out to the sight limit {max}, so the vertical asymptote shows. Everything from school — a mountain, Everest, a voyage across the sea — fits into the bottom-left corner near zero. That is exactly why the “Limits of sight” mode plots this same curve on logarithmic axes: otherwise there would be nothing to see.',
      'geo.markAsymptote': 'sight limit',

      'ctrl.observer': 'Where you stand',

      'ctrl.planet': 'Which body you are on',
      'ctrl.planetHelp':
        'A smaller body curves away faster, so its horizon is much closer. Try the Moon, then Jupiter!',
      'ctrl.planetCustom': 'Custom',
      'ctrl.planetDiameter': 'Diameter of the body (km)',
      'ctrl.planetInfo': 'radius {r} · circumference {c}',
      'ctrl.planetGaseous':
        'For the Sun and the gas giants the "surface" means the cloud tops — you could not stand there.',
      'ctrl.planetRefraction': 'Refraction uses the value for air on Earth.',

      'ctrl.observer': 'Where you stand',
      'ctrl.eyeHeight': 'Eye height above the surface',
      'ctrl.eyeHelp': 'The higher your eyes, the further you see. Give it a try!',
      'ctrl.presets': 'Quick pick',
      'preset.lying': 'Lying on the beach',
      'preset.child': 'A child',
      'preset.adult': 'A grown-up',
      'preset.balcony': 'Balcony',
      'preset.tower': 'Lookout tower',
      'preset.cliff': 'Cliff top',
      'preset.plane': 'Airplane',

      'ctrl.object': 'What you are looking at',
      'ctrl.search': 'Search objects…',
      'ctrl.custom': 'Custom object',
      'ctrl.customHeight': 'Object height',
      'ctrl.noResults': 'Nothing matches that.',

      'ctrl.distance': 'How far away it is',
      'ctrl.distanceLabel': "Distance along the Earth's surface",
      'ctrl.distanceHelp': 'Drag the slider and watch the object sink behind the horizon.',

      'ctrl.options': 'Settings',
      'ctrl.refraction': 'Include light bending (refraction)',
      'ctrl.refractionHelp':
        'Air bends light rays slightly downwards, so in reality you see about 8 % further than pure geometry says.',
      'ctrl.reset': 'Start over',

      'res.heading': 'The numbers',
      'res.horizon': 'Your horizon',
      'res.horizonSub': 'how far you can see',
      'res.beyond': 'Beyond the horizon',
      'res.beyondSub': 'how much further the object is',
      'res.hidden': 'Hidden',
      'res.hiddenSub': 'how much the Earth ate',
      'res.visible': 'You can see',
      'res.visibleSub': 'out of {total}',
      'res.bulge': 'Bulge',
      'res.bulgeSub': 'hump of water halfway across',
      'res.vanish': 'Vanishes completely',
      'res.vanishSub': 'at a distance of',
      'res.apparent': 'Apparent size',
      'res.apparentSub': '{n}× the full Moon',
      'res.dip': 'Horizon dip',
      'res.dipSub': 'how far the horizon sits below level',
      'res.planet': 'Body',
      'res.planetSub': 'radius {r}',

      'status.full.title': 'You can see all of it! 🎉',
      'status.full.text':
        'From a height of {eye} you can see {horizon} away. The {object} stands {distance} from you, still inside your horizon, so the curve takes nothing away yet.',
      'status.partial.title': 'The bottom is hidden 🌊',
      'status.partial.text':
        'From a height of {eye} you can see {horizon} away. The {object} stands {beyond} further, so the bottom {hidden} is hidden behind the bulge. You still see the top {visible}, which is {percent} of it.',
      'status.hidden.title': 'You see nothing at all 🙈',
      'status.hidden.text':
        'The {object} is {distance} away. It disappears completely beyond {vanish}, so the whole thing is behind the curve. Climb higher or come closer!',
      'status.beyond.title': 'Past every line of sight 🌑',
      'status.beyond.text':
        'The {object} is {distance} away — further than {maxSight}. No height helps here: even an infinitely tall tower would have to grow straight through the body. However high you climb you always see just one half of {planet}, and the other half stays hidden.',

      'diagram.title': 'Side view of the Earth',
      'diagram.you': 'YOU',
      'diagram.horizon': 'horizon',
      'diagram.sightline': 'line of sight',
      'diagram.chord': 'straight line',
      'diagram.bulge': 'bulge',
      'diagram.hidden': 'hidden',
      'diagram.visible': 'visible',
      'diagram.eye': 'eyes',
      'diagram.toHorizon': 'to the horizon',
      'diagram.beyond': 'beyond the horizon',
      'diagram.total': 'distance',
      'diagram.exaggeration': 'Heights are stretched {n}× — otherwise the curve would be invisible.',
      'diagram.compression': 'Distances are stretched {n}× compared with heights.',
      'diagram.sameScale': 'Heights and distances share the same scale here.',
      'diagram.widthNote': 'Object widths are not to scale — heights and distances are.',
      'diagram.beyondReach': 'past every line of sight — no height helps here',
      'diagram.antipode': 'the far side of the body',
      'diagram.scalebar': 'distance scale',
      'diagram.legendSurface': "Earth's surface",
      'diagram.legendSight': 'ray reaching your eye',
      'diagram.legendChord': 'straight line',

      'telescope.title': 'Through the telescope',
      'telescope.caption': 'This is what your eyes actually see.',
      'telescope.nothing': 'Nothing shows above the horizon.',
      'telescope.ghost': 'dashed = the hidden part',

      'vanish.heading': 'When does the object vanish?',
      'vanish.big': 'It disappears completely at',
      'vanish.starts': 'It starts to hide from',
      'vanish.startsSub': 'up to here you see all of it',
      'vanish.yourHorizon': 'Your horizon',
      'vanish.objectHorizon': 'Horizon from the object top',
      'vanish.explainTitle': 'How is it calculated?',
      'vanish.explain':
        'Distance to the horizon is {k} × the square root of the height (height in metres, answer in kilometres). The object vanishes when your horizon and the horizon from its top add up: {a} + {b} = {c}.',
      'vanish.explainRefraction':
        'With refraction switched on we use {k1} instead of {k0} — bent light lets you see a little further.',
      'vanish.explainPlanet':
        'The number {k} belongs to {planet}. It is smaller on a smaller body and larger on a bigger one.',
      'vanish.chartTitle': 'How much stays visible with distance',
      'vanish.chartX': 'distance',
      'vanish.chartY': 'visible height',
      'vanish.bandFull': 'fully visible',
      'vanish.bandPartial': 'partly hidden',
      'vanish.bandHidden': 'invisible',
      'vanish.tableTitle': 'Step by step',
      'vanish.colDistance': 'Distance',
      'vanish.colHidden': 'Hidden',
      'vanish.colVisible': 'Visible',
      'vanish.colPercent': 'Share',
      'vanish.tryIt': 'Show me the picture',
      'vanish.compare': 'Compare: when do the others vanish?',
      'vanish.compareHint': 'Click a bar to switch to that object.',

      'limits.heading': 'How tall must it be to show up at all?',
      'limits.sub': 'The further away it is, the taller it must be. And past a certain distance nothing helps at all.',
      'limits.maxSight': 'You can never see past',
      'limits.maxSightSub': 'not even from an infinitely tall tower',
      'limits.antipode': 'The far side of the body',
      'limits.antipodeSub': 'half the circumference — nothing there is ever visible',
      'limits.quarter': 'Horizon from infinite height',
      'limits.quarterSub': 'a quarter of the circumference of {planet}',
      'limits.chartTitle': 'How tall an object you need',
      'limits.chartX': 'distance',
      'limits.chartY': 'required height',
      'limits.never': 'never visible from here',
      'limits.asymptote': 'sight limit',
      'limits.curveNote':
        'Both axes step by multiples — every division is 10× the one before. Otherwise the curve would not fit on the page.',
      'limits.dotsNote': 'The dots are the objects from your list. They sit exactly on the curve.',
      'limits.tableTitle': 'What it takes',
      'limits.colDistance': 'Distance',
      'limits.colHeight': 'Required height',
      'limits.colCompare': 'What would be tall enough',
      'limits.enough': '{name} would do',
      'limits.noneEnough': 'nothing on your list',
      'limits.explainTitle': 'Why does it not go on for ever?',
      'limits.explain':
        'However high you climb, you see at most one half of the body — exactly a quarter of the circumference in each direction. So the horizon never reaches further than {quarter}. Add your own horizon ({horizon}) and you get the limit {max}. Beyond it an object would have to grow straight through the whole body ({planet}), and that cannot happen.',
      'limits.showAntipode': 'Put the object on the far side',
      'limits.impossible': 'impossible',
      'limits.radii': "{n}× the body's radius",
      'limits.yourObject': 'your object',

      'editor.heading': 'Object editor',
      'editor.intro':
        'This is where objects.json is made. Add your own church, tower or ship — picture included.',
      'editor.list': 'Objects',
      'editor.add': '+ New object',
      'editor.duplicate': 'Duplicate',
      'editor.delete': 'Delete',
      'editor.deleteConfirm': 'Really delete “{name}”?',
      'editor.empty': 'Pick an object from the list, or add a new one.',
      'editor.newObject': 'New object',
      'editor.section.basics': 'Basics',
      'editor.section.texts': 'Texts',
      'editor.section.image': 'Picture',
      'editor.field.id': 'Code (id)',
      'editor.field.category': 'Category',
      'editor.field.nameCs': 'Czech name',
      'editor.field.nameEn': 'English name',
      'editor.field.height': 'Height (m)',
      'editor.field.baseline': 'Stands on',
      'editor.baseline.ground': 'land',
      'editor.baseline.sea': 'sea',
      'editor.field.defaultDistance': 'Default distance (km)',
      'editor.field.aspect': 'Picture width-to-height ratio',
      'editor.field.factCs': 'Czech fun fact',
      'editor.field.factEn': 'English fun fact',
      'editor.field.image': 'Object picture',
      'editor.image.choose': 'Choose a picture…',
      'editor.image.clear': 'Remove picture',
      'editor.image.hint':
        'The picture is stored straight inside the JSON as base64. SVG works best, with the object resting exactly on the bottom edge and its tip touching the top edge.',
      'editor.image.none': 'No picture yet',
      'editor.toolbar': 'File',
      'editor.save': 'Save into this browser',
      'editor.saved': 'Saved ✔',
      'editor.download': 'Download objects.json',
      'editor.load': 'Load from a file',
      'editor.factory': 'Restore the default set',
      'editor.factoryConfirm': 'Throw away all changes and restore the default objects?',
      'editor.raw': 'Show the whole JSON',
      'editor.rawHide': 'Hide JSON',
      'editor.rawApply': 'Use this JSON',
      'editor.invalid': 'Something is wrong in the data:',
      'editor.storageNote':
        'Changes are stored in this browser only. To share them, download objects.json and put it next to index.html.',
      'editor.previewTitle': 'Object preview',
      'editor.previewNote': 'This is how it will look in the diagram.',
      'editor.count': 'objects: {n}',

      'data.source.file': 'Data loaded from objects.json',
      'data.source.local': 'Data from your edits in this browser',
      'data.source.factory': 'Default data built into the app',
      'data.source.fileFailed':
        'objects.json could not be loaded (the page runs straight from disk), so the built-in set is used.',
      'data.readError': 'The file could not be read: {error}',

      'err.notObject': 'The data must be a JSON object.',
      'err.noObjects': 'The “objects” list is missing.',
      'err.objectShape': 'Object #{i}: needs an id, a name and a positive height.',
      'err.duplicateId': 'Duplicate id: {id}',
      'err.parse': 'The JSON could not be read: {error}',

      'unit.m': 'm',
      'unit.km': 'km',
      'footer.note':
        'Every calculation assumes a perfect sphere with a smooth surface between you and the object. The body and its diameter can be changed in the panel on the left.',
      'footer.made': 'Beyond the Horizon · a classroom toy for discovering the curve of the Earth',
      'footer.license': 'Free to use in schools (MIT licence)',
    },
  };
})((window.HorizonLab = window.HorizonLab || {}));
