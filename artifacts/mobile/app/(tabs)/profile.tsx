import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform, Alert } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  value?: string;
  danger?: boolean;
}

function MenuRow({ icon, label, onPress, value, danger }: MenuRowProps) {
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

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, switchMode, updateUser } = useAuth();
  const tabBarOffset = Platform.OS === 'web' ? 84 : 83;

  if (!user) return null;

  const isCarrierApproved = user.carrierStatus === 'approved';
  const isCarrierMode = user.mode === 'carrier' && isCarrierApproved;

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleModeSwitch = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switchMode(val ? 'carrier' : 'shipper');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + tabBarOffset + 20 }}
    >
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}>
        <View style={styles.userInfo}>
          <Avatar name={user.name} size={64} />
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

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>24</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Frets</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>4.8</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Note</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>100%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Fiabilité</Text>
        </View>
      </View>

      {/* Mode Switch (if carrier approved) */}
      {isCarrierApproved && (
        <View style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.modeInfo}>
            <MaterialCommunityIcons
              name={isCarrierMode ? 'truck' : 'account-box'}
              size={24}
              color={colors.primary}
            />
            <View>
              <Text style={[styles.modeTitle, { color: colors.foreground }]}>
                Mode {isCarrierMode ? 'Transporteur' : 'Expéditeur'}
              </Text>
              <Text style={[styles.modeSubtitle, { color: colors.mutedForeground }]}>
                Basculer vers {isCarrierMode ? 'Expéditeur' : 'Transporteur'}
              </Text>
            </View>
          </View>
          <Switch
            value={isCarrierMode}
            onValueChange={handleModeSwitch}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      )}

      {/* Carrier status (not yet approved) */}
      {user.carrierStatus !== 'none' && user.carrierStatus !== 'approved' && (
        <Pressable
          style={[styles.carrierCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/become-carrier')}
        >
          <View style={styles.carrierInfo}>
            <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.warning} />
            <View>
              <Text style={[styles.modeTitle, { color: colors.foreground }]}>Demande Transporteur</Text>
              <StatusBadge status={user.carrierStatus} small />
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
      )}

      {/* Menu */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Compte</Text>
      <View style={[styles.menuCard, { borderColor: colors.border }]}>
        <MenuRow icon="file-text" label="Mes documents" onPress={() => {}} />
        <MenuRow icon="credit-card" label="Mon Wallet" onPress={() => router.push('/wallet')} />
        <MenuRow icon="star" label="Mes évaluations" onPress={() => {}} value="4.8 ★" />
        <MenuRow icon="settings" label="Paramètres" onPress={() => {}} />
      </View>

      {user.carrierStatus === 'none' && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Transporteur</Text>
          <Pressable
            style={[styles.becomeCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30', borderRadius: colors.radius }]}
            onPress={() => router.push('/become-carrier')}
          >
            <MaterialCommunityIcons name="truck-delivery" size={28} color={colors.primary} />
            <View style={styles.becomeInfo}>
              <Text style={[styles.becomeTitle, { color: colors.foreground }]}>Devenir Transporteur</Text>
              <Text style={[styles.becomeSubtitle, { color: colors.mutedForeground }]}>
                Commencez à accepter des missions et gagnez de l'argent
              </Text>
            </View>
            <Feather name="arrow-right" size={20} color={colors.primary} />
          </Pressable>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Session</Text>
      <View style={[styles.menuCard, { borderColor: colors.border }]}>
        <MenuRow icon="help-circle" label="Aide et support" onPress={() => {}} />
        <MenuRow icon="log-out" label="Se déconnecter" onPress={handleLogout} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, marginBottom: 16,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  userMeta: { gap: 2, flex: 1 },
  userName: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  userEmail: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  userPhone: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  editBtn: { padding: 10, alignSelf: 'flex-start' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, borderRadius: 16,
    borderWidth: 1, padding: 16, marginBottom: 16,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1, marginVertical: 4 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
  },
  modeInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  modeTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  modeSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  carrierCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
  },
  carrierInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sectionTitle: { fontSize: 12, fontFamily: 'Inter_500Medium', marginLeft: 16, marginBottom: 6, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  becomeCard: {
    marginHorizontal: 16, borderWidth: 1, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8,
  },
  becomeInfo: { flex: 1, gap: 4 },
  becomeTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  becomeSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
});
