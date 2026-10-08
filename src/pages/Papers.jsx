import { useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Icon from "../components/Icon.jsx";
import PaperCard from "../components/PaperCard.jsx";
import SubjectCard from "../components/SubjectCard.jsx";
import {
  subjects as ALL_SUBJECTS,
  getSubjectById,
  getPapersBySubject,
} from "../mock/index.js";
// NOTE: mock se seedha import (mock only mode). firebase/db.js me
// usePapers/useSubjects hooks available hain real Firebase ke liye.

/**
 * PaperVault — Papers page (Archive Noir).
 *
 * /papers            → subject grid (code-wise), searchable
 * /papers/:subjectId → subject detail: year tabs, exam-type sub-groups,
 *                     sort options, subject AI analysis at the bottom.
 *
 * DETAILED_PLAN.md §3.2: ek subject ke alag-alag saal ke codes (MAT1001 vs
 * MAT1002) ek hi subject page pe aate hain — code se fragment nahi hota.
 */

const EXAM_ORDER = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];
const ALL = "all";

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function PageHead({ eyebrow, title, sub }) {
  return (
    <div className="pt-6">
      <p className="micro">{eyebrow}</p>
      <h1 className="mt-1.5 font-display text-[28px] font-bold leading-tight text-text">
        {title}
      </h1>
      {sub ? <p className="mt-1.5 text-sm text-text-dim">{sub}</p> : null}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[40px] shrink-0 items-center rounded-full border px-4 text-[13px] font-semibold transition-colors ${
        active
          ? "border-accent text-accent"
          : "border-hairline text-text-dim hover:border-text-dim hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Subject grid (/papers)                                              */
/* ------------------------------------------------------------------ */

function SubjectGrid() {
  // Home search se aaya query (?q=) → pre-fill.
  const [query, setQuery] = useState(() => {
    const hash = window.location.hash || "";
    const qi = hash.indexOf("?");
    if (qi === -1) return "";
    return new URLSearchParams(hash.slice(qi + 1)).get("q") || "";
  });

  // Mock mode: subjects seedha mock se, code-wise sorted (BACKEND_PLAN §3.1).
  const subjects = useMemo(
    () =>
      ALL_SUBJECTS.filter((s) => s.active).sort((a, b) =>
        a.code.localeCompare(b.code)
      ),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s) => {
      if (s.name.toLowerCase().includes(q)) return true;
      if (s.code.toLowerCase().includes(q)) return true;
      if (s.codes.some((c) => c.toLowerCase().includes(q))) return true;
      // Abbreviation match: "dsa" → "Data Structures and Algorithms"
      const abbr = s.name
        .split(/\s+/)
        .filter((w) => !/^(and|of|the|for|in|on)$/i.test(w))
        .map((w) => w[0])
        .join("")
        .toLowerCase();
      return abbr.includes(q);
    });
  }, [subjects, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <PageHead
        eyebrow="Browse"
        title="Papers"
        sub="Subject-wise browse karo — code se search karo, subject kholo, saal chuno."
      />

      <div className="relative mt-5">
        <Icon
          name="search"
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Course code likho… CSE3002"
          className="min-h-[48px] w-full rounded-xl border border-hairline bg-surface pl-11 pr-4 font-mono text-sm text-text placeholder:font-body placeholder:text-text-dim focus:border-accent focus:outline-none"
          aria-label="Subject ya course code search karo"
        />
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-hairline bg-surface p-8 text-center">
            <p className="font-display text-lg font-bold text-text">
              Subject nahi mila
            </p>
            <p className="mt-1 text-sm text-text-dim">
              Code ya naam dobara check karo — ya request board pe maang lo.
            </p>
            <a
              href="#requests"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-[10px] border border-hairline px-5 text-sm font-semibold text-text"
            >
              Request a paper
            </a>
          </div>
        ) : (
          <>
            <p className="micro mb-3">
              {filtered.length} subject{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subject AI analysis — aggregate of all papers (§5B "3-saal trend")   */
/* ------------------------------------------------------------------ */

const EXAM_TYPES = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];

function SubjectAiAnalysis({ papers }) {
  const [examTab, setExamTab] = useState("CAT-1");

  const byExam = useMemo(() => {
    const result = {};
    for (const exam of EXAM_TYPES) {
      const totals = {};
      let analyzed = 0;
      for (const p of papers) {
        if (p.examType !== exam || !p.aiAnalysis?.topics) continue;
        analyzed += 1;
        for (const t of p.aiAnalysis.topics) {
          const k = t.module;
          if (!totals[k]) {
            totals[k] = {
              module: t.module,
              moduleTitle: t.moduleTitle,
              sum: 0,
              n: 0,
              qnums: new Set(),
            };
          }
          totals[k].sum += t.percentage;
          totals[k].n += 1;
          (t.questionNumbers || []).forEach((q) => totals[k].qnums.add(q));
        }
      }
      result[exam] = {
        analyzed,
        topics: Object.values(totals)
          .map((t) => ({
            module: t.module,
            moduleTitle: t.moduleTitle,
            avg: Math.round(t.sum / t.n),
            qnums: [...t.qnums].sort(),
          }))
          .sort((a, b) => b.avg - a.avg),
      };
    }
    return result;
  }, [papers]);

  const aggregate = byExam[examTab];
  const hasAny = EXAM_TYPES.some((e) => byExam[e].analyzed > 0);
  if (!hasAny) return null;

  const top = aggregate.topics[0];
  const years = [...new Set(papers.filter((p) => p.examType === examTab).map((p) => p.year))].length;

  return (
    <section className="mt-10 rounded-xl border border-hairline bg-surface p-5">
      <div className="flex items-center gap-2">
        <Icon name="spark" size={18} className="text-accent" />
        <p className="micro">Subject AI analysis</p>
      </div>
      <h2 className="mt-2 font-display text-xl font-bold text-text">
        Kidhar se <span className="hl-soft">zyada questions</span> aate hain
      </h2>

      {/* Exam-type tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {EXAM_TYPES.map((exam) => (
          <button
            key={exam}
            type="button"
            onClick={() => setExamTab(exam)}
            className={`rounded-full border px-4 py-1.5 font-mono text-[12px] font-semibold transition-colors ${
              examTab === exam
                ? "border-accent bg-accent text-[#0C0D10]"
                : "border-hairline text-text-dim hover:border-accent-dim hover:text-text"
            }`}
          >
            {exam}
            <span className="ml-1.5 opacity-70">{byExam[exam].analyzed}</span>
          </button>
        ))}
      </div>

      {aggregate.analyzed === 0 || aggregate.topics.length === 0 ? (
        <p className="mt-4 text-sm text-text-dim">
          {examTab} ka abhi koi analyzed paper nahi hai.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-text-dim">
            {examTab} me Module {top.module} ({top.moduleTitle}) se pichle{" "}
            <span className="font-mono font-semibold text-accent">
              {years} saal
            </span>{" "}
            me avg{" "}
            <span className="font-mono font-semibold text-accent">
              {top.avg}%
            </span>{" "}
            questions — {top.qnums.slice(0, 3).join(", ")}{" "}
            {top.qnums.length > 3 ? "jaise numbers " : ""}yahi se aate hain!
          </p>

          <div className="mt-5 space-y-3.5">
            {aggregate.topics.map((t, i) => (
              <div key={t.module}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-[13px] text-text">
                    <span className="mr-1.5 font-mono text-[12px] font-semibold text-text-dim">
                      M{t.module}
                    </span>
                    {t.moduleTitle}
                  </p>
                  <p className="shrink-0 font-mono text-[13px] font-semibold text-text">
                    {t.avg}
                    <span className="text-text-dim">%</span>
                  </p>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-plus">
                  <div
                    className={`h-full rounded-full ${i === 0 ? "bg-accent" : "bg-accent-dim"}`}
                    style={{ width: `${Math.min(100, t.avg)}%` }}
                  />
                </div>
                {t.qnums.length > 0 && (
                  <p className="mt-1 font-mono text-[11px] text-text-dim">
                    {t.qnums.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-5 border-t border-hairline pt-3 text-[12px] text-text-dim">
        {examTab} aggregate · {aggregate.analyzed} paper
        {aggregate.analyzed === 1 ? "" : "s"} analyzed · Naya paper approve hote
        hi update hota hai
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Subject detail (/papers/:subjectId)                                 */
/* ------------------------------------------------------------------ */

function groupPapers(papers, yearTab, examFilter, sort) {
  const filtered = papers.filter(
    (p) =>
      (yearTab === ALL || p.year === yearTab) &&
      (examFilter === ALL || p.examType === examFilter)
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === "downloads" ? b.downloads - a.downloads : b.year - a.year || b.downloads - a.downloads
  );

  if (yearTab !== ALL) {
    // single year → exam-type sub-groups
    return [
      {
        year: yearTab,
        groups: EXAM_ORDER.map((exam) => ({
          exam,
          papers: sorted.filter((p) => p.examType === exam),
        })).filter((g) => g.papers.length > 0),
      },
    ];
  }
  // all years → year sections, each with exam-type sub-groups
  const years = [...new Set(sorted.map((p) => p.year))].sort((a, b) => b - a);
  return years.map((year) => ({
    year,
    groups: EXAM_ORDER.map((exam) => ({
      exam,
      papers: sorted.filter((p) => p.year === year && p.examType === exam),
    })).filter((g) => g.papers.length > 0),
  }));
}

function SubjectDetail({ subjectId }) {
  const subject = getSubjectById(subjectId);
  // Mock mode: papers seedha mock se (synchronous).
  const papers = useMemo(
    () => (subject ? getPapersBySubject(subjectId) : []),
    [subject, subjectId]
  );
  const [yearTab, setYearTab] = useState(ALL);
  // Home search se aaya exam preference (?exam=) → pre-apply, phir clear.
  const [examFilter, setExamFilter] = useState(() => {
    try {
      const pref = sessionStorage.getItem("papervault:exam-pref");
      if (pref) {
        sessionStorage.removeItem("papervault:exam-pref");
        if (EXAM_ORDER.includes(pref)) return pref;
      }
    } catch {}
    return ALL;
  });
  const [sort, setSort] = useState("newest");

  const years = useMemo(
    () => [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a),
    [papers]
  );
  const sections = useMemo(
    () => groupPapers(papers, yearTab, examFilter, sort),
    [papers, yearTab, examFilter, sort]
  );
  const visibleCount = sections.reduce(
    (n, s) => n + s.groups.reduce((m, g) => m + g.papers.length, 0),
    0
  );

  if (!subject) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="pt-6">
          <a
            href="#/papers"
            className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-text-dim hover:text-text"
          >
            <Icon name="chevR" size={16} className="rotate-180" />
            Papers
          </a>
        </div>
        <div className="mt-4 rounded-xl border border-hairline bg-surface p-8 text-center">
          <p className="font-display text-lg font-bold text-text">
            Subject nahi mila
          </p>
          <p className="mt-1 text-sm text-text-dim">
            Ye subject exist nahi karta ya deactivate ho gaya hai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <div className="pt-6">
        <a
          href="#/papers"
          className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-text-dim hover:text-text"
        >
          <Icon name="chevR" size={16} className="rotate-180" />
          Papers
        </a>
      </div>

      {/* Header */}
      <div className="mt-1">
        <h1 className="font-display text-[26px] font-bold leading-tight text-text">
          {subject.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {subject.codes.map((code) => (
            <span
              key={code}
              className="inline-flex items-center rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[12px] font-semibold text-text"
            >
              {code}
            </span>
          ))}
        </div>
        <p className="mt-2.5 text-[13px] text-text-dim">
          <span className="font-mono font-semibold text-accent">
            {papers.length}
          </span>{" "}
          papers · {subject.program} · Sem {subject.semester}
        </p>
      </div>

      {/* Year tabs */}
      <div className="rail -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip active={yearTab === ALL} onClick={() => setYearTab(ALL)}>
          All years
        </FilterChip>
        {years.map((y) => (
          <FilterChip
            key={y}
            active={yearTab === y}
            onClick={() => setYearTab(y)}
          >
            <span className="font-mono">{y}</span>
          </FilterChip>
        ))}
      </div>

      {/* Exam filter + sort */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="rail -ml-1 flex flex-1 gap-2 overflow-x-auto px-1 py-1">
          <FilterChip
            active={examFilter === ALL}
            onClick={() => setExamFilter(ALL)}
          >
            All
          </FilterChip>
          {EXAM_ORDER.map((exam) => (
            <FilterChip
              key={exam}
              active={examFilter === exam}
              onClick={() => setExamFilter(exam)}
            >
              {exam}
            </FilterChip>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSort(sort === "newest" ? "downloads" : "newest")}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-hairline px-3.5 text-[12px] font-semibold text-text-dim hover:text-text"
          aria-label="Sort badlo"
        >
          <Icon name="clock" size={14} />
          {sort === "newest" ? "Newest" : "Top downloaded"}
        </button>
      </div>

      {/* Papers */}
      <div className="mt-6">
        {visibleCount === 0 ? (
          <div className="rounded-xl border border-hairline bg-surface p-8 text-center">
            <p className="font-display text-lg font-bold text-text">
              Paper nahi mila
            </p>
            <p className="mt-1 text-sm text-text-dim">
              Is filter me koi paper nahi hai.
            </p>
            <a
              href="#requests"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-[10px] bg-accent px-5 text-sm font-semibold text-canvas"
            >
              Request karo!
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((sec) => (
              <section key={sec.year}>
                {yearTab === ALL && (
                  <div className="mb-3 flex items-baseline gap-2">
                    <h2 className="font-mono text-[15px] font-bold text-text">
                      {sec.year}
                    </h2>
                    <span className="micro">
                      {sec.groups.reduce((n, g) => n + g.papers.length, 0)}{" "}
                      papers
                    </span>
                  </div>
                )}
                <div className="space-y-6">
                  {sec.groups.map((g) => (
                    <div key={g.exam}>
                      <p className="micro mb-2.5">
                        {g.exam} · {g.papers.length} paper
                        {g.papers.length === 1 ? "" : "s"}
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {g.papers.map((p) => (
                          <PaperCard
                            key={p.id}
                            paper={p}
                            subjectName={subject.name}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Subject AI analysis — sabse neeche (§3.2) */}
      <SubjectAiAnalysis papers={papers} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page root                                                           */
/* ------------------------------------------------------------------ */

export default function Papers({ subjectId = null }) {
  return (
    <div className="min-h-screen bg-canvas text-text">
      <Navbar />
      <main>{subjectId ? <SubjectDetail subjectId={subjectId} /> : <SubjectGrid />}</main>
    </div>
  );
}
