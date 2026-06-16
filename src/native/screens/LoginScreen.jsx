import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useResponsive } from '../../hooks/useResponsive';
import { loginUser } from '../../services/authApi';
import { USE_MOCK_API } from '../../services/apiConfig';
import { useMobileAuth } from '../context/MobileAuthContext';
import { COLORS } from '../theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { padding } = useResponsive();
  const { login } = useMobileAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password required');
      return;
    }

    if (trimmedPassword.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }

    if (USE_MOCK_API) {
      login({
        email: trimmedEmail,
        user_id: 1,
        demo: true,
        first_name: trimmedEmail.split('@')[0] || 'Operator',
      });
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(trimmedEmail, trimmedPassword);
      login(user);
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{
          padding,
          paddingTop: padding + Math.max(insets.top, 12),
          paddingBottom: padding + insets.bottom + 32,
        }}
      >
        <ScreenHeader title="Login" subtitle="Operator access" icon="log-in-outline" />

      <View style={styles.card}>
        <Text style={styles.label}>Username or Email</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@nexus.local"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="key-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={COLORS.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: COLORS.border, true: 'rgba(212,255,0,0.35)' }}
              thumbColor={rememberMe ? COLORS.accentNeon : COLORS.textMuted}
            />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <Text style={styles.forgot}>Forgot password?</Text>
        </View>

        <Pressable style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.loginText}>{'>'}_ LOG IN</Text>
          )}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {USE_MOCK_API ? (
          <Text style={styles.note}>
            Demo mode — enter any email and password to continue (no backend yet).
          </Text>
        ) : null}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 20,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rememberText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  forgot: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  loginBtn: {
    backgroundColor: COLORS.accentNeon,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginText: {
    color: '#000',
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: 12,
  },
  error: {
    marginTop: 16,
    color: COLORS.critical,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  note: {
    marginTop: 16,
    color: COLORS.info,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
