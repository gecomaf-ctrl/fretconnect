import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Platform, Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MenuButton } from '@/components/SideMenu';

// ─── Reusable components ──────────────────────────────────────────────────────

function MenuRow({ icon, label, onPress, value, danger }: {
  icon: string; label: string; onPress: () => void; value?: string; danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        { backgroundColor: pressed ? colors.muted : colors.card, borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.destructive + '15' : colors.primary + '12' }]}>
        <Feather name={icon as any} size={18} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.destructive : colors.foreground }]}>{label}</Text>
      <View style={styles.menuRight}>
        {value ? <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

// ─── Account Card ─────────────────────────────────────────────────────────────

function AccountCard({
  type,
  isActive,
  exists,
  balance,
  stat,
  statLabel,
  rating,
  status,
  onSwitch,
  onCreate,
}: {
  type: 'shipper' | 'carrier';
  isActive: boolean;
  exists: boolean;
  balance?: number;
  stat?: number;
  statLabel?: string;
  rating?: number;
  status?: string;
  onSwitch: () => void;
  onCreate: () => void;
}) {
  const colors = useColors();
  const isCarrier = type === 'carrier';

  if (!exists && isCarrier) {
    // Carrier not created yet — CTA card
    return (
      <Pressable
        onPress={onCreate}
        style={[
          styles.accountCard,
          styles.accountCardCreate,
          { borderColor: colors.primary + '40', backgroundColor: colors.primary + '08', borderRadius: colors.radius },
        ]}
      >
        <View style={[styles.accountCardIcon, { backgroundColor: colors.primary + '15' }]}>
          <MaterialCommunityIcons name="truck-delivery" size={22} color={colors.primary} />
        </View>
        <Text style={[styles.accountCardTitle, { color: colors.primary }]}>Compte Chauffeur</Text>
        <View style={[styles.createBadge, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={12} color="#FFF" />
          <Text style={styles.createBadgeText}>Créer</Text>
        </View>
        <Text style={[styles.accountCardHint, { color: colors.mutedForeground }]}>
          Acceptez des missions{'\n'}et gagnez de l'argent
        </Text>
      </Pressable>
    );
  }

  const isPending  = status === 'pending' || status === 'corrections';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  return (
    <Pressable
      onPress={exists && (!isCarrier || isApproved) ? onSwitch : onCreate}
      style={[
        styles.accountCard,
        {
          borderColor: isActive ? colors.primary : colors.border,
          backgroundColor: isActive ? colors.primary + '08' : colors.card,
          borderRadius: colors.radius,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      {isActive && (
        <View style={[styles.activePill, { backgroundColor: colors.primary }]}>
          <Text style={styles.activePillText}>Actif</Text>
        </View>
      )}

      <View style={[styles.accountCardIcon, {
        backgroundColor: isCarrier ? (isActive ? colors.primary : colors.dark + '18') : colors.primary + '15',
      }]}>
        <MaterialCommunityIcons
          name={isCarrier ? 'truck' : 'account-box'}
          size={22}
          color={isCarrier ? (isActive ? '#FFF' : colors.foreground) : colors.primary}
        />
      </View>

      <Text style={[styles.accountCardTitle, { color: colors.foreground }]}>
        {isCarrier ? 'Chauffeur' : 'Expéditeur'}
      </Text>

      {isPending && <StatusBadge status="pending" small />}
      {isRejected && <StatusBadge status="rejected" small />}

      {(isApproved || !isCarrier) && (
        <>
          <Text style={[styles.accountBalance, { color: isActive ? colors.primary : colors.foreground }]}>
            {formatCFA(balance ?? 0)}
          </Text>
          <Text style={[styles.accountStat, { color: colors.mutedForeground }]}>
            {stat ?? 0} {statLabel} · ★ {(rating ?? 5.0).toFixed(1)}
          </Text>
        </>
      )}

      {isPending && (
        <Text style={[styles.accountHintSmall, { color: colors.mutedForeground }]}>
          En cours de vérification
        </Text>
      )}
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, switchAccount, approveCarrier } = useAuth();
  const tabBarOffset = 20;

  if (!user) return null;

  const isCarrierActive  = user.activeAccount === 'carrier';
  const carrierApproved  = user.carrier?.status === 'approved';
  const hasCarrierAccount = !!user.carrier;

  const activeShipperWallet = user.shipper.wallet.balance;
  const activeCarrierWallet = user.carrier?.wallet.balance ?? 0;

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleSwitchToCarrier = () => {
    if (!carrierApproved) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchAccount('carrier');
  };

  const handleSwitchToShipper = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchAccount('shipper');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + tabBarOffset + 20 }}
    >
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
      }]}>
        <MenuButton />
        <View style={styles.userInfo}>
          <Avatar name={user.name} size={60} />
          <View style={styles.userMeta}>
            <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
            <Text style={[styles.userPhone, { color: colors.mutedForeground }]}>{user.phone}</Text>
          </View>
        </View>
        <Pressable style={[styles.editBtn, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Feather name="edit-2" size={16} color={colors.foreground} />
        </Pressable>
      </View>

      {/* ── Dual account switcher ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MES COMPTES</Text>
        <View style={styles.accountsRow}>
          {/* Shipper */}
          <AccountCard
            type="shipper"
            isActive={!isCarrierActive}
            exists
            balance={activeShipperWallet}
            stat={user.shipper.freightCount}
            statLabel="frets"
            rating={user.shipper.rating}
            onSwitch={handleSwitchToShipper}
            onCreate={() => {}}
          />
          {/* Carrier */}
          <AccountCard
            type="carrier"
            isActive={isCarrierActive}
            exists={hasCarrierAccount}
            balance={activeCarrierWallet}
            stat={user.carrier?.missionCount}
            statLabel="missions"
            rating={user.carrier?.rating}
            status={user.carrier?.status}
            onSwitch={handleSwitchToCarrier}
            onCreate={() => router.push('/become-carrier')}
          />
        </View>

        {/* Pending carrier notice */}
        {user.carrier?.status === 'pending' && (
          <View style={[styles.pendingNotice, { backgroundColor: colors.warning + '12', borderRadius: colors.radius }]}>
            <Feather name="clock" size={15} color={colors.warning} />
            <Text style={[styles.pendingText, { color: colors.warning }]}>
              Votre dossier chauffeur est en cours de vérification. Vous recevrez une notification dès validation.
            </Text>
          </View>
        )}

        {/* DEV shortcut — approve carrier */}
        {user.carrier?.status === 'pending' && (
          <Pressable
            style={[styles.devBtn, { backgroundColor: colors.success + '15', borderRadius: colors.radius }]}
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); approveCarrier(); }}
          >
            <Feather name="zap" size={14} color={colors.success} />
            <Text style={[styles.devBtnText, { color: colors.success }]}>
              [Test] Simuler approbation du compte chauffeur
            </Text>
          </Pressable>
        )}
      </View>

      {/* Active account stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {isCarrierActive ? (user.carrier?.missionCount ?? 0) : user.shipper.freightCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            {isCarrierActive ? 'Missions' : 'Frets'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {isCarrierActive ? (user.carrier?.rating ?? 5.0).toFixed(1) : user.shipper.rating.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Note</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>100%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Fiabilité</Text>
        </View>
      </View>

      {/* ── Shipper menu ── */}
      {!isCarrierActive && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginLeft: 16, marginBottom: 6, marginTop: 8 }]}>
            EXPÉDITEUR
          </Text>
          <View style={[styles.menuCard, { borderColor: colors.border }]}>
            <MenuRow
              icon="package"
              label="Mes frets publiés"
              value={`${user.shipper.freightCount} frets`}
              onPress={() => router.push('/(tabs)/freight')}
            />
            <MenuRow
              icon="credit-card"
              label="Wallet expéditeur"
              value={formatCFA(activeShipperWallet)}
              onPress={() => router.push('/wallet')}
            />
            <MenuRow
              icon="star"
              label="Mes évaluations"
              value={`${user.shipper.rating.toFixed(1)} ★`}
              onPress={() => {}}
            />
            <MenuRow icon="file-text" label="Mes documents" onPress={() => {}} />
          </View>
        </>
      )}

      {/* ── Carrier menu ── */}
      {isCarrierActive && carrierApproved && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginLeft: 16, marginBottom: 6, marginTop: 8 }]}>
            CHAUFFEUR
          </Text>
          <View style={[styles.menuCard, { borderColor: colors.border }]}>
            <MenuRow
              icon="map"
              label="Mes missions"
              value={`${user.carrier?.missionCount ?? 0} missions`}
              onPress={() => router.push('/(tabs)/freight')}
            />
            <MenuRow
              icon="credit-card"
              label="Wallet chauffeur"
              value={formatCFA(activeCarrierWallet)}
              onPress={() => router.push('/wallet')}
            />
            <MenuRow
              icon="star"
              label="Mes évaluations"
              value={`${(user.carrier?.rating ?? 5).toFixed(1)} ★`}
              onPress={() => {}}
            />
            <MenuRow icon="truck" label="Mon véhicule" onPress={() => router.push('/carrier/vehicle')} />
            <MenuRow icon="shield" label="Documents chauffeur" onPress={() => router.push('/carrier/vehicle')} />
            <MenuRow icon="bar-chart-2" label="Revenus" onPress={() => router.push('/carrier/revenue')} />
          </View>
        </>
      )}

      {/* ── Common menu ── */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginLeft: 16, marginBottom: 6, marginTop: 8 }]}>GÉNÉRAL</Text>
      <View style={[styles.menuCard, { borderColor: colors.border }]}>
        <MenuRow icon="settings" label="Paramètres du compte" onPress={() => {}} />
        <MenuRow icon="bell" label="Notifications" onPress={() => {}} />
        <MenuRow icon="help-circle" label="Aide et support" onPress={() => {}} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginLeft: 16, marginBottom: 6, marginTop: 8 }]}>SESSION</Text>
      <View style={[styles.menuCard, { borderColor: colors.border }]}>
        <MenuRow icon="log-out" label="Se déconnecter" onPress={handleLogout} danger />
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  userMeta: { gap: 2, flex: 1 },
  userName: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  userEmail: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  userPhone: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  editBtn: { padding: 10, alignSelf: 'flex-start' },

  section: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },

  accountsRow: { flexDirection: 'row', gap: 12 },
  accountCard: {
    flex: 1, padding: 14, borderWidth: 1,
    alignItems: 'flex-start', gap: 6, minHeight: 160,
  },
  accountCardCreate: { borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  accountCardIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  accountCardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  accountCardHint: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 16 },
  activePill: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  activePillText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  createBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  createBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  accountBalance: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  accountStat: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  accountHintSmall: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  pendingNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  pendingText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },

  devBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  devBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1 },

  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, borderWidth: 1, padding: 16,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1, marginVertical: 4 },

  menuCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
