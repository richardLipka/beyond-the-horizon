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

  const VIEW = { w: 900, h: 560 };
  const O = { x: 450, y: 452 };
  const R_DRAW = 236;
  const TOP_Y = O.y - R_DRAW;

  /** Nejvetsi kresleny uhel a nejmensi, aby byl jeste videt [rad]. */
  const DRAW_MAX = 0.72;
  const DRAW_MIN = 0.13;

  let uidCounter = 0;
  const uid = (name) => `gm-${name}-${++uidCounter}`;

  const point = (angle, radius) => ({
    x: O.x + radius * Math.sin(angle),
    y: O.y - radius * Math.cos(angle),
  });

  const text = (x, y, content, cls, anchor) =>
    svg('text', { x, y, class: cls, 'text-anchor': anchor || 'middle', text: content });

  function mount(container, app) {
    function degrees(radians, lang) {
      const value = (radians * 180) / Math.PI;
      return HL.format.number(value, value < 1 ? 4 : 2, lang) + '°';
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

      // Uhly pro kresleni: vetsi z nich se roztahne na DRAW_MAX, pomer obou
      // zustane zachovany. Uplne male se jen zvedne na DRAW_MIN, aby nezmizel.
      const largest = Math.max(alpha, beta, 1e-12);
      const scale = DRAW_MAX / largest;
      const aDraw = Math.max(alpha * scale, DRAW_MIN);
      const bDraw = Math.max(beta * scale, DRAW_MIN);

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
      root.appendChild(
        svg('path', {
          d: `M ${T.x + 15} ${T.y} L ${T.x + 15} ${T.y + 15} L ${T.x} ${T.y + 15}`,
          class: 'gm-right-angle',
          fill: 'none',
        })
      );
      root.appendChild(text(T.x + 25, T.y + 26, '90°', 'gm-symbol-small', 'start'));

      // --- uhly u stredu / the angles at the centre -------------------------
      const arcR = 74;
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

      const alphaLabel = point(-aDraw / 2, arcR + 26);
      const betaLabel = point(bDraw / 2, arcR + 26);
      root.appendChild(text(alphaLabel.x, alphaLabel.y, 'α', 'gm-symbol gm-observer-fill'));
      root.appendChild(text(betaLabel.x, betaLabel.y, 'β', 'gm-symbol gm-object-fill'));

      // --- body / the points -------------------------------------------------
      for (const p of [
        { at: O, label: 'O', dx: 0, dy: 24 },
        { at: T, label: 'T', dx: -12, dy: -12 },
        { at: eye, label: "A′", dx: -14, dy: -12 },
        { at: top, label: "B′", dx: 14, dy: -12 },
      ]) {
        root.appendChild(svg('circle', { cx: p.at.x, cy: p.at.y, r: 4.5, class: 'gm-point' }));
        root.appendChild(
          text(p.at.x + p.dx, p.at.y + p.dy, p.label, 'gm-symbol', p.dx < 0 ? 'end' : p.dx > 0 ? 'start' : 'middle')
        );
      }
      root.appendChild(svg('circle', { cx: A.x, cy: A.y, r: 3.5, class: 'gm-point gm-point-small' }));
      root.appendChild(svg('circle', { cx: B.x, cy: B.y, r: 3.5, class: 'gm-point gm-point-small' }));
      root.appendChild(text(A.x - 10, A.y + 20, 'A', 'gm-symbol-small', 'end'));
      root.appendChild(text(B.x + 10, B.y + 20, 'B', 'gm-symbol-small', 'start'));

      // --- popisy s hodnotami / labels carrying the real numbers ------------
      root.appendChild(
        text(O.x - 12, (O.y + TOP_Y) / 2, `R = ${F.distance(r.physicalRadius, lang)}`, 'gm-label', 'end')
      );
      root.appendChild(
        text(
          (A.x + eye.x) / 2 - 12,
          (A.y + eye.y) / 2 - 6,
          `h₁ = ${F.height(r.eyeHeight, lang)}`,
          'gm-label gm-observer-fill',
          'end'
        )
      );
      root.appendChild(
        text(
          (B.x + top.x) / 2 + 12,
          (B.y + top.y) / 2 - 6,
          `h₂ = ${F.height(r.objectHeight, lang)}`,
          'gm-label gm-object-fill',
          'start'
        )
      );

      const d1Label = point(-aDraw / 2, R_DRAW + 22);
      const d2Label = point(bDraw / 2, R_DRAW + 22);
      root.appendChild(
        text(d1Label.x, d1Label.y, `d₁ = ${F.distance(r.horizon, lang)}`, 'gm-label gm-observer-fill')
      );
      root.appendChild(
        text(d2Label.x, d2Label.y, `d₂ = ${F.distance(r.objectHorizon, lang)}`, 'gm-label gm-object-fill')
      );

      root.appendChild(
        text((eye.x + T.x) / 2, TOP_Y - 14, 't₁', 'gm-symbol gm-observer-fill')
      );
      root.appendChild(text((T.x + top.x) / 2, TOP_Y - 14, 't₂', 'gm-symbol gm-object-fill'));

      root.appendChild(
        text(eye.x, TOP_Y - 40, `α = ${degrees(alpha, lang)}`, 'gm-label gm-observer-fill')
      );
      root.appendChild(text(top.x, TOP_Y - 40, `β = ${degrees(beta, lang)}`, 'gm-label gm-object-fill'));

      root.appendChild(text(eye.x, TOP_Y + 26, t('geo.observerLabel'), 'gm-role gm-observer-fill'));
      root.appendChild(text(top.x, TOP_Y + 26, t('geo.objectLabel'), 'gm-role gm-object-fill'));

      root.appendChild(text(VIEW.w / 2, VIEW.h - 12, t('geo.exaggerated'), 'gm-note'));
    }

    function formulaRow(symbolic, substituted, result, cls) {
      return el('div', { class: 'formula-row' + (cls ? ' ' + cls : '') }, [
        el('code', { class: 'formula-symbolic', text: symbolic }),
        substituted ? el('code', { class: 'formula-sub', text: substituted }) : null,
        el('strong', { class: 'formula-result', text: result }),
      ]);
    }

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

      HL.dom.clear(container);

      container.appendChild(
        el('header', { class: 'panel-head' }, [
          el('h2', { text: t('geo.heading') }),
          el('p', { class: 'panel-sub', text: t('geo.sub') }),
        ])
      );

      // zadane hodnoty / the three given values
      container.appendChild(
        el('div', { class: 'given-strip' }, [
          el('div', { class: 'given-item' }, [
            el('span', { class: 'given-symbol', text: 'R' }),
            el('strong', { text: F.distance(result.physicalRadius, lang) }),
            el('span', { class: 'given-note', text: app.planetName(state) }),
          ]),
          el('div', { class: 'given-item given-observer' }, [
            el('span', { class: 'given-symbol', text: 'h₁' }),
            el('strong', { text: F.height(result.eyeHeight, lang) }),
            el('span', { class: 'given-note', text: t('geo.observerLabel') }),
          ]),
          el('div', { class: 'given-item given-object' }, [
            el('span', { class: 'given-symbol', text: 'h₂' }),
            el('strong', { text: F.height(result.objectHeight, lang) }),
            el('span', { class: 'given-note', text: HL.i18n.pick(object.name, object.id) }),
          ]),
        ])
      );

      const figure = svg('svg', { class: 'geometry-svg', xmlns: HL.dom.SVG_NS });
      container.appendChild(el('section', { class: 'card' }, [figure]));
      renderFigure(figure, { result: result, look: HL.planetLook(state.planet) });

      container.appendChild(
        el('section', { class: 'card explain-card' }, [
          el('h3', { class: 'card-title', text: t('geo.tangentTitle') }),
          el('p', { text: t('geo.tangentText') }),
        ])
      );

      // --- postup vypoctu / the calculation ---------------------------------
      const steps = el('div', { class: 'formula-list' });

      steps.appendChild(
        el('div', { class: 'formula-note', text: t('geo.rowRight') })
      );
      steps.appendChild(
        formulaRow(
          'cos α = R / (R + h₁)',
          `= ${num(result.physicalRadius, 1)} / ${num(result.physicalRadius + result.eyeHeight, 1)}`,
          `α = ${degrees(alpha, lang)}`,
          'row-observer'
        )
      );
      steps.appendChild(
        formulaRow(
          't₁ = √( h₁ · (2R + h₁) )',
          `= √( ${num(result.eyeHeight, 2)} · ${num(2 * result.physicalRadius + result.eyeHeight, 1)} )`,
          `t₁ = ${F.distance(t1, lang)}`,
          'row-observer'
        )
      );
      steps.appendChild(
        formulaRow('d₁ = R · α', null, `d₁ = ${F.distance(result.horizon, lang)}`, 'row-observer')
      );
      steps.appendChild(
        formulaRow(
          'cos β = R / (R + h₂)',
          `= ${num(result.physicalRadius, 1)} / ${num(result.physicalRadius + result.objectHeight, 1)}`,
          `β = ${degrees(beta, lang)}`,
          'row-object'
        )
      );
      steps.appendChild(
        formulaRow(
          't₂ = √( h₂ · (2R + h₂) )',
          `= √( ${num(result.objectHeight, 2)} · ${num(2 * result.physicalRadius + result.objectHeight, 1)} )`,
          `t₂ = ${F.distance(t2, lang)}`,
          'row-object'
        )
      );
      steps.appendChild(
        formulaRow('d₂ = R · β', null, `d₂ = ${F.distance(result.objectHorizon, lang)}`, 'row-object')
      );
      steps.appendChild(
        formulaRow(
          'D = d₁ + d₂ = R · (α + β)',
          null,
          `D = ${F.distance(result.vanishDistance, lang)}`,
          'row-total'
        )
      );
      steps.appendChild(
        formulaRow(
          'h ≪ R  ⇒  d ≈ √(2 R h) = k · √h',
          `k = √(2R) / 1000`,
          `k = ${num(result.ruleConstant, 2)}`,
          'row-approx'
        )
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
          el('code', { class: 'formula-symbolic formula-standalone', text: 'h_skr = R · ( 1 / cos γ − 1 ),   γ = (D − d₁) / R' }),
        ])
      );
    }

    return { update };
  }

  HL.GeometryPanel = { mount };
})((window.HorizonLab = window.HorizonLab || {}));
