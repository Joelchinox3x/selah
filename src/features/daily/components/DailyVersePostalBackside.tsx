import React, { useState, useEffect, useRef } from 'react';
import {
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Send,
  ArrowLeft,
  ShieldCheck,
  Heart,
  User,
} from 'lucide-react-native';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

export interface CommunityComment {
  id: string;
  userName: string;
  role: string;
  text: string;
  createdAt: string;
  isPastor?: boolean;
  likes?: number;
}

interface DailyVersePostalBacksideProps {
  verseSlug: string;
  verseCitation: string;
  verseText: string;
  onFlipToFront: () => void;
  onClose: () => void;
  onGoToReader: () => void;
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

const STORAGE_KEY_USER_NAME = '@selah_user_reflection_name_v1';

export const DailyVersePostalBackside: React.FC<DailyVersePostalBacksideProps> = ({
  verseSlug,
  verseCitation,
  verseText,
  onFlipToFront,
  onClose,
  onGoToReader,
  onCommentCountChange,
}) => {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<CommunityComment[]>(DEFAULT_SEED_COMMENTS);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  // Load saved user name
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_USER_NAME).then((saved) => {
      if (saved) setUserName(saved);
    }).catch(() => {});
  }, []);

  // Stabilize onCommentCountChange ref to prevent infinite re-render loops
  const onCommentCountChangeRef = useRef(onCommentCountChange);
  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  // Fetch comments from Cloudflare Worker API (only when verseSlug changes)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    fetch(`https://selah.boxtiove.com/api/comments?verse=${encodeURIComponent(verseSlug)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        clearTimeout(timer);
        if (!isMounted) return;
        if (data && Array.isArray(data.comments) && data.comments.length > 0) {
          setComments(data.comments);
          onCommentCountChangeRef.current?.(data.comments.length);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Comments fetch info:', err?.message || err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [verseSlug]);

  const handleToggleLikeComment = (commentId: string) => {
    hapticLight();
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || submitting) return;

    hapticLight();
    setSubmitting(true);

    const author = userName.trim() || 'Hermano/a en Cristo';
    if (author && author !== 'Hermano/a en Cristo') {
      AsyncStorage.setItem(STORAGE_KEY_USER_NAME, author).catch(() => {});
    }

    const newComment: CommunityComment = {
      id: 'local-' + Date.now(),
      userName: author,
      role: 'Comunidad Selah',
      text: trimmed,
      createdAt: 'Ahora mismo',
      isPastor: false,
    };

    // Optimistic UI update: put pastoral first if present, then newest
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
      console.warn('Error saving reflection to server:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Clean Postal Backside Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 20) }]}>
        {/* Back Arrow to flip to Front */}
        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={onFlipToFront}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Volver a la postal"
        >
          <ArrowLeft size={20} color="#f8fafc" />
        </TouchableOpacity>

        {/* Center Title */}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Muro de Reflexión</Text>
          <Text style={styles.headerCitation}>{verseCitation}</Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={() => {
            hapticLight();
            onClose();
          }}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <X size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* 2. Scrollable Content ("Baja y baja") - De frente empieza el muro */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollList}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading && comments.length === 0 && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#fbbf24" />
            <Text style={styles.loadingText}>Cargando reflexiones...</Text>
          </View>
        )}

        {/* Comments Feed - De frente empieza el muro */}
        {comments.map((item) => {
          const initials = (item.userName || 'S')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase() || 'S';
          const isLiked = !!likedComments[item.id];

          return (
            <View
              key={item.id}
              style={[
                styles.commentCard,
                item.isPastor && styles.commentCardPastor,
              ]}
            >
              <View style={styles.commentHeader}>
                <View style={styles.avatarRow}>
                  <View
                    style={[
                      styles.avatar,
                      item.isPastor && styles.avatarPastor,
                    ]}
                  >
                    <Text style={styles.avatarText}>{initials}</Text>
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

              {/* Reaction Row */}
              <View style={styles.commentFooter}>
                <TouchableOpacity
                  style={[styles.likeBtn, isLiked && styles.likeBtnActive]}
                  onPress={() => handleToggleLikeComment(item.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Heart
                    size={14}
                    color={isLiked ? '#ef4444' : '#94a3b8'}
                    fill={isLiked ? '#ef4444' : 'transparent'}
                  />
                  <Text style={[styles.likeBtnText, isLiked && styles.likeBtnTextActive]}>
                    {isLiked ? 'Amén ✓' : 'Amén'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* 3. Bottom Input Docked (Keyboard-Safe) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.inputDockWrap}
      >
        <View style={[styles.inputDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {/* Author Name Bar */}
          <View style={styles.nameBar}>
            <User size={13} color="#94a3b8" />
            {isEditingName ? (
              <TextInput
                style={styles.nameInput}
                placeholder="Tu nombre o hermano/a..."
                placeholderTextColor="#64748b"
                value={userName}
                onChangeText={setUserName}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                maxLength={30}
              />
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingName(true)}
                activeOpacity={0.7}
                style={styles.nameBtn}
              >
                <Text style={styles.nameBtnText}>
                  {userName ? `Firmando como: ${userName}` : 'Agregar tu nombre (opcional)'}
                </Text>
                <Text style={styles.nameEditHint}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Text Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
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
              onPress={handleSend}
              disabled={!inputText.trim() || submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#090d16" />
              ) : (
                <Send size={17} color={inputText.trim() ? '#090d16' : '#64748b'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090e18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0c1322',
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  headerCitation: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: 0.4,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  commentCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  commentCardPastor: {
    backgroundColor: 'rgba(251, 191, 36, 0.07)',
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarPastor: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
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
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  pastorTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#090d16',
  },
  roleText: {
    fontSize: 11,
    color: '#64748b',
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
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  likeBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  likeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  likeBtnTextActive: {
    color: '#ef4444',
  },
  inputDockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0c1322',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputDock: {
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 8,
  },
  nameBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  nameInput: {
    flex: 1,
    fontSize: 11.5,
    color: '#f8fafc',
    paddingVertical: 2,
  },
  nameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameBtnText: {
    fontSize: 11.5,
    color: '#94a3b8',
  },
  nameEditHint: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#fbbf24',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#162033',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 13,
    color: '#ffffff',
    maxHeight: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
