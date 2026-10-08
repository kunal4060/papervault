// TODO: firebase — add real keys to .env
//
// PaperVault Firebase connection file. When Tim creates the Firebase
// project and drops the web-app config into `.env`, flip FIREBASE_CONNECTED
// to true (it is derived automatically from the env vars below).
//
// Steps (one-time, Firebase console):
//   console.firebase.google.com → Add project "papervault" →
//   Auth: enable Google sign-in → Firestore: create database (asia-south1) →
//   Storage: get started (asia-south1) → Project settings → Add web app →
//   copy the config values into .env (see .env.example in repo root).

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

let app = null;
if (FIREBASE_CONNECTED) {
  // TODO: firebase — real init. This path runs only with real .env keys.
  app = initializeApp(firebaseConfig);
}

/** Firebase Auth instance (null in mock mode). */
export const auth = app ? getAuth(app) : null;
/** Google sign-in provider (null in mock mode). */
export const googleProvider = app ? new GoogleAuthProvider() : null;
/** Firestore instance (null in mock mode). */
export const db = app ? getFirestore(app) : null;
/** Firebase Storage instance (null in mock mode). */
export const storage = app ? getStorage(app) : null;
