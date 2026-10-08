/**
 * uploadsStore.js — mock-only upload history store for Worker B (Upload).
 *
 * Mirrors BACKEND_PLAN.md §3.6 `uploads` interface; persists to localStorage
 * so /upload → /my-uploads works in the mock build without Firebase.
 *
 * // TODO: firebase — replace loadUploads()/saveUpload() with Firestore:
 *   query(uploads, where("userId","==",uid), orderBy("createdAt","desc"))
 */

const KEY = "papervault:uploads:v1";
const REUPLOAD_KEY = "papervault:reupload:draft";

function uid() {
  return (
    "upl-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)
  );
}

/** Demo seed records — one of each status so My Uploads shows real states. */
function seeds() {
  return [
    {
      id: "upl-seed-pending",
      userId: "mock-user",
      fileName: "CSE3002_FAT_2025_F1.pdf",
      subjectId: "subj-ai",
      subjectCode: "CSE3002",
      examType: "FAT",
      year: 2025,
      slot: "F1",
      faculty: "",
      status: "pending",
      reason: null,
      duplicateOf: null,
      fileSize: 842_112,
      createdAt: new Date("2026-10-06T14:32:00+05:30").toISOString(),
    },
    {
      id: "upl-seed-approved",
      userId: "mock-user",
      paperId: "paper-007",
      fileName: "MAT1001_CAT-1_2026_B2.pdf",
      subjectId: "subj-math",
      subjectCode: "MAT1001",
      examType: "CAT-1",
      year: 2026,
      slot: "B2",
      faculty: "Dr. Meena Iyer",
      status: "approved",
      reason: null,
      duplicateOf: null,
      fileSize: 611_840,
      createdAt: new Date("2026-09-28T11:05:00+05:30").toISOString(),
    },
    {
      id: "upl-seed-rejected",
      userId: "mock-user",
      fileName: "CSE2001_CAT-2_2024_C1.pdf",
      subjectId: "subj-dsa",
      subjectCode: "CSE2001",
      examType: "CAT-2",
      year: 2024,
      slot: "C1",
      faculty: "",
      status: "rejected",
      reason: "Duplicate of CSE2001 CAT-1 2023 (A1) — same questions, same order.",
      duplicateOf: "paper-001",
      fileSize: 923_648,
      createdAt: new Date("2026-09-20T18:47:00+05:30").toISOString(),
    },
  ];
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // storage unavailable — fall through to seeds
  }
  const s = seeds();
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
  return s;
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore (private mode etc.)
  }
}

/** All uploads for the current user, newest first. */
export function loadUploads() {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Add a new upload record (mock save). Returns the record. */
export function saveUpload(record) {
  const list = read();
  const full = { id: uid(), createdAt: new Date().toISOString(), ...record };
  list.unshift(full);
  write(list);
  return full;
}

/** Get one upload by id. */
export function getUpload(id) {
  return read().find((u) => u.id === id) || null;
}

/**
 * Stash a rejected upload as a re-upload draft (subject/exam/year/slot/faculty
 * pre-filled on /upload). Returns true if stashed.
 */
export function stashReuploadDraft(uploadId) {
  const u = getUpload(uploadId);
  if (!u) return false;
  try {
    sessionStorage.setItem(
      REUPLOAD_KEY,
      JSON.stringify({
        subjectId: u.subjectId,
        code: u.subjectCode,
        examType: u.examType,
        year: u.year,
        slot: u.slot,
        faculty: u.faculty || "",
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
