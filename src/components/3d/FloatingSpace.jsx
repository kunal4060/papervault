import { useEffect, useRef, useState, useMemo } from "react";

/**
 * PaperVault — Floating Space Design System
 * Reusable spatial components engineered for persistent depth,
 * 120Hz/high-refresh smooth delta time, and responsive scaling.
 */

// --------------------------------------------------------------------------
// 1. DepthLayer — Container for scroll & cursor parallax
// --------------------------------------------------------------------------
export function DepthLayer({
  children,
  depth = 20, // positive = comes closer (moves faster); negative = pushes back
  speed = 1,
  className = "",
  style = {},
  disableOnMobile = false,
}) {
  const ref = useRef(null);
  const targetY = useRef(0);
  const currentY = useRef(0);
  const targetX = useRef(0);
  const currentX = useRef(0);
  const rafId = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const isMobile = window.innerWidth < 768;
    if (disableOnMobile && isMobile) return;

    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportMiddle = window.innerHeight / 2;
      const elementMiddle = rect.top + rect.height / 2;
      const distanceFromCenter = elementMiddle - viewportMiddle;
      // Normalized offset
      targetY.current = -(distanceFromCenter * (depth / 600) * speed);
    };

    const handlePointer = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      targetX.current = nx * (depth / 15) * speed;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    handleScroll();

    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const factor = 1 - Math.exp(-6 * dt);
      currentY.current += (targetY.current - currentY.current) * factor;
      currentX.current += (targetX.current - currentX.current) * factor;

      if (ref.current) {
        ref.current.style.transform = `translate3d(${currentX.current.toFixed(
          2
        )}px, ${currentY.current.toFixed(2)}px, ${depth}px)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointer);
    };
  }, [depth, speed, reducedMotion, disableOnMobile]);

  return (
    <div
      ref={ref}
      className={`preserve-3d will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// --------------------------------------------------------------------------
// 2. FloatingDocument — A physical paper sheet in space
// --------------------------------------------------------------------------
export function FloatingDocument({
  title = "DATA STRUCTURES & ALGORITHMS",
  code = "CSE2001",
  exam = "CAT-2 2026",
  rotation = -4,
  scale = 1,
  opacity = 0.9,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`select-none rounded-xl border border-white/10 bg-[#0E0E0E] p-4 font-mono text-[11px] document-stack-edge transition-transform duration-500 hover:scale-105 ${className}`}
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
        opacity,
        width: "210px",
        height: "290px",
        ...style,
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-2">
        <span className="text-[9px] uppercase tracking-wider text-[#888888]">
          PV // {code}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      </div>

      <div className="mt-2.5">
        <p className="text-[8px] tracking-widest text-[#555555]">SUBJECT ARCHIVE</p>
        <p className="mt-0.5 font-display text-[13px] font-bold leading-tight text-[#E8E8E8]">
          {title}
        </p>
        <p className="mt-0.5 text-[9px] text-[#888888]">{exam}</p>
      </div>

      {/* Simulated Exam Blueprint Lines */}
      <div className="mt-3.5 space-y-2 border-t border-[#1E1E1E] pt-2.5">
        <div className="h-1.5 w-3/4 rounded-full bg-[#1F1F1F]" />
        <div className="h-1.5 w-full rounded-full bg-[#171717]" />
        <div className="h-1.5 w-5/6 rounded-full bg-[#171717]" />
        <div className="h-1.5 w-2/3 rounded-full bg-[#1A1A1A]" />
      </div>

      <div className="mt-3 space-y-2">
        <div className="h-1.5 w-full rounded-full bg-[#171717]" />
        <div className="h-1.5 w-4/5 rounded-full bg-[#171717]" />
      </div>

      {/* Bottom Archive Stamp */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between border-t border-[#1C1C1C] pt-2 text-[8px] text-[#666666]">
        <span>ORIGINAL PAPER</span>
        <span className="rounded border border-[#333333] px-1 py-0.5 text-[#999999]">
          SEALED
        </span>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 3. FloatingPaperStack — Realistic stacked physical documents
// --------------------------------------------------------------------------
export function FloatingPaperStack({ className = "", style = {} }) {
  return (
    <div className={`relative ${className}`} style={style}>
      {/* Deepest under-sheet */}
      <div
        className="absolute -left-6 -top-6 h-[290px] w-[210px] rounded-xl border border-white/5 bg-[#080808] opacity-40 document-stack-edge"
        style={{ transform: "rotate(-9deg) translateZ(-40px)" }}
        aria-hidden="true"
      />
      {/* Middle under-sheet */}
      <div
        className="absolute -left-3 -top-3 h-[290px] w-[210px] rounded-xl border border-white/8 bg-[#0C0C0C] opacity-70 document-stack-edge"
        style={{ transform: "rotate(5deg) translateZ(-20px)" }}
        aria-hidden="true"
      />
      {/* Top primary document */}
      <FloatingDocument
        title="OPERATING SYSTEMS"
        code="CSE2005"
        exam="FAT 2025"
        rotation={-1.5}
        className="relative z-10"
      />
    </div>
  );
}

// --------------------------------------------------------------------------
// 4. FloatingRing — Architectural orbital rings
// --------------------------------------------------------------------------
export function FloatingRing({
  size = 280,
  tiltX = 65,
  tiltY = 20,
  speed = 18,
  opacity = 0.25,
  dashed = false,
  className = "",
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        ...style,
      }}
    >
      <div
        className={`h-full w-full rounded-full border ${
          dashed ? "border-dashed" : "border-solid"
        } border-white`}
        style={{
          opacity,
          animation: `spin ${speed}s linear infinite`,
        }}
      />
    </div>
  );
}

// --------------------------------------------------------------------------
// 5. FloatingOrb — Geodesic / wireframe spatial orb
// --------------------------------------------------------------------------
export function FloatingOrb({
  size = 120,
  opacity = 0.2,
  className = "",
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
    >
      <div
        className="relative h-full w-full rounded-full border border-white/20 bg-gradient-to-tr from-white/[0.04] to-transparent shadow-[0_0_40px_rgba(255,255,255,0.06)]"
        style={{ opacity }}
      >
        <div className="absolute inset-1 rounded-full border border-dashed border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 6. FloatingFrame — Minimalist technical bounding box
// --------------------------------------------------------------------------
export function FloatingFrame({
  width = 180,
  height = 120,
  label = "COORD // 01",
  className = "",
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none border border-white/10 p-2 font-mono text-[9px] text-[#666666] ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
    >
      <div className="flex items-center justify-between opacity-80">
        <span>+</span>
        <span className="tracking-widest">{label}</span>
        <span>+</span>
      </div>
      <div className="absolute bottom-1.5 left-2 right-2 flex justify-between opacity-50">
        <span>[0.0]</span>
        <span>[1.0]</span>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 7. FloatingGrid — Perspective grid fragment for background depth
// --------------------------------------------------------------------------
export function FloatingGrid({
  tilt = 60,
  opacity = 0.15,
  className = "",
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none overflow-hidden ${className}`}
      style={{
        transform: `perspective(600px) rotateX(${tilt}deg)`,
        opacity,
        ...style,
      }}
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 20%, transparent 75%)",
        }}
      />
    </div>
  );
}

// --------------------------------------------------------------------------
// 8. FloatingParticleField — Atmospheric stardust cluster
// --------------------------------------------------------------------------
export function FloatingParticleField({
  count = 24,
  opacity = 0.35,
  className = "",
  style = {},
}) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 53) % 100,
      size: (i % 3) + 1,
      op: 0.2 + ((i % 5) * 0.15),
      dur: 4 + (i % 6),
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
      style={{ opacity, ...style }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white transition-opacity"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.op,
            animation: `pulse ${p.dur}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// 9. FloatingCube — Minimalist wireframe rotating cube
// --------------------------------------------------------------------------
export function FloatingCube({
  size = 50,
  opacity = 0.25,
  className = "",
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none preserve-3d ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity,
        animation: "spin 24s linear infinite",
        ...style,
      }}
    >
      <div className="relative h-full w-full preserve-3d">
        <div className="absolute inset-0 border border-white/30" />
        <div
          className="absolute inset-0 border border-white/20"
          style={{ transform: "rotateX(45deg) rotateY(45deg)" }}
        />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 10. FloatingLine — Technical architectural guideline with pulse
// --------------------------------------------------------------------------
export function FloatingLine({
  length = 200,
  vertical = false,
  opacity = 0.25,
  className = "",
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        width: vertical ? "1px" : `${length}px`,
        height: vertical ? `${length}px` : "1px",
        background:
          vertical
            ? "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
        opacity,
        ...style,
      }}
    />
  );
}

// --------------------------------------------------------------------------
// 11. SpatialDecoration — Art-directed spatial background anchor
// --------------------------------------------------------------------------
export function SpatialDecoration({
  variant = "ring",
  className = "",
  style = {},
}) {
  if (variant === "orbital") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute select-none ${className}`}
        style={style}
      >
        <FloatingRing size={320} tiltX={70} tiltY={15} opacity={0.12} />
        <FloatingRing size={200} tiltX={55} tiltY={-25} opacity={0.18} dashed />
        <span className="coord-marker absolute -left-4 -top-4">SEC // 04</span>
      </div>
    );
  }

  if (variant === "grid-plane") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute select-none ${className}`}
        style={style}
      >
        <FloatingGrid className="h-64 w-96" opacity={0.12} />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      style={style}
    >
      <FloatingFrame width={140} height={90} label="VAULT // INDEX" />
      <FloatingLine length={160} className="-left-8 top-12" opacity={0.15} />
    </div>
  );
}
