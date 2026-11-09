import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MyReflectionItem {
  id: string;
  verseSlug: string;
  verseCitation: string;
  userName: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = '@selah_my_published_reflections_v1';

export async function getMyPublishedReflections(): Promise<MyReflectionItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMyPublishedReflection(item: MyReflectionItem): Promise<void> {
  try {
    const current = await getMyPublishedReflections();
    // Prepend and avoid duplicate by id or identical text+verseSlug
    const filtered = current.filter(
      (c) => c.id !== item.id && !(c.verseSlug === item.verseSlug && c.text === item.text)
    );
    const updated = [item, ...filtered];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (err) {
    console.warn('Error saving user reflection:', err);
  }
}

export async function removeMyPublishedReflection(id: string): Promise<void> {
  try {
    const current = await getMyPublishedReflections();
    const updated = current.filter((c) => c.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error removing user reflection:', err);
  }
}
