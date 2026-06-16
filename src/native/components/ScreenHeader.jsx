import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function ScreenHeader({ title, subtitle, icon = 'grid-outline' }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={COLORS.info} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  text: { flex: 1 },
  title: { color: COLORS.text, fontSize: 20, fontStyle: 'italic', fontFamily: 'Georgia' },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
