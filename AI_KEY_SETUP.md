# PaperVault — Gemini API Key Setup (AI features)

AI features (duplicate-check verdict, paper AI analysis on approval) are
**fully wired in code** and degrade honestly without a key:

- Upload → "AI check unavailable — manual review ke liye bheja gaya."
- Moderation → approval succeeds; AI analysis step is skipped silently.

To turn AI on, the key must reach the build **without ever being committed**.
Vite inlines `VITE_*` vars into the public JS bundle — safe ONLY with a
referrer-restricted key (Google's documented browser-key pattern).

## Step 1 — Restrict the key (Google Cloud Console, ~2 min, one-time)

1. Go to https://console.cloud.google.com/apis/credentials (Tim's Google
   account — the one that owns the Gemini API key).
2. Click the API key used for PaperVault.
3. **Application restrictions** → `HTTP referrers (web sites)` → Add:
   - `https://kunal4060.github.io/*`
   - (optional, for local dev) `http://localhost:*/*`
4. **API restrictions** → `Restrict key` → select **Generative Language API**
   only.
5. Save. Wait ~1 minute for propagation.

> Without this step, anyone could copy the key from the site's JS and burn
> the quota. Never skip it.

## Step 2 — Add the key as a GitHub repo secret (one-time)

1. Repo → Settings → Secrets and variables → Actions → New repository secret.
2. Name: `VITE_GEMINI_API_KEY`, value: the key. Save.
3. The deploy workflow (`.github/workflows/deploy.yml`) already injects it
   at build time. Merge/redeploy `main` once.

## Step 3 — Verify

- Upload a test paper → duplicate check should show "AI check" in the
  verdict when similarity is in the doubtful band.
- Admin → Moderation → approve a paper with syllabus modules present →
  paper detail page shows the AI Analysis panel.

## Option B — server-side proxy (no key in bundle at all)

If you ever want zero key exposure: put a tiny proxy on Cloudflare Workers
(free, 100k req/day) that holds the key server-side and forwards
`generateContent`/`embedContent`. Frontend then calls the worker URL instead
of Google directly — `src/ai/gemini.js` keeps the same function signatures,
only `ENDPOINT` changes. Needs a Cloudflare account (new signup).

## Rotation

If the key ever leaks (committed, pasted in chat, unrestricted): revoke it in
Cloud Console → create a new key → repeat Steps 1–2.
