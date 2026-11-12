import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Pin,
  PinOff,
  UserX,
  UserCheck,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Lock,
  Calendar,
  Clock,
  ShieldAlert,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { useAuthStore } from '@/src/features/auth/authStore';
import { themes } from '@/src/theme/colors';
import {
  fetchModerationOverview,
  addBlockedWord,
  deleteBlockedWord,
  unbanSuspendedUser,
  togglePinCommentRemote,
  clearSpamAttempts,
  ModerationComment,
  SuspendedUser,
  SpamAttempt,
} from '@/src/features/moderation/moderationService';
import { deleteCommunityReflection } from '@/src/features/daily/services/communityReflections';
import { suspendAuthorByName } from '@/src/features/auth/pastoralService';
import { hapticLight, hapticSuccess, hapticWarning } from '@/src/services/haptics/hapticFeedback';

type ModerationTab = 'feed' | 'pinned' | 'spam' | 'words' | 'suspended';

interface DateGroup {
  dateKey: string;
  label: string;
  items: ModerationComment[];
}

function groupCommentsByDate(comments: ModerationComment[]): DateGroup[] {
  const groupsMap = new Map<string, { label: string; items: ModerationComment[] }>();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const sorted = [...comments].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  for (const comment of sorted) {
    let dateKey = 'sin-fecha';
    let label = 'Otras Fechas';

    if (comment.createdAt) {
      const d = new Date(comment.createdAt);
      if (!isNaN(d.getTime())) {
        dateKey = d.toISOString().slice(0, 10);
        if (dateKey === todayStr) {
          label = 'Hoy';
        } else if (dateKey === yesterdayStr) {
          label = 'Ayer';
        } else {
          const formatted = d.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          });
          label = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }
      }
    }

    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, { label, items: [] });
    }
    groupsMap.get(dateKey)!.items.push(comment);
  }

  return Array.from(groupsMap.entries()).map(([dateKey, val]) => ({
    dateKey,
    label: val.label,
    items: val.items,
  }));
}

