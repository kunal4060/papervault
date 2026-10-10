/**
 * PaperVault — Request Board page (`/requests`).
 *
 * Direction A "Archive Noir": dark request cards with mono course codes,
 * exam chips, "I want this too" upvote (live Firestore), "Request a paper"
 * form, and moss "Available" chips for fulfilled requests.
 *
 * Live data: `requests` collection via getRequests/createRequest/
 * upvoteRequest; subject names via getSubjects (real-only, no mock).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../hooks/useAuth.js";
import {
  getRequests,
  createRequest,
  upvoteRequest,
  getSubjects,
} from "../firebase/db.js";

const EXAMS = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - i);

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

function fmtDate(v) {
  const d = toDate(v);
  if (!d) return "";
  try {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function RequestCard({ req, subject, hasUpvoted, canUpvote, onUpvote, onLogin }) {
  const count = (req.requestedBy ?? []).length;
  const fulfilled = !!req.fulfilledBy;

  return (
    <article className="metallic-card rounded-2xl p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-bold text-white">
            {subject?.code ?? "—"}
          </p>
          <h3 className="mt-0.5 truncate text-[15px] font-semibold text-white">
            {subject?.name ?? "Unknown subject"}
          </h3>
        </div>
        {fulfilled ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-moss/40 bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
            <Icon name="check" size={13} />
            Available
          </span>
        ) : (
          <span className="inline-flex shrink-0 rounded-full border border-hairline bg-surface-plus px-3 py-1 font-mono text-[11px] font-semibold text-text-muted">
            {req.examType} · {req.year}
          </span>
        )}
      </div>

      {fulfilled && (
        <p className="mt-2 font-mono text-[11px] text-text-dim">
          {req.examType} · {req.year}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-3.5">
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-white">
            {count}{" "}
            <span className="text-sm font-medium text-text-dim">
              student{count === 1 ? "" : "s"} want{count === 1 ? "s" : ""} this
            </span>
          </p>
          <p className="micro mt-0.5">Requested {fmtDate(req.createdAt)}</p>
        </div>

        {fulfilled ? (
          <Link
            to="/papers"
            className="metallic-button-secondary inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all hover:text-moss"
          >
            <Icon name="file" size={15} />
            View paper
          </Link>
        ) : (
          <button
            onClick={() => (canUpvote ? onUpvote(req.id) : onLogin())}
            disabled={hasUpvoted}
            className={`inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all ${
              hasUpvoted
                ? "border border-hairline-bright bg-surface-plus text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                : "metallic-button text-canvas shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
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
  const [requests, setRequests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(() => new Set());
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  // form state
  const activeSubjects = useMemo(() => subjects.filter((s) => s.active), [subjects]);
  const [formSubject, setFormSubject] = useState("");
  const [formExam, setFormExam] = useState("CAT-2");
  const [formYear, setFormYear] = useState(THIS_YEAR);
  const defaultSubjectSet = useRef(false);

  // load requests + subjects
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rows, subs] = await Promise.all([getRequests(), getSubjects()]);
        if (cancelled) return;
        setRequests(rows);
        setSubjects(subs);
        const first = subs.filter((s) => s.active)[0];
        if (first && !defaultSubjectSet.current) {
          defaultSubjectSet.current = true;
          setFormSubject(first.id);
        }
        // already-upvoted: uid already present in requestedBy
        if (user) {
          setUpvoted(
            new Set(
              rows
                .filter((r) => (r.requestedBy ?? []).includes(user.uid))
                .map((r) => r.id)
            )
          );
        }
      } catch (err) {
        console.error("[Requests] load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  async function handleUpvote(id) {
    if (!user || upvoted.has(id)) return;
    try {
      await upvoteRequest(id, user.uid);
    } catch (err) {
      console.error("[Requests] upvote failed:", err);
      return;
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, requestedBy: [...(r.requestedBy ?? []), user.uid] }
          : r
      )
    );
    setUpvoted((prev) => new Set(prev).add(id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !formSubject) return;
    setFormError("");
    try {
      const { id } = await createRequest({
        subjectId: formSubject,
        examType: formExam,
        year: formYear,
        uid: user.uid,
      });
      const newReq = {
        id,
        subjectId: formSubject,
        examType: formExam,
        year: formYear,
        requestedBy: [user.uid],
        fulfilledBy: null,
        createdAt: new Date().toISOString(),
      };
      setRequests((prev) => [newReq, ...prev]);
      setUpvoted((prev) => new Set(prev).add(id));
      setShowForm(false);
    } catch (err) {
      console.error("[Requests] create failed:", err);
      setFormError("Request submit nahi hui. Internet check karke dobara try karo.");
    }
  }

  const openCount = requests.filter((r) => !r.fulfilledBy).length;

  return (
    <div className="min-h-screen bg-canvas text-text">
      <Navbar />
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
        Koi upload kare jo tumhari request se match kare, to request board pe <span className="text-moss">"Available"</span> dikhega — nazar rakho!
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
            <option value="">Select…</option>
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

          {formError && (
            <p className="mt-3 text-xs font-medium text-brick">{formError}</p>
          )}

          <button
            type="submit"
            disabled={!formSubject}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-canvas transition-all duration-200 hover:-translate-y-px hover:bg-[#FFBE4D] disabled:opacity-40 sm:w-auto sm:px-6 lg:mt-5"
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
        {loading ? (
          <div className="py-16 text-center">
            <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-hairline bg-surface p-10 text-center lg:p-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-canvas text-text-dim">
              <Icon name="send" size={22} />
            </div>
            <h2 className="font-display text-lg font-bold text-text">
              Abhi koi request nahi hai
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-text-dim">
              Pehli request banao — koi upload karega to tumhe pata chal jayega.
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:gap-5 xl:grid-cols-3">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                req={r}
                subject={subjectMap.get(r.subjectId)}
                hasUpvoted={upvoted.has(r.id)}
                canUpvote={!!user}
                onUpvote={handleUpvote}
                onLogin={signIn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
