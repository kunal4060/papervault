/**
 * reuploadDraft.js — sessionStorage draft for the MyUploads → Upload
 * "Re-upload" flow. Holds a rejected upload's form values so /upload can
 * pre-fill them. Session-scoped (dies with the tab); no mock data.
 */

const REUPLOAD_KEY = "papervault:reupload:draft";

/**
 * Stash a rejected upload's form values for pre-fill on /upload.
 * @param {Object} upload — Firestore upload doc
 * @returns {boolean} true if stashed
 */
export function stashReuploadDraft(upload) {
  if (!upload) return false;
  try {
    sessionStorage.setItem(
      REUPLOAD_KEY,
      JSON.stringify({
        subjectId: upload.subjectId,
        code: upload.subjectCode,
        examType: upload.examType,
        year: upload.year,
        slot: upload.slot,
        faculty: upload.faculty || "",
      })
    );
    return true;
  } catch {
    return false;
  }
}

/** Read + clear the re-upload draft (consumed once by Upload.jsx). */
export function consumeReuploadDraft() {
  try {
    const raw = sessionStorage.getItem(REUPLOAD_KEY);
    sessionStorage.removeItem(REUPLOAD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
