// src/Contexto/GhibliContext.tsx
import React, { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { auth as authFromConfig, db } from '../firebase/firebaseConfig'; // authFromConfig para evitar colisión con tipo Auth
import { User, onAuthStateChanged, signOut as firebaseSignOut, Auth } from 'firebase/auth'; // Importar tipo Auth

// Tipar explícitamente la instancia de auth importada
const firebaseAuthInstance: Auth = authFromConfig;

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

export interface GhibliPerson {
  id: string;
  name: string;
  gender?: string;
  age?: string;
  eye_color?: string;
  hair_color?: string;
  films: string[];
  species: string; // URL
}

export interface GhibliLocation {
  id: string;
  name: string;
  climate?: string;
  terrain?: string;
  surface_water?: string;
  residents: string[]; // URLs
  films: string[]; // URLs
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

  useEffect(() => {
    const fetchData = async (endpoint: string, setData: Function, setLoading: Function, setError: Function, entityName: string) => {
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
    if (!firebaseAuthInstance) {
      console.error("GhibliContext: Instancia de Auth de Firebase no disponible.");
      setAuthLoading(false);
      initialAuthCheckDone.current = true;
      return;
    }
    setAuthLoading(true); initialAuthCheckDone.current = false;
    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, async (user) => {
      setUserSession(user);
      if (user && (!previousUserRef.current || previousUserRef.current.uid !== user.uid)) {
        // Lógica para incrementSignInCount (se implementará con Firestore)
      }
      previousUserRef.current = user;
      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!firebaseAuthInstance) return;
    try {
      await firebaseSignOut(firebaseAuthInstance);
    } catch (error) { console.error("GhibliContext: Error al cerrar sesión:", error); }
  };

  const contextValue: GhibliContextType = {
    userSession, authLoading, signOut,
    films, loadingFilms, errorFilms,
    people, loadingPeople, errorPeople,
    locations, loadingLocations, errorLocations,
  };

  if (authLoading && !initialAuthCheckDone.current) {
    return null;
  }
  return (
    <GhibliContext.Provider value={contextValue}>
      {children}
    </GhibliContext.Provider>
  );
}