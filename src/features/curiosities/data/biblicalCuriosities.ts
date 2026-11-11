export type CuriosityCategory =
  | 'records'
  | 'science'
  | 'characters'
  | 'miracles'
  | 'structure';

export interface CuriosityCategoryOption {
  id: 'all' | CuriosityCategory;
  label: string;
  emoji: string;
}

export const CURIOSITY_CATEGORIES: CuriosityCategoryOption[] = [
  { id: 'all', label: 'Todas', emoji: '✨' },
  { id: 'records', label: 'Récords Bíblicos', emoji: '🏆' },
  { id: 'science', label: 'Ciencia Bíblica', emoji: '🔬' },
  { id: 'characters', label: 'Personajes & Hazañas', emoji: '👥' },
  { id: 'miracles', label: 'Hechos Insólitos', emoji: '⚡' },
  { id: 'structure', label: 'Estructura & Curiosidades', emoji: '📜' },
];

export interface BiblicalCuriosity {
  id: string;
  title: string;
  category: CuriosityCategory;
  categoryLabel: string;
  categoryTag: string; // Compact micro-tag: "RÉCORD", "PERSONAJE", "CIENCIA", "INSÓLITO"
  emoji: string;
  badgeValue?: string; // Rich detailed metric: e.g. "1,000 filisteos · Jueces 15", "Casi un día entero · Josué 10"
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  endVerse?: number; // End verse for multi-verse spans (e.g. Josué 10:12-14 -> verse: 12, endVerse: 14)
  biblicalCitation: string; // e.g. "Josué 10:12-14"
  verseSnippet: string; // Reina Valera 1909 verse text
  didYouKnow: string; // Quick punchy insight
  deepDive: string; // Historical / theological / linguistic context
  keyTakeaway: string; // Reflective takeaway
}

