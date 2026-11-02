import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDailyDevotional } from '../db/bibleDb';

try {
  if (Platform.OS !== 'web' && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (err) {
  console.warn('Notifications handler init notice:', err);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * 14-Day Sliding Window Scheduler:
 * Schedules morning (e.g. 07:00) and evening (e.g. 21:30) alerts for the next 14 days.
 * Keeps total scheduled items under 28 (safe below iOS hard limit of 64).
 */
export async function scheduleSliding14DayNotifications(
  morningTime: string = '07:00',
  eveningTime: string = '21:30'
): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Clear all previously scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const [morningHour, morningMinute] = morningTime.split(':').map(Number);
    const [eveningHour, eveningMinute] = eveningTime.split(':').map(Number);

    const now = new Date();

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + dayOffset);

      const devotional = await getDailyDevotional({ date: targetDate });
      const verseRef = `${devotional.verse.book_name} ${devotional.verse.chapter}:${devotional.verse.verse}`;
      const snippet = devotional.verse.text.length > 90
        ? devotional.verse.text.substring(0, 87) + '...'
        : devotional.verse.text;

      // 1. Morning notification
      const morningTarget = new Date(targetDate);
      morningTarget.setHours(morningHour, morningMinute, 0, 0);

      if (morningTarget.getTime() > now.getTime()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Palabra para tu mañana ✨ (${verseRef})`,
            body: `«${snippet}»`,
            data: {
              bookId: devotional.verse.book_id,
              chapter: devotional.verse.chapter,
              verse: devotional.verse.verse,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: morningTarget,
          },
        });
      }

      // 2. Evening notification
      const eveningTarget = new Date(targetDate);
      eveningTarget.setHours(eveningHour, eveningMinute, 0, 0);

      if (eveningTarget.getTime() > now.getTime()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Paz para tu descanso 🌙 (${verseRef})`,
            body: `«${snippet}» Que esta promesa aquiete tus pensamientos.`,
            data: {
              bookId: devotional.verse.book_id,
              chapter: devotional.verse.chapter,
              verse: devotional.verse.verse,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: eveningTarget,
          },
        });
      }
    }
  } catch (error) {
    console.warn('Failed to schedule 14-day notifications:', error);
  }
}
