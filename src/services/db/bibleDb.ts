import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEVOTIONAL_CATALOG } from '@/src/features/daily/data/devotionalCatalog';
import { selectDevotional, parseDevotionalSelection } from '@/src/features/daily/data/devotionalSelection';
import {
  getDevotionalCalendarByDate,
  getDevotionalCalendarDay,
  DevotionalCalendarRow,
} from './userDb';
import { syncDevotionalCalendarWithServer } from '@/src/services/devotionalSyncService';
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
            peopleCount < 50 ||
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

export async function getVerseByReference(
  bookId: number,
  chapter: number,
  verse: number
): Promise<Verse | null> {
  const db = await getBibleDb();
  return await db.getFirstAsync<Verse>(
    `SELECT v.id, v.book_id, b.name as book_name, v.chapter, v.verse, v.text
     FROM verses v
     JOIN books b ON v.book_id = b.id
     WHERE v.book_id = ? AND v.chapter = ? AND v.verse = ?`,
    [bookId, chapter, verse]
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
  canGoBack: boolean;
  verse: Verse;
  dateKey: string;
  theme: string;
  reflection: string;
  title?: string;
  author?: string;
  isSpecialDay?: boolean;
  specialTag?: string | null;
}

const DEVOTIONAL_STORAGE_KEY = 'selah.daily-devotional.v1';
const DEVOTIONAL_IDS = DEVOTIONAL_CATALOG.map((entry) => entry.verseId);
let devotionalQueue: Promise<unknown> = Promise.resolve();

let cachedBooksList: Book[] | null = null;

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function resolveVerseFromCalendar(
  row: DevotionalCalendarRow,
  fallbackVerse?: Verse | null
): Promise<Verse> {
  try {
    if (!cachedBooksList) {
      cachedBooksList = await getBooks();
    }

    const citation = (row.verse_citation || '').trim();
    const match = citation.match(/^([1-3]?\s*[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+?)\s+(\d+)[:.](\d+)/);

    let bookId = fallbackVerse?.book_id || 19;
    let chapter = fallbackVerse?.chapter || 1;
    let verseNumber = fallbackVerse?.verse || 1;
    let bookName = fallbackVerse?.book_name || 'Biblia';
    let verseId = fallbackVerse?.id || (900000 + row.day_number);

    if (match) {
      const parsedBookName = match[1].trim();
      const normParsed = normalizeString(parsedBookName);
      chapter = parseInt(match[2], 10);
      verseNumber = parseInt(match[3], 10);

      const matchedBook = cachedBooksList?.find(
        (b) => normalizeString(b.name) === normParsed || normalizeString(b.abbreviation) === normParsed
      );

      if (matchedBook) {
        bookId = matchedBook.id;
        bookName = matchedBook.name;
        const dbVerse = await getVerseByReference(bookId, chapter, verseNumber);
        if (dbVerse) {
          verseId = dbVerse.id;
          bookName = dbVerse.book_name || bookName;
        }
      } else {
        bookName = parsedBookName;
      }
    }

    return {
      id: verseId,
      book_id: bookId,
      chapter: chapter,
      verse: verseNumber,
      text: row.verse_text || fallbackVerse?.text || '',
      book_name: bookName,
    };
  } catch (err) {
    console.warn('[BibleDB] Error resolviendo versículo desde calendario:', err);
    if (fallbackVerse) return fallbackVerse;
    return {
      id: 900000 + row.day_number,
      book_id: 19,
      chapter: 23,
      verse: 1,
      text: row.verse_text || '',
      book_name: row.verse_citation || 'Salmos 23:1',
    };
  }
}

export function getDailyDevotional(options?: {
  date?: Date;
  randomize?: boolean;
  previous?: boolean;
}): Promise<DailyDevotional> {
  const task = devotionalQueue.then(async () => {
    // Date previews (notification scheduling) must never replace today's saved choice.
    const preview = options?.date !== undefined;
    const targetDate = options?.date || new Date();
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    const saved = preview ? null : parseDevotionalSelection(await AsyncStorage.getItem(DEVOTIONAL_STORAGE_KEY));
    const selection = selectDevotional(saved, DEVOTIONAL_IDS, targetDate,
      options?.previous ? 'previous' : options?.randomize ? 'random' : 'current');
    const id = selection.history[selection.history.length - 1];
    const meta = DEVOTIONAL_CATALOG.find((entry) => entry.verseId === id)!;
    const fallbackVerse = await getVerseById(id);
    if (!preview) await AsyncStorage.setItem(DEVOTIONAL_STORAGE_KEY, JSON.stringify(selection));

    // 1. Cargar directamente desde SQLite local (100% offline, 0ms latencia)
    let calendarRow = await getDevotionalCalendarByDate(month, day);
    if (!calendarRow) {
      calendarRow = await getDevotionalCalendarDay(selection.history.length > 0 ? (selection.history.length % 365) + 1 : 1);
    }

    let finalVerse: Verse;
    let theme = meta.theme;
    let reflection = meta.reflection;
    let title: string | undefined = undefined;
    let author: string | undefined = 'Ps. Guillermo Quispe C.';
    let isSpecialDay: boolean | undefined = undefined;
    let specialTag: string | null | undefined = undefined;

    if (calendarRow) {
      finalVerse = await resolveVerseFromCalendar(calendarRow, fallbackVerse);
      theme = calendarRow.theme || theme;
      reflection = calendarRow.reflection || reflection;
      title = calendarRow.title || title;
      author = calendarRow.author || author;
      isSpecialDay = Boolean(calendarRow.is_special_day);
      specialTag = calendarRow.special_tag;
    } else {
      finalVerse = fallbackVerse || (await getRandomCalmingVerse());
    }

    // 2. Disparar sincronización Delta en segundo plano (silenciosa, no bloquea UX)
    if (!preview && typeof fetch !== 'undefined') {
      syncDevotionalCalendarWithServer().catch(() => {});
    }

    return {
      verse: finalVerse,
      dateKey: selection.dateKey,
      theme,
      reflection,
      title,
      author,
      isSpecialDay,
      specialTag,
      canGoBack: selection.history.length > 1,
    };
  });
  devotionalQueue = task.catch(() => undefined);
  return task;
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

