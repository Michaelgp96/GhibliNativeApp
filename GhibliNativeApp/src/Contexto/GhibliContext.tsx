// src/Contexto/GhibliContext.tsx
import React, { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { auth as firebaseAuthInstanceUntyped, db } from '../firebase/firebaseConfig';
import { User, onAuthStateChanged, signOut as firebaseSignOut, Auth } from 'firebase/auth';
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  // updateDoc, // Para el contador de logins, si lo reactivamos
  // increment,
  // getDoc,
} from "firebase/firestore";

const firebaseAuthInstance: Auth = firebaseAuthInstanceUntyped;

// --- Interfaces de Tipos ---
export interface GhibliFilm {
  id: string;
  title: string;
  image: string;
  movie_banner?: string;
  description?: string;
  director?: string;
  producer?: string;
  release_date?: string;
  rt_score?: string;
  original_title?: string;
  original_title_romanised?: string;
  people?: string[];
  species?: string[];
  locations?: string[];
  vehicles?: string[];
}
export interface GhibliPerson { id: string; name: string; gender?: string; age?: string; eye_color?: string; hair_color?: string; films: string[]; species: string; }
export interface GhibliLocation { id: string; name: string; climate?: string; terrain?: string; surface_water?: string; residents: string[]; films: string[]; }

interface GhibliContextType {
  userSession: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
  films: GhibliFilm[];
  loadingFilms: boolean;
  errorFilms: string | null;
  people: GhibliPerson[];
  loadingPeople: boolean;
  errorPeople: string | null;
  locations: GhibliLocation[];
  loadingLocations: boolean;
  errorLocations: string | null;
  // --- Para Favoritos ---
  favoritosFilmIds: string[];
  addFilmToFavoritos: (film: GhibliFilm) => Promise<void>;
  removeFilmFromFavoritos: (filmId: string) => Promise<void>;
  isFilmFavorito: (filmId: string) => boolean;
  loadingFavoritos: boolean;
}

export const GhibliContext = createContext<GhibliContextType | undefined>(undefined);

export const useAuth = (): GhibliContextType => {
  const context = useContext(GhibliContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un GhibliProvider');
  }
  return context;
};

