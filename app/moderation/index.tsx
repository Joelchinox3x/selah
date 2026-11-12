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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  BadgeCheck,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Pin,
  UserX,
  UserCheck,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Lock,
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
  ModerationComment,
  SuspendedUser,
  ModerationOverview,
} from '@/src/features/moderation/moderationService';
import { deleteCommunityReflection } from '@/src/features/daily/services/communityReflections';
import { suspendAuthorByName } from '@/src/features/auth/pastoralService';
import { hapticLight, hapticSuccess, hapticWarning } from '@/src/services/haptics/hapticFeedback';

type ModerationTab = 'words' | 'feed' | 'suspended';

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

  const [activeTab, setActiveTab] = useState<ModerationTab>('words');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);
  const [metrics, setMetrics] = useState({
    totalComments: 0,
    totalBlockedWords: 0,
    totalSuspended: 0,
    totalPinned: 0,
  });

  // Inputs locales
  const [newWordInput, setNewWordInput] = useState('');
  const [wordFilter, setWordFilter] = useState('');
  const [addingWord, setAddingWord] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchModerationOverview();
      setBlockedWords(data.blockedWords);
      setComments(data.comments);
      setSuspendedUsers(data.suspendedUsers);
      setMetrics(data.metrics);
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

  // Filtrado de palabras
  const filteredWords = useMemo(() => {
    if (!wordFilter.trim()) return blockedWords;
    const q = wordFilter.trim().toLowerCase();
    return blockedWords.filter((w) => w.toLowerCase().includes(q));
  }, [blockedWords, wordFilter]);

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
      setMetrics((m) => ({ ...m, totalBlockedWords: updatedWords.length }));
      setNewWordInput('');
      hapticSuccess();
      Alert.alert('Palabra Bloqueada', `«${word}» se ha añadido al filtro antispam exitosamente.`);
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
              setMetrics((m) => ({ ...m, totalBlockedWords: updatedWords.length }));
              hapticSuccess();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo eliminar la palabra.');
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
              setMetrics((m) => ({ ...m, totalSuspended: Math.max(0, m.totalSuspended - 1) }));
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
              setMetrics((m) => ({ ...m, totalComments: Math.max(0, m.totalComments - 1) }));
              hapticSuccess();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo borrar el comentario.');
            }
          },
        },
      ]
    );
  };

  // Suspender autor desde comentario
  const handleSuspendAuthor = (comment: ModerationComment) => {
    Alert.alert(
      'Suspender Autor',
      `¿Deseas suspender a ${comment.userName}? No podrá volver a comentar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Suspender',
          style: 'destructive',
          onPress: async () => {
            try {
              hapticWarning();
              await suspendAuthorByName(comment.userName);
              setComments((prev) => prev.filter((c) => c.userName !== comment.userName));
              hapticSuccess();
              Alert.alert('Autor Suspendido', `Se ha bloqueado la cuenta de ${comment.userName}.`);
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
              Paz comunitaria, filtro de palabras y testimonios.
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

        {/* METRICS KPI CARDS */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: '#131b24', borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.kpiValue, { color: '#ef4444' }]}>{metrics.totalBlockedWords}</Text>
            <Text style={styles.kpiLabel}>Palabras Filtro</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#131b24', borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.kpiValue, { color: '#0ea5e9' }]}>{metrics.totalComments}</Text>
            <Text style={styles.kpiLabel}>Comentarios</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#131b24', borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.kpiValue, { color: '#fbbf24' }]}>{metrics.totalPinned}</Text>
            <Text style={styles.kpiLabel}>Fijados</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#131b24', borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.kpiValue, { color: '#94a3b8' }]}>{metrics.totalSuspended}</Text>
            <Text style={styles.kpiLabel}>Suspendidos</Text>
          </View>
        </View>

        {/* TAB NAVIGATION CHIPS */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'words' && styles.tabBtnActive]}
            onPress={() => { hapticLight(); setActiveTab('words'); }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'words' && styles.tabBtnTextActive]}>
              🚫 Palabras ({blockedWords.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]}
            onPress={() => { hapticLight(); setActiveTab('feed'); }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'feed' && styles.tabBtnTextActive]}>
              💬 Feed de Reflexiones
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
            {/* TAB 1: GESTOR DE PALABRAS BLOQUEADAS */}
            {activeTab === 'words' && (
              <View style={styles.section}>
                {/* Formulario Agregar Palabra */}
                <View style={styles.addWordBox}>
                  <Text style={styles.addWordBoxTitle}>🚫 Agregar Palabra al Filtro</Text>
                  <Text style={styles.addWordBoxSubtitle}>
                    Cualquier intento de publicar comentarios que contengan esta palabra será bloqueado automáticamente en la app.
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

            {/* TAB 2: FEED GLOBAL DE COMENTARIOS */}
            {activeTab === 'feed' && (
              <View style={styles.section}>
                <Text style={styles.sectionHeaderTitle}>
                  💬 Últimas Reflexiones en Todos los Pasajes
                </Text>
                <Text style={styles.sectionHeaderSubtitle}>
                  Supervisa y modera comentarios en vivo en toda la comunidad.
                </Text>

                <View style={styles.commentsList}>
                  {comments.map((item) => (
                    <View key={item.id} style={[styles.commentCard, item.isPinned && styles.commentCardPinned]}>
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
                          <Text style={styles.commentVerseTag}>📖 {item.verseSlug}</Text>
                        </View>
                        {item.isPinned && (
                          <View style={styles.pinnedBadge}>
                            <Pin size={11} color="#fbbf24" />
                            <Text style={styles.pinnedBadgeText}>Destacado</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.commentBody}>{item.text}</Text>

                      {/* Botones de acción directa */}
                      <View style={styles.commentActionsRow}>
                        <TouchableOpacity
                          style={styles.commentActionBtn}
                          onPress={() => handleDeleteComment(item)}
                        >
                          <Trash2 size={14} color="#ef4444" />
                          <Text style={[styles.commentActionText, { color: '#ef4444' }]}>Borrar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.commentActionBtn}
                          onPress={() => handleSuspendAuthor(item)}
                        >
                          <UserX size={14} color="#f59e0b" />
                          <Text style={[styles.commentActionText, { color: '#f59e0b' }]}>Suspender</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {comments.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <MessageSquare size={32} color="#64748b" />
                      <Text style={styles.emptyTitle}>No hay comentarios recientes</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* TAB 3: CUENTAS SUSPENDIDAS (PERDÓN Y GRACIA) */}
            {activeTab === 'suspended' && (
              <View style={styles.section}>
                <Text style={styles.sectionHeaderTitle}>
                  🔒 Cuentas Suspendidas & Ministración
                </Text>
                <Text style={styles.sectionHeaderSubtitle}>
                  Usuarios bloqueados por infracción. Puedes restablecerles la cuenta cuando hayan reflexionado.
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
                        <Text style={styles.unbanBtnText}>Reactivar Cuenta</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {suspendedUsers.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Sparkles size={32} color="#10b981" />
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
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
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
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#0ea5e9',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginTop: 6,
  },
  addWordBox: {
    backgroundColor: '#131b24',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
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
    backgroundColor: '#ef4444',
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
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 14,
    marginTop: 2,
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
    gap: 2,
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
  commentVerseTag: {
    fontSize: 11,
    color: '#0ea5e9',
    fontWeight: '600',
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
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
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
