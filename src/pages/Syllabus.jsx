/**
 * PaperVault — Syllabus + Notes page (Direction A "Archive Noir").
 * 100% original. Mobile-first.
 *
 * Routes (hash router, parent wires):
 *   #/syllabus            → subject list, sorted by CODE
 *   #/syllabus/:subjectId → subject detail (syllabus PDF first, modules)
 *
 * Order (fixed, §3.2A): 1) Syllabus PDF card → 2) Module 1→N accordions →
 * 3) each module's notes → 4) AI % per module ("kidhar se zyada questions").
 *
 * // TODO: firebase — data already comes through firebase/db.js (mock-backed
 * // until FIREBASE_CONNECTED). useSyllabus(subjectId) returns syllabus + notes.
 */
import { useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useSyllabus } from "../hooks/useSyllabus.js";
import {
  subjects,
  getSubjectById,
  getSubjectDetail,
} from "../mock/index.js";
import {
  Button,
  Card,
  MicroLabel,
  Badge,
  Highlight,
} from "../components/atoms.jsx";
import { IcoDoc, IcoDownload, IcoEye, IcoChevron, IcoArrowLeft, IcoAlert } from "./admin/adminUi.jsx";

// ------------------------------------------------------- subject list ---
function SubjectList({ onOpen }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return subjects
      .filter((s) => s.active)
      .filter(
        (s) =>
          !query ||
          s.name.toLowerCase().includes(query) ||
          s.code.toLowerCase().includes(query) ||
          s.codes.some((c) => c.toLowerCase().includes(query))
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [q]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:max-w-5xl md:py-10">
      <MicroLabel className="mb-1">Vault · Syllabus & Notes</MicroLabel>
      <h1 className="font-display text-2xl font-bold md:text-[34px] md:tracking-tight">
        Syllabus <Highlight soft>code-wise</Highlight>
      </h1>
      <p className="mt-1 text-sm text-text-dim md:mt-2 md:text-[15px]">
        Subject chuno → syllabus PDF, module-wise notes, aur AI question %
      </p>

      <div className="relative mt-5 md:mt-6 md:max-w-xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Code ya naam likho… CSE3002"
          aria-label="Search subjects"
          className="min-h-[44px] w-full rounded-[10px] border border-hairline bg-surface-plus px-4 font-mono text-sm text-text placeholder:font-body placeholder:text-text-dim/60 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 md:mt-6 lg:grid-cols-2 lg:gap-3">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onOpen(s.id)}
            className="flex w-full items-center gap-3 rounded-[12px] border border-hairline bg-surface px-4 py-3.5 text-left transition-colors hover:border-text-dim/60 hover:bg-surface-plus md:gap-4 md:px-5 md:py-4"
          >
            <span className="shrink-0 rounded-[6px] border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-sm font-bold text-accent">
              {s.code}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-text">
                {s.name}
              </span>
              <span className="mt-0.5 block truncate font-mono text-[11px] text-text-dim">
                {s.codes.join(" · ")} · {s.paperCount} papers
              </span>
            </span>
            <IcoChevron className="h-4 w-4 -rotate-90 shrink-0 text-text-dim" />
          </button>
        ))}
        {list.length === 0 && (
          <p className="rounded-[12px] border border-dashed border-hairline px-6 py-10 text-center text-sm text-text-dim lg:col-span-2">
            Koi subject nahi mila. Code check karke dobara try karo.
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------- syllabus PDF card ---
function SyllabusPdfCard({ syllabus, code }) {
  if (!syllabus?.pdfUrl) {
    return (
      <div className="flex items-center gap-3 rounded-[12px] border border-dashed border-hairline bg-surface px-4 py-5">
        <IcoAlert className="h-5 w-5 shrink-0 text-text-dim" />
        <p className="text-sm text-text-dim">
          Official syllabus PDF abhi upload nahi hua hai.
        </p>
      </div>
    );
  }
  return (
    <Card className="flex items-center gap-4 p-4 md:p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-accent/10 text-accent">
        <IcoDoc className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <MicroLabel>Official syllabus</MicroLabel>
        <p className="mt-0.5 truncate font-mono text-sm font-semibold text-text">
          {code}_syllabus.pdf
        </p>
        <p className="text-xs text-text-dim">
          Admin-verified · Updated{" "}
          {syllabus.updatedAt
            ? new Date(syllabus.updatedAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })
            : "—"}
        </p>
      </div>
      <a
        href={syllabus.pdfUrl}
        download
        className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-semibold text-[#0C0D10] transition-colors hover:bg-[#FFBE4D]"
      >
        <IcoDownload className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span>
      </a>
    </Card>
  );
}

// ----------------------------------------------------------- note row ---
function NoteRow({ note }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-hairline bg-canvas px-3.5 py-3">
      <IcoDoc className="h-5 w-5 shrink-0 text-text-dim" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{note.title}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-text-dim">
          <span className="font-mono tabular-nums">{note.pages} pages</span>
          {note.verified && <Badge tone="moss">Verified</Badge>}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={note.fileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Preview ${note.title}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] border border-hairline text-text transition-colors hover:border-text-dim hover:bg-surface-plus"
        >
          <IcoEye className="h-4 w-4" />
        </a>
        <a
          href={note.fileUrl}
          download
          aria-label={`Download ${note.title}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] bg-accent text-[#0C0D10] transition-colors hover:bg-[#FFBE4D]"
        >
          <IcoDownload className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

// -------------------------------------------------------- module card ---
function ModuleCard({ module, notes, aiPct, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-hairline bg-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-plus md:px-5"
      >
        <span className="shrink-0 rounded-[6px] bg-surface-plus px-2 py-1 font-mono text-xs font-bold text-accent">
          M{module.number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-text">
            {module.title}
          </span>
          {typeof aiPct === "number" && (
            <span className="mt-0.5 block font-mono text-[11px] font-semibold text-accent">
              {aiPct}% questions
            </span>
          )}
        </span>
        <IcoChevron open={open} className="h-4 w-4 shrink-0 text-text-dim" />
      </button>

      {open && (
        <div className="border-t border-hairline px-4 py-4">
          {/* AI % div-bar */}
          {typeof aiPct === "number" ? (
            <div className="mb-4">
              <div className="flex items-baseline justify-between">
                <MicroLabel>AI analysis · past papers</MicroLabel>
                <span className="font-display text-lg font-bold text-accent tabular-nums">
                  {aiPct}%
                </span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-plus"
                role="img"
                aria-label={`Is module se ${aiPct} percent questions aaye hain`}
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, Math.max(0, aiPct))}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-text-dim">
                Pichle papers ka <span className="hl-soft">average</span> — is
                module se itne questions aate hain
              </p>
            </div>
          ) : (
            <p className="mb-4 text-xs text-text-dim">
              AI analysis abhi available nahi hai.
            </p>
          )}

          {/* topics */}
          <MicroLabel>Topics</MicroLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {module.topics.map((t) => (
              <span
                key={t}
                className="rounded-full border border-hairline px-2.5 py-1 text-xs text-text-dim"
              >
                {t}
              </span>
            ))}
          </div>

          {/* notes */}
          <MicroLabel className="mt-4">
            Notes ({notes.length})
          </MicroLabel>
          <div className="mt-2 space-y-2">
            {notes.length > 0 ? (
              notes.map((n) => <NoteRow key={n.id} note={n} />)
            ) : (
              <p className="rounded-[10px] border border-dashed border-hairline px-4 py-4 text-center text-xs text-text-dim">
                Is module ke notes abhi nahi hain.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------- subject detail ---
function SubjectDetail({ subjectId, onBack }) {
  const subject = getSubjectById(subjectId);
  const { syllabus, notes, loading } = useSyllabus(subjectId);
  const [openModule, setOpenModule] = useState(1);

  // notes grouped by module (from the hook — firebase-backed when connected)
  const notesByModule = useMemo(() => {
    const map = {};
    for (const n of notes) {
      (map[n.syllabusModule] ??= []).push(n);
    }
    return map;
  }, [notes]);

  // AI % per module: aggregate of papers' analyses (mock: getSubjectDetail)
  const aiByModule = useMemo(() => {
    const detail = getSubjectDetail(subjectId);
    const map = {};
    for (const t of detail?.aggregateTopics ?? []) map[t.module] = t.avgPercentage;
    return map;
  }, [subjectId]);

  if (!subject) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-text-dim">Subject nahi mila.</p>
        <Button variant="secondary" className="mt-4" onClick={onBack}>
          Subjects
        </Button>
      </div>
    );
  }

  const modules = syllabus?.modules ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:max-w-5xl md:py-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-text-dim hover:text-text md:mb-6"
      >
        <IcoArrowLeft className="h-4 w-4" />
        Subjects
      </button>

      {loading ? (
        <div className="space-y-3" aria-label="Loading syllabus">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[12px] border border-hairline bg-surface"
            />
          ))}
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-10">
          {/* Left — sticky subject identity + syllabus PDF (desktop) */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-5 lg:mb-6">
              <span className="inline-block rounded-[6px] border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-sm font-bold text-accent">
                {subject.code}
              </span>
              <h1 className="mt-2 font-display text-2xl font-bold md:text-[32px] md:leading-tight md:tracking-tight">
                {subject.name}
              </h1>
              <p className="mt-1 font-mono text-xs text-text-dim md:mt-2">
                {subject.codes.join(" · ")} · Sem {subject.semester} ·{" "}
                {subject.program}
              </p>
            </div>

            {/* 1 — syllabus PDF FIRST */}
            <SyllabusPdfCard syllabus={syllabus} code={subject.code} />
          </div>

          {/* 2 — modules */}
          <div className="mt-6 space-y-3 lg:mt-0">
            <h2 className="font-display text-lg font-bold md:text-xl">
              Modules <span className="text-text-dim">({modules.length})</span>
            </h2>
            {modules.length === 0 && (
              <p className="rounded-[12px] border border-dashed border-hairline px-6 py-10 text-center text-sm text-text-dim">
                Syllabus modules abhi add nahi hue hain.
              </p>
            )}
            {modules.map((m) => (
              <ModuleCard
                key={m.number}
                module={m}
                notes={notesByModule[m.number] ?? []}
                aiPct={aiByModule[m.number]}
                open={openModule === m.number}
                onToggle={() =>
                  setOpenModule((cur) => (cur === m.number ? null : m.number))
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ page ---
export default function Syllabus({ subjectId }) {
  // subjectId seedha URL se aata hai (App.jsx) — koi local state nahi.
  // SubjectList click → hash change → App re-render → naya subjectId.
  const openSubject = (id) => {
    window.location.hash = `#/syllabus/${id}`;
  };

  return (
    <div className="min-h-screen bg-canvas text-text">
      <Navbar />
      {subjectId ? (
        <SubjectDetail
          subjectId={subjectId}
          onBack={() => {
            window.location.hash = "#/syllabus";
          }}
        />
      ) : (
        <SubjectList onOpen={openSubject} />
      )}
    </div>
  );
}
