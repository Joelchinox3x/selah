import sqlite3

DB_PATH = 'assets/db/bible_readonly.db'

# 1. NEW TIMELINE EVENTS (IDs 37 to 62)
NEW_TIMELINE_EVENTS = [
    {
        "id": 37, "period_id": 1, "order_index": 3,
        "title_es": "La Torre de Babel y la Dispersión de las Naciones",
        "approx_year": "~2242 a.C.",
        "summary_es": "La humanidad intenta edificar una torre de orgullo terrenal, pero Dios confunde sus lenguas y dispersa los pueblos por la faz de la tierra.",
        "spiritual_lesson": "Cualquier obra levantada en la soberbia humana carece de fundamento eterno; solo el propósito de Dios prevalece.",
        "book_id": 1, "chapter": 11, "verse": 9,
        "key_people_names": "Pueblos de la Tierra"
    },
    {
        "id": 38, "period_id": 1, "order_index": 6,
        "title_es": "Jacob Lucha con el Ángel en Peniel",
        "approx_year": "~1906 a.C.",
        "summary_es": "A solas en la noche, Jacob lucha con Dios hasta el alba y es transformado: de suplantador a Israel, príncipe con Dios.",
        "spiritual_lesson": "La rendición quebrantada ante Dios cambia para siempre nuestra identidad y transforma nuestras debilidades en bendición.",
        "book_id": 1, "chapter": 32, "verse": 28,
        "key_people_names": "Jacob"
    },
    {
        "id": 39, "period_id": 2, "order_index": 4,
        "title_es": "El Maná del Cielo y el Agua de la Roca en Refidim",
        "approx_year": "~1446 a.C.",
        "summary_es": "En medio de la sequedad del desierto, Dios hace llover pan cada mañana y brotar corrientes cristalinas de una peña sólida.",
        "spiritual_lesson": "Dios nos provee el sustento diario con fidelidad; cuando falta todo recurso humano, su gracia fluye de lo imposible.",
        "book_id": 2, "chapter": 16, "verse": 4,
        "key_people_names": "Moisés, Aarón"
    },
    {
        "id": 40, "period_id": 2, "order_index": 6,
        "title_es": "La Construcción del Tabernáculo y la Gloria de Dios",
        "approx_year": "~1445 a.C.",
        "summary_es": "Se erige el santuario en el desierto según el diseño celestial, y la nube de la gloria divina llena el lugar santísimo.",
        "spiritual_lesson": "Dios anhela habitar en medio de su pueblo peregrino y hacer de cada corazón un templo vivo de su presencia.",
        "book_id": 2, "chapter": 40, "verse": 34,
        "key_people_names": "Moisés, Bezaleel"
    },
    {
        "id": 41, "period_id": 2, "order_index": 7,
        "title_es": "La Serpiente de Bronce en el Desierto",
        "approx_year": "~1407 a.C.",
        "summary_es": "Moisés levanta una serpiente de bronce sobre un asta; todo aquel mordido por el veneno que mira con fe es sanado.",
        "spiritual_lesson": "Mirar con fe al Salvador levantado en la cruz cura el veneno mortal del pecado y devuelve la vida al alma.",
        "book_id": 4, "chapter": 21, "verse": 9,
        "key_people_names": "Moisés"
    },
    {
        "id": 42, "period_id": 3, "order_index": 2,
        "title_es": "El Sol se Detiene en Gabaón y la Fe de Josué",
        "approx_year": "~1400 a.C.",
        "summary_es": "Josué clama al Señor en plena batalla y el sol se detiene sobre Gabaón hasta consumarse la victoria de Israel.",
        "spiritual_lesson": "No hay barrera natural ni ejército formidable que resista cuando el Señor pelea por aquellos que confían en Él.",
        "book_id": 6, "chapter": 10, "verse": 12,
        "key_people_names": "Josué"
    },
    {
        "id": 43, "period_id": 3, "order_index": 5,
        "title_es": "Sansón Clama por Fortaleza Final en Gaza",
        "approx_year": "~1084 a.C.",
        "summary_es": "Ciego y humillado entre los filisteos, Sansón clama con humildad a Jehová y derriba las columnas del templo pagano.",
        "spiritual_lesson": "Aun tras fracasos amargos, Dios no desprecia el corazón quebrantado que clama con fe y devuelve sus fuerzas.",
        "book_id": 7, "chapter": 16, "verse": 28,
        "key_people_names": "Sansón"
    },
    {
        "id": 44, "period_id": 4, "order_index": 1,
        "title_es": "Samuel Unge al Joven Pastor David en Belén",
        "approx_year": "~1028 a.C.",
        "summary_es": "Despreciado por sus hermanos en el campo, el joven David es ungido por Samuel como rey conforme al corazón de Dios.",
        "spiritual_lesson": "El ser humano juzga las apariencias externas, pero el Señor mira la pureza y reverencia del corazón humilde.",
        "book_id": 9, "chapter": 16, "verse": 13,
        "key_people_names": "Samuel, David"
    },
    {
        "id": 45, "period_id": 4, "order_index": 3,
        "title_es": "El Pacto Dinástico Eterno de Dios con David",
        "approx_year": "~995 a.C.",
        "summary_es": "Por medio del profeta Natán, Dios promete a David una casa, un trono y un reino que permanecerá para siempre en el Mesías.",
        "spiritual_lesson": "La fidelidad de Dios es incondicional; sus promesas de pacto no dependen de nuestras fuerzas sino de su gracia.",
        "book_id": 10, "chapter": 7, "verse": 16,
        "key_people_names": "David, Natán"
    },
    {
        "id": 46, "period_id": 4, "order_index": 5,
        "title_es": "La Sabiduría de Salomón y la Paz del Reino",
        "approx_year": "~970 a.C.",
        "summary_es": "Salomón pide a Dios un corazón entendido para gobernar con justicia; el reino florece en paz, prosperidad y reverencia.",
        "spiritual_lesson": "Buscar primero la sabiduría y el reino de Dios trae consigo la bendición y el reposo en todas las demás áreas.",
        "book_id": 11, "chapter": 3, "verse": 12,
        "key_people_names": "Salomón"
    },
    {
        "id": 47, "period_id": 5, "order_index": 2,
        "title_es": "Eliseo y la Sanidad de Naamán en el Jordán",
        "approx_year": "~850 a.C.",
        "summary_es": "El general sirio Naamán es sanado de lepra al obedecer la sencilla instrucción profética de lavarse siete veces en el Jordán.",
        "spiritual_lesson": "El orgullo complica los caminos de Dios; la obediencia sencilla y humilde desata el poder sanador del cielo.",
        "book_id": 12, "chapter": 5, "verse": 14,
        "key_people_names": "Eliseo, Naamán"
    },
    {
        "id": 48, "period_id": 5, "order_index": 3,
        "title_es": "Jonás en Nínive y el Arrepentimiento de una Ciudad",
        "approx_year": "~760 a.C.",
        "summary_es": "Tras salir del gran pez, Jonás proclama el juicio en Nínive; el rey y el pueblo ayunan y Dios desiste del castigo.",
        "spiritual_lesson": "La misericordia de Dios no tiene fronteras ni prejuicios; supera nuestra estrechez y abraza al arrepentido.",
        "book_id": 32, "chapter": 3, "verse": 10,
        "key_people_names": "Jonás"
    },
    {
        "id": 49, "period_id": 5, "order_index": 5,
        "title_es": "El Hallazgo de la Ley y la Reforma del Rey Josías",
        "approx_year": "~622 a.C.",
        "summary_es": "Se encuentra el Libro del Pacto en el templo; el joven rey Josías rasga sus vestidos y guía a la nación a un avivamiento espiritual.",
        "spiritual_lesson": "El retorno sincero y reverente a las Escrituras es la chispa divina que limpia el alma y renueva a las familias.",
        "book_id": 12, "chapter": 23, "verse": 25,
        "key_people_names": "Josías, Hilcías"
    },
    {
        "id": 50, "period_id": 5, "order_index": 6,
        "title_es": "La Caída de Jerusalén y las Lágrimas de Jeremías",
        "approx_year": "~586 a.C.",
        "summary_es": "Los ejércitos de Babilonia destruyen el templo y la ciudad santa; en medio de cenizas, Jeremías recuerda la fidelidad de Dios.",
        "spiritual_lesson": "Aun cuando caen nuestras certezas terrenales, las tiernas misericordias del Señor nunca decaen: nuevas son cada mañana.",
        "book_id": 25, "chapter": 3, "verse": 22,
        "key_people_names": "Jeremías"
    },
    {
        "id": 51, "period_id": 6, "order_index": 1,
        "title_es": "Los Tres Jóvenes en el Horno de Fuego Ardiente",
        "approx_year": "~580 a.C.",
        "summary_es": "Sadrac, Mesac y Abed-nego rehúsan adorar la estatua de oro; el Hijo de Dios camina junto a ellos ilesos entre las llamas.",
        "spiritual_lesson": "La fe no nos libra siempre del fuego de la prueba, pero garantiza la compañía visible y victoriosa del Salvador.",
        "book_id": 27, "chapter": 3, "verse": 25,
        "key_people_names": "Sadrac, Mesac, Abed-nego"
    },
    {
        "id": 52, "period_id": 6, "order_index": 2,
        "title_es": "La Visión de Ezequiel: El Valle de los Huesos Secos",
        "approx_year": "~573 a.C.",
        "summary_es": "Ezequiel profetiza sobre huesos inertes; el Espíritu Santo sopla vida y forma un ejército inmenso de esperanza y restauración.",
        "spiritual_lesson": "No hay situación, matrimonio o sueño tan destruido que el soplo del Espíritu Santo no pueda resucitar con poder.",
        "book_id": 26, "chapter": 37, "verse": 14,
        "key_people_names": "Ezequiel"
    },
    {
        "id": 53, "period_id": 6, "order_index": 4,
        "title_es": "El Decreto de Ciro y el Retorno con Zorobabel",
        "approx_year": "~538 a.C.",
        "summary_es": "El rey Ciro de Persia autoriza el regreso de los cautivos a Judea para reconstruir el Templo del Señor en Jerusalén.",
        "spiritual_lesson": "Dios mueve las piezas de la historia geopolítica para custodiar a su remanente y cumplir su promesa de salvación.",
        "book_id": 15, "chapter": 1, "verse": 3,
        "key_people_names": "Ciro, Zorobabel"
    },
    {
        "id": 54, "period_id": 6, "order_index": 6,
        "title_es": "Esdras Proclama la Ley: El Gozo de Jehová es Fortaleza",
        "approx_year": "~444 a.C.",
        "summary_es": "Esdras lee la Palabra de Dios ante la asamblea congregada en la Puerta del Agua; el pueblo llora y halla fortaleza en el gozo del Señor.",
        "spiritual_lesson": "Comprender la verdad divina no produce opresión sino un gozo celestial que renueva nuestras fuerzas cansadas.",
        "book_id": 16, "chapter": 8, "verse": 10,
        "key_people_names": "Esdras, Nehemías"
    },
    {
        "id": 55, "period_id": 7, "order_index": 2,
        "title_es": "La Traducción de la Septuaginta (LXX) en Alejandría",
        "approx_year": "~250 a.C.",
        "summary_es": "Setenta eruditos hebreos traducen el Antiguo Testamento al griego koiné, preparando el camino del Evangelio al mundo gentil.",
        "spiritual_lesson": "Dios obra en los siglos de silencio aparente para tender puentes culturales que comuniquen su Palabra a las naciones.",
        "book_id": 19, "chapter": 119, "verse": 105,
        "key_people_names": "Sabios de Alejandría"
    },
    {
        "id": 56, "period_id": 7, "order_index": 3,
        "title_es": "La Rebelión de los Macabeos y la Purificación del Templo",
        "approx_year": "~165 a.C.",
        "summary_es": "Frente a la profanación seléucida, familias de fe defienden la adoración verdadera y purifican el altar de Dios con santa devoción.",
        "spiritual_lesson": "El pueblo que conoce a su Dios se esfuerza y resiste con firmeza espiritual ante la decadencia y la presión cultural.",
        "book_id": 27, "chapter": 11, "verse": 32,
        "key_people_names": "Judas Macabeo"
    },
    {
        "id": 57, "period_id": 8, "order_index": 5,
        "title_es": "La Transfiguración en el Monte Santo",
        "approx_year": "~29 d.C.",
        "summary_es": "El rostro de Jesús resplandece como el sol y sus vestidos como la luz ante Moisés y Elías; la voz del Padre confirma su gloria.",
        "spiritual_lesson": "Mirar la gloria eterna de Cristo disipa el temor terrenal y nos llena de certeza en los valles del dolor.",
        "book_id": 40, "chapter": 17, "verse": 5,
        "key_people_names": "Jesús, Pedro, Jacobo, Juan"
    },
    {
        "id": 58, "period_id": 8, "order_index": 7,
        "title_es": "La Entrada Triunfal a Jerusalén (Domingo de Ramos)",
        "approx_year": "~30 d.C.",
        "summary_es": "Jesús entra como Rey de paz montado en un pollino; las multitudes tienden mantos de alabanza clamando: ¡Bendito el que viene!",
        "spiritual_lesson": "Cristo reina no con la fuerza de armas carnales, sino con la mansedumbre y la entrega sacrificial de su amor.",
        "book_id": 42, "chapter": 19, "verse": 38,
        "key_people_names": "Jesús"
    },
    {
        "id": 59, "period_id": 8, "order_index": 8,
        "title_es": "La Última Cena y la Institución del Nuevo Pacto",
        "approx_year": "~30 d.C.",
        "summary_es": "En el aposento alto, Jesús comparte el pan y la copa con sus discípulos, sellando el perdón eterno mediante su sangre.",
        "spiritual_lesson": "En cada comunión recordamos que la gracia nos sienta a la mesa del Padre como hijos plenamente reconciliados.",
        "book_id": 42, "chapter": 22, "verse": 20,
        "key_people_names": "Jesús, los Doce Apóstoles"
    },
    {
        "id": 60, "period_id": 8, "order_index": 12,
        "title_es": "La Gran Comisión y la Ascensión Gloriosa",
        "approx_year": "~30 d.C.",
        "summary_es": "Jesús encomienda a sus discípulos ir por todo el mundo predicando el Evangelio y asciende al cielo bendiciéndolos desde Betania.",
        "spiritual_lesson": "Jesús tiene todo poder en el cielo y en la tierra, y promete estar con nosotros cada instante de cada día.",
        "book_id": 40, "chapter": 28, "verse": 20,
        "key_people_names": "Jesús, los Once Apóstoles"
    },
    {
        "id": 61, "period_id": 9, "order_index": 2,
        "title_es": "El Martirio de Esteban y el Perdón Victorioso",
        "approx_year": "~34 d.C.",
        "summary_es": "Lleno del Espíritu Santo y contemplando los cielos abiertos, Esteban ora por sus apedreadores sembrando la fe en Saulo.",
        "spiritual_lesson": "El perdón sobrenatural en medio del agravio es el testimonio más poderoso del amor de Dios en este mundo.",
        "book_id": 44, "chapter": 7, "verse": 60,
        "key_people_names": "Esteban, Saulo de Tarso"
    },
    {
        "id": 62, "period_id": 9, "order_index": 4,
        "title_es": "Pedro en Cesarea: El Evangelio Derriba Toda Barrera",
        "approx_year": "~40 d.C.",
        "summary_es": "En casa del centurión romano Cornelio, el Espíritu Santo cae sobre los gentiles; la gracia de Dios abraza a todas las naciones.",
        "spiritual_lesson": "Dios no hace distinción de personas ni clases sociales; su familia es un hogar abierto para todo aquel que cree.",
        "book_id": 44, "chapter": 10, "verse": 34,
        "key_people_names": "Pedro, Cornelio"
    }
]

