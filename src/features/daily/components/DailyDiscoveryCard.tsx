import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, ChevronRight, BookOpen } from 'lucide-react-native';
import { DailyDiscovery } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface DailyDiscoveryCardProps {
  discovery: DailyDiscovery | null;
  onPress: () => void;
}

export const DailyDiscoveryCard: React.FC<DailyDiscoveryCardProps> = ({
  discovery,
  onPress,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  if (!discovery) return null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
        },
      ]}
      onPress={() => {
        hapticLight();
        onPress();
      }}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeWrap}>
          <Sparkles size={13} color={theme.accent} />
          <Text style={[styles.badgeText, { color: theme.accent }]}>
            DESCUBRIMIENTO SELAH • {discovery.category.toUpperCase()}
          </Text>
        </View>

        {discovery.original_word ? (
          <View
            style={[
              styles.originalWordPill,
              {
                backgroundColor:
                  themeMode === 'oled'
                    ? '#1e293b'
                    : 'rgba(217, 119, 6, 0.08)',
              },
            ]}
          >
            <Text style={[styles.originalWordText, { color: theme.accent }]}>
              {discovery.original_word}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        {discovery.title}
      </Text>

      <Text
        style={[styles.insight, { color: theme.textMuted }]}
        numberOfLines={2}
      >
        {discovery.insight}
      </Text>

      <View
        style={[
          styles.footer,
          { borderTopColor: theme.borderSubtle },
        ]}
      >
        <View style={styles.verseInfo}>
          <BookOpen size={12} color={theme.textMuted} />
          <Text style={[styles.verseText, { color: theme.textMuted }]}>
            {discovery.book_name} {discovery.chapter}:{discovery.verse}
          </Text>
        </View>

        <View style={styles.ctaRow}>
          <Text style={[styles.ctaText, { color: theme.accent }]}>
            Ver tesoro completo
          </Text>
          <ChevronRight size={14} color={theme.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  originalWordPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  originalWordText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  insight: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  verseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verseText: {
    fontSize: 11,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
