/**
 * paperAnalysis.js — syllabus-aware AI analysis of a question paper.
 *
 * Implements DETAILED_PLAN.md §5B, returns BACKEND_PLAN.md §3.3 PaperAnalysis.
 *
 * Trigger: paper APPROVED (admin/mod) or admin direct upload — exactly once.
 * Result is cached in papers/{id}.aiAnalysis and stays FIXED until a new
 * paper for the same subject is approved (then the subject aggregate
 * refreshes — see aggregateSubjectTrend below).
 *
 * The key idea: Gemini maps EVERY question to a syllabus module, so the UI
 * can show "Module 3 se Q2, Q5, Q7, Q9 aaye (40%)" instead of vague topics.
 */

import { generateJSON } from "./gemini.js";

/**
 * @typedef {object} SyllabusModule
 * @property {number} number
 * @property {string} title
 * @property {string[]} topics
 */

/**
 * @typedef {object} PaperAnalysis — matches BACKEND_PLAN.md §3.3
 * @property {Array<{module:number, moduleTitle:string, percentage:number,
 *   questionCount:number, questionNumbers:string[]}>} topics
 * @property {{marks:Record<string,number>, types:string[]}} patterns
 * @property {string} syllabusCoverage
 * @property {string} tip
 * @property {any} analyzedAt — Firestore Timestamp (set by caller on save)
 */

/**
 * Analyze one paper against its subject's syllabus.
 * Exact prompt from BACKEND_PLAN.md §5.3.
 *
 * @param {object} args
 * @param {string} args.paperText — full extracted paper text
 * @param {SyllabusModule[]} args.syllabusModules — from syllabus/{subjectId}
 * @returns {Promise<Omit<PaperAnalysis,"analyzedAt">>}
 */
export async function analyzePaper({ paperText, syllabusModules }) {
  if (!paperText?.trim()) {
    throw new Error("analyzePaper: empty paperText");
  }
  if (!syllabusModules?.length) {
    throw new Error("analyzePaper: syllabusModules missing — upload syllabus first");
  }

  const modulesJson = JSON.stringify(
    syllabusModules.map((m) => ({
      module: m.number,
      title: m.title,
      topics: m.topics,
    }))
  );

  const prompt = `You are analyzing a university question paper against its syllabus.
Syllabus modules: ${modulesJson}
Paper text: """${paperText.slice(0, 12000)}"""
Return JSON:
{ "topics": [{"module": 3, "moduleTitle": "...", "percentage": 40,
               "questionCount": 4, "questionNumbers": ["Q2","Q5"]}],
  "patterns": {"marks": {"5": 2, "10": 1}, "types": ["MCQ","descriptive"]},
  "syllabusCoverage": "which modules had zero questions",
  "tip": "one-line study tip" }
Map EVERY question to a syllabus module. Be precise with question numbers.`;

  // Throws an honest error when the key is missing — never fabricates analysis.
  const raw = await generateJSON(prompt);
  return sanitizeAnalysis(raw, syllabusModules);
}

/**
 * Validate + normalize Gemini output so the UI never breaks on a bad response.
 * @param {any} raw
 * @param {SyllabusModule[]} syllabusModules
 * @returns {Omit<PaperAnalysis,"analyzedAt">}
 */
function sanitizeAnalysis(raw, syllabusModules) {
  const moduleTitles = new Map(syllabusModules.map((m) => [m.number, m.title]));

  const topics = (Array.isArray(raw.topics) ? raw.topics : [])
    .filter((t) => typeof t?.module === "number")
    .map((t) => ({
      module: t.module,
      moduleTitle: String(
        t.moduleTitle || moduleTitles.get(t.module) || `Module ${t.module}`
      ),
      percentage: clampNum(t.percentage, 0, 100),
      questionCount: Math.max(0, Math.round(Number(t.questionCount) || 0)),
      questionNumbers: (Array.isArray(t.questionNumbers)
        ? t.questionNumbers
        : []
      ).map(String).slice(0, 30),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Renormalize percentages to sum ~100 when the model drifts.
  const total = topics.reduce((s, t) => s + t.percentage, 0);
  if (total > 0 && Math.abs(total - 100) > 5) {
    topics.forEach((t) => {
      t.percentage = Math.round((t.percentage / total) * 100);
    });
  }

  const patterns = raw.patterns && typeof raw.patterns === "object" ? raw.patterns : {};
  return {
    topics,
    patterns: {
      marks:
        patterns.marks && typeof patterns.marks === "object" ? patterns.marks : {},
      types: (Array.isArray(patterns.types) ? patterns.types : []).map(String),
    },
    syllabusCoverage: String(raw.syllabusCoverage || "").slice(0, 500),
    tip: String(raw.tip || "").slice(0, 300),
  };
}

/**
 * Aggregate many papers' analyses into a subject-level "3-saal trend".
 * Called when a new paper is approved (cache invalidation per §5B).
 *
 * @param {Array<Omit<PaperAnalysis,"analyzedAt">>} analyses
 * @param {SyllabusModule[]} syllabusModules
 * @returns {Array<{module:number, moduleTitle:string, avgPercentage:number,
 *   papersCovered:number, commonQuestions:string[]}>}
 */
export function aggregateSubjectTrend(analyses, syllabusModules) {
  const moduleTitles = new Map(syllabusModules.map((m) => [m.number, m.title]));
  /** @type {Map<number, {sum:number, n:number, qCounts:Map<string,number>}>} */
  const acc = new Map();

  for (const a of analyses) {
    for (const t of a.topics || []) {
      let e = acc.get(t.module);
      if (!e) {
        e = { sum: 0, n: 0, qCounts: new Map() };
        acc.set(t.module, e);
      }
      e.sum += t.percentage || 0;
      e.n += 1;
      for (const q of t.questionNumbers || []) {
        e.qCounts.set(q, (e.qCounts.get(q) || 0) + 1);
      }
    }
  }

  return [...acc.entries()]
    .map(([module, e]) => ({
      module,
      moduleTitle: moduleTitles.get(module) || `Module ${module}`,
      avgPercentage: Math.round(e.sum / Math.max(1, e.n)),
      papersCovered: e.n,
      // Question labels appearing in 2+ papers = recurring pattern.
      commonQuestions: [...e.qCounts.entries()]
        .filter(([, c]) => c >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([q]) => q),
    }))
    .sort((a, b) => b.avgPercentage - a.avgPercentage);
}

function clampNum(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(hi, Math.max(lo, n));
}
