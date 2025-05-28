// app/_layout.tsx
import React from 'react';
import { Stack, SplashScreen, Redirect, usePathname } from 'expo-router';
import { GhibliProvider, useAuth } from '../src/Contexto/GhibliContext'; // Verifica esta ruta
import { Platform } from 'react-native'; // Importar Platform

SplashScreen.preventAutoHideAsync();

function GuardedLayout() {
    const { userSession, authLoading } = useAuth();
    const pathname = usePathname();

    React.useEffect(() => {
        if (!authLoading) {
            SplashScreen.hideAsync();
        }
    }, [authLoading]);

    if (authLoading) {
        return null;
    }

    const inAuthRoutes = pathname === '/login' || pathname === '/registro';

    if (!userSession && !inAuthRoutes) {
        return <Redirect href="/login" />;
    }

    if (userSession && inAuthRoutes) {
        return <Redirect href="/(tabs)/" />;
    }

    return (
        <Stack screenOptions={{
            // headerShown: false // Puedes definirlo por pantalla si quieres
        }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="registro" options={{ headerShown: false }} />
            {/* --- AÑADIDO/MODIFICADO PARA EL DETALLE DE PELÍCULA --- */}
            <Stack.Screen
                name="detalle-pelicula/[id]"
                options={{
                    headerShown: true, // Queremos mostrar el header aquí
                    title: 'Detalle', // Título por defecto, se sobrescribirá en la pantalla
                    headerStyle: { backgroundColor: '#1c1c1c' },
                    headerTintColor: '#e0e0e0',
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerBackTitleVisible: Platform.OS === 'ios' ? true : false, // Muestra "Películas" en iOS
                    headerTitleAlign: 'center',
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
  return (
    <GhibliProvider>
      <GuardedLayout />
    </GhibliProvider>
  );
}