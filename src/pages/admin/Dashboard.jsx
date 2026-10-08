/**
 * PaperVault — Admin Dashboard (Direction A "Archive Noir").
 * 100% original. Mobile-first. Mock data only.
 * Route: #/admin
 *
 * // TODO: firebase — replace mock seeds:
 * //   papers/notes counts → aggregate queries; pending → query(papers,
 * //   where("status","==","pending")); users → collection("users") count;
 * //   weekly downloads → download_events aggregation.
 */
import { AdminShell, StatCard, WeekChart } from "./adminUi.jsx";
import { MicroLabel, Card, Highlight } from "../../components/atoms.jsx";
import { papers, notes, users } from "../../mock/index.js";

// ---- mock: last-7-days download volumes (mock only) -------------------------
const WEEK = [
  { label: "Thu", value: 312 },
  { label: "Fri", value: 486 },
  { label: "Sat", value: 521 },
  { label: "Sun", value: 604 },
  { label: "Mon", value: 388 },
  { label: "Tue", value: 445 },
  { label: "Wed", value: 397 },
];

// ---- mock: pending uploads count (mirrors Moderation.jsx seed) -------------
const PENDING_COUNT = 3;

// ---- mock: reported papers count (mock only; Reports tab is Phase 2) --------
const REPORTS_COUNT = 2;

export default function Dashboard() {
  const totalDownloads = papers.reduce((s, p) => s + (p.downloads || 0), 0);
  const topPapers = [...papers].sort((a, b) => b.downloads - a.downloads).slice(0, 5);

  return (
    <AdminShell
      active="dashboard"
      title="Dashboard"
      subtitle="Vault ki health, ek nazar me"
      badge={PENDING_COUNT}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Papers live"
          value={papers.length}
          sub={`${totalDownloads.toLocaleString("en-IN")} total downloads`}
          highlight
        />
        <StatCard label="Notes" value={notes.length} sub="Admin-verified" />
        <StatCard label="Users" value={Object.keys(users).length} sub="All time" />
        <StatCard
          label="Pending review"
          value={PENDING_COUNT}
          sub="Moderation queue me"
          highlight
        />
        <StatCard label="Reports" value={REPORTS_COUNT} sub="Flagged papers" />
        <StatCard
          label="Downloads / week"
          value={WEEK.reduce((s, d) => s + d.value, 0).toLocaleString("en-IN")}
          sub="Last 7 days"
        />
      </div>

      <Card className="mt-4 p-4 md:p-5">
        <MicroLabel>Downloads · last 7 days</MicroLabel>
        <div className="mt-3">
          <WeekChart data={WEEK} />
        </div>
      </Card>

      <Card className="mt-4 p-4 md:p-5">
        <div className="flex items-baseline justify-between">
          <MicroLabel>Top papers · by downloads</MicroLabel>
          <a
            href="#/admin/papers"
            className="text-xs font-semibold text-accent hover:underline"
          >
            Sab dekho
          </a>
        </div>
        <ul className="mt-3 divide-y divide-hairline">
          {topPapers.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <span className="w-6 shrink-0 font-mono text-xs font-bold text-text-dim tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">
                  <span className="font-mono text-xs text-accent">{p.subjectCode}</span>{" "}
                  {p.examType} {p.year}
                </p>
                <p className="truncate font-mono text-[11px] text-text-dim">
                  {p.fileName}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs font-semibold text-text tabular-nums">
                <span className="hl-soft">{p.downloads.toLocaleString("en-IN")}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-4 rounded-[12px] border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm">
          <Highlight soft>Action needed:</Highlight>{" "}
          <span className="text-text-dim">
            {PENDING_COUNT} uploads moderation queue me hain — review karo.
          </span>{" "}
          <a
            href="#/admin/moderation"
            className="text-sm font-semibold text-accent hover:underline"
          >
            Queue kholo
          </a>
        </p>
      </div>
    </AdminShell>
  );
}
