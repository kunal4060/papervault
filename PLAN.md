# PaperVault — Complete Plan
**Date:** 8 Oct 2026 | **Status:** Planning (build not started — waiting on approval)

---

## 1. Project Overview
Ek web app (PWA) jahan VIT-AP students previous year question papers (CAT-1, CAT-2, FAT)
aur admin-verified notes access kar sakte hain. Papers crowdsourced hain, notes sirf
admin upload karta hai. Gemini AI duplicate detection, per-paper AI analysis, aur
community chat ke saath. **100% original code — kisi ka copy nahi.**

## 2. Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React (Vite) + Tailwind CSS — original code, scratch se |
| Backend | Firebase: Auth (Google login) + Firestore (database) + Storage (PDFs) |
| Hosting | Firebase Hosting (free) + PWA (phone pe install) |
| AI | Google Gemini API (Tim ki key) — duplicate detection + paper analysis |

## 3. Database Structure (Firestore)
- `subjects` — naam, course code, semester, program, active flag. **Admin banata/manage karta hai.**
- `papers` — subjectId, examType (CAT-1/CAT-2/FAT), year, slot, faculty (optional),
  fileUrl, fileHash, uploadedBy, status (pending/approved/rejected), rejectReason,
  aiAnalysis (cached), createdAt
- `notes` — subjectId, title, module/chapter, fileUrl, uploadedBy (admin only), createdAt
- `users` — naam, email, role (admin/moderator/user), createdAt
- `uploads` — userId, paperId, status, reason, createdAt (per-user history)
- `requests` — paper request board (kaunsa paper chahiye)
- `reports` — paper reports (wrong subject, blurry, etc.)
- `chatRooms` / `messages` — community chat (common lobby + subject-wise rooms)

## 4. Pages
1. **Home** — hero + badi search bar (course code), CAT-1/2/FAT quick chips,
   stats, popular subjects grid, trending papers, AI insight card,
   exam countdown, how-it-works, upload CTA
2. **Papers** — search + filters (subject, exam type, year, slot, faculty) → paper list
3. **Paper Detail** — in-browser PDF preview, download, AI analysis
   (topic-wise breakdown + question pattern + tip), similar papers,
   WhatsApp share button, report button
4. **Notes** — subject → module-wise admin-verified notes list
5. **Upload** — form: subject (admin-defined list se), exam type, year, slot,
   faculty (optional), PDF select → auto duplicate check → submit
6. **My Uploads** — history: Approved / Pending / Rejected + reason
   ("Duplicate of CAT-1 2024", "Unreadable scan", etc.)
7. **Requests** — "ye paper chahiye" board; users request, others fulfill
8. **Community Chat** — common lobby + subject-wise rooms; text/links/images/PDFs;
   real-time; optional AI doubt helper; admin moderation (delete/ban)
9. **Admin Panel** — moderation queue (approve/reject with reason), subjects
   create/edit/deactivate, notes upload, papers upload, users/roles, reports
   review, stats dashboard
10. **Login** — Google sign-in (uploads/chat ke liye; downloads bina login)

## 5. Upload Flow (detailed)
```
1. User form bharta hai: subject, exam type, year, slot, faculty, PDF
2. Client-side validation: sirf PDF, max size (e.g. 25MB)
3. File hash (SHA-256) → exact match? → INSTANT REJECT ("ye file pehle se hai")
4. Metadata tuple match (subject+exam+year+slot) → likely duplicate → Gemini confirm
5. PDF se text extract → embedding similarity vs existing papers
6. Doubtful case → Gemini verdict ("duplicate hai ya nahi?") + reason
7. Unique → status=pending → admin/moderator queue
8. Approve → live + subject AI trend refresh. Reject → user history me reason
```

## 6. AI Analysis (per paper)
- Paper approve hote hi Gemini PDF analyze karta hai (ek baar)
- Output: topic-wise distribution (% + question count per unit), question pattern
  (marks-wise, type-wise), 1-line study tip
