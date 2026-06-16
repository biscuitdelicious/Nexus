import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { useResponsive } from '../../hooks/useResponsive';
import { fetchTickets, acknowledgeTicket, snoozeTicket } from '../../services/api';
import { POLL_INTERVAL_MS } from '../../constants/polling';
import { COLORS, SEVERITY_COLOR } from '../../theme/colors';

const SNOOZE_OPTIONS = [
  { value: '15m', label: '15 MIN' },
  { value: '1h', label: '1 HOUR' },
  { value: '8h', label: '8 HOURS' },
];

export default function TicketsScreen() {
  const { padding, gap } = useResponsive();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snoozeMenuId, setSnoozeMenuId] = useState(null);

  const load = async () => {
    try {
      setTickets(await fetchTickets());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const handleAck = async (id) => {
    const res = await acknowledgeTicket(id);
    if (res.success) {
      setTickets((t) => t.map((x) => (x.id === id ? { ...x, status: 'ACKNOWLEDGED' } : x)));
    }
  };

  const handleSnooze = async (id, duration) => {
    setSnoozeMenuId(null);
    const res = await snoozeTicket(id, duration);
    if (res.ok) {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding, paddingBottom: padding + 24, gap }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accentNeon} />}
    >
      <ScreenHeader title="Tickets" subtitle="Open events" icon="document-text-outline" />
      {tickets.map((t) => (
        <View key={t.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={[styles.sev, { color: SEVERITY_COLOR[t.severity] || COLORS.textMuted }]}>
              [{t.severity}]
            </Text>
            <Text style={styles.status}>{t.status}</Text>
          </View>
          <Text style={styles.msg}>{t.message}</Text>
          <Text style={styles.meta}>{t.source} · {t.ts}</Text>
          {t.status === 'PENDING' && (
            <View style={styles.actions}>
              <Pressable style={styles.snooze} onPress={() => setSnoozeMenuId(snoozeMenuId === t.id ? null : t.id)}>
                <Text style={styles.snoozeText}>SNOOZE</Text>
              </Pressable>
              <Pressable style={styles.ack} onPress={() => handleAck(t.id)}>
                <Text style={styles.ackText}>ACKNOWLEDGE</Text>
              </Pressable>
            </View>
          )}
          {snoozeMenuId === t.id && (
            <View style={styles.snoozeMenu}>
              {SNOOZE_OPTIONS.map((opt) => (
                <Pressable key={opt.value} style={styles.snoozeOpt} onPress={() => handleSnooze(t.id, opt.value)}>
                  <Text style={styles.snoozeOptText}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}
      {tickets.length === 0 && !loading && (
        <Text style={styles.empty}>No open tickets</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  card: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sev: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  status: { fontFamily: 'monospace', fontSize: 10, color: COLORS.textMuted },
  msg: { color: COLORS.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 18 },
  meta: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  snooze: { flex: 1, borderWidth: 1, borderColor: COLORS.border, padding: 8, alignItems: 'center' },
  snoozeText: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  ack: { flex: 1, borderWidth: 1, borderColor: COLORS.accentNeon, padding: 8, alignItems: 'center' },
  ackText: { color: COLORS.accentNeon, fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  snoozeMenu: { marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  snoozeOpt: { padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  snoozeOptText: { color: COLORS.text, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 },
  empty: { color: COLORS.textMuted, fontFamily: 'monospace', textAlign: 'center', marginTop: 24 },
});
