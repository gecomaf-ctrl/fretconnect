import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';
import { Mission } from '@/data/mockData';

function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

interface MissionCardProps {
  mission: Mission;
  onPress: () => void;
  onOffer?: () => void;
}

export function MissionCard({ mission, onPress, onOffer }: MissionCardProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border, opacity: pressed ? 0.93 : 1 },
      ]}
    >
      <View style={styles.route}>
        <View style={styles.points}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.cities}>
          <Text style={[styles.city, { color: colors.foreground }]} numberOfLines={1}>{mission.origin}</Text>
          <Text style={[styles.city, { color: colors.foreground }]} numberOfLines={1}>{mission.destination}</Text>
        </View>
        <View style={styles.rightMeta}>
          <Text style={[styles.km, { color: colors.mutedForeground }]}>{mission.distance} km</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {mission.date.slice(5).replace('-', '/')}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Feather name="package" size={13} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {mission.cargo} · {mission.weight.toLocaleString()} kg
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="truck-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{mission.vehicleType}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <StatusBadge status={mission.missionStatus} small />
          <Text style={[styles.owner, { color: colors.mutedForeground }]}>par {mission.ownerName}</Text>
        </View>
        <View style={styles.rightSide}>
          <Text style={[styles.price, { color: colors.foreground }]}>{formatCFA(mission.budget)}</Text>
          {mission.missionStatus === 'available' && onOffer ? (
            <Button label="Faire une offre" onPress={onOffer} size="sm" />
          ) : null}
          {mission.missionStatus === 'offer_sent' && mission.myOfferAmount ? (
            <Text style={[styles.myOffer, { color: colors.primary }]}>
              {formatCFA(mission.myOfferAmount)}
            </Text>
          ) : null}
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
  rightMeta: { alignItems: 'flex-end', gap: 6 },
  km: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  divider: { height: 1, marginBottom: 12 },
  info: { gap: 6, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  owner: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
  rightSide: { alignItems: 'flex-end', gap: 6 },
  price: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  myOffer: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
