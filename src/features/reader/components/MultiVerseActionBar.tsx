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

  return (
    <View style={styles.floatingContainer}>
      <View
        style={[
          styles.barWrapper,
          {
            backgroundColor: themeMode === 'oled' ? '#111827' : '#1F2937',
            borderColor: theme.border,
            shadowColor: '#000',
          },
        ]}
      >
        {/* Header row: Status & Dismiss (Photo 3) */}
        <View style={styles.headerRow}>
          <View style={styles.selectionTitleRow}>
            <View style={styles.dotActive} />
            <Text style={styles.referenceText}>
              {referenceString} seleccionado
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              hapticLight();
              onClearSelection();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
          >
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Action Controls Row (Photo 3) */}
        <View style={styles.actionRow}>
          {/* Highlight Color Circles */}
          <View style={styles.resaltarSection}>
            <Text style={styles.resaltarLabel}>Resaltar:</Text>
            <View style={styles.colorsRow}>
              {(['yellow', 'green', 'pink'] as HighlightColor[]).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: highlightColors[c].dot },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticLight();
                    onApplyHighlight(c);
                  }}
                />
              ))}
              <TouchableOpacity
                style={styles.removeHighlightDot}
                onPress={() => {
                  hapticLight();
                  onRemoveHighlight();
                }}
                activeOpacity={0.7}
              >
                <Ban size={12} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons: Favorito, Nota, Crear Tarjeta */}
          <View style={styles.actionsRightGroup}>
            {/* Favorito */}
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => {
                hapticSuccess();
                onToggleBookmark();
              }}
              activeOpacity={0.75}
            >
              <Star size={16} color="#F3F4F6" />
              <Text style={styles.toolBtnText}>Favorito</Text>
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
                <FileEdit size={16} color="#F3F4F6" />
                {notesCount > 0 && (
                  <View style={styles.noteBadge}>
                    <Text style={styles.noteBadgeText}>{notesCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.toolBtnText}>Nota</Text>
            </TouchableOpacity>

            {/* Crear Tarjeta (Warm Peach Pill Button from Photo 3) */}
            <TouchableOpacity
              style={styles.createCardBtn}
              onPress={() => {
                hapticLight();
                onOpenShareModal();
              }}
              activeOpacity={0.85}
            >
              <Palette size={15} color="#1F2937" />
              <Text style={styles.createCardBtnText}>Crear Tarjeta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 14,
    right: 14,
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  },
  selectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    padding: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  resaltarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resaltarLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  removeHighlightDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 3,
  },
  toolBtnText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '600',
  },
  noteIconWrap: {
    position: 'relative',
  },
  noteBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#D97706',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  noteBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  createCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  createCardBtnText: {
    color: '#7C2D12',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
