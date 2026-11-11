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
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  BadgeCheck,
  Users,
  UserCheck,
  UserX,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  Heart,
  MessageSquare,
  Key,
  Check,
  X,
  Sparkles,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { useAuthStore } from '@/src/features/auth/authStore';
import { themes } from '@/src/theme/colors';
import {
  getPastoralMembers,
  updateMemberRole,
  toggleMemberSuspension,
  getPastoralStats,
  getPastoralPin,
  setPastoralPin,
} from '@/src/features/auth/pastoralService';
import { PastoralMember, PastoralOverviewStats, UserRole } from '@/src/features/auth/types';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

type FilterTab = 'all' | 'active' | 'leaders' | 'verified' | 'suspended';

export default function PastoralAdminScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const authUser = useAuthStore((s) => s.user);
  const isPastoralUnlocked = useAuthStore((s) => s.isPastoralUnlocked);
  const lockPastoralSession = useAuthStore((s) => s.lockPastoralSession);
  const setUserRole = useAuthStore((s) => s.setUserRole);

  const [members, setMembers] = useState<PastoralMember[]>([]);
  const [stats, setStats] = useState<PastoralOverviewStats>({
    totalMembers: 0,
    activeToday: 0,
    verifiedCount: 0,
    pastorsCount: 0,
    suspendedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Role Edit Modal
  const [roleModalMember, setRoleModalMember] = useState<PastoralMember | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Change PIN Modal
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  const loadData = async () => {
    try {
      const [membersList, overviewStats] = await Promise.all([
        getPastoralMembers(),
        getPastoralStats(),
      ]);
      setMembers(membersList);
      setStats(overviewStats);
    } catch (e) {
      console.warn('Error loading pastoral data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    hapticLight();
    setRefreshing(true);
    loadData();
  };

  const handleExitPastoral = () => {
    hapticLight();
    lockPastoralSession();
    router.back();
  };

  const handleToggleSuspension = async (member: PastoralMember) => {
    hapticLight();
    const willSuspend = member.status === 'active';
    Alert.alert(
      willSuspend ? 'Suspender Miembro' : 'Reactivar Miembro',
      willSuspend
        ? `¿Deseas suspender temporalmente a ${member.name}? No podrá publicar reflexiones en el muro.`
        : `¿Deseas reactivar la cuenta de ${member.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: willSuspend ? 'Suspender' : 'Reactivar',
          style: willSuspend ? 'destructive' : 'default',
          onPress: async () => {
            const { updated } = await toggleMemberSuspension(member.id);
            setMembers(updated);
            const newStats = await getPastoralStats();
            setStats(newStats);
            hapticSuccess();
          },
        },
      ]
    );
  };

  const handleSelectRole = async (newRole: UserRole) => {
    if (!roleModalMember || updatingRole) return;
    setUpdatingRole(true);
    try {
      const updatedList = await updateMemberRole(roleModalMember.id, newRole);
      setMembers(updatedList);

      // If the edited member is the logged-in user, sync their session
      if (authUser && (authUser.id === roleModalMember.id || authUser.email === roleModalMember.email)) {
        await setUserRole(newRole);
      }

      const newStats = await getPastoralStats();
      setStats(newStats);
      hapticSuccess();
      setRoleModalMember(null);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el rol.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleSavePin = async () => {
    if (savingPin) return;
    if (newPin.trim().length < 4) {
      setPinChangeError('El PIN debe tener al menos 4 dígitos.');
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      setPinChangeError('Los PINs no coinciden.');
      return;
    }
    setSavingPin(true);
    setPinChangeError('');
    try {
      await setPastoralPin(newPin.trim());
      hapticSuccess();
      setPinModalVisible(false);
      setNewPin('');
      setConfirmPin('');
      Alert.alert('PIN Actualizado', 'El código de acceso pastoral ha sido modificado exitosamente.');
    } catch {
      setPinChangeError('No se pudo guardar el PIN.');
    } finally {
      setSavingPin(false);
    }
  };

  // Filter members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'active') {
        return (
          m.status === 'active' &&
          (m.lastActiveAt.includes('Ahora') ||
            m.lastActiveAt.includes('min') ||
            m.lastActiveAt.includes('Hoy'))
        );
      }
      if (activeTab === 'leaders') {
        return m.role === 'pastor' || m.role === 'moderador';
      }
      if (activeTab === 'verified') {
        return m.isVerified;
      }
      if (activeTab === 'suspended') {
        return m.status === 'suspended';
      }
      return true;
    });
  }, [members, searchQuery, activeTab]);

  return (
    <Screen safeTop safeBottom={false}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle, backgroundColor: theme.background }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleExitPastoral}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Volver a ajustes"
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <View>
            <View style={styles.headerTitleRow}>
              <ShieldCheck size={20} color="#d97706" />
              <Text style={[styles.headerTitle, { color: theme.text }]}>Panel Pastoral</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              Comunidad & Moderación Selah
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.iconAction}
            accessibilityRole="button"
            accessibilityLabel="Refrescar datos"
          >
            <RefreshCw size={18} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              hapticLight();
              setPinChangeError('');
              setNewPin('');
              setConfirmPin('');
              setPinModalVisible(true);
            }}
            style={styles.iconAction}
            accessibilityRole="button"
            accessibilityLabel="Cambiar PIN"
          >
            <Key size={18} color="#d97706" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI OVERVIEW CARDS */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Users size={18} color={theme.accent} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{stats.totalMembers}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Miembros</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Clock size={18} color="#10b981" />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{stats.activeToday}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Activos Hoy</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <BadgeCheck size={18} color="#0284c7" />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{stats.verifiedCount}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Verificados</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <ShieldCheck size={18} color="#d97706" />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{stats.pastorsCount}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Pastores</Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={18} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre o correo…"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={[
              styles.tabChip,
              activeTab === 'all'
                ? { backgroundColor: theme.accent }
                : { backgroundColor: theme.surface, borderColor: theme.borderSubtle, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: activeTab === 'all' ? '#ffffff' : theme.textMuted },
              ]}
            >
              Todos ({members.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            style={[
              styles.tabChip,
              activeTab === 'active'
                ? { backgroundColor: theme.accent }
                : { backgroundColor: theme.surface, borderColor: theme.borderSubtle, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: activeTab === 'active' ? '#ffffff' : theme.textMuted },
              ]}
            >
              Activos Hoy ({stats.activeToday})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('leaders')}
            style={[
              styles.tabChip,
              activeTab === 'leaders'
                ? { backgroundColor: theme.accent }
                : { backgroundColor: theme.surface, borderColor: theme.borderSubtle, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: activeTab === 'leaders' ? '#ffffff' : theme.textMuted },
              ]}
            >
              Pastores & Líderes ({stats.pastorsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('verified')}
            style={[
              styles.tabChip,
              activeTab === 'verified'
                ? { backgroundColor: theme.accent }
                : { backgroundColor: theme.surface, borderColor: theme.borderSubtle, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: activeTab === 'verified' ? '#ffffff' : theme.textMuted },
              ]}
            >
              Verificados ({stats.verifiedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('suspended')}
            style={[
              styles.tabChip,
              activeTab === 'suspended'
                ? { backgroundColor: '#ef4444' }
                : { backgroundColor: theme.surface, borderColor: theme.borderSubtle, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: activeTab === 'suspended' ? '#ffffff' : theme.textMuted },
              ]}
            >
              Suspendidos ({stats.suspendedCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* MEMBERS LIST */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>
            Directorio de Creyentes y Clientes
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 24 }} />
          ) : filteredMembers.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Users size={32} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No se encontraron miembros</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                Ajusta el filtro de búsqueda o actualiza el directorio.
              </Text>
            </View>
          ) : (
            filteredMembers.map((member) => (
              <View
                key={member.id}
                style={[
                  styles.memberCard,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                  member.status === 'suspended' && { borderColor: 'rgba(239, 68, 68, 0.4)', opacity: 0.85 },
                ]}
              >
                {/* Member Header */}
                <View style={styles.memberHeader}>
                  {member.avatarUrl ? (
                    <Image source={{ uri: member.avatarUrl }} style={styles.memberAvatar} />
                  ) : (
                    <View style={[styles.memberAvatarFallback, { backgroundColor: theme.accentMuted }]}>
                      <Text style={[styles.memberInitials, { color: theme.accent }]}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.memberDetails}>
                    <View style={styles.memberNameRow}>
                      <Text style={[styles.memberName, { color: theme.text }]} numberOfLines={1}>
                        {member.name}
                      </Text>
                      {member.isVerified && !member.isPastor && (
                        <BadgeCheck size={16} color="#0284c7" />
                      )}
                      {member.isPastor && (
                        <ShieldCheck size={16} color="#d97706" />
                      )}
                    </View>
                    <Text style={[styles.memberEmail, { color: theme.textMuted }]} numberOfLines={1}>
                      {member.email}
                    </Text>

                    {/* Metadata chips */}
                    <View style={styles.metaChipsRow}>
                      <View style={styles.activeTimeChip}>
                        <Clock size={11} color={member.lastActiveAt.includes('Ahora') ? '#10b981' : theme.textMuted} />
                        <Text style={[styles.activeTimeText, { color: member.lastActiveAt.includes('Ahora') ? '#10b981' : theme.textMuted }]}>
                          {member.lastActiveAt}
                        </Text>
                      </View>

                      <View style={styles.statsBadge}>
                        <MessageSquare size={11} color={theme.textMuted} />
                        <Text style={[styles.statsBadgeText, { color: theme.textMuted }]}>
                          {member.reflectionsCount}
                        </Text>
                      </View>

                      <View style={styles.statsBadge}>
                        <Heart size={11} color={theme.textMuted} />
                        <Text style={[styles.statsBadgeText, { color: theme.textMuted }]}>
                          {member.blessingsCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Member Status & Role Chips */}
                <View style={styles.roleStatusRow}>
                  <View
                    style={[
                      styles.roleChip,
                      {
                        backgroundColor:
                          member.role === 'pastor'
                            ? 'rgba(217, 119, 6, 0.15)'
                            : member.role === 'moderador'
                            ? 'rgba(2, 132, 199, 0.15)'
                            : 'rgba(16, 185, 129, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        {
                          color:
                            member.role === 'pastor'
                              ? '#d97706'
                              : member.role === 'moderador'
                              ? '#0284c7'
                              : '#10b981',
                        },
                      ]}
                    >
                      {member.role === 'pastor'
                        ? 'Pastor'
                        : member.role === 'moderador'
                        ? 'Moderador / Líder'
                        : member.role === 'verificado'
                        ? 'Creyente Verificado'
                        : 'Miembro Regular'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          member.status === 'active'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(239, 68, 68, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        { color: member.status === 'active' ? '#10b981' : '#ef4444' },
                      ]}
                    >
                      {member.status === 'active' ? '● Activo' : '🔒 Suspendido'}
                    </Text>
                  </View>
                </View>

                {/* ACTION BUTTONS (Role change + 1-click ban) */}
                <View style={styles.memberActionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      hapticLight();
                      setRoleModalMember(member);
                    }}
                    style={[styles.actionBtnSecondary, { borderColor: theme.borderSubtle }]}
                    accessibilityRole="button"
                  >
                    <ShieldCheck size={14} color={theme.accent} />
                    <Text style={[styles.actionBtnSecondaryText, { color: theme.accent }]}>
                      Cambiar Rol
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleToggleSuspension(member)}
                    style={[
                      styles.actionBtnBlock,
                      member.status === 'active'
                        ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                        : { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                    ]}
                    accessibilityRole="button"
                  >
                    {member.status === 'active' ? (
                      <>
                        <UserX size={14} color="#ef4444" />
                        <Text style={[styles.actionBtnBlockText, { color: '#ef4444' }]}>
                          Suspender
                        </Text>
                      </>
                    ) : (
                      <>
                        <UserCheck size={14} color="#10b981" />
                        <Text style={[styles.actionBtnBlockText, { color: '#10b981' }]}>
                          Reactivar
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ROLE SELECTION MODAL */}
      <Modal
        visible={!!roleModalMember}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setRoleModalMember(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.roleModalContent, { backgroundColor: theme.surfaceRaised }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Gestionar Rol Eclesial</Text>
              <TouchableOpacity onPress={() => setRoleModalMember(null)} hitSlop={8}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Asigna la jerarquía y permisos comunitarios para{' '}
              <Text style={{ fontWeight: '700', color: theme.text }}>{roleModalMember?.name}</Text>.
            </Text>

            <View style={styles.roleOptionsList}>
              <TouchableOpacity
                onPress={() => handleSelectRole('pastor')}
                style={[
                  styles.roleOptionCard,
                  roleModalMember?.role === 'pastor' && { borderColor: '#d97706', backgroundColor: 'rgba(217, 119, 6, 0.1)' },
                ]}
              >
                <ShieldCheck size={20} color="#d97706" />
                <View style={styles.roleOptionInfo}>
                  <Text style={[styles.roleOptionTitle, { color: theme.text }]}>Pastor / Administrador</Text>
                  <Text style={[styles.roleOptionDesc, { color: theme.textMuted }]}>
                    Acceso total al panel, reflexión pastoral destacada y autoridad comunitaria.
                  </Text>
                </View>
                {roleModalMember?.role === 'pastor' && <Check size={18} color="#d97706" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectRole('moderador')}
                style={[
                  styles.roleOptionCard,
                  roleModalMember?.role === 'moderador' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.1)' },
                ]}
              >
                <ShieldCheck size={20} color="#0284c7" />
                <View style={styles.roleOptionInfo}>
                  <Text style={[styles.roleOptionTitle, { color: theme.text }]}>Líder / Moderador</Text>
                  <Text style={[styles.roleOptionDesc, { color: theme.textMuted }]}>
                    Insignia de líder eclesial, modera testimonios y guía en oración.
                  </Text>
                </View>
                {roleModalMember?.role === 'moderador' && <Check size={18} color="#0284c7" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectRole('verificado')}
                style={[
                  styles.roleOptionCard,
                  roleModalMember?.role === 'verificado' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.08)' },
                ]}
              >
                <BadgeCheck size={20} color="#0284c7" />
                <View style={styles.roleOptionInfo}>
                  <Text style={[styles.roleOptionTitle, { color: theme.text }]}>Creyente Verificado</Text>
                  <Text style={[styles.roleOptionDesc, { color: theme.textMuted }]}>
                    Insignia celestial azul oficial junto a su nombre en comentarios.
                  </Text>
                </View>
                {roleModalMember?.role === 'verificado' && <Check size={18} color="#0284c7" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectRole('miembro')}
                style={[
                  styles.roleOptionCard,
                  roleModalMember?.role === 'miembro' && { borderColor: theme.border, backgroundColor: theme.surface },
                ]}
              >
                <Users size={20} color={theme.textMuted} />
                <View style={styles.roleOptionInfo}>
                  <Text style={[styles.roleOptionTitle, { color: theme.text }]}>Miembro Regular</Text>
                  <Text style={[styles.roleOptionDesc, { color: theme.textMuted }]}>
                    Participa normalmente en el muro sin insignias especiales.
                  </Text>
                </View>
                {roleModalMember?.role === 'miembro' && <Check size={18} color={theme.accent} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE PIN MODAL */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPinModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={[styles.roleModalContent, { backgroundColor: theme.surfaceRaised }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Key size={20} color="#d97706" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Cambiar PIN Pastoral</Text>
              </View>
              <TouchableOpacity onPress={() => setPinModalVisible(false)} hitSlop={8}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Establece un nuevo código numérico para acceder a este panel de administración.
            </Text>

            <View style={styles.pinInputGroup}>
              <Text style={[styles.pinLabel, { color: theme.text }]}>Nuevo PIN (4 a 8 dígitos)</Text>
              <TextInput
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
                placeholder="Ej. 7777"
                placeholderTextColor={theme.textMuted}
                style={[styles.pinInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
              />
            </View>

            <View style={styles.pinInputGroup}>
              <Text style={[styles.pinLabel, { color: theme.text }]}>Confirmar nuevo PIN</Text>
              <TextInput
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
                placeholder="Repite el PIN"
                placeholderTextColor={theme.textMuted}
                style={[styles.pinInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
              />
            </View>

            {!!pinChangeError && (
              <Text style={styles.errorText}>{pinChangeError}</Text>
            )}

            <TouchableOpacity
              onPress={handleSavePin}
              disabled={savingPin}
              style={[styles.savePinBtn, { backgroundColor: '#d97706' }]}
              accessibilityRole="button"
            >
              {savingPin ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.savePinBtnText}>Guardar Nuevo PIN</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tabsScroll: {
    marginBottom: 16,
  },
  tabsContent: {
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  memberCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  memberAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: {
    fontSize: 18,
    fontWeight: '800',
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
  },
  memberEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  metaChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  activeTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeTimeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statsBadgeText: {
    fontSize: 11,
  },
  roleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    borderRadius: 10,
  },
  actionBtnBlockText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  roleModalContent: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  roleOptionsList: {
    gap: 10,
  },
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleOptionInfo: {
    flex: 1,
  },
  roleOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleOptionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  pinInputGroup: {
    marginBottom: 14,
  },
  pinLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  pinInput: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 10,
  },
  savePinBtn: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  savePinBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
