import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, ShieldCheck, ArrowLeft, Heart, ChevronDown, MoreHorizontal, EyeOff } from 'lucide-react-native';
import { themes, ThemePalette } from '@/src/theme/colors';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { CommunityComment, loadCommunityReflections, publishCommunityReflection, setCommunityCommentLike, formatReflectionDate } from '../services/communityReflections';
import { getCommunityName, newCommunityRequestId } from '../services/communityIdentity';
import { loadReflectionDraft, saveReflectionDraft, ReflectionDraft } from '../services/reflectionDrafts';
import { saveMyPublishedReflection } from '../services/myReflectionsStore';
export type { CommunityComment } from '../services/communityReflections';

interface Props {
  visible: boolean; verseSlug: string; verseCitation: string; verseText?: string;
  pastoralReflection?: string; pastoralTitle?: string; pastoralTheme?: string;
  onClose: () => void; onCommentCountChange?: (count: number) => void;
  embedded?: boolean; onBack?: () => void; onGoToReader?: () => void;
}
interface Thread { comments: CommunityComment[]; cursor: string | null; loading: boolean; error: string; expanded: boolean }
const emptyThread = (): Thread => ({ comments: [], cursor: null, loading: false, error: '', expanded: true });
const mergeComments = (old: CommunityComment[], incoming: CommunityComment[]) => {
  const map = new Map(old.map((comment) => [comment.id, comment]));
  incoming.forEach((comment) => map.set(comment.id, comment));
  return [...map.values()];
};

