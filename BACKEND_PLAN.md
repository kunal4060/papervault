# PaperVault — Backend Specification
**For:** Frontend Developer | **Version:** 1.0 FINAL | **Date:** 8 Oct 2026

> Ye document backend ka pura contract hai. Ise padhke tum frontend bana sakte ho
> bina backend code dekhe. Har collection, har function, har request/response yahan hai.

---

## 1. ARCHITECTURE

```
Frontend (React)
    │
    ├── Firebase Auth ───── Google login, session, roles
    ├── Firestore ───────── Saara data (papers, notes, users…)
    ├── Firebase Storage ── PDF files
    └── Cloud Functions ─── AI kaam (duplicate check, paper analysis)
                              (Phase 1 me client-side bhi chal sakta hai —
                               §6 dekho)
```

**Base URL (functions):** `https://asia-south1-<project>.cloudfunctions.net`
**Region:** `asia-south1` (Mumbai) — sab kuch yahi.

---

## 2. AUTHENTICATION

### 2.1 Login Flow
```typescript
// Google popup login
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase/config";

const result = await signInWithPopup(auth, googleProvider);
const user = result.user; // { uid, displayName, email, photoURL }
```

### 2.2 Pehli baar login → user document banao
```typescript
// Login ke baad check karo: users/{uid} exists?
// Nahi hai → create karo:
{
  uid: "abc123",
  name: "Arjun Sharma",
  email: "arjun@vitap.ac.in",
  photo: "https://...",
  role: "user",          // default — admin console se change hoga
  uploadCount: 0,
  createdAt: Timestamp
}
```

### 2.3 Role check (har protected action se pehle)
```typescript
async function getRole(uid: string): Promise<"admin"|"moderator"|"user"> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.role ?? "user";
}
// Admin pages: if (role !== "admin") → redirect home
// Mod actions: if (!["admin","moderator"].includes(role)) → block
```

### 2.4 Logout
```typescript
import { signOut } from "firebase/auth";
await signOut(auth);
```

---

## 3. FIRESTORE — COLLECTIONS & TYPESCRIPT INTERFACES

### 3.1 `subjects`
```typescript
interface Subject {
  id: string;                    // auto
  name: string;                  // "Engineering Mathematics"
  code: string;                  // primary: "MAT1001"
  codes: string[];               // saare saal: ["MAT1001","MAT1002","MAT1003"]
  program: string;               // "B.Tech CSE"
  semester: number;              // 1
  active: boolean;               // false = hidden (purane papers dikhenge)
  paperCount: number;            // denormalized count
  createdAt: Timestamp;
}
// Queries:
// - All active: query(subjects, where("active","==",true), orderBy("code"))
// - Search: client-side filter on name/code/codes[]
```

### 3.2 `syllabus` (doc ID = subjectId)
```typescript
interface Syllabus {
  subjectId: string;
  modules: SyllabusModule[];
  pdfUrl: string;                // Storage: syllabus/{code}/syllabus.pdf
  updatedAt: Timestamp;
}
interface SyllabusModule {
  number: number;                // 1
  title: string;                // "Stacks & Queues"
  topics: string[];             // ["stack", "queue", "applications"]
}
// Get: doc(db, "syllabus", subjectId)
```

### 3.3 `papers`
```typescript
type ExamType = "CAT-1" | "CAT-2" | "FAT" | "Lab FAT";
type PaperStatus = "pending" | "approved" | "rejected";

interface Paper {
  id: string;
  subjectId: string;
  subjectCode: string;           // jis code ka paper hai (e.g. "MAT1002")
  examType: ExamType;
  year: number;                  // 2025
  slot: string;                  // "F1"
  faculty?: string;              // optional
  fileUrl: string;               // Storage download URL
  fileName: string;              // auto: "MAT1002_CAT-2_2025_F1.pdf"
  fileHash: string;              // SHA-256 hex
  textEmbedding: number[];       // Gemini embedding (dedup ke liye)
  uploadedBy: string;            // uid
  uploaderName: string;
  status: PaperStatus;
  rejectReason?: string;         // rejected pe
  duplicateOf?: string;          // paperId (agar duplicate tha)
  aiAnalysis?: PaperAnalysis;    // §5
  downloads: number;
  views: number;
  createdAt: Timestamp;
}
interface PaperAnalysis {
  topics: { module: number; moduleTitle: string;
            percentage: number; questionCount: number;
            questionNumbers: string[] }[];
  patterns: { marks: Record<string,number>; types: string[] };
  syllabusCoverage: string;      // "Module 4 se kuch nahi aaya"
  tip: string;
  analyzedAt: Timestamp;
}
// Queries:
// - Subject ke papers: query(papers, where("subjectId","==",sid),
//                             where("status","==","approved"))
// - Year filter: + where("year","==",2025)
// - Sort: orderBy("year","desc") ← INDEX CHAHIYE (firestore.indexes.json)
// - Pending queue (mod): where("status","==","pending"), orderBy("createdAt")
```

