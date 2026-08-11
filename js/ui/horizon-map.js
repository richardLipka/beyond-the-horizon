/**
 * horizon-map.js - kruhove schema: jak velky kus telesa vlastne vidis.
 * The circular map: how much of the body you can actually see.
 *
 * Teleso je nakreslene tak, jak by vypadalo z vesmiru primo nad pozorovatelem
 * (ortograficka projekce), a NA NEM lezi ve SKUTECNEM POMERU dva kruhy:
 *
 *   - tvuj obzor              polomer R*sin(alfa),   alfa = dip(h1)
 *   - kde zmizi vybrany objekt  polomer R*sin(alfa+beta), beta = dip(h2)
 *
 * O to tu jde: z lidske vysky je ten vetsi z nich na Zemi asi 5 % polomeru
 * disku a mensi z nich je desetina pixelu. Proto je vedle jeste vyrez,
 * rovnomerne zvetseny, s vypsanym zvetsenim - uvnitr vyrezu tedy pomery
 * porad sedi.
 *
 * The body is drawn as it would look from space directly above the observer
 * (orthographic), with the two circles laid on it AT TRUE SCALE. That is the
 * whole point: from human height the larger of the two is about 5 % of the
 * disc's radius on the Earth and the smaller is a tenth of a pixel. Hence the
 * magnified inset next to it, with the magnification printed - the ratios
 * inside the inset are still true.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const svg = HL.dom.svg;
  const G = HL.geometry;

  const VIEW = { w: 900, h: 530 };
  const GLOBE = { cx: 208, cy: 186, r: 150 };
  const INSET = { cx: 642, cy: 186, r: 145 };
  const CAPTION_DY = 30; // pod spodkem koule / below the bottom of the globe
  const NOTE_DY = 50;
  const LEGEND = { y: 432, step: 50, detailDy: 22, left: 50, right: 870 };

  let uidCounter = 0;
  const uid = (name) => `hm-${name}-${++uidCounter}`;

  const HALF_PI = Math.PI / 2;

  /**
   * Polomer vrchliku v ortograficke projekci. Za ctvrtinou obvodu uz vrchlik
   * prelezl pres okraj a zabira cely viditelny disk.
   */
  function projected(angle, radius) {
    if (angle >= HALF_PI) return radius;
    return radius * Math.sin(angle);
  }

  /** Hezke cislo pro meritko: 1, 2, 5, 10, 20, 50 ... */
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const base = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / base;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * base;
  }

  function text(x, y, content, cls, anchor) {
    return svg('text', { x, y, class: cls, 'text-anchor': anchor || 'middle', text: content });
  }

  /** Sirka vykresleneho textu; 0, kdyz obrazek jeste neni v dokumentu. */
  function measure(node) {
    try {
      return node.getComputedTextLength();
    } catch (e) {
      return 0;
    }
  }

  /**
   * Zkrati popisek s vypustkou, aby se vesel do dane sirky. Kdyz se text
   * jeste nevykreslil (skryty panel), meritko vraci nulu a nekrati se nic -
   * to je v poradku, pri dalsim vykresleni uz rozmery znamy budou.
   * Shortens a label with an ellipsis to fit. If the text has not been laid
   * out yet the measurement is zero and nothing is cut, which is fine.
   */
  function fitLabel(node, maxWidth) {
    if (!(maxWidth > 0) || measure(node) <= maxWidth) return;
    const full = node.textContent;
    let keep = full.length;
    while (keep > 1 && measure(node) > maxWidth) {
      keep -= 1;
      node.textContent = full.slice(0, keep).trimEnd() + '…';
    }
  }

  /**
   * @param {SVGElement} root
   * @param {{result: object, object: object, look: object, objectName: string, planetName: string}} model
   */
  function render(root, model) {
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
    const vanishAngle = Math.min(alpha + beta, Math.PI);
    // Vrchlik presahl pres okraj disku - objekt by zmizel az za viditelnou
    // polokouli. / The cap has run past the limb of the visible hemisphere.
    const overTheEdge = vanishAngle >= HALF_PI;

    const globeId = uid('globe');
    const clipId = uid('clip');

    root.appendChild(
      svg('defs', null, [
        svg('radialGradient', { id: globeId, cx: '35%', cy: '30%', r: '78%' }, [
          svg('stop', { offset: '0%', 'stop-color': palette.surface[0] }),
          svg('stop', { offset: '58%', 'stop-color': palette.surface[1] }),
          svg('stop', { offset: '100%', 'stop-color': palette.surface[2] }),
        ]),
        svg('clipPath', { id: clipId }, [svg('circle', { cx: INSET.cx, cy: INSET.cy, r: INSET.r })]),
      ])
    );

    // ---- teleso ve skutecnem pomeru / the body at true scale ---------------
    const horizonR = projected(alpha, GLOBE.r);
    const vanishR = projected(vanishAngle, GLOBE.r);

    // Zvetsuje se jen tehdy, kdyz je co zvetsovat. Kdyz vyrez odpadne, koule
    // se posune doprostred, aby po nem nezbyla prazdna pulka obrazku.
    // The inset only appears when there is something to magnify; without it
    // the globe moves to the middle so no empty half is left behind.
    const showInset = vanishR < GLOBE.r * 0.5;
    const globe = { cx: showInset ? GLOBE.cx : VIEW.w / 2, cy: GLOBE.cy, r: GLOBE.r };

    root.appendChild(
      svg('circle', { cx: globe.cx, cy: globe.cy, r: globe.r, fill: `url(#${globeId})`, class: 'hm-globe' })
    );
    root.appendChild(svg('circle', { cx: globe.cx, cy: globe.cy, r: vanishR, class: 'hm-vanish-area' }));
    root.appendChild(svg('circle', { cx: globe.cx, cy: globe.cy, r: horizonR, class: 'hm-horizon-area' }));
    root.appendChild(svg('circle', { cx: globe.cx, cy: globe.cy, r: 2.6, class: 'hm-observer' }));

    root.appendChild(
      text(globe.cx, globe.cy + globe.r + CAPTION_DY,
        `${model.planetName} · ⌀ ${F.distance(2 * r.physicalRadius, lang)}`, 'hm-caption')
    );
    root.appendChild(
      text(globe.cx, globe.cy + globe.r + NOTE_DY, showInset ? t('map.trueScale') : t('map.noZoom'), 'hm-note')
    );

    // ---- vyrez / the magnified inset ---------------------------------------
    if (showInset) {
      // Vetsi z obou kruhu se roztahne na 72 % polomeru vyrezu, mensi se
      // dopocita ve stejnem meritku - pomer mezi nimi tedy zustava pravdivy.
      const spanMetres = Math.max(R * Math.sin(vanishAngle), 1e-6);
      const scale = (INSET.r * 0.72) / spanMetres; // px na metr
      const magnification = scale / (GLOBE.r / R);

      root.appendChild(
        svg('circle', { cx: INSET.cx, cy: INSET.cy, r: INSET.r, fill: `url(#${globeId})`, class: 'hm-inset-face' })
      );

      const group = svg('g', { 'clip-path': `url(#${clipId})` });
      group.appendChild(
        svg('circle', { cx: INSET.cx, cy: INSET.cy, r: R * Math.sin(vanishAngle) * scale, class: 'hm-vanish-area' })
      );
      group.appendChild(
        svg('circle', { cx: INSET.cx, cy: INSET.cy, r: R * Math.sin(alpha) * scale, class: 'hm-horizon-area' })
      );

      // meritko / a scale bar, so the inset is readable on its own
      const barMetres = niceStep((INSET.r / scale) * 0.55);
      const barPx = barMetres * scale;
      const barY = INSET.cy + INSET.r - 26;
      const barX = INSET.cx - barPx / 2;
      group.appendChild(
        svg('path', {
          d: `M ${barX} ${barY - 5} V ${barY} H ${barX + barPx} V ${barY - 5}`,
          class: 'hm-scalebar',
          fill: 'none',
        })
      );
      group.appendChild(text(INSET.cx, barY - 10, F.distance(barMetres, lang), 'hm-scale-label'));
      root.appendChild(group);

      // Tecka pozorovatele nesmi prerust kruh obzoru, jinak by ho u vysokych
      // objektu (kde je obzor proti bodu zmizeni maly) uplne prekryla.
      // The observer dot must never outgrow the horizon circle, or it would
      // paint over it entirely when the object is very tall.
      const dotR = Math.min(3.4, Math.max(1.2, R * Math.sin(alpha) * scale * 0.55));
      root.appendChild(svg('circle', { cx: INSET.cx, cy: INSET.cy, r: dotR, class: 'hm-observer' }));
      root.appendChild(
        svg('circle', { cx: INSET.cx, cy: INSET.cy, r: INSET.r, class: 'hm-inset-rim', fill: 'none' })
      );

      // spojnice od tecky na telese k vyrezu / the magnifier callout
      const markR = Math.max(vanishR, 5);
      root.appendChild(
        svg('circle', { cx: globe.cx, cy: globe.cy, r: markR, class: 'hm-mark', fill: 'none' })
      );
      const dx = INSET.cx - globe.cx;
      const dy = INSET.cy - globe.cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;
      for (const sign of [1, -1]) {
        root.appendChild(
          svg('line', {
            x1: globe.cx + nx * markR * sign,
            y1: globe.cy + ny * markR * sign,
            x2: INSET.cx + nx * INSET.r * sign,
            y2: INSET.cy + ny * INSET.r * sign,
            class: 'hm-callout',
          })
        );
      }

      root.appendChild(
        text(
          INSET.cx,
          INSET.cy - INSET.r - 14,
          t('map.zoom', { n: F.number(magnification, magnification < 10 ? 1 : 0, lang) }),
          'hm-caption'
        )
      );
    }

    // ---- legenda / the legend ----------------------------------------------
    const rows = [
      {
        cls: 'hm-swatch-horizon',
        label: t('map.ringHorizon'),
        value: F.distance(r.horizon, lang),
        detail: t('map.areaShare', {
          area: F.area(G.capArea(alpha, R), lang),
          share: F.share(G.capShare(alpha), lang),
        }),
      },
      {
        cls: 'hm-swatch-vanish',
        label: t('map.ringVanish', { name: model.objectName }),
        value: overTheEdge ? '—' : F.distance(r.vanishDistance, lang),
        detail: overTheEdge
          ? t('map.overTheEdge')
          : t('map.areaShare', {
              area: F.area(G.capArea(vanishAngle, R), lang),
              share: F.share(G.capShare(vanishAngle), lang),
            }),
      },
    ];

    rows.forEach((row, i) => {
      const y = LEGEND.y + i * LEGEND.step;
      root.appendChild(svg('circle', { cx: 30, cy: y - 5, r: 9, class: 'hm-swatch ' + row.cls }));

      const value = svg('text', {
        x: LEGEND.right, y: y, class: 'hm-legend-value', 'text-anchor': 'end', text: row.value,
      });
      const label = svg('text', {
        x: LEGEND.left, y: y, class: 'hm-legend', 'text-anchor': 'start', text: row.label,
      });
      root.appendChild(value);
      root.appendChild(label);
      // Nazev objektu si zadava uzivatel, takze muze byt libovolne dlouhy -
      // kdyz by dojel az k hodnote vpravo, zkrati se.
      // Object names come from the user and can be any length; if one would
      // reach the value on the right, it gets shortened.
      fitLabel(label, LEGEND.right - LEGEND.left - measure(value) - 20);

      root.appendChild(
        svg('text', {
          x: LEGEND.left,
          y: y + LEGEND.detailDy,
          class: 'hm-legend-detail',
          'text-anchor': 'start',
          text: row.detail,
        })
      );
    });
  }

  HL.HorizonMap = { render, VIEW };
})((window.HorizonLab = window.HorizonLab || {}));
