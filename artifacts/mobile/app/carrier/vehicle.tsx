import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';

const MOCK_VEHICLE = {
  type: 'Camion 5T',
  brand: 'Mercedes-Benz',
  model: 'Actros 1840',
  year: '2019',
  plate: 'CI-1234-AB',
  color: 'Blanc',
  capacity: '5 000 kg',
  volume: '30 m³',
  insurance: { label: 'NSIA Assurances', expiry: '31/12/2026', status: 'valid' },
  technical: { label: 'Visite technique', expiry: '15/08/2026', status: 'valid' },
  transport: { label: 'Carte de transport', expiry: '01/03/2026', status: 'expiring' },
};

function DocRow({ label, expiry, status }: { label: string; expiry: string; status: string }) {
  const colors = useColors();
  const isValid    = status === 'valid';
  const isExpiring = status === 'expiring';
  const color = isValid ? colors.success : isExpiring ? colors.warning : colors.destructive;
  const bg    = isValid ? colors.success + '12' : isExpiring ? colors.warning + '12' : colors.destructive + '12';
  return (
    <View style={[styles.docRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.docIcon, { backgroundColor: bg }]}>
        <Feather name="file-text" size={18} color={color} />
      </View>
      <View style={styles.docInfo}>
        <Text style={[styles.docLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.docExpiry, { color: colors.mutedForeground }]}>Expire le {expiry}</Text>
      </View>
      <View style={[styles.docBadge, { backgroundColor: bg }]}>
        <Text style={[styles.docBadgeText, { color }]}>
          {isValid ? 'Valide' : isExpiring ? 'Bientôt' : 'Expiré'}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function VehicleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<'info' | 'docs'>('info');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 14),
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Mon véhicule</Text>
        <Pressable style={[styles.editBtn, { backgroundColor: colors.muted, borderRadius: 20 }]}>
          <Feather name="edit-2" size={16} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Vehicle hero */}
      <View style={[styles.hero, { backgroundColor: colors.dark }]}>
        <MaterialCommunityIcons name="truck" size={56} color="#FF5C00" />
        <View style={styles.heroMeta}>
          <Text style={styles.heroTitle}>{MOCK_VEHICLE.brand} {MOCK_VEHICLE.model}</Text>
          <Text style={styles.heroSub}>{MOCK_VEHICLE.year} · {MOCK_VEHICLE.type}</Text>
          <View style={[styles.plateBadge, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={styles.plateText}>{MOCK_VEHICLE.plate}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['info', 'docs'] as const).map(t => (
          <Pressable
            key={t}
            style={[styles.tabBtn, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(t); }}
          >
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === 'info' ? 'Informations' : 'Documents'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {tab === 'info' ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>CARACTÉRISTIQUES</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <InfoRow label="Type"        value={MOCK_VEHICLE.type} />
              <InfoRow label="Marque"      value={MOCK_VEHICLE.brand} />
              <InfoRow label="Modèle"      value={MOCK_VEHICLE.model} />
              <InfoRow label="Année"       value={MOCK_VEHICLE.year} />
              <InfoRow label="Couleur"     value={MOCK_VEHICLE.color} />
              <InfoRow label="Immatriculation" value={MOCK_VEHICLE.plate} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>CAPACITÉ</Text>
            <View style={styles.capacityRow}>
              <View style={[styles.capacityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="weight-kilogram" size={28} color={colors.primary} />
                <Text style={[styles.capacityValue, { color: colors.foreground }]}>{MOCK_VEHICLE.capacity}</Text>
                <Text style={[styles.capacityLabel, { color: colors.mutedForeground }]}>Charge utile</Text>
              </View>
              <View style={[styles.capacityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="cube-outline" size={28} color={colors.primary} />
                <Text style={[styles.capacityValue, { color: colors.foreground }]}>{MOCK_VEHICLE.volume}</Text>
                <Text style={[styles.capacityLabel, { color: colors.mutedForeground }]}>Volume</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DOCUMENTS LÉGAUX</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <DocRow {...MOCK_VEHICLE.insurance} />
              <DocRow {...MOCK_VEHICLE.technical} />
              <DocRow {...MOCK_VEHICLE.transport} />
            </View>
            <Pressable
              style={[styles.addDocBtn, { borderColor: colors.primary, borderRadius: colors.radius }]}
              onPress={() => {}}
            >
              <Feather name="plus" size={18} color={colors.primary} />
              <Text style={[styles.addDocText, { color: colors.primary }]}>Ajouter un document</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  editBtn: { padding: 10 },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 24, paddingVertical: 24,
  },
  heroMeta: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFF' },
  heroSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)' },
  plateBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  plateText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#FFF', letterSpacing: 1.5 },
  tabs: {
    flexDirection: 'row', borderBottomWidth: 1,
  },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 16, gap: 12 },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4,
  },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  capacityRow: { flexDirection: 'row', gap: 12 },
  capacityCard: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    padding: 20, alignItems: 'center', gap: 8,
  },
  capacityValue: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  capacityLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  docIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1, gap: 2 },
  docLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  docExpiry: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  docBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  docBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  addDocBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderWidth: 1.5, borderStyle: 'dashed',
  },
  addDocText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
