// app/registro.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'; // No se usa Button directamente
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth'; // Importar AuthError
import { auth as firebaseAuthInstance } from '../src/firebase/firebaseConfig';

export default function RegistroScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegistro = async () => {
    if (email === '' || password === '') { Alert.alert('Campos incompletos', 'Por favor, llena correo y contraseña.'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      await createUserWithEmailAndPassword(firebaseAuthInstance, email, password);
      Alert.alert('¡Registro Exitoso!', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
      router.replace('/login');
    } catch (err: any) {
      const firebaseError = err as AuthError; // Tipar el error
      console.error("Error en RegistroScreen/handleRegistro:", firebaseError);
      if (firebaseError.code === 'auth/email-already-in-use') { setError('Este correo electrónico ya está registrado.');
      } else if (firebaseError.code === 'auth/invalid-email') { setError('El formato del correo electrónico no es válido.');
      } else if (firebaseError.code === 'auth/weak-password') { setError('La contraseña es demasiado débil (mínimo 6 caracteres).');
      } else { setError(firebaseError.message || 'Ocurrió un error durante el registro.'); }
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta Ghibli</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#888" />
      <TextInput style={styles.input} placeholder="Contraseña (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#888" />
      {loading ? (
        <ActivityIndicator size="large" color="#81d4fa" style={{ marginBottom: 20 }}/>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegistro}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>
      )}
      <Link href="/login" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({ /* ... mismos estilos que LoginScreen ... */
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#1c1c1c' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e0e0e0', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#2a2a2a', color: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#444', fontSize: 16 },
  button: { backgroundColor: '#81d4fa', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#181818', fontSize: 16, fontWeight: 'bold' },
  linkButton: { paddingVertical: 10, alignItems: 'center' },
  linkButtonText: { color: '#b0b0b0', fontSize: 14 },
  errorText: { color: '#ff6b6b', textAlign: 'center', marginBottom: 10, fontSize: 14 },
});