### 3.4 `notes`
```typescript
interface Note {
  id: string;
  subjectId: string;
  syllabusModule: number;        // kis module ka note hai
  title: string;
  fileUrl: string;               // Storage: notes/{code}/m{module}/{file}
  pages: number;
  uploadedBy: string;            // admin uid
  verified: boolean;             // true
  createdAt: Timestamp;
}
// Query: where("subjectId","==",sid), orderBy("syllabusModule")
```

### 3.5 `users`
```typescript
interface UserDoc {
  uid: string;
  name: string;
  email: string;
  photo?: string;
  role: "admin" | "moderator" | "user";
  uploadCount: number;
  createdAt: Timestamp;
}
```

### 3.6 `uploads` (history)
```typescript
type UploadStatus = "pending" | "approved" | "rejected";
interface Upload {
  id: string;
  userId: string;
  paperId?: string;              // approve hone ke baad
  fileName: string;
  subjectId: string;
  examType: ExamType;
  year: number;
  status: UploadStatus;
  reason?: string;               // reject reason / duplicate link text
  duplicateOf?: string;           // paperId
  createdAt: Timestamp;
}
// Query (My Uploads): where("userId","==",uid), orderBy("createdAt","desc")
```

### 3.7 `requests`
```typescript
interface PaperRequest {
  id: string;
  subjectId: string;
  examType: ExamType;
  year: number;
  requestedBy: string[];         // uids (upvotes)
  fulfilledBy?: string;          // paperId
  createdAt: Timestamp;
}
```

### 3.8 `reports`
```typescript
interface Report {
  id: string;
  paperId: string;
  reportedBy: string;
  reason: "wrong-subject" | "blurry" | "duplicate" | "other";
  details?: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: Timestamp;
}
```

### 3.9 `chatRooms/{roomId}/messages`
```typescript
interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  photo?: string;
  text: string;
  attachments?: { type: "image"|"pdf"; url: string; name: string }[];
  createdAt: Timestamp;
}
// Real-time: onSnapshot(query(messages, orderBy("createdAt"), limit(100)))
// Rooms: "lobby" + subjectId as roomId
```

---

## 4. STORAGE PATHS
```
papers/{subjectCode}/{autoFileName}.pdf
  → papers/MAT1002/MAT1002_CAT-2_2025_F1.pdf

notes/{subjectCode}/m{module}/{fileName}.pdf
  → notes/CSE3002/m3/stacks-complete.pdf

syllabus/{subjectCode}/syllabus.pdf
```

### Upload (frontend)
```typescript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const storageRef = ref(storage, `papers/${code}/${fileName}`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
// → url ko papers document me save karo
```

---

## 5. BACKEND FUNCTIONS (AI LOGIC)

### Option A: Cloud Functions (recommended for production)
### Option B: Client-side (MVP — jaldi start ke liye)
Dono ka **request/response contract SAME** hai. Neeche contract hai.

### 5.1 `checkDuplicate` — Upload pe
```typescript
// REQUEST
interface DuplicateCheckRequest {
  fileHash: string;              // SHA-256 hex
  subjectId: string;
  examType: ExamType;
  year: number;
  slot: string;
  textSample: string;            // PDF ke pehle ~2000 chars
}
// RESPONSE
interface DuplicateCheckResponse {
  isDuplicate: boolean;
  reason: string;                // "Exact file match" | "95% similar to…" | "Unique"
  duplicateOf?: string;          // paperId (agar duplicate)
  duplicateTitle?: string;
}
// LOGIC (server/client):
//   1. papers me fileHash match? → isDuplicate=true, reason="Exact file"
//   2. (subjectId+examType+year+slot) match? → candidate
//   3. embedding(textSample) → cosine vs candidates → >0.95 duplicate
//   4. 0.85–0.95 → Gemini: "same paper? YES/NO + reason"
//   5. else → isDuplicate=false
```

