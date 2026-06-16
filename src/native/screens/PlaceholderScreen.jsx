import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { useResponsive } from '../../hooks/useResponsive';
import { COLORS } from '../theme';

export default function PlaceholderScreen({ title, subtitle, icon, note }) {
  const { padding } = useResponsive();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding }}>
      <ScreenHeader title={title} subtitle={subtitle} icon={icon} />
      <Text style={styles.note}>{note}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  note: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 13, lineHeight: 20, marginTop: 8 },
});
