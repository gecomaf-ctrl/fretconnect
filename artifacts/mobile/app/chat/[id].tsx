import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_CONVERSATIONS } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', text: 'Bonjour, je suis intéressé par votre mission Abidjan → Man.', sender: 'me', time: '09:30' },
  { id: '2', text: 'Bonjour ! Très bien, quel est le type de votre véhicule ?', sender: 'them', time: '09:32' },
  { id: '3', text: 'J\'ai un Camion 5T disponible dès demain matin.', sender: 'me', time: '09:33' },
  { id: '4', text: 'Parfait ! Pouvez-vous confirmer l\'heure de départ ?', sender: 'them', time: '09:45' },
];

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === id) ?? MOCK_CONVERSATIONS[0];
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages(prev => [
      { id: Date.now().toString() + Math.random().toString(36).slice(2), text, sender: 'me', time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 14), backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Avatar name={conversation.participantName} online={conversation.isOnline} size={36} />
          <View>
            <Text style={[styles.headerName, { color: colors.foreground }]}>{conversation.participantName}</Text>
            <Text style={[styles.headerFreight, { color: colors.primary }]} numberOfLines={1}>
              {conversation.freightLabel}
            </Text>
          </View>
        </View>
        <Pressable style={styles.callBtn}>
          <Feather name="phone" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        inverted
        contentContainerStyle={[styles.messagesList, { paddingTop: insets.bottom + 80 }]}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
            <View
              style={[
                styles.bubbleInner,
                {
                  backgroundColor: item.sender === 'me' ? colors.primary : colors.card,
                  borderRadius: item.sender === 'me'
                    ? 18 : 18,
                  borderBottomRightRadius: item.sender === 'me' ? 4 : 18,
                  borderBottomLeftRadius: item.sender === 'me' ? 18 : 4,
                  borderWidth: item.sender === 'them' ? 1 : 0,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[
                styles.bubbleText,
                { color: item.sender === 'me' ? '#FFF' : colors.foreground },
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.bubbleTime,
                { color: item.sender === 'me' ? 'rgba(255,255,255,0.7)' : colors.mutedForeground },
              ]}>
                {item.time}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Input bar */}
      <View style={[
        styles.inputBar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 8),
        },
      ]}>
        <Pressable style={[styles.attachBtn, { backgroundColor: colors.muted }]}>
          <Feather name="paperclip" size={20} color={colors.mutedForeground} />
        </Pressable>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.input, color: colors.foreground, borderRadius: 24 }]}
          value={input}
          onChangeText={setInput}
          placeholder="Votre message..."
          placeholderTextColor={colors.mutedForeground}
          multiline
        />
        <Pressable
          onPress={sendMessage}
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
        >
          <Feather name="send" size={18} color={input.trim() ? '#FFF' : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 6 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  headerFreight: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  callBtn: { padding: 8 },
  messagesList: { paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  bubble: { marginBottom: 4 },
  bubbleMe: { alignItems: 'flex-end' },
  bubbleThem: { alignItems: 'flex-start' },
  bubbleInner: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  bubbleTime: { fontSize: 10, fontFamily: 'Inter_400Regular', alignSelf: 'flex-end' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1,
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  textInput: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, fontFamily: 'Inter_400Regular', maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
