import Icon from "./Icon.jsx";

/** Compact count: 1240 → "1.2k". (Local copy of PaperCard's helper.) */
function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

/**
 * PaperVault — SubjectCard (Archive Noir).
 * Subject name in Space Grotesk, mono chips for ALL codes[] (codes change
 * across years — one subject page holds them all), paper count + chevron.
 *
 * Subject shape mirrors BACKEND_PLAN.md §3.1.
 */
export default function SubjectCard({ subject }) {
  return (
    <a
      href={`#/papers/${subject.id}`}
      className="group flex flex-col rounded-xl border border-hairline bg-surface p-4 transition-colors hover:border-accent-dim hover:bg-surface-plus"
    >
      <p className="font-display text-[16px] font-bold leading-snug text-text">
        {subject.name}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {subject.codes.map((code) => (
          <span
            key={code}
            className="inline-flex items-center rounded-full border border-hairline px-2.5 py-1 font-mono text-[11px] font-medium text-text-dim"
          >
            {code}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
        <span className="text-[12px] text-text-dim">
          <span className="font-mono text-[13px] font-semibold text-accent">
            {formatCompact(subject.paperCount)}
          </span>{" "}
          papers
        </span>
        <Icon
          name="chevR"
          size={16}
          className="text-text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </div>
    </a>
  );
}
