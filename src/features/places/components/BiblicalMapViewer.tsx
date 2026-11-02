import React, { useMemo, useState, useRef } from 'react';
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
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';

interface BiblicalMapViewerProps {
  places: BiblicalPlace[];
  focusedPlaceId?: number | null;
  onSelectPlace?: (place: BiblicalPlace) => void;
  onNavigateToCharacter?: (characterId: number) => void;
  onNavigateToReader?: (bookId: number, chapter: number, verse?: number) => void;
  onViewPlaceDetails?: (placeId: number) => void;
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
  height = '100%',
  showFullControls = true,
}) => {
  const webViewRef = useRef<WebView>(null);
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(
    focusedPlaceId ?? (places.length > 0 ? places[0].id : null)
  );
  const [legendVisible, setLegendVisible] = useState(true);
  const [activeTileLayer, setActiveTileLayer] = useState<'hybrid' | 'relief'>('hybrid');
  const [isMapReady, setIsMapReady] = useState(false);

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

  // Generate HTML payload for Leaflet
  const mapHtml = useMemo(() => {
    const placesJson = JSON.stringify(
      places.map((p) => {
        const meta = PLACE_GEO_METADATA[p.id];
        return {
          id: p.id,
          name_es: p.name_es,
          category: p.category,
          lat: p.latitude,
          lng: p.longitude,
          modern: p.modern_location,
          hebrew: p.hebrew_greek_name || '',
          meaning: p.spiritual_meaning,
          radius: meta?.radiusMeters || 2000,
          color: meta?.color || '#d97706',
          borderColor: meta?.borderColor || '#f59e0b',
          fillColor: meta?.fillColor || '#f59e0b',
          icon: meta?.icon || '📍',
          sizeText: meta?.historicalSizeText || '',
          isFocused: (focusedPlaceId || selectedPlaceId) === p.id,
        };
      })
    );

    const initialZoom = focusedPlaceId ? 13 : 9;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: ${themeMode === 'oled' ? '#090d16' : '#1a1f2c'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .leaflet-control-attribution { display: none !important; }

    /* Custom Place Markers */
    .place-marker-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .place-badge-bubble {
      background: rgba(18, 24, 38, 0.92);
      border: 1.5px solid #d97706;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.2px;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      gap: 4px;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .place-badge-bubble.focused {
      border-color: #38bdf8;
      background: rgba(14, 165, 233, 0.95);
      color: #ffffff;
      transform: scale(1.15);
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.8);
    }
    .marker-pin-dot {
      width: 8px;
      height: 8px;
      background: #d97706;
      border: 1.5px solid #ffffff;
      border-radius: 50%;
      margin-top: 2px;
    }
    .marker-pin-dot.focused {
      background: #38bdf8;
      box-shadow: 0 0 8px #38bdf8;
    }

    /* Popups styling */
    .leaflet-popup-content-wrapper {
      background: rgba(23, 29, 44, 0.96) !important;
      color: #ffffff !important;
      border: 1px solid rgba(217, 119, 6, 0.4) !important;
      border-radius: 16px !important;
      box-shadow: 0 12px 32px rgba(0,0,0,0.7) !important;
      padding: 2px !important;
    }
    .leaflet-popup-tip {
      background: rgba(23, 29, 44, 0.96) !important;
    }
    .leaflet-popup-content {
      margin: 10px 14px !important;
      line-height: 1.4 !important;
    }
    .popup-place-title {
      font-size: 14px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .popup-place-size {
      font-size: 10.5px;
      color: #fbbf24;
      font-weight: 700;
      margin-bottom: 6px;
      letter-spacing: 0.2px;
    }
    .popup-place-desc {
      font-size: 11.5px;
      color: #cbd5e1;
      margin-bottom: 8px;
      line-height: 15px;
    }
    .popup-action-btn {
      display: block;
      width: 100%;
      text-align: center;
      background: rgba(217, 119, 6, 0.2);
      border: 1px solid #d97706;
      color: #fbbf24;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 22, maxNativeZoom: 20 });
    var googleRelief = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', { maxZoom: 20, maxNativeZoom: 18 });

    var baseLayers = {
      'hybrid': googleHybrid,
      'relief': googleRelief
    };

    var map = L.map('map', {
      center: [${Number(centerCoords.lat)}, ${Number(centerCoords.lng)}],
      zoom: ${initialZoom},
      layers: [baseLayers['${activeTileLayer}'] || googleHybrid],
      zoomControl: false
    });

    var placesData = ${placesJson};
    var markersMap = {};
    var circlesMap = {};

    function notifyNative(placeId) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PLACE', id: placeId }));
      }
    }

    placesData.forEach(function(place) {
      var isThisFocused = place.isFocused;

      // 1. Draw Ancient City / Mountain / Water Area Circle
      if (place.radius) {
        var circle = L.circle([place.lat, place.lng], {
          radius: place.radius,
          color: place.borderColor,
          weight: isThisFocused ? 2.5 : 1.5,
          dashArray: '6, 8',
          fillColor: place.fillColor,
          fillOpacity: isThisFocused ? 0.22 : 0.08
        }).addTo(map);

        circle.on('click', function() {
          notifyNative(place.id);
          focusOnPlaceById(place.id);
        });

        circlesMap[place.id] = circle;
      }

      // 2. Custom DivIcon Marker
      var iconHtml = '<div class="place-marker-wrap">' +
        '<div class="place-badge-bubble ' + (isThisFocused ? 'focused' : '') + '">' +
        '<span>' + place.icon + '</span> ' + place.name_es +
        '</div>' +
        '<div class="marker-pin-dot ' + (isThisFocused ? 'focused' : '') + '"></div>' +
        '</div>';

      var markerIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [120, 36],
        iconAnchor: [60, 34]
      });

      var marker = L.marker([place.lat, place.lng], { icon: markerIcon }).addTo(map);

      marker.on('click', function() {
        notifyNative(place.id);
        focusOnPlaceById(place.id);
      });

      markersMap[place.id] = marker;
    });

    window.focusOnPlaceById = function(placeId) {
      var target = placesData.find(function(p) { return p.id === placeId; });
      if (!target) return;

      map.flyTo([target.lat, target.lng], 13.5, {
        animate: true,
        duration: 1.2
      });

      // Update styling
      placesData.forEach(function(p) {
        var isTarget = p.id === placeId;
        if (circlesMap[p.id]) {
          circlesMap[p.id].setStyle({
            weight: isTarget ? 2.5 : 1.5,
            fillOpacity: isTarget ? 0.24 : 0.08
          });
        }
      });
    };

    window.switchTileLayer = function(layerKey) {
      if (!baseLayers[layerKey]) return;
      Object.keys(baseLayers).forEach(function(key) {
        map.removeLayer(baseLayers[key]);
      });
      map.addLayer(baseLayers[layerKey]);
    };
  </script>
</body>
</html>`;
  }, [places, focusedPlaceId, centerCoords, activeTileLayer, themeMode]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PLACE') {
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
