import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, ArrowRight } from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';

export interface LastReadInfo {
  bookName: string;
  bookId: number;
  chapter: number;
  totalChapters: number;
  snippet: string;
  progressPercent: number;
  timeLabel: string;
}

interface ContinueReadingCardProps {
  lastReadInfo: LastReadInfo;
  theme: ThemePalette;
  onPress: () => void;
}

export const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({
  lastReadInfo,
  theme,
  onPress,
}) => {
  return (
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

      {/* Full-Width Pill Action Button */}
      <TouchableOpacity
        style={[
          styles.continueActionBtn,
          { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.continueActionBtnText, { color: theme.text }]}>
          Continuar lectura
        </Text>
        <ArrowRight size={16} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
