import AsyncStorage from '@react-native-async-storage/async-storage';
const DEVICE_KEY = '@selah_community_device_v1';
export const COMMUNITY_NAME_KEY = '@selah_user_reflection_name_v1';
let devicePromise: Promise<string> | null = null;

// Installation identifier for anonymous reactions; this is not an authenticated account.
export function newCommunityRequestId(): string {
  return `${Date.now().toString(36)}_${Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('')}`;
}
export function getCommunityDeviceId(): Promise<string> {
  if (!devicePromise) devicePromise = (async () => {
    const stored = await AsyncStorage.getItem(DEVICE_KEY);
    if (stored && /^[a-zA-Z0-9_-]{16,100}$/.test(stored)) return stored;
    const id = newCommunityRequestId();
    await AsyncStorage.setItem(DEVICE_KEY, id);
    return id;
  })().catch((error) => { devicePromise = null; throw error; });
  return devicePromise;
}
export async function getCommunityName(): Promise<string> {
  return (await AsyncStorage.getItem(COMMUNITY_NAME_KEY) ?? '').trim().slice(0, 60);
}
export async function saveCommunityName(name: string): Promise<void> {
  await AsyncStorage.setItem(COMMUNITY_NAME_KEY, name.trim().slice(0, 60));
}
