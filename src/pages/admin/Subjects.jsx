/**
 * PaperVault — Admin Subjects (Direction A "Archive Noir").
 * 100% original. Mobile-first. Live Firestore data — no mock seeds.
 * Route: #/admin/subjects
 *
 * Table (name, code, codes[], program, semester, active) +
 * new subject form (name, code, codes[], program, semester).
 *
 * collection("subjects"): addDoc for new, updateDoc for activate/deactivate.
 */
import { useEffect, useState } from "react";
import { AdminShell, CodeChip } from "./adminUi.jsx";
import {
  Button,
  Card,
  MicroLabel,
  Input,
  FieldLabel,
  Badge,
} from "../../components/atoms.jsx";
import {
  getAllSubjects,
  getAllPapers,
  createSubject,
  setSubjectActive,
} from "../../firebase/db.js";

const PROGRAMS = ["B.Tech CSE", "B.Tech (All Branches)"];

export default function Subjects() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    codes: "",
    program: PROGRAMS[0],
    semester: "1",
  });
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [subjects, papers] = await Promise.all([
        getAllSubjects(),
        getAllPapers(),
      ]);
      const counts = {};
      papers.forEach((p) => {
        if (p.subjectId) counts[p.subjectId] = (counts[p.subjectId] ?? 0) + 1;
      });
      setRows(subjects.map((s) => ({ ...s, paperCount: counts[s.id] ?? 0 })));
    } catch (e) {
      setError(
        e?.message ? `Subjects load nahi hue: ${e.message}` : "Subjects load nahi hue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setToggling(id);
    setError("");
    try {
      await setSubjectActive(id, !row.active);
      setRows((rs) =>
        rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
      );
    } catch (e) {
      setError(
        e?.message ? `Status update nahi hua: ${e.message}` : "Status update nahi hua."
      );
    } finally {
      setToggling(null);
    }
  };

  const addSubject = async () => {
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const codes = form.codes
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    if (!name || !code) {
      setError("Name aur code dono required hain.");
      return;
    }
    if (!codes.includes(code)) codes.unshift(code);
    if (rows.some((r) => (r.codes ?? []).some((c) => codes.includes(c)))) {
      setError("Ye code pehle se kisi subject me hai.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createSubject({
        name,
        code,
        codes,
        program: form.program,
        semester: Number(form.semester) || 1,
      });
      setForm({ name: "", code: "", codes: "", program: PROGRAMS[0], semester: "1" });
      await load();
    } catch (e) {
      setError(
        e?.message ? `Subject add nahi hua: ${e.message}` : "Subject add nahi hua."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      active="subjects"
      title="Subjects"
      subtitle="Naya subject banao, purane ko edit/deactivate karo"
      badge={0}
    >
      <Card className="p-4 md:p-5">
        <MicroLabel>New subject</MicroLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="ns-name">Subject name</FieldLabel>
            <Input
              id="ns-name"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Operating Systems"
            />
          </div>
          <div>
            <FieldLabel htmlFor="ns-code">Primary code</FieldLabel>
            <Input
              id="ns-code"
              value={form.code}
              onChange={set("code")}
              placeholder="e.g. CSE2005"
              className="font-mono uppercase"
            />
          </div>
          <div>
            <FieldLabel htmlFor="ns-codes">
              All codes <span className="normal-case">(comma separated)</span>
            </FieldLabel>
            <Input
              id="ns-codes"
              value={form.codes}
              onChange={set("codes")}
              placeholder="CSE2005, CSE2006"
              className="font-mono uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="ns-prog">Program</FieldLabel>
              <Input
                id="ns-prog"
                value={form.program}
                onChange={set("program")}
                list="programs-list"
              />
              <datalist id="programs-list">
                {PROGRAMS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            <div>
              <FieldLabel htmlFor="ns-sem">Semester</FieldLabel>
              <Input
                id="ns-sem"
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={set("semester")}
                className="font-mono"
              />
            </div>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-brick">{error}</p>}
        <Button className="mt-3 w-full md:w-auto" onClick={addSubject} disabled={saving}>
          {saving ? "Adding…" : "Add subject"}
        </Button>
      </Card>

      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-[12px] border border-dashed border-hairline px-6 py-10 text-center text-sm text-text-dim">
          Abhi koi subject nahi hai — upar form se pehla subject banao.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[12px] border border-hairline bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline">
                {["Subject", "Codes", "Program", "Sem", "Status", ""].map((h) => (
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
              {rows.map((s) => (
                <tr key={s.id} className={!s.active ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-text">{s.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-text-dim">
                      {s.paperCount} papers
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <CodeChip>{s.code}</CodeChip>
                      {(s.codes ?? [])
                        .filter((c) => c !== s.code)
                        .map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center rounded-[6px] border border-hairline px-1.5 py-0.5 font-mono text-[11px] text-text-dim"
                          >
                            {c}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-dim">{s.program}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text tabular-nums">
                    {s.semester}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={s.active ? "moss" : "brick"}>
                      {s.active ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleActive(s.id)}
                      disabled={toggling === s.id}
                      className="min-h-[44px] rounded-[8px] px-3 text-xs font-semibold text-text-dim underline-offset-2 hover:text-text hover:underline disabled:opacity-50"
                    >
                      {toggling === s.id
                        ? "Saving…"
                        : s.active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
