// app/(tabs)/miperfil.tsx
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native'; // Añadido Button si quieres un refresh manual
import { useAuth } from '../../src/Contexto/GhibliContext';
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from '../../src/firebase/firebaseConfig'; // Importar db

interface ProfileData extends DocumentData {
    email?: string;
    username?: string;
    sign_in_count?: number;
    created_at?: { seconds: number, nanoseconds: number } | string;
    last_sign_in_at?: { seconds: number, nanoseconds: number } | string;
}

export default function MiPerfilScreen() {
  const { userSession, authLoading: contextAuthLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = async () => { // <-- Función separada para poder re-llamarla
    if (!userSession?.uid) {
      setLoadingProfile(false);
      setProfile(null);
      return;
    }
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const profileRef = doc(db, "profiles", userSession.uid);
      const docSnap = await getDoc(profileRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as ProfileData);
      } else {
        setProfileError("No se encontró información de perfil.");
        setProfile(null);
      }
    } catch (err: any) {
      setProfileError(err.message || "Error al cargar el perfil.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (contextAuthLoading) {
      setLoadingProfile(true);
      return;
    }
    fetchProfile(); // Llamar a fetchProfile
  }, [userSession, contextAuthLoading]);


  if (contextAuthLoading || loadingProfile) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#81d4fa" /><Text style={styles.loadingText}>Cargando Perfil...</Text></View>;
  }
  if (!userSession) {
    return <View style={styles.container}><Text style={styles.infoText}>Inicia sesión para ver tu perfil.</Text></View>;
  }
  if (profileError) {
    return <View style={styles.container}><Text style={styles.errorText}>Error: {profileError}</Text><Button title="Reintentar" onPress={fetchProfile} color="#81d4fa"/></View>;
  }
  if (!profile) {
    return <View style={styles.container}><Text style={styles.infoText}>No se encontró información del perfil para {userSession.email}.</Text><Button title="Recargar Perfil" onPress={fetchProfile} color="#81d4fa"/></View>;
  }

  const formatDate = (timestamp: { seconds: number, nanoseconds: number } | string | undefined) => {
    if (!timestamp) return 'No disponible';
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleDateString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
    return 'Fecha inválida';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil Ghibli</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Correo:</Text><Text style={styles.infoValue}>{profile.email || userSession.email}</Text></View>
        {profile.username && (<View style={styles.infoRow}><Text style={styles.infoLabel}>Nombre:</Text><Text style={styles.infoValue}>{profile.username}</Text></View>)}
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Inicios de Sesión:</Text><Text style={styles.infoValue}>{profile.sign_in_count ?? '0'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Miembro Desde:</Text><Text style={styles.infoValue}>{formatDate(profile.created_at)}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Último Login:</Text><Text style={styles.infoValue}>{formatDate(profile.last_sign_in_at)}</Text></View>
      </View>
      {/* El botón de Logout está en el header de app/(tabs)/_layout.tsx */}
    </View>
  );
}
const styles = StyleSheet.create({ /* ... (tus estilos de perfil que te di antes) ... */
    container: { flex: 1, padding: 20, backgroundColor: '#1c1c1c', alignItems: 'center', },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 30, marginTop: 20, },
    infoCard: { backgroundColor: '#2a2a2a', borderRadius: 10, padding: 20, width: '100%', maxWidth: 500, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3f3f3f', },
    infoLabel: { fontSize: 16, color: '#b0b0b0', fontWeight: '500', },
    infoValue: { fontSize: 16, color: '#e0e0e0', },
    loadingText: { marginTop: 10, fontSize: 16, color: '#ccc', },
    errorText: { color: '#ff6b6b', fontSize: 16, textAlign: 'center', marginBottom:10 },
    infoText: { fontSize: 16, color: '#b0b0b0', textAlign: 'center', marginTop: 20, }
});