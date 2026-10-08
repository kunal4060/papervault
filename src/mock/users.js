/**
 * PaperVault — mock data (consolidated).
 * Migrated from data.js (deleted) — shapes mirror BACKEND_PLAN.md.
 * // TODO: firebase — swap for Firestore when wired up.
 */

export const users = {
  "user-mock-1": {
    uid: "user-mock-1",
    name: "Mock Student",
    email: "student@vitap.mock",
    photo: null,
    role: "user",
    uploadCount: 3,
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  "admin-mock-1": {
    uid: "admin-mock-1",
    name: "Vault Admin",
    email: "admin@papervault.mock",
    photo: null,
    role: "admin",
    uploadCount: 6,
    createdAt: "2026-01-05T08:00:00.000Z",
  },
  "mod-mock-1": {
    uid: "mod-mock-1",
    name: "Senior Moderator",
    email: "mod@papervault.mock",
    photo: null,
    role: "moderator",
    uploadCount: 0,
    createdAt: "2026-02-01T08:00:00.000Z",
  },
};

// ---------------------------------------------------------------------------
// chat rooms + messages  (BACKEND_PLAN §3.9) — 8 messages in the lobby
// ---------------------------------------------------------------------------
