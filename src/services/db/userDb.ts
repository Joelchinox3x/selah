import * as SQLite from 'expo-sqlite';
import { Bookmark, Highlight, Note, MoodLog, MoodKey } from '@/src/types/bible';
import { HighlightColor } from '@/src/theme/colors';

let userDbInstance: SQLite.SQLiteDatabase | null = null;

export async function getUserDb(): Promise<SQLite.SQLiteDatabase> {
  if (userDbInstance) return userDbInstance;

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
      last_read_at TEXT NOT NULL,
      UNIQUE(book_id, chapter)
    );
  `);

  return userDbInstance;
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
export async function recordReadingProgress(
  bookId: number,
  chapter: number
): Promise<void> {
  const db = await getUserDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO reading_history (book_id, chapter, last_read_at)
     VALUES (?, ?, ?)
     ON CONFLICT(book_id, chapter)
     DO UPDATE SET last_read_at = excluded.last_read_at`,
    [bookId, chapter, now]
  );
}

export async function getLastRead(): Promise<{ bookId: number; chapter: number; lastReadAt?: string } | null> {
  const db = await getUserDb();
  const row = await db.getFirstAsync<{ book_id: number; chapter: number; last_read_at: string }>(
    'SELECT book_id, chapter, last_read_at FROM reading_history ORDER BY last_read_at DESC LIMIT 1'
  );
  if (!row) return null;
  return { bookId: row.book_id, chapter: row.chapter, lastReadAt: row.last_read_at };
}

