import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark, FileEdit } from 'lucide-react-native';
import { VerseWithUserData, BiblicalPerson } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes, highlightColors, HighlightColor } from '@/src/theme/colors';

interface VerseItemProps {
  verse: VerseWithUserData;
  isSelected: boolean;
  onPress: (verse: VerseWithUserData) => void;
  onLongPress?: (verse: VerseWithUserData) => void;
  onNotePress?: (verse: VerseWithUserData) => void;
  people?: BiblicalPerson[];
  onPersonPress?: (person: BiblicalPerson) => void;
  lineHeightMultiplier?: number;
}

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

const toSuperscript = (num: number): string => {
  return String(num)
    .split('')
    .map((c) => SUPERSCRIPT_MAP[c] || c)
    .join('');
};

export const VerseItem: React.FC<VerseItemProps> = React.memo(
  ({
    verse,
    isSelected,
    onPress,
    onLongPress,
    onNotePress,
    people,
    onPersonPress,
    lineHeightMultiplier = 1.75,
  }) => {
    const themeMode = useSettingsStore((s) => s.theme);
    const fontSize = useSettingsStore((s) => s.fontSize);
    const theme = themes[themeMode] || themes.sepia;

    const highlight = verse.highlightColor
      ? highlightColors[verse.highlightColor as HighlightColor]
      : null;

    const containerStyle = [
      styles.container,
      highlight && { backgroundColor: highlight.background },
      isSelected && [
        styles.selectedContainer,
        {
          backgroundColor:
            themeMode === 'oled'
              ? 'rgba(217, 119, 6, 0.12)'
              : 'rgba(180, 83, 9, 0.08)',
          borderColor: theme.accent,
        },
      ],
    ];

    return (
      <TouchableOpacity
        style={containerStyle}
        activeOpacity={0.8}
        onPress={() => onPress(verse)}
        onLongPress={() => onLongPress?.(verse)}
      >
        {/* Active Selection Accent Dots (Photo 3) */}
        {isSelected && (
          <>
            <View
              style={[
                styles.dotTopLeft,
                { backgroundColor: theme.cardBackground, borderColor: theme.accent },
              ]}
            >
              <View style={[styles.dotInner, { backgroundColor: theme.accent }]} />
            </View>
            <View
              style={[
                styles.dotBottomRight,
                { backgroundColor: theme.cardBackground, borderColor: theme.accent },
              ]}
            >
              <View style={[styles.dotInner, { backgroundColor: theme.accent }]} />
            </View>
          </>
        )}

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.verseText,
              {
                fontSize,
                lineHeight: Math.round(fontSize * lineHeightMultiplier),
                color: theme.text,
              },
            ]}
          >
            <Text style={[styles.superscriptNumber, { color: theme.accent }]}>
              {toSuperscript(verse.verse)}{' '}
            </Text>
            {verse.text}
          </Text>

          {/* Indicators row for bookmarks & notes */}
          {(verse.isBookmarked || verse.hasNote) && (
            <View style={styles.metaRow}>
              {verse.isBookmarked && (
                <View style={[styles.badge, { backgroundColor: theme.accentMuted }]}>
                  <Bookmark size={11} color={theme.accent} />
                  <Text style={[styles.badgeText, { color: theme.accent }]}>
                    Guardado
                  </Text>
                </View>
              )}
              {verse.hasNote && (
                <TouchableOpacity
                  style={[styles.badge, { backgroundColor: theme.surfaceRaised }]}
                  onPress={() => onNotePress?.(verse)}
                >
                  <FileEdit size={11} color={theme.textMuted} />
                  <Text style={[styles.badgeText, { color: theme.textMuted }]}>
                    Ver nota
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Inline snippet if note content exists */}
          {verse.hasNote && verse.noteContent && (
            <TouchableOpacity
              onPress={() => onNotePress?.(verse)}
              style={[
                styles.noteBox,
                {
                  backgroundColor:
                    themeMode === 'oled' ? '#161f30' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text
                style={[styles.noteContent, { color: theme.textMuted }]}
                numberOfLines={2}
              >
                📝 {verse.noteContent}
              </Text>
            </TouchableOpacity>
          )}

          {/* Smart Reader Contextual Biblical Character Chips */}
          {people && people.length > 0 && (
            <View style={styles.peopleRow}>
              {people.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.personChip,
                    {
                      backgroundColor:
                        themeMode === 'oled'
                          ? '#162333'
                          : 'rgba(217, 119, 6, 0.08)',
                      borderColor:
                        themeMode === 'oled'
                          ? '#233852'
                          : 'rgba(217, 119, 6, 0.22)',
                    },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onPersonPress?.(p);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.personChipEmoji}>
                    {p.gender === 'F' ? '🌸' : '👤'}
                  </Text>
                  <Text
                    style={[
                      styles.personChipText,
                      {
                        color:
                          themeMode === 'oled' ? '#93c5fd' : theme.accent,
                      },
                    ]}
                  >
                    {p.name_es}
                  </Text>
                  <View
                    style={[
                      styles.personChipArchetypeDot,
                      { backgroundColor: theme.accent },
                    ]}
                  />
                  <Text
                    style={[
                      styles.personChipArchetype,
                      { color: theme.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {p.archetype.split(',')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 2,
    position: 'relative',
  },
  selectedContainer: {
    borderWidth: 1.5,
    borderRadius: 14,
  },
  dotTopLeft: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dotBottomRight: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  textContainer: {
    flex: 1,
  },
  superscriptNumber: {
    fontWeight: '800',
    fontSize: 13,
  },
  verseText: {
    letterSpacing: -0.15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noteBox: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  noteContent: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  personChipEmoji: {
    fontSize: 10,
  },
  personChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  personChipArchetypeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  personChipArchetype: {
    fontSize: 10,
    fontWeight: '500',
    maxWidth: 130,
  },
});