### 5.2 `analyzePaper` — Approve pe
```typescript
// REQUEST
interface AnalyzeRequest {
  paperId: string;
  paperText: string;             // full extracted text
  syllabus: SyllabusModule[];    // subject ka syllabus
}
// RESPONSE → papers/{paperId}.aiAnalysis me save (§3.3 PaperAnalysis)
// LOGIC: Gemini prompt → JSON parse → validate → save
// TRIGGER: paper approved → auto-run → subject aggregate refresh
```

### 5.3 Gemini Prompts (copy-paste ready)

**Duplicate verdict:**
```
You are a duplicate detector for university question papers.
Paper A (existing): """{textA}"""
Paper B (new upload): """{textB}"""
Are these the SAME question paper? Consider: same questions, same order,
same marks = duplicate. Different year/exam with different questions = not duplicate.
Reply in JSON: {"duplicate": true/false, "reason": "one line"}
```

**Paper analysis:**
```
You are analyzing a university question paper against its syllabus.
Syllabus modules: {modules JSON}
Paper text: """{paperText}"""
Return JSON:
{ "topics": [{"module": 3, "moduleTitle": "...", "percentage": 40,
               "questionCount": 4, "questionNumbers": ["Q2","Q5"]}],
  "patterns": {"marks": {"5": 2, "10": 1}, "types": ["MCQ","descriptive"]},
  "syllabusCoverage": "which modules had zero questions",
  "tip": "one-line study tip" }
Map EVERY question to a syllabus module. Be precise with question numbers.
```

---

## 6. MVP vs PRODUCTION NOTE
- **MVP:** §5 ke functions **frontend me** chalao (simple, no deploy).
  Gemini key `.env` me. Rate-limit client-side.
- **Production:** Same logic ko Cloud Functions me move karo.
  Contract (§5.1, §5.2) change nahi hoga — frontend ko farak nahi padega.

---

## 7. ERROR CODES
| Code | Matlab | Frontend kya kare |
|---|---|---|
| `DUPLICATE_EXACT` | Same file hai | ❌ dikhao + existing link |
| `DUPLICATE_SIMILAR` | 95%+ similar | ❌ dikhao + existing link |
| `PENDING_REVIEW` | Unique, review me | ⏳ My Uploads pe bhejo |
| `UNAUTHORIZED` | Login nahi | Login page pe bhejo |
| `FORBIDDEN` | Role nahi hai | "Access nahi hai" dikhao |
| `FILE_TOO_LARGE` | >25MB | Error dikhao |
| `INVALID_FILE` | PDF nahi | Error dikhao |

---

## 8. INDEXES (firestore.indexes.json)
```json
{ "indexes": [
  { "collectionGroup": "papers",
    "fields": [{"fieldPath":"subjectId","order":"ASCENDING"},
               {"fieldPath":"status","order":"ASCENDING"},
               {"fieldPath":"year","order":"DESCENDING"}] },
  { "collectionGroup": "papers",
    "fields": [{"fieldPath":"status","order":"ASCENDING"},
               {"fieldPath":"createdAt","order":"DESCENDING"}] },
  { "collectionGroup": "uploads",
    "fields": [{"fieldPath":"userId","order":"ASCENDING"},
               {"fieldPath":"createdAt","order":"DESCENDING"}] },
  { "collectionGroup": "notes",
    "fields": [{"fieldPath":"subjectId","order":"ASCENDING"},
               {"fieldPath":"syllabusModule","order":"ASCENDING"}] }
]}
```

---

## 9. FRONTEND CHECKLIST (dost ke liye)
- [ ] `firebase/config.js` me keys dalo (`.env` se)
- [ ] Login/logout + `useAuth` hook
- [ ] Har page §3 ke interfaces use karega
- [ ] Upload: §4 flow → §5.1 check → Firestore write
- [ ] Approve: §5.2 analysis trigger (mod/admin)
- [ ] Security rules (§8 DETAILED_PLAN) Firestore console me paste karo
- [ ] Indexes (§8) deploy karo: `firebase deploy --only firestore:indexes`

**Questions?** DETAILED_PLAN.md me product spec hai. Ye file backend contract hai.
Dono milake pura picture clear hai. 🚀
