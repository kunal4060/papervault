/**
 * PaperVault — Component Atoms (Direction A "Archive Noir")
 * 100% original. Mobile-first primitives: buttons, cards, chips,
 * inputs, badges, labels. Inline SVG only — no emoji.
 */
import Icon from "./Icon.jsx";

// ---------- shared ----------
const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const minTouch = "min-h-[44px]";

// ---------- Buttons ----------
const buttonBase = `${minTouch} inline-flex items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-semibold transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${focusRing}`;

const buttonVariants = {
  primary:
    "bg-accent text-[#0C0D10] hover:bg-[#FFBE4D]",
  secondary:
    "bg-transparent border border-hairline text-text hover:border-text-dim hover:bg-surface-plus",
  danger:
    "bg-transparent border border-brick/60 text-brick hover:bg-brick/10",
};

export function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={`${buttonBase} ${buttonVariants[variant] ?? buttonVariants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------- Card ----------
export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-surface border border-hairline rounded-[12px] transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------- Chip (filter pills) ----------
export function Chip({ active = false, className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={`${minTouch} inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${focusRing} ${
        active
          ? "border-accent text-accent bg-accent/10"
          : "border-hairline text-text-dim hover:text-text hover:border-text-dim"
      } ${className}`}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------- Form atoms ----------
const inputBase = `w-full ${minTouch} rounded-[10px] bg-surface-plus border border-hairline text-text placeholder:text-text-dim/60 px-4 text-sm transition-colors hover:border-text-dim/50 focus:border-accent ${focusRing}`;

export function Input({ className = "", ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`${inputBase} py-3 min-h-[120px] resize-y ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <div className="relative">
      <select className={`${inputBase} appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m4 6 4 4 4-4" />
      </svg>
    </div>
  );
}

// ---------- Field label + label ----------
export function FieldLabel({ htmlFor, children, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim mb-1.5 ${className}`}
    >
      {children}
    </label>
  );
}

// ---------- MicroLabel ----------
export function MicroLabel({ className = "", children, ...props }) {
  return (
    <span
      className={`block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// ---------- Badge ----------
const toneStyles = {
  moss: {
    classes: "border-moss/50 text-moss bg-moss/10",
    icon: (
      <path
        d="M8 5.5v4M8 11.5v.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    ),
  },
  brick: {
    classes: "border-brick/50 text-brick bg-brick/10",
    icon: (
      <path
        d="M6 6l4 4M10 6l-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    ),
  },
  amber: {
    classes: "border-accent/50 text-accent bg-accent/10",
    icon: (
      <circle cx="8" cy="8" r="1.6" fill="currentColor" />
    ),
  },
};

export function Badge({ tone = "amber", className = "", children, ...props }) {
  const style = toneStyles[tone] ?? toneStyles.amber;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${style.classes} ${className}`}
      {...props}
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" aria-hidden="true">
        {style.icon}
      </svg>
      {children}
    </span>
  );
}

export function StatusChip({ status, className = "", ...props }) {
  const map = {
    approved: { tone: "moss", label: "Verified" },
    verified: { tone: "moss", label: "Verified" },
    pending: { tone: "amber", label: "Pending" },
    rejected: { tone: "brick", label: "Rejected" },
  };
  const entry = map[status] ?? map.pending;
  return (
    <Badge tone={entry.tone} className={className} {...props}>
      {entry.label}
    </Badge>
  );
}

// ---------- Highlighter helpers ----------
/**
 * Wrap a phrase in the hand-drawn amber marker swipe.
 * Uses the .hl utility from index.css (Direction A signature).
 */
export function Highlight({ children, className = "", soft = false, ...props }) {
  return (
    <span className={`${soft ? "hl-soft" : "hl"} ${className}`} {...props}>
      {children}
    </span>
  );
}


/* ---- Consolidated from ui-fallback.jsx (Worker B) ---- */

const EXAM_TYPES = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];
const CHIP_BASE = `${minTouch} inline-flex items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${focusRing}`;

export function ExamChips({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Exam type"
      className="rail flex gap-2 overflow-x-auto pb-1"
    >
      {EXAM_TYPES.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={value === t}
          onClick={() => onChange(t)}
          className={`${CHIP_BASE} shrink-0 ${
            value === t
              ? "border-accent-dim bg-accent/10 text-accent"
              : "border-hairline text-text-dim hover:border-text-dim hover:text-text"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- Inputs -------------------------------- */

export function ProgressSteps({ steps, current, state }) {
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const done = state === "done" || i < current;
        const active = state === "running" && i === current;
        const waiting = !done && !active;
        return (
          <li
            key={s.key}
            className={`flex items-center gap-3 rounded-[10px] border px-3.5 py-3 transition-colors ${
              active
                ? "border-accent-dim bg-accent/5"
                : done
                  ? "border-hairline"
                  : "border-hairline opacity-50"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                done
                  ? "border-moss/40 bg-moss/10 text-moss"
                  : active
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-hairline text-text-dim"
              }`}
            >
              {done ? (
                <Icon name="check" size={14} />
              ) : active ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  waiting ? "text-text-dim" : "text-text"
                }`}
              >
                {s.label}
              </p>
              <p className="truncate text-xs text-text-dim">{s.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------- LoginGate -------------------------------- */

/** Shown on login-required pages when the user is not signed in. */

export function LoginGate({ onSignIn, actionText = "yeh page use karne", error = null }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <Card className="p-8 text-center md:p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent-dim bg-accent/10 text-accent">
          <Icon name="upload" size={22} />
        </div>
        <h1 className="font-display text-xl font-bold text-text">
          Login zaroori hai
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Paper {actionText} ke liye apne Google account se login karo. Padna
          bina login ke free hai — dalne ke liye login.
        </p>
        <Button onClick={onSignIn} className="mt-6 w-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 1 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 1 0 12 20.9c4.45 0 8.6-3.15 8.6-8.95 0-.3-.05-.6-.25-.85Z" />
          </svg>
          Google se login karo
        </Button>
        {error && (
          <p className="mt-4 text-[13px] text-brick">
            Login nahi ho paya: {error?.code || error?.message || "unknown error"}. Popup block hua ho toh allow karo aur dobara try karo.
          </p>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------ OutcomeIcon --------------------------------- */

export function OutcomeIcon({ tone = "success", children }) {
  const styles = {
    success: "border-moss/40 bg-moss/10 text-moss",
    danger: "border-brick/40 bg-brick/10 text-brick",
    info: "border-accent-dim bg-accent/10 text-accent",
  }[tone];
  return (
    <div
      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${styles}`}
    >
      {children}
    </div>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="micro mb-2 block">{label}</label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-text-dim">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brick">
          <Icon name="close" size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------- StatusChip -------------------------------- */

const STATUS_META = {
  pending: {
    label: "Review me hai",
    cls: "border-accent-dim bg-accent/10 text-accent",
    icon: "clock",
  },
  approved: {
    label: "Live",
    cls: "border-moss/30 bg-moss/10 text-moss",
    icon: "check",
  },
  rejected: {
    label: "Rejected",
    cls: "border-brick/30 bg-brick/10 text-brick",
    icon: "close",
  },
};
