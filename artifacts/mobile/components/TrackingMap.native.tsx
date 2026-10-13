import React, { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { TripStop } from '@/data/mockData';

const WebViewComponent = WebView as any;

interface LatLng { latitude: number; longitude: number }

interface Props {
  origin: LatLng;
  destination: LatLng;
  truckPosition: LatLng;
  progress: number; // 0–1
  stops?: TripStop[];
  truckStatus?: 'moving' | 'stopped';
  truckSpeed?: number;
}

export default function TrackingMap({
  origin,
  destination,
  truckPosition,
  progress,
  stops = [],
  truckStatus = 'moving',
  truckSpeed = 74,
}: Props) {
  const webViewRef = useRef<any>(null);

  const htmlContent = useMemo(() => {
    const stopsJson = JSON.stringify(stops);
    const isStopped = truckStatus === 'stopped';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, html, #map { width: 100%; height: 100%; overflow: hidden; background: #0E1420; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .leaflet-control-attribution { display: none !important; }
          
          /* Filtre sombre pour OpenStreetMap */
          .leaflet-tile {
            filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) !important;
          }

          .origin-marker {
            width: 18px;
            height: 18px;
            background: #10B981;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.9);
          }
          .dest-marker {
            width: 22px;
            height: 22px;
            background: #FF5C00;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(255, 92, 0, 0.9);
          }

          /* Marqueur Camion Mobile */
          .truck-marker {
            width: 46px;
            height: 46px;
            background: ${isStopped ? '#EF4444' : '#FF5C00'};
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 18px ${isStopped ? 'rgba(239, 68, 68, 0.95)' : 'rgba(255, 92, 0, 0.95)'};
            font-size: 20px;
            position: relative;
          }
          .truck-pulse {
            position: absolute;
            width: 66px;
            height: 66px;
            border-radius: 50%;
            background: ${isStopped ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 92, 0, 0.4)'};
            animation: pulse 1.6s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }

          /* Marqueur Arrêt Chauffeur */
          .stop-badge {
            background: rgba(22, 27, 38, 0.95);
            border: 1.5px solid #F59E0B;
            border-radius: 16px;
            padding: 4px 9px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 3px 12px rgba(245, 158, 11, 0.5);
            white-space: nowrap;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
          }
          .stop-badge-active {
            border-color: #EF4444;
            background: rgba(30, 20, 20, 0.95);
            box-shadow: 0 3px 14px rgba(239, 68, 68, 0.7);
          }
          .stop-icon { font-size: 12px; }
          .stop-duration { color: #F59E0B; font-weight: 800; }
          .stop-duration-active { color: #EF4444; }

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
              const orig = [${origin.latitude}, ${origin.longitude}];
              const dest = [${destination.latitude}, ${destination.longitude}];
              const trk = [${truckPosition.latitude}, ${truckPosition.longitude}];
              const stops = ${stopsJson};

              const map = L.map('map', {
                center: [(orig[0] + dest[0]) / 2, (orig[1] + dest[1]) / 2],
                zoom: 8,
                zoomControl: false,
                attributionControl: false
              });

              // Tuiles OpenStreetMap officielles 100% gratuites sans clé API
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
              }).addTo(map);

              setTimeout(function() { map.invalidateSize(); }, 150);
              setTimeout(function() { map.invalidateSize(); }, 500);

              // Tracé complet
              L.polyline([orig, trk, dest], {
                color: '#FF5C00',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 6'
              }).addTo(map);

              // Tracé déjà parcouru
              L.polyline([orig, trk], {
                color: '#10B981',
                weight: 5,
                opacity: 1
              }).addTo(map);

              // Marqueur Origine
              const originIcon = L.divIcon({ html: '<div class="origin-marker"></div>', className: '', iconSize: [18, 18], iconAnchor: [9, 9] });
              L.marker(orig, { icon: originIcon }).addTo(map);

              // Marqueur Destination
              const destIcon = L.divIcon({ html: '<div class="dest-marker"></div>', className: '', iconSize: [22, 22], iconAnchor: [11, 11] });
              L.marker(dest, { icon: destIcon }).addTo(map);

              // Marqueurs des Arrêts du chauffeur
              if (stops && stops.length > 0) {
                stops.forEach(function(s) {
                  var activeClass = s.isCurrentStop ? ' stop-badge-active' : '';
                  var durClass = s.isCurrentStop ? ' stop-duration-active' : '';
                  var icon = s.reason === 'toll' ? '🛑' : (s.reason === 'fuel' ? '⛽' : '⏱️');
                  
                  var stopHtml = '<div class="stop-badge' + activeClass + '">' +
                    '<span class="stop-icon">' + icon + '</span>' +
                    '<span>' + (s.reasonLabel || s.locationName) + '</span>' +
                    '<span class="stop-duration' + durClass + '">(' + s.durationMinutes + ' min)</span>' +
                  '</div>';

                  var stopIcon = L.divIcon({
                    html: stopHtml,
                    className: 'fretconnect-div-icon',
                    iconSize: [180, 28],
                    iconAnchor: [90, 14]
                  });

                  L.marker([s.latitude, s.longitude], { icon: stopIcon }).addTo(map);
                });
              }

              // Marqueur Camion
              const truckIcon = L.divIcon({
                html: '<div class="truck-marker"><div class="truck-pulse"></div>🚚</div>',
                className: '',
                iconSize: [46, 46],
                iconAnchor: [23, 23]
              });
              L.marker(trk, { icon: truckIcon }).addTo(map);

              map.fitBounds([orig, dest, trk], { padding: [60, 60], maxZoom: 12 });
            } catch (err) {
              console.error("Tracking map error:", err);
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
  }, [origin, destination, truckPosition, stops, truckStatus, truckSpeed]);

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
