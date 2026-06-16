import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { useResponsive } from '../../hooks/useResponsive';
import { getChatApiBaseUrl, sendChatMessage } from '../../services/chatApi';
import { COLORS } from '../theme';

export default function ChatbotScreen() {
  const { padding } = useResponsive();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Nexus bot ready. Ask about incidents or devices.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => `mobile-${Date.now()}`);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setSending(true);
    try {
      const data = await sendChatMessage(getChatApiBaseUrl(), text, sessionId);
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: data.reply || data.answer || data.message || 'No response.' },
      ]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: e?.message || 'Network error' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.screen} contentContainerStyle={{ padding, flexGrow: 1 }}>
        <ScreenHeader title="Nexus Bot" icon="chatbubble-ellipses-outline" />
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}
          >
            <Text style={styles.bubbleText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.inputRow, { padding }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Message..."
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
        <Pressable style={styles.send} onPress={send} disabled={sending}>
          <Text style={styles.sendText}>{sending ? '...' : 'SEND'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1 },
  bubble: { padding: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, maxWidth: '92%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: 'rgba(88,166,255,0.15)' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.surface },
  bubbleText: { color: COLORS.text, fontFamily: 'monospace', fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontFamily: 'monospace',
    padding: 10,
    maxHeight: 100,
  },
  send: { backgroundColor: COLORS.info, justifyContent: 'center', paddingHorizontal: 16 },
  sendText: { color: COLORS.bg, fontFamily: 'monospace', fontWeight: '700', fontSize: 12 },
});
