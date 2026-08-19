/**
 * readout.js - odecitani hodnot pod ukazovatkem, spolecne pro oba grafy.
 * The pointer read-out, shared by both charts.
 *
 * Z tvaru krivky se cisla precist nedaji. U "Mezi viditelnosti" jsou obe osy
 * logaritmicke, takze u asymptoty odpovida par pixelu nekolika radum; u "Kdy
 * zmizi?" je zajimavy usek mezi obzorem a zmizenim casto jen zlomek osy. Oba
 * grafy proto dopocitaji presnou dvojici ke sloupci pod ukazovatkem a polozi
 * ji rovnou na obe osy.
 *
 * The shape of a curve does not give its numbers away. In "limits of sight"
 * both axes are logarithmic, so near the asymptote a few pixels are several
 * orders of magnitude; in "when does it vanish" the interesting stretch
 * between the horizon and the vanishing point is often a fraction of the axis.
 * Both charts therefore compute the exact pair for the column under the
 * pointer and lay it straight onto both axes.
 *
 * Volajici dodava jen funkci `sample(px)`, ktera ze sloupce udela bod
 * a jeho dva popisky; kresleni, meze i posluchace resi tenhle modul.
 * The caller supplies only `sample(px)`, turning a column into a point and its
 * two labels; the drawing, the bounds and the listeners live here.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const svg = HL.dom.svg;

  /** O kolik podklad popisku presahuje text do stran. */
  const PLATE_PAD = 7;
  /** Nejmensi mezera mezi podkladem a okrajem obrazku. */
  const MARGIN = 4;
  /** Radek rysek pod vodorovnou osou - tam patri i odectena hodnota. */
  const TICK_DROP = 24;

  /**
   * @param {SVGElement} root  cely obrazek grafu (na nem visi posluchace)
   * @param {{
   *   view: {w: number, h: number},
   *   area: {x0: number, y0: number, x1: number, y1: number, w: number},
   *   sample: (px: number) => ({x: number, y: number, onScale: boolean,
   *                             xLabel: string, yLabel: string}|null),
   * }} spec
   */
  function attach(root, spec) {
    const VIEW = spec.view;
    const AREA = spec.area;

    const layer = svg('g', { class: 'rd-layer' });
    root.appendChild(layer);

    /**
     * Hodnota na ose s vlastnim podkladem, aby prekryla rysku pod sebou.
     * Sirka popisku zavisi na jazyku i na poctu cislic, takze se text nejdriv
     * vykresli, pak zmeri a teprve potom zasune do obrazku.
     *
     * An axis value on its own plate so it covers the tick beneath it. The
     * width depends on the language and on how many digits the value has, so
     * the text is drawn, measured and only then pushed inside.
     */
    function plate(x, y, anchor, value) {
      const label = svg('text', { x: x, y: y, class: 'rd-value', 'text-anchor': anchor, text: value });
      layer.appendChild(label);
      let box = label.getBBox();
      if (!(box.width > 0)) return null;
      // Do okraje se musi vejit i podklad, ktery text presahuje o PLATE_PAD.
      // The margin has to hold the plate too, not just the text it wraps.
      const edge = PLATE_PAD + MARGIN;
      const shift = Math.max(0, edge - box.x) + Math.min(0, VIEW.w - edge - (box.x + box.width));
      if (shift) {
        label.setAttribute('x', x + shift);
        box = label.getBBox();
      }
      const back = svg('rect', {
        x: box.x - PLATE_PAD,
        y: box.y - 3,
        width: box.width + 2 * PLATE_PAD,
        height: box.height + 6,
        rx: 5,
        class: 'rd-plate',
      });
      layer.insertBefore(back, label);
      return { label: label, back: back };
    }

    /**
     * U spodniho okraje si oba popisky lezou do cesty. Uhyba ten na svisle
     * ose, protoze rysky vodorovne osy maji pevny radek. Meri se skutecne
     * obalky, takze to plati v obou jazycich i pro libovolne dlouhe cislo.
     *
     * Near the bottom edge the two labels get in each other's way. The one on
     * the vertical axis gives way, because the horizontal axis's tick row is
     * at a fixed y. Measured from the real boxes, so it holds in both
     * languages and for a value of any length.
     */
    function lift(target, other) {
      if (!target || !other) return;
      const a = target.back.getBBox();
      const b = other.back.getBBox();
      if (a.x + a.width < b.x || b.x + b.width < a.x) return;
      if (a.y + a.height < b.y || b.y + b.height < a.y) return;
      const by = a.y + a.height - b.y + 3;
      target.label.setAttribute('y', Number(target.label.getAttribute('y')) - by);
      target.back.setAttribute('y', a.y - by);
    }

    function draw(px) {
      HL.dom.clear(layer);
      const point = spec.sample(px);
      if (!point) return;

      layer.appendChild(svg('line', { x1: point.x, y1: AREA.y0, x2: point.x, y2: AREA.y1, class: 'rd-line' }));
      // Vodorovna nit se kresli, jen kdyz bod opravdu lezi tam, kde je
      // nakresleny - jinak by splynula s okrajem ramecku.
      // The horizontal thread is drawn only when the point really lies where
      // it is drawn; otherwise it would merge with the frame's edge.
      if (point.onScale) {
        layer.appendChild(svg('line', { x1: AREA.x0, y1: point.y, x2: point.x, y2: point.y, class: 'rd-line' }));
      }
      layer.appendChild(
        svg('circle', { cx: point.x, cy: point.y, r: 5.5, class: point.onScale ? 'rd-dot' : 'rd-dot rd-dot-out' })
      );

      const onX = plate(point.x, AREA.y1 + TICK_DROP, 'middle', point.xLabel);
      lift(plate(AREA.x0 - 10, point.y + 5, 'end', point.yLabel), onX);
    }

    // Prirazenim, ne addEventListener: pri pripadnem druhem vykresleni tehoz
    // uzlu se posluchac nahradi, misto aby se nabaloval dalsi.
    // Assigned rather than added, so a second render of the same node replaces
    // the handler instead of stacking another one on top of it.
    root.onpointermove = (event) => {
      const rect = root.getBoundingClientRect();
      if (!(rect.width > 0) || !(rect.height > 0)) return;
      const px = ((event.clientX - rect.left) / rect.width) * VIEW.w;
      const py = ((event.clientY - rect.top) / rect.height) * VIEW.h;
      if (px < AREA.x0 || px > AREA.x1 || py < AREA.y0 || py > AREA.y1) HL.dom.clear(layer);
      else draw(px);
    };
    root.onpointerleave = () => HL.dom.clear(layer);
    root.onpointercancel = () => HL.dom.clear(layer);
  }

  HL.ReadOut = { attach };
})((window.HorizonLab = window.HorizonLab || {}));
