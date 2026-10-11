import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      className={`inline-flex items-center rounded-md border border-[#262626] bg-[#141414] px-2.5 py-0.5 text-[11px] font-medium text-[#BDBDBD] transition-all group-hover:border-[#444444] ${
        mono ? "font-mono" : ""
      }`}
    >
      {children}
    </span>
  );
}

export default function PaperCard({ paper, subjectName }) {
  const detailHref = `/paper/${paper.id}`;
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handlePreview = (e) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) return;
    e.preventDefault();
    if (isOpening) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      navigate(detailHref);
      return;
    }

    setIsOpening(true);
    timer.current = setTimeout(() => {
      navigate(detailHref);
    }, 180);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
    }, 600);
  };

  return (
    <Card3D maxTilt={8} scale={1.03} className="h-full">
      {/* Deepest physical backing sheet */}
      <div
        className="pointer-events-none absolute -bottom-2 -right-2 h-full w-full rotate-[-2.8deg] rounded-2xl border border-white/5 bg-[#070707] opacity-50 document-stack-edge transition-all duration-300 group-hover:rotate-[-5deg] group-hover:opacity-75 -z-20"
        aria-hidden="true"
      />

      {/* Middle physical backing sheet */}
      <div
        className="pointer-events-none absolute -bottom-1 -right-1 h-full w-full rotate-[1.8deg] rounded-2xl border border-white/8 bg-[#0C0C0C] opacity-75 document-stack-edge transition-all duration-300 group-hover:rotate-[3deg] group-hover:opacity-95 -z-10"
        aria-hidden="true"
      />

      <article
        className={`metallic-card group relative flex h-full flex-col justify-between rounded-2xl p-5 select-none preserve-3d transition-all duration-200 ${
          isOpening
            ? "scale-[0.97] border-white/40 shadow-[0_0_35px_rgba(255,255,255,0.22)]"
            : "shadow-[0_20px_48px_-20px_rgba(0,0,0,0.9)] hover:border-white/20 hover:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.95)]"
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div>
          {/* Header Row: Subject / Faculty */}
          <div
            className="flex items-start justify-between gap-2 border-b border-[#242424] pb-3 transition-transform duration-300"
            style={{ transform: "translateZ(14px)" }}
          >
            <span className="coord-marker">
              {paper.subjectCode ?? "DOC"}
            </span>
            <span className="font-mono text-[10px] text-[#666666]">
              {paper.year}
            </span>
          </div>

          <div
            onClick={handlePreview}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handlePreview(e)}
            className="mt-3 block min-w-0 cursor-pointer text-left"
            style={{ transform: "translateZ(24px)" }}
          >
            <p className="break-all font-mono text-[13.5px] font-semibold leading-snug text-white transition-colors group-hover:text-white">
              {paper.fileName}
            </p>
            <p className="mt-1 truncate text-[13px] text-[#888888]">
              {subjectName ?? paper.subjectCode}
              {paper.faculty ? ` · ${paper.faculty}` : ""}
            </p>
          </div>

          {/* Metadata Chips */}
          <div
            className="mt-3.5 flex flex-wrap gap-1.5 transition-transform duration-300"
            style={{ transform: "translateZ(12px)" }}
          >
            <MetaChip>{paper.examType}</MetaChip>
            <MetaChip mono>{paper.year}</MetaChip>
            <MetaChip mono>Slot {paper.slot}</MetaChip>
          </div>
        </div>

        <div className="mt-5">
          {/* Metrics bar */}
          <div
            className="flex items-center gap-4 border-t border-[#242424] pt-3 text-[12px] text-[#888888] transition-transform duration-300"
            style={{ transform: "translateZ(16px)" }}
          >
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
          <div
            className="mt-3.5 grid grid-cols-2 gap-2 transition-transform duration-300"
            style={{ transform: "translateZ(20px)" }}
          >
            <button
              type="button"
              onClick={handlePreview}
              className={`metallic-button-secondary inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-95 ${
                isOpening ? "border-white bg-white text-black" : ""
              }`}
            >
              <Icon name="eye" size={15} />
              Preview
            </button>
            {paper.fileUrl ? (
              <a
                href={paper.fileUrl}
                download={paper.fileName}
                onClick={handleDownload}
                className={`metallic-button inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-black shadow-[0_2px_12px_rgba(255,255,255,0.2)] transition-all active:scale-95 ${
                  isDownloading ? "scale-95 bg-white shadow-[0_0_20px_white]" : ""
                }`}
              >
                {isDownloading ? (
                  <Icon name="check" size={15} className="animate-bounce" />
                ) : (
                  <Icon name="download" size={15} />
                )}
                {isDownloading ? "Saved" : "Download"}
              </a>
            ) : (
              <button
                type="button"
                onClick={handlePreview}
                className="metallic-button inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-black shadow-[0_2px_12px_rgba(255,255,255,0.2)] transition-all active:scale-95"
              >
                <Icon name="chevR" size={15} />
                Inspect
              </button>
            )}
          </div>
        </div>
      </article>
    </Card3D>
  );
}
