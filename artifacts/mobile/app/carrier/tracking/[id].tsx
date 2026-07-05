import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform,
  Animated, Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_MISSIONS } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import TrackingMap from '@/components/TrackingMap';
import * as Haptics from 'expo-haptics';

// ─── Types & helpers ─────────────────────────────────────────────────────────

interface LatLng { latitude: number; longitude: number }

const CITY_COORDS: Record<string, LatLng> = {
  'Abidjan':       { latitude: 5.3484,  longitude: -4.0186 },
  'Bouaké':        { latitude: 7.6944,  longitude: -5.0388 },
  'Yamoussoukro':  { latitude: 6.8206,  longitude: -5.2893 },
  'Daloa':         { latitude: 6.8773,  longitude: -6.4502 },
  'San-Pédro':     { latitude: 4.7485,  longitude: -6.6363 },
  'San Pedro':     { latitude: 4.7485,  longitude: -6.6363 },
  'Korhogo':       { latitude: 9.4580,  longitude: -5.6296 },
  'Man':           { latitude: 7.4124,  longitude: -7.5536 },
};

function cityCoord(label: string): LatLng {
  const key = Object.keys(CITY_COORDS).find(k => label.includes(k));
  return key ? CITY_COORDS[key] : { latitude: 5.3484, longitude: -4.0186 };
}

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude:  a.latitude  + (b.latitude  - a.latitude)  * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

