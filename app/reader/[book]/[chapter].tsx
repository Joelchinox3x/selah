import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  ViewToken,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  User,
  Headphones,
  Type,
  Sparkles,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { VerseItem } from '@/src/features/reader/components/VerseItem';
import { MultiVerseActionBar } from '@/src/features/reader/components/MultiVerseActionBar';
import { NoteEditorModal } from '@/src/features/reader/components/NoteEditorModal';
import { ChapterSelectorModal } from '@/src/features/reader/components/ChapterSelectorModal';
import { ShareCardModal } from '@/src/features/share/components/ShareCardModal';
import { PersonTooltipModal } from '@/src/features/reader/components/PersonTooltipModal';
import {
  getChapterVerses,
  getBookById,
  getBooks,
  getPeopleForChapter,
} from '@/src/services/db/bibleDb';
import {
  getChapterUserData,
  setHighlight,
  removeHighlight,
  toggleBookmark,
  saveNote,
  deleteNote,
  recordReadingProgress,
  ChapterUserData,
} from '@/src/services/db/userDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes, HighlightColor } from '@/src/theme/colors';
import { Book, Verse, VerseWithUserData, BiblicalPerson } from '@/src/types/bible';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';
import { ReaderSettingsPanel } from '@/src/features/reader/components/ReaderSettingsPanel';
import { getBookCategory } from '@/src/features/bible/data/bibleBooksMeta';


