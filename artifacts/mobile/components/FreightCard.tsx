import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBadge } from '@/components/StatusBadge';
import { Freight } from '@/data/mockData';

function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

interface FreightCardProps {
  freight: Freight;
  onPress: () => void;
}

export function FreightCard({ freight, onPress }: FreightCardProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border, opacity: pressed ? 0.93 : 1 },
      ]}
    >
      {/* Route */}
      <View style={styles.route}>
        <View style={styles.points}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.cities}>
          <Text style={[styles.city, { color: colors.foreground }]} numberOfLines={1}>{freight.origin}</Text>
          <Text style={[styles.city, { color: colors.foreground }]} numberOfLines={1}>{freight.destination}</Text>
        </View>
        <Text style={[styles.km, { color: colors.mutedForeground }]}>{freight.distance} km</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Feather name="package" size={13} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {freight.cargo} · {freight.weight.toLocaleString()} kg
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="truck-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{freight.vehicleType}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <StatusBadge status={freight.status} small />
        <View style={styles.priceBlock}>
          {freight.offersCount > 0 && freight.status === 'offers_received' ? (
            <Text style={[styles.offersText, { color: colors.primary }]}>
              {freight.offersCount} offre{freight.offersCount > 1 ? 's' : ''}
            </Text>
          ) : null}
          <Text style={[styles.price, { color: colors.foreground }]}>{formatCFA(freight.budget)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, marginHorizontal: 16, marginBottom: 12 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  points: { alignItems: 'center', gap: 4, width: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  line: { width: 2, height: 18, borderRadius: 1 },
  cities: { flex: 1, gap: 15 },
  city: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  km: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  divider: { height: 1, marginBottom: 12 },
  info: { gap: 6, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  offersText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
