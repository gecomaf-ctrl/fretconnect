import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { AppNotification } from '@/data/mockData';

const TYPE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  offer: 'tag',
  accepted: 'check-circle',
  rejected: 'x-circle',
  kyc: 'shield',
  payment: 'credit-card',
  delivery: 'package',
  message: 'message-circle',
};

const TYPE_COLORS: Record<string, string> = {
  offer: '#8B5CF6',
  accepted: '#10B981',
  rejected: '#EF4444',
  kyc: '#F59E0B',
  payment: '#10B981',
  delivery: '#3B82F6',
  message: '#FF5C00',
};

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const colors = useColors();
  const iconName = TYPE_ICONS[notification.type] ?? 'bell';
  const iconColor = TYPE_COLORS[notification.type] ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: !notification.read
            ? colors.primary + '08'
            : pressed
            ? colors.muted
            : colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconColor + '18' }]}>
        <Feather name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{notification.timestamp}</Text>
        </View>
        <Text style={[styles.body, { color: colors.mutedForeground }]} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
      {!notification.read ? (
        <View style={[styles.unread, { backgroundColor: colors.primary }]} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 16, gap: 12, borderBottomWidth: 1,
  },
  iconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  content: { flex: 1, gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 14, fontFamily: 'Inter_600SemiBold', flex: 1 },
  time: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  body: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  unread: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
