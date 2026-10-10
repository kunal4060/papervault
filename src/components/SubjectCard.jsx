import { Link } from "react-router-dom";
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
    <Link
      to={`/papers/${subject.id}`}
      className="group flex flex-col rounded-xl border border-hairline bg-surface p-4 transition-all duration-200 hover:border-accent-dim hover:bg-surface-plus md:p-5 lg:hover:-translate-y-1 lg:hover:border-accent/50 lg:hover:shadow-[0_20px_44px_-22px_rgba(0,0,0,0.85)]"
    >
      <p className="font-display text-[16px] font-bold leading-snug tracking-tight text-text md:text-[17px]">
        {subject.name}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {subject.codes.map((code) => (
          <span
            key={code}
            className="inline-flex items-center rounded-full border border-hairline px-2.5 py-1 font-mono text-[11px] font-medium text-text-dim transition-colors group-hover:border-accent/30"
          >
            {code}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 md:mt-4 md:pt-4">
        <span className="text-[12px] text-text-dim">
          <span className="font-mono text-[13px] font-semibold tabular-nums text-accent">
            {formatCompact(subject.paperCount)}
          </span>{" "}
          papers
        </span>
        <Icon
          name="chevR"
          size={16}
          className="text-text-dim transition-all group-hover:translate-x-0.5 group-hover:text-accent lg:group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
