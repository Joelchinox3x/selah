import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
} from 'react-native';
import { X, BookOpen } from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticSelection, hapticLight } from '@/src/services/haptics/hapticFeedback';
import { BIBLE_BOOKS_META } from '@/src/features/bible/data/bibleBooksMeta';
import { getChaptersWithUserData } from '@/src/services/db/userDb';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChapterSelectorModalProps {
  visible: boolean;
  bookId?: number;
  bookName: string;
  totalChapters: number;
  currentChapter?: number;
  onClose: () => void;
  onSelectChapter: (chapter: number) => void;
}

const PAGE_SIZE = 25;
const COLUMNS = 5;
const CELL_GAP = 8;

export const ChapterSelectorModal: React.FC<ChapterSelectorModalProps> = ({
  visible,
  bookId,
  bookName,
  totalChapters,
  currentChapter = 1,
  onClose,
  onSelectChapter,
}) => {
  const insets = useSafeAreaInsets();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const isDark = themeMode === 'oled';

  // Metadata enrichment
  const meta = useMemo(() => {
    if (bookId && BIBLE_BOOKS_META[bookId]) {
      return BIBLE_BOOKS_META[bookId];
    }
    const cleanName = bookName.trim().toLowerCase();
    return Object.values(BIBLE_BOOKS_META).find(
      (b) => b.name.toLowerCase() === cleanName
    );
  }, [bookId, bookName]);

  const abbreviation = meta?.abbreviation || bookName.slice(0, 3);
  const summary = meta?.summary || 'Lectura de la Palabra de Dios para edificación y paz espiritual.';

  // Pagination ranges of 25
  const pageCount = Math.max(1, Math.ceil(totalChapters / PAGE_SIZE));
  const pages = useMemo(() => {
    const list = [];
    for (let p = 0; p < pageCount; p++) {
      const start = p * PAGE_SIZE + 1;
      const end = Math.min((p + 1) * PAGE_SIZE, totalChapters);
      list.push({ page: p, label: `${start} - ${end}`, start, end });
    }
    return list;
  }, [totalChapters, pageCount]);

  const initialPage = useMemo(() => {
    if (!currentChapter || currentChapter < 1) return 0;
    return Math.min(pageCount - 1, Math.floor((currentChapter - 1) / PAGE_SIZE));
  }, [currentChapter, pageCount]);

  const [selectedPageIndex, setSelectedPageIndex] = useState(initialPage);
  const [containerWidth, setContainerWidth] = useState(0);
  const [userChapters, setUserChapters] = useState<Set<number>>(new Set());

  // Reset page whenever modal opens or current chapter changes
  useEffect(() => {
    if (visible) {
      setSelectedPageIndex(initialPage);
      const targetId = bookId || meta?.id;
      if (targetId) {
        getChaptersWithUserData(targetId)
          .then((chaps) => setUserChapters(new Set(chaps)))
          .catch(() => setUserChapters(new Set()));
      }
    }
  }, [visible, initialPage, bookId, meta?.id]);

  const currentRange = pages[selectedPageIndex] || pages[0] || { start: 1, end: totalChapters };

  const visibleChapters = useMemo(() => {
    const list: number[] = [];
    for (let ch = currentRange.start; ch <= currentRange.end; ch++) {
      list.push(ch);
    }
    return list;
  }, [currentRange]);

  const onLayoutGrid = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  };

  const cellWidth = containerWidth > 0
    ? Math.floor((containerWidth - CELL_GAP * (COLUMNS - 1)) / COLUMNS)
    : undefined;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  paddingBottom: Math.max(insets.bottom, 16) + 12,
                },
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
                <View style={styles.headerTopRow}>
                  <View style={styles.titleWithChip}>
                    <Text style={[styles.title, { color: theme.text }]}>
                      {bookName}
                    </Text>
                    <View
                      style={[
                        styles.abbrChip,
                        {
                          backgroundColor:
                            isDark ? 'rgba(255,255,255,0.08)' : 'rgba(59, 130, 246, 0.1)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.abbrChipText,
                          {
                            color: isDark ? theme.accent : '#2563EB',
                          },
                        ]}
                      >
                        {abbreviation}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.headerRight}>
                    <View
                      style={[
                        styles.countBadge,
                        {
                          backgroundColor:
                            isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.05)',
                        },
                      ]}
                    >
                      <BookOpen size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.countBadgeText, { color: theme.textMuted }]}>
                        {totalChapters}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={onClose}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.closeBtn}
                    >
                      <X size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Subtitle / Book description */}
                <Text style={[styles.summaryText, { color: theme.textMuted }]}>
                  {summary}
                </Text>
              </View>

              {/* Range Selector Pills (1-25, 26-50, etc.) */}
              {pageCount > 1 && (
                <View style={styles.rangeSelectorWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.rangeScrollContent}
                  >
                    {pages.map((p) => {
                      const isActive = p.page === selectedPageIndex;
                      return (
                        <TouchableOpacity
                          key={p.page}
                          style={[
                            styles.rangePill,
                            {
                              backgroundColor: isActive
                                ? theme.accent
                                : isDark
                                ? 'rgba(255,255,255,0.06)'
                                : '#F1F5F9',
                              borderColor: isActive
                                ? theme.accent
                                : theme.borderSubtle,
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => {
                            hapticLight();
                            setSelectedPageIndex(p.page);
                          }}
                        >
                          <Text
                            style={[
                              styles.rangePillText,
                              {
                                color: isActive
                                  ? '#FFFFFF'
                                  : theme.textMuted,
                                fontWeight: isActive ? '700' : '600',
                              },
                            ]}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* 5x5 Chapters Grid */}
              <View
                style={styles.gridContainer}
                onLayout={onLayoutGrid}
              >
                <View style={styles.gridWrap}>
                  {visibleChapters.map((ch) => {
                    const isCurrent = ch === currentChapter;
                    const hasUserArtifact = userChapters.has(ch);

                    return (
                      <TouchableOpacity
                        key={ch}
                        style={[
                          styles.chapterCell,
                          {
                            width: cellWidth || '18%',
                            height: cellWidth || 54,
                            backgroundColor: isCurrent
                              ? theme.accent
                              : isDark
                              ? 'rgba(255,255,255,0.06)'
                              : '#F1F5F9',
                            borderColor: isCurrent
                              ? theme.accent
                              : 'transparent',
                          },
                        ]}
                        activeOpacity={0.65}
                        onPress={() => {
                          hapticSelection();
                          onSelectChapter(ch);
                          onClose();
                        }}
                      >
                        <Text
                          style={[
                            styles.chapterNumberText,
                            {
                              color: isCurrent ? '#FFFFFF' : theme.text,
                              fontWeight: isCurrent ? '700' : '600',
                            },
                          ]}
                        >
                          {ch}
                        </Text>

                        {/* Dot indicator for notes/bookmarks */}
                        {hasUserArtifact && (
                          <View
                            style={[
                              styles.userArtifactDot,
                              {
                                backgroundColor: isCurrent ? '#FBBF24' : '#D97706',
                              },
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Footer with Legend & Page count */}
              <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
                    <Text style={[styles.legendLabel, { color: theme.textMuted }]}>
                      Nota o Tesoro
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
                    <Text style={[styles.legendLabel, { color: theme.textMuted }]}>
                      Capítulo activo
                    </Text>
                  </View>
                </View>

                {pageCount > 1 && (
                  <Text style={[styles.pageIndicatorText, { color: theme.textMuted }]}>
                    {selectedPageIndex + 1} de {pageCount} páginas
                  </Text>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  abbrChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  abbrChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  rangeSelectorWrapper: {
    marginTop: 12,
    marginBottom: 4,
  },
  rangeScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  rangePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  rangePillText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  gridContainer: {
    marginTop: 14,
    marginBottom: 10,
    minHeight: 220,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
    justifyContent: 'flex-start',
  },
  chapterCell: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  chapterNumberText: {
    fontSize: 16,
    textAlign: 'center',
  },
  userArtifactDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  pageIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
