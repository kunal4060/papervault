/**
 * PaperVault — mock data (consolidated).
 * Migrated from data.js (deleted) — shapes mirror BACKEND_PLAN.md.
 * // TODO: firebase — swap for Firestore when wired up.
 */

export const chatRooms = [
  { id: "lobby", name: "Common Lobby", type: "lobby" },
  { id: "subj-cse3002", name: "CSE3002 — AI", type: "subject", subjectId: "subj-cse3002" },
  { id: "subj-cse2008", name: "CSE2008 — DSA", type: "subject", subjectId: "subj-cse2008" },
  { id: "subj-mat1001", name: "MAT1001 — Math", type: "subject", subjectId: "subj-mat1001" },
];

export const chatMessages = [
  {
    id: "msg-1",
    roomId: "lobby",
    uid: "user-mock-2",
    name: "Aarav Nair",
    text: "Bhaiyo, CAT-2 ke liye CSE3002 ka F1 slot wala paper upload kar diya — PaperVault pe live hai ✅",
    attachments: [],
    createdAt: "2026-10-07T19:02:00.000Z",
  },
  {
    id: "msg-2",
    roomId: "lobby",
    uid: "user-mock-3",
    name: "Sneha Reddy",
    text: "FAT 2024 ka DBMS paper kisi ke paas hai? Request board pe upvote kar do please",
    attachments: [],
    createdAt: "2026-10-07T19:15:00.000Z",
  },
  {
    id: "msg-3",
    roomId: "lobby",
    uid: "user-mock-4",
    name: "Rohan Iyer",
    text: "Mere paas hai, kal scan karke upload karta hun. Slot E1 tha na?",
    attachments: [],
    createdAt: "2026-10-07T19:20:00.000Z",
  },
  {
    id: "msg-4",
    roomId: "lobby",
    uid: "user-mock-3",
    name: "Sneha Reddy",
    text: "Haan E1. Tumne upload kiya to request auto-fulfill ho jayegi 🔔",
    attachments: [],
    createdAt: "2026-10-07T19:22:00.000Z",
  },
  {
    id: "msg-5",
    roomId: "lobby",
    uid: "user-mock-1",
    name: "Mock Student",
    text: "AI ka analysis feature kamaal ka hai — Module 2 se 40% questions aate hain, ab pata chala kya padhna hai 😅",
    attachments: [],
    createdAt: "2026-10-07T20:05:00.000Z",
  },
  {
    id: "msg-6",
    roomId: "lobby",
    uid: "mod-mock-1",
    name: "Senior Moderator",
    text: "Reminder: upload karte waqt sahi subject select karo. Galat subject wale papers reject ho jayenge.",
    attachments: [],
    createdAt: "2026-10-07T21:00:00.000Z",
  },
  {
    id: "msg-7",
    roomId: "lobby",
    uid: "user-mock-5",
    name: "Priya Menon",
    text: "Kya notes bhi upload kar sakte hain? Mere paas DSA ke handwritten notes hain",
    attachments: [],
    createdAt: "2026-10-07T21:30:00.000Z",
  },
  {
    id: "msg-8",
    roomId: "lobby",
    uid: "mod-mock-1",
    name: "Senior Moderator",
    text: "Notes sirf admin upload karte hain (verified rehte hain). Apne notes papers ke saath share karo ya admin ko bhejo!",
    attachments: [],
    createdAt: "2026-10-07T21:35:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// mock Gemini responses (ai/gemini.js mock mode) — shaped like the real
// BACKEND_PLAN §5.3 contracts.
// ---------------------------------------------------------------------------
