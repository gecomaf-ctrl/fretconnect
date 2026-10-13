import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TripStop } from '@/data/mockData';

interface LatLng { latitude: number; longitude: number }
interface Props {
  origin: LatLng;
  destination: LatLng;
  truckPosition: LatLng;
  progress: number;
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
  const containerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const styleId = 'fretconnect-map-custom-style';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          background: #0E1420 !important;
          outline: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) !important;
        }
        .stop-badge-web {
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
        .stop-badge-web-active {
          border-color: #EF4444;
          background: rgba(30, 20, 20, 0.95);
          box-shadow: 0 3px 14px rgba(239, 68, 68, 0.7);
        }
      `;
      document.head.appendChild(styleEl);
    }

    const scriptId = 'leaflet-js';
    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).L) {
          resolve();
          return;
        }
        if (document.getElementById(scriptId)) {
          const timer = setInterval(() => {
            if ((window as any).L) {
              clearInterval(timer);
              resolve();
            }
          }, 50);
          return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    let isCancelled = false;

    loadLeaflet().then(() => {
      if (isCancelled || !containerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      const domNode = containerRef.current;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }

      try {
        const orig: [number, number] = [origin.latitude, origin.longitude];
        const dest: [number, number] = [destination.latitude, destination.longitude];
        const trk: [number, number] = [truckPosition.latitude, truckPosition.longitude];
        const isStopped = truckStatus === 'stopped';

        const map = L.map(domNode, {
          center: [(orig[0] + dest[0]) / 2, (orig[1] + dest[1]) / 2],
          zoom: 8,
          zoomControl: false,
          attributionControl: false,
        });

        // Tuiles OpenStreetMap officielles 100% gratuites sans clé API
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        // Ligne de route orange
        L.polyline([orig, trk, dest], {
          color: '#FF5C00',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 6',
        }).addTo(map);

        // Ligne déjà parcourue verte
        L.polyline([orig, trk], {
          color: '#10B981',
          weight: 5,
          opacity: 1,
        }).addTo(map);

        // Marqueur Origine
        const originIcon = L.divIcon({
          html: '<div style="width:18px;height:18px;background:#10B981;border:3px solid #FFF;border-radius:50%;box-shadow:0 0 10px rgba(16,185,129,0.9);"></div>',
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker(orig, { icon: originIcon }).addTo(map);

        // Marqueur Destination
        const destIcon = L.divIcon({
          html: '<div style="width:22px;height:22px;background:#FF5C00;border:3px solid #FFF;border-radius:50%;box-shadow:0 0 12px rgba(255,92,0,0.9);"></div>',
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker(dest, { icon: destIcon }).addTo(map);

        // Marqueurs d'Arrêts
        if (stops && stops.length > 0) {
          stops.forEach((s) => {
            const activeClass = s.isCurrentStop ? ' stop-badge-web-active' : '';
            const icon = s.reason === 'toll' ? '🛑' : (s.reason === 'fuel' ? '⛽' : '⏱️');
            const color = s.isCurrentStop ? '#EF4444' : '#F59E0B';
            
            const stopHtml = `<div class="stop-badge-web${activeClass}">
              <span>${icon}</span>
              <span>${s.reasonLabel || s.locationName}</span>
              <span style="color:${color};font-weight:800;">(${s.durationMinutes} min)</span>
            </div>`;

            const stopIcon = L.divIcon({
              html: stopHtml,
              className: '',
              iconSize: [180, 28],
              iconAnchor: [90, 14],
            });
            L.marker([s.latitude, s.longitude], { icon: stopIcon }).addTo(map);
          });
        }

        // Marqueur Camion
        const truckBg = isStopped ? '#EF4444' : '#FF5C00';
        const truckShadow = isStopped ? 'rgba(239,68,68,0.95)' : 'rgba(255,92,0,0.95)';
        const truckIcon = L.divIcon({
          html: `<div style="width:44px;height:44px;background:${truckBg};border:2.5px solid #FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${truckShadow};font-size:20px;">🚚</div>`,
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
        L.marker(trk, { icon: truckIcon }).addTo(map);

        map.fitBounds([orig, dest, trk], { padding: [70, 70], maxZoom: 12 });

        mapInstanceRef.current = map;

        const resize = () => { if (map) map.invalidateSize(); };
        setTimeout(resize, 100);
        setTimeout(resize, 400);
        window.addEventListener('resize', resize);
      } catch (e) {
        console.warn('TrackingMap web init error:', e);
      }
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, truckPosition, stops, truckStatus, truckSpeed]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </View>
    );
  }

  return null;
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
});
