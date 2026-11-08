import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, ArrowRight, Clock, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';

export interface LastReadInfo {
  bookName: string;
  bookId: number;
  chapter: number;
  totalChapters: number;
  lastVerse: number;
  totalVerses: number;
  snippet: string;
  timeLabel: string;
  readingMinutes: number;
  isCompleted: boolean;
  hasReadingHistory: boolean;
  nextChapter: number | null;
}

interface ContinueReadingCardProps {
  lastReadInfo: LastReadInfo;
  theme: ThemePalette;
  onPress: () => void;
  onNextChapterPress?: () => void;
  onToggleComplete?: () => void;
}

export const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({
  lastReadInfo,
  theme,
  onPress,
  onNextChapterPress,
  onToggleComplete,
}) => {
  const {
    bookName, chapter, lastVerse, totalVerses, snippet, timeLabel,
    readingMinutes, isCompleted, hasReadingHistory, nextChapter,
  } = lastReadInfo;
  const reference = `${bookName} ${chapter}`;
  const positionLabel = isCompleted
    ? 'Capítulo leído'
    : hasReadingHistory && totalVerses > 0
      ? `Te quedaste en el versículo ${lastVerse} de ${totalVerses}`
      : 'Una lectura para comenzar hoy';

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.headingRow}>
        <BookOpen size={15} color={theme.accent} />
        <Text style={[styles.heading, { color: theme.accent }]}>
          {hasReadingHistory ? 'CONTINUAR LECTURA' : 'LECTURA RECOMENDADA'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${reference}${hasReadingHistory ? `, versículo ${lastVerse}` : ''}`}
        style={styles.passageLink}
      >
        <Text style={[styles.title, { color: theme.text }]}>{reference}</Text>
        <Text style={[styles.position, { color: isCompleted ? theme.accent : theme.textMuted }]}>
          {positionLabel}
        </Text>
        <Text style={[styles.snippet, { color: theme.textMuted }]} numberOfLines={2}>
          «{snippet}»
        </Text>
      </TouchableOpacity>

      <View style={[styles.details, { borderTopColor: theme.borderSubtle }]}>
        {hasReadingHistory && timeLabel && (
          <Text style={[styles.lastRead, { color: theme.textMuted }]}>{timeLabel}</Text>
        )}
        <View style={styles.durationRow}>
          <Clock size={13} color={theme.textMuted} />
          <Text style={[styles.duration, { color: theme.textMuted }]}>
            Lectura del capítulo · ~{readingMinutes} min
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryAction, { backgroundColor: theme.accent }]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.primaryLabel}>
          {isCompleted ? 'Volver al capítulo' : hasReadingHistory ? 'Continuar' : 'Comenzar lectura'}
        </Text>
        <ArrowRight size={17} color="#FFFFFF" />
      </TouchableOpacity>

      {(onToggleComplete || (nextChapter !== null && onNextChapterPress)) && (
        <View style={styles.secondaryActions}>
          {onToggleComplete && hasReadingHistory && (
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={onToggleComplete}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isCompleted }}
              accessibilityLabel={isCompleted ? `Marcar ${reference} como pendiente` : `Marcar ${reference} como leído`}
            >
              <CheckCircle2 size={18} color={isCompleted ? theme.accent : theme.textMuted} />
              <Text style={[styles.secondaryLabel, { color: isCompleted ? theme.accent : theme.textMuted }]}>
                {isCompleted ? 'Leído' : 'Marcar como leído'}
              </Text>
            </TouchableOpacity>
          )}
          {nextChapter !== null && onNextChapterPress && (
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={onNextChapterPress}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Ir a ${bookName}, capítulo ${nextChapter}`}
            >
              <Text style={[styles.secondaryLabel, { color: theme.accent }]}>Siguiente capítulo</Text>
              <ChevronRight size={16} color={theme.accent} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },
  heading: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  passageLink: {
    minHeight: 44,
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  position: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  snippet: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 12,
  },
  details: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
    gap: 6,
    marginBottom: 16,
  },
  lastRead: {
    fontSize: 12,
    lineHeight: 18,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duration: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  primaryAction: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryLabel: {
    flexShrink: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  secondaryAction: {
    flexGrow: 1,
    flexBasis: 130,
    minHeight: 44,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryLabel: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});
