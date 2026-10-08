/**
 * PaperVault file hashing — used for exact-duplicate detection (§4 step 2).
 *
 * Real SHA-256 via the browser's Web Crypto API (crypto.subtle.digest).
 * No dependencies, works in every modern browser (secure context required:
 * https:// or localhost).
 */

/**
 * SHA-256 of a File/Blob, returned as lowercase hex.
 * @param {Blob} file
 * @returns {Promise<string>} 64-char hex digest
 */
export async function sha256Hex(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * SHA-256 of a plain string (handy for tests / metadata hashing).
 * @param {string} text
 * @returns {Promise<string>} 64-char hex digest
 */
export async function sha256Text(text) {
  const buffer = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
