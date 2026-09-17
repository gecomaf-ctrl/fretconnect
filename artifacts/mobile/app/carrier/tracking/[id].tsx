import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform,
  Animated, Alert, ScrollView, TextInput,
  KeyboardAvoidingView, Image,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_MISSIONS } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import TrackingMap from '@/components/TrackingMap';
import { SignaturePad } from '@/components/SignaturePad';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types & helpers ──────────────────────────────────────────────────────────

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

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { icon: 'navigation',    label: 'En route vers le chargement' },
  { icon: 'package',       label: 'Chargement de la marchandise' },
  { icon: 'truck',         label: 'En livraison'                 },
  { icon: 'check-circle',  label: 'Livraison confirmée'          },
] as const;

const STEP_CTA: Record<Step, string | null> = {
  0: 'Je suis arrivé au chargement',
  1: 'Chargement terminé — Partir',
  2: 'Confirmer la livraison',
  3: null,
};

function StepRow({ step, current, colors }: { step: number; current: Step; colors: any }) {
  const done   = step < current;
  const active = step === current;
  const color  = done || active ? colors.primary : colors.border;
  return (
    <View style={ss.stepRow}>
      <View style={[ss.stepDot, {
        backgroundColor: done ? colors.primary : active ? colors.primary + '20' : colors.muted,
        borderColor: color, borderWidth: active ? 2 : 0,
      }]}>
        {done
          ? <Feather name="check" size={11} color="#FFF" />
          : <View style={[ss.stepDotInner, { backgroundColor: active ? colors.primary : colors.border }]} />
        }
      </View>
      <Text style={[ss.stepLabel, {
        color: active ? colors.foreground : colors.mutedForeground,
        fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
      }]}>
        {STEPS[step].label}
      </Text>
    </View>
  );
}

// ─── Delivery confirmation modal ──────────────────────────────────────────────

interface DeliveryModalProps {
  visible: boolean;
  expectedCode: string;
  earnAmount: number;
  missionLabel: string;
  colors: any;
  insets: any;
  onSuccess: () => void;
  onClose: () => void;
}

