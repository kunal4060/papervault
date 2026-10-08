import Icon from "./Icon.jsx";

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 md:mb-6 md:gap-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent md:text-xs">
            <span className="hidden h-px w-6 bg-accent/60 md:inline-block" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl font-bold tracking-tight text-text md:text-[28px] md:leading-tight">
          {title}
        </h2>
      </div>
      {/* editorial hairline rule — desktop only */}
      <div aria-hidden="true" className="mb-2 hidden h-px min-w-8 flex-1 bg-hairline md:block" />
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}

export function PaperRow({ paper }) {
  return (
    <div className="group flex items-center gap-3 border-b border-hairline py-3.5 last:border-0 md:-mx-2 md:rounded-lg md:px-2 md:transition-colors md:hover:bg-white/[0.03]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-plus text-text-dim transition-colors group-hover:border group-hover:border-accent/40 group-hover:text-accent">
        <Icon name="file" size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={`#/papers/${paper.id}`}
          className="block truncate font-mono text-[13px] font-semibold text-text transition-colors group-hover:text-accent"
        >
          {paper.fileName}
        </a>
        <p className="mt-0.5 truncate text-xs text-text-dim">
          {paper.examType} &middot; {paper.year} &middot; Slot {paper.slot} &middot;{" "}
          {paper.downloads.toLocaleString("en-IN")} downloads
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={`#/papers/${paper.id}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-dim transition-all hover:bg-surface-plus hover:text-text md:group-hover:translate-x-0.5"
          aria-label="Paper kholo"
          title="Paper kholo"
        >
          <Icon name="eye" size={19} />
        </a>
        <a
          href={`#/papers/${paper.id}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-dim transition-all hover:bg-surface-plus hover:text-accent md:group-hover:translate-x-1 md:group-hover:text-accent"
          aria-label="Details dekho"
          title="Details dekho"
        >
          <Icon name="chevR" size={19} />
        </a>
      </div>
    </div>
  );
}

export function AiInsightCard({ insight }) {
  return (
    <div className="rounded-xl border border-hairline border-l-4 border-l-accent bg-surface p-4 md:p-6 lg:shadow-[0_24px_56px_-28px_rgba(0,0,0,0.8)]">
      <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
        <Icon name="spark" size={13} /> AI Insight
      </p>
      <p className="text-[14px] leading-relaxed text-text md:text-[15px]">
        {insight.tip ?? insight.syllabusCoverage}
      </p>
    </div>
  );
}

// TODO: compute daysLeft from academic calendar in Firestore.
export function ExamCountdown({ countdown }) {
  if (!countdown || countdown.daysLeft > 30) return null;
  const label =
    countdown.daysLeft === 0
      ? "aaj se shuru!"
      : countdown.daysLeft === 1
        ? "kal se!"
        : `${countdown.daysLeft} days me`;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-surface-plus px-4 py-3.5 md:px-5 md:py-4 lg:shadow-[0_16px_48px_-24px_rgba(255,178,36,0.35)]">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Icon name="clock" size={18} />
        </span>
        <div>
          <p className="font-display text-[15px] font-bold text-text">
            {countdown.exam} <span className="hl-soft">{label}</span>
          </p>
          <p className="text-xs text-text-dim">{countdown.dateLabel}</p>
        </div>
      </div>
      <a
        href="#/papers"
        className="inline-flex min-h-[44px] shrink-0 items-center rounded-lg bg-accent px-4 text-[13px] font-bold text-canvas transition-colors hover:bg-[#FFBE4D]"
      >
        Revise
      </a>
    </div>
  );
}

export function StatStrip({ stats }) {
  const items = [
    { n: stats.papers.toLocaleString("en-IN") + "+", label: "papers" },
    { n: stats.subjects + "+", label: "subjects" },
    { n: stats.notes + "+", label: "notes" },
    { n: "100%", label: "free" },
  ];
  return (
    <dl className="grid grid-cols-4 gap-2 border-y border-hairline bg-surface py-5 md:py-7 lg:grid-cols-4 lg:divide-x lg:divide-hairline lg:gap-0">
      {items.map((s) => (
        <div key={s.label} className="px-2 text-center">
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums text-text md:text-[26px]">
            <span className={s.label === "free" ? "text-accent" : ""}>{s.n}</span>
          </dd>
          <dd className="mt-1 text-[11px] uppercase tracking-[0.12em] text-text-dim">
            {s.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "01", t: "Search karo", d: "Course code ya subject naam se paper dhundo." },
    { n: "02", t: "Preview & download", d: "Browser me dekho, bina login download karo." },
    { n: "03", t: "Contribute karo", d: "Apne papers upload karo, community badhao." },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-3 md:gap-4">
      {steps.map((s) => (
        <div
          key={s.n}
          className="rounded-xl border border-hairline bg-surface p-5 transition-all duration-200 md:p-6 lg:hover:-translate-y-1 lg:hover:border-accent/40 lg:hover:shadow-[0_20px_44px_-22px_rgba(0,0,0,0.85)]"
        >
          <div className="flex items-center gap-3">
            <p className="font-mono text-[12px] font-bold tracking-[0.14em] text-accent">
              {s.n}
            </p>
            <div aria-hidden="true" className="h-px flex-1 bg-hairline" />
          </div>
          <p className="mt-3 font-display text-[16px] font-bold text-text md:text-[17px]">
            {s.t}
          </p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-text-dim">{s.d}</p>
        </div>
      ))}
    </div>
  );
}

export function UploadCta() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-6 text-center md:p-8 lg:p-12">
      {/* desktop ambience */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[110px]" />
      </div>
      <div className="relative">
        <p className="mb-3 hidden font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-text-dim lg:block">
          Community &middot; 2 minute me
        </p>
        <h3 className="font-display text-xl font-bold tracking-tight text-text md:text-2xl lg:text-[30px]">
          Paper hai? <span className="hl-soft">Vault bharo.</span>
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-text-dim md:text-[15px]">
          Tumhara ek upload hazaaron students ke kaam aayega. AI duplicate check
          ke saath — 2 minute me ho jayega.
        </p>
        <a
          href="#/upload"
          className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-accent px-7 text-[15px] font-bold text-canvas transition-all hover:bg-[#FFBE4D] lg:mt-6 lg:hover:shadow-[0_12px_36px_-10px_rgba(255,178,36,0.55)]"
        >
          <Icon name="upload" size={18} />
          Paper upload karo
        </a>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight text-text">
              Paper<span className="text-accent">Vault</span>
            </p>
            <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-text-dim">
              VIT-AP ka paper vault — previous year papers aur verified notes,
              students ke liye, students dwara.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-[14px]">
            {[
              ["Papers", "#/papers"],
              ["Syllabus", "#/syllabus"],
              ["Requests", "#/requests"],
              ["Chat", "#/chat"],
              ["Upload", "#/upload"],
              ["My uploads", "#/my-uploads"],
            ].map(([l, href]) => (
              <a key={l} href={href} className="text-text-dim hover:text-text">
                {l}
              </a>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-hairline pt-5 text-xs text-text-dim">
          Papers students dwara contribute kiye gaye hain — educational use ke liye.
        </p>
      </div>
    </footer>
  );
}
