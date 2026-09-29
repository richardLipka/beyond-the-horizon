/**
 * geometry-view.js - rezim "Geometrie": abstraktni obrazek pro stredni skolu.
 * The "geometry" mode: an abstract construction for high-school students.
 *
 * Kresli se klasicka ucebnicova figura kriticke polohy, kdy spicka objektu
 * prave lezi na obzoru. Tecna se dotyka kruznice v jedinem bode T a je kolma
 * na polomer OT, takze vzniknou dva pravouhle trojuhelniky O-T-A' a O-T-B'.
 * Z nich plyne uplne vsechno ostatni.
 *
 * The classic textbook figure of the critical configuration, where the top of
 * the object lies exactly on the horizon. The tangent touches the circle at a
 * single point T and is perpendicular to the radius OT, giving two right
 * triangles O-T-A' and O-T-B' from which everything else follows.
 *
 * Uhly v obrazku jsou zvetsene (jinak by byly neviditelne), ale figura je
 * sama v sobe konzistentni: pravy uhel je opravdu pravy a tecna opravdu
 * tecna. Vypsana cisla jsou skutecna.
 * The drawn angles are enlarged - otherwise they would be invisible - but the
 * figure stays internally consistent, and every printed number is the real one.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;
  const svg = HL.dom.svg;
  const G = HL.geometry;

  const VIEW = { w: 900, h: 500 };

  /** Nejvetsi kresleny polomer telesa. / The largest drawn radius. */
  const R_MAX = 236;
  /**
   * Nejmensi kresleny polomer. Pri velmi vysokem pozorovateli utika bod A'
   * po tecne pryc (vzdalenost od T je R*tg alfa) a koule by se scvrkla na
   * nic; pod touto mezi se proto zacne stlacovat uhel misto koule.
   * The smallest drawn radius: with a very high observer the point A' runs
   * away along the tangent (its distance from T is R*tan alpha) and the ball
   * would shrink to nothing, so below this the angle is compressed instead.
   */
  const R_MIN = 62;
  /** Vodorovny okraj na popisky. / Side margin left for labels. */
  const SIDE_ROOM = 96;
  /**
   * Kde lezi tecna, kdyz je koule nakreslena v plne velikosti. Nad ni se
   * vejdou tri rady popisku; drive tu bylo 216 a horni ctvrtina obrazku (i
   * stazeneho) zustala prazdna.
   * Where the tangent sits when the ball is drawn full size. Three rows of
   * labels fit above it; this used to be 216, which left the top quarter of
   * the picture (and of the download) empty.
   */
  const TOP_Y_BASE = 128;
  /** Nejnize, kam smi sahnout spodek koule. */
  const BOTTOM_ROOM = 470;

  /**
   * Nejvetsi a nejmensi kresleny uhel [rad].
   *
   * Dolni mez musi byt slusne velka: kreslena vyska vychazi jako
   * R*(1/cos t - 1), coz roste s druhou mocninou uhlu. Pri 0,13 rad vyjde
   * usek dlouhy 2 px a cela leva strana obrazku splyne do jednoho bodu.
   * Pri 0,40 rad ma usek asi 20 px a bod A' je od T vzdaleny pres 100 px,
   * takze se vsechny kóty vejdou vedle sebe.
   *
   * The lower bound has to be generous: the drawn height is R*(1/cos t - 1),
   * which grows with the square of the angle. At 0.13 rad that is a 2 px
   * stub and the whole left half collapses onto a point; at 0.40 rad it is
   * about 20 px, with A' over 100 px clear of T.
   */
  const DRAW_MAX = 0.72;
  const DRAW_MIN = 0.4;

  /**
   * Hodnoty, ktere ucitel muze nahradit otaznikem, v poradi, v jakem se
   * pocitaji. Prvni tri jsou zadane, ostatni se dopocitavaji.
   * The values a teacher may swap for a question mark, in the order they are
   * worked out. The first three are given, the rest are computed.
   */
  const QUANTITIES = [
    { key: 'R', symbol: 'R', given: true },
    { key: 'h1', symbol: 'h₁', given: true },
    { key: 'h2', symbol: 'h₂', given: true },
    { key: 'alpha', symbol: 'α' },
    { key: 't1', symbol: 't₁' },
    { key: 'd1', symbol: 'd₁' },
    { key: 'beta', symbol: 'β' },
    { key: 't2', symbol: 't₂' },
    { key: 'd2', symbol: 'd₂' },
    { key: 'D', symbol: 'D' },
    { key: 'k', symbol: 'k' },
  ];

  let uidCounter = 0;
  const uid = (name) => `gm-${name}-${++uidCounter}`;

  /**
   * Rozvrh figury pro dane uhly.
   *
   * Uhly se zvetsuji jen tehdy, kdyz jsou male; NIKDY se nezmensuji pod
   * skutecnou velikost. Z obezne drahy je alfa pres osmdesat stupnu a dosud
   * se stlacovala zpet na 0,72 rad, cimz obrazek tvrdil neco jineho, nez co
   * se pocita. Ted se misto toho zmensi koule: bod A' lezi od T ve vzdalenosti
   * R*tg alfa, takze polomer se voli tak, aby se cela figura vesla na sirku.
   * Uplne stlacit uhel je nutne az tam, kde by koule klesla pod R_MIN.
   *
   * The layout of the figure for the given angles. Angles are only ever
   * enlarged, NEVER shrunk below their true size: from orbit alpha is over
   * eighty degrees and used to be squeezed back to 0.72 rad, so the picture
   * claimed something other than what was being computed. The ball is scaled
   * instead - A' sits R*tan(alpha) from T, so the radius is chosen to make the
   * whole figure fit the width. Only where the ball would drop below R_MIN
   * does the angle itself have to give.
   */
  function layout(alpha, beta) {
    const largest = Math.max(alpha, beta, 1e-12);
    const scale = Math.max(1, DRAW_MAX / largest);
    let aDraw = Math.max(alpha * scale, DRAW_MIN);
    let bDraw = Math.max(beta * scale, DRAW_MIN);

    const availW = VIEW.w - 2 * SIDE_ROOM;
    // Kolik polomeru zabere figura vlevo a vpravo od stredu. Pod jeden polomer
    // to nikdy neklesne - tolik zabere sama koule.
    let left = Math.max(1, Math.tan(aDraw));
    let right = Math.max(1, Math.tan(bDraw));
    const room = availW / R_MIN;
    if (left + right > room) {
      if (left >= right) {
        left = Math.max(1, room - right);
        aDraw = Math.atan(left);
      } else {
        right = Math.max(1, room - left);
        bDraw = Math.atan(right);
      }
      if (left + right > room) {
        left = room / 2;
        right = room / 2;
        aDraw = Math.atan(left);
        bDraw = Math.atan(right);
      }
    }

    const radius = Math.min(R_MAX, availW / (left + right));
    const topY = TOP_Y_BASE + Math.max(0, (BOTTOM_ROOM - TOP_Y_BASE - 2 * radius) / 2);
    return {
      aDraw,
      bDraw,
      radius,
      topY,
      // Mala koule potrebuje mensi obloucky i odstupy, jinak by z ni vylezly.
      // A small ball needs smaller arcs and insets or they would stick out.
      k: radius / R_MAX,
      // Uhly odpovidaji skutecnosti? / Are the angles the real ones?
      trueAngles: Math.abs(aDraw - alpha) < 1e-9 && Math.abs(bDraw - beta) < 1e-9,
      trueLarger: Math.abs(Math.max(aDraw, bDraw) - largest) < 1e-9,
      // Velky uhel se musel stlacit - to uz neni zvetseni, ale opak.
      // The large angle had to be squeezed, which is the opposite of
      // enlarging and has to be said differently.
      squeezed: Math.max(aDraw, bDraw) < largest - 1e-9,
      O: {
        x: SIDE_ROOM + radius * left + (availW - radius * (left + right)) / 2,
        y: topY + radius,
      },
    };
  }

  const text = (x, y, content, cls, anchor) =>
    svg('text', { x, y, class: cls, 'text-anchor': anchor || 'middle', text: content });

  /**
   * Pojistka proti prekryvu popisku. Zmeri skutecne obalky vykresleneho textu
   * a kolidujici popisek posune po svem smeru, dokud se neuvolni. Porovnava se
   * vzdy jen s drive umistenymi popisky, takze se dva popisky nemohou honit
   * donekonecna a prochazeni vzdy skonci.
   *
   * A safety net against overlapping labels: measures the real rendered text
   * boxes and steps a colliding label along its own direction until it is
   * clear. Each label is only tested against earlier ones, so two labels can
   * never chase each other and the pass always terminates.
   */
  function spreadLabels(items) {
    let boxes;
    try {
      boxes = items.map((item) => item.node.getBBox());
    } catch (e) {
      return; // obrazek jeste neni vykresleny / not rendered yet
    }
    if (boxes.every((box) => box.width === 0 && box.height === 0)) return;

    const hits = (a, b) =>
      a.x + a.width > b.x + 1 &&
      b.x + b.width > a.x + 1 &&
      a.y + a.height > b.y + 1 &&
      b.y + b.height > a.y + 1;

    for (let i = 0; i < items.length; i++) {
      if (!items[i].dir) continue;
      for (let step = 0; step < 16; step++) {
        let collides = false;
        for (let j = 0; j < i; j++) {
          if (hits(boxes[i], boxes[j])) {
            collides = true;
            break;
          }
        }
        if (!collides) break;
        const y = Number(items[i].node.getAttribute('y')) + 8 * items[i].dir;
        if (y < 16 || y > VIEW.h - 8) break;
        items[i].node.setAttribute('y', y);
        boxes[i] = items[i].node.getBBox();
      }
    }
  }

  function mount(container, app) {
    function degrees(radians, lang) {
      const value = (radians * 180) / Math.PI;
      return HL.format.number(value, value < 1 ? 4 : 2, lang) + '°';
    }

    /**
     * Uhel do dosazeni: sest platnych cislic, aby zak, ktery si oblouk
     * prepocita na kalkulacce, dostal stejny vysledek jako aplikace. Se ctyrmi
     * desetinnymi misty (0,0419°) vychazelo d1 o 5 m vedle.
     * An angle for a substitution: six significant digits, so a pupil
     * recomputing the arc on a calculator gets the app's result. With four
     * decimals (0.0419 deg) d1 came out 5 m off.
     */
    function degreesExact(radians, lang) {
      const value = (radians * 180) / Math.PI;
      const decimals = Math.min(10, Math.max(2, 5 - Math.floor(Math.log10(Math.max(value, 1e-12)))));
      return HL.format.number(value, decimals, lang) + '°';
    }

    function renderFigure(root, model) {
      const t = HL.i18n.t;
      const lang = HL.i18n.lang();
      const F = HL.format;
      const r = model.result;
      const look = model.look || HL.CUSTOM_PALETTE;
      const palette = look.colors;

      HL.dom.clear(root);
      root.setAttribute('viewBox', `0 0 ${VIEW.w} ${VIEW.h}`);
      root.setAttribute('role', 'img');

      const R = r.R;
      const alpha = G.dip(r.eyeHeight, R);
      const beta = G.dip(r.objectHeight, R);

      // Uhly pro kresleni: male se roztahnou na DRAW_MAX se zachovanim pomeru,
      // uplne male se zvednou na DRAW_MIN, aby nezmizely - ale velke se uz
      // nestlacuji a misto nich se zmensi koule.
      // Small angles are stretched to DRAW_MAX keeping their ratio and the
      // tiniest are lifted to DRAW_MIN so they do not vanish; large ones are no
      // longer squeezed - the ball is scaled down instead.
      const plan = layout(alpha, beta);
      const aDraw = plan.aDraw;
      const bDraw = plan.bDraw;
      const R_DRAW = plan.radius;
      const TOP_Y = plan.topY;
      const O = plan.O;
      const k = plan.k;
      const point = (angle, radius) => ({
        x: O.x + radius * Math.sin(angle),
        y: O.y - radius * Math.cos(angle),
      });

      const T = { x: O.x, y: TOP_Y };
      const A = point(-aDraw, R_DRAW);
      const B = point(bDraw, R_DRAW);
      const eye = { x: O.x - R_DRAW * Math.tan(aDraw), y: TOP_Y };
      const top = { x: O.x + R_DRAW * Math.tan(bDraw), y: TOP_Y };

      // --- teleso / the body ------------------------------------------------
      const bodyId = uid('body');
      root.appendChild(
        svg('defs', null, [
          svg('linearGradient', { id: bodyId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
            svg('stop', { offset: '0%', 'stop-color': palette.surface[0] }),
            svg('stop', { offset: '60%', 'stop-color': palette.surface[1] }),
            svg('stop', { offset: '100%', 'stop-color': palette.surface[2] }),
          ]),
        ])
      );
      root.appendChild(
        svg('circle', {
          cx: O.x,
          cy: O.y,
          r: R_DRAW,
          fill: `url(#${bodyId})`,
          stroke: palette.surface[2],
          class: 'gm-body',
        })
      );

      // --- oblouky po povrchu / the arcs along the surface ------------------
      root.appendChild(
        svg('path', {
          d: `M ${A.x.toFixed(2)} ${A.y.toFixed(2)} A ${R_DRAW} ${R_DRAW} 0 0 1 ${T.x} ${T.y}`,
          class: 'gm-arc gm-arc-observer',
          fill: 'none',
        })
      );
      root.appendChild(
        svg('path', {
          d: `M ${T.x} ${T.y} A ${R_DRAW} ${R_DRAW} 0 0 1 ${B.x.toFixed(2)} ${B.y.toFixed(2)}`,
          class: 'gm-arc gm-arc-object',
          fill: 'none',
        })
      );

      // --- polomery / the radii ---------------------------------------------
      root.appendChild(svg('line', { x1: O.x, y1: O.y, x2: T.x, y2: T.y, class: 'gm-radius' }));
      root.appendChild(svg('line', { x1: O.x, y1: O.y, x2: eye.x, y2: eye.y, class: 'gm-hypotenuse' }));
      root.appendChild(svg('line', { x1: O.x, y1: O.y, x2: top.x, y2: top.y, class: 'gm-hypotenuse' }));

      // --- vysky nad povrchem / the heights ---------------------------------
      root.appendChild(
        svg('line', { x1: A.x, y1: A.y, x2: eye.x, y2: eye.y, class: 'gm-height gm-height-observer' })
      );
      root.appendChild(
        svg('line', { x1: B.x, y1: B.y, x2: top.x, y2: top.y, class: 'gm-height gm-height-object' })
      );

      // --- primka pohledu = tecna / the line of sight is the tangent ---------
      root.appendChild(
        svg('line', { x1: eye.x, y1: eye.y, x2: top.x, y2: top.y, class: 'gm-sight' })
      );

      // pravy uhel u bodu dotyku / the right angle at the tangency point
      const rightAngle = Math.max(9, 15 * k);
      root.appendChild(
        svg('path', {
          d: `M ${T.x + rightAngle} ${T.y} L ${T.x + rightAngle} ${T.y + rightAngle} L ${T.x} ${T.y + rightAngle}`,
          class: 'gm-right-angle',
          fill: 'none',
        })
      );
      // --- uhly u stredu / the angles at the centre -------------------------
      const arcR = 74 * k;
      const upper = point(0, arcR);
      const leftArc = point(-aDraw, arcR);
      const rightArc = point(bDraw, arcR);
      root.appendChild(
        svg('path', {
          d: `M ${leftArc.x.toFixed(2)} ${leftArc.y.toFixed(2)} A ${arcR} ${arcR} 0 0 1 ${upper.x} ${upper.y}`,
          class: 'gm-angle gm-angle-observer',
          fill: 'none',
        })
      );
      root.appendChild(
        svg('path', {
          d: `M ${upper.x} ${upper.y} A ${arcR} ${arcR} 0 0 1 ${rightArc.x.toFixed(2)} ${rightArc.y.toFixed(2)}`,
          class: 'gm-angle gm-angle-object',
          fill: 'none',
        })
      );

      // --- popisky / labels --------------------------------------------------
      // Vsechny popisky prochazi jednim mistem. Poradi urcuje prioritu: co je
      // drive, to zustava stat, pozdejsi se pripadne uhne smerem `dir`.
      // Every label goes through one place. Order is priority: earlier labels
      // stay put, later ones step aside along their `dir`.
      const labels = [];
      const put = (x, y, content, cls, anchor, dir) => {
        const node = text(x, y, content, cls, anchor);
        root.appendChild(node);
        labels.push({ node: node, dir: dir || 0 });
        return node;
      };
      // Popisek s hodnotou. V rezimu pro ucitele na nej jde klepnout a misto
      // hodnoty muze stat otaznik. / A label carrying a value. In teacher
      // mode it is clickable and may show a question mark instead.
      const ask = model.ask || (() => false);
      const valued = (x, y, key, prefix, value, cls, anchor, dir) => {
        const node = put(x, y, prefix, cls, anchor, dir);
        if (ask(key)) node.appendChild(svg('tspan', { class: 'gm-ask', text: '?' }));
        else node.appendChild(document.createTextNode(value));
        if (model.teacher) {
          node.setAttribute('data-q', key);
          node.classList.add('gm-q');
        }
        return node;
      };

      // --- body / the points -------------------------------------------------
      for (const p of [
        { at: O, r: 4.5 },
        { at: T, r: 4.5 },
        { at: eye, r: 4.5 },
        { at: top, r: 4.5 },
        { at: A, r: 3.5, small: true },
        { at: B, r: 3.5, small: true },
      ]) {
        root.appendChild(
          svg('circle', {
            cx: p.at.x,
            cy: p.at.y,
            r: p.r,
            class: 'gm-point' + (p.small ? ' gm-point-small' : ''),
          })
        );
      }

      put(O.x, O.y + 26, 'O', 'gm-symbol', 'middle', 1);
      put(T.x - 12, T.y + 20, 'T', 'gm-symbol', 'end', 1);
      put(T.x + 23, T.y + 30, '90°', 'gm-symbol-small', 'start', 1);
      put(eye.x, TOP_Y - 12, 'A′', 'gm-symbol', 'middle', -1);
      put(top.x, TOP_Y - 12, 'B′', 'gm-symbol', 'middle', -1);
      put(A.x - 6, A.y + 22, 'A', 'gm-symbol-small', 'end', 1);
      put(B.x + 6, B.y + 22, 'B', 'gm-symbol-small', 'start', 1);

      // --- tetivy nad tecnou / the tangent segments -------------------------
      put((eye.x + T.x) / 2, TOP_Y - 12, 't₁', 'gm-symbol gm-observer-fill', 'middle', -1);
      put((T.x + top.x) / 2, TOP_Y - 12, 't₂', 'gm-symbol gm-object-fill', 'middle', -1);

      // --- uhly u stredu / the angles at the centre -------------------------
      const alphaAt = point(-aDraw / 2, arcR + 24 * k);
      const betaAt = point(bDraw / 2, arcR + 24 * k);
      put(alphaAt.x, alphaAt.y, 'α', 'gm-symbol gm-observer-fill', 'middle', -1);
      put(betaAt.x, betaAt.y, 'β', 'gm-symbol gm-object-fill', 'middle', -1);

      // --- sloupce s hodnotami nad tecnou / value stacks above the tangent --
      valued(eye.x, TOP_Y - 38, 'alpha', 'α = ', degrees(alpha, lang), 'gm-label gm-observer-fill', 'middle', -1);
      valued(top.x, TOP_Y - 38, 'beta', 'β = ', degrees(beta, lang), 'gm-label gm-object-fill', 'middle', -1);
      put(eye.x, TOP_Y - 60, t('geo.observerLabel'), 'gm-role gm-observer-fill', 'middle', -1);
      put(top.x, TOP_Y - 60, t('geo.objectLabel'), 'gm-role gm-object-fill', 'middle', -1);

      // --- kóty uvnitr kruhu a u vysek / dimensions inside the circle -------
      // Do male koule se tri dlouhe kotovaci popisky (d1, d2, R) uz nevejdou -
      // u Neptunu z vysoke drahy se prekryvaly. Kdyz je koule mala, je zato
      // volno vlevo pod tecnou (koule se odsunula doprava), tak se srovnaji
      // tam pod sebe.
      // Three long dimensions (d1, d2, R) do not fit inside a small ball -
      // at Neptune from its high orbit they overlapped. A small ball has
      // been pushed to the right, though, which leaves the area under the
      // tangent free, so the dimensions line up there instead.
      const roomInside = k > 0.7;
      const stacked = (row) => ({ x: SIDE_ROOM, y: TOP_Y + 70 + row * 22 });
      const d1At = roomInside ? point(-aDraw / 2, R_DRAW - 34 * k) : stacked(0);
      const d2At = roomInside ? point(bDraw / 2, R_DRAW - 34 * k) : stacked(1);
      const dimAnchor = roomInside ? 'middle' : 'start';
      valued(d1At.x, d1At.y, 'd1', 'd₁ = ', F.distance(r.horizon, lang), 'gm-label gm-observer-fill', dimAnchor, 1);
      valued(d2At.x, d2At.y, 'd2', 'd₂ = ', F.distance(r.objectHorizon, lang), 'gm-label gm-object-fill', dimAnchor, 1);

      valued(
        A.x - 24,
        (A.y + eye.y) / 2 + 5,
        'h1',
        'h₁ = ',
        F.height(r.eyeHeight, lang),
        'gm-label gm-observer-fill',
        'end',
        -1
      );
      valued(
        B.x + 24,
        (B.y + top.y) / 2 + 5,
        'h2',
        'h₂ = ',
        F.height(r.objectHeight, lang),
        'gm-label gm-object-fill',
        'start',
        -1
      );

      const rAt = roomInside ? { x: O.x - 14, y: O.y - 46 } : stacked(2);
      // Tentyz polomer, se kterym se pocita - s refrakci ten efektivni.
      // The radius actually used - the effective one with refraction.
      valued(rAt.x, rAt.y, 'R', 'R = ', F.distance(R, lang), 'gm-label', roomInside ? 'end' : 'start', 1);

      // Kdyz uz se velky uhel nezvetsuje ani nestlacuje, rika to obrazek.
      // When the large angle is neither enlarged nor squeezed, say so.
      const note = plan.trueAngles
        ? 'geo.trueFigure'
        : plan.trueLarger
          ? 'geo.trueLargeAngle'
          : plan.squeezed
            ? 'geo.squeezed'
            : 'geo.exaggerated';
      put(VIEW.w / 2, VIEW.h - 12, t(note), 'gm-note', 'middle', 0);

      spreadLabels(labels);
    }

    /**
     * Radek vypoctu. Vsechny tri casti jsou vzorce (HL.math): obecny tvar,
     * dosazeni a vysledek. Klic vysledku dovoli v rezimu pro ucitele na
     * vysledek klepnout. / A calculation row; all three parts are formulas.
     * The result's key makes it clickable in teacher mode.
     */
    function formulaRow(symbolic, substituted, result, cls, key, teacher) {
      const answer = el('strong', { class: 'formula-result' }, [HL.math.render(result)]);
      if (key && teacher) answer.setAttribute('data-q', key);
      return el('div', { class: 'formula-row' + (cls ? ' ' + cls : '') }, [
        el('span', { class: 'formula-symbolic' }, [HL.math.render(symbolic)]),
        substituted ? el('span', { class: 'formula-sub' }, [HL.math.render(substituted)]) : null,
        answer,
      ]);
    }

    /** "a, b a c" / "a, b and c" */
    function listOf(items) {
      if (items.length < 2) return items.join('');
      return items.slice(0, -1).join(', ') + ' ' + HL.i18n.t('geo.and') + ' ' + items[items.length - 1];
    }

    /**
     * Lista nad konstrukci: rezim pro ucitele, cernobily tisk a tisk.
     * The strip above the construction: teacher mode, black and white, print.
     */
    function toolbar(state, isAsked) {
      const t = HL.i18n.t;
      const toggle = (checked, label, focus, onchange) =>
        el('label', { class: 'switch' }, [
          el('input', {
            type: 'checkbox',
            checked: checked,
            'data-focus': focus,
            onchange: (e) => onchange(e.target.checked),
          }),
          el('span', { class: 'switch-track' }, [el('span', { class: 'switch-knob' })]),
          el('span', { class: 'switch-text', text: label }),
        ]);

      const row = el('div', { class: 'geo-tools-row' }, [
        toggle(state.geoTeacher, t('geo.teacher'), 'teacher', (on) => app.setGeoTeacher(on)),
        toggle(state.geoBw, t('geo.bw'), 'bw', (on) => app.setGeoBw(on)),
        el('button', {
          type: 'button',
          class: 'export-btn geo-print',
          'data-focus': 'print',
          text: t('geo.print'),
          onclick: () => window.print(),
        }),
      ]);
      const box = el('section', { class: 'card geo-tools' }, [row]);
      if (!state.geoTeacher) return box;

      const chips = QUANTITIES.map((q) =>
        el('button', {
          type: 'button',
          class: 'chip geo-chip' + (isAsked(q.key) ? ' is-active' : ''),
          'aria-pressed': isAsked(q.key) ? 'true' : 'false',
          'aria-label': q.symbol + ' – ' + t('geo.q.' + q.key),
          title: t('geo.q.' + q.key),
          'data-focus': 'q-' + q.key,
          text: q.symbol,
          onclick: () => app.toggleAsked(q.key),
        })
      );
      box.appendChild(el('p', { class: 'hint', text: t('geo.teacherHint') }));
      box.appendChild(
        el('div', { class: 'geo-chips' }, [
          el('span', { class: 'chips-title', text: t('geo.askTitle') }),
          el('div', { class: 'chips' }, chips),
          el('div', { class: 'geo-presets' }, [
            el('button', {
              type: 'button',
              class: 'export-btn',
              'data-focus': 'preset-computed',
              text: t('geo.askComputed'),
              onclick: () => app.setAsked(QUANTITIES.filter((q) => !q.given).map((q) => q.key)),
            }),
            el('button', {
              type: 'button',
              class: 'export-btn',
              'data-focus': 'preset-none',
              text: t('geo.askNone'),
              onclick: () => app.setAsked([]),
            }),
          ]),
        ])
      );
      return box;
    }

    // Klepnuti na hodnotu v obrazku, v zadani nebo ve vysledku prepne
    // otaznik. Posluchac je jeden pro cely panel, protoze se panel pri
    // kazde zmene kresli znovu. / A click on a value in the figure, the
    // givens or a result toggles its question mark. One listener for the
    // whole panel, since the panel is redrawn on every change.
    container.addEventListener('click', (event) => {
      if (!app.state().geoTeacher) return;
      const hit = event.target.closest && event.target.closest('[data-q]');
      if (hit && container.contains(hit)) app.toggleAsked(hit.getAttribute('data-q'));
    });

    function update(state, result, object) {
      const t = HL.i18n.t;
      const lang = HL.i18n.lang();
      const F = HL.format;
      const R = result.R;
      const num = (value, decimals) => F.number(value, decimals, lang);

      const alpha = G.dip(result.eyeHeight, R);
      const beta = G.dip(result.objectHeight, R);
      const t1 = G.horizonLineOfSight(result.eyeHeight, R);
      const t2 = G.horizonLineOfSight(result.objectHeight, R);

      // Otazniky plati jen v rezimu pro ucitele; seznam si ale pamatuje i mimo
      // nej. / Question marks apply in teacher mode only; the list is kept.
      const teacher = !!state.geoTeacher;
      const known = new Set(QUANTITIES.map((q) => q.key));
      const askedList = (state.geoAsked || []).filter((key) => known.has(key));
      const isAsked = (key) => teacher && askedList.includes(key);
      // Cislo v dosazeni: otaznik, kdyz z nej jde vycist schovanou hodnotu.
      // Soucet R + h1 prozradi R i h1, proto se schova s kteroukoli z nich.
      // A number in a substitution becomes a question mark when a hidden
      // value could be read from it: R + h1 gives away both R and h1.
      const numOr = (keys, tex) => (keys.some(isAsked) ? '\\ask' : tex);
      const valueOr = (key, tex) => (isAsked(key) ? '\\ask' : tex);

      // Po prekresleni vratit fokus tam, kde byl (prepinace, stitky).
      // Put the focus back where it was after the redraw.
      const focused =
        document.activeElement && container.contains(document.activeElement)
          ? document.activeElement.getAttribute('data-focus')
          : null;

      HL.dom.clear(container);
      container.classList.toggle('geo-teacher', teacher);
      container.classList.toggle('geo-bw', !!state.geoBw);

      container.appendChild(
        el('header', { class: 'panel-head' }, [
          el('h2', { text: t('geo.heading') }),
          el('p', { class: 'panel-sub', text: t('geo.sub') }),
        ])
      );

      container.appendChild(toolbar(state, isAsked));

      // zadane hodnoty / the three given values
      const given = (key, cls, symbol, value, note) => {
        const item = el('div', { class: 'given-item' + (cls ? ' ' + cls : '') }, [
          el('span', { class: 'given-symbol', text: symbol }),
          isAsked(key) ? el('strong', { class: 'given-ask', text: '?' }) : el('strong', { text: value }),
          el('span', { class: 'given-note', text: note }),
        ]);
        if (teacher) item.setAttribute('data-q', key);
        return item;
      };
      container.appendChild(
        el('div', { class: 'given-strip' }, [
          // S refrakci se v celem vypoctu pouziva efektivni polomer. Drive se
          // do dosazeni psal skutecny a uhel se pocital z efektivniho, takze
          // radek "cos a = R / (R + h1)" nesedel s vlastnim vysledkem.
          // With refraction the whole calculation uses the effective radius.
          // The substitutions used to show the real one while the angle came
          // from the effective one, so "cos a = R / (R + h1)" disagreed with
          // its own result.
          given(
            'R',
            '',
            'R',
            F.distance(R, lang),
            result.refraction
              ? isAsked('R')
                ? t('geo.refractionAsked', { planet: app.planetName(state) })
                : t('geo.refractionR', { planet: app.planetName(state), r: F.distance(result.physicalRadius, lang) })
              : app.planetName(state)
          ),
          given('h1', 'given-observer', 'h₁', F.height(result.eyeHeight, lang), t('geo.observerLabel')),
          given('h2', 'given-object', 'h₂', F.height(result.objectHeight, lang), HL.i18n.pick(object.name, object.id)),
        ])
      );

      // Zadani ulohy - to, co maji zaci dopocitat, v poradi vypoctu.
      // The task: what the pupils have to work out, in the order of the
      // calculation.
      const wanted = QUANTITIES.filter((q) => isAsked(q.key)).map((q) => q.symbol);
      if (wanted.length) {
        container.appendChild(el('p', { class: 'geo-task', text: t('geo.task', { list: listOf(wanted) }) }));
      }

      const figure = svg('svg', { class: 'geometry-svg', xmlns: HL.dom.SVG_NS });
      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title card-title-row' }, [
            document.createTextNode(t('geo.figureTitle')),
            HL.Exporter.buttons(() => figure, wanted.length ? 'geometryTask' : 'geometry'),
          ]),
          figure,
        ])
      );
      renderFigure(figure, { result: result, look: HL.planetLook(state.planet), ask: isAsked, teacher: teacher });

      container.appendChild(
        el('section', { class: 'card explain-card' }, [
          el('h3', { class: 'card-title', text: t('geo.tangentTitle') }),
          el('p', { text: t('geo.tangentText') }),
        ])
      );

      // --- postup vypoctu / the calculation ---------------------------------
      const steps = el('div', { class: 'formula-list' });
      const row = (symbolic, substituted, answer, cls, key) =>
        steps.appendChild(formulaRow(symbolic, substituted, answer, cls, key, teacher));

      // Jen Pythagorova veta, kosinus, arkuskosinus a delka oblouku jako cast
      // obvodu. Uhly ve stupnich - radiany se na zacatku stredni skoly jeste
      // neuci. / Only Pythagoras, cosine, arccosine and an arc as a share of
      // the circumference. Angles in degrees: radians are not taught yet at
      // the start of high school.
      // Cisla jdou do vzorcu presne tak, jak je naformatoval jazyk.
      // Numbers enter the formulas exactly as the locale formatted them.
      const Q = HL.math.quantity;
      const Rm = numOr(['R'], `\\num{${num(R, 1)}}`);
      const side = (h, angle, tangent, arc, cls, names, keys) => {
        row(
          `cos ${names.a} = \\frac{R}{R + ${names.h}}`,
          `= \\frac{${Rm}}{${numOr(['R', keys.h], `\\num{${num(R + h, 1)}}`)}}`,
          `${names.a} = ${valueOr(keys.a, Q(degrees(angle, lang)))}`,
          cls,
          keys.a
        );
        row(
          `${names.t}^2 = (R + ${names.h})^2 − R^2 = ${names.h} · (2R + ${names.h})`,
          `${names.t} = \\sqrt{${numOr([keys.h], `\\num{${num(h, 2)}}`)} · ${numOr(['R', keys.h], `\\num{${num(2 * R + h, 1)}}`)}}`,
          `${names.t} = ${valueOr(keys.t, Q(F.distance(tangent, lang)))}`,
          cls,
          keys.t
        );
        row(
          `${names.d} = \\frac{2π · R · ${names.a}}{360°}`,
          `= \\frac{2π · ${Rm} · ${valueOr(keys.a, Q(degreesExact(angle, lang)))}}{360°}`,
          `${names.d} = ${valueOr(keys.d, Q(F.distance(arc, lang)))}`,
          cls,
          keys.d
        );
      };

      steps.appendChild(el('div', { class: 'formula-note', text: t('geo.rowRight') }));
      steps.appendChild(el('div', { class: 'formula-note', text: t('geo.rowPythagoras') }));
      side(
        result.eyeHeight,
        alpha,
        t1,
        result.horizon,
        'row-observer',
        { a: 'α', h: 'h_1', t: 't_1', d: 'd_1' },
        { a: 'alpha', h: 'h1', t: 't1', d: 'd1' }
      );
      steps.appendChild(el('div', { class: 'formula-note', text: t('geo.rowObject') }));
      side(
        result.objectHeight,
        beta,
        t2,
        result.objectHorizon,
        'row-object',
        { a: 'β', h: 'h_2', t: 't_2', d: 'd_2' },
        { a: 'beta', h: 'h2', t: 't2', d: 'd2' }
      );
      row(
        'D = d_1 + d_2',
        `= ${valueOr('d1', Q(F.distance(result.horizon, lang)))} + ${valueOr('d2', Q(F.distance(result.objectHorizon, lang)))}`,
        `D = ${valueOr('D', Q(F.distance(result.vanishDistance, lang)))}`,
        'row-total',
        'D'
      );
      steps.appendChild(el('div', { class: 'formula-note', text: t('geo.rowApprox') }));
      row(
        'h ≪ R ⇒ d ≈ t = \\sqrt{h · (2R + h)} ≈ \\sqrt{2R · h}',
        'k = \\frac{\\sqrt{2R}}{1000}',
        `k = ${valueOr('k', `\\num{${num(result.ruleConstant, 2)}}`)}`,
        'row-approx',
        'k'
      );

      container.appendChild(
        el('section', { class: 'card' }, [
          el('h3', { class: 'card-title', text: t('geo.stepsTitle') }),
          steps,
        ])
      );

      container.appendChild(
        el('section', { class: 'card explain-card' }, [
          el('h3', { class: 'card-title', text: t('geo.furtherTitle') }),
          el('p', { text: t('geo.furtherText') }),
          el('div', { class: 'formula-standalone' }, [HL.math.render('γ = \\frac{360° · (D − d_1)}{2π · R}', true)]),
          el('div', { class: 'formula-standalone' }, [
            HL.math.render('cos γ = \\frac{R}{R + x} ⇒ x = \\frac{R}{cos γ} − R', true),
          ]),
        ])
      );

      // --- odvozeni obou funkci a jejich grafy / the two functions ---------
      HL.Derivation.render(container, {
        result: result,
        objectName: HL.i18n.pick(object.name, object.id),
        ask: isAsked,
      });

      if (focused) {
        const again = container.querySelector(`[data-focus="${focused}"]`);
        if (again) again.focus();
      }
    }

    return { update };
  }

  HL.GeometryPanel = { mount };
})((window.HorizonLab = window.HorizonLab || {}));
