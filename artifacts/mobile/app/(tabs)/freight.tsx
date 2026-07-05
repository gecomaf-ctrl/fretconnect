import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { FreightCard } from '@/components/FreightCard';
import { MissionCard } from '@/components/MissionCard';
import { MOCK_FREIGHTS, MOCK_MISSIONS } from '@/data/mockData';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function FreightScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const tabBarOffset = Platform.OS === 'web' ? 84 : 83;

  const isCarrierActive = user?.activeAccount === 'carrier';
  const isCarrierApproved = user?.carrier?.status === 'approved';

  // If user is on carrier account and approved → show missions
  // Otherwise → show freights
  const showMissions = isCarrierActive && isCarrierApproved;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12), backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {showMissions ? 'Missions disponibles' : 'Mes Frets'}
          </Text>
          {isCarrierActive && isCarrierApproved && (
            <Text style={[styles.headerSub, { color: colors.primary }]}>Compte Chauffeur</Text>
          )}
          {!isCarrierActive && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Compte Expéditeur</Text>
          )}
        </View>
        {!showMissions && (
          <Pressable
            style={[styles.publishBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/shipper/publish'); }}
          >
            <Feather name="plus" size={18} color="#FFF" />
          </Pressable>
        )}
      </View>

      {/* Carrier pending notice */}
      {isCarrierActive && !isCarrierApproved && user?.carrier && (
        <View style={[styles.pendingBanner, { backgroundColor: colors.warning + '15', borderBottomColor: colors.warning + '30' }]}>
          <Feather name="clock" size={15} color={colors.warning} />
          <Text style={[styles.pendingText, { color: colors.warning }]}>
            Votre compte chauffeur est en cours de validation
          </Text>
        </View>
      )}

      {showMissions ? (
        <FlatList
          data={MOCK_MISSIONS}
          keyExtractor={i => i.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + tabBarOffset + 16 }]}
          renderItem={({ item }) => (
            <MissionCard
              mission={item}
              onPress={() => router.push(`/carrier/mission/${item.id}`)}
              onOffer={() => router.push(`/carrier/mission/${item.id}`)}
            />
          )}
          ListHeaderComponent={
            <View style={[styles.filterRow]}>
              {['Tous', 'Camionnette', 'Camion 5T', 'Semi-remorque'].map(f => (
                <Pressable key={f} style={[styles.filterChip, { backgroundColor: f === 'Tous' ? colors.primary : colors.muted, borderRadius: 20 }]}>
                  <Text style={[styles.filterText, { color: f === 'Tous' ? '#FFF' : colors.foreground }]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          }
        />
      ) : (
        <FlatList
          data={MOCK_FREIGHTS}
          keyExtractor={i => i.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + tabBarOffset + 16 }]}
          renderItem={({ item }) => (
            <FreightCard
              freight={item}
              onPress={() => router.push(`/shipper/freight/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="package" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun fret publié</Text>
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                onPress={() => router.push('/shipper/publish')}
              >
                <Text style={styles.emptyBtnText}>Publier un fret</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 },
  publishBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  pendingText: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7 },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  list: { paddingTop: 8 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
