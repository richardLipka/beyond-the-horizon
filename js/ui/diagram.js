/**
 * diagram.js - hlavni bocni pohled na zakrivenou Zemi.
 * The main side-view diagram of the curved Earth.
 *
 * Kresli se v soustave "tetiva vodorovne": pozorovatel i objekt stoji na
 * y = 0 a povrch se mezi nimi vydouva nahoru (viz geometry.chordFrame).
 * Vodorovne a svisle meritko je RUZNE - jinak by zakriveni nebylo videt -
 * a pomer obou meritek se vypise primo do obrazku.
 *
 * Drawn in the "horizontal chord" frame: observer and object both rest on
 * y = 0 and the surface bulges upwards between them. Horizontal and vertical
 * scales differ (otherwise the curve would be invisible); the exaggeration
 * factor is printed into the picture itself.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const svg = HL.dom.svg;
  const G = HL.geometry;

  const VIEW = { w: 1000, h: 610 };
  const PAD = { left: 62, right: 46, top: 30, bottom: 168 };
  const PLOT = {
    x0: PAD.left,
    y0: PAD.top,
    x1: VIEW.w - PAD.right,
    y1: VIEW.h - PAD.bottom,
  };
  PLOT.w = PLOT.x1 - PLOT.x0;
  PLOT.h = PLOT.y1 - PLOT.y0;

  const ROW = {
    totalArrow: PLOT.y1 + 20,
    ruler: PLOT.y1 + 44,
    rulerLabels: PLOT.y1 + 64,
    brackets: PLOT.y1 + 90,
    bracketLabels: PLOT.y1 + 106,
    notes: PLOT.y1 + 132,
  };

  /**
   * Od jake vysky se teleso kresli jako koule ve skutecnem pomeru.
   *
   * Zvetsovat vysky proti vzdalenostem ma smysl jen tam, kde je zakriveni
   * jinak neviditelne - u cloveka na plazi je vyduti na 22 km vysoke devet
   * metru. Jakmile je ale pozorovatel (nebo objekt) vys nez tricetdvojina
   * polomeru, je zakriveni obrovske a kazde zvetseni uz jen lze: koule by
   * vysla zplostela. Od te vysky se proto kresli cele teleso ve SKUTECNEM
   * POMERU (sx = sy).
   *
   * Na Zemi je to 199 km, tedy pohodlne pod nejnizsi obeznou drahou (398 km)
   * a stejne pohodlne nad vsim pozemskym - letadlo leti v deseti kilometrech,
   * coz je sotva 0,0016 polomeru. Sestnactina by byla prilis natesno: nizka
   * draha je definovana prave jako sestnactina a po zaokrouhleni na kilometry
   * padla pod mez.
   * On the Earth that is 199 km, comfortably below the lowest orbit (398 km)
   * and just as comfortably above everything earthbound - an aeroplane flies
   * at ten kilometres, barely 0.0016 of the radius. A sixteenth would be too
   * tight: the low orbit is defined as exactly a sixteenth and, once rounded
   * to whole kilometres, fell below the threshold.
   *
   * Where the body starts being drawn as a ball at true proportions.
   * Stretching heights against distances only helps where the curvature is
   * otherwise invisible - for a person on the beach the bulge over 22 km is
   * nine metres. Once the observer (or the object) is higher than a
   * thirty-second of the radius the curvature is enormous and any stretch
   * becomes a lie: the ball would come out squashed. From there up the whole
   * body is drawn at TRUE proportions (sx = sy).
   */
  const GLOBE_FROM = 1 / 32;

  /**
   * Nejvetsi vyska obrazku v polomerech telesa.
   *
   * Ze stacionarni drahy Venuse (253 polomeru) by teleso ve skutecnem pomeru
   * vyslo mensi nez pixel. Nad devet polomeru uz se proto pozorovatel do
   * zaberu nebere: obrazek se sevre na samotne teleso a pozorovatel zustane
   * NAD nim. Jeho stozar i primka pohledu tam vedou dal a jsou porad
   * pravdive, jen orezane - a koule se tim naopak zvetsi.
   *
   * The tallest the picture may be, in radii of the body. From the stationary
   * orbit of Venus (253 radii) a true-scale body would come out smaller than
   * a pixel, so past nine radii the observer is no longer framed: the picture
   * closes in on the body itself and the observer stays ABOVE it. Their mast
   * and line of sight run on out of the frame, still true and merely clipped
   * - and the ball gets bigger for it.
   */
  const MAX_SPAN_RADII = 9;

  /** Misto nahore pro postavicku a popisek vysky oci [px]. */
  const GLOBE_TOP_ROOM = 34;

  let uidCounter = 0;
  const uid = (name) => `dg-${name}-${++uidCounter}`;

  /** "Hezky" krok pro meritko: 1, 2, 5, 10, 20, 50, … */
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const exponent = Math.floor(Math.log10(raw));
    const base = Math.pow(10, exponent);
    const n = raw / base;
    const multiple = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return multiple * base;
  }

  const line = (x1, y1, x2, y2, cls, extra) =>
    svg('line', Object.assign({ x1, y1, x2, y2, class: cls }, extra || {}));

  const clampTo = (value, min, max) => Math.min(max, Math.max(min, value));

  const text = (x, y, content, cls, anchor) =>
    svg('text', { x, y, class: cls, 'text-anchor': anchor || 'middle', text: content });

  /** Postavicka pozorovatele; stoji na (0,0) a roste nahoru. */
  function observerFigure(pixelHeight) {
    const s = pixelHeight / 100;
    return svg('g', { transform: `scale(${s})`, class: 'dg-observer' }, [
      svg('rect', { x: -11, y: -72, width: 22, height: 41, rx: 8, class: 'dg-observer-body' }),
      svg('rect', { x: -9.5, y: -33, width: 8, height: 33, rx: 3.4 }),
      svg('rect', { x: 1.5, y: -33, width: 8, height: 33, rx: 3.4 }),
      svg('rect', { x: 7, y: -70, width: 20, height: 7.5, rx: 3.6 }),
      svg('circle', { cx: 0, cy: -86, r: 13 }),
    ]);
  }

  /** Svisla kotovaci cara s koncovymi ryskami. */
  function verticalDimension(x, yTop, yBottom, cls, label, labelSide, labelDy) {
    const side = labelSide === 'left' ? -1 : 1;
    const group = svg('g', { class: cls });
    group.appendChild(line(x, yTop, x, yBottom, 'dg-dim-line'));
    group.appendChild(line(x - 5, yTop, x + 5, yTop, 'dg-dim-tick'));
    group.appendChild(line(x - 5, yBottom, x + 5, yBottom, 'dg-dim-tick'));
    if (label) {
      group.appendChild(
        text(
          x + side * 9,
          (yTop + yBottom) / 2 + 5 + (labelDy || 0),
          label,
          'dg-dim-label dg-halo',
          side < 0 ? 'end' : 'start'
        )
      );
    }
    return group;
  }

  /** Vodorovna kotovaci cara s koncovymi ryskami a popiskem uprostred. */
  function horizontalSpan(y, xFrom, xTo, cls, label, tickHeight) {
    const th = tickHeight || 6;
    const group = svg('g', { class: cls });
    group.appendChild(line(xFrom, y, xTo, y, 'dg-dim-line'));
    group.appendChild(line(xFrom, y - th, xFrom, y + th, 'dg-dim-tick'));
    group.appendChild(line(xTo, y - th, xTo, y + th, 'dg-dim-tick'));
    if (label) {
      group.appendChild(text((xFrom + xTo) / 2, y + 20, label, 'dg-dim-label dg-halo'));
    }
    return group;
  }

  /**
   * Vykresli cely diagram do zadaneho <svg> elementu.
   * @param {SVGElement} root
   * @param {{result: object, object: object}} model
   */
  function render(root, model) {
    const t = HL.i18n.t;
    const lang = HL.i18n.lang();
    const F = HL.format;
    const r = model.result;
    const obj = model.object || { aspect: 1, baseline: 'ground' };

    HL.dom.clear(root);
    root.setAttribute('viewBox', `0 0 ${VIEW.w} ${VIEW.h}`);
    root.setAttribute('role', 'img');

    const D = Math.max(r.distance, 100);
    const R = r.R;
    const frame = G.chordFrame(D, R);

    // ---- vzorkovani povrchu / sample the surface -------------------------
    // Oblouk se smi kreslit nanejvys ctvrtinu obvodu na kazdou stranu od
    // stredu tetivy - za tim uz se povrch stací zpet k pozorovateli a cara by
    // se sama pres sebe prekryvala.
    // The arc may only span a quarter of the circumference either side of the
    // chord's midpoint; beyond that the surface curves back and the path would
    // fold over itself.
    const quarter = (Math.PI / 2) * R;
    const marginU = 0.04 * D;
    const uMin = Math.max(-marginU, D / 2 - quarter);
    const uMax = Math.min(D + marginU, D / 2 + quarter);
    const SAMPLES = 240;
    const surface = [];
    for (let i = 0; i <= SAMPLES; i++) {
      surface.push(frame.point(uMin + ((uMax - uMin) * i) / SAMPLES, 0));
    }

    // ---- meze sveta / world bounds ---------------------------------------
    const eyePoint = frame.point(0, r.eyeHeight);
    const basePoint = frame.point(D, 0);
    const topPoint = frame.point(D, r.objectHeight);
    const sightCap = Math.min(
      isFinite(r.hiddenRaw) ? r.hiddenRaw : r.objectHeight,
      r.objectHeight * 1.45 + r.bulge + 1
    );
    const sightPoint = frame.point(D, sightCap);

    // Ramecek musi obsahnout oba aktery, ne jen povrch mezi nimi.
    //
    // Mistni svislice se na kraji tetivy odklani o polovinu stredoveho uhlu,
    // takze oko ve vysce h lezi o h*sin(D/2R) stranou od paty. Do vysky
    // zhruba 0,08 R je to proti sirce oblouku nic, ale na obezne draze uz to
    // vsechno prevalcuje: ze stacionarni drahy Zeme lezi oko pri sedmitisicove
    // vzdalenosti asi 22 000 km vlevo od oblouku, ktery je sam siroky 6 700 km.
    // Bez teto opravy postavicka vypadne z obrazku uplne.
    //
    // The frame has to contain both actors, not just the surface between them.
    // The local vertical tilts by half the central angle at the end of the
    // chord, so an eye at height h sits h*sin(D/2R) to the side of its own
    // feet. Up to about 0.08 R that is nothing next to the width of the arc,
    // but from orbit it dominates: from the Earth's stationary orbit, at a
    // distance of 7 000 km, the eye is some 22 000 km left of an arc only
    // 6 700 km wide, and without this the figure falls out of the picture.
    // V soustave tetivy lezi stred telesa na svisle ose ve vysce -R*cos(D/2R)
    // a povrch je kruznice o polomeru R kolem nej - v rezimu koule se kresli
    // cela. / In the chord frame the centre of the body sits on the vertical
    // axis at -R*cos(D/2R) and the surface is a circle of radius R about it;
    // in globe mode the whole of that circle is drawn.
    const globeMode = Math.max(r.eyeHeight, r.objectHeight) >= R * GLOBE_FROM;
    const inSpace = r.eyeHeight >= R * GLOBE_FROM;
    const centreY = -R * Math.cos(frame.half);

    let xMin;
    let xMax;
    let yMin;
    let yMax;
    let eyeFits = true;
    if (globeMode) {
      const bottom = centreY - R;
      const wanted = Math.max(centreY + R, eyePoint.y, topPoint.y) - bottom;
      eyeFits = wanted <= MAX_SPAN_RADII * R;
      // Kdyz se oko do obrazku vejde, je v nem - to je porad ta nejlepsi
      // varianta. Kdyz ne, nema smysl kvuli nemu drzet prazdne nebe: zabere se
      // samo teleso a pozorovatel zustane nad obrazkem. Prave proto se koule
      // v tu chvili naopak zvetsi.
      // If the eye fits it stays in the picture, which is always the better
      // one. If it does not, there is no sense keeping empty sky for it: the
      // frame closes in on the body itself and the observer stays above the
      // picture - which is exactly why the ball gets bigger at that point.
      yMin = bottom;
      yMax = eyeFits ? bottom + wanted : centreY + R * 1.35;
      xMin = Math.min(-R, topPoint.x, eyeFits ? eyePoint.x : 0);
      xMax = Math.max(R, topPoint.x, eyeFits ? eyePoint.x : 0);
      const pad = 0.03 * Math.max(xMax - xMin, yMax - yMin);
      xMin -= pad;
      xMax += pad;
      yMin -= pad;
      yMax += pad;
    } else {
      xMin = Math.min(surface[0].x, eyePoint.x, basePoint.x, topPoint.x);
      xMax = Math.max(surface[SAMPLES].x, eyePoint.x, basePoint.x, topPoint.x);
      let yLow = 0;
      let yHigh = 0;
      for (const p of surface) {
        if (p.y < yLow) yLow = p.y;
        if (p.y > yHigh) yHigh = p.y;
      }
      yHigh = Math.max(yHigh, eyePoint.y, topPoint.y, sightPoint.y);
      let span = yHigh - yLow;
      if (!(span > 0)) span = 1;
      yMax = yHigh + span * 0.17;
      yMin = yLow - span * 0.1;
    }

    const spanX = Math.max(xMax - xMin, 1e-9);
    const spanY = Math.max(yMax - yMin, 1e-9);
    const plotH = PLOT.h - (globeMode ? GLOBE_TOP_ROOM : 0);

    // ---- misto pro ikony u obou kraju / room for the icons at both edges --
    // Ikona objektu i postavicka maji sirku v PIXELECH, ktera na svetovych
    // souradnicich nezavisi. Kdyz se s ni nepocita, siroke objekty (Titanic,
    // hory) prelezou ramecek a clipPath je uriznе. Okraj se proto rezervuje
    // primo v pixelech a meritko se dopocita az na zbytek sirky.
    // The object icon and the observer figure have widths in PIXELS, which do
    // not follow from the world coordinates. Without reserving room for them,
    // wide objects overflow the frame and the clip path cuts them off. The
    // margins are therefore reserved in pixels and the scale gets what is left.
    const provisionalSx = globeMode ? Math.min(PLOT.w / spanX, plotH / spanY) : PLOT.w / spanX;
    const provisionalSy = globeMode ? provisionalSx : PLOT.h / spanY;
    const aspect = obj.aspect > 0 ? obj.aspect : 1;
    // Odhad je zamerne shora: skutecne sx uz bude mensi, takze skutecna ikona
    // vyjde nanejvys stejne siroka. / Deliberately an upper bound.
    const estObjectPx = Math.max(
      6,
      Math.hypot(
        (topPoint.x - basePoint.x) * provisionalSx,
        (topPoint.y - basePoint.y) * provisionalSy
      )
    );
    const estObjectWidth = Math.min(Math.max(estObjectPx * aspect, 12), PLOT.w * 0.26);
    const estEyePx = Math.abs(eyePoint.y - frame.point(0, 0).y) * provisionalSy;
    const estFigureHeight = Math.min(92, Math.max(14, estEyePx / 0.86));

    const padRight = Math.min(estObjectWidth / 2 + 8, PLOT.w * 0.2);
    // Postavicka trci vlevo o polomer hlavy, popisek "TY" je sirsi.
    const padLeft = Math.min(Math.max(24, 0.13 * estFigureHeight + 8), PLOT.w * 0.1);

    // V rezimu koule je meritko v obou smerech STEJNE, jinak by teleso nevyslo
    // kulate - a prave o to tu jde. Zbytek plochy se rozdeli na obe strany, aby
    // koule sedela uprostred.
    // In globe mode both scales are THE SAME, otherwise the body would not come
    // out round, which is the whole point; the slack is split evenly so the
    // ball sits in the middle.
    const innerW = PLOT.w - padLeft - padRight;
    const sx = globeMode ? Math.min(innerW / spanX, plotH / spanY) : innerW / spanX;
    const sy = globeMode ? sx : PLOT.h / spanY;
    const offsetX = padLeft + (globeMode ? (innerW - spanX * sx) / 2 : 0);
    const offsetY = globeMode ? (plotH - spanY * sy) / 2 : 0;
    const X = (wx) => PLOT.x0 + offsetX + (wx - xMin) * sx;
    const Y = (wy) => PLOT.y1 - offsetY - (wy - yMin) * sy;
    const exaggeration = sy / sx;

    // Povrch se kresli sirsi, nez je ramecek - prebytek orizne clipPath -
    // aby pod vyhrazenymi okraji nezustal prazdny klin. Ctvrtina obvodu plati
    // porad: za ni uz zadny povrch neni, tam se opravdu diva do prazdna.
    // The surface is drawn wider than the frame (the clip path trims it) so no
    // empty wedge is left under the reserved margins. The quarter-circumference
    // rule still holds: past it there is no more surface to draw.
    const drawn = [];
    if (globeMode) {
      // Cela kruznice telesa. Uhel probehne od -pi do pi, takze vznikne
      // uzavreny obrys - a protoze je meritko izotropni, je z nej opravdu kruh.
      // The whole circle of the body: the angle runs from -pi to pi, giving a
      // closed outline which, the scale being isotropic, really is a circle.
      for (let i = 0; i <= SAMPLES; i++) {
        const phi = -Math.PI + (2 * Math.PI * i) / SAMPLES;
        drawn.push({ x: R * Math.sin(phi), y: R * Math.cos(phi) + centreY });
      }
    } else {
      const overshootU = (Math.max(padLeft, padRight) / sx) * 1.3;
      const uDrawMin = Math.max(uMin - overshootU, D / 2 - quarter);
      const uDrawMax = Math.min(uMax + overshootU, D / 2 + quarter);
      for (let i = 0; i <= SAMPLES; i++) {
        drawn.push(frame.point(uDrawMin + ((uDrawMax - uDrawMin) * i) / SAMPLES, 0));
      }
    }

    // ---- definice / defs --------------------------------------------------
    // Barvy prichazeji ze zvoleneho telesa, takze obrazek odpovida tomu,
    // co je vybrane v menu. / Colours come from the selected body, so the
    // picture matches the menu.
    const look = model.look || HL.CUSTOM_PALETTE;
    const palette = look.colors;
    const onWater = obj.baseline === 'sea' && !!palette.water;
    const surfaceColors = onWater ? palette.water : palette.surface;
    const decorStyle = obj.baseline === 'sea' ? 'waves' : look.decor || 'rocks';
    const skyId = uid('sky');
    const bodyId = uid('body');
    const clipId = uid('clip');
    const hatchId = uid('hatch');
    const arrowId = uid('arrow');

    // Nad atmosferou je obloha cerna, at je teleso jakekoli - pozorovatel na
    // obezne draze uz je ve vesmiru. / Above the atmosphere the sky is black
    // whatever the body: an observer in orbit is in space.
    const skyStops = inSpace ? ['#04060e', '#080d1a', '#111a2c'] : palette.sky;

    root.appendChild(
      svg('defs', null, [
        svg('linearGradient', { id: skyId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
          svg('stop', { offset: '0%', 'stop-color': skyStops[0] }),
          svg('stop', { offset: '62%', 'stop-color': skyStops[1] }),
          svg('stop', { offset: '100%', 'stop-color': skyStops[2] }),
        ]),
        // Koule potrebuje radialni prechod, jinak vypada jako plocny kotouc.
        // A ball needs a radial gradient or it reads as a flat disc.
        globeMode
          ? svg('radialGradient', { id: bodyId, cx: '35%', cy: '30%', r: '78%' }, [
              svg('stop', { offset: '0%', 'stop-color': surfaceColors[0] }),
              svg('stop', { offset: '58%', 'stop-color': surfaceColors[1] }),
              svg('stop', { offset: '100%', 'stop-color': surfaceColors[2] }),
            ])
          : svg('linearGradient', { id: bodyId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
              svg('stop', { offset: '0%', 'stop-color': surfaceColors[0] }),
              svg('stop', { offset: '55%', 'stop-color': surfaceColors[1] }),
              svg('stop', { offset: '100%', 'stop-color': surfaceColors[2] }),
            ]),
        svg('clipPath', { id: clipId }, [
          svg('rect', { x: PLOT.x0, y: PLOT.y0, width: PLOT.w, height: PLOT.h, rx: 14 }),
        ]),
        svg(
          'pattern',
          { id: hatchId, width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
          [svg('line', { x1: 0, y1: 0, x2: 0, y2: 9, class: 'dg-hatch-line' })]
        ),
        svg(
          'marker',
          {
            id: arrowId,
            viewBox: '0 0 10 10',
            refX: 9,
            refY: 5,
            markerWidth: 7,
            markerHeight: 7,
            orient: 'auto-start-reverse',
          },
          [svg('path', { d: 'M0 0 L10 5 L0 10 Z', class: 'dg-arrowhead' })]
        ),
      ])
    );

    // ---- scena orezana na plochu grafu / clipped scene --------------------
    const scene = svg('g', { 'clip-path': `url(#${clipId})` });
    root.appendChild(scene);

    scene.appendChild(
      svg('rect', { x: PLOT.x0, y: PLOT.y0, width: PLOT.w, height: PLOT.h, fill: `url(#${skyId})` })
    );

    // Telesa bez atmosfery maji cernou oblohu s hvezdami. Pozice jsou
    // odvozene z pevneho semene, aby pri prekresleni neposkakovaly.
    // Airless bodies get a black sky with stars, seeded so they stay put.
    // Nad atmosferou plati totez i pro telesa, ktera ji maji.
    // Above the atmosphere the same holds for bodies that have one.
    if (look.airless || inSpace) {
      const stars = svg('g', { class: 'dg-stars' });
      let seed = 20260810;
      const random = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };
      for (let i = 0; i < 70; i++) {
        stars.appendChild(
          svg('circle', {
            cx: (PLOT.x0 + random() * PLOT.w).toFixed(1),
            cy: (PLOT.y0 + random() * PLOT.h * 0.75).toFixed(1),
            r: (0.7 + random() * 1.5).toFixed(2),
          })
        );
      }
      scene.appendChild(stars);
    }

    // teleso Zeme / the Earth's body
    let d = `M ${X(drawn[0].x).toFixed(2)} ${Y(drawn[0].y).toFixed(2)}`;
    for (let i = 1; i <= SAMPLES; i++) {
      d += ` L ${X(drawn[i].x).toFixed(2)} ${Y(drawn[i].y).toFixed(2)}`;
    }
    const surfacePath = d;
    scene.appendChild(
      svg('path', {
        // V rezimu koule je obrys uzavreny sam v sobe; jinak se dopusti
        // dolu pod ramecek. / In globe mode the outline closes on itself;
        // otherwise it is filled down past the bottom of the frame.
        d: globeMode ? `${d} Z` : `${d} L ${PLOT.x1} ${PLOT.y1 + 20} L ${PLOT.x0} ${PLOT.y1 + 20} Z`,
        fill: `url(#${bodyId})`,
      })
    );
    scene.appendChild(
      svg('path', {
        d: globeMode ? `${surfacePath} Z` : surfacePath,
        class: 'dg-surface-line',
        fill: 'none',
        stroke: surfaceColors[2],
      })
    );

    // Textura povrchu podle telesa: vlnky, tráva, kameny nebo oblacne pasy.
    // Surface texture per body: waves, grass, rocks or cloud bands.
    //
    // Na kouli se nekresli: znacky jsou v pevnych pixelech a smeruji "dolu" po
    // obrazovce, coz je smerem dovnitr telesa jen na jeho horni polovine - na
    // spodni by trcely do vesmiru. Radialni prechod udela kouli sam.
    // Not drawn in globe mode: the marks are a fixed pixel size and point
    // "down" the screen, which is into the body only on its upper half; on the
    // lower half they would stick out into space. The radial gradient does the
    // work of making it look round instead.
    const decor = svg('g', {
      class: 'dg-decor dg-decor-' + decorStyle,
      stroke: palette.accent,
    });
    for (let i = 6; i < SAMPLES && !globeMode; i += 12) {
      const p = drawn[i];
      const px = X(p.x);
      const py = Y(p.y);
      let d;
      if (decorStyle === 'waves') {
        d = `M ${px - 9} ${py + 9} q 4.5 -4 9 0 q 4.5 4 9 0`;
      } else if (decorStyle === 'grass') {
        d = `M ${px} ${py + 2} l 0 -7 M ${px - 4} ${py + 2} l 1.5 -5 M ${px + 4} ${py + 2} l -1.5 -5`;
      } else if (decorStyle === 'bands') {
        d = `M ${px - 15} ${py + 8} h 30 M ${px - 8} ${py + 16} h 16`;
      } else {
        d = `M ${px - 8} ${py + 9} a 4 3.2 0 0 1 8 0 M ${px + 3} ${py + 13} a 3 2.4 0 0 1 6 0`;
      }
      decor.appendChild(svg('path', { d: d }));
    }
    scene.appendChild(decor);

    // primá spojnice (tetiva) a vyboulení / chord and bulge
    const chordY = Y(0);
    scene.appendChild(
      line(X(frame.point(0, 0).x), chordY, X(basePoint.x), chordY, 'dg-chord')
    );

    const bulgeTopY = Y(r.bulge);
    if (chordY - bulgeTopY > 18) {
      const bulgeX = X(0);
      scene.appendChild(
        verticalDimension(bulgeX, bulgeTopY, chordY, 'dg-dim dg-dim-bulge', null)
      );
      scene.appendChild(
        text(bulgeX + 10, (bulgeTopY + chordY) / 2 - 4, t('diagram.bulge'), 'dg-small dg-halo', 'start')
      );
      scene.appendChild(
        text(
          bulgeX + 10,
          (bulgeTopY + chordY) / 2 + 14,
          F.height(r.bulge, lang),
          'dg-dim-label dg-halo',
          'start'
        )
      );
    }

    // Primka pohledu / line of sight.
    // Vedeme ji okem a bodem dotyku na obzoru - to jsou dva vzdy dobre
    // definovane body - a v pixelech ji pak jen prodlouzime za okraj. Drive
    // se druhy bod pocital z vysky primky daleko vpravo, coz u velkych
    // vzdalenosti vychazelo nekonecno.
    // Two always well-defined points: the eye and the tangency point. The line
    // is then simply extended in pixel space (the scene is clipped anyway).
    const tangentPoint = frame.point(r.horizon, 0);
    const eyePixel = { x: X(eyePoint.x), y: Y(eyePoint.y) };
    const tangentPixel = { x: X(tangentPoint.x), y: Y(tangentPoint.y) };
    const sightDx = tangentPixel.x - eyePixel.x;
    const sightDy = tangentPixel.y - eyePixel.y;
    const sightLength = Math.hypot(sightDx, sightDy) || 1;
    const sightReach = PLOT.w * 2.4;
    scene.appendChild(
      line(
        eyePixel.x,
        eyePixel.y,
        eyePixel.x + (sightDx / sightLength) * sightReach,
        eyePixel.y + (sightDy / sightLength) * sightReach,
        'dg-sight'
      )
    );

    // ---- objekt / the object ---------------------------------------------
    const baseP = { x: X(basePoint.x), y: Y(basePoint.y) };
    const topP = { x: X(topPoint.x), y: Y(topPoint.y) };
    const dx = topP.x - baseP.x;
    const dy = topP.y - baseP.y;
    const objectPx = Math.max(6, Math.hypot(dx, dy));
    const tilt = (Math.atan2(dx, -dy) * 180) / Math.PI;
    // Sirka ikony ma vlastni pomer stran, ale nesmi zabrat pul obrazku
    // (napr. Titanic je 5x delsi nez vyssi). / Icon keeps its own ratio,
    // clamped so very long objects do not swallow the picture.
    const objectWidth = Math.min(Math.max(objectPx * aspect, 12), PLOT.w * 0.26);
    const hiddenRatio = r.objectHeight > 0 ? Math.min(1, r.hidden / r.objectHeight) : 0;
    const hiddenPx = objectPx * hiddenRatio;

    const visibleClipId = uid('vis');
    const hiddenClipId = uid('hid');
    root.querySelector('defs').appendChild(
      svg('clipPath', { id: visibleClipId }, [
        svg('rect', { x: -2, y: -2, width: objectWidth + 4, height: Math.max(0, objectPx - hiddenPx) + 2 }),
      ])
    );
    root.querySelector('defs').appendChild(
      svg('clipPath', { id: hiddenClipId }, [
        svg('rect', { x: -2, y: objectPx - hiddenPx, width: objectWidth + 4, height: hiddenPx + 2 }),
      ])
    );

    function objectArt() {
      if (obj.image) {
        return svg('image', {
          href: obj.image,
          x: 0,
          y: 0,
          width: objectWidth,
          height: objectPx,
          preserveAspectRatio: 'none',
        });
      }
      return svg('rect', {
        x: 0,
        y: 0,
        width: objectWidth,
        height: objectPx,
        rx: Math.min(6, objectWidth / 4),
        class: 'dg-object-fallback',
      });
    }

    const objectGroup = svg('g', {
      transform: `translate(${baseP.x},${baseP.y}) rotate(${tilt.toFixed(3)}) translate(${-objectWidth / 2},${-objectPx})`,
    });
    if (hiddenPx > 0.5) {
      objectGroup.appendChild(
        svg('g', { 'clip-path': `url(#${hiddenClipId})`, class: 'dg-object-hidden' }, [objectArt()])
      );
      objectGroup.appendChild(
        svg('rect', {
          x: 0,
          y: objectPx - hiddenPx,
          width: objectWidth,
          height: hiddenPx,
          fill: `url(#${hatchId})`,
          class: 'dg-hidden-fill',
        })
      );
    }
    if (objectPx - hiddenPx > 0.5) {
      objectGroup.appendChild(svg('g', { 'clip-path': `url(#${visibleClipId})` }, [objectArt()]));
    }
    scene.appendChild(objectGroup);

    // ---- pozorovatel / the observer --------------------------------------
    const obsBase = frame.point(0, 0);
    const obsBaseP = { x: X(obsBase.x), y: Y(obsBase.y) };
    const eyeP = { x: X(eyePoint.x), y: Y(eyePoint.y) };
    const eyePixelHeight = Math.hypot(eyeP.x - obsBaseP.x, eyeP.y - obsBaseP.y);
    const oneMetreUp = frame.point(0, Math.max(1, r.eyeHeight));
    const obsTilt =
      (Math.atan2(X(oneMetreUp.x) - obsBaseP.x, obsBaseP.y - Y(oneMetreUp.y)) * 180) / Math.PI;

    // Postavicka ma pokud mozno presne odpovidat vysce oci (oci jsou v 86 %
    // jeji vysky). Kdyz je pozorovatel hodne vysoko - na utesu nebo v letadle -
    // postava zustane mala a vyjede nahoru na carkovanem "stozaru".
    // The figure matches the eye height where it can; for a cliff or a plane it
    // stays small and rides up a dashed mast instead.
    const idealFigure = eyePixelHeight / 0.86;
    let figureHeight = idealFigure;
    let figureLift = 0;
    if (idealFigure > 92) {
      figureHeight = 34;
      figureLift = eyePixelHeight - 0.86 * figureHeight;
    } else if (idealFigure < 14) {
      figureHeight = 14;
    }

    // Kdyz oko lezi nad obrazkem (velmi vysoka draha), postavicka se zastavi
    // u horniho okraje a stozar pod ni dostane znacku prerusene cary. Primka
    // pohledu se ale porad kresli ze SKUTECNE polohy oka - jinak by prestala
    // byt tecnou a s tim padne cely smysl obrazku. Ve vyskach, kde k tomu
    // dochazi, sviraji stozar a paprsek uz jen par stupnu, takze obe cary
    // vchazeji do obrazku prakticky spolecne.
    // When the eye lies above the picture (a very high orbit) the figure stops
    // at the top edge and the mast below it gets a break mark. The line of
    // sight is still drawn from the eye's TRUE position: shift it and it stops
    // being a tangent, which is the whole point of the picture. At the heights
    // where this happens the mast and the ray are only a few degrees apart, so
    // both enter the frame together anyway.
    const mastDx = eyeP.x - obsBaseP.x;
    const mastDy = eyeP.y - obsBaseP.y;
    let mastReach = 1;
    if (eyePixelHeight > 0) {
      // Kde stozar opousti bezpecnou cast ramecku - shora nebo do strany.
      // Where the mast leaves the safe part of the frame, upwards or sideways.
      const hit = (limit, delta, from) => {
        if (Math.abs(delta) < 1e-9) return 1;
        const t = (limit - from) / delta;
        return t > 0 ? t : 1;
      };
      if (mastDy < 0) mastReach = Math.min(mastReach, hit(PLOT.y0 + GLOBE_TOP_ROOM, mastDy, obsBaseP.y));
      if (mastDx < 0) mastReach = Math.min(mastReach, hit(PLOT.x0 + 20, mastDx, obsBaseP.x));
      if (mastDx > 0) mastReach = Math.min(mastReach, hit(PLOT.x1 - 20, mastDx, obsBaseP.x));
      mastReach = clampTo(mastReach, 0, 1);
      figureLift = Math.min(figureLift, mastReach * eyePixelHeight);
    }
    const eyeOffPicture = mastReach < 1 - 1e-9;

    if (figureLift > 0 || figureHeight > idealFigure + 1) {
      scene.appendChild(line(obsBaseP.x, obsBaseP.y, eyeP.x, eyeP.y, 'dg-pole'));
    }
    scene.appendChild(
      svg(
        'g',
        {
          transform: `translate(${obsBaseP.x},${obsBaseP.y}) rotate(${obsTilt.toFixed(
            3
          )}) translate(0,${-figureLift.toFixed(2)})`,
        },
        [observerFigure(figureHeight)]
      )
    );
    // Tecka oka jen tam, kde oko opravdu je. / The eye dot only where the eye
    // actually is - never at the place the figure was stopped.
    if (!eyeOffPicture) {
      scene.appendChild(svg('circle', { cx: eyeP.x, cy: eyeP.y, r: 5.5, class: 'dg-eye' }));
    }

    // Popisek patri k postavicce, ne k mistu na povrchu. Dokud postavicka stoji
    // na zemi, je to totez misto; jakmile vyjede na stozar - utes, letadlo,
    // obezna draha - musi jet s ni, jinak zustane "TY" nekde uplne jinde nez ty.
    // The label belongs to the figure, not to the spot on the ground. While the
    // figure stands on the surface these are the same place; once it rides up
    // the mast the label has to follow it.
    const feetT = eyePixelHeight > 0 ? Math.min(1, figureLift / eyePixelHeight) : 0;
    const feetX = obsBaseP.x + (eyeP.x - obsBaseP.x) * feetT;
    const feetY = obsBaseP.y + (eyeP.y - obsBaseP.y) * feetT;
    scene.appendChild(
      text(
        clampTo(feetX, PLOT.x0 + 22, PLOT.x1 - 22),
        clampTo(feetY + 26, PLOT.y0 + 14, PLOT.y1 - 8),
        t('diagram.you'),
        'dg-you dg-halo'
      )
    );

    // Znacka prerusene cary na stozaru: rika, ze skutecna vyska je vetsi, nez
    // se do obrazku vejde. / The break mark on the mast says the real height is
    // greater than the picture can hold.
    if (eyeOffPicture && eyePixelHeight > 0) {
      const ux = mastDx / eyePixelHeight;
      const uy = mastDy / eyePixelHeight;
      const breakGroup = svg('g', { class: 'dg-break' });
      for (const offset of [10, 19]) {
        const cx = feetX - ux * offset;
        const cy = feetY - uy * offset;
        breakGroup.appendChild(
          line(cx - uy * 9 - ux * 4, cy + ux * 9 - uy * 4, cx + uy * 9 + ux * 4, cy - ux * 9 + uy * 4)
        );
      }
      scene.appendChild(breakGroup);
    }

    // ---- bod obzoru / the horizon point -----------------------------------
    // V rezimu koule je nakreslena cela kruznice, takze bod dotyku na ni lezi
    // vzdy - obzor uz nemusi byt mezi pozorovatelem a objektem.
    // In globe mode the whole circle is drawn, so the tangency point is always
    // on it and the horizon no longer has to fall between the two actors.
    if (r.horizon > 0 && (globeMode || r.horizon <= uMax)) {
      const hp = frame.point(r.horizon, 0);
      const hx = X(hp.x);
      const hy = Y(hp.y);
      scene.appendChild(svg('circle', { cx: hx, cy: hy, r: 6, class: 'dg-horizon-dot' }));
      scene.appendChild(line(hx, hy, hx, hy - 34, 'dg-horizon-tick'));
      scene.appendChild(text(hx, hy - 42, t('diagram.horizon'), 'dg-label dg-halo'));
    }

    // ---- kotovani vysek u objektu / object height dimensions -------------
    const hiddenTopY = Y(frame.point(D, Math.min(r.hidden, r.objectHeight)).y);
    const hiddenSegment = baseP.y - hiddenTopY;
    const visibleSegment = hiddenTopY - topP.y;
    const nudge = hiddenSegment < 22 || visibleSegment < 22 ? 9 : 0;

    /** Postavi obe kóty na zadanou stranu objektu. */
    function buildDims(side) {
      const dimX =
        side === 'right' ? baseP.x + objectWidth / 2 + 16 : baseP.x - objectWidth / 2 - 16;
      const group = svg('g');
      if (r.hidden > 0) {
        group.appendChild(
          verticalDimension(dimX, hiddenTopY, baseP.y, 'dg-dim dg-dim-hidden',
            `${t('diagram.hidden')}: ${F.height(r.hidden, lang)}`, side, nudge)
        );
      }
      if (r.visible > 0) {
        group.appendChild(
          verticalDimension(dimX, topP.y, hiddenTopY, 'dg-dim dg-dim-visible',
            `${t('diagram.visible')}: ${F.height(r.visible, lang)}`, side, -nudge)
        );
      }
      return group;
    }

    // Popisky jsou dlouhe ("Schováno: 8 849 m") a v kazdem jazyce jinak, takze
    // se strana nehada podle pevneho odstupu - kóty se postavi vpravo, zmeri
    // a kdyz prelezou ramecek, prekresli se vlevo.
    // The labels are long and differ per language, so the side is not guessed
    // from a fixed offset: the dimensions are built on the right, measured, and
    // rebuilt on the left if they overflow the frame.
    let dims = buildDims('right');
    scene.appendChild(dims);
    try {
      const box = dims.getBBox();
      if (box.width > 0 && box.x + box.width > PLOT.x1 - 6) {
        scene.removeChild(dims);
        dims = buildDims('left');
        scene.appendChild(dims);
      }
    } catch (e) {
      /* obrazek jeste neni vykresleny / not laid out yet */
    }

    // upozorneni, ze uz nejde o vysku, ale o principialni mez
    // a note that this is no longer about height but about a hard limit
    if (r.beyondReach) {
      const warnRight = baseP.x > PLOT.x1 - 150;
      scene.appendChild(
        text(
          warnRight ? PLOT.x1 - 10 : baseP.x,
          Math.max(PLOT.y0 + 22, Math.min(topP.y, baseP.y) - 30),
          t('diagram.beyondReach'),
          'dg-warn dg-halo',
          warnRight ? 'end' : 'middle'
        )
      );
    }
    if (r.distance >= r.antipode * 0.999) {
      scene.appendChild(
        text(baseP.x, baseP.y + 26, t('diagram.antipode'), 'dg-you dg-halo', 'middle')
      );
    }

    // Vyska oci. Svisla kota ji meri poctive jen tehdy, kdyz stozar stoji
    // skoro svisle; na obezne draze miri silne sikmo a svisla cara vedle nej
    // by merila neco jineho, tak se misto ni napise jen popisek u oka.
    // The vertical dimension measures the eye height honestly only while the
    // mast stands nearly upright; from orbit it leans hard and a vertical line
    // beside it would measure something else, so the eye just gets a label.
    const eyeLabel = `${t('diagram.eye')}: ${F.height(r.eyeHeight, lang)}`;
    if (eyePixelHeight > 14 && Math.abs(eyeP.x - obsBaseP.x) < 26) {
      scene.appendChild(
        verticalDimension(obsBaseP.x + 30, eyeP.y, obsBaseP.y, 'dg-dim dg-dim-eye', eyeLabel, 'right')
      );
    } else {
      scene.appendChild(
        text(
          eyeP.x + 16,
          clampTo(eyeP.y - 10, PLOT.y0 + 14, PLOT.y1 - 8),
          eyeLabel,
          'dg-dim-label dg-halo',
          'start'
        )
      );
    }

    // ramecek plochy / plot frame
    root.appendChild(
      svg('rect', {
        x: PLOT.x0,
        y: PLOT.y0,
        width: PLOT.w,
        height: PLOT.h,
        rx: 14,
        class: 'dg-frame',
      })
    );

    // ---- meritko vzdalenosti pod grafem / distance ruler ------------------
    const axis = svg('g', { class: 'dg-axis' });
    axis.appendChild(line(PLOT.x0, ROW.ruler, PLOT.x1, ROW.ruler, 'dg-axis-line'));

    const step = niceStep(D / 6);
    const tickDecimals = step >= 10000 ? 0 : step >= 1000 ? 1 : 2;
    // Vodorovne meritko neni rovnomerne: kresli se prumet koule, takze u kraje
    // se rysky sbihaji. V rezimu koule se navic cela tetiva promitne do par
    // desitek pixelu a popisky by se slezly na hromadu, tak se vypisuji jen
    // ty, ktere maji od predchoziho dost mista. Rysky zustavaji vsechny.
    // The horizontal scale is not uniform - this is the projection of a ball,
    // so the ticks crowd towards the limb. In globe mode the whole chord can
    // project into a few dozen pixels and the labels would pile up, so only
    // those with room to spare are printed. Every tick still gets its mark.
    const LABEL_GAP = 58;
    let lastLabelX = -Infinity;
    for (let u = 0; u <= uMax + step * 0.01; u += step) {
      const tx = X(frame.point(u, 0).x);
      if (tx < PLOT.x0 - 1 || tx > PLOT.x1 + 1) continue;
      axis.appendChild(line(tx, ROW.ruler - 6, tx, ROW.ruler + 6, 'dg-axis-tick'));
      if (tx - lastLabelX < LABEL_GAP) continue;
      lastLabelX = tx;
      axis.appendChild(text(tx, ROW.rulerLabels, F.km(u, lang, tickDecimals), 'dg-small'));
    }
    root.appendChild(axis);

    // celkova vzdalenost / total distance
    root.appendChild(
      svg('g', { class: 'dg-total' }, [
        line(obsBaseP.x, ROW.totalArrow, baseP.x, ROW.totalArrow, 'dg-total-line', {
          'marker-start': `url(#${arrowId})`,
          'marker-end': `url(#${arrowId})`,
        }),
        text(
          (obsBaseP.x + baseP.x) / 2,
          ROW.totalArrow - 8,
          `${t('diagram.total')}: ${F.distance(r.distance, lang)}`,
          'dg-value'
        ),
      ])
    );

    // rozdeleni na "k obzoru" a "za obzorem"
    const horizonX = X(frame.point(Math.min(r.horizon, uMax), 0).x);
    const brackets = svg('g');
    if (r.horizon > 0) {
      brackets.appendChild(
        horizontalSpan(
          ROW.brackets,
          obsBaseP.x,
          Math.min(horizonX, PLOT.x1),
          'dg-span dg-span-horizon',
          `${t('diagram.toHorizon')}: ${F.distance(r.horizon, lang)}`
        )
      );
    }
    if (r.beyondHorizon > 0) {
      brackets.appendChild(
        horizontalSpan(
          ROW.brackets,
          horizonX,
          baseP.x,
          'dg-span dg-span-beyond',
          `${t('diagram.beyond')}: ${F.distance(r.beyondHorizon, lang)}`
        )
      );
    }
    root.appendChild(brackets);

    // ---- poznamky dole / footnotes ---------------------------------------
    const barMetres = niceStep(D / 5);
    const barPx = barMetres * sx;
    const barX = PLOT.x0;
    const barY = ROW.notes + 6;
    root.appendChild(
      svg('g', { class: 'dg-scalebar' }, [
        line(barX, barY, barX + barPx, barY, 'dg-scalebar-line'),
        line(barX, barY - 5, barX, barY + 5, 'dg-scalebar-line'),
        line(barX + barPx, barY - 5, barX + barPx, barY + 5, 'dg-scalebar-line'),
        text(barX, barY + 20, F.distance(barMetres, lang), 'dg-small', 'start'),
      ])
    );

    // Pri velkych objektech zblizka je naopak stlaceny svisly smer,
    // takze poznamku o meritku formulujeme podle situace.
    let scaleNote;
    if (globeMode) {
      scaleNote = t('diagram.trueShape');
    } else if (exaggeration >= 1.05) {
      scaleNote = t('diagram.exaggeration', {
        n: F.number(exaggeration, exaggeration < 20 ? 1 : 0, lang),
      });
    } else if (exaggeration <= 0.95) {
      const inverse = 1 / exaggeration;
      scaleNote = t('diagram.compression', { n: F.number(inverse, inverse < 20 ? 1 : 0, lang) });
    } else {
      scaleNote = t('diagram.sameScale');
    }
    root.appendChild(text(PLOT.x1, ROW.notes, scaleNote, 'dg-note', 'end'));
    root.appendChild(text(PLOT.x1, ROW.notes + 20, t('diagram.widthNote'), 'dg-note', 'end'));
  }

  HL.Diagram = { render, VIEW };
})((window.HorizonLab = window.HorizonLab || {}));
