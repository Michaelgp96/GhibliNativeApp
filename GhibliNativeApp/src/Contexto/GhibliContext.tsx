// src/Contexto/GhibliContext.tsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { auth, db } from '../firebase/firebaseConfig'; // Correcta importación
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
// Importaciones de Firestore (las usaremos más adelante para perfiles y favoritos basados en DB)
// import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, writeBatch } from "firebase/firestore";

// --- TIPOS (Opcional pero bueno para TypeScript) ---
export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  sign_in_count?: number;
  created_at?: string;
  // ... otros campos que quieras
}

interface GhibliFilm {
  id: string;
  title: string;
  image: string;
  movie_banner: string;
  description: string;
  director: string;
  producer: string;
  release_date: string;
  rt_score: string;
  original_title?: string;
  original_title_romanised?: string;
  people?: string[]; // URLs
  species?: string[]; // URLs
  locations?: string[]; // URLs
  vehicles?: string[]; // URLs
  // ... otros campos de la API de Ghibli
}

interface GhibliPerson {
  id: string;
  name: string;
  gender?: string;
  age?: string;
  eye_color?: string;
  hair_color?: string;
  films: string[]; // URLs
  species: string; // URL
  // ... otros campos
}

interface GhibliLocation {
    id: string;
    name: string;
    climate?: string;
    terrain?: string;
    surface_water?: string;
    residents: string[]; // URLs
    films: string[]; // URLs
    // ... otros campos
}


interface GhibliContextType {
  userSession: any | null; // Debería ser User de Firebase, pero 'any' para simplificar ahora
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
  // ... (estados y funciones para favoritos y otros endpoints cuando los añadamos)
}

export const GhibliContext = createContext<GhibliContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(GhibliContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a GhibliProvider');
  }
  return context;
};

// const FAVORITOS_FILMS_KEY = 'ghibliNativeAppFavoritosFilms'; // Para AsyncStorage si los favoritos son locales

export function GhibliProvider({ children }: { children: React.ReactNode }) {
  const [films, setFilms] = useState<GhibliFilm[]>([]);
  const [loadingFilms, setLoadingFilms] = useState(true);
  const [errorFilms, setErrorFilms] = useState<string | null>(null);

  const [people, setPeople] = useState<GhibliPerson[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [errorPeople, setErrorPeople] = useState<string | null>(null);

  const [locations, setLocations] = useState<GhibliLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [errorLocations, setErrorLocations] = useState<string | null>(null);

  // const [favoritosFilms, setFavoritosFilms] = useState<GhibliFilm[]>([]); // Lo haremos con Firestore

  const [userSession, setUserSession] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const initialAuthCheckDone = useRef(false);


  // Cargar datos de la API de Ghibli
  useEffect(() => {
    const fetchData = async (endpoint: string, setData: Function, setLoading: Function, setError: Function, entityName: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://ghibliapi.vercel.app/${endpoint}`);
        if (!response.ok) throw new Error(`Error HTTP ${response.status} - ${entityName}`);
        const data = await response.json();
        setData(data);
      } catch (err: any) {
        console.error(`Error fetching ${entityName}:`, err);
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData('films', setFilms, setLoadingFilms, setErrorFilms, 'Películas');
    fetchData('people', setPeople, setLoadingPeople, setErrorPeople, 'Personajes');
    fetchData('locations', setLocations, setLoadingLocations, setErrorLocations, 'Locaciones');
    // fetchData('species', setSpecies, setLoadingSpecies, setErrorSpecies, 'Especies');
    // fetchData('vehicles', setVehicles, setLoadingVehicles, setErrorVehicles, 'Vehículos');
  }, []);

  // Manejar autenticación de Firebase
  useEffect(() => {
    setAuthLoading(true);
    initialAuthCheckDone.current = false;
    console.log("GhibliContext: Suscribiendo a onAuthStateChanged");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("GhibliContext: onAuthStateChanged - Usuario:", user ? user.email : null);
      setUserSession(user);

      if (user && !initialAuthCheckDone.current) {
        // Lógica para incrementar contador de login (la definiremos cuando tengamos perfiles en Firestore)
        // console.log("GhibliContext: Usuario inicial detectado / Logueado por primera vez en esta sesión.");
        // await incrementSignInCount(user.uid); // Esta función interactuará con Firestore
      }
      
      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setAuthLoading(false);
        console.log("GhibliContext: Chequeo inicial de autenticación completado. authLoading:", false);
      }
    });

    return () => {
      console.log("GhibliContext: Desuscribiendo de onAuthStateChanged.");
      unsubscribe();
    };
  }, []);


  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // setUserSession(null) será llamado por el listener onAuthStateChanged
      console.log("GhibliContext: Cierre de sesión exitoso.");
    } catch (error) {
      console.error("GhibliContext: Error al cerrar sesión:", error);
    }
  };

  const contextValue: GhibliContextType = {
    userSession,
    authLoading,
    signOut,
    films, loadingFilms, errorFilms,
    people, loadingPeople, errorPeople,
    locations, loadingLocations, errorLocations,
  };

  if (authLoading) {
     // Podrías retornar un SplashScreen global aquí si prefieres
     // Para este ejemplo, dejamos que el layout raíz maneje su propio loader.
     console.log("GhibliContext: authLoading es true, el proveedor aún no está listo para renderizar children completamente.");
  }

  return (
    <GhibliContext.Provider value={contextValue}>
      {children}
    </GhibliContext.Provider>
  );
}