import { create } from 'zustand';
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

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'sepia', // Modo Sepia por defecto para descanso visual cálido
  fontSize: 18,
  lineHeightMultiplier: 1.65,
  notificationsEnabled: true,
  morningNotificationTime: '07:00',
  eveningNotificationTime: '21:30',
  hapticsEnabled: true,
  lastReadBookId: 19, // Salmos
  lastReadChapter: 23, // Salmo 23
  isLoaded: false,

  setTheme: (theme) => {
    set({ theme });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), theme })
    ).catch(() => {});
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), fontSize })
    ).catch(() => {});
  },

  setNotificationsEnabled: (notificationsEnabled) => {
    set({ notificationsEnabled });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), notificationsEnabled })
    ).catch(() => {});
  },

  setMorningTime: (morningNotificationTime) => {
    set({ morningNotificationTime });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), morningNotificationTime })
    ).catch(() => {});
  },

  setEveningTime: (eveningNotificationTime) => {
    set({ eveningNotificationTime });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), eveningNotificationTime })
    ).catch(() => {});
  },

  setHapticsEnabled: (hapticsEnabled) => {
    set({ hapticsEnabled });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), hapticsEnabled })
    ).catch(() => {});
  },

  setLastRead: (lastReadBookId, lastReadChapter) => {
    set({ lastReadBookId, lastReadChapter });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), lastReadBookId, lastReadChapter })
    ).catch(() => {});
  },

  loadSettings: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          theme: parsed.theme ?? 'sepia',
          fontSize: parsed.fontSize ?? 18,
          notificationsEnabled: parsed.notificationsEnabled ?? true,
          morningNotificationTime: parsed.morningNotificationTime ?? '07:00',
          eveningNotificationTime: parsed.eveningNotificationTime ?? '21:30',
          hapticsEnabled: parsed.hapticsEnabled ?? true,
          lastReadBookId: parsed.lastReadBookId ?? 19,
          lastReadChapter: parsed.lastReadChapter ?? 23,
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
