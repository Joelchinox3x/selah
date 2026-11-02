import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Star,
  FileEdit,
  X,
  Palette,
  Ban,
  Check,
} from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes, highlightColors, HighlightColor } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { VerseWithUserData } from '@/src/types/bible';

interface MultiVerseActionBarProps {
  selectedVerses: VerseWithUserData[];
  bookName: string;
  chapter: number;
  onClearSelection: () => void;
  onApplyHighlight: (color: HighlightColor) => void;
  onRemoveHighlight: () => void;
  onToggleBookmark: () => void;
  onOpenNoteModal: () => void;
  onOpenShareModal: () => void;
}

const ALL_HIGHLIGHT_COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'pink'];

export const MultiVerseActionBar: React.FC<MultiVerseActionBarProps> = ({
  selectedVerses,
  bookName,
  chapter,
  onClearSelection,
  onApplyHighlight,
  onRemoveHighlight,
  onToggleBookmark,
  onOpenNoteModal,
  onOpenShareModal,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const isDark = themeMode === 'oled';

  if (selectedVerses.length === 0) return null;

  // Format reference text e.g. "Salmos 23:4" or "Salmos 23:1-3"
  const sortedVerses = [...selectedVerses].sort((a, b) => a.verse - b.verse);
  const verseNums = sortedVerses.map((v) => v.verse);
  const isConsecutive =
    verseNums.length > 1 &&
    verseNums[verseNums.length - 1] - verseNums[0] === verseNums.length - 1;
  const verseRangeText = isConsecutive
    ? `${verseNums[0]}-${verseNums[verseNums.length - 1]}`
    : verseNums.join(', ');

  const referenceString = `${bookName} ${chapter}:${verseRangeText}`;
  const notesCount = selectedVerses.filter((v) => v.hasNote).length;
  const isBookmarked = selectedVerses.length > 0 && selectedVerses.every((v) => v.isBookmarked);
  const activeColor = selectedVerses[0]?.highlightColor;

  return (
    <View style={styles.floatingContainer}>
      <View
        style={[
          styles.barWrapper,
          {
            backgroundColor: isDark ? '#0F172A' : '#1E293B',
            borderColor: isDark ? '#1E293B' : '#334155',
            shadowColor: '#000',
          },
        ]}
      >
        {/* Header Row: Title & Close Button */}
        <View style={styles.headerRow}>
          <View style={styles.selectionTitleRow}>
            <View style={styles.dotActive} />
            <Text style={styles.referenceText} numberOfLines={1}>
              {referenceString} seleccionado
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              hapticLight();
              onClearSelection();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeBtn}
          >
            <X size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Row 1: Highlighting Palette (All 4 colors + Remove) */}
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>Resaltar:</Text>
          <View style={styles.colorsGroup}>
            {ALL_HIGHLIGHT_COLORS.map((c) => {
              const isSelectedColor = activeColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: highlightColors[c].dot },
                    isSelectedColor && styles.colorDotSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticLight();
                    onApplyHighlight(c);
                  }}
                >
                  {isSelectedColor && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Remove highlight dot */}
            <TouchableOpacity
              style={styles.removeHighlightDot}
              onPress={() => {
                hapticLight();
                onRemoveHighlight();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ban size={13} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Actions Bar: Favorito, Nota, Crear Tarjeta (Balanced, never overflows) */}
        <View style={styles.actionsBottomRow}>
          {/* Favorito */}
          <TouchableOpacity
            style={[styles.toolBtn, isBookmarked && styles.toolBtnActive]}
            onPress={() => {
              hapticSuccess();
              onToggleBookmark();
            }}
            activeOpacity={0.75}
          >
            <Star
              size={16}
              color={isBookmarked ? '#F59E0B' : '#E2E8F0'}
              fill={isBookmarked ? '#F59E0B' : 'transparent'}
            />
            <Text
              style={[
                styles.toolBtnText,
                isBookmarked && { color: '#F59E0B', fontWeight: '700' },
              ]}
            >
              Favorito
            </Text>
          </TouchableOpacity>

          {/* Nota */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => {
              hapticLight();
              onOpenNoteModal();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.noteIconWrap}>
              <FileEdit size={16} color="#E2E8F0" />
              {notesCount > 0 && (
                <View style={styles.noteBadge}>
                  <Text style={styles.noteBadgeText}>{notesCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.toolBtnText}>Nota</Text>
          </TouchableOpacity>

          {/* Crear Tarjeta (High Priority, spacious and perfectly aligned) */}
          <TouchableOpacity
            style={styles.createCardBtn}
            onPress={() => {
              hapticLight();
              onOpenShareModal();
            }}
            activeOpacity={0.85}
          >
            <Palette size={15} color="#7C2D12" />
            <Text style={styles.createCardBtnText}>Crear Tarjeta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 999,
  },
  barWrapper: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  selectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  referenceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 3,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  highlightLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  colorsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  removeHighlightDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#475569',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  actionsBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 2,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 6,
    flex: 1,
  },
  toolBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  toolBtnText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  noteIconWrap: {
    position: 'relative',
  },
  noteBadge: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: '#D97706',
    borderRadius: 6,
    paddingHorizontal: 3.5,
    paddingVertical: 0.5,
  },
  noteBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  createCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FED7AA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1.4,
  },
  createCardBtnText: {
    color: '#7C2D12',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
