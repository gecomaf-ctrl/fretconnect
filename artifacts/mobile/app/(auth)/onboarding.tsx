import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions, FlatList, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'package',
    iconSet: 'feather',
    title: 'Publiez vos frets',
    subtitle: 'Créez une annonce en quelques étapes et recevez les offres des transporteurs certifiés.',
    gradient: ['#FF5C00', '#FF8A4A'],
  },
  {
    id: '2',
    icon: 'truck-delivery',
    iconSet: 'mc',
    title: 'Trouvez des missions',
    subtitle: 'Transporteurs : accédez à des milliers de missions près de vous et augmentez vos revenus.',
    gradient: ['#1A2035', '#253550'],
  },
  {
    id: '3',
    icon: 'shield-check',
    iconSet: 'mc',
    title: 'Paiement sécurisé',
    subtitle: 'Vos paiements sont sécurisés et les fonds libérés uniquement après livraison confirmée.',
    gradient: ['#10B981', '#059669'],
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    Haptics.selectionAsync();
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1, animated: true });
      setCurrent(current + 1);
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <LinearGradient colors={item.gradient as [string, string]} style={styles.slide}>
              <View style={styles.iconCircle}>
                {item.iconSet === 'feather' ? (
                  <Feather name={item.icon as any} size={56} color="#FFF" />
                ) : (
                  <MaterialCommunityIcons name={item.icon as any} size={56} color="#FFF" />
                )}
              </View>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </LinearGradient>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        {/* Brand */}
        <Text style={[styles.brand, { color: colors.foreground }]}>FretConnect</Text>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === current ? colors.primary : colors.border, width: i === current ? 22 : 8 },
              ]}
            />
          ))}
        </View>

        {/* Actions */}
        <Pressable
          style={[styles.nextBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={goNext}
        >
          <Text style={styles.nextText}>
            {current === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          <Feather name="arrow-right" size={18} color="#FFF" />
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
            Déjà un compte ?{' '}
            <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Se connecter</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E1420' },
  slide: {
    width, flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 24, minHeight: 420,
  },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  slideTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#FFF', textAlign: 'center', letterSpacing: -0.5 },
  slideSubtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 24 },
  controls: { backgroundColor: '#FFF', padding: 28, gap: 20, alignItems: 'center' },
  brand: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, width: '100%', height: 54,
  },
  nextText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#FFF' },
  skipBtn: { alignItems: 'center' },
  skipText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
