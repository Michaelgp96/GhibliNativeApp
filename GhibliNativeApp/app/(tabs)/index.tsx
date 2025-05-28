// app/(tabs)/index.tsx
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform // <--- AÑADE PLATFORM AQUÍ
} from 'react-native';
import { useAuth } from '../../src/Contexto/GhibliContext';
import { useRouter } from 'expo-router';

export default function PeliculasScreen() {
  const { films, loadingFilms, errorFilms } = useAuth();
  const router = useRouter();

  if (loadingFilms) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#81d4fa" /></View>;
  }
  if (errorFilms) {
    return <View style={styles.loaderContainer}><Text style={styles.errorText}>Error al cargar películas: {errorFilms}</Text></View>;
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
            onPress={() => router.push(`/detalle-pelicula/${item.id}`)}
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
  listContentContainer: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 80 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212'},
  errorText: { color: '#ff8a80', textAlign: 'center', fontSize: 16, padding: 20 },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 20 // Ahora Platform está definido
  },
  card: {
    flex: 1,
    margin: 7,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardImage: {
    width: '100%',
    height: 220,
  },
  cardTitle: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 5,
    paddingVertical: 10,
    minHeight: 50,
  },
  cardYear: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 10,
  },
});