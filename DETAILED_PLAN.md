# PaperVault — Detailed Working Specification
**Version:** 2.0 (Deep Detail) | **Date:** 8 Oct 2026
**Basis:** Full conversation analysis — every feature, flow, and decision discussed.

---

## TABLE OF CONTENTS
1. Product Identity
2. User Roles (detailed permissions)
3. Page-by-Page Breakdown (layout + components + interactions)
4. Upload Flow (step-by-step with AI)
5. AI Features (each: where, what, how — step-by-step)
6. Data Flow & Caching Rules
7. Database Schema (detailed)
8. Firebase Setup & Connection (step-by-step)
9. Auth Rules (Google login — read vs write)
10. File/Folder Structure (organized codebase)
11. Edge Cases & Rules
12. Open Questions for Tim
13. Pending: New Admin Feature (Tim batayega)

---

## 1. PRODUCT IDENTITY
- **What:** Web app (PWA) — VIT-AP previous year papers (CAT-1, CAT-2, FAT, Lab FAT)
  + admin-verified notes. 100% original code, kisi ka copy nahi.
- **Stack:** React (Vite) + Tailwind | Firebase Auth + Firestore + Storage + Hosting | Gemini API
- **Access:** Downloads BINA login. Upload/chat/history ke liye Google login.
- **Cost:** ₹0 start (Firebase + Gemini free tiers).

---

## 2. USER ROLES

### Visitor (bina login)
- Papers/notes browse, search, preview, download kar sakta hai
- Chat padh sakta hai (likh nahi sakta)
- Upload nahi kar sakta

### Logged-in User
- Visitor sab + paper upload, chat me likhna, request board, bookmarks,
  apni upload history dekhna, papers report karna

### Moderator (admin banata hai)
- User sab + uploads approve/reject (reason ke saath), reported papers review,
  chat moderate (delete/timeout/ban)

### Admin (Tim)
- Sab kuch: notes upload, papers direct upload, subjects create/edit/deactivate,
  users ke roles manage, full stats, chat full control

---

## 3. PAGE-BY-PAGE BREAKDOWN

### 3.1 HOME (`/`)
**Layout (top to bottom):**
1. **Navbar:** Logo (left) | Papers, Notes, Requests, Chat (center) |
   [Upload button] [Profile/Login] (right). Mobile pe hamburger menu.
2. **Hero:** Badi headline ("VIT-AP Papers & Notes"), subtext,
   BADI search bar (placeholder: "Course code likho… CSE3002"),
   exam-type chips: [All] [CAT-1] [CAT-2] [FAT]. Search dabate hi
   Papers page pe filtered results.
3. **Stats strip:** "5,000+ papers · 200+ subjects · 500+ notes · 100% free"
   (real counts Firestore se).
4. **Exam countdown banner** (agar 30 din me exam hai):
   "CAT-2 in 12 days ⏰" + button "Relevant papers dekho" →
   current semester subjects ke papers.
5. **Popular Subjects:** Grid of cards (subject short name + code + paper count).
   Click → Papers page filtered.
6. **Trending Papers:** Top 5 most-downloaded (last 7 days). Har row:
   title, tags (exam/year/slot), download count, Preview button.
7. **AI Insight Card:** "Aaj ka insight — DSA: Unit 3 (Stacks) se pichle
   3 saal me 40% questions!" (subject aggregate data se, rotate hota hai).
8. **How it works:** 3 steps (Search → Preview → Upload).
9. **Upload CTA:** Bada button "Apna paper upload karo".
10. **Footer:** About, Contact, Disclaimer, "Made for VIT-AP students".

### 3.2 PAPERS (`/papers`) — SUBJECT-WISE BROWSING
- **Main view:** Saare subjects **subject-code wise** grid me dikhenge
  (har card: subject name + primary code + paper count).
  Example: "Engineering Mathematics" (MAT1001/MAT1002/MAT1003) — 48 papers.
