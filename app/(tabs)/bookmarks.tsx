import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  Highlighter,
  FileEdit,
  ChevronRight,
  Inbox,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/ui/AppHeader';
import {
  getAllBookmarks,
  getAllHighlights,
  getAllNotes,
} from '@/src/services/db/userDb';
import { getVerseById } from '@/src/services/db/bibleDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes, highlightColors, HighlightColor } from '@/src/theme/colors';
import { Bookmark as BookmarkType, Highlight, Note } from '@/src/types/bible';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';

type TabMode = 'bookmarks' | 'highlights' | 'notes';

interface EnrichedItem {
  id: number;
  bookId: number;
  chapter: number;
  verse: number;
  bookName: string;
  verseText: string;
  color?: HighlightColor;
  noteContent?: string;
  createdAt: string;
}

export default function BookmarksScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [activeTab, setActiveTab] = useState<TabMode>('bookmarks');
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'bookmarks') {
        const raw = await getAllBookmarks();
        const enriched: EnrichedItem[] = await Promise.all(
          raw.map(async (b) => {
            const v = await getVerseById(b.id); // Or query by book_id & chapter & verse
            return {
              id: b.id,
              bookId: b.book_id,
              chapter: b.chapter,
              verse: b.verse,
              bookName: v?.book_name || 'Biblia',
              verseText: v?.text || '',
              createdAt: b.created_at,
            };
          })
        );
        setItems(enriched);
      } else if (activeTab === 'highlights') {
        const raw = await getAllHighlights();
        const enriched: EnrichedItem[] = await Promise.all(
          raw.map(async (h) => {
            const v = await getVerseById(h.id);
            return {
              id: h.id,
              bookId: h.book_id,
              chapter: h.chapter,
              verse: h.verse,
              bookName: v?.book_name || 'Biblia',
              verseText: v?.text || '',
              color: h.color as HighlightColor,
              createdAt: h.created_at,
            };
          })
        );
        setItems(enriched);
      } else if (activeTab === 'notes') {
        const raw = await getAllNotes();
        const enriched: EnrichedItem[] = await Promise.all(
          raw.map(async (n) => {
            const v = await getVerseById(n.id);
            return {
              id: n.id,
              bookId: n.book_id,
              chapter: n.chapter,
              verse: n.verse,
              bookName: v?.book_name || 'Biblia',
              verseText: v?.text || '',
              noteContent: n.content,
              createdAt: n.updated_at,
            };
          })
        );
        setItems(enriched);
      }
    } catch (e) {
      console.warn('Error loading treasures:', e);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNavigate = (item: EnrichedItem) => {
    hapticSelection();
    router.push({
      pathname: `/reader/${item.bookId}/${item.chapter}`,
      params: { highlightVerse: String(item.verse) },
    } as any);
  };

  const renderItem = ({ item }: { item: EnrichedItem }) => {
    const highlight = item.color ? highlightColors[item.color] : null;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderSubtle,
          },
          highlight && { borderLeftColor: highlight.dot, borderLeftWidth: 4 },
        ]}
        activeOpacity={0.7}
        onPress={() => handleNavigate(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.reference, { color: theme.accent }]}>
            {item.bookName} {item.chapter}:{item.verse}
          </Text>
          {item.color && (
            <View
              style={[
                styles.colorTag,
                { backgroundColor: highlight?.background, borderColor: highlight?.border },
              ]}
            >
              <Text style={[styles.colorTagText, { color: highlight?.dot }]}>
                {highlight?.name}
              </Text>
            </View>
          )}
        </View>

        {item.verseText ? (
          <Text
            style={[styles.verseText, { color: theme.text }]}
            numberOfLines={2}
          >
            «{item.verseText}»
          </Text>
        ) : null}

        {item.noteContent ? (
          <View
            style={[
              styles.noteSnippet,
              {
                backgroundColor: theme.surfaceRaised,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text
              style={[styles.noteText, { color: theme.textMuted }]}
              numberOfLines={3}
            >
              📝 {item.noteContent}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <ChevronRight size={16} color={theme.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Top Header with official logo & brand */}
      <AppHeader variant="main" />

      {/* Title Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <Text style={[styles.title, { color: theme.text }]}>Tesoros Guardados</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Tus versículos favoritos, notas y pasajes destacados
        </Text>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'bookmarks' && {
              backgroundColor: theme.accent,
            },
            activeTab !== 'bookmarks' && {
              backgroundColor: theme.surfaceRaised,
            },
          ]}
          onPress={() => {
            hapticLight();
            setActiveTab('bookmarks');
          }}
        >
          <Bookmark
            size={15}
            color={activeTab === 'bookmarks' ? '#ffffff' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'bookmarks' ? '#ffffff' : theme.textMuted,
                fontWeight: activeTab === 'bookmarks' ? '700' : '500',
              },
            ]}
          >
            Favoritos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'highlights' && {
              backgroundColor: theme.accent,
            },
            activeTab !== 'highlights' && {
              backgroundColor: theme.surfaceRaised,
            },
          ]}
          onPress={() => {
            hapticLight();
            setActiveTab('highlights');
          }}
        >
          <Highlighter
            size={15}
            color={activeTab === 'highlights' ? '#ffffff' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'highlights' ? '#ffffff' : theme.textMuted,
                fontWeight: activeTab === 'highlights' ? '700' : '500',
              },
            ]}
          >
            Resaltados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'notes' && {
              backgroundColor: theme.accent,
            },
            activeTab !== 'notes' && {
              backgroundColor: theme.surfaceRaised,
            },
          ]}
          onPress={() => {
            hapticLight();
            setActiveTab('notes');
          }}
        >
          <FileEdit
            size={15}
            color={activeTab === 'notes' ? '#ffffff' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'notes' ? '#ffffff' : theme.textMuted,
                fontWeight: activeTab === 'notes' ? '700' : '500',
              },
            ]}
          >
            Notas
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Inbox size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Aún no tienes elementos aquí
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Mientras lees, selecciona cualquier versículo para guardarlo o tomar notas.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reference: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  colorTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  verseText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  noteSnippet: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
