/**
 * PaperVault auth layer. BACKEND_PLAN.md §2.
 *
 * Two modes:
 *  - Real: Firebase Google popup auth (when FIREBASE_CONNECTED).
 *  - Mock: local dev store so the UI works with zero config.
 *          Toggle sign-in/out from the UI; persisted in localStorage.
 *
 * Both modes share the same return shapes so UI code never branches.
 */
import { auth, googleProvider, db, FIREBASE_CONNECTED } from "./config.js";
import { users as MOCK_USERS } from "../mock/index.js";

const MOCK_STORAGE_KEY = "papervault_mock_user";

// ---- mock-mode store ------------------------------------------------------
let mockUser = null;
try {
  mockUser = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY));
} catch {
  mockUser = null;
}
const mockListeners = new Set();

function notifyMockListeners(user) {
  mockListeners.forEach((cb) => cb(user));
}

function toPublicUser(firebaseUser, mockDoc) {
  return {
    uid: firebaseUser?.uid ?? mockDoc?.uid,
    name:
      firebaseUser?.displayName ?? mockDoc?.name ?? mockUser?.name ?? "Unknown",
    email: firebaseUser?.email ?? mockDoc?.email ?? mockUser?.email ?? "",
    photo: firebaseUser?.photoURL ?? mockDoc?.photo ?? null,
  };
}

// ---- real firebase helpers (only called when connected) -------------------
// TODO: firebase — these are the live implementations; the mock branch
// below is used until FIREBASE_CONNECTED is true.
async function realSignIn() {
  const { signInWithPopup } = await import("firebase/auth");
  const result = await signInWithPopup(auth, googleProvider);
  await realEnsureUserDoc(result.user);
  return toPublicUser(result.user);
}

async function realSignOut() {
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

async function realEnsureUserDoc(fbUser) {
  // TODO: firebase — BACKEND_PLAN §2.2: create users/{uid} on first login.
  const { doc, getDoc, setDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: fbUser.uid,
      name: fbUser.displayName ?? "",
      email: fbUser.email ?? "",
      photo: fbUser.photoURL ?? null,
      role: "user", // default — admin upgrades from console / admin panel
      uploadCount: 0,
      createdAt: serverTimestamp(),
    });
  }
  return (await getDoc(ref)).data();
}

async function realGetUserRole(uid) {
  // TODO: firebase — BACKEND_PLAN §2.3.
  const { doc, getDoc } = await import("firebase/firestore");
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().role ?? "user" : "user";
}

/**
 * Sign in with Google (popup).
 * @returns {Promise<{uid:string,name:string,email:string,photo:string|null}>}
 */
export async function signInWithGoogle() {
  if (FIREBASE_CONNECTED) return realSignIn();

  // MOCK: sign in as the default mock student. Devs can switch users with
  // signInAsMock(uid) for role testing (see below).
  return signInAsMock("user-mock-1");
}

/**
 * Mock-only: sign in as a specific mock user (role testing).
 * @param {string} uid — one of the keys in mock/index.js `users`
 */
export async function signInAsMock(uid) {
  const doc = MOCK_USERS[uid];
  if (!doc) throw new Error(`Unknown mock user: ${uid}`);
  mockUser = {
    uid: doc.uid,
    name: doc.name,
    email: doc.email,
    photo: doc.photo,
  };
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
  } catch {
    /* storage unavailable — in-memory only */
  }
  notifyMockListeners(mockUser);
  return mockUser;
}

/** Sign out the current user. */
export async function signOutUser() {
  if (FIREBASE_CONNECTED) return realSignOut();
  mockUser = null;
  try {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  notifyMockListeners(null);
}

/**
 * Ensure users/{uid} exists (creates it on first login per BACKEND_PLAN §2.2).
 * @param {{uid:string,name:string,email:string,photo:string|null}} user
 * @returns {Promise<Object>} the user document
 */
export async function ensureUserDoc(user) {
  if (FIREBASE_CONNECTED) {
    return realEnsureUserDoc({ uid: user.uid, ...user });
  }
  // MOCK: upsert into the in-memory mock users map.
  if (!MOCK_USERS[user.uid]) {
    MOCK_USERS[user.uid] = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      photo: user.photo,
      role: "user",
      uploadCount: 0,
      createdAt: new Date().toISOString(),
    };
  }
  return MOCK_USERS[user.uid];
}

/**
 * Get a user's role: "admin" | "moderator" | "user".
 * @param {string} uid
 */
export async function getUserRole(uid) {
  if (FIREBASE_CONNECTED) return realGetUserRole(uid);
  // MOCK
  return MOCK_USERS[uid]?.role ?? "user";
}

/**
 * Subscribe to auth-state changes. Returns an unsubscribe function.
 * @param {(user: Object|null) => void} cb
 */
export function onAuthChanged(cb) {
  if (FIREBASE_CONNECTED) {
    // TODO: firebase — live listener once config exists.
    return import("firebase/auth").then(({ onAuthStateChanged }) =>
      onAuthStateChanged(auth, async (fbUser) => {
        cb(fbUser ? toPublicUser(fbUser) : null);
      })
    );
  }
  // MOCK: fire immediately, then on every mock sign-in/out.
  mockListeners.add(cb);
  setTimeout(() => cb(mockUser), 0);
  return () => mockListeners.delete(cb);
}
