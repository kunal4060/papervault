/**
 * PaperVault — mock data barrel.
 *
 * Re-exports everything in src/mock/ plus a few cross-cutting helpers.
 * All shapes mirror BACKEND_PLAN.md §3 interfaces; timestamps are ISO strings.
 *
 * // TODO: firebase — swap these imports for Firestore queries when wired up.
 */

export { subjects, getSubjectById, getSubjectByCode } from "./subjects.js";
export {
  papers,
  getPapersBySubject,
  getPapersByYear,
  getPaperById,
  getTrendingPapers,
} from "./papers.js";
export { syllabi, getSyllabus } from "./syllabus.js";
export { notes, getNotesBySubject, getNotesByModule } from "./notes.js";
export { users } from "./users.js";
export { chatRooms, chatMessages } from "./chat.js";
export { MOCK_GEMINI_DUPLICATE_VERDICT, MOCK_GEMINI_ANALYSIS } from "./ai.js";
export { uploads, getUploadsByUser } from "./uploads.js";
export { requests } from "./requests.js";
export { syllabi as syllabus } from "./syllabus.js";

import { subjects, getSubjectById } from "./subjects.js";
import { getPapersBySubject } from "./papers.js";
import { getSyllabus } from "./syllabus.js";
import { getNotesBySubject } from "./notes.js";

/**
 * Subject detail bundle: subject + syllabus + papers + notes + aggregate AI stats.
 * Powers the subject page (§3.2): year-wise papers, modules with notes,
 * and the subject-level AI analysis at the bottom.
 */
export function getSubjectDetail(subjectId) {
  const subject = getSubjectById(subjectId);
  if (!subject) return null;
  const papers = getPapersBySubject(subjectId);
  const syllabus = getSyllabus(subjectId) || null;
  const notes = getNotesBySubject(subjectId);

  // Aggregate topic percentages across all papers' aiAnalysis (§5B subject trend)
  const topicTotals = {};
  let paperCount = 0;
  for (const p of papers) {
    if (!p.aiAnalysis) continue;
    paperCount += 1;
    for (const t of p.aiAnalysis.topics) {
      const key = t.module;
      if (!topicTotals[key]) {
        topicTotals[key] = { module: t.module, moduleTitle: t.moduleTitle, total: 0, n: 0 };
      }
      topicTotals[key].total += t.percentage;
      topicTotals[key].n += 1;
    }
  }
  const aggregateTopics = Object.values(topicTotals)
    .map((t) => ({
      module: t.module,
      moduleTitle: t.moduleTitle,
      avgPercentage: Math.round(t.total / t.n),
      papersAnalyzed: paperCount,
    }))
    .sort((a, b) => b.avgPercentage - a.avgPercentage);

  // Papers grouped by year (desc) for year-wise browsing
  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);
  const papersByYear = years.map((year) => ({
    year,
    papers: papers
      .filter((p) => p.year === year)
      .sort((a, b) => b.downloads - a.downloads),
  }));

  return { subject, syllabus, papers, papersByYear, years, notes, aggregateTopics };
}

/** Global search across subject names + all codes (course-code search). */
export function searchSubjects(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return subjects.filter(
    (s) =>
      s.active &&
      (s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.codes.some((c) => c.toLowerCase().includes(q)))
  );
}

/** Total counts for the home-page stats strip. */
export function getStats() {
  return {
    papers: 30,
    subjects: subjects.filter((s) => s.active).length,
    notes: 15,
  };
}