function formatCommentTime(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTimeShort(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ModerationScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const authUser = useAuthStore((s) => s.user);
  const canModerate = Boolean(
    authUser?.isPastor ||
    authUser?.isModerator ||
    authUser?.role === 'moderador' ||
    authUser?.role === 'pastor' ||
    authUser?.role === 'admin'
  );

  const [activeTab, setActiveTab] = useState<ModerationTab>('feed');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [pinnedComments, setPinnedComments] = useState<ModerationComment[]>([]);
  const [spamAttempts, setSpamAttempts] = useState<SpamAttempt[]>([]);
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);

  // Inputs locales
  const [newWordInput, setNewWordInput] = useState('');
  const [wordFilter, setWordFilter] = useState('');
  const [addingWord, setAddingWord] = useState(false);
  const [clearingSpam, setClearingSpam] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchModerationOverview();
      setBlockedWords(data.blockedWords || []);
      setComments(data.comments || []);
      setPinnedComments(data.pinnedComments || []);
      setSpamAttempts(data.spamAttempts || []);
      setSuspendedUsers(data.suspendedUsers || []);
    } catch (err: any) {
      setError(err?.message || 'Error cargando datos de moderación');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agrupación del Feed por fecha
  const dateGroups = useMemo(() => {
    return groupCommentsByDate(comments);
  }, [comments]);

  // Filtrado de palabras
  const filteredWords = useMemo(() => {
    if (!wordFilter.trim()) return blockedWords;
    const q = wordFilter.trim().toLowerCase();
    return blockedWords.filter((w) => w.toLowerCase().includes(q));
  }, [blockedWords, wordFilter]);

  // Fijar / Desfijar comentario
  const handleTogglePin = async (comment: ModerationComment) => {
    const newPinnedState = !comment.isPinned;
    hapticLight();
    try {
      await togglePinCommentRemote(comment.id, newPinnedState);
      hapticSuccess();

      // Actualizar estado local del comentario
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, isPinned: newPinnedState } : c))
      );

      if (newPinnedState) {
        setPinnedComments((prev) => [{ ...comment, isPinned: true }, ...prev.filter((c) => c.id !== comment.id)]);
        Alert.alert('Testimonio Destacado', 'Se ha fijado este testimonio para bendecir a la congregación.');
      } else {
        setPinnedComments((prev) => prev.filter((c) => c.id !== comment.id));
        Alert.alert('Testimonio Desfijado', 'El comentario continuará en el muro pero ya no está fijado.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo actualizar el estado de fijado');
    }
  };

  // Agregar palabra bloqueada
  const handleAddWord = async () => {
    const word = newWordInput.trim().toLowerCase();
    if (!word || word.length < 2) {
      Alert.alert('Aviso', 'Escribe una palabra de al menos 2 letras.');
      return;
    }
    setAddingWord(true);
    try {
      hapticLight();
      const updatedWords = await addBlockedWord(word);
      setBlockedWords(updatedWords);
      setNewWordInput('');
      hapticSuccess();
      Alert.alert('Filtro Antispam', `«${word}» se ha añadido al filtro de groserías exitosamente.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo agregar la palabra.');
    } finally {
      setAddingWord(false);
    }
  };

  // Quitar palabra bloqueada
  const handleDeleteWord = (word: string) => {
    Alert.alert(
      'Quitar del Filtro',
      `¿Deseas permitir nuevamente la palabra «${word}» en los comentarios?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            try {
              hapticWarning();
              const updatedWords = await deleteBlockedWord(word);
              setBlockedWords(updatedWords);
              hapticSuccess();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo eliminar la palabra.');
            }
          },
        },
      ]
    );
  };

  // Limpiar registro de intentos de spam
  const handleClearSpam = () => {
    if (spamAttempts.length === 0) return;
    Alert.alert(
      'Limpiar Registro de Spam',
      '¿Deseas borrar todo el historial de intentos de spam registrados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar Todo',
          style: 'destructive',
          onPress: async () => {
            setClearingSpam(true);
            try {
              hapticLight();
              await clearSpamAttempts();
              setSpamAttempts([]);
              hapticSuccess();
              Alert.alert('Registro Limpio', 'El historial de intentos de spam ha sido vaciado.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo limpiar el registro.');
            } finally {
              setClearingSpam(false);
            }
          },
        },
      ]
    );
  };

  // Reactivar usuario suspendido (Perdón y gracia)
  const handleUnbanUser = (user: SuspendedUser) => {
    Alert.alert(
      'Reactivar Hermano',
      `¿Deseas levantar la suspensión a ${user.name} (${user.email})? Podrá volver a participar en el muro.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reactivar Cuenta',
          onPress: async () => {
            try {
              hapticLight();
              await unbanSuspendedUser(user.email);
              setSuspendedUsers((prev) => prev.filter((u) => u.email !== user.email));
              hapticSuccess();
              Alert.alert('Cuenta Reactivada', `La cuenta de ${user.name} ha sido restablecida.`);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo reactivar el usuario.');
            }
          },
        },
      ]
    );
  };

  // Borrar comentario del feed
  const handleDeleteComment = (comment: ModerationComment) => {
    Alert.alert(
      'Moderar y Borrar Comentario',
      `¿Deseas eliminar este comentario de ${comment.userName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              hapticLight();
              await deleteCommunityReflection(comment.verseSlug, comment.id);
              setComments((prev) => prev.filter((c) => c.id !== comment.id));
              setPinnedComments((prev) => prev.filter((c) => c.id !== comment.id));
              hapticSuccess();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo borrar el comentario.');
            }
          },
        },
      ]
    );
  };

  // Suspender autor desde comentario o intento de spam
  const handleSuspendAuthor = (userName: string) => {
    Alert.alert(
      'Suspender Autor',
      `¿Deseas suspender a ${userName}? No podrá volver a comentar en la congregación.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Suspender',
          style: 'destructive',
          onPress: async () => {
            try {
              hapticWarning();
              await suspendAuthorByName(userName);
              setComments((prev) => prev.filter((c) => c.userName !== userName));
              setPinnedComments((prev) => prev.filter((c) => c.userName !== userName));
              hapticSuccess();
              Alert.alert('Autor Suspendido', `Se ha bloqueado la cuenta de ${userName}.`);
              loadData(true);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo suspender al autor.');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen safeTop safeBottom={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* HEADER SUPERIOR */}
        <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver a Ajustes"
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.text }]}>Panel de Moderación</Text>
              <View style={[styles.roleBadge, { backgroundColor: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.35)' }]}>
                <ShieldCheck size={12} color="#0ea5e9" />
                <Text style={[styles.roleBadgeText, { color: '#0ea5e9' }]}>Líder / Mod</Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Control del muro de reflexiones, spam y testimonios.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadData(true)}
            disabled={refreshing}
            accessibilityRole="button"
            accessibilityLabel="Actualizar datos"
          >
            <RefreshCw size={19} color={refreshing ? '#0ea5e9' : theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* BARRA DE PESTAÑAS HORIZONTAL (ESPACIO MAXIMIZADO) */}
        <View style={styles.tabBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarContent}
          >
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]}
              onPress={() => { hapticLight(); setActiveTab('feed'); }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'feed' && styles.tabBtnTextActive]}>
                💬 Feed por Fechas ({comments.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'pinned' && styles.tabBtnActivePinned]}
              onPress={() => { hapticLight(); setActiveTab('pinned'); }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'pinned' && styles.tabBtnTextActivePinned]}>
                📌 Destacados ({pinnedComments.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'spam' && styles.tabBtnActiveSpam]}
              onPress={() => { hapticLight(); setActiveTab('spam'); }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'spam' && styles.tabBtnTextActiveSpam]}>
                🚨 Intentos de Spam ({spamAttempts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'words' && styles.tabBtnActiveWords]}
              onPress={() => { hapticLight(); setActiveTab('words'); }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'words' && styles.tabBtnTextActiveWords]}>
                🚫 Filtro Palabras ({blockedWords.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'suspended' && styles.tabBtnActive]}
              onPress={() => { hapticLight(); setActiveTab('suspended'); }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'suspended' && styles.tabBtnTextActive]}>
                🔒 Suspendidos ({suspendedUsers.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Cargando panel de moderación…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <AlertTriangle size={36} color="#ef4444" />
            <Text style={[styles.errorTitle, { color: theme.text }]}>No se pudo cargar</Text>
            <Text style={[styles.errorSubtitle, { color: theme.textMuted }]}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ============================================================== */}
            {/* TAB 1: FEED DE REFLEXIONES AGRUPADO POR FECHA                   */}
            {/* ============================================================== */}
            {activeTab === 'feed' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionHeaderTitle}>
                    💬 Muro Global de Reflexiones
                  </Text>
                  <Text style={styles.sectionCounterBadge}>{comments.length} en total</Text>
                </View>
                <Text style={styles.sectionHeaderSubtitle}>
                  Organizado cronológicamente por fecha de publicación.
                </Text>

                {dateGroups.map((group) => (
                  <View key={group.dateKey} style={styles.dateGroupContainer}>
                    {/* Header de Fecha */}
                    <View style={styles.dateHeader}>
                      <View style={styles.dateHeaderLeft}>
                        <Calendar size={14} color="#0ea5e9" />
                        <Text style={styles.dateHeaderTitle}>{group.label}</Text>
                      </View>
                      <View style={styles.dateGroupCountPill}>
                        <Text style={styles.dateGroupCountText}>
                          {group.items.length} {group.items.length === 1 ? 'reflexión' : 'reflexiones'}
                        </Text>
                      </View>
                    </View>

                    {/* Comentarios de esa fecha */}
                    <View style={styles.commentsList}>
                      {group.items.map((item) => (
                        <View
                          key={item.id}
                          style={[styles.commentCard, item.isPinned && styles.commentCardPinned]}
                        >
                          <View style={styles.commentCardHeader}>
                            <View style={styles.commentAuthorCol}>
                              <View style={styles.commentAuthorRow}>
                                <Text style={styles.commentAuthor}>{item.userName}</Text>
                                {item.isPastor && (
                                  <View style={[styles.miniBadge, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                                    <ShieldCheck size={11} color="#d97706" />
                                    <Text style={[styles.miniBadgeText, { color: '#d97706' }]}>Pastor</Text>
                                  </View>
                                )}
                                {item.role === 'Líder / Moderador' && !item.isPastor && (
                                  <View style={[styles.miniBadge, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                                    <ShieldCheck size={11} color="#0ea5e9" />
                                    <Text style={[styles.miniBadgeText, { color: '#0ea5e9' }]}>Líder</Text>
                                  </View>
                                )}
                              </View>
                              <View style={styles.commentMetaRow}>
                                <Text style={styles.commentVerseTag}>📖 {item.verseSlug}</Text>
                                {item.createdAt ? (
                                  <View style={styles.commentTimeRow}>
                                    <Clock size={10} color="#64748b" />
                                    <Text style={styles.commentTimeText}>
                                      {formatCommentTime(item.createdAt)}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                            </View>

                            {item.isPinned && (
                              <View style={styles.pinnedBadge}>
                                <Pin size={11} color="#fbbf24" />
                                <Text style={styles.pinnedBadgeText}>Destacado</Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.commentBody}>{item.text}</Text>

                          {/* Acciones de Moderación */}
                          <View style={styles.commentActionsRow}>
                            <TouchableOpacity
                              style={[styles.commentActionBtn, item.isPinned && styles.commentActionBtnPinned]}
                              onPress={() => handleTogglePin(item)}
                            >
                              {item.isPinned ? (
                                <>
                                  <PinOff size={13} color="#fbbf24" />
                                  <Text style={[styles.commentActionText, { color: '#fbbf24' }]}>
                                    Desfijar
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <Pin size={13} color="#0ea5e9" />
                                  <Text style={[styles.commentActionText, { color: '#0ea5e9' }]}>
                                    Destacar
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.commentActionBtn}
                              onPress={() => handleDeleteComment(item)}
                            >
                              <Trash2 size={13} color="#ef4444" />
                              <Text style={[styles.commentActionText, { color: '#ef4444' }]}>
                                Borrar
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.commentActionBtn}
                              onPress={() => handleSuspendAuthor(item.userName)}
                            >
                              <UserX size={13} color="#f59e0b" />
                              <Text style={[styles.commentActionText, { color: '#f59e0b' }]}>
                                Suspender
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {comments.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <MessageSquare size={36} color="#64748b" />
                    <Text style={styles.emptyTitle}>No hay reflexiones en el muro</Text>
                    <Text style={styles.emptySubtitle}>
                      Las publicaciones de la congregación aparecerán aquí agrupadas por fecha.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 2: GESTOR DE TESTIMONIOS DESTACADOS                        */}
            {/* ============================================================== */}
            {activeTab === 'pinned' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionHeaderTitle}>
                    📌 Gestor de Testimonios Destacados
                  </Text>
                  <Text style={[styles.sectionCounterBadge, { backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }]}>
                    {pinnedComments.length} fijados
                  </Text>
                </View>
                <Text style={styles.sectionHeaderSubtitle}>
                  Reflexiones y testimonios fijados en la parte superior de cada pasaje para edificación de todos.
                </Text>

                <View style={styles.commentsList}>
                  {pinnedComments.map((item) => (
                    <View key={item.id} style={[styles.commentCard, styles.commentCardPinned]}>
                      <View style={styles.commentCardHeader}>
                        <View style={styles.commentAuthorCol}>
                          <View style={styles.commentAuthorRow}>
                            <Text style={styles.commentAuthor}>{item.userName}</Text>
                            {item.isPastor && (
                              <View style={[styles.miniBadge, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                                <ShieldCheck size={11} color="#d97706" />
                                <Text style={[styles.miniBadgeText, { color: '#d97706' }]}>Pastor</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.commentVerseTag}>📖 {item.verseSlug}</Text>
                        </View>
                        <View style={styles.pinnedBadge}>
                          <Pin size={11} color="#fbbf24" />
                          <Text style={styles.pinnedBadgeText}>Fijado Oficial</Text>
                        </View>
                      </View>

                      <Text style={styles.commentBody}>{item.text}</Text>

                      <View style={styles.commentActionsRow}>
                        <TouchableOpacity
                          style={[styles.commentActionBtn, styles.commentActionBtnPinned]}
                          onPress={() => handleTogglePin(item)}
                        >
                          <PinOff size={13} color="#fbbf24" />
                          <Text style={[styles.commentActionText, { color: '#fbbf24' }]}>
                            Desfijar Testimonio
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.commentActionBtn}
                          onPress={() => handleDeleteComment(item)}
                        >
                          <Trash2 size={13} color="#ef4444" />
                          <Text style={[styles.commentActionText, { color: '#ef4444' }]}>
                            Borrar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {pinnedComments.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Pin size={36} color="#fbbf24" />
                      <Text style={styles.emptyTitle}>Sin testimonios destacados</Text>
                      <Text style={styles.emptySubtitle}>
                        Puedes entrar a la pestaña «Feed por Fechas» y pulsar «Destacar» en cualquier comentario edificante.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 3: REGISTRO DE INTENTOS DE SPAM & GROSERÍAS               */}
            {/* ============================================================== */}
            {activeTab === 'spam' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionHeaderTitle}>
                    🚨 Registro de Intentos de Spam
                  </Text>
                  {spamAttempts.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSpamBtn}
                      onPress={handleClearSpam}
                      disabled={clearingSpam}
                    >
                      <Trash2 size={12} color="#ef4444" />
                      <Text style={styles.clearSpamBtnText}>Limpiar Historial</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.sectionHeaderSubtitle}>
                  Intentos de publicación que fueron bloqueados automáticamente por contener groserías o insultos.
                </Text>

                <View style={styles.commentsList}>
                  {spamAttempts.map((attempt) => (
                    <View key={attempt.id} style={styles.spamCard}>
                      <View style={styles.spamCardHeader}>
                        <View style={styles.spamAuthorCol}>
                          <View style={styles.commentAuthorRow}>
                            <ShieldAlert size={14} color="#ef4444" />
                            <Text style={styles.spamAuthorName}>{attempt.userName || 'Usuario Anónimo'}</Text>
                          </View>
                          <Text style={styles.spamVerseTag}>📖 {attempt.verseSlug}</Text>
                        </View>
                        <Text style={styles.spamDateText}>
                          {formatDateTimeShort(attempt.createdAt)}
                        </Text>
                      </View>

                      {/* Pill de la palabra detectada */}
                      <View style={styles.spamDetectedPill}>
                        <Text style={styles.spamDetectedPillLabel}>Palabra Bloqueada:</Text>
                        <View style={styles.spamDetectedWordTag}>
                          <Text style={styles.spamDetectedWordText}>«{attempt.detectedWord}»</Text>
                        </View>
                      </View>

                      {/* Texto del intento */}
                      <View style={styles.spamAttemptQuote}>
                        <Text style={styles.spamAttemptQuoteText}>
                          "{attempt.attemptedText}"
                        </Text>
                      </View>

                      {/* Acciones */}
                      <View style={styles.spamActionsRow}>
                        <TouchableOpacity
                          style={styles.spamSuspendBtn}
                          onPress={() => handleSuspendAuthor(attempt.userName)}
                        >
                          <UserX size={13} color="#ef4444" />
                          <Text style={styles.spamSuspendBtnText}>Suspender Usuario</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {spamAttempts.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Sparkles size={36} color="#10b981" />
                      <Text style={styles.emptyTitle}>Sin intentos de spam registrados</Text>
                      <Text style={styles.emptySubtitle}>
                        El filtro de groserías se encuentra activo y la comunidad permanece en santidad y respeto.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 4: FILTRO DE PALABRAS BLOQUEADAS (LISTA NEGRA)             */}
            {/* ============================================================== */}
            {activeTab === 'words' && (
              <View style={styles.section}>
                {/* Formulario Agregar Palabra */}
                <View style={styles.addWordBox}>
                  <Text style={styles.addWordBoxTitle}>🚫 Agregar Palabra al Filtro</Text>
                  <Text style={styles.addWordBoxSubtitle}>
                    Cualquier comentario con esta palabra será bloqueado y registrado en «Intentos de Spam».
                  </Text>
                  <View style={styles.addWordRow}>
                    <TextInput
                      style={styles.addWordInput}
                      placeholder="Ej: grosería, insulto, spam…"
                      placeholderTextColor="#64748b"
                      value={newWordInput}
                      onChangeText={setNewWordInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={[styles.addWordBtn, (!newWordInput.trim() || addingWord) && styles.addWordBtnDisabled]}
                      onPress={handleAddWord}
                      disabled={!newWordInput.trim() || addingWord}
                    >
                      {addingWord ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <Plus size={16} color="#ffffff" />
                          <Text style={styles.addWordBtnText}>Bloquear</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Buscador de Palabras */}
                <View style={styles.searchRow}>
                  <Search size={16} color="#64748b" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar palabra en la lista negra…"
                    placeholderTextColor="#64748b"
                    value={wordFilter}
                    onChangeText={setWordFilter}
                    autoCapitalize="none"
                  />
                  {!!wordFilter && (
                    <TouchableOpacity onPress={() => setWordFilter('')}>
                      <X size={16} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.wordsSummaryRow}>
                  <Text style={styles.wordsSummaryText}>
                    Mostrando {filteredWords.length} de {blockedWords.length} palabras activas
                  </Text>
                </View>

                {/* Cloud de palabras */}
                <View style={styles.wordsCloud}>
                  {filteredWords.map((word) => (
                    <View key={word} style={styles.wordChip}>
                      <Text style={styles.wordChipText}>{word}</Text>
                      <TouchableOpacity
                        style={styles.wordChipDelete}
                        onPress={() => handleDeleteWord(word)}
                        hitSlop={8}
                        accessibilityLabel={`Quitar palabra ${word}`}
                      >
                        <X size={13} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {filteredWords.length === 0 && (
                    <Text style={styles.emptyWordsText}>
                      No se encontraron palabras que coincidan con la búsqueda.
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 5: CUENTAS SUSPENDIDAS (PERDÓN Y GRACIA)                   */}
            {/* ============================================================== */}
            {activeTab === 'suspended' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionHeaderTitle}>
                    🔒 Cuentas Suspendidas & Ministración
                  </Text>
                  <Text style={styles.sectionCounterBadge}>{suspendedUsers.length} bloqueados</Text>
                </View>
                <Text style={styles.sectionHeaderSubtitle}>
                  Usuarios restringidos por faltas a la convivencia. Puedes restablecerles la cuenta cuando hayan reflexionado.
                </Text>

                <View style={styles.suspendedList}>
                  {suspendedUsers.map((user) => (
                    <View key={user.id} style={styles.suspendedCard}>
                      <View style={styles.suspendedInfoRow}>
                        {user.avatarUrl ? (
                          <Image source={{ uri: user.avatarUrl }} style={styles.suspendedAvatar} />
                        ) : (
                          <View style={styles.suspendedAvatarFallback}>
                            <Text style={styles.suspendedInitials}>
                              {user.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.suspendedDetails}>
                          <Text style={styles.suspendedName}>{user.name}</Text>
                          <Text style={styles.suspendedEmail}>{user.email}</Text>
                          <View style={styles.suspendedStatusPill}>
                            <Lock size={10} color="#ef4444" />
                            <Text style={styles.suspendedStatusText}>Suspendido</Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.unbanBtn}
                        onPress={() => handleUnbanUser(user)}
                      >
                        <UserCheck size={16} color="#10b981" />
                        <Text style={styles.unbanBtnText}>Reactivar Cuenta (Gracia)</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {suspendedUsers.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Sparkles size={36} color="#10b981" />
                      <Text style={styles.emptyTitle}>No hay cuentas suspendidas</Text>
                      <Text style={styles.emptySubtitle}>
                        Toda la congregación se encuentra participando en paz y armonía.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#1b2633',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: '#0ea5e9',
  },
  tabBtnActivePinned: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: '#fbbf24',
  },
  tabBtnActiveSpam: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  tabBtnActiveWords: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#f43f5e',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#0ea5e9',
    fontWeight: '700',
  },
  tabBtnTextActivePinned: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  tabBtnTextActiveSpam: {
    color: '#ef4444',
    fontWeight: '700',
  },
  tabBtnTextActiveWords: {
    color: '#f43f5e',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  section: {
    marginTop: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionCounterBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0ea5e9',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 14,
  },
  dateGroupContainer: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  dateHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38bdf8',
  },
  dateGroupCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateGroupCountText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  commentsList: {
    gap: 10,
  },
  commentCard: {
    backgroundColor: '#131b24',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  commentCardPinned: {
    borderColor: 'rgba(251, 191, 36, 0.35)',
    backgroundColor: 'rgba(251, 191, 36, 0.04)',
  },
  commentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAuthorCol: {
    gap: 3,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentVerseTag: {
    fontSize: 11,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  commentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  commentTimeText: {
    fontSize: 10,
    color: '#64748b',
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 3,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  pinnedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fbbf24',
  },
  commentBody: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 10,
  },
  commentActionsRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentActionBtnPinned: {
    opacity: 0.9,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Spam Styles
  clearSpamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearSpamBtnText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  spamCard: {
    backgroundColor: '#131b24',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 8,
  },
  spamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  spamAuthorCol: {
    gap: 2,
  },
  spamAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  spamVerseTag: {
    fontSize: 11,
    color: '#64748b',
  },
  spamDateText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  spamDetectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  spamDetectedPillLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  spamDetectedWordTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  spamDetectedWordText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 11,
  },
  spamAttemptQuote: {
    backgroundColor: '#0a0f14',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  spamAttemptQuoteText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  spamActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  spamSuspendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  spamSuspendBtnText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  // Words Tab Styles
  addWordBox: {
    backgroundColor: '#131b24',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    padding: 14,
    marginBottom: 14,
  },
  addWordBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  addWordBoxSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 12,
  },
  addWordRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addWordInput: {
    flex: 1,
    backgroundColor: '#0a0f14',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addWordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f43f5e',
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  addWordBtnDisabled: {
    opacity: 0.5,
  },
  addWordBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1720',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
  },
  wordsSummaryRow: {
    marginBottom: 10,
  },
  wordsSummaryText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  wordsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b2633',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  wordChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  wordChipDelete: {
    padding: 2,
  },
  emptyWordsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
    width: '100%',
  },
  // Suspended Tab Styles
  suspendedList: {
    gap: 10,
  },
  suspendedCard: {
    backgroundColor: '#131b24',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 12,
  },
  suspendedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  suspendedAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  suspendedAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suspendedInitials: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 16,
  },
  suspendedDetails: {
    flex: 1,
  },
  suspendedName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  suspendedEmail: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  suspendedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  suspendedStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ef4444',
  },
  unbanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  unbanBtnText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 13,
  },
  // Loading & Empty States
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
