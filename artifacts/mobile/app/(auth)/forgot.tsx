import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ForgotScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20) }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        {sent ? (
          <View style={styles.success}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
              <Feather name="check-circle" size={48} color={colors.success} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Email envoyé !</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Consultez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
            </Text>
            <Button label="Retour à la connexion" onPress={() => router.push('/(auth)/login')} fullWidth size="lg" />
          </View>
        ) : (
          <>
            <View style={[styles.icon, { backgroundColor: colors.primary + '12' }]}>
              <Feather name="lock" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Mot de passe oublié</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
            </Text>

            <Input
              label="Email"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              label="Envoyer le lien"
              onPress={handleSend}
              loading={loading}
              disabled={!email}
              fullWidth
              size="lg"
            />

            <Pressable onPress={() => router.push('/(auth)/login')} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Annuler</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, gap: 20 },
  back: { alignSelf: 'flex-start', padding: 4 },
  icon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 8 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, textAlign: 'center', color: '#6B7280' },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 8 },
  successIcon: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { alignItems: 'center' },
  cancelText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
