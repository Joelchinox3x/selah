import { Platform, TurboModuleRegistry } from 'react-native';
import { getVerseShareMessage } from './verseShare';

export function assertImageCaptionSharingAvailable(): void {
  if (Platform.OS === 'web') {
    throw new Error('Comparte la postal con su enlace desde la app de Selah.');
  }
  if (!TurboModuleRegistry.get('RNShare')) {
    throw new Error('Instala la nueva APK de Selah para compartir la imagen con su enlace.');
  }
}

export async function shareVerseImage(uri: string, shareUrl: string, citation: string): Promise<void> {
  const message = getVerseShareMessage(shareUrl);
  assertImageCaptionSharingAvailable();
  // Load only after checking native support, so older APKs can still open Selah.
  const { default: Share } = await import('react-native-share');
  await Share.open({
    url: uri.startsWith('/') ? `file://${uri}` : uri,
    type: 'image/jpeg',
    title: `Compartir ${citation}`,
    message,
    failOnCancel: false,
  });
}