# 2. NEW PLACES (IDs 25 to 36)
NEW_PLACES = [
    {
        "id": 25, "slug": "siloe", "name_es": "Estanque de Siloé", "name_en": "Pool of Siloam",
        "hebrew_greek_name": "בְּרֵכַת הַשִּׁלֹחַ / Σιλωάμ", "category": "Ríos y Aguas",
        "latitude": 31.7708, "longitude": 35.2348,
        "modern_location": "Valle del Tiropeón, Ciudad de David, Jerusalén",
        "spiritual_meaning": "El Agua del Enviado y la Luz que Abre los Ojos",
        "description_es": "Alimentado por las aguas subterráneas del manantial de Gihón a través del histórico túnel de Ezequías. Aquí Jesús envió al ciego de nacimiento a lavarse el lodo de los ojos, quien regresó viendo.",
        "key_events": "Lavado del ciego de nacimiento, Fiestas de los Tabernáculos, Túnel de Ezequías",
        "testament": "BOTH",
        "verses": [(43, 9, 7), (43, 9, 11), (12, 20, 20), (23, 8, 6)]
    },
    {
        "id": 26, "slug": "monte_nebo", "name_es": "Monte Nebo (Pisga)", "name_en": "Mount Nebo",
        "hebrew_greek_name": "הַר נְבוֹ (Har Nevo)", "category": "Montes Sagrados",
        "latitude": 31.7683, "longitude": 35.7253,
        "modern_location": "Madaba, Jordania",
        "spiritual_meaning": "La Contemplación de la Promesa y el Reposo en Dios",
        "description_es": "Cumbre de la cordillera de Abarim desde donde Dios mostró a Moisés toda la extensión de Canaán antes de darle sepultura sagrada con sus propias manos.",
        "key_events": "Visión de la Tierra Prometida, Muerte y descanso de Moisés",
        "testament": "OT",
        "verses": [(5, 34, 1), (5, 34, 4), (5, 34, 5), (4, 23, 14)]
    },
    {
        "id": 27, "slug": "mar_rojo", "name_es": "Mar Rojo (Paso de Salvación)", "name_en": "Red Sea",
        "hebrew_greek_name": "יַם־סוּף (Yam Suf)", "category": "Ríos y Aguas",
        "latitude": 28.9800, "longitude": 34.6500,
        "modern_location": "Golfo de Aqaba / Nuweiba / Península del Sinaí",
        "spiritual_meaning": "Caminos en Medio del Abismo y la Libertad del Opresor",
        "description_es": "Lugar donde las aguas fueron divididas por el soplo del viento oriental de Dios, permitiendo al pueblo cruzar en seco y sepultando la esclavitud del faraón.",
        "key_events": "Cruce milagroso de Israel, Cántico de Moisés y María",
        "testament": "OT",
        "verses": [(2, 14, 21), (2, 14, 22), (2, 15, 1), (19, 106, 9)]
    },
    {
        "id": 28, "slug": "ur_caldeos", "name_es": "Ur de los Caldeos", "name_en": "Ur of the Chaldees",
        "hebrew_greek_name": "אוּר כַּשְׂדִּים (Ur Kasdim)", "category": "Ciudades y Aldeas",
        "latitude": 30.9622, "longitude": 46.1031,
        "modern_location": "Tell el-Mukayyar, Dhi Qar, Irak",
        "spiritual_meaning": "La Salida de la Comodidad Idólatra al Viaje de la Fe",
        "description_es": "Próspera metrópolis mesopotámica de zigurats y comercio. Desde aquí Abraham escuchó la voz de Dios y partió sin saber a dónde iba, guiado solo por la promesa.",
        "key_events": "Llamado de Abraham, Salida de Taré y su familia",
        "testament": "OT",
        "verses": [(1, 11, 31), (1, 15, 7), (16, 9, 7), (58, 11, 8)]
    },
    {
        "id": 29, "slug": "cesarea_maritima", "name_es": "Cesarea Marítima", "name_en": "Caesarea Maritima",
        "hebrew_greek_name": "Καισάρεια (Kaisareia)", "category": "Rutas Apostólicas",
        "latitude": 32.5011, "longitude": 34.8919,
        "modern_location": "Costa mediterránea, Israel",
        "spiritual_meaning": "El Puerto de la Apertura Mundial del Evangelio",
        "description_es": "Gran puerto romano y sede del gobernador de Judea. Aquí Pedro predicó en casa de Cornelio y Pablo estuvo encarcelado apelando al César.",
        "key_events": "Conversión de Cornelio, Prisión y defensa de Pablo ante Félix y Festo",
        "testament": "NT",
        "verses": [(44, 10, 1), (44, 10, 24), (44, 23, 23), (44, 26, 1)]
    },
    {
        "id": 30, "slug": "antioquia_siria", "name_es": "Antioquía de Siria", "name_en": "Antioch in Syria",
        "hebrew_greek_name": "Ἀντιόχεια (Antiocheia)", "category": "Rutas Apostólicas",
        "latitude": 36.2021, "longitude": 36.1606,
        "modern_location": "Antakya, Provincia de Hatay, Turquía",
        "spiritual_meaning": "La Cuna del Nombre Cristiano y la Misión Mundial",
        "description_es": "Tercera urbe del Imperio Romano. Aquí nació la primera comunidad donde judíos y gentiles adoraron juntos como iguales, y donde por primera vez se llamó cristianos a los discípulos.",
        "key_events": "Ministerio de Bernabé y Saulo, Envío del primer viaje misionero",
        "testament": "NT",
        "verses": [(44, 11, 26), (44, 13, 1), (44, 13, 2), (48, 2, 11)]
    },
    {
        "id": 31, "slug": "filipos", "name_es": "Filipos de Macedonia", "name_en": "Philippi",
        "hebrew_greek_name": "Φίλιπποι (Philippoi)", "category": "Rutas Apostólicas",
        "latitude": 41.0133, "longitude": 24.2850,
        "modern_location": "Krinides, Kavala, Grecia",
        "spiritual_meaning": "La Puerta Abierta en Europa y el Canto a Medianoche",
        "description_es": "Colonia romana donde se bautizó Lidia, primera creyente europea. En su cárcel, Pablo y Silas entonaron himnos de alabanza en cadenas hasta que un terremoto abrió las puertas.",
        "key_events": "Conversión de Lidia, Conversión del carcelero de Filipos, Carta a los Filipenses",
        "testament": "NT",
        "verses": [(44, 16, 12), (44, 16, 14), (44, 16, 25), (50, 1, 1)]
    },
    {
        "id": 32, "slug": "corinto", "name_es": "Corinto", "name_en": "Corinth",
        "hebrew_greek_name": "Κόρινθος (Korinthos)", "category": "Rutas Apostólicas",
        "latitude": 37.9056, "longitude": 22.8789,
        "modern_location": "Peloponeso, Grecia",
        "spiritual_meaning": "La Cruz en Medio de la Cultura y el Amor Inmutable",
        "description_es": "Bullicioso centro mercantil y cosmopolita entre dos mares. Pablo permaneció año y medio predicando donde Dios le dijo: «No temas... porque yo tengo mucho pueblo en esta ciudad».",
        "key_events": "Labor de Pablo junto a Aquila y Priscila, Cartas a los Corintios",
        "testament": "NT",
        "verses": [(44, 18, 1), (44, 18, 9), (44, 18, 10), (46, 13, 4)]
    },
    {
        "id": 33, "slug": "atenas", "name_es": "Atenas (El Areópago)", "name_en": "Athens (Mars Hill)",
        "hebrew_greek_name": "Ἄρειος Πάγος (Areios Pagos)", "category": "Rutas Apostólicas",
        "latitude": 37.9744, "longitude": 23.7236,
        "modern_location": "Atenas, Grecia",
        "spiritual_meaning": "El Dios No Conocido Revelado al Corazón Humano",
        "description_es": "Capital de la filosofía clásica. Frente a la colina del Partenón, Pablo proclamó al Creador que no habita en templos hechos por manos humanas y en quien vivimos, nos movemos y somos.",
        "key_events": "Discurso de Pablo en el Areópago, Conversión de Dionisio y Dámaris",
        "testament": "NT",
        "verses": [(44, 17, 16), (44, 17, 22), (44, 17, 28), (44, 17, 34)]
    },
    {
        "id": 34, "slug": "monte_moriah", "name_es": "Monte Moriah", "name_en": "Mount Moriah",
        "hebrew_greek_name": "הַר הַמּוֹרִיָּה (Har ha-Moriyyah)", "category": "Montes Sagrados",
        "latitude": 31.7780, "longitude": 35.2354,
        "modern_location": "Monte del Templo, Jerusalén",
        "spiritual_meaning": "El Altar de Provisión Divina: «Jehová-Jireh»",
        "description_es": "Colina sagrada donde Abraham ascendió con Isaac y Dios proveyó el carnero sustituto; siglos después, sobre esta misma peña, Salomón erigió el Templo santo de Dios.",
        "key_events": "Sacrificio de Isaac provisto por Dios, Edificación del Templo por Salomón",
        "testament": "OT",
        "verses": [(1, 22, 2), (1, 22, 14), (14, 3, 1), (19, 24, 3)]
    },
    {
        "id": 35, "slug": "valle_ela", "name_es": "Valle de Ela", "name_en": "Valley of Elah",
        "hebrew_greek_name": "עֵמֶק הָאֵלָה (Emek ha-Elah)", "category": "Santuarios y Desiertos",
        "latitude": 31.6853, "longitude": 34.9867,
        "modern_location": "Tierras bajas de Sefela, Israel",
        "spiritual_meaning": "La Fe Sencilla que Derriba los Gigantes del Temor",
        "description_es": "Valle rodeado de colinas donde acamparon los ejércitos de Israel y los filisteos. En su arroyo David recogió cinco piedras lisas para derrotar a Goliat en el nombre de Jehová.",
        "key_events": "Victoria de David sobre Goliat, Arroyo de las piedras lisas",
        "testament": "OT",
        "verses": [(9, 17, 2), (9, 17, 40), (9, 17, 45), (9, 17, 50)]
    },
    {
        "id": 36, "slug": "roma", "name_es": "Roma (El Corazón del Imperio)", "name_en": "Rome",
        "hebrew_greek_name": "Ῥώμη (Rhōmē)", "category": "Rutas Apostólicas",
        "latitude": 41.8929, "longitude": 12.4844,
        "modern_location": "Roma, Italia",
        "spiritual_meaning": "La Carrera Culminada y la Corona Incorruptible",
        "description_es": "Metrópolis imperial a donde Pablo llegó en cadenas pero con el Evangelio libre. Desde su cautiverio escribió las cartas de la prisión y selló su vida exclamando: «He peleado la buena batalla, he acabado la carrera, he guardado la fe».",
        "key_events": "Arribo de Pablo en cadenas, Cartas de la prisión, Martirio apostólico",
        "testament": "NT",
        "verses": [(44, 28, 16), (44, 28, 30), (44, 28, 31), (55, 4, 7)]
    }
]

