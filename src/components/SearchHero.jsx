import { useState } from "react";
import Icon from "./Icon.jsx";
import HeroScene from "./3d/HeroScene.jsx";
import Card3D from "./3d/Card3D.jsx";
import { FloatingRing, FloatingFrame, DepthLayer } from "./3d/FloatingSpace.jsx";

const chips = ["All", "CAT-1", "CAT-2", "FAT"];

// Desktop interactive 3D Archive Index Card
function ArchiveStack() {
  const rows = [
    ["CAT-1", "2024", "18"],
    ["CAT-2", "2025", "24"],
    ["FAT", "2025", "31"],
  ];
  return (
    <div aria-hidden="true" className="relative hidden select-none lg:block">
      {/* Background Floating Elements */}
      <FloatingRing
        size={340}
        tiltX={68}
        tiltY={22}
        opacity={0.16}
        className="-left-12 -top-12"
      />
      <FloatingFrame
        width={160}
        height={90}
        label="ARCHIVE // REPO"
        className="-right-8 -top-10 opacity-40"
      />

      <DepthLayer depth={30} speed={1.2}>
        <Card3D maxTilt={10} scale={1.03} className="w-[300px]">
          {/* Layered physical paper sheets behind */}
          <div
            className="absolute -left-3.5 -top-3.5 h-full w-full rotate-[-4.5deg] rounded-2xl border border-white/5 bg-[#0A0A0A] document-stack-edge -z-10"
            style={{ transform: "translateZ(-30px)" }}
          />
          <div
            className="absolute -left-7 -top-7 h-full w-full rotate-[-8.5deg] rounded-2xl border border-white/5 bg-[#070707] document-stack-edge -z-20"
            style={{ transform: "translateZ(-60px)" }}
          />

          {/* Primary Monochromatic Index Card */}
          <div className="metallic-card relative rounded-2xl p-6 shadow-[0_36px_80px_-24px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3.5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#888888]">
                VAULT INDEX // 01
              </span>
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-[28px] font-extrabold tracking-tight text-white">
                  CSE3002
                </p>
                <span className="font-mono text-[10px] text-[#555555]">
                  CORE // 4 CR
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[12px] text-[#BDBDBD]">
                Artificial Intelligence
              </p>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-[#2A2A2A] pt-4">
              {rows.map(([e, y, n]) => (
                <div
                  key={e}
                  className="flex items-center justify-between font-mono text-[11px]"
                >
                  <span className="text-[#888888]">
                    {e} &middot; {y}
                  </span>
                  <span className="font-semibold text-white">{n} papers</span>
                </div>
              ))}
            </div>

            {/* Simulated Barcode */}
            <div className="mt-5 flex items-center justify-between border-t border-[#2A2A2A] pt-4">
              <div className="flex items-center gap-1">
                {[4, 2, 6, 2, 4, 3, 2, 5, 2, 4, 2].map((w, i) => (
                  <span
                    key={i}
                    className="inline-block h-4 bg-white/40"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <span className="inline-flex items-center rounded-md border border-[#555555] bg-[#161616] px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                SEALED
              </span>
            </div>
          </div>
        </Card3D>
      </DepthLayer>
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

      {/* Atmospheric deep space lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      >
        <div className="absolute right-0 top-0 h-[650px] w-[650px] rounded-full bg-white/[0.025] blur-[160px]" />
        <div className="cosmic-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-12 md:pb-20 md:pt-20 lg:max-w-7xl lg:pb-28 lg:pt-28 xl:max-w-[1400px]">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-center lg:gap-16 xl:grid-cols-[1fr_360px] xl:gap-24">
          <div className="min-w-0">
            {/* Monospace Spatial Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface/70 px-3.5 py-1 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              <span className="coord-marker">
                PV-SYS // VIT-AP ARCHIVE
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[46px] md:text-[56px] md:leading-[1.04] lg:text-[66px]">
              Har paper. Har subject.
              <br />
              <span className="hl">Ek hi vault me.</span>
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#BDBDBD] sm:text-base lg:max-w-2xl lg:text-[17px]">
              CAT-1, CAT-2 aur FAT ke previous year question papers plus verified notes —
              bina login, bilkul free. Fast in-browser preview, direct download aur AI topic weightage ke saath.
            </p>

            {/* Monolithic Search Interface */}
            <form
              className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-hairline bg-[#111111]/90 p-2 pl-4 backdrop-blur-xl transition-all duration-300 focus-within:border-white focus-within:shadow-[0_12px_44px_rgba(255,255,255,0.09)]"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch?.(q, exam);
              }}
            >
              <Icon name="search" size={20} className="shrink-0 text-[#888888]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Course code likho… jaise CSE3002 ya MAT2001"
                className="min-h-[44px] w-full bg-transparent font-mono text-[15px] text-white outline-none placeholder:text-[#888888] md:min-h-[50px] md:text-base"
                aria-label="Search papers by course code"
              />
              <button
                type="submit"
                className="metallic-button min-h-[44px] shrink-0 rounded-xl px-6 text-sm font-bold text-black shadow-[0_2px_14px_rgba(255,255,255,0.25)] md:min-h-[50px] md:px-8"
              >
                Search
              </button>
            </form>

            {/* Filter Chips with Spatial Interaction */}
            <div className="rail mt-4 flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              <span className="mr-1 hidden font-mono text-[11px] uppercase tracking-wider text-[#888888] md:inline-block">
                Exam:
              </span>
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setExam(c)}
                  className={`group relative inline-flex min-h-[42px] shrink-0 items-center rounded-full border px-4 font-mono text-[13px] font-semibold transition-all duration-300 active:scale-95 ${
                    exam === c
                      ? "border-white bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.3)] -translate-y-0.5 scale-[1.04]"
                      : "border-[#262626] bg-[#111111]/80 text-[#888888] hover:border-[#555555] hover:text-white hover:bg-[#161616]"
                  }`}
                >
                  {exam === c && (
                    <span
                      className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-black"
                      aria-hidden="true"
                    />
                  )}
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
