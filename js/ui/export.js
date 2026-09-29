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
  const XLINK = 'http://www.w3.org/1999/xlink';

  /**
   * Dedene vlastnosti: potomek je prevezme od rodice, takze se zapisou jen
   * tam, kde se od rodice lisi.
   * Inherited properties: a child takes them from its parent, so they are
   * written only where they differ from the parent.
   */
  const INHERITED = [
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
    'stroke-miterlimit',
    'paint-order',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'letter-spacing',
    'word-spacing',
    'text-anchor',
    'visibility',
    'clip-rule',
  ];

  /**
   * Nededene vlastnosti a jejich vychozi hodnota: zapisou se, kdyz se od ni
   * lisi. / Properties that are not inherited, with their initial value:
   * written when they differ from it.
   */
  const OWN = {
    opacity: '1',
    'stop-color': 'rgb(0, 0, 0)',
    'stop-opacity': '1',
    'clip-path': 'none',
    mask: 'none',
    filter: 'none',
  };

  const PNG_SCALE = 2;

  /**
   * url("http://host/stranka#id") -> url(#id). Odkaz na prechod nebo orez
   * musi v samostatnem souboru mirit do nej samotneho.
   * A reference to a gradient or clip must point into the file itself.
   */
  function localUrl(value) {
    return value.replace(/url\((["']?)[^#"')]*#([^"')]+)\1\)/g, 'url(#$2)');
  }

  /**
   * Klon obrazku, ve kterem je vsechno, co dodaval stylopis, zapsane jako
   * atributy. Atributy (a ne style="...") proto, ze jim rozumi kazdy
   * program, ktery SVG otevre, i ty starsi.
   *
   * Drive se hodnoty "none" zahazovaly jako prazdne. Jenze fill: none ze
   * stylopisu je v SVG podstatna informace: bez ni ma cesta cernou vypln,
   * takze ramecek, vlnky, obrysy a krivky grafu se v obrazku zmenily
   * v cerne plochy a hlavni obrazek byl jeden cerny obdelnik.
   *
   * A clone in which everything the stylesheet supplied is written out as
   * attributes - attributes rather than style="..." because every program
   * that opens an SVG understands them, old ones too. "none" used to be
   * dropped as empty, but a stylesheet's fill: none matters in SVG: without it
   * a path is filled black, so the frame, the waves, outlines and chart
   * curves turned into black areas and the main picture was one black box.
   *
   * @returns {{node: SVGElement, width: number, height: number}}
   */
  function standalone(source) {
    const clone = source.cloneNode(true);
    clone.setAttribute('xmlns', HL.dom.SVG_NS);
    clone.setAttribute('xmlns:xlink', XLINK);

    const viewBox = (source.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const width = viewBox[2] > 0 ? viewBox[2] : source.clientWidth || 900;
    const height = viewBox[3] > 0 ? viewBox[3] : source.clientHeight || 500;
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);

    const originals = [source, ...source.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    const computedOf = new Map();
    for (let i = 0; i < originals.length; i++) {
      const original = originals[i];
      const copy = copies[i];
      const computed = window.getComputedStyle(original);
      computedOf.set(original, computed);
      const parent = i === 0 ? null : computedOf.get(original.parentNode);

      for (const property of INHERITED) {
        const value = localUrl(computed.getPropertyValue(property));
        // Koren zapise vsechno - samostatny soubor nema odkud dedit.
        // The root writes everything: a standalone file has nothing to
        // inherit from.
        if (value && (!parent || value !== localUrl(parent.getPropertyValue(property)))) {
          copy.setAttribute(property, value);
        } else {
          copy.removeAttribute(property);
        }
      }
      for (const property of Object.keys(OWN)) {
        const value = localUrl(computed.getPropertyValue(property));
        if (value && value !== OWN[property]) copy.setAttribute(property, value);
        else copy.removeAttribute(property);
      }
      if (computed.getPropertyValue('display') === 'none') copy.setAttribute('display', 'none');

      copy.removeAttribute('class');
      copy.removeAttribute('style');
      copy.removeAttribute('tabindex');
      // Starsi programy (Inkscape 0.9x, nektere kancelarske) znaji jen
      // xlink:href. / Older programs only know xlink:href.
      if (copy.localName === 'image' && copy.getAttribute('href') && !copy.getAttributeNS(XLINK, 'href')) {
        copy.setAttributeNS(XLINK, 'xlink:href', copy.getAttribute('href'));
      }
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
   * Nazev souboru v jazyce, ktery je zrovna zapnuty: anglicky ucitel
   * nedostane "za-obzorem-mapa.png".
   * The file name in the current language, so an English teacher does not
   * get "za-obzorem-mapa.png".
   */
  function fileName(name) {
    const t = HL.i18n.t;
    const key = typeof name === 'function' ? name() : name;
    return t('export.prefix') + '-' + t('export.name.' + key);
  }

  /**
   * Dvojice malych tlacitek k jednomu obrazku.
   * @param {() => SVGElement} pick funkce vracejici obrazek (az v case kliknuti)
   * @param {string|(() => string)} name klic nazvu souboru (export.name.*)
   */
  function buttons(pick, name) {
    const t = HL.i18n.t;
    return el('span', { class: 'export-buttons' }, [
      el('button', {
        type: 'button',
        class: 'export-btn',
        title: t('export.svgTitle'),
        'data-i18n-attr': 'title:export.svgTitle',
        text: 'SVG',
        onclick: () => saveSvg(pick(), fileName(name)),
      }),
      el('button', {
        type: 'button',
        class: 'export-btn',
        title: t('export.pngTitle'),
        'data-i18n-attr': 'title:export.pngTitle',
        text: 'PNG',
        onclick: () => savePng(pick(), fileName(name)),
      }),
    ]);
  }

  /**
   * Prida tlacitka do titulku karty. Kdyz uz tam jsou, nic se nedeje -
   * karty v index.html se nevytvareji znovu.
   */
  function attach(titleNode, pick, name) {
    if (!titleNode || titleNode.querySelector('.export-buttons')) return;
    titleNode.classList.add('card-title-row');
    titleNode.appendChild(buttons(pick, name));
  }

  HL.Exporter = { buttons, attach, saveSvg, savePng, standalone, serialise };
})((window.HorizonLab = window.HorizonLab || {}));
