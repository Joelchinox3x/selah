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
