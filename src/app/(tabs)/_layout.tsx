import { Tabs } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

// Obtener el modo de la aplicación desde variables de entorno
const APP_MODE = process.env.EXPO_PUBLIC_APP_MODE || 'local'; // Valor por defecto 'local'

export default function TabLayout() {
  // Determinar qué pestañas mostrar según el modo
  const showLocalTabs = APP_MODE === 'local';
  const showWarehouseTabs = APP_MODE === 'warehouse';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          paddingBottom: 4,
          height: 60,
        },
      }}
    >
      {/* Pestañas para modo LOCAL */}
      {showLocalTabs && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Local',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons 
                  name="store-outline" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="inicio"
            options={{
              title: 'Inicial',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons 
                  name="clock-time-eight" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="pedido"
            options={{
              title: 'Nuevo',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons 
                  name="add-shopping-cart" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="final"
            options={{
              title: 'Final',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons 
                  name="check-all" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="guardar"
            options={{
              title: 'Guardar',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome 
                  name="save" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
        </>
      )}

      {/* Pestañas para modo WAREHOUSE */}
      {showWarehouseTabs && (
        <>
          <Tabs.Screen
            name="pedidos"
            options={{
              title: 'Pedidos',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons 
                  name="clipboard-list-outline" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="checkout"
            options={{
              title: 'Almacén',
              tabBarIcon: ({ color, size }) => (
                <Feather 
                  name="package" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="guardar"
            options={{
              title: 'Guardar',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome 
                  name="save" 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
        </>
      )}
    </Tabs>
  );
}