// app/_layout.tsx
import React from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { GhibliProvider, useAuth } from '../src/Contexto/GhibliContext'; // Ajusta la ruta si es necesario

// Este SplashScreen de expo-router se mostrará automáticamente mientras se carga la fuente del layout.
// Podemos usarlo para ocultar el layout hasta que sepamos el estado de autenticación.
SplashScreen.preventAutoHideAsync();

function LayoutSelector() {
  const authContext = useAuth();

  if (authContext?.authLoading) {
    // Mientras authLoading es true, SplashScreen.preventAutoHideAsync() mantendrá la
    // pantalla de inicio nativa visible. Una vez que authLoading sea false,
    // llamaremos a SplashScreen.hideAsync().
    console.log("LayoutSelector: authLoading es true, esperando...");
    return null; // No renderizar nada más hasta que la autenticación esté lista
  }

  // Una vez que la carga de autenticación ha terminado, ocultamos la pantalla de inicio nativa.
  SplashScreen.hideAsync();
  console.log("LayoutSelector: authLoading es false. userSession:", authContext?.userSession);

  // Si el usuario no está logueado, define un Stack para las pantallas de autenticación.
  if (!authContext?.userSession) {
    console.log("LayoutSelector: No hay sesión, mostrando Stack de Auth.");
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
        {/* Redirige cualquier otra ruta (como index o (tabs)) a login si no está autenticado */}
        <Stack.Screen name="index" redirect={true} href="/login" />
        <Stack.Screen name="(tabs)" redirect={true} href="/login" />
      </Stack>
    );
  }

  // Si el usuario está logueado, define el Stack principal que incluye las pestañas.
  console.log("LayoutSelector: Hay sesión, mostrando Stack principal con (tabs).");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" /> {/* Carga el layout de las pestañas app/(tabs)/_layout.tsx */}
      {/* Aquí podrías tener otras pantallas que se abren SOBRE las pestañas, ej. detalles */}
      {/* <Stack.Screen name="detalle-pelicula/[id]" /> */}
      {/* Si el usuario logueado intenta ir a login/registro, redirigir a la home de tabs */}
      <Stack.Screen name="login" redirect={true} href="/(tabs)/" />
      <Stack.Screen name="registro" redirect={true} href="/(tabs)/" />
    </Stack>
  );
}

export default function RootLayout() {
  console.log("RootLayout: Renderizando GhibliProvider");
  return (
    <GhibliProvider>
      <LayoutSelector />
    </GhibliProvider>
  );
}