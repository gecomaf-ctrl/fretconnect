import React, { createContext, useContext, useRef } from 'react';
import {
  Animated,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import * as Haptics from 'expo-haptics';

interface MenuContextValue {
  openMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used inside MenuProvider');
  return context;
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const translateX = useRef(new Animated.Value(-360)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => {
    setVisible(true);
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: -360, duration: 180, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  };

  return (
    <MenuContext.Provider value={{ openMenu, closeMenu }}>
      <MenuAnimationContext.Provider value={{ translateX, backdropOpacity }}>
        {children}
        {visible && <SideMenu />}
      </MenuAnimationContext.Provider>
    </MenuContext.Provider>
  );
}

export function MenuButton({
  color,
  backgroundColor,
}: {
  color?: string;
  backgroundColor?: string;
}) {
  const colors = useColors();
  const { openMenu } = useMenu();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ouvrir le menu"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        openMenu();
      }}
      style={({ pressed }) => [
        styles.menuButton,
        {
          backgroundColor: backgroundColor ?? colors.muted,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Feather name="menu" size={22} color={color ?? colors.foreground} />
    </Pressable>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.border,
          backgroundColor: pressed ? colors.muted : colors.card,
        },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.destructive + '14' : colors.primary + '12' }]}>
        <Feather name={icon as any} size={17} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
      <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
    </Pressable>
  );
}

