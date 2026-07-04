import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  secureToggle?: boolean;
}

export function Input({ label, error, icon, secureToggle, style, ...props }: InputProps) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text> : null}
      <View style={[
        styles.row,
        {
          backgroundColor: colors.input,
          borderColor: error ? colors.destructive : focused ? colors.primary : colors.border,
          borderRadius: colors.radius,
        },
      ]}>
        {icon ? <Feather name={icon} size={18} color={colors.mutedForeground} style={styles.icon} /> : null}
        <TextInput
          {...props}
          secureTextEntry={secureToggle ? !showPassword : props.secureTextEntry}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          style={[styles.input, { color: colors.foreground }, style]}
          placeholderTextColor={colors.mutedForeground}
        />
        {secureToggle ? (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, paddingHorizontal: 14, minHeight: 52,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0, fontFamily: 'Inter_400Regular' },
  eye: { padding: 4, marginLeft: 8 },
  error: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
