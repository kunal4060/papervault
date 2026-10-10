/**
 * PaperVault — Admin Notes Manager (Direction A "Archive Noir").
 * 100% original. Mobile-first. Live Firestore data — no mock seeds.
 * Route: /admin/notes
 *
 * Notes table (title, subject, module, pages, verified) + delete confirm.
 * Upload form: subject select, syllabus-module select, title, pages, PDF.
 * Notes sirf admin upload karta hai (§2).
 *
 * collection("notes"): addDoc on upload, deleteDoc on delete.
 * PDF → Storage notes/{code}/m{module}/{file}.
 */
import { useEffect, useState } from "react";
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
import {
  getAllNotes,
  getAllSubjects,
  getSyllabus,
  createNote,
  deleteNote,
} from "../../firebase/db.js";
import { uploadNotePDF } from "../../lib/cloudinary.js";

export default function NotesManager() {
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const [form, setForm] = useState({
    subjectId: "",
    module: "",
    title: "",
    pages: "",
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [formModules, setFormModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  const formSubject = subjects.find((s) => s.id === form.subjectId);

  useEffect(() => {
    (async () => {
      try {
        const [allNotes, allSubjects] = await Promise.all([
          getAllNotes(),
          getAllSubjects(),
        ]);
        const active = allSubjects
          .filter((s) => s.active)
          .sort((a, b) => String(a.code ?? "").localeCompare(String(b.code ?? "")));
        setSubjects(active);
        setRows(allNotes);
        if (active[0]?.id) {
          setForm((f) => ({ ...f, subjectId: active[0].id }));
          await loadModules(active[0].id);
        }
      } catch (e) {
        setError(
          e?.message ? `Notes load nahi hue: ${e.message}` : "Notes load nahi hue."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadModules = async (subjectId) => {
    setModulesLoading(true);
    try {
      const syl = await getSyllabus(subjectId);
      setFormModules(syl?.modules ?? []);
    } catch {
      setFormModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  const setF = (k) => async (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      [k]: v,
      // Subject badla → module reset (purane subject ka module number galat ho sakta hai)
      ...(k === "subjectId" ? { module: "" } : {}),
    }));
    if (k === "subjectId") await loadModules(v);
  };

  const subjectOf = (note) => subjects.find((s) => s.id === note.subjectId);

  const upload = async () => {
    if (!form.title.trim() || !form.module || !file || !formSubject) return;
    setUploading(true);
    setError("");
    try {
      const moduleNum = Number(form.module);
      const storageFileName = `${formSubject.code}_M${moduleNum}_${Date.now()}.pdf`;
      const { url, path } = await uploadNotePDF(
        file,
        formSubject.code,
        moduleNum,
        storageFileName
      );
      await createNote({
        subjectId: form.subjectId,
        subjectCode: formSubject.code,
        title: form.title.trim(),
        syllabusModule: moduleNum,
        fileUrl: url,
        filePath: path,
        pages: Number(form.pages) || 0,
        uploadedBy: "admin",
        verified: true,
      });
      // fresh list from server
      setRows(await getAllNotes());
      setForm((f) => ({ ...f, title: "", pages: "", module: "" }));
      setFile(null);
      setFileName("");
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (e) {
      setError(
        e?.message ? `Note upload nahi hua: ${e.message}` : "Note upload nahi hua."
      );
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async (id) => {
    setError("");
    try {
      await deleteNote(id);
      // Note: Cloudinary file cleanup client-side possible nahi hai
      // (unsigned uploads ke liye API secret chahiye) — file Cloudinary
      // dashboard se delete karna hoga. Doc delete hi kaafi hai.
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
      active="notes"
      title="Notes Manager"
      subtitle="Admin-verified notes — module se linked"
      badge={0}
    >
      {error && (
        <div className="mb-4 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      {/* upload form */}
      <Card className="p-4 md:p-5">
        <MicroLabel>Upload note</MicroLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="nm-subject">Subject</FieldLabel>
            <Select id="nm-subject" value={form.subjectId} onChange={setF("subjectId")}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="nm-module">Syllabus module</FieldLabel>
            <Select id="nm-module" value={form.module} onChange={setF("module")}>
              <option value="">
                {modulesLoading ? "Loading…" : "Select module…"}
              </option>
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
                {fileName || "Choose PDF…"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setFileName(f.name);
                  }
                }}
              />
            </label>
          </div>
        </div>
        <Button
          className="mt-3 w-full md:w-auto"
          onClick={upload}
          disabled={uploading || !form.title.trim() || !form.module || !file}
        >
          {uploading ? "Uploading…" : "Upload note"}
        </Button>
        {added && !error && (
          <p className="mt-2 text-sm text-moss">Note upload ho gaya.</p>
        )}
      </Card>

      {/* notes table */}
      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : (
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
                    <CodeChip>{subjectOf(n)?.code ?? n.subjectCode ?? n.subjectId}</CodeChip>
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
      )}
      {!loading && rows.length === 0 && (
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
