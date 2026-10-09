/**
 * PaperVault — Admin shared UI (Direction A "Archive Noir").
 * 100% original. Inline SVG icons only — no emoji.
 * Used by all pages under src/pages/admin/.
 */
import { MicroLabel } from "../../components/atoms.jsx";

// ---------------------------------------------------------------- icons ---
const svgProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function Base({ className = "h-4 w-4", children }) {
  return (
    <svg className={className} {...svgProps}>
      {children}
    </svg>
  );
}

export const IcoDoc = ({ className }) => (
  <Base className={className}>
    <path d="M4 1.5h5.5L12 4v10.5H4z" />
    <path d="M9.5 1.5V4H12" />
    <path d="M6 8h4M6 10.5h4" />
  </Base>
);

export const IcoDownload = ({ className }) => (
  <Base className={className}>
    <path d="M8 2v8M4.5 7 8 10.5 11.5 7" />
    <path d="M2.5 12.5h11" />
  </Base>
);

export const IcoEye = ({ className }) => (
  <Base className={className}>
    <path d="M1.5 8S4 4 8 4s6.5 4 6.5 4-2.5 4-6.5 4S1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="1.8" />
  </Base>
);

export const IcoCheck = ({ className }) => (
  <Base className={className}>
    <path d="M2.5 8.5 6.5 12.5 13.5 4" />
  </Base>
);

export const IcoX = ({ className }) => (
  <Base className={className}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Base>
);

export const IcoPlus = ({ className }) => (
  <Base className={className}>
    <path d="M8 2.5v11M2.5 8h11" />
  </Base>
);

export const IcoTrash = ({ className }) => (
  <Base className={className}>
    <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l1 9.5h6L12 4" />
    <path d="M6.5 7v4M9.5 7v4" />
  </Base>
);

export const IcoEdit = ({ className }) => (
  <Base className={className}>
    <path d="M11 2.5 13.5 5 5.5 13H3v-2.5z" />
  </Base>
);

export const IcoSearch = ({ className }) => (
  <Base className={className}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3 3" />
  </Base>
);

export const IcoChevron = ({ className, open }) => (
  <Base className={className}>
    <path d={open ? "m4 10 4-4 4 4" : "m4 6 4 4 4-4"} />
  </Base>
);

export const IcoAlert = ({ className }) => (
  <Base className={className}>
    <path d="M8 2 14.5 13.5h-13z" />
    <path d="M8 6.5v3.5M8 12v.01" />
  </Base>
);

export const IcoUpload = ({ className }) => (
  <Base className={className}>
    <path d="M8 10.5V2M4.5 5.5 8 2l3.5 3.5" />
    <path d="M2.5 12.5h11" />
  </Base>
);

export const IcoArrowLeft = ({ className }) => (
  <Base className={className}>
    <path d="M14 8H2M6 4 2 8l4 4" />
  </Base>
);

// ------------------------------------------------------------- admin shell ---
const TABS = [
  { id: "dashboard", label: "Dashboard", href: "#/admin" },
  { id: "moderation", label: "Moderation", href: "#/admin/moderation" },
  { id: "subjects", label: "Subjects", href: "#/admin/subjects" },
  { id: "syllabus", label: "Syllabus", href: "#/admin/syllabus" },
  { id: "notes", label: "Notes", href: "#/admin/notes" },
  { id: "papers", label: "Papers", href: "#/admin/papers" },
  { id: "users", label: "Users", href: "#/admin/users" },
  { id: "exam", label: "Exam Settings", href: "#/admin/exam" },
  { id: "bulk-import", label: "Bulk Import", href: "#/admin/bulk-import" },
];

/**
 * Admin page shell: page title + tab nav.
 * Nav is horizontal-scroll chips on mobile, sidebar on desktop.
 * Hash links match the planned router: #/admin, #/admin/moderation, …
 */
export function AdminShell({ active, title, subtitle, badge, children }) {
  return (
    <div className="min-h-screen bg-canvas text-text">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <MicroLabel className="mb-1">PaperVault · Admin</MicroLabel>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-dim">{subtitle}</p>}

        <div className="mt-5 md:mt-7 md:grid md:grid-cols-[210px_1fr] md:gap-8">
          <nav
            aria-label="Admin sections"
            className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1.5 md:overflow-visible md:pb-0"
          >
            {TABS.map((t) => {
              const isActive = t.id === active;
              return (
                <a
                  key={t.id}
                  href={t.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors md:rounded-[10px] md:px-4 ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-hairline text-text-dim hover:border-text-dim hover:text-text"
                  }`}
                >
                  {t.label}
                  {t.id === "moderation" && badge > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-[#0C0D10]">
                      {badge}
                    </span>
                  )}
                </a>
              );
            })}
            <a
              href="#/admin/logout"
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-hairline px-4 text-sm font-medium text-text-dim transition-colors hover:border-brick hover:text-brick md:rounded-[10px] md:px-4"
            >
              Logout
            </a>
          </nav>
          <div className="mt-6 min-w-0 md:mt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------- stat card ---
export function StatCard({ label, value, sub, highlight = false }) {
  return (
    <div className="rounded-[12px] border border-hairline bg-surface p-4">
      <MicroLabel>{label}</MicroLabel>
      <div className="mt-2 font-display text-3xl font-bold tabular-nums">
        {highlight ? <span className="hl-soft">{value}</span> : value}
      </div>
      {sub && <p className="mt-1 text-xs text-text-dim">{sub}</p>}
    </div>
  );
}

// ----------------------------------------------------- div-bar week chart ---
/**
 * Vertical div-bar chart (Direction A: no chart library, plain divs).
 * data: [{ label: "M", value: 420 }]
 */
export function WeekChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      className="flex h-44 items-end gap-2 md:gap-3"
      role="img"
      aria-label="Downloads per day, last 7 days"
    >
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col justify-end">
          <div className="mb-1 text-center font-mono text-[10px] tabular-nums text-text-dim">
            {d.value}
          </div>
          <div
            className="w-full rounded-t-[4px] bg-accent/85 transition-[height]"
            style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }}
            title={`${d.label}: ${d.value} downloads`}
          />
          <div className="mt-1.5 text-center text-[11px] font-semibold uppercase text-text-dim">
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------- empty state ---
export function EmptyState({ icon, title, hint }) {
  return (
    <div className="flex flex-col items-center rounded-[12px] border border-dashed border-hairline px-6 py-12 text-center">
      <div className="mb-3 text-text-dim">{icon}</div>
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-text-dim">{hint}</p>}
    </div>
  );
}

// ------------------------------------------------------- mono code chip ----
export function CodeChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-[6px] border border-hairline bg-surface-plus px-2 py-0.5 font-mono text-xs font-semibold text-text">
      {children}
    </span>
  );
}
