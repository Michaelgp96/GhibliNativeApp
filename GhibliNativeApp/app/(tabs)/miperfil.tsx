// app/(tabs)/miperfil.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/Contexto/GhibliContext'; // Ajusta la ruta

export default function MiPerfilScreen() {
  const { userSession } = useAuth(); // userSession puede ser User | null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil Ghibli</Text>
      {userSession?.email && ( // <--- CORREGIDO: Acceso directo a userSession.email
        <Text style={styles.emailText}>Correo: {userSession.email}</Text>
      )}
      <Text style={styles.infoText}>Contador de logins y más información vendrá aquí.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#1c1c1c' },
  title: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  emailText: { fontSize: 18, color: '#e0e0e0', marginBottom: 10 },
  infoText: { fontSize: 16, color: '#b0b0b0', textAlign: 'center' },
});