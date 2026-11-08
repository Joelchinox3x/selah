import React, { forwardRef } from 'react';
import { View, Text, Image, Platform, StyleSheet, ImageSourcePropType } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

// Match the postal typography designed for a 390-point phone at export resolution.
const EXPORT_TEXT_SCALE = 1080 / 390;

interface PostalImageExportProps {
  source: ImageSourcePropType;
  text: string;
  citation: string;
  fontSize: number;
  lineHeight: number;
  onImageLoad: () => void;
  onImageError: () => void;
  onLayout: () => void;
}

// A clean 9:16 render target: never captures controls, menus, or notifications.
export const PostalImageExport = forwardRef<View, PostalImageExportProps>(({
  source, text, citation, fontSize, lineHeight, onImageLoad, onImageError, onLayout,
}, ref) => (
  <View
    ref={ref}
    collapsable={false}
    pointerEvents="none"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    onLayout={onLayout}
    style={styles.canvas}
  >
    <Image source={source} style={styles.image} resizeMode="cover" onLoad={onImageLoad} onError={onImageError} />
    <Svg width="1080" height="1920" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="exportPostalGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <Stop offset="22%" stopColor="#000000" stopOpacity="0.15" />
          <Stop offset="65%" stopColor="#000000" stopOpacity="0.30" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#exportPostalGrad)" />
    </Svg>
    <View style={styles.content}>
      <Text style={[styles.verse, { fontSize: fontSize * EXPORT_TEXT_SCALE, lineHeight: lineHeight * EXPORT_TEXT_SCALE }]}>{text}</Text>
      <Text style={styles.citation}>{citation}</Text>
    </View>
    <Text style={styles.signature}>✦ SELAH</Text>
  </View>
));
PostalImageExport.displayName = 'PostalImageExport';

const styles = StyleSheet.create({
  canvas: { position: 'absolute', left: -12000, top: 0, width: 1080, height: 1920, backgroundColor: '#050811', overflow: 'hidden' },
  image: { position: 'absolute', top: 0, left: 0, width: 1080, height: 1920 },
  content: { flex: 1, paddingHorizontal: 72, paddingVertical: 180, justifyContent: 'center' },
  verse: {
    color: '#FFFFFF', textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600', textShadowColor: 'rgba(0, 0, 0, 0.80)', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 20,
  },
  signature: {
    position: 'absolute', bottom: 32, alignSelf: 'center',
    fontSize: 22, fontWeight: '800', letterSpacing: 3,
    color: 'rgba(255, 255, 255, 0.65)',
    textShadowColor: 'rgba(0, 0, 0, 0.90)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  citation: {
    marginTop: 50, color: '#FFFFFF', textAlign: 'right', fontSize: 39, fontWeight: '800', letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.90)', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 16,
  },
});
