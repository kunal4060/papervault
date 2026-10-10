/**
 * PaperVault — Admin auth (Firebase-backed).
 *
 * Admin = a Google-signed-in user whose `users/{uid}.role === "admin"`
 * in Firestore. This gives the admin session REAL Firebase credentials,
 * so Firestore security rules (isAdmin()) grant write access.
 *
 * Bootstrap (one-time, by Tim in Firebase console):
 *   1. Sign in to the site with Google once (any page).
 *   2. Firebase console → Firestore → `users` collection → your uid doc.
 *   3. Set field `role` = "admin".
 *   4. Now /admin works with full permissions.
 */
import { useCallback, useEffect, useState } from "react";
import {
  onAuthChanged,
  signInWithGoogle,
  signOutUser,
  getUserRole,
} from "../../firebase/auth.js";

/**
 * @returns {{ user, isAdmin, loading, error, signIn, signOut }}
 *   error is "not-admin" when signed in but role !== "admin",
 *   otherwise an Error object from sign-in / role fetch.
 */
export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthChanged(async (u) => {
      if (cancelled) return;
      setUser(u);
      if (u) {
        try {
          const role = await getUserRole(u.uid);
          if (cancelled) return;
          if (role === "admin") {
            setIsAdmin(true);
            setError(null);
          } else {
            setIsAdmin(false);
            setError("not-admin");
          }
        } catch (e) {
          if (cancelled) return;
          setIsAdmin(false);
          setError(e);
        }
      } else {
        setIsAdmin(false);
        setError(null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
      if (typeof unsub === "function") unsub();
      else if (unsub && typeof unsub.then === "function")
        unsub.then((fn) => fn && fn());
    };
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      // User closed the popup — not an error worth showing.
      if (e?.code !== "auth/popup-closed-by-user") setError(e);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } finally {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  return { user, isAdmin, loading, error, signIn, signOut };
}

/* Back-compat stubs — the old mock API. Kept so stale imports don't crash;
 * the admin gate no longer uses them. */
export function isAdminLoggedIn() {
  return false;
}
export function adminLogin() {
  return false;
}
export function adminLogout() {}
