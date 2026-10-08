import { useState } from "react";
import Icon from "./Icon.jsx";

const chips = ["All", "CAT-1", "CAT-2", "FAT"];

// Search hero — onSearch(q, exam) parent (Home) me wired hai.
export default function SearchHero({ onSearch }) {
  const [q, setQ] = useState("");
  const [exam, setExam] = useState("All");

  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-14 md:pt-16">
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          VIT-AP &middot; Previous year papers
        </p>
        <h1 className="font-display text-[32px] font-extrabold leading-[1.14] tracking-tight text-text md:text-[46px] md:leading-[1.08]">
          Har paper. Har subject.
          <br />
          <span className="hl">Ek hi vault me.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-dim">
          CAT-1, CAT-2 aur FAT ke previous year papers plus verified notes —
          bina login, bilkul free. Raat ke 2 baje bhi, dark mode me.
        </p>

        <form
          className="mt-7 flex max-w-2xl items-center gap-2 rounded-2xl border border-hairline bg-surface p-2 pl-4 focus-within:border-accent/70"
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
            className="min-h-[44px] w-full bg-transparent font-mono text-[15px] text-text outline-none placeholder:text-text-dim/60"
            aria-label="Search papers"
          />
          <button
            type="submit"
            className="min-h-[44px] shrink-0 rounded-xl bg-accent px-6 text-sm font-bold text-canvas transition-colors hover:bg-[#FFBE4D]"
          >
            Search
          </button>
        </form>

        <div className="rail mt-4 flex gap-2 overflow-x-auto pb-1">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setExam(c)}
              className={`min-h-[40px] shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-colors ${
                exam === c
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-hairline bg-surface text-text-dim hover:border-text-dim/50 hover:text-text"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
