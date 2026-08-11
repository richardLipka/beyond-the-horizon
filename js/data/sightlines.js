/**
 * sightlines.js - skutecna mista a skutecne rozhledy.
 * Real places and real "can I see X from Y?" pairs.
 *
 * Vsechny vysky jsou NAD MORem, ne nad okolnim terenem - v modelu aplikace
 * je koule prave hladinou more, takze nadmorska vyska je presne to, co se
 * dosazuje za h1 a h2. Vzdalenost se pocita jako ortodroma ze zemepisnych
 * souradnic, ne rucne.
 *
 * All elevations are ABOVE SEA LEVEL, not above the surrounding terrain: in
 * the app's model the sphere IS sea level, so an elevation is exactly what h1
 * and h2 want. Distances are computed as great circles from the coordinates,
 * never typed in by hand.
 *
 * VYPOCET NIC NEVI O TERENU MEZI OBEMA MISTY. Odpovida jen na otazku, jestli
 * to nezakryva zakriveni; kopec v ceste je jina vec.
 * THE CALCULATION KNOWS NOTHING ABOUT THE TERRAIN IN BETWEEN. It answers only
 * whether the curve hides the target; a hill in the way is another matter.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  /**
   * Mista. `lift` je vyska vyhlidky nad zemi (rozhledna), jinak 0.
   * Places. `lift` is the height of a viewing platform above the ground.
   */
  const PLACES = {
    plzen: { lat: 49.7475, lon: 13.3776, elevation: 310, name: { cs: 'Plzeň', en: 'Pilsen' } },
    petrin: {
      lat: 50.0836,
      lon: 14.3949,
      elevation: 327,
      lift: 55,
      name: { cs: 'Praha – Petřínská rozhledna', en: 'Prague – Petřín lookout tower' },
    },
    praha: {
      lat: 50.0875,
      lon: 14.4213,
      elevation: 200,
      name: { cs: 'Praha – Staré Město', en: 'Prague – Old Town' },
    },
    plechy: {
      lat: 48.7739,
      lon: 13.8494,
      elevation: 1378,
      name: { cs: 'Plechý (Šumava)', en: 'Plechý (Bohemian Forest)' },
    },
    boubin: {
      lat: 48.9761,
      lon: 13.8156,
      elevation: 1362,
      name: { cs: 'Boubín (Šumava)', en: 'Boubín (Bohemian Forest)' },
    },
    viden: { lat: 48.2085, lon: 16.3721, elevation: 171, name: { cs: 'Vídeň', en: 'Vienna' } },
    mnichov: { lat: 48.1372, lon: 11.5756, elevation: 519, name: { cs: 'Mnichov', en: 'Munich' } },
    curych: { lat: 47.3769, lon: 8.5417, elevation: 408, name: { cs: 'Curych', en: 'Zurich' } },
    benatky: { lat: 45.4408, lon: 12.3155, elevation: 1, name: { cs: 'Benátky', en: 'Venice' } },
    nice: { lat: 43.7102, lon: 7.262, elevation: 10, name: { cs: 'Nice (pláž)', en: 'Nice (the beach)' } },
    malta: {
      lat: 35.852,
      lon: 14.38,
      elevation: 253,
      name: { cs: 'Dingli (Malta)', en: 'Dingli (Malta)' },
    },

    // --- cile / targets ---
    dachstein: { lat: 47.4756, lon: 13.6062, elevation: 2995, name: { cs: 'Dachstein (Alpy)', en: 'Dachstein (the Alps)' } },
    glockner: {
      lat: 47.0745,
      lon: 12.6939,
      elevation: 3798,
      name: { cs: 'Grossglockner (Alpy)', en: 'Grossglockner (the Alps)' },
    },
    zugspitze: { lat: 47.4211, lon: 10.9853, elevation: 2962, name: { cs: 'Zugspitze', en: 'Zugspitze' } },
    matterhorn: { lat: 45.9766, lon: 7.6585, elevation: 4478, name: { cs: 'Matterhorn', en: 'the Matterhorn' } },
    montblanc: { lat: 45.8326, lon: 6.8652, elevation: 4806, name: { cs: 'Mont Blanc', en: 'Mont Blanc' } },
    mounier: {
      lat: 44.1236,
      lon: 6.9722,
      elevation: 2817,
      name: { cs: 'Mont Mounier (Přímořské Alpy)', en: 'Mont Mounier (Maritime Alps)' },
    },
    cinto: { lat: 42.3797, lon: 8.9224, elevation: 2706, name: { cs: 'Monte Cinto (Korsika)', en: 'Monte Cinto (Corsica)' } },
    triglav: { lat: 46.3783, lon: 13.8367, elevation: 2864, name: { cs: 'Triglav', en: 'Triglav' } },
    snezka: { lat: 50.7359, lon: 15.74, elevation: 1603, name: { cs: 'Sněžka', en: 'Mount Sněžka' } },
    praded: { lat: 50.0831, lon: 17.2306, elevation: 1491, name: { cs: 'Praděd', en: 'Praděd' } },
    etna: { lat: 37.751, lon: 14.9934, elevation: 3357, name: { cs: 'Etna', en: 'Mount Etna' } },
  };

  /**
   * Dvojice "odkud - kam". Poradi je zvolene tak, aby se strídaly pripady,
   * kde to vyjde, kde to tesne nevyjde a kde to nevyjde ani zdaleka.
   * The pairs, ordered so that clear yeses, near misses and hopeless cases
   * alternate.
   */
  const PAIRS = [
    { from: 'plzen', to: 'dachstein', note: 'plzenAlps' },
    { from: 'plechy', to: 'dachstein', note: 'sumavaAlps' },
    { from: 'petrin', to: 'dachstein', note: 'prahaAlps' },
    { from: 'mounier', to: 'cinto', note: 'alpsCorsica' },
    { from: 'nice', to: 'cinto', note: 'niceCorsica' },
    { from: 'montblanc', to: 'praha', note: 'blancPraha' },
    { from: 'plzen', to: 'snezka', note: null },
    { from: 'petrin', to: 'snezka', note: null },
    { from: 'snezka', to: 'praded', note: null },
    { from: 'mnichov', to: 'zugspitze', note: null },
    { from: 'curych', to: 'matterhorn', note: null },
    { from: 'benatky', to: 'triglav', note: 'benatkyTriglav' },
    { from: 'viden', to: 'glockner', note: null },
    { from: 'malta', to: 'etna', note: 'maltaEtna' },
  ];

  /** Vyska oci nad zemi, se kterou se u vsech rozhledu pocita. */
  const EYE_ABOVE_GROUND = 1.7;

  HL.SIGHTLINE_PLACES = PLACES;
  HL.SIGHTLINE_PAIRS = PAIRS;
  HL.SIGHTLINE_EYE = EYE_ABOVE_GROUND;
})((window.HorizonLab = window.HorizonLab || {}));
