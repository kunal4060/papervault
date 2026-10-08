import Navbar from "../components/Navbar.jsx";
import SearchHero from "../components/SearchHero.jsx";
import SubjectCard from "../components/SubjectCard.jsx";
import {
  SectionHeading,
  PaperRow,
  AiInsightCard,
  ExamCountdown,
  StatStrip,
  HowItWorks,
  UploadCta,
  Footer,
} from "../components/sections.jsx";
import {
  subjects,
  getTrendingPapers,
  getStats,
  MOCK_GEMINI_ANALYSIS,
} from "../mock/index.js";

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
  const stats = getStats();
  const trending = getTrendingPapers().slice(0, 6);
  const popular = subjects.filter((s) => s.active).slice(0, 8);

  return (
    <div className="min-h-screen bg-canvas text-text">
      <Navbar />
      <main>
        <SearchHero onSearch={handleSearch} />
        <StatStrip stats={stats} />

        <div className="mx-auto max-w-6xl px-4">
          <div className="py-6">
            <ExamCountdown countdown={nextCountdown()} />
          </div>

          <section className="py-6">
            <SectionHeading
              eyebrow="Browse"
              title="Popular subjects"
              action={
                <a href="#/papers" className="text-sm font-semibold text-accent hover:underline">
                  Sab dekho
                </a>
              }
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {popular.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
          </section>

          <section className="py-6">
            <SectionHeading eyebrow="Trending" title="Is hafte zyada download hue" />
            <div className="rounded-xl border border-hairline bg-surface px-4">
              {trending.map((p) => (
                <PaperRow key={p.id} paper={p} />
              ))}
            </div>
          </section>

          <section className="py-6">
            <AiInsightCard insight={MOCK_GEMINI_ANALYSIS} />
          </section>

          <section className="py-6">
            <SectionHeading title="Kaise kaam karta hai" />
            <HowItWorks />
          </section>

          <section className="py-6">
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
