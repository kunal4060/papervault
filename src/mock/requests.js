/**
 * PaperVault — mock paper requests (BACKEND_PLAN §3.7).
 * // TODO: firebase — swap for Firestore when wired up.
 */
export const requests = [
  {
    id: "req-1",
    subjectId: "subj-bit1001",
    examType: "FAT",
    year: 2024,
    requestedBy: ["user-mock-3", "user-mock-4", "user-mock-5"],
    createdAt: "2026-10-06T12:00:00.000Z",
  },
  {
    id: "req-2",
    subjectId: "subj-cse2008",
    examType: "CAT-2",
    year: 2025,
    requestedBy: ["user-mock-2"],
    fulfilledBy: "paper-cse2008-cat2-2025",
    createdAt: "2026-10-04T09:00:00.000Z",
  },
];
