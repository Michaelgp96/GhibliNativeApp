// app/(tabs)/miperfil.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../src/Contexto/GhibliContext'; // Ajusta la ruta

export default function MiPerfilScreen() {
  const { userSession } = useAuth(); // Para mostrar el email, por ejemplo

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      {userSession?.user?.email && (
        <Text style={styles.emailText}>Email: {userSession.user.email}</Text>
      )}
      <Text style={styles.text}>Información del perfil y contador de logins (Próximamente)</Text>
      {/* El botón de logout está en el header definido en app/(tabs)/_layout.tsx */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#121212' },
  title: { fontSize: 22, color: 'white', marginBottom: 10 },
  emailText: { fontSize: 16, color: '#ccc', marginBottom: 20 },
  text: { fontSize: 18, color: 'white', textAlign: 'center' },
});