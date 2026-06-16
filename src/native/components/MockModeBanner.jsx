import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { USE_MOCK_API } from '../../services/apiConfig.native';
import { COLORS } from '../theme';

export default function MockModeBanner() {
  if (!USE_MOCK_API) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>MOCK — fără backend / DB</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(212, 255, 0, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accentNeon,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    color: COLORS.accentNeon,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
