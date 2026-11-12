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
  Flag,
  Eye,
  EyeOff,
  CheckCircle2,
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
  resolveModerationReport,
  ModerationComment,
  SuspendedUser,
  SpamAttempt,
  ModerationReport,
} from '@/src/features/moderation/moderationService';
import { deleteCommunityReflection } from '@/src/features/daily/services/communityReflections';
import { suspendAuthorByName } from '@/src/features/auth/pastoralService';
import { hapticLight, hapticSuccess, hapticWarning } from '@/src/services/haptics/hapticFeedback';

type ModerationTab = 'feed' | 'reports' | 'pinned' | 'spam' | 'words' | 'suspended';

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
  const isDark = themeMode === 'oled';

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
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);

  // Inputs locales
  const [newWordInput, setNewWordInput] = useState('');
  const [wordFilter, setWordFilter] = useState('');
  const [addingWord, setAddingWord] = useState(false);
  const [clearingSpam, setClearingSpam] = useState(false);
  const [showWordsList, setShowWordsList] = useState(false);

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
      setReports(data.reports || []);
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
      Alert.alert('Aviso', err?.message || 'No se pudo actualizar el estado de fijado');
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

  // Borrar comentario del feed con protección de jerarquía pastoral
  const handleDeleteComment = (comment: ModerationComment) => {
    if (comment.isPastor && !authUser?.isPastor && authUser?.role !== 'admin') {
      Alert.alert(
        'Jerarquía Ministerial',
        'Esta reflexión fue emitida por un Pastor y cuenta con protección ministerial. No puede ser retirada por moderación general.'
      );
      return;
    }

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
              Alert.alert('Aviso', err?.message || 'No se pudo borrar el comentario.');
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

  // Resolver o descartar denuncia
  const handleResolveReport = (report: ModerationReport, action: 'dismiss' | 'delete') => {
    const isDelete = action === 'delete';
    Alert.alert(
      isDelete ? 'Moderar y Borrar Testimonio Denunciado' : 'Descartar Denuncia',
      isDelete
        ? `¿Confirmas que deseas eliminar el testimonio de ${report.authorName} por motivo de «${report.reason}»?`
        : '¿Deseas descartar esta denuncia? El testimonio se conservará en el muro.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isDelete ? 'Borrar Testimonio' : 'Descartar',
          style: isDelete ? 'destructive' : 'default',
          onPress: async () => {
            try {
              hapticLight();
              await resolveModerationReport(report.id, action, report.commentId);
              setReports((prev) => prev.filter((r) => r.id !== report.id));
              if (isDelete) {
                setComments((prev) => prev.filter((c) => c.id !== report.commentId));
                setPinnedComments((prev) => prev.filter((c) => c.id !== report.commentId));
              }
              hapticSuccess();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo procesar la denuncia.');
            }
          },
        },
      ]
    );
  };

  // Colores dinámicos adaptados al tema
  const dynamicStyles = useMemo(() => {
    return {
      card: {
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
      },
      surfaceBox: {
        backgroundColor: theme.surface,
        borderColor: theme.borderSubtle,
      },
      tagPill: {
        backgroundColor: theme.surfaceRaised,
        borderColor: theme.borderSubtle,
      },
      subtleRow: {
        borderTopColor: theme.borderSubtle,
      },
      accentHeader: {
        backgroundColor: theme.accentMuted,
        borderLeftColor: theme.accent,
      },
      destructivePill: {
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(185, 28, 28, 0.08)',
        borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(185, 28, 28, 0.25)',
      },
      amberPill: {
        backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(180, 83, 9, 0.1)',
        borderColor: isDark ? 'rgba(251, 191, 36, 0.35)' : 'rgba(180, 83, 9, 0.25)',
      },
      emeraldPill: {
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(4, 120, 87, 0.1)',
        borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(4, 120, 87, 0.25)',
      },
    };
  }, [theme, isDark]);

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
              <View style={[styles.roleBadge, { backgroundColor: theme.accentMuted, borderColor: theme.accent }]}>
                <ShieldCheck size={12} color={theme.accent} />
                <Text style={[styles.roleBadgeText, { color: theme.accent }]}>Líder / Mod</Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Control del muro de reflexiones, denuncias y testimonios.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadData(true)}
            disabled={refreshing}
            accessibilityRole="button"
            accessibilityLabel="Actualizar datos"
          >
            <RefreshCw size={19} color={refreshing ? theme.accent : theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* BARRA DE PESTAÑAS HORIZONTAL ERGONÓMICA */}
        <View style={[styles.tabBarContainer, { borderBottomColor: theme.borderSubtle }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarContent}
          >
            {/* TAB 1: FEED POR FECHAS */}
            <TouchableOpacity
              style={[
                styles.tabBtn,
                { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                activeTab === 'feed' && { backgroundColor: theme.accentMuted, borderColor: theme.accent },
              ]}
              onPress={() => { hapticLight(); setActiveTab('feed'); }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: theme.textMuted },
                  activeTab === 'feed' && { color: theme.accent, fontWeight: '700' },
                ]}
              >
                💬 Feed por Fechas ({comments.length})
              </Text>
            </TouchableOpacity>

            {/* TAB 2: DENUNCIAS / REPORTES */}
            <TouchableOpacity
              style={[
                styles.tabBtn,
                { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                activeTab === 'reports' && { backgroundColor: dynamicStyles.destructivePill.backgroundColor, borderColor: theme.destructive },
              ]}
              onPress={() => { hapticLight(); setActiveTab('reports'); }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: reports.length > 0 ? theme.destructive : theme.textMuted },
                  activeTab === 'reports' && { color: theme.destructive, fontWeight: '700' },
                ]}
              >
                🚩 Denuncias ({reports.length})
              </Text>
            </TouchableOpacity>

            {/* TAB 3: TESTIMONIOS DESTACADOS */}
            <TouchableOpacity
              style={[
                styles.tabBtn,
                { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                activeTab === 'pinned' && { backgroundColor: dynamicStyles.amberPill.backgroundColor, borderColor: isDark ? '#fbbf24' : '#b45309' },
              ]}
              onPress={() => { hapticLight(); setActiveTab('pinned'); }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: theme.textMuted },
                  activeTab === 'pinned' && { color: isDark ? '#fbbf24' : '#b45309', fontWeight: '700' },
                ]}
              >
                📌 Destacados ({pinnedComments.length})
              </Text>
            </TouchableOpacity>

            {/* TAB 4: INTENTOS DE SPAM */}
            <TouchableOpacity
              style={[
                styles.tabBtn,
                { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                activeTab === 'spam' && { backgroundColor: dynamicStyles.destructivePill.backgroundColor, borderColor: theme.destructive },
              ]}
              onPress={() => { hapticLight(); setActiveTab('spam'); }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: theme.textMuted },
                  activeTab === 'spam' && { color: theme.destructive, fontWeight: '700' },
                ]}
              >
                🚨 Registro Spam ({spamAttempts.length})
              </Text>
            </TouchableOpacity>

            {/* TAB 5: FILTRO DE PALABRAS */}
            <TouchableOpacity
              style={[
                styles.tabBtn,
                { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                activeTab === 'words' && { backgroundColor: theme.accentMuted, borderColor: theme.accent },
              ]}
              onPress={() => { hapticLight(); setActiveTab('words'); }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: theme.textMuted },
                  activeTab === 'words' && { color: theme.accent, fontWeight: '700' },
                ]}
              >
                🚫 Filtro Palabras ({blockedWords.length})
              </Text>
            </TouchableOpacity>

            {/* TAB 6: CUENTAS SUSPENDIDAS */}
            <TouchableOpacity
              style={[
                styles.tabBtn,
                { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                activeTab === 'suspended' && { backgroundColor: theme.accentMuted, borderColor: theme.accent },
              ]}
              onPress={() => { hapticLight(); setActiveTab('suspended'); }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: theme.textMuted },
                  activeTab === 'suspended' && { color: theme.accent, fontWeight: '700' },
                ]}
              >
                🔒 Suspendidos ({suspendedUsers.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Cargando panel de moderación…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <AlertTriangle size={36} color={theme.destructive} />
            <Text style={[styles.errorTitle, { color: theme.text }]}>No se pudo cargar</Text>
            <Text style={[styles.errorSubtitle, { color: theme.textMuted }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: theme.accent }]}
              onPress={() => loadData()}
            >
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
                  <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>
                    💬 Muro Global de Reflexiones
                  </Text>
                  <Text style={[styles.sectionCounterBadge, { backgroundColor: theme.accentMuted, color: theme.accent }]}>
                    {comments.length} en total
                  </Text>
                </View>
                <Text style={[styles.sectionHeaderSubtitle, { color: theme.textMuted }]}>
                  Organizado cronológicamente por fecha de publicación.
                </Text>

                {dateGroups.map((group) => (
                  <View key={group.dateKey} style={styles.dateGroupContainer}>
                    {/* Header de Fecha */}
                    <View style={[styles.dateHeader, dynamicStyles.accentHeader]}>
                      <View style={styles.dateHeaderLeft}>
                        <Calendar size={14} color={theme.accent} />
                        <Text style={[styles.dateHeaderTitle, { color: theme.accent }]}>{group.label}</Text>
                      </View>
                      <View style={[styles.dateGroupCountPill, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.dateGroupCountText, { color: theme.textMuted }]}>
                          {group.items.length} {group.items.length === 1 ? 'reflexión' : 'reflexiones'}
                        </Text>
                      </View>
                    </View>

                    {/* Comentarios de esa fecha */}
                    <View style={styles.commentsList}>
                      {group.items.map((item) => (
                        <View
                          key={item.id}
                          style={[
                            styles.commentCard,
                            dynamicStyles.card,
                            item.isPinned && {
                              borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(180, 83, 9, 0.35)',
                              backgroundColor: dynamicStyles.amberPill.backgroundColor,
                            },
                          ]}
                        >
                          <View style={styles.commentCardHeader}>
                            <View style={styles.commentAuthorCol}>
                              <View style={styles.commentAuthorRow}>
                                <Text style={[styles.commentAuthor, { color: theme.text }]}>{item.userName}</Text>
                                {item.isPastor && (
                                  <View style={[styles.miniBadge, dynamicStyles.amberPill]}>
                                    <ShieldCheck size={11} color={isDark ? '#fbbf24' : '#b45309'} />
                                    <Text style={[styles.miniBadgeText, { color: isDark ? '#fbbf24' : '#b45309' }]}>Pastor</Text>
                                  </View>
                                )}
                                {item.role === 'Líder / Moderador' && !item.isPastor && (
                                  <View style={[styles.miniBadge, { backgroundColor: theme.accentMuted, borderColor: theme.accent }]}>
                                    <ShieldCheck size={11} color={theme.accent} />
                                    <Text style={[styles.miniBadgeText, { color: theme.accent }]}>Líder</Text>
                                  </View>
                                )}
                              </View>
                              <View style={styles.commentMetaRow}>
                                <Text style={[styles.commentVerseTag, { color: theme.accent }]}>📖 {item.verseSlug}</Text>
                                {item.createdAt ? (
                                  <View style={styles.commentTimeRow}>
                                    <Clock size={10} color={theme.textMuted} />
                                    <Text style={[styles.commentTimeText, { color: theme.textMuted }]}>
                                      {formatCommentTime(item.createdAt)}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                            </View>

                            {item.isPinned && (
                              <View style={[styles.pinnedBadge, dynamicStyles.amberPill]}>
                                <Pin size={11} color={isDark ? '#fbbf24' : '#b45309'} />
                                <Text style={[styles.pinnedBadgeText, { color: isDark ? '#fbbf24' : '#b45309' }]}>Destacado</Text>
                              </View>
                            )}
                          </View>

                          <Text style={[styles.commentBody, { color: theme.text }]}>{item.text}</Text>

                          {/* Acciones de Moderación */}
                          <View style={[styles.commentActionsRow, dynamicStyles.subtleRow]}>
                            <TouchableOpacity
                              style={styles.commentActionBtn}
                              onPress={() => handleTogglePin(item)}
                            >
                              {item.isPinned ? (
                                <>
                                  <PinOff size={13} color={isDark ? '#fbbf24' : '#b45309'} />
                                  <Text style={[styles.commentActionText, { color: isDark ? '#fbbf24' : '#b45309' }]}>
                                    Desfijar
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <Pin size={13} color={theme.accent} />
                                  <Text style={[styles.commentActionText, { color: theme.accent }]}>
                                    Destacar
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.commentActionBtn}
                              onPress={() => handleDeleteComment(item)}
                            >
                              <Trash2 size={13} color={theme.destructive} />
                              <Text style={[styles.commentActionText, { color: theme.destructive }]}>
                                Borrar
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.commentActionBtn}
                              onPress={() => handleSuspendAuthor(item.userName)}
                            >
                              <UserX size={13} color={isDark ? '#f59e0b' : '#b45309'} />
                              <Text style={[styles.commentActionText, { color: isDark ? '#f59e0b' : '#b45309' }]}>
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
                    <MessageSquare size={36} color={theme.textMuted} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay reflexiones en el muro</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                      Las publicaciones de la congregación aparecerán aquí agrupadas por fecha.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 2: DENUNCIAS / REPORTES DE LA CONGREGACIÓN                 */}
            {/* ============================================================== */}
            {activeTab === 'reports' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>
                    🚩 Denuncias & Reportes de Hermanos
                  </Text>
                  <Text style={[styles.sectionCounterBadge, dynamicStyles.destructivePill, { color: theme.destructive }]}>
                    {reports.length} pendientes
                  </Text>
                </View>
                <Text style={[styles.sectionHeaderSubtitle, { color: theme.textMuted }]}>
                  Testimonios reportados por la comunidad para revisión y cuidado del orden congregacional.
                </Text>

                <View style={styles.commentsList}>
                  {reports.map((report) => (
                    <View key={report.id} style={[styles.spamCard, dynamicStyles.card, { borderColor: theme.destructive }]}>
                      <View style={styles.spamCardHeader}>
                        <View style={styles.spamAuthorCol}>
                          <View style={styles.commentAuthorRow}>
                            <Flag size={14} color={theme.destructive} />
                            <Text style={[styles.spamAuthorName, { color: theme.text }]}>
                              Reportado: {report.authorName}
                            </Text>
                          </View>
                          <Text style={[styles.spamVerseTag, { color: theme.textMuted }]}>
                            📖 {report.verseSlug} • Reportado por: {report.reportedByName}
                          </Text>
                        </View>
                        <Text style={[styles.spamDateText, { color: theme.textMuted }]}>
                          {formatDateTimeShort(report.createdAt)}
                        </Text>
                      </View>

                      {/* Motivo de la denuncia */}
                      <View style={styles.spamDetectedPill}>
                        <Text style={[styles.spamDetectedPillLabel, { color: theme.textMuted }]}>Motivo:</Text>
                        <View style={[styles.spamDetectedWordTag, dynamicStyles.destructivePill]}>
                          <Text style={[styles.spamDetectedWordText, { color: theme.destructive }]}>
                            {report.reason}
                          </Text>
                        </View>
                      </View>

                      {/* Texto del comentario reportado */}
                      <View style={[styles.spamAttemptQuote, dynamicStyles.surfaceBox, { borderLeftColor: theme.destructive }]}>
                        <Text style={[styles.spamAttemptQuoteText, { color: theme.text }]}>
                          "{report.commentText}"
                        </Text>
                      </View>

                      {/* Acciones para resolver denuncia */}
                      <View style={[styles.reportActionsRow, dynamicStyles.subtleRow]}>
                        <TouchableOpacity
                          style={[styles.reportActionBtn, dynamicStyles.tagPill]}
                          onPress={() => handleResolveReport(report, 'dismiss')}
                        >
                          <CheckCircle2 size={13} color={theme.textMuted} />
                          <Text style={[styles.reportActionBtnText, { color: theme.textMuted }]}>
                            Descartar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.reportActionBtn, dynamicStyles.destructivePill]}
                          onPress={() => handleResolveReport(report, 'delete')}
                        >
                          <Trash2 size={13} color={theme.destructive} />
                          <Text style={[styles.reportActionBtnText, { color: theme.destructive }]}>
                            Borrar Testimonio
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.reportActionBtn, dynamicStyles.amberPill]}
                          onPress={() => handleSuspendAuthor(report.authorName)}
                        >
                          <UserX size={13} color={isDark ? '#f59e0b' : '#b45309'} />
                          <Text style={[styles.reportActionBtnText, { color: isDark ? '#f59e0b' : '#b45309' }]}>
                            Suspender Autor
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {reports.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <CheckCircle2 size={36} color={theme.accent} />
                      <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay denuncias pendientes</Text>
                      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                        La comunidad se encuentra edificando en paz. Si un hermano denuncia un testimonio desde el muro, aparecerá aquí al instante.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 3: GESTOR DE TESTIMONIOS DESTACADOS                        */}
            {/* ============================================================== */}
            {activeTab === 'pinned' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>
                    📌 Gestor de Testimonios Destacados
                  </Text>
                  <Text style={[styles.sectionCounterBadge, dynamicStyles.amberPill, { color: isDark ? '#fbbf24' : '#b45309' }]}>
                    {pinnedComments.length} fijados
                  </Text>
                </View>
                <Text style={[styles.sectionHeaderSubtitle, { color: theme.textMuted }]}>
                  Reflexiones y testimonios fijados en la parte superior de cada pasaje para edificación de todos.
                </Text>

                <View style={styles.commentsList}>
                  {pinnedComments.map((item) => (
                    <View key={item.id} style={[styles.commentCard, dynamicStyles.card, dynamicStyles.amberPill]}>
                      <View style={styles.commentCardHeader}>
                        <View style={styles.commentAuthorCol}>
                          <View style={styles.commentAuthorRow}>
                            <Text style={[styles.commentAuthor, { color: theme.text }]}>{item.userName}</Text>
                            {item.isPastor && (
                              <View style={[styles.miniBadge, dynamicStyles.amberPill]}>
                                <ShieldCheck size={11} color={isDark ? '#fbbf24' : '#b45309'} />
                                <Text style={[styles.miniBadgeText, { color: isDark ? '#fbbf24' : '#b45309' }]}>Pastor</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.commentVerseTag, { color: theme.accent }]}>📖 {item.verseSlug}</Text>
                        </View>
                        <View style={[styles.pinnedBadge, dynamicStyles.amberPill]}>
                          <Pin size={11} color={isDark ? '#fbbf24' : '#b45309'} />
                          <Text style={[styles.pinnedBadgeText, { color: isDark ? '#fbbf24' : '#b45309' }]}>Fijado Oficial</Text>
                        </View>
                      </View>

                      <Text style={[styles.commentBody, { color: theme.text }]}>{item.text}</Text>

                      <View style={[styles.commentActionsRow, dynamicStyles.subtleRow]}>
                        <TouchableOpacity
                          style={styles.commentActionBtn}
                          onPress={() => handleTogglePin(item)}
                        >
                          <PinOff size={13} color={isDark ? '#fbbf24' : '#b45309'} />
                          <Text style={[styles.commentActionText, { color: isDark ? '#fbbf24' : '#b45309' }]}>
                            Desfijar Testimonio
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.commentActionBtn}
                          onPress={() => handleDeleteComment(item)}
                        >
                          <Trash2 size={13} color={theme.destructive} />
                          <Text style={[styles.commentActionText, { color: theme.destructive }]}>
                            Borrar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {pinnedComments.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Pin size={36} color={isDark ? '#fbbf24' : '#b45309'} />
                      <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin testimonios destacados</Text>
                      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                        Puedes entrar a la pestaña «Feed por Fechas» y pulsar «Destacar» en cualquier comentario edificante.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 4: REGISTRO DE INTENTOS DE SPAM & GROSERÍAS               */}
            {/* ============================================================== */}
            {activeTab === 'spam' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>
                    🚨 Registro de Intentos de Spam
                  </Text>
                  {spamAttempts.length > 0 && (
                    <TouchableOpacity
                      style={[styles.clearSpamBtn, dynamicStyles.destructivePill]}
                      onPress={handleClearSpam}
                      disabled={clearingSpam}
                    >
                      <Trash2 size={12} color={theme.destructive} />
                      <Text style={[styles.clearSpamBtnText, { color: theme.destructive }]}>Limpiar Historial</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.sectionHeaderSubtitle, { color: theme.textMuted }]}>
                  Intentos de publicación que fueron bloqueados automáticamente por contener groserías o insultos.
                </Text>

                <View style={styles.commentsList}>
                  {spamAttempts.map((attempt) => (
                    <View key={attempt.id} style={[styles.spamCard, dynamicStyles.card, { borderColor: theme.destructive }]}>
                      <View style={styles.spamCardHeader}>
                        <View style={styles.spamAuthorCol}>
                          <View style={styles.commentAuthorRow}>
                            <ShieldAlert size={14} color={theme.destructive} />
                            <Text style={[styles.spamAuthorName, { color: theme.text }]}>
                              {attempt.userName || 'Usuario Anónimo'}
                            </Text>
                          </View>
                          <Text style={[styles.spamVerseTag, { color: theme.textMuted }]}>📖 {attempt.verseSlug}</Text>
                        </View>
                        <Text style={[styles.spamDateText, { color: theme.textMuted }]}>
                          {formatDateTimeShort(attempt.createdAt)}
                        </Text>
                      </View>

                      {/* Pill de la palabra detectada */}
                      <View style={styles.spamDetectedPill}>
                        <Text style={[styles.spamDetectedPillLabel, { color: theme.textMuted }]}>Palabra Bloqueada:</Text>
                        <View style={[styles.spamDetectedWordTag, dynamicStyles.destructivePill]}>
                          <Text style={[styles.spamDetectedWordText, { color: theme.destructive }]}>
                            «{attempt.detectedWord}»
                          </Text>
                        </View>
                      </View>

                      {/* Texto del intento */}
                      <View style={[styles.spamAttemptQuote, dynamicStyles.surfaceBox, { borderLeftColor: theme.destructive }]}>
                        <Text style={[styles.spamAttemptQuoteText, { color: theme.text }]}>
                          "{attempt.attemptedText}"
                        </Text>
                      </View>

                      {/* Acciones */}
                      <View style={[styles.spamActionsRow, dynamicStyles.subtleRow]}>
                        <TouchableOpacity
                          style={[styles.spamSuspendBtn, dynamicStyles.destructivePill]}
                          onPress={() => handleSuspendAuthor(attempt.userName)}
                        >
                          <UserX size={13} color={theme.destructive} />
                          <Text style={[styles.spamSuspendBtnText, { color: theme.destructive }]}>
                            Suspender Usuario
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {spamAttempts.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Sparkles size={36} color={theme.accent} />
                      <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin intentos de spam registrados</Text>
                      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                        El filtro de groserías se encuentra activo y la comunidad permanece en santidad y respeto.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 5: FILTRO DE PALABRAS BLOQUEADAS (LISTA OCULTA POR DEFECTO) */}
            {/* ============================================================== */}
            {activeTab === 'words' && (
              <View style={styles.section}>
                {/* Formulario Agregar Palabra */}
                <View style={[styles.addWordBox, dynamicStyles.card, { borderColor: theme.border }]}>
                  <Text style={[styles.addWordBoxTitle, { color: theme.text }]}>🚫 Agregar Palabra al Filtro</Text>
                  <Text style={[styles.addWordBoxSubtitle, { color: theme.textMuted }]}>
                    Cualquier comentario con esta palabra será bloqueado e irá a «Registro Spam».
                  </Text>
                  <View style={styles.addWordRow}>
                    <TextInput
                      style={[styles.addWordInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                      placeholder="Ej: grosería, insulto, spam…"
                      placeholderTextColor={theme.textMuted}
                      value={newWordInput}
                      onChangeText={setNewWordInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={[
                        styles.addWordBtn,
                        { backgroundColor: theme.destructive },
                        (!newWordInput.trim() || addingWord) && styles.addWordBtnDisabled,
                      ]}
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
                <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Search size={16} color={theme.textMuted} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Buscar palabra en la lista negra…"
                    placeholderTextColor={theme.textMuted}
                    value={wordFilter}
                    onChangeText={(val) => {
                      setWordFilter(val);
                      if (val.trim()) setShowWordsList(true);
                    }}
                    autoCapitalize="none"
                  />
                  {!!wordFilter && (
                    <TouchableOpacity onPress={() => setWordFilter('')}>
                      <X size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* BOTÓN COLAPSABLE: OCULTO POR DEFECTO PARA NO VER GROSERÍAS */}
                <TouchableOpacity
                  style={[
                    styles.toggleWordsBtn,
                    { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setShowWordsList((prev) => !prev);
                  }}
                  accessibilityRole="button"
                >
                  {showWordsList ? (
                    <EyeOff size={16} color={theme.accent} />
                  ) : (
                    <Eye size={16} color={theme.accent} />
                  )}
                  <Text style={[styles.toggleWordsBtnText, { color: theme.text }]}>
                    {showWordsList
                      ? 'Ocultar lista de palabras'
                      : `Ver lista de palabras bloqueadas (${filteredWords.length})`}
                  </Text>
                </TouchableOpacity>

                {/* CLOUD DE PALABRAS (SOLO SI SE EXPANDE O SE BUSCA) */}
                {showWordsList ? (
                  <View style={styles.wordsCloudContainer}>
                    <View style={styles.wordsSummaryRow}>
                      <Text style={[styles.wordsSummaryText, { color: theme.textMuted }]}>
                        Mostrando {filteredWords.length} de {blockedWords.length} palabras activas
                      </Text>
                    </View>

                    <View style={styles.wordsCloud}>
                      {filteredWords.map((word) => (
                        <View key={word} style={[styles.wordChip, dynamicStyles.tagPill]}>
                          <Text style={[styles.wordChipText, { color: theme.text }]}>{word}</Text>
                          <TouchableOpacity
                            style={styles.wordChipDelete}
                            onPress={() => handleDeleteWord(word)}
                            hitSlop={8}
                            accessibilityLabel={`Quitar palabra ${word}`}
                          >
                            <X size={13} color={theme.destructive} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {filteredWords.length === 0 && (
                        <Text style={[styles.emptyWordsText, { color: theme.textMuted }]}>
                          No se encontraron palabras que coincidan con la búsqueda.
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={[styles.wordsHiddenNotice, dynamicStyles.surfaceBox]}>
                    <ShieldCheck size={20} color={theme.accent} />
                    <Text style={[styles.wordsHiddenNoticeText, { color: theme.textMuted }]}>
                      La lista de groserías se encuentra oculta por respeto y limpieza visual. Pulsa «Ver lista» si necesitas gestionar alguna.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ============================================================== */}
            {/* TAB 6: CUENTAS SUSPENDIDAS (PERDÓN Y GRACIA)                   */}
            {/* ============================================================== */}
            {activeTab === 'suspended' && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>
                    🔒 Cuentas Suspendidas & Ministración
                  </Text>
                  <Text style={[styles.sectionCounterBadge, dynamicStyles.destructivePill, { color: theme.destructive }]}>
                    {suspendedUsers.length} bloqueados
                  </Text>
                </View>
                <Text style={[styles.sectionHeaderSubtitle, { color: theme.textMuted }]}>
                  Usuarios restringidos por faltas a la convivencia. Puedes restablecerles la cuenta cuando hayan reflexionado.
                </Text>

                <View style={styles.suspendedList}>
                  {suspendedUsers.map((user) => (
                    <View key={user.id} style={[styles.suspendedCard, dynamicStyles.card, { borderColor: theme.border }]}>
                      <View style={styles.suspendedInfoRow}>
                        {user.avatarUrl ? (
                          <Image source={{ uri: user.avatarUrl }} style={styles.suspendedAvatar} />
                        ) : (
                          <View style={[styles.suspendedAvatarFallback, dynamicStyles.destructivePill]}>
                            <Text style={[styles.suspendedInitials, { color: theme.destructive }]}>
                              {user.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.suspendedDetails}>
                          <Text style={[styles.suspendedName, { color: theme.text }]}>{user.name}</Text>
                          <Text style={[styles.suspendedEmail, { color: theme.textMuted }]}>{user.email}</Text>
                          <View style={[styles.suspendedStatusPill, dynamicStyles.destructivePill]}>
                            <Lock size={10} color={theme.destructive} />
                            <Text style={[styles.suspendedStatusText, { color: theme.destructive }]}>Suspendido</Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.unbanBtn, dynamicStyles.emeraldPill]}
                        onPress={() => handleUnbanUser(user)}
                      >
                        <UserCheck size={16} color={isDark ? '#10b981' : '#047857'} />
                        <Text style={[styles.unbanBtnText, { color: isDark ? '#10b981' : '#047857' }]}>
                          Reactivar Cuenta (Gracia y Perdón)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {suspendedUsers.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Sparkles size={36} color={theme.accent} />
                      <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay cuentas suspendidas</Text>
                      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
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
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  sectionCounterBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  dateGroupContainer: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
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
  },
  dateGroupCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateGroupCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  commentsList: {
    gap: 10,
  },
  commentCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
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
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentVerseTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  commentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  commentTimeText: {
    fontSize: 10,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    gap: 3,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  pinnedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  commentActionsRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Report tab styles
  reportActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  reportActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  reportActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Spam Styles
  clearSpamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  clearSpamBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  spamCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
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
  },
  spamVerseTag: {
    fontSize: 11,
  },
  spamDateText: {
    fontSize: 10,
  },
  spamDetectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  spamDetectedPillLabel: {
    fontSize: 11,
  },
  spamDetectedWordTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  spamDetectedWordText: {
    fontWeight: '800',
    fontSize: 11,
  },
  spamAttemptQuote: {
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  spamAttemptQuoteText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  spamActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  spamSuspendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  spamSuspendBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Words Tab Styles
  addWordBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  addWordBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  addWordBoxSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  addWordRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addWordInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    borderWidth: 1,
  },
  addWordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  toggleWordsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  toggleWordsBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  wordsHiddenNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  wordsHiddenNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  wordsCloudContainer: {
    marginTop: 4,
  },
  wordsSummaryRow: {
    marginBottom: 10,
  },
  wordsSummaryText: {
    fontSize: 11,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  wordChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  wordChipDelete: {
    padding: 2,
  },
  emptyWordsText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
    width: '100%',
  },
  // Suspended Tab Styles
  suspendedList: {
    gap: 10,
  },
  suspendedCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  suspendedInitials: {
    fontWeight: '700',
    fontSize: 16,
  },
  suspendedDetails: {
    flex: 1,
  },
  suspendedName: {
    fontSize: 14,
    fontWeight: '700',
  },
  suspendedEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  suspendedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
  },
  suspendedStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  unbanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  unbanBtnText: {
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
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
