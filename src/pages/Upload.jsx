/**
 * Upload.jsx — PaperVault paper upload page (Worker B).
 * Route: /upload (hash: #upload) — login REQUIRED.
 *
 * Login-gated form (DETAILED_PLAN §3.5): searchable subject dropdown WITH
 * course codes, exam-type radio chips (CAT-1 / CAT-2 / FAT / Lab FAT), year
 * select, slot input with suggestions, optional faculty, drag-drop PDF zone
 * (PDF only, ≤25MB).
 *
 * Submit → animated pipeline (Hash → Metadata → Similarity → AI verdict,
 * §4 flow) via checkDuplicate (src/ai/duplicateCheck.js — hash + metadata
 * only when no Gemini key, honest "manual review" fallback). 3 outcomes:
 *   ✅ unique  → PENDING_REVIEW "review me bheja" + My Uploads link
 *   ❌ duplicate → DUPLICATE_EXACT / DUPLICATE_SIMILAR + existing paper link
 *   ⚠️ error   → BACKEND_PLAN §7 error codes + retry
 *
 * Live data: subjects + approved papers from Firestore, PDF upload to
 * Cloudinary (free tier), upload record via createUpload() (status: pending).
 * Design: Direction A "Archive Noir" (DESIGN.md v2). 100% original.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { getSubjects, getPapers, createUpload } from "../firebase/db.js";
import { uploadPaperPDF } from "../lib/cloudinary.js"; // Cloudinary (free tier) — was firebase/storage.js
import { checkDuplicate } from "../ai/duplicateCheck.js";
import { sha256Hex } from "../utils/fileHash.js";
import { extractText } from "../utils/pdfText.js";
import { buildPaperFileName } from "../utils/fileName.js";
import Icon from "../components/Icon.jsx";
import {
  Button,
  Card,
  ExamChips,
  FieldLabel,
  Input,
  Select,
  ProgressSteps,
  LoginGate,
  OutcomeIcon,
} from "../components/atoms.jsx";
import { consumeReuploadDraft } from "./reuploadDraft.js";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB (BACKEND_PLAN §7 FILE_TOO_LARGE)
const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => CURRENT_YEAR - i);
const SLOT_SUGGESTIONS = ["A1", "B2", "C1", "D2", "E1", "F1", "G1", "G2"];

const PIPE_STEPS = [
  { key: "hash", label: "File hash", desc: "SHA-256 — exact copy check (free)" },
  { key: "metadata", label: "Metadata match", desc: "Subject · exam · year · slot (free)" },
  { key: "similarity", label: "Similarity scan", desc: "Content compare with existing papers" },
  { key: "verdict", label: "AI verdict", desc: "Gemini — doubtful cases only" },
];

/* ------------------------- Subject code combobox ------------------------- */

/** One flat option per course code: "CSE3002 — Artificial Intelligence". */
function codeOptions(list) {
  const out = [];
  for (const s of list || []) {
    const codes = (s.codes && s.codes.length ? s.codes : [s.code]).filter(Boolean);
    for (const c of codes) out.push({ code: c, subject: s });
  }
  return out.sort((a, b) => a.code.localeCompare(b.code));
}