# 3. NEW DAILY DISCOVERIES (IDs 16 to 30)
NEW_DISCOVERIES = [
    {
        "id": 16, "category": "Raíz Hebrea / Griega",
        "title": "ABBA (אַבָּא): De Esclavo Temeroso a Hijo Amado",
        "original_word": "Abba (אַבָּא)", "pronunciation": "ab'-bah",
        "insight": "Término de ternura arameo que utilizaban los niños en el hogar familiar. Jesús lo usó en Getsemaní y el apóstol Pablo enseña que por el Espíritu Santo podemos clamar «¡Abba, Padre!». Destruye la distancia del miedo religioso y nos introduce a la más tierna intimidad filial.",
        "practical_application": "Cuando ores hoy, no te acerques a Dios como a un juez distante, sino como a un Padre que te escucha con ternura inagotable.",
        "book_id": 45, "chapter": 8, "verse": 15,
        "verse_snippet": "Pues no habéis recibido el espíritu de servidumbre para estar otra vez en temor, sino que habéis recibido el espíritu de adopción, por el cual clamamos: ¡Abba, Padre!"
    },
    {
        "id": 17, "category": "Raíz Hebrea / Griega",
        "title": "MARANATHA (μαρανα θα): El Suspiro de Esperanza de la Iglesia",
        "original_word": "Maranatha (μαρανα θα)", "pronunciation": "mar-an-ath'-ah",
        "insight": "Expresión aramea que significa: «¡Nuestro Señor viene!». En medio de la persecución romana, los primeros cristianos se saludaban con esta palabra como contraseña secreta para recordarse mutuamente que el dolor terrenal es pasajero y la redención eterna está cerca.",
        "practical_application": "Ante las noticias angustiantes del mundo, recuerda que nuestra esperanza final no depende de gobiernos humanos, sino del regreso de nuestro Salvador.",
        "book_id": 46, "chapter": 16, "verse": 22,
        "verse_snippet": "El que no amare al Señor Jesucristo, sea anatema. Maranata."
    },
    {
        "id": 18, "category": "Tesoros Históricos",
        "title": "EBEN-EZER: «Hasta Aquí nos Ayudó Jehová»",
        "original_word": "Eben-ezer (אֶבֶן הָעֵזֶר)", "pronunciation": "eh'-ben eh'-zer",
        "insight": "Significa literalmente «Piedra de Ayuda». Tras vencer a los filisteos, el profeta Samuel levantó un gran monolito de piedra para que cada viajero que pasara recordara que la victoria no fue por mérito militar, sino por la mano providente y bondadosa de Dios.",
        "practical_application": "Haz una pausa y mira hacia atrás: cada crisis que superaste en el pasado es tu propia piedra de Eben-ezer; el Dios que te sostuvo ayer te sostendrá hoy.",
        "book_id": 9, "chapter": 7, "verse": 12,
        "verse_snippet": "Tomó luego Samuel una piedra y la puso entre Mizpa y Sen, y le puso por nombre Eben-ezer, diciendo: Hasta aquí nos ayudó Jehová."
    },
    {
        "id": 19, "category": "Raíz Hebrea / Griega",
        "title": "HOSANNA: Del Clamor de Auxilio a la Alabanza Victoriosa",
        "original_word": "Hoshiah-na (הוֹשִׁיעָה נָּא)", "pronunciation": "ho-shee-ah'-nah",
        "insight": "Fusión de las palabras hebreas «Yasha» (salvar) y «Na» (por favor, ahora). Nació en el Salmo 118 como un gemido angustioso: «¡Sálvanos ahora, te rogamos!». Con el tiempo se transformó en la exclamación de júbilo con que recibieron a Jesús en Jerusalén agitando palmas.",
        "practical_application": "Dios transforma tu clamor desesperado de auxilio en tu cántico más dulce de gratitud.",
        "book_id": 40, "chapter": 21, "verse": 9,
        "verse_snippet": "Y las gentes que iban delante y las que iban detrás aclamaban, diciendo: ¡Hosanna al Hijo de David! ¡Bendito el que viene en el nombre del Señor!"
    },
    {
        "id": 20, "category": "Raíz Hebrea / Griega",
        "title": "TETELÉSTAI: La Deuda Pagada por Completo",
        "original_word": "Teteléstai (τετέλεσται)", "pronunciation": "te-tel'-es-tie",
        "insight": "Palabra que Jesús pronunció en la cruz antes de expirar. En el comercio grecorromano antiguo, se estampaba sobre los pagarés y contratos cuando la deuda quedaba cancelada en su totalidad: «Pagado por completo». Cristo no dejó cuotas pendientes para nuestra salvación.",
        "practical_application": "No tienes que intentar comprar el perdón de Dios con culpas o autoreproches; tu deuda espiritual fue saldada para siempre en la cruz.",
        "book_id": 43, "chapter": 19, "verse": 30,
        "verse_snippet": "Cuando Jesús hubo tomado el vinagre, dijo: Consumado es. Y habiendo inclinado la cabeza, entregó el espíritu."
    },
    {
        "id": 21, "category": "Raíz Hebrea / Griega",
        "title": "METANOIA: El Giro Radical de la Mirada Interior",
        "original_word": "Metanoia (μετάνοια)", "pronunciation": "met-an'-oy-ah",
        "insight": "Traducida habitualmente como «arrepentimiento», une «meta» (cambio / más allá) y «nous» (mente). No significa castigarse con amargura, sino cambiar la forma de pensar, girar 180 grados y alinear la visión del corazón con la perspectiva y la verdad de Dios.",
        "practical_application": "El arrepentimiento cristiano no es vivir bajo remordimiento, sino levantar la mirada y caminar en una dirección completamente nueva.",
        "book_id": 41, "chapter": 1, "verse": 15,
        "verse_snippet": "Diciendo: El tiempo se ha cumplido, y el reino de Dios se ha acercado; arrepentíos, y creed en el evangelio."
    },
    {
        "id": 22, "category": "Raíz Hebrea / Griega",
        "title": "KADOSH: La Belleza Incomparable de la Santidad",
        "original_word": "Kadosh (קָדוֹשׁ)", "pronunciation": "kah-dohsh'",
        "insight": "Significa «separado, único, resplandeciente en pureza». Es el único atributo divino que la Escritura repite tres veces consecutivas: «Kadosh, Kadosh, Kadosh» (Isaías 6). No describe frialdad distante, sino la belleza ardiente y sagrada que consume la impureza para transformarnos.",
        "practical_application": "Vivir en santidad no es aislarse del mundo con orgullo, sino permitir que la pureza y el amor de Dios brillen en cada conversación y acto cotidiano.",
        "book_id": 23, "chapter": 6, "verse": 3,
        "verse_snippet": "Y el uno al otro daba voces, diciendo: Santo, santo, santo, Jehová de los ejércitos; toda la tierra está llena de su gloria."
    },
    {
        "id": 23, "category": "Cultura del Mundo Bíblico",
        "title": "BETLEHEM: La «Casa del Pan» y el Alimento Eterno",
        "original_word": "Beit Lejem (בֵּית לֶחֶם)", "pronunciation": "bate leh'-khem",
        "insight": "Compuesta por «Bayit» (casa) y «Léjem» (pan). Belén era célebre por sus campos fértiles de trigo. En la providencia perfecta de Dios, fue en la «Casa del Pan» donde nació aquel que luego proclamaría: «Yo soy el Pan de Vida; el que a mí viene, nunca tendrá hambre».",
        "practical_application": "El mundo ofrece placeres que dejan el alma vacía; solo la presencia de Cristo nutre y sacia tu necesidad más honda.",
        "book_id": 43, "chapter": 6, "verse": 35,
        "verse_snippet": "Jesús les dijo: Yo soy el pan de vida; el que a mí viene, nunca tendrá hambre; y el que en mí cree, no tendrá sed jamás."
    },
    {
        "id": 24, "category": "Tesoros Históricos",
        "title": "YAHWEH-JIREH: El Dios que Ve y Provee en el Monte",
        "original_word": "Yahweh Yireh (יְהוָה יִרְאֶה)", "pronunciation": "yah-weh yir-eh'",
        "insight": "Nombre que Abraham dio al monte Moriah tras encontrar el carnero provisto por Dios. En hebreo, la raíz de «proveer» es la misma que «ver»: Dios provee porque ve con antelación nuestras necesidades más íntimas antes de que siquiera formulemos una petición.",
        "practical_application": "Cuando no veas salida económica o emocional a tu situación, confía: Dios ya vio tu mañana y tiene preparada su provisión a tiempo.",
        "book_id": 1, "chapter": 22, "verse": 14,
        "verse_snippet": "Y llamó Abraham el nombre de aquel lugar, Jehová proveerá. Por tanto se dice hoy: En el monte de Jehová será provisto."
    },
    {
        "id": 25, "category": "Raíz Hebrea / Griega",
        "title": "ZOE: La Vida Divina que Vence la Muerte",
        "original_word": "Zoé (ζωή)", "pronunciation": "dzoh-ay'",
        "insight": "El griego distingue entre «bios» (vida biológica temporal) y «zoé» (la vida increada, indestructible y plena de Dios). Cuando Jesús dijo «He venido para que tengan vida y la tengan en abundancia», usó Zoé: una calidad de vida que trasciende la tumba.",
        "practical_application": "Tu valor no se mide por la cantidad de años biológicos, sino por la presencia viva de Cristo palpitando en tu corazón.",
        "book_id": 43, "chapter": 10, "verse": 10,
        "verse_snippet": "El ladrón no viene sino para hurtar y matar y destruir; yo he venido para que tengan vida, y para que la tengan en abundancia."
    },
    {
        "id": 26, "category": "Raíz Hebrea / Griega",
        "title": "EMUNAH: La Fe como Firmeza en la Roca",
        "original_word": "Emunah (אֱמוּנָה)", "pronunciation": "em-oo-naw'",
        "insight": "De donde proviene la palabra «Amén». A diferencia de la fe griega puramente intelectual, la Emunah hebrea es una confianza activa y relacional: apoyarse con todo el peso del cuerpo sobre una roca firme, sabiendo que no cederá jamás.",
        "practical_application": "Tener fe no es entender todos los porqués de la vida, sino descansar con certeza en el carácter inmutable de Dios.",
        "book_id": 35, "chapter": 2, "verse": 4,
        "verse_snippet": "He aquí que aquel cuya alma no es recta, se enorgullece; mas el justo por su fe vivirá."
    },
    {
        "id": 27, "category": "Sabiduría y Descanso",
        "title": "JEHOVÁ-RAPHA: Medicina para el Cuerpo y el Alma",
        "original_word": "Yahweh Rophe'ekha (יְהוָה רֹפְאֶךָ)", "pronunciation": "yah-weh ro-fay'-kaw",
        "insight": "Revelado en las aguas amargas de Mara que fueron endulzadas por un leño. Dios declara: «Yo soy Jehová tu Médico/Sanador». No solo remedia dolencias físicas, sino que cura heridas invisibles del corazón, recuerdos amargos y almas desgastadas.",
        "practical_application": "Presenta hoy delante de Dios tus amarguras y dolores íntimos; Él es el Médico divino que tiene bálsamo para restaurar tu paz.",
        "book_id": 2, "chapter": 15, "verse": 26,
        "verse_snippet": "...porque yo soy Jehová tu sanador."
    },
    {
        "id": 28, "category": "Raíz Hebrea / Griega",
        "title": "CHARIS: La Belleza de un Regalo que no se Puede Comprar",
        "original_word": "Cháris (χάρις)", "pronunciation": "khar'-ece",
        "insight": "En el mundo clásico, describía aquello que produce deleite, encanto y hermosura. En el Nuevo Testamento se convirtió en el término cumbre del Evangelio: el favor inmerecido y desbordante de Dios que derrama su bondad sobre quienes merecían juicio.",
        "practical_application": "Descansa de intentar ganarte la aceptación de Dios por rendimiento: eres aceptado y amado por pura gracia a través de Cristo.",
        "book_id": 49, "chapter": 2, "verse": 8,
        "verse_snippet": "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios."
    },
    {
        "id": 29, "category": "Cultura del Mundo Bíblico",
        "title": "LOS ODRES NUEVOS: Flexibilidad para el Vino Nuevo",
        "original_word": "Askós (ἀσκός)", "pronunciation": "as-kos'",
        "insight": "Los odres antiguos eran bolsas de cuero de cabra. Con el tiempo se resecaban y volvían rígidos; al fermentar vino nuevo en ellos, se reventaban. Jesús enseñó que las mentes anquilosadas en la rutina no pueden contener el vino fresco del Espíritu Santo.",
        "practical_application": "Pídele al Señor un corazón dócil y flexible, dispuesto a desaprender prejuicios para recibir la obra fresca que Él quiere hacer en ti.",
        "book_id": 42, "chapter": 5, "verse": 38,
        "verse_snippet": "Mas el vino nuevo en odres nuevos se ha de echar; y lo uno y lo otro se conservan."
    },
    {
        "id": 30, "category": "Cultura del Mundo Bíblico",
        "title": "EL AÑO DEL JUBILEO: El Toque del Shofar que Cancela Toda Deuda",
        "original_word": "Yovel (יוֹבֵל)", "pronunciation": "yo-vale'",
        "insight": "Cada cincuenta años, el día de Yom Kippur sonaba el shofar por toda la tierra. En ese instante exacto se liberaban todos los esclavos, se cancelaban todas las deudas y las tierras volvían a sus dueños originales. Jesús inauguró el Jubileo eterno de nuestra alma.",
        "practical_application": "En Cristo ya no eres esclavo de tu pasado ni estás endeudado con la culpa: estás en el año de la libertad y el favor de Dios.",
        "book_id": 3, "chapter": 25, "verse": 10,
        "verse_snippet": "Y santificaréis el año cincuenta, y pregonaréis libertad en la tierra a todos sus moradores; ese año os será de jubileo..."
    }
]

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Insert Timeline Events
    inserted_events = 0
    for ev in NEW_TIMELINE_EVENTS:
        c.execute("SELECT id FROM timeline_events WHERE id = ?", (ev["id"],))
        if c.fetchone():
            continue
        c.execute("""
            INSERT INTO timeline_events (
                id, period_id, order_index, title_es, approx_year,
                summary_es, spiritual_lesson, book_id, chapter, verse, key_people_names
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ev["id"], ev["period_id"], ev["order_index"], ev["title_es"], ev["approx_year"],
            ev["summary_es"], ev["spiritual_lesson"], ev["book_id"], ev["chapter"], ev["verse"], ev["key_people_names"]
        ))
        inserted_events += 1
    print(f"Inserted {inserted_events} new timeline events.")

    # 2. Insert Places & Place Verses
    inserted_places = 0
    inserted_pv = 0
    for pl in NEW_PLACES:
        c.execute("SELECT id FROM places WHERE id = ? OR slug = ?", (pl["id"], pl["slug"]))
        if c.fetchone():
            continue
        c.execute("""
            INSERT INTO places (
                id, slug, name_es, name_en, hebrew_greek_name, category,
                latitude, longitude, modern_location, spiritual_meaning,
                description_es, key_events, testament, verse_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        """, (
            pl["id"], pl["slug"], pl["name_es"], pl["name_en"], pl["hebrew_greek_name"], pl["category"],
            pl["latitude"], pl["longitude"], pl["modern_location"], pl["spiritual_meaning"],
            pl["description_es"], pl["key_events"], pl["testament"]
        ))
        inserted_places += 1

        # Link verses
        p_verses = pl.get("verses", [])
        v_count = 0
        for (b_id, ch, v_num) in p_verses:
            c.execute("SELECT id FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?", (b_id, ch, v_num))
            v_row = c.fetchone()
            if v_row:
                v_id = v_row[0]
                c.execute("INSERT OR IGNORE INTO place_verses (place_id, verse_id) VALUES (?, ?)", (pl["id"], v_id))
                inserted_pv += 1
                v_count += 1
        c.execute("UPDATE places SET verse_count = ? WHERE id = ?", (v_count, pl["id"]))
    print(f"Inserted {inserted_places} new places ({inserted_pv} verses linked).")

    # 3. Insert Daily Discoveries
    inserted_discoveries = 0
    for disc in NEW_DISCOVERIES:
        c.execute("SELECT id FROM daily_discoveries WHERE id = ?", (disc["id"],))
        if c.fetchone():
            continue
        c.execute("""
            INSERT INTO daily_discoveries (
                id, category, title, original_word, pronunciation,
                insight, practical_application, book_id, chapter, verse, verse_snippet
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            disc["id"], disc["category"], disc["title"], disc["original_word"], disc["pronunciation"],
            disc["insight"], disc["practical_application"], disc["book_id"], disc["chapter"], disc["verse"], disc["verse_snippet"]
        ))
        inserted_discoveries += 1
    print(f"Inserted {inserted_discoveries} new daily discoveries.")

    conn.commit()

    # Verify totals
    c.execute("SELECT count(*) FROM timeline_events")
    total_events = c.fetchone()[0]
    c.execute("SELECT count(*) FROM places")
    total_places = c.fetchone()[0]
    c.execute("SELECT count(*) FROM daily_discoveries")
    total_disc = c.fetchone()[0]

    print("\n--- DATABASE TOTALS ---")
    print(f"Timeline Events: {total_events}")
    print(f"Places: {total_places}")
    print(f"Daily Discoveries: {total_disc}")
    conn.close()

if __name__ == '__main__':
    main()
