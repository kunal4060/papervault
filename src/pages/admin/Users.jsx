/**
 * PaperVault — Admin Users (Direction A "Archive Noir").
 * 100% original. Mobile-first. Live Firestore data — no mock seeds.
 * Route: #/admin/users
 *
 * Users table — role select (user ↔ moderator).
 * Admin role read-only hai (§2: "Admin sirf Tim").
 *
 * collection("users"): updateDoc role on change.
 * Role select user/moderator only; admin change is disabled.
 */
import { useEffect, useState } from "react";
import { AdminShell, EmptyState, IcoAlert } from "./adminUi.jsx";
import {
  Card,
  MicroLabel,
  Select,
  Badge,
  FieldLabel,
} from "../../components/atoms.jsx";
import { getUsers, updateUserRole } from "../../firebase/db.js";
import { formatDate } from "../../utils/format.js";

const ROLE_TONES = { admin: "amber", moderator: "moss", user: "moss" };

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setRows(await getUsers());
      } catch (e) {
        setError(
          e?.message ? `Users load nahi hue: ${e.message}` : "Users load nahi hue."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const docId = (u) => u.uid ?? u.id;

  const changeRole = async (uid, role) => {
    setError("");
    try {
      await updateUserRole(uid, role);
      setRows((rs) =>
        rs.map((r) => (docId(r) === uid ? { ...r, role } : r))
      );
    } catch (e) {
      setError(
        e?.message ? `Role update nahi hua: ${e.message}` : "Role update nahi hua."
      );
    }
  };

  return (
    <AdminShell
      active="users"
      title="Users"
      subtitle="Roles manage karo — admin role read-only hai"
      badge={0}
    >
      {error && (
        <div className="mb-4 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      <Card className="p-4 md:p-5">
        <MicroLabel>Roles</MicroLabel>
        <p className="mt-1 text-xs text-text-dim">
          <span className="font-semibold text-text">user</span> — upload, chat,
          bookmarks ·{" "}
          <span className="font-semibold text-text">moderator</span> — user sab
          + queue review ·{" "}
          <span className="font-semibold text-text">admin</span> — sab kuch
          (sirf Tim)
        </p>
      </Card>

      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[12px] border border-hairline bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline">
                {["User", "Role", "Uploads", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((u) => (
                <tr key={docId(u)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-plus font-display text-sm font-bold text-accent">
                        {(u.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-text">
                          {u.name ?? "—"}
                        </div>
                        <div className="truncate font-mono text-xs text-text-dim">
                          {u.email ?? ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span title="Admin role read-only hai">
                        <Badge tone={ROLE_TONES[u.role]}>Admin</Badge>
                      </span>
                    ) : (
                      <div className="w-36">
                        <FieldLabel className="sr-only" htmlFor={`role-${docId(u)}`}>
                          Role for {u.name}
                        </FieldLabel>
                        <Select
                          id={`role-${docId(u)}`}
                          value={u.role ?? "user"}
                          onChange={(e) => changeRole(docId(u), e.target.value)}
                        >
                          <option value="user">user</option>
                          <option value="moderator">moderator</option>
                        </Select>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text tabular-nums">
                    {u.uploadCount ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-dim">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && rows.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={<IcoAlert className="h-8 w-8" />}
            title="Koi users nahi"
          />
        </div>
      )}
    </AdminShell>
  );
}
