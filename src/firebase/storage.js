/**
 * PaperVault Storage layer. Paths follow BACKEND_PLAN.md §4:
 *   papers/{subjectCode}/{autoFileName}.pdf
 *   notes/{subjectCode}/m{module}/{fileName}.pdf
 *   syllabus/{subjectCode}/syllabus.pdf
 *
 * Real Firebase Storage only — no mock URLs.
 */
import { storage } from "./config.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Upload a question-paper PDF.
 * @param {File} file
 * @param {string} subjectCode e.g. "CSE3002"
 * @param {string} fileName    e.g. "CSE3002_CAT-2_2025_F1.pdf"
 * @returns {Promise<{path:string, url:string, size:number}>}
 */
export async function uploadPaperPDF(file, subjectCode, fileName) {
  const path = `papers/${subjectCode}/${fileName}`;
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, file, {
    contentType: "application/pdf",
  });
  const url = await getDownloadURL(storageRef);
  return { path: result.ref.fullPath, url, size: file.size };
}

/**
 * Upload an admin note PDF into a syllabus module folder.
 * @param {File} file
 * @param {string} subjectCode
 * @param {number} moduleNum
 * @param {string} fileName
 * @returns {Promise<{path:string, url:string, size:number}>}
 */
export async function uploadNotePDF(file, subjectCode, moduleNum, fileName) {
  const path = `notes/${subjectCode}/m${moduleNum}/${fileName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: "application/pdf" });
  const url = await getDownloadURL(storageRef);
  return { path, url, size: file.size };
}

/**
 * Get a download URL for a storage path.
 * @param {string} path storage path, e.g. "papers/CSE3002/....pdf"
 * @returns {Promise<string>} download URL
 */
export async function getFileUrl(path) {
  return getDownloadURL(ref(storage, path));
}