export const CommunityReflectionsModal: React.FC<Props> = ({
  visible, verseSlug, verseCitation, verseText, pastoralReflection, pastoralTitle, pastoralTheme,
  onClose, onCommentCountChange, embedded = false, onBack, onGoToReader,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const mode = useSettingsStore((state) => state.theme);
  const theme = themes[mode] || themes.sepia;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [draft, setDraft] = useState<ReflectionDraft>({ name: '', text: '' });
  const [draftReady, setDraftReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendError, setSendError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [menuComment, setMenuComment] = useState<CommunityComment | null>(null);
  const [hiddenComments, setHiddenComments] = useState<Set<string>>(() => new Set());
  const inputRef = useRef<TextInput>(null);
  const generation = useRef(0);
  const submitLock = useRef(false);
  const pageLock = useRef(false);
  const threadLocks = useRef(new Set<string>());
  const likeLocks = useRef(new Set<string>());
  const countCallback = useRef(onCommentCountChange);
  countCallback.current = onCommentCountChange;

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    const version = ++generation.current;
    if (!visible) return;
    const controller = new AbortController();
    setLoadingMore(false); setLoading(true); setLoadError(''); setComments([]); setThreads({}); setCursor(null); setTotal(0);
    setDraftReady(false); setDraft({ name: '', text: '' }); setSendError(''); setFeedback(''); setMenuComment(null); setHiddenComments(new Set());
    Promise.all([loadReflectionDraft(verseSlug), getCommunityName()]).then(([saved, name]) => {
      if (version !== generation.current) return;
      setDraft({ ...saved, name, clientRequestId: saved.clientRequestId || newCommunityRequestId() });
    }).catch(() => { if (version === generation.current) setFeedback('No pudimos recuperar el borrador.'); })
      .finally(() => { if (version === generation.current) setDraftReady(true); });
    loadCommunityReflections(verseSlug, controller.signal).then((page) => {
      if (version !== generation.current) return;
      setComments(page.comments); setCursor(page.nextCursor); setTotal(page.total); countCallback.current?.(page.total);
    }).catch((error) => { if (version === generation.current) setLoadError(error instanceof Error ? error.message : 'No pudimos cargar los comentarios.'); })
      .finally(() => { if (version === generation.current) setLoading(false); });
    return () => { generation.current++; controller.abort(); };
  }, [visible, verseSlug, retry]);

  const updateDraft = (next: ReflectionDraft) => {
    const updated = { ...next, clientRequestId: newCommunityRequestId() };
    setDraft(updated); setSendError('');
    const version = generation.current;
    saveReflectionDraft(verseSlug, updated).catch(() => { if (version === generation.current) setFeedback('No pudimos guardar el borrador.'); });
  };
  const replyTo = (comment: CommunityComment) => {
    if (submitting || !draftReady) return;
    hapticLight();
    updateDraft({ ...draft, parentId: comment.parentId || comment.id, replyToId: comment.id, replyToName: comment.userName });
    inputRef.current?.focus();
  };
  const updateComment = (comment: CommunityComment) => {
    setComments((current) => current.map((item) => item.id === comment.id ? comment : item));
    setThreads((current) => Object.fromEntries(Object.entries(current).map(([id, thread]) => [id, { ...thread, comments: thread.comments.map((item) => item.id === comment.id ? comment : item) }])));
  };
  const likeComment = async (comment: CommunityComment) => {
    const key = `${verseSlug}:${comment.id}`;
    if (likeLocks.current.has(key)) return;
    likeLocks.current.add(key);
    const version = generation.current;
    hapticLight();
    updateComment({ ...comment, liked: !comment.liked, likes: Math.max(0, comment.likes + (comment.liked ? -1 : 1)) });
    try {
      const saved = await setCommunityCommentLike(verseSlug, comment.id, !comment.liked);
      if (version === generation.current) updateComment(saved);
    } catch {
      if (version === generation.current) { updateComment(comment); setFeedback('No se pudo guardar el Me gusta. Intenta nuevamente.'); }
    } finally { likeLocks.current.delete(key); }
  };
  const loadReplies = async (rootId: string, more = false) => {
    const key = `${verseSlug}:${rootId}`;
    if (threadLocks.current.has(key)) return;
    threadLocks.current.add(key);
    const version = generation.current;
    const previous = threads[rootId];
    setThreads((current) => ({ ...current, [rootId]: { ...(current[rootId] || emptyThread()), expanded: true, loading: true, error: '' } }));
    try {
      const page = await loadCommunityReflections(verseSlug, undefined, { parentId: rootId, cursor: more ? previous?.cursor || undefined : undefined });
      if (version !== generation.current) return;
      setThreads((current) => ({ ...current, [rootId]: { comments: mergeComments(current[rootId]?.comments || [], page.comments).sort((a, b) => Number(a.id) - Number(b.id)), cursor: page.nextCursor, loading: false, error: '', expanded: true } }));
      setTotal(page.total); countCallback.current?.(page.total);
    } catch (error) {
      if (version === generation.current) setThreads((current) => ({ ...current, [rootId]: { ...(current[rootId] || emptyThread()), loading: false, error: error instanceof Error ? error.message : 'No pudimos cargar las respuestas.' } }));
    } finally { threadLocks.current.delete(key); }
  };
  const loadMore = async () => {
    if (!cursor || pageLock.current || submitting) return;
    pageLock.current = true; setLoadingMore(true);
    const version = generation.current;
    try {
      const page = await loadCommunityReflections(verseSlug, undefined, { cursor });
      if (version === generation.current) { setComments((current) => mergeComments(current, page.comments)); setCursor(page.nextCursor); setTotal(page.total); countCallback.current?.(page.total); }
    } catch { if (version === generation.current) setFeedback('No pudimos cargar más comentarios. Intenta nuevamente.'); }
    finally { pageLock.current = false; if (version === generation.current) setLoadingMore(false); }
  };
  const handleSend = async () => {
    if (submitLock.current || loading || !draftReady || !draft.text.trim()) return;
    submitLock.current = true; setSubmitting(true); setSendError(''); setFeedback('');
    const version = generation.current;
    const sent = { ...draft, clientRequestId: draft.clientRequestId || newCommunityRequestId() };
    const slug = verseSlug;
    try {
      // Keep the same request ID on retries so a network timeout cannot duplicate a post.
      await saveReflectionDraft(slug, sent);
      const name = await getCommunityName();
      const published = await publishCommunityReflection(slug, name, sent.text, { clientRequestId: sent.clientRequestId, parentId: sent.parentId, replyToId: sent.replyToId });
      saveMyPublishedReflection({ id: published.id, verseSlug: slug, verseCitation, userName: published.userName, text: published.text, createdAt: published.createdAt }).catch(() => undefined);
      const cleared = { name, text: '', clientRequestId: newCommunityRequestId() };
      await saveReflectionDraft(slug, cleared).catch(() => undefined);
      if (version !== generation.current) return;
      setDraft(cleared); setLoadError(''); hapticSuccess();
      if (published.parentId) {
        const rootId = published.parentId;
        setThreads((current) => ({ ...current, [rootId]: { ...(current[rootId] || emptyThread()), comments: mergeComments(current[rootId]?.comments || [], [published]), expanded: true } }));
        setComments((current) => current.map((item) => item.id === rootId ? { ...item, replyCount: published.parentReplyCount ?? item.replyCount + 1 } : item));
      } else setComments((current) => mergeComments([published], current).sort((a, b) => Number(b.isPastor) - Number(a.isPastor) || Number(b.id) - Number(a.id)));
      loadCommunityReflections(slug).then((page) => { if (version === generation.current) { setTotal(page.total); countCallback.current?.(page.total); } }).catch(() => undefined);
    } catch (error) {
      if (version === generation.current) setSendError(error instanceof Error ? error.message : 'No se pudo enviar. Tu texto se conserva.');
    } finally { submitLock.current = false; setSubmitting(false); }
  };

  const hideComment = (comment: CommunityComment) => {
    hapticLight();
    setHiddenComments((current) => new Set(current).add(comment.id));
    setMenuComment(null);
  };
  const showComment = (commentId: string) => setHiddenComments((current) => {
    const next = new Set(current); next.delete(commentId); return next;
  });

  const renderComment = (item: CommunityComment, child = false) => hiddenComments.has(item.id) ? (
    <View style={[styles.hiddenComment, child && styles.child]}>
      <EyeOff size={14} color={theme.textMuted} />
      <Text style={styles.hiddenText}>Comentario oculto</Text>
      <TouchableOpacity style={styles.compactAction} hitSlop={8} onPress={() => showComment(item.id)} accessibilityRole="button"><Text style={styles.linkText}>Mostrar</Text></TouchableOpacity>
    </View>
  ) : (
    <View style={[styles.comment, child && styles.child]}>
      <View style={styles.avatar}><Text style={styles.initials}>{item.userName.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'S'}</Text></View>
      <View style={styles.commentContent}>
        <View style={styles.metaRow}>
          <View style={styles.nameRow}><Text style={styles.author}>{item.userName}</Text>{item.isPastor && <View style={styles.tag}><ShieldCheck size={12} color={theme.accent} /><Text style={styles.tagText}>Pastoral</Text></View>}<Text style={styles.date}>· {formatReflectionDate(item.createdAt)}</Text></View>
          <TouchableOpacity style={styles.menuButton} hitSlop={8} onPress={() => setMenuComment(item)} accessibilityRole="button" accessibilityLabel={`Opciones del comentario de ${item.userName}`}><MoreHorizontal size={18} color={theme.textMuted} /></TouchableOpacity>
        </View>
        {child && item.replyToName && item.replyToId !== item.parentId && <Text style={styles.replyName}>Para {item.replyToName}</Text>}
        <Text style={styles.body}>{item.text}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.compactAction} hitSlop={8} onPress={() => likeComment(item)} accessibilityRole="button" accessibilityState={{ selected: item.liked }} accessibilityLabel={`${item.liked ? 'Quitar Me gusta' : 'Me gusta'}, ${item.likes}`}>
            <Heart size={13} color={item.liked ? theme.accent : theme.textMuted} fill={item.liked ? theme.accent : 'none'} />
            <Text style={[styles.actionText, item.liked && { color: theme.accent }]}>{item.likes > 0 ? `Me gusta · ${item.likes}` : 'Me gusta'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactAction} hitSlop={8} onPress={() => replyTo(item)} accessibilityRole="button" accessibilityLabel={`Responder a ${item.userName}`}><Text style={styles.actionText}>Responder</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
  const renderThread = ({ item }: { item: CommunityComment }) => {
    const thread = threads[item.id];
    if (hiddenComments.has(item.id)) return <View style={styles.thread}>{renderComment(item)}</View>;
    return <View style={styles.thread}>
      {renderComment(item)}
      {(item.replyCount > 0 || thread) && <View style={styles.replies}>
        {thread?.expanded ? <>
          {thread.comments.map((reply) => <React.Fragment key={reply.id}>{renderComment(reply, true)}</React.Fragment>)}
          {thread.error && <Text style={styles.errorText}>{thread.error}</Text>}
          {thread.loading ? <ActivityIndicator size="small" color={theme.accent} /> : <View style={styles.replyLinks}>
            {(thread.cursor || thread.error || item.replyCount > thread.comments.length) && <TouchableOpacity style={styles.compactAction} hitSlop={8} onPress={() => loadReplies(item.id, !!thread.cursor)} accessibilityRole="button"><ChevronDown size={14} color={theme.accent} /><Text style={styles.linkText}>Ver más respuestas</Text></TouchableOpacity>}
            {!thread.comments.length && item.replyCount > 0 && !thread.error && <TouchableOpacity style={styles.compactAction} hitSlop={8} onPress={() => loadReplies(item.id)}><ChevronDown size={14} color={theme.accent} /><Text style={styles.linkText}>Ver respuestas</Text></TouchableOpacity>}
            <TouchableOpacity style={styles.compactAction} hitSlop={8} onPress={() => setThreads((current) => ({ ...current, [item.id]: { ...current[item.id], expanded: false } }))}><Text style={styles.actionText}>Ocultar respuestas</Text></TouchableOpacity>
          </View>}
        </> : <TouchableOpacity style={styles.compactAction} hitSlop={8} onPress={() => thread?.comments.length ? setThreads((current) => ({ ...current, [item.id]: { ...current[item.id], expanded: true } })) : loadReplies(item.id)} accessibilityRole="button"><ChevronDown size={14} color={theme.accent} /><Text style={styles.linkText}>Ver {item.replyCount} {item.replyCount === 1 ? 'respuesta' : 'respuestas'}</Text></TouchableOpacity>}
      </View>}
    </View>;
  };
  const sendDisabled = loading || !draftReady || submitting || !draft.text.trim();
  const content = <View style={[styles.overlay, embedded && { backgroundColor: theme.background }]}>
    {!embedded && <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar comentarios" />}
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0} style={[styles.keyboard, { paddingTop: embedded ? 0 : insets.top + 12 }]}>
      <View style={[styles.sheet, !embedded && { maxHeight: height * 0.9, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
        <View style={[styles.header, { paddingTop: embedded ? Math.max(insets.top + 8, 16) : 16 }]}>
          {onBack && <TouchableOpacity style={styles.iconButton} onPress={onBack} accessibilityRole="button" accessibilityLabel="Volver a la postal"><ArrowLeft size={21} color={theme.text} /></TouchableOpacity>}
          <View style={styles.headerTitles}><Text style={styles.headerLabel}>Muro de reflexiones</Text><TouchableOpacity onPress={onGoToReader} disabled={!onGoToReader} accessibilityRole="button"><Text style={styles.reference}>{verseCitation}</Text></TouchableOpacity></View>
          <TouchableOpacity style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar comentarios"><X size={21} color={theme.textMuted} /></TouchableOpacity>
        </View>
        <FlatList data={comments} keyExtractor={(item) => item.id} renderItem={renderThread} style={styles.list} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" initialNumToRender={8} windowSize={5}
          ListHeaderComponent={
            <View style={styles.postContext}>
              {pastoralReflection ? (
                <View style={styles.pastoralCard}>
                  <View style={styles.pastoralBadgeRow}>
                    <View style={styles.pastoralBadge}>
                      <ShieldCheck size={13} color="#d97706" />
                      <Text style={styles.pastoralBadgeText}>Reflexión Pastoral Oficial</Text>
                    </View>
                    <Text style={styles.pastoralAuthor}>Ps. Guillermo Quispe C.</Text>
                  </View>
                  {pastoralTitle ? <Text style={styles.pastoralTitle}>{pastoralTitle}</Text> : null}
                  <Text style={styles.pastoralText}>{pastoralReflection}</Text>
                </View>
              ) : null}
              <Text style={styles.countLabel}>{total} {total === 1 ? 'reflexión de la comunidad' : 'reflexiones de la comunidad'}</Text>
            </View>
          }
          ListEmptyComponent={loading ? <View style={styles.state}><ActivityIndicator color={theme.accent} /><Text style={styles.muted}>Cargando comentarios…</Text></View> : loadError ? <View style={styles.state}><Text style={styles.muted}>{loadError}</Text><TouchableOpacity style={styles.textAction} onPress={() => setRetry((current) => current + 1)} disabled={submitting}><Text style={styles.linkText}>Reintentar</Text></TouchableOpacity></View> : <View style={styles.state}><Text style={styles.muted}>Todavía no hay comentarios. Inicia la conversación.</Text></View>}
          ListFooterComponent={cursor ? <TouchableOpacity style={styles.moreButton} onPress={loadMore} disabled={loadingMore || submitting} accessibilityRole="button">{loadingMore ? <ActivityIndicator size="small" color={theme.accent} /> : <Text style={styles.linkText}>Ver más comentarios</Text>}</TouchableOpacity> : null}
        />
        <View style={[styles.composer, { paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom + 6, 16) }]}>
          {!!draft.parentId && <View style={styles.replyBanner}><Text style={styles.replyBannerText} numberOfLines={1}>Respondiendo a {draft.replyToName || 'un comentario'}</Text><TouchableOpacity style={styles.smallClose} disabled={submitting} onPress={() => updateDraft({ name: draft.name, text: draft.text })} accessibilityRole="button" accessibilityLabel="Cancelar respuesta"><X size={16} color={theme.textMuted} /></TouchableOpacity></View>}
          {!!sendError && <Text accessibilityRole="alert" style={styles.errorText}>{sendError}</Text>}
          {!!feedback && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{feedback}</Text>}
          <View style={styles.composerRow}>
            <TextInput ref={inputRef} style={styles.input} accessibilityLabel={draft.parentId ? 'Escribe una respuesta' : 'Escribe un comentario'} placeholder={draft.parentId ? 'Escribe una respuesta…' : 'Escribe un comentario…'} placeholderTextColor={theme.textMuted} value={draft.text} onChangeText={(text) => updateDraft({ ...draft, text })} editable={draftReady && !submitting} multiline maxLength={400} />
            <TouchableOpacity style={[styles.sendButton, sendDisabled && styles.disabled]} disabled={sendDisabled} onPress={handleSend} accessibilityRole="button" accessibilityLabel={submitting ? 'Enviando comentario' : 'Enviar comentario'} accessibilityState={{ busy: submitting, disabled: sendDisabled }}>{submitting ? <ActivityIndicator size="small" color={theme.background} /> : <Send size={18} color={theme.background} />}</TouchableOpacity>
          </View>
          {draft.text.length >= 350 && <Text style={styles.counter}>{draft.text.length}/400</Text>}
        </View>
      </View>
    </KeyboardAvoidingView>
    <Modal visible={!!menuComment} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setMenuComment(null)}>
      <View style={styles.menuOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setMenuComment(null)} accessibilityRole="button" accessibilityLabel="Cerrar opciones" />
        <View style={[styles.actionSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.actionSheetHandle} />
          <Text style={styles.actionSheetTitle} numberOfLines={1}>Comentario de {menuComment?.userName}</Text>
          <TouchableOpacity style={styles.actionSheetItem} onPress={() => menuComment && hideComment(menuComment)} accessibilityRole="button">
            <EyeOff size={20} color={theme.text} /><View style={styles.actionSheetCopy}><Text style={styles.actionSheetLabel}>Ocultar comentario</Text><Text style={styles.actionSheetHint}>Solo dejarás de verlo en este muro.</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setMenuComment(null)} accessibilityRole="button"><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>;
  return embedded ? content : <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>{content}</Modal>;
};

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }, keyboard: { flex: 1, justifyContent: 'flex-end' },
  sheet: { flex: 1, backgroundColor: theme.background, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, headerTitles: { flex: 1, gap: 3 },
  headerLabel: { fontSize: 18, fontWeight: '700', color: theme.text }, reference: { fontSize: 12, fontWeight: '600', color: theme.accent },
  list: { flex: 1 }, listContent: { paddingHorizontal: 14, paddingBottom: 10 },
  postContext: { paddingVertical: 8 }, countLabel: { fontSize: 12, color: theme.textMuted },
  pastoralCard: { backgroundColor: theme.surfaceRaised, borderColor: 'rgba(217, 119, 6, 0.35)', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  pastoralBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  pastoralBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(217, 119, 6, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pastoralBadgeText: { fontSize: 11, fontWeight: '700', color: '#d97706' },
  pastoralAuthor: { fontSize: 11, fontWeight: '600', color: theme.textMuted },
  pastoralTitle: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 6 },
  pastoralText: { fontSize: 13, lineHeight: 20, color: theme.text, fontStyle: 'italic', opacity: 0.95 },
  thread: { marginBottom: 5 }, comment: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, child: { marginTop: 2 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  initials: { fontSize: 10, fontWeight: '700', color: theme.accent }, commentContent: { flex: 1 },
  metaRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center' }, nameRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  author: { flexShrink: 1, fontSize: 13, lineHeight: 19, fontWeight: '700', color: theme.text }, tag: { flexDirection: 'row', alignItems: 'center', gap: 3 }, tagText: { color: theme.accent, fontSize: 10, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 20, color: theme.text, paddingRight: 4 }, replyName: { color: theme.accent, fontSize: 11, lineHeight: 16 },
  actions: { minHeight: 32, flexDirection: 'row', alignItems: 'center', columnGap: 14 },
  compactAction: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 5 }, textAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }, actionText: { fontSize: 11, fontWeight: '600', color: theme.textMuted }, date: { flexShrink: 1, fontSize: 11, color: theme.textMuted },
  menuButton: { width: 36, height: 32, alignItems: 'flex-end', justifyContent: 'center' },
  replies: { marginLeft: 30, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: theme.borderSubtle }, replyLinks: { minHeight: 32, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14 },
  hiddenComment: { minHeight: 38, marginLeft: 38, flexDirection: 'row', alignItems: 'center', gap: 7 }, hiddenText: { flex: 1, color: theme.textMuted, fontSize: 12 },
  linkText: { color: theme.accent, fontSize: 12, fontWeight: '600' }, state: { paddingVertical: 32, alignItems: 'center', gap: 14 }, muted: { color: theme.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center' }, moreButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  composer: { borderTopWidth: 1, borderTopColor: theme.borderSubtle, paddingHorizontal: 12, paddingTop: 8, backgroundColor: theme.background, gap: 6 },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 }, input: { flex: 1, minHeight: 44, maxHeight: 112, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, lineHeight: 21, borderRadius: 22, backgroundColor: theme.surfaceRaised, color: theme.text },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.text, alignItems: 'center', justifyContent: 'center' }, disabled: { opacity: 0.35 },
  replyBanner: { flexDirection: 'row', alignItems: 'center', gap: 8 }, replyBannerText: { flex: 1, fontSize: 11, color: theme.textMuted }, smallClose: { minWidth: 44, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  counter: { color: theme.textMuted, textAlign: 'right', fontSize: 10 }, errorText: { color: theme.text, fontSize: 12, lineHeight: 17 },
  menuOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.48)' },
  actionSheet: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: theme.surfaceRaised, borderTopLeftRadius: 22, borderTopRightRadius: 22 }, actionSheetHandle: { alignSelf: 'center', width: 38, height: 4, marginBottom: 12, borderRadius: 2, backgroundColor: theme.borderSubtle }, actionSheetTitle: { paddingHorizontal: 8, paddingBottom: 8, color: theme.textMuted, fontSize: 12 },
  actionSheetItem: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, borderRadius: 14, backgroundColor: theme.surface }, actionSheetCopy: { flex: 1 }, actionSheetLabel: { color: theme.text, fontSize: 15, fontWeight: '700' }, actionSheetHint: { marginTop: 2, color: theme.textMuted, fontSize: 11 }, cancelButton: { minHeight: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: theme.text, fontSize: 14, fontWeight: '600' },
});