export const BIBLICAL_CURIOSITIES: BiblicalCuriosity[] = [
  // === RÉCORDS BÍBLICOS ===
  {
    id: 'record-longest-verse',
    title: 'El Versículo Más Largo de Toda la Biblia',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '🏆',
    badgeValue: '82 palabras · 350+ letras',
    bookId: 17,
    bookName: 'Ester',
    chapter: 8,
    verse: 9,
    biblicalCitation: 'Ester 8:9',
    verseSnippet:
      'Entonces fueron llamados los escribas del rey en el mes tercero, que es Siván, a los veintitrés días de él; y se escribió conforme a todo lo que mandó Mardoqueo...',
    didYouKnow:
      'Ester 8:9 contiene más de 80 palabras y casi 400 caracteres en español. Es el decreto imperial persa redactado por Mardoqueo para revertir la orden genocida de Amán.',
    deepDive:
      'Este versículo describe con minuciosidad administrativa cómo el decreto fue traducido a 127 provincias del imperio, desde la India hasta Etiopía, en cada lengua y escritura. Su longitud refleja la urgencia legal y la total reivindicación del pueblo de Dios ante una sentencia de muerte.',
    keyTakeaway:
      'Así como el decreto del rey llegó a cada rincón para salvar vidas, la gracia de Dios alcanza cada provincia del corazón humano para cancelar cualquier condena.',
  },
  {
    id: 'record-shortest-verse',
    title: 'El Versículo Más Corto de las Escrituras',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '💧',
    badgeValue: 'Solo 2 palabras · 10 letras',
    bookId: 43,
    bookName: 'Juan',
    chapter: 11,
    verse: 35,
    biblicalCitation: 'Juan 11:35',
    verseSnippet: 'Jesús lloró.',
    didYouKnow:
      'En el Nuevo Testamento español, Juan 11:35 es el versículo más corto: apenas dos palabras cargadas del dolor y compasión más profunda de Dios por la humanidad.',
    deepDive:
      'Aunque en el Antiguo Testamento Éxodo 20:13 ("No matarás") o Job 3:2 ("Y dijo Job") son extremadamente breves, "Jesús lloró" conmueve por su teología: el Creador del universo, sabiendo que en minutos resucitaría a Lázaro, lloró al identificarse con el dolor y la muerte que afligen a sus amigos.',
    keyTakeaway:
      'No necesitas oraciones kilométricas para conectar con Dios. En dos palabras, Jesús demostró que nuestro sufrimiento nunca le es indiferente.',
  },
  {
    id: 'record-center-chapter',
    title: 'El Capítulo Central y Más Breve de la Biblia',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '📍',
    badgeValue: '2 versículos · Salmo 117',
    bookId: 19,
    bookName: 'Salmos',
    chapter: 117,
    verse: 1,
    endVerse: 2,
    biblicalCitation: 'Salmo 117:1-2',
    verseSnippet:
      'Alabad a Jehová, naciones todas; pueblos todos, alabadle. Porque ha engrandecido sobre nosotros su misericordia...',
    didYouKnow:
      'El Salmo 117 se ubica en el epicentro exacto de la Biblia tradicional (capítulo 595 de los 1,189 que componen las Escrituras).',
    deepDive:
      'Hay exactamente 594 capítulos antes del Salmo 117 y 594 capítulos después. Con solo dos versículos y cinco frases, este himno resume todo el propósito redentor de las Escrituras: llamar a todas las naciones de la Tierra a reconocer la misericordia y verdad de Dios.',
    keyTakeaway:
      'En el centro geométrico de la Revelación no hay un mandato de temor ni una genealogía densa: hay una invitación universal al gozo y la alabanza.',
  },
  {
    id: 'record-longest-chapter',
    title: 'El Capítulo Más Largo: Acróstico Alfabético',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '📜',
    badgeValue: '176 versículos · Salmo 119',
    bookId: 19,
    bookName: 'Salmos',
    chapter: 119,
    verse: 105,
    biblicalCitation: 'Salmo 119:105',
    verseSnippet: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.',
    didYouKnow:
      'El Salmo 119 tiene 176 versículos. Es una obra maestra literaria dividida en 22 secciones de 8 versículos, cada una dedicada a una letra del alfabeto hebreo (Alef, Bet, Guímel...).',
    deepDive:
      'Cada uno de los 8 versículos de una estrofa comenzaba con la misma letra hebrea en el texto original. Casi todos los 176 versículos contienen un sinónimo de las Escrituras: ley, testimonios, mandamientos, preceptos, estatutos, juicios o promesas.',
    keyTakeaway:
      'El salmista dedicó todo el abecedario para decir que no alcanzan las letras humanas para agotar la riqueza y la guía de la Palabra de Dios.',
  },
  {
    id: 'record-center-verse',
    title: 'El Versículo Central de la Confianza Humana',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '🛡️',
    badgeValue: 'Centro de la Escritura',
    bookId: 19,
    bookName: 'Salmos',
    chapter: 118,
    verse: 8,
    biblicalCitation: 'Salmo 118:8',
    verseSnippet: 'Mejor es esperar en Jehová que esperar en el hombre.',
    didYouKnow:
      'Muchos eruditos bíblicos señalan a Salmo 118:8 como el versículo ubicado en el corazón numérico de la Biblia tradicional de 1,189 capítulos.',
    deepDive:
      'Justo entre el Antiguo y el Nuevo Testamento, este versículo sintetiza la gran lección de la historia sagrada: reyes, ejércitos, filósofos e imperios caen, pero quien funda su esperanza en el Creador permanece seguro e inquebrantable.',
    keyTakeaway:
      'Cuando te sientas decepcionado por personas o circunstancias, recuerda el lema que Dios puso en el centro de su Libro: confía en Él.',
  },
  {
    id: 'record-longest-name',
    title: 'El Nombre Propio Más Largo de la Biblia',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '🏷️',
    badgeValue: '18 letras · Maher-salal-hasbaz',
    bookId: 23,
    bookName: 'Isaías',
    chapter: 8,
    verse: 1,
    endVerse: 3,
    biblicalCitation: 'Isaías 8:1-3',
    verseSnippet:
      'Y me llegué a la profetisa, la cual concibió, y dio a luz un hijo. Y díjome Jehová: Ponle por nombre Maher-salal-hasbaz.',
    didYouKnow:
      'Con 18 caracteres en español, "Maher-salal-hasbaz" es el nombre bíblico más largo. Fue el segundo hijo del profeta Isaías.',
    deepDive:
      'En hebreo (מַהֵר שָׁלָל חָשׁ בַּז) significa "Muy pronto habrá despojo, la presa se precipita". Era una profecía viviente: antes de que el niño aprendiera a decir "papá" o "mamá", los reyes de Damasco y Samaria serían saqueados por el rey de Asiria.',
    keyTakeaway:
      'Dios a menudo usó nombres y señales cotidianas en las familias de los profetas para recordar a su pueblo que el tiempo y la justicia divina nunca se retrasan.',
  },
  {
    id: 'record-oldest-man',
    title: 'El Hombre Más Longevo de la Historia Registrada',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '⏳',
    badgeValue: '969 años de vida · Matusalén',
    bookId: 1,
    bookName: 'Génesis',
    chapter: 5,
    verse: 27,
    biblicalCitation: 'Génesis 5:27',
    verseSnippet:
      'Fueron, pues, todos los días de Matusalén novecientos sesenta y nueve años; y murió.',
    didYouKnow:
      'Matusalén, hijo de Enoc y abuelo de Noé, alcanzó la asombrosa edad de 969 años antes del Diluvio universal.',
    deepDive:
      'El nombre Matusalén proviene de raíces hebreas que significan "Cuando él muera, vendrá" o "Hombre del dardo". Calculando las genealogías de Génesis 5 y 7, el año exacto en que Matusalén murió fue el mismo año en que cayeron las aguas del Diluvio. Su extraordinaria longevidad fue una muestra de la paciencia de Dios dando tiempo al arrepentimiento.',
    keyTakeaway:
      'Los 969 años de Matusalén no son solo un récord biológico antediluviano, sino un testimonio de la inagotable paciencia de Dios antes del juicio.',
  },
  {
    id: 'record-books-no-god',
    title: 'Los Dos Libros que No Mencionan la Palabra «Dios»',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '👑',
    badgeValue: 'Ester & Cantares · 0 menciones',
    bookId: 17,
    bookName: 'Ester',
    chapter: 4,
    verse: 14,
    biblicalCitation: 'Ester 4:14',
    verseSnippet:
      'Porque si callares absolutamente en este tiempo, respiro y liberación vendrá de otra parte para los judíos...',
    didYouKnow:
      'Ni el libro de Ester ni el Cantar de los Cantares contienen explícitamente el nombre de Dios en hebreo (Elohim / Yahvé).',
    deepDive:
      'En Ester, Dios actúa "detrás del telón": las coincidencias, el insomnio del rey Asuero, y el valor de Ester demuestran que Dios gobierna la historia aun cuando su nombre no se mencione en los registros oficiales de Persia. En Cantares, el amor conyugal puro es celebrado como un don divino implícito.',
    keyTakeaway:
      'Aunque a veces en tu vida no escuches su voz ni veas su nombre en letras grandes, Dios sigue orquestando cada detalle en silencio a favor de los suyos.',
  },
  {
    id: 'record-shortest-book',
    title: 'El Escrito Más Breve de Todo el Canon',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '✉️',
    badgeValue: '13 versículos · Menos de 250 palabras',
    bookId: 63,
    bookName: '2 Juan',
    chapter: 1,
    verse: 12,
    endVerse: 13,
    biblicalCitation: '2 Juan 1:12-13',
    verseSnippet:
      'Muchos tengo que escribiros, mas no he querido comunicarlo por papel y tinta; mas espero ir a vosotros, y hablar boca a boca...',
    didYouKnow:
      '2 Juan tiene solo 13 versículos (alrededor de 245 palabras griegas) y 3 Juan tiene 14 versículos (219 palabras griegas). Ambas cabían con precisión en una sola hoja de papiro del siglo I.',
    deepDive:
      'El apóstol Juan condensó en una página portátil advertencias vitales contra falsos maestros que negaban la encarnación de Cristo, terminando con una entrañable nota: prefería hablar cara a cara para que el gozo fuera completo.',
    keyTakeaway:
      'No hace falta escribir un libro entero para dejar un legado espiritual inmenso. Una sola carta sincera puede transformar una comunidad.',
  },

  // === CIENCIA EN LA BIBLIA ===
  {
    id: 'science-earth-hanging',
    title: 'La Tierra Suspendida en el Vacío Espacial',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🌍',
    badgeValue: 'Gravitación & Astronomía',
    bookId: 18,
    bookName: 'Job',
    chapter: 26,
    verse: 7,
    biblicalCitation: 'Job 26:7',
    verseSnippet:
      'Él extiende el norte sobre vacío, cuelga la tierra sobre la nada.',
    didYouKnow:
      'Job fue escrito hace más de 3,500 años, cuando las mitologías antiguas afirmaban que la Tierra reposaba sobre tortugas gigantes, elefantes o los hombros de Atlas.',
    deepDive:
      'La frase hebrea «cuelga la tierra sobre belí-mah» (literalmente: sobre ninguna cosa / sobre la nada) describe con asombrosa precisión la física del planeta orbitando en el vacío del espacio gravitacional, milenios antes de que Isaac Newton formulara la ley de gravitación universal en 1687.',
    keyTakeaway:
      'La Biblia no es un manual de física, pero cuando habla de la creación, lo hace con la autoridad y la exactitud del Arquitecto del cosmos.',
  },
  {
    id: 'science-earth-sphere',
    title: 'La Esfera Terrestre: El Círculo de la Tierra',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🪐',
    badgeValue: 'Geofísica Anticipada',
    bookId: 23,
    bookName: 'Isaías',
    chapter: 40,
    verse: 22,
    biblicalCitation: 'Isaías 40:22',
    verseSnippet:
      'Él está sentado sobre el círculo de la tierra, cuyos moradores son como langostas...',
    didYouKnow:
      'El profeta Isaías escribió sobre «el círculo de la tierra» en el siglo VIII a.C., unos 2,700 años antes de que las naves espaciales fotografiaran nuestro planeta azul.',
    deepDive:
      'La palabra hebrea utilizada por Isaías es «Jūg» (חוּג), que denota no un disco plano sino esfericidad, horizonte curvo o redondez tridimensional. En una época donde muchos pueblos temían caer por los bordes de la tierra plana, las Escrituras describían la majestuosa curvatura del planeta.',
    keyTakeaway:
      'Desde la perspectiva de Dios, nuestras angustias terrenales se ven en su justa proporción ante la inmensidad de su soberanía.',
  },
  {
    id: 'science-blood-life',
    title: 'La Vida Está en la Sangre: Hematología Sagrada',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🩸',
    badgeValue: 'Fisiología & Medicina',
    bookId: 3,
    bookName: 'Levítico',
    chapter: 17,
    verse: 11,
    biblicalCitation: 'Levítico 17:11',
    verseSnippet:
      'Porque la vida de la carne en la sangre está: y yo os la he dado para expiar vuestras almas sobre el altar...',
    didYouKnow:
      'Hasta el siglo XIX, los médicos practicaban sangrías (desangrar al enfermo con sanguijuelas o cortes), lo que causó la muerte de miles de personas, incluido George Washington en 1799.',
    deepDive:
      'Levítico enseñó hace 3,400 años que la sangre es el fluido vital por excelencia: transporta oxígeno, nutrientes, anticuerpos y regula la temperatura de cada célula viva. Sin ella, ningún tejido sobrevive. Este principio biológico es además el fundamento espiritual del sacrificio de Cristo.',
    keyTakeaway:
      'Dios diseñó la biología de la vida en la sangre terrenal para enseñarnos que nuestra vida espiritual se sostiene únicamente por la sangre de su Hijo.',
  },
  {
    id: 'science-hydrology',
    title: 'El Ciclo del Agua y los Circuitos del Viento',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '💧',
    badgeValue: 'Meteorología Milenaria',
    bookId: 21,
    bookName: 'Eclesiastés',
    chapter: 1,
    verse: 6,
    endVerse: 7,
    biblicalCitation: 'Eclesiastés 1:6-7',
    verseSnippet:
      'Los ríos todos van a la mar, y la mar no se hinche; al lugar de donde los ríos vinieron, allí tornan para correr de nuevo.',
    didYouKnow:
      'El ciclo hidrológico moderno (evaporación, condensación, precipitación y retorno) no fue formalizado en la ciencia occidental hasta Pierre Perrault y Edme Mariotte en el siglo XVII.',
    deepDive:
      'Salomón en Eclesiastés 1:7 y Job 36:27-28 describieron con claridad cómo el agua sube en forma de vapor desde los mares, forma nubes en las alturas, desciende como lluvia sobre las montañas y alimenta de nuevo los ríos en un bucle perfecto.',
    keyTakeaway:
      'Así como la naturaleza sigue un orden fiel establecido por su Creador, los propósitos de Dios para tu vida siempre cumplen su ciclo perfecto.',
  },
  {
    id: 'science-quarantine',
    title: 'Cuarentena y Sanidad Antiséptica Milenaria',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🧼',
    badgeValue: 'Salud Pública · Aislamiento',
    bookId: 3,
    bookName: 'Levítico',
    chapter: 13,
    verse: 45,
    endVerse: 46,
    biblicalCitation: 'Levítico 13:45-46',
    verseSnippet:
      'Todo el tiempo que la llaga estuviere en él, será inmundo; estará impuro: habitará solo; fuera del real será su morada.',
    didYouKnow:
      'En la Edad Media los médicos no se lavaban las manos ni aislaban contagios, propagando pestes. Ignaz Semmelweis descubrió la asepsia en 1847, pero Levítico ya ordenaba lavado con agua corriente y aislamiento.',
    deepDive:
      'La Ley mosaica incluía normas profilácticas avanzadas: aislamiento de 7 a 14 días para enfermedades eruptivas, cubrirse el labio superior al toser (Levítico 13:45), enterramiento de desechos biológicos fuera del campamento (Deuteronomio 23:12-13) y uso de cenizas de vaca roja ricas en potasio (lejía antiséptica).',
    keyTakeaway:
      'El cuidado que Dios puso en la salud física de su pueblo demuestra que el evangelio abarca la dignidad y el bienestar integral del ser humano.',
  },

  // === PERSONAJES Y HAZAÑAS ===
  {
    id: 'character-goliath',
    title: 'La Estatura y Armadura Real de Goliat',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '⚔️',
    badgeValue: '~2.90 metros · 5,000 siclos',
    bookId: 9,
    bookName: '1 Samuel',
    chapter: 17,
    verse: 4,
    endVerse: 7,
    biblicalCitation: '1 Samuel 17:4-7',
    verseSnippet:
      'Salió entonces del campo de los Filisteos un hombre de los intermedios, que se llamaba Goliat, de Gath, y tenía de altura seis codos y un palmo...',
    didYouKnow:
      'Un codo hebreo medía unos 45 cm y un palmo 22 cm. Goliat medía aproximadamente 2.92 metros de estatura y solo su coraza de escamas pesaba más de 55 kilogramos.',
    deepDive:
      'El hierro de su lanza pesaba 600 siclos (casi 7 kg de puro hierro en la punta). El texto lo llama «hombre de los intermedios» (campeón que peleaba en tierra neutral para definir la guerra). David no lo enfrentó con fuerza física, sino con la velocidad y la certeza de saber en nombre de quién peleaba.',
    keyTakeaway:
      'Frente a los gigantes intimidantes que enfrentas a diario, recuerda que el tamaño de tu Dios es infinitamente mayor que el tamaño de cualquier obstáculo.',
  },
  {
    id: 'character-sampson',
    title: 'Sansón y la Victoria con la Quijada de Asno',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🦁',
    badgeValue: '1,000 filisteos · Jueces 15',
    bookId: 7,
    bookName: 'Jueces',
    chapter: 15,
    verse: 14,
    endVerse: 15,
    biblicalCitation: 'Jueces 15:14-15',
    verseSnippet:
      'Y hallando una quijada de asno fresca aún, extendió la mano y tomóla, e hirió con ella a mil hombres.',
    didYouKnow:
      'Sansón rompió las cuerdas que lo ataban como si fueran hilos quemados y venció a un destacamento entero de mil soldados usando el hueso de un asno recién muerto.',
    deepDive:
      'El lugar fue bautizado como Ramat-lehi («la colina de la quijada»). Inmediatamente después, Sansón moría de sed y clamó a Dios, quien hizo brotar un manantial milagroso desde una cavidad de la roca en En-hacore («la fuente del que clama»).',
    keyTakeaway:
      'Dios no necesita armas sofisticadas para librar a sus hijos; con lo que parece débil e insignificante en tus manos, Él puede hacer proezas.',
  },
  {
    id: 'character-ehud-left',
    title: 'Aod: El Libertador Zurdo que Salvó a Israel',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🗡️',
    badgeValue: 'Estrategia ingeniosa · Zurdo',
    bookId: 7,
    bookName: 'Jueces',
    chapter: 3,
    verse: 15,
    endVerse: 16,
    biblicalCitation: 'Jueces 3:15-16',
    verseSnippet:
      'Y clamaron los hijos de Israel a Jehová; y suscitóles Jehová salvador, a Aod, hijo de Gera, Benjamita, el cual era zurdo...',
    didYouKnow:
      'La tribu de Benjamín («hijo de mi diestra») era famosa por tener guerreros zurdos de puntería milimétrica capaces de tirar piedras con honda a un cabello sin errar (Jueces 20:16).',
    deepDive:
      'Los guardias del tirano Eglón de Moab revisaban el costado izquierdo de los visitantes (donde los diestros llevan la espada). Aod ocultó un puñal de doble filo de un codo de largo bajo su ropa en su muslo derecho. Gracias a esa diferencia física, liberó a su nación y dio a la tierra 80 años de paz.',
    keyTakeaway:
      'Lo que para el mundo puede parecer una peculiaridad o desventaja, en las manos del Creador se convierte en tu mayor herramienta de victoria.',
  },
  {
    id: 'character-moses-strength',
    title: 'Moisés a los 120 Años: Ojos Brillantes y Vigor',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🏔️',
    badgeValue: '120 años sin desgaste visual',
    bookId: 5,
    bookName: 'Deuteronomio',
    chapter: 34,
    verse: 7,
    biblicalCitation: 'Deuteronomio 34:7',
    verseSnippet:
      'Y era Moisés de edad de ciento y veinte años cuando murió: sus ojos nunca se oscurecieron, ni perdió su vigor.',
    didYouKnow:
      'Moisés subió a pie hasta la cima del monte Nebo a los 120 años y contempló toda la Tierra Prometida con una vista tan nítida como en su juventud.',
    deepDive:
      'La vida de Moisés se divide en tres actos exactos de 40 años: 40 años pensando que era alguien en el palacio de Faraón, 40 años aprendiendo que no era nadie cuidando ovejas en el desierto de Madián, y 40 años viendo lo que Dios puede hacer con alguien humilde.',
    keyTakeaway:
      'Con Dios no hay fecha de caducidad para tu propósito; la madurez espiritual renueva las fuerzas donde la juventud se desvanece.',
  },

  // === HECHOS INSÓLITOS Y MILAGROS ===
  {
    id: 'miracle-sun-still',
    title: 'El Día en que el Sol y la Luna se Detuvieron',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '☀️',
    badgeValue: 'Casi un día entero · Josué 10',
    bookId: 6,
    bookName: 'Josué',
    chapter: 10,
    verse: 12,
    endVerse: 14,
    biblicalCitation: 'Josué 10:12-14',
    verseSnippet:
      'Sol, deténte en Gabaón; y tú, Luna, en el valle de Ajalón. Y el sol se detuvo y la luna se paró, hasta que la gente se hubo vengado de sus enemigos.',
    didYouKnow:
      'Es el único día registrado en la historia bíblica donde Dios alargó la luz diurna en respuesta directa a la oración ferviente de un líder militar.',
    deepDive:
      'El libro de Jaser cita este evento como un hecho histórico recordado por generaciones. La rotación de la tierra pareció suspenderse o la refracción solar fue extendida sobrenaturalmente para que la justicia de Dios se completara antes del anochecer.',
    keyTakeaway:
      'Cuando estás en la perfecta voluntad de Dios, el tiempo mismo y las leyes de la naturaleza trabajan en favor de sus promesas.',
  },
  {
    id: 'miracle-floating-iron',
    title: 'El Hacha de Hierro que Flotó en el Jordán',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '🪓',
    badgeValue: 'Densidad desafiada · 2 Reyes 6',
    bookId: 12,
    bookName: '2 Reyes',
    chapter: 6,
    verse: 5,
    endVerse: 7,
    biblicalCitation: '2 Reyes 6:5-7',
    verseSnippet:
      'Y el varón de Dios dijo: ¿Dónde cayó? Y él le mostró el lugar. Entonces cortó él un palo, y echólo allí, e hizo nadar el hierro.',
    didYouKnow:
      'El hierro tiene una densidad casi 8 veces mayor que el agua, por lo que su flotación desafía completamente las leyes físicas de la hidrodinámica.',
    deepDive:
      'Un joven de la escuela de profetas estaba talando vigas para ampliar el lugar de reunión cuando la cabeza del hacha prestada cayó al caudal turbio del río Jordán. El joven lloró angustiado porque era alquilada. Eliseo arrojó una rama de madera al agua, y el hierro pesado subió a la superficie flotando como una hoja.',
    keyTakeaway:
      'A Dios no solo le importan los grandes imperios mundiales; se interesa profundamente por aquello prestado que perdiste y por tus lágrimas en lo cotidiano.',
  },
  {
    id: 'miracle-shadow-backward',
    title: 'La Sombra que Retrocedió Diez Grados',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '⏳',
    badgeValue: '10 grados atrás en el reloj de sol',
    bookId: 12,
    bookName: '2 Reyes',
    chapter: 20,
    verse: 9,
    endVerse: 11,
    biblicalCitation: '2 Reyes 20:9-11',
    verseSnippet:
      'Entonces el profeta Isaías clamó a Jehová; e hizo volver la sombra por los grados que había descendido en el reloj de Acaz, diez grados atrás.',
    didYouKnow:
      'Para confirmar la sanidad del rey Ezequías y concederle 15 años más de vida, Dios hizo retroceder la sombra en la escalinata o reloj solar de Acaz.',
    deepDive:
      'Isaías le dio a elegir a Ezequías: «¿Avanzará la sombra diez grados o retrocederá diez grados?». Ezequías respondió que avanzar era natural, pero retroceder era una señal divina incontrovertible. Cronistas babilonios llegaron a Jerusalén poco después fascinados por la maravilla astronómica vista en los cielos (2 Crónicas 32:31).',
    keyTakeaway:
      'Dios es el Señor del tiempo. Lo que parecía perdido o irreversible en tu historia puede ser redimido y restaurado por su poder.',
  },
  {
    id: 'miracle-donkey-spoke',
    title: 'El Asna que Habló con Voz Humana',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '🫏',
    badgeValue: 'Números 22 · Reprensión animal',
    bookId: 4,
    bookName: 'Números',
    chapter: 22,
    verse: 28,
    endVerse: 30,
    biblicalCitation: 'Números 22:28-30',
    verseSnippet:
      'Entonces Jehová abrió la boca al asna, la cual dijo a Balaam: ¿Qué te he hecho, que me has herido estas tres veces?',
    didYouKnow:
      'El animal fue más sensible espiritualmente que el profeta codicioso: el asna vio tres veces al Ángel de Jehová con la espada desenvainada antes de que Balaam abriera los ojos.',
    deepDive:
      'En el Nuevo Testamento, el apóstol Pedro corrobora este milagro: «la muda bestia de carga, hablando con voz de hombre, refrenó la locura del profeta» (2 Pedro 2:16). Dios utilizó un animal dócil para humillar el orgullo de quien pretendía maldecir a Israel por dinero.',
    keyTakeaway:
      'A veces las advertencias de Dios vienen de los lugares y personas más inesperados. Mantén tu corazón humilde para escuchar su voz.',
  },
  {
    id: 'miracle-bloody-sweat',
    title: 'El Sudor como Gotas de Sangre en Getsemaní',
    category: 'miracles',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🩺',
    badgeValue: 'Hematidrosis médica documentada',
    bookId: 42,
    bookName: 'Lucas',
    chapter: 22,
    verse: 44,
    biblicalCitation: 'Lucas 22:44',
    verseSnippet:
      'Y estando en agonía, oraba más intensamente; y fue su sudor como grandes gotas de sangre que caían hasta la tierra.',
    didYouKnow:
      'Solo el evangelista Lucas —quien era médico de profesión (Colosenses 4:14)— registró el fenómeno clínico de Jesús sudando sangre en el huerto de Getsemaní.',
    deepDive:
      'La medicina moderna reconoce esta condición rarísima llamada «hematidrosis»: ante un estrés emocional o angustia psicológica aplastante, los capilares sanguíneos que rodean las glándulas sudoríparas se rompen por vasoconstricción extrema, tiñendo el sudor de rojo vivo. Jesús experimentó el peso moral de cargar el pecado de todo el mundo.',
    keyTakeaway:
      'La agonía de Jesús en Getsemaní nos revela el inmenso costo emocional y físico que pagó por amor a ti antes de llegar a la cruz.',
  },

  // === CIENCIA BÍBLICA ADICIONAL ===
  {
    id: 'science-stars-innumerable',
    title: 'Las Estrellas Incontables como los Granos de Arena',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🌌',
    badgeValue: 'Jeremías 33:22 · Astronomía antigua',
    bookId: 24,
    bookName: 'Jeremías',
    chapter: 33,
    verse: 22,
    biblicalCitation: 'Jeremías 33:22',
    verseSnippet:
      'Como no puede ser contado el ejército del cielo, ni la arena del mar se puede medir, así multiplicaré la simiente de David mi siervo...',
    didYouKnow:
      'En la antigüedad, Ptolomeo y los astrónomos creían que había entre 1,000 y 3,000 estrellas a simple vista. Pero Jeremías afirmó hace 2,600 años que eran infinitas e incontables como la arena del mar.',
    deepDive:
      'Hoy la astrofísica calcula que hay más de 10^22 estrellas en el universo visible, una cantidad astronómicamente equivalente a los granos de arena de todas las playas de la Tierra.',
    keyTakeaway:
      'El mismo Dios que llama a cada estrella por su nombre y sostiene las galaxias cuida con infinita ternura cada paso de tu vida.',
  },
  {
    id: 'science-ocean-springs',
    title: 'Los Manantiales Ocultos en el Fondo del Océano',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🌊',
    badgeValue: 'Job 38:16 · Fuentes hidrotermales',
    bookId: 18,
    bookName: 'Job',
    chapter: 38,
    verse: 16,
    biblicalCitation: 'Job 38:16',
    verseSnippet:
      '¿Has entrado tú hasta los manantiales del mar, y has andado paseando en el fondo del abismo?',
    didYouKnow:
      'Hasta 1977 la oceanografía moderna pensaba que el lecho marino era un fondo rocoso plano. Ese año, sumergibles descubrieron fumarolas y manantiales de agua dulce caliente brotando del fondo oceánico.',
    deepDive:
      'El libro de Job, escrito hace más de tres milenios, ya registraba las preguntas del Creador sobre los «manantiales del mar» mucho antes de que existieran barcos o submarinos de alta profundidad.',
    keyTakeaway:
      'Hay profundidades invisibles para tus ojos que ya están sustentadas y provistas por Dios. Confía aun cuando no puedas ver el fondo.',
  },
  {
    id: 'science-air-weight',
    title: 'El Peso del Aire y la Presión Atmosférica',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '⚖️',
    badgeValue: 'Job 28:25 · Barómetro físico',
    bookId: 18,
    bookName: 'Job',
    chapter: 28,
    verse: 25,
    biblicalCitation: 'Job 28:25',
    verseSnippet: 'Al dar peso al viento, y poner las aguas por medida;',
    didYouKnow:
      'No fue sino hasta 1643 que Torricelli demostró científicamente que el aire tiene peso físico. Job lo afirmó con precisión asombrosa miles de años antes.',
    deepDive:
      'La atmósfera terrestre ejerce aproximadamente 1 kg de presión por centímetro cuadrado al nivel del mar. La Biblia reveló el balance físico perfecto entre el peso del viento y el ciclo de las aguas.',
    keyTakeaway:
      'Incluso lo que te parece invisible y sutil como el viento tiene propósito, medida y peso exacto ante los ojos de Dios.',
  },
  {
    id: 'science-stars-pleiades-orion',
    title: 'Los Lazos de las Pléyades y las Cadenas de Orión',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '✨',
    badgeValue: 'Job 38:31 · Gravitación orbital',
    bookId: 18,
    bookName: 'Job',
    chapter: 38,
    verse: 31,
    biblicalCitation: 'Job 38:31',
    verseSnippet:
      '¿Podrás tú atar los lazos de las Pléyades, o desatarás las ligaduras de Orión?',
    didYouKnow:
      'La astrofísica moderna demostró que las estrellas de las Pléyades están unidas gravitacionalmente viajando juntas en racimo, mientras que las de la constelación de Orión se están separando lentamente.',
    deepDive:
      'Dios le preguntó a Job si podía «atar las Pléyades o desatar Orión», revelando con precisión la mecánica de atracción celeste que la humanidad recién comprendió con telescopios espaciales.',
    keyTakeaway:
      'El Dios que gobierna los cúmulos estelares y las leyes del universo sostiene con fidelidad cada día de tu vida.',
  },
  {
    id: 'science-dna-unformed-substance',
    title: 'El Código Genético y el Embrión en el Vientre',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🧬',
    badgeValue: 'Salmos 139:16 · El ADN divino',
    bookId: 19,
    bookName: 'Salmos',
    chapter: 139,
    verse: 16,
    biblicalCitation: 'Salmos 139:16',
    verseSnippet:
      'Mi embrión vieron tus ojos, y en tu libro estaban escritas todas aquellas cosas que fueron luego formadas, sin faltar una de ellas.',
    didYouKnow:
      'David utilizó la palabra hebrea «Gólem» (sustancia no formada o embrión) para describir cómo todas las características de su cuerpo ya estaban «escritas en un libro» antes de nacer.',
    deepDive:
      'La genética descubrió que en la fecundación, la cadena de ADN ya contiene escritas todas las instrucciones biológicas de una persona. La Biblia anticipó esta verdad con lenguaje poético sagrado.',
    keyTakeaway:
      'No eres fruto de la casualidad. Antes de que existieras físicamente, el Creador ya te conocía, te amaba y diseñó tu vida con infinito propósito.',
  },
  {
    id: 'science-ocean-currents-maury',
    title: 'Las Sendas del Mar y el Nacimiento de la Oceanografía',
    category: 'science',
    categoryLabel: 'Ciencia Bíblica',
    categoryTag: 'CIENCIA',
    emoji: '🧭',
    badgeValue: 'Salmos 8:8 · Matthew Maury (1855)',
    bookId: 19,
    bookName: 'Salmos',
    chapter: 8,
    verse: 8,
    biblicalCitation: 'Salmos 8:8',
    verseSnippet:
      'Las aves de los cielos, y los peces del mar; todo cuanto pasa por los senderos del mar.',
    didYouKnow:
      'Matthew Maury, padre de la oceanografía moderna, leyó Salmos 8:8 en su lecho de enfermo y se propuso cartografiar las rutas y corrientes marinas, revolucionando la navegación de toda la humanidad.',
    deepDive:
      'Siguiendo la pista bíblica de «los senderos del mar», Maury mapeó las corrientes del Atlántico (como la del Golfo), acortando semanas de viaje a los navíos y salvando incontables vidas de naufragios.',
    keyTakeaway:
      'La fe y la ciencia auténtica caminan de la mano: cuando escudriñas la creación de Dios descubres las huellas de Su infinita sabiduría.',
  },

  // === RÉCORDS BÍBLICOS ADICIONALES ===
  {
    id: 'record-longest-prayer',
    title: 'La Oración Comunitaria Más Larga de la Biblia',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '🙏',
    badgeValue: '1,000+ palabras · Nehemías 9',
    bookId: 16,
    bookName: 'Nehemías',
    chapter: 9,
    verse: 5,
    endVerse: 38,
    biblicalCitation: 'Nehemías 9:5-38',
    verseSnippet:
      'Levantaos, bendecid a Jehová vuestro Dios desde la eternidad hasta la eternidad; y bendígase el nombre de tu gloria, alto sobre toda bendición y alabanza.',
    didYouKnow:
      'La oración de Nehemías 9 es la más extensa registrada en las Escrituras. Hace un recorrido histórico y teológico completo desde Abraham y el Éxodo hasta el regreso de Babilonia.',
    deepDive:
      'Durante horas, los levitas guiaron al pueblo reconociendo la inquebrantable paciencia de Dios frente a las fallas humanas. Su equilibrio de alabanza y confesión es una joya espiritual.',
    keyTakeaway:
      'Una oración profunda recuerda la fidelidad de Dios en el pasado para encontrar paz, perdón y fuerza renovada en el presente.',
  },
  {
    id: 'record-shortest-prayer',
    title: 'La Oración Más Breve y Urgente de los Evangelios',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '⚡',
    badgeValue: 'Solo 3 palabras · Mateo 14:30',
    bookId: 40,
    bookName: 'Mateo',
    chapter: 14,
    verse: 30,
    biblicalCitation: 'Mateo 14:30',
    verseSnippet:
      'Mas viendo el viento fuerte, tuvo miedo; y comenzando a hundirse, dio voces, diciendo: ¡Señor, sálvame!',
    didYouKnow:
      'Cuando el apóstol Pedro se hundía en el mar de Galilea, no tuvo tiempo para preámbulos: gritó tres palabras contundentes («¡Señor, sálvame!») y Jesús extendió Su mano de inmediato.',
    deepDive:
      'En el original griego son apenas dos palabras (Kýrie, sôson). Dios no mide la eficacia de nuestras oraciones por su duración o elocuencia, sino por la sinceridad del clamor del corazón.',
    keyTakeaway:
      'En medio de tus mayores tempestades, un clamor sincero a Dios basta. Jesús siempre está a un grito de distancia para rescatarte.',
  },
  {
    id: 'record-richest-king',
    title: 'La Riqueza Colosal del Rey Salomón',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '👑',
    badgeValue: '666 talentos de oro / año (~$1B)',
    bookId: 11,
    bookName: '1 Reyes',
    chapter: 10,
    verse: 14,
    biblicalCitation: '1 Reyes 10:14',
    verseSnippet:
      'El peso del oro que Salomón recibía cada año era de seiscientos sesenta y seis talentos de oro;',
    didYouKnow:
      'Salomón recibía unas 25 toneladas métricas de oro puro cada año solo por tributos de reinos vecinos. La Biblia dice que en Jerusalén la plata se volvió tan común como las piedras del camino.',
    deepDive:
      'A pesar de tanta opulencia, Salomón concluyó al final de sus días que todo el oro del mundo es vanidad sin una comunión viva con Dios. El mayor tesoro es la sabiduría celestial.',
    keyTakeaway:
      'Los bienes materiales nunca podrán saciar el vacío de tu alma. La verdadera plenitud se halla en la paz de Dios y en un corazón agradecido.',
  },
  {
    id: 'record-oldest-mother',
    title: 'Sara: Madre por Primera Vez a los 90 Años',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '🤱',
    badgeValue: '90 años de edad · Génesis 17',
    bookId: 1,
    bookName: 'Génesis',
    chapter: 17,
    verse: 17,
    biblicalCitation: 'Génesis 17:17',
    verseSnippet:
      '¿A hombre de cien años ha de nacer hijo? ¿Y Sara, ya de noventa años, ha de concebir?',
    didYouKnow:
      'Sara dio a luz a su hijo Isaac a los 90 años, cuando su esposo Abraham tenía 100. Por eso llamaron al niño Isaac, que significa: «Risa de gozo».',
    deepDive:
      'Biológica y médicamente era un caso totalmente imposible tras toda una vida de esterilidad. Dios permitió que toda fuerza humana se agotara para que el milagro fuera incuestionable.',
    keyTakeaway:
      'Las promesas de Dios no caducan ante el reloj del tiempo. Lo que parece humanamente imposible es la especialidad del poder divino.',
  },
  {
    id: 'record-most-children',
    title: 'Gedeón y su Récord Familiar de 70 Hijos',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '👨‍👧‍👦',
    badgeValue: '70 hijos varones · Jueces 8:30',
    bookId: 7,
    bookName: 'Jueces',
    chapter: 8,
    verse: 30,
    biblicalCitation: 'Jueces 8:30',
    verseSnippet:
      'Y tuvo Gedeón setenta hijos que salieron de sus lomos, porque tuvo muchas mujeres.',
    didYouKnow:
      'El libertador Gedeón tuvo 70 hijos reconocidos en su vejez. La Escritura no esconde las fallas familiares de sus héroes, demostrando su honestidad y transparencia histórica.',
    deepDive:
      'A pesar de sus grandes hazañas bélicas liberando a Israel con 300 valientes, las decisiones familiares de Gedeón recordaron a Israel la necesidad de prudencia e integridad en el hogar.',
    keyTakeaway:
      'Las grandes victorias espirituales deben cuidarse con sabiduría cotidiana en la familia. La humildad protege lo que la fe conquistó.',
  },
  {
    id: 'record-longest-famine',
    title: 'Los Siete Años de Gran Hambre en Egipto y Canaán',
    category: 'records',
    categoryLabel: 'Récords Bíblicos',
    categoryTag: 'RÉCORD',
    emoji: '🌾',
    badgeValue: '7 años de sequía · Almacén mundial',
    bookId: 1,
    bookName: 'Génesis',
    chapter: 41,
    verse: 54,
    biblicalCitation: 'Génesis 41:54',
    verseSnippet:
      'Y comenzaron a venir los siete años del hambre, como José había dicho; y hubo hambre en todos los países, mas en toda la tierra de Egipto había pan.',
    didYouKnow:
      'José orquestó el primer plan macroeconómico de almacenamiento de alimentos a nivel continental, salvando del hambre a millones de personas de todo el Oriente Medio.',
    deepDive:
      'Dios usó la traición de los hermanos de José y sus años en prisión para posicionarlo exactamente a tiempo en el trono egipcio: «Dios me envió delante de vosotros para preservar posteridad» (Génesis 45:7).',
    keyTakeaway:
      'Dios anticipa con años de ventaja la solución a tus crisis futuras. Lo que hoy no entiendes terminará siendo instrumento de salvación.',
  },

  // === PERSONAJES & HAZAÑAS ADICIONALES ===
  {
    id: 'character-methuselah-prophecy',
    title: 'El Significado Profético del Nombre de Matusalén',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '⏳',
    badgeValue: '«Al morir, será enviado» · Diluvio',
    bookId: 1,
    bookName: 'Génesis',
    chapter: 5,
    verse: 27,
    biblicalCitation: 'Génesis 5:27',
    verseSnippet:
      'Fueron, pues, todos los días de Matusalén novecientos sesenta y nueve años; y murió.',
    didYouKnow:
      'El nombre Matusalén (Metushélaj) se traduce del hebreo como «Cuando muera, será enviado». Matusalén murió exactamente el mismo año en que se desató el Gran Diluvio.',
    deepDive:
      'Enoc, su padre profeta, le puso ese nombre tras una revelación de Dios. Que Matusalén haya sido el hombre más longevo de la historia (969 años) simboliza la paciencia infinita de Dios esperando al ser humano.',
    keyTakeaway:
      'Dios es paciente y extiende Su misericordia hasta el último segundo posible para darnos oportunidad de vida y salvación.',
  },
  {
    id: 'character-shamgar-oxgoad',
    title: 'Samgar: 600 Enemigos con una Vara de Bueyes',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🌾',
    badgeValue: '600 filisteos · Jueces 3:31',
    bookId: 7,
    bookName: 'Jueces',
    chapter: 3,
    verse: 31,
    biblicalCitation: 'Jueces 3:31',
    verseSnippet:
      'Después de él fue Samgar hijo de Anat, el cual hirió a seiscientos hombres de los filisteos con una aguijada de bueyes; y él también salvó a Israel.',
    didYouKnow:
      'A Samgar le bastó un solo versículo en la Biblia para quedar grabado en la historia: defendió a su pueblo venciendo a 600 soldados con una simple herramienta rústica de labranza.',
    deepDive:
      'Una aguijada de bueyes era una vara larga de madera terminada en punta metálica usada por labradores. Samgar no esperó armas sofisticadas; usó con valor lo que tenía a la mano bajo el favor divino.',
    keyTakeaway:
      'No necesitas títulos ni recursos exorbitantes para hacer la diferencia: pon en las manos de Dios lo que tienes hoy y Él hará cosas extraordinarias.',
  },
  {
    id: 'character-gideon-fleece',
    title: 'El Vellón de Lana Mojado y la Tierra Seca',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🐑',
    badgeValue: 'Un tazón lleno de rocío · Jueces 6',
    bookId: 7,
    bookName: 'Jueces',
    chapter: 6,
    verse: 37,
    endVerse: 38,
    biblicalCitation: 'Jueces 6:37-38',
    verseSnippet:
      'He aquí que yo pondré un vellón de lana en la era; y si el rocío estuviere en el vellón solamente, quedando seca toda la otra tierra, entonces entenderé que has de salvar a Israel por mi mano...',
    didYouKnow:
      'Gedeón pidió una doble confirmación a Dios: primero el vellón empapado y el suelo seco; luego el suelo empapado y el vellón completamente seco. Ambos milagros desafiaron la condensación natural.',
    deepDive:
      'Dios comprendió los temores de Gedeón y no lo reprendió por su inseguridad, sino que fortaleció pacientemente su fe antes de enviarlo a la batalla.',
    keyTakeaway:
      'Dios conoce tus temores y no te rechaza por tus dudas. Con paciencia y amor confirma Su propósito en tu corazón.',
  },
  {
    id: 'character-david-sling-speed',
    title: 'La Honda de David: Más Rápida que un Proyectil Antiguo',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🎯',
    badgeValue: '1 piedra lisa · ~160 km/h de impacto',
    bookId: 9,
    bookName: '1 Samuel',
    chapter: 17,
    verse: 49,
    biblicalCitation: '1 Samuel 17:49',
    verseSnippet:
      'Y metiendo David su mano en el saco, tomó de allí una piedra, y tiróla con la honda, e hirió al filisteo en la frente;',
    didYouKnow:
      'Estudios balísticos confirman que un proyectil lanzado con honda por un pastor hebreo alcanzaba más de 160 km/h, con una energía de impacto comparable al disparo de un arma de fuego moderna.',
    deepDive:
      'Goliat esperaba un combate cuerpo a cuerpo de espada pesada, pero David usó precisión balística a distancia con la confianza absoluta puesta en el Dios de Israel.',
    keyTakeaway:
      'Cuando confías en Dios, tus gigantes no se derriban con la fuerza humana sino con la fe, la puntería divina y la autoridad de Su nombre.',
  },
  {
    id: 'character-benaiah-lion',
    title: 'Benaía: El Hombre que Cazó un León en un Foso Nevado',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🦁',
    badgeValue: '1 león en la nieve · 2 Samuel 23',
    bookId: 10,
    bookName: '2 Samuel',
    chapter: 23,
    verse: 20,
    biblicalCitation: '2 Samuel 23:20',
    verseSnippet:
      'Benaía hijo de Joiada... descendió y mató un león en medio de un foso en tiempo de nieve.',
    didYouKnow:
      'Enfrentar a un león a campo abierto ya es temible, pero bajar voluntariamente a un pozo estrecho y resbaladizo por la nieve sin espacio para huir requería un temple sobrehumano.',
    deepDive:
      'Benaía era de la guardia de élite de David y llegó a ser comandante supremo del ejército del rey Salomón. Su coraje en situaciones extremas lo convirtió en leyenda bíblica.',
    keyTakeaway:
      'No huyas de los momentos difíciles; las mayores pruebas que enfrentas con fe se convertirán en los testimonios más memorables de tu vida.',
  },
  {
    id: 'character-jonah-fish',
    title: 'Tres Días y Noches en el Vientre del Gran Pez',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🐋',
    badgeValue: '72 horas en el abismo · Jonás 1:17',
    bookId: 32,
    bookName: 'Jonás',
    chapter: 1,
    verse: 17,
    biblicalCitation: 'Jonás 1:17',
    verseSnippet:
      'Mas Jehová había preparado un gran pez que tragase a Jonás; y estuvo Jonás en el vientre del pez tres días y tres noches.',
    didYouKnow:
      'El texto hebreo dice «dag gadol» (gran criatura marina) preparada especialmente por Dios, no para ser la tumba de Jonás, sino un refugio y submarino de salvación.',
    deepDive:
      'Jesucristo mismo citó a Jonás en Mateo 12:40 como la figura profética directa de Su propia sepultura y resurrección al tercer día de entre los muertos.',
    keyTakeaway:
      'Ningún lugar es demasiado hondo ni oscuro para la gracia redentora de Dios. Desde el fondo del abismo, Dios escucha tu oración.',
  },
  {
    id: 'character-shadrach-fourth-man',
    title: 'El Cuarto Hombre en el Horno de Fuego',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🔥',
    badgeValue: 'Ni olor a humo · Daniel 3:25',
    bookId: 27,
    bookName: 'Daniel',
    chapter: 3,
    verse: 25,
    biblicalCitation: 'Daniel 3:25',
    verseSnippet:
      'He aquí yo veo cuatro varones sueltos, que se pasean en medio del fuego, y ningún daño hay en ellos; y el parecer del cuarto es semejante al Hijo de Dios.',
    didYouKnow:
      'El horno estaba tan caliente que las llamas mataron a los soldados que los arrojaron. Pero dentro del fuego, Sadrac, Mesac y Abed-nego caminaban ilesos y sin ataduras.',
    deepDive:
      'La Escritura señala que ni siquiera el olor a humo se les pegó a sus ropas. El fuego solo tuvo poder para consumir las cuerdas que los aprisionaban.',
    keyTakeaway:
      'En tus hornos de prueba no estás solo. Cristo entra al fuego contigo para desatarte de las cadenas y preservarte intacto.',
  },

  // === HECHOS INSÓLITOS ADICIONALES ===
  {
    id: 'miracle-elijah-ravens-feed',
    title: 'Los Cuervos que Llevaron Pan y Carne a Elías',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '🦅',
    badgeValue: '2 comidas al día · 1 Reyes 17',
    bookId: 11,
    bookName: '1 Reyes',
    chapter: 17,
    verse: 6,
    biblicalCitation: '1 Reyes 17:6',
    verseSnippet:
      'Y los cuervos le traían pan y carne por la mañana, y pan y carne por la tarde; y bebía del arroyo.',
    didYouKnow:
      'Los cuervos son aves carroñeras instintivamente mezquinas que no comparten comida ni con sus polluelos. Sin embargo, Dios doblegó su instinto para alimentar a Su profeta.',
    deepDive:
      'Durante la severa sequía en Israel, Dios usó a los animales más insólitos para sustentar a Elías en el arroyo de Querit, demostrando Su soberanía sobre toda la naturaleza.',
    keyTakeaway:
      'Cuando caminas en obediencia, Dios puede usar los medios más inesperados para sustentarte. Su provisión nunca llega tarde.',
  },
  {
    id: 'miracle-water-rock-horeb',
    title: 'Ríos de Agua Viva Brotan de una Roca Sólida',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '🪨',
    badgeValue: '2 millones de personas saciadas',
    bookId: 2,
    bookName: 'Éxodo',
    chapter: 17,
    verse: 6,
    biblicalCitation: 'Éxodo 17:6',
    verseSnippet:
      'He aquí que yo estaré delante de ti allí sobre la peña en Horeb; y herirás la peña, y saldrán de ella aguas, y beberá el pueblo.',
    didYouKnow:
      'Para calmar la sed de más de dos millones de personas y sus rebaños en pleno desierto árido, debieron brotar millones de litros de agua dulce por hora de la peña de granito.',
    deepDive:
      'El apóstol Pablo enseña en 1 Corintios 10:4 que aquella roca era símbolo de Cristo: la Roca herida en el Calvario de donde fluye el agua de vida eterna.',
    keyTakeaway:
      'Incluso en las etapas más secas de tu vida, Dios puede hacer florecer ríos de consuelo y sustento donde parecía imposible.',
  },
  {
    id: 'miracle-bitter-waters-marah',
    title: 'El Árbol que Endulzó las Aguas Amargas de Mara',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '🪵',
    badgeValue: 'Éxodo 15:25 · Jehová Rapha',
    bookId: 2,
    bookName: 'Éxodo',
    chapter: 15,
    verse: 25,
    biblicalCitation: 'Éxodo 15:25',
    verseSnippet:
      'Y Moisés clamó a Jehová; y Jehová le mostró un árbol, el cual como lo metió dentro de las aguas, las aguas se endulzaron.',
    didYouKnow:
      'Las aguas de Mara eran venenosas y amargas. Dios no desvió al pueblo hacia otro oasis, sino que sanó el agua presente al arrojar un madero en ella.',
    deepDive:
      'Fue en Mara donde Dios se reveló por primera vez con el nombre de pacto «Jehová Rapha» (Yo soy el Señor tu Sanador), anticipando la cruz que sana toda amargura.',
    keyTakeaway:
      'Dios puede tomar las experiencias más amargas de tu historia y transformarlas en fuentes de sanidad, madurez y dulzura.',
  },
  {
    id: 'miracle-darkness-egypt',
    title: 'Tinieblas Palpables de 72 Horas en Egipto',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '🌑',
    badgeValue: '3 días continuos · Éxodo 10:23',
    bookId: 2,
    bookName: 'Éxodo',
    chapter: 10,
    verse: 23,
    biblicalCitation: 'Éxodo 10:23',
    verseSnippet:
      'Ninguno vio a su prójimo, ni nadie se levantó de su lugar en tres días; mas todos los hijos de Israel tenían luz en sus habitaciones.',
    didYouKnow:
      'No fue un eclipse solar (que solo dura minutos). Fueron tinieblas espesas y sobrenaturales que podían «tocarse» durante tres días, mientras en la tierra de Gosén brillaba la luz normal.',
    deepDive:
      'Esta plaga demostró la absoluta impotencia del dios sol Ra de Egipto ante el verdadero Creador, protegiendo con luz y paz a los hogares de Su pueblo.',
    keyTakeaway:
      'Aunque haya confusión y sombras alrededor, en el corazón y en el hogar de quien confía en Dios siempre resplandecerá Su luz divina.',
  },
  {
    id: 'miracle-manna-forty-years',
    title: 'El Maná: 40 Años de Pan Fresco del Cielo',
    category: 'miracles',
    categoryLabel: 'Hechos Insólitos',
    categoryTag: 'INSÓLITO',
    emoji: '🍞',
    badgeValue: '6 mañanas por semana · Éxodo 16',
    bookId: 2,
    bookName: 'Éxodo',
    chapter: 16,
    verse: 31,
    biblicalCitation: 'Éxodo 16:31',
    verseSnippet:
      'Y la casa de Israel llamó su nombre Maná; y era como semilla de culantro, blanco, y su sabor como de hojuelas con miel.',
    didYouKnow:
      'Cada mañana caía maná con sabor a hojuelas con miel para millones de personas. Si guardaban para el día siguiente se dañaba, enseñándoles a depender del pan diario de Dios.',
    deepDive:
      'El nombre viene de la pregunta hebrea «¿Man hu?» («¿Qué es esto?»). Jesucristo declaró en Juan 6 que Él es el Pan de Vida bajado del cielo que sacia el alma para siempre.',
    keyTakeaway:
      'La fidelidad de Dios no se acumula para años: se recibe día a día. Sus misericordias son nuevas cada mañana.',
  },

  // === ESTRUCTURA & CURIOSIDADES ADICIONALES ===
  {
    id: 'structure-acrostic-psalm119',
    title: 'El Gran Salmo Acróstico del Alfabeto Hebreo',
    category: 'structure',
    categoryLabel: 'Estructura & Curiosidades',
    categoryTag: 'ESTRUCTURA',
    emoji: '🔤',
    badgeValue: '22 letras hebreas · 8 versículos c/u',
    bookId: 19,
    bookName: 'Salmos',
    chapter: 119,
    verse: 1,
    endVerse: 8,
    biblicalCitation: 'Salmos 119:1-8',
    verseSnippet:
      'Bienaventurados los perfectos de camino; los que andan en la ley de Jehová.',
    didYouKnow:
      'El Salmo 119 es una obra maestra poética estructurada con las 22 letras del alfabeto hebreo. Cada uno de los 8 versículos de una sección comienza con la misma letra hebrea.',
    deepDive:
      'De Álef a Tav, sus 176 versículos exaltan la Palabra de Dios usando sinónimos como ley, preceptos, mandamientos y juicios. Era un método pedagógico para memorizar la verdad de la A a la Z.',
    keyTakeaway:
      'La Palabra de Dios abarca toda tu vida: desde la primera hasta la última letra de tu historia, Su luz guía tu camino.',
  },
  {
    id: 'structure-prison-epistles',
    title: 'Las Cuatro Epístolas Escritas desde una Celda',
    category: 'structure',
    categoryLabel: 'Estructura & Curiosidades',
    categoryTag: 'ESTRUCTURA',
    emoji: '⛓️',
    badgeValue: 'Efesios, Filipenses, Colosenses y Filemón',
    bookId: 50,
    bookName: 'Filipenses',
    chapter: 1,
    verse: 13,
    biblicalCitation: 'Filipenses 1:13',
    verseSnippet:
      'De manera que mis prisiones han sido notorias en Cristo en todo el pretorio, y a todos los demás;',
    didYouKnow:
      'La carta más gozosa del Nuevo Testamento (Filipenses, con 16 menciones de alegría) fue escrita por el apóstol Pablo encadenado en una prisión imperial de Roma.',
    deepDive:
      'Pablo convirtió sus cadenas en un testimonio para toda la guardia pretoriana de César. Desde aquella celda salieron cuatro cartas teológicas que cambiaron al mundo.',
    keyTakeaway:
      'El gozo en el Señor no depende de las circunstancias exteriores sino de la certeza interior de Su presencia.',
  },
  {
    id: 'structure-psalm23-translation',
    title: 'El Salmo Más Traducido y Leído en la Historia',
    category: 'structure',
    categoryLabel: 'Estructura & Curiosidades',
    categoryTag: 'ESTRUCTURA',
    emoji: '📖',
    badgeValue: 'Traducido a más de 3,000 idiomas',
    bookId: 19,
    bookName: 'Salmos',
    chapter: 23,
    verse: 1,
    biblicalCitation: 'Salmos 23:1',
    verseSnippet: 'Jehová es mi pastor; nada me faltará.',
    didYouKnow:
      'El Salmo 23 es el poema espiritual más traducido, recitado y memorizado de la literatura universal, llevando consuelo a reyes, campesinos y enfermos durante milenios.',
    deepDive:
      'En el salmo, David habla de Dios en tercera persona («Él me hace descansar») hasta llegar al valle de sombra, donde pasa a hablarle cara a cara en segunda persona: «Porque tú estarás conmigo».',
    keyTakeaway:
      'En tus valles más oscuros, Dios deja de ser una creencia distante para convertirse en una compañía cercana e íntima a tu lado.',
  },

  // === MÁS PERSONAJES & HAZAÑAS BÍBLICAS ===
  {
    id: 'character-caleb-mountain',
    title: 'Caleb a los 85 Años: «Dame Este Monte de Gigantes»',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🏔️',
    badgeValue: '85 años de edad · Hebrón y los gigantes',
    bookId: 6,
    bookName: 'Josué',
    chapter: 14,
    verse: 10,
    endVerse: 12,
    biblicalCitation: 'Josué 14:10-12',
    verseSnippet:
      'Todavía estoy tan fuerte como el día que Moisés me envió... Dame, pues, ahora este monte del cual habló Jehová aquel día;',
    didYouKnow:
      'A los 85 años, cuando cualquier veterano pediría descanso, Caleb pidió la región montañosa más fortificada y peligrosa de Canaán, habitada por los gigantes anaceos.',
    deepDive:
      'Caleb mantuvo intacto su vigor físico y su fe durante los 40 años en el desierto. No buscó el valle cómodo, sino la cumbre prometida por Dios, desalojando a los gigantes con el favor del Señor.',
    keyTakeaway:
      'Tu fe no envejece con los años. Con Dios de tu lado, cada nueva etapa de la vida puede ser una temporada de grandes conquistas espirituales.',
  },
  {
    id: 'character-abigail-wisdom',
    title: 'Abigail: La Mujer Sabia que Detuvo una Masacre',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🕊️',
    badgeValue: 'Diplomacia y 200 panes · 1 Samuel 25',
    bookId: 9,
    bookName: '1 Samuel',
    chapter: 25,
    verse: 32,
    endVerse: 33,
    biblicalCitation: '1 Samuel 25:32-33',
    verseSnippet:
      'Y dijo David a Abigail: Bendito sea Jehová Dios de Israel, que te envió para que hoy me encontrases; y bendito sea tu razonamiento...',
    didYouKnow:
      'Cuando su esposo insensato Nabal insultó a David provocando que 400 soldados armados marcharan a destruirlos, Abigail actuó con rapidez, diplomacia y humildad, frenando el baño de sangre.',
    deepDive:
      'David reconoció que Dios envió a Abigail para librarlo de manchar sus manos de venganza personal antes de ser rey. Tras la muerte de Nabal, David tomó a Abigail por esposa.',
    keyTakeaway:
      'Una palabra dicha con gracia, sabiduría y prudencia en el momento oportuno tiene el poder de apagar los fuegos más violentos de la ira.',
  },
  {
    id: 'character-eleazar-sword-hand',
    title: 'Eleazar: El Guerrero cuya Mano se Pegó a la Espada',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '⚔️',
    badgeValue: '2 Samuel 23:10 · Mano soldada al acero',
    bookId: 10,
    bookName: '2 Samuel',
    chapter: 23,
    verse: 10,
    biblicalCitation: '2 Samuel 23:10',
    verseSnippet:
      'Este se levantó, e hirió a los filisteos hasta que su mano se cansó, y quedó pegada a la espada. Aquel día Jehová dio una gran victoria...',
    didYouKnow:
      'Cuando el ejército de Israel retrocedió atemorizado, Eleazar peleó solo durante horas sin soltar su arma, al punto de que los músculos de sus dedos quedaron pegados a la empuñadura.',
    deepDive:
      'Eleazar era el segundo de los tres valientes supremos de David. Su tenacidad demostró que una sola persona decidida a no ceder puede cambiar el rumbo de toda una nación.',
    keyTakeaway:
      'Aférrate a la verdad de Dios aun cuando los demás se rindan. Quien permanece firme en la batalla verá la mano del Señor darle la victoria.',
  },
  {
    id: 'character-shammah-lentils',
    title: 'Sama: El Hombre que Defendió una Parcela de Lentejas',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🌱',
    badgeValue: '1 parcela de legumbres · Gran rescate',
    bookId: 10,
    bookName: '2 Samuel',
    chapter: 23,
    verse: 12,
    biblicalCitation: '2 Samuel 23:12',
    verseSnippet:
      'El entonces se paró en medio de aquel terreno y lo defendió, e hirió a los filisteos; y Jehová dio una gran victoria.',
    didYouKnow:
      'Mientras todo el pueblo huyó al ver la embestida filistea, Sama se plantó solo en medio de un sembrado de lentejas. Decidió que ni un solo palmo de tierra dada por Dios sería entregado al invasor.',
    deepDive:
      'A los ojos humanos era solo un pequeño campo de comida humilde, pero para Sama era la provisión sagrada de Dios para su pueblo. Dios honró su coraje solitario con una victoria rotunda.',
    keyTakeaway:
      'No menosprecies lo que Dios te ha confiado por pequeño que parezca. Defiende con fidelidad tu terreno espiritual y Dios respaldará tu entrega.',
  },
  {
    id: 'character-deborah-judge',
    title: 'Débora: La Jueza, Profetisa y Estratega de Israel',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🌴',
    badgeValue: 'Jueces 4 · Victoria sobre 900 carros de hierro',
    bookId: 7,
    bookName: 'Jueces',
    chapter: 4,
    verse: 4,
    endVerse: 5,
    biblicalCitation: 'Jueces 4:4-5',
    verseSnippet:
      'Gobernaba en aquel tiempo a Israel una mujer, Débora, profetisa... y acostumbraba sentarse bajo la palmera de Débora... y los hijos de Israel subían a ella a juicio.',
    didYouKnow:
      'En una época dominada por caudillos guerreros, Débora gobernó como jueza suprema y profetisa. El comandante militar Barac se negó a entrar en combate si ella no iba al frente de la tropa.',
    deepDive:
      'Bajo su liderazgo espiritual, Israel derrotó al invencible ejército del general Sísara y sus 900 carros blindados de hierro, inaugurando 40 años de paz ininterrumpida.',
    keyTakeaway:
      'Dios derrama Su sabiduría, liderazgo y valentía sin acepción de personas. Cuando te levantas con fe, inspiras a toda una comunidad a vencer sus temores.',
  },
  {
    id: 'character-jehoshaphat-choir',
    title: 'Josafat y el Coro que Marchó en Vanguardia de Guerra',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🎵',
    badgeValue: 'Adoradores al frente del ejército',
    bookId: 14,
    bookName: '2 Crónicas',
    chapter: 20,
    verse: 21,
    endVerse: 22,
    biblicalCitation: '2 Crónicas 20:21-22',
    verseSnippet:
      'Puso a algunos que cantasen y alabasen a Jehová... Y cuando comenzaron a entonar cantos de alabanza, Jehová puso emboscadas contra los enemigos...',
    didYouKnow:
      'Frente a tres ejércitos invasores combinados, el rey Josafat no colocó infantería de choque ni arqueros al frente, sino un coro con ornamentos sagrados cantando alabanzas.',
    deepDive:
      'Al escuchar la adoración que proclamaba: «Alabad a Jehová, porque su misericordia es para siempre», Dios confundió a los enemigos y se destruyeron mutuamente antes de que Israel desenvainara una sola espada.',
    keyTakeaway:
      'Tu alabanza es un arma espiritual poderosa en medio de las batallas. Cuando adoras en la dificultad, Dios toma el control y pelea por ti.',
  },
  {
    id: 'character-ruth-loyalty',
    title: 'Rut: De Extranjera Viuda a Bisabuela del Rey David',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🌾',
    badgeValue: 'Rut 1:16 · Linaje real de Jesucristo',
    bookId: 8,
    bookName: 'Rut',
    chapter: 1,
    verse: 16,
    biblicalCitation: 'Rut 1:16',
    verseSnippet:
      'Porque a dondequiera que tú fueres, iré yo, y dondequiera que vivieres, viviré. Tu pueblo será mi pueblo, y tu Dios mi Dios.',
    didYouKnow:
      'Rut era de Moab, un pueblo históricamente excluido de Israel. Sin embargo, su lealtad desinteresada hacia Noemí y su abrazo al Dios vivo la insertaron en la genealogía directa del Mesías.',
    deepDive:
      'Trabajando como humilde espigadora recogiendo granos sobrantes en los campos de Belén, conoció a Booz (su pariente redentor), convirtiéndose en bisabuela del rey David y antepasada de Jesús.',
    keyTakeaway:
      'Tu pasado o tu origen no determinan tu futuro cuando pones tu corazón en las manos de Dios. Su gracia redentora te da un nuevo propósito.',
  },
  {
    id: 'character-josiah-boy-king',
    title: 'Josías: El Rey que Comenzó a Gobernar a los 8 Años',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '👑',
    badgeValue: '8 años de edad · 2 Reyes 22:1',
    bookId: 12,
    bookName: '2 Reyes',
    chapter: 22,
    verse: 1,
    endVerse: 2,
    biblicalCitation: '2 Reyes 22:1-2',
    verseSnippet:
      'De ocho años era Josías cuando comenzó a reinar, y reinó en Jerusalén treinta y un años... E hizo lo recto ante los ojos de Jehová...',
    didYouKnow:
      'Coronado siendo apenas un niño en medio de una nación hundida en corrupción, Josías redescubrió el libro de la Ley abandonado en el templo e impulsó la mayor reforma espiritual de Judá.',
    deepDive:
      'Con profunda humildad desgarró sus vestiduras, restauró la celebración de la Pascua y erradicó los altares de idolatría. La Biblia dice que antes de él no hubo rey que se convirtiera al Señor con todo su corazón.',
    keyTakeaway:
      'Nunca eres demasiado joven para marcar un rumbo de integridad. Dios usa a corazones humildes y decididos sin importar su edad.',
  },
  {
    id: 'character-elijah-sprint',
    title: 'Elías: El Profeta que Superó a los Caballos de Acab',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🏃',
    badgeValue: '~30 km a pie bajo tormenta torrencial',
    bookId: 11,
    bookName: '1 Reyes',
    chapter: 18,
    verse: 46,
    biblicalCitation: '1 Reyes 18:46',
    verseSnippet:
      'Y la mano de Jehová estuvo sobre Elías, el cual ciñó sus lomos, y corrió delante de Acab hasta llegar a Jezreel.',
    didYouKnow:
      'Tras el descenso de fuego en el Carmelo y el anuncio de lluvia, Elías corrió a pie casi 30 kilómetros campo a través por delante del veloz carruaje real del rey Acab impulsado por el Espíritu de Dios.',
    deepDive:
      'Un carruaje de guerra con caballos frescos alcanzaba velocidades considerables sobre terreno llano. La «mano de Jehová» sobre Elías le otorgó una aceleración física sobrenatural inolvidable.',
    keyTakeaway:
      'Cuando el poder de Dios te impulsa, adquieres fuerzas renovadas que van mucho más allá de tu propia capacidad humana natural.',
  },
  {
    id: 'character-bezalel-spirit-artisan',
    title: 'Bezalel: El Primer Hombre en la Biblia Lleno del Espíritu',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🎨',
    badgeValue: 'Éxodo 31:2-3 · Orfebre, escultor y diseñador',
    bookId: 2,
    bookName: 'Éxodo',
    chapter: 31,
    verse: 2,
    endVerse: 3,
    biblicalCitation: 'Éxodo 31:2-3',
    verseSnippet:
      'Mira, yo he llamado por nombre a Bezaleel... y lo he llenado del Espíritu de Dios, en sabiduría y en inteligencia, en ciencia y en todo arte,',
    didYouKnow:
      'La primera persona en toda la Biblia de quien se registra que fue «llena del Espíritu de Dios» no fue un rey, sacerdote o profeta, sino un hábil artesano, escultor y diseñador de joyas.',
    deepDive:
      'Dios inspiró con excelencia artística sobrenatural a Bezalel para esculpir el Arca del Pacto, los querubines de oro, el candelabro y los detalles más hermosos del Tabernáculo en el desierto.',
    keyTakeaway:
      'Tus habilidades prácticas, artísticas y laborales también son un don sagrado del Espíritu Santo. Todo talento puesto al servicio de Dios es un ministerio sublime.',
  },
  {
    id: 'character-ezekiel-living-sign',
    title: 'Ezequiel: 390 Días Acostado como Sermón Viviente',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '⏳',
    badgeValue: '430 días totales · Teatro profético viviente',
    bookId: 26,
    bookName: 'Ezequiel',
    chapter: 4,
    verse: 4,
    endVerse: 5,
    biblicalCitation: 'Ezequiel 4:4-5',
    verseSnippet:
      'Y tú te acostarás sobre tu lado izquierdo, y pondrás sobre él la maldad de la casa de Israel... trescientos noventa días;',
    didYouKnow:
      'Ezequiel pasó 390 días acostado sobre su costado izquierdo y luego 40 días sobre el derecho, comiendo pan medido por gramos frente a una maqueta de ladrillo que representaba el sitio de Jerusalén.',
    deepDive:
      'En lugar de solo predicar con palabras, Dios convirtió la vida cotidiana y el cuerpo de Ezequiel en una señal gráfica impactante para advertir a los exiliados babilónicos.',
    keyTakeaway:
      'A veces nuestro mejor testimonio no son discursos elaborados, sino nuestra propia vida de obediencia constante y paciencia ante los ojos de los demás.',
  },
  {
    id: 'character-nehemiah-wall-builder',
    title: 'Nehemías: La Muralla Reconstruida en Tiempo Récord de 52 Días',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🧱',
    badgeValue: '52 días récord · Con la espada en una mano',
    bookId: 16,
    bookName: 'Nehemías',
    chapter: 6,
    verse: 15,
    biblicalCitation: 'Nehemías 6:15',
    verseSnippet:
      'Fue terminada, pues, la muralla, el veinticinco del mes de Elul, en cincuenta y dos días.',
    didYouKnow:
      'Tras más de un siglo en cenizas y escombros, Nehemías organizó a zapateros, perfumistas, sacerdotes y familias para reconstruir los kilómetros de muralla de Jerusalén en menos de dos meses.',
    deepDive:
      'Trabajaron bajo constantes amenazas de guerra: con la llana de albañil en una mano y la lanza defensiva en la otra, orando sin descanso hasta culminar la obra para asombro de las naciones vecinas.',
    keyTakeaway:
      'Cuando unes trabajo enfocado, oración constante y unidad con tus hermanos, lo que parecía tardar años se logra en tiempo récord con la bendición de Dios.',
  },
  {
    id: 'character-phinehas-covenant-peace',
    title: 'Finees: El Celo Sacerdotal que Detuvo la Plaga Mortal',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🛡️',
    badgeValue: 'Números 25 · Pacto de paz perpetuo',
    bookId: 4,
    bookName: 'Números',
    chapter: 25,
    verse: 11,
    biblicalCitation: 'Números 25:11',
    verseSnippet:
      'Finees... ha hecho apartar mi furor de los hijos de Israel, llevado de celo entre ellos; por lo cual yo no he consumido en mi celo a los hijos de Israel.',
    didYouKnow:
      'Cuando una plaga desoladora ya había quitado la vida a 24,000 personas en el campamento por la inmoralidad de Baal-peor, la firme y valiente intervención de Finees frenó la mortandad de inmediato.',
    deepDive:
      'Por su fidelidad incondicional a la santidad divina, Dios selló con Finees y su descendencia un «pacto de paz perpetuo» de sacerdocio honrado a través de las generaciones de Israel.',
    keyTakeaway:
      'La santidad y la valentía espiritual de una sola persona pueden ser el escudo que traiga paz y protección a toda una comunidad.',
  },
  {
    id: 'character-asahel-gazelle-feet',
    title: 'Asael: El Hombre Rápido como una Gacela Salvaje',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🦌',
    badgeValue: '2 Samuel 2:18 · «Ligero de pies como un corzo»',
    bookId: 10,
    bookName: '2 Samuel',
    chapter: 2,
    verse: 18,
    biblicalCitation: '2 Samuel 2:18',
    verseSnippet:
      'Y Asael era ligero de pies como un corzo del campo.',
    didYouKnow:
      'Asael, sobrino del rey David y hermano del general Joab, poseía una velocidad atlética legendaria: la Escritura lo compara poéticamente con una gacela salvaje corriendo por las estepas.',
    deepDive:
      'En la batalla del estanque de Gabaón, persiguió sin descanso al comandante enemigo Abner en una carrera formidable sin desviarse ni a la derecha ni a la izquierda.',
    keyTakeaway:
      'La pasión y los dones extraordinarios deben ir acompañados de templanza y discernimiento para que alcancen su verdadero propósito en Dios.',
  },
  {
    id: 'character-cornelius-centurion',
    title: 'Cornelio: El Centurión cuyas Oraciones Subieron al Cielo',
    category: 'characters',
    categoryLabel: 'Personajes & Hazañas',
    categoryTag: 'PERSONAJE',
    emoji: '🏛️',
    badgeValue: 'Hechos 10 · Puerta del Evangelio a los gentiles',
    bookId: 44,
    bookName: 'Hechos',
    chapter: 10,
    verse: 4,
    biblicalCitation: 'Hechos 10:4',
    verseSnippet:
      'Y él, mirándole fijamente, y atemorizado, dijo: ¿Qué es, Señor? Y le dijo: Tus oraciones y tus limosnas han subido para memoria delante de Dios.',
    didYouKnow:
      'Cornelio era un militar romano del regimiento Itálico; un ángel se le apareció en visión anunciándole que sus oraciones y su generosidad con los necesitados habían llegado como olor grato al trono de Dios.',
    deepDive:
      'El llamado a Pedro para predicar en la casa de Cornelio derribó siglos de barreras religiosas y culturales, inaugurando el derramamiento del Espíritu Santo sobre creyentes de todas las naciones.',
    keyTakeaway:
      'Ninguna oración sincera ni acto de generosidad pasa desapercibido ante Dios. El Señor derriba cualquier muro para alcanzar a quien le busca con corazón puro.',
  },
];

