// app/(tabs)/index.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/Contexto/GhibliContext'; // Ajusta la ruta
import { useRouter } from 'expo-router';

export default function PeliculasScreen() {
  const { films, loadingFilms, errorFilms } = useAuth();
  const router = useRouter();

  if (loadingFilms) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#81d4fa" /></View>;
  }
  if (errorFilms) {
    return <View style={styles.loaderContainer}><Text style={styles.errorText}>Error: {errorFilms}</Text></View>;
  }
  if (!films || films.length === 0) {
    return <View style={styles.loaderContainer}><Text style={styles.errorText}>No se encontraron películas.</Text></View>;
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={films}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
        ListHeaderComponent={<Text style={styles.mainTitle}>Películas Ghibli</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            // onPress={() => router.push(`/detalle-pelicula/${item.id}`)} // Para cuando tengas la ruta de detalle
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            {item.release_date && <Text style={styles.cardYear}>{item.release_date}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#121212' },
  listContentContainer: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 80 }, // Padding para el menú
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212'},
  errorText: { color: '#ff6b6b', textAlign: 'center', fontSize: 16 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20, marginTop: 15 },
  card: {
    flex: 1,
    margin: 7,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardImage: { width: '100%', height: 220 }, // Ajusta altura
  cardTitle: { color: '#e0e0e0', fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 5, paddingVertical: 10, minHeight: 50 },
  cardYear: { color: '#a0a0a0', fontSize: 12, textAlign: 'center', paddingBottom: 10 },
});