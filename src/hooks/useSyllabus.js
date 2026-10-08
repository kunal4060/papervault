/**
 * PaperVault useSyllabus hook — syllabus + notes for one subject.
 * // TODO: firebase — getSyllabus() / getNotes() in firebase/db.js have the
 * real queries; this hook just consumes them.
 */
import { useEffect, useState } from "react";
import { getSyllabus, getNotes } from "../firebase/db.js";

/**
 * @param {string|null} subjectId
 * @returns {{ syllabus: Object|null, notes: Array, loading: boolean, error: Error|null }}
 */
export function useSyllabus(subjectId) {
  const [syllabus, setSyllabus] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subjectId) {
      setSyllabus(null);
      setNotes([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getSyllabus(subjectId), getNotes(subjectId)])
      .then(([syl, nts]) => {
        if (!cancelled) {
          setSyllabus(syl);
          setNotes(nts);
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
  }, [subjectId]);

  return { syllabus, notes, loading, error };
}
