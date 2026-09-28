/**
 * rod.js - merici tyc (vytycka) pro objekty bez vlastni kresby.
 * The surveyor's ranging pole drawn for any object without a picture.
 *
 * Neznamy objekt nesmi vypadat jako nektery skutecny - drivejsi modrobily
 * prouzkovany sloupek s praporkem pripominal majak. Cervenobila vytycka je
 * presne to, co zemerici stavi do krajiny, aby na ni z dalky zamerili: nese
 * jen vysku, nic jineho.
 *
 * An unknown object must not look like any real one - the old blue-and-white
 * striped post with a flag read as a lighthouse. A red-and-white ranging pole
 * is exactly what surveyors plant in a landscape to sight on from afar: it
 * carries a height and nothing else.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  /** Pomer sirky k vysce kresby. / Width-to-height ratio of the drawing. */
  const ROD_ASPECT = 0.2;

  /**
   * Devet pruhu po deseti jednotkach, nahore i dole cervene; ocelovy hrot
   * stoji presne na spodni hrane, vrsek se dotyka horni - vyska obrazku je
   * tedy vyska objektu, stejne jako u vsech ostatnich kreseb.
   * Nine bands of ten units, red at both ends; the steel tip rests exactly on
   * the bottom edge and the top touches the top edge, so the picture's height
   * is the object's height, as with every other drawing.
   */
  function drawing() {
    let bands = '';
    for (let i = 0; i < 9; i += 2) {
      bands += `<rect x="6" y="${1 + i * 10}" width="8" height="10" fill="#d7322b"/>`;
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 100">' +
      '<path d="M7.2 90.5 10 100 12.8 90.5Z" fill="#6b7680"/>' +
      '<rect x="6" y="1" width="8" height="90" fill="#ffffff"/>' +
      bands +
      '<rect x="6" y="1" width="8" height="90" rx="1" fill="none" stroke="#5a2420" stroke-width="1.1"/>' +
      '</svg>'
    );
  }

  const ROD_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(drawing());

  /**
   * Co se ma pro objekt nakreslit. Bez obrazku dostane vytycku - i s jejim
   * vlastnim pomerem stran, jinak by ji prevzaty pomer objektu roztahl do
   * tlusteho sloupu.
   * What to draw for an object. Without a picture it gets the pole - with the
   * pole's own aspect ratio, since the object's would stretch it into a fat
   * column.
   *
   * @returns {{image: string, aspect: number, rod: boolean}}
   */
  function objectArt(obj) {
    if (obj && obj.image) return { image: obj.image, aspect: obj.aspect > 0 ? obj.aspect : 1, rod: false };
    return { image: ROD_IMAGE, aspect: ROD_ASPECT, rod: true };
  }

  HL.MEASURING_ROD = { image: ROD_IMAGE, aspect: ROD_ASPECT };
  HL.objectArt = objectArt;
})((window.HorizonLab = window.HorizonLab || {}));
