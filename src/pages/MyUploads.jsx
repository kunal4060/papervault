/**
 * MyUploads.jsx — PaperVault upload history page (Worker B).
 * Route: /my-uploads (hash: #my-uploads) — login REQUIRED.
 *
 * History list (DETAILED_PLAN §3.6): filename (mono), subject, exam, date,
 * StatusChip, reason text for rejected, "View paper" for approved,
 * "Re-upload" for rejected (pre-fills the /upload form).
 *
 * Mock removed: reads live from the `uploads` collection in Firestore
 * (getMyUploads) — empty collection → clean empty state, never fake data.
 * Design: Direction A "Archive Noir" (DESIGN.md v2). 100% original.
 */
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { getMyUploads, getSubjects } from "../firebase/db.js";
import Icon from "../components/Icon.jsx";
import {
  Button,
  Card,
  LoginGate,
  StatusChip,
} from "../components/atoms.jsx";
import { stashReuploadDraft } from "./reuploadDraft.js";

/** Firestore Timestamp or ISO string → Date. */
function toDate(v) {
  if (!v) return null;
  if (typeof v.toDate === "function") {
    try {
      return v.toDate();
    } catch {
      return null;
    }
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(v) {
  const d = toDate(v);
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(d);
  } catch {
    return "";
  }
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function UploadRow({ upload, subject }) {
  const rejected = upload.status === "rejected";
  const approved = upload.status === "approved";

  return (
    <Card className="p-5 transition-all duration-200 lg:p-6 lg:hover:-translate-y-0.5 lg:hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-semibold text-text">
            {upload.fileName}
          </p>
          <p className="mt-1 text-xs text-text-dim">
            {subject?.name || "Unknown subject"} ·{" "}
            <span className="font-mono">{upload.subjectCode}</span>
          </p>
        </div>
        <StatusChip status={upload.status} />
      </div>

      {/* meta line */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full border border-hairline px-2.5 py-1 font-semibold text-text">
          {upload.examType}
        </span>
        <span className="rounded-full border border-hairline px-2.5 py-1 font-mono text-text-dim">
          {upload.year}
        </span>
        <span className="rounded-full border border-hairline px-2.5 py-1 font-mono text-text-dim">
          Slot {upload.slot}
        </span>
        <span className="ml-auto text-text-dim">
          {formatDate(upload.createdAt)}
          {formatSize(upload.fileSize) ? ` · ${formatSize(upload.fileSize)}` : ""}
        </span>
      </div>

      {/* pending note */}
      {upload.status === "pending" && (
        <p className="mt-3 flex items-start gap-2 text-xs text-text-dim">
          <Icon name="clock" size={14} className="mt-0.5 shrink-0 text-accent" />
          Admin review ke baad live hoga. Approval me usually 24–48 ghante lagte hain.
        </p>
      )}

      {/* rejected reason */}
      {rejected && upload.reason && (
        <div className="mt-3 rounded-[10px] border border-brick/30 bg-brick/5 px-3.5 py-3">
          <p className="micro mb-1">Reject reason</p>
          <p className="text-sm text-text">{upload.reason}</p>
        </div>
      )}

      {/* actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {approved && (
          <Button
            variant="secondary"
            className="!min-h-[40px] !px-4 !text-[13px]"
            onClick={() => {
              window.location.hash = upload.paperId
                ? `#papers/${upload.paperId}`
                : `#papers`;
            }}
          >
            <Icon name="eye" size={15} />
            View paper
          </Button>
        )}
        {rejected && (
          <Button
            className="!min-h-[40px] !px-4 !text-[13px]"
            onClick={() => {
              stashReuploadDraft(upload);
              window.location.hash = "#upload";
            }}
          >
            <Icon name="upload" size={15} />
            Re-upload
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function MyUploads() {
  const { user, loading, signIn } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [subjectMap, setSubjectMap] = useState(new Map());
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setListLoading(false);
      return;
    }
    let cancelled = false;
    setListLoading(true);
    (async () => {
      try {
        const [rows, subs] = await Promise.all([
          getMyUploads(user.uid),
          getSubjects(),
        ]);
        if (cancelled) return;
        setUploads(rows);
        setSubjectMap(new Map(subs.map((s) => [s.id, s])));
      } catch (err) {
        console.error("[MyUploads] load failed:", err);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return <LoginGate onSignIn={signIn} actionText="upload history dekhne" />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 lg:max-w-5xl lg:pt-10">
      <div className="mb-6 flex items-start justify-between gap-4 lg:mb-8">
        <div>
          <p className="micro mb-2">History</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text lg:text-4xl">
            My <span className="hl-soft">Uploads</span>
          </h1>
          <p className="mt-2 text-sm text-text-dim lg:text-[15px]">
            {uploads.length === 0
              ? "Tumhare saare uploads yahan dikhenge."
              : `${uploads.length} upload${uploads.length > 1 ? "s" : ""} ab tak`}
          </p>
        </div>
        <Button
          className="shrink-0 !rounded-xl shadow-[0_4px_20px_-4px_rgba(255,178,36,0.5)] transition-all duration-200 hover:-translate-y-px"
          onClick={() => { window.location.hash = "#upload"; }}
        >
          <Icon name="upload" size={16} />
          <span className="hidden sm:inline">Naya upload</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>

      {listLoading ? (
        <div className="py-20 text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
        </div>
      ) : uploads.length === 0 ? (
        <Card className="p-10 text-center lg:mx-auto lg:max-w-md lg:p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-canvas text-text-dim">
            <Icon name="file" size={22} />
          </div>
          <h2 className="font-display text-lg font-bold text-text">
            Abhi tak kuch upload nahi kiya
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-text-dim">
            Pehla paper upload karo — duplicate check automatic hai, review ke baad live.
          </p>
          <Button
            className="mt-6"
            onClick={() => { window.location.hash = "#upload"; }}
          >
            <Icon name="upload" size={16} />
            Pehla paper upload karo
          </Button>
        </Card>
      ) : (
        <div className="space-y-3.5 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {uploads.map((u) => (
            <UploadRow key={u.id} upload={u} subject={subjectMap.get(u.subjectId)} />
          ))}
        </div>
      )}
    </div>
  );
}
