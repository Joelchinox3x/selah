import * as SQLite from 'expo-sqlite';
import { Bookmark, Highlight, Note, MoodLog, MoodKey } from '@/src/types/bible';
import { HighlightColor } from '@/src/theme/colors';
import INITIAL_CALENDAR_DATA from '@/src/features/daily/data/initialCalendarData.json';

let userDbInstance: SQLite.SQLiteDatabase | null = null;
let isCalendarSeeded = false;

export interface DevotionalCalendarRow {
  day_number: number;
  month: number;
  day: number;
  title: string;
  verse_slug: string;
  verse_citation: string;
  verse_text: string;
  theme: string;
  reflection: string;
  author: string;
  is_special_day: number;
  special_tag: string | null;
  updated_at?: string;
}

export async function getUserDb(): Promise<SQLite.SQLiteDatabase> {
  if (userDbInstance) {
    if (!isCalendarSeeded) {
      await ensureDevotionalCalendarSeeded(userDbInstance);
    }
    return userDbInstance;
  }

  userDbInstance = await SQLite.openDatabaseAsync('user_data.db');

  // Initialize tables idempotently
  await userDbInstance.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      tag TEXT DEFAULT 'General',
      created_at TEXT NOT NULL,
      UNIQUE(book_id, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(book_id, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(book_id, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS mood_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood_key TEXT NOT NULL,
      verse_id INTEGER,
      personal_note TEXT,
      felt_relief INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reading_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      last_verse INTEGER DEFAULT 1,
      completed INTEGER DEFAULT 0,
      last_read_at TEXT NOT NULL,
      UNIQUE(book_id, chapter)
    );

    CREATE TABLE IF NOT EXISTS daily_devotional_calendar (
      day_number INTEGER PRIMARY KEY,
      month INTEGER NOT NULL,
      day INTEGER NOT NULL,
      title TEXT NOT NULL,
      verse_slug TEXT NOT NULL,
      verse_citation TEXT NOT NULL,
      verse_text TEXT NOT NULL,
      theme TEXT NOT NULL,
      reflection TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Ps. Guillermo Quispe C.',
      is_special_day INTEGER NOT NULL DEFAULT 0,
      special_tag TEXT,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_calendar_month_day ON daily_devotional_calendar(month, day);
  `);

  // Non-destructive column migrations for existing user databases
  try {
    await userDbInstance.execAsync('ALTER TABLE reading_history ADD COLUMN last_verse INTEGER DEFAULT 1;');
  } catch {}
  try {
    await userDbInstance.execAsync('ALTER TABLE reading_history ADD COLUMN completed INTEGER DEFAULT 0;');
  } catch {}

  await ensureDevotionalCalendarSeeded(userDbInstance);

  return userDbInstance;
}

async function ensureDevotionalCalendarSeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  if (isCalendarSeeded) return;
  try {
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT count(*) as count FROM daily_devotional_calendar'
    );
    if (!row || row.count < 365) {
      console.log('[UserDB] Sembrando calendario devocional (365 días) en SQLite local...');
      await db.withTransactionAsync(async () => {
        for (const item of INITIAL_CALENDAR_DATA as any[]) {
          await db.runAsync(
            `INSERT OR REPLACE INTO daily_devotional_calendar 
             (day_number, month, day, title, verse_slug, verse_citation, verse_text, theme, reflection, author, is_special_day, special_tag, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.dayNumber,
              item.month,
              item.day,
              item.title,
              item.verseSlug,
              item.verseCitation,
              item.verseText,
              item.theme,
              item.reflection,
              item.author,
              item.isSpecialDay ? 1 : 0,
              item.specialTag || null,
              '2026-11-09 17:41:15',
            ]
          );
        }
      });
      console.log('[UserDB] Calendario devocional sembrado exitosamente en SQLite.');
    }
    isCalendarSeeded = true;
  } catch (err) {
    console.warn('[UserDB] Error al sembrar calendario devocional en SQLite:', err);
  }
}

export async function getDevotionalCalendarDay(dayNumber: number): Promise<DevotionalCalendarRow | null> {
  const db = await getUserDb();
  return await db.getFirstAsync<DevotionalCalendarRow>(
    'SELECT * FROM daily_devotional_calendar WHERE day_number = ?',
    [dayNumber]
  );
}

export async function getDevotionalCalendarByDate(month: number, day: number): Promise<DevotionalCalendarRow | null> {
  const db = await getUserDb();
  return await db.getFirstAsync<DevotionalCalendarRow>(
    'SELECT * FROM daily_devotional_calendar WHERE month = ? AND day = ?',
    [month, day]
  );
}

