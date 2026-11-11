import { cachePastoralVisibility } from '@/src/services/pastoralVisibilityService';
import { getVerseShareUrl } from '@/src/features/share/utils/verseShare';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  AppState,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { DailyVerseHero } from '@/src/features/daily/components/DailyVerseHero';
import { DailyVersePostalModal } from '@/src/features/daily/components/DailyVersePostalModal';
import { PastDevotionalsCarousel } from '@/src/features/daily/components/PastDevotionalsCarousel';
import { CommunityNotificationsModal } from '@/src/features/notifications/components/CommunityNotificationsModal';
import { getNotifications } from '@/src/features/notifications/services/notificationsStore';
import { DailyCuriosityCard } from '@/src/features/curiosities/components/DailyCuriosityCard';
import { getTodayCuriosity } from '@/src/features/curiosities/data/biblicalCuriosities';
import { MeditationModal } from '@/src/features/daily/components/MeditationModal';
import { MoodBubbleCard } from '@/src/features/mood/components/MoodBubbleCard';
import { localDateKey } from '@/src/features/daily/data/devotionalSelection';
import { getVerseBackground } from '@/src/features/share/data/cardBackgrounds';
import { ShareCardModal } from '@/src/features/share/components/ShareCardModal';
import { ContinueReadingCard, LastReadInfo } from '@/src/features/home/components/ContinueReadingCard';
import { CalmaBanner } from '@/src/features/home/components/CalmaBanner';
import { BiblicalExplorationGrid } from '@/src/features/home/components/BiblicalExplorationGrid';
import { CuriositiesBanner } from '@/src/features/home/components/CuriositiesBanner';
import {
  getDailyDevotional,
  getMoodCatalog,
  DailyDevotional,
  getBookById,
  getChapterVerses,
  getTodayDiscovery,
} from '@/src/services/db/bibleDb';
import { getLastRead, markChapterCompleted } from '@/src/services/db/userDb';
import { syncDevotionalCalendarWithServer } from '@/src/services/devotionalSyncService';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { MoodCatalogItem, DailyDiscovery } from '@/src/types/bible';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

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
  const [dayOffset, setDayOffset] = useState(0);
  const [showPastCarousel, setShowPastCarousel] = useState(false);
  const [todayDiscovery, setTodayDiscovery] = useState<DailyDiscovery | null>(null);
  const [moods, setMoods] = useState<MoodCatalogItem[]>([]);
  const [lastReadInfo, setLastReadInfo] = useState<LastReadInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [verseBusy, setVerseBusy] = useState(false);
  const verseChanging = useRef(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareCardOptions, setShareCardOptions] = useState<{ backgroundId: string; aspectRatio: '1:1' | '9:16' } | null>(null);
  const [meditationVisible, setMeditationVisible] = useState(false);
  const [postalModalVisible, setPostalModalVisible] = useState(false);
  const [selectedPostalDevotional, setSelectedPostalDevotional] = useState<DailyDevotional | null>(null);
  const [postalInitialFlipped, setPostalInitialFlipped] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const todayCuriosity = useMemo(() => getTodayCuriosity(), []);

  const loadData = useCallback(async () => {
    try {
      const [dev, moodList, lastRead, disc, notifs] = await Promise.all([
        getDailyDevotional(),
        getMoodCatalog(),
        getLastRead(),
        getTodayDiscovery(),
        getNotifications(),
      ]);

      setDevotional(dev);
      setDayOffset(0);
      setMoods(moodList);
      setTodayDiscovery(disc);
      setHasUnreadNotifications(notifs.some((n) => !n.isRead));

      // Consultar configuración remota (si el carrusel de días anteriores está activo en el panel web)
      try {
        const cfgRes = await fetch('https://selah.boxtiove.com/api/app-config');
        if (cfgRes.ok) {
          const cfgJson = await cfgRes.json();
          if (cfgJson?.ok && cfgJson?.config) {
            await cachePastoralVisibility(cfgJson.config.show_pastoral_reflection);
            setShowPastCarousel(Boolean(cfgJson.config.show_past_devotionals_carousel));
          }
        }
      } catch {}

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

      // Load verse snippet and telemetry
      const verses = await getChapterVerses(bookId, chapter);
      const totalVerses = verses.length;
      const lastVerse = Math.min(
        Math.max(1, lastRead?.lastVerse || 1),
        totalVerses || 1
      );
      const isCompleted = lastRead?.completed ?? false;

      // Prefer showing the verse snippet where user paused if > 1
      const snippetVerse =
        lastVerse > 1 && lastVerse <= totalVerses
          ? verses[lastVerse - 1]
          : verses[0];
      const snippet = snippetVerse ? snippetVerse.text : defaultRec.fallbackSnippet;

      // Estimated reading time (~180 words/min)
      const totalWords = verses.reduce(
        (sum, v) => sum + v.text.split(/\s+/).filter(Boolean).length,
        0
      );
      const readingMinutes = Math.max(1, Math.round(totalWords / 180));

      const totalCh = book?.chapters_count || 150;
      const nextChapter = chapter < totalCh ? chapter + 1 : null;

      setLastReadInfo({
        bookName: book?.name || 'Salmos',
        bookId,
        chapter,
        totalChapters: totalCh,
        lastVerse,
        totalVerses,
        snippet,
        timeLabel: formatRelativeTime(lastRead?.lastReadAt),
        readingMinutes,
        isCompleted,
        hasReadingHistory: Boolean(lastRead),
        nextChapter,
      });
    } catch (e) {
      console.warn('Error loading home data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!postalModalVisible) loadData();
    }, [loadData, postalModalVisible])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncDevotionalCalendarWithServer();
    } catch {}
    await loadData();
    setRefreshing(false);
  };

  const navigateDay = async (direction: 'prev' | 'next') => {
    if (verseChanging.current) return;
    const newOffset = direction === 'prev' ? dayOffset + 1 : dayOffset - 1;
    if (newOffset < 0 || newOffset > 7) return;

    verseChanging.current = true;
    setVerseBusy(true);
    try {
      let nextDev: DailyDevotional;
      if (newOffset === 0) {
        nextDev = await getDailyDevotional();
      } else {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - newOffset);
        nextDev = await getDailyDevotional({ date: targetDate });
      }
      setDayOffset(newOffset);
      setDevotional(nextDev);
    } catch (e) {
      console.warn('Error navigating daily verse day:', e);
    } finally {
      verseChanging.current = false;
      setVerseBusy(false);
    }
  };
  const handlePreviousDay = () => navigateDay('prev');
  const handleNextDay = () => navigateDay('next');

  useEffect(() => {
    const checkNewDay = () => {
      if (!devotional || devotional.dateKey === localDateKey(new Date()) || verseChanging.current) return;
      getDailyDevotional().then(setDevotional).catch((e) => console.warn('Error refreshing daily verse:', e));
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkNewDay();
    });
    const timer = setInterval(checkNewDay, 30_000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, [devotional?.dateKey]);

  const handleOpenCalma = () => {
    hapticLight();
    router.push('/mood/sos-modal' as any);
  };


  const handleMoodPress = (mood: MoodCatalogItem) => {
    hapticLight();
    router.push(`/mood/${mood.key}` as any);
  };

  const handleContinueReading = () => {
    if (!lastReadInfo) return;
    hapticLight();
    const verseParam = lastReadInfo.lastVerse > 1 ? `?highlightVerse=${lastReadInfo.lastVerse}` : '';
    router.push(`/reader/${lastReadInfo.bookId}/${lastReadInfo.chapter}${verseParam}` as any);
  };

  const handleNextChapter = () => {
    if (!lastReadInfo || !lastReadInfo.nextChapter) return;
    hapticLight();
    router.push(`/reader/${lastReadInfo.bookId}/${lastReadInfo.nextChapter}` as any);
  };

  const handleToggleComplete = async () => {
    if (!lastReadInfo) return;
    hapticSuccess();
    const nextStatus = !lastReadInfo.isCompleted;
    setLastReadInfo((prev) => (prev ? { ...prev, isCompleted: nextStatus } : null));
    try {
      await markChapterCompleted(lastReadInfo.bookId, lastReadInfo.chapter, nextStatus);
    } catch (e) {
      console.warn('Error marking chapter completed:', e);
    }
  };

  const handleSelectNotification = async (item: { verseSlug: string; verseCitation: string }) => {
    setNotificationsModalVisible(false);
    let targetDev = devotional;
    try {
      const today = new Date();
      for (let i = 0; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const past = await getDailyDevotional({ date: d });
        const cit = `${past.verse.book_name} ${past.verse.chapter}:${past.verse.verse}`.toLowerCase();
        if (
          cit.includes(item.verseCitation.toLowerCase()) ||
          item.verseCitation.toLowerCase().includes(cit) ||
          (item.verseSlug && cit.replace(/[\s:]+/g, '-').includes(item.verseSlug))
        ) {
          targetDev = past;
          break;
        }
      }
    } catch (e) {
      console.warn('Error matching notification verse:', e);
    }

    setSelectedPostalDevotional(targetDev || devotional);
    setPostalInitialFlipped(true);
    setPostalModalVisible(true);
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Top Header with official logo, notifications bell & search/profile */}
      <AppHeader
        variant="main"
        onNotificationsPress={() => setNotificationsModalVisible(true)}
        hasUnreadNotifications={hasUnreadNotifications}
      />

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
          dayOffset={dayOffset}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onShare={() => {
            setShareCardOptions(null);
            setShareModalVisible(true);
          }}
          onMeditate={() => setMeditationVisible(true)}
          onOpenPostal={() => {
            setSelectedPostalDevotional(devotional);
            setPostalInitialFlipped(false);
            setPostalModalVisible(true);
          }}
          verseBusy={verseBusy}
          onReadVerse={() => {
            if (!devotional) return;
            const { verse } = devotional;
            router.push(`/reader/${verse.book_id}/${verse.chapter}?highlightVerse=${verse.verse}` as any);
          }}
        />

        {/* 1.5. Historial de Versículos de Días Anteriores (Controlable desde Panel Web, default desactivado) */}
        {showPastCarousel && (
          <PastDevotionalsCarousel
            theme={theme}
            onSelectDevotional={(pastDev) => {
              setSelectedPostalDevotional(pastDev);
              setPostalInitialFlipped(false);
              setPostalModalVisible(true);
            }}
          />
        )}

        {/* 2. Continue Reading Card */}
        {lastReadInfo && (
          <ContinueReadingCard
            lastReadInfo={lastReadInfo}
            theme={theme}
            onPress={handleContinueReading}
            onNextChapterPress={handleNextChapter}
            onToggleComplete={handleToggleComplete}
          />
        )}

        {/* 3. Curiosidad Bíblica del Día */}
        <DailyCuriosityCard curiosity={todayCuriosity} />

        {/* 4. Calma en la Presencia Banner */}
        <CalmaBanner theme={theme} onPress={handleOpenCalma} />

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

        {/* 6. Exploración Bíblica Profunda: Grid 2x2 Armónico */}
        <BiblicalExplorationGrid
          theme={theme}
          themeMode={themeMode}
          todayDiscovery={todayDiscovery}
          onNavigate={(route) => router.push(route as any)}
        />

        {/* 7. Curiosidades & Récords Bíblicos Explorer Banner */}
        <CuriositiesBanner
          theme={theme}
          themeMode={themeMode}
          onPress={() => {
            hapticLight();
            router.push('/curiosities' as any);
          }}
        />
      </ScrollView>

      {/* Full-Screen Daily Verse Postal Story Modal */}
      {(selectedPostalDevotional || devotional) && (
        <DailyVersePostalModal
          visible={postalModalVisible}
          devotional={selectedPostalDevotional || devotional}
          initialFlipped={postalInitialFlipped}
          onClose={() => {
            setPostalModalVisible(false);
            setPostalInitialFlipped(false);
          }}
          onNavigateToReader={(bookId, chapter, verse) => {
            router.push(`/reader/${bookId}/${chapter}?highlightVerse=${verse}` as any);
          }}
          onShare={(backgroundId) => {
            setShareCardOptions({ backgroundId, aspectRatio: '9:16' });
            setPostalModalVisible(false);
            setShareModalVisible(true);
          }}
          onMeditate={() => {
            setPostalModalVisible(false);
            setMeditationVisible(true);
          }}
        />
      )}

      {/* Community Notifications Sliding Modal */}
      <CommunityNotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        onSelectVerse={handleSelectNotification}
        onUnreadChange={setHasUnreadNotifications}
      />

      {/* Share Card Modal for Daily Verse */}
      {devotional && (
        <ShareCardModal
          visible={shareModalVisible}
          shareUrl={getVerseShareUrl(devotional.verse.book_name, devotional.verse.chapter, devotional.verse.verse)}
          initialBackgroundId={shareCardOptions?.backgroundId ?? getVerseBackground(devotional.verse.id).id}
          initialAspectRatio={shareCardOptions?.aspectRatio ?? '1:1'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
});

