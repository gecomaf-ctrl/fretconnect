import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { MOCK_TRANSACTIONS, Transaction } from '@/data/mockData';

function formatCFA(n: number) {
  return Math.abs(n).toLocaleString('fr-FR') + ' FCFA';
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const colors = useColors();
  const isCredit = tx.type === 'credit';
  const isCommission = tx.type === 'commission';

  return (
    <View style={[styles.txRow, { borderBottomColor: colors.border }]}>
      <View style={[
        styles.txIcon,
        { backgroundColor: isCredit ? colors.success + '15' : isCommission ? colors.warning + '15' : colors.destructive + '15' },
      ]}>
        <Feather
          name={isCredit ? 'arrow-down-left' : isCommission ? 'percent' : 'arrow-up-right'}
          size={18}
          color={isCredit ? colors.success : isCommission ? colors.warning : colors.destructive}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txDesc, { color: colors.foreground }]}>{tx.description}</Text>
        <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[
          styles.txAmount,
          { color: isCredit ? colors.success : isCommission ? colors.warning : colors.destructive },
        ]}>
          {isCredit ? '+' : ''}{tx.amount < 0 ? '-' : ''}{formatCFA(tx.amount)}
        </Text>
        {tx.status === 'pending' ? (
          <Text style={[styles.txPending, { color: colors.warning }]}>En attente</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const balance = MOCK_TRANSACTIONS
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const income = MOCK_TRANSACTIONS
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 14), backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Mon Wallet</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance card */}
        <LinearGradient
          colors={['#FF5C00', '#FF8A4A']}
          style={[styles.balanceCard, { borderRadius: colors.radius + 4 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <View style={[styles.currencyBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.currencyText}>FCFA</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{balance.toLocaleString('fr-FR')}</Text>
          <View style={styles.balanceMeta}>
            <View style={styles.balanceMetaItem}>
              <Feather name="arrow-down" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.balanceMetaText}>Revenus: {income.toLocaleString('fr-FR')} FCFA</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Actions */}
        <View style={styles.actions}>
          {[
            { icon: 'download', label: 'Recharger' },
            { icon: 'upload', label: 'Retirer' },
            { icon: 'send', label: 'Transférer' },
            { icon: 'file-text', label: 'Relevé' },
          ].map(a => (
            <Pressable key={a.label} style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '12' }]}>
                <Feather name={a.icon as any} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Ce mois</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>+ 505 000</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Retraits</Text>
            <Text style={[styles.statValue, { color: colors.destructive }]}>- 50 000</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Commission</Text>
            <Text style={[styles.statValue, { color: colors.warning }]}>- 9 250</Text>
          </View>
        </View>

        {/* Transactions */}
        <Text style={[styles.txTitle, { color: colors.foreground }]}>Transactions récentes</Text>
        <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {MOCK_TRANSACTIONS.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
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
  balanceCard: { padding: 24, gap: 8 },
  balanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
  currencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  currencyText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  balanceAmount: { fontSize: 38, fontFamily: 'Inter_700Bold', color: '#FFF', letterSpacing: -1 },
  balanceMeta: { flexDirection: 'row', gap: 16 },
  balanceMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  balanceMetaText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  statsRow: {
    flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 16,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statValue: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  statDivider: { width: 1, marginVertical: 4 },
  txTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  txCard: { borderWidth: 1, overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1 },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1, gap: 3 },
  txDesc: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  txDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  txRight: { alignItems: 'flex-end', gap: 2 },
  txAmount: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  txPending: { fontSize: 10, fontFamily: 'Inter_400Regular' },
});
