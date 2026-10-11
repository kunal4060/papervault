import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import Card3D from "./3d/Card3D.jsx";

function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

function MetaChip({ children, mono = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-[#2A2A2A] bg-[#161616] px-2.5 py-0.5 text-[11px] font-medium text-[#BDBDBD] ${
        mono ? "font-mono" : ""
      }`}
    >
      {children}
    </span>
  );
}

export default function PaperCard({ paper, subjectName }) {
  const detailHref = `/paper/${paper.id}`;

  return (
    <Card3D maxTilt={7} scale={1.02} className="h-full">
      {/* Physical Layered Paper Backing — moves backward on hover */}
      <div
        className="pointer-events-none absolute -bottom-1 -right-1 h-full w-full rotate-[-1.5deg] rounded-2xl border border-white/5 bg-[#0B0B0B] document-stack-edge transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 -z-10"
        aria-hidden="true"
      />

      <article className="metallic-card group relative flex h-full flex-col justify-between rounded-2xl p-5 shadow-[0_20px_44px_-20px_rgba(0,0,0,0.85)]">
        <div>
          {/* Header Row: Subject / Faculty */}
          <div className="flex items-start justify-between gap-2 border-b border-[#2A2A2A] pb-3">
            <span className="coord-marker">
              {paper.subjectCode ?? "DOC"}
            </span>
            <span className="font-mono text-[10px] text-[#666666]">
              {paper.year}
            </span>
          </div>

          <Link to={detailHref} className="mt-3 block min-w-0">
            <p className="break-all font-mono text-[13.5px] font-semibold leading-snug text-white transition-colors group-hover:text-white">
              {paper.fileName}
            </p>
            <p className="mt-1 truncate text-[13px] text-[#888888]">
              {subjectName ?? paper.subjectCode}
              {paper.faculty ? ` · ${paper.faculty}` : ""}
            </p>
          </Link>

          {/* Metadata Chips */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            <MetaChip>{paper.examType}</MetaChip>
            <MetaChip mono>{paper.year}</MetaChip>
            <MetaChip mono>Slot {paper.slot}</MetaChip>
          </div>
        </div>

        <div className="mt-5">
          {/* Metrics bar */}
          <div className="flex items-center gap-4 border-t border-[#2A2A2A] pt-3 text-[12px] text-[#888888]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="download" size={14} className="text-white" />
              <span className="font-mono font-semibold tabular-nums text-white">
                {formatCompact(paper.downloads)}
              </span>
              downloads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="eye" size={14} />
              <span className="font-mono tabular-nums text-[#BDBDBD]">
                {formatCompact(paper.views)}
              </span>
              views
            </span>
          </div>

          {/* Tactile Action Buttons */}
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <Link
              to={detailHref}
              className="metallic-button-secondary inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all"
            >
              <Icon name="eye" size={15} />
              Preview
            </Link>
            <a
              href={paper.fileUrl}
              download={paper.fileName}
              className="metallic-button inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-black shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
            >
              <Icon name="download" size={15} />
              Download
            </a>
          </div>
        </div>
      </article>
    </Card3D>
  );
}
