/**
 * PaperVault Firestore data layer. Shapes mirror BACKEND_PLAN.md §3.
 *
 * REAL DATA ONLY — no mock fallback. Firestore is the single source of
 * truth. When a collection is empty, functions return [] / null and the
 * UI shows empty states (never fake data, never crashes).
 *
 * Query strategy: single-clause Firestore queries + client-side filtering
 * and sorting. This avoids composite-index errors entirely at this scale.
 */
import { db } from "./config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";

const toRow = (d) => ({ id: d.id, ...d.data() });

/* ------------------------------------------------------------------ */
/* Subjects (§3.1)                                                     */
/* ------------------------------------------------------------------ */

/** All active subjects, ordered by primary code. */
export async function getSubjects() {
  const snap = await getDocs(
    query(collection(db, "subjects"), where("active", "==", true))
  );
  return snap.docs
    .map(toRow)
    .sort((a, b) => String(a.code ?? "").localeCompare(String(b.code ?? "")));
}

/** All subjects including inactive (admin). */
export async function getAllSubjects() {
  const snap = await getDocs(collection(db, "subjects"));
  return snap.docs
    .map(toRow)
    .sort((a, b) => String(a.code ?? "").localeCompare(String(b.code ?? "")));
}

/** One subject by id, or null. */
export async function getSubject(id) {
  const snap = await getDoc(doc(db, "subjects", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Create a subject (admin). */
export async function createSubject({ name, code, codes, program, semester }) {
  const ref = await addDoc(collection(db, "subjects"), {
    name,
    code,
    codes: codes?.length ? codes : [code],
    program: program ?? "",
    semester: semester ?? null,
    active: true,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}

/** Update subject fields (admin). */
export async function updateSubject(id, patch) {
  await updateDoc(doc(db, "subjects", id), patch);
}

/** Activate / deactivate a subject (admin). Soft-delete via active flag. */
export async function setSubjectActive(id, active) {
  await updateDoc(doc(db, "subjects", id), { active });
}

/* ------------------------------------------------------------------ */
/* Syllabus (§3.2A) — doc id = subjectId                               */
/* ------------------------------------------------------------------ */

/**
 * @returns {Promise<{subjectId, modules[], pdfUrl, updatedAt}|null>}
 */
export async function getSyllabus(subjectId) {
  const snap = await getDoc(doc(db, "syllabus", subjectId));
  return snap.exists() ? { subjectId, ...snap.data() } : null;
}

/** Create/replace a subject's syllabus (admin). */
export async function saveSyllabus(subjectId, { modules, pdfUrl }) {
  await setDoc(doc(db, "syllabus", subjectId), {
    modules: modules ?? [],
    pdfUrl: pdfUrl ?? "",
    updatedAt: serverTimestamp(),
  });
}

/* ------------------------------------------------------------------ */
/* Papers (§3.3)                                                       */
/* ------------------------------------------------------------------ */

/**
 * Approved papers for a subject, with optional filters. Newest first.
 * @param {string} subjectId
 * @param {{year?:number, examType?:string, slot?:string}} [filters]
 */
export async function getPapers(subjectId, filters = {}) {
  const { year, examType, slot } = filters;
  const snap = await getDocs(
    query(collection(db, "papers"), where("subjectId", "==", subjectId))
  );
  return snap.docs
    .map(toRow)
    .filter(
      (p) =>
        p.status === "approved" &&
        (year ? p.year === year : true) &&
        (examType ? p.examType === examType : true) &&
        (slot ? p.slot === slot : true)
    )
    .sort((a, b) => b.year - a.year || (b.downloads ?? 0) - (a.downloads ?? 0));
}

/** Single paper by id (any status — detail page is public). */
export async function getPaper(id) {
  const snap = await getDoc(doc(db, "papers", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** All papers, any status (admin). */
export async function getAllPapers() {
  const snap = await getDocs(collection(db, "papers"));
  return snap.docs
    .map(toRow)
    .sort((a, b) => b.year - a.year || (b.downloads ?? 0) - (a.downloads ?? 0));
}

/** Papers awaiting moderation (admin). */
export async function getPendingPapers() {
  const snap = await getDocs(
    query(collection(db, "papers"), where("status", "==", "pending"))
  );
  return snap.docs.map(toRow).sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}

/** Create a paper doc (usually status "pending" from uploads). */
export async function createPaper(data) {
  const ref = await addDoc(collection(db, "papers"), {
    ...data,
    downloads: 0,
    views: 0,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}

/** Update paper fields (admin: approve/reject/edit). */
export async function updatePaper(id, patch) {
  await updateDoc(doc(db, "papers", id), patch);
}

/** Delete a paper (admin). */
export async function deletePaper(id) {
  await deleteDoc(doc(db, "papers", id));
}

/** Increment download counter (atomic — no read-modify-write race). */
export async function bumpDownloads(id) {
  try {
    await updateDoc(doc(db, "papers", id), { downloads: increment(1) });
  } catch {
    /* best-effort only */
  }
}

/** Increment view counter (atomic — fire-and-forget). */
export async function bumpViews(id) {
  try {
    await updateDoc(doc(db, "papers", id), { views: increment(1) });
  } catch {
    /* best-effort only */
  }
}

/* ------------------------------------------------------------------ */
/* Notes (§3.4, admin-only uploads)                                     */
/* ------------------------------------------------------------------ */

/** Notes for a subject, ordered by syllabus module. */
export async function getNotes(subjectId) {
  const snap = await getDocs(
    query(collection(db, "notes"), where("subjectId", "==", subjectId))
  );
  return snap.docs
    .map(toRow)
    .sort((a, b) => (a.syllabusModule ?? 0) - (b.syllabusModule ?? 0));
}

/** All notes (admin). */
export async function getAllNotes() {
  const snap = await getDocs(collection(db, "notes"));
  return snap.docs.map(toRow);
}

/** Create a note (admin). */
export async function createNote(data) {
  const ref = await addDoc(collection(db, "notes"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}

/** Delete a note (admin). */
export async function deleteNote(id) {
  await deleteDoc(doc(db, "notes", id));
}

/* ------------------------------------------------------------------ */
/* Uploads (§3.6 — user upload history)                                 */
/* ------------------------------------------------------------------ */

/** Upload history for one user, newest first. */
export async function getMyUploads(uid) {
  const snap = await getDocs(
    query(collection(db, "uploads"), where("userId", "==", uid))
  );
  return snap.docs.map(toRow).sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}

/** Record a new upload (default status "pending" → moderation queue). */
export async function createUpload(data) {
  const ref = await addDoc(collection(db, "uploads"), {
    ...data,
    status: data.status ?? "pending",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}

/** Uploads awaiting moderation (admin): manual-pending + AI-approved. Newest first. */
export async function getPendingUploads() {
  const snap = await getDocs(
    query(collection(db, "uploads"), where("status", "in", ["pending", "ai_approved"]))
  );
  return snap.docs.map(toRow).sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}

/** Update an upload doc (admin: approve/reject + paperId link). */
export async function updateUpload(id, patch) {
  await updateDoc(doc(db, "uploads", id), patch);
}

/** Rejected uploads (admin history). Newest first. */
export async function getRejectedUploads() {
  const snap = await getDocs(
    query(collection(db, "uploads"), where("status", "==", "rejected"))
  );
  return snap.docs.map(toRow).sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}

/* ------------------------------------------------------------------ */
/* Requests (§3.7 — request board)                                      */
/* ------------------------------------------------------------------ */

/** All paper requests, newest first. */
export async function getRequests() {
  const snap = await getDocs(
    query(collection(db, "requests"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map(toRow);
}

/** Create a request. */
export async function createRequest({ subjectId, examType, year, uid }) {
  const ref = await addDoc(collection(db, "requests"), {
    subjectId,
    examType,
    year,
    requestedBy: [uid],
    fulfilledBy: null,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}

/** Upvote a request (adds uid once). */
export async function upvoteRequest(requestId, uid) {
  await updateDoc(doc(db, "requests", requestId), {
    requestedBy: arrayUnion(uid),
  });
}

/* ------------------------------------------------------------------ */
/* Users (§2)                                                          */
/* ------------------------------------------------------------------ */

/** All users (admin). */
export async function getUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(toRow);
}

/** Change a user's role (admin). */
export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, "users", uid), { role });
}

/* ------------------------------------------------------------------ */
/* Reports (§3.8)                                                      */
/* ------------------------------------------------------------------ */

/** All reports (admin). */
export async function getReports() {
  const snap = await getDocs(
    query(collection(db, "reports"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map(toRow);
}

/** Submit a report against a paper. */
export async function submitReport({ paperId, reportedBy, reason, details }) {
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

/* ------------------------------------------------------------------ */
/* Aggregates                                                          */
/* ------------------------------------------------------------------ */

/** Home-page stat strip — real counts from Firestore. */
export async function getStats() {
  const [papersSnap, subjectsSnap, notesSnap] = await Promise.all([
    getDocs(query(collection(db, "papers"), where("status", "==", "approved"))),
    getDocs(query(collection(db, "subjects"), where("active", "==", true))),
    getDocs(collection(db, "notes")),
  ]);
  return {
    papers: papersSnap.size,
    subjects: subjectsSnap.size,
    notes: notesSnap.size,
  };
}

/** Most-downloaded approved papers (home "trending"). */
export async function getTrendingPapers(limitN = 6) {
  const snap = await getDocs(
    query(collection(db, "papers"), where("status", "==", "approved"))
  );
  return snap.docs
    .map(toRow)
    .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    .slice(0, limitN);
}

/** Course-code / name search over active subjects (client-side). */
export async function searchSubjects(q) {
  const queryText = q.trim().toLowerCase();
  if (!queryText) return [];
  const subjects = await getSubjects();
  return subjects.filter(
    (s) =>
      s.name?.toLowerCase().includes(queryText) ||
      s.code?.toLowerCase().includes(queryText) ||
      (s.codes ?? []).some((c) => c.toLowerCase().includes(queryText))
  );
}

/**
 * Subject detail bundle: subject + syllabus + papers + notes + aggregate
 * AI stats. Powers the subject page.
 */
export async function getSubjectDetail(subjectId) {
  const [subject, syllabus, papers, notes] = await Promise.all([
    getSubject(subjectId),
    getSyllabus(subjectId),
    getPapers(subjectId),
    getNotes(subjectId),
  ]);
  if (!subject) return null;

  // Aggregate topic percentages across papers' aiAnalysis (subject trend).
  const topicTotals = {};
  for (const p of papers) {
    if (!p.aiAnalysis?.topics?.length) continue;
    for (const t of p.aiAnalysis.topics) {
      const key = t.module;
      if (!topicTotals[key]) {
        topicTotals[key] = {
          module: t.module,
          moduleTitle: t.moduleTitle,
          total: 0,
          n: 0,
        };
      }
      topicTotals[key].total += t.percentage ?? 0;
      topicTotals[key].n += 1;
    }
  }
  const aggregateTopics = Object.values(topicTotals)
    .map((t) => ({
      module: t.module,
      moduleTitle: t.moduleTitle,
      avgPercentage: Math.round(t.total / Math.max(1, t.n)),
      papersAnalyzed: t.n,
    }))
    .sort((a, b) => b.avgPercentage - a.avgPercentage);

  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);
  const papersByYear = years.map((year) => ({
    year,
    papers: papers
      .filter((p) => p.year === year)
      .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0)),
  }));

  return { subject, syllabus, papers, papersByYear, years, notes, aggregateTopics };
}

/* ------------------------------------------------------------------ */
/* Chat — chatRooms/{roomId}/messages                                   */
/* ------------------------------------------------------------------ */

/**
 * Chat rooms: lobby + one room per active subject.
 * Derived from Firestore so zero config still yields a working room list.
 */
export async function getChatRooms() {
  const subjects = await getSubjects();
  return [
    { id: "lobby", name: "Common Lobby" },
    ...subjects.map((s) => ({ id: s.id, name: `${s.code} — ${s.name}` })),
  ];
}

/** Real-time subscribe to a room's messages. Returns unsubscribe. */
export function subscribeChatMessages(roomId, cb) {
  const q = query(
    collection(db, "chatRooms", roomId, "messages"),
    orderBy("createdAt", "asc"),
    limit(200)
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(toRow), null),
    (err) => cb([], err)
  );
}

/** Send a message to a room. */
export async function sendChatMessage(roomId, { uid, name, photo, text }) {
  const ref = await addDoc(collection(db, "chatRooms", roomId, "messages"), {
    uid,
    name,
    photo: photo ?? null,
    text,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}

/** Delete a message (own messages / admin). */
export async function deleteChatMessage(roomId, messageId) {
  await deleteDoc(doc(db, "chatRooms", roomId, "messages", messageId));
}

/* ---------------------------------------------------------------- */
/* Exam countdown settings (§ — admin-editable, Home banner)        */
/* doc("settings", "examCountdown"):                                */
/*   { examType, startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD",    */
/*     label?, updatedAt }                                          */
/* ---------------------------------------------------------------- */

/** Default shown when the settings doc doesn't exist yet. */
export const DEFAULT_EXAM_COUNTDOWN = {
  examType: "Lab FAT",
  startDate: "2026-10-31",
  endDate: "2026-11-06",
  label: "",
};

/** Read the exam countdown settings (one-shot). Falls back to defaults. */
export async function getExamCountdown() {
  try {
    const snap = await getDoc(doc(db, "settings", "examCountdown"));
    if (snap.exists()) return { ...DEFAULT_EXAM_COUNTDOWN, ...snap.data() };
  } catch {
    /* fall through to defaults */
  }
  return { ...DEFAULT_EXAM_COUNTDOWN };
}

/** Realtime listener for exam countdown settings. Returns unsubscribe. */
export function subscribeExamCountdown(cb) {
  return onSnapshot(
    doc(db, "settings", "examCountdown"),
    (snap) => {
      cb(snap.exists() ? { ...DEFAULT_EXAM_COUNTDOWN, ...snap.data() } : { ...DEFAULT_EXAM_COUNTDOWN }, null);
    },
    (err) => cb({ ...DEFAULT_EXAM_COUNTDOWN }, err)
  );
}

/** Save exam countdown settings (admin). */
export async function saveExamCountdown({ examType, startDate, endDate, label }) {
  await setDoc(
    doc(db, "settings", "examCountdown"),
    {
      examType,
      startDate,
      endDate,
      label: label ?? "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/* ------------------------------------------------------------------ */
/* Moderation mode settings (§ — admin-editable, AI vs Manual)         */
/* doc("settings", "moderation"):                                      */
/*   { mode: "ai" | "manual", updatedAt }                              */
/* ------------------------------------------------------------------ */

/** Default shown when the settings doc doesn't exist yet. */
export const DEFAULT_MODERATION = {
  mode: "ai",
};

/** Read the moderation mode (one-shot). Falls back to defaults. */
export async function getModerationMode() {
  try {
    const snap = await getDoc(doc(db, "settings", "moderation"));
    if (snap.exists()) return { ...DEFAULT_MODERATION, ...snap.data() };
  } catch {
    /* fall through to defaults */
  }
  return { ...DEFAULT_MODERATION };
}

/** Realtime listener for moderation mode. Returns unsubscribe. */
export function subscribeModerationMode(cb) {
  return onSnapshot(
    doc(db, "settings", "moderation"),
    (snap) => {
      cb(snap.exists() ? { ...DEFAULT_MODERATION, ...snap.data() } : { ...DEFAULT_MODERATION }, null);
    },
    (err) => cb({ ...DEFAULT_MODERATION }, err)
  );
}

/** Save moderation mode (admin). */
export async function saveModerationMode(mode) {
  await setDoc(
    doc(db, "settings", "moderation"),
    {
      mode: mode === "manual" ? "manual" : "ai",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
