/**
 * PaperVault — Admin Papers Manager (Direction A "Archive Noir").
 * 100% original. Mobile-first. Live Firestore data — no mock seeds.
 * Route: #/admin/papers
 *
 * Papers table + search (code/name/filename), metadata edit
 * (exam, year, slot, faculty), delete with confirm.
 *
 * collection("papers"): updateDoc on edit, deleteDoc on delete.
 * Direct admin upload bypasses the queue — add form in Phase 2.
 */
import { useEffect, useMemo, useState } from "react";
import { AdminShell, CodeChip, EmptyState, IcoSearch, IcoEdit, IcoTrash, IcoDoc } from "./adminUi.jsx";
import {
  Button,
  Card,
  MicroLabel,
  Input,
  FieldLabel,
  Select,
  Badge,
} from "../../components/atoms.jsx";
import { getAllPapers, getAllSubjects, updatePaper, deletePaper } from "../../firebase/db.js";

const EXAMS = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];

function EditRow({ paper, onSave, onCancel }) {
  const [examType, setExamType] = useState(paper.examType);
  const [year, setYear] = useState(paper.year);
  const [slot, setSlot] = useState(paper.slot);
  const [faculty, setFaculty] = useState(paper.faculty || "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-[10px] border border-accent/40 bg-accent/5 p-3.5">
      <MicroLabel>Edit metadata · {paper.fileName ?? paper.id}</MicroLabel>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <div>
          <FieldLabel>Exam</FieldLabel>
          <Select value={examType} onChange={(e) => setExamType(e.target.value)}>
            {EXAMS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Year</FieldLabel>
          <Input
            type="number"
            min="2020"
            max="2030"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="font-mono"
          />
        </div>
        <div>
          <FieldLabel>Slot</FieldLabel>
          <Input
            value={slot ?? ""}
            onChange={(e) => setSlot(e.target.value)}
            className="font-mono uppercase"
            placeholder="F1"
          />
        </div>
        <div>
          <FieldLabel>Faculty</FieldLabel>
          <Input
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="mt-2.5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(paper.id, { examType, year, slot, faculty });
          }}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function PapersManager() {
  const [rows, setRows] = useState([]);
  const [subjectMap, setSubjectMap] = useState({});
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [papers, subjects] = await Promise.all([
          getAllPapers(),
          getAllSubjects(),
        ]);
        setRows(papers);
        const map = {};
        subjects.forEach((s) => {
          map[s.id] = s.name;
        });
        setSubjectMap(map);
      } catch (e) {
        setError(
          e?.message ? `Papers load nahi hue: ${e.message}` : "Papers load nahi hue."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = rows.filter((p) => p.status === "approved");
    if (!query) return list;
    return list.filter(
      (p) =>
        (p.fileName ?? "").toLowerCase().includes(query) ||
        (p.subjectCode ?? "").toLowerCase().includes(query) ||
        (p.examType ?? "").toLowerCase().includes(query) ||
        (subjectMap[p.subjectId] ?? "").toLowerCase().includes(query) ||
        String(p.year ?? "").includes(query)
    );
  }, [rows, q, subjectMap]);

  const saveEdit = async (id, patch) => {
    setError("");
    try {
      await updatePaper(id, patch);
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    } catch (e) {
      setError(
        e?.message ? `Edit save nahi hua: ${e.message}` : "Edit save nahi hua."
      );
    }
    setEditing(null);
  };

  const doDelete = async (id) => {
    setError("");
    try {
      await deletePaper(id);
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      setError(
        e?.message ? `Delete nahi hua: ${e.message}` : "Delete nahi hua."
      );
    }
    setDeleting(null);
  };

  return (
    <AdminShell
      active="papers"
      title="Papers Manager"
      subtitle="Live papers — metadata edit, delete"
      badge={0}
    >
      {error && (
        <div className="mb-4 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      <div className="relative">
        <IcoSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: code, exam, year, filename…"
          aria-label="Search papers"
          className="pl-10"
        />
      </div>
      <p className="mt-2 font-mono text-xs text-text-dim tabular-nums">
        {filtered.length} / {rows.filter((p) => p.status === "approved").length} papers
      </p>

      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4">
              {editing === p.id ? (
                <EditRow
                  paper={p}
                  onSave={saveEdit}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-plus text-text-dim">
                    <IcoDoc className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-semibold text-text">
                      {p.fileName ?? p.id}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-text-dim">
                      <CodeChip>{p.subjectCode ?? "—"}</CodeChip>
                      <Badge tone={p.examType === "FAT" ? "amber" : "moss"}>
                        {p.examType ?? "—"}
                      </Badge>
                      <span className="font-mono tabular-nums">{p.year ?? "—"}</span>
                      {p.slot && <span className="font-mono">{p.slot}</span>}
                      {p.faculty && <span>{p.faculty}</span>}
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-text-dim tabular-nums">
                      {(p.downloads ?? 0).toLocaleString("en-IN")} downloads · {(p.views ?? 0).toLocaleString("en-IN")} views
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(p.id)}
                      aria-label={`Edit ${p.fileName ?? p.id}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] text-text-dim hover:bg-surface-plus hover:text-text"
                    >
                      <IcoEdit className="h-4 w-4" />
                    </button>
                    {deleting === p.id ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => doDelete(p.id)}
                          className="min-h-[44px] rounded-[8px] bg-brick/15 px-2.5 text-xs font-bold text-brick"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(null)}
                          className="min-h-[44px] rounded-[8px] px-2.5 text-xs font-semibold text-text-dim hover:text-text"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleting(p.id)}
                        aria-label={`Delete ${p.fileName ?? p.id}`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] text-text-dim hover:bg-brick/10 hover:text-brick"
                      >
                        <IcoTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon={<IcoDoc className="h-8 w-8" />}
              title="Koi paper nahi mila"
              hint="Search clear karo ya alag code try karo."
            />
          )}
        </div>
      )}
    </AdminShell>
  );
}