export async function upsertDevotionalCalendarRows(rows: any[]): Promise<void> {
  if (!rows || rows.length === 0) return;
  const db = await getUserDb();
  await db.withTransactionAsync(async () => {
    for (const r of rows) {
      const dayNum = r.day_number ?? r.dayNumber;
      if (!dayNum) continue;
      const month = r.month;
      const day = r.day;
      const title = r.title || '';
      const verseSlug = r.verse_slug ?? r.verseSlug ?? '';
      const verseCitation = r.verse_citation ?? r.verseCitation ?? '';
      const verseText = r.verse_text ?? r.verseText ?? '';
      const theme = r.theme || 'Paz y descanso';
      const reflection = r.reflection || '';
      const author = r.author || 'Ps. Guillermo Quispe C.';
      const isSpecial = (r.is_special_day === 1 || r.is_special_day === true || r.isSpecialDay === true) ? 1 : 0;
      const specialTag = r.special_tag ?? r.specialTag ?? null;
      const updatedAt = r.updated_at ?? r.updatedAt ?? new Date().toISOString();

      await db.runAsync(
        `INSERT INTO daily_devotional_calendar
         (day_number, month, day, title, verse_slug, verse_citation, verse_text, theme, reflection, author, is_special_day, special_tag, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(day_number) DO UPDATE SET
           month = excluded.month,
           day = excluded.day,
           title = excluded.title,
           verse_slug = excluded.verse_slug,
           verse_citation = excluded.verse_citation,
           verse_text = excluded.verse_text,
           theme = excluded.theme,
           reflection = excluded.reflection,
           author = excluded.author,
           is_special_day = excluded.is_special_day,
           special_tag = excluded.special_tag,
           updated_at = excluded.updated_at`,
        [dayNum, month, day, title, verseSlug, verseCitation, verseText, theme, reflection, author, isSpecial, specialTag, updatedAt]
      );
    }
  });
}

export interface ChapterUserData {
  bookmarks: Record<number, { id: number; tag: string }>;
  highlights: Record<number, { id: number; color: HighlightColor }>;
  notes: Record<number, { id: number; content: string }>;
}

export async function getChapterUserData(
  bookId: number,
  chapter: number
): Promise<ChapterUserData> {
  const db = await getUserDb();

  const bookmarksRows = await db.getAllAsync<{ id: number; verse: number; tag: string }>(
    'SELECT id, verse, tag FROM bookmarks WHERE book_id = ? AND chapter = ?',
    [bookId, chapter]
  );

  const highlightsRows = await db.getAllAsync<{ id: number; verse: number; color: string }>(
    'SELECT id, verse, color FROM highlights WHERE book_id = ? AND chapter = ?',
    [bookId, chapter]
  );

  const notesRows = await db.getAllAsync<{ id: number; verse: number; content: string }>(
    'SELECT id, verse, content FROM notes WHERE book_id = ? AND chapter = ?',
    [bookId, chapter]
  );

  const bookmarks: Record<number, { id: number; tag: string }> = {};
  for (const b of bookmarksRows) {
    bookmarks[b.verse] = { id: b.id, tag: b.tag };
  }

  const highlights: Record<number, { id: number; color: HighlightColor }> = {};
  for (const h of highlightsRows) {
    highlights[h.verse] = { id: h.id, color: h.color as HighlightColor };
  }

  const notes: Record<number, { id: number; content: string }> = {};
  for (const n of notesRows) {
    notes[n.verse] = { id: n.id, content: n.content };
  }

  return { bookmarks, highlights, notes };
}

// ================= BOOKMARKS =================
export async function toggleBookmark(
  bookId: number,
  chapter: number,
  verse: number,
  tag: string = 'General'
): Promise<boolean> {
  const db = await getUserDb();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM bookmarks WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );

  if (existing) {
    await db.runAsync('DELETE FROM bookmarks WHERE id = ?', [existing.id]);
    return false; // Removed
  } else {
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO bookmarks (book_id, chapter, verse, tag, created_at) VALUES (?, ?, ?, ?, ?)',
      [bookId, chapter, verse, tag, now]
    );
    return true; // Added
  }
}

export async function getAllBookmarks(): Promise<Bookmark[]> {
  const db = await getUserDb();
  return await db.getAllAsync<Bookmark>(
    'SELECT * FROM bookmarks ORDER BY id DESC'
  );
}

