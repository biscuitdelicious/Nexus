import React from 'react';
import { useWindowDimensions } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import AppDrawerContent from '../components/AppDrawerContent';

import DashboardScreen from '../screens/DashboardScreen';
import DevicesScreen from '../screens/DevicesScreen';
import TicketsScreen from '../screens/TicketsScreen';
import ObservabilityScreen from '../screens/ObservabilityScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import DiscussionsScreen from '../screens/DiscussionsScreen';
import NocWallScreen from '../screens/NocWallScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.accentNeon,
    background: COLORS.bg,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
  },
};

const tabIcon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

const drawerScreenOptions = {
  drawerStyle: { backgroundColor: COLORS.surface },
  drawerActiveTintColor: COLORS.accentNeon,
  drawerInactiveTintColor: COLORS.textMuted,
  headerStyle: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTintColor: COLORS.accentNeon,
  headerTitleStyle: { fontFamily: 'monospace', letterSpacing: 1 },
};

function PhoneTabs() {
  const insets = useSafeAreaInsets();
  const headerHeight = 44 + insets.top;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStatusBarHeight: insets.top,
        headerStyle: {
          backgroundColor: COLORS.surface,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          height: headerHeight,
        },
        headerTintColor: COLORS.accentNeon,
        headerTitleStyle: { fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 },
        headerTitleAlign: 'left',
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarActiveTintColor: COLORS.accentNeon,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontFamily: 'monospace', fontSize: 9, letterSpacing: 0.5 },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: tabIcon('grid-outline'), title: 'Dashboard' }} />
      <Tab.Screen name="Devices" component={DevicesScreen} options={{ tabBarIcon: tabIcon('hardware-chip-outline'), title: 'DEVICES' }} />
      <Tab.Screen name="Tickets" component={TicketsScreen} options={{ tabBarIcon: tabIcon('document-text-outline'), title: 'TICKETS' }} />
      <Tab.Screen
        name="Metrics"
        component={ObservabilityScreen}
        options={{ tabBarIcon: tabIcon('pulse-outline'), title: 'METRICS' }}
      />
      <Tab.Screen name="More" options={{ tabBarIcon: tabIcon('menu-outline'), headerShown: false }}>
        {() => <MoreMenu />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MoreMenu() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{ ...drawerScreenOptions, drawerStyle: { backgroundColor: COLORS.surface, width: 280 } }}
    >
      <Drawer.Screen name="Chatbot" component={ChatbotScreen} />
      <Drawer.Screen name="Discussions" component={DiscussionsScreen} />
      <Drawer.Screen name="NOC Wall" component={NocWallScreen} />
    </Drawer.Navigator>
  );
}

function TabletDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{ ...drawerScreenOptions, drawerStyle: { backgroundColor: COLORS.surface, width: 260 }, drawerLabelStyle: { fontFamily: 'monospace', fontSize: 12 } }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Devices" component={DevicesScreen} />
      <Drawer.Screen name="Tickets" component={TicketsScreen} />
      <Drawer.Screen name="Observability" component={ObservabilityScreen} options={{ title: 'METRICS', drawerLabel: 'METRICS' }} />
      <Drawer.Screen name="Chatbot" component={ChatbotScreen} />
      <Drawer.Screen name="Discussions" component={DiscussionsScreen} />
      <Drawer.Screen name="NOC Wall" component={NocWallScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { width } = useWindowDimensions();
  const useTabs = width < 768;

  return (
    <NavigationContainer theme={navTheme}>
      {useTabs ? <PhoneTabs /> : <TabletDrawer />}
    </NavigationContainer>
  );
}
