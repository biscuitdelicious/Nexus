import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useResponsive } from '../../hooks/useResponsive';
import {
  fetchDashboardMetrics,
  fetchDevices,
  fetchTickets,
  fetchObservabilityMetrics,
} from '../../services/api';
import { POLL_INTERVAL_MS } from '../../constants/polling';
import { COLORS } from '../theme';

const FEEDS = [
  { key: 'Dashboard', title: 'SYS.DASHBOARD', icon: 'grid-outline', route: 'Dashboard' },
  { key: 'Devices', title: 'NET.DEVICES', icon: 'hardware-chip-outline', route: 'Devices' },
  { key: 'Metrics', title: 'TEL.METRICS', icon: 'pulse-outline', route: 'Metrics' },
  { key: 'Tickets', title: 'SEC.TICKETS', icon: 'document-text-outline', route: 'Tickets' },
];

export default function NocWallScreen() {
  const navigation = useNavigation();
  const { padding, gap } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  const load = async () => {
    try {
      const [metrics, devices, tickets, obs] = await Promise.all([
        fetchDashboardMetrics(),
        fetchDevices(),
        fetchTickets(),
        fetchObservabilityMetrics(),
      ]);
      const openTickets = tickets.filter((t) => t.status === 'PENDING').length;
      const issues = devices.filter((d) => d.status !== 'Healthy').length;
      setSummary({
        metrics: metrics.slice(0, 4),
        deviceCount: devices.length,
        issueCount: issues,
        openTickets,
        obs: obs.slice(0, 3),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const navigateTo = (route) => {
    const parent = navigation.getParent();
    const state = parent?.getState?.();
    const routeNames = state?.routeNames || [];
    let target = route;
    if (route === 'Metrics' && routeNames.includes('Observability')) {
      target = 'Observability';
    }
    if (parent && routeNames.includes(target)) {
      parent.navigate(target);
    } else {
      navigation.navigate(target);
    }
  };

  const renderFeedBody = (key) => {
    if (loading && !summary.metrics) {
      return <ActivityIndicator color={COLORS.accentNeon} style={{ marginVertical: 12 }} />;
    }

    switch (key) {
      case 'Dashboard':
        return (summary.metrics || []).map((m) => (
          <View key={m.id} style={styles.kpiRow}>
            <Text style={styles.kpiLabel}>{m.title}</Text>
            <Text style={styles.kpiValue}>{m.value}</Text>
          </View>
        ));
      case 'Devices':
        return (
          <>
            <Text style={styles.kpiValue}>{summary.deviceCount ?? '—'} devices</Text>
            <Text style={styles.feedMeta}>{summary.issueCount ?? 0} with active issues</Text>
          </>
        );
      case 'Metrics':
        return (summary.obs || []).map((m) => (
          <View key={m.id} style={styles.kpiRow}>
            <Text style={styles.kpiLabel}>{m.label}</Text>
            <Text style={styles.kpiValue}>{m.value}</Text>
          </View>
        ));
      case 'Tickets':
        return (
          <>
            <Text style={styles.kpiValue}>{summary.openTickets ?? 0} pending</Text>
            <Text style={styles.feedMeta}>Open events requiring action</Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding, paddingBottom: padding + 24, gap }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accentNeon} />
      }
    >
      <ScreenHeader
        title="Command Center"
        subtitle="Live monitoring feeds — tap to open full view"
        icon="tv-outline"
      />

      {FEEDS.map((feed) => (
        <Pressable key={feed.key} style={styles.panel} onPress={() => navigateTo(feed.route)}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleRow}>
              <View style={styles.liveDot} />
              <Text style={styles.panelTitle}>FEED: {feed.title}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.textMuted} />
          </View>
          <View style={styles.panelBody}>
            <Ionicons name={feed.icon} size={18} color={COLORS.info} style={{ marginBottom: 8 }} />
            {renderFeedBody(feed.key)}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  panel: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.critical,
  },
  panelTitle: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
  },
  panelBody: { padding: 14 },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiLabel: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    textTransform: 'uppercase',
    flex: 1,
  },
  kpiValue: {
    color: COLORS.info,
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 16,
  },
  feedMeta: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 4,
  },
});
