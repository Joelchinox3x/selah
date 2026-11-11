import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, UserRole } from './types';
import { saveCommunityName, getCommunityName } from '../daily/services/communityIdentity';
import {
  registerOrUpdatePastoralMember,
  verifyPastoralPin,
  isMemberSuspended,
  resolveRoleForUser,
} from './pastoralService';

const AUTH_STORAGE_KEY = '@selah_auth_state_v2';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isPastoralUnlocked: boolean;
  isLoading: boolean;
  authError: string | null;

  loginWithGoogle: (customData?: { name?: string; email?: string; avatarUrl?: string }) => Promise<AuthUser>;
  loginAsGuestWithName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileName: (newName: string) => Promise<void>;
  setUserRole: (newRole: UserRole) => Promise<void>;
  unlockPastoralSession: (pin: string) => Promise<boolean>;
  lockPastoralSession: () => void;
  checkSuspendedStatus: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isPastoralUnlocked: false,
      isLoading: false,
      authError: null,

      loginWithGoogle: async (customData) => {
        set({ isLoading: true, authError: null });
        try {
          const currentStoredName = await getCommunityName();
          const cleanName = (customData?.name || currentStoredName || 'Creyente en Cristo').trim();
          const cleanEmail = (customData?.email || 'creyente.selah@gmail.com').trim().toLowerCase();
          const defaultAvatar = customData?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

          // Check if previously registered as pastor/moderator in pastoral list
          const suspended = await isMemberSuspended(cleanEmail);
          if (suspended) {
            set({ authError: 'Esta cuenta ha sido suspendida por moderación comunitaria.', isLoading: false });
            throw new Error('Esta cuenta ha sido suspendida por moderación comunitaria.');
          }

          const existingUser = get().user;
          const userRole: UserRole = await resolveRoleForUser(cleanEmail, existingUser?.role);
          const isPastor = userRole === 'pastor';
          const isModerator = userRole === 'moderador' || isPastor;

          const authUser: AuthUser = {
            id: existingUser?.id || `google_${Date.now().toString(36)}`,
            name: cleanName,
            email: cleanEmail,
            avatarUrl: defaultAvatar,
            role: userRole,
            isVerified: true,
            isPastor,
            isModerator,
            status: 'active',
            provider: 'google',
            lastActiveAt: 'Ahora mismo',
            reflectionsCount: existingUser?.reflectionsCount || 1,
            blessingsCount: existingUser?.blessingsCount || 0,
          };

          // Sync verified name to Community Reflections
          await saveCommunityName(authUser.name);

          // Register in pastoral directory
          await registerOrUpdatePastoralMember({
            ...authUser,
            joinedAt: existingUser ? (existingUser as any).joinedAt || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          });

          set({
            user: authUser,
            isAuthenticated: true,
            isLoading: false,
            authError: null,
          });

          return authUser;
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error al conectar con Google';
          set({ authError: msg, isLoading: false });
          throw error;
        }
      },

      loginAsGuestWithName: async (name: string) => {
        const trimmed = name.trim().slice(0, 60);
        await saveCommunityName(trimmed);
        const currentUser = get().user;
        if (currentUser) {
          const updated: AuthUser = { ...currentUser, name: trimmed };
          set({ user: updated });
        }
      },

      logout: async () => {
        set({
          user: null,
          isAuthenticated: false,
          isPastoralUnlocked: false,
          authError: null,
        });
      },

      updateProfileName: async (newName: string) => {
        const trimmed = newName.trim().slice(0, 60);
        await saveCommunityName(trimmed);
        const currentUser = get().user;
        if (currentUser) {
          const updated: AuthUser = { ...currentUser, name: trimmed };
          set({ user: updated });
          await registerOrUpdatePastoralMember({
            ...updated,
            joinedAt: (currentUser as any).joinedAt || new Date().toISOString().split('T')[0],
          });
        }
      },

      setUserRole: async (newRole: UserRole) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated: AuthUser = {
            ...currentUser,
            role: newRole,
            isPastor: newRole === 'pastor',
            isVerified: newRole !== 'miembro',
          };
          set({ user: updated });
          await registerOrUpdatePastoralMember({
            ...updated,
            joinedAt: (currentUser as any).joinedAt || new Date().toISOString().split('T')[0],
          });
        }
      },

      unlockPastoralSession: async (pin: string) => {
        const isValid = await verifyPastoralPin(pin);
        if (isValid) {
          set({ isPastoralUnlocked: true });
          return true;
        }
        return false;
      },

      lockPastoralSession: () => {
        set({ isPastoralUnlocked: false });
      },

      checkSuspendedStatus: async () => {
        const currentUser = get().user;
        if (!currentUser) return false;
        const isSusp = await isMemberSuspended(currentUser.email || currentUser.id);
        if (isSusp && currentUser.status !== 'suspended') {
          set({ user: { ...currentUser, status: 'suspended' } });
        }
        return isSusp;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
