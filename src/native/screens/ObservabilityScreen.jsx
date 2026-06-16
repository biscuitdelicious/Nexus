import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { useResponsive } from '../../hooks/useResponsive';
import { fetchObservabilityMetrics, fetchLiveFeed } from '../../services/api';
import { COLORS } from '../theme';
import { POLL_INTERVAL_MS } from '../../constants/polling';

const levelColor = (level) => {
  switch ((level || '').toLowerCase()) {
    case 'alarm': return COLORS.critical;
    case 'incident': return COLORS.warn;
    case 'event': return COLORS.textMuted;
    default: return COLORS.text;
  }
};

export default function ObservabilityScreen() {
  const { padding, gap } = useResponsive();
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');

  const load = async () => {
    try {
      const [metricsData, logsData] = await Promise.all([
        fetchObservabilityMetrics(),
        fetchLiveFeed(),
      ]);
      setMetrics(metricsData);
      setLogs(logsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const allowedLogs = useMemo(
    () => logs.filter((e) => ['alarm', 'incident', 'event'].includes((e.type || '').toLowerCase())),
    [logs]
  );

  const levels = useMemo(() => {
    const set = new Set(allowedLogs.map((e) => (e.type || '').toLowerCase()));
    return ['all', ...Array.from(set).sort()];
  }, [allowedLogs]);

  const filteredLogs = useMemo(() => {
    if (levelFilter === 'all') return allowedLogs;
    return allowedLogs.filter((e) => (e.type || '').toLowerCase() === levelFilter);
  }, [allowedLogs, levelFilter]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding, paddingBottom: padding + 24, gap }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accentNeon} />
      }
    >
      <ScreenHeader
        title="Metrics & Logs"
        subtitle="System telemetry, active KPIs, and recent events"
        icon="pulse-outline"
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accentNeon} style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <View key={m.id} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
              {m.sublabel ? <Text style={styles.metricSub}>{m.sublabel}</Text> : null}
            </View>
          ))}
        </View>
      )}

      <View style={styles.logsPanel}>
        <Text style={styles.logsTitle}>System Logs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {levels.map((lvl) => (
            <Pressable
              key={lvl}
              onPress={() => setLevelFilter(lvl)}
              style={[styles.filterChip, levelFilter === lvl && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, levelFilter === lvl && styles.filterTextActive]}>
                {lvl === 'all' ? 'ALL' : lvl.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredLogs.length === 0 ? (
          <Text style={styles.empty}>No log entries</Text>
        ) : (
          filteredLogs.map((row) => {
            const type = row.type || 'EVENT';
            const color = levelColor(type);
            return (
              <View key={row.id} style={styles.logRow}>
                <Text style={styles.logTime}>{row.ts}</Text>
                <View style={styles.logMeta}>
                  <View style={[styles.levelChip, { borderColor: color }]}>
                    <Text style={[styles.levelText, { color }]}>{type}</Text>
                  </View>
                  <Text style={styles.logSource}>{row.source}</Text>
                </View>
                <Text style={styles.logMsg}>{row.message}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCard: {
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 12,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  metricValue: {
    color: COLORS.info,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  metricSub: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  logsPanel: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
  },
  logsTitle: {
    color: COLORS.text,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontSize: 18,
    marginBottom: 10,
  },
  filterRow: { marginBottom: 12, maxHeight: 36 },
  filterChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: { borderColor: COLORS.accentNeon, backgroundColor: 'rgba(212,255,0,0.08)' },
  filterText: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.5 },
  filterTextActive: { color: COLORS.accentNeon },
  empty: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12, paddingVertical: 16 },
  logRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
  },
  logTime: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, marginBottom: 4 },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  levelChip: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  levelText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  logSource: { color: COLORS.info, fontFamily: 'monospace', fontSize: 12 },
  logMsg: { color: COLORS.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 18 },
});
