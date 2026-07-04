import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  online?: boolean;
}

export function Avatar({ name, uri, size = 44, online }: AvatarProps) {
  const colors = useColors();
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary + '22' },
          ]}
        >
          <Text style={[styles.initials, { color: colors.primary, fontSize: size * 0.36 }]}>
            {initials}
          </Text>
        </View>
      )}
      {online !== undefined ? (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: online ? colors.success : colors.mutedForeground,
              borderColor: colors.background,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: 'Inter_700Bold' },
  dot: {
    position: 'absolute', right: 0, bottom: 0,
    width: 11, height: 11, borderRadius: 6, borderWidth: 2,
  },
});
