/**
 * PaperVault — Request Board page (`/requests`).
 *
 * Direction A "Archive Noir": dark request cards with mono course codes,
 * exam chips, "I want this too" upvote (local, mock), "Request a paper"
 * form, and moss "Available" chips for fulfilled requests.
 *
 * Mock only — data lives in this file (mirrors BACKEND_PLAN.md §3.7
 * PaperRequest). Not in src/mock/ per worker constraints.
 * // TODO: firebase — swap for `requests` collection queries.
 */

import { useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { subjects, getSubjectById } from "../mock/index.js";

const EXAMS = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];

/** Seed requests — shape mirrors BACKEND_PLAN §3.7. */
const SEED_REQUESTS = [
  {
    id: "req-1",
    subjectId: "subj-os",
    examType: "FAT",
    year: 2024,
    requestedBy: ["user-mock-2", "user-mock-3", "user-mock-4", "user-mock-5", "user-mock-6", "user-mock-7"],
    fulfilledBy: null,
    createdAt: "2026-10-05T10:12:00.000Z",
  },
  {
    id: "req-2",
    subjectId: "subj-dsa",
    examType: "CAT-2",
    year: 2025,
    requestedBy: ["user-mock-3", "user-mock-8", "user-mock-9"],
    fulfilledBy: null,
    createdAt: "2026-10-06T14:40:00.000Z",
  },
  {
    id: "req-3",
    subjectId: "subj-ai",
    examType: "FAT",
    year: 2023,
    requestedBy: ["user-mock-2", "user-mock-3"],
    fulfilledBy: "paper-mock-11",
    createdAt: "2026-09-28T09:02:00.000Z",
  },
  {
    id: "req-4",
    subjectId: "subj-dms",
    examType: "CAT-1",
    year: 2025,
    requestedBy: ["user-mock-5"],
    fulfilledBy: null,
    createdAt: "2026-10-07T08:20:00.000Z",
  },
];

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function RequestCard({ req, hasUpvoted, canUpvote, onUpvote, onLogin }) {
  const subject = getSubjectById(req.subjectId);
  const count = req.requestedBy.length;
  const fulfilled = !!req.fulfilledBy;

  return (
    <article className="rounded-xl border border-hairline bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-dim hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)] lg:rounded-2xl lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-semibold text-accent">
            {subject?.code ?? "—"}
          </p>
          <h3 className="mt-0.5 truncate text-[15px] font-semibold text-text">
            {subject?.name ?? "Unknown subject"}
          </h3>
        </div>
        {fulfilled ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-moss/40 bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
            <Icon name="check" size={13} />
            Available
          </span>
        ) : (
          <span className="inline-flex shrink-0 rounded-full border border-hairline px-3 py-1 font-mono text-[11px] font-semibold text-text-dim">
            {req.examType} · {req.year}
          </span>
        )}
      </div>

      {fulfilled && (
        <p className="mt-2 font-mono text-[11px] text-text-dim">
          {req.examType} · {req.year}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-text">
            {count}{" "}
            <span className="text-sm font-medium text-text-dim">
              student{count === 1 ? "" : "s"} want{count === 1 ? "s" : ""} this
            </span>
          </p>
          <p className="micro mt-0.5">Requested {fmtDate(req.createdAt)}</p>
        </div>

        {fulfilled ? (
          <a
            href="#papers"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg border border-hairline px-4 text-sm font-semibold text-text transition-colors hover:border-moss/60 hover:text-moss"
          >
            <Icon name="file" size={15} />
            View paper
          </a>
        ) : (
          <button
            onClick={() => (canUpvote ? onUpvote(req.id) : onLogin())}
            disabled={hasUpvoted}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
              hasUpvoted
                ? "border border-accent-dim bg-accent/10 text-accent"
                : "bg-accent text-canvas hover:opacity-90 disabled:opacity-40"
            }`}
          >
            <Icon name="thumbsup" size={15} />
            {hasUpvoted ? "Upvoted" : "I want this too"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function Requests() {
  const { user, signIn } = useAuth();
  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [upvoted, setUpvoted] = useState(() => new Set());
  const [showForm, setShowForm] = useState(false);

  // form state
  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.active),
    []
  );
  const [formSubject, setFormSubject] = useState(activeSubjects[0]?.id ?? "");
  const [formExam, setFormExam] = useState("CAT-2");
  const [formYear, setFormYear] = useState(2026);

  function handleUpvote(id) {
    if (!user || upvoted.has(id)) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, requestedBy: [...r.requestedBy, user.uid] }
          : r
      )
    );
    setUpvoted((prev) => new Set(prev).add(id));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    const newReq = {
      id: `req-mock-${Date.now()}`,
      subjectId: formSubject,
      examType: formExam,
      year: formYear,
      requestedBy: [user.uid],
      fulfilledBy: null,
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    setShowForm(false);
  }

  const openCount = requests.filter((r) => !r.fulfilledBy).length;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 lg:max-w-7xl lg:pt-10 xl:max-w-[1400px]">
      {/* header */}
      <p className="micro">Request board</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text lg:text-3xl lg:tracking-tight">
          Paper <span className="hl">nahi mila?</span> Request karo.
        </h1>
        <button
          onClick={() => (user ? setShowForm((v) => !v) : signIn())}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-canvas shadow-[0_4px_20px_-4px_rgba(255,178,36,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-[#FFBE4D] lg:px-5"
        >
          <Icon name={showForm ? "close" : "upload"} size={15} />
          {showForm ? "Close" : "Request a paper"}
        </button>
      </div>
      <p className="mt-2 max-w-xl text-sm text-text-dim lg:text-[15px]">
        Koi upload kare jo tumhari request se match kare, to tumhe notification
        milega — <span className="text-text">"Tumhara requested paper aa gaya!"</span>
      </p>

      {/* request form */}
      {showForm && user && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-xl border border-accent-dim/60 bg-surface p-4 lg:rounded-2xl lg:p-6"
        >
          <p className="micro mb-3">New request</p>

          <div className="lg:grid lg:grid-cols-2 lg:gap-5">
          <div>
          <label className="micro mb-1 block" htmlFor="req-subject">
            Subject
          </label>
          <select
            id="req-subject"
            value={formSubject}
            onChange={(e) => setFormSubject(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-text focus:border-accent-dim focus:outline-none"
          >
            {activeSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
          </div>

          <div>
          <label className="micro mb-1 mt-4 block lg:mt-0" htmlFor="req-year">
            Year
          </label>
          <select
            id="req-year"
            value={formYear}
            onChange={(e) => setFormYear(Number(e.target.value))}
            className="min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-text focus:border-accent-dim focus:outline-none"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          </div>
          </div>

          <p className="micro mb-1 mt-4">Exam type</p>
          <div className="flex flex-wrap gap-2">
            {EXAMS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setFormExam(ex)}
                className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors ${
                  formExam === ex
                    ? "border-accent-dim bg-accent/10 text-accent"
                    : "border-hairline text-text-dim hover:text-text"
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-canvas transition-all duration-200 hover:-translate-y-px hover:bg-[#FFBE4D] sm:w-auto sm:px-6 lg:mt-5"
          >
            <Icon name="send" size={15} />
            Submit request
          </button>
        </form>
      )}

      {/* login nudge */}
      {!user && (
        <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-hairline bg-surface px-4 py-5 text-center">
          <p className="text-sm font-medium text-text">
            Requests dekh sakte ho — upvote ya naya request karne ke liye login karo
          </p>
          <button
            onClick={() => signIn()}
            className="mt-1 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-5 text-sm font-semibold text-canvas"
          >
            Login to request
          </button>
        </div>
      )}

      {/* board */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="micro">
            {openCount} open request{openCount === 1 ? "" : "s"}
          </p>
          <p className="font-mono text-[11px] text-text-dim">
            newest first
          </p>
        </div>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:gap-5 xl:grid-cols-3">
          {requests.map((r) => (
            <RequestCard
              key={r.id}
              req={r}
              hasUpvoted={upvoted.has(r.id)}
              canUpvote={!!user}
              onUpvote={handleUpvote}
              onLogin={signIn}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
