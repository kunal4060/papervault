/**
 * PaperVault display formatters.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Normalize anything date-ish into a Date.
 * Accepts: Firestore Timestamp ({toDate()}), Date, epoch ms, ISO string.
 */
function toDate(ts) {
  if (!ts) return null;
  if (typeof ts?.toDate === "function") return ts.toDate();
  if (ts instanceof Date) return ts;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a timestamp as "8 Oct 2026".
 * @param {*} ts Firestore Timestamp | Date | number | string
 */
export function formatDate(ts) {
  const d = toDate(ts);
  if (!d) return "—";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format a timestamp as "8 Oct 2026, 7:30 PM" (for chat / history).
 * @param {*} ts
 */
export function formatDateTime(ts) {
  const d = toDate(ts);
  if (!d) return "—";
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)}, ${h}:${min} ${ampm}`;
}

/**
 * Format bytes as "2.4 MB" / "850 KB" / "312 B".
 * @param {number} bytes
 */
export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
