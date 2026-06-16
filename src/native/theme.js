import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export { COLORS };

export const shared = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  body: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: COLORS.info,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  btn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.info,
    borderColor: COLORS.info,
  },
  btnText: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  btnTextPrimary: {
    color: COLORS.bg,
  },
});
