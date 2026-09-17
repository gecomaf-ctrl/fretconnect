import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationItem } from '@/components/NotificationItem';
import { MOCK_NOTIFICATIONS, AppNotification } from '@/data/mockData';
import { Feather } from '@expo/vector-icons';
import { MenuButton } from '@/components/SideMenu';

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const tabBarOffset = 20;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12),
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Tout lire</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + tabBarOffset }}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => markRead(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Aucune notification
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  markAll: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 100 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
});
