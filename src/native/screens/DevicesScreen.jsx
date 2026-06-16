import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import DeviceRow from '../components/DeviceRow';
import AddDeviceModal from '../components/AddDeviceModal.native';
import { useResponsive } from '../../hooks/useResponsive';
import { fetchDevices } from '../../services/api';
import { COLORS } from '../theme';
import { POLL_INTERVAL_MS } from '../../constants/polling';

export default function DevicesScreen() {
  const { padding, gap } = useResponsive();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setDevices(await fetchDevices());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const healthy = devices.filter((d) => d.status === 'Healthy').length;
  const total = devices.length;

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ padding, paddingBottom: padding + 24, gap }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accentNeon} />}
      >
        <ScreenHeader title="Device Management" subtitle="Sensors & status" icon="hardware-chip-outline" />
        <View style={styles.stats}>
          <Stat label="Total" value={String(total)} />
          <Stat label="Healthy" value={String(healthy)} color={COLORS.ok} />
          <Stat label="Issues" value={String(total - healthy)} color={COLORS.critical} />
        </View>
        <Pressable style={styles.addBtn} onPress={() => setAddOpen(true)}>
          <Text style={styles.addBtnText}>+ ADD DEVICE</Text>
        </Pressable>
        {devices.map((d) => (
          <DeviceRow key={d.id} device={d} />
        ))}
      </ScrollView>
      <AddDeviceModal visible={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
    </>
  );
}

function Stat({ label, value, color = COLORS.info }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, padding: 12 },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 },
  statVal: { fontSize: 22, fontWeight: '700', fontFamily: 'monospace', marginTop: 4 },
  addBtn: { backgroundColor: COLORS.info, padding: 14, alignItems: 'center' },
  addBtnText: { color: COLORS.bg, fontFamily: 'monospace', fontWeight: '700', letterSpacing: 1 },
});
