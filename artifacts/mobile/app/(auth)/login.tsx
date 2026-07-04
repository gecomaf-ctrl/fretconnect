import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20), paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>FretConnect</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Bon retour</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Connectez-vous à votre compte
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + '15', borderRadius: colors.radius }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email ou téléphone"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Mot de passe"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureToggle
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot')}
            style={styles.forgot}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>Mot de passe oublié ?</Text>
          </Pressable>

          <Button
            label="Se connecter"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.loginBtn}
          />

          <Pressable
            style={[styles.otpBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
            onPress={() => router.push('/(auth)/otp')}
          >
            <Feather name="smartphone" size={18} color={colors.foreground} />
            <Text style={[styles.otpText, { color: colors.foreground }]}>Connexion par OTP</Text>
          </Pressable>

          {/* ── Test shortcut ── */}
          <Pressable
            style={[styles.testBtn, { backgroundColor: colors.muted, borderRadius: colors.radius }]}
            onPress={async () => {
              setLoading(true);
              await login('test@fretconnect.ci', 'test1234');
              router.replace('/(tabs)');
            }}
          >
            <Feather name="zap" size={15} color={colors.primary} />
            <Text style={[styles.testText, { color: colors.primary }]}>Connexion rapide (mode test)</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Pas encore de compte ?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Créer un compte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  back: { alignSelf: 'flex-start', padding: 4, marginBottom: 24 },
  header: { marginBottom: 32, gap: 6 },
  brand: { fontSize: 14, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  title: { fontSize: 30, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, marginTop: 4 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  form: { gap: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  errorText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  forgot: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  loginBtn: { marginTop: 8 },
  otpBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderWidth: 1.5, height: 54,
  },
  otpText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  registerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  testBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 46, marginTop: 4,
  },
  testText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});
