import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const CODE_LENGTH = 6;

export default function OTPScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (val: string, idx: number) => {
    if (val.length > 1) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleBackspace = (idx: number) => {
    if (!code[idx] && idx > 0) {
      const next = [...code];
      next[idx - 1] = '';
      setCode(next);
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) return;
    setVerifying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise(r => setTimeout(r, 1000));
    setVerifying(false);
    router.replace('/(tabs)');
  };

  const isComplete = code.every(c => c !== '');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20) }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.icon}>
          <Feather name="smartphone" size={40} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Vérification OTP</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Entrez le code à 6 chiffres envoyé à votre numéro de téléphone
        </Text>

        {/* OTP Boxes */}
        <View style={styles.boxes}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => { inputRefs.current[i] = ref; }}
              style={[
                styles.box,
                {
                  backgroundColor: colors.input,
                  borderColor: digit ? colors.primary : colors.border,
                  color: colors.foreground,
                  borderRadius: colors.radius,
                },
              ]}
              value={digit}
              onChangeText={v => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') handleBackspace(i);
              }}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <Button
          label="Vérifier"
          onPress={handleVerify}
          loading={verifying}
          disabled={!isComplete}
          fullWidth
          size="lg"
          style={styles.verifyBtn}
        />

        <View style={styles.resend}>
          <Text style={[styles.resendText, { color: colors.mutedForeground }]}>
            Code non reçu ?{' '}
          </Text>
          {resendTimer > 0 ? (
            <Text style={[styles.timer, { color: colors.mutedForeground }]}>
              Renvoyer dans {resendTimer}s
            </Text>
          ) : (
            <Pressable onPress={() => setResendTimer(30)}>
              <Text style={[styles.resendLink, { color: colors.primary }]}>Renvoyer</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, gap: 16 },
  back: { alignSelf: 'flex-start', padding: 4, marginBottom: 8 },
  icon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FF5C0015',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 8,
  },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  boxes: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: 8 },
  box: {
    width: 48, height: 56, fontSize: 22,
    fontFamily: 'Inter_700Bold', borderWidth: 2,
  },
  verifyBtn: { marginTop: 8 },
  resend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resendText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  timer: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  resendLink: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
