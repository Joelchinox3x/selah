import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, ArrowRight, ChevronRight } from 'lucide-react-native';
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
}) => {
  const {
    bookName,
    chapter,
    lastVerse,
    snippet,
    hasReadingHistory,
    nextChapter,
  } = lastReadInfo;
  const reference = `${bookName} ${chapter}`;

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {/* 1. Encabezado */}
      <View style={styles.headingRow}>
        <BookOpen size={14} color={theme.accent} />
        <Text style={[styles.heading, { color: theme.accent }]}>
          {hasReadingHistory ? 'CONTINUAR LECTURA' : 'LECTURA RECOMENDADA'}
        </Text>
      </View>

      {/* 2. Pasaje y Cita Bíblica */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${reference}${hasReadingHistory ? `, versículo ${lastVerse}` : ''}`}
        style={styles.passageLink}
      >
        <Text style={[styles.title, { color: theme.text }]}>{reference}</Text>
        <Text style={[styles.snippet, { color: theme.textMuted }]} numberOfLines={2}>
          «{snippet}»
        </Text>
      </TouchableOpacity>

      {/* 3. Fila de Botones: [ Continuar → ] [ Capítulo {nextChapter} › ] */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.primaryAction,
            { backgroundColor: theme.accent },
            nextChapter !== null && onNextChapterPress ? { flex: 1 } : { width: '100%' },
          ]}
          onPress={onPress}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.primaryLabel} numberOfLines={1}>
            {hasReadingHistory ? 'Continuar' : 'Comenzar'}
          </Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </TouchableOpacity>

        {nextChapter !== null && onNextChapterPress && (
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={onNextChapterPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Ir al capítulo ${nextChapter}`}
          >
            <Text style={[styles.secondaryBtnLabel, { color: theme.text }]} numberOfLines={1}>
              Capítulo {nextChapter}
            </Text>
            <ChevronRight size={15} color={theme.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  heading: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  passageLink: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  snippet: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryAction: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryLabel: {
    flexShrink: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnLabel: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: 13.5,
    fontWeight: '600',
  },
});
