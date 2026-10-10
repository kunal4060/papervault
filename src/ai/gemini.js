/**
 * PaperVault Gemini client wrapper. BACKEND_PLAN.md §5.
 *
 * SECURITY — READ BEFORE ADDING A KEY:
 * Vite inlines VITE_* env vars into the PUBLIC JS bundle, so the key is
 * visible to anyone who opens the site. That is ONLY acceptable because the
 * key MUST have HTTP referrer restrictions in Google Cloud Console
 * (APIs & Services → Credentials → this key → Application restrictions →
 * HTTP referrers → https://kunal4060.github.io/*, API restrictions →
 * Generative Language API only). With that restriction, a stolen key is
 * useless outside the site — this is Google's documented pattern for
 * browser-side API keys.
 * NEVER put an unrestricted key in VITE_GEMINI_API_KEY. See AI_KEY_SETUP.md.
 * For production, move these calls to Cloud Functions (§6: same
 * request/response contract, frontend unchanged).
 *
 * Behavior:
 *  - VITE_GEMINI_API_KEY present → real call to the Generative Language API.
 *  - No key → functions THROW an honest error. Never returns fabricated data.
 */

const API_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_GEMINI_API_KEY) ||
  "";
const MODEL = "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** True when a real key is configured. */
export const GEMINI_CONNECTED = Boolean(API_KEY);

function requireKey() {
  if (!GEMINI_CONNECTED) {
    throw new Error("Gemini API key not configured — set VITE_GEMINI_API_KEY");
  }
}

/**
 * Send a prompt to Gemini.
 * @param {string} prompt
 * @param {{ jsonMode?: boolean }} [opts] — ask for a JSON response
 * @returns {Promise<{ text: string, data: any|null }>}
 *   `data` is the parsed JSON when jsonMode is true and parsing succeeds.
 * @throws when the API key is not configured.
 */
export async function callGemini(prompt, { jsonMode = true } = {}) {
  requireKey();

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
  return { text, data: jsonMode ? safeParse(text) : null };
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
 * @throws when the API key is not configured.
 */
export async function getEmbedding(text) {
  requireKey();
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
 * @returns {Promise<any>} parsed JSON
 * @throws when the API key is not configured or the response is unparseable.
 */
export async function generateJSON(prompt) {
  requireKey();
  const { data } = await callGemini(prompt, { jsonMode: true });
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
