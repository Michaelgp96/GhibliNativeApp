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
  updateDoc, // <--- ASEGÚRATE DE IMPORTAR ESTO
  increment, // <--- ASEGÚRATE DE IMPORTAR ESTO
  getDoc     // <--- ASEGÚRATE DE IMPORTAR ESTO (para el fallback en incrementSignInCount)
} from "firebase/firestore";

const firebaseAuthInstance: Auth = firebaseAuthInstanceUntyped;

// --- Interfaces de Tipos ---
export interface GhibliFilm { /* ... (tu definición) ... */
  id: string; title: string; image: string; movie_banner?: string; description?: string; director?: string; producer?: string; release_date?: string; rt_score?: string; original_title?: string; original_title_romanised?: string; people?: string[]; species?: string[]; locations?: string[]; vehicles?: string[];
}
export interface GhibliPerson { /* ... (tu definición) ... */
  id: string; name: string; gender?: string; age?: string; eye_color?: string; hair_color?: string; films: string[]; species: string;
}
export interface GhibliLocation { /* ... (tu definición) ... */
  id: string; name: string; climate?: string; terrain?: string; surface_water?: string; residents: string[]; films: string[];
}

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

// --- FUNCIÓN PARA INCREMENTAR EL CONTADOR DE INICIOS DE SESIÓN ---
const incrementSignInCount = async (userId: string) => {
  if (!userId || !db) { // Verificar también que db esté disponible
    console.log("GhibliContext/incrementSignInCount: No userId o instancia de DB proporcionada.");
    return;
  }
  console.log(`GhibliContext/incrementSignInCount: Intentando incrementar para userID: ${userId}`);
  const profileRef = doc(db, "profiles", userId);

  try {
    const profileSnap = await getDoc(profileRef);
    console.log(`GhibliContext/incrementSignInCount: profileSnap.exists() para ${userId}:`, profileSnap.exists());

    if (profileSnap.exists()) {
      await updateDoc(profileRef, {
        sign_in_count: increment(1),
        last_sign_in_at: serverTimestamp()
      });
      console.log("GhibliContext/incrementSignInCount: sign_in_count actualizado para:", userId);
    } else {
      console.warn("GhibliContext/incrementSignInCount: Perfil no encontrado para UID:", userId, ". Creando/estableciendo perfil con sign_in_count = 1.");
      // Esto es un fallback. Idealmente, el perfil se crea en el registro.
      // Se necesita el email del usuario para crear un perfil completo aquí.
      // Si firebaseAuthInstance.currentUser está disponible y es el usuario correcto:
      const currentUserEmail = firebaseAuthInstance.currentUser?.email;
      await setDoc(profileRef, {
        email: currentUserEmail || 'No disponible', // Añadir el email si es posible
        sign_in_count: 1,
        created_at: serverTimestamp(), // Solo si realmente estás creando el perfil aquí
        last_sign_in_at: serverTimestamp()
      }, { merge: true }); // merge:true es crucial si el documento podría existir parcialmente
    }
  } catch (error: any) {
    console.error("GhibliContext/incrementSignInCount: Error al actualizar/establecer sign_in_count:", error.message, error);
  }
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
  const [loadingFavoritos, setLoadingFavoritos] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (endpoint: string, setData: React.Dispatch<React.SetStateAction<any[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>, entityName: string) => {
      setLoading(true); setError(null);
      try {
        const response = await fetch(`https://ghibliapi.vercel.app/${endpoint}`);
        if (!response.ok) throw new Error(`Error HTTP ${response.status} al obtener ${entityName}`);
        const data = await response.json(); setData(data);
      } catch (err: any) { console.error(`GhibliContext: Error fetching ${entityName}:`, err); setError(err.message); setData([]);
      } finally { setLoading(false); }
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
      const previousUser = previousUserRef.current;
      console.log("GhibliContext: onAuthStateChanged - User:", user?.email, "PreviousUser:", previousUser?.email);
      setUserSession(user); // Actualiza la sesión primero

      if (user && (!previousUser || previousUser.uid !== user.uid)) {
        // Esto indica un nuevo usuario logueado (o el primer detectado en esta sesión del listener)
        // O un cambio de usuario
        console.log("GhibliContext: Nuevo inicio de sesión o cambio de usuario detectado. Llamando a incrementSignInCount para:", user.uid);
        await incrementSignInCount(user.uid); // <--- LLAMADA A LA FUNCIÓN
      }
      previousUserRef.current = user; // Actualizar el usuario previo para la siguiente vez

      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setAuthLoading(false);
        console.log("GhibliContext: Chequeo inicial de auth completado. authLoading:", false);
      }
    });
    return () => { console.log("GhibliContext: Desuscribiendo de onAuthStateChanged."); unsubscribe(); };
  }, []);

  useEffect(() => { /* ... Cargar Favoritos (sin cambios) ... */
    if (userSession?.uid && db) { setLoadingFavoritos(true); const userFavoritesColRef = collection(db, "profiles", userSession.uid, "favoriteFilms"); getDocs(userFavoritesColRef) .then(snapshot => { setFavoritosFilmIds(snapshot.docs.map(doc => doc.id)); }) .catch(error => { console.error("GhibliContext: Error cargando favoritos:", error); setFavoritosFilmIds([]); }) .finally(() => { setLoadingFavoritos(false); }); } else { setFavoritosFilmIds([]); if (userSession?.uid && !db) { console.warn("GhibliContext: Firestore (db) no está disponible."); }}
  }, [userSession]);

  const addFilmToFavoritos = async (film: GhibliFilm) => { /* ... (sin cambios) ... */
    if (!userSession?.uid || !film?.id || !db) return; if (favoritosFilmIds.includes(film.id)) return; setLoadingFavoritos(true); try { const favFilmRef = doc(db, "profiles", userSession.uid, "favoriteFilms", film.id); await setDoc(favFilmRef, { title: film.title || "N/A", image: film.image || "", release_date: film.release_date || "N/A", added_at: serverTimestamp() }); setFavoritosFilmIds(prevIds => [...new Set([...prevIds, film.id])]); } catch (error) { console.error("GhibliContext: Error al añadir película a favoritos:", error); } finally { setLoadingFavoritos(false); }
  };
  const removeFilmFromFavoritos = async (filmId: string) => { /* ... (sin cambios) ... */
    if (!userSession?.uid || !filmId || !db) return; setLoadingFavoritos(true); try { const favFilmRef = doc(db, "profiles", userSession.uid, "favoriteFilms", filmId); await deleteDoc(favFilmRef); setFavoritosFilmIds(prevIds => prevIds.filter(id => id !== filmId)); } catch (error) { console.error("GhibliContext: Error al eliminar película de favoritos:", error); } finally { setLoadingFavoritos(false); }
  };
  const isFilmFavorito = (filmId: string): boolean => { return favoritosFilmIds.includes(filmId); };
  const signOut = async () => { /* ... (sin cambios) ... */
    if (!firebaseAuthInstance) return; try { await firebaseSignOut(firebaseAuthInstance); } catch (error) { console.error("GhibliContext: Error al cerrar sesión:", error); }
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