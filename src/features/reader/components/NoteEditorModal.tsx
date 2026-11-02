import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { X, Trash2, Check } from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticSuccess, hapticWarning } from '@/src/services/haptics/hapticFeedback';
import { VerseWithUserData } from '@/src/types/bible';

interface NoteEditorModalProps {
  visible: boolean;
  verse: VerseWithUserData | null;
  bookName: string;
  chapter: number;
  initialContent?: string;
  onClose: () => void;
  onSave: (verseNumber: number, content: string) => void;
  onDelete: (verseNumber: number) => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  visible,
  verse,
  bookName,
  chapter,
  initialContent = '',
  onClose,
  onSave,
  onDelete,
}) => {
  const [content, setContent] = useState('');
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  useEffect(() => {
    if (visible && verse) {
      setContent(initialContent || verse.noteContent || '');
    }
  }, [visible, verse, initialContent]);

  if (!verse) return null;

  const handleSave = () => {
    hapticSuccess();
    onSave(verse.verse, content);
    onClose();
  };

  const handleDelete = () => {
    hapticWarning();
    onDelete(verse.verse);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContentWrapper}
          >
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
                    Nota personal
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.accent }]}>
                    {bookName} {chapter}:{verse.verse}
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

              {/* Verse reference quote */}
              <View
                style={[
                  styles.versePreview,
                  {
                    backgroundColor: theme.cardBackground,
                    borderLeftColor: theme.accent,
                  },
                ]}
              >
                <Text
                  style={[styles.versePreviewText, { color: theme.textMuted }]}
                  numberOfLines={2}
                >
                  «{verse.text}»
                </Text>
              </View>

              {/* Text Area */}
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: theme.text,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Escribe tu reflexión, oración o pensamiento aquí..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                maxLength={1000}
                autoFocus
              />

              <View style={styles.counterRow}>
                <Text style={[styles.counterText, { color: theme.textMuted }]}>
                  {content.length}/1000 caracteres
                </Text>
              </View>

              {/* Footer buttons */}
              <View style={styles.footer}>
                {verse.hasNote ? (
                  <TouchableOpacity
                    style={[styles.deleteBtn, { borderColor: '#ef4444' }]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: theme.accent }]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 440,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  versePreview: {
    marginVertical: 12,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  versePreviewText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  counterText: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
