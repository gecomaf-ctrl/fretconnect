import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, Animated,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_FREIGHTS } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import TrackingMap from '@/components/TrackingMap';

interface LatLng { latitude: number; longitude: number }

// Côte d'Ivoire city coordinates (approx)
const CITY_COORDS: Record<string, LatLng> = {
  default_origin:      { latitude: 5.3484,  longitude: -4.0186 },
  default_destination: { latitude: 7.6944,  longitude: -5.0388 },
  'Abidjan':           { latitude: 5.3484,  longitude: -4.0186 },
  'Bouaké':            { latitude: 7.6944,  longitude: -5.0388 },
  'Yamoussoukro':      { latitude: 6.8206,  longitude: -5.2893 },
  'Daloa':             { latitude: 6.8773,  longitude: -6.4502 },
  'San-Pédro':         { latitude: 4.7485,  longitude: -6.6363 },
  'Korhogo':           { latitude: 9.4580,  longitude: -5.6296 },
  'Man':               { latitude: 7.4124,  longitude: -7.5536 },
};

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude:  a.latitude  + (b.latitude  - a.latitude)  * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

function cityCoord(label: string): LatLng {
  const key = Object.keys(CITY_COORDS).find(k => label.includes(k));
  return key ? CITY_COORDS[key] : CITY_COORDS.default_origin;
}

