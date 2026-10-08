/**
 * PaperVault Firebase connection.
 *
 * Connected to project "papervault-a2179" (asia-south1).
 * Config comes from `.env` (VITE_FIREBASE_*). FIREBASE_CONNECTED is true
 * when real keys are present — the app runs on live Firestore only.
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True only when real config is present in `.env`. */
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