- **Subject ke andar (`/papers/:subjectId`):**
  - Header: Subject name + saare codes (chips) + total papers.
  - **Year-wise sort/filter:** [2025] [2024] [2023] tabs + "All years".
    Har saal ke papers uske neeche grouped.
  - Uske neeche: uss saal ke exam-type wise (CAT-1/CAT-2/FAT) sub-groups.
  - Har paper: card with title, year, exam, slot, downloads, [Preview] [Download].
  - Sort options: Year (new→old), Most downloaded.
  - **Sabse neeche: 📊 Subject AI Analysis** — saare papers + syllabus ka
    aggregate: "Module 3 se pichle 3 saal me avg 40% questions (Q2, Q5 common)"
    + 3-saal trend chart. (§5B)
- **Filters (sidebar):** Year (checkboxes), Exam type, Slot, Faculty.
- **Important:** Ek subject ke alag-alag saal ke codes (MAT1001 vs MAT1002)
  **ek hi subject page** pe aayenge — code se fragment nahi hoga.
  Upload karte time user code select karega → system subject se map karega.
- **Empty state:** "Paper nahi mila? Request karo!" → Request board link.

### 3.2A SYLLABUS + NOTES (`/syllabus`) — SUBJECT CODE PRIORITY
- **Subject list:** Code + naam wise, **priority code ko** (code se sorted).
  Example: `CSE3002 — Artificial Intelligence`, `MAT1001 — Mathematics`.
- **Subject ke andar ka layout (top to bottom):**
  ```
  ┌──────────────────────────────────────┐
  │ CSE3002 — Artificial Intelligence    │
  ├──────────────────────────────────────┤
  │ 📄 Syllabus PDF         [Download]   │  ← SABSE PEHLE syllabus!
  ├──────────────────────────────────────┤
  │ Module 1: Introduction               │
  │   📝 Notes (2) [list]                │
  │   📊 "Is module se 25% questions"    │  ← AI analysis per module!
  ├──────────────────────────────────────┤
  │ Module 2: Search Algorithms          │
  │   📝 Notes (3) [list]                │
  │   📊 "Is module se 15% questions"    │
  ├──────────────────────────────────────┤
  │ Module 3: Knowledge Representation   │
  │   📝 Notes (1) [list]                │
  │   📊 "Is module se 40% questions 🔥" │
  ├──────────────────────────────────────┤
  │ ... Module N tak                     │
  └──────────────────────────────────────┘
  ```
