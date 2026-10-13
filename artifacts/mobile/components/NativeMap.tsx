import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

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

export default function NativeMap({ initialRegion, markers = [], onSelectMarker }: NativeMapProps) {
  const containerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const lat = initialRegion?.latitude ?? 5.3484;
  const lon = initialRegion?.longitude ?? -4.0186;

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
        }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) !important;
        }
        .fretconnect-div-icon {
          background: transparent !important;
          border: none !important;
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
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }

      try {
        const map = L.map(domNode, {
          center: [lat, lon],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        // Tuiles OpenStreetMap officielles 100% gratuites sans clé API
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
        setMapLoaded(true);

        const resizeMap = () => {
          if (map) map.invalidateSize();
        };

        setTimeout(resizeMap, 100);
        setTimeout(resizeMap, 300);
        setTimeout(resizeMap, 800);
        window.addEventListener('resize', resizeMap);
      } catch (err) {
        console.warn('Leaflet init error:', err);
      }
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  // Mettre à jour les marqueurs
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (markers.length > 0) {
      const group: [number, number][] = [];

      markers.forEach((m) => {
        let html = '';
        if (m.type === 'truck') {
          html = `
            <div style="background:#10B981;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #FFF;box-shadow:0 0 12px rgba(16,185,129,0.9);font-size:16px;cursor:pointer;">
              🚚
            </div>
          `;
        } else {
          html = `
            <div style="background:rgba(22,27,38,0.95);border:2px solid #FF5C00;border-radius:20px;padding:4px 10px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(255,92,0,0.5);white-space:nowrap;cursor:pointer;">
              <span style="font-size:13px;">📦</span>
              <span style="color:#FFF;font-size:11px;font-weight:700;">${m.cargo || m.title}</span>
              ${m.price ? `<span style="color:#FF5C00;font-size:11px;font-weight:800;">${m.price}</span>` : ''}
            </div>
          `;
        }

        const icon = L.divIcon({
          html,
          className: 'fretconnect-div-icon',
          iconSize: [120, 32],
          iconAnchor: [60, 16],
        });

        const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(markersLayerRef.current);

        marker.on('click', () => {
          onSelectMarker?.(m);
        });

        group.push([m.latitude, m.longitude]);
      });

      if (group.length > 1 && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.fitBounds(group, { padding: [60, 60], maxZoom: 13 });
        } catch (e) {}
      }
    }
  }, [markers, mapLoaded, onSelectMarker]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#0E1420',
            zIndex: 0,
          }}
        />
      </View>
    );
  }

  return <View style={styles.container} />;
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
    overflow: 'hidden',
  },
});
