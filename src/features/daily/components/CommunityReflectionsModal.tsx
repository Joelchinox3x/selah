import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, MessageSquare, ShieldCheck, RefreshCw, ArrowLeft, Heart, Reply } from 'lucide-react-native';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { themes, ThemePalette } from '@/src/theme/colors';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import {
  CommunityComment, loadCommunityReflections, publishCommunityReflection, formatReflectionDate,
} from '../services/communityReflections';
import { loadReflectionDraft, saveReflectionDraft, ReflectionDraft } from '../services/reflectionDrafts';
import { saveMyPublishedReflection } from '../services/myReflectionsStore';
export type { CommunityComment } from '../services/communityReflections';

interface CommunityReflectionsModalProps {
  visible: boolean;
  verseSlug: string;
  verseCitation: string;
  onClose: () => void;
  onCommentCountChange?: (count: number) => void;
  embedded?: boolean;
  onBack?: () => void;
  onGoToReader?: () => void;
}

export const CommunityReflectionsModal: React.FC<CommunityReflectionsModalProps> = ({
  visible, verseSlug, verseCitation, onClose, onCommentCountChange, embedded = false, onBack, onGoToReader,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [draft, setDraft] = useState<ReflectionDraft>({ name: '', text: '' });
  const [draftReady, setDraftReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [retry, setRetry] = useState(0);
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  useEffect(() => { setReactions({}); }, [verseSlug]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  useEffect(() => { setReplyingTo(null); }, [verseSlug]);

  const handleReplyTo = (name: string) => {
    hapticLight();
    const cleanName = name.trim();
    setReplyingTo(cleanName);
    setDraft((prev) => {
      const mention = `@${cleanName} `;
      if (prev.text.startsWith(mention)) return prev;
      return { ...prev, text: `${mention}${prev.text}` };
    });
  };
  const submitLock = useRef(false);
  const slugRef = useRef(verseSlug);
  slugRef.current = verseSlug;
  const mounted = useRef(true);
  const countCallback = useRef(onCommentCountChange);
  countCallback.current = onCommentCountChange;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setDraftReady(false);
    setDraft({ name: '', text: '' });
    setSendError('');
    setFeedback('');
    loadReflectionDraft(verseSlug).then((saved) => {
      if (active) setDraft(saved);
    }).catch(() => {
      if (active) setFeedback('El borrador no pudo recuperarse. Puedes escribir una nueva reflexión.');
    }).finally(() => { if (active) setDraftReady(true); });
    return () => { active = false; };
  }, [visible, verseSlug]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    setComments([]);
    loadCommunityReflections(verseSlug, controller.signal).then(({ comments: loaded, total }) => {
      if (!active) return;
      setComments(loaded);
      countCallback.current?.(total);
    }).catch((error) => {
      if (active) setLoadError(error instanceof Error ? error.message : 'No pudimos cargar las reflexiones.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [visible, verseSlug, retry]);

  const updateDraft = (next: ReflectionDraft) => {
    setDraft(next);
    setSendError('');
    setFeedback('');
    saveReflectionDraft(verseSlug, next).catch(() => {
      if (mounted.current && slugRef.current === verseSlug) setFeedback('No pudimos guardar el borrador en este dispositivo.');
    });
  };

  const handleSend = async () => {
    if (submitLock.current || loading || !draftReady || !draft.text.trim()) return;
    submitLock.current = true;
    setSubmitting(true);
    setSendError('');
    setFeedback('');
    hapticLight();
    const submittedSlug = verseSlug;
    const submittedDraft = draft;
    try {
      const published = await publishCommunityReflection(submittedSlug, submittedDraft.name, submittedDraft.text);
      saveMyPublishedReflection({
        id: published.id,
        verseSlug: submittedSlug,
        verseCitation,
        userName: published.userName,
        text: published.text,
        createdAt: published.createdAt || new Date().toISOString(),
      }).catch(() => undefined);
      setReplyingTo(null);
      const cleared = { name: submittedDraft.name, text: '' };
      // Persistence errors must not turn a confirmed publication into a retryable send error.
      await saveReflectionDraft(submittedSlug, cleared).catch(() => undefined);
      if (mounted.current && slugRef.current === submittedSlug) {
        setDraft(cleared);
        setLoadError('');
        setComments((current) => [published, ...current.filter((item) => item.id !== published.id)]);
        setFeedback('Reflexión publicada. Gracias por compartir.');
        hapticSuccess();
        // Get the server total rather than counting the limited visible page.
        loadCommunityReflections(submittedSlug).then(({ total }) => {
          if (mounted.current && slugRef.current === submittedSlug) countCallback.current?.(total);
        }).catch(() => undefined);
      }
    } catch (error) {
      if (mounted.current && slugRef.current === submittedSlug) {
        setSendError(error instanceof Error ? error.message : 'No se pudo publicar. Tu texto se conserva.');
      }
    } finally {
      submitLock.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };

  const pastors = comments.filter((comment) => comment.isPastor);
  const community = comments.filter((comment) => !comment.isPastor);
  const sendDisabled = loading || !draftReady || !draft.text.trim() || submitting;

  const renderComment = (item: CommunityComment) => {
    const mentionMatch = item.text.match(/^(@[^\s]+(?:\s+[^\s]+)?)(.*)/s);

    return (
      <View key={item.id} style={[styles.commentCard, item.isPastor && styles.pastoralCard]}>
        <View style={styles.commentHeader}>
          <View style={[styles.avatar, item.isPastor && styles.pastoralAvatar]}>
            <Text style={styles.avatarText}>{item.userName.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'S'}</Text>
          </View>
          <View style={styles.authorDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.userName}</Text>
              {item.isPastor && <View style={styles.pastorTag}><ShieldCheck size={12} color={theme.accent} /><Text style={styles.pastorTagText}>Pastoral</Text></View>}
            </View>
            <Text style={styles.metadata}>{item.role}</Text>
            {!!formatReflectionDate(item.createdAt) && <Text style={styles.metadata}>{formatReflectionDate(item.createdAt)}</Text>}
          </View>
        </View>

        {mentionMatch ? (
          <Text style={styles.commentBody}>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>{mentionMatch[1]}</Text>
            {mentionMatch[2]}
          </Text>
        ) : (
          <Text style={styles.commentBody}>{item.text}</Text>
        )}

        <View style={styles.commentActionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={`Responder a ${item.userName}`}
            onPress={() => handleReplyTo(item.userName)}
          >
            <Reply size={13} color={theme.textMuted} />
            <Text style={[styles.actionBtnText, { color: theme.textMuted }]}>Responder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={reactions[item.id] ? 'Quitar Amén' : 'Amén'}
            accessibilityState={{ selected: !!reactions[item.id] }}
            onPress={() => { hapticLight(); setReactions((current) => ({ ...current, [item.id]: !current[item.id] })); }}
          >
            <Heart size={14} color={theme.accent} fill={reactions[item.id] ? theme.accent : 'none'} />
            <Text style={[styles.actionBtnText, { color: theme.accent, fontWeight: '700' }]}>
              {reactions[item.id] ? 'Amén ✓' : 'Amén'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const content = (
      <View style={[styles.overlay, embedded && { backgroundColor: theme.background }]}>
        {!embedded && <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} accessibilityLabel="Cerrar muro" accessibilityRole="button" />}
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} style={[styles.avoidingWrap, { paddingTop: embedded ? 0 : insets.top + 12 }]} pointerEvents="box-none">
          <View style={[styles.sheet, { maxHeight: embedded ? undefined : height * 0.9, paddingBottom: Math.max(insets.bottom, 12) }, embedded && { borderWidth: 0, borderRadius: 0 }]}>
            {!embedded && <View style={styles.indicatorWrap}><View style={styles.dragIndicator} /></View>}
            <View style={[styles.header, embedded && { paddingTop: Math.max(insets.top + 8, 20) }]}>
              {embedded && onBack && <TouchableOpacity style={styles.closeBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Volver a la postal"><ArrowLeft size={20} color={theme.text} /></TouchableOpacity>}
              <View style={styles.headerTitles}>
                <View style={styles.headingRow}><MessageSquare size={14} color={theme.accent} /><Text style={styles.eyebrow}>MURO DE REFLEXIÓN</Text></View>
                {onGoToReader ? <TouchableOpacity onPress={onGoToReader} accessibilityRole="button" accessibilityLabel={`Leer ${verseCitation} en la Biblia`}><Text style={styles.headerTitle}>{verseCitation}</Text></TouchableOpacity> : <Text style={styles.headerTitle}>{verseCitation}</Text>}
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar reflexiones" activeOpacity={0.7}><X size={21} color={theme.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
              {loading ? (
                <View accessibilityLabel="Cargando reflexiones" accessibilityLiveRegion="polite" style={styles.stateBox}>
                  <Text style={styles.stateText}>Cargando reflexiones…</Text>
                  {[0, 1].map((key) => <View key={key} style={styles.skeletonCard}><View style={[styles.skeletonLine, { width: '55%' }]} /><View style={styles.skeletonLine} /><View style={[styles.skeletonLine, { width: '80%' }]} /></View>)}
                </View>
              ) : loadError ? (
                <View style={styles.stateBox}><Text style={styles.stateTitle}>No pudimos cargar el muro</Text><Text style={styles.stateText}>{loadError}</Text><TouchableOpacity style={[styles.retryBtn, submitting && styles.disabled]} disabled={submitting} onPress={() => setRetry((n) => n + 1)} accessibilityRole="button"><RefreshCw size={16} color={theme.accent} /><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity></View>
              ) : (
                <>
                  {pastors.length > 0 && <><Text style={styles.sectionTitle}>Reflexión pastoral</Text>{pastors.map(renderComment)}</>}
                  <Text style={styles.sectionTitle}>Reflexiones de la comunidad</Text>
                  {community.length ? community.map(renderComment) : <View style={styles.stateBox}><MessageSquare size={26} color={theme.accent} /><Text style={styles.stateTitle}>Todavía no hay reflexiones</Text><Text style={styles.stateText}>Comparte la primera reflexión sobre este versículo.</Text></View>}
                </>
              )}
            </ScrollView>
            <View style={styles.composer}>
              {replyingTo && (
                <View style={[styles.replyBanner, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}>
                  <View style={styles.replyBannerLeft}>
                    <Reply size={13} color={theme.accent} />
                    <Text style={[styles.replyBannerText, { color: theme.textMuted }]}>
                      Respondiendo a <Text style={{ color: theme.accent, fontWeight: '700' }}>{replyingTo}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Cancelar respuesta">
                    <X size={14} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.labelRow}><Text style={styles.formTitle}>Tu reflexión</Text><Text style={styles.counter}>{draft.text.length}/400</Text></View>
              <TextInput style={styles.nameInput} accessibilityLabel="Tu nombre, opcional" placeholder="Tu nombre (opcional)" placeholderTextColor={theme.textMuted} value={draft.name} onChangeText={(name) => updateDraft({ ...draft, name })} editable={draftReady && !submitting} maxLength={60} autoCapitalize="words" />
              <View style={styles.inputRow}>
                <TextInput style={styles.input} accessibilityLabel="Escribe tu reflexión" placeholder="¿Qué te inspira este versículo?" placeholderTextColor={theme.textMuted} value={draft.text} onChangeText={(text) => updateDraft({ ...draft, text })} editable={draftReady && !submitting} multiline maxLength={400} textAlignVertical="top" />
              </View>
              {!!sendError && <Text accessibilityRole="alert" style={styles.statusText}>{sendError} Tu texto se conserva.</Text>}
              {!!feedback && <Text accessibilityLiveRegion="polite" style={styles.statusText}>{feedback}</Text>}
              <TouchableOpacity style={[styles.sendBtn, sendDisabled && styles.disabled]} onPress={handleSend} disabled={sendDisabled} accessibilityRole="button" accessibilityState={{ disabled: sendDisabled, busy: submitting }} activeOpacity={0.8}>
                {submitting ? <ActivityIndicator size="small" color={theme.background} /> : <Send size={17} color={theme.background} />}
                <Text style={styles.sendText}>{submitting ? 'Publicando…' : sendError ? 'Reintentar publicación' : 'Publicar reflexión'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
  );
  return embedded ? content : (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      {content}
    </Modal>
  );
};

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  avoidingWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { flex: 1, flexShrink: 1, backgroundColor: theme.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' },
  indicatorWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  dragIndicator: { width: 38, height: 4, borderRadius: 2, backgroundColor: theme.border },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  headerTitles: { flex: 1, gap: 5 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrow: { flexShrink: 1, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: theme.accent },
  headerTitle: { fontSize: 20, lineHeight: 27, fontWeight: '700', color: theme.text },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1, minHeight: 48 },
  listContent: { padding: 18, gap: 12 },
  sectionTitle: { fontSize: 13, lineHeight: 20, fontWeight: '700', color: theme.textMuted, marginTop: 4 },
  commentCard: { backgroundColor: theme.cardBackground, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: theme.borderSubtle, gap: 12 },
  pastoralCard: { borderColor: theme.accent, backgroundColor: theme.accentMuted },
  commentHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  pastoralAvatar: { backgroundColor: theme.cardBackground },
  avatarText: { fontSize: 12, fontWeight: '700', color: theme.accent },
  authorDetails: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  userName: { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: '700', color: theme.text },
  pastorTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pastorTagText: { fontSize: 10, fontWeight: '700', color: theme.accent },
  metadata: { fontSize: 11, lineHeight: 16, color: theme.textMuted },
  commentActionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4 },
  actionBtn: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: theme.surfaceRaised },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
  reaction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 6, paddingHorizontal: 8 },
  commentBody: { fontSize: 15, lineHeight: 23, color: theme.text },
  replyBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginBottom: 2 },
  replyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  replyBannerText: { fontSize: 12 },
  stateBox: { paddingVertical: 18, gap: 12, alignItems: 'center' },
  stateTitle: { fontSize: 15, lineHeight: 22, fontWeight: '600', textAlign: 'center', color: theme.text },
  stateText: { fontSize: 13, lineHeight: 20, textAlign: 'center', color: theme.textMuted },
  retryBtn: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  retryText: { color: theme.accent, fontWeight: '700', fontSize: 13 },
  skeletonCard: { width: '100%', backgroundColor: theme.cardBackground, borderRadius: 16, padding: 16, gap: 12 },
  skeletonLine: { width: '100%', height: 12, borderRadius: 6, backgroundColor: theme.surfaceRaised },
  composer: { paddingHorizontal: 18, paddingTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: theme.borderSubtle, backgroundColor: theme.surface },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  formTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
  counter: { fontSize: 11, color: theme.textMuted },
  nameInput: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.cardBackground, color: theme.text },
  inputRow: { flexDirection: 'row' },
  input: { flex: 1, minHeight: 72, maxHeight: 112, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, lineHeight: 21, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.cardBackground, color: theme.text },
  statusText: { fontSize: 12, lineHeight: 18, color: theme.text },
  sendBtn: { minHeight: 44, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.accent },
  sendText: { flexShrink: 1, textAlign: 'center', fontSize: 13, fontWeight: '700', color: theme.background },
  disabled: { opacity: 0.45 },
});
