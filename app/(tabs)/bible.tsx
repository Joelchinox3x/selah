import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { ChapterSelectorModal } from '@/src/features/reader/components/ChapterSelectorModal';
import { getBooks } from '@/src/services/db/bibleDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { Book, Testament } from '@/src/types/bible';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';

type FilterScope = 'ALL' | 'OT' | 'NT';

export default function BibleScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [books, setBooks] = useState<Book[]>([]);
  const [filterScope, setFilterScope] = useState<FilterScope>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected book for chapter picker modal
  const [selectedBookForChapters, setSelectedBookForChapters] = useState<Book | null>(null);

  useEffect(() => {
    async function load() {
      const list = await getBooks();
      setBooks(list);
    }
    load();
  }, []);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (filterScope === 'OT') {
      result = result.filter((b) => b.testament === 'OT');
    } else if (filterScope === 'NT') {
      result = result.filter((b) => b.testament === 'NT');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.abbreviation.toLowerCase().includes(q)
      );
    }

    return result;
  }, [books, filterScope, searchQuery]);

  const handleBookPress = (book: Book) => {
    hapticSelection();
    if (book.chapters_count === 1) {
      // Direct jump for single-chapter books (Judas, Filemón, Abdías, 2 Juan, 3 Juan)
      router.push(`/reader/${book.id}/1` as any);
    } else {
      setSelectedBookForChapters(book);
    }
  };

  const handleSelectChapter = (chapter: number) => {
    if (!selectedBookForChapters) return;
    router.push(`/reader/${selectedBookForChapters.id}/${chapter}` as any);
    setSelectedBookForChapters(null);
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[
        styles.bookItem,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => handleBookPress(item)}
    >
      <View style={styles.bookLeft}>
        <View
          style={[
            styles.bookBadge,
            {
              backgroundColor:
                item.testament === 'OT'
                  ? theme.surfaceRaised
                  : theme.accentMuted,
            },
          ]}
        >
          <Text
            style={[
              styles.bookBadgeText,
              {
                color: item.testament === 'OT' ? theme.textMuted : theme.accent,
              },
            ]}
          >
            {item.abbreviation}
          </Text>
        </View>

        <View>
          <Text style={[styles.bookName, { color: theme.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.bookMeta, { color: theme.textMuted }]}>
            {item.chapters_count}{' '}
            {item.chapters_count === 1 ? 'capítulo' : 'capítulos'} ·{' '}
            {item.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
          </Text>
        </View>
      </View>

      <ChevronRight size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );

  return (
    <Screen safeTop safeBottom={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <Text style={[styles.title, { color: theme.text }]}>Santa Biblia</Text>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: theme.surfaceRaised }]}
          onPress={() => {
            hapticLight();
            router.push('/search' as any);
          }}
          activeOpacity={0.7}
        >
          <Search size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.filterSection}>
        {/* Book search input */}
        <View
          style={[
            styles.searchInputWrapper,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Search size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar libro (ej. Salmos, Juan, Romanos)..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Scope Pill Filters */}
        <View style={styles.scopeRow}>
          {(['ALL', 'OT', 'NT'] as FilterScope[]).map((scope) => {
            const isSelected = filterScope === scope;
            const labels: Record<FilterScope, string> = {
              ALL: `Todos (${books.length})`,
              OT: 'Antiguo Testamento (39)',
              NT: 'Nuevo Testamento (27)',
            };
            return (
              <TouchableOpacity
                key={scope}
                style={[
                  styles.scopePill,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : theme.surfaceRaised,
                    borderColor: isSelected
                      ? theme.accent
                      : theme.borderSubtle,
                  },
                ]}
                onPress={() => {
                  hapticLight();
                  setFilterScope(scope);
                }}
              >
                <Text
                  style={[
                    styles.scopePillText,
                    {
                      color: isSelected ? '#ffffff' : theme.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {labels[scope]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Books List */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(b) => String(b.id)}
        renderItem={renderBookItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Chapter Picker Modal */}
      {selectedBookForChapters && (
        <ChapterSelectorModal
          visible={!!selectedBookForChapters}
          bookName={selectedBookForChapters.name}
          totalChapters={selectedBookForChapters.chapters_count}
          currentChapter={1}
          onClose={() => setSelectedBookForChapters(null)}
          onSelectChapter={handleSelectChapter}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  scopePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  scopePillText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 8,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  bookLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bookBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bookMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
