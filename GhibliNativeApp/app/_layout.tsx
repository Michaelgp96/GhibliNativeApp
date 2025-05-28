// app/_layout.tsx
import React from 'react';
import { Stack, SplashScreen, Redirect, usePathname } from 'expo-router'; // Importar usePathname
import { GhibliProvider, useAuth } from '../src/Contexto/GhibliContext'; // Verifica esta ruta

SplashScreen.preventAutoHideAsync();

function GuardedLayout() {
    const { userSession, authLoading } = useAuth();
    const pathname = usePathname(); // Usar usePathname

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
        // Si no hay sesión y no estamos en login/registro, redirigir a login
        return <Redirect href="/login" />;
    }

    if (userSession && inAuthRoutes) {
        // Si hay sesión y estamos en login/registro, redirigir a la pantalla principal de tabs
        return <Redirect href="/(tabs)/" />;
    }

    // Renderiza el Stack apropiado (o Slot si prefieres manejar Stacks en layouts anidados)
    // Este Stack define las rutas de nivel superior.
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="registro" />
            {/* <Stack.Screen name="detalle-pelicula/[id]" options={{ headerShown: true, title: 'Detalle' }}/> */}
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