function SideMenu() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, switchAccount } = useAuth();
  const { closeMenu } = useMenu();
  const isCarrier = user?.activeAccount === 'carrier';
  const carrierApproved = user?.carrier?.status === 'approved';

  if (!user) return null;

  const go = (path: string) => {
    closeMenu();
    setTimeout(() => router.push(path as any), 180);
  };

  const switchTo = (account: 'shipper' | 'carrier') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchAccount(account);
    closeMenu();
    setTimeout(() => router.replace('/(tabs)'), 180);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { closeMenu(); logout(); } },
    ]);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: useMenuOpacity() }]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: Math.min(360, 340),
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
            backgroundColor: colors.background,
            transform: [{ translateX: useMenuTranslateX() }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.drawerContent}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.profileSummary}>
              <Avatar name={user.name} size={48} />
              <View style={styles.profileText}>
                <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>{user.name}</Text>
                <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{user.email}</Text>
              </View>
            </View>
            <Pressable onPress={closeMenu} style={[styles.closeButton, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={19} color={colors.foreground} />
            </Pressable>
          </View>

          <View style={[styles.accountSwitcher, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.accountSwitcherLabel, { color: colors.mutedForeground }]}>COMPTE ACTIF</Text>
            <View style={styles.accountChoices}>
              <Pressable
                onPress={() => switchTo('shipper')}
                style={[
                  styles.accountChoice,
                  { backgroundColor: !isCarrier ? colors.primary : colors.muted },
                ]}
              >
                <MaterialCommunityIcons name="account-box" size={17} color={!isCarrier ? '#FFF' : colors.mutedForeground} />
                <Text style={[styles.accountChoiceText, { color: !isCarrier ? '#FFF' : colors.mutedForeground }]}>Expéditeur</Text>
              </Pressable>
              <Pressable
                onPress={() => carrierApproved ? switchTo('carrier') : go('/become-carrier')}
                style={[
                  styles.accountChoice,
                  { backgroundColor: isCarrier ? colors.primary : colors.muted },
                ]}
              >
                <MaterialCommunityIcons name="truck" size={17} color={isCarrier ? '#FFF' : colors.mutedForeground} />
                <Text style={[styles.accountChoiceText, { color: isCarrier ? '#FFF' : colors.mutedForeground }]}>Chauffeur</Text>
              </Pressable>
            </View>
            {!user.carrier && (
              <Pressable onPress={() => go('/become-carrier')} style={styles.becomeCarrier}>
                <Feather name="plus-circle" size={14} color={colors.primary} />
                <Text style={[styles.becomeCarrierText, { color: colors.primary }]}>Créer mon compte chauffeur</Text>
              </Pressable>
            )}
          </View>

          <MenuSection title="NAVIGATION">
            <MenuRow icon="home" label="Accueil" onPress={() => go('/(tabs)')} />
            <MenuRow
              icon={isCarrier ? 'map' : 'package'}
              label={isCarrier ? 'Mes missions' : 'Mes frets'}
              onPress={() => go('/(tabs)/freight')}
            />
            <MenuRow icon="message-circle" label="Messages" onPress={() => go('/(tabs)/messages')} />
            <MenuRow icon="bell" label="Notifications" onPress={() => go('/(tabs)/notifications')} />
          </MenuSection>

          {!isCarrier ? (
            <MenuSection title="COMPTE EXPÉDITEUR">
              <MenuRow icon="plus-square" label="Publier un fret" onPress={() => go('/shipper/publish')} />
              <MenuRow
                icon="credit-card"
                label="Wallet expéditeur"
                value={`${user.shipper.wallet.balance.toLocaleString('fr-FR')} FCFA`}
                onPress={() => go('/wallet')}
              />
              <MenuRow icon="star" label="Mes évaluations" value={`${user.shipper.rating.toFixed(1)} ★`} onPress={() => go('/(tabs)/profile')} />
              <MenuRow icon="file-text" label="Mes documents" onPress={() => go('/(tabs)/profile')} />
            </MenuSection>
          ) : (
            <MenuSection title="COMPTE CHAUFFEUR">
              <MenuRow
                icon="credit-card"
                label="Wallet chauffeur"
                value={`${(user.carrier?.wallet.balance ?? 0).toLocaleString('fr-FR')} FCFA`}
                onPress={() => go('/wallet')}
              />
              <MenuRow icon="star" label="Mes évaluations" value={`${(user.carrier?.rating ?? 5).toFixed(1)} ★`} onPress={() => go('/(tabs)/profile')} />
              <MenuRow icon="truck" label="Mon véhicule" onPress={() => go('/carrier/vehicle')} />
              <MenuRow icon="shield" label="Documents chauffeur" onPress={() => go('/carrier/vehicle')} />
              <MenuRow icon="bar-chart-2" label="Revenus" onPress={() => go('/carrier/revenue')} />
            </MenuSection>
          )}

          <MenuSection title="GÉNÉRAL">
            <MenuRow icon="user" label="Mon profil" onPress={() => go('/(tabs)/profile')} />
            <MenuRow icon="settings" label="Paramètres du compte" onPress={() => go('/(tabs)/profile')} />
            <MenuRow icon="help-circle" label="Aide et support" onPress={() => go('/(tabs)/profile')} />
          </MenuSection>

          <MenuSection title="SESSION">
            <MenuRow icon="log-out" label="Se déconnecter" onPress={handleLogout} danger />
          </MenuSection>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// The provider owns these animated values; these helpers keep the drawer
// component declarative while allowing the overlay to share the same context.
function useMenuTranslateX() {
  const context = useContext(MenuAnimationContext);
  return context?.translateX ?? -360;
}

function useMenuOpacity() {
  const context = useContext(MenuAnimationContext);
  return context?.backdropOpacity ?? 0;
}

const MenuAnimationContext = createContext<{
  translateX: Animated.Value;
  backdropOpacity: Animated.Value;
} | null>(null);

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 10, 20, 0.62)',
    zIndex: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 21,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 24,
  },
  drawerContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  profileText: { flex: 1, gap: 2 },
  userName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  userEmail: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountSwitcher: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 9,
  },
  accountSwitcherLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontFamily: 'Inter_700Bold',
  },
  accountChoices: {
    flexDirection: 'row',
    gap: 8,
  },
  accountChoice: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  accountChoiceText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  becomeCarrier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  becomeCarrierText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  section: { gap: 6 },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 0.9,
    fontFamily: 'Inter_700Bold',
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  rowValue: { fontSize: 11, fontFamily: 'Inter_400Regular', marginRight: 2 },
});