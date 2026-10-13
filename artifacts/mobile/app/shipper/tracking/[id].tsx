import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, Animated, ScrollView, Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_FREIGHTS, MOCK_TRIP_STOPS, TripStop } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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

const TOTAL_DURATION_SECS = 90;

export default function TrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const freight = MOCK_FREIGHTS.find(f => f.id === id) ?? MOCK_FREIGHTS[2]; // default in_transit

  const origin      = cityCoord(freight.origin);
  const destination = cityCoord(freight.destination);

  const [elapsed, setElapsed]   = useState(35); // simulated partial progress
  const [arrived, setArrived]   = useState(false);
  const [truckStatus, setTruckStatus] = useState<'moving' | 'stopped'>('stopped');
  const [speed, setSpeed] = useState(0);
  const panelHeight = useRef(new Animated.Value(280)).current;
  const [expanded, setExpanded] = useState(false);

  // Simulation progression & arrêt
  useEffect(() => {
    if (arrived) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= TOTAL_DURATION_SECS) {
          setArrived(true);
          setTruckStatus('stopped');
          setSpeed(0);
          return TOTAL_DURATION_SECS;
        }

        // Simule un arrêt entre 30s et 45s
        if (next >= 30 && next <= 45) {
          setTruckStatus('stopped');
          setSpeed(0);
        } else {
          setTruckStatus('moving');
          setSpeed(Math.floor(65 + Math.random() * 15));
        }

        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [arrived]);

  const progress     = Math.min(elapsed / TOTAL_DURATION_SECS, 1);
  const truckPos     = lerp(origin, destination, progress);
  const remaining    = Math.max(TOTAL_DURATION_SECS - elapsed, 0);
  const distanceDone = Math.round(progress * (freight.distance ?? 248));
  const distLeft     = Math.max((freight.distance ?? 248) - distanceDone, 0);

  const togglePanel = () => {
    const toValue = expanded ? 280 : 460;
    Animated.spring(panelHeight, { toValue, useNativeDriver: false, damping: 20, stiffness: 200 }).start();
    setExpanded(!expanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const isStopped = truckStatus === 'stopped';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 12) }]}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: 'rgba(14,20,32,0.85)' }]}>
          <Feather name="arrow-left" size={20} color="#FFF" />
        </Pressable>

        {/* Live Status Pill */}
        <View style={[styles.statusPill, { backgroundColor: isStopped ? 'rgba(239,68,68,0.92)' : 'rgba(16,185,129,0.92)' }]}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusPillText}>
            {isStopped ? 'Arrêt détecté (15 min)' : `En route · ${speed} km/h`}
          </Text>
        </View>

        <View style={[styles.etaBadge, { backgroundColor: 'rgba(14,20,32,0.85)' }]}>
          <Feather name="clock" size={13} color={colors.primary} />
          <Text style={[styles.etaText, { color: '#FFF' }]}>
            {arrived ? 'Livré !' : formatETA(remaining)}
          </Text>
        </View>
      </View>

      {/* Map — fills the screen */}
      <View style={StyleSheet.absoluteFill}>
        <TrackingMap
          origin={origin}
          destination={destination}
          truckPosition={truckPos}
          progress={progress}
          stops={MOCK_TRIP_STOPS}
          truckStatus={truckStatus}
          truckSpeed={speed}
        />
      </View>

      {/* Stop Alert Banner on Map when Stopped */}
      {isStopped && !arrived && (
        <View style={[styles.stopAlertBanner, { top: insets.top + 70 }]}>
          <View style={styles.stopAlertIconWrap}>
            <MaterialCommunityIcons name="alert-octagon" size={20} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stopAlertTitle}>Arrêt en cours : Contrôle routier / Pesage</Text>
            <Text style={styles.stopAlertSub}>
              Le chauffeur est stationné à Yamoussoukro Sud depuis 15 min. ETA ajusté.
            </Text>
          </View>
        </View>
      )}

      {/* Bottom panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            height: panelHeight,
            backgroundColor: colors.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingBottom: insets.bottom + (Platform.OS === 'web' ? 24 : 10),
          },
        ]}
      >
        {/* Drag handle */}
        <Pressable onPress={togglePanel} style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
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
              <View
                style={[
                  styles.trackTruck,
                  {
                    left: `${Math.min(progress * 100, 95)}%` as any,
                    backgroundColor: isStopped ? '#EF4444' : colors.primary,
                  },
                ]}
              >
                <MaterialCommunityIcons name={isStopped ? 'truck' : 'truck-fast'} size={10} color="#FFF" />
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

          {/* Driver card with quick actions */}
          <View style={[styles.driverCard, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
            <Avatar name={MOCK_DRIVER.name} size={42} />
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.foreground }]}>{MOCK_DRIVER.name}</Text>
              <Text style={[styles.driverVehicle, { color: colors.mutedForeground }]}>{MOCK_DRIVER.vehicle}</Text>
              <View style={styles.driverRating}>
                <Feather name="star" size={12} color="#FFB800" />
                <Text style={[styles.ratingText, { color: colors.foreground }]}>{MOCK_DRIVER.rating}</Text>
                <Text style={[styles.statusTextSmall, { color: isStopped ? '#EF4444' : '#10B981' }]}>
                  • {isStopped ? 'En arrêt' : 'En route'}
                </Text>
              </View>
            </View>
            <View style={styles.driverActions}>
              <Pressable
                style={[styles.driverBtn, { backgroundColor: colors.success + '20' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Feather name="phone" size={17} color={colors.success} />
              </Pressable>
              <Pressable
                style={[styles.driverBtn, { backgroundColor: colors.primary + '20' }]}
                onPress={() => router.push('/chat/c1')}
              >
                <Feather name="message-circle" size={17} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* Escrow Status & Delivery Confirmation Code Card */}
          <View style={[styles.codeBox, { backgroundColor: colors.card, borderColor: arrived ? '#10B981' : colors.primary + '35', borderRadius: colors.radius }]}>
            {/* Escrow Status Badge */}
            <View style={[styles.escrowStatusHeader, { backgroundColor: arrived ? '#10B98118' : colors.primary + '15' }]}>
              <MaterialCommunityIcons
                name={arrived ? 'lock-open-check' : 'shield-lock'}
                size={16}
                color={arrived ? '#10B981' : colors.primary}
              />
              <Text style={[styles.escrowStatusText, { color: arrived ? '#10B981' : colors.primary }]}>
                {arrived ? 'ESCROW DÉBLOQUÉ · PAIEMENT VIRÉ AU CHAUFFEUR' : 'ESCROW ACTIF · PAIEMENT CONSIGNÉ & SÉCURISÉ'}
              </Text>
            </View>

            {!arrived ? (
              <>
                <View style={styles.codeHeader}>
                  <Feather name="key" size={15} color={colors.primary} />
                  <Text style={[styles.codeTitle, { color: colors.foreground }]}>Code secret de livraison</Text>
                </View>

                <View style={styles.codeRow}>
                  <Text style={[styles.codeValue, { color: colors.primary }]}>
                    {freight.deliveryCode ?? '482 937'}
                  </Text>
                  <Pressable
                    style={[styles.shareCodeBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Alert.alert(
                        'Transmettre le code',
                        `Code de livraison : ${freight.deliveryCode ?? '482 937'}\n\nTransmettez ce code à votre destinataire. Il ne doit le donner au chauffeur qu'après déchargement complet.`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Feather name="share-2" size={13} color="#FFF" />
                    <Text style={styles.shareCodeText}>Envoyer au destinataire</Text>
                  </Pressable>
                </View>

                <View style={[styles.securityNotice, { backgroundColor: colors.muted }]}>
                  <Feather name="shield" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.codeHelp, { color: colors.mutedForeground }]}>
                    <Text style={{ fontWeight: '700', color: colors.foreground }}>Confidentiel : </Text>
                    Le destinataire transmettra ce code au chauffeur sur place uniquement après vérification et déchargement.
                  </Text>
                </View>
              </>
            ) : (
              /* Preuves de Livraison Transmises (POD) */
              <View style={styles.podSection}>
                <View style={styles.podHeader}>
                  <Feather name="check-circle" size={16} color="#10B981" />
                  <Text style={[styles.podTitle, { color: colors.foreground }]}>
                    Preuves de livraison certifiées reçues
                  </Text>
                </View>
                <Text style={[styles.podSub, { color: colors.mutedForeground }]}>
                  Le chauffeur et le destinataire ont validé la remise avec succès (Code secret validé + Photos de déchargement en direct).
                </Text>

                {/* Galerie de photos de déchargement */}
                <View style={styles.podPhotosRow}>
                  <View style={[styles.podPhotoWrap, { backgroundColor: colors.muted }]}>
                    <Feather name="camera" size={24} color={colors.primary} />
                    <Text style={[styles.podPhotoLabel, { color: colors.foreground }]}>Photo déchargement 1</Text>
                    <Text style={[styles.podPhotoTime, { color: colors.mutedForeground }]}>Remise conforme · Caméra</Text>
                  </View>
                  <View style={[styles.podPhotoWrap, { backgroundColor: colors.muted }]}>
                    <MaterialCommunityIcons name="image-check" size={24} color="#10B981" />
                    <Text style={[styles.podPhotoLabel, { color: colors.foreground }]}>Photo déchargement 2</Text>
                    <Text style={[styles.podPhotoTime, { color: colors.mutedForeground }]}>Colis inspectés sur place</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Stoppages Timeline / Journal des arrêts */}
          <View style={[styles.stopsSection, { borderTopColor: colors.border }]}>
            <View style={styles.stopsSectionHeader}>
              <MaterialCommunityIcons name="map-marker-path" size={18} color={colors.primary} />
              <Text style={[styles.stopsSectionTitle, { color: colors.foreground }]}>
                Journal des arrêts en cours de route ({MOCK_TRIP_STOPS.length})
              </Text>
            </View>

            {MOCK_TRIP_STOPS.map((stop, idx) => (
              <View key={stop.id} style={styles.stopTimelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: stop.isCurrentStop ? '#EF4444' : '#10B981',
                        borderColor: colors.card,
                      },
                    ]}
                  />
                  {idx < MOCK_TRIP_STOPS.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                  )}
                </View>

                <View style={[styles.timelineContent, { backgroundColor: colors.muted, borderRadius: 8 }]}>
                  <View style={styles.timelineHeaderRow}>
                    <Text style={[styles.stopName, { color: colors.foreground }]} numberOfLines={1}>
                      {stop.locationName}
                    </Text>
                    <View style={[styles.stopDurationBadge, { backgroundColor: stop.isCurrentStop ? '#EF444420' : '#F59E0B20' }]}>
                      <Text style={[styles.stopDurationText, { color: stop.isCurrentStop ? '#EF4444' : '#F59E0B' }]}>
                        {stop.durationMinutes} min
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timelineMetaRow}>
                    <Text style={[styles.stopReason, { color: colors.mutedForeground }]}>
                      {stop.reasonLabel}
                    </Text>
                    <Text style={[styles.stopTime, { color: colors.mutedForeground }]}>
                      Début : {stop.startTime}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Arrived overlay */}
      {arrived && (
        <View style={[styles.arrivedOverlay, { backgroundColor: '#10B981' }]}>
          <MaterialCommunityIcons name="shield-check" size={28} color="#FFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.arrivedText}>Livraison validée & Escrow libéré !</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              Le transporteur Moussa Touré a été payé automatiquement.
            </Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.arrivedBack}>Fermer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  pulseDot: {
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFF',
  },
  statusPillText: {
    fontSize: 12, fontFamily: 'Inter_700Bold', color: '#FFF',
  },
  etaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  etaText: {
    fontSize: 12, fontFamily: 'Inter_600SemiBold',
  },
  stopAlertBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: 'rgba(26, 18, 18, 0.95)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  stopAlertIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopAlertTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
  },
  stopAlertSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 18, paddingTop: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 12,
  },
  handle: { alignItems: 'center', paddingVertical: 8 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  progressSection: { marginBottom: 12, gap: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressCity: { fontSize: 13, fontFamily: 'Inter_600SemiBold', maxWidth: '40%' },
  progressPct: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'visible', position: 'relative' },
  progressFill: { height: 8, borderRadius: 4 },
  trackTruck: {
    position: 'absolute', top: -8, width: 24, height: 24,
    borderRadius: 12, marginLeft: -12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statSmall: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  driverCard: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10, marginBottom: 12 },
  driverInfo: { flex: 1, gap: 2 },
  driverName: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  driverVehicle: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  driverRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  statusTextSmall: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  driverActions: { flexDirection: 'row', gap: 8 },
  driverBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  codeBox: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 4,
  },
  escrowStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  escrowStatusText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  codeValue: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 4,
  },
  shareCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareCodeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  codeHelp: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
    flex: 1,
  },
  podSection: {
    gap: 8,
  },
  podHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  podTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  podSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
  podPhotosRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  podPhotoWrap: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  podPhotoLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  podPhotoTime: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  stopsSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
    marginBottom: 20,
  },
  stopsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  stopsSectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  stopTimelineItem: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    padding: 10,
    gap: 4,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopName: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  stopDurationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stopDurationText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  timelineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stopReason: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  stopTime: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  arrivedOverlay: {
    position: 'absolute', bottom: 80, left: 20, right: 20, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10,
  },
  arrivedText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#FFF', flex: 1 },
  arrivedBack: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.85)' },
});
