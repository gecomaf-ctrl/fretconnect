import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_FREIGHTS } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const MOCK_OFFERS = [
  { id: 'o1', name: 'Moussa Touré', rating: 4.8, trips: 142, amount: 165000, vehicle: 'Camion 5T', eta: '2026-07-05' },
  { id: 'o2', name: 'Ibrahim Coulibaly', rating: 4.6, trips: 87, amount: 175000, vehicle: 'Camion 5T', eta: '2026-07-05' },
  { id: 'o3', name: 'Seydou Bamba', rating: 4.9, trips: 231, amount: 180000, vehicle: 'Camion 5T', eta: '2026-07-06' },
];

function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

export default function FreightDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const freight = MOCK_FREIGHTS.find(f => f.id === id) ?? MOCK_FREIGHTS[0];

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Détail du fret</Text>
        <Pressable style={[styles.shareBtn, { backgroundColor: colors.muted }]}>
          <Feather name="share-2" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        {/* Route card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.route}>
            <View style={styles.routePoints}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.routeCities}>
              <Text style={[styles.city, { color: colors.foreground }]}>{freight.origin}</Text>
              <Text style={[styles.city, { color: colors.foreground }]}>{freight.destination}</Text>
            </View>
            <View style={styles.routeMeta}>
              <Text style={[styles.distance, { color: colors.mutedForeground }]}>{freight.distance} km</Text>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{freight.date}</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Détails</Text>
          <View style={styles.detailGrid}>
            {[
              { icon: 'package', label: 'Marchandise', value: freight.cargo },
              { icon: 'layers', label: 'Poids', value: `${freight.weight.toLocaleString()} kg` },
              { icon: 'truck', label: 'Véhicule', value: freight.vehicleType },
              { icon: 'credit-card', label: 'Budget', value: formatCFA(freight.budget) },
            ].map(item => (
              <View key={item.label} style={styles.detailItem}>
                <Feather name={item.icon as any} size={16} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.statusRow}>
            <StatusBadge status={freight.status} />
          </View>
        </View>

        {/* Offers */}
        {freight.status === 'offers_received' && (
          <View>
            <Text style={[styles.offersTitle, { color: colors.foreground }]}>
              {MOCK_OFFERS.length} offres reçues
            </Text>
            {MOCK_OFFERS.map(offer => (
              <Pressable
                key={offer.id}
                onPress={() => { setSelectedOffer(offer.id); Haptics.selectionAsync(); }}
                style={[
                  styles.offerCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selectedOffer === offer.id ? colors.primary : colors.border,
                    borderRadius: colors.radius,
                    borderWidth: selectedOffer === offer.id ? 2 : 1,
                  },
                ]}
              >
                <Avatar name={offer.name} size={44} />
                <View style={styles.offerInfo}>
                  <Text style={[styles.offerName, { color: colors.foreground }]}>{offer.name}</Text>
                  <View style={styles.offerMeta}>
                    <Text style={[styles.offerStat, { color: colors.mutedForeground }]}>
                      ★ {offer.rating}
                    </Text>
                    <Text style={[styles.offerStat, { color: colors.mutedForeground }]}>
                      {offer.trips} trajets
                    </Text>
                    <Text style={[styles.offerStat, { color: colors.mutedForeground }]}>
                      {offer.vehicle}
                    </Text>
                  </View>
                </View>
                <View style={styles.offerPrice}>
                  <Text style={[styles.offerAmount, { color: colors.primary }]}>
                    {formatCFA(offer.amount)}
                  </Text>
                  {selectedOffer === offer.id && (
                    <Feather name="check-circle" size={18} color={colors.primary} />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* In transit - tracking card */}
        {freight.status === 'in_transit' && (
          <View style={[styles.card, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30', borderRadius: colors.radius }]}>
            <View style={styles.trackRow}>
              <MaterialCommunityIcons name="truck-fast" size={28} color={colors.primary} />
              <View>
                <Text style={[styles.trackTitle, { color: colors.foreground }]}>En route vers destination</Text>
                <Text style={[styles.trackSub, { color: colors.mutedForeground }]}>
                  Arrivée estimée : aujourd'hui 18:00
                </Text>
              </View>
            </View>
            <Button
              label="Suivre en temps réel"
              onPress={() => router.push(`/shipper/tracking/${freight.id}`)}
              size="sm"
              style={styles.trackBtn}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      {freight.status === 'offers_received' && selectedOffer && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16), backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button
            label="Choisir ce transporteur"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            }}
            fullWidth
            size="lg"
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
  shareBtn: { padding: 8, borderRadius: 20 },
  scroll: { padding: 16, gap: 12 },
  card: { padding: 16, borderWidth: 1, marginBottom: 4 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routePoints: { alignItems: 'center', gap: 4, width: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  routeLine: { width: 2, height: 22, borderRadius: 1 },
  routeCities: { flex: 1, gap: 18 },
  city: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  routeMeta: { alignItems: 'flex-end', gap: 6 },
  distance: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '47%', gap: 4 },
  detailLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  detailValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  statusRow: { marginTop: 12 },
  offersTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  offerCard: { padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  offerInfo: { flex: 1, gap: 4 },
  offerName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  offerMeta: { flexDirection: 'row', gap: 10 },
  offerStat: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  offerPrice: { alignItems: 'flex-end', gap: 4 },
  offerAmount: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  trackTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  trackSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  trackBtn: { alignSelf: 'flex-start' },
  bottomBar: { padding: 16, borderTopWidth: 1 },
});
