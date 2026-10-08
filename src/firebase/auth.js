/**
 * PaperVault auth layer. BACKEND_PLAN.md §2.
 *
 * REAL Firebase Google auth only — no mock mode. All functions share the
 * same return shapes as before so UI code is unchanged.
 */
import { auth, googleProvider, db } from "./config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function toPublicUser(fbUser) {
  return {
    uid: fbUser.uid,
    name: fbUser.displayName ?? "Unknown",
    email: fbUser.email ?? "",
    photo: fbUser.photoURL ?? null,
  };
}

/**
 * Sign in with Google (popup). Creates users/{uid} on first login (§2.2).
 * @returns {Promise<{uid:string,name:string,email:string,photo:string|null}>}
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(toPublicUser(result.user));
  return toPublicUser(result.user);
}

/** Sign out the current user. */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Ensure users/{uid} exists (creates it on first login per BACKEND_PLAN §2.2).
 * @param {{uid:string,name:string,email:string,photo:string|null}} user
 * @returns {Promise<Object>} the user document
 */
export async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.name ?? "",
      email: user.email ?? "",
      photo: user.photo ?? null,
      role: "user", // default — admin upgrades from console / admin panel
      uploadCount: 0,
      createdAt: serverTimestamp(),
    });
  }
  return (await getDoc(ref)).data();
}

/**
 * Get a user's role: "admin" | "moderator" | "user".
 * @param {string} uid
 */
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role ?? "user" : "user";
}

/**
 * Subscribe to auth-state changes. Returns an unsubscribe function.
 * @param {(user: Object|null) => void} cb
 */
export function onAuthChanged(cb) {
  return onAuthStateChanged(auth, (fbUser) =>
    cb(fbUser ? toPublicUser(fbUser) : null)
  );
}
