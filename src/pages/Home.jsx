import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import SearchHero from "../components/SearchHero.jsx";
import SubjectCard from "../components/SubjectCard.jsx";
import {
  SectionHeading,
  PaperRow,
  ExamCountdown,
  StatStrip,
  HowItWorks,
  UploadCta,
  Footer,
} from "../components/sections.jsx";
import { useSubjects } from "../hooks/useSubjects.js";
import { getStats, getTrendingPapers, subscribeExamCountdown, DEFAULT_EXAM_COUNTDOWN } from "../firebase/db.js";

/** Format "2026-10-31" → "31 Oct"; pair → "31 Oct – 6 Nov 2026". */
function formatDateRange(startDate, endDate) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return `${d} ${months[m - 1]}`;
  };
  const s = fmt(startDate);
  const e = fmt(endDate);
  const year = startDate.slice(0, 4);
  if (startDate === endDate) return `${s} ${year}`;
  return `${s} – ${e} ${year}`;
}

/** Build the banner countdown from admin settings. Null = exam over, hide. */
function buildCountdown(settings) {
  const startsAt = new Date(`${settings.startDate}T00:00:00+05:30`);
  const daysLeft = Math.ceil((startsAt - Date.now()) / 86400000);
  if (Number.isNaN(daysLeft) || daysLeft < 0) return null; // exam khatam — banner mat dikhao
  return {
    exam: settings.examType,
    daysLeft,
    dateLabel: settings.label?.trim()
      ? settings.label.trim()
      : `${formatDateRange(settings.startDate, settings.endDate)} · sab slots`,
  };
}

// Search → /papers with query params (subject grid pre-filters).
// Exam preference sessionStorage me bhi save — subject detail page
// khulne pe exam filter pre-apply hoga.
function handleSearch(navigate, q, exam) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (exam && exam !== "All") {
    params.set("exam", exam);
    try {
      sessionStorage.setItem("papervault:exam-pref", exam);
    } catch {}
  }
  const qs = params.toString();
  navigate(`/papers${qs ? `?${qs}` : ""}`);
}

export default function Home() {
  const navigate = useNavigate();
  const { data: subjects } = useSubjects();
  const [stats, setStats] = useState(null);
  const [statsFailed, setStatsFailed] = useState(false);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [countdownSettings, setCountdownSettings] = useState(DEFAULT_EXAM_COUNTDOWN);

  useEffect(() => {
    // Exam countdown — admin settings se live (fallback: defaults).
    const unsub = subscribeExamCountdown((settings) => {
      setCountdownSettings(settings);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        // stats fail → "—" dikhega, misleading zeros nahi
        if (!cancelled) setStatsFailed(true);
      });
    getTrendingPapers(6)
      .then((rows) => {
        if (!cancelled) {
          setTrending(
            rows.map((p) => ({ ...p, downloads: p.downloads ?? 0 }))
          );
          setTrendingLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTrendingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const popular = useMemo(
    () => subjects.map((s) => ({ ...s, codes: s.codes ?? [] })).slice(0, 8),
    [subjects]
  );

  return (
    <div className="min-h-screen bg-canvas text-text">
      <Navbar />
      <main>
        <SearchHero onSearch={(q, exam) => handleSearch(navigate, q, exam)} />
        <StatStrip stats={stats ?? { papers: 0, subjects: 0, notes: 0 }} failed={statsFailed} />

        <div className="mx-auto max-w-6xl px-4 lg:max-w-7xl xl:max-w-[1400px]">
          <div className="py-6 md:py-8">
            <ExamCountdown countdown={buildCountdown(countdownSettings)} />
          </div>

          <section className="py-6 md:py-10">
            <SectionHeading
              eyebrow="Browse"
              title="Popular subjects"
              action={
                <Link
                  to="/papers"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:text-text-muted"
                >
                  Sab dekho &rarr;
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
              {popular.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
          </section>

          <section className="py-6 md:py-10">
            <SectionHeading eyebrow="Trending" title="Is hafte zyada download hue" />
            {trendingLoading ? (
              <div className="metallic-card rounded-2xl p-4 md:p-6" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-hairline py-3.5 last:border-b-0">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-plus" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-plus" />
                      <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded bg-surface-plus" />
                    </div>
                  </div>
                ))}
              </div>
            ) : trending.length === 0 ? (
              <div className="metallic-card rounded-2xl p-8 text-center">
                <p className="text-sm text-text-dim">
                  Abhi koi trending paper nahi hai — pehle papers upload karo.
                </p>
              </div>
            ) : (
              <div className="metallic-card rounded-2xl p-4 md:p-6 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:[&>*:nth-last-child(2)]:border-b-0">
                {trending.map((p) => (
                  <PaperRow key={p.id} paper={p} />
                ))}
              </div>
            )}
          </section>

          <section className="py-6 md:py-10">
            <SectionHeading title="Kaise kaam karta hai" />
            <HowItWorks />
          </section>

          <section className="py-6 md:py-10">
            <UploadCta />
          </section>
        </div>
      </main>
      <div className="mt-6">
        <Footer />
      </div>
    </div>
  );
}
