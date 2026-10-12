import { memo } from "react";

// Base public path aware of Vite's base: '/papervault/'
const BASE_URL = import.meta.env.BASE_URL || "/";
const LOGO_SRC = `${BASE_URL}images/papervault-logo-tight.png`.replace(/\/\//g, "/");
const LOGO_FULL_SRC = `${BASE_URL}images/papervault-logo.png`.replace(/\/\//g, "/");

/**
 * BrandLogo — Official PaperVault visual brand mark.
 *
 * Integrates the official pastel-glow orbital asset inside an elevated,
 * ultra-refined monochromatic surface with micro-beveling, subtle glow,
 * and zero layout shifts.
 */
function BrandLogoComponent({
  size = "md", // "sm" | "md" | "lg" | "xl"
  withText = false,
  fullAsset = false,
  className = "",
  badgeClassName = "",
  textClassName = "",
}) {
  const sizeMap = {
    sm: { box: "h-8 w-8 min-w-[32px] rounded-lg p-0.5", img: 28, text: "text-[16px]", sub: "text-[8.5px]" },
    md: { box: "h-10 w-10 min-w-[40px] rounded-xl p-0.5", img: 36, text: "text-[18px]", sub: "text-[9px]" },
    lg: { box: "h-14 w-14 min-w-[56px] rounded-2xl p-1", img: 48, text: "text-[22px]", sub: "text-[10px]" },
    xl: { box: "h-20 w-20 min-w-[80px] rounded-3xl p-1.5", img: 70, text: "text-[28px]", sub: "text-[12px]" },
  };

  const config = sizeMap[size] || sizeMap.md;
  const imageSource = fullAsset ? LOGO_FULL_SRC : LOGO_SRC;

  const emblem = (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden bg-white shadow-[0_2px_12px_rgba(255,255,255,0.18)] ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] group-hover:ring-white/60 ${config.box} ${badgeClassName}`}
      style={{ transform: "translateZ(0)" }}
    >
      <img
        src={imageSource}
        alt="PaperVault Official Brand Emblem"
        width={config.img}
        height={config.img}
        className="h-full w-full object-contain"
        loading="eager"
        decoding="async"
      />
    </div>
  );

  if (!withText) {
    return <span className={`inline-flex shrink-0 ${className}`}>{emblem}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {emblem}
      <div className={`leading-none ${textClassName}`}>
        <span className={`block font-display font-extrabold tracking-tight text-white ${config.text}`}>
          Paper<span className="text-[#888888] transition-colors group-hover:text-[#BDBDBD]">Vault</span>
        </span>
        <span className={`mt-0.5 block font-mono uppercase tracking-[0.22em] text-[#777777] ${config.sub}`}>
          VIT-AP Archive &middot; 2026
        </span>
      </div>
    </div>
  );
}

export const BrandLogo = memo(BrandLogoComponent);
export default BrandLogo;
