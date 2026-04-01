import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme';

const primaryActionColor = colors.accent;
const primaryActionColorActive = '#3B9BFF';

export default function TabsLayout() {
  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        freezeOnBlur: false,
        headerShown: false,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'home' : 'home-outline'}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="movements"
        options={{
          title: 'Movimientos',
          tabBarLabel: 'Movimientos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="new-movement"
        options={{
          title: 'Nuevo movimiento',
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerButtonFrame}>
              <View style={styles.centerButtonHalo} />
              <View
                style={[
                  styles.centerIconContainer,
                  focused ? styles.centerIconContainerFocused : null,
                ]}
              >
                <Ionicons color={colors.text} name="add" size={34} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Presupuestos',
          tabBarLabel: 'Presupuestos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'wallet' : 'wallet-outline'}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 0,
    backgroundColor: colors.surfaceSoft,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 18,
  },
  tabBarLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  centerButtonFrame: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonHalo: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.surfaceSoft,
    
    borderWidth: 8,
    borderColor: colors.surfaceSoft,
  },
  centerIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryActionColor,
    shadowColor: primaryActionColor,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.34,
    shadowRadius: 16,
    elevation: 10,
  },
  centerIconContainerFocused: {
    backgroundColor: primaryActionColorActive,
  },
});
