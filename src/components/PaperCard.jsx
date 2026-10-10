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
      className={`inline-flex items-center rounded-md border border-hairline bg-surface-plus px-2 py-0.5 text-[11px] font-medium text-text-muted ${
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
    <Card3D maxTilt={5} scale={1.015} className="h-full">
      <article className="metallic-card group flex h-full flex-col justify-between rounded-2xl p-4 md:p-5">
        <div>
          <Link to={detailHref} className="block min-w-0">
            <p className="break-all font-mono text-[13px] font-semibold leading-snug text-white transition-colors group-hover:text-text">
              {paper.fileName}
            </p>
            <p className="mt-1 truncate text-[13px] text-text-muted">
              {subjectName ?? paper.subjectCode}
              {paper.faculty ? ` · ${paper.faculty}` : ""}
            </p>
          </Link>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <MetaChip>{paper.examType}</MetaChip>
            <MetaChip mono>{paper.year}</MetaChip>
            <MetaChip mono>Slot {paper.slot}</MetaChip>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-4 border-t border-hairline pt-3 text-[12px] text-text-dim">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="download" size={14} className="text-white" />
              <span className="font-mono font-semibold tabular-nums text-white">
                {formatCompact(paper.downloads)}
              </span>
              downloads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="eye" size={14} />
              <span className="font-mono tabular-nums text-text-muted">
                {formatCompact(paper.views)}
              </span>
              views
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <Link
              to={detailHref}
              className="metallic-button-secondary inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all"
            >
              <Icon name="eye" size={16} />
              Preview
            </Link>
            <a
              href={paper.fileUrl}
              download={paper.fileName}
              className="metallic-button inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl text-sm font-bold text-canvas shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
            >
              <Icon name="download" size={16} />
              Download
            </a>
          </div>
        </div>
      </article>
    </Card3D>
  );
}
