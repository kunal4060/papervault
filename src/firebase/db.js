/**
 * PaperVault Firestore data layer. Shapes mirror BACKEND_PLAN.md §3.
 *
 * Everything is currently backed by mock data (src/mock/index.js) so the
 * app runs with zero config. Each function carries a `// TODO: firebase`
 * marker showing the exact Firestore query to swap in.
 */
import { db, FIREBASE_CONNECTED } from "./config.js";
import {
  subjects as MOCK_SUBJECTS,
  syllabus as MOCK_SYLLABUS,
  papers as MOCK_PAPERS,
  notes as MOCK_NOTES,
  uploads as MOCK_UPLOADS,
  requests as MOCK_REQUESTS,
} from "../mock/index.js";

/** Simulated network latency for mock mode (ms). */
const MOCK_DELAY = 250;
const delay = (ms = MOCK_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * All active subjects, ordered by primary code.
 * TODO: firebase — query(subjects, where("active","==",true), orderBy("code"))
 */
export async function getSubjects() {
  if (!FIREBASE_CONNECTED) {
    await delay();
    return MOCK_SUBJECTS.filter((s) => s.active).sort((a, b) =>
      a.code.localeCompare(b.code)
    );
  }
  const { collection, query, where, orderBy, getDocs } = await import(
    "firebase/firestore"
  );
  const q = query(
    collection(db, "subjects"),
    where("active", "==", true),
    orderBy("code")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get a subject's syllabus (doc id = subjectId).
 * TODO: firebase — doc(db, "syllabus", subjectId)
 * @param {string} subjectId
 * @returns {Promise<Object|null>} { subjectId, modules[], pdfUrl, updatedAt }
 */
export async function getSyllabus(subjectId) {
  if (!FIREBASE_CONNECTED) {
    await delay();
    return MOCK_SYLLABUS[subjectId] ?? null;
  }
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "syllabus", subjectId));
  return snap.exists() ? { subjectId, ...snap.data() } : null;
}

/**
 * Papers for a subject, with optional filters. Approved papers only.
 * TODO: firebase — query(papers, where("subjectId","==",sid),
 *                             where("status","==","approved"),
 *                             orderBy("year","desc"))  ← needs composite index
 * @param {string} subjectId
 * @param {{year?:number, examType?:string, slot?:string} } [filters]
 */
export async function getPapers(subjectId, filters = {}) {
  const { year, examType, slot } = filters;
  if (!FIREBASE_CONNECTED) {
    await delay();
    return MOCK_PAPERS.filter(
      (p) =>
        p.subjectId === subjectId &&
        p.status === "approved" &&
        (year ? p.year === year : true) &&
        (examType ? p.examType === examType : true) &&
        (slot ? p.slot === slot : true)
    ).sort((a, b) => b.year - a.year || b.downloads - a.downloads);
  }
  const { collection, query, where, orderBy, getDocs } = await import(
    "firebase/firestore"
  );
  const constraints = [
    where("subjectId", "==", subjectId),
    where("status", "==", "approved"),
    orderBy("year", "desc"),
  ];
  if (year) constraints.push(where("year", "==", year));
  if (examType) constraints.push(where("examType", "==", examType));
  if (slot) constraints.push(where("slot", "==", slot));
  const snap = await getDocs(query(collection(db, "papers"), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Single paper by id (any status — detail page is public).
 * TODO: firebase — doc(db, "papers", id)
 * @param {string} id
 */
export async function getPaper(id) {
  if (!FIREBASE_CONNECTED) {
    await delay();
    return MOCK_PAPERS.find((p) => p.id === id) ?? null;
  }
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "papers", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Notes for a subject, ordered by syllabus module.
 * TODO: firebase — query(notes, where("subjectId","==",sid),
 *                             orderBy("syllabusModule"))  ← composite index
 * @param {string} subjectId
 */
export async function getNotes(subjectId) {
  if (!FIREBASE_CONNECTED) {
    await delay();
    return MOCK_NOTES.filter((n) => n.subjectId === subjectId).sort(
      (a, b) => a.syllabusModule - b.syllabusModule
    );
  }
  const { collection, query, where, orderBy, getDocs } = await import(
    "firebase/firestore"
  );
  const q = query(
    collection(db, "notes"),
    where("subjectId", "==", subjectId),
    orderBy("syllabusModule")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Upload history for one user, newest first (My Uploads page).
 * TODO: firebase — query(uploads, where("userId","==",uid),
 *                             orderBy("createdAt","desc"))  ← composite index
 * @param {string} uid
 */
export async function getMyUploads(uid) {
  if (!FIREBASE_CONNECTED) {
    await delay();
    return MOCK_UPLOADS.filter((u) => u.userId === uid).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  const { collection, query, where, orderBy, getDocs } = await import(
    "firebase/firestore"
  );
  const q = query(
    collection(db, "uploads"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * All paper requests (Request board), newest first.
 * TODO: firebase — query(requests, orderBy("createdAt","desc"))
 */
export async function getRequests() {
  if (!FIREBASE_CONNECTED) {
    await delay();
    return [...MOCK_REQUESTS].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  const { collection, query, orderBy, getDocs } = await import(
    "firebase/firestore"
  );
  const snap = await getDocs(
    query(collection(db, "requests"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Submit a report against a paper ("wrong-subject" | "blurry" | "duplicate" | "other").
 * BACKEND_PLAN §3.8.
 * TODO: firebase — addDoc(collection(db, "reports"), {...})
 * @param {{paperId:string, reportedBy:string, reason:string, details?:string}} input
 * @returns {Promise<{id:string}>}
 */
export async function submitReport({ paperId, reportedBy, reason, details }) {
  if (!FIREBASE_CONNECTED) {
    await delay();
    return { id: `report-mock-${Date.now()}` };
  }
  const { collection, addDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  const ref = await addDoc(collection(db, "reports"), {
    paperId,
    reportedBy,
    reason,
    details: details ?? "",
    status: "open",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}