function formatETA(secondsRemaining: number) {
  const h = Math.floor(secondsRemaining / 3600);
  const m = Math.floor((secondsRemaining % 3600) / 60);
  const s = secondsRemaining % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

const MOCK_DRIVER = {
  name: 'Moussa Touré',
  rating: 4.8,
  phone: '+225 07 55 12 34',
  vehicle: 'Camion 5T · AB 1234 CI',
};

const TOTAL_DURATION_SECS = 60; // simulate full trip in 60s for demo

export default function TrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const freight = MOCK_FREIGHTS.find(f => f.id === id) ?? MOCK_FREIGHTS[2]; // default in_transit

  const origin      = cityCoord(freight.origin);
  const destination = cityCoord(freight.destination);

  const [elapsed, setElapsed]   = useState(0);
  const [arrived, setArrived]   = useState(false);
  const panelHeight = useRef(new Animated.Value(220)).current;
  const [expanded, setExpanded] = useState(false);

  // Simulate progression
  useEffect(() => {
    if (arrived) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= TOTAL_DURATION_SECS) { setArrived(true); return TOTAL_DURATION_SECS; }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [arrived]);

  const progress     = Math.min(elapsed / TOTAL_DURATION_SECS, 1);
  const truckPos     = lerp(origin, destination, progress);
  const remaining    = Math.max(TOTAL_DURATION_SECS - elapsed, 0);
  const distanceDone = Math.round(progress * (freight.distance ?? 350));
  const distLeft     = (freight.distance ?? 350) - distanceDone;

  const togglePanel = () => {
    const toValue = expanded ? 220 : 360;
    Animated.spring(panelHeight, { toValue, useNativeDriver: false, damping: 20, stiffness: 200 }).start();
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 14) }]}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: 'rgba(14,20,32,0.7)' }]}>
          <Feather name="arrow-left" size={20} color="#FFF" />
        </Pressable>
        <View style={[styles.etaBadge, { backgroundColor: arrived ? colors.success : colors.primary }]}>
          <MaterialCommunityIcons name="truck-fast" size={14} color="#FFF" />
          <Text style={styles.etaText}>
            {arrived ? 'Livré !' : `Arrivée dans ${formatETA(remaining)}`}
          </Text>
        </View>
        <Pressable style={[styles.iconBtn, { backgroundColor: 'rgba(14,20,32,0.7)' }]}>
          <Feather name="maximize-2" size={20} color="#FFF" />
        </Pressable>
      </View>

      {/* Map — fills the screen */}
      <View style={StyleSheet.absoluteFill}>
        <TrackingMap
          origin={origin}
          destination={destination}
          truckPosition={truckPos}
          progress={progress}
        />
      </View>

      {/* Bottom panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            height: panelHeight,
            backgroundColor: colors.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 10),
          },
        ]}
      >
        {/* Drag handle */}
        <Pressable onPress={togglePanel} style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </Pressable>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressCity, { color: colors.foreground }]} numberOfLines={1}>
              {freight.origin}
            </Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>
              {Math.round(progress * 100)}%
            </Text>
            <Text style={[styles.progressCity, { color: colors.foreground }]} numberOfLines={1}>
              {freight.destination}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` as any }]} />
            {/* Truck icon on track */}
            <View
              style={[
                styles.trackTruck,
                {
                  left: `${Math.min(progress * 100, 95)}%` as any,
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <MaterialCommunityIcons name="truck-fast" size={10} color="#FFF" />
            </View>
          </View>
          <View style={styles.progressStats}>
            <Text style={[styles.statSmall, { color: colors.mutedForeground }]}>
              {distanceDone} km parcourus
            </Text>
            <Text style={[styles.statSmall, { color: colors.mutedForeground }]}>
              {distLeft} km restants
            </Text>
          </View>
        </View>

        {/* Driver card */}
        <View style={[styles.driverCard, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Avatar name={MOCK_DRIVER.name} size={44} />
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.foreground }]}>{MOCK_DRIVER.name}</Text>
            <Text style={[styles.driverVehicle, { color: colors.mutedForeground }]}>{MOCK_DRIVER.vehicle}</Text>
            <View style={styles.driverRating}>
              <Feather name="star" size={12} color="#FFB800" />
              <Text style={[styles.ratingText, { color: colors.foreground }]}>{MOCK_DRIVER.rating}</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <Pressable
              style={[styles.driverBtn, { backgroundColor: colors.success + '15' }]}
              onPress={() => {}}
            >
              <Feather name="phone" size={18} color={colors.success} />
            </Pressable>
            <Pressable
              style={[styles.driverBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => router.push('/chat/c1')}
            >
              <Feather name="message-circle" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Expanded section — freight details */}
        {expanded && (
          <View style={[styles.expandedDetails, { borderTopColor: colors.border }]}>
            {[
              { icon: 'package', label: 'Marchandise', value: freight.cargo },
              { icon: 'layers', label: 'Poids', value: `${freight.weight?.toLocaleString() ?? '—'} kg` },
              { icon: 'clock', label: 'Départ', value: freight.date },
            ].map(item => (
              <View key={item.label} style={styles.detailRow}>
                <Feather name={item.icon as any} size={14} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Arrived overlay */}
      {arrived && (
        <View style={[styles.arrivedOverlay, { backgroundColor: colors.success }]}>
          <Feather name="check-circle" size={28} color="#FFF" />
          <Text style={styles.arrivedText}>Livraison confirmée !</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.arrivedBack}>Retour</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  headerOverlay:   {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  etaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  etaText:         { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  panel:           { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 10 },
  handle:          { alignItems: 'center', paddingVertical: 8 },
  handleBar:       { width: 36, height: 4, borderRadius: 2 },
  progressSection: { marginBottom: 14, gap: 8 },
  progressLabels:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressCity:    { fontSize: 12, fontFamily: 'Inter_500Medium', maxWidth: '38%' },
  progressPct:     { fontSize: 14, fontFamily: 'Inter_700Bold' },
  progressTrack:   { height: 8, borderRadius: 4, overflow: 'visible', position: 'relative' },
  progressFill:    { height: 8, borderRadius: 4 },
  trackTruck: {
    position: 'absolute', top: -8, width: 24, height: 24,
    borderRadius: 12, marginLeft: -12,
    alignItems: 'center', justifyContent: 'center',
  },
  progressStats:   { flexDirection: 'row', justifyContent: 'space-between' },
  statSmall:       { fontSize: 11, fontFamily: 'Inter_400Regular' },
  driverCard:      { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  driverInfo:      { flex: 1, gap: 2 },
  driverName:      { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  driverVehicle:   { fontSize: 11, fontFamily: 'Inter_400Regular' },
  driverRating:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText:      { fontSize: 12, fontFamily: 'Inter_500Medium' },
  driverActions:   { flexDirection: 'row', gap: 8 },
  driverBtn:       { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  expandedDetails: { borderTopWidth: 1, marginTop: 14, paddingTop: 14, gap: 12 },
  detailRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel:     { fontSize: 13, fontFamily: 'Inter_400Regular', width: 90 },
  detailValue:     { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1 },
  arrivedOverlay:  {
    position: 'absolute', bottom: 80, left: 20, right: 20, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10,
  },
  arrivedText:     { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFF', flex: 1 },
  arrivedBack:     { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.8)' },
});
