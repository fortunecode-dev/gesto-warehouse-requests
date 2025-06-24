import 'react-native-reanimated';
import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { FontAwesome, MaterialCommunityIcons, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

export default function TabLayout() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: '900',
          marginBottom: 2,
        },
        tabBarStyle: {
          paddingBottom: 2,
          height: 40,
          borderTopWidth: 0,
          backgroundColor: '#F8FAFC',
          elevation: 1,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
        },
      }}
    >
      {/* Pestañas para modo LOCAL */}
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          title: 'Local',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="store-outline"
              size={focused ? 22 : 20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/inicio"
        options={{
          title: 'Inicial',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="clock-time-eight"
              size={focused ? 22 : 20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/pedido"
        options={{
          title: 'Nuevo',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="add-shopping-cart"
              size={focused ? 22 : 20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/final"
        options={{
          title: 'Final',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="check-all"
              size={focused ? 22 : 20}
              color={color}
            />
          ),
        }}
      />

      {/* Pestañas para modo WAREHOUSE */}
      <Tabs.Screen
        name="(tabs)/pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={focused ? 22 : 20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/checkout"
        options={{
          title: 'Almacén',
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="package"
              size={focused ? 20 : 18}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/guardar"
        options={{
          title: 'Guardar',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name="save"
              size={focused ? 20 : 18}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}