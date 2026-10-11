import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import Card3D from "./3d/Card3D.jsx";
import InteractiveVaultScene from "./3d/InteractiveVaultScene.jsx";
import {
  FloatingRing,
  FloatingFrame,
  FloatingLine,
  FloatingGrid,
  FloatingParticleField,
  DepthLayer,
} from "./3d/FloatingSpace.jsx";

// --------------------------------------------------------------------------
// SectionHeading — Editorial typography with technical coordinate tags
// --------------------------------------------------------------------------
export function SectionHeading({ eyebrow, title, action, coord }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3 md:mb-8 md:gap-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {eyebrow && (
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#888888] md:text-xs">
              <span className="mr-2 inline-block h-1 w-1 bg-white" />
              {eyebrow}
            </p>
          )}
          {coord && (
            <span className="coord-marker hidden sm:inline-block">
              // {coord}
            </span>
          )}
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white md:text-[32px] md:leading-tight">
          {title}
        </h2>
      </div>
      {/* Editorial hairline rule with technical coordinate cross */}
      <div
        aria-hidden="true"
        className="mb-2.5 hidden h-px min-w-12 flex-1 bg-[#2A2A2A] md:block"
      />
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}

// --------------------------------------------------------------------------
// PaperRow — Physical layered document row with subtle depth
// --------------------------------------------------------------------------
export function PaperRow({ paper }) {
  return (
    <div className="group relative flex items-center gap-3.5 border-b border-[#2A2A2A] py-3.5 last:border-0 transition-all duration-300 hover:bg-white/[0.03] md:-mx-2 md:rounded-xl md:px-3">
      {/* Document Icon with metallic border */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#161616] text-[#888888] transition-all duration-300 group-hover:border-[#555555] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]">
        <Icon name="file" size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <Link
          to={`/paper/${paper.id}`}
          className="block truncate font-mono text-[13.5px] font-semibold text-[#E8E8E8] transition-colors group-hover:text-white"
        >
          {paper.fileName}
        </Link>
        <p className="mt-0.5 truncate text-xs text-[#888888]">
          <span className="font-medium text-[#BDBDBD]">{paper.examType}</span> &middot;{" "}
          {paper.year} &middot; Slot {paper.slot} &middot;{" "}
          <span className="font-mono text-white">
            {(paper.downloads ?? 0).toLocaleString("en-IN")}
          </span>{" "}
          downloads
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to={`/paper/${paper.id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111111] text-[#888888] transition-all hover:border-[#555555] hover:text-white"
          aria-label="Paper kholo"
          title="Paper kholo"
        >
          <Icon name="eye" size={17} />
        </Link>
        <Link
          to={`/paper/${paper.id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111111] text-[#888888] transition-all hover:border-[#555555] hover:text-white group-hover:translate-x-0.5"
          aria-label="Details dekho"
          title="Details dekho"
        >
          <Icon name="chevR" size={17} />
        </Link>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// AiInsightCard — Neural analytical data card
// --------------------------------------------------------------------------
export function AiInsightCard({ insight }) {
  return (
    <div className="metallic-card relative overflow-hidden rounded-2xl border-l-2 border-l-white p-5 md:p-6">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          <Icon name="spark" size={14} className="text-white" /> AI SYNTHESIS // PATTERN
        </p>
        <span className="coord-marker">NEURAL-MODEL-1.5</span>
      </div>
      <p className="mt-3.5 text-[14px] leading-relaxed text-[#E8E8E8] md:text-[15px]">
        {insight.tip ?? insight.syllabusCoverage}
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------
// ExamCountdown — Spatial chronometer alert banner
// --------------------------------------------------------------------------
export function ExamCountdown({ countdown }) {
  if (!countdown || countdown.daysLeft > 30) return null;
  const label =
    countdown.daysLeft === 0
      ? "aaj se shuru!"
      : countdown.daysLeft === 1
        ? "kal se!"
        : `${countdown.daysLeft} din baaki`;

  return (
    <div className="metallic-card relative overflow-hidden rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between md:px-7 md:py-5">
      {/* Background delicate wireframe line */}
      <FloatingLine length={300} className="top-0 right-0 opacity-15" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#555555] bg-[#161616] text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]">
            <Icon name="clock" size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-[17px] font-bold text-white">
                {countdown.exam}
              </span>
              <span className="inline-flex items-center rounded-md border border-[#555555] bg-[#161616] px-2.5 py-0.5 font-mono text-xs font-semibold text-white shadow-[0_0_10px_rgba(255,255,255,0.12)]">
                {label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#888888]">{countdown.dateLabel}</p>
          </div>
        </div>
        <Link
          to="/papers"
          className="metallic-button inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl px-6 text-[13.5px] font-bold text-black shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
        >
          Papers Revise Karo &rarr;
        </Link>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// StatStrip — Monolithic metric display with spatial coordinate markers
// --------------------------------------------------------------------------
export function StatStrip({ stats, failed = false }) {
  const dash = (v) => (failed ? "—" : v);
  const items = [
    { n: dash(stats.papers.toLocaleString("en-IN")), label: "Papers in Vault", tag: "DOCS-V2" },
    { n: dash(String(stats.subjects)), label: "Subjects Covered", tag: "CURRICULUM" },
    { n: dash(String(stats.notes)), label: "Verified Notes", tag: "MODULES" },
    { n: "100%", label: "Free & Accessible", tag: "OPEN-ARCHIVE" },
  ];
  return (
    <section className="relative border-y border-hairline bg-[#0A0A0A] py-8 md:py-10">
      {/* Background spatial grid fragment */}
      <FloatingGrid className="absolute inset-0 h-full w-full opacity-10" tilt={70} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:max-w-7xl xl:max-w-[1400px]">
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-[#2A2A2A] md:gap-0">
          {items.map((s, idx) => (
            <div
              key={s.label}
              className={`text-center ${idx > 0 ? "md:pl-6" : ""} ${idx < 3 ? "md:pr-6" : ""}`}
            >
              <div className="coord-marker mb-1.5 opacity-60">[{s.tag}]</div>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl font-extrabold tracking-tight tabular-nums text-white md:text-[40px]">
                {s.n}
              </dd>
              <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#888888]">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// HowItWorks — 3D dimensional step architecture
// --------------------------------------------------------------------------
export function HowItWorks() {
  const steps = [
    {
      n: "01",
      tag: "DISCOVER",
      t: "Search karo",
      d: "Course code (e.g. CSE3002) ya subject naam se question papers aur module notes dhundo.",
    },
    {
      n: "02",
      tag: "RETRIEVE",
      t: "Preview & download",
      d: "Browser me instantly inspect karo, bina login fast PDF download karo.",
    },
    {
      n: "03",
      tag: "CONTRIBUTE",
      t: "Vault me contribute",
      d: "Apne papers upload karo, AI duplicate check ke saath vault me permanently store karo.",
    },
  ];
  return (
    <div className="relative grid gap-5 md:grid-cols-3 lg:gap-7">
      {steps.map((s) => (
        <Card3D key={s.n} maxTilt={7} scale={1.02} className="h-full">
          <div className="metallic-card relative flex h-full flex-col justify-between rounded-2xl p-6 md:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3.5">
                <span className="font-mono text-[12px] font-bold tracking-[0.22em] text-white">
                  PROTOCOL // {s.n}
                </span>
                <span className="coord-marker">{s.tag}</span>
              </div>
              <p className="mt-4 font-display text-[18px] font-bold text-white md:text-[20px]">
                {s.t}
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#BDBDBD]">
                {s.d}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#2A2A2A] pt-3 text-[10px] text-[#666666]">
              <span className="font-mono">[STEP {s.n} READY]</span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </Card3D>
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// UploadCta — Dimensional Ingestion Portal with Interactive 3D Vault
// --------------------------------------------------------------------------
export function UploadCta() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-hairline bg-[#0E0E0E] p-8 text-center md:p-14 lg:p-18">
      {/* 3D Interactive Vault Backdrop */}
      <InteractiveVaultScene />

      {/* Atmospheric Spatial Elements */}
      <FloatingRing size={480} tiltX={75} tiltY={10} opacity={0.12} className="-top-24 left-1/2 -translate-x-1/2" />
      <FloatingFrame width={200} height={120} label="INGESTION // PORTAL" className="bottom-4 left-6 hidden opacity-30 md:block" />

      <div className="relative z-10 mx-auto max-w-xl">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-hairline bg-[#161616]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888] backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Community Archive Contribution
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[38px]">
          Paper hai? <span className="hl">Vault bharo.</span>
        </h3>
        <p className="mx-auto mt-4 text-[14px] leading-relaxed text-[#BDBDBD] md:text-[16px]">
          Tumhara ek upload hazaaron students ke kaam aayega. Automatic duplicate check
          ke saath instantly vault me permanently index ho jayega.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <Link
            to="/upload"
            className="metallic-button inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl px-9 text-[15px] font-bold text-black shadow-[0_4px_24px_rgba(255,255,255,0.24)] sm:w-auto"
          >
            <Icon name="upload" size={18} />
            Paper upload karo
          </Link>
          <Link
            to="/requests"
            className="metallic-button-secondary inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl px-7 text-[14px] font-semibold text-[#E8E8E8] sm:w-auto"
          >
            Requested papers dekho &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Footer — Persistent deep space architectural footer
// --------------------------------------------------------------------------
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-[#080808]">
      {/* Background Stardust Particles in Footer */}
      <FloatingParticleField count={18} opacity={0.25} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 lg:max-w-7xl xl:max-w-[1400px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-extrabold text-xs shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
                PV
              </span>
              <p className="font-display text-xl font-extrabold tracking-tight text-white">
                Paper<span className="text-[#888888]">Vault</span>
              </p>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#888888]">
              VIT-AP previous year question papers & verified syllabus archive.
              Built by students, preserved for the entire campus.
            </p>
            <p className="coord-marker mt-4 opacity-50">
              SYS-VERSION 2.4.0 // PRODUCTION
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-14 gap-y-3.5 text-[14px]">
            {[
              ["Papers", "/papers"],
              ["Notes", "/syllabus"],
              ["Requests", "/requests"],
              ["Community Chat", "/chat"],
              ["Upload Paper", "/upload"],
              ["My Uploads", "/my-uploads"],
            ].map(([l, to]) => (
              <Link
                key={l}
                to={to}
                className="text-[#888888] transition-colors hover:text-white"
              >
                {l}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#2A2A2A] pt-6 text-xs text-[#666666] sm:flex-row">
          <p>VIT-AP Student Community Vault &middot; Educational & research use only.</p>
          <div className="flex items-center gap-3">
            <span className="coord-marker">EST. 2026 // OPEN ARCHIVE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </footer>
  );
}
