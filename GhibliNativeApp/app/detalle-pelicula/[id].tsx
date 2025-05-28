// app/detalle-pelicula/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuth, GhibliFilm } from '../../src/Contexto/GhibliContext'; // Ajusta la ruta si es necesario
import { Ionicons } from '@expo/vector-icons'; // Para el ícono de favorito

export default function DetallePeliculaScreen() {
  const { id: filmIdParam } = useLocalSearchParams<{ id: string }>();
  const filmId = Array.isArray(filmIdParam) ? filmIdParam[0] : filmIdParam;

  const {
    films,
    loadingFilms,
    addFilmToFavoritos,
    removeFilmFromFavoritos,
    isFilmFavorito,
    loadingFavoritos,
    userSession
  } = useAuth();
  const router = useRouter();

  const [filmDetail, setFilmDetail] = useState<GhibliFilm | null | undefined>(undefined);

  useEffect(() => {
    if (!loadingFilms && films.length > 0 && filmId) {
      const foundFilm = films.find(f => f.id === filmId);
      setFilmDetail(foundFilm || null);
    } else if (!loadingFilms && filmId) {
      setFilmDetail(null);
    }
  }, [films, loadingFilms, filmId]);

  if (filmDetail === undefined || loadingFilms) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#81d4fa" /></View>;
  }

  if (!filmDetail) {
    return (
      <View style={styles.loaderContainer}>
        <Stack.Screen options={{ title: 'Película no encontrada' }} />
        <Text style={styles.errorText}>Película no encontrada.</Text>
        <TouchableOpacity style={styles.buttonVolver} onPress={() => router.back()}>
            <Text style={styles.buttonVolverText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const esFavoritaActual = isFilmFavorito(filmDetail.id);

  const handleToggleFavorito = async () => {
    if (!userSession) {
        Alert.alert("Acción Requerida", "Debes iniciar sesión para añadir películas a favoritos.", [
          { text: "Cancelar" },
          { text: "Iniciar Sesión", onPress: () => router.push('/login') }
        ]);
        return;
    }
    if (loadingFavoritos) return;

    if (esFavoritaActual) {
      await removeFilmFromFavoritos(filmDetail.id);
    } else {
      await addFilmToFavoritos(filmDetail); // Pasamos el objeto completo de la película
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: filmDetail.title || 'Detalle', headerBackTitleVisible: Platform.OS === 'ios' ? true : false, headerTitleAlign: 'center' }} />

      {filmDetail.movie_banner && (
        <Image source={{ uri: filmDetail.movie_banner }} style={styles.bannerImage} resizeMode="cover" />
      )}

      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
            <Text style={styles.title}>{filmDetail.title}</Text>
            {userSession && (
                <TouchableOpacity onPress={handleToggleFavorito} disabled={loadingFavoritos} style={styles.favButton}>
                    <Ionicons 
                        name={esFavoritaActual ? "heart" : "heart-outline"} 
                        size={32} 
                        color={esFavoritaActual ? "#e53935" : "#ccc"} 
                    />
                    {loadingFavoritos && <ActivityIndicator size="small" color="#ccc" style={{ marginLeft: 5 }} />}
                </TouchableOpacity>
            )}
        </View>
        {(filmDetail.original_title || filmDetail.original_title_romanised) && (
            <Text style={styles.originalTitle}>
            {filmDetail.original_title} {filmDetail.original_title_romanised && filmDetail.original_title_romanised !== filmDetail.original_title ? `/ ${filmDetail.original_title_romanised}` : ''}
            </Text>
        )}
        <Text style={styles.detailText}><strong>Año:</strong> {filmDetail.release_date || 'N/A'}</Text>
        <Text style={styles.detailText}><strong>Director:</strong> {filmDetail.director || 'N/A'}</Text>
        <Text style={styles.detailText}><strong>Productor:</strong> {filmDetail.producer || 'N/A'}</Text>
        <Text style={styles.detailText}><strong>Puntuación RT:</strong> {filmDetail.rt_score ? `${filmDetail.rt_score}%` : 'N/A'}</Text>

        {filmDetail.description && (
            <>
                <Text style={styles.descriptionTitle}>Descripción:</Text>
                <Text style={styles.descriptionText}>{filmDetail.description}</Text>
            </>
        )}

        {!filmDetail.movie_banner && filmDetail.image && (
            <Image source={{ uri: filmDetail.image }} style={styles.posterImage} resizeMode="contain" />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fondo un poco más oscuro para el detalle
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  bannerImage: {
    width: '100%',
    height: 220, // Un poco menos alto que antes
  },
  posterImage: {
    width: '60%', // Más pequeño para que no domine tanto
    height: 280,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 8,
  },
  contentContainer: {
    padding: 15, // Padding general
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Alinear al inicio para títulos largos
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1, // Permite que el título se ajuste si es largo
    marginRight: 10,
  },
  favButton: {
    padding: 8, // Aumentar área de toque
    marginLeft:10, // Espacio si el título es muy largo
  },
  originalTitle: {
    fontSize: 15,
    color: '#a0a0a0', // Más sutil
    marginBottom: 12,
    fontStyle: 'italic',
  },
  detailText: {
    fontSize: 15, // Ligeramente más pequeño
    color: '#e0e0e0',
    marginBottom: 7,
    lineHeight: 22,
  },
  descriptionTitle: {
    fontSize: 17, // Ligeramente más pequeño
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 5,
    borderTopColor: '#333',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#d0d0d0', // Ligeramente más claro
    lineHeight: 23,
    textAlign: 'justify',
  },
  errorText: {
    color: '#ff8a80', // Un rojo más suave
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonVolver: { // Estilo para el botón "Volver"
    backgroundColor: '#81d4fa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20, // Más redondeado
    alignItems: 'center',
    marginTop:10,
  },
  buttonVolverText: {
    color: '#121212', // Texto oscuro para contraste
    fontSize: 15,
    fontWeight: 'bold',
  },
});