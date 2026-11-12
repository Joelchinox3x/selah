import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { getBibleDb } from '@/src/services/db/bibleDb';
import { getUserDb } from '@/src/services/db/userDb';
import { scheduleSliding14DayNotifications } from '@/src/services/notifications/notificationService';
import { themes } from '@/src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();

  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const themeMode = useSettingsStore((s) => s.theme);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const morningTime = useSettingsStore((s) => s.morningNotificationTime);
  const eveningTime = useSettingsStore((s) => s.eveningNotificationTime);

  const theme = themes[themeMode] || themes.sepia;

  const prepareApp = useCallback(async () => {
    try {
      setInitError(null);
      await loadSettings();
      // Warm up and verify both databases (unpacks prebuilt 14MB Bible on first boot)
      await getBibleDb();
      await getUserDb();

      // 14-day sliding window notification refresh on app start
      if (notificationsEnabled) {
        scheduleSliding14DayNotifications(morningTime, eveningTime);
      }
      setIsReady(true);
    } catch (err) {
      console.error('[RootLayout] Error en inicialización:', err);
      setInitError(err instanceof Error ? err.message : String(err));
    }
  }, [loadSettings, notificationsEnabled, morningTime, eveningTime]);

  useEffect(() => {
    prepareApp();
  }, [prepareApp]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  // Listen for user tapping a scheduled notification -> Deep link to reader
  useEffect(() => {
    try {
      if (typeof Notifications.addNotificationResponseReceivedListener === 'function') {
        const subscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const data = response?.notification?.request?.content?.data;
            if (data?.bookId && data?.chapter) {
              router.push({
                pathname: `/reader/${data.bookId}/${data.chapter}`,
                params: { highlightVerse: String(data.verse || 1) },
              } as any);
            }
          }
        );

        return () => {
          if (subscription && typeof subscription.remove === 'function') {
            subscription.remove();
          }
        };
      }
    } catch (e) {
      console.warn('Notifications listener unavailable:', e);
    }
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.splashTitle, { color: theme.text }]}>Selah</Text>
        <Text style={[styles.splashSubtitle, { color: theme.textMuted }]}>
          {initError
            ? `Error al inicializar: ${initError}`
            : 'Preparando las Sagradas Escrituras...'}
        </Text>
        {initError ? (
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.accent }]}
            onPress={prepareApp}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Reintentar conexión</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="reader/[book]/[chapter]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="mood/[key]"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="mood/sos-modal"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="characters/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="characters/[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="places/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="places/[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="places/map"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="timeline/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="discoveries/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="curiosities/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="admin/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="moderation/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="profile/index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    letterSpacing: 1,
  },
  splashSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
