import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticSelection } from '@/src/services/haptics/hapticFeedback';

interface ChapterSelectorModalProps {
  visible: boolean;
  bookName: string;
  totalChapters: number;
  currentChapter: number;
  onClose: () => void;
  onSelectChapter: (chapter: number) => void;
}

export const ChapterSelectorModal: React.FC<ChapterSelectorModalProps> = ({
  visible,
  bookName,
  totalChapters,
  currentChapter,
  onClose,
  onSelectChapter,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
                <View>
                  <Text style={[styles.title, { color: theme.text }]}>
                    {bookName}
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Selecciona un capítulo ({totalChapters} capítulos)
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.closeBtn}
                >
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Chapters Grid */}
              <ScrollView
                style={styles.gridScroll}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
              >
                {chapters.map((ch) => {
                  const isCurrent = ch === currentChapter;
                  return (
                    <TouchableOpacity
                      key={ch}
                      style={[
                        styles.chapterCell,
                        {
                          backgroundColor: isCurrent
                            ? theme.accent
                            : theme.surfaceRaised,
                          borderColor: isCurrent
                            ? theme.accent
                            : theme.borderSubtle,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        hapticSelection();
                        onSelectChapter(ch);
                        onClose();
                      }}
                    >
                      <Text
                        style={[
                          styles.chapterText,
                          {
                            color: isCurrent ? '#ffffff' : theme.text,
                            fontWeight: isCurrent ? '700' : '600',
                          },
                        ]}
                      >
                        {ch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  gridScroll: {
    marginTop: 14,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    paddingBottom: 20,
  },
  chapterCell: {
    width: '17.5%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterText: {
    fontSize: 15,
  },
});
