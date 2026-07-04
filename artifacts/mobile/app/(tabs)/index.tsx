import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/Avatar';
import NativeMap from '@/components/NativeMap';

interface ActionTileProps {
  icon: string;
  label: string;
  onPress: () => void;
  highlight?: boolean;
}

function ActionTile({ icon, label, onPress, highlight }: ActionTileProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: highlight ? colors.primary : colors.muted,
          opacity: pressed ? 0.8 : 1,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Feather name={icon as any} size={22} color={highlight ? '#FFF' : colors.foreground} />
      <Text style={[styles.tileLabel, { color: highlight ? '#FFF' : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(230)).current;

  const isCarrier = user?.mode === 'carrier' && user?.carrierStatus === 'approved';

  const toggleSheet = () => {
    const toValue = expanded ? 230 : 400;
    Animated.spring(sheetHeight, { toValue, useNativeDriver: false, damping: 18, stiffness: 200 }).start();
    setExpanded(!expanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const tabBarOffset = Platform.OS === 'web' ? 84 : 83;

  return (
    <View style={styles.container}>
      {/* Map or gradient background */}
      {Platform.OS !== 'web' ? (
        <NativeMap />
      ) : (
        <LinearGradient
          colors={['#0E1420', '#1A2035', '#253045']}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Top bar overlay */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <LinearGradient
          colors={['rgba(14,20,32,0.85)', 'rgba(14,20,32,0)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.topBarContent}>
          <View>
            <Text style={styles.brand}>FretConnect</Text>
            <View style={[styles.modeBadge, { backgroundColor: isCarrier ? colors.primary : colors.dark }]}>
              <MaterialCommunityIcons
                name={isCarrier ? 'truck' : 'account-box'}
                size={12}
                color="#FFF"
              />
              <Text style={styles.modeText}>{isCarrier ? 'Transporteur' : 'Expéditeur'}</Text>
            </View>
          </View>
          <View style={styles.topRight}>
            <Pressable
              style={[styles.topBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
              onPress={() => router.push('/wallet')}
            >
              <Feather name="credit-card" size={18} color="#FFF" />
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <Avatar name={user?.name ?? 'U'} size={38} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            paddingBottom: insets.bottom + tabBarOffset,
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
        ]}
      >
        {/* Drag handle */}
        <Pressable onPress={toggleSheet} style={styles.handleArea}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
            {isCarrier ? 'Mode Transporteur' : 'Que souhaitez-vous faire ?'}
          </Text>
          <Feather name={expanded ? 'chevron-down' : 'chevron-up'} size={20} color={colors.mutedForeground} />
        </Pressable>

        {/* Main CTA */}
        <Pressable
          style={[styles.mainCta, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (isCarrier) router.push('/(tabs)/freight');
            else router.push('/shipper/publish');
          }}
        >
          <Feather name={isCarrier ? 'search' : 'plus'} size={20} color="#FFF" />
          <Text style={styles.ctaText}>
            {isCarrier ? 'Rechercher des missions' : 'Publier un fret'}
          </Text>
        </Pressable>

        {/* Action grid */}
        <View style={styles.grid}>
          {isCarrier ? (
            <>
              <ActionTile icon="list" label="Mes missions" onPress={() => router.push('/(tabs)/freight')} />
              <ActionTile icon="truck" label="Véhicules" onPress={() => router.push('/(tabs)/freight')} />
              <ActionTile icon="credit-card" label="Wallet" onPress={() => router.push('/wallet')} />
              <ActionTile icon="bar-chart-2" label="Revenus" onPress={() => router.push('/(tabs)/freight')} />
            </>
          ) : (
            <>
              <ActionTile icon="package" label="Mes frets" onPress={() => router.push('/(tabs)/freight')} />
              <ActionTile icon="search" label="Chercher fret" onPress={() => router.push('/(tabs)/freight')} />
              <ActionTile icon="credit-card" label="Wallet" onPress={() => router.push('/wallet')} />
              <ActionTile icon="clock" label="Historique" onPress={() => router.push('/(tabs)/freight')} />
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 20 },
  topBarContent: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20,
  },
  brand: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFF', letterSpacing: -0.5 },
  modeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginTop: 4,
  },
  modeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  handleArea: {
    alignItems: 'center', paddingTop: 10, paddingBottom: 14, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  handle: { width: 36, height: 4, borderRadius: 2, position: 'absolute', top: 10, left: '50%' as any },
  sheetTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1, marginLeft: 8 },
  mainCta: {
    marginHorizontal: 16, marginBottom: 12, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10,
  },
  tile: {
    width: '22%' as any, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  tileLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
