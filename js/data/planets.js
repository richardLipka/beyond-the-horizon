/**
 * planets.js - prednastavena telesa slunecni soustavy.
 * Preset bodies of the solar system.
 *
 * Polomery jsou stredni, v METRECH. U plynnych obru a Slunce je "povrch"
 * mysleny jako vrchol oblacne vrstvy (resp. fotosfera) - stat se na nem neda,
 * ale jako ukazka zakriveni to funguje.
 *
 * Radii are mean radii, in METRES. For the gas giants and the Sun the
 * "surface" means the cloud tops (the photosphere); you could not stand there,
 * but it works fine as a demonstration of curvature.
 *
 * Kazde teleso ma vlastni barvy, kterymi se pak obarvi obloha i povrch ve
 * vsech pohledech - vyber v menu tak odpovida tomu, co je videt v obrazku.
 * Each body carries its own palette; the sky and the surface in every view are
 * painted from it, so the menu matches the picture.
 *
 *   sky     tri zastavky prechodu oblohy (shora dolu)
 *   surface tri zastavky prechodu povrchu (shora dolu)
 *   water   nepovinne - pouzije se pro objekty stojici na hladine
 *   accent  barva vlnek / textury povrchu
 *   decor   'waves' | 'rocks' | 'bands' | 'grass'
 *   airless bez atmosfery -> tmava obloha s hvezdami
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  HL.PLANETS = [
    {
      id: 'sun',
      icon: '☀️',
      radius: 695700000,
      gaseous: true,
      name: { cs: 'Slunce', en: 'The Sun' },
      swatch: '#ffb03a',
      decor: 'bands',
      colors: {
        sky: ['#fff3c4', '#ffe08a', '#ffcc63'],
        surface: ['#fff0a8', '#ffab2e', '#bf3d0d'],
        accent: '#fff6d5',
      },
    },
    {
      id: 'mercury',
      icon: '🟤',
      radius: 2439700,
      airless: true,
      name: { cs: 'Merkur', en: 'Mercury' },
      swatch: '#7b7168',
      decor: 'rocks',
      colors: {
        sky: ['#070b14', '#141d2b', '#2b3746'],
        surface: ['#a79c92', '#786e65', '#443d37'],
        accent: '#d5ccc3',
      },
    },
    {
      id: 'venus',
      icon: '🟡',
      radius: 6051800,
      name: { cs: 'Venuše', en: 'Venus' },
      swatch: '#c9a24d',
      decor: 'rocks',
      colors: {
        sky: ['#f6dda4', '#e9c477', '#d8a554'],
        surface: ['#e2c07a', '#b98f4c', '#75581f'],
        accent: '#f9ebc6',
      },
    },
    {
      id: 'earth',
      icon: '🌍',
      radius: 6371008.8,
      name: { cs: 'Země', en: 'Earth' },
      swatch: '#2e9fbd',
      decor: 'grass',
      colors: {
        sky: ['#9fd6ea', '#d7eef7', '#f2fafc'],
        surface: ['#79b276', '#3f7f56', '#245740'],
        water: ['#2e9fbd', '#14688a', '#0a3d5c'],
        accent: '#ffffff',
      },
    },
    {
      id: 'moon',
      icon: '🌕',
      radius: 1737400,
      airless: true,
      name: { cs: 'Měsíc', en: 'The Moon' },
      swatch: '#9a958d',
      decor: 'rocks',
      colors: {
        sky: ['#05070d', '#101725', '#1f2836'],
        surface: ['#d2cdc5', '#9a958d', '#5b5751'],
        accent: '#f0ece5',
      },
    },
    {
      id: 'mars',
      icon: '🔴',
      radius: 3389500,
      name: { cs: 'Mars', en: 'Mars' },
      swatch: '#a1502f',
      decor: 'rocks',
      colors: {
        sky: ['#f2cfa9', '#e2ab7e', '#cb8a5c'],
        surface: ['#c9744a', '#9d4d2c', '#612b17'],
        accent: '#f4d3b6',
      },
    },
    {
      id: 'jupiter',
      icon: '🟠',
      radius: 69911000,
      gaseous: true,
      name: { cs: 'Jupiter', en: 'Jupiter' },
      swatch: '#c98f5e',
      decor: 'bands',
      colors: {
        sky: ['#faead6', '#ecc9a2', '#dcab7c'],
        surface: ['#eccba2', '#c68a58', '#82522e'],
        accent: '#fff2e0',
      },
    },
    {
      id: 'saturn',
      icon: '🪐',
      radius: 58232000,
      gaseous: true,
      name: { cs: 'Saturn', en: 'Saturn' },
      swatch: '#c9b273',
      decor: 'bands',
      colors: {
        sky: ['#faf1d4', '#eee0ae', '#dfcd8e'],
        surface: ['#ecdcab', '#c6ad6f', '#87723e'],
        accent: '#fdf7e2',
      },
    },
    {
      id: 'uranus',
      icon: '🔵',
      radius: 25362000,
      gaseous: true,
      name: { cs: 'Uran', en: 'Uranus' },
      swatch: '#6fbecb',
      decor: 'bands',
      colors: {
        sky: ['#d6f2f5', '#aee2ea', '#88cfdb'],
        surface: ['#a9e1e9', '#69b9c7', '#356f7d'],
        accent: '#e6fafc',
      },
    },
    {
      id: 'neptune',
      icon: '🔷',
      radius: 24622000,
      gaseous: true,
      name: { cs: 'Neptun', en: 'Neptune' },
      swatch: '#3557a8',
      decor: 'bands',
      colors: {
        sky: ['#c9dcf8', '#9ab9ec', '#7396dc'],
        surface: ['#5f8ad4', '#33539f', '#182a58'],
        accent: '#d9e6fc',
      },
    },
    {
      id: 'pluto',
      icon: '⚪',
      radius: 1188300,
      airless: true,
      name: { cs: 'Pluto', en: 'Pluto' },
      swatch: '#a89681',
      decor: 'rocks',
      colors: {
        sky: ['#0a0812', '#191426', '#2b2438'],
        surface: ['#ddcfba', '#a89681', '#665849'],
        accent: '#f2e9dc',
      },
    },
  ];

  /** Nahradni paleta pro "vlastni teleso" - neutralni morska modr. */
  HL.CUSTOM_PALETTE = {
    swatch: '#1f8fa8',
    decor: 'grass',
    colors: {
      sky: ['#9fd6ea', '#d7eef7', '#f2fafc'],
      surface: ['#7fa8b4', '#4a7d8c', '#2a4c5b'],
      water: ['#2e9fbd', '#14688a', '#0a3d5c'],
      accent: '#ffffff',
    },
  };

  HL.DEFAULT_PLANET = 'earth';

  HL.findPlanet = function (id) {
    return HL.PLANETS.find((planet) => planet.id === id) || null;
  };

  HL.planetRadius = function (id, customRadius) {
    if (id === 'custom') return customRadius > 0 ? customRadius : HL.geometry.R_MEAN;
    const planet = HL.findPlanet(id);
    return planet ? planet.radius : HL.geometry.R_MEAN;
  };

  /**
   * Vrati vzhled telesa pro kresleni. U vlastniho telesa se pouzije
   * nahradni paleta. / Returns the look of a body for drawing.
   */
  HL.planetLook = function (id) {
    const planet = HL.findPlanet(id);
    if (!planet) return HL.CUSTOM_PALETTE;
    return { swatch: planet.swatch, decor: planet.decor, colors: planet.colors, airless: !!planet.airless };
  };
})((window.HorizonLab = window.HorizonLab || {}));
