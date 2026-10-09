/**
 * PaperVault — Admin Moderation queue (Direction A "Archive Noir").
 * 100% original. Mobile-first. Live Firestore data — no mock seeds.
 * Route: #/admin/moderation
 *
 * Har row: PDF placeholder, metadata, uploader, AI verdict text,
 * Approve / Reject (reason select + custom input).
 *
 * Pending queue: uploads collection (createUpload writes status "pending" there).
 * Approve → createPaper() + updateUpload(status "approved", paperId).
 * Reject → updateUpload(status "rejected", rejectionReason).
 */
import { useEffect, useState } from "react";
import { AdminShell, CodeChip, EmptyState, IcoDoc, IcoCheck, IcoX } from "./adminUi.jsx";
import {
  Button,
  Card,
  MicroLabel,
  Badge,
  Select,
  TextArea,
  FieldLabel,
} from "../../components/atoms.jsx";
import { getPendingUploads, getAllSubjects, createPaper, updateUpload } from "../../firebase/db.js";
import { formatDate } from "../../utils/format.js";

const REJECT_REASONS = ["Duplicate", "Unreadable", "Wrong subject", "Other"];

function VerdictBox({ verdict }) {
  if (!verdict) {
    return (
      <div className="rounded-[10px] border border-hairline bg-surface-plus px-3.5 py-3">
        <MicroLabel>AI verdict</MicroLabel>
        <p className="mt-1 text-sm text-text-dim">
          Is upload ke liye AI verdict available nahi hai.
        </p>
      </div>
    );
  }
  // verdict shape: { isDuplicate, reason } (see Upload.jsx → createUpload)
  const dup = verdict.isDuplicate ?? verdict.duplicate ?? false;
  return (
    <div
      className={`rounded-[10px] border px-3.5 py-3 ${
        dup
          ? "border-brick/40 bg-brick/5"
          : "border-hairline bg-surface-plus"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <MicroLabel>AI verdict</MicroLabel>
        {verdict.confidence != null && (
          <span className="font-mono text-[11px] text-text-dim tabular-nums">
            {Math.round(verdict.confidence * 100)}% confident
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-text">{verdict.reason}</p>
      {dup && verdict.duplicateOf && (
        <p className="mt-1.5 text-xs text-text-dim">
          Possible duplicate of:{" "}
          <span className="font-mono text-brick">{verdict.duplicateOf}</span>
        </p>
      )}
    </div>
  );
}

function QueueRow({ item, subjectName, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const submitted = formatDate(item.createdAt);

  const doApprove = async () => {
    setBusy(true);
    await onApprove(item.id);
  };
  const doReject = async () => {
    setBusy(true);
    await onReject(item.id, reason, custom);
  };

  return (
    <Card className="p-4 md:p-5">
      <div className="flex gap-4">
        {/* PDF placeholder */}
        <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-[10px] border border-hairline bg-canvas text-text-dim">
          <IcoDoc className="h-7 w-7" />
          <span className="mt-1 font-mono text-[9px] font-bold">PDF</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-semibold text-text">
            {item.fileName ?? item.id}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-text-dim">
            <CodeChip>{item.subjectCode ?? "—"}</CodeChip>
            <Badge tone={item.examType === "FAT" ? "amber" : "moss"}>
              {item.examType ?? "—"}
            </Badge>
            <span className="font-mono tabular-nums">{item.year ?? "—"}</span>
            {item.slot && <span className="font-mono">Slot {item.slot}</span>}
          </div>
          <p className="mt-1.5 truncate text-xs text-text-dim">
            {subjectName ?? "—"}
            {item.faculty ? ` · ${item.faculty}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-text-dim">
            Uploader:{" "}
            <span className="font-medium text-text">{item.uploaderName ?? "—"}</span>{" "}
            · {submitted}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <VerdictBox verdict={item.aiVerdict} />
      </div>

      {!rejecting ? (
        <div className="mt-3 flex gap-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={doApprove}
            disabled={busy}
          >
            <IcoCheck className="h-4 w-4" />
            {busy ? "Saving…" : "Approve"}
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => setRejecting(true)}
            disabled={busy}
          >
            <IcoX className="h-4 w-4" />
            Reject
          </Button>
        </div>
      ) : (
        <div className="mt-3 rounded-[10px] border border-brick/40 bg-brick/5 p-3.5">
          <FieldLabel htmlFor={`reason-${item.id}`}>Reject reason</FieldLabel>
          <Select
            id={`reason-${item.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REJECT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <div className="mt-2.5">
            <FieldLabel htmlFor={`note-${item.id}`}>
              Custom note (uploader ko dikhega)
            </FieldLabel>
            <TextArea
              id={`note-${item.id}`}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Ye paper CSE2001 CAT-1 2024 ka duplicate hai"
            />
          </div>
          <div className="mt-2.5 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setRejecting(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={doReject} disabled={busy}>
              {busy ? "Saving…" : "Confirm reject"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Moderation() {
  const [queue, setQueue] = useState([]);
  const [subjectMap, setSubjectMap] = useState({});
  const [done, setDone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [pending, subjects] = await Promise.all([
        getPendingUploads(),
        getAllSubjects(),
      ]);
      setQueue(pending);
      const map = {};
      subjects.forEach((s) => {
        map[s.id] = s.name;
      });
      setSubjectMap(map);
    } catch (e) {
      setError(
        e?.message
          ? `Moderation queue load nahi hui: ${e.message}`
          : "Moderation queue load nahi hui."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    try {
      const paperId = await createPaper({
        fileName: item.fileName,
        subjectId: item.subjectId,
        subjectCode: item.subjectCode,
        examType: item.examType,
        year: item.year,
        slot: item.slot,
        faculty: item.faculty ?? "",
        fileUrl: item.fileUrl,
        fileSize: item.fileSize ?? 0,
        fileHash: item.fileHash,
        textSample: item.textSample ?? "",
        uploaderId: item.userId,
        uploaderName: item.uploaderName ?? "Student",
        status: "approved",
        downloads: 0,
        views: 0,
      });
      await updateUpload(id, { status: "approved", paperId });
      setQueue((q) => q.filter((x) => x.id !== id));
      setDone((d) => [
        { id, label: `${item.fileName ?? id} — approved, ab live hai.`, ok: true },
        ...d,
      ]);
    } catch (e) {
      setError(
        e?.message ? `Approve nahi hua: ${e.message}` : "Approve nahi hua."
      );
    }
  };

  const handleReject = async (id, reason, custom) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    try {
      const fullReason = custom.trim() ? `${reason} — ${custom.trim()}` : reason;
      await updateUpload(id, { status: "rejected", rejectionReason: fullReason });
      setQueue((q) => q.filter((x) => x.id !== id));
      setDone((d) => [
        {
          id,
          label: `${item.fileName ?? id} — rejected (${fullReason}).`,
          ok: false,
        },
        ...d,
      ]);
    } catch (e) {
      setError(
        e?.message ? `Reject nahi hua: ${e.message}` : "Reject nahi hua."
      );
    }
  };

  return (
    <AdminShell
      active="moderation"
      title="Moderation"
      subtitle="Pending uploads — AI verdict ke saath approve/reject karo"
      badge={queue.length}
    >
      {error && (
        <div className="mb-4 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      {done.length > 0 && (
        <div className="mb-4 space-y-2">
          {done.map((d) => (
            <div
              key={d.id}
              className={`rounded-[10px] border px-4 py-3 text-sm ${
                d.ok
                  ? "border-moss/40 bg-moss/5 text-text"
                  : "border-brick/40 bg-brick/5 text-text"
              }`}
            >
              {d.label}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : queue.length === 0 ? (
        <EmptyState
          icon={<IcoCheck className="h-8 w-8" />}
          title="Queue clear hai"
          hint="Saare uploads review ho gaye. Naya upload aayega to yahi dikhega."
        />
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <QueueRow
              key={item.id}
              item={item}
              subjectName={subjectMap[item.subjectId]}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
