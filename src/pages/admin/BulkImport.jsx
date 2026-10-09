/**
 * PaperVault — Admin bulk import (PYQs Hub archive migration).
 * Route: #/admin/bulk-import
 *
 * Two steps:
 *   1. Create subjects from the bundled manifest (skips codes that exist).
 *   2. Import papers: each manifest entry -> papers/{id} (status "approved",
 *      fileUrl = Cloudinary URL). Skips entries whose fileUrl already exists.
 *
 * Manifest: src/data/bulkManifest.json (generated offline; entries carry
 * Cloudinary URLs so this page only writes Firestore docs — no file
 * re-upload needed in the browser).
 *
 * 100% original, Direction A "Archive Noir". Mobile-first.
 */
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "./adminUi.jsx";
import { Button, Card, MicroLabel } from "../../components/atoms.jsx";
import {
  getAllSubjects,
  createSubject,
  getAllPapers,
  createPaper,
} from "../../firebase/db.js";
import MANIFEST from "../../data/bulkManifest.json";

const BULK_UPLOADER = "PYQs Hub archive";

function StepRow({ n, title, desc, action, disabled, busy, doneLabel }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-[#0C0D10]">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-text">{title}</h3>
          <p className="mt-1 text-sm text-text-dim">{desc}</p>
          <Button onClick={action} disabled={disabled} className="mt-4">
            {busy ? "Chal raha hai…" : doneLabel || "Start"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function BulkImport() {
  const [loading, setLoading] = useState(true);
  const [existingCodes, setExistingCodes] = useState(new Set());
  const [existingUrls, setExistingUrls] = useState(new Set());
  const [subjectState, setSubjectState] = useState({ status: "idle", done: 0, total: 0, error: "" });
  const [paperState, setPaperState] = useState({ status: "idle", done: 0, total: 0, error: "" });

  const subjects = useMemo(() => {
    const map = new Map();
    for (const e of MANIFEST) {
      if (!map.has(e.subjectCode)) {
        map.set(e.subjectCode, {
          code: e.subjectCode,
          name: e.subjectName,
          program: e.program,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, []);

  const missingSubjects = useMemo(
    () => subjects.filter((s) => !existingCodes.has(s.code)),
    [subjects, existingCodes]
  );
  const missingPapers = useMemo(
    () => MANIFEST.filter((e) => e.fileUrl && !existingUrls.has(e.fileUrl)),
    [existingUrls]
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const [subs, papers] = await Promise.all([getAllSubjects(), getAllPapers()]);
      setExistingCodes(new Set(subs.map((s) => s.code)));
      setExistingUrls(new Set(papers.map((p) => p.fileUrl).filter(Boolean)));
    } catch (e) {
      setSubjectState((s) => ({ ...s, error: e?.message || "Load fail" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const createSubjects = async () => {
    if (subjectState.status === "running") return;
    setSubjectState({ status: "running", done: 0, total: missingSubjects.length, error: "" });
    let done = 0;
    try {
      for (const s of missingSubjects) {
        await createSubject({
          name: s.name,
          code: s.code,
          codes: [s.code],
          program: s.program,
          semester: null,
        });
        done += 1;
        setSubjectState({ status: "running", done, total: missingSubjects.length, error: "" });
      }
      setSubjectState({ status: "done", done, total: missingSubjects.length, error: "" });
      await refresh();
    } catch (e) {
      setSubjectState({ status: "error", done, total: missingSubjects.length, error: e?.message || "Fail" });
    }
  };

  const importPapers = async () => {
    if (paperState.status === "running") return;
    // fresh code -> id map
    let codeToId = {};
    try {
      const subs = await getAllSubjects();
      for (const s of subs) codeToId[s.code] = s.id;
    } catch (e) {
      setPaperState({ status: "error", done: 0, total: 0, error: e?.message || "Subjects load fail" });
      return;
    }
    const queue = missingPapers.filter((e) => codeToId[e.subjectCode]);
    const skippedNoSubject = missingPapers.length - queue.length;
    setPaperState({ status: "running", done: 0, total: queue.length, error: "" });
    let done = 0;
    try {
      for (const e of queue) {
        await createPaper({
          fileName: e.filename,
          subjectId: codeToId[e.subjectCode],
          subjectCode: e.subjectCode,
          examType: e.examType,
          year: e.year ?? null,
          slot: "",
          faculty: "",
          fileUrl: e.fileUrl,
          fileSize: e.fileSize ?? 0,
          fileHash: e.sha256 ?? "",
          textSample: "",
          uploaderId: "bulk-import",
          uploaderName: BULK_UPLOADER,
          status: "approved",
        });
        done += 1;
        if (done % 5 === 0 || done === queue.length) {
          setPaperState({ status: "running", done, total: queue.length, error: "" });
        }
      }
      setPaperState({
        status: "done", done, total: queue.length,
        error: skippedNoSubject ? `${skippedNoSubject} papers skip — subject missing (pehle Step 1 chalao).` : "",
      });
      await refresh();
    } catch (e) {
      setPaperState({ status: "error", done, total: queue.length, error: e?.message || "Fail" });
    }
  };

  const bar = (done, total) => {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return (
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    );
  };

  return (
    <AdminShell active="bulk-import" title="Bulk Import" subtitle="PYQs Hub archive → PaperVault">
      <div className="space-y-4">
        <Card className="p-5">
          <MicroLabel>Manifest</MicroLabel>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-text">{MANIFEST.length}</p>
              <p className="micro">papers</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-text">{subjects.length}</p>
              <p className="micro">subjects</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-text">{missingPapers.length}</p>
              <p className="micro">pending</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-text-dim">
            PDFs pehle se Cloudinary pe uploaded hain — ye page sirf Firestore me
            subjects aur paper records banata hai. Dobara chalane pe pehle se
            maujood entries skip ho jayengi.
          </p>
        </Card>

        {loading ? (
          <Card className="p-5"><p className="text-sm text-text-dim">Load ho raha hai…</p></Card>
        ) : (
          <>
            <StepRow
              n="1"
              title={`Subjects banao (${missingSubjects.length} naye)`}
              desc="Manifest ke subjects Firestore me banenge. Jo codes pehle se hain, wo skip."
              action={createSubjects}
              disabled={subjectState.status === "running" || missingSubjects.length === 0}
              busy={subjectState.status === "running"}
              doneLabel={subjectState.status === "done" ? `Ho gaya (${subjectState.done})` : missingSubjects.length === 0 ? "Sab subjects maujood" : "Subjects banao"}
            />
            {subjectState.status === "running" && bar(subjectState.done, subjectState.total)}
            {subjectState.error && <p className="text-[13px] text-brick">{subjectState.error}</p>}

            <StepRow
              n="2"
              title={`Papers import karo (${missingPapers.length} pending)`}
              desc="Har paper ka Firestore record banega (status approved). Pehle Step 1 poora karo."
              action={importPapers}
              disabled={paperState.status === "running" || missingPapers.length === 0}
              busy={paperState.status === "running"}
              doneLabel={paperState.status === "done" ? `Ho gaya (${paperState.done})` : missingPapers.length === 0 ? "Sab papers imported" : "Papers import karo"}
            />
            {paperState.status === "running" && (
              <p className="text-sm text-text-dim">{paperState.done} / {paperState.total}{bar(paperState.done, paperState.total)}</p>
            )}
            {paperState.error && <p className="text-[13px] text-brick">{paperState.error}</p>}
          </>
        )}
      </div>
    </AdminShell>
  );
}
