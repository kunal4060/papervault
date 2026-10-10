/**
 * PaperVault PDF text extraction (upload flow §4 step 4).
 *
 * Uses Mozilla PDF.js (pdfjs-dist) with Vite worker URL handling.
 * Extracts text from an uploaded PDF file for duplicate detection and AI analysis.
 * Returns an empty string when extraction fails. Never fabricates text.
 */
import * as pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure PDF.js worker for the current Vite environment
if (typeof window !== "undefined" && pdfjs?.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Extract up to `maxChars` characters of text from a PDF file.
 * @param {File} file — the uploaded PDF
 * @param {number} [maxChars=2000]
 * @returns {Promise<string>} extracted text ("" when extraction fails)
 */
export async function extractText(file, maxChars = 2000) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
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
