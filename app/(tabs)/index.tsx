import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Search,
  Wind,
  BookOpen,
  ArrowRight,
  Sparkles,
  ChevronRight,
  User,
  Compass,
  MapPin,
  Clock,
  Trophy,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { DailyVerseHero } from '@/src/features/daily/components/DailyVerseHero';
import { DailyDiscoveryCard } from '@/src/features/daily/components/DailyDiscoveryCard';
import { DailyCuriosityCard } from '@/src/features/curiosities/components/DailyCuriosityCard';
import { getTodayCuriosity } from '@/src/features/curiosities/data/biblicalCuriosities';
import { MeditationModal } from '@/src/features/daily/components/MeditationModal';
import { MoodBubbleCard } from '@/src/features/mood/components/MoodBubbleCard';
import { ShareCardModal } from '@/src/features/share/components/ShareCardModal';
import {
  getDailyDevotional,
  getMoodCatalog,
  DailyDevotional,
  getBookById,
  getChapterVerses,
  getTodayDiscovery,
} from '@/src/services/db/bibleDb';
import { getLastRead } from '@/src/services/db/userDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { MoodCatalogItem, DailyDiscovery } from '@/src/types/bible';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Recomendado para hoy';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return 'Leído hace un momento';
    if (diffMin < 60) return `Leído hace ${diffMin} min`;
    if (diffHours === 1) return 'Leído hace 1 hora';
    if (diffHours < 24) return `Leído hace ${diffHours} horas`;
    if (diffDays === 1) return 'Leído ayer';
    return `Leído hace ${diffDays} días`;
  } catch {
    return 'Leído recientemente';
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [devotional, setDevotional] = useState<DailyDevotional | null>(null);
  const [todayDiscovery, setTodayDiscovery] = useState<DailyDiscovery | null>(null);
  const [moods, setMoods] = useState<MoodCatalogItem[]>([]);
  const [lastReadInfo, setLastReadInfo] = useState<{
    bookName: string;
    bookId: number;
    chapter: number;
    totalChapters: number;
    snippet: string;
    progressPercent: number;
    timeLabel: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [meditationVisible, setMeditationVisible] = useState(false);

  const todayCuriosity = useMemo(() => getTodayCuriosity(), []);

  const loadData = useCallback(async () => {
    try {
      const [dev, moodList, lastRead, disc] = await Promise.all([
        getDailyDevotional(),
        getMoodCatalog(),
        getLastRead(),
        getTodayDiscovery(),
      ]);

      setDevotional(dev);
      setMoods(moodList);
      setTodayDiscovery(disc);

      // Rotating daily reading pool when user has no active reading history
      const ROTATING_READINGS = [
        { bookId: 19, chapter: 23, fallbackSnippet: 'Jehová es mi pastor; nada me faltará...' },
        { bookId: 43, chapter: 14, fallbackSnippet: 'No se turbe vuestro corazón; creéis en Dios, creed también en mí...' },
        { bookId: 50, chapter: 4, fallbackSnippet: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones...' },
        { bookId: 19, chapter: 91, fallbackSnippet: 'El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente...' },
        { bookId: 45, chapter: 8, fallbackSnippet: 'A los que aman a Dios, todas las cosas les ayudan a bien...' },
        { bookId: 23, chapter: 40, fallbackSnippet: 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como águilas...' },
        { bookId: 40, chapter: 6, fallbackSnippet: 'Buscad primeramente el reino de Dios y su justicia...' },
        { bookId: 19, chapter: 103, fallbackSnippet: 'Bendice, alma mía, a Jehová, y no olvides ninguno de sus beneficios...' },
        { bookId: 46, chapter: 13, fallbackSnippet: 'El amor es sufrido, es benigno; el amor no tiene envidia...' },
        { bookId: 20, chapter: 3, fallbackSnippet: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia...' },
      ];
      const dayIdx = new Date().getDate() % ROTATING_READINGS.length;
      const defaultRec = ROTATING_READINGS[dayIdx];

      const bookId = lastRead?.bookId || defaultRec.bookId;
      const chapter = lastRead?.chapter || defaultRec.chapter;
      const book = await getBookById(bookId);

      // Load verse snippet
      const verses = await getChapterVerses(bookId, chapter);
      const snippet = verses.length > 0
        ? verses[0].text
        : defaultRec.fallbackSnippet;

      const totalCh = book?.chapters_count || 150;
      const progressPercent = Math.min(
        100,
        Math.max(10, Math.round((chapter / totalCh) * 100))
      );

      setLastReadInfo({
        bookName: book?.name || 'Salmos',
        bookId,
        chapter,
        totalChapters: totalCh,
        snippet,
        progressPercent,
        timeLabel: formatRelativeTime(lastRead?.lastReadAt),
      });
    } catch (e) {
      console.warn('Error loading home data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRotateVerse = async () => {
    try {
      const nextDev = await getDailyDevotional({ randomize: true });
      setDevotional(nextDev);
    } catch (e) {
      console.warn('Error rotating devotional:', e);
    }
  };

  const handleOpenCalma = () => {
    hapticLight();
    router.push('/mood/sos-modal' as any);
  };

  const handleOpenSearch = () => {
    hapticLight();
    router.push('/search' as any);
  };

  const handleMoodPress = (mood: MoodCatalogItem) => {
    hapticLight();
    router.push(`/mood/${mood.key}` as any);
  };

  const handleContinueReading = () => {
    if (!lastReadInfo) return;
    hapticLight();
    router.push(`/reader/${lastReadInfo.bookId}/${lastReadInfo.chapter}` as any);
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Top Header with official logo & brand */}
      <AppHeader variant="main" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
      >
        {/* 1. Daily Devotional Hero (Photo 1) */}
        <DailyVerseHero
          devotional={devotional}
          onShare={() => setShareModalVisible(true)}
          onMeditate={() => setMeditationVisible(true)}
          onRotateVerse={handleRotateVerse}
        />

        {/* 2. Continue Reading Card (Photo 2) */}
        {lastReadInfo && (
          <View
            style={[
              styles.continueCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                shadowColor: '#000',
              },
            ]}
          >
            {/* Header: Badge & Time Elapsed */}
            <View style={styles.continueHeaderRow}>
              <View
                style={[
                  styles.continueBadge,
                  { backgroundColor: theme.accentMuted },
                ]}
              >
                <BookOpen size={12} color={theme.accent} />
                <Text style={[styles.continueBadgeText, { color: theme.accent }]}>
                  CONTINUAR LECTURA
                </Text>
              </View>
              <Text style={[styles.continueTimeText, { color: theme.textMuted }]}>
                {lastReadInfo.timeLabel}
              </Text>
            </View>

            {/* Passage Reference & Snippet */}
            <Text style={[styles.continueTitle, { color: theme.text }]}>
              {lastReadInfo.bookName} {lastReadInfo.chapter}
            </Text>
            <Text
              style={[styles.continueSnippet, { color: theme.textMuted }]}
              numberOfLines={2}
            >
              «{lastReadInfo.snippet}»
            </Text>

            {/* Progress Telemetry */}
            <View style={styles.progressTelemetryRow}>
              <Text style={[styles.telemetryBookName, { color: theme.text }]}>
                Libro de {lastReadInfo.bookName}
              </Text>
              <Text style={[styles.telemetryPercent, { color: theme.accent }]}>
                {lastReadInfo.progressPercent}% completado
              </Text>
            </View>

            {/* Progress Bar Track */}
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: theme.borderSubtle },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: theme.accent,
                    width: `${lastReadInfo.progressPercent}%`,
                  },
                ]}
              />
            </View>

            {/* Full-Width Pill Action Button (Photo 2) */}
            <TouchableOpacity
              style={[
                styles.continueActionBtn,
                { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
              ]}
              onPress={handleContinueReading}
              activeOpacity={0.8}
            >
              <Text style={[styles.continueActionBtnText, { color: theme.text }]}>
                Continuar lectura
              </Text>
              <ArrowRight size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Curiosidad Bíblica del Día */}
        <DailyCuriosityCard curiosity={todayCuriosity} />

        {/* 4. Calma en la Presencia Banner (Placed BELOW Continuar Lectura) */}
        <TouchableOpacity
          style={[
            styles.calmaBanner,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={handleOpenCalma}
          activeOpacity={0.8}
        >
          <View style={styles.calmaLeft}>
            <View
              style={[styles.calmaIconCircle, { backgroundColor: theme.accentMuted }]}
            >
              <Wind size={20} color={theme.accent} />
            </View>
            <View style={styles.calmaTextWrapper}>
              <Text style={[styles.calmaTitle, { color: theme.text }]}>
                Calma en la Presencia
              </Text>
              <Text style={[styles.calmaSubtitle, { color: theme.textMuted }]}>
                Haz una pausa consciente · Respiración 4-7-8 y descanso bíblico
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.accent} />
        </TouchableOpacity>

        {/* 4. ¿Cómo te sientes hoy? Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            ¿Cómo te sientes hoy?
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/mood' as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.sectionSeeAll, { color: theme.accent }]}>
              Ver todas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Quick Moods Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodCarouselContent}
        >
          {moods.slice(0, 8).map((item) => (
            <MoodBubbleCard
              key={item.id}
              mood={item}
              onPress={handleMoodPress}
              compact
            />
          ))}
        </ScrollView>

        {/* 5. Exploración Bíblica Profunda: Grid 2x2 Armónico */}
        <View style={[styles.sectionHeader, { marginTop: 26 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Exploración Bíblica
          </Text>
          <TouchableOpacity
            onPress={() => {
              hapticLight();
              router.push('/characters' as any);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.sectionSeeAll, { color: theme.accent }]}>
              Explorar todo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {/* 1. Personajes Bíblicos */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => {
              hapticLight();
              router.push('/characters' as any);
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.gridIconWrap,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? '#1e293b'
                      : 'rgba(217, 119, 6, 0.12)',
                },
              ]}
            >
              <Compass size={20} color={theme.accent} />
            </View>
            <Text style={[styles.gridTag, { color: theme.accent }]}>
              37 PERSONAJES
            </Text>
            <Text style={[styles.gridTitle, { color: theme.text }]}>
              El Árbol Humano
            </Text>
            <Text
              style={[styles.gridSubtitle, { color: theme.textMuted }]}
              numberOfLines={2}
            >
              David, Moisés, Rut y arquetipos del alma
            </Text>
          </TouchableOpacity>

          {/* 2. Lugares Sagrados GPS */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => {
              hapticLight();
              router.push('/places' as any);
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.gridIconWrap,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? '#1e293b'
                      : 'rgba(16, 185, 129, 0.12)',
                },
              ]}
            >
              <MapPin size={20} color="#10b981" />
            </View>
            <Text style={[styles.gridTag, { color: '#10b981' }]}>
              24 LUGARES GPS
            </Text>
            <Text style={[styles.gridTitle, { color: theme.text }]}>
              Mapa Sagrado
            </Text>
            <Text
              style={[styles.gridSubtitle, { color: theme.textMuted }]}
              numberOfLines={2}
            >
              Getsemaní, Sinaí, Belén y coordenadas
            </Text>
          </TouchableOpacity>

          {/* 3. Cronología Viva */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => {
              hapticLight();
              router.push('/timeline' as any);
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.gridIconWrap,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? '#1e293b'
                      : 'rgba(99, 102, 241, 0.12)',
                },
              ]}
            >
              <Clock size={20} color="#6366f1" />
            </View>
            <Text style={[styles.gridTag, { color: '#6366f1' }]}>
              9 ÉPOCAS
            </Text>
            <Text style={[styles.gridTitle, { color: theme.text }]}>
              Línea del Tiempo
            </Text>
            <Text
              style={[styles.gridSubtitle, { color: theme.textMuted }]}
              numberOfLines={2}
            >
              Secuencia histórica desde el Génesis a Roma
            </Text>
          </TouchableOpacity>

          {/* 4. Sabiduría Selah & Raíces */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => {
              hapticLight();
              router.push('/discoveries' as any);
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.gridIconWrap,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? '#1e293b'
                      : 'rgba(236, 72, 153, 0.12)',
                },
              ]}
            >
              <Sparkles size={20} color="#ec4899" />
            </View>
            <Text style={[styles.gridTag, { color: '#ec4899' }]}>
              SABIDURÍA SELAH
            </Text>
            <Text style={[styles.gridTitle, { color: theme.text }]}>
              Raíces del Día
            </Text>
            <Text
              style={[styles.gridSubtitle, { color: theme.textMuted }]}
              numberOfLines={2}
            >
              {todayDiscovery
                ? `«${todayDiscovery.original_word || todayDiscovery.title}» · Tocar para ver`
                : 'Etimología hebrea y arqueología'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6. Curiosidades & Récords Bíblicos Explorer Banner */}
        <TouchableOpacity
          style={[
            styles.curiositiesBanner,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={() => {
            hapticLight();
            router.push('/curiosities' as any);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.curiositiesBannerLeft}>
            <View
              style={[
                styles.curiositiesIconCircle,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? '#1e293b'
                      : 'rgba(217, 119, 6, 0.12)',
                },
              ]}
            >
              <Trophy size={20} color={theme.accent} />
            </View>
            <View style={styles.curiositiesTextWrap}>
              <View style={styles.curiositiesTagRow}>
                <Text style={[styles.curiositiesTag, { color: theme.accent }]}>
                  22 TEMAS ASOMBROSOS
                </Text>
              </View>
              <Text style={[styles.curiositiesBannerTitle, { color: theme.text }]}>
                Curiosidades & Récords
              </Text>
              <Text
                style={[styles.curiositiesBannerSubtitle, { color: theme.textMuted }]}
                numberOfLines={2}
              >
                Versículo más largo, ciencia anticipada, Matusalén y hechos insólitos
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.accent} />
        </TouchableOpacity>
      </ScrollView>

      {/* Share Card Modal for Daily Verse */}
      {devotional && (
        <ShareCardModal
          visible={shareModalVisible}
          versesText={devotional.verse.text}
          referenceText={`${devotional.verse.book_name} ${devotional.verse.chapter}:${devotional.verse.verse}`}
          onClose={() => setShareModalVisible(false)}
        />
      )}

      {/* Meditation Contemplation Modal */}
      {devotional && (
        <MeditationModal
          visible={meditationVisible}
          verseText={devotional.verse.text}
          referenceText={`${devotional.verse.book_name} ${devotional.verse.chapter}:${devotional.verse.verse}`}
          onClose={() => setMeditationVisible(false)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectionTag: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  continueCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  continueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  continueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  continueTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  continueTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  continueSnippet: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 14,
  },
  progressTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  telemetryBookName: {
    fontSize: 12,
    fontWeight: '600',
  },
  telemetryPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  continueActionBtn: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  calmaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  calmaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  calmaIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calmaTextWrapper: {
    flex: 1,
  },
  calmaTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  calmaSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSeeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  moodCarouselContent: {
    gap: 12,
    paddingRight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  gridCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTag: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  curiositiesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 32,
  },
  curiositiesBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  curiositiesIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  curiositiesTextWrap: {
    flex: 1,
  },
  curiositiesTagRow: {
    marginBottom: 2,
  },
  curiositiesTag: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  curiositiesBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  curiositiesBannerSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
