import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false, style, textStyle,
}: ButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bg = {
    primary: colors.primary,
    secondary: 'transparent',
    ghost: 'transparent',
    destructive: colors.destructive,
  }[variant];

  const textColor = {
    primary: colors.primaryForeground,
    secondary: colors.primary,
    ghost: colors.foreground,
    destructive: colors.destructiveForeground,
  }[variant];

  const paddingV = { sm: 10, md: 15, lg: 18 }[size];
  const fontSize = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: colors.radius,
          paddingVertical: paddingV,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: variant === 'secondary' ? colors.primary : undefined,
        },
        fullWidth && styles.fullWidth,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  fullWidth: { width: '100%' as const },
  dimmed: { opacity: 0.65 },
  text: { fontFamily: 'Inter_600SemiBold', letterSpacing: -0.2 },
});
