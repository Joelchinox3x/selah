import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import {
  Book,
  Verse,
  SearchResult,
  MoodCatalogItem,
  MoodVerseStory,
  MoodPrayer,
  MoodKey,
  BiblicalCharacter,
  TopicalVerse,
  BiblicalPerson,
  BiblicalPlace,
  TimelinePeriod,
  TimelineEvent,
  DailyDiscovery,
} from '@/src/types/bible';

let bibleDbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;

const DB_NAME = 'bible_readonly.db';

export async function getBibleDb(): Promise<SQLite.SQLiteDatabase> {
  if (bibleDbInstance) return bibleDbInstance;

  while (isInitializing) {
    await new Promise((r) => setTimeout(r, 50));
    if (bibleDbInstance) return bibleDbInstance;
  }

  isInitializing = true;

  try {
    let db: SQLite.SQLiteDatabase | null = null;
    let needsImport = false;

    if (Platform.OS !== 'web') {
      try {
        db = await SQLite.openDatabaseAsync(DB_NAME);
        const check = await db.getFirstAsync<{ count: number }>(
          "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='books'"
        );
        if (!check || check.count === 0) {
          needsImport = true;
        } else {
          const booksCount = await db.getFirstAsync<{ count: number }>(
            'SELECT count(*) as count FROM books'
          );
          const checkSpanish = await db.getFirstAsync<{ name: string }>(
            'SELECT name FROM books WHERE id = 2'
          );
          const checkCharTable = await db.getFirstAsync<{ count: number }>(
            "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='biblical_characters'"
          );
          const checkMoodCatalog = await db.getFirstAsync<{ count: number }>(
            "SELECT count(*) as count FROM mood_catalog"
          );
          const checkPeopleTable = await db.getFirstAsync<{ count: number }>(
            "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='people'"
          );
          let peopleCount = 0;
          if (checkPeopleTable && checkPeopleTable.count > 0) {
            const pRes = await db.getFirstAsync<{ count: number }>(
              'SELECT count(*) as count FROM people'
            );
            peopleCount = pRes?.count ?? 0;
          }

          const checkPlacesTable = await db.getFirstAsync<{ count: number }>(
            "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='places'"
          );
          let placesCount = 0;
          if (checkPlacesTable && checkPlacesTable.count > 0) {
            const plRes = await db.getFirstAsync<{ count: number }>(
              'SELECT count(*) as count FROM places'
            );
            placesCount = plRes?.count ?? 0;
          }

          const checkTimelineTable = await db.getFirstAsync<{ count: number }>(
            "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='timeline_periods'"
          );
          let timelineCount = 0;
          if (checkTimelineTable && checkTimelineTable.count > 0) {
            const tlRes = await db.getFirstAsync<{ count: number }>(
              'SELECT count(*) as count FROM timeline_periods'
            );
            timelineCount = tlRes?.count ?? 0;
          }

          if (
            !booksCount ||
            booksCount.count < 66 ||
            checkSpanish?.name !== 'Éxodo' ||
            !checkCharTable ||
            checkCharTable.count === 0 ||
            !checkMoodCatalog ||
            checkMoodCatalog.count < 12 ||
            peopleCount < 30 ||
            placesCount < 20 ||
            timelineCount < 8
          ) {
            needsImport = true;
          }
        }
      } catch (err) {
        console.warn('[BibleDB] Inspection notice, will re-import:', err);
        needsImport = true;
      }

      if (needsImport) {
        if (db) {
          await db.closeAsync().catch(() => {});
          db = null;
        }
        await SQLite.deleteDatabaseAsync(DB_NAME).catch(() => {});

        console.log('[BibleDB] Desempaquetando base de datos bíblica (14MB)...');
        await SQLite.importDatabaseFromAssetAsync(DB_NAME, {
          assetId: require('@/assets/db/bible_readonly.db'),
          forceOverwrite: true,
        });
        console.log('[BibleDB] Base de datos bíblica desempaquetada con éxito.');

        db = await SQLite.openDatabaseAsync(DB_NAME);
      }
    }

    if (!db) {
      db = await SQLite.openDatabaseAsync(DB_NAME);
    }

    const verify = await db.getFirstAsync<{ count: number }>(
      'SELECT count(*) as count FROM books'
    );
    console.log(`[BibleDB] Inicializado correctamente con ${verify?.count ?? 0} libros.`);

    bibleDbInstance = db;
    return bibleDbInstance;
  } catch (error) {
    console.error('[BibleDB] Error fatal al inicializar base de datos:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

// ================= BOOKS =================
export async function getBooks(): Promise<Book[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<Book>(
    'SELECT id, name, testament, chapters_count, abbreviation FROM books ORDER BY id ASC'
  );
}

export async function getBookById(id: number): Promise<Book | null> {
  const db = await getBibleDb();
  return await db.getFirstAsync<Book>(
    'SELECT id, name, testament, chapters_count, abbreviation FROM books WHERE id = ?',
    [id]
  );
}

// ================= CHAPTER VERSES =================
export async function getChapterVerses(
  bookId: number,
  chapter: number
): Promise<Verse[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<Verse>(
    `SELECT v.id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
     FROM verses v
     JOIN books b ON v.book_id = b.id
     WHERE v.book_id = ? AND v.chapter = ?
     ORDER BY v.verse ASC`,
    [bookId, chapter]
  );
}

export async function getVerseById(verseId: number): Promise<Verse | null> {
  const db = await getBibleDb();
  return await db.getFirstAsync<Verse>(
    `SELECT v.id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
     FROM verses v
     JOIN books b ON v.book_id = b.id
     WHERE v.id = ?`,
    [verseId]
  );
}

// ================= FTS5 ACCENT-INSENSITIVE SEARCH =================
export async function searchVerses(
  query: string,
  scope: 'all' | 'OT' | 'NT' = 'all',
  limit: number = 60
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const db = await getBibleDb();

  // Clean special characters for FTS5 syntax safety
  const cleanTokens = trimmed
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean);

  if (cleanTokens.length === 0) return [];

  // Prefix matching on each token with AND
  const ftsQuery = cleanTokens.map((t) => `${t}*`).join(' AND ');

  try {
    let sql = `
      SELECT v.id as verse_id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
      FROM verses_fts fts
      JOIN verses v ON fts.rowid = v.id
      JOIN books b ON v.book_id = b.id
      WHERE verses_fts MATCH ?
    `;
    const params: (string | number)[] = [ftsQuery];

    if (scope === 'OT' || scope === 'NT') {
      sql += ' AND b.testament = ?';
      params.push(scope);
    }

    sql += ' ORDER BY v.id ASC LIMIT ?';
    params.push(limit);

    return await db.getAllAsync<SearchResult>(sql, params);
  } catch (err) {
    // Graceful fallback to standard LIKE query if FTS expression has syntax quirks
    let sql = `
      SELECT v.id as verse_id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE v.text LIKE ?
    `;
    const params: (string | number)[] = [`%${trimmed}%`];

    if (scope === 'OT' || scope === 'NT') {
      sql += ' AND b.testament = ?';
      params.push(scope);
    }

    sql += ' ORDER BY v.id ASC LIMIT ?';
    params.push(limit);

    return await db.getAllAsync<SearchResult>(sql, params);
  }
}

// ================= MOOD CATALOG & STORIES =================
export async function getMoodCatalog(): Promise<MoodCatalogItem[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<MoodCatalogItem>(
    'SELECT id, key, label, tagline, color_hex, icon_name, safety_copy FROM mood_catalog ORDER BY id ASC'
  );
}

export async function getMoodStories(moodKey: MoodKey, limit: number = 5): Promise<MoodVerseStory[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<MoodVerseStory>(
    `SELECT mv.id, mv.mood_key, mv.step_order, mv.verse_id, mv.context_note,
            mv.is_sos_recommended, v.text as verse_text, v.book_id, b.name as book_name,
            v.chapter, v.verse
     FROM mood_verses mv
     JOIN verses v ON mv.verse_id = v.id
     JOIN books b ON v.book_id = b.id
     WHERE mv.mood_key = ?
     ORDER BY RANDOM()
     LIMIT ?`,
    [moodKey, limit]
  );
}

export async function getMoodPrayer(moodKey: MoodKey): Promise<MoodPrayer | null> {
  const db = await getBibleDb();
  return await db.getFirstAsync<MoodPrayer>(
    'SELECT id, mood_key, title, prayer_text FROM mood_prayers WHERE mood_key = ?',
    [moodKey]
  );
}

// ================= THEOGRAPHIC BIBLICAL CHARACTERS =================
export async function getBiblicalCharacter(moodKey: MoodKey): Promise<BiblicalCharacter | null> {
  const db = await getBibleDb();
  return await db.getFirstAsync<BiblicalCharacter>(
    `SELECT id, name, title, archetype, mood_key, summary, book_id, chapter, verse, event_label
     FROM biblical_characters WHERE mood_key = ? LIMIT 1`,
    [moodKey]
  );
}

// ================= OPENBIBLE TOPICAL SCORES =================
export async function getTopicalVerses(topicKey: string, limit: number = 20): Promise<TopicalVerse[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<TopicalVerse>(
    `SELECT tv.id, tv.topic_key, tv.topic_label, tv.category, tv.verse_id, tv.quality_score,
            v.text as verse_text, v.book_id, b.name as book_name, v.chapter, v.verse
     FROM topical_verses tv
     JOIN verses v ON tv.verse_id = v.id
     JOIN books b ON v.book_id = b.id
     WHERE tv.topic_key = ?
     ORDER BY tv.quality_score DESC
     LIMIT ?`,
    [topicKey, limit]
  );
}

export async function getAllTopics(): Promise<{ topic_key: string; topic_label: string; category: string; count: number }[]> {
  const db = await getBibleDb();
  return await db.getAllAsync(
    `SELECT topic_key, topic_label, category, COUNT(*) as count
     FROM topical_verses
     GROUP BY topic_key
     ORDER BY count DESC`
  );
}


// ================= SOS CALMING VERSES =================
export async function getRandomCalmingVerse(): Promise<Verse> {
  const db = await getBibleDb();
  // Calming references: Salmos 23:1-3, Salmos 46:1-2, Filipenses 4:6-7, Mateo 11:28, Juan 14:27, Isaías 41:10
  const calmingVerseIds = [
    14022, // Salmo 23:1
    14023, // Salmo 23:2
    14024, // Salmo 23:3
    14588, // Salmo 46:1
    27838, // Filipenses 4:6
    27839, // Filipenses 4:7
    23483, // Mateo 11:28
    26679, // Juan 14:27
    18464, // Isaías 41:10
  ];
  const chosenId = calmingVerseIds[Math.floor(Math.random() * calmingVerseIds.length)];

  const verse = await getVerseById(chosenId);
  if (verse) return verse;

  // Fallback to first available verse
  const fallback = await db.getFirstAsync<Verse>(
    `SELECT v.id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
     FROM verses v JOIN books b ON v.book_id = b.id LIMIT 1`
  );
  return fallback!;
}

// ================= DAILY DEVOTIONAL VERSE =================
export interface DailyDevotional {
  verse: Verse;
  dateKey: string;
  theme: string;
  reflection: string;
}

const DEVOTIONAL_THEMES = [
  { verseId: 14237, theme: 'Paz en la provisión', reflection: 'Descansa hoy sabiendo que no caminas en escasez: Dios es tu pastor y su gracia cuida cada uno de tus pasos.' },
  { verseId: 29449, theme: 'Rendición y Quietud', reflection: 'Convierte cada pensamiento de afán en una plegaria sincera. Su paz sobrepasará hoy todo tu entendimiento.' },
  { verseId: 18462, theme: 'Fuerza en la debilidad', reflection: 'No temas al porvenir ni a las tareas del día. La diestra de su justicia es el sustento que nunca falla.' },
  { verseId: 23488, theme: 'El alivio del cansancio', reflection: 'Si sientes el alma agotada, Jesús no te pide más esfuerzo: te ofrece un abrazo seguro y reposo verdadero.' },
  { verseId: 26696, theme: 'La paz que permanece', reflection: 'El mundo ofrece calma momentánea, pero la paz de Cristo es un ancla inamovible en medio de cualquier marea.' },
  { verseId: 16461, theme: 'Confianza plena', reflection: 'No necesitas resolver todas las incógnitas hoy. Confía de corazón en Aquel que ya conoce todo tu sendero.' },
  { verseId: 19647, theme: 'Pensamientos de bien', reflection: 'Los designios de Dios para tu vida están llenos de esperanza y futuro. Camina en confianza hoy.' },
  { verseId: 14616, theme: 'Nuestro refugio', reflection: 'Dios es nuestro amparo y fortaleza, pronto auxilio en las tribulaciones. Quédate en silencio y descansa.' },
  { verseId: 28145, theme: 'Propósito en todo', reflection: 'Aun lo que parece confuso o difícil está siendo entretejido por Dios para un bien mayor en tu vida.' },
  { verseId: 18452, theme: 'Alas como de águilas', reflection: 'Los que esperan en el Señor renovarán sus fuerzas; correrán y no se cansarán, caminarán sin fatigarse.' },
  { verseId: 15397, theme: 'Morar bajo su sombra', reflection: 'El que habita al abrigo del Altísimo morará seguro bajo las alas de su protección todopoderosa.' },
  { verseId: 15552, theme: 'Gratitud que sana', reflection: 'Bendice hoy al Señor y no olvides ninguno de sus beneficios cotidianos en tu caminar.' },
  { verseId: 30272, theme: 'Sabiduría divina', reflection: 'Si sientes incertidumbre, pide sabiduría a Dios: Él da con generosidad y sin reproche.' },
  { verseId: 30473, theme: 'Descargar la solicitud', reflection: 'Echa hoy toda tu ansiedad sobre Él, con la plena certeza de que Dios cuida tiernamente de ti.' },
  { verseId: 30174, theme: 'Certeza inamovible', reflection: 'La fe no es ver el camino despejado, sino avanzar confiando en la mano que te guía.' },
  { verseId: 16084, theme: 'Socorro que no duerme', reflection: 'Tu ayuda viene de Jehová, creador de los cielos y la tierra, quien cuida tu salida y tu entrada.' },
  { verseId: 14287, theme: 'Luz en la oscuridad', reflection: 'Jehová es mi luz y salvación: ¿a quién temeré? Su presencia ahuyenta todo temor.' },
  { verseId: 23316, theme: 'El orden de las cosas', reflection: 'Busca hoy el reino de Dios y su justicia, y todo lo necesario te será provisto con generosidad.' },
  { verseId: 18134, theme: 'Mente en calma', reflection: 'Tú guardarás en perfecta paz a aquel cuyo pensamiento en ti persevera, porque en ti confía.' },
  { verseId: 14397, theme: 'Probar su bondad', reflection: 'Gusta y ve cuán bueno es el Señor; dichosa el alma que en Él halla verdadero refugio.' },
  { verseId: 29456, theme: 'Fuerza interior', reflection: 'Todo lo puedo en Cristo que me fortalece; ninguna circunstancia es más grande que su gracia.' },
  { verseId: 14455, theme: 'El deleite del alma', reflection: 'Deléitate en el Señor, y Él concederá los deseos más nobles y profundos de tu corazón.' },
  { verseId: 26394, theme: 'Luz de vida', reflection: 'El que me sigue no andará en tinieblas, sino que tendrá la luz viva que ilumina todo sendero.' },
  { verseId: 28317, theme: 'Abundancia de esperanza', reflection: 'Que el Dios de esperanza te llene de todo gozo y paz en el creer para que abundes en esperanza.' },
  { verseId: 16004, theme: 'Lámpara a mis pies', reflection: 'Lámpara es a mis pies tu palabra y lumbrera a mi camino; cada promesa alumbra tu jornada.' },
  { verseId: 29638, theme: 'Alegría constante', reflection: 'Estad siempre gozosos, orad sin cesar y dad gracias en todo momento.' },
  { verseId: 14833, theme: 'Silencio y esperanza', reflection: 'En Dios solamente reposa, alma mía, porque de Él viene tu esperanza inquebrantable.' },
  { verseId: 16844, theme: 'Encomendar tus pasos', reflection: 'Pon tus obras en las manos de Dios, y tus planes serán afirmados en su perfecta voluntad.' },
  { verseId: 5861, theme: 'Valentía y aliento', reflection: 'Sé fuerte y valiente; no temas ni desmayes, porque Jehová tu Dios va contigo dondequiera que vayas.' },
  { verseId: 16254, theme: 'Creación admirable', reflection: 'Te alabo porque formidables y maravillosas son tus obras; tu amor me formó con propósito.' },
  { verseId: 26492, theme: 'Vida abundante', reflection: 'Yo he venido para que tengan vida, y para que la tengan en abundancia y plenitud.' },
];

export async function getDailyDevotional(options?: { date?: Date; randomize?: boolean }): Promise<DailyDevotional> {
  const targetDate = options?.date || new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  let devotionalMeta;
  if (options?.randomize) {
    const randIndex = Math.floor(Math.random() * DEVOTIONAL_THEMES.length);
    devotionalMeta = DEVOTIONAL_THEMES[randIndex];
  } else {
    // Deterministic index by day of the year (rotates every single day)
    const startOfYear = new Date(year, 0, 0);
    const diff = targetDate.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    devotionalMeta = DEVOTIONAL_THEMES[dayOfYear % DEVOTIONAL_THEMES.length];
  }

  let verse = await getVerseById(devotionalMeta.verseId);

  if (!verse) {
    verse = await getRandomCalmingVerse();
  }

  return {
    verse,
    dateKey,
    theme: devotionalMeta.theme,
    reflection: devotionalMeta.reflection,
  };
}

// ================= BIBLICAL PEOPLE (EL ÁRBOL HUMANO & SMART READER) =================

export async function getAllPeople(category?: string): Promise<BiblicalPerson[]> {
  const db = await getBibleDb();
  if (category && category !== 'Todos') {
    return await db.getAllAsync<BiblicalPerson>(
      'SELECT * FROM people WHERE category = ? ORDER BY verse_count DESC, name_es ASC',
      [category]
    );
  }
  return await db.getAllAsync<BiblicalPerson>(
    'SELECT * FROM people ORDER BY verse_count DESC, name_es ASC'
  );
}

export async function getPersonById(id: number): Promise<BiblicalPerson | null> {
  const db = await getBibleDb();
  return await db.getFirstAsync<BiblicalPerson>(
    'SELECT * FROM people WHERE id = ?',
    [id]
  );
}

export async function searchPeople(query: string): Promise<BiblicalPerson[]> {
  const db = await getBibleDb();
  const pattern = `%${query.trim()}%`;
  return await db.getAllAsync<BiblicalPerson>(
    `SELECT * FROM people 
     WHERE name_es LIKE ? OR display_title_es LIKE ? OR archetype LIKE ? OR bio_es LIKE ?
     ORDER BY verse_count DESC, name_es ASC`,
    [pattern, pattern, pattern, pattern]
  );
}

/**
 * Returns a mapping of verse number -> array of BiblicalPerson present in that verse
 * for the specified book and chapter.
 */
export async function getPeopleForChapter(
  bookId: number,
  chapter: number
): Promise<Record<number, BiblicalPerson[]>> {
  const db = await getBibleDb();
  const rows = await db.getAllAsync<BiblicalPerson & { verse_num: number }>(
    `SELECT v.verse as verse_num, p.id, p.slug, p.name_en, p.name_es, 
            p.display_title_es, p.archetype, p.category, p.gender, 
            p.verse_count, p.bio_es, p.testament, p.min_year, p.max_year
     FROM verses v
     JOIN verse_people vp ON v.id = vp.verse_id
     JOIN people p ON vp.person_id = p.id
     WHERE v.book_id = ? AND v.chapter = ?
     ORDER BY v.verse ASC, p.verse_count DESC`,
    [bookId, chapter]
  );

  const mapping: Record<number, BiblicalPerson[]> = {};
  for (const row of rows) {
    const vNum = row.verse_num;
    if (!mapping[vNum]) {
      mapping[vNum] = [];
    }
    // Avoid duplicates in the same verse if any
    if (!mapping[vNum].some((p) => p.id === row.id)) {
      mapping[vNum].push({
        id: row.id,
        slug: row.slug,
        name_en: row.name_en,
        name_es: row.name_es,
        display_title_es: row.display_title_es,
        archetype: row.archetype,
        category: row.category,
        gender: row.gender,
        verse_count: row.verse_count,
        bio_es: row.bio_es,
        testament: row.testament,
        min_year: row.min_year,
        max_year: row.max_year,
      });
    }
  }

  return mapping;
}

/**
 * Returns verses where this biblical person appears.
 */
export async function getVersesForPerson(
  personId: number,
  limit: number = 25
): Promise<Verse[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<Verse>(
    `SELECT v.id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
     FROM verses v
     JOIN books b ON v.book_id = b.id
     JOIN verse_people vp ON v.id = vp.verse_id
     WHERE vp.person_id = ?
     ORDER BY v.id ASC
     LIMIT ?`,
    [personId, limit]
  );
}

// ================= SACRED PLACES (MAPA SAGRADO GPS) =================

export async function getAllPlaces(category?: string): Promise<BiblicalPlace[]> {
  const db = await getBibleDb();
  if (category && category !== 'Todos') {
    return await db.getAllAsync<BiblicalPlace>(
      'SELECT * FROM places WHERE category = ? ORDER BY verse_count DESC, name_es ASC',
      [category]
    );
  }
  return await db.getAllAsync<BiblicalPlace>(
    'SELECT * FROM places ORDER BY verse_count DESC, name_es ASC'
  );
}

export async function getPlaceById(id: number): Promise<BiblicalPlace | null> {
  const db = await getBibleDb();
  return await db.getFirstAsync<BiblicalPlace>(
    'SELECT * FROM places WHERE id = ?',
    [id]
  );
}

export async function getVersesForPlace(placeId: number, limit: number = 25): Promise<Verse[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<Verse>(
    `SELECT v.id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
     FROM verses v
     JOIN books b ON v.book_id = b.id
     JOIN place_verses pv ON v.id = pv.verse_id
     WHERE pv.place_id = ?
     ORDER BY v.id ASC
     LIMIT ?`,
    [placeId, limit]
  );
}

// ================= TIMELINE (LÍNEA DEL TIEMPO VIVA) =================

export async function getTimelinePeriods(): Promise<TimelinePeriod[]> {
  const db = await getBibleDb();
  return await db.getAllAsync<TimelinePeriod>(
    'SELECT * FROM timeline_periods ORDER BY order_index ASC'
  );
}

export async function getTimelineEvents(periodId?: number): Promise<TimelineEvent[]> {
  const db = await getBibleDb();
  if (periodId) {
    return await db.getAllAsync<TimelineEvent>(
      `SELECT e.*, b.name as book_name
       FROM timeline_events e
       JOIN books b ON e.book_id = b.id
       WHERE e.period_id = ?
       ORDER BY e.order_index ASC`,
      [periodId]
    );
  }
  return await db.getAllAsync<TimelineEvent>(
    `SELECT e.*, b.name as book_name
     FROM timeline_events e
     JOIN books b ON e.book_id = b.id
     ORDER BY e.period_id ASC, e.order_index ASC`
  );
}

// ================= DAILY DISCOVERIES (DESCUBRIMIENTO DIARIO SELAH) =================

export async function getDailyDiscoveries(category?: string): Promise<DailyDiscovery[]> {
  const db = await getBibleDb();
  if (category && category !== 'Todos') {
    return await db.getAllAsync<DailyDiscovery>(
      `SELECT d.*, b.name as book_name
       FROM daily_discoveries d
       JOIN books b ON d.book_id = b.id
       WHERE d.category = ?
       ORDER BY d.id ASC`,
      [category]
    );
  }
  return await db.getAllAsync<DailyDiscovery>(
    `SELECT d.*, b.name as book_name
     FROM daily_discoveries d
     JOIN books b ON d.book_id = b.id
     ORDER BY d.id ASC`
  );
}

export async function getTodayDiscovery(date?: Date): Promise<DailyDiscovery> {
  const targetDate = date || new Date();
  const dayOfYear = Math.floor(
    (targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const db = await getBibleDb();
  const all = await db.getAllAsync<DailyDiscovery>(
    `SELECT d.*, b.name as book_name
     FROM daily_discoveries d
     JOIN books b ON d.book_id = b.id
     ORDER BY d.id ASC`
  );
  if (!all || all.length === 0) {
    return {
      id: 1,
      category: 'Raíz Hebrea / Griega',
      title: 'El Significado Oculto de SELAH (סֶלָה)',
      original_word: 'Selah (סֶלָה)',
      pronunciation: "seh'-lah",
      insight: 'Aparece 74 veces en la Biblia. Significa detenerse, respirar y meditar en la verdad divina.',
      practical_application: 'Haz una pausa y descansa en la providencia de Dios hoy.',
      book_id: 19,
      chapter: 46,
      verse: 7,
      verse_snippet: 'Dios es nuestro amparo y fortaleza... Selah.',
      book_name: 'Salmos',
    };
  }
  return all[dayOfYear % all.length];
}

