/**
 * PaperVault — build-time prerender of subject pages (SEO/GEO unlock).
 *
 * Reads src/data/bulkManifest.json (248 subjects, 5024 papers) and writes one
 * static HTML file per subject to dist/papers/<CODE>/index.html AFTER
 * `vite build` runs. Each page contains:
 *   - real <title>, meta description, OG tags, canonical (github.io)
 *   - <h1> with the subject name + crawlable paper list as plain HTML
 *   - JSON-LD ItemList schema
 *   - the SPA bundle, so opening the page in a browser hydrates into the
 *     full app (BrowserRouter takes over from the real URL).
 *
 * Run: `node scripts/prerender-subjects.mjs` (wired into `npm run build`).
 * Trigger rebuild: pages-deploy refresh.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE = "/papervault";
const ORIGIN = "https://kunal4060.github.io";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function main() {
  const indexHtml = join(DIST, "index.html");
  if (!existsSync(indexHtml)) {
    console.error("prerender: dist/index.html missing — run `vite build` first.");
    process.exit(1);
  }
  const built = readFileSync(indexHtml, "utf8");

  // SPA asset paths (hashed names) — reuse in every prerendered page.
  const jsMatch = built.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
  const cssMatch = built.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
  const jsSrc = jsMatch ? jsMatch[1] : null;
  const cssHref = cssMatch ? cssMatch[1] : null;
  if (!jsSrc) {
    console.error("prerender: could not find module script in dist/index.html");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(join(ROOT, "src/data/bulkManifest.json"), "utf8"));
  const subjects = new Map();
  for (const p of manifest) {
    const code = p.subjectCode;
    if (!subjects.has(code)) subjects.set(code, { name: p.subjectName || code, papers: [] });
    subjects.get(code).papers.push(p);
  }

  let n = 0;
  for (const [code, subj] of subjects) {
    // examType → year → papers
    const byExam = new Map();
    for (const p of subj.papers) {
      const k = p.examType || "PAPER";
      if (!byExam.has(k)) byExam.set(k, []);
      byExam.get(k).push(p);
    }
    for (const arr of byExam.values()) arr.sort((a, b) => (b.year || 0) - (a.year || 0));

    const examSections = [...byExam.entries()]
      .map(([exam, arr]) => {
        const items = arr
          .map(
            (p) =>
              `<li><a href="${esc(p.fileUrl)}" rel="nofollow">${esc(p.filename)}</a> <span>· ${esc(String(p.year ?? ""))}${p.slot ? ` · Slot ${esc(p.slot)}` : ""}</span></li>`
          )
          .join("\n");
        return `<section><h2>${esc(exam)} papers (${arr.length})</h2><ul>${items}</ul></section>`;
      })
      .join("\n");

    const examCounts = [...byExam.entries()]
      .map(([e, a]) => `${e}: ${a.length}`)
      .join(", ");
    const title = `${code} ${subj.name} — Previous Year Papers | PaperVault`;
    const desc = `Download ${code} (${subj.name}) VIT-AP previous year question papers — ${subj.papers.length} papers (${examCounts}). Free for every student.`;
    const pageUrl = `${ORIGIN}${BASE}/papers/${encodeURIComponent(code)}/`;

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${code} ${subj.name} — Previous Year Papers`,
      url: pageUrl,
      numberOfItems: subj.papers.length,
      itemListElement: subj.papers.slice(0, 100).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "LearningResource",
          name: p.filename,
          url: pageUrl,
          educationalLevel: "Undergraduate",
          teaches: `${code} ${subj.name}`,
        },
      })),
    };

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<script>(function(l){if(l.search[1]==="/"){var d=l.search.slice(1).split("&").map(function(s){return s.replace(/~and~/g,"&")}).join("?");window.history.replaceState(null,null,l.pathname.slice(0,-1)+d+l.hash)}})(window.location);</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0C0D10" />
<meta name="robots" content="index, follow" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${pageUrl}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="PaperVault" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${pageUrl}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<script type="application/ld+json">${JSON.stringify(itemList)}</script>
${cssHref ? `<link rel="stylesheet" href="${cssHref}" />` : ""}
<style>html{background:#0C0D10;color:#EDEAE2}body{margin:0;font-family:Inter,system-ui,sans-serif}a{color:#FFB224}main{max-width:900px;margin:0 auto;padding:32px 20px}h1{font-size:28px}h2{font-size:18px;margin-top:28px;color:#FFB224}ul{line-height:1.9;font-size:14px;word-break:break-all}li span{color:#8a8578}</style>
</head>
<body>
<div id="root"><main>
<p><a href="${BASE}/">PaperVault</a> · <a href="${BASE}/papers">All subjects</a></p>
<h1>${esc(code)} — ${esc(subj.name)}</h1>
<p>${subj.papers.length} previous year question papers · ${esc(examCounts)}</p>
${examSections}
<p>Free for every VIT-AP student.</p>
</main></div>
<script type="module" src="${jsSrc}"></script>
</body>
</html>`;

    const dir = join(DIST, "papers", code);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html);
    n++;
  }
  console.log(`prerender: wrote ${n} subject pages → dist/papers/*/index.html`);

  // Sitemap: root + har prerendered subject page (crawlable URLs only).
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `  <url><loc>${ORIGIN}${BASE}/</loc><changefreq>daily</changefreq><priority>1.0</priority><lastmod>${today}</lastmod></url>`,
    ...[...subjects.keys()].map(
      (code) =>
        `  <url><loc>${ORIGIN}${BASE}/papers/${encodeURIComponent(code)}/</loc><changefreq>weekly</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>`
    ),
  ];
  writeFileSync(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
  );
  console.log(`prerender: wrote sitemap.xml (${urls.length} urls)`);
}

main();
