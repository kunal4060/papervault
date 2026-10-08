/**
 * PaperVault — Admin Syllabus Manager (Direction A "Archive Noir").
 * 100% original. Mobile-first. Live Firestore data — no mock seeds.
 * Route: #/admin/syllabus
 *
 * Subject select → modules editor (number, title, topics) +
 * syllabus PDF upload. Yehi modules AI analysis ka reference bante hain.
 *
 * doc("syllabus", subjectId): setDoc on save.
 * PDF → Storage syllabus/{code}/syllabus.pdf, pdfUrl saved on the doc.
 */
import { useEffect, useState } from "react";
import { AdminShell, CodeChip, IcoDoc, IcoPlus, IcoTrash, IcoUpload } from "./adminUi.jsx";
import {
  Button,
  Card,
  MicroLabel,
  Input,
  TextArea,
  FieldLabel,
  Select,
} from "../../components/atoms.jsx";
import { getAllSubjects, getSyllabus, saveSyllabus } from "../../firebase/db.js";
import { storage } from "../../firebase/config.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function ModuleEditor({ module, onChange, onRemove }) {
  const topicsText = (module.topics ?? []).join(", ");
  return (
    <div className="rounded-[12px] border border-hairline bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-[6px] bg-surface-plus px-2 py-1 font-mono text-xs font-bold text-accent">
          M{module.number}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove module ${module.number}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] text-text-dim hover:bg-brick/10 hover:text-brick"
        >
          <IcoTrash className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3">
        <FieldLabel>Title</FieldLabel>
        <Input
          value={module.title}
          onChange={(e) => onChange({ ...module, title: e.target.value })}
          placeholder="e.g. Stacks & Queues"
        />
      </div>
      <div className="mt-3">
        <FieldLabel>
          Topics <span className="normal-case">(comma separated)</span>
        </FieldLabel>
        <TextArea
          value={topicsText}
          onChange={(e) =>
            onChange({
              ...module,
              topics: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          className="min-h-[80px]"
          placeholder="stack, queue, infix to postfix, applications"
        />
      </div>
    </div>
  );
}

export default function SyllabusManager() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [modules, setModules] = useState([]);
  const [pdfName, setPdfName] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const subject = subjects.find((s) => s.id === subjectId);

  const loadSyllabus = async (id) => {
    try {
      const doc = await getSyllabus(id);
      setModules(doc?.modules ?? []);
      setPdfUrl(doc?.pdfUrl ?? "");
      setPdfName(doc?.pdfUrl ? doc.pdfUrl.split("/").pop() ?? null : null);
    } catch (e) {
      setError(
        e?.message ? `Syllabus load nahi hua: ${e.message}` : "Syllabus load nahi hua."
      );
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllSubjects();
        const active = all
          .filter((s) => s.active)
          .sort((a, b) => String(a.code ?? "").localeCompare(String(b.code ?? "")));
        setSubjects(active);
        const first = active[0]?.id ?? "";
        setSubjectId(first);
        if (first) await loadSyllabus(first);
      } catch (e) {
        setError(
          e?.message ? `Subjects load nahi hue: ${e.message}` : "Subjects load nahi hue."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const switchSubject = async (id) => {
    setSubjectId(id);
    setSaved(false);
    setError("");
    await loadSyllabus(id);
  };

  const addModule = () =>
    setModules((ms) => [
      ...ms,
      { number: ms.length + 1, title: "", topics: [] },
    ]);

  const save = async () => {
    if (!subjectId) return;
    setSaving(true);
    setError("");
    try {
      await saveSyllabus(subjectId, { modules, pdfUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e?.message ? `Save nahi hua: ${e.message}` : "Save nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPdf = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !subject || !subjectId) return;
    setUploading(true);
    setError("");
    try {
      const path = `syllabus/${subject.code}/syllabus.pdf`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, f, { contentType: "application/pdf" });
      const url = await getDownloadURL(storageRef);
      setPdfUrl(url);
      setPdfName(f.name);
      // PDF ka URL turant save karo taaki modules ke saath sync me rahe
      await saveSyllabus(subjectId, { modules, pdfUrl: url });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(
        err?.message ? `PDF upload nahi hua: ${err.message}` : "PDF upload nahi hua."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <AdminShell
      active="syllabus"
      title="Syllabus Manager"
      subtitle="Modules + official syllabus PDF — AI analysis ka reference"
      badge={0}
    >
      {error && (
        <div className="mb-4 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : subjects.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-hairline px-6 py-10 text-center text-sm text-text-dim">
          Pehle Subjects page se ek subject banao.
        </p>
      ) : (
        <>
          <div>
            <FieldLabel htmlFor="sm-subject">Subject</FieldLabel>
            <Select
              id="sm-subject"
              value={subjectId}
              onChange={(e) => switchSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
          </div>

          {/* syllabus PDF upload */}
          <Card className="mt-4 flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-accent/10 text-accent">
              <IcoDoc className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <MicroLabel>Official syllabus PDF</MicroLabel>
              <p className="mt-0.5 truncate font-mono text-sm text-text">
                {uploading ? "Uploading…" : (pdfName ?? "Koi PDF upload nahi hua")}
              </p>
              {subject && (
                <p className="font-mono text-[11px] text-text-dim">
                  Storage: syllabus/<CodeChip>{subject.code}</CodeChip>/syllabus.pdf
                </p>
              )}
            </div>
            <label
              className={`inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-hairline px-4 text-sm font-semibold text-text transition-colors hover:border-text-dim hover:bg-surface-plus ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <IcoUpload className="h-4 w-4" />
              <span className="hidden sm:inline">
                {uploading ? "Uploading…" : "Upload"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                disabled={uploading}
                onChange={uploadPdf}
              />
            </label>
          </Card>

          {/* modules editor */}
          <div className="mt-5 flex items-center justify-between">
            <MicroLabel>Modules ({modules.length})</MicroLabel>
            <Button variant="secondary" onClick={addModule} className="px-3">
              <IcoPlus className="h-4 w-4" />
              Module
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {modules.map((m, i) => (
              <ModuleEditor
                key={`${m.number}-${i}`}
                module={m}
                onChange={(next) =>
                  setModules((ms) => ms.map((x, j) => (j === i ? next : x)))
                }
                onRemove={() =>
                  setModules((ms) =>
                    ms.filter((_, j) => j !== i).map((x, j) => ({ ...x, number: j + 1 }))
                  )
                }
              />
            ))}
            {modules.length === 0 && (
              <p className="rounded-[12px] border border-dashed border-hairline px-6 py-10 text-center text-sm text-text-dim">
                Is subject ke modules abhi nahi hain — pehla module add karo.
              </p>
            )}
          </div>

          <Button className="mt-5 w-full md:w-auto" onClick={save} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save syllabus"}
          </Button>
          {saved && !error && (
            <p className="mt-2 text-sm text-moss">Syllabus save ho gaya.</p>
          )}
        </>
      )}
    </AdminShell>
  );
}
