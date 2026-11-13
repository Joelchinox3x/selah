import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { Sparkles, RefreshCw } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  isReady: boolean;
  initError: string | null;
  onRetry?: () => void;
  onFinish: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  isReady,
  initError,
  onRetry,
  onFinish,
}) => {
  // Animación del contenedor principal (Zoom de salida y fade out cinemático)
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  // Animación de respiración / flotación continua (60 FPS)
  const floatY = useSharedValue(0);
  const glowPulse = useSharedValue(0.4);
  const haloScale = useSharedValue(0.95);

  // Barra de progreso dorada sutil
  const progressWidth = useSharedValue(0);

  // 1. Al montar, ocultamos el splash estático nativo del sistema operativo
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Iniciar animación continua de flotación y resplandor
    floatY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Animación de progreso hacia el 90% mientras se desempaqueta la base de datos
    progressWidth.value = withTiming(85, {
      duration: 1600,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // 2. Cuando el motor de la app está listo (isReady === true)
  useEffect(() => {
    if (isReady && !initError) {
      // Llevar la barra al 100%
      progressWidth.value = withTiming(100, { duration: 300 });

      // Transición cinemática de salida: Suave zoom-in hacia adelante y fade-out
      const timeout = setTimeout(() => {
        containerScale.value = withTiming(1.08, {
          duration: 550,
          easing: Easing.out(Easing.cubic),
        });
        containerOpacity.value = withTiming(
          0,
          {
            duration: 550,
            easing: Easing.inOut(Easing.quad),
          },
          (finished) => {
            if (finished) {
              runOnJS(onFinish)();
            }
          }
        );
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [isReady, initError]);

  // Estilos animados con Reanimated
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
    transform: [{ scale: haloScale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* FONDO MAJESTUOSO COMPLETO CON LA IMAGEN VERTICAL EN COBERTURA TOTAL */}
      <Animated.View style={[styles.imageWrapper, animatedFloatStyle]}>
        <Image
          source={require('@/assets/images/splash.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />

        {/* RESPLANDOR CELESTIAL PULSANTE DETRÁS DE LA PALOMA Y LA BIBLIA */}
        <Animated.View style={[styles.haloGlow, animatedGlowStyle]} pointerEvents="none" />
      </Animated.View>

      {/* ÁREA INFERIOR: ESTADO, LEMA Y PROGRESO DORADO */}
      <View style={styles.footer}>
        {initError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>No se pudo cargar la Biblia: {initError}</Text>
            {onRetry && (
              <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
                <RefreshCw size={14} color="#090d16" />
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.loadingBox}>
            {/* Barra de progreso dorada súper delgada y elegante */}
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
            </View>

            <View style={styles.taglineRow}>
              <Sparkles size={13} color="#f59e0b" />
              <Text style={styles.taglineText}>Pausa • Medita • Conecta con Dios</Text>
              <Sparkles size={13} color="#f59e0b" />
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#090d16',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  splashImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  haloGlow: {
    position: 'absolute',
    top: '34%',
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: (SCREEN_WIDTH * 0.75) / 2,
    backgroundColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 60,
    elevation: 30,
    opacity: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 36,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  loadingBox: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    width: 140,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 3,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.88,
  },
  taglineText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    maxWidth: 320,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#090d16',
    fontWeight: '700',
    fontSize: 12,
  },
});
