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

type TabType = 'freights' | 'missions';

export default function FreightScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>('freights');

  const isCarrierApproved = user?.carrierStatus === 'approved';
  const showBothTabs = isCarrierApproved;

  const tabBarOffset = Platform.OS === 'web' ? 84 : 83;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12), backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {tab === 'freights' ? 'Mes Frets' : 'Missions disponibles'}
        </Text>
        {tab === 'freights' && (
          <Pressable
            style={[styles.publishBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/shipper/publish'); }}
          >
            <Feather name="plus" size={18} color="#FFF" />
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      {showBothTabs && (
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {(['freights', 'missions'] as TabType[]).map(t => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); Haptics.selectionAsync(); }}
              style={[styles.tabBtn, t === tab && [styles.tabBtnActive, { borderBottomColor: colors.primary }]]}
            >
              <Text style={[
                styles.tabBtnText,
                { color: t === tab ? colors.primary : colors.mutedForeground },
              ]}>
                {t === 'freights' ? 'Mes Frets' : 'Missions'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* List */}
      {tab === 'freights' ? (
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
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Aucun fret publié
              </Text>
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                onPress={() => router.push('/shipper/publish')}
              >
                <Text style={styles.emptyBtnText}>Publier un fret</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
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
  publishBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: {},
  tabBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  list: { paddingTop: 16 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
