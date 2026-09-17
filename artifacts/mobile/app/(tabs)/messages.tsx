import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageItem } from '@/components/MessageItem';
import { MOCK_CONVERSATIONS } from '@/data/mockData';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MenuButton } from '@/components/SideMenu';

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarOffset = 20;

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
          <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
        </View>
        <Text style={[styles.badge, { backgroundColor: colors.primary + '18', color: colors.primary }]}>
          {MOCK_CONVERSATIONS.reduce((a, c) => a + c.unread, 0)} non lus
        </Text>
      </View>

      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + tabBarOffset }}
        renderItem={({ item }) => (
          <MessageItem
            conversation={item}
            onPress={() => router.push(`/chat/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-circle" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun message</Text>
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
  badge: { fontSize: 12, fontFamily: 'Inter_500Medium', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 100 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
});
