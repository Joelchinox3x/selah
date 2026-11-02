import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { ChapterSelectorModal } from '@/src/features/reader/components/ChapterSelectorModal';
import { getBooks } from '@/src/services/db/bibleDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { Book } from '@/src/types/bible';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';
import {
  getBookMeta,
  BibleCategory,
} from '@/src/features/bible/data/bibleBooksMeta';

type FilterScope =
  | 'ALL'
  | 'OT'
  | 'NT'
  | BibleCategory;

interface FilterOption {
  key: FilterScope;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'OT', label: 'Antiguo Testamento' },
  { key: 'NT', label: 'Nuevo Testamento' },
  { key: 'Pentateuco', label: 'Pentateuco' },
  { key: 'Históricos', label: 'Históricos' },
  { key: 'Poéticos', label: 'Poéticos' },
  { key: 'Profetas Mayores', label: 'Profetas Mayores' },
  { key: 'Profetas Menores', label: 'Profetas Menores' },
  { key: 'Evangelios', label: 'Evangelios' },
  { key: 'Epístolas Paulinas', label: 'Epístolas Paulinas' },
  { key: 'Epístolas Generales', label: 'Epístolas Generales' },
  { key: 'Profecía', label: 'Profecía' },
];

export default function BibleScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const isDark = themeMode === 'oled';

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

  const countForScope = (scope: FilterScope) => {
    if (scope === 'ALL') return books.length;
    if (scope === 'OT') return books.filter((b) => b.testament === 'OT').length;
    if (scope === 'NT') return books.filter((b) => b.testament === 'NT').length;
    return books.filter((b) => getBookMeta(b.id)?.category === scope).length;
  };

  const filteredBooks = useMemo(() => {
    let result = books;
    if (filterScope === 'OT') {
      result = result.filter((b) => b.testament === 'OT');
    } else if (filterScope === 'NT') {
      result = result.filter((b) => b.testament === 'NT');
    } else if (filterScope !== 'ALL') {
      result = result.filter((b) => getBookMeta(b.id)?.category === filterScope);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => {
        const meta = getBookMeta(b.id);
        return (
          b.name.toLowerCase().includes(q) ||
          b.abbreviation.toLowerCase().includes(q) ||
          Boolean(meta?.subtitle.toLowerCase().includes(q)) ||
          Boolean(meta?.category.toLowerCase().includes(q))
        );
      });
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

  const renderBookItem = ({ item }: { item: Book }) => {
    const meta = getBookMeta(item.id);
    const orderNumber = meta?.orderNumber || String(item.id).padStart(2, '0');
    const categoryInfo = meta
      ? `${meta.category} · ${meta.subtitle}`
      : item.testament === 'OT'
      ? 'Antiguo Testamento'
      : 'Nuevo Testamento';

    return (
      <TouchableOpacity
        style={[
          styles.bookCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderSubtle,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => handleBookPress(item)}
      >
        <View style={styles.bookLeft}>
          {/* Order Badge (01, 02, 23...) */}
          <View
            style={[
              styles.orderBadge,
              {
                backgroundColor:
                  isDark ? 'rgba(255,255,255,0.06)' : '#EFF6FF',
              },
            ]}
          >
            <Text
              style={[
                styles.orderBadgeText,
                {
                  color: isDark ? theme.accent : '#2563EB',
                },
              ]}
            >
              {orderNumber}
            </Text>
          </View>

          {/* Book Name & Canonical Theme Subtitle */}
          <View style={styles.bookDetails}>
            <Text style={[styles.bookTitle, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text
              style={[styles.bookSubtitle, { color: theme.textMuted }]}
              numberOfLines={1}
            >
              {categoryInfo}
            </Text>
          </View>
        </View>

        {/* Chapters Count (50 cap, 40 cap, 66 cap) */}
        <Text style={[styles.chaptersCountText, { color: theme.textMuted }]}>
          {item.chapters_count} cap
        </Text>
      </TouchableOpacity>
    );
  };

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
            placeholder="Buscar libro (ej. Salmos, Juan, Isaías)..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Horizontally scrollable Category Pills */}
        <View style={styles.scopeWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scopeScrollContent}
          >
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = filterScope === opt.key;
              const count = countForScope(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
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
                    setFilterScope(opt.key);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.scopePillText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textMuted,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
          visible={Boolean(selectedBookForChapters)}
          bookId={selectedBookForChapters.id}
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
    paddingBottom: 6,
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
  scopeWrapper: {
    marginTop: 10,
  },
  scopeScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  scopePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  scopePillText: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  bookLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  orderBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bookSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  chaptersCountText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
