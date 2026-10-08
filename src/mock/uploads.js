/**
 * PaperVault — mock uploads (BACKEND_PLAN §3.6).
 * // TODO: firebase — swap for Firestore when wired up.
 */
export const uploads = [
  {
    id: "upl-1",
    userId: "user-mock-1",
    paperId: "paper-cse3002-cat2-2025",
    fileName: "CSE3002_CAT-2_2025_F1.pdf",
    subjectId: "subj-cse3002",
    examType: "CAT-2",
    year: 2025,
    status: "approved",
    createdAt: "2026-10-05T14:00:00.000Z",
  },
  {
    id: "upl-2",
    userId: "user-mock-1",
    fileName: "MAT1001_FAT_2024_B2.pdf",
    subjectId: "subj-mat1001",
    examType: "FAT",
    year: 2024,
    status: "pending",
    createdAt: "2026-10-07T10:30:00.000Z",
  },
  {
    id: "upl-3",
    userId: "user-mock-1",
    fileName: "scan001.pdf",
    subjectId: "subj-cse2008",
    examType: "CAT-1",
    year: 2025,
    status: "rejected",
    reason: "Unreadable scan — dobara clear photo upload karo",
    createdAt: "2026-10-06T18:20:00.000Z",
  },
];

export const getUploadsByUser = (uid) =>
  uploads.filter((u) => u.userId === uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