function SubjectCombobox({ value, onChange, error, options, loading }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const all = useMemo(() => codeOptions(options), [options]);

  const selected = all.find((o) => o.code === value) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (o) =>
        o.code.toLowerCase().includes(q) ||
        o.subject.name.toLowerCase().includes(q)
    );
  }, [all, query]);

  // click-outside to close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open ]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setOpen(!open);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-[10px] border bg-canvas px-3.5 text-sm transition-colors focus:outline-none ${
          error ? "border-brick/60" : "border-hairline focus:border-accent-dim"
        }`}
      >
        {selected ? (
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="font-mono font-semibold text-accent">{selected.code}</span>
            <span className="truncate text-text-dim">{selected.subject.name}</span>
          </span>
        ) : (
          <span className="text-text-dim/70">Course code search karo…</span>
        )}
        <Icon name="chevR" size={16} className="rotate-90 text-text-dim" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-[10px] border border-hairline bg-surface shadow-2xl">
          <div className="border-b border-hairline p-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="CSE3002 ya Artificial Intelligence…"
              aria-label="Subject search"
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto p-1.5">
            {loading && (
              <li className="px-3 py-6 text-center text-sm text-text-dim">
                Subjects load ho rahe hain…
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-text-dim">
                Koi subject nahi mila. Dusra code try karo.
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.code === value}
                  onClick={() => {
                    onChange(o.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-baseline gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-plus ${
                    o.code === value ? "bg-accent/10" : ""
                  }`}
                >
                  <span className="shrink-0 font-mono font-semibold text-accent">
                    {o.code}
                  </span>
                  <span className="truncate text-text">{o.subject.name}</span>
                  <span className="ml-auto hidden shrink-0 text-xs text-text-dim sm:inline">
                    {o.subject.program}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Dropzone -------------------------------- */

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Dropzone({ file, onFile, onClear, error }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  return (
    <div>
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed px-6 py-10 text-center transition-colors lg:rounded-[16px] lg:py-14 ${
            drag ? "border-accent bg-accent/5" : "border-hairline hover:border-text-dim"
          }`}
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-full border ${drag ? "border-accent-dim bg-accent/10 text-accent" : "border-hairline text-text-dim"}`}>
            <Icon name="upload" size={20} />
          </span>
          <span className="text-sm font-semibold text-text">
            PDF yahan drop karo, ya <span className="text-accent">browse</span> karo
          </span>
          <span className="text-xs text-text-dim">
            Sirf PDF · max 25MB
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-[12px] border border-hairline bg-canvas px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brick/10 text-brick">
            <Icon name="file" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm font-semibold text-text">{file.name}</p>
            <p className="text-xs text-text-dim">{formatSize(file.size)} · PDF</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="File hatao"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-dim hover:bg-surface-plus hover:text-text"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brick">
          <Icon name="close" size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- Page ---------------------------------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Upload() {
  const { user, loading, signIn } = useAuth();

  const [code, setCode] = useState("");
  const [examType, setExamType] = useState("");
  const [year, setYear] = useState("");
  const [slot, setSlot] = useState("");
  const [faculty, setFaculty] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [reuploadNote, setReuploadNote] = useState(false);

  // pipeline state: "form" | "checking" | "success" | "duplicate" | "error"
  const [phase, setPhase] = useState("form");
  const [step, setStep] = useState(-1);
  const [verdict, setVerdict] = useState(null); // DuplicateCheckResponse
  const [autoName, setAutoName] = useState("");
  const [fail, setFail] = useState(null); // { code, message }
  const cancelled = useRef(false);

  // live subjects from Firestore
  const [subjectsList, setSubjectsList] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    let cancelledLoad = false;
    (async () => {
      try {
        const subs = await getSubjects();
        if (!cancelledLoad) setSubjectsList(subs);
      } catch (err) {
        console.error("[Upload] subjects load failed:", err);
      } finally {
        if (!cancelledLoad) setSubjectsLoading(false);
      }
    })();
    return () => {
      cancelledLoad = true;
    };
  }, []);

  // re-upload draft (from MyUploads "Re-upload")
  useEffect(() => {
    const draft = consumeReuploadDraft();
    if (draft) {
      setCode(draft.code || "");
      setExamType(draft.examType || "");
      setYear(draft.year ? String(draft.year) : "");
      setSlot(draft.slot || "");
      setFaculty(draft.faculty || "");
      setReuploadNote(true);
    }
  }, []);

  useEffect(() => () => {
    cancelled.current = true;
  }, []);

  const selectedSubject = useMemo(() => {
    if (!code) return null;
    return (
      subjectsList.find((s) => {
        const codes = (s.codes && s.codes.length ? s.codes : [s.code]).filter(Boolean);
        return codes.includes(code);
      }) || null
    );
  }, [code, subjectsList]);

  /* ------------------------------- validation ------------------------------ */
  function validate(nextFile = file) {
    const e = {};
    if (!code) e.code = "Subject select karo.";
    else if (
      !subjectsList.some((s) => {
        const codes = (s.codes && s.codes.length ? s.codes : [s.code]).filter(Boolean);
        return codes.includes(code);
      })
    )
      e.code = "Ye course code kisi subject me nahi hai.";
    if (!examType) e.examType = "Exam type select karo.";
    if (!year) e.year = "Year select karo.";
    if (!slot.trim()) e.slot = "Slot likho (e.g. F1).";
    if (!nextFile) {
      e.file = "PDF select karo.";
    } else {
      const isPdf =
        nextFile.type === "application/pdf" ||
        /\.pdf$/i.test(nextFile.name || "");
      if (!isPdf) e.file = "INVALID_FILE — sirf PDF upload karo."; // §7 code
      else if (nextFile.size > MAX_BYTES)
        e.file = `FILE_TOO_LARGE — ${formatSize(nextFile.size)} hai, max 25MB.`; // §7 code
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleFile(f) {
    setFile(f);
    setErrors((p) => ({ ...p, file: undefined }));
  }

  /* -------------------------------- pipeline ------------------------------- */
  async function runCheck() {
    if (!validate()) return;
    if (!selectedSubject) return; // validate() already flagged it
    cancelled.current = false;
    setPhase("checking");
    setStep(-1);
    setVerdict(null);
    setFail(null);

    try {
      // Step 0 — Hash (§4 step 2: SHA-256, free, instant)
      setStep(0);
      await sleep(450);
      const fileHash = await sha256Hex(file);

      // Step 1 — Metadata (§4 step 3: text sample)
      setStep(1);
      await sleep(450);
      const textSample = await extractText(file, 2000);

      // Step 2 — Similarity (embedding compare; simulated beat)
      setStep(2);
      await sleep(450);

      // Step 3 — AI verdict (checkDuplicate: hash → metadata → embedding → Gemini)
      setStep(3);
      const approved = await getPapers(selectedSubject.id);
      const existingPapers = approved.map((p) => ({
        id: p.id,
        fileHash: p.fileHash,
        subjectId: p.subjectId,
        examType: p.examType,
        year: p.year,
        slot: p.slot,
        title: p.title || `${p.subjectCode || ""} ${p.examType} ${p.year} (${p.slot})`,
      }));

      const res = await checkDuplicate({
        fileHash,
        subjectId: selectedSubject.id,
        examType,
        year: Number(year),
        slot: slot.trim().toUpperCase(),
        textSample,
        existingPapers,
      });
      if (cancelled.current) return;

      setVerdict(res);
      const slotClean = slot.trim().toUpperCase();
      const name = buildPaperFileName(code, examType, year, slotClean);
      setAutoName(name);

      if (res.isDuplicate) {
        setPhase("duplicate");
      } else {
        // Unique → upload PDF to Storage, then record as pending review (§7)
        try {
          const { url: fileUrl } = await uploadPaperPDF(file, code, name);
          if (cancelled.current) return;
          await createUpload({
            userId: user.uid,
            fileName: name,
            subjectId: selectedSubject.id,
            subjectCode: code,
            examType,
            year: Number(year),
            slot: slotClean,
            faculty: faculty.trim(),
            fileHash,
            fileUrl,
            fileSize: file.size,
            textSample,
          });
        } catch (upErr) {
          if (cancelled.current) return;
          console.error("[Upload] storage/createUpload failed:", upErr);
          setFail({
            code: "UPLOAD_FAILED",
            message:
              "Paper unique tha, lekin Storage me upload nahi ho paya. Internet check karke dobara try karo.",
          });
          setPhase("error");
          return;
        }
        setPhase("success");
      }
    } catch (err) {
      if (cancelled.current) return;
      console.error("[Upload] check failed:", err);
      setFail({
        code: "CHECK_FAILED",
        message:
          "Duplicate check me kuch gadbad ho gaya. Internet check karke dobara try karo.",
      });
      setPhase("error");
    }
  }

  function resetForm() {
    setCode("");
    setExamType("");
    setYear("");
    setSlot("");
    setFaculty("");
    setFile(null);
    setErrors({});
    setReuploadNote(false);
    setPhase("form");
    setStep(-1);
    setVerdict(null);
    setAutoName("");
    setFail(null);
  }

  /* --------------------------------- render --------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return <LoginGate onSignIn={signIn} actionText="paper upload karne" />;
  }

  const errorCodeOf = (v) => {
    if (!v) return "DUPLICATE_SIMILAR";
    if (/exact file/i.test(v.reason)) return "DUPLICATE_EXACT";
    if (/similar|duplicate/i.test(v.reason)) return "DUPLICATE_SIMILAR";
    return "DUPLICATE_SIMILAR";
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 lg:max-w-5xl lg:pt-10">
      {/* header */}
      <div className="mb-6 lg:mb-8">
        <p className="micro mb-2">Contribute</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-text lg:text-4xl">
          Paper <span className="hl-soft">upload</span> karo
        </h1>
        <p className="mt-2 max-w-xl text-sm text-text-dim lg:text-[15px]">
          Tumhara paper pehle <span className="font-semibold text-text">duplicate check</span> se
          guzrega, phir review ke baad live hoga.
        </p>
      </div>

      {phase === "form" && (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCheck();
          }}
          className="min-w-0 space-y-5"
        >
          {reuploadNote && (
            <div className="flex items-start gap-2.5 rounded-[12px] border border-accent-dim bg-accent/5 px-4 py-3">
              <Icon name="upload" size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-xs text-text-dim">
                <span className="font-semibold text-text">Re-upload mode:</span> rejected paper
                ki details pre-fill hain. Bas nayi sahi file select karo.
              </p>
            </div>
          )}

          <FieldLabel label="Subject (course code)" error={errors.code}>
            <SubjectCombobox
              value={code}
              onChange={(c) => { setCode(c); setErrors((p) => ({ ...p, code: undefined })); }}
              error={errors.code}
              options={subjectsList}
              loading={subjectsLoading}
            />
          </FieldLabel>

          <FieldLabel label="Exam type" error={errors.examType}>
            <ExamChips value={examType} onChange={(t) => { setExamType(t); setErrors((p) => ({ ...p, examType: undefined })); }} />
          </FieldLabel>

          <div className="grid grid-cols-2 gap-4">
            <FieldLabel label="Year" error={errors.year}>
              <Select
                value={year}
                onChange={(e) => { setYear(e.target.value); setErrors((p) => ({ ...p, year: undefined })); }}
              >
                <option value="">Select…</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </FieldLabel>
            <FieldLabel label="Slot" hint="e.g. F1, B2 — hall ticket pe hota hai" error={errors.slot}>
              <Input
                list="slot-suggestions"
                value={slot}
                onChange={(e) => { setSlot(e.target.value); setErrors((p) => ({ ...p, slot: undefined })); }}
                placeholder="F1"
                maxLength={8}
                className="font-mono uppercase"
              />
              <datalist id="slot-suggestions">
                {SLOT_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </FieldLabel>
          </div>

          <FieldLabel label="Faculty (optional)">
            <Input
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="e.g. Dr. Rajesh Kumar"
              maxLength={80}
            />
          </FieldLabel>

          <div>
            <label className="micro mb-2 block">PDF file</label>
            <Dropzone file={file} onFile={handleFile} onClear={() => setFile(null)} error={errors.file} />
          </div>

          <Button type="submit" className="w-full">
            <Icon name="spark" size={16} />
            Duplicate check + submit
          </Button>
          <p className="text-center text-xs text-text-dim lg:text-left">
            Check order: hash → metadata → similarity → AI verdict. 90%+ uploads pehle 2 steps me clear.
          </p>
        </form>

        {/* desktop sidebar — how the check works + tips */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <Card className="p-5">
            <p className="micro mb-4">Check kaise hota hai</p>
            <ol className="space-y-4">
              {PIPE_STEPS.map((s, i) => (
                <li key={s.key} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas font-mono text-[11px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-text">{s.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-dim">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="mt-4 p-5">
            <p className="micro mb-2">Tip</p>
            <p className="text-xs leading-relaxed text-text-dim">
              Saaf scan wala PDF upload karo — text readable hoga to check fast hoga.
              File ka naam automatic ban jayega:{" "}
              <span className="font-mono text-text-dim/80">CSE3002-CAT2-2025-F1.pdf</span>
            </p>
          </Card>
        </aside>
        </div>
      )}

      {/* ------------------------------ checking ------------------------------ */}
      {phase === "checking" && (
        <Card className="p-6">
          <div className="mb-5">
            <p className="micro mb-2">Duplicate check</p>
            <h2 className="font-display text-lg font-bold text-text">
              Tumhara paper check ho raha hai…
            </h2>
            <p className="mt-1 font-mono text-xs text-text-dim">
              {file?.name}
            </p>
          </div>
          <ProgressSteps steps={PIPE_STEPS} current={step} state="running" />
          <Button variant="ghost" className="mt-4 w-full" onClick={() => { cancelled.current = true; setPhase("form"); setStep(-1); }}>
            Cancel
          </Button>
        </Card>
      )}

      {/* ------------------------------ success ------------------------------ */}
      {phase === "success" && (
        <Card className="p-8 text-center">
          <OutcomeIcon tone="success">
            <Icon name="check" size={26} />
          </OutcomeIcon>
          <h2 className="font-display text-xl font-bold text-text">
            Unique! Review me bhej diya
          </h2>
          <p className="mt-2 text-sm text-text-dim">
            Tumhara paper ab admin/moderator review karega. Approve hote hi vault me live ho jayega.
            <span className="mt-2 block font-mono text-xs text-text-dim/80">code: PENDING_REVIEW</span>
          </p>
          <div className="mt-5 rounded-[10px] border border-hairline bg-canvas px-4 py-3">
            <p className="micro mb-1">Auto filename</p>
            <p className="truncate font-mono text-sm font-semibold text-accent">{autoName}</p>
          </div>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button className="flex-1" onClick={() => { window.location.hash = "#my-uploads"; }}>
              <Icon name="clock" size={16} />
              My Uploads dekho
            </Button>
            <Button variant="secondary" className="flex-1" onClick={resetForm}>
              Naya upload karo
            </Button>
          </div>
        </Card>
      )}

      {/* ------------------------------ duplicate ------------------------------ */}
      {phase === "duplicate" && verdict && (
        <Card className="p-8 text-center">
          <OutcomeIcon tone="danger">
            <Icon name="close" size={26} />
          </OutcomeIcon>
          <h2 className="font-display text-xl font-bold text-text">
            Duplicate mila
          </h2>
          <p className="mt-2 text-sm text-text-dim">{verdict.reason}</p>
          <p className="mt-1 font-mono text-xs text-text-dim/80">
            code: {errorCodeOf(verdict)}
          </p>
          {verdict.duplicateOf && (
            <div className="mt-5 rounded-[10px] border border-brick/30 bg-brick/5 px-4 py-3.5 text-left">
              <p className="micro mb-1.5">Existing paper</p>
              <p className="font-mono text-sm font-semibold text-text">
                {verdict.duplicateTitle}
              </p>
              <button
                type="button"
                onClick={() => { window.location.hash = `#papers/${verdict.duplicateOf}`; }}
                className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-accent"
              >
                <Icon name="eye" size={16} />
                Existing paper dekho
                <Icon name="chevR" size={14} />
              </button>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={resetForm}>
              Wapas form pe jao
            </Button>
            <Button className="flex-1" onClick={() => { window.location.hash = "#my-uploads"; }}>
              My Uploads
            </Button>
          </div>
        </Card>
      )}

      {/* -------------------------------- error -------------------------------- */}
      {phase === "error" && fail && (
        <Card className="p-8 text-center">
          <OutcomeIcon tone="info">
            <Icon name="close" size={26} />
          </OutcomeIcon>
          <h2 className="font-display text-xl font-bold text-text">
            Kuch gadbad ho gayi
          </h2>
          <p className="mt-2 text-sm text-text-dim">{fail.message}</p>
          <p className="mt-1 font-mono text-xs text-text-dim/80">code: {fail.code}</p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button className="flex-1" onClick={runCheck}>
              Dobara try karo
            </Button>
            <Button variant="secondary" className="flex-1" onClick={resetForm}>
              Form edit karo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
