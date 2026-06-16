import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function MetricCard({ title, value, onPress }) {
  const content = (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 12,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    color: COLORS.info,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
