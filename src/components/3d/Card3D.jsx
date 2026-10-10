import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Card3D — Hardware-accelerated 3D tilt container.
 * - Interpolated with requestAnimationFrame delta time (120Hz+ ready)
 * - Dynamic specular sheen overlay
 * - Touch-safe, respects prefers-reduced-motion
 */
export default function Card3D({
  children,
  className = "",
  maxTilt = 7,
  scale = 1.015,
  glare = true,
  onClick,
}) {
  const cardRef = useRef(null);
  const rafId = useRef(null);
  const target = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const current = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const animate = useCallback(() => {
    // Smooth lerp (10% per frame delta)
    const factor = 0.12;
    current.current.rx += (target.current.rx - current.current.rx) * factor;
    current.current.ry += (target.current.ry - current.current.ry) * factor;
    current.current.gx += (target.current.gx - current.current.gx) * factor;
    current.current.gy += (target.current.gy - current.current.gy) * factor;

    if (cardRef.current && !prefersReducedMotion) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(${current.current.rx.toFixed(
        2
      )}deg) rotateY(${current.current.ry.toFixed(2)}deg) scale3d(${
        isHovered ? scale : 1
      }, ${isHovered ? scale : 1}, 1)`;

      const sheen = cardRef.current.querySelector(".card-sheen");
      if (sheen) {
        sheen.style.background = `radial-gradient(circle at ${current.current.gx.toFixed(
          1
        )}% ${current.current.gy.toFixed(
          1
        )}%, rgba(255, 255, 255, 0.12) 0%, transparent 65%)`;
        sheen.style.opacity = isHovered ? "1" : "0";
      }
    }

    // Keep animating if moving
    const dist =
      Math.abs(target.current.rx - current.current.rx) +
      Math.abs(target.current.ry - current.current.ry);
    if (dist > 0.01 || isHovered) {
      rafId.current = requestAnimationFrame(animate);
    } else {
      rafId.current = null;
    }
  }, [isHovered, prefersReducedMotion, scale]);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1

    target.current.rx = (0.5 - y) * (maxTilt * 2);
    target.current.ry = (x - 0.5) * (maxTilt * 2);
    target.current.gx = x * 100;
    target.current.gy = y * 100;

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    setIsHovered(true);
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    target.current.rx = 0;
    target.current.ry = 0;
    target.current.gx = 50;
    target.current.gy = 50;
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative preserve-3d transition-shadow will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {glare && !prefersReducedMotion && (
        <div
          className="card-sheen pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
