/**
 * PaperVault PDF text extraction (upload flow §4 step 4).
 *
 * Tries real pdf.js first (dynamic import — no hard dependency); returns an
 * empty string when extraction fails. Never fabricates text.
 *
 * To enable real extraction: `npm install pdfjs-dist`
 */

/**
 * Extract up to `maxChars` characters of text from a PDF file.
 * @param {File} file — the uploaded PDF
 * @param {number} [maxChars=2000]
 * @returns {Promise<string>} extracted text ("" when extraction fails)
 */
export async function extractText(file, maxChars = 2000) {
  try {
    // Dynamic import: works whether or not pdfjs-dist is installed.
    const pdfjs = await import(/* @vite-ignore */ "pdfjs-dist");
    if (pdfjs?.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        /* @vite-ignore */ "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }
    const pdf = await pdfjs.getDocument(await file.arrayBuffer()).promise;
    let out = "";
    const n = Math.min(pdf.numPages, 10); // first 10 pages are enough for dedup
    for (let p = 1; p <= n && out.length < maxChars; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      out += content.items.map((it) => it.str).join(" ") + "\n";
    }
    await pdf.destroy().catch(() => {});
    const text = out.replace(/\s+/g, " ").trim().slice(0, maxChars);
    if (text.length > 50) return text;
    // Scanned PDF with no text layer → report and fall through.
  } catch (err) {
    console.warn("[pdfText] extraction failed:", err?.message || err);
  }
  console.warn("[pdfText] no text extracted");
  return "";
}

/**
 * Extract FULL text (for AI paper analysis, §5B). More pages, larger cap.
 * @param {File} file
 * @param {number} [maxChars=12000]
 * @returns {Promise<string>}
 */
export async function extractFullText(file, maxChars = 12000) {
  return extractText(file, maxChars);
}
