import { useEffect, useMemo, useState } from "react";
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
import { getStats, getTrendingPapers } from "../firebase/db.js";

// TODO: firebase — exam dates Firestore academic-calendar se aayenge.
function nextCountdown() {
  const exam = { name: "Lab FAT", startsAt: new Date("2026-10-31T00:00:00+05:30") };
  const daysLeft = Math.ceil((exam.startsAt - Date.now()) / 86400000);
  if (daysLeft < 0) return null; // exam khatam — banner mat dikhao
  return {
    exam: exam.name,
    daysLeft,
    dateLabel: "31 Oct – 6 Nov 2026 · sab slots",
  };
}

// Search → /papers with query params (subject grid pre-filters).
// Exam preference sessionStorage me bhi save — subject detail page
// khulne pe exam filter pre-apply hoga.
function handleSearch(q, exam) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (exam && exam !== "All") {
    params.set("exam", exam);
    try {
      sessionStorage.setItem("papervault:exam-pref", exam);
    } catch {}
  }
  const qs = params.toString();
  window.location.hash = `#/papers${qs ? `?${qs}` : ""}`;
}

export default function Home() {
  const { data: subjects } = useSubjects();
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        /* stats fail → zeros dikhenge, crash nahi */
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
        <SearchHero onSearch={handleSearch} />
        <StatStrip stats={stats ?? { papers: 0, subjects: 0, notes: 0 }} />

        <div className="mx-auto max-w-6xl px-4 lg:max-w-7xl xl:max-w-[1400px]">
          <div className="py-6 md:py-8">
            <ExamCountdown countdown={nextCountdown()} />
          </div>

          <section className="py-6 md:py-10">
            <SectionHeading
              eyebrow="Browse"
              title="Popular subjects"
              action={
                <a href="#/papers" className="text-sm font-semibold text-accent hover:underline">
                  Sab dekho
                </a>
              }
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
              {popular.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
          </section>

          <section className="py-6 md:py-10">
            <SectionHeading eyebrow="Trending" title="Is hafte zyada download hue" />
            {!trendingLoading && trending.length === 0 ? (
              <p className="rounded-xl border border-hairline bg-surface px-4 py-8 text-center text-sm text-text-dim">
                Abhi koi trending paper nahi hai — pehle papers upload karo.
              </p>
            ) : (
              <div className="rounded-xl border border-hairline bg-surface px-4 md:px-5 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:[&>*:nth-last-child(2)]:border-b-0">
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
