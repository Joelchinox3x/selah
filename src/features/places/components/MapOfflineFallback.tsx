import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RotateCw, MapPin } from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';

interface MapOfflineFallbackProps {
  theme: ThemePalette;
  onRetry: () => void;
  onViewPlacesList?: () => void;
}

export const MapOfflineFallback: React.FC<MapOfflineFallbackProps> = ({
  theme,
  onRetry,
  onViewPlacesList,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}>
        <WifiOff size={40} color={theme.accent} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        Sin conexión a internet
      </Text>

      <Text style={[styles.description, { color: theme.textMuted }]}>
        El Mapa Sagrado interactivo requiere conexión a la red para descargar la cartografía satelital y el relieve geográfico de Tierra Santa.
      </Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
          onPress={() => {
            hapticSelection();
            onRetry();
          }}
          activeOpacity={0.8}
        >
          <RotateCw size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Reintentar conexión</Text>
        </TouchableOpacity>

        {onViewPlacesList ? (
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}
            onPress={() => {
              hapticLight();
              onViewPlacesList();
            }}
            activeOpacity={0.8}
          >
            <MapPin size={17} color={theme.text} />
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
              Ver Lugares Sagrados (Modo Offline)
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.offlineNoticePill, { backgroundColor: theme.accentMuted }]}>
        <Text style={[styles.offlineNoticeText, { color: theme.accent }]}>
          ✓ La base de datos arqueológica y versículos funcionan 100% offline
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 28,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  offlineNoticePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  offlineNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
