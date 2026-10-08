/**
 * PaperVault usePapers hook — papers for one subject (+ optional filters).
 * // TODO: firebase — firebase/db.js getPapers() already has the real query.
 */
import { useEffect, useState } from "react";
import { getPapers } from "../firebase/db.js";

/**
 * @param {string|null} subjectId
 * @param {{year?:number, examType?:string, slot?:string}} [filters]
 * @returns {{ data: Array, loading: boolean, error: Error|null }}
 */
export function usePapers(subjectId, filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    if (!subjectId) {
      setData([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPapers(subjectId, JSON.parse(filterKey))
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, filterKey]);

  return { data, loading, error };
}
