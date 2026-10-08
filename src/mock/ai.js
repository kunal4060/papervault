/**
 * PaperVault — mock data (consolidated).
 * Migrated from data.js (deleted) — shapes mirror BACKEND_PLAN.md.
 * // TODO: firebase — swap for Firestore when wired up.
 */

export const MOCK_GEMINI_DUPLICATE_VERDICT = {
  duplicate: false,
  reason: "Questions and marks differ from the candidate — looks unique",
};

export const MOCK_GEMINI_ANALYSIS = {
  topics: [
    { module: 2, moduleTitle: "Search Algorithms", percentage: 40, questionCount: 4, questionNumbers: ["Q2", "Q5", "Q7", "Q9"] },
    { module: 1, moduleTitle: "Introduction to AI", percentage: 25, questionCount: 2, questionNumbers: ["Q1", "Q3"] },
    { module: 4, moduleTitle: "Machine Learning Basics", percentage: 20, questionCount: 2, questionNumbers: ["Q4", "Q6"] },
    { module: 5, moduleTitle: "Neural Networks", percentage: 15, questionCount: 1, questionNumbers: ["Q8"] },
  ],
  patterns: { marks: { "5": 2, "10": 1 }, types: ["descriptive", "numerical"] },
  syllabusCoverage: "Module 3 (Knowledge Representation) se is paper me koi question nahi aaya",
  tip: "Module 2 pakka kar lo — har saal sabse zyada questions yahi se aate hain.",
};
