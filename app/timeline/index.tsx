import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getTimelinePeriods, getTimelineEvents } from '@/src/services/db/bibleDb';
import { TimelinePeriod, TimelineEvent } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticSelection, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

export default function TimelineScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [periods, setPeriods] = useState<TimelinePeriod[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [periodsData, eventsData] = await Promise.all([
        getTimelinePeriods(),
        getTimelineEvents(),
      ]);
      setPeriods(periodsData);
      setEvents(eventsData);
    } catch (e) {
      console.warn('Error loading timeline:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPeriods = useMemo(() => {
    if (testamentFilter === 'ALL') return periods;
    return periods.filter((p) => p.testament === testamentFilter);
  }, [periods, testamentFilter]);

  const filteredEvents = useMemo(() => {
    let list = events;

    if (testamentFilter !== 'ALL') {
      const periodIdsInTestament = periods
        .filter((p) => p.testament === testamentFilter)
        .map((p) => p.id);
      list = list.filter((e) => periodIdsInTestament.includes(e.period_id));
    }

    if (selectedPeriodId !== null) {
      list = list.filter((e) => e.period_id === selectedPeriodId);
    }

    return list;
  }, [events, periods, testamentFilter, selectedPeriodId]);

  const handleOpenReader = (event: TimelineEvent) => {
    hapticSuccess();
    router.push({
      pathname: `/reader/${event.book_id}/${event.chapter}`,
      params: { highlightVerse: String(event.verse) },
    } as any);
  };

  const getPeriodForEvent = (periodId: number) => {
    return periods.find((p) => p.id === periodId);
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
            La Línea del Tiempo Viva
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            La Historia Bíblica en su Orden Cronológico Real
          </Text>
        </View>
        <View style={styles.headerRightSpace} />
      </View>

      {/* Testament Filter Bar */}
      <View style={styles.filterSection}>
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: theme.surfaceRaised,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              testamentFilter === 'ALL' && { backgroundColor: theme.accent },
            ]}
            onPress={() => {
              hapticSelection();
              setTestamentFilter('ALL');
              setSelectedPeriodId(null);
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: testamentFilter === 'ALL' ? '#FFFFFF' : theme.text },
              ]}
            >
              Toda la Biblia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              testamentFilter === 'OT' && { backgroundColor: theme.accent },
            ]}
            onPress={() => {
              hapticSelection();
              setTestamentFilter('OT');
              setSelectedPeriodId(null);
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: testamentFilter === 'OT' ? '#FFFFFF' : theme.text },
              ]}
            >
              Antiguo Testamento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              testamentFilter === 'NT' && { backgroundColor: theme.accent },
            ]}
            onPress={() => {
              hapticSelection();
              setTestamentFilter('NT');
              setSelectedPeriodId(null);
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: testamentFilter === 'NT' ? '#FFFFFF' : theme.text },
              ]}
            >
              Nuevo Testamento
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Period Chips Carousel */}
      <View style={styles.periodChipsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, title_es: 'Todos los períodos' } as any, ...filteredPeriods]}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.periodChipsList}
          renderItem={({ item }) => {
            const isSelected = selectedPeriodId === item.id;
            return (
              <TouchableOpacity
                onPress={() => {
                  hapticSelection();
                  setSelectedPeriodId(item.id);
                }}
                style={[
                  styles.periodChip,
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
                    styles.periodChipText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item.title_es}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Events Timeline List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Organizando la historia de la salvación...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.timelineList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.timelineHeaderBanner}>
              <View
                style={[
                  styles.bannerCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <View style={styles.bannerTopRow}>
                  <Clock size={16} color={theme.accent} />
                  <Text style={[styles.bannerTitle, { color: theme.accent }]}>
                    CRONOLOGÍA VIVA Y CONTEXTO HISTÓRICO
                  </Text>
                </View>
                <Text style={[styles.bannerText, { color: theme.textMuted }]}>
                  La Biblia no se escribió en orden de libros, sino a lo largo de
                  milenios. Comprende qué ocurrió primero y cómo cada promesa divina
                  apuntaba hacia el cumplimiento de la paz.
                </Text>
              </View>
            </View>
          }
          renderItem={({ item, index }) => {
            const period = getPeriodForEvent(item.period_id);
            const periodColor = period?.color_hex || theme.accent;

            return (
              <View style={styles.timelineItemWrapper}>
                {/* Left Timeline Spine */}
                <View style={styles.timelineSpine}>
                  <View
                    style={[
                      styles.timelineNode,
                      {
                        backgroundColor: periodColor,
                        borderColor: theme.cardBackground,
                      },
                    ]}
                  >
                    <View style={styles.nodeInnerDot} />
                  </View>
                  {index < filteredEvents.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: theme.borderSubtle },
                      ]}
                    />
                  )}
                </View>

                {/* Event Card */}
                <View
                  style={[
                    styles.eventCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  {/* Period Tag & Year Pill */}
                  <View style={styles.eventTopRow}>
                    <View
                      style={[
                        styles.periodBadge,
                        { backgroundColor: `${periodColor}18` },
                      ]}
                    >
                      <Text
                        style={[styles.periodBadgeText, { color: periodColor }]}
                      >
                        {period?.title_es}
                      </Text>
                    </View>

                    <View style={styles.yearPill}>
                      <Calendar size={11} color={theme.textMuted} />
                      <Text style={[styles.yearText, { color: theme.textMuted }]}>
                        {item.approx_year}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={[styles.eventTitle, { color: theme.text }]}>
                    {item.title_es}
                  </Text>

                  {/* Narrative summary */}
                  <Text style={[styles.eventSummary, { color: theme.text }]}>
                    {item.summary_es}
                  </Text>

                  {/* Spiritual Lesson Callout */}
                  <View
                    style={[
                      styles.lessonCallout,
                      {
                        backgroundColor:
                          themeMode === 'oled'
                            ? '#141d18'
                            : 'rgba(217, 119, 6, 0.08)',
                        borderColor:
                          themeMode === 'oled'
                            ? '#1e3324'
                            : 'rgba(217, 119, 6, 0.22)',
                      },
                    ]}
                  >
                    <Sparkles size={13} color={theme.accent} />
                    <Text
                      style={[styles.lessonText, { color: theme.accent }]}
                    >
                      {item.spiritual_lesson}
                    </Text>
                  </View>

                  {/* Footer: Scripture coordinate & Action */}
                  <View
                    style={[
                      styles.eventFooter,
                      { borderTopColor: theme.borderSubtle },
                    ]}
                  >
                    <View style={styles.coordWrap}>
                      <BookOpen size={13} color={theme.textMuted} />
                      <Text
                        style={[styles.coordText, { color: theme.textMuted }]}
                      >
                        {item.book_name} {item.chapter}:{item.verse}
                        {item.key_people_names
                          ? ` • ${item.key_people_names}`
                          : ''}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.readLinkBtn,
                        { backgroundColor: theme.surfaceRaised },
                      ]}
                      onPress={() => handleOpenReader(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.readLinkText, { color: theme.accent }]}
                      >
                        Leer
                      </Text>
                      <ArrowRight size={12} color={theme.accent} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
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
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  periodChipsWrap: {
    paddingBottom: 10,
  },
  periodChipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  periodChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodChipText: {
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
  timelineList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  timelineHeaderBanner: {
    marginBottom: 16,
  },
  bannerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  timelineItemWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },
  timelineSpine: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 14,
  },
  nodeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -4,
  },
  eventCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  periodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  yearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yearText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  eventSummary: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
    marginBottom: 10,
  },
  lessonCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  lessonText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  coordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  coordText: {
    fontSize: 11,
  },
  readLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
