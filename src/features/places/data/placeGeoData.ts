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
  // 25. Estanque de Siloé
  25: {
    radiusMeters: 600,
    color: '#06b6d4',
    borderColor: '#22d3ee',
    fillColor: '#22d3ee',
    icon: '💧',
    historicalSizeText: 'Estanque sagrado de cantería y escalones de piedra · 600 m de perímetro',
    ancientDescription: 'Alimentado por el túnel de Ezequías desde el manantial de Gihón. Jesús envió al ciego aquí y recobró la vista.',
    associatedPeople: [
      { name: 'Jesús de Nazaret' },
      { name: 'Ezequías' },
    ],
    keyVerse: { bookId: 43, chapter: 9, verse: 7, citation: 'Juan 9:7' },
  },
  // 26. Monte Nebo (Pisga)
  26: {
    radiusMeters: 3000,
    color: '#8b5cf6',
    borderColor: '#a78bfa',
    fillColor: '#a78bfa',
    icon: '⛰️',
    historicalSizeText: 'Cumbre de Abarim frente a Jericó (817 m) · 3.0 km de radio',
    ancientDescription: 'Mirador sagrado desde donde Moisés contempló la Tierra Prometida antes de ser sepultado por la mano de Dios.',
    associatedPeople: [
      { name: 'Moisés' },
      { name: 'Josué' },
    ],
    keyVerse: { bookId: 5, chapter: 34, verse: 1, citation: 'Deuteronomio 34:1' },
  },
  // 27. Mar Rojo (Paso de Salvación)
  27: {
    radiusMeters: 8000,
    color: '#0284c7',
    borderColor: '#38bdf8',
    fillColor: '#38bdf8',
    icon: '🌊',
    historicalSizeText: 'Costa de Nuweiba y Golfo de Aqaba · Vado milagroso de 8.0 km',
    ancientDescription: 'Donde el viento de Dios abrió camino en medio del mar para la salvación de Israel y sepultó la opresión.',
    associatedPeople: [
      { name: 'Moisés' },
      { name: 'Aarón' },
      { name: 'María' },
    ],
    keyVerse: { bookId: 2, chapter: 14, verse: 21, citation: 'Éxodo 14:21' },
  },
  // 28. Ur de los Caldeos
  28: {
    radiusMeters: 3500,
    color: '#d97706',
    borderColor: '#f59e0b',
    fillColor: '#f59e0b',
    icon: '🏺',
    historicalSizeText: 'Gran metrópoli sumeria y zigurat · 3.5 km de radio',
    ancientDescription: 'Cuna de civilizaciones donde Abraham escuchó el llamado de Dios y salió por fe hacia una patria celestial.',
    associatedPeople: [
      { name: 'Abraham' },
      { name: 'Sara' },
    ],
    keyVerse: { bookId: 1, chapter: 11, verse: 31, citation: 'Génesis 11:31' },
  },
  // 29. Cesarea Marítima
  29: {
    radiusMeters: 2500,
    color: '#0d9488',
    borderColor: '#2dd4bf',
    fillColor: '#2dd4bf',
    icon: '⛵',
    historicalSizeText: 'Puerto artificial herodiano y acueducto · 2.5 km de radio',
    ancientDescription: 'Sede romana donde el Espíritu Santo descendió sobre el centurión Cornelio y Pablo estuvo preso apelando al César.',
    associatedPeople: [
      { name: 'Pedro' },
      { name: 'Pablo' },
      { name: 'Cornelio' },
    ],
    keyVerse: { bookId: 44, chapter: 10, verse: 24, citation: 'Hechos 10:24' },
  },
  // 30. Antioquía de Siria
  30: {
    radiusMeters: 3200,
    color: '#6366f1',
    borderColor: '#818cf8',
    fillColor: '#818cf8',
    icon: '🕊️',
    historicalSizeText: 'Tercera gran metrópolis romana · 3.2 km de radio',
    ancientDescription: 'Comunidad viva donde por primera vez se llamó cristianos a los discípulos y base del envío misionero de Pablo.',
    associatedPeople: [
      { name: 'Bernabé' },
      { name: 'Pablo' },
    ],
    keyVerse: { bookId: 44, chapter: 11, verse: 26, citation: 'Hechos 11:26' },
  },
  // 31. Filipos de Macedonia
  31: {
    radiusMeters: 2000,
    color: '#ec4899',
    borderColor: '#f472b6',
    fillColor: '#f472b6',
    icon: '⛓️',
    historicalSizeText: 'Colonia romana en la Vía Ignacia · 2.0 km de radio',
    ancientDescription: 'Lugar donde se bautizó Lidia y donde Pablo y Silas alabaron a Dios a medianoche, abriendo las puertas de Europa.',
    associatedPeople: [
      { name: 'Pablo' },
      { name: 'Silas' },
      { name: 'Lidia' },
    ],
    keyVerse: { bookId: 44, chapter: 16, verse: 25, citation: 'Hechos 16:25' },
  },
  // 32. Corinto
  32: {
    radiusMeters: 2800,
    color: '#f59e0b',
    borderColor: '#fbbf24',
    fillColor: '#fbbf24',
    icon: '🏛️',
    historicalSizeText: 'Istmo mercantil de Corinto y Acrocorinto · 2.8 km de radio',
    ancientDescription: 'Centro cosmopolita donde Pablo tejió tiendas y predicó la cruz; Dios le prometió: Tengo mucho pueblo en esta ciudad.',
    associatedPeople: [
      { name: 'Pablo' },
      { name: 'Priscila' },
      { name: 'Aquila' },
    ],
    keyVerse: { bookId: 44, chapter: 18, verse: 10, citation: 'Hechos 18:10' },
  },
  // 33. Atenas (El Areópago)
  33: {
    radiusMeters: 1800,
    color: '#6366f1',
    borderColor: '#818cf8',
    fillColor: '#818cf8',
    icon: '📜',
    historicalSizeText: 'Colina de Marte junto a la Acrópolis · 1.8 km de radio',
    ancientDescription: 'Tribunal filosófico donde Pablo reveló al Dios No Conocido ante los epicúreos y estoicos de Grecia.',
    associatedPeople: [
      { name: 'Pablo' },
    ],
    keyVerse: { bookId: 44, chapter: 17, verse: 28, citation: 'Hechos 17:28' },
  },
  // 34. Monte Moriah
  34: {
    radiusMeters: 1200,
    color: '#f59e0b',
    borderColor: '#fbbf24',
    fillColor: '#fbbf24',
    icon: '🔥',
    historicalSizeText: 'Cumbre sagrada de Moriah en Jerusalén · 1.2 km de radio',
    ancientDescription: 'El altar donde Dios proveyó el cordero a Abraham y donde Salomón edificó el Templo santo.',
    associatedPeople: [
      { name: 'Abraham' },
      { name: 'Isaac' },
      { name: 'Salomón' },
    ],
    keyVerse: { bookId: 1, chapter: 22, verse: 14, citation: 'Génesis 22:14' },
  },
  // 35. Valle de Ela
  35: {
    radiusMeters: 2200,
    color: '#10b981',
    borderColor: '#34d399',
    fillColor: '#34d399',
    icon: '🪨',
    historicalSizeText: 'Valle de terebintos y arroyo pedregoso · 2.2 km de radio',
    ancientDescription: 'Escenario del combate de David contra Goliat: cinco piedras lisas y una fe que derriba gigantes.',
    associatedPeople: [
      { name: 'David' },
      { name: 'Goliat' },
    ],
    keyVerse: { bookId: 9, chapter: 17, verse: 45, citation: '1 Samuel 17:45' },
  },
  // 36. Roma (El Corazón del Imperio)
  36: {
    radiusMeters: 4000,
    color: '#ef4444',
    borderColor: '#f87171',
    fillColor: '#f87171',
    icon: '👑',
    historicalSizeText: 'Metrópolis imperial romana, Foro y Vía Apia · 4.0 km de radio',
    ancientDescription: 'Donde el apóstol Pablo proclamó el reino de Dios con toda libertad y selló su carrera en la fe.',
    associatedPeople: [
      { name: 'Pablo' },
      { name: 'Pedro' },
      { name: 'Lucas' },
    ],
    keyVerse: { bookId: 44, chapter: 28, verse: 31, citation: 'Hechos 28:31' },
  },
};