export function GhibliProvider({ children }: { children: ReactNode }): ReactNode {
  const [films, setFilms] = useState<GhibliFilm[]>([]);
  const [loadingFilms, setLoadingFilms] = useState(true);
  const [errorFilms, setErrorFilms] = useState<string | null>(null);
  const [people, setPeople] = useState<GhibliPerson[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [errorPeople, setErrorPeople] = useState<string | null>(null);
  const [locations, setLocations] = useState<GhibliLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [errorLocations, setErrorLocations] = useState<string | null>(null);

  const [userSession, setUserSession] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const initialAuthCheckDone = useRef(false);
  const previousUserRef = useRef<User | null>(null);

  const [favoritosFilmIds, setFavoritosFilmIds] = useState<string[]>([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState<boolean>(true); // Inicia en true para la primera carga

  useEffect(() => {
    const fetchData = async (endpoint: string, setData: React.Dispatch<React.SetStateAction<any[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>, entityName: string) => {
      console.log(`GhibliContext: Iniciando fetch para ${entityName}`);
      setLoading(true); setError(null);
      try {
        const response = await fetch(`https://ghibliapi.vercel.app/${endpoint}`);
        if (!response.ok) throw new Error(`Error HTTP ${response.status} al obtener ${entityName}`);
        const data = await response.json(); setData(data);
        console.log(`GhibliContext: ${entityName} cargados: ${data.length}`);
      } catch (err: any) { console.error(`GhibliContext: Error fetching ${entityName}:`, err); setError(err.message); setData([]);
      } finally { setLoading(false); console.log(`GhibliContext: fetch para ${entityName} finalizado`);}
    };
    fetchData('films', setFilms, setLoadingFilms, setErrorFilms, 'Películas');
    fetchData('people', setPeople, setLoadingPeople, setErrorPeople, 'Personajes');
    fetchData('locations', setLocations, setLoadingLocations, setErrorLocations, 'Locaciones');
  }, []);

  useEffect(() => {
    if (!firebaseAuthInstance) { console.error("GhibliContext: Auth de Firebase no disponible."); setAuthLoading(false); initialAuthCheckDone.current = true; return; }
    console.log("GhibliContext: Suscribiendo a onAuthStateChanged");
    setAuthLoading(true); initialAuthCheckDone.current = false;

    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, async (user) => {
      console.log("GhibliContext: onAuthStateChanged - Usuario Firebase:", user ? user.email : null);
      setUserSession(user);
      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setAuthLoading(false);
        console.log("GhibliContext: Chequeo inicial de auth completado. authLoading:", false);
      }
    });
    return () => { console.log("GhibliContext: Desuscribiendo de onAuthStateChanged."); unsubscribe(); };
  }, []);

  // useEffect para Cargar Favoritos del Usuario Logueado
  useEffect(() => {
    if (userSession?.uid && db) {
      console.log("GhibliContext: Usuario logueado, cargando favoritos de Firestore para:", userSession.uid);
      setLoadingFavoritos(true);
      const userFavoritesColRef = collection(db, "profiles", userSession.uid, "favoriteFilms");

      const unsubscribeFavorites = getDocs(userFavoritesColRef) // getDocs no devuelve un unsubscriber directamente
        .then(snapshot => {
          const ids = snapshot.docs.map(doc => doc.id);
          setFavoritosFilmIds(ids);
          console.log("GhibliContext: Favoritos de Firestore cargados:", ids);
        })
        .catch(error => {
          console.error("GhibliContext: Error cargando favoritos de Firestore:", error);
          setFavoritosFilmIds([]);
        })
        .finally(() => {
          setLoadingFavoritos(false);
        });
      // Para escuchar cambios en tiempo real en favoritos, usarías onSnapshot en lugar de getDocs
      // y onSnapshot sí devuelve una función para desuscribir.
      // Por ahora, getDocs carga los favoritos una vez cuando cambia el usuario.
    } else {
      setFavoritosFilmIds([]);
      if (userSession?.uid && !db) {
        console.warn("GhibliContext: Firestore (db) no está disponible para cargar favoritos.");
      }
    }
  }, [userSession]);


  const addFilmToFavoritos = async (film: GhibliFilm) => {
    if (!userSession?.uid || !film?.id || !db) return;
    if (favoritosFilmIds.includes(film.id)) return;
    console.log("GhibliContext: Añadiendo película a favoritos en Firestore:", film.id);
    setLoadingFavoritos(true);
    try {
      const favFilmRef = doc(db, "profiles", userSession.uid, "favoriteFilms", film.id);
      await setDoc(favFilmRef, {
        title: film.title || "N/A", image: film.image || "", release_date: film.release_date || "N/A",
        added_at: serverTimestamp()
      });
      setFavoritosFilmIds(prevIds => [...new Set([...prevIds, film.id])]);
    } catch (error) { console.error("GhibliContext: Error al añadir película a favoritos en Firestore:", error);
    } finally { setLoadingFavoritos(false); }
  };

  const removeFilmFromFavoritos = async (filmId: string) => {
    if (!userSession?.uid || !filmId || !db) return;
    console.log("GhibliContext: Eliminando película de favoritos en Firestore:", filmId);
    setLoadingFavoritos(true);
    try {
      const favFilmRef = doc(db, "profiles", userSession.uid, "favoriteFilms", filmId);
      await deleteDoc(favFilmRef);
      setFavoritosFilmIds(prevIds => prevIds.filter(id => id !== filmId));
    } catch (error) { console.error("GhibliContext: Error al eliminar película de favoritos en Firestore:", error);
    } finally { setLoadingFavoritos(false); }
  };

  const isFilmFavorito = (filmId: string): boolean => {
    return favoritosFilmIds.includes(filmId);
  };

  const signOut = async () => {
    if (!firebaseAuthInstance) return; try { await firebaseSignOut(firebaseAuthInstance); }
    catch (error) { console.error("GhibliContext: Error al cerrar sesión:", error); }
  };

  const contextValue: GhibliContextType = {
    userSession, authLoading, signOut,
    films, loadingFilms, errorFilms,
    people, loadingPeople, errorPeople,
    locations, loadingLocations, errorLocations,
    favoritosFilmIds, addFilmToFavoritos, removeFilmFromFavoritos, isFilmFavorito, loadingFavoritos,
  };

  if (authLoading && !initialAuthCheckDone.current) { return null; }

  return (
    <GhibliContext.Provider value={contextValue}>
      {children}
    </GhibliContext.Provider>
  );
}