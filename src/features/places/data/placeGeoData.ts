export interface PlaceGeoMeta {
  radiusMeters: number;
  color: string;
  borderColor: string;
  fillColor: string;
  icon: string;
  historicalSizeText: string;
  ancientDescription: string;
  associatedPeople: { name: string; personId?: number }[];
  keyVerse: { bookId: number; chapter: number; verse: number; citation: string };
}

export const PLACE_GEO_METADATA: Record<number, PlaceGeoMeta> = {
  // 1. Jerusalén
  1: {
    radiusMeters: 2200,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '🏛️',
    historicalSizeText: 'Ciudad de David & Monte del Templo · Murallas históricas de 2.2 km de radio',
    ancientDescription: 'Perímetro amurallado con las puertas de Sion, Damasco y la Hermosa, el monte Moriah y el Templo.',
    associatedPeople: [
      { name: 'David', personId: 1 },
      { name: 'Salomón', personId: 4 },
      { name: 'Jesús de Nazaret' },
      { name: 'Pedro', personId: 7 },
    ],
    keyVerse: { bookId: 19, chapter: 122, verse: 6, citation: 'Salmos 122:6' },
  },
  // 2. Belén de Judá
  2: {
    radiusMeters: 1400,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '🌾',
    historicalSizeText: 'Aldea fortificada en colina · Pastizales de Efrata de 1.4 km de radio',
    ancientDescription: 'Campos de trigo donde Rut espigó y colinas donde los pastores recibieron el anuncio angelical.',
    associatedPeople: [
      { name: 'David', personId: 1 },
      { name: 'Rut', personId: 3 },
      { name: 'Booz' },
    ],
    keyVerse: { bookId: 33, chapter: 5, verse: 2, citation: 'Miqueas 5:2' },
  },
  // 3. Getsemaní
  3: {
    radiusMeters: 800,
    color: '#10b981',
    borderColor: '#34d399',
    fillColor: '#34d399',
    icon: '🕊️',
    historicalSizeText: 'Huerto de olivos milenarios · Perímetro sagrado de 800 m',
    ancientDescription: 'Prensa de aceite a los pies del Valle del Cedrón frente a las murallas orientales de Jerusalén.',
    associatedPeople: [
      { name: 'Jesús de Nazaret' },
      { name: 'Pedro', personId: 7 },
      { name: 'Juan', personId: 9 },
    ],
    keyVerse: { bookId: 40, chapter: 26, verse: 36, citation: 'Mateo 26:36' },
  },
  // 4. Mar de Galilea
  4: {
    radiusMeters: 8500,
    color: '#0284c7',
    borderColor: '#38bdf8',
    fillColor: '#38bdf8',
    icon: '🌊',
    historicalSizeText: 'Lago Kinneret / Genesaret · Cuenca de agua dulce de 8.5 km de radio',
    ancientDescription: 'Lago de 21 km de largo rodeado de colinas volcánicas. Escenario de la tempestad calmada y la pesca milagrosa.',
    associatedPeople: [
      { name: 'Jesús de Nazaret' },
      { name: 'Pedro', personId: 7 },
      { name: 'Andrés' },
    ],
    keyVerse: { bookId: 41, chapter: 4, verse: 39, citation: 'Marcos 4:39' },
  },
  // 5. Monte Sinaí (Horeb)
  5: {
    radiusMeters: 4500,
    color: '#8b5cf6',
    borderColor: '#a78bfa',
    fillColor: '#a78bfa',
    icon: '⛰️',
    historicalSizeText: 'Macizo granítico de Horeb · Perímetro de la Alianza de 4.5 km',
    ancientDescription: 'Cumbres rocosas elevadas a 2,285 metros sobre el desierto, donde Dios descendió con fuego y entregó la Ley.',
    associatedPeople: [
      { name: 'Moisés', personId: 2 },
      { name: 'Aarón' },
      { name: 'Elías', personId: 5 },
    ],
    keyVerse: { bookId: 2, chapter: 19, verse: 18, citation: 'Éxodo 19:18' },
  },
  // 6. Río Jordán
  6: {
    radiusMeters: 3800,
    color: '#0284c7',
    borderColor: '#38bdf8',
    fillColor: '#38bdf8',
    icon: '🌊',
    historicalSizeText: 'Valle del Jordán y Vado de Betábara · Corredor ribereño de 3.8 km',
    ancientDescription: 'Cauce histórico que une Galilea con el Mar Muerto. Aguas del bautismo de Jesús y el cruce de Josué.',
    associatedPeople: [
      { name: 'Josué' },
      { name: 'Juan el Bautista' },
      { name: 'Jesús de Nazaret' },
    ],
    keyVerse: { bookId: 40, chapter: 3, verse: 16, citation: 'Mateo 3:16' },
  },
  // 7. Monte de los Olivos
  7: {
    radiusMeters: 2000,
    color: '#8b5cf6',
    borderColor: '#a78bfa',
    fillColor: '#a78bfa',
    icon: '⛰️',
    historicalSizeText: 'Loma oriental de Jerusalén · Cresta de 2.0 km de radio',
    ancientDescription: 'Cumbre sagrada que domina el Templo. Lugar de la Ascensión de Jesús y de la profecía de su regreso.',
    associatedPeople: [
      { name: 'David', personId: 1 },
      { name: 'Jesús de Nazaret' },
      { name: 'Zacarías' },
    ],
    keyVerse: { bookId: 44, chapter: 1, verse: 11, citation: 'Hechos 1:11' },
  },
  // 8. Jericó
  8: {
    radiusMeters: 1800,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '🌴',
    historicalSizeText: 'Ciudad amurallada de las palmeras · Oasis milenario de 1.8 km de radio',
    ancientDescription: 'La ciudad amurallada más baja y antigua del planeta (-250 m bajo el nivel del mar), famosa por la fe de Josué.',
    associatedPeople: [
      { name: 'Josué' },
      { name: 'Rahab' },
      { name: 'Bartimeo' },
      { name: 'Zaqueo' },
    ],
    keyVerse: { bookId: 6, chapter: 6, verse: 20, citation: 'Josué 6:20' },
  },
  // 9. Hebrón (Mamre y Macpela)
  9: {
    radiusMeters: 2000,
    color: '#10b981',
    borderColor: '#34d399',
    fillColor: '#34d399',
    icon: '🌳',
    historicalSizeText: 'Valle de Encinas & Cueva de Macpela · Perímetro de 2.0 km de radio',
    ancientDescription: 'Tierra de sepulcro de los tres patriarcas y primera sede real de David en Judá.',
    associatedPeople: [
      { name: 'Abraham', personId: 14 },
      { name: 'Sara' },
      { name: 'Isaac' },
      { name: 'Jacob' },
      { name: 'David', personId: 1 },
    ],
    keyVerse: { bookId: 1, chapter: 13, verse: 18, citation: 'Génesis 13:18' },
  },
  // 10. Monte Carmelo
  10: {
    radiusMeters: 5500,
    color: '#8b5cf6',
    borderColor: '#a78bfa',
    fillColor: '#a78bfa',
    icon: '⛰️',
    historicalSizeText: 'Cordillera costera sobre el Mediterráneo · 5.5 km de extensión',
    ancientDescription: 'Cumbres frondosas donde el profeta Elías desafió a los 450 profetas de Baal y descendió fuego divino.',
    associatedPeople: [
      { name: 'Elías', personId: 5 },
      { name: 'Eliseo' },
    ],
    keyVerse: { bookId: 11, chapter: 18, verse: 38, citation: '1 Reyes 18:38' },
  },
  // 11. Betania
  11: {
    radiusMeters: 1200,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '🏡',
    historicalSizeText: 'Poblado rural de reposo · Ladera oriental de 1.2 km de radio',
    ancientDescription: 'El hogar de paz de Jesús en casa de Marta, María y Lázaro, y lugar de la resurrección de Lázaro.',
    associatedPeople: [
      { name: 'Lázaro' },
      { name: 'Marta' },
      { name: 'María de Betania' },
      { name: 'Jesús de Nazaret' },
    ],
    keyVerse: { bookId: 43, chapter: 11, verse: 43, citation: 'Juan 11:43' },
  },
  // 12. Nazaret
  12: {
    radiusMeters: 1500,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '🪵',
    historicalSizeText: 'Aldea serrana de la Baja Galilea · Cuenca de 1.5 km de radio',
    ancientDescription: 'Aldea oculta entre colinas donde el Verbo se encarnó y Jesús creció en gracia como carpintero.',
    associatedPeople: [
      { name: 'María' },
      { name: 'José' },
      { name: 'Jesús de Nazaret' },
    ],
    keyVerse: { bookId: 42, chapter: 1, verse: 26, citation: 'Lucas 1:26' },
  },
  // 13. Capernaúm
  13: {
    radiusMeters: 1600,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '⛵',
    historicalSizeText: 'Puerto pesquero y sinagoga blanca · 1.6 km de radio ribereño',
    ancientDescription: 'El centro neurálgico del ministerio público de Jesús. La aldea del consuelo donde sanó al paralítico.',
    associatedPeople: [
      { name: 'Jesús de Nazaret' },
      { name: 'Pedro', personId: 7 },
      { name: 'Mateo' },
    ],
    keyVerse: { bookId: 40, chapter: 4, verse: 13, citation: 'Mateo 4:13' },
  },
  // 14. Monte de las Bienaventuranzas
  14: {
    radiusMeters: 1500,
    color: '#8b5cf6',
    borderColor: '#a78bfa',
    fillColor: '#a78bfa',
    icon: '⛰️',
    historicalSizeText: 'Colina del Sermón del Monte · Anfiteatro natural de 1.5 km',
    ancientDescription: 'Ladera serena cubierta de hierba verde frente al mar donde Jesús proclamó la constitución del Reino.',
    associatedPeople: [
      { name: 'Jesús de Nazaret' },
      { name: 'Los Doce Apóstoles' },
    ],
    keyVerse: { bookId: 40, chapter: 5, verse: 3, citation: 'Mateo 5:3' },
  },
  // 15. Pozo de Jacob (Sicar)
  15: {
    radiusMeters: 1500,
    color: '#0284c7',
    borderColor: '#38bdf8',
    fillColor: '#38bdf8',
    icon: '💧',
    historicalSizeText: 'Pozo de aguas vivas en Samaria · 1.5 km de radio en Siquem',
    ancientDescription: 'Pozo de más de 30 metros de profundidad excavado por Jacob. Encuentro con la mujer samaritana.',
    associatedPeople: [
      { name: 'Jacob' },
      { name: 'Jesús de Nazaret' },
      { name: 'La Mujer Samaritana' },
    ],
    keyVerse: { bookId: 43, chapter: 4, verse: 14, citation: 'Juan 4:14' },
  },
  // 16. Betel
  16: {
    radiusMeters: 1500,
    color: '#10b981',
    borderColor: '#34d399',
    fillColor: '#34d399',
    icon: '✨',
    historicalSizeText: 'Casa de Dios & Escalera del Cielo · 1.5 km de radio',
    ancientDescription: 'Colina rocosa donde Jacob soñó con la escalera de ángeles y Dios renovó la promesa de bendición.',
    associatedPeople: [
      { name: 'Jacob' },
      { name: 'Abraham', personId: 14 },
    ],
    keyVerse: { bookId: 1, chapter: 28, verse: 16, citation: 'Génesis 28:16' },
  },
  // 17. Caminos de Emaús
  17: {
    radiusMeters: 2500,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '🚶',
    historicalSizeText: 'Ruta de peregrinación de Emaús · Corredor de 2.5 km',
    ancientDescription: 'El camino donde el Cristo resucitado caminó incógnito con dos discípulos y les ardió el corazón.',
    associatedPeople: [
      { name: 'Cleofas' },
      { name: 'Jesús Resucitado' },
    ],
    keyVerse: { bookId: 42, chapter: 24, verse: 32, citation: 'Lucas 24:32' },
  },
  // 18. Cesarea de Filipo
  18: {
    radiusMeters: 2200,
    color: '#0284c7',
    borderColor: '#38bdf8',
    fillColor: '#38bdf8',
    icon: '⛰️',
    historicalSizeText: 'Manantiales de Banias al pie del Hermón · 2.2 km de radio',
    ancientDescription: 'Enorme paredón rocoso donde Pedro declaró: «Tú eres el Cristo, el Hijo del Dios viviente».',
    associatedPeople: [
      { name: 'Pedro', personId: 7 },
      { name: 'Jesús de Nazaret' },
    ],
    keyVerse: { bookId: 40, chapter: 16, verse: 16, citation: 'Mateo 16:16' },
  },
  // 19. Monte Hermón
  19: {
    radiusMeters: 8000,
    color: '#8b5cf6',
    borderColor: '#a78bfa',
    fillColor: '#a78bfa',
    icon: '❄️',
    historicalSizeText: 'La cumbre nevada de 2,814 metros · Macizo de 8.0 km de radio',
    ancientDescription: 'La corona blanca del norte de Israel. Símbolo del rocío celestial que desciende sobre los hermanos en unidad.',
    associatedPeople: [
      { name: 'David', personId: 1 },
      { name: 'Jesús de Nazaret' },
    ],
    keyVerse: { bookId: 19, chapter: 133, verse: 3, citation: 'Salmos 133:3' },
  },
  // 20. Isla de Patmos
  20: {
    radiusMeters: 6000,
    color: '#10b981',
    borderColor: '#34d399',
    fillColor: '#34d399',
    icon: '🏝️',
    historicalSizeText: 'Isla volcánica del Mar Egeo · Perímetro de 6.0 km',
    ancientDescription: 'Isla del destierro de Juan donde el cielo se abrió para revelar el triunfo del Cordero y la Nueva Jerusalén.',
    associatedPeople: [
      { name: 'Juan el Apóstol', personId: 9 },
    ],
    keyVerse: { bookId: 66, chapter: 1, verse: 9, citation: 'Apocalipsis 1:9' },
  },
  // 21. Éfeso
  21: {
    radiusMeters: 3000,
    color: '#ec4899',
    borderColor: '#f472b6',
    fillColor: '#f472b6',
    icon: '🏛️',
    historicalSizeText: 'Metrópolis imperial y puerto de Asia Menor · 3.0 km de radio urbano',
    ancientDescription: 'La gran capital misionera de Pablo durante tres años. Cuna de la armadura espiritual y el primer amor.',
    associatedPeople: [
      { name: 'Pablo', personId: 10 },
      { name: 'Juan el Apóstol', personId: 9 },
      { name: 'Timoteo' },
    ],
    keyVerse: { bookId: 49, chapter: 6, verse: 11, citation: 'Efesios 6:11' },
  },
  // 22. Damasco
  22: {
    radiusMeters: 2800,
    color: '#ec4899',
    borderColor: '#f472b6',
    fillColor: '#f472b6',
    icon: '🏛️',
    historicalSizeText: 'Ciudad amurallada milenaria · Oasis del Barada · 2.8 km de radio urbano',
    ancientDescription: 'Una de las urbes continuas más antiguas de la tierra. Escenario de la luz celestial que transformó a Saulo y la calle llamada Derecha.',
    associatedPeople: [
      { name: 'Saulo de Tarso (Pablo)', personId: 10 },
      { name: 'Ananías' },
      { name: 'Bernabé' },
    ],
    keyVerse: { bookId: 44, chapter: 9, verse: 3, citation: 'Hechos 9:3' },
  },
  // 23. Montes de Ararat
  23: {
    radiusMeters: 7000,
    color: '#8b5cf6',
    borderColor: '#a78bfa',
    fillColor: '#a78bfa',
    icon: '🌈',
    historicalSizeText: 'Gran macizo de Ararat (5,137 m) · Perímetro de 7.0 km',
    ancientDescription: 'El reposo del arca de Noé tras el diluvio, donde se erigió el primer altar y Dios selló el arcoíris de paz.',
    associatedPeople: [
      { name: 'Noé' },
    ],
    keyVerse: { bookId: 1, chapter: 8, verse: 4, citation: 'Génesis 8:4' },
  },
  // 24. En-gadi
  24: {
    radiusMeters: 2000,
    color: '#10b981',
    borderColor: '#34d399',
    fillColor: '#34d399',
    icon: '🐐',
    historicalSizeText: 'Cascadas de agua dulce en peñascos del Mar Muerto · 2.0 km de radio',
    ancientDescription: 'Oasis milagroso donde David halló refugio en las cuevas y perdonó la vida a Saúl, eligiendo la gracia.',
    associatedPeople: [
      { name: 'David', personId: 1 },
      { name: 'Saúl' },
    ],
    keyVerse: { bookId: 9, chapter: 24, verse: 1, citation: '1 Samuel 24:1' },
  },
};
