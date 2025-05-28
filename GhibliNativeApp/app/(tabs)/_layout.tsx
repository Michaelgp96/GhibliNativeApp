// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Button, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/Contexto/GhibliContext';

export default function TabsLayout() {
  const { signOut, userSession } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    // RootLayout se encargará de la redirección a /login
  };

  if (!userSession && !useAuth().authLoading) { // Doble chequeo por si acaso
    // Esto idealmente no debería alcanzarse si RootLayout funciona bien.
    // Podrías poner un <Redirect href="/login" /> aquí si es necesario como fallback.
    return null; 
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#81d4fa',
        tabBarInactiveTintColor: '#b0b0b0',
        tabBarStyle: {
          backgroundColor: '#1c1c1c',
          borderTopColor: '#333333',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 80 : 60,
        },
        headerStyle: { backgroundColor: '#1c1c1c' },
        headerTintColor: '#e0e0e0',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Películas',
          tabBarIcon: ({ color, size }) => <Ionicons name="film-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="personajes" options={{ title: 'Personajes', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="locaciones" options={{ title: 'Locaciones', tabBarIcon: ({ color, size }) => <Ionicons name="location-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
      <Tabs.Screen
        name="miperfil"
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
          headerRight: () => (
            <View style={{ paddingRight: 15 }}>
              <Button onPress={handleLogout} title="Salir" color={Platform.OS === 'ios' ? '#e53935' : '#e53935'} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}