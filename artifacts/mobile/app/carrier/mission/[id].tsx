import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_MISSIONS } from '@/data/mockData';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

function formatCFA(n: number) {
  return Math.abs(n).toLocaleString('fr-FR') + ' FCFA';
}

export default function MissionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = MOCK_MISSIONS.find(m => m.id === id) ?? MOCK_MISSIONS[0];
  const [offerAmount, setOfferAmount] = useState('');
  const [offerSubmitted, setOfferSubmitted] = useState(
    mission?.missionStatus === 'offer_sent',
  );
  const [loading, setLoading] = useState(false);

  const isAccepted    = mission?.missionStatus === 'accepted';
  const isInProgress  = mission?.missionStatus === 'in_progress';
  const isCompleted   = mission?.missionStatus === 'completed';

  if (!mission) return null;

  const handleSubmitOffer = async () => {
    if (!offerAmount) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setOfferSubmitted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Détail de la mission</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
        {/* Route card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.route}>
            <View style={styles.points}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.cities}>
              <Text style={[styles.city, { color: colors.foreground }]}>{mission.origin}</Text>
              <Text style={[styles.city, { color: colors.foreground }]}>{mission.destination}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={[styles.km, { color: colors.mutedForeground }]}>{mission.distance} km</Text>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{mission.date}</Text>
            </View>
          </View>
        </View>

        {/* Cargo details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Marchandise</Text>
          <View style={styles.detailGrid}>
            {[
              { icon: 'package', label: 'Type', value: mission.cargo },
              { icon: 'layers', label: 'Poids', value: `${mission.weight.toLocaleString()} kg` },
              { icon: 'truck', label: 'Véhicule requis', value: mission.vehicleType },
              { icon: 'credit-card', label: 'Budget expéditeur', value: formatCFA(mission.budget) },
            ].map(item => (
              <View key={item.label} style={styles.detailItem}>
                <Feather name={item.icon as any} size={14} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Shipper */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Expéditeur</Text>
          <View style={styles.shipperRow}>
            <Avatar name={mission.ownerName} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.shipperName, { color: colors.foreground }]}>{mission.ownerName}</Text>
              <Text style={[styles.shipperRating, { color: colors.mutedForeground }]}>★ 4.7 · 18 frets publiés</Text>
            </View>
            <Pressable
              style={[styles.msgBtn, { backgroundColor: colors.primary + '12', borderRadius: 20 }]}
              onPress={() => router.push('/chat/c1')}
            >
              <Feather name="message-circle" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Accepted — mission confirmed banner */}
        {isAccepted && (
          <View style={[styles.acceptedCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30', borderRadius: colors.radius }]}>
            <Feather name="check-circle" size={22} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.submittedTitle, { color: colors.foreground }]}>Mission confirmée !</Text>
              <Text style={[styles.submittedSub, { color: colors.mutedForeground }]}>
                Rémunération : {formatCFA(mission.myOfferAmount ?? mission.budget)}
              </Text>
            </View>
          </View>
        )}

        {/* In progress banner */}
        {isInProgress && (
          <View style={[styles.acceptedCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30', borderRadius: colors.radius }]}>
            <MaterialCommunityIcons name="truck-fast" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.submittedTitle, { color: colors.foreground }]}>Mission en cours</Text>
              <Text style={[styles.submittedSub, { color: colors.mutedForeground }]}>Suivi GPS actif</Text>
            </View>
          </View>
        )}

        {/* Completed banner */}
        {isCompleted && (
          <View style={[styles.acceptedCard, { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name="award" size={22} color={colors.mutedForeground} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.submittedTitle, { color: colors.foreground }]}>Mission terminée</Text>
              <Text style={[styles.submittedSub, { color: colors.mutedForeground }]}>
                {formatCFA(mission.myOfferAmount ?? mission.budget)} versés sur votre wallet
              </Text>
            </View>
          </View>
        )}

        {/* Offer sent */}
        {offerSubmitted && !isAccepted && !isInProgress && !isCompleted && (
          <View style={[styles.submittedCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30', borderRadius: colors.radius }]}>
            <Feather name="check-circle" size={22} color={colors.success} />
            <View>
              <Text style={[styles.submittedTitle, { color: colors.foreground }]}>Offre envoyée</Text>
              <Text style={[styles.submittedSub, { color: colors.mutedForeground }]}>
                Votre offre a été soumise à l'expéditeur
              </Text>
            </View>
          </View>
        )}

        {/* Offer form — available only */}
        {!offerSubmitted && mission.missionStatus === 'available' && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Faire une offre</Text>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Budget indiqué : {formatCFA(mission.budget)}
            </Text>
            <View style={[styles.inputRow, { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius }]}>
              <TextInput
                style={[styles.offerInput, { color: colors.foreground }]}
                value={offerAmount}
                onChangeText={setOfferAmount}
                placeholder="Votre prix en FCFA"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
              <Text style={[styles.currency, { color: colors.mutedForeground }]}>FCFA</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA — varies by status */}
      {mission.missionStatus === 'available' && !offerSubmitted && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16), backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button label="Envoyer mon offre" onPress={handleSubmitOffer} loading={loading} disabled={!offerAmount} fullWidth size="lg" />
        </View>
      )}

      {isAccepted && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16), backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button
            label="🚛  Démarrer la mission"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push(`/carrier/tracking/${mission.id}`); }}
            fullWidth size="lg"
          />
        </View>
      )}

      {isInProgress && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16), backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button
            label="📍  Reprendre le suivi GPS"
            onPress={() => router.push(`/carrier/tracking/${mission.id}`)}
            fullWidth size="lg"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  back: { padding: 6 },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 16, gap: 12 },
  card: { padding: 16, borderWidth: 1 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  points: { alignItems: 'center', gap: 4, width: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  line: { width: 2, height: 22, borderRadius: 1 },
  cities: { flex: 1, gap: 18 },
  city: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  meta: { alignItems: 'flex-end', gap: 6 },
  km: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  detailItem: { width: '47%', gap: 4 },
  detailLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  detailValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  shipperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  shipperName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  shipperRating: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  msgBtn: { padding: 10 },
  hint: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, paddingHorizontal: 14, height: 52,
  },
  offerInput: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular' },
  currency: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  submittedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderWidth: 1,
  },
  acceptedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderWidth: 1,
  },
  submittedTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  submittedSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  bottomBar: { padding: 16, borderTopWidth: 1 },
});
