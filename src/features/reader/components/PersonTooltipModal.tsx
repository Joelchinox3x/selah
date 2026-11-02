import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  X,
  User,
} from 'lucide-react-native';
import { BiblicalPerson } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

interface PersonTooltipModalProps {
  visible: boolean;
  person: BiblicalPerson | null;
  onClose: () => void;
  onViewProfile: (person: BiblicalPerson) => void;
}

export const PersonTooltipModal: React.FC<PersonTooltipModalProps> = ({
  visible,
  person,
  onClose,
  onViewProfile,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  if (!person) return null;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenProfile = () => {
    hapticSuccess();
    onViewProfile(person);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {/* Drag handle */}
              <View style={styles.handleBar} />

              {/* Top row with avatar, name, and close button */}
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.avatar,
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
                      styles.avatarText,
                      {
                        color:
                          person.gender === 'F' ? '#db2777' : theme.accent,
                      },
                    ]}
                  >
                    {getInitials(person.name_es)}
                  </Text>
                </View>

                <View style={styles.headerTitles}>
                  <View style={styles.pillRow}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            themeMode === 'oled'
                              ? '#1e293b'
                              : 'rgba(0,0,0,0.06)',
                        },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: theme.textMuted }]}>
                        {person.testament === 'OT'
                          ? 'Antiguo T.'
                          : person.testament === 'NT'
                          ? 'Nuevo T.'
                          : 'Bíblico'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: theme.accentMuted },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: theme.accent }]}>
                        {person.category}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.personName, { color: theme.text }]}>
                    {person.name_es}
                  </Text>
                  <Text
                    style={[styles.personTitle, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    {person.display_title_es}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    hapticLight();
                    onClose();
                  }}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.surfaceRaised },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Soul Archetype Box */}
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
                        : 'rgba(217, 119, 6, 0.22)',
                  },
                ]}
              >
                <View style={styles.archetypeHeader}>
                  <Compass size={14} color={theme.accent} />
                  <Text style={[styles.archetypeLabel, { color: theme.accent }]}>
                    ARQUETIPO DEL ALMA
                  </Text>
                </View>
                <Text style={[styles.archetypeText, { color: theme.text }]}>
                  {person.archetype}
                </Text>
              </View>

              {/* Bio summary excerpt */}
              <Text
                style={[styles.bioExcerpt, { color: theme.text }]}
                numberOfLines={3}
              >
                {person.bio_es}
              </Text>

              {/* Presence Stats */}
              <View style={styles.statsRow}>
                <BookOpen size={14} color={theme.accent} />
                <Text style={[styles.statsText, { color: theme.textMuted }]}>
                  {person.verse_count > 0
                    ? `Mencionado en ${person.verse_count} versículos de las Escrituras`
                    : 'Figura presente en este pasaje bíblico'}
                </Text>
              </View>

              {/* Action Button: View Full Profile */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.accent }]}
                onPress={handleOpenProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>
                  Ver Perfil y Arquetipo Completo
                </Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150,150,150,0.3)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerTitles: {
    flex: 1,
    marginRight: 8,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  personName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  personTitle: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archetypeBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  archetypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  archetypeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  archetypeText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  bioExcerpt: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  statsText: {
    fontSize: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
