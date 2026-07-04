/**
 * Native tracking map — animated truck marker on MapView.
 * Only bundled on iOS/Android.
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LatLng { latitude: number; longitude: number }

interface Props {
  origin: LatLng;
  destination: LatLng;
  truckPosition: LatLng;
  progress: number; // 0–1
}

// Interpolate between two points by t
function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

// Build a simple curved route with intermediate waypoints
function buildRoute(origin: LatLng, dest: LatLng, steps = 20): LatLng[] {
  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // slight horizontal arc
    const arc = Math.sin(Math.PI * t) * 0.3;
    const midLon = origin.longitude + (dest.longitude - origin.longitude) * t + arc;
    const midLat = origin.latitude + (dest.latitude - origin.latitude) * t;
    points.push({ latitude: midLat, longitude: midLon });
  }
  return points;
}

export default function TrackingMap({ origin, destination, truckPosition, progress }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const routePoints = buildRoute(origin, destination);
  const completedPoints = routePoints.slice(0, Math.ceil(progress * routePoints.length));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Center map between truck and midpoint
  const midLat = (origin.latitude + destination.latitude) / 2;
  const midLon = (origin.longitude + destination.longitude) / 2;
  const latDelta = Math.abs(destination.latitude - origin.latitude) * 1.5 + 0.5;
  const lonDelta = Math.abs(destination.longitude - origin.longitude) * 1.5 + 0.5;

  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_DEFAULT}
      region={{ latitude: midLat, longitude: midLon, latitudeDelta: latDelta, longitudeDelta: lonDelta }}
    >
      {/* Completed route (orange) */}
      <Polyline coordinates={completedPoints} strokeColor="#FF5C00" strokeWidth={4} />
      {/* Remaining route (grey) */}
      <Polyline coordinates={routePoints.slice(Math.ceil(progress * routePoints.length))} strokeColor="#C0C0C0" strokeWidth={3} lineDashPattern={[6, 4]} />

      {/* Origin marker */}
      <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.originDot} />
      </Marker>

      {/* Destination marker */}
      <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }}>
        <View style={styles.destPin}>
          <View style={styles.destPinInner} />
        </View>
      </Marker>

      {/* Animated truck marker */}
      <Marker coordinate={truckPosition} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges>
        <View style={styles.truckWrapper}>
          <Animated.View style={[styles.truckPulse, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.truckBubble}>
            <MaterialCommunityIcons name="truck-fast" size={18} color="#FFF" />
          </View>
        </View>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  originDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#10B981', borderWidth: 2.5, borderColor: '#FFF',
  },
  destPin: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#FF5C00', borderWidth: 3, borderColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
  },
  destPinInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  truckWrapper: { alignItems: 'center', justifyContent: 'center', width: 52, height: 52 },
  truckPulse: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255, 92, 0, 0.25)',
  },
  truckBubble: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FF5C00',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF5C00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8,
  },
});
