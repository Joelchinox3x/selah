import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/src/theme/colors';

const STORAGE_KEY = '@selah_settings_v1';

interface SettingsState {
  theme: ThemeMode;
  fontSize: number;
  lineHeightMultiplier: number;
  notificationsEnabled: boolean;
  morningNotificationTime: string; // "07:00"
  eveningNotificationTime: string; // "21:30"
  hapticsEnabled: boolean;
  lastReadBookId: number;
  lastReadChapter: number;
  isLoaded: boolean;

  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setMorningTime: (time: string) => void;
  setEveningTime: (time: string) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setLastRead: (bookId: number, chapter: number) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'sepia', // Modo Sepia por defecto para descanso visual cálido
      fontSize: 18,
      lineHeightMultiplier: 1.65,
      notificationsEnabled: true,
      morningNotificationTime: '07:00',
      eveningNotificationTime: '21:30',
      hapticsEnabled: true,
      lastReadBookId: 19, // Salmos
      lastReadChapter: 23, // Salmo 23
      isLoaded: true,

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setMorningTime: (morningNotificationTime) => set({ morningNotificationTime }),
      setEveningTime: (eveningNotificationTime) => set({ eveningNotificationTime }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setLastRead: (lastReadBookId, lastReadChapter) => set({ lastReadBookId, lastReadChapter }),
      loadSettings: async () => {
        set({ isLoaded: true });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        lineHeightMultiplier: state.lineHeightMultiplier,
        notificationsEnabled: state.notificationsEnabled,
        morningNotificationTime: state.morningNotificationTime,
        eveningNotificationTime: state.eveningNotificationTime,
        hapticsEnabled: state.hapticsEnabled,
        lastReadBookId: state.lastReadBookId,
        lastReadChapter: state.lastReadChapter,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    }
  )
);
