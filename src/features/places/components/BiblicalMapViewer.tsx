import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  DimensionValue,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Layers,
  MapPin,
  Sparkles,
  BookOpen,
  ChevronRight,
  Maximize2,
  Minimize2,
  User,
  Compass,
  X,
} from 'lucide-react-native';
import { BiblicalPlace } from '@/src/types/bible';
import { PLACE_GEO_METADATA } from '../data/placeGeoData';
import { generateBiblicalMapHtml } from './mapHtmlGenerator';
import { MapOfflineFallback } from './MapOfflineFallback';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BiblicalMapViewerProps {
  places: BiblicalPlace[];
  focusedPlaceId?: number | null;
  onSelectPlace?: (place: BiblicalPlace) => void;
  onNavigateToCharacter?: (characterId: number) => void;
  onNavigateToReader?: (bookId: number, chapter: number, verse?: number) => void;
  onViewPlaceDetails?: (placeId: number) => void;
  onViewPlacesList?: () => void;
  height?: DimensionValue;
  showFullControls?: boolean;
}

export const BiblicalMapViewer: React.FC<BiblicalMapViewerProps> = ({
  places,
  focusedPlaceId,
  onSelectPlace,
  onNavigateToCharacter,
  onNavigateToReader,
  onViewPlaceDetails,
  onViewPlacesList,
  height = '100%',
  showFullControls = true,
}) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(
    focusedPlaceId ?? (places.length > 0 ? places[0].id : null)
  );
  const [legendVisible, setLegendVisible] = useState(true);
  const [activeTileLayer, setActiveTileLayer] = useState<'hybrid' | 'relief'>('hybrid');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok || res.status === 204;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    checkConnectivity().then((online: boolean) => {
      if (mounted && !online) {
        setIsOffline(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, [retryCount, checkConnectivity]);

  useEffect(() => {
    if (isMapReady || isOffline) return;
    const timer = setTimeout(async () => {
      if (!isMapReady) {
        const online = await checkConnectivity();
        if (!online) {
          setIsOffline(true);
        }
      }
    }, 7500);
    return () => clearTimeout(timer);
  }, [isMapReady, isOffline, checkConnectivity]);

  // Sync selectedPlace with focusedPlaceId if changed from parent
  React.useEffect(() => {
    if (focusedPlaceId && focusedPlaceId !== selectedPlaceId) {
      setSelectedPlaceId(focusedPlaceId);
      // Send message to WebView to center
      webViewRef.current?.injectJavaScript(`
        if (typeof focusOnPlaceById === 'function') {
          focusOnPlaceById(${focusedPlaceId});
        }
        true;
      `);
    }
  }, [focusedPlaceId]);

  const selectedPlace = useMemo(() => {
    return places.find((p) => p.id === selectedPlaceId) || null;
  }, [places, selectedPlaceId]);

  const selectedGeoMeta = useMemo(() => {
    return selectedPlace ? PLACE_GEO_METADATA[selectedPlace.id] : null;
  }, [selectedPlace]);

  // Center coordinates
  const centerCoords = useMemo(() => {
    if (selectedPlace) {
      return { lat: selectedPlace.latitude, lng: selectedPlace.longitude };
    }
    return { lat: 31.7767, lng: 35.2345 }; // Jerusalem default
  }, [selectedPlace]);

  // Generate HTML payload for Leaflet via modular mapHtmlGenerator
  const mapHtml = useMemo(() => {
    return generateBiblicalMapHtml({
      places,
      focusedPlaceId,
      selectedPlaceId,
      centerCoords,
      activeTileLayer,
      themeMode,
    });
  }, [places, focusedPlaceId, selectedPlaceId, centerCoords, activeTileLayer, themeMode]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'OFFLINE_DETECTED') {
        setIsOffline(true);
      } else if (data.type === 'MAP_READY') {
        setIsMapReady(true);
        setIsOffline(false);
        setLoadError(false);
      } else if (data.type === 'SELECT_PLACE') {
        hapticSelection();
        setSelectedPlaceId(data.id);
        const found = places.find((p) => p.id === data.id);
        if (found && onSelectPlace) {
          onSelectPlace(found);
        }
      }
    } catch (e) {
      console.warn('Map message error:', e);
    }
  };

  const handleRetry = () => {
    hapticLight();
    setIsOffline(false);
    setLoadError(false);
    setIsMapReady(false);
    setRetryCount((prev) => prev + 1);
    webViewRef.current?.reload();
  };

  const handleLayerSwitch = (layer: 'hybrid' | 'relief') => {
    hapticLight();
    setActiveTileLayer(layer);
    webViewRef.current?.injectJavaScript(`
      if (typeof switchTileLayer === 'function') {
        switchTileLayer('${layer}');
      }
      true;
    `);
  };

  const handleRecenter = () => {
    if (!selectedPlace) return;
    hapticLight();
    webViewRef.current?.injectJavaScript(`
      if (typeof focusOnPlaceById === 'function') {
        focusOnPlaceById(${selectedPlace.id});
      }
      true;
    `);
  };

  if (isOffline || loadError) {
    return (
      <View style={[styles.container, { height }]}>
        <MapOfflineFallback
          theme={theme}
          onRetry={handleRetry}
          onViewPlacesList={onViewPlacesList}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* 1. Leaflet WebView Container */}
      <View style={styles.webContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          onMessage={handleMessage}
          onLoadEnd={() => setIsMapReady(true)}
          onError={() => setIsOffline(true)}
          onHttpError={() => setIsOffline(true)}
        />

        {!isMapReady && (
          <View
            style={[
              styles.loadingCover,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Cargando cartografía bíblica...
            </Text>
          </View>
        )}

        {/* 2. Top-Right Map Controls (Layer Picker & Recenter) */}
        {showFullControls && (
          <View style={styles.topControlsWrap}>
            <View
              style={[
                styles.layerPillGroup,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? 'rgba(15, 23, 42, 0.92)'
                      : 'rgba(255, 255, 255, 0.92)',
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.layerBtn,
                  activeTileLayer === 'hybrid' && {
                    backgroundColor: theme.accent,
                  },
                ]}
                onPress={() => handleLayerSwitch('hybrid')}
              >
                <Text
                  style={[
                    styles.layerBtnText,
                    {
                      color:
                        activeTileLayer === 'hybrid'
                          ? '#FFFFFF'
                          : theme.textMuted,
                    },
                  ]}
                >
                  Satélite
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.layerBtn,
                  activeTileLayer === 'relief' && {
                    backgroundColor: theme.accent,
                  },
                ]}
                onPress={() => handleLayerSwitch('relief')}
              >
                <Text
                  style={[
                    styles.layerBtnText,
                    {
                      color:
                        activeTileLayer === 'relief'
                          ? '#FFFFFF'
                          : theme.textMuted,
                    },
                  ]}
                >
                  Relieve
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor:
                    themeMode === 'oled'
                      ? 'rgba(15, 23, 42, 0.92)'
                      : 'rgba(255, 255, 255, 0.92)',
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={handleRecenter}
            >
              <Compass size={18} color={theme.accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 3. Leyenda Encima Flotante (HUD Interactive Card) */}
      {selectedPlace && legendVisible && (
        <View
          style={[
            styles.legendCard,
            {
              backgroundColor:
                themeMode === 'oled'
                  ? 'rgba(17, 24, 39, 0.96)'
                  : 'rgba(255, 255, 255, 0.96)',
              borderColor: theme.borderSubtle,
              shadowColor: '#000',
              bottom: Math.max(insets.bottom, 12) + 10,
            },
          ]}
        >
          {/* Header row: Badge, Ancient Size & Close */}
          <View style={styles.legendHeaderRow}>
            <View style={styles.legendHeaderLeft}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: theme.accentMuted },
                ]}
              >
                <Text style={styles.categoryPillIcon}>
                  {selectedGeoMeta?.icon || '📍'}
                </Text>
                <Text style={[styles.categoryPillText, { color: theme.accent }]}>
                  {selectedPlace.category.toUpperCase()}
                </Text>
              </View>

              <Text style={[styles.sizeNoticeText, { color: theme.textMuted }]}>
                {selectedGeoMeta?.historicalSizeText
                  ? `· ${selectedGeoMeta.radiusMeters} m radio`
                  : ''}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setLegendVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Place Title & Hebrew */}
          <View style={styles.placeTitleRow}>
            <Text style={[styles.placeMainName, { color: theme.text }]}>
              {selectedPlace.name_es}
            </Text>
            {selectedPlace.hebrew_greek_name && (
              <Text style={[styles.hebrewPill, { color: theme.accent }]}>
                {selectedPlace.hebrew_greek_name}
              </Text>
            )}
          </View>

          {/* Size & Archaeological Description */}
          {selectedGeoMeta?.historicalSizeText ? (
            <Text style={[styles.historicalSizeLabel, { color: theme.accent }]}>
              📐 {selectedGeoMeta.historicalSizeText}
            </Text>
          ) : null}

          {/* Modern Location & GPS coordinates */}
          <View style={styles.modernCoordsRow}>
            <MapPin size={13} color={theme.textMuted} />
            <Text style={[styles.modernLocationText, { color: theme.textMuted }]}>
              {selectedPlace.modern_location} · ({selectedPlace.latitude.toFixed(3)}°, {selectedPlace.longitude.toFixed(3)}°)
            </Text>
          </View>

          {/* Associated Biblical People (Clickable Chips) */}
          {selectedGeoMeta?.associatedPeople &&
            selectedGeoMeta.associatedPeople.length > 0 && (
              <View style={styles.peopleSectionWrap}>
                <Text style={[styles.peopleSectionTitle, { color: theme.textMuted }]}>
                  ESTUVIERON AQUÍ:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.peopleScrollContent}
                >
                  {selectedGeoMeta.associatedPeople.map((person, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.personChip,
                        {
                          backgroundColor: theme.surfaceRaised,
                          borderColor: theme.borderSubtle,
                        },
                      ]}
                      onPress={() => {
                        if (person.personId && onNavigateToCharacter) {
                          hapticLight();
                          onNavigateToCharacter(person.personId);
                        }
                      }}
                      activeOpacity={person.personId ? 0.75 : 1}
                    >
                      <User size={12} color={theme.accent} />
                      <Text
                        style={[
                          styles.personChipText,
                          {
                            color: person.personId
                              ? theme.text
                              : theme.textMuted,
                          },
                        ]}
                      >
                        {person.name}
                      </Text>
                      {person.personId ? (
                        <ChevronRight size={10} color={theme.accent} />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

          {/* Spiritual Meaning Snippet */}
          <Text
            style={[styles.spiritualSnippetText, { color: theme.text }]}
            numberOfLines={2}
          >
            «{selectedPlace.spiritual_meaning}»
          </Text>

          {/* Action Row */}
          <View style={styles.legendActionRow}>
            {selectedGeoMeta?.keyVerse && onNavigateToReader && (
              <TouchableOpacity
                style={[
                  styles.legendBtnPrimary,
                  { backgroundColor: theme.accent },
                ]}
                onPress={() => {
                  hapticLight();
                  onNavigateToReader(
                    selectedGeoMeta.keyVerse.bookId,
                    selectedGeoMeta.keyVerse.chapter,
                    selectedGeoMeta.keyVerse.verse
                  );
                }}
              >
                <BookOpen size={14} color="#FFFFFF" />
                <Text style={styles.legendBtnPrimaryText}>
                  Leer {selectedGeoMeta.keyVerse.citation}
                </Text>
              </TouchableOpacity>
            )}

            {onViewPlaceDetails && (
              <TouchableOpacity
                style={[
                  styles.legendBtnSecondary,
                  {
                    backgroundColor: theme.surfaceRaised,
                    borderColor: theme.borderSubtle,
                  },
                ]}
                onPress={() => {
                  hapticLight();
                  onViewPlaceDetails(selectedPlace.id);
                }}
              >
                <Text
                  style={[styles.legendBtnSecondaryText, { color: theme.text }]}
                >
                  Ver Ficha Completa
                </Text>
                <ChevronRight size={14} color={theme.accent} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Floating Reopen Button if legend is hidden */}
      {selectedPlace && !legendVisible && (
        <TouchableOpacity
          style={[
            styles.reopenLegendBtn,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
              bottom: Math.max(insets.bottom, 16) + 10,
            },
          ]}
          onPress={() => {
            hapticLight();
            setLegendVisible(true);
          }}
        >
          <Sparkles size={16} color={theme.accent} />
          <Text style={[styles.reopenLegendText, { color: theme.text }]}>
            Ver Leyenda: {selectedPlace.name_es}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  webContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingCover: {
    ...StyleSheet.absoluteFill as any,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  topControlsWrap: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
    pointerEvents: 'box-none',
  },
  layerPillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  layerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  layerBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  legendCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 30,
  },
  legendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  legendHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillIcon: {
    fontSize: 11,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sizeNoticeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  placeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  placeMainName: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  hebrewPill: {
    fontSize: 13,
    fontWeight: '700',
  },
  historicalSizeLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 15,
  },
  modernCoordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  modernLocationText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  peopleSectionWrap: {
    marginBottom: 8,
  },
  peopleSectionTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  peopleScrollContent: {
    gap: 6,
    paddingRight: 10,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  personChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  spiritualSnippetText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: 10,
  },
  legendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  legendBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  legendBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  legendBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reopenLegendBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 25,
  },
  reopenLegendText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