- **Order fixed hai:** 1) Syllabus PDF → 2) Module 1 se end tak →
  3) Har module ke andar uske notes → 4) Har module pe AI % ("kidhar se
  zyada questions aate hain").
- **AI % ka source:** Subject ke saare papers ka aggregate analysis (§5B) —
  syllabus modules se mapped. Naya paper aaye → % auto-update.
- Sirf admin syllabus/notes upload-edit kar sakta hai.

### 3.3 PAPER DETAIL (`/papers/:id`)
- **Header:** Title, tags (subject, exam, year, slot, faculty),
  uploader name, upload date, download count, view count.
- **Actions row:** [PDF Preview] [Download] [WhatsApp Share] [Report] [Bookmark]
- **PDF Viewer:** In-browser (pdf.js), page navigation, zoom.
- **AI Analysis section** (detail §5B):
  - Topic-wise bar chart (unit → % + question count)
  - Question pattern (marks distribution, types: MCQ/descriptive/case study)
  - Study tip (1-2 lines, AI-generated)
  - Note: "Analysis based on this paper · Updated [date]"
- **Similar Papers:** Same subject, other years (cards).
- **Request fulfillment:** Agar ye paper kisi request ko fulfill karta hai,
  requester ko notification.

### 3.4 NOTES — SYLLABUS PAGE ME MERGED (§3.2A dekho)
- Notes ka **alag page nahi** — notes syllabus page ke andar hain
  (har module ke neeche uske notes).
- Navbar me "Notes" dabane pe → `/syllabus` page khulta hai
  (subject list → subject detail with syllabus + modules + notes).
- Rationale: Student sochta hai "Module 3 padhna hai" → ek jagah
  syllabus + notes + AI % sab mil jata hai. Alag page pe bhatkna nahi.

### 3.5 UPLOAD (`/upload`) — login required
**Form fields:**
1. Subject — dropdown (admin-defined subjects se, searchable).
   **Course code select karo** (e.g. MAT1002) → system khud subject se map
   karega (Math). Har saal ka code subject ke `codes[]` me hota hai.
2. Exam type — radio: CAT-1 / CAT-2 / FAT / Lab FAT
3. Year — dropdown (2020–current)
4. Slot — text input (e.g. F1, B2) with suggestions
5. Faculty — optional text input
6. PDF file — drag-drop zone (sirf PDF, max 25MB)
**Submit flow (detail §4).**
**Result screen:** 3 outcomes —
  - ✅ "Unique! Review ke liye bhej diya" → My Uploads link
  - ❌ "Duplicate mila" → existing paper ka link + reason
  - ⏳ "Check ho raha hai…" (progress steps dikhenge)

### 3.6 MY UPLOADS (`/my-uploads`) — login required
- Table/list: filename, subject, exam, date, **status chip**, action.
- **Pending:** "Review me hai" (submitted date).
- **Approved:** "Live!" + paper ka link.
- **Rejected:** Reason clearly shown —
  "Duplicate of CSE3002 CAT-1 2024 [link]" /
  "Unreadable scan — dobara clear photo upload karo" /
  "Wrong subject — ye paper DSA ka nahi lagta" + [Re-upload] button.

### 3.7 REQUESTS (`/requests`)
- List: subject, exam, year, "12 students want this" (upvote count),
  requested by, date. [I want this too] upvote button.
- "Request a paper" form: subject, exam, year.
- Koi upload kare jo request match kare → requester ko notification
  "Tumhara requested paper aa gaya!"

### 3.8 COMMUNITY CHAT (`/chat`) — login to send
- **Left:** Room list — Common Lobby + subject rooms (admin-defined subjects se auto).
- **Main:** Messages (real-time). Text auto-linkified. Images inline.
  PDFs as downloadable chips.
- **@ai mention:** "@ai stacks samjha do" → Gemini jawab deta hai (Phase 2).
- **Moderation:** Mod/admin: message delete, user timeout/ban. Auto word-filter.
- **Input:** Text field + attach (image/PDF) + Send.

### 3.9 ADMIN PANEL (`/admin`) — admin/mod only
**Tabs:**
1. **Dashboard:** Total papers, notes, users, pending uploads count,
   reports count, downloads this week (chart).
2. **Moderation Queue:** Pending uploads list → har ek pe: PDF preview,
   metadata, uploader, AI dedup verdict → [Approve] [Reject → reason
   dropdown: Duplicate / Unreadable / Wrong subject / Other + custom text].
3. **Subjects:** Table (name, code, active) → [New Subject] form
   (name, code, program, semester) → edit/deactivate.
4. **Syllabus:** Subject select → modules add/edit (module number, title,
   topics list) + syllabus PDF upload. Yehi syllabus AI analysis ka
   reference banta hai (§5B).
5. **Notes:** Upload form (subject, **syllabus module select**, title, PDF) →
   list with edit/delete. Notes module se linked.
6. **Papers:** Direct upload (queue bypass), edit metadata, delete.
7. **Users:** List → role change (user ↔ moderator). Admin sirf Tim.
8. **Reports:** Reported papers → review → dismiss / remove paper / warn user.

### 3.10 LOGIN (`/login`)
- Sirf Google sign-in button. Login ke baad wapas usi page pe redirect
  jahan se aaya tha.

---

## 4. UPLOAD FLOW (STEP-BY-STEP, AI KE SAATH)

```
USER ACTION                    SYSTEM
─────────────────────────────────────────────────────
Form bhara + PDF select
        │
        ▼
[1] Client validation ──→ Sirf PDF? ≤25MB? Nahi → error dikhao
        │ Haan
        ▼
[2] SHA-256 hash ──→ papers me fileHash match?
        │ Haan → ❌ INSTANT REJECT
        │        Reason: "Ye exact file pehle se hai" + link
        │ Nahi
        ▼
[3] Metadata match ──→ (subject+exam+year+slot) already exists?
        │ Haan → candidate mil gaya, Step 5 pe confirm
        │ Nahi
        ▼
[4] Text extract ──→ PDF se text (pdf.js, first ~2000 chars)
        │
        ▼
[5] Embedding similarity ──→ Gemini embedding API →
    same-subject papers se cosine similarity
        │ >0.95 → ❌ REJECT (reason: "bahut similar paper hai" + link)
        │ 0.85–0.95 → Step 6 (doubtful)
        │ <0.85 → ✅ UNIQUE
        ▼
[6] Gemini verdict (sirf doubtful) ──→ Prompt:
    "Kya ye do papers same hain? A: [text1] B: [text2].
     Jawab: YES/NO + ek line reason."
        │ YES → ❌ REJECT (reason: Gemini ka jawab + link)
        │ NO → ✅ UNIQUE
        ▼
[7] Storage + Firestore ──→ PDF → Storage (path:
    papers/{subjectCode}/{autoFilename})
    Metadata → papers collection (status: pending)
    Upload record → uploads collection (userId, status: pending)
        │
        ▼
[8] User ko batao ──→ "Review ke liye bhej diya! ⏳"
    → My Uploads me track karo
```

**Cost control:** Hash (free) → metadata (free) → embedding (paise, sasta) →
Gemini (sirf doubtful cases). 90%+ uploads pehle 2 steps me resolve.

---

## 5. AI FEATURES (HAR EK: KIDHAR, KYA, KAISE)

### 5A. DUPLICATE DETECTION (§4 me detailed)
- **Kidhar:** Upload page, submit pe.
- **Kya:** Pehle se maujood paper hai ya nahi.
- **Kaise:** Hash → metadata → embedding → Gemini (step-by-step §4).

### 5B. PAPER AI ANALYSIS (SYLLABUS-AWARE — sab papers + syllabus analyse karke)
- **Kidhar:** Paper Detail page, download buttons ke neeche "AI Analysis" section.
- **Kya:** (1) Topic-wise breakdown — syllabus ke HAR module se kitne %
  questions, kaunse question numbers (Q2, Q5…), (2) Question pattern —
  marks distribution, question types, (3) Study tip — 1-2 lines.
- **Kaise (syllabus-aware):**
  ```
  Trigger: paper APPROVED (admin/mod) ya admin direct upload
  Step 1: PDF se full text extract
  Step 2: Subject ka SYLLABUS lao (syllabus/{subjectId} se modules/topics)
  Step 3: Gemini prompt → JSON:
    { topics: [{ module: 3, moduleTitle: "Stacks & Queues",
                 percentage: 40, questionCount: 4,
                 questionNumbers: ["Q2", "Q5", "Q7", "Q9"] }],
      patterns: { marks: {"5": 2, "10": 1}, types: ["MCQ", "descriptive"] },
      syllabusCoverage: "Module 1-4 covered, Module 5 se kuch nahi aaya",
      tip: "Unit 3 pakka kar lo…" }
    ← Gemini paper ke questions ko SYLLABUS ke modules se MAP karta hai,
      isliye "kaunse topic se kaunsa question" exact batata hai.
  Step 4: papers/{id}.aiAnalysis me SAVE + analyzedAt timestamp
  Step 5: Paper Detail pe chart + summary render
  ```
- **Display example:**
  ```
  📊 Topic-wise (syllabus mapped):
  ████████ Module 3: Stacks & Queues — 40% (Q2, Q5, Q7, Q9)
  ██████   Module 1: Intro — 25% (Q1, Q3, Q8)
  ████     Module 5: Graphs — 20% (Q4, Q10)
  ██       Module 2: Arrays — 15% (Q6)
  ⚠️ Module 4 se is paper me kuch nahi aaya!
  ```
- **Caching rule:** Analysis TAB TAK FIXED jab tak naya paper upload na ho.
  Naya paper approve → subject aggregate re-compute trigger.
- **Subject aggregate ("3-saal trend"):** Subject ke SAARE papers + syllabus
  milake: "Module 3: pichle 3 saal me avg 40% — har saal Q2, Q5 yahi se!"

### 5C. AI QUIZ GENERATOR (Phase 2)
- **Kidhar:** Paper Detail pe "Practice Quiz" button.
- **Kya:** Paper ke questions se auto-MCQ quiz, score at end.
- **Kaise:** Paper text → Gemini ("5 MCQs banao with answers") →
  interactive quiz UI → score + review.

### 5D. IMPORTANT QUESTIONS PREDICTOR (Phase 2)
- **Kidhar:** Subject page pe "What to Expect" section.
- **Kya:** "Unit 3 se 10-mark question ke 80% chances!"
- **Kaise:** Subject ke saare analyses → Gemini trend prompt → predictions.

### 5E. AI MOCK TEST (Phase 2)
- **Kidhar:** Subject page pe "Mock Test" button.
- **Kya:** Multiple papers se questions → timed mock → auto-eval.
- **Kaise:** Topic weightage ke hisab se questions select → timer UI → submit → score.

### 5F. DOUBT SOLVER (Phase 2)
- **Kidhar:** Chat me "@ai" mention, ya dedicated doubt page.
- **Kya:** Question ka step-by-step solution.
- **Kaise:** "@ai ye question samjha do: [text/image]" → Gemini solution.

### 5G. SMART SEARCH (Phase 2)
- **Kidhar:** Search bar me natural language.
- **Kya:** "thermodynamics ke tough numericals" → relevant papers.
- **Kaise:** Gemini query interpret → filters me map → results.

### 5H. STUDY PLANNER (Phase 2)
- **Kidhar:** Subject page pe "Study Plan" button.
- **Kya:** "5 din me DSA" → day-wise plan.
- **Kaise:** Input (days) + topic weightage → Gemini plan generate.

---

## 6. DATA FLOW & CACHING RULES
- **Reads:** Direct Firestore (fast). Paper list cached client-side (5 min).
- **AI calls SIRF:** (1) upload dedup, (2) analysis on approve,
  (3) user-triggered AI features (quiz/mock/doubt).
- **Analysis cache:** per-paper fixed; subject aggregate recompute
  sirf naye approved paper pe.
- **Counts:** downloadCount/viewCount via batched increments (har view pe
  write nahi — throttle).

## 7. DATABASE SCHEMA (detailed)
```
subjects/{id}: { name, code (primary), codes[] (saare saal ke codes —
  e.g. Math ke liye ["MAT1001", "MAT1002", "MAT1003"]),
  program, semester, active, paperCount, createdAt }
  ← Ek subject ke MULTIPLE course codes ho sakte hain (har saal code badal
    sakta hai, par subject wahi). Papers section me subject ek hi dikhega,
    andar saare codes ke papers.
syllabus/{subjectId}: { modules: [{ number, title, topics[] }],
  pdfUrl, uploadedBy (admin uid), updatedAt }
  ← Har subject ka official syllabus. Notes isi ke modules se link.
  AI analysis syllabus ko reference banake topic mapping karta hai.
papers/{id}: { subjectId, subjectCode, examType, year, slot, faculty,
  fileUrl, fileName (auto), fileHash, textEmbedding (vector),
  uploadedBy (uid), uploaderName, status, rejectReason,
  aiAnalysis { topics[], patterns{}, tip, analyzedAt },
  downloads, views, createdAt }
notes/{id}: { subjectId, syllabusModule (number, syllabus se linked),
  title, fileUrl, pages, uploadedBy (admin uid), verified: true, createdAt }
  ← Notes syllabus ke module se judte hain (Module 3 → Module 3 ke notes)
users/{uid}: { name, email, photo, role, uploadCount, createdAt }
uploads/{id}: { userId, paperId, fileName, status, reason,
  duplicateOf (paperId?), createdAt }
requests/{id}: { subjectId, examType, year, requestedBy[],
  fulfilledBy (paperId?), createdAt }
reports/{id}: { paperId, reportedBy, reason, details, status, createdAt }
chatRooms/{id}: { name, type (lobby/subject), subjectId? }
chatRooms/{id}/messages/{mid}: { uid, name, text, attachments[],
  createdAt, edited?, deleted? }
syllabus/{subjectId} → Storage: `syllabus/{subjectCode}/syllabus.pdf`
```

---

## 8. FIREBASE SETUP & CONNECTION (STEP-BY-STEP)

### 8.1 Firebase project banana (Tim karega — 5 min)
```
1. console.firebase.google.com → "Add project" → naam: vitap-papers
2. Google Analytics: OFF (zaroorat nahi)
3. Project ke andar:
   a. Build → Authentication → Sign-in method → Google → Enable
      → Support email select → Save
   b. Build → Firestore Database → "Create database" →
      Start in production mode → Location: asia-south1 (Mumbai)
   c. Build → Storage → "Get started" → Production mode → asia-south1
   d. Project Settings (⚙️) → "Add app" → Web (</>) →
      nickname: vitap-web → config COPY karo
```

### 8.2 Code me connect kaise hoga
```javascript
// src/firebase/config.js — YEHI FILE FIREBASE SE JODTI HAI
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
```
- Keys `.env` file me (ye GitHub pe KABHI nahi jayegi).
- `.env.example` me khaali template.

### 8.3 Kaunsa service kidhar
| Service | Use |
|---|---|
| Authentication | Google login/logout |
| Firestore | subjects, syllabus, papers, notes, users, uploads, requests, reports, chat |
| Storage | PDFs: `papers/{code}/{file}`, `notes/{code}/{file}`, `syllabus/{code}/syllabus.pdf` |
| Hosting | `firebase deploy` → live site |

### 8.4 Security Rules (copy-paste ready)
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    function isMod() {
      return request.auth != null &&
        get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role in ['admin','moderator'];
    }
    match /papers/{id} {
      allow read: if true;                          // bina login padh sakte
      allow create, update, delete: if isMod();      // sirf mod/admin
    }
    match /notes/{id} {
      allow read: if true;
      allow create, update, delete: if isAdmin();     // sirf admin
    }
    match /syllabus/{id} {
      allow read: if true;
      allow write: if isAdmin();                     // sirf admin
    }
    match /subjects/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /uploads/{id} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isMod());
      allow create: if request.auth != null &&       // login zaroori
        request.resource.data.userId == request.auth.uid;
      allow update: if isMod();
    }
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow update: if isAdmin();
    }
    match /chatRooms/{room}/messages/{msg} {
      allow read: if true;                           // bina login padh sakte
      allow create: if request.auth != null;         // likhne ke liye login
      allow delete: if isMod();
    }
    match /requests/{id} {
      allow read: if true;
      allow create, update: if request.auth != null;
    }
    match /reports/{id} {
      allow read: if isMod();
      allow create: if request.auth != null;
    }
  }
}
```

---

## 9. AUTH RULES (GOOGLE LOGIN — READ vs WRITE)

### Golden Rule
> **PADHNA = BINA LOGIN ✅ | DALNA = LOGIN ZAROORI 🔒**

| Action | Bina login | Login user |
|---|---|---|
| Papers/notes/syllabus dekhna, download | ✅ | ✅ |
| AI analysis dekhna | ✅ | ✅ |
| Chat padhna | ✅ | ✅ |
| Paper upload | ❌ → login page | ✅ |
| Chat likhna | ❌ → login page | ✅ |
| Request/upvote/bookmark/report | ❌ → login page | ✅ |
| Notes/syllabus upload | ❌ | ❌ (admin only) |

### Pehli baar admin kaise banega
```
1. Tim Google se login → users/{uid} banta hai (role: "user")
2. Firebase Console → Firestore → users → Tim ka doc → role: "admin"
3. Uske baad admin panel se moderators banao
```

---

## 10. FILE/FOLDER STRUCTURE (ORGANIZED)

```
vitap-papers/
├── 📄 PLAN.md / DETAILED_PLAN.md / README.md
├── ⚙️ firebase.json / firestore.rules / storage.rules
├── ⚙️ firestore.indexes.json / .env.example / .gitignore
│
├── 📁 src/
│   ├── 🚀 main.jsx / App.jsx
│   │
│   ├── 📁 firebase/          ← Firebase connection
│   │   ├── config.js         ← initializeApp (YEHI JODTA HAI)
│   │   ├── auth.js           ← login/logout, auth state
│   │   ├── db.js             ← getPapers, getSubjects, getSyllabus…
│   │   └── storage.js        ← PDF upload/download
│   │
│   ├── 📁 ai/                ← Gemini logic
│   │   ├── gemini.js         ← API client
│   │   ├── duplicateCheck.js ← hash → embedding → verdict
│   │   └── paperAnalysis.js  ← syllabus-aware topic mapping
│   │
│   ├── 📁 components/        ← Reusable UI
│   │   ├── Navbar.jsx / SearchBar.jsx / PaperCard.jsx
│   │   ├── SubjectCard.jsx / StatusChip.jsx / PdfViewer.jsx
│   │   ├── AiAnalysisPanel.jsx / SyllabusViewer.jsx
│   │   ├── ExamCountdown.jsx / ReportButton.jsx
│   │   ├── ShareButton.jsx / ChatBox.jsx / YearTabs.jsx
│   │
│   ├── 📁 pages/
│   │   ├── Home.jsx / Papers.jsx / Syllabus.jsx
│   │   ├── PaperDetail.jsx / Notes.jsx / Upload.jsx
│   │   ├── MyUploads.jsx / Requests.jsx
│   │   ├── Chat.jsx / Login.jsx
│   │   └── 📁 admin/
│   │       ├── Dashboard.jsx / Moderation.jsx
│   │       ├── Subjects.jsx / SyllabusManager.jsx
│   │       ├── NotesManager.jsx / PapersManager.jsx
│   │       └── Users.jsx
│   │
│   ├── 📁 hooks/             ← useAuth, usePapers, useSubjects,
│   │                           useSyllabus, useChat
│   ├── 📁 utils/             ← fileHash, pdfText, fileName, format
│   └── 📁 styles/ / index.css
│
└── 📁 functions/             ← Phase 2: Cloud Functions
```

**Rules:** Ek file ek kaam. Firebase code sirf `firebase/` me. AI code sirf
`ai/` me. Pages me logic nahi (hooks me). Naya feature = naya component.

---

## 11. EDGE CASES & RULES
1. Same paper, different scan → embedding pakdega (hash nahi).
2. Partial paper (kuch pages missing) → moderator decide karega.
3. Wrong subject tag → report button / moderator reject "wrong subject".
4. Blurry/unreadable → reject "unreadable scan", re-upload allowed.
5. User apna rejected paper dobara upload kare → naya upload record, phir se check.
6. Admin paper delete kare → Storage file bhi delete + related upload records update.
7. Subject deactivate → naye uploads nahi, purane papers dikhte rahenge.
8. Exam countdown dates → admin panel me academic calendar feed karega.

## 12. OPEN QUESTIONS FOR TIM (working-related doubts)
1. Login: Google only, ya email/password bhi?
2. Chat: bina login padh sakte hain? (Suggest: haan padh sakte, likhne ke liye login)
3. Initial moderators kaun? (2-3 seniors chahiye)
4. Portal ka NAAM kya? (branding ke liye)
5. AI features Phase 2 me kaunse pehle? (Suggest: Quiz + Predictor)
6. Seed data: DSpace scraping tum karoge ya main guide dun?
7. Faculty tags mandatory ya optional rakhein?

## 13. PENDING: NEW ADMIN FEATURE (TIM BATAYEGA)
- Tim ne kaha: "ek feature admin ke pass, baad me batata"
- Jab batayega, yahan spec likhi jayegi: kya hoga, kidhar dikhega, kaise kaam karega.
- Status: ⏳ WAITING ON TIM
