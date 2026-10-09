import { useState } from "react";
import Icon from "./Icon.jsx";

const chips = ["All", "CAT-1", "CAT-2", "FAT"];

// Archive index card — desktop-only decorative visual (aria-hidden).
// Koi logic nahi, sirf "vault" feel ke liye.
function ArchiveStack() {
  const rows = [
    ["CAT-1", "2024", "18"],
    ["CAT-2", "2025", "24"],
    ["FAT", "2025", "31"],
  ];
  return (
    <div aria-hidden="true" className="relative hidden h-[400px] select-none lg:block">
      {/* peeche ki slips */}
      <div className="absolute left-10 top-10 h-[300px] w-[240px] rotate-[8deg] rounded-lg border border-hairline bg-surface" />
      <div className="absolute left-5 top-5 h-[300px] w-[240px] rotate-[-5deg] rounded-lg border border-hairline bg-surface-plus" />
      {/* index card */}
      <div className="absolute left-0 top-0 w-[250px] rounded-xl border border-hairline bg-[#15181D] p-5 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-text-dim">
            Vault index
          </p>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </div>
        <p className="mt-4 font-display text-[22px] font-extrabold tracking-tight text-text">
          CSE3002
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-text-dim">
          Artificial Intelligence
        </p>
        <div className="mt-4 space-y-2.5 border-t border-hairline pt-4">
          {rows.map(([e, y, n]) => (
            <div key={e} className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-text-dim">
                {e} &middot; {y}
              </span>
              <span className="font-semibold text-accent">{n} papers</span>
            </div>
          ))}
        </div>
        <p className="mt-4">
          <span className="hl-soft px-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text">
            Verified
          </span>
        </p>
      </div>
      {/* neeche mono caption */}
      <p className="absolute bottom-0 left-0 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim/70">
        Est. 2026 &middot; VIT-AP
      </p>
    </div>
  );
}

// Search hero — onSearch(q, exam) parent (Home) me wired hai.
export default function SearchHero({ onSearch }) {
  const [q, setQ] = useState("");
  const [exam, setExam] = useState("All");

  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* desktop ambience: amber glow + dot texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute -top-48 right-[-8%] h-[520px] w-[520px] rounded-full bg-accent/[0.07] blur-[130px]" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.055)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_75%_65%_at_70%_15%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-16 md:pt-16 lg:max-w-7xl lg:pb-24 lg:pt-24 xl:max-w-[1400px]">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:items-center lg:gap-14 xl:grid-cols-[1fr_340px] xl:gap-24">
          <div className="min-w-0">
            <p className="mb-4 flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent md:text-xs">
              <span className="inline-block h-1.5 w-1.5 bg-accent" />
              VIT-AP &middot; Previous year papers
            </p>
            <h1 className="font-display text-[32px] font-extrabold leading-[1.14] tracking-tight text-text md:text-[54px] md:leading-[1.06] lg:text-[64px]">
              Har paper. Har subject.
              <br />
              <span className="hl">Ek hi vault me.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-dim md:text-base lg:max-w-2xl lg:text-[17px]">
              CAT-1, CAT-2 aur FAT ke previous year papers plus verified notes —
              bina login, bilkul free. Raat ke 2 baje bhi, dark mode me.
            </p>

            <form
              className="mt-7 flex max-w-2xl items-center gap-2 rounded-2xl border border-hairline bg-surface p-2 pl-4 transition-shadow focus-within:border-accent/70 lg:focus-within:shadow-[0_16px_56px_-20px_rgba(255,178,36,0.35)]"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch?.(q, exam);
              }}
            >
              <Icon name="search" size={20} className="shrink-0 text-text-dim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Course code likho… CSE3002"
                className="min-h-[44px] w-full bg-transparent font-mono text-[15px] text-text outline-none placeholder:text-text-dim/60 md:min-h-[50px] md:text-base"
                aria-label="Search papers"
              />
              <button
                type="submit"
                className="min-h-[44px] shrink-0 rounded-xl bg-accent px-6 text-sm font-bold text-canvas transition-all hover:bg-[#FFBE4D] md:min-h-[50px] md:px-8 lg:hover:shadow-[0_8px_28px_-8px_rgba(255,178,36,0.6)]"
              >
                Search
              </button>
            </form>

            <div className="rail mt-4 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setExam(c)}
                  className={`min-h-[44px] shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-all ${
                    exam === c
                      ? "border-accent bg-accent/15 text-accent lg:shadow-[0_0_20px_-6px_rgba(255,178,36,0.5)]"
                      : "border-hairline bg-surface text-text-dim hover:border-text-dim/50 hover:text-text"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <ArchiveStack />
        </div>
      </div>
    </section>
  );
}
