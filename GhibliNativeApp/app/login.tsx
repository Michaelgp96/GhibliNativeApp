// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'; // No se usa Button directamente
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth'; // Importar AuthError
import { auth as firebaseAuthInstance } from '../src/firebase/firebaseConfig';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') { Alert.alert('Campos Incompletos', 'Por favor, ingresa tu correo y contraseña.'); return; }
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(firebaseAuthInstance, email, password);
      // Navegación manejada por _layout.tsx al cambiar userSession
    } catch (err) {
      const firebaseError = err as AuthError; // Tipar el error
      console.error("Error en LoginScreen/handleLogin:", firebaseError);
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('Correo electrónico o contraseña incorrectos.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else {
        setError(firebaseError.message || 'Ocurrió un error al iniciar sesión.');
      }
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión Ghibli</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#888" />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#888" />
      {loading ? (
        <ActivityIndicator size="large" color="#81d4fa" style={{ marginBottom: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      )}
      <Link href="/registro" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkButtonText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#1c1c1c' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e0e0e0', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#2a2a2a', color: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#444', fontSize: 16 },
  button: { backgroundColor: '#81d4fa', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#181818', fontSize: 16, fontWeight: 'bold' },
  linkButton: { paddingVertical: 10, alignItems: 'center' },
  linkButtonText: { color: '#b0b0b0', fontSize: 14 },
  errorText: { color: '#ff6b6b', textAlign: 'center', marginBottom: 10, fontSize: 14 },
});