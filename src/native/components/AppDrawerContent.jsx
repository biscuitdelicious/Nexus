import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useMobileAuth } from '../context/MobileAuthContext';
import { COLORS } from '../theme';

export default function AppDrawerContent(props) {
  const { logout } = useMobileAuth();
  const { state, descriptors, navigation } = props;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: COLORS.surface }}
    >
      {state.routes.map((route) => {
        const { options } = descriptors[route.key];
        const label = options.drawerLabel ?? options.title ?? route.name;
        const focused = state.routes[state.index]?.key === route.key;

        return (
          <DrawerItem
            key={route.key}
            label={label}
            focused={focused}
            activeTintColor={COLORS.accentNeon}
            inactiveTintColor={COLORS.textMuted}
            labelStyle={{ fontFamily: 'monospace', fontSize: 12 }}
            icon={({ color, size }) => {
              const iconName = DRAWER_ICONS[route.name] || 'ellipse-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }}
            onPress={() => navigation.navigate(route.name)}
          />
        );
      })}

      <DrawerItem
        label="Sign Out"
        activeTintColor={COLORS.critical}
        inactiveTintColor={COLORS.critical}
        labelStyle={{ fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}
        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
        onPress={() => {
          navigation.closeDrawer();
          logout();
        }}
      />
    </DrawerContentScrollView>
  );
}

const DRAWER_ICONS = {
  Dashboard: 'grid-outline',
  Devices: 'hardware-chip-outline',
  Tickets: 'document-text-outline',
  Observability: 'pulse-outline',
  Metrics: 'pulse-outline',
  Chatbot: 'chatbubble-ellipses-outline',
  Discussions: 'chatbubbles-outline',
  'NOC Wall': 'tv-outline',
};
