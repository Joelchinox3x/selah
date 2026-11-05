import { BiblicalPlace } from '@/src/types/bible';
import { PLACE_GEO_METADATA } from '../data/placeGeoData';

export interface MapHtmlOptions {
  places: BiblicalPlace[];
  focusedPlaceId?: number | null;
  selectedPlaceId?: number | null;
  centerCoords: { lat: number; lng: number };
  activeTileLayer: 'hybrid' | 'relief';
  themeMode: string;
}

export function generateBiblicalMapHtml(options: MapHtmlOptions): string {
  const {
    places,
    focusedPlaceId,
    selectedPlaceId,
    centerCoords,
    activeTileLayer,
    themeMode,
  } = options;

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
}
