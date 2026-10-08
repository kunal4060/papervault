/**
 * PaperVault — Admin Moderation queue (Direction A "Archive Noir").
 * 100% original. Mobile-first. Mock data only.
 * Route: #/admin/moderation
 *
 * Har row: PDF placeholder, metadata, uploader, AI verdict text,
 * Approve / Reject (reason select + custom input).
 *
 * // TODO: firebase — pending queue: query(papers,
 * //   where("status","==","pending"), orderBy("createdAt")).
 * // Approve → setDoc status "approved"; Reject → status "rejected" +
 * // rejectReason. AI verdict src/ai/duplicate.js se aata hai.
 */
import { useState } from "react";
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
import { getSubjectById, getPaperById } from "../../mock/index.js";
import { formatDate } from "../../utils/format.js";

// ---- mock pending uploads (Paper interface §3.3 + AI verdict §5) ------------
const seedPending = [
  {
    id: "upload-p1",
    subjectId: "subj-ai",
    subjectCode: "CSE3002",
    examType: "CAT-2",
    year: 2025,
    slot: "F1",
    faculty: "Dr. S. Rao",
    fileName: "CSE3002_CAT-2_2025_F1.pdf",
    fileUrl: "#",
    uploaderName: "Aarav Mehta",
    createdAt: "2026-10-07T14:20:00.000Z",
    aiVerdict: {
      duplicate: false,
      confidence: 0.94,
      reason:
        "Questions and marks differ from all existing CSE3002 papers — looks unique.",
    },
  },
  {
    id: "upload-p2",
    subjectId: "subj-dsa",
    subjectCode: "CSE2001",
    examType: "CAT-1",
    year: 2024,
    slot: "B2",
    faculty: "",
    fileName: "CSE2001_CAT-1_2024_B2.pdf",
    fileUrl: "#",
    uploaderName: "Priya Nair",
    createdAt: "2026-10-07T11:02:00.000Z",
    aiVerdict: {
      duplicate: true,
      confidence: 0.91,
      duplicateOf: "paper-003",
      reason:
        "Text matches an existing CSE2001 CAT-1 2024 paper (91%) — likely the same paper, different scan.",
    },
  },
  {
    id: "upload-p3",
    subjectId: "subj-coa",
    subjectCode: "CSA2001",
    examType: "FAT",
    year: 2023,
    slot: "G1",
    faculty: "Prof. K. Menon",
    fileName: "CSA2001_FAT_2023_G1.pdf",
    fileUrl: "#",
    uploaderName: "Rohan Verma",
    createdAt: "2026-10-06T18:45:00.000Z",
    aiVerdict: {
      duplicate: false,
      confidence: 0.78,
      reason:
        "File parsed fine, but topic mix (stacks/queues) matches DSA more than COA — subject verify karo before approving.",
    },
  },
];

const REJECT_REASONS = ["Duplicate", "Unreadable", "Wrong subject", "Other"];

function VerdictBox({ verdict }) {
  return (
    <div
      className={`rounded-[10px] border px-3.5 py-3 ${
        verdict.duplicate
          ? "border-brick/40 bg-brick/5"
          : "border-hairline bg-surface-plus"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <MicroLabel>AI verdict</MicroLabel>
        <span className="font-mono text-[11px] text-text-dim tabular-nums">
          {Math.round(verdict.confidence * 100)}% confident
        </span>
      </div>
      <p className="mt-1 text-sm text-text">{verdict.reason}</p>
      {verdict.duplicate && verdict.duplicateOf && (
        <p className="mt-1.5 text-xs text-text-dim">
          Possible duplicate of:{" "}
          <span className="font-mono text-brick">
            {getPaperById(verdict.duplicateOf)?.fileName ?? verdict.duplicateOf}
          </span>
        </p>
      )}
    </div>
  );
}

function QueueRow({ item, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [custom, setCustom] = useState("");
  const subject = getSubjectById(item.subjectId);

  const submitted = formatDate(item.createdAt);

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
            {item.fileName}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-text-dim">
            <CodeChip>{item.subjectCode}</CodeChip>
            <Badge tone={item.examType === "FAT" ? "amber" : "moss"}>
              {item.examType}
            </Badge>
            <span className="font-mono tabular-nums">{item.year}</span>
            <span className="font-mono">Slot {item.slot}</span>
          </div>
          <p className="mt-1.5 truncate text-xs text-text-dim">
            {subject?.name ?? "—"}
            {item.faculty ? ` · ${item.faculty}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-text-dim">
            Uploader: <span className="font-medium text-text">{item.uploaderName}</span>{" "}
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
            onClick={() => onApprove(item.id)}
          >
            <IcoCheck className="h-4 w-4" />
            Approve
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => setRejecting(true)}
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
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => onReject(item.id, reason, custom)}
            >
              Confirm reject
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Moderation() {
  const [queue, setQueue] = useState(seedPending);
  const [done, setDone] = useState([]);

  const handleApprove = (id) => {
    const item = queue.find((q) => q.id === id);
    setQueue((q) => q.filter((x) => x.id !== id));
    setDone((d) => [{ id, label: `${item.fileName} — approved, ab live hai.`, ok: true }, ...d]);
  };

  const handleReject = (id, reason, custom) => {
    const item = queue.find((q) => q.id === id);
    setQueue((q) => q.filter((x) => x.id !== id));
    setDone((d) => [
      {
        id,
        label: `${item.fileName} — rejected (${reason})${custom ? `: ${custom}` : ""}.`,
        ok: false,
      },
      ...d,
    ]);
  };

  return (
    <AdminShell
      active="moderation"
      title="Moderation"
      subtitle="Pending uploads — AI verdict ke saath approve/reject karo"
      badge={queue.length}
    >
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

      {queue.length === 0 ? (
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
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
