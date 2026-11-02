import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Heart,
  ChevronRight,
  BookOpen,
  Trash2,
  X,
  Compass,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { getMoodCatalog } from '@/src/services/db/bibleDb';
import { getAllMoodLogs, deleteMoodLog } from '@/src/services/db/userDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { MoodCatalogItem, MoodLog, MoodKey } from '@/src/types/bible';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

export default function MoodScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [moods, setMoods] = useState<MoodCatalogItem[]>([]);
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<MoodLog | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const moodIcons: Record<string, string> = {
    anxiety: '🗂️',
    sadness: '🌧️',
    gratitude: '🤲',
    exhaustion: '🌙',
    doubt: '📖',
    anger: '🎙️',
    peace: '🪴',
    fear: '🛡️',
    marriage: '💍',
    finances: '🌱',
    healing: '🌿',
    loneliness: '🕯️',
  };

  const loadData = useCallback(async () => {
    try {
      const [moodList, logList] = await Promise.all([
        getMoodCatalog(),
        getAllMoodLogs(),
      ]);
      setMoods(moodList);
      setLogs(logList);
    } catch (e) {
      console.warn('Error loading mood data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenMoodModal = (key: MoodKey) => {
    hapticLight();
    router.push(`/mood/${key}` as any);
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* 1. Official Header with Selah logo & search/profile actions */}
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
        {/* 2. Serene Screen Title */}
        <Text style={[styles.mainTitle, { color: theme.text }]}>
          Paz para tu Corazón
        </Text>
        <Text style={[styles.mainSubtitle, { color: theme.textMuted }]}>
          Elige cómo te sientes hoy y encuentra promesas bíblicas, oración y descanso.
        </Text>

        {/* 3. Hero Banner Card: Acompañamiento Guiado */}
        <TouchableOpacity
          style={styles.journeyHeroBanner}
          onPress={() => handleOpenMoodModal('anxiety')}
          activeOpacity={0.85}
        >
          <Image
            source={require('@/assets/images/bible_journal.jpg')}
            style={styles.journeyHeroImage}
            resizeMode="cover"
          />
          <View style={styles.journeyOverlay}>
            <View style={styles.journeyBadgeRow}>
              <Text style={styles.journeyBadgeText}>ACOMPAÑAMIENTO GUIADO</Text>
              <View style={styles.readTimeBadge}>
                <Text style={styles.readTimeText}>⏱ 4 min de lectura</Text>
              </View>
            </View>
            <View>
              <Text style={styles.journeyHeroTitle}>Tu viaje de paz</Text>
              <Text style={styles.journeyHeroSub}>
                Toca aquí o en cualquier estado de ánimo para iniciar
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 4. Section Header: Estados de Ánimo */}
        <View style={styles.gridSectionHeader}>
          <Text style={[styles.gridTitle, { color: theme.text }]}>
            ¿CÓMO ESTÁ TU CORAZÓN HOY?
          </Text>
          <Text style={[styles.gridCount, { color: theme.accent }]}>
            {moods.length} disponibles
          </Text>
        </View>

        {/* 5. Miniaturas Grid: Tapping opens the horizontal sliding modal */}
        <View style={styles.gridContainer}>
          {moods.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.gridCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={() => handleOpenMoodModal(m.key as MoodKey)}
              activeOpacity={0.75}
            >
              <View style={styles.gridCardTopRow}>
                <Text style={styles.gridCardIcon}>
                  {moodIcons[m.key] || '🌱'}
                </Text>
                <ChevronRight size={14} color={theme.textMuted} />
              </View>
              <Text style={[styles.gridCardLabel, { color: theme.text }]}>
                {m.label}
              </Text>
              <Text
                style={[styles.gridCardTagline, { color: theme.textMuted }]}
                numberOfLines={2}
              >
                {m.tagline}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner: El Árbol Humano y Arquetipos del Alma */}
        <TouchableOpacity
          style={[
            styles.charactersBanner,
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
          <View style={styles.charactersBannerLeft}>
            <View
              style={[
                styles.charactersIconCircle,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? '#1e293b'
                      : 'rgba(217, 119, 6, 0.1)',
                },
              ]}
            >
              <Compass size={22} color={theme.accent} />
            </View>
            <View style={styles.charactersTextWrapper}>
              <Text style={[styles.charactersTag, { color: theme.accent }]}>
                ARQUETIPOS DEL ALMA • 37 PERSONAJES
              </Text>
              <Text style={[styles.charactersTitle, { color: theme.text }]}>
                El Árbol Humano
              </Text>
              <Text
                style={[styles.charactersSubtitle, { color: theme.textMuted }]}
                numberOfLines={2}
              >
                ¿Sientes miedo, afán, culpa o soledad? Descubre cómo David, Elías, Rut y Pedro encontraron paz en Dios.
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.accent} />
        </TouchableOpacity>

        {/* 6. Bitácora de paz reciente (Mood logs) */}
        {logs.length > 0 && (
          <View style={styles.logsSection}>
            <View style={styles.logsSectionHeader}>
              <Heart size={16} color={theme.accent} />
              <Text style={[styles.logsSectionTitle, { color: theme.text }]}>
                Tu camino de paz reciente
              </Text>
            </View>

            {logs.slice(0, 5).map((log) => {
              const date = new Date(log.created_at);
              const formattedDate = date.toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
              });

              const moodObj = moods.find((m) => m.key === log.mood_key);
              const moodName = moodObj ? moodObj.label : 'Momento de paz';
              const moodEmoji = moodIcons[log.mood_key] || '🕊️';

              return (
                <TouchableOpacity
                  key={log.id}
                  style={[
                    styles.logItem,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setSelectedLog(log);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.logLeft}>
                    <Sparkles size={14} color={theme.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.logMood, { color: theme.text }]}>
                        {moodEmoji} {moodName}
                      </Text>
                      {log.personal_note ? (
                        <Text
                          style={[styles.logNote, { color: theme.textMuted }]}
                          numberOfLines={1}
                        >
                          "{log.personal_note}"
                        </Text>
                      ) : (
                        <Text style={[styles.logNote, { color: theme.textMuted }]}>
                          Toca para ver tu momento de oración
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.logRightMeta}>
                    <Text style={[styles.logDate, { color: theme.textMuted }]}>
                      {formattedDate}
                    </Text>
                    <ChevronRight size={14} color={theme.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal de Detalle de Bitácora */}
      <Modal
        visible={!!selectedLog}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLog(null)}
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
            <View style={styles.modalTopRow}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalEmoji}>
                  {selectedLog ? (moodIcons[selectedLog.mood_key] || '🕊️') : '🕊️'}
                </Text>
                <View>
                  <Text style={[styles.modalTitleText, { color: theme.text }]}>
                    {selectedLog
                      ? moods.find((m) => m.key === selectedLog.mood_key)?.label ||
                        selectedLog.mood_key
                      : ''}
                  </Text>
                  <Text style={[styles.modalDateText, { color: theme.textMuted }]}>
                    {selectedLog
                      ? new Date(selectedLog.created_at).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedLog(null)}
                style={[styles.modalCloseCircle, { backgroundColor: theme.surfaceRaised }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.modalBodyCard,
                {
                  backgroundColor: theme.surfaceRaised,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.modalSectionTag, { color: theme.accent }]}>
                {selectedLog?.personal_note ? 'TU NOTA ÍNTIMA' : 'MOMENTO DE ENTREGA'}
              </Text>
              <Text style={[styles.modalBodyContent, { color: theme.text }]}>
                {selectedLog?.personal_note ||
                  'Completaste esta sesión meditando en las promesas bíblicas y entregando tu corazón en oración.'}
              </Text>
              <Text style={[styles.modalPrivacySub, { color: theme.textMuted }]}>
                🔒 Guardado 100% privado en la memoria de este teléfono
              </Text>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.modalDeleteBtn,
                  { borderColor: theme.borderSubtle },
                ]}
                onPress={() => {
                  if (selectedLog) {
                    hapticSuccess();
                    deleteMoodLog(selectedLog.id).then(() => {
                      setSelectedLog(null);
                      loadData();
                    });
                  }
                }}
                activeOpacity={0.8}
              >
                <Trash2 size={14} color="#EF4444" />
                <Text style={styles.modalDeleteBtnText}>Eliminar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: theme.accent },
                ]}
                onPress={() => setSelectedLog(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  mainSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 20,
  },
  journeyHeroBanner: {
    width: '100%',
    height: 150,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  journeyHeroImage: {
    width: '100%',
    height: '100%',
  },
  journeyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 16,
    justifyContent: 'space-between',
  },
  journeyBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journeyBadgeText: {
    color: '#FED7AA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  readTimeBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  readTimeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  journeyHeroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  journeyHeroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  gridSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gridCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  gridCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    minHeight: 105,
    justifyContent: 'space-between',
  },
  gridCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridCardIcon: {
    fontSize: 22,
  },
  gridCardLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  gridCardTagline: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  logsSection: {
    marginTop: 8,
  },
  logsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logMood: {
    fontSize: 13,
    fontWeight: '600',
  },
  logNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 1,
  },
  logDate: {
    fontSize: 11,
  },
  logRightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalEmoji: {
    fontSize: 28,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalDateText: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBodyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  modalSectionTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalBodyContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalPrivacySub: {
    fontSize: 10,
    marginTop: 10,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalDeleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  modalCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  charactersBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    marginBottom: 8,
  },
  charactersBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  charactersIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  charactersTextWrapper: {
    flex: 1,
  },
  charactersTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  charactersTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  charactersSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
