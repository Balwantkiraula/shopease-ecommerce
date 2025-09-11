// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Prefer env vars (Vite) with a fallback to existing keys so the app runs
const envConfig = {
  apiKey: import.meta?.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta?.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta?.env?.VITE_FIREBASE_APP_ID,
};

const hardcodedConfig = {
  apiKey: "AIzaSyDYxwhjcZMorYB1Z5IgCq0ePN4My89l4h8",
  authDomain: "ecommerce-afcd3.firebaseapp.com",
  projectId: "ecommerce-afcd3",
  storageBucket: "ecommerce-afcd3.firebasestorage.app",
  messagingSenderId: "222244145863",
  appId: "1:222244145863:web:c99dce0393af094555cce2",
};

const hasAllEnv = [
  envConfig.apiKey,
  envConfig.authDomain,
  envConfig.projectId,
  envConfig.storageBucket,
  envConfig.messagingSenderId,
  envConfig.appId,
].every(Boolean);

const firebaseConfig = hasAllEnv ? envConfig : hardcodedConfig;

export const isFirebaseConfigured = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(Boolean);

// Initialize Firebase (avoid re-initialization in HMR)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth instance (null if not configured)
export const auth = isFirebaseConfigured ? getAuth(app) : null;

export default app;