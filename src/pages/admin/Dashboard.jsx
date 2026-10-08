/**
 * PaperVault — Admin Dashboard (Direction A "Archive Noir").
 * 100% original. Mobile-first. Live Firestore data — no mock seeds.
 * Route: #/admin
 */
import { useEffect, useState } from "react";
import { AdminShell, StatCard, EmptyState, IcoDoc } from "./adminUi.jsx";
import { MicroLabel, Card, Highlight } from "../../components/atoms.jsx";
import {
  getStats,
  getPendingPapers,
  getReports,
  getUsers,
  getTrendingPapers,
} from "../../firebase/db.js";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ papers: 0, subjects: 0, notes: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [topPapers, setTopPapers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, pending, reports, users, trending] = await Promise.all([
          getStats(),
          getPendingPapers(),
          getReports(),
          getUsers(),
          getTrendingPapers(5),
        ]);
        setStats(s);
        setPendingCount(pending.length);
        setReportsCount(reports.length);
        setUsersCount(users.length);
        setTopPapers(trending);
      } catch (e) {
        setError(
          e?.message ? `Dashboard load nahi hua: ${e.message}` : "Dashboard load nahi hua."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminShell
      active="dashboard"
      title="Dashboard"
      subtitle="Vault ki health, ek nazar me"
      badge={pendingCount}
    >
      {error && (
        <p className="mb-4 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <StatCard
              label="Papers live"
              value={stats.papers}
              sub={`${stats.subjects} active subjects`}
              highlight
            />
            <StatCard label="Notes" value={stats.notes} sub="Admin-verified" />
            <StatCard label="Users" value={usersCount} sub="All time" />
            <StatCard
              label="Pending review"
              value={pendingCount}
              sub="Moderation queue me"
              highlight
            />
            <StatCard label="Reports" value={reportsCount} sub="Flagged papers" />
            <StatCard label="Subjects" value={stats.subjects} sub="Active" />
          </div>

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
            {topPapers.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={<IcoDoc className="h-8 w-8" />}
                  title="Abhi koi live paper nahi"
                  hint="Papers moderation se approve honge to yahan trending dikhega."
                />
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-hairline">
                {topPapers.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <span className="w-6 shrink-0 font-mono text-xs font-bold text-text-dim tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">
                        <span className="font-mono text-xs text-accent">
                          {p.subjectCode ?? "—"}
                        </span>{" "}
                        {p.examType} {p.year}
                      </p>
                      <p className="truncate font-mono text-[11px] text-text-dim">
                        {p.fileName ?? p.id}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-semibold text-text tabular-nums">
                      <span className="hl-soft">
                        {(p.downloads ?? 0).toLocaleString("en-IN")}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {pendingCount > 0 && (
            <div className="mt-4 rounded-[12px] border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm">
                <Highlight soft>Action needed:</Highlight>{" "}
                <span className="text-text-dim">
                  {pendingCount} uploads moderation queue me hain — review karo.
                </span>{" "}
                <a
                  href="#/admin/moderation"
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Queue kholo
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
