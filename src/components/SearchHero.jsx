import { useState } from "react";
import Icon from "./Icon.jsx";
import HeroScene from "./3d/HeroScene.jsx";
import Card3D from "./3d/Card3D.jsx";

const chips = ["All", "CAT-1", "CAT-2", "FAT"];

// Archive index card — desktop interactive 3D element.
function ArchiveStack() {
  const rows = [
    ["CAT-1", "2024", "18"],
    ["CAT-2", "2025", "24"],
    ["FAT", "2025", "31"],
  ];
  return (
    <div aria-hidden="true" className="relative hidden select-none lg:block">
      <Card3D maxTilt={9} scale={1.02} className="w-[280px]">
        {/* Layered sheets behind */}
        <div className="absolute -left-3 -top-3 h-full w-full rotate-[-4deg] rounded-2xl border border-hairline bg-surface-plus/60 backdrop-blur-sm -z-10" />
        <div className="absolute -left-6 -top-6 h-full w-full rotate-[-8deg] rounded-2xl border border-hairline bg-surface/40 backdrop-blur-sm -z-20" />

        {/* Primary Monochromatic Index Card */}
        <div className="metallic-card relative rounded-2xl p-6 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between border-b border-hairline pb-3.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-text-dim">
              VAULT INDEX // 01
            </span>
            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>

          <div className="mt-4">
            <p className="font-display text-[26px] font-extrabold tracking-tight text-white">
              CSE3002
            </p>
            <p className="mt-0.5 font-mono text-[12px] text-text-muted">
              Artificial Intelligence
            </p>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-hairline pt-4">
            {rows.map(([e, y, n]) => (
              <div
                key={e}
                className="flex items-center justify-between font-mono text-[11px]"
              >
                <span className="text-text-dim">
                  {e} &middot; {y}
                </span>
                <span className="font-semibold text-white">{n} papers</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
            <span className="inline-flex items-center rounded-md border border-hairline-bright bg-surface-plus px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text">
              VERIFIED
            </span>
            <span className="font-mono text-[10px] text-text-dim">
              EST. 2026
            </span>
          </div>
        </div>
      </Card3D>
    </div>
  );
}

export default function SearchHero({ onSearch }) {
  const [q, setQ] = useState("");
  const [exam, setExam] = useState("All");

  return (
    <section className="relative overflow-hidden border-b border-hairline bg-canvas">
      {/* 3D WebGL Hero Canvas Layer */}
      <HeroScene />

      {/* Atmospheric depth lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      >
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.035)_1px,transparent_0)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-12 md:pb-20 md:pt-20 lg:max-w-7xl lg:pb-28 lg:pt-28 xl:max-w-[1400px]">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-center lg:gap-16 xl:grid-cols-[1fr_360px] xl:gap-24">
          <div className="min-w-0">
            {/* Monospace Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface/60 px-3 py-1 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
                VIT-AP &middot; Previous Year Papers & Notes
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-display text-[32px] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[42px] md:text-[54px] md:leading-[1.05] lg:text-[64px]">
              Har paper. Har subject.
              <br />
              <span className="hl">Ek hi vault me.</span>
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-muted sm:text-base lg:max-w-2xl lg:text-[17px]">
              CAT-1, CAT-2 aur FAT ke previous year question papers plus verified notes —
              bina login, bilkul free. Fast preview, direct download aur AI topic weightage ke saath.
            </p>

            {/* Monolithic Search Interface */}
            <form
              className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-hairline bg-surface/90 p-2 pl-4 backdrop-blur-xl transition-all duration-300 focus-within:border-white/80 focus-within:shadow-[0_12px_40px_rgba(255,255,255,0.08)]"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch?.(q, exam);
              }}
            >
              <Icon name="search" size={20} className="shrink-0 text-text-dim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Course code likho… jaise CSE3002 ya MAT2001"
                className="min-h-[44px] w-full bg-transparent font-mono text-[15px] text-white outline-none placeholder:text-text-dim md:min-h-[50px] md:text-base"
                aria-label="Search papers by course code"
              />
              <button
                type="submit"
                className="metallic-button min-h-[44px] shrink-0 rounded-xl px-6 text-sm font-bold text-canvas shadow-[0_2px_12px_rgba(255,255,255,0.2)] md:min-h-[50px] md:px-8"
              >
                Search
              </button>
            </form>

            {/* Filter Chips */}
            <div className="rail mt-4 flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              <span className="hidden font-mono text-[11px] uppercase tracking-wider text-text-dim md:inline-block mr-1">
                Filter:
              </span>
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setExam(c)}
                  className={`min-h-[42px] shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-all duration-200 ${
                    exam === c
                      ? "border-white bg-white text-canvas shadow-[0_2px_14px_rgba(255,255,255,0.25)]"
                      : "border-hairline bg-surface/80 text-text-dim hover:border-hairline-bright hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Archive Interactive Card */}
          <ArchiveStack />
        </div>
      </div>
    </section>
  );
}
