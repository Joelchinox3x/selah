import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Share2,
  MapPin,
  ExternalLink,
  Sparkles,
  BookOpen,
  ArrowRight,
  Compass,
  Landmark,
  ChevronRight,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getPlaceById, getVersesForPlace } from '@/src/services/db/bibleDb';
import { BiblicalPlace, Verse } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlaceDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const placeId = parseInt(params.id || '1', 10);

  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [place, setPlace] = useState<BiblicalPlace | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [placeData, versesData] = await Promise.all([
        getPlaceById(placeId),
        getVersesForPlace(placeId, 30),
      ]);
      setPlace(placeData);
      setVerses(versesData);
    } catch (e) {
      console.warn('Error loading place details:', e);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShare = async () => {
    if (!place) return;
    hapticLight();
    try {
      await Share.share({
        title: `${place.name_es} - El Mapa Sagrado en Selah`,
        message: `«${place.name_es}» (${place.modern_location})\n\nSignificado Espiritual: ${place.spiritual_meaning}\n\nCoordenadas GPS: ${place.latitude}, ${place.longitude}\n\n${place.description_es}\n\nDescubre más en la app bíblica Selah.`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleOpenMaps = () => {
    if (!place) return;
    hapticLight();
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleOpenVerseInReader = (verse: Verse) => {
    hapticSuccess();
    router.push({
      pathname: `/reader/${verse.book_id}/${verse.chapter}`,
      params: { highlightVerse: String(verse.verse) },
    } as any);
  };

  if (loading) {
    return (
      <Screen safeTop safeBottom={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Cargando lugar sagrado...
          </Text>
        </View>
      </Screen>
    );
  }

  if (!place) {
    return (
      <Screen safeTop safeBottom={false}>
        <View style={styles.centerContainer}>
          <Text style={[styles.notFoundTitle, { color: theme.text }]}>
            Lugar no encontrado
          </Text>
          <TouchableOpacity
            style={[styles.backBtnPill, { backgroundColor: theme.accent }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnPillText}>Regresar a Lugares</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeTop safeBottom={false}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: theme.surfaceRaised }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {place.name_es}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            {place.category}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          style={[styles.headerBtn, { backgroundColor: theme.surfaceRaised }]}
          activeOpacity={0.7}
        >
          <Share2 size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    themeMode === 'oled' ? '#182436' : 'rgba(217, 119, 6, 0.1)',
                  borderColor:
                    themeMode === 'oled' ? '#293a52' : 'rgba(217, 119, 6, 0.25)',
                },
              ]}
            >
              <Compass size={28} color={theme.accent} />
            </View>

            <View style={styles.heroTitles}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor:
                        themeMode === 'oled'
                          ? '#1e293b'
                          : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <Text style={[styles.tagBadgeText, { color: theme.textMuted }]}>
                    {place.testament === 'OT'
                      ? 'Antiguo Testamento'
                      : place.testament === 'NT'
                      ? 'Nuevo Testamento'
                      : 'Geografía Bíblica'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.tagBadge,
                    { backgroundColor: theme.accentMuted },
                  ]}
                >
                  <Text style={[styles.tagBadgeText, { color: theme.accent }]}>
                    {place.category}
                  </Text>
                </View>
              </View>

              <Text style={[styles.placeHeroName, { color: theme.text }]}>
                {place.name_es}
              </Text>
              {place.hebrew_greek_name ? (
                <Text style={[styles.hebrewTitle, { color: theme.accent }]}>
                  {place.hebrew_greek_name}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Spiritual Meaning */}
          <View
            style={[
              styles.meaningBox,
              {
                backgroundColor:
                  themeMode === 'oled'
                    ? '#141d18'
                    : 'rgba(217, 119, 6, 0.08)',
                borderColor:
                  themeMode === 'oled'
                    ? '#1e3324'
                    : 'rgba(217, 119, 6, 0.25)',
              },
            ]}
          >
            <View style={styles.meaningHeader}>
              <Sparkles size={16} color={theme.accent} />
              <Text style={[styles.meaningHeaderTitle, { color: theme.accent }]}>
                SIGNIFICADO ESPIRITUAL Y PAZ HOY
              </Text>
            </View>
            <Text style={[styles.meaningMainText, { color: theme.text }]}>
              {place.spiritual_meaning}
            </Text>
          </View>
        </View>

        {/* Ver en Mapa Real Button Card */}
        <TouchableOpacity
          style={[
            styles.realMapActionCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.accent,
            },
          ]}
          onPress={() => {
            hapticLight();
            router.push(`/places/map?focusedPlace=${place.id}` as any);
          }}
          activeOpacity={0.85}
        >
          <View style={styles.realMapCardLeft}>
            <View
              style={[
                styles.realMapIconCircle,
                { backgroundColor: theme.accent },
              ]}
            >
              <Compass size={22} color="#FFFFFF" />
            </View>
            <View style={styles.realMapTexts}>
              <View style={styles.realMapTitleRow}>
                <Text style={[styles.realMapTitle, { color: theme.text }]}>
                  Ver en Mapa Real
                </Text>
                <View
                  style={[
                    styles.realMapBadge,
                    { backgroundColor: theme.accent + '22' },
                  ]}
                >
                  <Text
                    style={[
                      styles.realMapBadgeText,
                      { color: theme.accent },
                    ]}
                  >
                    Satélite & Relieve
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.realMapSubtitle, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {place.modern_location} • GPS {place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}°
              </Text>
              <Text style={[styles.realMapCta, { color: theme.accent }]}>
                Explorar perímetro antiguo y personajes bíblicos →
              </Text>
            </View>
          </View>
          <ChevronRight size={22} color={theme.accent} />
        </TouchableOpacity>

        {/* Historical Context Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <Landmark size={18} color={theme.accent} />
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              Historia y Relevancia Sagrada
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            {place.description_es}
          </Text>

          {place.key_events ? (
            <View style={[styles.keyEventsBox, { borderTopColor: theme.borderSubtle }]}>
              <Text style={[styles.keyEventsLabel, { color: theme.accent }]}>
                Acontecimientos Bíblicos Clave:
              </Text>
              <Text style={[styles.keyEventsText, { color: theme.textMuted }]}>
                {place.key_events}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Biblical Passages Section */}
        <View style={styles.versesSection}>
          <View style={styles.sectionHeaderRow}>
            <BookOpen size={18} color={theme.accent} />
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              Pasajes Bíblicos Vinculados
            </Text>
          </View>
          <Text style={[styles.versesIntro, { color: theme.textMuted }]}>
            {verses.length > 0
              ? `Explora versículos donde se menciona ${place.name_es}. Toca cualquier pasaje para abrirlo en el lector.`
              : `Buscando menciones bíblicas de ${place.name_es}...`}
          </Text>

          {verses.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.verseCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={() => handleOpenVerseInReader(v)}
              activeOpacity={0.8}
            >
              <View style={styles.verseCardHeader}>
                <View style={styles.verseRefPill}>
                  <Text style={[styles.verseRefText, { color: theme.accent }]}>
                    {v.book_name} {v.chapter}:{v.verse}
                  </Text>
                </View>

                <View style={styles.readerLinkRow}>
                  <Text style={[styles.readerLinkText, { color: theme.accent }]}>
                    Abrir en lector
                  </Text>
                  <ArrowRight size={14} color={theme.accent} />
                </View>
              </View>

              <Text style={[styles.verseContentText, { color: theme.text }]}>
                «{v.text}»
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  headerBtn: {
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
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
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
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  backBtnPill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backBtnPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTitles: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  placeHeroName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hebrewTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  gpsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  realMapActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  realMapCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  realMapIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  realMapTexts: {
    flex: 1,
  },
  realMapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  realMapTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  realMapBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  realMapBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  realMapSubtitle: {
    fontSize: 12,
    marginBottom: 3,
  },
  realMapCta: {
    fontSize: 11,
    fontWeight: '700',
  },
  gpsInfoCol: {
    flex: 1,
    marginRight: 12,
  },
  gpsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  gpsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gpsCoordsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  gpsModernLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openMapBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  meaningBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  meaningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  meaningHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  meaningMainText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  keyEventsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  keyEventsLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  keyEventsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  versesSection: {
    marginTop: 8,
  },
  versesIntro: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  verseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  verseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verseRefPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  verseRefText: {
    fontSize: 12,
    fontWeight: '700',
  },
  readerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readerLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verseContentText: {
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
});
