// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Button, Platform } from 'react-native'; // Button para el header, Platform para estilos
import { Ionicons } from '@expo/vector-icons'; // Para los iconos de las pestañas
import { useAuth } from '../../src/Contexto/GhibliContext'; // Ajusta la ruta si es necesario

export default function TabsLayout() {
  const { signOut } = useAuth(); // Obtenemos la función signOut del contexto
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    // El RootLayout (app/_layout.tsx) debería detectar el cambio en userSession y redirigir a /login.
    // Si no lo hace automáticamente, puedes forzarlo:
    // router.replace('/login');
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#81d4fa', // Color para el ícono y texto activo (tu azul Ghibli)
        tabBarInactiveTintColor: '#b0b0b0', // Color para íconos y texto inactivos
        tabBarStyle: {
          backgroundColor: '#1c1c1c', // Fondo oscuro para la barra de pestañas
          borderTopColor: '#333333',  // Color del borde superior
          paddingBottom: Platform.OS === 'ios' ? 20 : 5, // Padding inferior para iOS por el "home indicator"
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 80 : 60, // Altura de la barra de pestañas
        },
        headerStyle: {
          backgroundColor: '#1c1c1c', // Fondo oscuro para el header
        },
        headerTintColor: '#e0e0e0', // Color del texto del header
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tabs.Screen
        name="index" // Corresponde al archivo app/(tabs)/index.tsx
        options={{
          title: 'Películas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="personajes" // Corresponde a app/(tabs)/personajes.tsx
        options={{
          title: 'Personajes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="locaciones" // Corresponde a app/(tabs)/locaciones.tsx
        options={{
          title: 'Locaciones',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos" // Corresponde a app/(tabs)/favoritos.tsx
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="miperfil" // Corresponde a app/(tabs)/miperfil.tsx
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
          headerRight: () => (
            <Button
              onPress={handleLogout}
              title="Salir"
              color={Platform.OS === 'ios' ? '#e53935' : '#e53935'} // Color rojo, puedes quitar Platform.OS si quieres el mismo en ambos
            />
          ),
          headerRightContainerStyle: { // Estilo para el contenedor del botón derecho
            paddingRight: 10,
          }
        }}
      />
      {/* Podrías añadir Aleatorio y Original aquí si los mantienes como pestañas
      <Tabs.Screen name="aleatorio" options={{ title: 'Aleatorio', tabBarIcon: ({color, size}) => ... }} />
      <Tabs.Screen name="original" options={{ title: 'Original', tabBarIcon: ({color, size}) => ... }} />
      */}
    </Tabs>
  );
}