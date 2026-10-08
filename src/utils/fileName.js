/**
 * PaperVault standardized filenames.
 * Spec (§3.5 / PLAN.md §10): {CODE}_{EXAMTYPE}_{YEAR}_{SLOT}.pdf
 *   e.g. buildPaperFileName("CSE3002", "CAT-2", 2025, "F1")
 *        → "CSE3002_CAT-2_2025_F1.pdf"
 */

/**
 * Build the auto filename for an uploaded paper.
 * @param {string} code     subject code, e.g. "CSE3002"
 * @param {string} examType "CAT-1" | "CAT-2" | "FAT" | "Lab FAT"
 * @param {number|string} year e.g. 2025
 * @param {string} slot     e.g. "F1"
 * @returns {string} e.g. "CSE3002_CAT-2_2025_F1.pdf"
 */
export function buildPaperFileName(code, examType, year, slot) {
  const clean = (s) =>
    String(s)
      .trim()
      .replace(/\s+/g, "_") // "Lab FAT" → "Lab_FAT"
      .replace(/[^A-Za-z0-9_-]/g, "")
      .toUpperCase();
  return `${clean(code)}_${clean(examType)}_${clean(year)}_${clean(slot)}.pdf`;
}

/**
 * Extract {code, examType, year, slot} back out of an auto-generated filename.
 * Returns null if the name doesn't match the standard format.
 * @param {string} fileName
 */
export function parsePaperFileName(fileName) {
  const m = /^([A-Z0-9]+)_([A-Z0-9_-]+)_(\d{4})_([A-Z0-9]+)\.pdf$/i.exec(
    fileName.trim()
  );
  if (!m) return null;
  return {
    code: m[1].toUpperCase(),
    examType: m[2].replace(/_/g, " ").toUpperCase(),
    year: Number(m[3]),
    slot: m[4].toUpperCase(),
  };
}
