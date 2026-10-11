import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import Card3D from "./3d/Card3D.jsx";

function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

export default function SubjectCard({ subject }) {
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);
  const clickTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  const handleClick = (e) => {
    // Allow new tab open with Cmd/Ctrl/Middle click
    if (e.metaKey || e.ctrlKey || e.button === 1) return;
    e.preventDefault();
    if (isActivating) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      navigate(`/papers/${subject.id}`);
      return;
    }

    setIsActivating(true);
    clickTimer.current = setTimeout(() => {
      navigate(`/papers/${subject.id}`);
    }, 200);
  };

  return (
    <Card3D maxTilt={9} scale={1.03} className="h-full">
      {/* Deepest physical backing sheet */}
      <div
        className="pointer-events-none absolute -bottom-2 -right-2 h-full w-full rotate-[-2.8deg] rounded-2xl border border-white/5 bg-[#070707] opacity-50 document-stack-edge transition-all duration-300 group-hover:rotate-[-4.5deg] group-hover:opacity-75 -z-20"
        aria-hidden="true"
      />

      {/* Middle physical backing sheet */}
      <div
        className="pointer-events-none absolute -bottom-1 -right-1 h-full w-full rotate-[1.8deg] rounded-2xl border border-white/8 bg-[#0C0C0C] opacity-75 document-stack-edge transition-all duration-300 group-hover:rotate-[3deg] group-hover:opacity-95 -z-10"
        aria-hidden="true"
      />

      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick(e);
          }
        }}
        className={`metallic-card group relative flex h-full cursor-pointer flex-col justify-between rounded-2xl p-5 select-none preserve-3d transition-all duration-200 ${
          isActivating
            ? "scale-[0.96] border-white/40 shadow-[0_0_35px_rgba(255,255,255,0.22)]"
            : "shadow-[0_20px_48px_-20px_rgba(0,0,0,0.9)] hover:border-white/20 hover:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.95)] active:scale-[0.97]"
        }`}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Subtle internal ripple highlight on activation */}
        {isActivating && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 via-white/20 to-transparent animate-pulse"
          />
        )}

        <div>
          {/* Header Code Indicator — floating forward in 3D */}
          <div
            className="flex items-center justify-between border-b border-[#242424] pb-3 transition-transform duration-300"
            style={{ transform: "translateZ(14px)" }}
          >
            <div className="flex items-center gap-2">
              <span className="coord-marker">{subject.code ?? "SUBJ"}</span>
              <span className="hidden font-mono text-[9px] uppercase tracking-wider text-[#666666] sm:inline-block">
                // ARCHIVE
              </span>
            </div>
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                isActivating
                  ? "scale-150 bg-white shadow-[0_0_8px_white]"
                  : "bg-white/40 group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.6)]"
              }`}
            />
          </div>

          {/* Subject Title — high Z depth for dramatic parallax */}
          <p
            className="mt-3.5 font-display text-[17px] font-bold leading-snug tracking-tight text-white transition-all duration-300 group-hover:text-white md:text-[18px]"
            style={{ transform: "translateZ(24px)" }}
          >
            {subject.name}
          </p>

          {/* Subject Codes chips — floating layer */}
          <div
            className="mt-3.5 flex flex-wrap gap-1.5 transition-transform duration-300"
            style={{ transform: "translateZ(12px)" }}
          >
            {subject.codes.map((code) => (
              <span
                key={code}
                className="inline-flex items-center rounded-md border border-[#262626] bg-[#141414] px-2 py-0.5 font-mono text-[11px] font-medium text-[#BDBDBD] transition-all duration-300 group-hover:border-[#555555] group-hover:text-white group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Metadata & Arrow — floating forward in 3D */}
        <div
          className="mt-5 flex items-center justify-between border-t border-[#242424] pt-3.5 transition-transform duration-300"
          style={{ transform: "translateZ(18px)" }}
        >
          <span className="text-[12px] text-[#888888]">
            <span className="font-mono text-[13.5px] font-bold tabular-nums text-white">
              {formatCompact(subject.paperCount)}
            </span>{" "}
            papers indexed
          </span>

          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg border border-[#262626] bg-[#141414] text-[#888888] transition-all duration-300 group-hover:border-[#666666] group-hover:text-white ${
              isActivating
                ? "translate-x-1.5 bg-white text-black border-white"
                : "group-hover:translate-x-1"
            }`}
          >
            <Icon name="chevR" size={14} />
          </span>
        </div>
      </div>
    </Card3D>
  );
}
