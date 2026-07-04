import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, phone, password);
      router.push('/(auth)/otp');
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
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
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>FretConnect</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Créer un compte</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Rejoignez des milliers d'expéditeurs et transporteurs
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + '15', borderRadius: colors.radius }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Nom complet"
            icon="user"
            value={name}
            onChangeText={setName}
            placeholder="Kofi Mensah"
            autoCapitalize="words"
          />
          <Input
            label="Email"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Téléphone"
            icon="phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+225 07 00 00 00"
            keyboardType="phone-pad"
          />
          <Input
            label="Mot de passe"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 8 caractères"
            secureToggle
          />

          <Button
            label="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.registerBtn}
          />

          <Text style={[styles.terms, { color: colors.mutedForeground }]}>
            En créant un compte, vous acceptez nos{' '}
            <Text style={{ color: colors.primary }}>Conditions d'utilisation</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Déjà un compte ? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Se connecter</Text>
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
  registerBtn: { marginTop: 8 },
  terms: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  loginLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
