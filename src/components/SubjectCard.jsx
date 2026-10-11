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
    <Card3D maxTilt={7} scale={1.025} className="h-full">
      {/* Physical Backing Edge */}
      <div
        className="pointer-events-none absolute -bottom-1 -right-1 h-full w-full rotate-[-1.5deg] rounded-2xl border border-white/5 bg-[#090909] document-stack-edge -z-10"
        aria-hidden="true"
      />

      <Link
        to={`/papers/${subject.id}`}
        className="metallic-card group relative flex h-full flex-col justify-between rounded-2xl p-5 shadow-[0_20px_44px_-20px_rgba(0,0,0,0.85)]"
      >
        <div>
          {/* Header Code Indicator */}
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <span className="coord-marker">{subject.code ?? "SUBJ"}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 transition-colors group-hover:bg-white" />
          </div>

          <p className="mt-3.5 font-display text-[17px] font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-white md:text-[18px]">
            {subject.name}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {subject.codes.map((code) => (
              <span
                key={code}
                className="inline-flex items-center rounded-md border border-[#2A2A2A] bg-[#161616] px-2 py-0.5 font-mono text-[11px] font-medium text-[#BDBDBD] transition-colors group-hover:border-[#555555] group-hover:text-white"
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#2A2A2A] pt-3.5">
          <span className="text-[12px] text-[#888888]">
            <span className="font-mono text-[13.5px] font-bold tabular-nums text-white">
              {formatCompact(subject.paperCount)}
            </span>{" "}
            papers
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#161616] text-[#888888] transition-all duration-300 group-hover:translate-x-1 group-hover:border-[#555555] group-hover:text-white">
            <Icon name="chevR" size={14} />
          </span>
        </div>
      </Link>
    </Card3D>
  );
}
