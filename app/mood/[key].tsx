import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  X,
  Sparkles,
  Heart,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Volume2,
  Lock,
  Compass,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import {
  getMoodStories,
  getMoodPrayer,
  getMoodCatalog,
  getBiblicalCharacter,
} from '@/src/services/db/bibleDb';
import { logMoodExperience } from '@/src/services/db/userDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import {
  MoodVerseStory,
  MoodPrayer,
  MoodCatalogItem,
  MoodKey,
  BiblicalCharacter,
} from '@/src/types/bible';
import { hapticSuccess, hapticLight } from '@/src/services/haptics/hapticFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SlideItem =
  | { type: 'intro'; data: MoodCatalogItem; character: BiblicalCharacter | null }
  | { type: 'verse'; data: MoodVerseStory; index: number; totalVerses: number }
  | { type: 'prayer'; data: MoodPrayer }
  | { type: 'notes'; moodKey: MoodKey };

export default function MoodStoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key: string }>();
  const moodKey = (params.key || 'anxiety') as MoodKey;

  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [catalogItem, setCatalogItem] = useState<MoodCatalogItem | null>(null);
  const [character, setCharacter] = useState<BiblicalCharacter | null>(null);
  const [stories, setStories] = useState<MoodVerseStory[]>([]);
  const [prayer, setPrayer] = useState<MoodPrayer | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [isWhispering, setIsWhispering] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSavedStatus, setNoteSavedStatus] = useState('Sin cambios pendientes');

  const flatListRef = useRef<FlatList<SlideItem>>(null);

  // Emotional validation map
  const validationMap: Record<MoodKey, { validation: string; phrase: string }> = {
    anxiety: {
      validation: '«Es natural sentir agobio; no tienes que fingir que todo está bien. Respira hondo.»',
      phrase: 'Acepta tu momento sin reproches',
    },
    sadness: {
      validation: '«Tu dolor es válido y no está pasando desapercibido. No tienes que apresurar tu consuelo.»',
      phrase: 'Permítete sentir sin juzgarte',
    },
    gratitude: {
      validation: '«Detenerse a agradecer renueva el espíritu. Celebra el don de la vida en este instante.»',
      phrase: 'Reconoce las pequeñas bondades',
    },
    exhaustion: {
      validation: '«El descanso no es una pérdida de tiempo, es un mandamiento de amor. Suelta las exigencias.»',
      phrase: 'Date permiso para reposar',
    },
    doubt: {
      validation: '«Preguntar y dudar son partes del crecimiento de la fe. Dios no se asusta de tus preguntas.»',
      phrase: 'Camina con honestidad interior',
    },
    anger: {
      validation: '«Sentir ira es humano; retenerla es lo que nos hiere. Respira y comienza a soltar la carga.»',
      phrase: 'Descarga el peso del resentimiento',
    },
    peace: {
      validation: '«Disfruta de este remanso de quietud. Permite que la serenidad llene cada rincón de tu ser.»',
      phrase: 'Permanece en calma agradecida',
    },
    fear: {
      validation: '«El miedo disminuye cuando recuerdas quién te sostiene. No estás a merced de la incertidumbre.»',
      phrase: 'Cobíjate en su fidelidad',
    },
    marriage: {
      validation: '«El amor conyugal madura con paciencia diaria, comprensión mutua y perdón generoso.»',
      phrase: 'Cultiva la ternura y el respeto en el hogar',
    },
    finances: {
      validation: '«El afán material nubla el horizonte; confía en Aquel que viste los lirios y conoce cada una de tus necesidades.»',
      phrase: 'Descansa en su provisión fiel y oportuna',
    },
    healing: {
      validation: '«Tu salud y tu cuerpo son amados por Dios; reposa hoy en su compasión restauradora.»',
      phrase: 'Recibe consuelo y renovación integral',
    },
    loneliness: {
      validation: '«Aun en el aislamiento más silencioso, el Creador te conoce por nombre y camina a tu lado.»',
      phrase: 'Cobíjate en su presencia incondicional',
    },
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [catalogList, storiesList, prayerData, charData] = await Promise.all([
          getMoodCatalog(),
          getMoodStories(moodKey),
          getMoodPrayer(moodKey),
          getBiblicalCharacter(moodKey),
        ]);

        const item = catalogList.find((c) => c.key === moodKey) || null;
        setCatalogItem(item);
        setStories(storiesList);
        setPrayer(prayerData);
        setCharacter(charData);
      } catch (e) {
        console.warn('Error loading mood story:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moodKey]);

  // Unified slides array: Intro -> Verses -> Prayer -> Notes
  const slides: SlideItem[] = useMemo(() => {
    const list: SlideItem[] = [];
    if (catalogItem) {
      list.push({ type: 'intro', data: catalogItem, character });
    }
    const totalVerses = stories.length;
    stories.forEach((st, idx) => {
      list.push({ type: 'verse', data: st, index: idx + 1, totalVerses });
    });
    if (prayer) {
      list.push({ type: 'prayer', data: prayer });
    }
    list.push({ type: 'notes', moodKey });
    return list;
  }, [catalogItem, stories, prayer, moodKey, character]);

  const totalSlides = slides.length;

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentSlide(index);
      hapticLight();
    }
  }, [slides.length]);

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    hapticLight();
    router.back();
  };

  const handleAmen = async () => {
    hapticSuccess();
    setHasPrayed(true);
    await logMoodExperience(moodKey, true);
    // Automatically advance to the notes slide
    if (currentSlide < totalSlides - 1) {
      setTimeout(() => {
        goToSlide(currentSlide + 1);
      }, 700);
    }
  };

  const handleSaveNotes = async () => {
    if (!noteContent.trim()) return;
    hapticSuccess();
    await logMoodExperience(moodKey, true, noteContent.trim());
    setNoteSavedStatus('✓ Guardado de forma privada en tu móvil');
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length && index !== currentSlide) {
      setCurrentSlide(index);
      hapticLight();
    }
  };

  if (loading) {
    return (
      <Screen style={{ backgroundColor: theme.background }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </Screen>
    );
  }

  const currentVal = validationMap[moodKey] || validationMap.anxiety;

  const renderSlide = ({ item }: { item: SlideItem }) => {
    // 1. INTRO / VALIDACIÓN SLIDE
    if (item.type === 'intro') {
      const cat = item.data;
      return (
        <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconAura,
                { backgroundColor: `${cat.color_hex}22` },
              ]}
            >
              <Sparkles size={36} color={cat.color_hex} />
            </View>

            <Text style={[styles.moodHeading, { color: theme.text }]}>
              {cat.label}
            </Text>
            <Text style={[styles.moodTagline, { color: theme.textMuted }]}>
              {cat.tagline}
            </Text>

            <View
              style={[
                styles.validationBox,
                {
                  backgroundColor: theme.surfaceRaised,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.validationText, { color: theme.text }]}>
                {currentVal.validation}
              </Text>
              <View style={styles.validationNoteRow}>
                <Compass size={13} color={theme.accent} />
                <Text style={[styles.validationNote, { color: theme.textMuted }]}>
                  {currentVal.phrase}
                </Text>
              </View>
            </View>

            {item.character ? (
              <TouchableOpacity
                style={[
                  styles.charBox,
                  {
                    backgroundColor: theme.surfaceRaised,
                    borderColor: theme.borderSubtle,
                  },
                ]}
                onPress={() => {
                  hapticLight();
                  router.push({
                    pathname: `/reader/${item.character!.book_id}/${item.character!.chapter}`,
                    params: { highlightVerse: String(item.character!.verse) },
                  } as any);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.charHeaderRow}>
                  <Text style={[styles.charTagText, { color: theme.accent }]}>
                    HISTORIA BÍBLICA: {item.character.name.toUpperCase()}
                  </Text>
                  <ChevronRight size={13} color={theme.accent} />
                </View>
                <Text style={[styles.charTitle, { color: theme.text }]} numberOfLines={1}>
                  «{item.character.title}»
                </Text>
                <Text style={[styles.charSummary, { color: theme.textMuted }]} numberOfLines={2}>
                  {item.character.summary}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryActionPill, { backgroundColor: theme.accent }]}
              onPress={() => goToSlide(1)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionPillText}>
                Comenzar Promesas de Paz
              </Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={[styles.swipeHint, { color: theme.textMuted }]}>
              ← Desliza hacia los lados para navegar →
            </Text>
          </View>
        </View>
      );
    }

    // 2. VERSE SLIDES
    if (item.type === 'verse') {
      const st = item.data;
      return (
        <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.contextBadge,
                { backgroundColor: theme.accentMuted },
              ]}
            >
              <Text style={[styles.contextBadgeText, { color: theme.accent }]}>
                Promesa {item.index} de {item.totalVerses} · {st.context_note}
              </Text>
            </View>

            <Text style={[styles.storyVerseText, { color: theme.text }]}>
              «{st.verse_text}»
            </Text>

            <Text style={[styles.storyCitation, { color: theme.accent }]}>
              — {st.book_name} {st.chapter}:{st.verse}
            </Text>

            <TouchableOpacity
              style={[
                styles.readContextBtn,
                { backgroundColor: theme.surfaceRaised },
              ]}
              onPress={() => {
                hapticLight();
                router.push({
                  pathname: `/reader/${st.book_id}/${st.chapter}`,
                  params: { highlightVerse: String(st.verse) },
                } as any);
              }}
              activeOpacity={0.8}
            >
              <BookOpen size={16} color={theme.accent} />
              <Text style={[styles.readContextText, { color: theme.text }]}>
                Leer en contexto bíblico
              </Text>
              <ChevronRight size={14} color={theme.textMuted} />
            </TouchableOpacity>

            <Text style={[styles.swipeHint, { color: theme.textMuted }]}>
              ← Desliza para la siguiente promesa →
            </Text>
          </View>
        </View>
      );
    }

    // 3. PRAYER SLIDE (Oración Serena)
    if (item.type === 'prayer') {
      const pr = item.data;
      return (
        <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.prayerIconCircle,
                { backgroundColor: theme.accentMuted },
              ]}
            >
              <Heart size={26} color={theme.accent} />
            </View>

            <Text style={[styles.prayerTitle, { color: theme.text }]}>
              {pr.title || 'Oración Serena'}
            </Text>

            <View
              style={[
                styles.prayerTextBox,
                {
                  backgroundColor: theme.surfaceRaised,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.prayerBody, { color: theme.text }]}>
                «{pr.prayer_text}»
              </Text>
            </View>

            <View style={styles.prayerControlsRow}>
              <Text style={[styles.readingStyleText, { color: theme.textMuted }]}>
                Lectura sosegada
              </Text>
              <TouchableOpacity
                style={styles.whisperToggleBtn}
                onPress={() => {
                  hapticLight();
                  setIsWhispering((prev) => !prev);
                }}
                activeOpacity={0.7}
              >
                <Volume2
                  size={14}
                  color={isWhispering ? theme.accent : theme.textMuted}
                />
                <Text
                  style={[
                    styles.whisperToggleText,
                    { color: isWhispering ? theme.accent : theme.textMuted },
                  ]}
                >
                  {isWhispering ? 'Susurrando...' : 'Escuchar susurro'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.amenButton,
                { backgroundColor: theme.accent },
                hasPrayed && { opacity: 0.8 },
              ]}
              onPress={handleAmen}
              activeOpacity={0.85}
            >
              <Text style={styles.amenButtonText}>
                {hasPrayed ? 'Amén ✨ (Paz guardada)' : 'Amén (Hacer mía esta oración)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // 4. NOTES SLIDE (Bitácora Íntima)
    return (
      <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.notesTopHeader}>
            <View
              style={[
                styles.notesIconCircle,
                { backgroundColor: theme.surfaceRaised },
              ]}
            >
              <Lock size={16} color={theme.accent} />
            </View>
            <View style={styles.notesTitleWrap}>
              <Text style={[styles.notesHeading, { color: theme.text }]}>
                Bitácora Íntima
              </Text>
              <Text style={[styles.notesPrivacyTag, { color: theme.accent }]}>
                Solo tú lo lees · Almacén local
              </Text>
            </View>
          </View>

          <Text style={[styles.notesSubtitle, { color: theme.textMuted }]}>
            Si lo deseas, deposita aquí una palabra o pensamiento. Se guardará de forma privada en tu dispositivo.
          </Text>

          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.surfaceRaised,
                color: theme.text,
                borderColor: theme.borderSubtle,
              },
            ]}
            multiline
            numberOfLines={4}
            placeholder="Escribe aquí tu sentir o una gratitud silenciosa..."
            placeholderTextColor={theme.textMuted}
            value={noteContent}
            onChangeText={setNoteContent}
          />

          <View style={styles.notesActionsRow}>
            <Text style={[styles.notesSavedLabel, { color: theme.textMuted }]}>
              {noteSavedStatus}
            </Text>
            <TouchableOpacity
              style={[styles.saveNoteBtn, { backgroundColor: '#1E293B' }]}
              onPress={handleSaveNotes}
              activeOpacity={0.8}
            >
              <Lock size={13} color="#FFFFFF" />
              <Text style={styles.saveNoteBtnText}>
                Guardar solo en este móvil
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.finishSessionBtn,
              { backgroundColor: theme.accent },
            ]}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={styles.finishSessionBtnText}>
              Concluir y salir en paz ✨
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Screen safeTop safeBottom style={{ backgroundColor: theme.background }}>
      {/* Top Segmented Progress Bar & Close */}
      <View style={styles.topBar}>
        <View style={styles.progressSegmentsRow}>
          {slides.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
              style={[
                styles.segmentBar,
                {
                  backgroundColor:
                    i <= currentSlide ? theme.accent : theme.borderSubtle,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleClose}
          style={[styles.closeBtn, { backgroundColor: theme.surfaceRaised }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <X size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Pure Native Horizontal Paging Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(_, index) => `slide-${index}`}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.carousel}
      />

      {/* Bottom Floating Navigation Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.borderSubtle,
          },
        ]}
      >
        {currentSlide > 0 ? (
          <TouchableOpacity
            style={[styles.navBtnSecondary, { backgroundColor: theme.surfaceRaised }]}
            onPress={handlePrev}
            activeOpacity={0.75}
          >
            <ChevronLeft size={18} color={theme.text} />
            <Text style={[styles.navBtnSecondaryText, { color: theme.text }]}>
              Anterior
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 88 }} />
        )}

        <View style={styles.stepIndicator}>
          <Text style={[styles.stepIndicatorText, { color: theme.textMuted }]}>
            {currentSlide + 1} de {totalSlides}
          </Text>
        </View>

        {currentSlide < totalSlides - 1 ? (
          <TouchableOpacity
            style={[styles.navBtnPrimary, { backgroundColor: theme.accent }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.navBtnPrimaryText}>
              {currentSlide === 0
                ? 'Empezar'
                : currentSlide === totalSlides - 3
                ? 'Oración'
                : currentSlide === totalSlides - 2
                ? 'Notas'
                : 'Siguiente'}
            </Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtnPrimary, { backgroundColor: theme.accent }]}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={styles.navBtnPrimaryText}>Salir</Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  progressSegmentsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  segmentBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carousel: {
    flex: 1,
  },
  slidePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  iconAura: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  moodHeading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  moodTagline: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  validationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
  },
  validationText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  validationNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  validationNote: {
    fontSize: 11,
    fontWeight: '600',
  },
  charBox: {
    width: '100%',
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  charHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  charTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  charTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  charSummary: {
    fontSize: 11,
    lineHeight: 16,
  },
  primaryActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  primaryActionPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  swipeHint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  contextBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 18,
  },
  contextBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  storyVerseText: {
    fontSize: 20,
    lineHeight: 32,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  storyCitation: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  readContextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  readContextText: {
    fontSize: 13,
    fontWeight: '700',
  },
  prayerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  prayerTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  prayerTextBox: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
  },
  prayerBody: {
    fontSize: 14,
    lineHeight: 23,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  prayerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  readingStyleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  whisperToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  whisperToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amenButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  notesTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 10,
  },
  notesIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesTitleWrap: {
    flex: 1,
  },
  notesHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  notesPrivacyTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  notesSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    width: '100%',
    marginBottom: 12,
  },
  notesInput: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 13,
    lineHeight: 19,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  notesActionsRow: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  notesSavedLabel: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  saveNoteBtn: {
    minHeight: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  finishSessionBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishSessionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  navBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stepIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
