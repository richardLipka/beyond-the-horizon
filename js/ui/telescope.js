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

  // Nad obrubou zustava 40 px na poznamku o preludu a oparu.
  // 40 px above the rim are kept for the mirage and haze note.
  const VIEW = { w: 440, h: 452 };
  const CENTRE = { x: 220, y: 222 };
  const RADIUS = 176;
  const HORIZON_Y = CENTRE.y + 74;

  /** Jak vysoko nad obzorem se vznasi prelud [px]. / How high a mirage hovers. */
  const MIRAGE_GAP = 12;
  /** Zarici pruh v mezere pod preludem. / The glowing strip in the gap under it. */
  const MIRAGE_GAP_OPACITY = 0.55;

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
    const belowId = uid('below');

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
        svg('clipPath', { id: belowId }, [
          svg('rect', {
            x: CENTRE.x - RADIUS,
            y: HORIZON_Y,
            width: RADIUS * 2,
            height: CENTRE.y + RADIUS - HORIZON_Y,
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

    // ---- opar nad obzorem / haze above the horizon ------------------------
    // Obloha u obzoru se diva pres nejvic vzduchu, proto blednou nejvic tam.
    // Pas je spocitany pro 40 km vzduchu - typickou delku pohledu k obzoru
    // v krajine - a nikdy nezakryje oblohu uplne.
    // The sky near the horizon is seen through the most air, so it pales most
    // there. The band is computed for 40 km of air - a typical path to a
    // landscape horizon - and never hides the sky completely.
    const fogColor = HL.hazeColor(look);
    const skyHaze = r.haze > 0 ? Math.min(0.9, 1 - HL.geometry.hazeTransmission(r.haze, 40000)) : 0;
    if (skyHaze > 0.005) {
      const hazeId = uid('haze');
      root.querySelector('defs').appendChild(
        svg('linearGradient', { id: hazeId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
          svg('stop', { offset: '0%', 'stop-color': fogColor, 'stop-opacity': (skyHaze * 0.3).toFixed(3) }),
          svg('stop', { offset: '100%', 'stop-color': fogColor, 'stop-opacity': skyHaze.toFixed(3) }),
        ])
      );
      scene.appendChild(
        svg('rect', {
          x: CENTRE.x - RADIUS,
          y: CENTRE.y - RADIUS,
          width: RADIUS * 2,
          height: HORIZON_Y - (CENTRE.y - RADIUS),
          fill: `url(#${hazeId})`,
          class: 'ts-haze',
        })
      );
    }

    // ---- meritko / scale --------------------------------------------------
    // Zvetseni se ridi tim, co je videt BEZ ohybu svetla, a je stejne pro
    // zapnutou i vypnutou refrakci. Drive se ridilo tim, co je videt prave
    // ted, takze prepnuti refrakce zmenilo i priblizeni a skutecny rozdil
    // zamaskovalo: Titanic ve 30 km mel v obou stavech viditelnou cast vysokou
    // 30 px, prestoze refrakce odkryje ctyrikrat vic, a bez refrakce byl cely
    // nakresleny 4,3x vetsi. Ted refrakce objekt opravdu zvetsi - odkryje vic
    // pri stejnem priblizeni - a bez ni se nezvetsuje nic.
    // The magnification follows what shows WITHOUT bending, and it is the same
    // with refraction on and off. It used to follow what shows right now, so
    // toggling refraction changed the zoom too and masked the real difference:
    // the Titanic at 30 km showed a 30 px visible part in both states although
    // refraction reveals four times more, and without refraction the whole
    // ship was drawn 4.3x larger. Now refraction really enlarges the object -
    // it reveals more at the same zoom - and nothing enlarges without it.
    const plain = r.visibleGeometric;
    const bent = r.visibleBent;
    // Nastaveni, ve kterem je objekt jen prelud: bez ohybu nic, s nim neco.
    // Rozhoduje nastaveni, ne prepinac, aby mezera nahore byla v obou stavech
    // stejna. / A setup in which the object is only a mirage. The setup
    // decides, not the switch, so the room above is the same in both states.
    const mirageSetup = plain <= 0 && bent > 0;
    const gap = r.mirage ? MIRAGE_GAP : 0;
    const objectHeight = Math.max(r.objectHeight, 1e-6);
    const roomAbove = HORIZON_Y - (CENTRE.y - RADIUS) - 30 - (mirageSetup ? MIRAGE_GAP : 0);
    // U preludu neni s cim srovnavat - bez ohybu neni videt nic - tak se
    // priblizeni ridi tim, co ukaze ohnuty paprsek.
    // A mirage has nothing to compare against, so the ray that bends decides.
    const reference = plain > 0 ? plain : bent;
    const WANTED_PX = 52;
    let scale = roomAbove / objectHeight;
    if (reference > 0 && reference * scale < WANTED_PX) {
      // I to, co pridal ohyb, se musi vejit nad obzor.
      // What bending adds has to fit above the horizon as well.
      scale = Math.min(WANTED_PX / reference, roomAbove / Math.max(bent, reference));
    }

    // Siroke objekty (lode) zmensime rovnomerne, aby se nedeformovaly -
    // pomer "videt / schovano" tim zustane nedotcen. Objekt bez kresby dostane
    // vytycku i s jejim vlastnim pomerem stran.
    // Wide objects shrink uniformly, so nothing gets distorted and the
    // visible-to-hidden ratio stays exact. An object without a drawing gets
    // the ranging pole, with the pole's own aspect ratio.
    const drawing = HL.objectArt(obj);
    const aspect = drawing.aspect;
    const maxWidth = RADIUS * 1.5;
    if (objectHeight * scale * aspect > maxWidth) {
      scale = maxWidth / (objectHeight * aspect);
    }
    // Prelud ze siroke hory by po zmenseni na sirku okenka byl par pixelu.
    // Jen u nej - a jen se zapnutou refrakci, bez ni neni videt nic - se proto
    // smi hora roztahnout za okraj okenka, az na 30 px viditelne casti.
    // Meritko je porad rovnomerne, pomer videt / schovano zustava presny.
    // A mirage of a wide peak would be a few pixels once fitted to the
    // eyepiece. Only then - and only with refraction on, since nothing shows
    // without it - may the peak run past the edge, up to a 30 px visible part.
    const MIRAGE_MIN_PX = 30;
    if (r.mirage && r.visible * scale < MIRAGE_MIN_PX) {
      scale = Math.min(MIRAGE_MIN_PX / r.visible, roomAbove / r.visible);
    }

    const heightPx = objectHeight * scale;
    const hiddenPx = Math.min(r.hidden, r.objectHeight) * scale;
    const widthPx = heightPx * aspect;
    const baseY = HORIZON_Y + hiddenPx;
    const topY = baseY - heightPx;
    const leftX = CENTRE.x - widthPx / 2;

    const art = () =>
      svg('image', {
        href: drawing.image,
        x: leftX,
        y: topY,
        width: widthPx,
        height: heightPx,
        preserveAspectRatio: 'none',
      });

    // schovana cast jako duch - jen pod obzorem, jinak by u preludu prosvitala
    // mezerou / the hidden part as a ghost, below the horizon only, or it
    // would show through a mirage's gap
    if (hiddenPx > 0.5) {
      scene.appendChild(svg('g', { class: 'ts-ghost', 'clip-path': `url(#${belowId})` }, [art()]));
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
    //
    // Opar: kazdy kilometr vzduchu ubere stejny podil kontrastu, takze objekt
    // se pres pruhlednost `clarity` prolne s oparem za nim. Pod 2 % ho oko
    // uz nerozezna - a tady taky zmizi.
    // Haze: every kilometre of air takes the same share of contrast, so the
    // object blends into the haze behind it through the opacity `clarity`.
    // Below 2 % the eye cannot pick it out, and here it vanishes too.
    //
    // Prelud: kdyz je videt JEN diky ohybu svetla, obraz se vznasi nad
    // obzorem s mezerou a chveje se - tak vypada skutecna fata morgana nad
    // morem. / Mirage: when it shows ONLY because light bends, the image hovers
    // above the horizon with a gap and shimmers, which is how a real
    // Fata Morgana over the sea looks.
    if (heightPx - hiddenPx > 0.5) {
      // Orez patri DOVNITR posunute skupiny: rez tak vede po obzoru samotneho
      // objektu a mezera nad obzorem zustane prazdna.
      // The clip goes INSIDE the shifted group, so the cut follows the
      // object's own horizon and the gap above the real one stays empty.
      const visiblePart = svg('g', { transform: gap ? `translate(0 ${-gap})` : null }, [
        svg('g', { 'clip-path': `url(#${aboveId})` }, [art()]),
      ]);
      // Nakresleny kontrast je presne ten spocitany: pruhlednost = clarity,
      // u preludu stejne jako u cehokoli jineho. Pocita se a jde do atributu.
      // Drive mela trida .ts-mirage ve stylopisu vlastni opacity a pravidlo CSS
      // v SVG prebije atribut, takze prelud zustal videt i v oparu, ktery ho
      // mel davno schovat. Proto ve stylopisu pro tyhle prvky zadna opacity.
      // The drawn contrast is exactly the computed one: opacity = clarity, for
      // a mirage as for anything else. The .ts-mirage class used to set its own
      // opacity in the stylesheet, and in SVG a CSS rule beats the attribute -
      // so a mirage stayed visible through haze that should have hidden it.
      const fade = Math.max(0, r.clarity);
      const holder = svg('g', {
        opacity: fade < 1 ? fade.toFixed(3) : null,
        class: r.mirage ? 'ts-mirage' : null,
      });
      if (r.mirage) {
        const shimmerId = uid('shimmer');
        root.querySelector('defs').appendChild(
          svg('filter', { id: shimmerId, x: '-10%', y: '-10%', width: '120%', height: '120%' }, [
            svg('feTurbulence', {
              type: 'fractalNoise',
              baseFrequency: '0.015 0.22',
              numOctaves: 2,
              seed: 7,
              result: 'noise',
            }),
            svg('feDisplacementMap', {
              in: 'SourceGraphic',
              in2: 'noise',
              scale: 5,
              xChannelSelector: 'R',
              yChannelSelector: 'G',
            }),
          ])
        );
        holder.setAttribute('filter', `url(#${shimmerId})`);
        // Zarici pruh v mezere mezi obrazem a obzorem bledne s oparem
        // stejne jako obraz sam; kdyz opar prelud schova, neni ani pruh.
        // The glowing strip in the gap fades with the haze like the image
        // does; when the haze hides the mirage, there is no strip either.
        if (!r.lostInHaze) {
          scene.appendChild(
            svg('rect', {
              x: leftX - 12,
              y: HORIZON_Y - gap,
              width: widthPx + 24,
              height: gap,
              fill: fogColor,
              opacity: (MIRAGE_GAP_OPACITY * Math.max(0, r.clarity)).toFixed(3),
              class: 'ts-mirage-gap',
            })
          );
        }
      }
      holder.appendChild(visiblePart);
      scene.appendChild(holder);
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

    // Opar nad hladinou u obzoru: tak daleko lezi obzor, pres tolik vzduchu
    // se na nej divas. / Haze over the surface at the horizon: the horizon is
    // this far away, and this much air lies in between.
    const seaHaze = r.haze > 0 ? 1 - HL.geometry.hazeTransmission(r.haze, r.horizon * r.hazeShare) : 0;
    if (seaHaze > 0.005) {
      const seaHazeId = uid('seahaze');
      root.querySelector('defs').appendChild(
        svg('linearGradient', { id: seaHazeId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
          svg('stop', { offset: '0%', 'stop-color': fogColor, 'stop-opacity': Math.min(0.9, seaHaze).toFixed(3) }),
          svg('stop', { offset: '100%', 'stop-color': fogColor, 'stop-opacity': 0 }),
        ])
      );
      scene.appendChild(
        svg('rect', {
          x: CENTRE.x - RADIUS,
          y: HORIZON_Y,
          width: RADIUS * 2,
          height: 46,
          fill: `url(#${seaHazeId})`,
          class: 'ts-haze',
        })
      );
    }

    // ---- kotovani viditelne casti / dimension of the visible part ---------
    // U preludu se kota posune spolu s obrazem; v oparu ztraceny objekt
    // dostane misto koty popisek.
    // With a mirage the dimension moves with the image; an object lost in the
    // haze gets a label instead of a dimension.
    if (r.visible > 0 && r.lostInHaze) {
      scene.appendChild(
        svg('text', {
          x: CENTRE.x,
          y: Math.max(CENTRE.y - RADIUS + 40, HORIZON_Y - gap - 26),
          class: 'ts-empty ts-halo',
          'text-anchor': 'middle',
          text: t('telescope.hazeLost'),
        })
      );
    } else if (r.visible > 0) {
      const dimX = Math.min(leftX + widthPx + 18, CENTRE.x + RADIUS - 20);
      const dimTop = topY - gap;
      const dimBottom = HORIZON_Y - gap;
      const label = svg('text', {
        x: dimX - 8,
        y: (dimTop + dimBottom) / 2 + 5,
        class: 'ts-label ts-halo',
        'text-anchor': 'end',
        text: F.height(r.visible, lang),
      });
      scene.appendChild(
        svg('g', { class: 'ts-dim ts-dim-visible' }, [
          svg('line', { x1: dimX, y1: dimTop, x2: dimX, y2: dimBottom, class: 'ts-dim-line' }),
          svg('line', { x1: dimX - 5, y1: dimTop, x2: dimX + 5, y2: dimTop, class: 'ts-dim-tick' }),
          svg('line', { x1: dimX - 5, y1: dimBottom, x2: dimX + 5, y2: dimBottom, class: 'ts-dim-tick' }),
          label,
        ])
      );
      // U uzkeho objektu (vytycka) by popisek vlevo od koty lezel pres nej.
      // Pak se zmeri a prehodi napravo. / Beside a narrow object (the pole)
      // a label left of the dimension would sit on top of it, so it is
      // measured and flipped to the right.
      try {
        const box = label.getBBox();
        const fitsRight = dimX + 8 + box.width < CENTRE.x + RADIUS - 14;
        if (box.width > 0 && box.x < leftX + widthPx && fitsRight) {
          label.setAttribute('x', dimX + 8);
          label.setAttribute('text-anchor', 'start');
        }
      } catch (e) {
        /* jeste nevykresleno / not rendered yet */
      }
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
      const hiddenLabel = svg('text', {
        x: CENTRE.x,
        y: HORIZON_Y + hiddenPx / 2 + 6,
        class: 'ts-hidden-label',
        'text-anchor': 'middle',
        text: `${t('diagram.hidden')}: ${F.height(r.hidden, lang)}`,
      });
      scene.appendChild(hiddenLabel);
      // Dole se kruh zuzuje. Popisek smi klesnout jen tam, kde je tetiva
      // uvnitr obruby jeste sirsi nez on - jinak mu obruba useknula konce
      // ("schovano: 26,7 m" u plachetnice ve 22 km).
      // The circle narrows towards the bottom. The label may sink only as far
      // as the chord inside the rim is still wider than the label, or the rim
      // cut off both its ends.
      let halfWidth = 0;
      try {
        halfWidth = hiddenLabel.getBBox().width / 2;
      } catch (e) {
        /* jeste nevykresleno / not rendered yet */
      }
      if (!(halfWidth > 0)) halfWidth = hiddenLabel.textContent.length * 4.8;
      const inner = RADIUS - 16;
      const lowest = CENTRE.y + Math.sqrt(Math.max(0, inner * inner - Math.pow(halfWidth + 6, 2))) - 5;
      hiddenLabel.setAttribute('y', Math.max(HORIZON_Y + 22, Math.min(Number(hiddenLabel.getAttribute('y')), lowest)));
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
        // V oparu ztraceny objekt nikdo nevidi, i kdyz ho zakriveni pusti.
        // Nobody sees an object lost in haze, even if the curve lets it through.
        text: r.lostInHaze
          ? t('telescope.hazeLost')
          : r.visible > 0
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

    // ---- poznamka nad okenkem / the note above the eyepiece --------------
    // Nad obrubou je volny pruh; prelud a opar se hlasi tam, aby se nepraly
    // s kotami uvnitr. Kdyz se obe poznamky nevejdou na jeden radek, rozdeli
    // se na dva - sirka zavisi na jazyku, takze se meri.
    // The strip above the rim is free; the mirage and the haze are reported
    // there so they do not fight the dimensions inside. When both notes do not
    // fit on one line they split into two - the width depends on the
    // language, so it is measured.
    const notes = [];
    // Prelud se hlasi jen tehdy, kdyz ho opar nechal byt - stejne jako verdikt.
    // A mirage is announced only when the haze has left it alone, as in the verdict.
    if (r.mirage && !r.lostInHaze) notes.push(t('telescope.mirage'));
    if (r.haze > 0 && r.visible > 0 && !r.lostInHaze) {
      notes.push(t('telescope.haze', { n: F.percentAbove(r.clarity, lang) }));
    }
    if (notes.length) {
      const one = svg('text', {
        x: CENTRE.x,
        y: 26,
        class: 'ts-note' + (r.mirage ? ' ts-note-mirage' : ''),
        'text-anchor': 'middle',
        text: notes.join('  ·  '),
      });
      root.appendChild(one);
      let tooWide = false;
      try {
        tooWide = one.getBBox().width > VIEW.w - 16;
      } catch (e) {
        tooWide = notes.join('  ·  ').length > 52;
      }
      if (tooWide && notes.length > 1) {
        one.textContent = notes[0];
        one.setAttribute('y', 16);
        root.appendChild(
          svg('text', { x: CENTRE.x, y: 34, class: 'ts-note', 'text-anchor': 'middle', text: notes[1] })
        );
      }
    }
  }

  HL.Telescope = { render, VIEW };
})((window.HorizonLab = window.HorizonLab || {}));
