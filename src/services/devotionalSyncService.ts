import AsyncStorage from '@react-native-async-storage/async-storage';
import { upsertDevotionalCalendarRows } from '@/src/services/db/userDb';

const LAST_SYNC_KEY = 'selah.calendar-last-sync-timestamp';
let pendingSync: Promise<{ updated: number }> | null = null;

async function syncCalendar(): Promise<{ updated: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const since = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const query = since ? `?since=${encodeURIComponent(since)}` : '';
    const response = await fetch(`https://selah.boxtiove.com/api/devotional-calendar/sync${query}`, { signal: controller.signal });
    if (!response.ok) return { updated: 0 };
    const data = await response.json();
    if (data.success !== true || !Array.isArray(data.changes) || typeof data.serverTime !== 'string') return { updated: 0 };
    const serverTime = new Date(data.serverTime);
    if (Number.isNaN(serverTime.getTime())) return { updated: 0 };
    if (!data.changes.every((row: Record<string, unknown>) => row && Number.isInteger(row.day_number) && Number(row.day_number) >= 1 && Number(row.day_number) <= 365)) return { updated: 0 };
    await upsertDevotionalCalendarRows(data.changes);
    // Never move the cursor forward until all received rows have been saved.
    await AsyncStorage.setItem(LAST_SYNC_KEY, serverTime.toISOString().replace('T', ' ').substring(0, 19));
    return { updated: data.changes.length };
  } catch {
    // Preserve the offline calendar and cursor so a later refresh can retry.
    return { updated: 0 };
  } finally { clearTimeout(timeout); }
}

export function syncDevotionalCalendarWithServer(): Promise<{ updated: number }> {
  if (!pendingSync) pendingSync = syncCalendar().finally(() => { pendingSync = null; });
  return pendingSync;
}
