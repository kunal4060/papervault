/**
 * PaperVault useAuth hook.
 * { user, role, loading, signIn, signOut } — mock-backed, toggleable.
 *
 * // TODO: firebase — logic lives in firebase/auth.js already; this hook
 * just consumes it. When real Firebase is connected, nothing here changes.
 */
import { useCallback, useEffect, useState } from "react";
import {
  onAuthChanged,
  signInWithGoogle,
  signOutUser,
  getUserRole,
} from "../firebase/auth.js";

/**
 * @returns {{ user: Object|null, role: string, loading: boolean,
 *            signIn: () => Promise<void>, signOut: () => Promise<void> }}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthChanged(async (u) => {
      setUser(u);
      setRole(u ? await getUserRole(u.uid) : "user");
      setLoading(false);
    });
    // mock mode: onAuthChanged returns an unsubscribe function directly;
    // real mode returns a Promise of one.
    return () => {
      if (typeof unsub === "function") unsub();
      else if (unsub && typeof unsub.then === "function")
        unsub.then((fn) => fn && fn());
    };
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setAuthError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOutUser();
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, role, loading, signIn, signOut, authError };
}
