import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, MessageSquare, Heart, ShieldCheck } from 'lucide-react-native';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

export interface CommunityComment {
  id: string;
  userName: string;
  role: string;
  text: string;
  createdAt: string;
  isPastor?: boolean;
}

interface CommunityReflectionsModalProps {
  visible: boolean;
  verseSlug: string;
  verseCitation: string;
  onClose: () => void;
  onCommentCountChange?: (count: number) => void;
}

const DEFAULT_SEED_COMMENTS: CommunityComment[] = [
  {
    id: 'seed-1',
    userName: 'Ps. Guillermo Quispe C.',
    role: 'Pastor Iglesia Emanuel',
    text: 'Que la paz y la gracia del Señor sobreabunden en cada corazón que hoy medita en esta palabra viva.',
    createdAt: 'Hoy',
    isPastor: true,
  },
  {
    id: 'seed-2',
    userName: 'Hermana María Elena',
    role: 'Comunidad Selah',
    text: 'Amén. Justo la promesa que mi familia y yo necesitábamos escuchar en este día para renovar nuestras fuerzas.',
    createdAt: 'Hace 1 hora',
    isPastor: false,
  },
  {
    id: 'seed-3',
    userName: 'David M.',
    role: 'Comunidad Selah',
    text: 'La fidelidad de Dios nunca falla. Gloria al Señor por su amor incondicional que nos sostiene cada mañana.',
    createdAt: 'Hace 3 horas',
    isPastor: false,
  },
];

export const CommunityReflectionsModal: React.FC<CommunityReflectionsModalProps> = ({
  visible,
  verseSlug,
  verseCitation,
  onClose,
  onCommentCountChange,
}) => {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<CommunityComment[]>(DEFAULT_SEED_COMMENTS);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments from Cloudflare Worker
  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    fetch(`https://selah.boxtiove.com/api/comments?verse=${encodeURIComponent(verseSlug)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timer);
        if (data && Array.isArray(data.comments) && data.comments.length > 0) {
          setComments(data.comments);
          onCommentCountChange?.(data.comments.length);
        }
      })
      .catch(() => {
        // Fallback to local default comments
      })
      .finally(() => setLoading(false));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [visible, verseSlug]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || submitting) return;

    hapticLight();
    setSubmitting(true);

    const author = userName.trim() || 'Hermano/a en Cristo';
    const newComment: CommunityComment = {
      id: 'local-' + Date.now(),
      userName: author,
      role: 'Comunidad Selah',
      text: trimmed,
      createdAt: 'Ahora mismo',
      isPastor: false,
    };

    // Optimistic UI update
    const updated = [newComment, ...comments];
    setComments(updated);
    setInputText('');
    onCommentCountChange?.(updated.length);

    try {
      await fetch('https://selah.boxtiove.com/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse: verseSlug,
          userName: author,
          text: trimmed,
        }),
      });
      hapticSuccess();
    } catch (e) {
      console.warn('Error saving reflection to server, saved locally:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={styles.avoidingWrap}
        >
          <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          {/* Top Drag Indicator */}
          <View style={styles.indicatorWrap}>
            <View style={styles.dragIndicator} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <View style={styles.headerBadge}>
                <MessageSquare size={13} color="#fbbf24" />
                <Text style={styles.headerBadgeText}>MURO DE REFLEXIÓN</Text>
              </View>
              <Text style={styles.headerTitle}>{verseCitation}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                hapticLight();
                onClose();
              }}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <X size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#fbbf24" />
                <Text style={styles.loadingText}>Cargando reflexiones de la comunidad...</Text>
              </View>
            )}

            {comments.map((item) => {
              const initials = item.userName
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();

              return (
                <View
                  key={item.id}
                  style={[styles.commentCard, item.isPastor && styles.commentCardPastor]}
                >
                  <View style={styles.commentHeader}>
                    <View style={styles.avatarRow}>
                      <View
                        style={[
                          styles.avatar,
                          item.isPastor && styles.avatarPastor,
                        ]}
                      >
                        <Text style={styles.avatarText}>{initials || 'S'}</Text>
                      </View>
                      <View>
                        <View style={styles.nameRow}>
                          <Text style={styles.userName}>{item.userName}</Text>
                          {item.isPastor && (
                            <View style={styles.pastorTag}>
                              <ShieldCheck size={11} color="#090d16" />
                              <Text style={styles.pastorTagText}>Pastoral</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.roleText}>{item.role}</Text>
                      </View>
                    </View>
                    <Text style={styles.timeText}>{item.createdAt}</Text>
                  </View>

                  <Text style={styles.commentBody}>{item.text}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu reflexión o testimonio..."
              placeholderTextColor="#64748b"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={400}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() || submitting) && styles.sendBtnDisabled,
              ]}
              disabled={!inputText.trim() || submitting}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#090d16" />
              ) : (
                <Send size={18} color="#090d16" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  avoidingWrap: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0c121e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    maxHeight: '82%',
    minHeight: '55%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  indicatorWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitles: {
    gap: 3,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 18,
    gap: 14,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  commentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 10,
  },
  commentCardPastor: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPastor: {
    backgroundColor: '#b45309',
    borderColor: '#fbbf24',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  pastorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pastorTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#090d16',
    letterSpacing: 0.3,
  },
  roleText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  timeText: {
    fontSize: 11,
    color: '#64748b',
  },
  commentBody: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#e2e8f0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#090d16',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#162032',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    opacity: 0.4,
    backgroundColor: '#475569',
  },
});
