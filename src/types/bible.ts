export type Testament = 'OT' | 'NT';

export interface Book {
  id: number;
  name: string;
  testament: Testament;
  chapters_count: number;
  abbreviation: string;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  book_name?: string;
}

export interface VerseWithUserData extends Verse {
  isBookmarked?: boolean;
  bookmarkTag?: string;
  highlightColor?: 'yellow' | 'green' | 'blue' | 'pink' | null;
  hasNote?: boolean;
  noteContent?: string | null;
}

export interface SearchResult {
  verse_id: number;
  book_id: number;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Bookmark {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  tag: string;
  created_at: string;
  verse_text?: string;
  book_name?: string;
}

export interface Highlight {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  created_at: string;
  verse_text?: string;
  book_name?: string;
}

export interface Note {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  content: string;
  created_at: string;
  updated_at: string;
  verse_text?: string;
  book_name?: string;
}

export type MoodKey =
  | 'anxiety'
  | 'sadness'
  | 'gratitude'
  | 'exhaustion'
  | 'fear'
  | 'doubt'
  | 'anger'
  | 'peace'
  | 'marriage'
  | 'finances'
  | 'healing'
  | 'loneliness';

export interface MoodCatalogItem {
  id: number;
  key: MoodKey;
  label: string;
  tagline: string;
  color_hex: string;
  icon_name: string;
  safety_copy?: string | null;
}

export interface MoodVerseStory {
  id: number;
  mood_key: MoodKey;
  step_order: number;
  verse_id: number;
  context_note: string;
  is_sos_recommended: boolean;
  verse_text: string;
  book_id: number;
  book_name: string;
  chapter: number;
  verse: number;
}

export interface MoodPrayer {
  id: number;
  mood_key: MoodKey;
  title: string;
  prayer_text: string;
}

export interface MoodLog {
  id: number;
  mood_key: MoodKey;
  verse_id?: number | null;
  personal_note?: string | null;
  felt_relief: boolean;
  created_at: string;
}

export interface BiblicalCharacter {
  id: number;
  name: string;
  title: string;
  archetype: string;
  mood_key: MoodKey;
  summary: string;
  book_id: number;
  chapter: number;
  verse: number;
  event_label: string;
}

export interface TopicalVerse {
  id: number;
  topic_key: string;
  topic_label: string;
  category: string;
  verse_id: number;
  quality_score: number;
  verse_text: string;
  book_id: number;
  book_name: string;
  chapter: number;
  verse: number;
}

export interface BiblicalPerson {
  id: number;
  slug: string;
  name_en: string;
  name_es: string;
  display_title_es: string;
  archetype: string;
  category: string;
  gender: 'M' | 'F';
  verse_count: number;
  bio_es: string;
  testament: 'OT' | 'NT' | 'BOTH';
  min_year?: number | null;
  max_year?: number | null;
}

export interface BiblicalPlace {
  id: number;
  slug: string;
  name_es: string;
  name_en: string;
  hebrew_greek_name?: string | null;
  category: string;
  latitude: number;
  longitude: number;
  modern_location: string;
  spiritual_meaning: string;
  description_es: string;
  key_events: string;
  testament: 'OT' | 'NT' | 'BOTH';
  verse_count: number;
}

export interface TimelinePeriod {
  id: number;
  order_index: number;
  title_es: string;
  years_label: string;
  theme: string;
  description_es: string;
  color_hex: string;
  testament: 'OT' | 'NT';
}

export interface TimelineEvent {
  id: number;
  period_id: number;
  order_index: number;
  title_es: string;
  approx_year: string;
  summary_es: string;
  spiritual_lesson: string;
  book_id: number;
  chapter: number;
  verse: number;
  key_people_names?: string | null;
  book_name?: string;
}

export interface DailyDiscovery {
  id: number;
  category: string;
  title: string;
  original_word?: string | null;
  pronunciation?: string | null;
  insight: string;
  practical_application: string;
  book_id: number;
  chapter: number;
  verse: number;
  verse_snippet: string;
  book_name?: string;
}


