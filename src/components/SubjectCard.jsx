import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import Card3D from "./3d/Card3D.jsx";

function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

export default function SubjectCard({ subject }) {
  return (
    <Card3D maxTilt={6} scale={1.02} className="h-full">
      <Link
        to={`/papers/${subject.id}`}
        className="metallic-card group flex h-full flex-col justify-between rounded-2xl p-4 md:p-5"
      >
        <div>
          <p className="font-display text-[16px] font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-white md:text-[17px]">
            {subject.name}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {subject.codes.map((code) => (
              <span
                key={code}
                className="inline-flex items-center rounded-md border border-hairline bg-surface-plus px-2 py-0.5 font-mono text-[11px] font-medium text-text-muted transition-colors group-hover:border-hairline-bright group-hover:text-white"
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 md:pt-4">
          <span className="text-[12px] text-text-dim">
            <span className="font-mono text-[13px] font-semibold tabular-nums text-white">
              {formatCompact(subject.paperCount)}
            </span>{" "}
            papers
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-hairline bg-surface-plus text-text-dim transition-all group-hover:translate-x-1 group-hover:border-hairline-bright group-hover:text-white">
            <Icon name="chevR" size={14} />
          </span>
        </div>
      </Link>
    </Card3D>
  );
}