// ================= HIGHLIGHTS =================
export async function setHighlight(
  bookId: number,
  chapter: number,
  verse: number,
  color: HighlightColor
): Promise<void> {
  const db = await getUserDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO highlights (book_id, chapter, verse, color, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(book_id, chapter, verse)
     DO UPDATE SET color = excluded.color, created_at = excluded.created_at`,
    [bookId, chapter, verse, color, now]
  );
}

export async function removeHighlight(
  bookId: number,
  chapter: number,
  verse: number
): Promise<void> {
  const db = await getUserDb();
  await db.runAsync(
    'DELETE FROM highlights WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );
}

export async function getAllHighlights(): Promise<Highlight[]> {
  const db = await getUserDb();
  return await db.getAllAsync<Highlight>(
    'SELECT * FROM highlights ORDER BY id DESC'
  );
}

// ================= NOTES =================
export async function saveNote(
  bookId: number,
  chapter: number,
  verse: number,
  content: string
): Promise<void> {
  const db = await getUserDb();
  const now = new Date().toISOString();

  if (!content.trim()) {
    await db.runAsync(
      'DELETE FROM notes WHERE book_id = ? AND chapter = ? AND verse = ?',
      [bookId, chapter, verse]
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO notes (book_id, chapter, verse, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(book_id, chapter, verse)
     DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
    [bookId, chapter, verse, content.trim(), now, now]
  );
}

export async function deleteNote(
  bookId: number,
  chapter: number,
  verse: number
): Promise<void> {
  const db = await getUserDb();
  await db.runAsync(
    'DELETE FROM notes WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getUserDb();
  return await db.getAllAsync<Note>(
    'SELECT * FROM notes ORDER BY updated_at DESC'
  );
}

// ================= MOOD LOGS =================
export async function logMoodExperience(
  moodKey: MoodKey,
  feltRelief: boolean,
  personalNote?: string,
  verseId?: number
): Promise<void> {
  const db = await getUserDb();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO mood_logs (mood_key, verse_id, personal_note, felt_relief, created_at) VALUES (?, ?, ?, ?, ?)',
    [moodKey, verseId ?? null, personalNote ?? null, feltRelief ? 1 : 0, now]
  );
}

export async function getAllMoodLogs(): Promise<MoodLog[]> {
  const db = await getUserDb();
  const rows = await db.getAllAsync<{
    id: number;
    mood_key: string;
    verse_id: number | null;
    personal_note: string | null;
    felt_relief: number;
    created_at: string;
  }>('SELECT * FROM mood_logs ORDER BY id DESC');

  return rows.map((r) => ({
    id: r.id,
    mood_key: r.mood_key as MoodKey,
    verse_id: r.verse_id,
    personal_note: r.personal_note,
    felt_relief: r.felt_relief === 1,
    created_at: r.created_at,
  }));
}

export async function deleteMoodLog(id: number): Promise<void> {
  const db = await getUserDb();
  await db.runAsync('DELETE FROM mood_logs WHERE id = ?', [id]);
}

// ================= READING HISTORY =================
export interface LastReadRecord {
  bookId: number;
  chapter: number;
  lastVerse: number;
  completed: boolean;
  lastReadAt?: string;
}

export async function recordReadingProgress(
  bookId: number,
  chapter: number,
  lastVerse: number = 1,
  completed: boolean = false
): Promise<void> {
  const db = await getUserDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO reading_history (book_id, chapter, last_verse, completed, last_read_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(book_id, chapter)
     DO UPDATE SET 
       last_verse = CASE WHEN excluded.last_verse > 1 THEN excluded.last_verse ELSE reading_history.last_verse END,
       completed = CASE WHEN excluded.completed = 1 THEN 1 ELSE reading_history.completed END,
       last_read_at = excluded.last_read_at`,
    [bookId, chapter, lastVerse, completed ? 1 : 0, now]
  );
}

export async function markChapterCompleted(
  bookId: number,
  chapter: number,
  completed: boolean = true
): Promise<void> {
  const db = await getUserDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO reading_history (book_id, chapter, last_verse, completed, last_read_at)
     VALUES (?, ?, 1, ?, ?)
     ON CONFLICT(book_id, chapter)
     DO UPDATE SET completed = excluded.completed, last_read_at = excluded.last_read_at`,
    [bookId, chapter, completed ? 1 : 0, now]
  );
}

export async function getLastRead(): Promise<LastReadRecord | null> {
  const db = await getUserDb();
  const row = await db.getFirstAsync<{
    book_id: number;
    chapter: number;
    last_verse?: number;
    completed?: number;
    last_read_at: string;
  }>(
    'SELECT book_id, chapter, COALESCE(last_verse, 1) as last_verse, COALESCE(completed, 0) as completed, last_read_at FROM reading_history ORDER BY last_read_at DESC LIMIT 1'
  );
  if (!row) return null;
  return {
    bookId: row.book_id,
    chapter: row.chapter,
    lastVerse: row.last_verse || 1,
    completed: Boolean(row.completed),
    lastReadAt: row.last_read_at,
  };
}

export async function getChaptersWithUserData(bookId: number): Promise<number[]> {
  try {
    const db = await getUserDb();
    const rows = await db.getAllAsync<{ chapter: number }>(
      `SELECT DISTINCT chapter FROM bookmarks WHERE book_id = ?
       UNION
       SELECT DISTINCT chapter FROM notes WHERE book_id = ?
       UNION
       SELECT DISTINCT chapter FROM highlights WHERE book_id = ?`,
      [bookId, bookId, bookId]
    );
    return rows.map((r) => r.chapter);
  } catch {
    return [];
  }
}