function formatETA(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
  if (m > 0) return `${m}min ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

// ─── Mission steps ────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3; // en_route_pickup | chargement | en_livraison | livre

const STEPS = [
  { icon: 'navigation',    label: 'En route vers le point de chargement' },
  { icon: 'package',       label: 'Chargement de la marchandise'         },
  { icon: 'truck',         label: 'En livraison'                         },
  { icon: 'check-circle',  label: 'Livraison confirmée'                  },
] as const;

const STEP_CTA: Record<Step, string | null> = {
  0: 'Je suis arrivé au chargement',
  1: 'Chargement terminé — Partir',
  2: 'Confirmer la livraison',
  3: null,
};

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepRow({ step, current, colors }: { step: number; current: Step; colors: any }) {
  const done   = step < current;
  const active = step === current;
  const color  = done || active ? colors.primary : colors.border;
  return (
    <View style={ss.stepRow}>
      <View style={[ss.stepDot, { backgroundColor: done ? colors.primary : active ? colors.primary + '20' : colors.muted, borderColor: color, borderWidth: active ? 2 : 0 }]}>
        {done
          ? <Feather name="check" size={11} color="#FFF" />
          : <View style={[ss.stepDotInner, { backgroundColor: active ? colors.primary : colors.border }]} />
        }
      </View>
      <Text style={[ss.stepLabel, { color: active ? colors.foreground : done ? colors.mutedForeground : colors.mutedForeground, fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
        {STEPS[step].label}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const TOTAL_SECS = 60; // each sub-phase simulated in 60s

export default function CarrierTrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = MOCK_MISSIONS.find(m => m.id === id) ?? MOCK_MISSIONS[4];

  const origin      = cityCoord(mission.origin);
  const destination = cityCoord(mission.destination);

  // Step state
  const [step, setStep]       = useState<Step>(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const panelH = useRef(new Animated.Value(280)).current;
  const [expanded, setExpanded] = useState(false);
  const speedAnim = useRef(new Animated.Value(0)).current;

  // Speed pulse while driving
  useEffect(() => {
    if (step === 0 || step === 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(speedAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(speedAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      speedAnim.setValue(1);
    }
  }, [step]);

  // Timer for GPS progression during driving steps
  useEffect(() => {
    if (!running || step === 1 || step === 3) return;
    const iv = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= TOTAL_SECS) { setRunning(false); return TOTAL_SECS; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [running, step]);

  const progress   = Math.min(elapsed / TOTAL_SECS, 1);
  const truckPos   = step === 0
    ? lerp({ latitude: origin.latitude - 0.05, longitude: origin.longitude - 0.05 }, origin, progress)
    : lerp(origin, destination, step === 2 ? progress : step > 2 ? 1 : 0);

  const distTotal  = mission.distance ?? 250;
  const distDone   = step === 2 ? Math.round(progress * distTotal) : step > 2 ? distTotal : 0;
  const distLeft   = Math.max(distTotal - distDone, 0);
  const remaining  = Math.max(TOTAL_SECS - elapsed, 0);

  // Mock speed km/h (only shown while driving)
  const mockSpeed  = step === 0 || step === 2 ? Math.round(55 + progress * 25) : 0;

  const togglePanel = () => {
    const toValue = expanded ? 280 : 440;
    Animated.spring(panelH, { toValue, useNativeDriver: false, damping: 20, stiffness: 180 }).start();
    setExpanded(!expanded);
  };

  const handleCTA = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (step === 0) {
      // Arrived at pickup
      setStep(1); setElapsed(0); setRunning(false);
    } else if (step === 1) {
      // Loading done → start driving
      setStep(2); setElapsed(0); setRunning(true);
    } else if (step === 2) {
      // Confirm delivery
      setStep(3); setRunning(false);
    }
  };

  const handleSOS = () => {
    Alert.alert('SOS', 'Contacter le support d\'urgence FretConnect ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Appeler', style: 'destructive', onPress: () => {} },
    ]);
  };

  const delivered = step === 3;

  return (
    <View style={ss.container}>
      {/* Map fills screen */}
      <View style={StyleSheet.absoluteFillObject}>
        <TrackingMap
          origin={origin}
          destination={destination}
          truckPosition={truckPos}
          progress={step === 2 ? progress : step > 2 ? 1 : 0}
        />
      </View>

      {/* Top bar */}
      <View style={[ss.topBar, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 14) }]}>
        <Pressable
          onPress={() => router.back()}
          style={[ss.iconBtn, { backgroundColor: 'rgba(14,20,32,0.75)' }]}
        >
          <Feather name="arrow-left" size={20} color="#FFF" />
        </Pressable>

        {/* ETA / Speed badge */}
        <View style={[ss.etaBadge, { backgroundColor: delivered ? colors.success : colors.primary }]}>
          <MaterialCommunityIcons name="truck-fast" size={14} color="#FFF" />
          <Text style={ss.etaText}>
            {delivered
              ? 'Mission terminée !'
              : step === 1
              ? 'Chargement en cours'
              : step === 0
              ? `Arrivée au chargement ${formatETA(remaining)}`
              : `Arrivée dans ${formatETA(remaining)}`
            }
          </Text>
        </View>

        {/* SOS */}
        <Pressable
          onPress={handleSOS}
          style={[ss.iconBtn, { backgroundColor: 'rgba(220,38,38,0.85)' }]}
        >
          <Text style={ss.sosText}>SOS</Text>
        </Pressable>
      </View>

      {/* Speed bubble (only while driving) */}
      {(step === 0 || step === 2) && (
        <Animated.View style={[ss.speedBubble, {
          backgroundColor: colors.dark,
          opacity: speedAnim,
          top: insets.top + (Platform.OS === 'web' ? 120 : 80),
        }]}>
          <Text style={ss.speedValue}>{mockSpeed}</Text>
          <Text style={ss.speedUnit}>km/h</Text>
        </Animated.View>
      )}

      {/* Bottom panel */}
      <Animated.View style={[ss.panel, {
        height: panelH,
        backgroundColor: colors.card,
        paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16),
      }]}>
        {/* Handle */}
        <Pressable onPress={togglePanel} style={ss.handle}>
          <View style={[ss.handleBar, { backgroundColor: colors.border }]} />
        </Pressable>

        {/* Step list */}
        <View style={ss.stepsContainer}>
          {STEPS.map((_, i) => (
            <StepRow key={i} step={i} current={step} colors={colors} />
          ))}
        </View>

        {/* Progress bar — shown only while driving */}
        {(step === 0 || step === 2) && (
          <View style={ss.progressSection}>
            <View style={[ss.progressTrack, { backgroundColor: colors.muted }]}>
              <View style={[ss.progressFill, { backgroundColor: colors.primary, width: `${Math.round(progress * 100)}%` as any }]} />
              <View style={[ss.progressTruck, { left: `${Math.min(progress * 100, 93)}%` as any, backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="truck-fast" size={10} color="#FFF" />
              </View>
            </View>
            <View style={ss.progressMeta}>
              <Text style={[ss.metaText, { color: colors.mutedForeground }]}>{distDone} km parcourus</Text>
              <Text style={[ss.metaText, { color: colors.primary }]}>{Math.round(progress * 100)}%</Text>
              <Text style={[ss.metaText, { color: colors.mutedForeground }]}>{distLeft} km restants</Text>
            </View>
          </View>
        )}

        {/* Expanded: mission info + shipper contact */}
        {expanded && (
          <View style={[ss.expandedSection, { borderTopColor: colors.border }]}>
            <View style={ss.shipperRow}>
              <Avatar name={mission.ownerName} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={[ss.shipperName, { color: colors.foreground }]}>{mission.ownerName}</Text>
                <Text style={[ss.shipperLabel, { color: colors.mutedForeground }]}>
                  {mission.origin} → {mission.destination}
                </Text>
              </View>
              <Pressable style={[ss.contactBtn, { backgroundColor: colors.success + '15' }]}>
                <Feather name="phone" size={18} color={colors.success} />
              </Pressable>
              <Pressable
                style={[ss.contactBtn, { backgroundColor: colors.primary + '15' }]}
                onPress={() => router.push('/chat/c1')}
              >
                <Feather name="message-circle" size={18} color={colors.primary} />
              </Pressable>
            </View>
            {[
              { icon: 'package', label: 'Marchandise', value: mission.cargo },
              { icon: 'layers',  label: 'Poids',       value: `${mission.weight.toLocaleString()} kg` },
              { icon: 'credit-card', label: 'Rémunération', value: `${(mission.myOfferAmount ?? mission.budget).toLocaleString('fr-FR')} FCFA` },
            ].map(r => (
              <View key={r.label} style={ss.detailRow}>
                <Feather name={r.icon as any} size={14} color={colors.primary} />
                <Text style={[ss.detailLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[ss.detailValue, { color: colors.foreground }]}>{r.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        {STEP_CTA[step] && (
          <Pressable
            style={[ss.cta, { backgroundColor: step === 2 ? colors.success : colors.primary, borderRadius: colors.radius }]}
            onPress={handleCTA}
          >
            <Feather
              name={step === 0 ? 'map-pin' : step === 1 ? 'truck' : 'check-circle'}
              size={20} color="#FFF"
            />
            <Text style={ss.ctaText}>{STEP_CTA[step]}</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Delivered overlay */}
      {delivered && (
        <View style={[ss.deliveredOverlay, { backgroundColor: colors.success }]}>
          <Feather name="check-circle" size={32} color="#FFF" />
          <View style={{ flex: 1 }}>
            <Text style={ss.deliveredTitle}>Livraison confirmée !</Text>
            <Text style={ss.deliveredSub}>
              {(mission.myOfferAmount ?? mission.budget).toLocaleString('fr-FR')} FCFA vont être versés sur votre wallet
            </Text>
          </View>
          <Pressable onPress={() => router.replace('/(tabs)/freight')}>
            <Feather name="x" size={20} color="#FFF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  container:   { flex: 1 },
  topBar:      {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  iconBtn:     { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  etaBadge:    {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22,
    maxWidth: '60%',
  },
  etaText:     { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  sosText:     { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#FFF' },
  speedBubble: {
    position: 'absolute', right: 16,
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center', zIndex: 9,
  },
  speedValue:  { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFF', lineHeight: 26 },
  speedUnit:   { fontSize: 10, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)' },

  panel:       {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14, shadowRadius: 16, elevation: 24,
  },
  handle:      { alignItems: 'center', paddingVertical: 8 },
  handleBar:   { width: 36, height: 4, borderRadius: 2 },

  stepsContainer: { gap: 12, marginBottom: 14 },
  stepRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot:     { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepDotInner:{ width: 8, height: 8, borderRadius: 4 },
  stepLabel:   { fontSize: 13, flex: 1 },

  progressSection: { marginBottom: 14, gap: 8 },
  progressTrack:   { height: 8, borderRadius: 4, position: 'relative', overflow: 'visible' },
  progressFill:    { height: 8, borderRadius: 4 },
  progressTruck:   {
    position: 'absolute', top: -9, width: 26, height: 26, borderRadius: 13,
    marginLeft: -13, alignItems: 'center', justifyContent: 'center',
  },
  progressMeta:    { flexDirection: 'row', justifyContent: 'space-between' },
  metaText:        { fontSize: 11, fontFamily: 'Inter_400Regular' },

  expandedSection: { borderTopWidth: 1, paddingTop: 14, gap: 12, marginBottom: 12 },
  shipperRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  shipperName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  shipperLabel:{ fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  contactBtn:  { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  detailRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', width: 100, color: '#888' },
  detailValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1 },

  cta:         {
    height: 54, marginTop: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaText:     { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFF' },

  deliveredOverlay: {
    position: 'absolute', bottom: 120, left: 16, right: 16,
    borderRadius: 18, flexDirection: 'row', alignItems: 'center',
    padding: 18, gap: 14,
  },
  deliveredTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#FFF' },
  deliveredSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
