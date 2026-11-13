import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';
import { SPLASH_VIDEO_BASE64 } from '@/src/assets/splashVideoBase64';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoSplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

export const VideoSplashScreen: React.FC<VideoSplashScreenProps> = ({
  isReady,
  onFinish,
}) => {
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const finishTriggered = useRef(false);

  const handleFinish = () => {
    if (finishTriggered.current) return;
    finishTriggered.current = true;

    containerScale.value = withTiming(1.06, { duration: 350, easing: Easing.out(Easing.cubic) });
    containerOpacity.value = withTiming(
      0,
      { duration: 350, easing: Easing.inOut(Easing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }
    );
  };

  // Fallback de seguridad: si el video no envía evento de finalizado antes de 4s, terminar
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleMessage = (event: any) => {
    const data = event?.nativeEvent?.data;
    if (data === 'playing') {
      // El video ya está activo y dibujando fotogramas:
      // Ocultar el splash nativo de Android en este preciso milisegundo para CERO parpadeo negro
      SplashScreen.hideAsync().catch(() => {});
    } else if (data === 'ended') {
      handleFinish();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, html {
            width: 100%;
            height: 100%;
            background-color: #090d16;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        </style>
      </head>
      <body>
        <video
          id="splashVideo"
          src="${SPLASH_VIDEO_BASE64}"
          autoplay
          playsinline
          webkit-playsinline
          muted
        ></video>
        <script>
          const video = document.getElementById('splashVideo');
          
          video.addEventListener('playing', () => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('playing');
            }
          });

          video.addEventListener('ended', () => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('ended');
            }
          });

          // Iniciar reproducción
          video.play().catch(() => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('playing');
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onMessage={handleMessage}
        androidLayerType="hardware"
      />

      {/* Permite tocar la pantalla para saltar el video si el usuario tiene prisa */}
      <TouchableOpacity
        style={styles.skipTouchArea}
        activeOpacity={1}
        onPress={handleFinish}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#090d16',
    zIndex: 99999,
  },
  webview: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#090d16',
  },
  skipTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});
