import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

const statusColor = (status) => {
  switch (status) {
    case 'Healthy': return COLORS.ok;
    case 'Alarm': return COLORS.critical;
    case 'Incident': return COLORS.warn;
    default: return COLORS.textMuted;
  }
};

export default function DeviceRow({ device }) {
  const color = statusColor(device.status);
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.name}>{device.name}</Text>
        <Text style={styles.meta}>{device.ip} · {device.type}</Text>
      </View>
      <View style={[styles.chip, { borderColor: color }]}>
        <Text style={[styles.chipText, { color }]}>{device.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  main: { flex: 1 },
  name: { color: COLORS.text, fontFamily: 'monospace', fontSize: 14, fontWeight: '600' },
  meta: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, marginTop: 4 },
  chip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
