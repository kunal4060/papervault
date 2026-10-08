import Icon from "./Icon.jsx";

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl font-bold tracking-tight text-text md:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function PaperRow({ paper }) {
  return (
    <div className="flex items-center gap-3 border-b border-hairline py-3.5 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-plus text-text-dim">
        <Icon name="file" size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={`#/papers/${paper.id}`}
          className="block truncate font-mono text-[13px] font-semibold text-text hover:text-accent"
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-surface-plus hover:text-text"
          aria-label="Paper kholo"
          title="Paper kholo"
        >
          <Icon name="eye" size={19} />
        </a>
        <a
          href={`#/papers/${paper.id}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-surface-plus hover:text-accent"
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
    <div className="rounded-xl border border-hairline border-l-4 border-l-accent bg-surface p-4 md:p-5">
      <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
        <Icon name="spark" size={13} /> AI Insight
      </p>
      <p className="text-[14px] leading-relaxed text-text">
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-surface-plus px-4 py-3.5">
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
    <dl className="grid grid-cols-4 gap-2 border-y border-hairline bg-surface py-5">
      {items.map((s) => (
        <div key={s.label} className="text-center">
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-display text-lg font-extrabold text-text md:text-2xl">
            <span className={s.label === "free" ? "text-accent" : ""}>{s.n}</span>
          </dd>
          <dd className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-text-dim">
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
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((s) => (
        <div key={s.n} className="rounded-xl border border-hairline bg-surface p-5">
          <p className="font-mono text-[12px] font-bold text-accent">{s.n}</p>
          <p className="mt-1.5 font-display text-[16px] font-bold text-text">{s.t}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-text-dim">{s.d}</p>
        </div>
      ))}
    </div>
  );
}

export function UploadCta() {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-6 text-center md:p-8">
      <h3 className="font-display text-xl font-bold tracking-tight text-text md:text-2xl">
        Paper hai? <span className="hl-soft">Vault bharo.</span>
      </h3>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-text-dim">
        Tumhara ek upload hazaaron students ke kaam aayega. AI duplicate check
        ke saath — 2 minute me ho jayega.
      </p>
      <a
        href="#/upload"
        className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-accent px-7 text-[15px] font-bold text-canvas transition-colors hover:bg-[#FFBE4D]"
      >
        <Icon name="upload" size={18} />
        Paper upload karo
      </a>
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