- Firestore me `aiAnalysis` field me SAVE (cached)
- Paper detail page pe chart + summary ke roop me display
- **Rule: naya paper upload hone tak analysis fixed.** Naya paper →
  subject-level trend re-analysis trigger.
- Subject page pe aggregate: "pichle 3 saal me Unit 3 se 40% questions"

## 7. AI Features (Phase 2 — Tim ne abhi pick nahi kiye)
Options: AI Quiz Generator, Important Questions Predictor, AI Mock Test Generator,
Doubt Solver, Smart Search (natural language), AI Study Planner.
Recommendation: Quiz Generator + Important Predictor pehle.

## 8. Extra Features (confirmed)
- **Report button** (har paper pe): wrong subject / blurry / duplicate → admin queue
- **Exam countdown**: home pe "CAT-2 in X days" + relevant papers auto-suggest
  (VIT-AP academic calendar se dates)
- **WhatsApp share**: one-tap deep link share

## 9. Roles & Permissions
| Action | User | Moderator | Admin |
|---|---|---|---|
| Papers download (no login) | ✅ | ✅ | ✅ |
| Paper upload | ✅ | ✅ | ✅ |
| Approve/reject uploads | ❌ | ✅ | ✅ |
| Notes upload | ❌ | ❌ | ✅ |
| Subjects create/edit | ❌ | ❌ | ✅ |
| Chat moderate (delete/ban) | ❌ | ✅ | ✅ |
| User roles manage | ❌ | ❌ | ✅ |

## 10. Design Principles
- Mobile-first (most students phone pe aayenge)
- No-login downloads (friction zero)
- Course-code search sabse prominent
- Standardized auto filenames: `CSE3002_CAT-2_2025_F1.pdf`
- Dark mode support
- Hindi/English mix nahi — UI English, simple language

## 11. Phases
- **Phase 1 (MVP):** Home, Papers browse/search, Paper detail + download,
  Upload + history, Admin basic (moderation + subjects), Auth
- **Phase 2:** Notes section, Gemini dedup full pipeline, AI analysis per paper,
  Request board, Report button, WhatsApp share, Exam countdown
- **Phase 3:** Community chat, AI Quiz/Predictor, Mock test generator,
  notifications, leaderboard

## 12. Risks & Mitigation (Tim ke "what am I missing" se)
1. **Cold start** — launch pe zero papers. Mitigation: DSpace se seed data,
   WhatsApp/Telegram groups se collection launch se pehle.
2. **Competition (pyqvitap)** — 5000+ papers already. Mitigation: differentiators
   (AI analysis, dedup, notes, chat) ko front pe rakho.
3. **Moderation bandwidth** — exam week me flood. Mitigation: 2-3 moderators
   (trusted seniors), Gemini pre-filter se load kam.
4. **Quality** — blurry scans, wrong tags. Mitigation: upload guidelines,
   report button, moderator review.
5. **Abuse/spam** — file validation + rate limits + chat word filter.
6. **Traffic spikes** — exam week load. Mitigation: Firebase quotas monitor,
   caching, PWA offline.
7. **Marketing** — WhatsApp groups, Instagram, classroom shoutouts. Launch plan chahiye.
8. **Privacy** — papers pe student names/IDs ho sakte hain. Guideline: personal
   info wale papers flag karo.

## 13. Cost Estimate
- Firebase (Auth/Firestore/Storage/Hosting): free tier se start (~₹0)
- Gemini API: free tier / pay-as-you-go, sirf uploads pe calls (~₹0 start me)
- Domain (optional, baad me): ~₹800/saal
- **Total start cost: ₹0**

## 14. Tim ko kya karna hai (before build)
1. ✅ Plan approve karo
2. Firebase project banao (guide dunga — 5 min)
3. Gemini API key do (tumhare paas hai)
4. Decide: admin kaun (tum khud?) + 2-3 moderators kaun
5. Portal ka naam final karo
6. Seed data: DSpace/papers collection shuru karo

## 15. Build shuru hone ke baad
- Main poora code likhunga (original, scratch se)
- Tum Firebase console me project setup karoge (guide ke saath)
- Pehla deploy → tum phone pe test karoge → feedback → iterate
