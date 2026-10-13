import React, { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewComponent = WebView as any;

export interface MapMarkerItem {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  price?: string;
  cargo?: string;
  type?: 'freight' | 'truck' | 'origin' | 'destination';
}

const ABIDJAN = {
  latitude: 5.3484,
  longitude: -4.0186,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

interface NativeMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  markers?: MapMarkerItem[];
  onSelectMarker?: (marker: MapMarkerItem) => void;
}

export default function NativeMap({ initialRegion = ABIDJAN, markers = [], onSelectMarker }: NativeMapProps) {
  const webViewRef = useRef<any>(null);
  const lat = initialRegion.latitude;
  const lon = initialRegion.longitude;

  const htmlContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          body, html, #map { width: 100%; height: 100%; overflow: hidden; background: #0E1420; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .leaflet-control-attribution { display: none !important; }
          
          /* Filtre sombre pour tuiles OpenStreetMap 100% gratuites sans clé API */
          .leaflet-tile {
            filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) !important;
          }

          /* Badges de Fret */
          .freight-badge {
            background: rgba(22, 27, 38, 0.95);
            border: 2px solid #FF5C00;
            border-radius: 20px;
            padding: 5px 11px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 14px rgba(255, 92, 0, 0.6);
            white-space: nowrap;
            cursor: pointer;
            transform: translateZ(0);
          }
          .badge-icon { font-size: 13px; }
          .badge-text { color: #FFFFFF; font-size: 11px; font-weight: 700; }
          .badge-price { color: #FF5C00; font-size: 11px; font-weight: 800; }

          /* Badges Camion */
          .truck-badge {
            background: #10B981;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);
            cursor: pointer;
            font-size: 18px;
            transform: translateZ(0);
          }

          .fretconnect-div-icon {
            background: transparent !important;
            border: none !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          function init() {
            if (typeof L === 'undefined') {
              setTimeout(init, 50);
              return;
            }

            try {
              const map = L.map('map', {
                center: [${lat}, ${lon}],
                zoom: 12,
                zoomControl: false,
                attributionControl: false
              });

              // Tuiles OpenStreetMap officielles 100% gratuites sans aucune clé API
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
              }).addTo(map);

              setTimeout(function() { map.invalidateSize(); }, 150);
              setTimeout(function() { map.invalidateSize(); }, 500);

              const items = ${JSON.stringify(markers)};

              if (items && items.length > 0) {
                const group = [];
                items.forEach(function(m) {
                  var html = '';
                  if (m.type === 'truck') {
                    html = '<div class="truck-badge">🚚</div>';
                  } else {
                    html = '<div class="freight-badge"><span class="badge-icon">📦</span><span class="badge-text">' + (m.cargo || m.title) + '</span>' + (m.price ? '<span class="badge-price">' + m.price + '</span>' : '') + '</div>';
                  }

                  var icon = L.divIcon({
                    html: html,
                    className: 'fretconnect-div-icon',
                    iconSize: [120, 34],
                    iconAnchor: [60, 17]
                  });

                  var marker = L.marker([m.latitude, m.longitude], { icon: icon }).addTo(map);
                  
                  marker.on('click', function() {
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_CLICK', id: m.id }));
                    }
                  });

                  group.push([m.latitude, m.longitude]);
                });

                if (group.length > 1) {
                  map.fitBounds(group, { padding: [50, 50], maxZoom: 13 });
                }
              }
            } catch (err) {
              console.error("Mobile map error:", err);
            }
          }

          if (document.readyState === 'complete') {
            init();
          } else {
            window.addEventListener('load', init);
          }
        </script>
      </body>
      </html>
    `;
  }, [lat, lon, markers]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_CLICK') {
        const marker = markers.find((m) => m.id === data.id);
        if (marker && onSelectMarker) {
          onSelectMarker(marker);
        }
      }
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <WebViewComponent
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0E1420',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0E1420',
  },
});
