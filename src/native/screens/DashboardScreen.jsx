import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import MetricCard from '../components/MetricCard';
import DeviceRow from '../components/DeviceRow';
import { useResponsive } from '../../hooks/useResponsive';
import {
  fetchDashboardMetrics,
  fetchDevices,
  fetchSeverityData,
  fetchAlarmFrequency,
} from '../../services/api';
import { COLORS } from '../theme';
import { POLL_INTERVAL_MS } from '../../constants/polling';

export default function DashboardScreen({ navigation }) {
  const { padding, gap, isPhone, columns } = useResponsive();
  const [metrics, setMetrics] = useState([]);
  const [issues, setIssues] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [m, devices, sev, freq] = await Promise.all([
        fetchDashboardMetrics(),
        fetchDevices(),
        fetchSeverityData(),
        fetchAlarmFrequency({ range: '1h' }),
      ]);
      setMetrics(m);
      setIssues(devices.filter((d) => d.status !== 'Healthy'));
      setSeverity(sev);
      setAlarms(freq);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding, paddingBottom: padding + 24, gap }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accentNeon} />}
    >
      <ScreenHeader title="Incident Control Panel" icon="speedometer-outline" />
      <View style={[styles.metricsRow, { flexWrap: 'wrap', gap }]}>
        {metrics.map((m) => (
          <View key={m.id} style={{ width: isPhone ? '100%' : `${100 / Math.min(columns, 2)}%`, flexGrow: 1 }}>
            <MetricCard
              title={m.title}
              value={m.value}
              onPress={m.title === 'OPEN TICKETS' ? () => navigation.navigate('Tickets') : undefined}
            />
          </View>
        ))}
      </View>
      <Panel title="Active Incidents">
        {issues.length === 0 ? (
          <Text style={styles.muted}>No active incidents</Text>
        ) : (
          issues.map((d) => <DeviceRow key={d.id} device={d} />)
        )}
      </Panel>
      <Panel title="Severity Breakdown">
        {severity.map((s) => (
          <View key={s.name} style={styles.barRow}>
            <Text style={[styles.barLabel, { color: s.color }]}>{s.name}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.min(s.value * 10, 100)}%`, backgroundColor: s.color }]} />
            </View>
            <Text style={styles.barVal}>{s.value}</Text>
          </View>
        ))}
      </Panel>
      <Panel title="Alarm Frequency">
        {alarms.map((a) => (
          <View key={a.name} style={styles.barRow}>
            <Text style={styles.barLabel}>{a.name}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.min(a.count * 15, 100)}%`, backgroundColor: COLORS.warn }]} />
            </View>
            <Text style={styles.barVal}>{a.count}</Text>
          </View>
        ))}
      </Panel>
    </ScrollView>
  );
}

function Panel({ title, children }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  metricsRow: { flexDirection: 'row' },
  panel: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
  },
  panelTitle: { color: COLORS.text, fontFamily: 'Georgia', fontStyle: 'italic', marginBottom: 8 },
  muted: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barLabel: { width: 72, fontFamily: 'monospace', fontSize: 10, color: COLORS.textMuted },
  barTrack: { flex: 1, height: 6, backgroundColor: COLORS.bg },
  barFill: { height: 6 },
  barVal: { width: 28, textAlign: 'right', fontFamily: 'monospace', color: COLORS.text, fontSize: 11 },
});
