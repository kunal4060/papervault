/**
 * PaperVault — mock notes (15).
 * Mirrors BACKEND_PLAN.md §3.4 Note interface.
 * Every note is linked to a syllabus module (syllabusModule number).
 * Admin-only uploads, verified: true.
 */

export const notes = [
  // DSA (5)
  {
    id: "note-001",
    subjectId: "subj-dsa",
    syllabusModule: 1,
    title: "Complexity & Arrays — Complete Notes",
    fileUrl: "https://storage.mock/notes/CSE2001/m1/complexity-arrays.pdf",
    pages: 24,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-02T10:00:00.000Z",
  },
  {
    id: "note-002",
    subjectId: "subj-dsa",
    syllabusModule: 2,
    title: "Linked Lists — Visual Guide",
    fileUrl: "https://storage.mock/notes/CSE2001/m2/linked-lists.pdf",
    pages: 18,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-05T10:00:00.000Z",
  },
  {
    id: "note-003",
    subjectId: "subj-dsa",
    syllabusModule: 3,
    title: "Stacks & Queues — Master Notes",
    fileUrl: "https://storage.mock/notes/CSE2001/m3/stacks-queues.pdf",
    pages: 32,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-08T10:00:00.000Z",
  },
  {
    id: "note-004",
    subjectId: "subj-dsa",
    syllabusModule: 3,
    title: "Stack Applications — Practice Problems",
    fileUrl: "https://storage.mock/notes/CSE2001/m3/stack-practice.pdf",
    pages: 12,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-10T10:00:00.000Z",
  },
  {
    id: "note-005",
    subjectId: "subj-dsa",
    syllabusModule: 5,
    title: "Graphs — BFS/DFS/Dijkstra Explained",
    fileUrl: "https://storage.mock/notes/CSE2001/m5/graphs.pdf",
    pages: 28,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-12T10:00:00.000Z",
  },
  // AI (4)
  {
    id: "note-006",
    subjectId: "subj-ai",
    syllabusModule: 1,
    title: "AI Agents & PEAS Framework",
    fileUrl: "https://storage.mock/notes/CSE3002/m1/agents.pdf",
    pages: 16,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-03T10:00:00.000Z",
  },
  {
    id: "note-007",
    subjectId: "subj-ai",
    syllabusModule: 2,
    title: "Search Algorithms — A* Deep Dive",
    fileUrl: "https://storage.mock/notes/CSE3002/m2/search.pdf",
    pages: 30,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-06T10:00:00.000Z",
  },
  {
    id: "note-008",
    subjectId: "subj-ai",
    syllabusModule: 3,
    title: "Logic & Reasoning — Propositional to FOL",
    fileUrl: "https://storage.mock/notes/CSE3002/m3/logic.pdf",
    pages: 22,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-09T10:00:00.000Z",
  },
  {
    id: "note-009",
    subjectId: "subj-ai",
    syllabusModule: 4,
    title: "ML Basics — Regression to Decision Trees",
    fileUrl: "https://storage.mock/notes/CSE3002/m4/ml-basics.pdf",
    pages: 26,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-11T10:00:00.000Z",
  },
  // COA (3)
  {
    id: "note-010",
    subjectId: "subj-coa",
    syllabusModule: 1,
    title: "Digital Logic — Gates to Circuits",
    fileUrl: "https://storage.mock/notes/CSA2001/m1/digital-logic.pdf",
    pages: 20,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-04T10:00:00.000Z",
  },
  {
    id: "note-011",
    subjectId: "subj-coa",
    syllabusModule: 2,
    title: "ALU Design — Step by Step",
    fileUrl: "https://storage.mock/notes/CSA2001/m2/alu.pdf",
    pages: 18,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-07T10:00:00.000Z",
  },
  {
    id: "note-012",
    subjectId: "subj-coa",
    syllabusModule: 4,
    title: "Cache Memory — Numericals Solved",
    fileUrl: "https://storage.mock/notes/CSA2001/m4/cache.pdf",
    pages: 14,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-10T10:00:00.000Z",
  },
  // DMS (3)
  {
    id: "note-013",
    subjectId: "subj-dms",
    syllabusModule: 1,
    title: "Mathematical Logic — Truth Tables & Proofs",
    fileUrl: "https://storage.mock/notes/BIT1001/m1/logic.pdf",
    pages: 22,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-05T10:00:00.000Z",
  },
  {
    id: "note-014",
    subjectId: "subj-dms",
    syllabusModule: 3,
    title: "Combinatorics — Counting Masterclass",
    fileUrl: "https://storage.mock/notes/BIT1001/m3/combinatorics.pdf",
    pages: 20,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-08T10:00:00.000Z",
  },
  {
    id: "note-015",
    subjectId: "subj-dms",
    syllabusModule: 5,
    title: "Groups, Rings & Fields — Crash Notes",
    fileUrl: "https://storage.mock/notes/BIT1001/m5/algebra.pdf",
    pages: 16,
    uploadedBy: "uid-admin",
    verified: true,
    createdAt: "2025-09-11T10:00:00.000Z",
  },
];

export const getNotesBySubject = (subjectId) =>
  notes
    .filter((n) => n.subjectId === subjectId)
    .sort((a, b) => a.syllabusModule - b.syllabusModule);

export const getNotesByModule = (subjectId, moduleNumber) =>
  notes.filter(
    (n) => n.subjectId === subjectId && n.syllabusModule === moduleNumber
  );
