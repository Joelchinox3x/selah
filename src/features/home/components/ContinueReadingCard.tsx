import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';

export interface LastReadInfo {
  bookName: string;
  bookId: number;
  chapter: number;
  totalChapters: number;
  lastVerse: number;
  totalVerses: number;
  snippet: string;
  progressPercent: number;
  timeLabel: string;
  readingMinutes: number;
  isCompleted: boolean;
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
    bookName,
    chapter,
    lastVerse,
    totalVerses,
    snippet,
    progressPercent,
    timeLabel,
    readingMinutes,
    isCompleted,
    nextChapter,
  } = lastReadInfo;

  return (
    <View
      style={[
        styles.continueCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: isCompleted ? '#10b981' : theme.border,
          shadowColor: '#000',
        },
      ]}
    >
      {/* 1. Header: Badge, Estimated Time & Relative Time */}
      <View style={styles.continueHeaderRow}>
        <View style={styles.headerLeftGroup}>
          <View
            style={[
              styles.continueBadge,
              { backgroundColor: theme.accentMuted },
            ]}
          >
            <BookOpen size={11} color={theme.accent} />
            <Text style={[styles.continueBadgeText, { color: theme.accent }]}>
              CONTINUAR LECTURA
            </Text>
          </View>

          {/* Reading Time Estimate Badge */}
          <View
            style={[
              styles.timeEstimateBadge,
              { backgroundColor: theme.surfaceRaised },
            ]}
          >
            <Clock size={11} color={theme.textMuted} />
            <Text style={[styles.timeEstimateText, { color: theme.textMuted }]}>
              ~{readingMinutes} min
            </Text>
          </View>
        </View>

        <Text style={[styles.continueTimeText, { color: theme.textMuted }]}>
          {timeLabel}
        </Text>
      </View>

      {/* 2. Main Title Row + Completion Toggle Checkmark */}
      <View style={styles.titleRow}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.75}
          style={styles.titleTouchable}
        >
          <Text style={[styles.continueTitle, { color: theme.text }]}>
            {bookName} {chapter}
            {lastVerse > 1 ? ` : ${lastVerse}` : ''}
          </Text>
          {lastVerse > 1 && totalVerses > 0 && (
            <Text style={[styles.versePositionHint, { color: theme.accent }]}>
              Te quedaste en el v. {lastVerse} de {totalVerses}
            </Text>
          )}
        </TouchableOpacity>

        {/* Mark as Completed Button */}
        {onToggleComplete && (
          <TouchableOpacity
            style={[
              styles.completeBtn,
              {
                backgroundColor: isCompleted
                  ? 'rgba(16, 185, 129, 0.15)'
                  : theme.surfaceRaised,
                borderColor: isCompleted ? '#10b981' : theme.borderSubtle,
              },
            ]}
            onPress={onToggleComplete}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CheckCircle2
              size={16}
              color={isCompleted ? '#10b981' : theme.textMuted}
            />
            <Text
              style={[
                styles.completeBtnText,
                { color: isCompleted ? '#10b981' : theme.textMuted },
              ]}
            >
              {isCompleted ? 'Leído' : 'Marcar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Passage Snippet (Clickable to continue) */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        <Text
          style={[styles.continueSnippet, { color: theme.textMuted }]}
          numberOfLines={2}
        >
          «{snippet}»
        </Text>
      </TouchableOpacity>

      {/* 4. Progress Telemetry */}
      <View style={styles.progressTelemetryRow}>
        <Text style={[styles.telemetryBookName, { color: theme.text }]}>
          Libro de {bookName}
        </Text>
        <Text
          style={[
            styles.telemetryPercent,
            { color: isCompleted ? '#10b981' : theme.accent },
          ]}
        >
          {progressPercent}% completado
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
              backgroundColor: isCompleted ? '#10b981' : theme.accent,
              width: `${progressPercent}%`,
            },
          ]}
        />
      </View>

      {/* 5. Action Buttons: Primary "Continuar" + Secondary "Siguiente Capítulo" */}
      <View style={styles.actionsContainer}>
        {/* Primary Action Button */}
        <TouchableOpacity
          style={[
            styles.primaryActionBtn,
            {
              backgroundColor: theme.accent,
            },
          ]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryActionBtnText}>
            {lastVerse > 1 ? `Continuar en v. ${lastVerse}` : 'Continuar lectura'}
          </Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Secondary Next Chapter Button */}
        {nextChapter !== null && onNextChapterPress && (
          <TouchableOpacity
            style={[
              styles.secondaryActionBtn,
              {
                backgroundColor: theme.surfaceRaised,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={onNextChapterPress}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.secondaryActionBtnText,
                { color: theme.text },
              ]}
            >
              Cap. {nextChapter}
            </Text>
            <ChevronRight size={14} color={theme.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  continueCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
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
    marginBottom: 10,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  continueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timeEstimateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeEstimateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  continueTimeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  titleTouchable: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  versePositionHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  completeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  continueSnippet: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 12,
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
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