function DeliveryModal({
  visible, expectedCode, earnAmount, missionLabel,
  colors, insets, onSuccess, onClose,
}: DeliveryModalProps) {
  const [code, setCode]           = useState('');
  const [signed, setSigned]       = useState(false);
  const [photoUri, setPhotoUri]   = useState<string | null>(null);
  const [codeError, setCodeError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const COMMISSION_RATE = 0.05;
  const commission   = Math.round(earnAmount * COMMISSION_RATE);
  const net          = earnAmount - commission;

  const canSubmit = code.length === 6 && signed && photoUri !== null;

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // On web permissions always granted
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    }).catch(() =>
      // Camera not available on web — fall back to gallery
      ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.7 })
    );
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (code !== expectedCode) {
      setCodeError('Code incorrect. Vérifiez avec le destinataire.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setCodeError('');
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900)); // simulate API call
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(false);
    onSuccess();
  };

  if (!visible) return null;

  return (
    <View style={[ss.modalOverlay]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            ss.modalContent,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={ss.modalHeader}>
            <Pressable onPress={onClose} style={[ss.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
            <View style={[ss.modalIconWrap, { backgroundColor: colors.success + '15' }]}>
              <Feather name="package" size={28} color={colors.success} />
            </View>
            <Text style={[ss.modalTitle, { color: colors.foreground }]}>
              Confirmation de livraison
            </Text>
            <Text style={[ss.modalSubtitle, { color: colors.mutedForeground }]}>
              {missionLabel}
            </Text>
          </View>

          {/* Code hint for testing */}
          <View style={[ss.hintBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[ss.hintText, { color: colors.primary }]}>
              L'expéditeur a communiqué ce code au destinataire : <Text style={{ fontFamily: 'Inter_700Bold' }}>{expectedCode}</Text>
            </Text>
          </View>

          {/* ── 1. Code de livraison ── */}
          <View style={[ss.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={ss.sectionHeader}>
              <View style={[ss.sectionNum, { backgroundColor: colors.primary }]}>
                <Text style={ss.sectionNumText}>1</Text>
              </View>
              <Text style={[ss.sectionTitle, { color: colors.foreground }]}>Code de livraison</Text>
            </View>
            <Text style={[ss.sectionDesc, { color: colors.mutedForeground }]}>
              Demandez au destinataire de saisir le code à 6 chiffres que l'expéditeur lui a transmis.
            </Text>
            <View style={[ss.codeInputRow]}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={[ss.codeBox, {
                  backgroundColor: colors.input,
                  borderColor: codeError
                    ? '#EF4444'
                    : code.length > i ? colors.primary : colors.border,
                }]}>
                  <Text style={[ss.codeDigit, { color: colors.foreground }]}>
                    {code[i] ?? ''}
                  </Text>
                </View>
              ))}
            </View>
            {/* Hidden TextInput drives the boxes */}
            <TextInput
              style={ss.hiddenInput}
              value={code}
              onChangeText={v => { setCode(v.replace(/\D/g, '').slice(0, 6)); setCodeError(''); }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            {codeError !== '' && (
              <View style={ss.errorRow}>
                <Feather name="alert-circle" size={13} color="#EF4444" />
                <Text style={ss.errorText}>{codeError}</Text>
              </View>
            )}
          </View>

          {/* ── 2. Signature ── */}
          <View style={[ss.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={ss.sectionHeader}>
              <View style={[ss.sectionNum, { backgroundColor: signed ? colors.success : colors.primary }]}>
                {signed
                  ? <Feather name="check" size={12} color="#FFF" />
                  : <Text style={ss.sectionNumText}>2</Text>
                }
              </View>
              <Text style={[ss.sectionTitle, { color: colors.foreground }]}>Signature du destinataire</Text>
            </View>
            <Text style={[ss.sectionDesc, { color: colors.mutedForeground }]}>
              Faites signer le destinataire directement sur l'écran.
            </Text>
            <SignaturePad
              onSigned={setSigned}
              borderColor={signed ? colors.success + '60' : colors.border}
              labelColor={colors.mutedForeground}
              clearColor={colors.mutedForeground}
              height={150}
            />
          </View>

          {/* ── 3. Photo ── */}
          <View style={[ss.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={ss.sectionHeader}>
              <View style={[ss.sectionNum, { backgroundColor: photoUri ? colors.success : colors.primary }]}>
                {photoUri
                  ? <Feather name="check" size={12} color="#FFF" />
                  : <Text style={ss.sectionNumText}>3</Text>
                }
              </View>
              <Text style={[ss.sectionTitle, { color: colors.foreground }]}>Photo de remise</Text>
            </View>
            <Text style={[ss.sectionDesc, { color: colors.mutedForeground }]}>
              Prenez une photo de la marchandise avec le destinataire.
            </Text>

            {photoUri ? (
              <View>
                <Image source={{ uri: photoUri }} style={ss.photoPreview} resizeMode="cover" />
                <Pressable style={ss.retakeBtn} onPress={pickPhoto}>
                  <Feather name="camera" size={13} color={colors.mutedForeground} />
                  <Text style={[ss.retakeText, { color: colors.mutedForeground }]}>Reprendre la photo</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[ss.photoBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={pickPhoto}
              >
                <Feather name="camera" size={22} color={colors.primary} />
                <Text style={[ss.photoBtnText, { color: colors.foreground }]}>Prendre une photo</Text>
                <Text style={[ss.photoBtnSub, { color: colors.mutedForeground }]}>
                  Appareil photo ou galerie
                </Text>
              </Pressable>
            )}
          </View>

          {/* ── Payment summary ── */}
          <View style={[ss.paymentCard, { backgroundColor: colors.success + '08', borderColor: colors.success + '25' }]}>
            <Text style={[ss.paymentTitle, { color: colors.foreground }]}>Récapitulatif de paiement</Text>
            <View style={ss.paymentRow}>
              <Text style={[ss.paymentLabel, { color: colors.mutedForeground }]}>Montant mission</Text>
              <Text style={[ss.paymentValue, { color: colors.foreground }]}>{earnAmount.toLocaleString('fr-FR')} FCFA</Text>
            </View>
            <View style={ss.paymentRow}>
              <Text style={[ss.paymentLabel, { color: colors.mutedForeground }]}>Commission FretConnect (5%)</Text>
              <Text style={[ss.paymentValue, { color: '#EF4444' }]}>- {commission.toLocaleString('fr-FR')} FCFA</Text>
            </View>
            <View style={[ss.paymentDivider, { backgroundColor: colors.success + '30' }]} />
            <View style={ss.paymentRow}>
              <Text style={[ss.paymentLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Net versé sur votre wallet</Text>
              <Text style={[ss.paymentNet, { color: colors.success }]}>{net.toLocaleString('fr-FR')} FCFA</Text>
            </View>
          </View>

          {/* Submit */}
          <Pressable
            style={[ss.submitBtn, {
              backgroundColor: canSubmit ? colors.success : colors.muted,
              borderRadius: colors.radius,
              opacity: submitting ? 0.75 : 1,
            }]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <Text style={[ss.submitText, { color: '#FFF' }]}>Traitement en cours…</Text>
            ) : (
              <>
                <Feather name="check-circle" size={20} color={canSubmit ? '#FFF' : colors.mutedForeground} />
                <Text style={[ss.submitText, { color: canSubmit ? '#FFF' : colors.mutedForeground }]}>
                  Valider la livraison et recevoir le paiement
                </Text>
              </>
            )}
          </Pressable>

          {!canSubmit && (
            <Text style={[ss.incompleteHint, { color: colors.mutedForeground }]}>
              {!code || code.length < 6
                ? '⟳  Entrez le code à 6 chiffres'
                : !signed
                ? '✍  Faites signer le destinataire'
                : '📷  Prenez la photo de remise'}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const TOTAL_SECS = 60;

export default function CarrierTrackingScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  const mission = MOCK_MISSIONS.find(m => m.id === id) ?? MOCK_MISSIONS[4];

  const origin      = cityCoord(mission.origin);
  const destination = cityCoord(mission.destination);

  const [step, setStep]         = useState<Step>(0);
  const [elapsed, setElapsed]   = useState(0);
  const [running, setRunning]   = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [credited, setCredited]   = useState(false);

  const panelH    = useRef(new Animated.Value(280)).current;
  const speedAnim = useRef(new Animated.Value(0)).current;

  // Speed pulse
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

  // GPS timer
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
  const mockSpeed  = step === 0 || step === 2 ? Math.round(55 + progress * 25) : 0;

  const togglePanel = () => {
    const toValue = expanded ? 280 : 440;
    Animated.spring(panelH, { toValue, useNativeDriver: false, damping: 20, stiffness: 180 }).start();
    setExpanded(!expanded);
  };

  const handleCTA = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (step === 0) {
      setStep(1); setElapsed(0); setRunning(false);
    } else if (step === 1) {
      setStep(2); setElapsed(0); setRunning(true);
    } else if (step === 2) {
      // Open delivery confirmation modal
      setShowModal(true);
    }
  };

  const handleDeliverySuccess = () => {
    // Credit the carrier wallet
    if (user?.carrier) {
      const earn  = mission.myOfferAmount ?? mission.budget;
      const net   = earn - Math.round(earn * 0.05);
      const today = new Date().toLocaleDateString('fr-FR');
      const newTx = {
        id: `ct_${Date.now()}`,
        type: 'credit' as const,
        amount: net,
        description: `Mission ${mission.origin.split(',')[0]} → ${mission.destination.split(',')[0]}`,
        date: today,
        status: 'completed' as const,
      };
      const commTx = {
        id: `cm_${Date.now()}`,
        type: 'commission' as const,
        amount: -Math.round(earn * 0.05),
        description: 'Commission FretConnect (5%)',
        date: today,
        status: 'completed' as const,
      };
      updateUser({
        carrier: {
          ...user.carrier,
          missionCount: user.carrier.missionCount + 1,
          wallet: {
            balance: user.carrier.wallet.balance + net,
            transactions: [newTx, commTx, ...user.carrier.wallet.transactions],
          },
        },
      });
    }
    setCredited(true);
    setShowModal(false);
    setStep(3);
    setRunning(false);
  };

  const handleSOS = () => {
    Alert.alert('SOS', "Contacter le support d'urgence FretConnect ?", [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Appeler', style: 'destructive', onPress: () => {} },
    ]);
  };

  const delivered  = step === 3;
  const earnAmount = mission.myOfferAmount ?? mission.budget;

  return (
    <View style={ss.container}>
      {/* Map */}
      <View style={StyleSheet.absoluteFill}>
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

        <Pressable
          onPress={handleSOS}
          style={[ss.iconBtn, { backgroundColor: 'rgba(220,38,38,0.85)' }]}
        >
          <Text style={ss.sosText}>SOS</Text>
        </Pressable>
      </View>

      {/* Speed bubble */}
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
        <Pressable onPress={togglePanel} style={ss.handle}>
          <View style={[ss.handleBar, { backgroundColor: colors.border }]} />
        </Pressable>

        <View style={ss.stepsContainer}>
          {STEPS.map((_, i) => (
            <StepRow key={i} step={i} current={step} colors={colors} />
          ))}
        </View>

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
              { icon: 'package',     label: 'Marchandise',  value: mission.cargo },
              { icon: 'layers',      label: 'Poids',        value: `${mission.weight.toLocaleString()} kg` },
              { icon: 'credit-card', label: 'Rémunération', value: `${earnAmount.toLocaleString('fr-FR')} FCFA` },
              { icon: 'key',         label: 'Code livraison', value: mission.deliveryCode ?? '—' },
            ].map(r => (
              <View key={r.label} style={ss.detailRow}>
                <Feather name={r.icon as any} size={14} color={colors.primary} />
                <Text style={[ss.detailLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[ss.detailValue, { color: colors.foreground }]}>{r.value}</Text>
              </View>
            ))}
          </View>
        )}

        {STEP_CTA[step] && (
          <Pressable
            style={[ss.cta, {
              backgroundColor: step === 2 ? colors.success : colors.primary,
              borderRadius: colors.radius,
            }]}
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

      {/* Delivery confirmation modal */}
      <DeliveryModal
        visible={showModal}
        expectedCode={mission.deliveryCode ?? '000000'}
        earnAmount={earnAmount}
        missionLabel={`${mission.origin} → ${mission.destination}`}
        colors={colors}
        insets={insets}
        onSuccess={handleDeliverySuccess}
        onClose={() => setShowModal(false)}
      />

      {/* Success overlay (after modal) */}
      {delivered && (
        <View style={[ss.deliveredOverlay, { backgroundColor: colors.success }]}>
          <Feather name="check-circle" size={32} color="#FFF" />
          <View style={{ flex: 1 }}>
            <Text style={ss.deliveredTitle}>Livraison confirmée !</Text>
            <Text style={ss.deliveredSub}>
              {(earnAmount - Math.round(earnAmount * 0.05)).toLocaleString('fr-FR')} FCFA crédités sur votre wallet chauffeur
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
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, maxWidth: '60%',
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
  detailLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', width: 110 },
  detailValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1 },

  cta:         {
    height: 54, marginTop: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaText:     { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFF' },

  deliveredOverlay: {
    position: 'absolute', bottom: 120, left: 16, right: 16,
    borderRadius: 18, flexDirection: 'row', alignItems: 'center',
    padding: 18, gap: 14, zIndex: 20,
  },
  deliveredTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#FFF' },
  deliveredSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // ── Modal ──
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F8FAFC',
    zIndex: 50,
  },
  modalContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  modalHeader: {
    alignItems: 'center', gap: 8, marginBottom: 4,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20, fontFamily: 'Inter_700Bold', textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center',
  },

  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  hintText: {
    fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18,
  },

  section: {
    borderWidth: 1, borderRadius: 16, padding: 16, gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  sectionNum: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionNumText: {
    fontSize: 12, fontFamily: 'Inter_700Bold', color: '#FFF',
  },
  sectionTitle: {
    fontSize: 15, fontFamily: 'Inter_600SemiBold',
  },
  sectionDesc: {
    fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18,
  },

  codeInputRow: {
    flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 4,
  },
  codeBox: {
    width: 44, height: 52, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  codeDigit: {
    fontSize: 22, fontFamily: 'Inter_700Bold',
  },
  hiddenInput: {
    position: 'absolute', opacity: 0, width: 1, height: 1,
  },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  errorText: {
    fontSize: 12, fontFamily: 'Inter_400Regular', color: '#EF4444',
  },

  photoBtn: {
    height: 110, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  photoBtnText: {
    fontSize: 14, fontFamily: 'Inter_600SemiBold',
  },
  photoBtnSub: {
    fontSize: 11, fontFamily: 'Inter_400Regular',
  },
  photoPreview: {
    width: '100%', height: 160, borderRadius: 12,
  },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-end', marginTop: 6,
  },
  retakeText: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
  },

  paymentCard: {
    borderRadius: 14, borderWidth: 1, padding: 16, gap: 10,
  },
  paymentTitle: {
    fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 4,
  },
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1,
  },
  paymentValue: {
    fontSize: 13, fontFamily: 'Inter_600SemiBold',
  },
  paymentDivider: {
    height: 1,
  },
  paymentNet: {
    fontSize: 16, fontFamily: 'Inter_700Bold',
  },

  submitBtn: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
  },
  submitText: {
    fontSize: 15, fontFamily: 'Inter_600SemiBold', textAlign: 'center',
  },
  incompleteHint: {
    fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: -8,
  },
});
