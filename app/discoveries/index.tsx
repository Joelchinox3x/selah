import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Sparkles,
  BookOpen,
  Share2,
  X,
  Compass,
  ArrowRight,
  Flame,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getDailyDiscoveries, getTodayDiscovery } from '@/src/services/db/bibleDb';
import { DailyDiscovery } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSelection, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  'Todos',
  'Raíz Hebrea / Griega',
  'Cultura del Mundo Bíblico',
  'Sabiduría y Descanso',
  'Ciencia y Naturaleza en la Biblia',
  'Tesoros Históricos',
];

export default function DiscoveriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [discoveries, setDiscoveries] = useState<DailyDiscovery[]>([]);
  const [todayDiscovery, setTodayDiscovery] = useState<DailyDiscovery | null>(null);
  const [selectedDiscovery, setSelectedDiscovery] = useState<DailyDiscovery | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allData, todayData] = await Promise.all([
        getDailyDiscoveries(),
        getTodayDiscovery(),
      ]);
      setDiscoveries(allData);
      setTodayDiscovery(todayData);
    } catch (e) {
      console.warn('Error loading discoveries:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDiscoveries = useMemo(() => {
    if (selectedCategory === 'Todos') return discoveries;
    return discoveries.filter((d) => d.category === selectedCategory);
  }, [discoveries, selectedCategory]);

  const handleShare = async (item: DailyDiscovery) => {
    hapticLight();
    try {
      await Share.share({
        title: `${item.title} - Selah`,
        message: `✨ ${item.title}\n\n«${item.original_word || ''}» (${item.pronunciation || ''})\n\n${item.insight}\n\n💡 Aplicación: ${item.practical_application}\n\n📖 ${item.book_name} ${item.chapter}:${item.verse}\n\nDescubre más en la app bíblica Selah.`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleOpenReader = (item: DailyDiscovery) => {
    hapticSuccess();
    if (selectedDiscovery) setSelectedDiscovery(null);
    router.push({
      pathname: `/reader/${item.book_id}/${item.chapter}`,
      params: { highlightVerse: String(item.verse) },
    } as any);
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'Raíz Hebrea / Griega':
        return '📜';
      case 'Cultura del Mundo Bíblico':
        return '🏺';
      case 'Ciencia y Naturaleza en la Biblia':
        return '🌿';
      case 'Tesoros Históricos':
        return '🏛️';
      default:
        return '✨';
    }
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceRaised }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Descubrimiento Diario Selah
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Raíces Hebreas, Curiosidades y Sabiduría
          </Text>
        </View>
        <View style={styles.headerRightSpace} />
      </View>

      {/* Category Pills */}
      <View style={styles.categoryWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => {
                  hapticSelection();
                  setSelectedCategory(item);
                }}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : theme.surfaceRaised,
                    borderColor: isSelected
                      ? theme.accent
                      : theme.borderSubtle,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Discoveries List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Buscando joyas de sabiduría sagrada...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDiscoveries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            todayDiscovery ? (
              <View style={styles.todaySection}>
                <View style={styles.sectionHeaderRow}>
                  <Flame size={16} color={theme.accent} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    TESORO DEL DÍA
                  </Text>
                </View>

                {/* Hero Today Card */}
                <View
                  style={[
                    styles.todayHeroCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <View style={styles.todayCardTop}>
                    <View
                      style={[
                        styles.todayCategoryBadge,
                        { backgroundColor: theme.accentMuted },
                      ]}
                    >
                      <Text style={[styles.todayCatText, { color: theme.accent }]}>
                        {todayDiscovery.category}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleShare(todayDiscovery)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Share2 size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.todayTitle, { color: theme.text }]}>
                    {todayDiscovery.title}
                  </Text>

                  {todayDiscovery.original_word ? (
                    <View
                      style={[
                        styles.originalWordBox,
                        {
                          backgroundColor:
                            themeMode === 'oled'
                              ? '#1e293b'
                              : 'rgba(217, 119, 6, 0.08)',
                        },
                      ]}
                    >
                      <Text style={[styles.originalWordText, { color: theme.accent }]}>
                        {todayDiscovery.original_word}
                      </Text>
                      {todayDiscovery.pronunciation ? (
                        <Text
                          style={[
                            styles.pronunciationText,
                            { color: theme.textMuted },
                          ]}
                        >
                          /{todayDiscovery.pronunciation}/
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <Text style={[styles.todayInsight, { color: theme.text }]}>
                    {todayDiscovery.insight}
                  </Text>

                  {/* Practical Application */}
                  <View
                    style={[
                      styles.appBox,
                      {
                        backgroundColor:
                          themeMode === 'oled'
                            ? '#141d18'
                            : 'rgba(16, 185, 129, 0.08)',
                        borderColor:
                          themeMode === 'oled'
                            ? '#1e3324'
                            : 'rgba(16, 185, 129, 0.22)',
                      },
                    ]}
                  >
                    <Sparkles size={14} color="#10B981" />
                    <Text style={[styles.appText, { color: theme.text }]}>
                      <Text style={{ fontWeight: '700', color: '#10B981' }}>
                        Paz para hoy:{' '}
                      </Text>
                      {todayDiscovery.practical_application}
                    </Text>
                  </View>

                  {/* Verse link */}
                  <TouchableOpacity
                    style={[
                      styles.todayVerseRow,
                      { borderTopColor: theme.borderSubtle },
                    ]}
                    onPress={() => handleOpenReader(todayDiscovery)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.todayVerseInfo}>
                      <BookOpen size={13} color={theme.accent} />
                      <Text
                        style={[styles.todayVerseRef, { color: theme.accent }]}
                      >
                        {todayDiscovery.book_name} {todayDiscovery.chapter}:
                        {todayDiscovery.verse}
                      </Text>
                    </View>
                    <View style={styles.openReaderLink}>
                      <Text style={[styles.openReaderText, { color: theme.accent }]}>
                        Ver en la Biblia
                      </Text>
                      <ArrowRight size={12} color={theme.accent} />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
                  <Compass size={16} color={theme.accent} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    BIBLIOTECA DE SABIDURÍA
                  </Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={() => {
                hapticLight();
                setSelectedDiscovery(item);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.itemCardTop}>
                <View
                  style={[
                    styles.itemBadge,
                    {
                      backgroundColor:
                        themeMode === 'oled'
                          ? '#1e293b'
                          : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <Text style={styles.itemEmoji}>
                    {getCategoryEmoji(item.category)}
                  </Text>
                  <Text style={[styles.itemCatText, { color: theme.textMuted }]}>
                    {item.category}
                  </Text>
                </View>

                {item.original_word ? (
                  <Text style={[styles.itemWordPill, { color: theme.accent }]}>
                    {item.original_word.split(' ')[0]}
                  </Text>
                ) : null}
              </View>

              <Text style={[styles.itemTitle, { color: theme.text }]}>
                {item.title}
              </Text>

              <Text
                style={[styles.itemSnippet, { color: theme.textMuted }]}
                numberOfLines={2}
              >
                {item.insight}
              </Text>

              <View
                style={[
                  styles.itemFooter,
                  { borderTopColor: theme.borderSubtle },
                ]}
              >
                <Text style={[styles.itemRef, { color: theme.textMuted }]}>
                  📖 {item.book_name} {item.chapter}:{item.verse}
                </Text>
                <Text style={[styles.itemMoreText, { color: theme.accent }]}>
                  Leer más →
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Discovery Detail Modal */}
      <Modal
        visible={!!selectedDiscovery}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDiscovery(null)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            {selectedDiscovery && (
              <>
                <View style={styles.modalTopRow}>
                  <View
                    style={[
                      styles.modalCategoryBadge,
                      { backgroundColor: theme.accentMuted },
                    ]}
                  >
                    <Text style={[styles.modalCatText, { color: theme.accent }]}>
                      {selectedDiscovery.category}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedDiscovery(null)}
                    style={[
                      styles.closeBtn,
                      { backgroundColor: theme.surfaceRaised },
                    ]}
                  >
                    <X size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {selectedDiscovery.title}
                </Text>

                {selectedDiscovery.original_word ? (
                  <View
                    style={[
                      styles.modalWordBox,
                      {
                        backgroundColor:
                          themeMode === 'oled'
                            ? '#1e293b'
                            : 'rgba(217, 119, 6, 0.08)',
                      },
                    ]}
                  >
                    <Text style={[styles.modalWordText, { color: theme.accent }]}>
                      {selectedDiscovery.original_word}
                    </Text>
                    {selectedDiscovery.pronunciation ? (
                      <Text
                        style={[
                          styles.modalPronounceText,
                          { color: theme.textMuted },
                        ]}
                      >
                        /{selectedDiscovery.pronunciation}/
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <Text style={[styles.modalInsight, { color: theme.text }]}>
                  {selectedDiscovery.insight}
                </Text>

                <View
                  style={[
                    styles.modalAppBox,
                    {
                      backgroundColor:
                        themeMode === 'oled'
                          ? '#141d18'
                          : 'rgba(16, 185, 129, 0.08)',
                      borderColor:
                        themeMode === 'oled'
                          ? '#1e3324'
                          : 'rgba(16, 185, 129, 0.22)',
                    },
                  ]}
                >
                  <Sparkles size={14} color="#10B981" />
                  <Text style={[styles.modalAppText, { color: theme.text }]}>
                    <Text style={{ fontWeight: '700', color: '#10B981' }}>
                      Paz para hoy:{' '}
                    </Text>
                    {selectedDiscovery.practical_application}
                  </Text>
                </View>

                {/* Verse snippet */}
                <Text style={[styles.modalVerseSnippet, { color: theme.textMuted }]}>
                  «{selectedDiscovery.verse_snippet}» — {selectedDiscovery.book_name}{' '}
                  {selectedDiscovery.chapter}:{selectedDiscovery.verse}
                </Text>

                {/* Actions */}
                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalShareBtn,
                      { backgroundColor: theme.surfaceRaised },
                    ]}
                    onPress={() => handleShare(selectedDiscovery)}
                  >
                    <Share2 size={16} color={theme.text} />
                    <Text style={[styles.modalShareText, { color: theme.text }]}>
                      Compartir
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalReaderBtn,
                      { backgroundColor: theme.accent },
                    ]}
                    onPress={() => handleOpenReader(selectedDiscovery)}
                  >
                    <BookOpen size={16} color="#FFFFFF" />
                    <Text style={styles.modalReaderBtnText}>
                      Abrir en la Biblia
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  headerRightSpace: {
    width: 38,
  },
  categoryWrap: {
    paddingVertical: 10,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  todaySection: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  todayHeroCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 6,
  },
  todayCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  todayCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  todayCatText: {
    fontSize: 11,
    fontWeight: '700',
  },
  todayTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  originalWordBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  originalWordText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pronunciationText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  todayInsight: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  appBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  appText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  todayVerseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  todayVerseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayVerseRef: {
    fontSize: 12,
    fontWeight: '700',
  },
  openReaderLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openReaderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  itemCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemEmoji: {
    fontSize: 11,
  },
  itemCatText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemWordPill: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemSnippet: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  itemRef: {
    fontSize: 11,
  },
  itemMoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalCatText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalWordBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  modalWordText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalPronounceText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalInsight: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  modalAppBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalAppText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  modalVerseSnippet: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: 16,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  modalShareText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalReaderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalReaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
