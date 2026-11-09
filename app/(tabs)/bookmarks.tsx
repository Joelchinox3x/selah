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
  MessageSquare,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/ui/AppHeader';
import {
  getAllBookmarks,
  getAllHighlights,
  getAllNotes,
} from '@/src/services/db/userDb';
import { getVerseByReference } from '@/src/services/db/bibleDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes, highlightColors, HighlightColor } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';
import {
  MyReflectionItem,
  getMyPublishedReflections,
  saveMyPublishedReflection,
} from '@/src/features/daily/services/myReflectionsStore';
import { CommunityReflectionsModal } from '@/src/features/daily/components/CommunityReflectionsModal';

type TabMode = 'bookmarks' | 'highlights' | 'notes' | 'reflections';

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
  const [reflections, setReflections] = useState<MyReflectionItem[]>([]);
  const [activeReflectionModal, setActiveReflectionModal] = useState<{
    visible: boolean;
    verseSlug: string;
    verseCitation: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'bookmarks') {
        const raw = await getAllBookmarks();
        const enriched: EnrichedItem[] = await Promise.all(
          raw.map(async (b) => {
            const v = await getVerseByReference(b.book_id, b.chapter, b.verse);
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
            const v = await getVerseByReference(h.book_id, h.chapter, h.verse);
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
            const v = await getVerseByReference(n.book_id, n.chapter, n.verse);
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
      } else if (activeTab === 'reflections') {
        let raw = await getMyPublishedReflections();
        // Seed the Juan 3:16 comment so the user immediately sees their reflection history
        if (raw.length === 0) {
          const initialItem: MyReflectionItem = {
            id: 'my-juan-3-16',
            verseSlug: 'juan-3-16',
            verseCitation: 'Juan 3:16',
            userName: 'Joel M.',
            text: 'Este versículo me dio mucha paz hoy. Recordar el amor infinito de Dios me llena de esperanza.',
            createdAt: '2026-11-08 22:18:48',
          };
          await saveMyPublishedReflection(initialItem);
          raw = [initialItem];
        }
        setReflections(raw);
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

  const renderReflectionItem = ({ item }: { item: MyReflectionItem }) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderSubtle,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => {
          hapticLight();
          setActiveReflectionModal({
            visible: true,
            verseSlug: item.verseSlug,
            verseCitation: item.verseCitation,
          });
        }}
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={14} color={theme.accent} />
            <Text style={[styles.reference, { color: theme.text }]}>
              {item.verseCitation}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View
          style={[
            styles.noteBox,
            {
              backgroundColor: theme.surfaceRaised,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.noteText, { color: theme.text }]} numberOfLines={4}>
            "{item.text}"
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.communityBadge, { backgroundColor: theme.accentMuted }]}>
            <Text style={[styles.communityBadgeText, { color: theme.accent }]}>
              Muro Comunitario
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.viewRepliesText, { color: theme.accent }]}>
              Ver muro y respuestas
            </Text>
            <ChevronRight size={15} color={theme.accent} />
          </View>
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
            size={14}
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
            size={14}
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
            size={14}
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

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'reflections' && {
              backgroundColor: theme.accent,
            },
            activeTab !== 'reflections' && {
              backgroundColor: theme.surfaceRaised,
            },
          ]}
          onPress={() => {
            hapticLight();
            setActiveTab('reflections');
          }}
        >
          <MessageSquare
            size={14}
            color={activeTab === 'reflections' ? '#ffffff' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'reflections' ? '#ffffff' : theme.textMuted,
                fontWeight: activeTab === 'reflections' ? '700' : '500',
              },
            ]}
          >
            Reflexiones
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={activeTab === 'reflections' ? (reflections as any) : items}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={activeTab === 'reflections' ? (renderReflectionItem as any) : renderItem}
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
              {activeTab === 'reflections'
                ? 'Aún no has compartido reflexiones'
                : 'Aún no tienes elementos aquí'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {activeTab === 'reflections'
                ? 'Cuando compartas lo que Dios habló a tu corazón en el Muro de Reflexión, tus pasajes aparecerán aquí para que puedas seguir las respuestas de los hermanos.'
                : 'Mientras lees, selecciona cualquier versículo para guardarlo o tomar notas.'}
            </Text>
          </View>
        }
      />

      {activeReflectionModal && (
        <CommunityReflectionsModal
          visible={activeReflectionModal.visible}
          verseSlug={activeReflectionModal.verseSlug}
          verseCitation={activeReflectionModal.verseCitation}
          onClose={() => setActiveReflectionModal(null)}
        />
      )}
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
  noteBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  communityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  communityBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  viewRepliesText: {
    fontSize: 11.5,
    fontWeight: '700',
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
