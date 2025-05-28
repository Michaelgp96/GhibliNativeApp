// src/firebase/firebaseConfig.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth, // Incluimos getAuth para flexibilidad
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

// ⬇️ !!! REEMPLAZA ESTO CON TU CONFIGURACIÓN DE FIREBASE !!! ⬇️
const firebaseConfig = {
  apiKey: "AIzaSyDVqk1SC7Z5RBzS4Ej-M9T_uzO47ed1gTc",
  authDomain: "ghiblinativeapp.firebaseapp.com",
  projectId: "ghiblinativeapp",
  storageBucket: "ghiblinativeapp.firebasestorage.app",
  messagingSenderId: "541974820669",
  appId: "1:541974820669:web:43d6fe7bbf5ba74731b754",
  measurementId: "G-HZYHXSE3G2"
};

let app;
let authInstance;
let db;

// Inicializa Firebase de forma segura para evitar reinicializaciones en HMR
if (!getApps().length) {
  try {
    console.log("firebaseConfig.js: Inicializando Firebase por primera vez...");
    app = initializeApp(firebaseConfig);
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
    db = getFirestore(app);
    console.log("firebaseConfig.js: Firebase inicializado exitosamente.");
  } catch (e) {
    console.error("firebaseConfig.js: Error CRÍTICO inicializando Firebase por primera vez:", e);
    // Si la inicialización principal falla, intentamos una básica
    if (!app && firebaseConfig) { // Si app no se creó
        try { app = initializeApp(firebaseConfig); } catch (initError) { console.error("Fallback initializeApp error:", initError); }
    }
    if (app && !authInstance) { // Si auth no se creó
        try { authInstance = getAuth(app); console.warn("Auth inicializado con getAuth() básico tras error."); } catch (authError) { console.error("Fallback getAuth error:", authError); }
    }
    if (app && !db) { // Si db no se creó
        try { db = getFirestore(app); } catch (dbError) { console.error("Fallback getFirestore error:", dbError); }
    }
  }
} else {
  app = getApp(); // Obtener la instancia existente
  console.log("firebaseConfig.js: App de Firebase ya inicializada. Obteniendo/asegurando servicios.");
  try {
    // Es importante asegurar que la persistencia se aplique.
    // initializeAuth se puede llamar en una app existente para configurar o reconfigurar.
    authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (e) {
      console.warn("firebaseConfig.js: Error re-inicializando auth con persistencia, usando getAuth():", e.message);
      authInstance = getAuth(app); // Fallback
  }
  db = getFirestore(app);
}

// Exportar las instancias de servicio con nombres consistentes
// Si authInstance o db no se pudieron inicializar (lo cual sería un problema mayor),
// exportarán 'undefined'. Los componentes consumidores deberán manejar esto.
export { authInstance as auth, db, app };