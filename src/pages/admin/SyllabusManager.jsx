/**
 * PaperVault — Admin Syllabus Manager (Direction A "Archive Noir").
 * 100% original. Mobile-first. Mock data only.
 * Route: #/admin/syllabus
 *
 * Subject select → modules editor (number, title, topics) +
 * syllabus PDF upload placeholder. Yehi modules AI analysis ka
 * reference bante hain (mock/ai.js templates).
 *
 * // TODO: firebase — doc("syllabus", subjectId): setDoc on save;
 * // PDF → Storage syllabus/{code}/syllabus.pdf, pdfUrl update.
 */
import { useMemo, useState } from "react";
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
import { subjects, syllabi } from "../../mock/index.js";

function ModuleEditor({ module, onChange, onRemove }) {
  const topicsText = module.topics.join(", ");
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
  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.active).sort((a, b) => a.code.localeCompare(b.code)),
    []
  );
  const [subjectId, setSubjectId] = useState(activeSubjects[0]?.id ?? "");
  const subject = activeSubjects.find((s) => s.id === subjectId);
  const seed = syllabi.find((s) => s.subjectId === subjectId);

  const [modules, setModules] = useState(seed?.modules ?? []);
  const [pdfName, setPdfName] = useState(seed?.pdfUrl?.split("/").pop() ?? null);
  const [saved, setSaved] = useState(false);

  const switchSubject = (id) => {
    setSubjectId(id);
    const s = syllabi.find((x) => x.subjectId === id);
    setModules(s?.modules ?? []);
    setPdfName(s?.pdfUrl?.split("/").pop() ?? null);
    setSaved(false);
  };

  const addModule = () =>
    setModules((ms) => [
      ...ms,
      { number: ms.length + 1, title: "", topics: [] },
    ]);

  const save = () => {
    // mock save — TODO: firebase setDoc(doc(db,"syllabus",subjectId), {...})
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminShell
      active="syllabus"
      title="Syllabus Manager"
      subtitle="Modules + official syllabus PDF — AI analysis ka reference"
      badge={0}
    >
      <div>
        <FieldLabel htmlFor="sm-subject">Subject</FieldLabel>
        <Select
          id="sm-subject"
          value={subjectId}
          onChange={(e) => switchSubject(e.target.value)}
        >
          {activeSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </Select>
      </div>

      {/* syllabus PDF upload placeholder */}
      <Card className="mt-4 flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-accent/10 text-accent">
          <IcoDoc className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <MicroLabel>Official syllabus PDF</MicroLabel>
          <p className="mt-0.5 truncate font-mono text-sm text-text">
            {pdfName ?? "Koi PDF upload nahi hua"}
          </p>
          {subject && (
            <p className="font-mono text-[11px] text-text-dim">
              Storage: syllabus/<CodeChip>{subject.code}</CodeChip>/syllabus.pdf
            </p>
          )}
        </div>
        <label className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-hairline px-4 text-sm font-semibold text-text transition-colors hover:border-text-dim hover:bg-surface-plus">
          <IcoUpload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPdfName(f.name); // mock — TODO: uploadBytes → getDownloadURL
            }}
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

      <Button className="mt-5 w-full md:w-auto" onClick={save}>
        {saved ? "Saved" : "Save syllabus"}
      </Button>
      {saved && (
        <p className="mt-2 text-sm text-moss">
          Syllabus save ho gaya (mock — firebase wiring pending).
        </p>
      )}
    </AdminShell>
  );
}
