import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  BadgeCheck,
  ShieldAlert,
  LogOut,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react-native';
import { useAuthStore } from '../authStore';
import { UserRole } from '../types';
import { hapticLight, hapticSuccess, hapticWarning } from '@/src/services/haptics/hapticFeedback';

interface DevRoleSwitcherProps {
  onRoleChanged?: () => void;
}

export const DevRoleSwitcher: React.FC<DevRoleSwitcherProps> = ({ onRoleChanged }) => {
  const authUser = useAuthStore((s) => s.user);
  const devSetRole = useAuthStore((s) => s.devSetRole);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelectRole = async (targetRole: UserRole | 'anon' | 'suspended', label: string) => {
    try {
      if (targetRole === 'suspended') {
        hapticWarning();
      } else {
        hapticSuccess();
      }
      await devSetRole(targetRole);
      setFeedback(`Rol cambiado a: ${label}`);
      if (onRoleChanged) onRoleChanged();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      Alert.alert('Error Dev', err?.message || 'No se pudo cambiar el rol');
    }
  };

  const getActiveRoleLabel = () => {
    if (!authUser) return { label: 'Sin Sesión / Anónimo', color: '#94a3b8', icon: 'anon' };
    if (authUser.status === 'suspended') return { label: 'Cuenta Suspendida', color: '#ef4444', icon: 'suspended' };
    if (authUser.role === 'admin') return { label: 'Administrador General', color: '#f59e0b', icon: 'admin' };
    if (authUser.role === 'pastor') return { label: 'Pastor de la Comunidad', color: '#d97706', icon: 'pastor' };
    if (authUser.role === 'moderador') return { label: 'Líder / Moderador', color: '#0ea5e9', icon: 'moderador' };
    return { label: 'Creyente Verificado', color: '#0284c7', icon: 'creyente' };
  };

  const currentRoleInfo = getActiveRoleLabel();

  return (
    <View style={styles.container}>
      {/* Header Dev */}
      <View style={styles.headerRow}>
        <View style={styles.tagBadge}>
          <Sparkles size={13} color="#f59e0b" />
          <Text style={styles.tagText}>HERRAMIENTA DEV</Text>
        </View>
        <Text style={styles.versionHint}>Simulador de Roles en Vivo</Text>
      </View>

      <Text style={styles.description}>
        Cambia de rol al instante para probar distintivos celestiales, permisos de moderación y acceso pastoral sin iniciar sesión con otra cuenta.
      </Text>

      {/* Rol Activo */}
      <View style={styles.activeCard}>
        <Text style={styles.activeLabel}>Rol activo actual:</Text>
        <View style={[styles.activePill, { borderColor: currentRoleInfo.color }]}>
          <View style={[styles.activeDot, { backgroundColor: currentRoleInfo.color }]} />
          <Text style={[styles.activeValue, { color: currentRoleInfo.color }]}>
            {currentRoleInfo.label}
          </Text>
        </View>
      </View>

      {/* Grid de Botones de Roles */}
      <View style={styles.buttonsGrid}>
        {/* 1. Creyente */}
        <TouchableOpacity
          style={[
            styles.roleBtn,
            authUser?.role === 'creyente' && authUser?.status !== 'suspended' && styles.roleBtnSelected,
          ]}
          onPress={() => handleSelectRole('creyente', 'Creyente Verificado')}
          activeOpacity={0.8}
        >
          <BadgeCheck size={18} color="#0284c7" />
          <View style={styles.btnTextCol}>
            <Text style={styles.btnTitle}>Creyente</Text>
            <Text style={styles.btnSubtitle}>Check azul · Devoción pura</Text>
          </View>
          {authUser?.role === 'creyente' && authUser?.status !== 'suspended' && (
            <Check size={16} color="#0284c7" />
          )}
        </TouchableOpacity>

        {/* 2. Moderador */}
        <TouchableOpacity
          style={[
            styles.roleBtn,
            authUser?.role === 'moderador' && authUser?.status !== 'suspended' && styles.roleBtnSelected,
          ]}
          onPress={() => handleSelectRole('moderador', 'Líder / Moderador')}
          activeOpacity={0.8}
        >
          <ShieldCheck size={18} color="#0ea5e9" />
          <View style={styles.btnTextCol}>
            <Text style={styles.btnTitle}>Moderador</Text>
            <Text style={styles.btnSubtitle}>Fijar y borrar comentarios</Text>
          </View>
          {authUser?.role === 'moderador' && authUser?.status !== 'suspended' && (
            <Check size={16} color="#0ea5e9" />
          )}
        </TouchableOpacity>

        {/* 3. Pastor */}
        <TouchableOpacity
          style={[
            styles.roleBtn,
            authUser?.role === 'pastor' && authUser?.status !== 'suspended' && styles.roleBtnSelected,
          ]}
          onPress={() => handleSelectRole('pastor', 'Pastor de la Comunidad')}
          activeOpacity={0.8}
        >
          <ShieldCheck size={18} color="#d97706" />
          <View style={styles.btnTextCol}>
            <Text style={[styles.btnTitle, { color: '#fbbf24' }]}>Pastor</Text>
            <Text style={styles.btnSubtitle}>Escudo oro · Panel pastoral</Text>
          </View>
          {authUser?.role === 'pastor' && authUser?.status !== 'suspended' && (
            <Check size={16} color="#fbbf24" />
          )}
        </TouchableOpacity>

        {/* 4. Admin */}
        <TouchableOpacity
          style={[
            styles.roleBtn,
            authUser?.role === 'admin' && authUser?.status !== 'suspended' && styles.roleBtnSelected,
          ]}
          onPress={() => handleSelectRole('admin', 'Administrador')}
          activeOpacity={0.8}
        >
          <Zap size={18} color="#f59e0b" />
          <View style={styles.btnTextCol}>
            <Text style={styles.btnTitle}>Administrador</Text>
            <Text style={styles.btnSubtitle}>Acceso total al sistema</Text>
          </View>
          {authUser?.role === 'admin' && authUser?.status !== 'suspended' && (
            <Check size={16} color="#f59e0b" />
          )}
        </TouchableOpacity>
      </View>

      {/* Acciones Secundarias: Anónimo y Suspendido */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity
          style={[styles.secondaryBtn, !authUser && styles.roleBtnSelected]}
          onPress={() => handleSelectRole('anon', 'Sin Sesión')}
          activeOpacity={0.8}
        >
          <LogOut size={15} color="#94a3b8" />
          <Text style={styles.secondaryBtnText}>Modo Anónimo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            authUser?.status === 'suspended' && { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.12)' },
          ]}
          onPress={() => handleSelectRole('suspended', 'Usuario Suspendido')}
          activeOpacity={0.8}
        >
          <ShieldAlert size={15} color="#ef4444" />
          <Text style={[styles.secondaryBtnText, { color: '#ef4444' }]}>Simular Baneo</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Toast */}
      {feedback && (
        <View style={styles.feedbackToast}>
          <Check size={14} color="#10b981" />
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#131b24',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    padding: 18,
    marginVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  tagText: {
    fontSize: 0.72 * 16,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.8,
  },
  versionHint: {
    fontSize: 0.75 * 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  description: {
    fontSize: 0.82 * 16,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 14,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a0f14',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeLabel: {
    fontSize: 0.78 * 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeValue: {
    fontSize: 0.82 * 16,
    fontWeight: '700',
  },
  buttonsGrid: {
    gap: 8,
    marginBottom: 12,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b2633',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  roleBtnSelected: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  btnTextCol: {
    flex: 1,
  },
  btnTitle: {
    fontSize: 0.9 * 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnSubtitle: {
    fontSize: 0.72 * 16,
    color: '#94a3b8',
    marginTop: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1720',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 0.78 * 16,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  feedbackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginTop: 10,
  },
  feedbackText: {
    fontSize: 0.8 * 16,
    color: '#10b981',
    fontWeight: '600',
  },
});
