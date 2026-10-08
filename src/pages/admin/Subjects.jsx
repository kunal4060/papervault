/**
 * PaperVault — Admin Subjects (Direction A "Archive Noir").
 * 100% original. Mobile-first. Mock data only.
 * Route: #/admin/subjects
 *
 * Table (name, code, codes[], program, semester, active) +
 * new subject form (name, code, codes[], program, semester).
 *
 * // TODO: firebase — collection("subjects"): addDoc for new,
 * // updateDoc for edit/deactivate. Code unique check server-side.
 */
import { useState } from "react";
import { AdminShell, CodeChip } from "./adminUi.jsx";
import {
  Button,
  Card,
  MicroLabel,
  Input,
  FieldLabel,
  Badge,
} from "../../components/atoms.jsx";
import { subjects as seedSubjects } from "../../mock/index.js";

const PROGRAMS = ["B.Tech CSE", "B.Tech (All Branches)"];

export default function Subjects() {
  const [rows, setRows] = useState(seedSubjects);
  const [form, setForm] = useState({
    name: "",
    code: "",
    codes: "",
    program: PROGRAMS[0],
    semester: "1",
  });
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleActive = (id) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));

  const addSubject = () => {
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
    if (rows.some((r) => r.codes.some((c) => codes.includes(c)))) {
      setError("Ye code pehle se kisi subject me hai.");
      return;
    }
    setRows((rs) => [
      {
        id: `subj-${Date.now()}`,
        name,
        code,
        codes,
        program: form.program,
        semester: Number(form.semester) || 1,
        active: true,
        paperCount: 0,
        createdAt: new Date().toISOString(),
      },
      ...rs,
    ]);
    setForm({ name: "", code: "", codes: "", program: PROGRAMS[0], semester: "1" });
    setError("");
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
        <Button className="mt-3 w-full md:w-auto" onClick={addSubject}>
          Add subject
        </Button>
      </Card>

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
                    {s.codes
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
                    className="min-h-[44px] rounded-[8px] px-3 text-xs font-semibold text-text-dim underline-offset-2 hover:text-text hover:underline"
                  >
                    {s.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
