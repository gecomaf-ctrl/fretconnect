import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

const PERIODS = ['7 jours', '30 jours', '3 mois', 'Année'] as const;
type Period = typeof PERIODS[number];

const MOCK_BY_PERIOD: Record<Period, {
  total: number; missions: number; avg: number;
  bars: number[]; labels: string[];
  byType: { label: string; amount: number; pct: number }[];
}> = {
  '7 jours': {
    total: 127500, missions: 3, avg: 42500,
    bars: [0, 45000, 0, 32500, 50000, 0, 0],
    labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    byType: [
      { label: 'Livraisons locales', amount: 82500, pct: 65 },
      { label: 'Transport longue distance', amount: 45000, pct: 35 },
    ],
  },
  '30 jours': {
    total: 446250, missions: 11, avg: 40568,
    bars: [60000, 90000, 75000, 55000, 80000, 86250],
    labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    byType: [
      { label: 'Livraisons locales', amount: 220000, pct: 49 },
      { label: 'Transport longue distance', amount: 180000, pct: 40 },
      { label: 'Déménagement', amount: 46250, pct: 11 },
    ],
  },
  '3 mois': {
    total: 1238000, missions: 31, avg: 39935,
    bars: [400000, 391750, 446250],
    labels: ['Avr', 'Mai', 'Jun'],
    byType: [
      { label: 'Livraisons locales', amount: 560000, pct: 45 },
      { label: 'Transport longue distance', amount: 520000, pct: 42 },
      { label: 'Déménagement', amount: 158000, pct: 13 },
    ],
  },
  'Année': {
    total: 5120000, missions: 134, avg: 38209,
    bars: [380000, 420000, 395000, 440000, 460000, 480000, 500000, 510000, 490000, 475000, 460000, 510000],
    labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    byType: [
      { label: 'Livraisons locales', amount: 2300000, pct: 45 },
      { label: 'Transport longue distance', amount: 2100000, pct: 41 },
      { label: 'Déménagement', amount: 720000, pct: 14 },
    ],
  },
};

function BarChart({ bars, labels, maxVal }: { bars: number[]; labels: string[]; maxVal: number }) {
  const colors = useColors();
  const BAR_MAX_H = 100;
  return (
    <View style={styles.chart}>
      {bars.map((v, i) => {
        const h = maxVal > 0 ? Math.round((v / maxVal) * BAR_MAX_H) : 0;
        return (
          <View key={i} style={styles.barCol}>
            <View style={[styles.barBg, { height: BAR_MAX_H, backgroundColor: colors.muted }]}>
              <View style={[styles.barFill, { height: h, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function RevenueScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('30 jours');
  const data = MOCK_BY_PERIOD[period];
  const maxBar = Math.max(...data.bars);

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Revenus</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {/* Period picker */}
        <View style={[styles.periodRow]}>
          {PERIODS.map(p => (
            <Pressable
              key={p}
              style={[styles.periodBtn, {
                backgroundColor: period === p ? colors.primary : colors.muted,
                borderRadius: 20,
              }]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, { color: period === p ? '#FFF' : colors.foreground }]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {/* Total card */}
        <LinearGradient
          colors={['#FF5C00', '#FF8A4A']}
          style={[styles.totalCard, { borderRadius: colors.radius + 4 }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={styles.totalLabel}>Total encaissé · {period}</Text>
          <Text style={styles.totalAmount}>{formatCFA(data.total)}</Text>
          <View style={styles.totalMeta}>
            <View style={styles.totalMetaItem}>
              <MaterialCommunityIcons name="truck-check" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.totalMetaText}>{data.missions} missions</Text>
            </View>
            <View style={styles.totalMetaItem}>
              <Feather name="trending-up" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.totalMetaText}>Moy. {formatCFA(data.avg)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Bar chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Évolution des revenus</Text>
          <BarChart bars={data.bars} labels={data.labels} maxVal={maxBar} />
        </View>

        {/* Breakdown */}
        <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Par type de mission</Text>
          {data.byType.map((row, i) => (
            <View key={i} style={styles.breakdownRow}>
              <View style={styles.breakdownTop}>
                <Text style={[styles.breakdownLabel, { color: colors.foreground }]}>{row.label}</Text>
                <Text style={[styles.breakdownAmount, { color: colors.foreground }]}>{formatCFA(row.amount)}</Text>
              </View>
              <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressFill, { width: `${row.pct}%` as any, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.breakdownPct, { color: colors.mutedForeground }]}>{row.pct} %</Text>
            </View>
          ))}
        </View>

        {/* Stats grid */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>INDICATEURS</Text>
        <View style={styles.statsGrid}>
          {[
            { icon: 'clock', label: 'Taux de complétion', value: '97%' },
            { icon: 'star', label: 'Note moyenne', value: `${(user?.carrier?.rating ?? 5).toFixed(1)} ★` },
            { icon: 'zap', label: 'Réactivité', value: '< 2h' },
            { icon: 'award', label: 'Missions ce mois', value: `${data.missions}` },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={s.icon as any} size={22} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
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
  scroll: { padding: 16, gap: 16 },
  periodRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  periodText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  totalCard: { padding: 24, gap: 6 },
  totalLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
  totalAmount: { fontSize: 36, fontFamily: 'Inter_700Bold', color: '#FFF', letterSpacing: -1 },
  totalMeta: { flexDirection: 'row', gap: 20, marginTop: 4 },
  totalMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  totalMetaText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
  chartTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 130, paddingTop: 12 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barBg: { width: '100%', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  breakdownCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  breakdownRow: { gap: 6 },
  breakdownTop: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  breakdownAmount: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  breakdownPct: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', borderRadius: 16, borderWidth: 1,
    padding: 16, alignItems: 'center', gap: 6,
  },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
