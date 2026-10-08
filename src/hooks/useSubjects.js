/**
 * PaperVault useSubjects hook.
 * // TODO: firebase — swap to real Firestore via firebase/db.js getSubjects().
 */
import { useEffect, useState } from "react";
import { getSubjects } from "../firebase/db.js";

/** @returns {{ data: Array, loading: boolean, error: Error|null }} */
export function useSubjects() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSubjects()
      .then((rows) => {
        if (!cancelled) {
          setData(rows);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
