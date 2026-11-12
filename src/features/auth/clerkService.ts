import AsyncStorage from '@react-native-async-storage/async-storage';

const CLERK_KEY_STORAGE = '@selah_clerk_publishable_key_v1';

// Valor por defecto o variable de entorno de Expo
const DEFAULT_CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

/**
 * Obtiene la Clerk Publishable Key activa
 */
export async function getClerkPublishableKey(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(CLERK_KEY_STORAGE);
    if (saved && saved.trim().startsWith('pk_')) return saved.trim();
  } catch {}
  return DEFAULT_CLERK_KEY;
}

/**
 * Permite guardar o actualizar la Clerk Publishable Key desde la app
 */
export async function setClerkPublishableKey(key: string): Promise<void> {
  const clean = key.trim();
  if (clean) {
    await AsyncStorage.setItem(CLERK_KEY_STORAGE, clean);
  } else {
    await AsyncStorage.removeItem(CLERK_KEY_STORAGE);
  }
}

/**
 * Verifica si Clerk tiene una clave válida configurada
 */
export async function isClerkConfigured(): Promise<boolean> {
  const key = await getClerkPublishableKey();
  return Boolean(key && (key.startsWith('pk_test_') || key.startsWith('pk_live_')));
}

export interface ClerkGoogleProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

/**
 * Extrae la foto oficial en máxima resolución desde el payload de Google / Clerk
 */
export function extractGooglePhotoUrl(user: any): string {
  if (!user) return '';

  // 1. Clerk user.imageUrl
  if (user.imageUrl && typeof user.imageUrl === 'string') {
    return user.imageUrl;
  }

  // 2. Google OAuth profile picture
  if (user.picture && typeof user.picture === 'string') {
    // Si viene de Google con tamaño =s96-c, podemos pedir tamaño mayor =s300-c
    return user.picture.replace(/=s\d+(-c)?$/, '=s300-c');
  }

  // 3. User photo array
  if (Array.isArray(user.photos) && user.photos[0]?.value) {
    return user.photos[0].value;
  }

  // 4. Fallback avatarUrl
  if (user.avatarUrl && typeof user.avatarUrl === 'string') {
    return user.avatarUrl;
  }

  return '';
}
