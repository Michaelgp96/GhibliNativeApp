// src/firebase/firebaseConfig.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

// REEMPLAZA ESTO CON EL OBJETO firebaseConfig QUE COPIASTE DE TU CONSOLA DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDVqk1SC7Z5RBzS4Ej-M9T_uzO47ed1gTc",
  authDomain: "ghiblinativeapp.firebaseapp.com",
  projectId: "ghiblinativeapp",
  storageBucket: "ghiblinativeapp.firebasestorage.app",
  messagingSenderId: "541974820669",
  appId: "1:541974820669:web:43d6fe7bbf5ba74731b754",
  measurementId: "G-HZYHXSE3G2"
};

// Inicializar Firebase de forma segura para evitar reinicializaciones (común en React Native con HMR)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Si ya está inicializada, obtén la instancia existente
}

// Inicializar Auth con persistencia para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Inicializar Firestore
const db = getFirestore(app);

export { auth, db, app }; // Exporta también 'app' por si la necesitas directamente en algún otro lugar