// app/(tabs)/favoritos.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Platform } from 'react-native';
import { useAuth, GhibliFilm } from '../../src/Contexto/GhibliContext'; // Ajusta la ruta si es necesario
import { useRouter, Link } from 'expo-router'; // Link para un posible botón si no hay favoritos

export default function FavoritosScreen() {
  const { films, loadingFilms, favoritosFilmIds, loadingFavoritos, userSession } = useAuth();
  const router = useRouter();

  // Memoizamos la lista de películas favoritas para evitar recálculos innecesarios
  const peliculasFavoritas = useMemo(() => {
    if (!films || films.length === 0 || !favoritosFilmIds || favoritosFilmIds.length === 0) {
      return [];
    }
    return films.filter(film => favoritosFilmIds.includes(film.id));
  }, [films, favoritosFilmIds]);

  if (loadingFilms || (userSession && loadingFavoritos)) { // Mostrar loader si las películas o los IDs de favoritos están cargando
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#81d4fa" /></View>;
  }

  if (!userSession) { // Esto no debería pasar si el layout raíz funciona bien, pero como guarda
      return (
          <View style={styles.loaderContainer}>
              <Text style={styles.infoText}>Debes iniciar sesión para ver tus favoritos.</Text>
              {/* Link SIN asChild */}
              <Link href="/login">
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
                </TouchableOpacity>
              </Link>
          </View>
      );
  }

  if (peliculasFavoritas.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.mainTitle}>Mis Películas Favoritas</Text>
        <Text style={styles.infoText}>Aún no has añadido ninguna película a tus favoritos.</Text>
        <Text style={styles.infoTextSmall}>Ve al detalle de una película y presiona el ❤️.</Text>
        {/* Link SIN asChild */}
        <Link href="/(tabs)/">
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Explorar Películas</Text>
            </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={peliculasFavoritas}
        keyExtractor={(item) => item.id}
        numColumns={2} // Misma cuadrícula de 2 columnas
        contentContainerStyle={styles.listContentContainer}
        ListHeaderComponent={<Text style={styles.mainTitle}>Mis Películas Favoritas</Text>}
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

// Estilos (los mismos que te proporcioné antes)
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#121212' },
  listContentContainer: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 80 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#121212'},
  infoText: { color: '#ccc', textAlign: 'center', fontSize: 16, marginBottom: 10 },
  infoTextSmall: { color: '#aaa', textAlign: 'center', fontSize: 14, marginBottom: 25 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20, marginTop: Platform.OS === 'ios' ? 40 : 20 },
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
  cardImage: { width: '100%', height: 220 },
  cardTitle: { color: '#e0e0e0', fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 5, paddingVertical: 10, minHeight: 50 },
  cardYear: { color: '#a0a0a0', fontSize: 12, textAlign: 'center', paddingBottom: 10 },
  button: {
    backgroundColor: '#81d4fa',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginTop:15,
  },
  buttonText: {
    color: '#121212',
    fontSize: 15,
    fontWeight: 'bold',
  },
});