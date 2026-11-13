import { Platform, Alert } from 'react-native';

export interface PickImageResult {
  success: boolean;
  uri?: string;
  cancelled?: boolean;
  error?: string;
  isNativeSupported?: boolean;
}

/**
 * Intenta cargar expo-image-picker de forma segura sin romper el bundle
 * si el binario nativo no incluye 'ExponentImagePicker'.
 */
function getNativeImagePicker(): any {
  try {
    // require dinámico protegido por try/catch
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const picker = require('expo-image-picker');
    if (picker && typeof picker.launchImageLibraryAsync === 'function') {
      return picker;
    }
  } catch (err) {
    // ExponentImagePicker no compilado en este APK o cliente
  }
  return null;
}

/**
 * Intenta cargar expo-image-manipulator de forma segura
 */
function getNativeImageManipulator(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const manip = require('expo-image-manipulator');
    if (manip && typeof manip.manipulateAsync === 'function') {
      return manip;
    }
  } catch {
    // ExpoImageManipulator no compilado en este cliente
  }
  return null;
}

/**
 * Verifica si el selector nativo está disponible
 */
export function isNativePickerSupported(): boolean {
  if (Platform.OS === 'web') return true;
  return getNativeImagePicker() !== null;
}

/**
 * Redimensiona y optimiza a proporción cuadrada 1:1 (512x512)
 */
async function optimizeSquareImage(uri: string): Promise<string> {
  const manip = getNativeImageManipulator();
  if (!manip) return uri;
  try {
    const res = await manip.manipulateAsync(
      uri,
      [{ resize: { width: 512, height: 512 } }],
      { compress: 0.85, format: manip.SaveFormat?.JPEG || 'jpeg' }
    );
    return res.uri || uri;
  } catch {
    return uri;
  }
}

/**
 * Selector web mediante input HTML5
 */
function pickImageOnWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve(null);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    document.body.appendChild(input);
    input.click();

    setTimeout(() => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }, 2000);
  });
}

/**
 * Selecciona imagen de la galería con recorte cuadrado 1:1 seguro
 */
export async function pickImageWithCrop(): Promise<PickImageResult> {
  // 1. Fallback para navegador web
  if (Platform.OS === 'web') {
    try {
      const webUri = await pickImageOnWeb();
      if (!webUri) return { success: false, cancelled: true };
      const optimized = await optimizeSquareImage(webUri);
      return { success: true, uri: optimized, isNativeSupported: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al cargar imagen en web' };
    }
  }

  // 2. Selector nativo móvil
  const picker = getNativeImagePicker();
  if (!picker) {
    Alert.alert(
      'Módulo de Galería no disponible',
      'El módulo nativo ExponentImagePicker aún no está compilado en este APK o cliente.\n\n' +
        'Opciones disponibles:\n' +
        '• Usar tu foto oficial de Google\n' +
        '• Elegir un Avatar Espiritual\n' +
        '• Pegar el enlace URL de tu foto\n\n' +
        '(Para usar la galería nativa, compila un nuevo build con "npx expo run:android" o EAS Build).'
    );
    return {
      success: false,
      isNativeSupported: false,
      error: 'ExponentImagePicker native module not linked',
    };
  }

  try {
    const permission = await picker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso Requerido',
        'Se necesita acceso a tus fotos para recortar tu imagen en formato cuadrado 1:1.'
      );
      return { success: false, error: 'Permission denied' };
    }

    const result = await picker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Proporción cuadrada estricta 1:1
      quality: 0.9,
    });

    if (result.canceled || !result.assets || !result.assets[0]?.uri) {
      return { success: false, cancelled: true };
    }

    const optimized = await optimizeSquareImage(result.assets[0].uri);
    return { success: true, uri: optimized, isNativeSupported: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al abrir la galería' };
  }
}

/**
 * Captura foto con la cámara con recorte cuadrado 1:1 seguro
 */
export async function takePhotoWithCrop(): Promise<PickImageResult> {
  if (Platform.OS === 'web') {
    Alert.alert('Cámara Web', 'Usa "Elegir de Galería" para subir tu foto desde este navegador.');
    return { success: false, isNativeSupported: false };
  }

  const picker = getNativeImagePicker();
  if (!picker) {
    Alert.alert(
      'Cámara no disponible',
      'El módulo nativo ExponentImagePicker no está presente en este binario.\n\n' +
        'Puedes pegar el enlace de tu foto, usar tu cuenta de Google o elegir un avatar prediseñado.'
    );
    return {
      success: false,
      isNativeSupported: false,
      error: 'ExponentImagePicker native module not linked',
    };
  }

  try {
    const permission = await picker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso Requerido',
        'Se necesita acceso a la cámara para tomar tu foto cuadrada.'
      );
      return { success: false, error: 'Permission denied' };
    }

    const result = await picker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Proporción cuadrada estricta 1:1
      quality: 0.9,
    });

    if (result.canceled || !result.assets || !result.assets[0]?.uri) {
      return { success: false, cancelled: true };
    }

    const optimized = await optimizeSquareImage(result.assets[0].uri);
    return { success: true, uri: optimized, isNativeSupported: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al abrir la cámara' };
  }
}
