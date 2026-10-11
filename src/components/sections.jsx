import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import Card3D from "./3d/Card3D.jsx";
import InteractiveVaultScene from "./3d/InteractiveVaultScene.jsx";
import {
  FloatingRing,
  FloatingFrame,
  FloatingLine,
  FloatingGrid,
  FloatingParticleField,
} from "./3d/FloatingSpace.jsx";

// --------------------------------------------------------------------------
// SectionHeading — Editorial typography with technical coordinate tags
// --------------------------------------------------------------------------
export function SectionHeading({ eyebrow, title, action, coord }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3 md:mb-8 md:gap-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {eyebrow && (
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#888888] md:text-xs">
              <span className="mr-2 inline-block h-1 w-1 bg-white" />
              {eyebrow}
            </p>
          )}
          {coord && (
            <span className="coord-marker hidden sm:inline-block">
              // {coord}
            </span>
          )}
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white md:text-[32px] md:leading-tight">
          {title}
        </h2>
      </div>
      {/* Editorial hairline rule with technical coordinate cross */}
      <div
        aria-hidden="true"
        className="mb-2.5 hidden h-px min-w-12 flex-1 bg-[#2A2A2A] md:block"
      />
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}

// --------------------------------------------------------------------------
// PaperRow — Physical layered document row with subtle depth & tactile actions
// --------------------------------------------------------------------------
export function PaperRow({ paper }) {
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const openTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
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
      navigate(`/paper/${paper.id}`);
      return;
    }

    setIsOpening(true);
    openTimer.current = setTimeout(() => {
      navigate(`/paper/${paper.id}`);
    }, 180);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
    }, 600);
  };

  return (
    <div
      className={`group relative flex items-center gap-3.5 border-b border-[#222222] py-3.5 last:border-0 transition-all duration-300 md:-mx-2 md:rounded-xl md:px-3 md:py-3.5 ${
        isOpening
          ? "bg-white/[0.08] scale-[0.99] border-white/30"
          : "hover:bg-[#141414] hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:border-white/10"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Physical Layered Document Icon Container */}
      <div className="relative shrink-0 select-none">
        {/* Physical Under-sheet — separates and rotates on hover/open */}
        <div
          className={`pointer-events-none absolute -bottom-1 -right-1 h-11 w-11 rounded-xl border border-white/5 bg-[#090909] transition-all duration-300 ${
            isOpening
              ? "rotate-[-12deg] translate-x-[-3px] translate-y-[3px] opacity-100"
              : "rotate-[-3.5deg] group-hover:rotate-[-7deg] group-hover:translate-x-[-1px] group-hover:translate-y-[2px] opacity-60"
          }`}
          aria-hidden="true"
        />

        {/* Primary Document Icon Surface */}
        <div
          onClick={handlePreview}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handlePreview(e)}
          className={`relative z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border bg-[#161616] text-[#888888] transition-all duration-300 ${
            isDownloading
              ? "scale-90 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : isOpening
                ? "rotate-[-6deg] border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                : "border-[#262626] group-hover:border-[#666666] group-hover:text-white group-hover:shadow-[0_4px_16px_rgba(255,255,255,0.08)] group-hover:-translate-y-0.5"
          }`}
        >
          {isDownloading ? (
            <Icon name="check" size={18} className="text-white animate-bounce" />
          ) : (
            <Icon name="file" size={19} />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={handlePreview}
          className="block w-full text-left truncate font-mono text-[13.5px] font-semibold text-[#E8E8E8] transition-colors group-hover:text-white"
        >
          {paper.fileName}
        </button>
        <p className="mt-0.5 truncate text-xs text-[#888888]">
          <span className="font-medium text-[#BDBDBD]">{paper.examType}</span> &middot;{" "}
          {paper.year} &middot; Slot {paper.slot} &middot;{" "}
          <span className="font-mono text-white">
            {(paper.downloads ?? 0).toLocaleString("en-IN")}
          </span>{" "}
          downloads
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handlePreview}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
            isOpening
              ? "border-white bg-white text-black scale-105"
              : "border-[#262626] bg-[#111111] text-[#888888] hover:border-[#666666] hover:text-white active:scale-95"
          }`}
          aria-label="Paper preview"
          title="Paper preview"
        >
          <Icon name="eye" size={17} />
        </button>
        {paper.fileUrl ? (
          <a
            href={paper.fileUrl}
            download={paper.fileName}
            onClick={handleDownload}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
              isDownloading
                ? "border-white bg-white text-black scale-105"
                : "border-[#262626] bg-[#111111] text-[#888888] hover:border-[#666666] hover:text-white active:scale-95 group-hover:translate-x-0.5"
            }`}
            aria-label="Direct download"
            title="Direct download"
          >
            <Icon name="download" size={16} />
          </a>
        ) : (
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#262626] bg-[#111111] text-[#888888] transition-all hover:border-[#666666] hover:text-white active:scale-95 group-hover:translate-x-0.5"
            aria-label="View Details"
            title="View Details"
          >
            <Icon name="chevR" size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// AiInsightCard — Neural analytical data card
// --------------------------------------------------------------------------
export function AiInsightCard({ insight }) {
  return (
    <div className="metallic-card relative overflow-hidden rounded-2xl border-l-2 border-l-white p-5 md:p-6">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          <Icon name="spark" size={14} className="text-white" /> AI SYNTHESIS // PATTERN
        </p>
        <span className="coord-marker">NEURAL-MODEL-1.5</span>
      </div>
      <p className="mt-3.5 text-[14px] leading-relaxed text-[#E8E8E8] md:text-[15px]">
        {insight.tip ?? insight.syllabusCoverage}
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------
// ExamCountdown — Spatial chronometer alert banner
// --------------------------------------------------------------------------
export function ExamCountdown({ countdown }) {
  if (!countdown || countdown.daysLeft > 30) return null;
  const label =
    countdown.daysLeft === 0
      ? "Starts today!"
      : countdown.daysLeft === 1
        ? "Starts tomorrow!"
        : `${countdown.daysLeft} days remaining`;

  return (
    <div className="metallic-card relative overflow-hidden rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between md:px-7 md:py-5">
      {/* Background delicate wireframe line */}
      <FloatingLine length={300} className="top-0 right-0 opacity-15" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#555555] bg-[#161616] text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]">
            <Icon name="clock" size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-[17px] font-bold text-white">
                {countdown.exam}
              </span>
              <span className="inline-flex items-center rounded-md border border-[#555555] bg-[#161616] px-2.5 py-0.5 font-mono text-xs font-semibold text-white shadow-[0_0_10px_rgba(255,255,255,0.12)]">
                {label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#888888]">{countdown.dateLabel}</p>
          </div>
        </div>
        <Link
          to="/papers"
          className="metallic-button inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl px-6 text-[13.5px] font-bold text-black shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
        >
          Revise Your Papers &rarr;
        </Link>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// StatStrip — Monolithic metric display with spatial coordinate markers
// --------------------------------------------------------------------------
export function StatStrip({ stats, failed = false }) {
  const dash = (v) => (failed ? "—" : v);
  const items = [
    { n: dash(stats.papers.toLocaleString("en-IN")), label: "Papers in Vault", tag: "DOCS-V2" },
    { n: dash(String(stats.subjects)), label: "Subjects Covered", tag: "CURRICULUM" },
    { n: dash(String(stats.notes)), label: "Verified Notes", tag: "MODULES" },
    { n: "100%", label: "Free & Accessible", tag: "OPEN-ARCHIVE" },
  ];
  return (
    <section className="relative border-y border-hairline bg-[#0A0A0A] py-8 md:py-10">
      {/* Background spatial grid fragment */}
      <FloatingGrid className="absolute inset-0 h-full w-full opacity-10" tilt={70} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:max-w-7xl xl:max-w-[1400px]">
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-[#2A2A2A] md:gap-0">
          {items.map((s, idx) => (
            <div
              key={s.label}
              className={`text-center ${idx > 0 ? "md:pl-6" : ""} ${idx < 3 ? "md:pr-6" : ""}`}
            >
              <div className="coord-marker mb-1.5 opacity-60">[{s.tag}]</div>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl font-extrabold tracking-tight tabular-nums text-white md:text-[40px]">
                {s.n}
              </dd>
              <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#888888]">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// HowItWorks — 3-Step Spatial Architecture (Chambers, not cards)
// --------------------------------------------------------------------------
export function HowItWorks() {
  const navigate = useNavigate();

  const handleStepClick = (to) => {
    navigate(to);
  };

  return (
    <div className="relative pt-4 pb-2">
      {/* Spatial Pipeline Guideline across Desktop */}
      <div className="relative mb-8 hidden items-center justify-between px-10 lg:flex" aria-hidden="true">
        <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-white/10 via-white/30 to-white/10" />
        
        {/* Node 1 */}
        <div className="relative z-10 flex items-center gap-2 rounded-full border border-white/20 bg-[#0C0C0C] px-3.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white shadow-[0_0_12px_rgba(255,255,255,0.08)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
          <span>PHASE 01 // DISCOVER</span>
        </div>

        {/* Node 2 */}
        <div className="relative z-10 flex items-center gap-2 rounded-full border border-white/20 bg-[#0C0C0C] px-3.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white shadow-[0_0_12px_rgba(255,255,255,0.08)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
          <span>PHASE 02 // RETRIEVE</span>
        </div>

        {/* Node 3 */}
        <div className="relative z-10 flex items-center gap-2 rounded-full border border-white/20 bg-[#0C0C0C] px-3.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white shadow-[0_0_12px_rgba(255,255,255,0.08)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
          <span>PHASE 03 // CONTRIBUTE</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
        {/* ------------------------------------------------------------- */}
        {/* CHAMBER 01: THE SEARCH TERMINAL                              */}
        {/* ------------------------------------------------------------- */}
        <Card3D maxTilt={8} scale={1.02} className="h-full">
          <div
            onClick={() => handleStepClick("/papers")}
            onMouseEnter={() => setActiveStep("01")}
            onMouseLeave={() => setActiveStep(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleStepClick("/papers")}
            className="metallic-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-7 select-none preserve-3d transition-all duration-300 hover:border-white/30 hover:shadow-[0_24px_50px_-16px_rgba(0,0,0,0.9)] active:scale-[0.98]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Background delicate orbital accent */}
            <FloatingRing size={160} tiltX={70} tiltY={20} opacity={0.12} className="-right-10 -top-10" />

            <div>
              {/* Header Protocol */}
              <div
                className="flex items-center justify-between border-b border-[#242424] pb-3.5"
                style={{ transform: "translateZ(12px)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-widest text-white">
                    PROTOCOL // 01
                  </span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-wider text-[#666666] sm:inline-block">
                    [TERMINAL]
                  </span>
                </div>
                <span className="coord-marker">DISCOVER</span>
              </div>

              {/* 3D Visual Chamber: Miniature Search Terminal */}
              <div
                className="relative my-6 flex h-36 items-center justify-center rounded-2xl border border-white/8 bg-[#090909] p-3 shadow-inner"
                style={{ transform: "translateZ(20px)" }}
              >
                {/* Background Blueprint Paper Sheet */}
                <div
                  className="pointer-events-none absolute h-24 w-36 rounded-lg border border-white/10 bg-[#121212] document-stack-edge transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105"
                  style={{ transform: "rotate(-4deg)" }}
                  aria-hidden="true"
                >
                  <div className="space-y-1.5 p-2.5 opacity-30">
                    <div className="h-1 w-2/3 bg-white" />
                    <div className="h-1 w-full bg-white/60" />
                    <div className="h-1 w-4/5 bg-white/40" />
                  </div>
                </div>

                {/* Floating Miniature Console Search Bar */}
                <div
                  className="relative z-10 flex w-11/12 items-center gap-2 rounded-xl border border-white/20 bg-[#181818]/90 px-3.5 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 group-hover:border-white/50 group-hover:shadow-[0_10px_24px_rgba(255,255,255,0.1)]"
                  style={{ transform: "translateZ(14px)" }}
                >
                  <Icon name="search" size={15} className="text-white" />
                  <span className="font-mono text-xs text-[#E8E8E8]">
                    CSE3002<span className="animate-pulse text-white font-bold">|</span>
                  </span>
                  <span className="ml-auto rounded border border-[#333333] bg-[#222222] px-1.5 py-0.5 font-mono text-[9px] text-[#888888]">
                    CR-2
                  </span>
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-white md:text-[22px]">
                Search the Archive
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#BDBDBD]">
                Search by course code or subject name to discover question papers and verified academic resources.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#242424] pt-3.5 text-xs text-[#888888]">
              <span className="font-mono text-[11px] text-[#BDBDBD] group-hover:text-white transition-colors">
                Search the archive &rarr;
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#141414] text-white">
                <Icon name="chevR" size={13} />
              </span>
            </div>
          </div>
        </Card3D>

        {/* ------------------------------------------------------------- */}
        {/* CHAMBER 02: THE DOCUMENT STACK DECK                          */}
        {/* ------------------------------------------------------------- */}
        <Card3D maxTilt={8} scale={1.02} className="h-full">
          <div
            onClick={() => handleStepClick("/papers")}
            onMouseEnter={() => setActiveStep("02")}
            onMouseLeave={() => setActiveStep(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleStepClick("/papers")}
            className="metallic-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-7 select-none preserve-3d transition-all duration-300 hover:border-white/30 hover:shadow-[0_24px_50px_-16px_rgba(0,0,0,0.9)] active:scale-[0.98]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Background perspective grid accent */}
            <FloatingGrid className="absolute -bottom-8 -left-8 h-36 w-36 opacity-10" tilt={60} />

            <div>
              {/* Header Protocol */}
              <div
                className="flex items-center justify-between border-b border-[#242424] pb-3.5"
                style={{ transform: "translateZ(12px)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-widest text-white">
                    PROTOCOL // 02
                  </span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-wider text-[#666666] sm:inline-block">
                    [INSPECTION]
                  </span>
                </div>
                <span className="coord-marker">RETRIEVE</span>
              </div>

              {/* 3D Visual Chamber: Fanning Document Stack */}
              <div
                className="relative my-6 flex h-36 items-center justify-center rounded-2xl border border-white/8 bg-[#090909] p-3 shadow-inner"
                style={{ transform: "translateZ(20px)" }}
              >
                {/* Layer 1 (Bottom Sheet) */}
                <div
                  className="pointer-events-none absolute h-24 w-36 rounded-lg border border-white/5 bg-[#0C0C0C] document-stack-edge transition-all duration-500 group-hover:rotate-[-12deg] group-hover:translate-x-[-6px]"
                  style={{ transform: "rotate(-6deg)" }}
                  aria-hidden="true"
                />

                {/* Layer 2 (Middle Sheet) */}
                <div
                  className="pointer-events-none absolute h-24 w-36 rounded-lg border border-white/10 bg-[#121212] document-stack-edge transition-all duration-500 group-hover:rotate-[8deg] group-hover:translate-x-[6px]"
                  style={{ transform: "rotate(3deg)" }}
                  aria-hidden="true"
                />

                {/* Layer 3 (Top Primary Sheet) */}
                <div
                  className="relative z-10 flex h-24 w-36 flex-col justify-between rounded-lg border border-white/20 bg-[#191919] p-2.5 font-mono shadow-[0_10px_24px_rgba(0,0,0,0.85)] transition-all duration-500 group-hover:scale-105 group-hover:border-white/50"
                  style={{ transform: "rotate(0deg) translateZ(12px)" }}
                >
                  <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-1 text-[8px] text-[#888888]">
                    <span>VIT-AP EXAM</span>
                    <span className="h-1 w-1 rounded-full bg-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 rounded bg-white/70" />
                    <div className="h-1 w-full rounded bg-white/30" />
                    <div className="h-1 w-2/3 rounded bg-white/20" />
                  </div>
                  <div className="flex items-center justify-between text-[7px] text-[#666666]">
                    <span>SEALED</span>
                    <span className="text-white font-bold">PDF READY</span>
                  </div>
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-white md:text-[22px]">
                Preview & Download
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#BDBDBD]">
                Preview documents instantly in your browser and download the papers you need.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#242424] pt-3.5 text-xs text-[#888888]">
              <span className="font-mono text-[11px] text-[#BDBDBD] group-hover:text-white transition-colors">
                Browse all documents &rarr;
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#141414] text-white">
                <Icon name="chevR" size={13} />
              </span>
            </div>
          </div>
        </Card3D>

        {/* ------------------------------------------------------------- */}
        {/* CHAMBER 03: THE VAULT INGESTION PORT                         */}
        {/* ------------------------------------------------------------- */}
        <Card3D maxTilt={8} scale={1.02} className="h-full">
          <div
            onClick={() => handleStepClick("/upload")}
            onMouseEnter={() => setActiveStep("03")}
            onMouseLeave={() => setActiveStep(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleStepClick("/upload")}
            className="metallic-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-7 select-none preserve-3d transition-all duration-300 hover:border-white/30 hover:shadow-[0_24px_50px_-16px_rgba(0,0,0,0.9)] active:scale-[0.98]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Background technical corner frame */}
            <FloatingFrame width={110} height={70} label="INGESTION" className="-top-3 -right-3 opacity-30" />

            <div>
              {/* Header Protocol */}
              <div
                className="flex items-center justify-between border-b border-[#242424] pb-3.5"
                style={{ transform: "translateZ(12px)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-widest text-white">
                    PROTOCOL // 03
                  </span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-wider text-[#666666] sm:inline-block">
                    [PORTAL]
                  </span>
                </div>
                <span className="coord-marker">CONTRIBUTE</span>
              </div>

              {/* 3D Visual Chamber: Ingestion Slot & Floating Document */}
              <div
                className="relative my-6 flex h-36 flex-col items-center justify-center rounded-2xl border border-white/8 bg-[#090909] p-3 shadow-inner"
                style={{ transform: "translateZ(20px)" }}
              >
                {/* Floating Document Sheet descending on hover */}
                <div
                  className="relative z-10 flex h-20 w-32 flex-col justify-between rounded-lg border border-white/20 bg-[#161616] p-2 font-mono shadow-[0_8px_20px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:translate-y-2 group-hover:scale-95 group-hover:border-white/50"
                  style={{ transform: "translateZ(16px)" }}
                >
                  <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-1 text-[7px] text-[#888888]">
                    <span>UPLOAD DRAFT</span>
                    <Icon name="upload" size={10} className="text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 rounded bg-white/60" />
                    <div className="h-1 w-1/2 rounded bg-white/30" />
                  </div>
                  <div className="text-[7px] text-[#888888]">
                    AUTO-DEDUPE READY
                  </div>
                </div>

                {/* Vault Ingestion Port Aperture */}
                <div className="mt-2 flex w-36 items-center justify-between rounded border border-white/20 bg-[#060606] px-2 py-1 shadow-[inset_0_2px_6px_black] transition-all duration-300 group-hover:border-white/50 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                  <span className="font-mono text-[8px] text-[#666666]">// VAULT PORT</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/50 group-hover:bg-white animate-pulse" />
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-white md:text-[22px]">
                Contribute to the Vault
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#BDBDBD]">
                Upload useful academic papers and help preserve resources for the wider student community.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#242424] pt-3.5 text-xs text-[#888888]">
              <span className="font-mono text-[11px] text-[#BDBDBD] group-hover:text-white transition-colors">
                Upload a paper &rarr;
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#141414] text-white">
                <Icon name="chevR" size={13} />
              </span>
            </div>
          </div>
        </Card3D>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// UploadCta — Dimensional Ingestion Portal with Interactive 3D Vault
// --------------------------------------------------------------------------
export function UploadCta() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-hairline bg-[#0E0E0E] p-8 text-center md:p-14 lg:p-18">
      {/* 3D Interactive Vault Backdrop */}
      <InteractiveVaultScene />

      {/* Atmospheric Spatial Elements */}
      <FloatingRing size={480} tiltX={75} tiltY={10} opacity={0.12} className="-top-24 left-1/2 -translate-x-1/2" />
      <FloatingFrame width={200} height={120} label="INGESTION // PORTAL" className="bottom-4 left-6 hidden opacity-30 md:block" />

      <div className="relative z-10 mx-auto max-w-xl">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-hairline bg-[#161616]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888] backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
          Community Archive Contribution
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[38px]">
          Have a Paper? <span className="hl">Add It to the Vault.</span>
        </h3>
        <p className="mx-auto mt-4 text-[14px] leading-relaxed text-[#BDBDBD] md:text-[16px]">
          Share your academic papers with the community. Automated duplicate detection helps keep the archive organized and reliable.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <Link
            to="/upload"
            className="metallic-button inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl px-9 text-[15px] font-bold text-black shadow-[0_4px_24px_rgba(255,255,255,0.24)] sm:w-auto"
          >
            <Icon name="upload" size={18} />
            Upload a Paper
          </Link>
          <Link
            to="/requests"
            className="metallic-button-secondary inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl px-7 text-[14px] font-semibold text-[#E8E8E8] sm:w-auto"
          >
            View Requests &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Footer — The Final Archive Chamber (Persistent 3D Depth)
// --------------------------------------------------------------------------
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-[#060606] pt-16 pb-12">
      {/* Background Stardust Particles */}
      <FloatingParticleField count={22} opacity={0.22} className="pointer-events-none absolute inset-0 z-0" />

      {/* Receding Perspective Grid Frame */}
      <FloatingGrid className="pointer-events-none absolute inset-0 h-full w-full opacity-8" tilt={75} />

      {/* Concentric Architectural Rings */}
      <FloatingRing size={520} tiltX={75} tiltY={-10} opacity={0.06} className="pointer-events-none -bottom-28 -right-20 hidden lg:block" />
      <FloatingRing size={320} tiltX={60} tiltY={20} opacity={0.08} dashed className="pointer-events-none -top-16 -left-16 hidden md:block" />

      {/* Monolithic Chamber Coordinate Bounding Box */}
      <FloatingFrame width={240} height={140} label="CHAMBER // FINALE" className="pointer-events-none bottom-8 right-12 hidden opacity-25 xl:block" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:max-w-7xl xl:max-w-[1400px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            {/* Dimensional PaperVault Logo Treatment */}
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-extrabold text-sm shadow-[0_0_18px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(255,255,255,0.7)]">
                PV
              </span>
              <p className="font-display text-2xl font-extrabold tracking-tight text-white">
                Paper<span className="text-[#888888] transition-colors group-hover:text-[#BDBDBD]">Vault</span>
              </p>
            </Link>

            <p className="mt-3.5 max-w-xs text-[13px] leading-relaxed text-[#888888]">
              VIT-AP previous year question papers & verified syllabus archive.
              Built by students, preserved for the entire campus.
            </p>

            {/* Chamber Status Beacon */}
            <div className="mt-5 flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="coord-marker text-[#BDBDBD]">
                ARCHIVE ENGINE // 24/7 ONLINE
              </span>
            </div>
          </div>

          {/* Interactive Navigation Links with Micro-Interactions */}
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3.5 text-[14px]">
            {[
              ["Papers", "/papers"],
              ["Notes", "/syllabus"],
              ["Requests", "/requests"],
              ["Community Chat", "/chat"],
              ["Upload Paper", "/upload"],
              ["My Uploads", "/my-uploads"],
            ].map(([l, to]) => (
              <Link
                key={l}
                to={to}
                className="group flex items-center gap-1.5 text-[#888888] transition-all duration-200 hover:text-white active:scale-95"
              >
                <span className="inline-block h-1 w-1 rounded-full bg-white opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1" />
                <span className="transition-transform duration-200 group-hover:translate-x-1 font-medium">
                  {l}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#222222] pt-6 text-xs text-[#666666] sm:flex-row">
          <p>VIT-AP Student Community Vault &middot; Educational & research use only.</p>
          <div className="flex items-center gap-3">
            <span className="coord-marker">EST. 2026 // OPEN ARCHIVE PROTOCOL</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </footer>
  );
}
