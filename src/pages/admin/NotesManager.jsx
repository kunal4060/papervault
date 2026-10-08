/**
 * PaperVault — Admin Notes Manager (Direction A "Archive Noir").
 * 100% original. Mobile-first. Mock data only.
 * Route: #/admin/notes
 *
 * Notes table (title, subject, module, pages, verified) + delete confirm.
 * Upload form: subject select, syllabus-module select, title, pages, PDF.
 * Notes sirf admin upload karta hai (§2).
 *
 * // TODO: firebase — collection("notes"): addDoc on upload,
 * // deleteDoc on delete. PDF → Storage notes/{code}/m{module}/{file}.
 */
import { useMemo, useState } from "react";
import { AdminShell, CodeChip, EmptyState, IcoDoc, IcoTrash, IcoUpload } from "./adminUi.jsx";
import {
  Button,
  Card,
  MicroLabel,
  Input,
  FieldLabel,
  Select,
  Badge,
} from "../../components/atoms.jsx";
import { subjects, notes as seedNotes, getSyllabus } from "../../mock/index.js";

export default function NotesManager() {
  const [rows, setRows] = useState(seedNotes);
  const [deleting, setDeleting] = useState(null);

  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.active).sort((a, b) => a.code.localeCompare(b.code)),
    []
  );
  const [form, setForm] = useState({
    subjectId: activeSubjects[0]?.id ?? "",
    module: "",
    title: "",
    pages: "",
    fileName: "",
  });
  const [added, setAdded] = useState(false);

  const formSubject = activeSubjects.find((s) => s.id === form.subjectId);
  const formModules = useMemo(
    () => getSyllabus(form.subjectId)?.modules ?? [],
    [form.subjectId]
  );
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const subjectOf = (note) => activeSubjects.find((s) => s.id === note.subjectId);

  const upload = () => {
    if (!form.title.trim() || !form.module) return;
    setRows((rs) => [
      {
        id: `note-${Date.now()}`,
        subjectId: form.subjectId,
        syllabusModule: Number(form.module),
        title: form.title.trim(),
        fileUrl: "#",
        pages: Number(form.pages) || 0,
        uploadedBy: "uid-admin",
        verified: true,
        createdAt: new Date().toISOString(),
      },
      ...rs,
    ]);
    setForm((f) => ({ ...f, title: "", pages: "", fileName: "", module: "" }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const confirmDelete = (id) => {
    // mock — TODO: firebase deleteDoc(doc(db,"notes",id))
    setRows((rs) => rs.filter((r) => r.id !== id));
    setDeleting(null);
  };

  return (
    <AdminShell
      active="notes"
      title="Notes Manager"
      subtitle="Admin-verified notes — module se linked"
      badge={0}
    >
      {/* upload form */}
      <Card className="p-4 md:p-5">
        <MicroLabel>Upload note</MicroLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="nm-subject">Subject</FieldLabel>
            <Select id="nm-subject" value={form.subjectId} onChange={setF("subjectId")}>
              {activeSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="nm-module">Syllabus module</FieldLabel>
            <Select id="nm-module" value={form.module} onChange={setF("module")}>
              <option value="">Select module…</option>
              {formModules.map((m) => (
                <option key={m.number} value={m.number}>
                  M{m.number} — {m.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <FieldLabel htmlFor="nm-title">Note title</FieldLabel>
            <Input
              id="nm-title"
              value={form.title}
              onChange={setF("title")}
              placeholder="e.g. Stacks & Queues — Master Notes"
            />
          </div>
          <div>
            <FieldLabel htmlFor="nm-pages">Pages</FieldLabel>
            <Input
              id="nm-pages"
              type="number"
              min="1"
              value={form.pages}
              onChange={setF("pages")}
              placeholder="24"
              className="font-mono"
            />
          </div>
          <div>
            <FieldLabel>PDF file</FieldLabel>
            <label className="inline-flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-[10px] border border-hairline bg-surface-plus px-4 text-sm text-text transition-colors hover:border-text-dim">
              <IcoUpload className="h-4 w-4 text-text-dim" />
              <span className="truncate text-text-dim">
                {form.fileName || "Choose PDF…"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setForm((x) => ({ ...x, fileName: f.name }));
                  // mock — TODO: uploadBytes → getDownloadURL
                }}
              />
            </label>
          </div>
        </div>
        <Button className="mt-3 w-full md:w-auto" onClick={upload}>
          Upload note
        </Button>
        {added && (
          <p className="mt-2 text-sm text-moss">
            Note upload ho gaya (mock — firebase wiring pending).
          </p>
        )}
      </Card>

      {/* notes table */}
      <div className="mt-4 overflow-x-auto rounded-[12px] border border-hairline bg-surface">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline">
              {["Note", "Subject", "Module", "Pages", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-text">{n.title}</div>
                  <div className="mt-1">
                    <Badge tone="moss">Verified</Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <CodeChip>{subjectOf(n)?.code ?? n.subjectId}</CodeChip>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-accent">
                    M{n.syllabusModule}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text tabular-nums">
                  {n.pages}
                </td>
                <td className="px-4 py-3 text-right">
                  {deleting === n.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs text-text-dim">Delete?</span>
                      <button
                        type="button"
                        onClick={() => confirmDelete(n.id)}
                        className="min-h-[44px] rounded-[8px] bg-brick/15 px-3 text-xs font-bold text-brick"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(null)}
                        className="min-h-[44px] rounded-[8px] px-3 text-xs font-semibold text-text-dim hover:text-text"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleting(n.id)}
                      aria-label={`Delete ${n.title}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] text-text-dim hover:bg-brick/10 hover:text-brick"
                    >
                      <IcoTrash className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={<IcoDoc className="h-8 w-8" />}
            title="Koi notes nahi"
            hint="Upar form se pehla note upload karo."
          />
        </div>
      )}
    </AdminShell>
  );
}
