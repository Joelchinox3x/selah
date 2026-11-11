import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardBackground, CARD_BACKGROUNDS } from '@/src/features/share/data/cardBackgrounds';

const STORAGE_KEY = '@selah_remote_backgrounds_v1';
const REMOTE_API_URL = 'https://selah.boxtiove.com/api/backgrounds';

export interface RemoteBackgroundItem {
  id: string;
  pair_id?: string;
  title: string;
  category: string;
  aspect_ratio: '9:16' | '1:1';
  url: string;
  thumbnail_url?: string;
  created_at: string;
}

let memoryRemoteBackgrounds: CardBackground[] = [];

/**
 * Convierte un fondo remoto de Cloudflare a la estructura CardBackground de la app
 */
export function pairRemoteBackgrounds(items: RemoteBackgroundItem[]): CardBackground[] {
  const pairs = new Map<string, CardBackground>();

  items.forEach((item) => {
    const pairId = item.pair_id?.trim() || item.id;
    const current = pairs.get(pairId) || {
      id: `remote:${pairId}`,
      name: item.title,
      subtitle: `Colección en la nube (${item.category})`,
      category: 'spiritual' as const,
      type: 'image' as const,
      overlayOpacity: 0.35,
    };
    const source = { uri: item.url };
    if (item.aspect_ratio === '9:16') current.source916 = source;
    if (item.aspect_ratio === '1:1') current.source1x1 = source;
    pairs.set(pairId, current);
  });

  // Un fondo remoto solo se publica en el selector cuando su pareja está completa.
  return [...pairs.values()].filter((item) => Boolean(item.source916 && item.source1x1));
}

/**
 * Carga fondos almacenados en caché local (offline-first)
 */
export async function loadCachedRemoteBackgrounds(): Promise<CardBackground[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const items: RemoteBackgroundItem[] = JSON.parse(raw);
      memoryRemoteBackgrounds = pairRemoteBackgrounds(items);
      return memoryRemoteBackgrounds;
    }
  } catch (err) {
    console.warn('[BackgroundsService] Error cargando caché:', err);
  }
  return memoryRemoteBackgrounds;
}

/**
 * Sincroniza fondos en segundo plano con el servidor Cloudflare R2 / D1
 */
export async function syncRemoteBackgrounds(): Promise<CardBackground[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(REMOTE_API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.backgrounds)) {
        const rawItems: RemoteBackgroundItem[] = data.backgrounds;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rawItems));
        memoryRemoteBackgrounds = pairRemoteBackgrounds(rawItems);
        return memoryRemoteBackgrounds;
      }
    }
  } catch (err) {
    // Si no hay internet, continúa con la memoria o el almacenamiento local
  }
  return memoryRemoteBackgrounds;
}

/**
 * Obtiene la lista combinada de fondos locales empaquetados + remotos de Cloudflare
 */
export function getCombinedBackgrounds(ratio?: '9:16' | '1:1'): CardBackground[] {
  const combined = [...CARD_BACKGROUNDS, ...memoryRemoteBackgrounds];

  if (!ratio) return combined;

  if (ratio === '9:16') {
    return combined.filter(
      (bg) => bg.type === 'solid' || Boolean(bg.source916)
    );
  }

  return combined.filter(
    (bg) => bg.type === 'solid' || Boolean(bg.source1x1)
  );
}

/**
 * Obtiene el fondo de versículo considerando tanto los fondos empaquetados como los remotos
 */
export function getDynamicVerseBackground(verseId: number, offset = 0): CardBackground {
  const allImages = getCombinedBackgrounds('9:16').filter((bg) => bg.type === 'image');
  if (allImages.length === 0) return CARD_BACKGROUNDS[0];
  return allImages[(Math.abs(verseId) + offset) % allImages.length];
}
