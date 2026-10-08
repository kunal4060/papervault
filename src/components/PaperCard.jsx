import Icon from "./Icon.jsx";

/**
 * PaperVault — PaperCard (Archive Noir).
 * Dark card: mono filename, subject line, exam/year/slot chips,
 * download + view counts, Preview + Download actions.
 *
 * Paper shape mirrors BACKEND_PLAN.md §3.3.
 */

/** Compact count: 1240 → "1.2k". (Local copy — Fast Refresh friendly.) */
function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

function MetaChip({ children, mono = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-hairline px-2.5 py-1 text-[11px] font-medium text-text-dim ${
        mono ? "font-mono" : ""
      }`}
    >
      {children}
    </span>
  );
}

export default function PaperCard({ paper, subjectName }) {
  const detailHref = `#/papers/${paper.id}`;

  return (
    <article className="flex flex-col rounded-xl border border-hairline bg-surface p-4 transition-colors hover:border-accent-dim hover:bg-surface-plus">
      <a href={detailHref} className="block min-w-0">
        <p className="break-all font-mono text-[13px] font-semibold leading-snug text-text">
          {paper.fileName}
        </p>
        <p className="mt-1 truncate text-[13px] text-text-dim">
          {subjectName ?? paper.subjectCode}
          {paper.faculty ? ` · ${paper.faculty}` : ""}
        </p>
      </a>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <MetaChip>{paper.examType}</MetaChip>
        <MetaChip mono>{paper.year}</MetaChip>
        <MetaChip mono>Slot {paper.slot}</MetaChip>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[12px] text-text-dim">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="download" size={14} className="text-accent" />
          <span className="font-mono font-semibold text-text">
            {formatCompact(paper.downloads)}
          </span>
          downloads
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="eye" size={14} />
          <span className="font-mono">{formatCompact(paper.views)}</span>
          views
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={detailHref}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-hairline text-sm font-semibold text-text transition-colors hover:border-text-dim"
        >
          <Icon name="eye" size={16} />
          Preview
        </a>
        <a
          href={paper.fileUrl}
          download={paper.fileName}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-accent text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
        >
          <Icon name="download" size={16} />
          Download
        </a>
      </div>
    </article>
  );
}
