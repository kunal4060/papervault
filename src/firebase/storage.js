/**
 * PaperVault Storage layer. Paths follow BACKEND_PLAN.md §4:
 *   papers/{subjectCode}/{autoFileName}.pdf
 *   notes/{subjectCode}/m{module}/{fileName}.pdf
 *   syllabus/{subjectCode}/syllabus.pdf
 *
 * MOCK MODE: returns deterministic fake URLs so the upload flow can be
 * tested end-to-end without Firebase. Nothing leaves the browser.
 */
import { storage, FIREBASE_CONNECTED } from "./config.js";

const MOCK_BUCKET = "https://mock.papervault.dev";

const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Upload a question-paper PDF.
 * TODO: firebase — ref(storage, path) + uploadBytes + getDownloadURL
 * @param {File} file
 * @param {string} subjectCode e.g. "CSE3002"
 * @param {string} fileName    e.g. "CSE3002_CAT-2_2025_F1.pdf"
 * @returns {Promise<{path:string, url:string, size:number}>}
 */
export async function uploadPaperPDF(file, subjectCode, fileName) {
  const path = `papers/${subjectCode}/${fileName}`;
  if (!FIREBASE_CONNECTED) {
    await delay();
    return { path, url: `${MOCK_BUCKET}/${path}`, size: file.size };
  }
  const { ref, uploadBytes, getDownloadURL } = await import(
    "firebase/storage"
  );
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, file, {
    contentType: "application/pdf",
  });
  const url = await getDownloadURL(storageRef);
  return { path: result.ref.fullPath, url, size: file.size };
}

/**
 * Upload an admin note PDF into a syllabus module folder.
 * TODO: firebase — ref(storage, path) + uploadBytes + getDownloadURL
 * @param {File} file
 * @param {string} subjectCode
 * @param {number} moduleNum
 * @param {string} fileName
 * @returns {Promise<{path:string, url:string, size:number}>}
 */
export async function uploadNotePDF(file, subjectCode, moduleNum, fileName) {
  const path = `notes/${subjectCode}/m${moduleNum}/${fileName}`;
  if (!FIREBASE_CONNECTED) {
    await delay();
    return { path, url: `${MOCK_BUCKET}/${path}`, size: file.size };
  }
  const { ref, uploadBytes, getDownloadURL } = await import(
    "firebase/storage"
  );
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: "application/pdf" });
  const url = await getDownloadURL(storageRef);
  return { path, url, size: file.size };
}

/**
 * Get a download URL for a storage path.
 * TODO: firebase — getDownloadURL(ref(storage, path))
 * @param {string} path storage path, e.g. "papers/CSE3002/....pdf"
 * @returns {Promise<string>} download URL
 */
export async function getFileUrl(path) {
  if (!FIREBASE_CONNECTED) {
    await delay(100);
    return `${MOCK_BUCKET}/${path}`;
  }
  const { ref, getDownloadURL } = await import("firebase/storage");
  return getDownloadURL(ref(storage, path));
}
