/**
 * duplicateCheck.js — 6-step duplicate detection for paper uploads.
 *
 * Implements DETAILED_PLAN.md §4, returns BACKEND_PLAN.md §5.1
 * DuplicateCheckResponse.
 *
 * Cost ladder (cheapest first — 90%+ uploads resolve in steps 1-2):
 *   [1] SHA-256 hash match        → free, instant
 *   [2] Metadata tuple match      → free (Firestore query)
 *   [3] Embedding cosine sim      → cheap (Gemini embedding API)
 *   [4] Gemini verdict            → only for doubtful 0.85–0.95 band
 *
 * Thresholds (tunable):
 *   SIM_DUPLICATE = 0.95  → above = duplicate
 *   SIM_DOUBTFUL  = 0.85  → 0.85–0.95 = ask Gemini
 *                           below     = unique
 */

import {
  getEmbedding,
  generateJSON,
  cosineSimilarity,
  GEMINI_CONNECTED,
} from "./gemini.js";

export const SIM_DUPLICATE = 0.95;
export const SIM_DOUBTFUL = 0.85;

/**
 * @typedef {object} DuplicateCheckRequest
 * @property {string} fileHash — SHA-256 hex of the uploaded PDF
 * @property {string} subjectId
 * @property {string} examType — "CAT-1" | "CAT-2" | "FAT" | "Lab FAT"
 * @property {number} year
 * @property {string} slot
 * @property {string} textSample — first ~2000 chars of PDF text
 * @property {Array<{id:string, fileHash?:string, subjectId:string,
 *   examType:string, year:number, slot:string,
 *   title:string, textEmbedding?:number[], textSample?:string}>} existingPapers
 *   — approved papers of the SAME subject (fetched by caller; keeps this
 *   module Firestore-agnostic so Cloud Functions can reuse it unchanged)
 */

/**
 * @typedef {object} DuplicateCheckResponse
 * @property {boolean} isDuplicate
 * @property {string} reason — human-readable, shown in upload history
 * @property {string} [duplicateOf] — paperId when duplicate
 * @property {string} [duplicateTitle] — title of the matched paper
 * @property {boolean} [aiChecked] — true when the Gemini verdict step
 *   actually ran (doubtful band). Undefined/false = AI wasn't needed or
 *   couldn't run — treat as manual-review.
 */

/**
 * Run the duplicate check.
 * @param {DuplicateCheckRequest} req
 * @returns {Promise<DuplicateCheckResponse>}
 */
export async function checkDuplicate(req) {
  const {
    fileHash,
    subjectId,
    examType,
    year,
    slot,
    textSample,
    existingPapers = [],
  } = req;

  // — Step 1: exact file hash ————————————————————————————————
  const hashHit = existingPapers.find(
    (p) => p.fileHash && p.fileHash.toLowerCase() === fileHash.toLowerCase()
  );
  if (hashHit) {
    return {
      isDuplicate: true,
      reason: "Ye exact file pehle se upload hai.",
      duplicateOf: hashHit.id,
      duplicateTitle: hashHit.title,
    };
  }

  // — Step 2: metadata tuple candidates ———————————————————————
  // Same (exam, year, slot) within the subject is suspicious; it becomes a
  // priority candidate for the similarity steps below.
  const metaCandidates = existingPapers.filter(
    (p) =>
      p.subjectId === subjectId &&
      p.examType === examType &&
      p.year === year &&
      p.slot.toLowerCase() === slot.toLowerCase()
  );

  // — Step 3: embedding similarity ————————————————————————————
  // Compare against same-subject papers (metadata candidates first).
  const pool = [
    ...metaCandidates,
    ...existingPapers.filter((p) => !metaCandidates.includes(p)),
  ];
  if (pool.length === 0) {
    return { isDuplicate: false, reason: "Unique — pehla paper hai." };
  }

  // Embedding step is key-gated: getEmbedding() throws when no key.
  // On any embedding failure we skip to the metadata-only branch below —
  // we never fabricate similarity scores.
  let queryVec = null;
  try {
    queryVec = await getEmbedding(textSample);
  } catch (err) {
    console.warn("[duplicateCheck] embedding step skipped:", err.message);
  }

  let best = null;
  let bestSim = -1;
  if (queryVec) {
    for (const p of pool) {
      if (!p.textEmbedding?.length) continue;
      const sim = cosineSimilarity(queryVec, p.textEmbedding);
      if (sim > bestSim) {
        bestSim = sim;
        best = p;
      }
    }
  }

  // No embedding available (no key / embed error) or no stored embeddings
  // (e.g. legacy papers) → fall back to metadata only.
  if (!best) {
    if (metaCandidates.length > 0) {
      const c = metaCandidates[0];
      return {
        isDuplicate: true,
        reason:
          `Same ${examType} ${year} (${slot}) ka paper pehle se hai — ` +
          "manual review me bheja gaya.",
        duplicateOf: c.id,
        duplicateTitle: c.title,
      };
    }
    return { isDuplicate: false, reason: "Unique — koi match nahi mila." };
  }

  // — Step 4: threshold decision ——————————————————————————————
  if (bestSim >= SIM_DUPLICATE) {
    return {
      isDuplicate: true,
      reason: `Bahut similar paper pehle se hai (${Math.round(bestSim * 100)}% match).`,
      duplicateOf: best.id,
      duplicateTitle: best.title,
    };
  }

  if (bestSim >= SIM_DOUBTFUL) {
    // — Step 5: Gemini verdict (doubtful band only) ————————————
    const verdict = await geminiVerdict(textSample, best);
    if (verdict.duplicate) {
      return {
        isDuplicate: true,
        reason: `AI check: duplicate lagta hai — ${verdict.reason}`,
        duplicateOf: best.id,
        duplicateTitle: best.title,
        aiChecked: true,
      };
    }
    return {
      isDuplicate: false,
      reason: `AI check: alag paper hai — ${verdict.reason}`,
      aiChecked: verdict.aiChecked === true,
    };
  }

  return {
    isDuplicate: false,
    reason: "Unique — koi similar paper nahi mila.",
  };
}

/**
 * Ask Gemini whether two papers are the same.
 * Exact prompt from BACKEND_PLAN.md §5.3.
 * @param {string} textB — new upload's text sample
 * @param {{title:string, textSample?:string}} candidate — existing paper
 * @returns {Promise<{duplicate:boolean, reason:string, aiChecked:boolean}>}
 *   aiChecked is true only when Gemini actually ran and answered.
 */
async function geminiVerdict(textB, candidate) {
  // Without a key there is no AI check — flag honestly for manual review.
  if (!GEMINI_CONNECTED) {
    return {
      duplicate: false,
      reason: "AI check unavailable — manual review ke liye bheja gaya.",
      aiChecked: false,
    };
  }
  const textA = (candidate.textSample || "").slice(0, 2000);
  const prompt = `You are a duplicate detector for university question papers.
Paper A (existing): """${textA}"""
Paper B (new upload): """${textB.slice(0, 2000)}"""
Are these the SAME question paper? Consider: same questions, same order,
same marks = duplicate. Different year/exam with different questions = not duplicate.
Reply in JSON: {"duplicate": true/false, "reason": "one line"}`;

  let out = null;
  try {
    out = await generateJSON(prompt);
  } catch (err) {
    return {
      duplicate: false,
      reason: `AI check failed (${err?.message || "unknown error"}) — manual review ke liye bheja gaya.`,
      aiChecked: false,
    };
  }

  return {
    duplicate: Boolean(out?.duplicate),
    reason: String(out?.reason || "no reason given").slice(0, 200),
    aiChecked: true,
  };
}
