import AsyncStorage from '@react-native-async-storage/async-storage';
export interface ReflectionDraft { name: string; text: string; parentId?: string; replyToId?: string; replyToName?: string; clientRequestId?: string }
const cache = new Map<string, ReflectionDraft>();
let writes: Promise<unknown> = Promise.resolve();
const stored = new Map<string, string>();
const key = (slug: string) => `selah.reflection-draft.v1:${slug}`;

export async function loadReflectionDraft(slug: string): Promise<ReflectionDraft> {
  const cached = cache.get(slug);
  if (cached) return cached;
  await writes;
  const raw = await AsyncStorage.getItem(key(slug));
  let draft: ReflectionDraft = { name: '', text: '' };
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (typeof parsed?.name === 'string' && typeof parsed?.text === 'string') draft = { name: parsed.name.slice(0, 60), text: parsed.text.slice(0, 400), parentId: typeof parsed.parentId === 'string' ? parsed.parentId : undefined, replyToId: typeof parsed.replyToId === 'string' ? parsed.replyToId : undefined, replyToName: typeof parsed.replyToName === 'string' ? parsed.replyToName : undefined, clientRequestId: typeof parsed.clientRequestId === 'string' ? parsed.clientRequestId : undefined };
  } catch { /* A damaged draft must not block writing a new reflection. */ }
  if (!draft.name) {
    draft.name = (await AsyncStorage.getItem('@selah_user_reflection_name_v1') ?? '').slice(0, 60);
  }
  return cache.get(slug) ?? draft;
}

export function saveReflectionDraft(slug: string, draft: ReflectionDraft): Promise<void> {
  cache.set(slug, draft);
  const pending = writes.then(async () => {
    // Coalesce queued keystrokes into the newest draft instead of writing each version.
    const serialized = JSON.stringify(cache.get(slug));
    if (stored.get(slug) === serialized) return;
    await AsyncStorage.setItem(key(slug), serialized);
    stored.set(slug, serialized);

  });
  writes = pending.catch(() => undefined);
  return pending;
}
