/**
 * export.js - stazeni obrazku jako SVG nebo PNG.
 * Downloading a picture as SVG or PNG.
 *
 * Styly obrazku jsou v CSS souborech, ale stazeny soubor musi stat sam o sobe.
 * Nacitat stylesheet pres fetch nejde (pri behu z file:// to prohlizec zakaze)
 * a document.styleSheets tam taky neni pristupny, takze se misto toho projdou
 * uzly a spocitane hodnoty se zapisou natvrdo do atributu. Je to pomalejsi,
 * ale funguje to vzdycky - a exportuje se na kliknuti, ne kazdy snimek.
 *
 * The picture's styling lives in CSS files, but the downloaded file has to
 * stand on its own. Fetching the stylesheet is not possible under file:// and
 * document.styleSheets is not readable there either, so instead every node is
 * walked and its computed values are written out as attributes. It is slower,
 * but it always works - and export happens on a click, not every frame.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;

  /** Vlastnosti, ktere v SVG opravdu neco delaji. */
  const PROPERTIES = [
    'fill',
    'fill-opacity',
    'fill-rule',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'opacity',
    'paint-order',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'letter-spacing',
    'text-anchor',
    'dominant-baseline',
  ];

  const PNG_SCALE = 2;

  /**
   * Klon obrazku s natvrdo zapsanymi styly, pripraveny k ulozeni.
   * @returns {SVGElement}
   */
  function standalone(source) {
    const clone = source.cloneNode(true);
    clone.setAttribute('xmlns', HL.dom.SVG_NS);
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const viewBox = (source.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const width = viewBox[2] > 0 ? viewBox[2] : source.clientWidth || 900;
    const height = viewBox[3] > 0 ? viewBox[3] : source.clientHeight || 500;
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);

    const originals = [source, ...source.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    for (let i = 0; i < originals.length; i++) {
      const computed = window.getComputedStyle(originals[i]);
      let inline = '';
      for (const property of PROPERTIES) {
        const value = computed.getPropertyValue(property);
        if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
          inline += property + ':' + value + ';';
        }
      }
      if (inline) copies[i].setAttribute('style', inline);
      copies[i].removeAttribute('class');
    }

    // Bile pozadi, aby obrazek nebyl pruhledny ve Wordu ani v prezentaci.
    const background = HL.dom.svg('rect', { x: 0, y: 0, width: width, height: height, fill: '#ffffff' });
    clone.insertBefore(background, clone.firstChild);
    return { node: clone, width: width, height: height };
  }

  function serialise(node) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(node);
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = el('a', { href: url, download: filename });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Uvolnit az po kliknuti, jinak Safari stahne prazdny soubor.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function saveSvg(source, baseName) {
    const built = standalone(source);
    download(new Blob([serialise(built.node)], { type: 'image/svg+xml;charset=utf-8' }), baseName + '.svg');
  }

  function savePng(source, baseName) {
    const built = standalone(source);
    const svgBlob = new Blob([serialise(built.node)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = el('canvas');
      canvas.width = Math.round(built.width * PNG_SCALE);
      canvas.height = Math.round(built.height * PNG_SCALE);
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) download(blob, baseName + '.png');
      }, 'image/png');
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  /**
   * Dvojice malych tlacitek k jednomu obrazku.
   * @param {() => SVGElement} pick funkce vracejici obrazek (az v case kliknuti)
   * @param {string} baseName zaklad nazvu souboru bez pripony
   */
  function buttons(pick, baseName) {
    const t = HL.i18n.t;
    return el('span', { class: 'export-buttons' }, [
      el('button', {
        type: 'button',
        class: 'export-btn',
        title: t('export.svgTitle'),
        text: 'SVG',
        onclick: () => saveSvg(pick(), baseName),
      }),
      el('button', {
        type: 'button',
        class: 'export-btn',
        title: t('export.pngTitle'),
        text: 'PNG',
        onclick: () => savePng(pick(), baseName),
      }),
    ]);
  }

  /**
   * Prida tlacitka do titulku karty. Kdyz uz tam jsou, nic se nedeje -
   * karty v index.html se nevytvareji znovu.
   */
  function attach(titleNode, pick, baseName) {
    if (!titleNode || titleNode.querySelector('.export-buttons')) return;
    titleNode.classList.add('card-title-row');
    titleNode.appendChild(buttons(pick, baseName));
  }

  HL.Exporter = { buttons, attach, saveSvg, savePng };
})((window.HorizonLab = window.HorizonLab || {}));
