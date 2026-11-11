import sqlite3

DB_PATH = 'assets/db/bible_readonly.db'

NEW_CHARACTERS = [
    {
        "id": 614,
        "slug": "isaiah",
        "name_en": "Isaiah",
        "name_es": "Isaías",
        "display_title_es": "El Profeta Mesiánico y Consolador del Pueblo",
        "archetype": "Visión Celestial, Santidad y Consuelo en Tiempos de Crisis",
        "category": "Líderes y Profetas",
        "gender": "M",
        "bio_es": "Conocido como el profeta evangélico del Antiguo Testamento, Isaías contempló la majestuosa santidad de Dios en el templo («¡Santo, Santo, Santo!») y respondió con disponibilidad incondicional: «Heme aquí, envíame a mí». En medio de la decadencia moral y el peligro asirio, proclamó el nacimiento del Emanuel, el Siervo Sufriente (Isaías 53) y la promesa del consuelo eterno que renueva las fuerzas del cansado como las alas de las águilas.",
        "testament": "OT",
        "verses": [
            (23, 6, 1), (23, 6, 2), (23, 6, 3), (23, 6, 8), (23, 7, 14),
            (23, 9, 6), (23, 40, 1), (23, 40, 2), (23, 40, 3), (23, 40, 29),
            (23, 40, 31), (23, 41, 10), (23, 53, 3), (23, 53, 4), (23, 53, 5),
            (23, 55, 6), (23, 55, 7), (23, 61, 1), (23, 61, 2), (23, 61, 3)
        ]
    },
    {
        "id": 615,
        "slug": "jeremiah",
        "name_en": "Jeremiah",
        "name_es": "Jeremías",
        "display_title_es": "El Profeta Llorón y Heraldo del Nuevo Pacto",
        "archetype": "Perseverancia en el Rechazo, Vulnerabilidad y Fuego Interior",
        "category": "Líderes y Profetas",
        "gender": "M",
        "bio_es": "Llamado desde el vientre materno a pesar de sentirse joven e incapaz, Jeremías predicó la verdad en Judá durante cuatro décadas de incomprensión, hostilidad y soledad. Aunque confesó con dolor sus luchas emocionales, la Palabra ardía en su interior como un fuego que no podía callar. Fue quien vislumbró el Nuevo Pacto grabado en el corazón y reveló el cuidado tierno de Dios con planes de paz y bienestar para nuestro porvenir.",
        "testament": "OT",
        "verses": [
            (24, 1, 4), (24, 1, 5), (24, 1, 6), (24, 1, 7), (24, 1, 8), (24, 1, 9),
            (24, 17, 7), (24, 17, 8), (24, 20, 9), (24, 29, 11), (24, 29, 12),
            (24, 29, 13), (24, 31, 3), (24, 31, 33), (24, 31, 34), (24, 33, 3),
            (25, 3, 21), (25, 3, 22), (25, 3, 23), (25, 3, 24)
        ]
    },
    {
        "id": 616,
        "slug": "ezekiel",
        "name_en": "Ezekiel",
        "name_es": "Ezequiel",
        "display_title_es": "El Vidente de Babilonia y Centinela de Esperanza",
        "archetype": "Esperanza en la Desolación y Soplo del Espíritu Santo",
        "category": "Líderes y Profetas",
        "gender": "M",
        "bio_es": "Sacerdote y profeta deportado junto al río Quebar en Babilonia, Ezequiel fue llamado a ser centinela fiel para una comunidad cautiva que había perdido toda ilusión. Con impactantes visiones celestiales —desde el carro de fuego hasta el Valle de los Huesos Secos (Ezequiel 37)— enseñó que el Espíritu de Dios puede infundir vida en lo que parecía irremediablemente muerto y cambiar un corazón de piedra por uno de carne sensible.",
        "testament": "OT",
        "verses": [
            (26, 1, 1), (26, 1, 3), (26, 3, 17), (26, 3, 18), (26, 11, 19),
            (26, 11, 20), (26, 34, 11), (26, 34, 15), (26, 36, 26), (26, 36, 27),
            (26, 37, 1), (26, 37, 2), (26, 37, 3), (26, 37, 4), (26, 37, 5),
            (26, 37, 11), (26, 37, 14)
        ]
    },
    {
        "id": 617,
        "slug": "deborah",
        "name_en": "Deborah",
        "name_es": "Débora",
        "display_title_es": "Jueza, Madre en Israel y Profetisa de Victoria",
        "archetype": "Liderazgo Valiente, Sabiduría Pacificadora e Inspiración",
        "category": "Mujeres de Fe",
        "gender": "F",
        "bio_es": "En una época turbulenta de desaliento y opresión cananea, Débora impartía justicia y discernimiento bajo la palmera en los montes de Efraín. Cuando el miedo paralizaba al pueblo frente a los novecientos carros de hierro de Sísara, Débora infundió valentía a Barac, marchó al combate con fe absoluta y entonó uno de los himnos de victoria y alabanza más hermosos y antiguos de las Sagradas Escrituras.",
        "testament": "OT",
        "verses": [
            (7, 4, 4), (7, 4, 5), (7, 4, 6), (7, 4, 7), (7, 4, 8), (7, 4, 9),
            (7, 4, 14), (7, 5, 1), (7, 5, 2), (7, 5, 3), (7, 5, 7), (7, 5, 12), (7, 5, 31)
        ]
    },
    {
        "id": 618,
        "slug": "abigail",
        "name_en": "Abigail",
        "name_es": "Abigail",
        "display_title_es": "Pacificadora Prudente y Mujer de Gran Entendimiento",
        "archetype": "Sensatez que Evita la Tragedia, Gracia y Diplomacia Santa",
        "category": "Mujeres de Fe",
        "gender": "F",
        "bio_es": "Esposa del mezquino e insensato Nabal, Abigail demostró una inteligencia y serenidad admirables. Cuando David avanzaba con cuatrocientos guerreros dispuesto a vengar la afrenta recibida, Abigail actuó con prontitud: preparó abundantes provisiones, se inclinó ante David y con palabras llenas de prudencia profética frenó la ira del futuro rey, evitando que derramara sangre inocente en un arrebato carnal.",
        "testament": "OT",
        "verses": [
            (9, 25, 3), (9, 25, 18), (9, 25, 19), (9, 25, 23), (9, 25, 24),
            (9, 25, 28), (9, 25, 31), (9, 25, 32), (9, 25, 33), (9, 25, 35),
            (9, 25, 39), (9, 25, 42)
        ]
    },
    {
        "id": 619,
        "slug": "john_baptist",
        "name_en": "John the Baptist",
        "name_es": "Juan el Bautista",
        "display_title_es": "La Voz en el Desierto y Precursor del Salvador",
        "archetype": "Humildad Radical, Integridad sin Concesiones y Enfoque en Cristo",
        "category": "Evangelio",
        "gender": "M",
        "bio_es": "Lleno del Espíritu Santo desde el vientre materno, Juan vivió en el desierto preparando el corazón del pueblo con un mensaje de arrepentimiento auténtico. Tuvo el inmenso gozo de bautizar a Jesús en las aguas del Jordán y presentarlo como «el Cordero de Dios que quita el pecado del mundo». Su grandeza espiritual culminó en su célebre lema: «Es necesario que él crezca, pero que yo mengüe».",
        "testament": "NT",
        "verses": [
            (40, 3, 1), (40, 3, 2), (40, 3, 3), (40, 3, 13), (40, 3, 16), (40, 3, 17),
            (40, 11, 9), (40, 11, 10), (40, 11, 11), (42, 1, 13), (42, 1, 15), (42, 1, 17),
            (43, 1, 29), (43, 1, 30), (43, 1, 34), (43, 3, 28), (43, 3, 29), (43, 3, 30)
        ]
    },
    {
        "id": 620,
        "slug": "john_apostle",
        "name_en": "John the Apostle",
        "name_es": "Juan el Apóstol",
        "display_title_es": "El Discípulo Amado y Apóstol del Amor",
        "archetype": "Intimidad Profunda con Dios, Amor Fraternal y Esperanza Eterna",
        "category": "Apóstoles",
        "gender": "M",
        "bio_es": "Inició su discipulado siendo un temperamental «hijo del trueno», pero el trato cercano con Cristo lo transformó en el apóstol del amor entrañable. Se recostó en el pecho de Jesús durante la Última Cena, permaneció firme al pie de la cruz junto a María y, desterrado como anciano en la isla de Patmos, recibió la gloriosa revelación de la victoria final de Jesucristo sobre el mal y la promesa de un cielo nuevo y tierra nueva.",
        "testament": "NT",
        "verses": [
            (43, 13, 23), (43, 13, 25), (43, 19, 26), (43, 19, 27), (43, 20, 2),
            (43, 20, 4), (43, 20, 8), (43, 21, 20), (43, 21, 24), (62, 1, 1),
            (62, 3, 1), (62, 4, 7), (62, 4, 8), (62, 4, 18), (66, 1, 9),
            (66, 1, 10), (66, 21, 1), (66, 21, 4), (66, 22, 20)
        ]
    },
    {
        "id": 621,
        "slug": "luke",
        "name_en": "Luke",
        "name_es": "Lucas el Evangelista",
        "display_title_es": "El Médico Amado e Historiador de la Gracia",
        "archetype": "Compasión por los Vulnerables, Rigor Intelectual y Servicio Fiel",
        "category": "Evangelio",
        "gender": "M",
        "bio_es": "Médico gentil y fiel compañero de Pablo en sus prisiones («sólo Lucas está conmigo»). Con escrupuloso rigor histórico y una sensibilidad pastoral conmovedora, escribió el tercer Evangelio y los Hechos de los Apóstoles, destacando la ternura de Jesús hacia los marginados, las mujeres, los extranjeros y los arrepentidos a través de historias inmortales como el Buen Samaritano y el Hijo Pródigo.",
        "testament": "NT",
        "verses": [
            (42, 1, 1), (42, 1, 2), (42, 1, 3), (42, 1, 4), (42, 4, 18),
            (42, 10, 33), (42, 15, 11), (42, 15, 20), (42, 19, 10),
            (44, 1, 1), (44, 1, 2), (51, 4, 14), (55, 4, 11)
        ]
    },
    {
        "id": 622,
        "slug": "jonathan",
        "name_en": "Jonathan",
        "name_es": "Jonatán",
        "display_title_es": "Príncipe Heredero y Amigo Sacrificial de David",
        "archetype": "Lealtad Incondicional, Desprendimiento del Ego y Amistad Pura",
        "category": "Sabiduría y Fe",
        "gender": "M",
        "bio_es": "Hijo mayor del rey Saúl y heredero al trono de Israel, Jonatán fue un guerrero intrépido movido por la convicción de que «para Dios no es difícil salvar con muchos o con pocos». Sin sombra de envidia ante el ungimiento de David, lo amó como a su propia vida: le entregó su manto real y sus armas, intercedió por él ante su padre y prefirió la justicia y la voluntad divina por encima de sus propios privilegios reales.",
        "testament": "OT",
        "verses": [
            (9, 14, 6), (9, 14, 12), (9, 14, 13), (9, 18, 1), (9, 18, 2),
            (9, 18, 3), (9, 18, 4), (9, 19, 1), (9, 19, 4), (9, 20, 16),
            (9, 20, 17), (9, 20, 41), (9, 20, 42), (9, 23, 16), (9, 23, 17),
            (10, 1, 25), (10, 1, 26)
        ]
    },
    {
        "id": 623,
        "slug": "samson",
        "name_en": "Samson",
        "name_es": "Sansón",
        "display_title_es": "El Juez Nazareo y Fuerte de Dan",
        "archetype": "De la Debilidad Oculta y los Errores al Clamor Final de Fe",
        "category": "Líderes y Profetas",
        "gender": "M",
        "bio_es": "Dotado por el Espíritu de Dios con una fuerza sobrehumana desde su consagración como nazareo, Sansón libró una intensa batalla contra sus propias pasiones y deslices afectivos. Ciego, encadenado y burlado como esclavo en Gaza, redescubrió su dependencia absoluta de Dios: en su momento de mayor desamparo clamó con genuina humildad y Dios escuchó su oración, contándolo entre los gigantes de la fe de Hebreos 11.",
        "testament": "OT",
        "verses": [
            (7, 13, 3), (7, 13, 5), (7, 13, 24), (7, 14, 5), (7, 14, 6),
            (7, 15, 14), (7, 15, 15), (7, 16, 17), (7, 16, 20), (7, 16, 28),
            (7, 16, 29), (7, 16, 30), (58, 11, 32)
        ]
    },
    {
        "id": 624,
        "slug": "caleb",
        "name_en": "Caleb",
        "name_es": "Caleb",
        "display_title_es": "El Hombre de Espíritu Diferente y Conquistador de Montes",
        "archetype": "Vigor Incombustible, Fe sin Excusas y Conquista a Cualquier Edad",
        "category": "Líderes y Profetas",
        "gender": "M",
        "bio_es": "Uno de los doce exploradores enviados a Canaán, Caleb se negó a contagiarse del pánico colectivo ante los gigantes, exclamando: «¡Subamos luego y poseámosla, que más podremos que ellos!». Dios alabó su «espíritu diferente» por seguirlo con fidelidad íntegra. A los ochenta y cinco años, con la misma pasión de su juventud, pidió el monte Hebrón como herencia y desalojó a los gigantes confiando en el Señor.",
        "testament": "OT",
        "verses": [
            (4, 13, 30), (4, 14, 6), (4, 14, 7), (4, 14, 8), (4, 14, 9), (4, 14, 24),
            (6, 14, 6), (6, 14, 10), (6, 14, 11), (6, 14, 12), (6, 14, 13), (6, 14, 14)
        ]
    },
    {
        "id": 625,
        "slug": "josiah",
        "name_en": "Josiah",
        "name_es": "Josías",
        "display_title_es": "El Joven Rey Reformador y Amante de la Ley",
        "archetype": "Ternura de Corazón, Valentía Reformadora y Retorno a la Palabra",
        "category": "Reyes y Líderes",
        "gender": "M",
        "bio_es": "Coronado a los ocho años en una Jerusalén oscurecida por la idolatría de sus antecesores, Josías buscó con ternura y pureza al Dios de David. Al redescubrirse el Libro de la Ley durante las obras del templo, rasgó sus vestiduras con profundo dolor por el abandono espiritual de su pueblo, desencadenando la reforma espiritual y la celebración de la Pascua más memorable y ferviente de los reyes de Judá.",
        "testament": "OT",
        "verses": [
            (12, 22, 1), (12, 22, 2), (12, 22, 11), (12, 22, 13), (12, 22, 19),
            (12, 23, 1), (12, 23, 2), (12, 23, 3), (12, 23, 25), (14, 34, 1),
            (14, 34, 2), (14, 34, 3), (14, 34, 27)
        ]
    },
    {
        "id": 626,
        "slug": "enoch",
        "name_en": "Enoch",
        "name_es": "Enoc",
        "display_title_es": "El Patriarca que Caminó en Íntima Amistad con Dios",
        "archetype": "Comunión Constante, Fe que Agrada a Dios y Trascendencia Eterna",
        "category": "Patriarcas",
        "gender": "M",
        "bio_es": "En una generación antediluviana marcada por la violencia y el olvido del Creador, Enoc tomó un camino insólito: caminó en íntima y perseverante comunión con Dios a lo largo de tres siglos. Su grandeza no radicó en conquistas materiales ni coronas terrenas, sino en la certeza de haber agradado al Señor, hasta que Dios lo traspuso hacia la eternidad sin experimentar la muerte.",
        "testament": "OT",
        "verses": [
            (1, 5, 21), (1, 5, 22), (1, 5, 23), (1, 5, 24), (58, 11, 5), (58, 11, 6), (65, 1, 14)
        ]
    },
    {
        "id": 627,
        "slug": "lydia",
        "name_en": "Lydia of Philippi",
        "name_es": "Lidia de Filipos",
        "display_title_es": "Empresaria Piadosa y Primera Creyente de Europa",
        "archetype": "Hospitalidad Generosa, Corazón Abierto y Apoyo al Reino",
        "category": "Mujeres de Fe",
        "gender": "F",
        "bio_es": "Comerciante de telas de púrpura originaria de Tiatira y afincada en Filipos, Lidia se congregaba junto al río para orar. Al oír las palabras de Pablo, el Señor abrió su corazón con ternura para recibir el mensaje del Evangelio. Tras ser bautizada con toda su casa, insistió con generosidad en hospedar a los misioneros, transformando su hogar en la primera iglesia y centro de avance del cristianismo en Europa.",
        "testament": "NT",
        "verses": [
            (44, 16, 13), (44, 16, 14), (44, 16, 15), (44, 16, 40)
        ]
    },
    {
        "id": 628,
        "slug": "cornelius",
        "name_en": "Cornelius",
        "name_es": "Cornelio el Centurión",
        "display_title_es": "Centurión Romano y Primicia de los Gentiles",
        "archetype": "Oración Escuchada, Búsqueda Sincera y Derribo de Barreras Culturales",
        "category": "Iglesia Primitiva",
        "gender": "M",
        "bio_es": "Oficial del ejército imperial romano en Cesarea, Cornelio era un hombre piadoso, temeroso de Dios y dadivoso con los necesitados. Sus constantes oraciones y actos de bondad subieron como memoria ante Dios, quien envió un ángel y preparó al apóstol Pedro para derribar prejuicios culturales ancestrales. Al descender el Espíritu Santo sobre su hogar, se abrieron formalmente las puertas de la salvación para todas las naciones.",
        "testament": "NT",
        "verses": [
            (44, 10, 1), (44, 10, 2), (44, 10, 3), (44, 10, 4), (44, 10, 24),
            (44, 10, 25), (44, 10, 34), (44, 10, 35), (44, 10, 44), (44, 10, 47), (44, 11, 18)
        ]
    },
    {
        "id": 629,
        "slug": "nathan_prophet",
        "name_en": "Nathan the Prophet",
        "name_es": "Natán el Profeta",
        "display_title_es": "Profeta de la Corte Real y Voz de la Conciencia Sagrada",
        "archetype": "Valentía Profética, Verdad con Sabiduría y Confrontación Restauradora",
        "category": "Líderes y Profetas",
        "gender": "M",
        "bio_es": "Consejero espiritual y profeta en la corte de David, Natán comunicó las maravillosas promesas del pacto mesiánico. Pero su mayor momento de valor ocurrió cuando el rey intentó encubrir su pecado de adulterio y homicidio: Natán narró con maestría la parábola de la corderita del pobre y con santa firmeza le declaró: «¡Tú eres aquel hombre!», guiando al monarca al arrepentimiento genuino que dio luz al Salmo 51.",
        "testament": "OT",
        "verses": [
            (10, 7, 4), (10, 7, 5), (10, 7, 16), (10, 7, 17), (10, 12, 1),
            (10, 12, 2), (10, 12, 3), (10, 12, 7), (10, 12, 13), (11, 1, 11), (11, 1, 34)
        ]
    },
    {
        "id": 630,
        "slug": "ananias_damascus",
        "name_en": "Ananias of Damascus",
        "name_es": "Ananías de Damasco",
        "display_title_es": "Discípulo Obediente e Instrumento de Sanidad y Gracia",
        "archetype": "Obediencia en el Miedo, Fe que Derriba Resentimientos y Fraternidad",
        "category": "Iglesia Primitiva",
        "gender": "M",
        "bio_es": "Discípulo piadoso en Damasco, Ananías recibió la encomienda más sobrecogedora: ir a orar por Saulo de Tarso, el feroz perseguidor de la iglesia. Superando el comprensible temor mediante una fe inmediata, entró a la casa, colocó sus manos sobre el hombre ciego y lo acogió con ternura fraternal: «Hermano Saulo, el Señor Jesús me ha enviado». En ese instante cayeron las escamas de los ojos del que sería el gran apóstol.",
        "testament": "NT",
        "verses": [
            (44, 9, 10), (44, 9, 11), (44, 9, 12), (44, 9, 13), (44, 9, 14),
            (44, 9, 15), (44, 9, 17), (44, 9, 18), (44, 22, 12), (44, 22, 13), (44, 22, 14)
        ]
    },
    {
        "id": 631,
        "slug": "philemon",
        "name_en": "Philemon",
        "name_es": "Filemón de Colosas",
        "display_title_es": "Líder Cristiano, Colaborador de Pablo y Modelo de Perdón",
        "archetype": "Perdón Restaurador, Amor Fraternal y Gracia sobre la Ley",
        "category": "Iglesia Primitiva",
        "gender": "M",
        "bio_es": "Creyente generoso y líder de la comunidad cristiana que se reunía en su propia casa en Colosas. Cuando su siervo Onésimo escapó tras perjudicarle y luego se convirtió a Cristo junto a Pablo, el apóstol le escribió una conmovedora epístola suplicándole que recibiese a Onésimo no ya como esclavo, sino como un hermano amado en el Señor, elevando la gracia cristiana por encima de cualquier jerarquía social.",
        "testament": "NT",
        "verses": [
            (57, 1, 1), (57, 1, 4), (57, 1, 5), (57, 1, 6), (57, 1, 7),
            (57, 1, 8), (57, 1, 10), (57, 1, 11), (57, 1, 12), (57, 1, 15),
            (57, 1, 16), (57, 1, 17), (57, 1, 21)
        ]
    }
]

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    inserted_count = 0
    total_verses_linked = 0

    for p in NEW_CHARACTERS:
        # Check if already exists
        c.execute("SELECT id FROM people WHERE slug = ? OR id = ?", (p["slug"], p["id"]))
        existing = c.fetchone()
        if existing:
            print(f"Skipping existing character: {p['name_es']} (id={existing[0]})")
            continue

        c.execute("""
            INSERT INTO people (
                id, slug, name_en, name_es, display_title_es, archetype,
                category, gender, verse_count, bio_es, testament, min_year, max_year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        """, (
            p["id"], p["slug"], p["name_en"], p["name_es"], p["display_title_es"],
            p["archetype"], p["category"], p["gender"], 0, p["bio_es"], p["testament"]
        ))
        inserted_count += 1

        # Link verses
        person_verses = p.get("verses", [])
        linked_for_person = 0
        for (b_id, ch, v_num) in person_verses:
            c.execute("SELECT id FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?", (b_id, ch, v_num))
            v_row = c.fetchone()
            if v_row:
                v_id = v_row[0]
                c.execute("INSERT OR IGNORE INTO verse_people (verse_id, person_id) VALUES (?, ?)", (v_id, p["id"]))
                linked_for_person += 1
            else:
                print(f"  Warning: Verse not found: Book {b_id} {ch}:{v_num}")

        # Update verse_count in people table
        c.execute("UPDATE people SET verse_count = ? WHERE id = ?", (linked_for_person, p["id"]))
        total_verses_linked += linked_for_person
        print(f"Added {p['name_es']} (id={p['id']}, {linked_for_person} verses linked)")

    conn.commit()

    # Final stats
    c.execute("SELECT count(*) FROM people")
    total_people = c.fetchone()[0]
    c.execute("SELECT count(*) FROM verse_people")
    total_vp = c.fetchone()[0]

    print(f"\nSUCCESS! Inserted {inserted_count} new characters.")
    print(f"Total characters now in database: {total_people}")
    print(f"Total verse_people links: {total_vp}")
    conn.close()

if __name__ == '__main__':
    main()
