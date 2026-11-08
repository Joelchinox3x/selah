import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardBackground, CARD_BACKGROUNDS } from '@/src/features/share/data/cardBackgrounds';

const STORAGE_KEY = '@selah_remote_backgrounds_v1';
const REMOTE_API_URL = 'https://selah.boxtiove.com/api/backgrounds';

export interface RemoteBackgroundItem {
  id: string;
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
function toCardBackground(item: RemoteBackgroundItem): CardBackground {
  return {
    id: item.id,
    name: item.title,
    subtitle: `Colección en la nube (${item.category})`,
    category: 'spiritual',
    type: 'image',
    source: { uri: item.url },
    source916: item.aspect_ratio === '9:16' ? { uri: item.url } : { uri: item.url },
    source1x1: item.aspect_ratio === '1:1' ? { uri: item.url } : { uri: item.url },
    overlayOpacity: 0.35,
  };
}

/**
 * Carga fondos almacenados en caché local (offline-first)
 */
export async function loadCachedRemoteBackgrounds(): Promise<CardBackground[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const items: RemoteBackgroundItem[] = JSON.parse(raw);
      memoryRemoteBackgrounds = items.map(toCardBackground);
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
        memoryRemoteBackgrounds = rawItems.map(toCardBackground);
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
      (bg) => bg.type === 'solid' || Boolean(bg.source916 || bg.source)
    );
  }

  return combined.filter(
    (bg) => bg.type === 'solid' || Boolean(bg.source1x1 || bg.source)
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
