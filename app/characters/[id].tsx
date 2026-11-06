import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Share2,
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  Heart,
  Quote,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getPersonById, getVersesForPerson } from '@/src/services/db/bibleDb';
import { BiblicalPerson, Verse } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CharacterDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const personId = parseInt(params.id || '1', 10);

  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [person, setPerson] = useState<BiblicalPerson | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [personData, versesData] = await Promise.all([
        getPersonById(personId),
        getVersesForPerson(personId, 30),
      ]);
      setPerson(personData);
      setVerses(versesData);
    } catch (e) {
      console.warn('Error loading character details:', e);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShare = async () => {
    if (!person) return;
    hapticLight();
    try {
      await Share.share({
        title: `${person.name_es} - El Árbol Humano en Selah`,
        message: `«${person.name_es}» (${person.display_title_es})\n\nArquetipo del Alma: ${person.archetype}\n\n${person.bio_es}\n\nDescubre más en la app bíblica Selah.`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleOpenVerseInReader = (verse: Verse) => {
    hapticSuccess();
    router.push({
      pathname: `/reader/${verse.book_id}/${verse.chapter}`,
      params: { highlightVerse: String(verse.verse) },
    } as any);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Screen safeTop safeBottom={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Cargando perfil sagrado...
          </Text>
        </View>
      </Screen>
    );
  }

  if (!person) {
    return (
      <Screen safeTop safeBottom={false}>
        <View style={styles.centerContainer}>
          <Text style={[styles.notFoundTitle, { color: theme.text }]}>
            Personaje no encontrado
          </Text>
          <TouchableOpacity
            style={[styles.backBtnPill, { backgroundColor: theme.accent }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnPillText}>Regresar a Personajes</Text>
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
            {person.name_es}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            {person.category}
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
                styles.largeAvatar,
                {
                  backgroundColor:
                    person.gender === 'F'
                      ? themeMode === 'oled'
                        ? '#2c1e28'
                        : '#fce7f3'
                      : theme.surfaceRaised,
                  borderColor:
                    person.gender === 'F' ? '#f472b6' : theme.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.largeAvatarText,
                  {
                    color:
                      person.gender === 'F' ? '#db2777' : theme.accent,
                  },
                ]}
              >
                {getInitials(person.name_es)}
              </Text>
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
                    {person.testament === 'OT'
                      ? 'Antiguo Testamento'
                      : person.testament === 'NT'
                      ? 'Nuevo Testamento'
                      : 'Canon Bíblico'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.tagBadge,
                    { backgroundColor: theme.accentMuted },
                  ]}
                >
                  <Text style={[styles.tagBadgeText, { color: theme.accent }]}>
                    {person.category}
                  </Text>
                </View>
              </View>

              <Text style={[styles.heroName, { color: theme.text }]}>
                {person.name_es}
              </Text>
              <Text style={[styles.heroTitle, { color: theme.textMuted }]}>
                {person.display_title_es}
              </Text>
            </View>
          </View>

          {/* Archetype Card Section */}
          <View
            style={[
              styles.archetypeBox,
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
            <View style={styles.archetypeBoxHeader}>
              <Compass size={16} color={theme.accent} />
              <Text style={[styles.archetypeBoxTitle, { color: theme.accent }]}>
                ARQUETIPO DEL ALMA
              </Text>
            </View>
            <Text style={[styles.archetypeBoxMain, { color: theme.text }]}>
              {person.archetype}
            </Text>
            <Text style={[styles.archetypeBoxDesc, { color: theme.textMuted }]}>
              El viaje de {person.name_es} enseña cómo la gracia de Dios se
              manifiesta a través de la fragilidad humana, la perseverancia y la fe
              en tiempos de incertidumbre.
            </Text>
          </View>
        </View>

        {/* Narrative Biography Section */}
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
            <Sparkles size={18} color={theme.accent} />
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              Perfil Biográfico e Historia Bíblica
            </Text>
          </View>
          <Text style={[styles.bioBody, { color: theme.text }]}>
            {person.bio_es}
          </Text>
        </View>

        {/* Biblical Passages Section */}
        <View style={styles.versesSection}>
          <View style={styles.sectionHeaderRow}>
            <BookOpen size={18} color={theme.accent} />
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              Pasajes y Versículos Bíblicos
            </Text>
          </View>
          <Text style={[styles.versesIntro, { color: theme.textMuted }]}>
            {verses.length > 0
              ? `Explora los versículos donde interviene ${person.name_es}. Toca cualquier pasaje para abrirlo en el lector.`
              : `Buscando menciones bíblicas de ${person.name_es}...`}
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
  largeAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  largeAvatarText: {
    fontSize: 20,
    fontWeight: '800',
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
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  archetypeBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  archetypeBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  archetypeBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  archetypeBoxMain: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 6,
  },
  archetypeBoxDesc: {
    fontSize: 12,
    lineHeight: 17,
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
  bioBody: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.2,
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
