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
    },
    {
      id: 'mercury',
      icon: '🟤',
      radius: 2439700,
      name: { cs: 'Merkur', en: 'Mercury' },
    },
    {
      id: 'venus',
      icon: '🟡',
      radius: 6051800,
      name: { cs: 'Venuše', en: 'Venus' },
    },
    {
      id: 'earth',
      icon: '🌍',
      radius: 6371008.8,
      name: { cs: 'Země', en: 'Earth' },
    },
    {
      id: 'moon',
      icon: '🌕',
      radius: 1737400,
      name: { cs: 'Měsíc', en: 'The Moon' },
    },
    {
      id: 'mars',
      icon: '🔴',
      radius: 3389500,
      name: { cs: 'Mars', en: 'Mars' },
    },
    {
      id: 'jupiter',
      icon: '🟠',
      radius: 69911000,
      gaseous: true,
      name: { cs: 'Jupiter', en: 'Jupiter' },
    },
    {
      id: 'saturn',
      icon: '🪐',
      radius: 58232000,
      gaseous: true,
      name: { cs: 'Saturn', en: 'Saturn' },
    },
    {
      id: 'uranus',
      icon: '🔵',
      radius: 25362000,
      gaseous: true,
      name: { cs: 'Uran', en: 'Uranus' },
    },
    {
      id: 'neptune',
      icon: '🔷',
      radius: 24622000,
      gaseous: true,
      name: { cs: 'Neptun', en: 'Neptune' },
    },
    {
      id: 'pluto',
      icon: '⚪',
      radius: 1188300,
      name: { cs: 'Pluto', en: 'Pluto' },
    },
  ];

  HL.DEFAULT_PLANET = 'earth';

  HL.findPlanet = function (id) {
    return HL.PLANETS.find((planet) => planet.id === id) || null;
  };

  HL.planetRadius = function (id, customRadius) {
    if (id === 'custom') return customRadius > 0 ? customRadius : HL.geometry.R_MEAN;
    const planet = HL.findPlanet(id);
    return planet ? planet.radius : HL.geometry.R_MEAN;
  };
})((window.HorizonLab = window.HorizonLab || {}));
