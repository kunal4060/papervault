import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Icon from "../components/Icon.jsx";
import PaperCard from "../components/PaperCard.jsx";
import {
  getPaper,
  getPapers,
  getSubject,
  bumpDownloads,
  bumpViews,
  submitReport,
} from "../firebase/db.js";
import { useAuth } from "../hooks/useAuth.js";
import { formatDate } from "../utils/format.js";

/**
 * PaperVault — Paper detail page (Archive Noir). /papers/:id
 *
 * Header + tags, action row (Preview / Download / WhatsApp / Report /
 * Bookmark), PDF placeholder (// TODO: pdfjs), AI analysis panel
 * (module bars with question numbers, patterns, tip), similar papers.
 *
 * BACKEND_PLAN.md §3.3 Paper + PaperAnalysis, DETAILED_PLAN.md §3.3 + §5B.
 */

const BOOKMARK_KEY = "papervault:bookmarks";

/** Compact count: 1240 → "1.2k". (Local copy of PaperCard's helper.) */
function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

function readBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function MetaChip({ children, mono = false, accent = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium ${
        accent ? "border-accent-dim text-accent" : "border-hairline text-text-dim"
      } ${mono ? "font-mono" : ""}`}
    >
      {children}
    </span>
  );
}

function ActionButton({ href, onClick, primary = false, disabled = false, children, label }) {
  const cls = primary
    ? "bg-accent text-canvas hover:opacity-90"
    : "border border-hairline text-text hover:border-text-dim";
  const inner = (
    <>
      {children}
      <span className="text-sm font-semibold">{label}</span>
    </>
  );
  const base =
    "inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[10px] px-4 transition-all";
  if (href) {
    return (
      <a href={href} className={`${base} ${cls}`} aria-label={label}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${cls} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      aria-label={label}
    >
      {inner}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* AI Analysis panel — topic bars, patterns, coverage, tip (§5B)       */
/* ------------------------------------------------------------------ */

function AiAnalysisPanel({ analysis }) {
  if (!analysis?.topics?.length) return null;

  const topics = [...analysis.topics].sort((a, b) => b.percentage - a.percentage);
  const marks = Object.entries(analysis.patterns?.marks ?? {}).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  );

  return (
    <section className="mt-8 rounded-xl border border-hairline bg-surface p-5 md:mt-10 md:p-8">
      <div className="flex items-center gap-2">
        <Icon name="spark" size={18} className="text-accent" />
        <p className="micro">AI analysis</p>
      </div>
      <h2 className="mt-2 font-display text-xl font-bold text-text md:text-2xl">
        Is paper me <span className="hl-soft">kya aaya tha</span>
      </h2>

      {/* Topic-wise bars — desktop pe 2-column editorial grid */}
      <div className="mt-5 space-y-4 md:mt-6 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-5 md:space-y-0">
        {topics.map((t, i) => (
          <div key={t.module}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-[13px] font-medium text-text">
                <span className="mr-1.5 font-mono text-[12px] font-semibold text-text-dim">
                  M{t.module}
                </span>
                {t.moduleTitle}
              </p>
              <p className="shrink-0 font-mono text-[13px] font-bold text-text">
                {t.percentage}
                <span className="font-medium text-text-dim">%</span>
              </p>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-plus">
              <div
                className={`h-full rounded-full ${i === 0 ? "bg-accent" : "bg-accent-dim"}`}
                style={{ width: `${Math.min(100, t.percentage)}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] text-text-dim">
                {(t.questionNumbers || []).join(" · ")}
              </p>
              <p className="shrink-0 text-[11px] text-text-dim">
                {t.questionCount} question{t.questionCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Patterns */}
      <div className="mt-6 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-2 md:mt-8 md:gap-8 md:pt-6">
        <div>
          <p className="micro mb-2">Marks pattern</p>
          <div className="flex flex-wrap gap-1.5">
            {marks.length === 0 ? (
              <span className="text-[12px] text-text-dim">—</span>
            ) : (
              marks.map(([mark, count]) => (
                <span
                  key={mark}
                  className="inline-flex items-center rounded-full border border-hairline px-2.5 py-1 font-mono text-[11px] text-text-dim"
                >
                  {mark} marks × {count}
                </span>
              ))
            )}
          </div>
        </div>
        <div>
          <p className="micro mb-2">Question types</p>
          <div className="flex flex-wrap gap-1.5">
            {(analysis.patterns?.types ?? []).map((type) => (
              <span
                key={type}
                className="inline-flex items-center rounded-full border border-hairline px-2.5 py-1 text-[11px] text-text-dim"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage gap */}
      {analysis.syllabusCoverage && (
        <div className="mt-5 rounded-lg border-l-2 border-brick bg-surface-plus px-4 py-3">
          <p className="text-[13px] leading-relaxed text-text-dim">
            <span className="font-semibold text-brick">Gap: </span>
            {analysis.syllabusCoverage}
          </p>
        </div>
      )}

      {/* Study tip */}
      {analysis.tip && (
        <div className="mt-4 rounded-lg border border-accent-dim/60 bg-surface-plus px-4 py-3.5">
          <p className="micro mb-1.5 flex items-center gap-1.5 text-accent">
            <Icon name="spark" size={13} />
            Study tip
          </p>
          <p className="text-[14px] leading-relaxed text-text">{analysis.tip}</p>
        </div>
      )}

      <p className="mt-4 text-[12px] text-text-dim">
        Analysis based on this paper · Updated{" "}
        {formatDate(analysis.analyzedAt)}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Report panel                                                        */
/* ------------------------------------------------------------------ */

const REPORT_REASONS = [
  { value: "wrong-subject", label: "Galat subject" },
  { value: "blurry", label: "Blurry / unreadable" },
  { value: "duplicate", label: "Duplicate paper" },
  { value: "other", label: "Other" },
];

function ReportPanel({ paperId, onClose }) {
  const { user, signIn } = useAuth();
  const [reason, setReason] = useState("wrong-subject");
  const [details, setDetails] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done | error | signing-in

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setState("sending");
    // Firestore: reports collection me submit karo.
    try {
      await submitReport({
        paperId,
        reportedBy: user.uid,
        reason,
        details: details.trim(),
      });
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-3 rounded-xl border border-moss/40 bg-surface p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-moss">
          <Icon name="check" size={16} />
          Report bhej diya — moderators dekhenge.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 min-h-[44px] text-sm font-semibold text-text-dim hover:text-text"
        >
          Band karo
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-hairline bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-[16px] font-bold text-text">
          Paper report karo
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-dim hover:text-text"
          aria-label="Report band karo"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {!user ? (
        <div className="mt-3">
          <p className="text-sm text-text-dim">
            Report karne ke liye login zaroori hai.
          </p>
          <button
            type="button"
            disabled={state === "signing-in"}
            onClick={async () => {
              setState("signing-in");
              try {
                await signIn();
              } catch {
                setState("idle");
              }
            }}
            className="mt-3 inline-flex min-h-[44px] items-center rounded-[10px] bg-accent px-5 text-sm font-semibold text-canvas disabled:opacity-60"
          >
            {state === "signing-in" ? "Login ho raha hai…" : "Login karo"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          {REPORT_REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[10px] border px-4 text-sm transition-colors ${
                reason === r.value
                  ? "border-accent text-text"
                  : "border-hairline text-text-dim hover:border-text-dim"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="accent-[#FFB224]"
              />
              {r.label}
            </label>
          ))}
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            placeholder="Details (optional)…"
            className="mt-2 min-h-[48px] w-full rounded-[10px] border border-hairline bg-canvas px-4 py-3 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none"
          />
          {state === "error" && (
            <p className="text-[13px] text-brick">
              Report nahi bheja gaya. Dobara try karo.
            </p>
          )}
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[10px] bg-accent text-sm font-semibold text-canvas disabled:opacity-60"
          >
            {state === "sending" ? "Bhej rahe hain…" : "Report bhejo"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * fileUrl safety: sirf https Cloudinary URLs allow karo.
 * Firestore ka URL admin-set hota hai, lekin defense-in-depth ke liye
 * javascript:/data: URLs ko kabhi href/window.open me mat daalo.
 */
function safeFileUrl(u) {
  return typeof u === "string" && /^https:\/\/res\.cloudinary\.com\//i.test(u)
    ? u
    : null;
}

export default function PaperDetail({ paperId }) {
  // Paper Firestore se (async). App.jsx <PaperDetail key={paperId}> se
  // remount hota hai, phir bhi effect paperId pe re-run hota hai.
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const viewerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPaper(paperId)
      .then((p) => {
        if (!cancelled) {
          setPaper(p);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPaper(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [paperId]);

  // Bookmark state paper load hone ke baad sync karo.
  useEffect(() => {
    setBookmarked(paper ? readBookmarks().includes(paper.id) : false);
    // View count — atomic increment, best-effort.
    if (paper?.id) bumpViews(paper.id).catch(() => {});
  }, [paper]);

  const [subject, setSubject] = useState(null);
  useEffect(() => {
    if (!paper) {
      setSubject(null);
      return;
    }
    let cancelled = false;
    getSubject(paper.subjectId)
      .then((s) => {
        if (!cancelled) setSubject(s);
      })
      .catch(() => {
        /* subject fail → code fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [paper]);

  const [similar, setSimilar] = useState([]);
  useEffect(() => {
    if (!paper) {
      setSimilar([]);
      return;
    }
    let cancelled = false;
    getPapers(paper.subjectId)
      .then((rows) => {
        if (!cancelled) {
          setSimilar(
            rows
              .filter((p) => p.id !== paper.id)
              .sort(
                (a, b) =>
                  b.year - a.year || (b.downloads ?? 0) - (a.downloads ?? 0)
              )
              .slice(0, 4)
          );
        }
      })
      .catch(() => {
        /* similar fail → section hide */
      });
    return () => {
      cancelled = true;
    };
  }, [paper]);

  function toggleBookmark() {
    if (!paper) return;
    const list = readBookmarks();
    const next = list.includes(paper.id)
      ? list.filter((id) => id !== paper.id)
      : [...list, paper.id];
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — UI state still updates */
    }
    setBookmarked(next.includes(paper.id));
  }

  function scrollToViewer() {
    viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Download: count bump (fire-and-forget), phir fileUrl kholo.
  function handleDownload(e) {
    e.preventDefault();
    const url = safeFileUrl(paper?.fileUrl);
    if (!url) return;
    bumpDownloads(paper.id).catch(() => {
      /* count fail → download still opens */
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const shareHref = paper
    ? `https://wa.me/?text=${encodeURIComponent(
        `${paper.fileName} — PaperVault se download karo:\n${window.location.href}`
      )}`
    : "#";

  // Sanitized file URL — object embed aur download links isi ko use karte hain.
  const fileUrl = safeFileUrl(paper?.fileUrl);

  return (
    <div className="min-h-screen bg-canvas text-text">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 md:pb-24 lg:max-w-7xl xl:max-w-[1400px]">
        <div className="pt-6">
          <a
            href={subject ? `#/papers/${subject.id}` : "#/papers"}
            className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-text-dim hover:text-text"
          >
            <Icon name="chevR" size={16} className="rotate-180" />
            {subject ? subject.name : "Papers"}
          </a>
        </div>

        {loading ? (
          <p className="pt-10 text-sm text-text-dim">Paper load ho raha hai…</p>
        ) : !paper ? (
          <div className="mt-4 rounded-xl border border-hairline bg-surface p-8 text-center">
            <p className="font-display text-lg font-bold text-text">
              Paper nahi mila
            </p>
            <p className="mt-1 text-sm text-text-dim">
              Ye paper exist nahi karta ya hata diya gaya hai.
            </p>
            <a
              href="#/papers"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-[10px] border border-hairline px-5 text-sm font-semibold text-text"
            >
              Saare papers dekho
            </a>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mt-2 md:mt-4">
              <p className="micro">Question paper</p>
              <h1 className="mt-1.5 break-all font-mono text-[20px] font-bold leading-snug text-text md:mt-2 md:text-[28px] md:leading-tight">
                {paper.fileName}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5 md:mt-4 md:gap-2">
                <MetaChip accent mono>
                  {subject ? subject.code : paper.subjectCode}
                </MetaChip>
                <MetaChip>{paper.examType}</MetaChip>
                <MetaChip mono>{paper.year}</MetaChip>
                <MetaChip mono>Slot {paper.slot}</MetaChip>
                {paper.faculty && <MetaChip>{paper.faculty}</MetaChip>}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-text-dim md:mt-4 md:gap-x-6 md:text-[13px]">
                <span>
                  Uploaded by{" "}
                  <span className="font-semibold text-text">
                    {paper.uploaderName}
                  </span>{" "}
                  · {formatDate(paper.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="download" size={13} className="text-accent" />
                  <span className="font-mono font-semibold text-text">
                    {formatCompact(paper.downloads)}
                  </span>{" "}
                  downloads
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="eye" size={13} />
                  <span className="font-mono">{formatCompact(paper.views)}</span>{" "}
                  views
                </span>
              </div>
            </div>

            {/* Desktop: 2-column — sticky action sidebar + main content.
                Mobile pe DOM order same rehta hai: actions pehle, phir PDF/AI. */}
            <div className="lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* Sidebar — mobile pe actions toolbar, desktop pe sticky rail */}
              <aside className="mt-5 md:mt-6 lg:order-2 lg:sticky lg:top-24 lg:mt-0">
                <div className="rounded-xl border border-hairline bg-surface p-4 md:p-5">
                  <p className="micro mb-3 hidden lg:block">Actions</p>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                    <ActionButton onClick={scrollToViewer} label="Preview">
                      <Icon name="eye" size={17} />
                    </ActionButton>
                    <ActionButton
                      onClick={handleDownload}
                      primary
                      disabled={!fileUrl}
                      label="Download"
                    >
                      <Icon name="download" size={17} />
                    </ActionButton>
                    <a
                      href={shareHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-hairline text-sm font-semibold text-text hover:border-text-dim"
                      aria-label="WhatsApp pe share karo"
                    >
                      <Icon name="share" size={16} className="text-moss" />
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowReport((v) => !v)}
                      className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold transition-colors ${
                        showReport
                          ? "border-brick text-brick"
                          : "border-hairline text-text hover:border-text-dim"
                      }`}
                      aria-label="Paper report karo"
                      aria-expanded={showReport}
                    >
                      <Icon name="close" size={15} />
                      Report
                    </button>
                    <button
                      type="button"
                      onClick={toggleBookmark}
                      className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold transition-colors ${
                        bookmarked
                          ? "border-accent text-accent"
                          : "border-hairline text-text hover:border-text-dim"
                      }`}
                      aria-label={bookmarked ? "Bookmark hatao" : "Bookmark karo"}
                      aria-pressed={bookmarked}
                    >
                      <Icon
                        name="bookmark"
                        size={16}
                        className={bookmarked ? "fill-current" : ""}
                      />
                      {bookmarked ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>

                {/* Details card — desktop sidebar only (mobile pe header me hai) */}
                <div className="mt-4 hidden rounded-xl border border-hairline bg-surface p-5 lg:block">
                  <p className="micro mb-3">Details</p>
                  <dl className="space-y-2.5 text-[13px]">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-text-dim">Exam</dt>
                      <dd className="font-mono font-semibold text-text">{paper.examType}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-text-dim">Year</dt>
                      <dd className="font-mono font-semibold text-text">{paper.year}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-text-dim">Slot</dt>
                      <dd className="font-mono font-semibold text-text">{paper.slot}</dd>
                    </div>
                    {paper.faculty && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-text-dim">Faculty</dt>
                        <dd className="truncate font-semibold text-text">{paper.faculty}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-text-dim">Uploaded by</dt>
                      <dd className="truncate font-semibold text-text">{paper.uploaderName}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-hairline pt-2.5">
                      <dt className="text-text-dim">Downloads</dt>
                      <dd className="font-mono font-semibold text-accent">{formatCompact(paper.downloads)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-text-dim">Views</dt>
                      <dd className="font-mono font-semibold text-text">{formatCompact(paper.views)}</dd>
                    </div>
                  </dl>
                </div>
              </aside>

              {/* Main column */}
              <div className="min-w-0 lg:order-1">
                {showReport && (
                  <ReportPanel
                    paperId={paper.id}
                    onClose={() => setShowReport(false)}
                  />
                )}

                {/* PDF preview — native browser embed (no extra dependency) */}
              <div
                ref={viewerRef}
                className="mt-5 scroll-mt-20 overflow-hidden rounded-xl border border-hairline bg-surface md:mt-8 lg:mt-0"
              >                {fileUrl ? (
                  <object
                    data={fileUrl}
                    type="application/pdf"
                    className="h-[70vh] min-h-[420px] w-full bg-canvas md:h-[78vh]"
                    aria-label={`${paper.fileName} PDF preview`}
                  >
                    <div className="p-8 text-center md:p-12">
                      <Icon name="file" size={40} className="mx-auto text-text-dim" />
                      <p className="mt-3 font-display text-[16px] font-bold text-text md:text-lg">
                        Preview nahi khul paya
                      </p>
                      <p className="mt-1 break-all font-mono text-[12px] text-text-dim">
                        {paper.fileName}
                      </p>
                      <a
                        href={fileUrl}
                        download={paper.fileName}
                        onClick={() => {
                          bumpDownloads(paper.id).catch(() => {});
                        }}
                        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-accent px-5 text-sm font-semibold text-canvas md:mt-5 md:px-7"
                      >
                        <Icon name="download" size={16} />
                        PDF download karo
                      </a>
                    </div>
                  </object>
                ) : (
                  <div className="p-8 text-center md:p-12">
                    <Icon name="file" size={40} className="mx-auto text-text-dim" />
                    <p className="mt-3 font-display text-[16px] font-bold text-text md:text-lg">
                      PDF available nahi hai
                    </p>
                    <p className="mt-1 break-all font-mono text-[12px] text-text-dim">
                      {paper.fileName}
                    </p>
                  </div>
                )}
              </div>

            {/* AI analysis */}
            <AiAnalysisPanel analysis={paper.aiAnalysis} />
              </div>
            </div>

            {/* Similar papers */}
            {similar.length > 0 && (
              <section className="mt-10 md:mt-14">
                <p className="micro">Aur dekho</p>
                <h2 className="mt-1.5 font-display text-xl font-bold text-text md:text-2xl">
                  Similar papers
                </h2>
                <p className="mt-1 text-sm text-text-dim">
                  Same subject, doosre saal
                </p>
                <div className="mt-4 grid gap-3 md:mt-6 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
                  {similar.map((p) => (
                    <PaperCard
                      key={p.id}
                      paper={p}
                      subjectName={subject?.name ?? p.subjectCode}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
