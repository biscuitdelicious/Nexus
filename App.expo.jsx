import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/native/navigation/AppNavigator';
import LoginScreen from './src/native/screens/LoginScreen';
import { MobileAuthProvider, useMobileAuth } from './src/native/context/MobileAuthContext';
import { COLORS } from './src/theme/colors';

function MobileRoot() {
  const { isAuthed, user } = useMobileAuth();

  return (
    <View style={styles.root}>
      {isAuthed ? <AppNavigator key={user?.email || 'session'} /> : <LoginScreen />}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <MobileAuthProvider>
          <MobileRoot />
        </MobileAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
