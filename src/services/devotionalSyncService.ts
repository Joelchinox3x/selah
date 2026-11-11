import AsyncStorage from '@react-native-async-storage/async-storage';
import { upsertDevotionalCalendarRows } from '@/src/services/db/userDb';

const LAST_SYNC_KEY = 'selah.calendar-last-sync-timestamp';

/**
 * Sincroniza silenciosamente los cambios del calendario devocional hechos por el pastor en el panel web.
 * Solo descarga los días modificados después del último timestamp registrado (Delta Sync).
 * Si no hay internet o el servidor no responde, falla silenciosamente sin afectar la UX offline.
 */
export async function syncDevotionalCalendarWithServer(): Promise<{ updated: number }> {
  try {
    const lastSync = (await AsyncStorage.getItem(LAST_SYNC_KEY)) || '2026-11-09 17:41:15';
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const url = `https://selah.boxtiove.com/api/devotional-calendar/sync?since=${encodeURIComponent(lastSync)}`;
    const res = await fetch(url, { signal: controller?.signal });
    if (timeoutId) clearTimeout(timeoutId);

    if (!res || !res.ok) return { updated: 0 };
    const data = await res.json();

    if (data.success && Array.isArray(data.changes) && data.changes.length > 0) {
      await upsertDevotionalCalendarRows(data.changes);
      if (data.serverTime) {
        const formattedTime = new Date(data.serverTime).toISOString().replace('T', ' ').substring(0, 19);
        await AsyncStorage.setItem(LAST_SYNC_KEY, formattedTime);
      }
      return { updated: data.changes.length };
    } else if (data.serverTime) {
      const formattedTime = new Date(data.serverTime).toISOString().replace('T', ' ').substring(0, 19);
      await AsyncStorage.setItem(LAST_SYNC_KEY, formattedTime);
    }
    return { updated: 0 };
  } catch {
    // Offline / timeout: silencioso para garantizar 100% resiliencia local
    return { updated: 0 };
  }
}
