import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { X, Sparkles, Heart } from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

interface MeditationModalProps {
  visible: boolean;
  verseText: string;
  referenceText: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const MeditationModal: React.FC<MeditationModalProps> = ({
  visible,
  verseText,
  referenceText,
  onClose,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [seconds, setSeconds] = useState(60);
  const [isMeditating, setIsMeditating] = useState(true);

  useEffect(() => {
    if (!visible) {
      setSeconds(60);
      setIsMeditating(true);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          hapticSuccess();
          setIsMeditating(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Top Bar */}
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: theme.accentMuted }]}>
              <Sparkles size={12} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.accent }]}>
                Momento de Meditación
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                hapticLight();
                onClose();
              }}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceRaised }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Meditative Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            Guarda silencio y contempla
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Deja que estas palabras calen hondo en tu corazón
          </Text>

          {/* Scripture */}
          <View
            style={[
              styles.quoteBox,
              {
                backgroundColor: theme.surfaceRaised,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.verseText, { color: theme.text }]}>
              “{verseText}”
            </Text>
            <Text style={[styles.citation, { color: theme.accent }]}>
              — {referenceText} (RVR 1909)
            </Text>
          </View>

          {/* Timer Circle */}
          <View style={styles.timerWrapper}>
            <View
              style={[
                styles.timerCircle,
                {
                  borderColor: theme.accent,
                  backgroundColor: theme.accentMuted,
                },
              ]}
            >
              <Text style={[styles.timerNumber, { color: theme.text }]}>
                {formatTimer(seconds)}
              </Text>
              <Text style={[styles.timerHint, { color: theme.textMuted }]}>
                {isMeditating ? 'Respira y descansa' : 'Paz consumada'}
              </Text>
            </View>
          </View>

          {/* Footer Affirmation */}
          <View style={styles.footerRow}>
            <Heart size={14} color={theme.accent} />
            <Text style={[styles.footerText, { color: theme.textMuted }]}>
              El Señor cuida de ti en este instante
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.accent }]}
            onPress={() => {
              hapticSuccess();
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>
              {seconds === 0 ? 'Concluir Meditación ✨' : 'Guardar en mi corazón'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  quoteBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 25,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  citation: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerNumber: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  timerHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 14,
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
