/**
 * PaperVault Gemini client wrapper. BACKEND_PLAN.md §5.
 *
 * // TODO: wire real API — for production, move these calls to Cloud Functions
 * (§6: same request/response contract, frontend unchanged). Client-side calls
 * are for the MVP only.
 *
 * Behavior:
 *  - VITE_GEMINI_API_KEY present → real call to the Generative Language API.
 *  - No key → MOCK MODE: returns canned JSON so every flow stays testable.
 */
import { MOCK_GEMINI_DUPLICATE_VERDICT, MOCK_GEMINI_ANALYSIS } from "../mock/index.js";

const API_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_GEMINI_API_KEY) ||
  "";
const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** True when a real key is configured. */
export const GEMINI_CONNECTED = Boolean(API_KEY);

/**
 * Send a prompt to Gemini.
 * @param {string} prompt
 * @param {{ jsonMode?: boolean }} [opts] — ask for a JSON response
 * @returns {Promise<{ text: string, data: any|null, mock: boolean }>}
 *   `data` is the parsed JSON when jsonMode is true and parsing succeeds.
 */
export async function callGemini(prompt, { jsonMode = true } = {}) {
  if (!GEMINI_CONNECTED) {
    return mockGeminiResponse(prompt, jsonMode);
  }

  // TODO: wire real API — this path is untested against live quotas; add
  // retries/backoff and server-side rate limiting before production.
  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: jsonMode
        ? { responseMimeType: "application/json" }
        : undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text, data: jsonMode ? safeParse(text) : null, mock: false };
}

/** Extract JSON from a model response (handles ```json fences). */
function safeParse(text) {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Embedding + convenience wrappers (BACKEND_PLAN.md §5.1 contract).
// ---------------------------------------------------------------------------

const EMBED_MODEL = "text-embedding-004";
const EMBED_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent`;

/**
 * Get an embedding vector for a text snippet (dedup similarity).
 * @param {string} text — keep short (~2000 chars)
 * @returns {Promise<number[]>} embedding vector
 */
export async function getEmbedding(text) {
  if (!GEMINI_CONNECTED) {
    console.warn(
      "[gemini] VITE_GEMINI_API_KEY missing — getEmbedding() returning mock vector."
    );
    return mockEmbedding(text);
  }
  const res = await fetch(`${EMBED_ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text: text.slice(0, 8000) }] },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini embed error: ${res.status}`);
  }
  const json = await res.json();
  return json.embedding.values;
}

/**
 * Ask Gemini for a structured JSON answer.
 * @param {string} prompt — must instruct JSON-only output
 * @param {any} [fallback=null] — returned in mock mode when provided
 * @returns {Promise<any>} parsed JSON
 */
export async function generateJSON(prompt, fallback = null) {
  const { data, mock } = await callGemini(prompt, { jsonMode: true });
  if (mock && fallback !== null) return fallback;
  if (data === null) {
    throw new Error("Gemini returned unparseable JSON.");
  }
  return data;
}

/**
 * Cosine similarity between two embedding vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} 0..1 (1 = identical)
 */
export function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  // Clamp: floating error can push slightly outside [-1, 1].
  return Math.min(1, Math.max(0, dot / (Math.sqrt(na) * Math.sqrt(nb))));
}

/** Deterministic pseudo-embedding — mock only (dev without key). */
function mockEmbedding(text) {
  const dims = 64;
  let h = 2166136261;
  const out = [];
  for (let d = 0; d < dims; d++) {
    h ^= d * 2654435761;
    for (let i = 0; i < text.length; i += 7) {
      h = Math.imul(h ^ text.charCodeAt(i + ((d % 7) | 0)), 16777619);
    }
    out.push(((h >>> 0) % 2000) / 1000 - 1);
  }
  return out;
}

/**
 * MOCK MODE: canned responses shaped exactly like the real contracts so
 * duplicateCheck.js and paperAnalysis.js work unchanged.
 */
function mockGeminiResponse(prompt, jsonMode) {
  const lower = prompt.toLowerCase();
  let payload;
  if (lower.includes("duplicate detector") || lower.includes("same question paper")) {
    payload = MOCK_GEMINI_DUPLICATE_VERDICT;
  } else {
    payload = MOCK_GEMINI_ANALYSIS;
  }
  const text = JSON.stringify(payload);
  return Promise.resolve({
    text,
    data: jsonMode ? payload : null,
    mock: true,
  });
}
