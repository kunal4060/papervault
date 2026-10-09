/**
 * PaperVault Cloudinary storage layer (FREE tier — no card, no Blaze needed).
 *
 * Replaces Firebase Storage (src/firebase/storage.js) which needs the Blaze
 * pay-as-you-go plan. Cloudinary free tier: ~25 GB storage/bandwidth per month.
 *
 * Setup (one-time, by Tim):
 *   1. Free account banao: https://cloudinary.com (no card)
 *   2. Dashboard se "Cloud name" copy karo
 *   3. Settings → Upload → Upload presets → "Add upload preset"
 *      - Signing Mode: **Unsigned**
 *      - Folder: papervault  (optional)
 *      - Allowed formats: pdf (ya blank = all)
 *   4. .env me daalo:
 *        VITE_CLOUDINARY_CLOUD_NAME=xxxx
 *        VITE_CLOUDINARY_UPLOAD_PRESET=xxxx
 *
 * PDFs `raw` resource type se upload hote hain (no transformation counted).
 * Same function signatures as the old firebase/storage.js — callers ko sirf
 * import badalna hai.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "xndxfpxi";
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ahgnlkdd";

/** True jab Cloudinary upload ke liye ready hai. */
export const CLOUDINARY_CONNECTED = Boolean(CLOUD_NAME && UPLOAD_PRESET);

function assertReady() {
  if (!CLOUDINARY_CONNECTED) {
    throw new Error(
      "CLOUDINARY_NOT_CONFIGURED — VITE_CLOUDINARY_CLOUD_NAME aur " +
        "VITE_CLOUDINARY_UPLOAD_PRESET .env me set karo (CLOUDINARY_SETUP.md dekho)."
    );
  }
}

/**
 * Ek PDF Cloudinary pe upload karo (unsigned preset).
 * @param {File} file
 * @param {string} publicId  e.g. "papervault/papers/CSE3002/CSE3002_CAT-2_2025_F1"
 * @returns {Promise<{path:string, url:string, size:number}>}
 */
async function uploadPDF(file, publicId) {
  assertReady();
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("public_id", publicId);
  form.append("resource_type", "raw");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      "CLOUDINARY_UPLOAD_FAILED — " + (err?.error?.message || `HTTP ${res.status}`)
    );
  }
  const data = await res.json();
  return { path: data.public_id, url: data.secure_url, size: file.size };
}

/**
 * Question-paper PDF upload karo.
 * @param {File} file
 * @param {string} subjectCode e.g. "CSE3002"
 * @param {string} fileName    e.g. "CSE3002_CAT-2_2025_F1.pdf"
 * @returns {Promise<{path:string, url:string, size:number}>}
 */
export async function uploadPaperPDF(file, subjectCode, fileName) {
  const base = fileName.replace(/\.pdf$/i, "");
  return uploadPDF(file, `papervault/papers/${subjectCode}/${base}`);
}

/**
 * Admin note PDF upload karo.
 * @param {File} file
 * @param {string} subjectCode
 * @param {number} moduleNum
 * @param {string} fileName
 * @returns {Promise<{path:string, url:string, size:number}>}
 */
export async function uploadNotePDF(file, subjectCode, moduleNum, fileName) {
  const base = fileName.replace(/\.pdf$/i, "");
  return uploadPDF(file, `papervault/notes/${subjectCode}/m${moduleNum}/${base}`);
}

/**
 * File ka download URL nikalo.
 * Cloudinary URLs permanent hote hain — Firestore me `url` field me full
 * secure_url save karo; ye function purane path-style callers ke liye hai.
 * @param {string} pathOrUrl  public_id ya full https URL
 * @returns {Promise<string>} download URL
 */
export async function getFileUrl(pathOrUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  assertReady();
  return `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/${pathOrUrl}`;
}