/**
 * Returns formatted string for reader navigation:
 * e.g. "12-14" if curiosity spans multiple verses, or "12" if single verse.
 */
export function getCuriosityHighlightParam(c: BiblicalCuriosity): string {
  if (c.endVerse && c.endVerse > c.verse) {
    return `${c.verse}-${c.endVerse}`;
  }
  return String(c.verse);
}

/**
 * Gets a rotating curiosity for today based on the day of the year.
 * Deterministic and changes every single calendar day.
 */
export function getTodayCuriosity(): BiblicalCuriosity {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs(dayOfYear) % BIBLICAL_CURIOSITIES.length;
  return BIBLICAL_CURIOSITIES[index];
}

/**
 * Filter curiosities by category
 */
export function getCuriositiesByCategory(
  category: 'all' | CuriosityCategory
): BiblicalCuriosity[] {
  if (category === 'all') {
    return BIBLICAL_CURIOSITIES;
  }
  return BIBLICAL_CURIOSITIES.filter((c) => c.category === category);
}

/**
 * Search curiosities by query string
 */
export function searchCuriosities(query: string): BiblicalCuriosity[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return BIBLICAL_CURIOSITIES;

  return BIBLICAL_CURIOSITIES.filter(
    (c) =>
      c.title.toLowerCase().includes(normalized) ||
      c.didYouKnow.toLowerCase().includes(normalized) ||
      c.deepDive.toLowerCase().includes(normalized) ||
      c.biblicalCitation.toLowerCase().includes(normalized) ||
      c.keyTakeaway.toLowerCase().includes(normalized) ||
      c.categoryLabel.toLowerCase().includes(normalized) ||
      c.categoryTag.toLowerCase().includes(normalized) ||
      c.badgeValue?.toLowerCase().includes(normalized)
  );
}