export default function ChapterReaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    book: string;
    chapter: string;
    highlightVerse?: string;
  }>();

  const [bookId, setBookId] = useState<number>(() =>
    parseInt(params.book || '19', 10)
  );
  const [chapterNumber, setChapterNumber] = useState<number>(() =>
    parseInt(params.chapter || '23', 10)
  );
  const rawHighlightParam = typeof params.highlightVerse === 'string'
    ? params.highlightVerse.trim()
    : Array.isArray(params.highlightVerse)
    ? String(params.highlightVerse[0]).trim()
    : '';

  const targetHighlightVerses = useMemo<number[]>(() => {
    if (!rawHighlightParam) return [];
    if (rawHighlightParam.includes('-')) {
      const parts = rawHighlightParam.split('-').map((s) => parseInt(s.trim(), 10));
      if (!isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] >= parts[0]) {
        const list: number[] = [];
        for (let i = parts[0]; i <= parts[1]; i++) {
          list.push(i);
        }
        return list;
      }
    }
    if (rawHighlightParam.includes(',')) {
      return rawHighlightParam
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    }
    const single = parseInt(rawHighlightParam, 10);
    return isNaN(single) ? [] : [single];
  }, [rawHighlightParam]);

  // Sync state if navigation params change externally
  useEffect(() => {
    if (params.book) {
      const pBook = parseInt(params.book, 10);
      if (pBook !== bookId) setBookId(pBook);
    }
    if (params.chapter) {
      const pCh = parseInt(params.chapter, 10);
      if (pCh !== chapterNumber) setChapterNumber(pCh);
    }
  }, [params.book, params.chapter]);

  const themeMode = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const theme = themes[themeMode] || themes.sepia;

  const [book, setBook] = useState<Book | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [userData, setUserData] = useState<ChapterUserData>({
    bookmarks: {},
    highlights: {},
    notes: {},
  });
  const [initialLoading, setInitialLoading] = useState(true);

  // Smart Reader Contextual Biblical Characters
  const [chapterPeople, setChapterPeople] = useState<Record<number, BiblicalPerson[]>>({});
  const [selectedPersonForTooltip, setSelectedPersonForTooltip] = useState<BiblicalPerson | null>(null);
  const [personTooltipVisible, setPersonTooltipVisible] = useState(false);

  // Settings Panel & Audio State
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [lineSpacing, setLineSpacing] = useState<number>(1.75);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Selection state
  const [selectedVerseNumbers, setSelectedVerseNumbers] = useState<number[]>([]);

  // Modals state
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteVerseTarget, setNoteVerseTarget] = useState<VerseWithUserData | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const flatListRef = useRef<FlatList<VerseWithUserData>>(null);
  const lastPressRef = useRef<number>(0);

  const currentLocationRef = useRef({ bookId, chapterNumber });
  useEffect(() => {
    currentLocationRef.current = { bookId, chapterNumber };
  }, [bookId, chapterNumber]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      const topVerse = viewableItems.find((v) => (v.item as VerseWithUserData)?.verse);
      if (topVerse && (topVerse.item as VerseWithUserData)?.verse) {
        const vNum = (topVerse.item as VerseWithUserData).verse;
        const { bookId: curB, chapterNumber: curCh } = currentLocationRef.current;
        recordReadingProgress(curB, curCh, vNum, false).catch(() => {});
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 35,
    minimumViewTime: 1000,
  }).current;

  // Load chapter data without tearing down screen or causing cyclic re-renders
  const loadChapter = useCallback(async (bId: number, chNum: number) => {
    try {
      const [bookData, versesData, uData, booksList, peopleMapping] = await Promise.all([
        getBookById(bId),
        getChapterVerses(bId, chNum),
        getChapterUserData(bId, chNum),
        getBooks(),
        getPeopleForChapter(bId, chNum),
      ]);

      setBook(bookData);
      setVerses(versesData);
      setUserData(uData);
      setAllBooks(booksList);
      setChapterPeople(peopleMapping);

      recordReadingProgress(bId, chNum).catch(() => {});
    } catch (e) {
      console.warn('Error loading chapter:', e);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedVerseNumbers([]);
    setInitialLoading(true);
    loadChapter(bookId, chapterNumber).then(() => {
      if (targetHighlightVerses.length > 0) {
        setSelectedVerseNumbers(targetHighlightVerses);

        // Smoothly scroll to the first verse in the target range
        const firstVerseNum = targetHighlightVerses[0];
        recordReadingProgress(bookId, chapterNumber, firstVerseNum, false).catch(() => {});
        setTimeout(() => {
          setVerses((currentVerses) => {
            const targetIndex = currentVerses.findIndex((v) => v.verse === firstVerseNum);
            if (targetIndex >= 0 && flatListRef.current) {
              try {
                flatListRef.current.scrollToIndex({
                  index: targetIndex,
                  viewPosition: 0.12,
                  animated: true,
                });
              } catch (err) {
                // Handled gracefully by onScrollToIndexFailed
              }
            }
            return currentVerses;
          });
        }, 300);
      }
    });
  }, [bookId, chapterNumber, rawHighlightParam, loadChapter]);

  // Combine raw verses with user data
  const enrichedVerses: VerseWithUserData[] = useMemo(() => {
    return verses.map((v) => {
      const bm = userData.bookmarks[v.verse];
      const hl = userData.highlights[v.verse];
      const nt = userData.notes[v.verse];

      return {
        ...v,
        isBookmarked: !!bm,
        bookmarkTag: bm?.tag,
        highlightColor: hl?.color || null,
        hasNote: !!nt,
        noteContent: nt?.content || null,
      };
    });
  }, [verses, userData]);

  const handleVersePress = (verse: VerseWithUserData) => {
    const now = Date.now();
    // Guard against rapid synthetic double-taps on touch screens
    if (now - lastPressRef.current < 200) {
      return;
    }
    lastPressRef.current = now;

    hapticSelection();
    recordReadingProgress(bookId, chapterNumber, verse.verse, false).catch(() => {});
    setSelectedVerseNumbers((prev) => {
      if (prev.includes(verse.verse)) {
        return prev.filter((num) => num !== verse.verse);
      } else {
        return [...prev, verse.verse];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedVerseNumbers([]);
  };

  const handleApplyHighlight = async (color: HighlightColor) => {
    const targets = [...selectedVerseNumbers];
    for (const vNum of targets) {
      await setHighlight(bookId, chapterNumber, vNum, color);
    }
    const freshUserData = await getChapterUserData(bookId, chapterNumber);
    setUserData(freshUserData);
    handleClearSelection();
  };

  const handleRemoveHighlight = async () => {
    const targets = [...selectedVerseNumbers];
    for (const vNum of targets) {
      await removeHighlight(bookId, chapterNumber, vNum);
    }
    const freshUserData = await getChapterUserData(bookId, chapterNumber);
    setUserData(freshUserData);
    handleClearSelection();
  };

  const handleToggleBookmark = async () => {
    for (const vNum of selectedVerseNumbers) {
      await toggleBookmark(bookId, chapterNumber, vNum);
    }
    const freshUserData = await getChapterUserData(bookId, chapterNumber);
    setUserData(freshUserData);
    handleClearSelection();
  };

  const handleOpenNote = (verse?: VerseWithUserData) => {
    const target =
      verse ||
      enrichedVerses.find((v) => v.verse === selectedVerseNumbers[0]) ||
      null;
    if (target) {
      setNoteVerseTarget(target);
      setNoteModalVisible(true);
    }
  };

  const handleSaveNote = async (verseNum: number, content: string) => {
    await saveNote(bookId, chapterNumber, verseNum, content);
    const freshUserData = await getChapterUserData(bookId, chapterNumber);
    setUserData(freshUserData);
    handleClearSelection();
  };

  const handleDeleteNote = async (verseNum: number) => {
    await deleteNote(bookId, chapterNumber, verseNum);
    const freshUserData = await getChapterUserData(bookId, chapterNumber);
    setUserData(freshUserData);
  };

  const handlePersonPress = (person: BiblicalPerson) => {
    hapticLight();
    setSelectedPersonForTooltip(person);
    setPersonTooltipVisible(true);
  };

  const navigateToChapter = (nextBookId: number, nextCh: number) => {
    hapticLight();
    setBookId(nextBookId);
    setChapterNumber(nextCh);
    setSelectedVerseNumbers([]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    router.setParams({ book: String(nextBookId), chapter: String(nextCh) });
  };

  const handlePrevChapter = () => {
    if (!book) return;
    if (chapterNumber > 1) {
      navigateToChapter(bookId, chapterNumber - 1);
    } else {
      const prevBookIndex = allBooks.findIndex((b) => b.id === bookId) - 1;
      if (prevBookIndex >= 0) {
        const prevBook = allBooks[prevBookIndex];
        navigateToChapter(prevBook.id, prevBook.chapters_count);
      }
    }
  };

  const handleNextChapter = () => {
    if (!book) return;
    // Mark current chapter as completed since reader reached the end
    recordReadingProgress(bookId, chapterNumber, verses.length || 1, true).catch(() => {});

    if (chapterNumber < book.chapters_count) {
      navigateToChapter(bookId, chapterNumber + 1);
    } else {
      const nextBookIndex = allBooks.findIndex((b) => b.id === bookId) + 1;
      if (nextBookIndex < allBooks.length) {
        const nextBook = allBooks[nextBookIndex];
        navigateToChapter(nextBook.id, 1);
      }
    }
  };

  const selectedVersesList = useMemo(() => {
    return enrichedVerses.filter((v) => selectedVerseNumbers.includes(v.verse));
  }, [enrichedVerses, selectedVerseNumbers]);

  const shareText = selectedVersesList.map((v) => v.text).join(' ');
  const shareRefText = `${book?.name || 'Biblia'} ${chapterNumber}:${
    selectedVerseNumbers.sort((a, b) => a - b).join(', ')
  }`;

  return (
    <Screen safeTop safeBottom={false}>
      {/* 1. Header Bar (Photo 3) */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceRaised }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.headerLogoImage}
              resizeMode="cover"
            />
            <Text style={[styles.headerBrandText, { color: theme.text }]}>SELAH</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceRaised }]}
            onPress={() => router.push('/search' as any)}
            activeOpacity={0.7}
          >
            <Search size={18} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceRaised }]}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.7}
          >
            <User size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sub-Header: Book Selector Pill + [TT] + [🎧] (Photo 3) */}
      <View style={[styles.subHeader, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.bookPickerPill, { backgroundColor: theme.surfaceRaised }]}
          onPress={() => {
            hapticLight();
            setChapterModalVisible(true);
          }}
          activeOpacity={0.75}
        >
          <Text style={styles.bookIcon}>📖</Text>
          <View>
            <View style={styles.bookNameRow}>
              <Text style={[styles.bookNameText, { color: theme.text }]}>
                {book?.name} {chapterNumber}
              </Text>
              <ChevronDown size={14} color={theme.text} />
            </View>
            <Text style={[styles.translationSub, { color: theme.textMuted }]}>
              RVR1909 · Offline
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.toolPillsRight}>
          {/* [TT] Button */}
          <TouchableOpacity
            style={[
              styles.toolPillBtn,
              {
                backgroundColor: showSettingsPanel ? theme.accent : theme.surfaceRaised,
              },
            ]}
            onPress={() => {
              hapticLight();
              setShowSettingsPanel((prev) => !prev);
            }}
            activeOpacity={0.75}
          >
            <Type
              size={18}
              color={showSettingsPanel ? '#FFFFFF' : theme.text}
            />
          </TouchableOpacity>

          {/* [🎧] Audio Button */}
          <TouchableOpacity
            style={[
              styles.toolPillBtn,
              {
                backgroundColor: isPlayingAudio ? theme.accent : theme.surfaceRaised,
              },
            ]}
            onPress={() => {
              hapticLight();
              setIsPlayingAudio((prev) => !prev);
            }}
            activeOpacity={0.75}
          >
            <Headphones
              size={18}
              color={isPlayingAudio ? '#FFFFFF' : theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Collapsible Inline Settings Panel */}
      {showSettingsPanel && (
        <ReaderSettingsPanel
          theme={theme}
          themeMode={themeMode}
          fontSize={fontSize}
          lineSpacing={lineSpacing}
          onThemeChange={setTheme}
          onFontSizeChange={setFontSize}
          onLineSpacingChange={setLineSpacing}
        />
      )}

      {/* 4. Main Verses FlatList Content */}
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={enrichedVerses}
          extraData={selectedVerseNumbers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <VerseItem
              verse={item}
              isSelected={selectedVerseNumbers.includes(item.verse)}
              onPress={handleVersePress}
              onNotePress={handleOpenNote}
              people={chapterPeople[item.verse]}
              onPersonPress={handlePersonPress}
              lineHeightMultiplier={lineSpacing}
            />
          )}
          initialNumToRender={25}
          maxToRenderPerBatch={20}
          windowSize={7}
          removeClippedSubviews={true}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              try {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  viewPosition: 0.12,
                  animated: true,
                });
              } catch (err) {
                flatListRef.current?.scrollToOffset({
                  offset: info.averageItemLength * info.index,
                  animated: true,
                });
              }
            }, 200);
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.editorialHeader}>
              {/* Dynamic Biblical Category Badge */}
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                ]}
              >
                <Sparkles size={11} color={theme.accent} />
                <Text style={[styles.categoryBadgeText, { color: theme.accent }]}>
                  {getBookCategory(bookId)}
                </Text>
              </View>

              {/* Main Book & Chapter Title */}
              <Text style={[styles.editorialMainTitle, { color: theme.text }]}>
                {book?.name} {chapterNumber}
              </Text>

              {/* Serene Contextual Subtitle */}
              <Text style={[styles.editorialSubtitle, { color: theme.textMuted }]}>
                {bookId === 19
                  ? chapterNumber === 23
                    ? '«El Señor es mi Pastor · Cántico de reposo y providencia»'
                    : `Salmo de David · Capítulo ${chapterNumber} de ${book?.chapters_count || 150}`
                  : `Reina-Valera 1909 · Capítulo ${chapterNumber} de ${book?.chapters_count || 1}`}
              </Text>

              <View
                style={[styles.editorialDivider, { backgroundColor: theme.borderSubtle }]}
              />
            </View>
          }
          ListFooterComponent={
            <View style={styles.chapterEndFooter}>
              <View style={styles.selahEmblemRow}>
                <Sparkles size={14} color={theme.accent} />
                <Text style={[styles.selahEmblemText, { color: theme.accent }]}>
                  SELAH
                </Text>
                <Sparkles size={14} color={theme.accent} />
              </View>
              <Text style={[styles.selahPoeticPhrase, { color: theme.textMuted }]}>
                Detente un instante y respira. La Palabra reposa en tu espíritu.
              </Text>

              <View style={[styles.endDivider, { backgroundColor: theme.borderSubtle }]} />

              <View style={styles.footerNavRow}>
                <TouchableOpacity
                  style={[
                    styles.navArrowPill,
                    {
                      backgroundColor: theme.surfaceRaised,
                      opacity: bookId === 1 && chapterNumber === 1 ? 0.35 : 1,
                    },
                  ]}
                  onPress={handlePrevChapter}
                  disabled={bookId === 1 && chapterNumber === 1}
                  activeOpacity={0.8}
                >
                  <ChevronLeft size={16} color={theme.text} />
                  <Text style={[styles.navArrowText, { color: theme.text }]}>
                    Anterior
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextChapterPill, { backgroundColor: theme.accent }]}
                  onPress={handleNextChapter}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextChapterText}>
                    {chapterNumber < (book?.chapters_count || 0)
                      ? `Siguiente: Cap. ${chapterNumber + 1}`
                      : 'Siguiente Libro'}
                  </Text>
                  <ChevronRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}

      {/* 5. Floating Action Toolbar (Photo 3) */}
      <MultiVerseActionBar
        selectedVerses={selectedVersesList}
        bookName={book?.name || ''}
        chapter={chapterNumber}
        onClearSelection={handleClearSelection}
        onApplyHighlight={handleApplyHighlight}
        onRemoveHighlight={handleRemoveHighlight}
        onToggleBookmark={handleToggleBookmark}
        onOpenNoteModal={() => handleOpenNote()}
        onOpenShareModal={() => setShareModalVisible(true)}
      />

      {/* Chapter Selector Modal */}
      {book && (
        <ChapterSelectorModal
          visible={chapterModalVisible}
          bookId={book.id}
          bookName={book.name}
          totalChapters={book.chapters_count}
          currentChapter={chapterNumber}
          onClose={() => setChapterModalVisible(false)}
          onSelectChapter={(ch) => {
            setChapterModalVisible(false);
            navigateToChapter(bookId, ch);
          }}
        />
      )}

      {/* Note Editor Modal */}
      <NoteEditorModal
        visible={noteModalVisible}
        verse={noteVerseTarget}
        bookName={book?.name || ''}
        chapter={chapterNumber}
        onClose={() => setNoteModalVisible(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      {/* Share Card Modal */}
      <ShareCardModal
        visible={shareModalVisible}
        versesText={shareText}
        referenceText={shareRefText}
        onClose={() => setShareModalVisible(false)}
      />

      {/* Smart Reader Contextual Biblical Person Tooltip */}
      <PersonTooltipModal
        visible={personTooltipVisible}
        person={selectedPersonForTooltip}
        onClose={() => setPersonTooltipVisible(false)}
        onViewProfile={(p) => {
          setPersonTooltipVisible(false);
          router.push(`/characters/${p.id}` as any);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoImage: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
  headerBrandText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  bookPickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bookIcon: {
    fontSize: 18,
  },
  bookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookNameText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  translationSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  toolPillsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolPillBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  editorialHeader: {
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  editorialMainTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 6,
  },
  editorialSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    lineHeight: 18,
  },
  editorialDivider: {
    width: 44,
    height: 2,
    borderRadius: 1,
  },
  chapterEndFooter: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 24,
    gap: 12,
  },
  selahEmblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selahEmblemText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  selahPoeticPhrase: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  endDivider: {
    width: 60,
    height: 1,
    marginVertical: 6,
  },
  footerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8,
    gap: 12,
  },
  navArrowPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
  },
  navArrowText: {
    fontSize: 13,
    fontWeight: '700',
  },
  nextChapterPill: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  nextChapterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
