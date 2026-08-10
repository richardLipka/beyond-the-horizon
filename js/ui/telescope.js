/**
 * telescope.js - kruhove "okenko" ukazujici, jak objekt opravdu vypada.
 * The round eyepiece view: what your eyes actually see from the shore.
 *
 * Na rozdil od hlavniho diagramu tady neni zadne zvetseni vysek - jen se
 * uriznuta cast schova pod caru obzoru. / No vertical exaggeration here;
 * the hidden part simply sinks below the horizon line.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const svg = HL.dom.svg;

  const VIEW = { w: 440, h: 440 };
  const CENTRE = { x: 220, y: 210 };
  const RADIUS = 176;
  const HORIZON_Y = CENTRE.y + 74;

  let uidCounter = 0;
  const uid = (name) => `ts-${name}-${++uidCounter}`;

  function render(root, model) {
    const t = HL.i18n.t;
    const lang = HL.i18n.lang();
    const F = HL.format;
    const r = model.result;
    const obj = model.object || { aspect: 1, baseline: 'ground' };

    HL.dom.clear(root);
    root.setAttribute('viewBox', `0 0 ${VIEW.w} ${VIEW.h}`);
    root.setAttribute('role', 'img');

    const clipId = uid('clip');
    const skyId = uid('sky');
    const seaId = uid('sea');
    const aboveId = uid('above');

    // Stejna paleta jako v bocnim pohledu - obloha i povrch patri telesu
    // zvolenemu v menu. / Same palette as the side view.
    const look = model.look || HL.CUSTOM_PALETTE;
    const palette = look.colors;
    const onWater = obj.baseline === 'sea' && !!palette.water;
    const surfaceColors = onWater ? palette.water : palette.surface;

    root.appendChild(
      svg('defs', null, [
        svg('clipPath', { id: clipId }, [svg('circle', { cx: CENTRE.x, cy: CENTRE.y, r: RADIUS })]),
        svg('clipPath', { id: aboveId }, [
          svg('rect', {
            x: CENTRE.x - RADIUS,
            y: CENTRE.y - RADIUS,
            width: RADIUS * 2,
            height: HORIZON_Y - (CENTRE.y - RADIUS),
          }),
        ]),
        svg('linearGradient', { id: skyId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
          svg('stop', { offset: '0%', 'stop-color': palette.sky[0] }),
          svg('stop', { offset: '70%', 'stop-color': palette.sky[1] }),
          svg('stop', { offset: '100%', 'stop-color': palette.sky[2] }),
        ]),
        svg('linearGradient', { id: seaId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
          svg('stop', { offset: '0%', 'stop-color': surfaceColors[0] }),
          svg('stop', { offset: '100%', 'stop-color': surfaceColors[2] }),
        ]),
      ])
    );

    const scene = svg('g', { 'clip-path': `url(#${clipId})` });
    root.appendChild(scene);

    scene.appendChild(
      svg('rect', {
        x: CENTRE.x - RADIUS,
        y: CENTRE.y - RADIUS,
        width: RADIUS * 2,
        height: RADIUS * 2,
        fill: `url(#${skyId})`,
      })
    );

    if (look.airless) {
      const stars = svg('g', { class: 'ts-stars' });
      let seed = 20260810;
      const random = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };
      for (let i = 0; i < 45; i++) {
        stars.appendChild(
          svg('circle', {
            cx: (CENTRE.x - RADIUS + random() * RADIUS * 2).toFixed(1),
            cy: (CENTRE.y - RADIUS + random() * (HORIZON_Y - CENTRE.y + RADIUS)).toFixed(1),
            r: (0.7 + random() * 1.4).toFixed(2),
          })
        );
      }
      scene.appendChild(stars);
    }
    scene.appendChild(
      svg('rect', {
        x: CENTRE.x - RADIUS,
        y: HORIZON_Y,
        width: RADIUS * 2,
        height: CENTRE.y + RADIUS - HORIZON_Y,
        fill: `url(#${seaId})`,
      })
    );

    // ---- meritko / scale --------------------------------------------------
    const objectHeight = Math.max(r.objectHeight, 1e-6);
    const roomAbove = HORIZON_Y - (CENTRE.y - RADIUS) - 30;
    let scale = roomAbove / objectHeight;
    if (r.visible > 0) {
      const visiblePx = r.visible * scale;
      const wanted = 52;
      if (visiblePx < wanted) scale = Math.min(wanted / r.visible, roomAbove / r.visible);
    }

    // Siroke objekty (lode) zmensime rovnomerne, aby se nedeformovaly -
    // pomer "videt / schovano" tim zustane nedotcen.
    // Wide objects shrink uniformly, so nothing gets distorted and the
    // visible-to-hidden ratio stays exact.
    const aspect = obj.aspect > 0 ? obj.aspect : 1;
    const maxWidth = RADIUS * 1.5;
    if (objectHeight * scale * aspect > maxWidth) {
      scale = maxWidth / (objectHeight * aspect);
    }

    const heightPx = objectHeight * scale;
    const hiddenPx = Math.min(r.hidden, r.objectHeight) * scale;
    const widthPx = heightPx * aspect;
    const baseY = HORIZON_Y + hiddenPx;
    const topY = baseY - heightPx;
    const leftX = CENTRE.x - widthPx / 2;

    function art() {
      if (obj.image) {
        return svg('image', {
          href: obj.image,
          x: leftX,
          y: topY,
          width: widthPx,
          height: heightPx,
          preserveAspectRatio: 'none',
        });
      }
      return svg('rect', {
        x: leftX,
        y: topY,
        width: widthPx,
        height: heightPx,
        rx: 6,
        class: 'ts-fallback',
      });
    }

    // schovana cast jako duch / hidden part as a ghost
    if (hiddenPx > 0.5) {
      scene.appendChild(svg('g', { class: 'ts-ghost' }, [art()]));
      scene.appendChild(
        svg('rect', {
          x: leftX,
          y: HORIZON_Y,
          width: widthPx,
          height: hiddenPx,
          class: 'ts-ghost-box',
        })
      );
    }
    // viditelna cast / the visible part
    if (heightPx - hiddenPx > 0.5) {
      scene.appendChild(svg('g', { 'clip-path': `url(#${aboveId})` }, [art()]));
    }

    // hladina pres spodek objektu / the horizon line drawn over the base
    scene.appendChild(
      svg('rect', {
        x: CENTRE.x - RADIUS,
        y: HORIZON_Y,
        width: RADIUS * 2,
        height: CENTRE.y + RADIUS - HORIZON_Y,
        fill: `url(#${seaId})`,
        opacity: 0.88,
      })
    );
    scene.appendChild(
      svg('line', {
        x1: CENTRE.x - RADIUS,
        y1: HORIZON_Y,
        x2: CENTRE.x + RADIUS,
        y2: HORIZON_Y,
        class: 'ts-horizon',
        stroke: surfaceColors[2],
      })
    );
    const waves = svg('g', { class: 'ts-waves', stroke: palette.accent });
    for (let i = 0; i < 5; i++) {
      const y = HORIZON_Y + 14 + i * 17;
      const inset = i * 6;
      waves.appendChild(
        svg('path', {
          d: `M ${CENTRE.x - RADIUS + inset} ${y} q 16 -6 32 0 q 16 6 32 0 q 16 -6 32 0 q 16 6 32 0 q 16 -6 32 0 q 16 6 32 0 q 16 -6 32 0 q 16 6 32 0 q 16 -6 32 0 q 16 6 32 0 q 16 -6 32 0`,
        })
      );
    }
    scene.appendChild(waves);

    // ---- kotovani viditelne casti / dimension of the visible part ---------
    if (r.visible > 0) {
      const dimX = Math.min(leftX + widthPx + 18, CENTRE.x + RADIUS - 20);
      scene.appendChild(
        svg('g', { class: 'ts-dim ts-dim-visible' }, [
          svg('line', { x1: dimX, y1: topY, x2: dimX, y2: HORIZON_Y, class: 'ts-dim-line' }),
          svg('line', { x1: dimX - 5, y1: topY, x2: dimX + 5, y2: topY, class: 'ts-dim-tick' }),
          svg('line', { x1: dimX - 5, y1: HORIZON_Y, x2: dimX + 5, y2: HORIZON_Y, class: 'ts-dim-tick' }),
          svg('text', {
            x: dimX - 8,
            y: (topY + HORIZON_Y) / 2 + 5,
            class: 'ts-label ts-halo',
            'text-anchor': 'end',
            text: F.height(r.visible, lang),
          }),
        ])
      );
    } else {
      scene.appendChild(
        svg('text', {
          x: CENTRE.x,
          y: HORIZON_Y - 26,
          class: 'ts-empty ts-halo',
          'text-anchor': 'middle',
          text: t('telescope.nothing'),
        })
      );
    }

    if (hiddenPx > 6) {
      scene.appendChild(
        svg('text', {
          x: CENTRE.x,
          y: Math.min(HORIZON_Y + hiddenPx / 2 + 6, CENTRE.y + RADIUS - 16),
          class: 'ts-hidden-label',
          'text-anchor': 'middle',
          text: `${t('diagram.hidden')}: ${F.height(r.hidden, lang)}`,
        })
      );
    }

    // ---- obruba dalekohledu / eyepiece rim -------------------------------
    root.appendChild(
      svg('circle', { cx: CENTRE.x, cy: CENTRE.y, r: RADIUS, class: 'ts-rim' })
    );
    root.appendChild(
      svg('circle', { cx: CENTRE.x, cy: CENTRE.y, r: RADIUS - 9, class: 'ts-rim-inner' })
    );

    root.appendChild(
      svg('text', {
        x: CENTRE.x,
        y: VIEW.h - 26,
        class: 'ts-caption',
        'text-anchor': 'middle',
        text:
          r.visible > 0
            ? `${F.height(r.visible, lang)} / ${F.height(r.objectHeight, lang)}  ·  ${F.percent(
                r.visibleFraction,
                lang
              )}`
            : t('telescope.nothing'),
      })
    );
    root.appendChild(
      svg('text', {
        x: CENTRE.x,
        y: VIEW.h - 6,
        class: 'ts-subcaption',
        'text-anchor': 'middle',
        text: r.hidden > 0 ? t('telescope.ghost') : t('telescope.caption'),
      })
    );
  }

  HL.Telescope = { render, VIEW };
})((window.HorizonLab = window.HorizonLab || {}));
