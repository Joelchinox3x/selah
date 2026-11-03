import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ChevronRight, BookOpen } from 'lucide-react-native';
import {
  BiblicalCuriosity,
  getCuriosityHighlightParam,
} from '@/src/features/curiosities/data/biblicalCuriosities';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface DailyCuriosityCardProps {
  curiosity: BiblicalCuriosity;
}

export const DailyCuriosityCard: React.FC<DailyCuriosityCardProps> = ({
  curiosity,
}) => {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const isDark = themeMode === 'oled';

  const handleOpenCuriosities = () => {
    hapticLight();
    router.push('/curiosities' as any);
  };

  const handleOpenReader = () => {
    hapticLight();
    router.push({
      pathname: `/reader/${curiosity.bookId}/${curiosity.chapter}`,
      params: { highlightVerse: getCuriosityHighlightParam(curiosity) },
    } as any);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
        },
      ]}
    >
      {/* Top Header Row with UI/UX Pro Max clean separation */}
      <View style={styles.topRow}>
        <View style={styles.tagWrap}>
          <View
            style={[
              styles.emojiCircle,
              {
                backgroundColor: isDark
                  ? '#1e293b'
                  : 'rgba(217, 119, 6, 0.08)',
              },
            ]}
          >
            <Text style={styles.emojiText}>{curiosity.emoji}</Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark
                  ? 'rgba(217, 119, 6, 0.15)'
                  : 'rgba(217, 119, 6, 0.08)',
              },
            ]}
          >
            <Sparkles size={11} color={theme.accent} />
            <Text style={[styles.badgeText, { color: theme.accent }]}>
              ¿SABÍAS QUÉ? · {curiosity.categoryTag}
            </Text>
          </View>
        </View>

        {curiosity.badgeValue ? (
          <View
            style={[
              styles.recordPill,
              {
                backgroundColor: isDark
                  ? '#1e293b'
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.recordPillText, { color: theme.textMuted }]}>
              {curiosity.badgeValue}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Title */}
      <TouchableOpacity onPress={handleOpenCuriosities} activeOpacity={0.85}>
        <Text style={[styles.title, { color: theme.text }]}>
          {curiosity.title}
        </Text>
      </TouchableOpacity>

      {/* Snippet / Did You Know */}
      <Text
        style={[styles.didYouKnow, { color: theme.textMuted }]}
        numberOfLines={3}
      >
        {curiosity.didYouKnow}
      </Text>

      {/* Footer Dual Actions */}
      <View
        style={[
          styles.footer,
          { borderTopColor: theme.borderSubtle },
        ]}
      >
        {/* Left: Direct Reader Link */}
        <TouchableOpacity
          style={[
            styles.verseBtn,
            {
              backgroundColor: isDark
                ? '#1e293b'
                : 'rgba(217, 119, 6, 0.08)',
            },
          ]}
          onPress={handleOpenReader}
          activeOpacity={0.8}
        >
          <BookOpen size={13} color={theme.accent} />
          <Text style={[styles.verseBtnText, { color: theme.accent }]}>
            Leer {curiosity.biblicalCitation}
          </Text>
        </TouchableOpacity>

        {/* Right: Go to Curiosities Explorer */}
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={handleOpenCuriosities}
          activeOpacity={0.7}
        >
          <Text style={[styles.seeAllText, { color: theme.text }]}>
            Explorar todas
          </Text>
          <ChevronRight size={14} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },
  emojiCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  recordPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  recordPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  didYouKnow: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  verseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verseBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
