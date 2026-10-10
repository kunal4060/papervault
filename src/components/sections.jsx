import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import Card3D from "./3d/Card3D.jsx";
import InteractiveVaultScene from "./3d/InteractiveVaultScene.jsx";

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 md:mb-7 md:gap-6">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted md:text-xs">
            <span className="hidden h-px w-6 bg-white/40 md:inline-block" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl font-bold tracking-tight text-white md:text-[28px] md:leading-tight">
          {title}
        </h2>
      </div>
      {/* Editorial hairline rule */}
      <div aria-hidden="true" className="mb-2 hidden h-px min-w-8 flex-1 bg-hairline md:block" />
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}

export function PaperRow({ paper }) {
  return (
    <div className="group flex items-center gap-3.5 border-b border-hairline py-3.5 last:border-0 transition-colors duration-200 hover:bg-white/[0.02] md:-mx-2 md:rounded-xl md:px-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline bg-surface-plus text-text-dim transition-all duration-200 group-hover:border-hairline-bright group-hover:text-white">
        <Icon name="file" size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <Link
          to={`/paper/${paper.id}`}
          className="block truncate font-mono text-[13px] font-semibold text-text transition-colors group-hover:text-white"
        >
          {paper.fileName}
        </Link>
        <p className="mt-0.5 truncate text-xs text-text-dim">
          {paper.examType} &middot; {paper.year} &middot; Slot {paper.slot} &middot;{" "}
          <span className="text-text-muted">{(paper.downloads ?? 0).toLocaleString("en-IN")}</span> downloads
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          to={`/paper/${paper.id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-surface text-text-dim transition-all hover:border-hairline-bright hover:text-white"
          aria-label="Paper kholo"
          title="Paper kholo"
        >
          <Icon name="eye" size={17} />
        </Link>
        <Link
          to={`/paper/${paper.id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-surface text-text-dim transition-all hover:border-hairline-bright hover:text-white group-hover:translate-x-0.5"
          aria-label="Details dekho"
          title="Details dekho"
        >
          <Icon name="chevR" size={17} />
        </Link>
      </div>
    </div>
  );
}

export function AiInsightCard({ insight }) {
  return (
    <div className="metallic-card rounded-2xl border-l-2 border-l-white p-5 md:p-6">
      <p className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
        <Icon name="spark" size={14} className="text-white" /> AI Insight
      </p>
      <p className="text-[14px] leading-relaxed text-text md:text-[15px]">
        {insight.tip ?? insight.syllabusCoverage}
      </p>
    </div>
  );
}

export function ExamCountdown({ countdown }) {
  if (!countdown || countdown.daysLeft > 30) return null;
  const label =
    countdown.daysLeft === 0
      ? "aaj se shuru!"
      : countdown.daysLeft === 1
        ? "kal se!"
        : `${countdown.daysLeft} din baaki`;

  return (
    <div className="metallic-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-4">
      <div className="flex items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline-bright bg-surface-plus text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Icon name="clock" size={18} />
        </span>
        <div>
          <p className="font-display text-[15px] font-bold text-white">
            {countdown.exam}{" "}
            <span className="ml-1 inline-flex items-center rounded-md border border-hairline-bright bg-surface-plus px-2 py-0.5 font-mono text-xs font-semibold text-white">
              {label}
            </span>
          </p>
          <p className="text-xs text-text-dim">{countdown.dateLabel}</p>
        </div>
      </div>
      <Link
        to="/papers"
        className="metallic-button inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-xl px-5 text-[13px] font-bold text-canvas shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
      >
        Papers Revise Karo
      </Link>
    </div>
  );
}

export function StatStrip({ stats, failed = false }) {
  const dash = (v) => (failed ? "—" : v);
  const items = [
    { n: dash(stats.papers.toLocaleString("en-IN")), label: "Papers" },
    { n: dash(String(stats.subjects)), label: "Subjects" },
    { n: dash(String(stats.notes)), label: "Notes" },
    { n: "100%", label: "Free & Open" },
  ];
  return (
    <div className="border-y border-hairline bg-canvas-subtle/60 py-6 md:py-8">
      <div className="mx-auto max-w-6xl px-4 lg:max-w-7xl xl:max-w-[1400px]">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4 md:divide-x md:divide-hairline md:gap-0">
          {items.map((s, idx) => (
            <div key={s.label} className={`text-center ${idx > 0 ? "md:pl-4" : ""} ${idx < 3 ? "md:pr-4" : ""}`}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-2xl font-extrabold tracking-tight tabular-nums text-white md:text-[34px]">
                {s.n}
              </dd>
              <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-dim">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Search karo",
      d: "Course code ya subject naam se question papers aur module notes dhundo.",
    },
    {
      n: "02",
      t: "Preview & download",
      d: "Browser me instantly inspect karo, bina login fast download karo.",
    },
    {
      n: "03",
      t: "Vault me contribute",
      d: "Apne papers upload karo, AI duplicate check ke saath vault badhao.",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
      {steps.map((s) => (
        <Card3D key={s.n} maxTilt={6} scale={1.02} className="h-full">
          <div className="metallic-card flex h-full flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between border-b border-hairline pb-3.5">
                <span className="font-mono text-[12px] font-bold tracking-[0.2em] text-white">
                  STEP // {s.n}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              </div>
              <p className="mt-4 font-display text-[17px] font-bold text-white md:text-[18px]">
                {s.t}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-text-muted">
                {s.d}
              </p>
            </div>
          </div>
        </Card3D>
      ))}
    </div>
  );
}

export function UploadCta() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-8 text-center md:p-12 lg:p-16">
      {/* 3D Interactive Vault Backdrop */}
      <InteractiveVaultScene />

      {/* Atmospheric lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent)]"
      />

      <div className="relative z-10 mx-auto max-w-xl">
        <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-text-dim">
          Community Contribution &middot; 2 minutes
        </p>
        <h3 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[34px]">
          Paper hai? <span className="hl">Vault bharo.</span>
        </h3>
        <p className="mx-auto mt-4 text-[14px] leading-relaxed text-text-muted md:text-[15px]">
          Tumhara ek upload hazaaron students ke kaam aayega. Automatic duplicate check
          ke saath instantly vault me save ho jayega.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/upload"
            className="metallic-button inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-8 text-[15px] font-bold text-canvas shadow-[0_4px_20px_rgba(255,255,255,0.2)] sm:w-auto"
          >
            <Icon name="upload" size={18} />
            Paper upload karo
          </Link>
          <Link
            to="/requests"
            className="metallic-button-secondary inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 text-[14px] font-semibold text-text sm:w-auto"
          >
            Requested papers dekho
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas-subtle">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:max-w-7xl xl:max-w-[1400px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-canvas font-bold text-xs">
                PV
              </span>
              <p className="font-display text-lg font-extrabold tracking-tight text-white">
                Paper<span className="text-text-muted">Vault</span>
              </p>
            </Link>
            <p className="mt-2.5 max-w-xs text-[13px] leading-relaxed text-text-dim">
              VIT-AP previous year papers & syllabus notes archive.
              Crowdsourced by students, organized for everyone.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-[14px]">
            {[
              ["Papers", "/papers"],
              ["Notes", "/syllabus"],
              ["Requests", "/requests"],
              ["Chat", "/chat"],
              ["Upload", "/upload"],
              ["My uploads", "/my-uploads"],
            ].map(([l, to]) => (
              <Link
                key={l}
                to={to}
                className="text-text-dim transition-colors hover:text-white"
              >
                {l}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-6 text-xs text-text-dim sm:flex-row">
          <p>VIT-AP student community archive &middot; Educational use only.</p>
          <p className="font-mono text-[11px] text-text-dim/80">Est. 2026 // Production</p>
        </div>
      </div>
    </footer>
  );
}
