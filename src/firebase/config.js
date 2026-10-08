/**
 * PaperVault Firebase connection.
 *
 * Connected to project "papervault-a2179" (asia-south1).
 * The Firebase WEB config is PUBLIC by design (Google docs) — safe to ship
 * in client code. Env vars override when present (local dev).
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyALYbrMfJnIudaBuqIGGkrN5oGhbKtj9_Q",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "papervault-a2179.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "papervault-a2179",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "papervault-a2179.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_SENDER_ID || "949347290161",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:949347290161:web:8404160dcbb9239f6a9910",
};

/** Always true — app runs on live Firestore only (no mock fallback). */
export const FIREBASE_CONNECTED = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

const app = initializeApp(firebaseConfig);

/** Firebase Auth instance. */
export const auth = getAuth(app);
/** Google sign-in provider. */
export const googleProvider = new GoogleAuthProvider();
/** Firestore instance. */
export const db = getFirestore(app);
/** Firebase Storage instance. */
export const storage = getStorage(app);
