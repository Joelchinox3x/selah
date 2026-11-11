import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'selah.pastoral-visibility.v1';
let lastKnown: boolean | null = null;
export const getPastoralVisibility = (): boolean | null => lastKnown;

export async function loadPastoralVisibility(): Promise<boolean | null> {
  if (lastKnown !== null) return lastKnown;
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored === 'true' || stored === 'false') lastKnown = stored === 'true';
  } catch { /* Keep the valid in-memory value if storage is unavailable. */ }
  return lastKnown;
}

export async function cachePastoralVisibility(value: unknown): Promise<void> {
  if (typeof value !== 'boolean') return;
  lastKnown = value;
  await AsyncStorage.setItem(KEY, String(value)).catch(() => undefined);
}

export async function refreshPastoralVisibility(signal: AbortSignal): Promise<boolean | null> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) abort();
  signal.addEventListener('abort', abort);
  const timeout = setTimeout(abort, 5000);
  try {
    const response = await fetch('https://selah.boxtiove.com/api/app-config', { signal: controller.signal });
    if (!response.ok) return lastKnown;
    const data = await response.json();
    const value = data?.config?.show_pastoral_reflection;
    if (!controller.signal.aborted && data.ok === true && typeof value === 'boolean') await cachePastoralVisibility(value);
  } catch { /* Offline: keep the last valid choice instead of enabling it. */ }
  finally { clearTimeout(timeout); signal.removeEventListener('abort', abort); }
  return lastKnown;
}
