import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Avatar } from '@/components/Avatar';
import { Conversation } from '@/data/mockData';

interface MessageItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function MessageItem({ conversation, onPress }: MessageItemProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.muted : colors.card, borderBottomColor: colors.border },
      ]}
    >
      <Avatar name={conversation.participantName} online={conversation.isOnline} size={50} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.foreground }]}>{conversation.participantName}</Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{conversation.timestamp}</Text>
        </View>
        <Text style={[styles.freight, { color: colors.primary }]} numberOfLines={1}>
          {conversation.freightLabel}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.message,
            {
              color: conversation.unread > 0 ? colors.foreground : colors.mutedForeground,
              fontFamily: conversation.unread > 0 ? 'Inter_500Medium' : 'Inter_400Regular',
            },
          ]}
        >
          {conversation.lastMessage}
        </Text>
      </View>
      {conversation.unread > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{conversation.unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1 },
  content: { flex: 1, gap: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  time: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  freight: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  message: { fontSize: 13 },
  badge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFF', fontSize: 11, fontFamily: 'Inter_700Bold' },
});
