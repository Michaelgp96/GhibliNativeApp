// app/registro.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Para Firestore
import { auth as firebaseAuthInstance, db } from '../src/firebase/firebaseConfig'; // Importar db

export default function RegistroScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Opcional: si quieres pedir un nombre
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegistro = async () => {
    // Validaciones básicas
    if (email === '' || password === '') {
      Alert.alert('Campos Incompletos', 'Por favor, ingresa tu correo electrónico y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      Alert.alert('Contraseña Débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(firebaseAuthInstance, email, password);
      const user = userCredential.user;
      console.log("Registro.tsx: Usuario creado en Firebase Auth:", user?.uid);

      if (user) {
        // 2. Crear el documento de perfil en Firestore
        const userProfileRef = doc(db, "profiles", user.uid); // El ID del documento será el UID del usuario

        await setDoc(userProfileRef, {
          email: user.email, // Guardar el email
          username: nombre || '', // Guardar el nombre si se ingresó, sino string vacío
          sign_in_count: 0,    // Inicializar el contador de inicios de sesión
          created_at: serverTimestamp(), // Firestore guarda la fecha del servidor
          last_sign_in_at: serverTimestamp() // Inicializar también
        });
        console.log("Registro.tsx: Perfil creado en Firestore para:", user.uid);
      }

      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada. Serás redirigido para iniciar sesión.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );

    } catch (err) {
      const firebaseError = err as AuthError;
      console.error("Registro.tsx: Error en handleRegistro:", firebaseError.code, firebaseError.message);
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
        Alert.alert('Error de Registro', 'Este correo electrónico ya está registrado.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
        Alert.alert('Error de Registro', 'El formato del correo electrónico no es válido.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil.'); // Ya lo validamos antes, pero por si acaso
        Alert.alert('Error de Registro', 'La contraseña es demasiado débil (mínimo 6 caracteres).');
      } else {
        setError(firebaseError.message || 'Ocurrió un error durante el registro.');
        Alert.alert('Error de Registro', firebaseError.message || 'Ocurrió un error durante el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta Ghibli</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Nombre (Opcional)"
        value={nombre}
        onChangeText={setNombre}
        placeholderTextColor="#888"
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#81d4fa" style={{ marginVertical: 20 }} />
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

// Estilos (puedes usar los que ya tenías o ajustarlos)
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#1c1c1c' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e0e0e0', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#2a2a2a', color: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#444', fontSize: 16 },
  button: { backgroundColor: '#81d4fa', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10, marginTop: 10 },
  buttonText: { color: '#181818', fontSize: 16, fontWeight: 'bold' },
  linkButton: { paddingVertical: 10, alignItems: 'center', marginTop:10 },
  linkButtonText: { color: '#b0b0b0', fontSize: 14 },
  errorText: { color: '#ff6b6b', textAlign: 'center', marginBottom: 10, fontSize: 14 },
});