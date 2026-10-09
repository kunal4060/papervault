/**
 * PaperVault — Admin Exam Countdown Settings (Direction A "Archive Noir").
 * 100% original. Mobile-first.
 * Route: #/admin/exam
 *
 * Exam type dropdown + start/end date pickers + optional custom label.
 * Save → doc("settings", "examCountdown"). Home banner reads it live.
 */
import { useEffect, useState } from "react";
import { AdminShell } from "./adminUi.jsx";
import {
  Button,
  Card,
  MicroLabel,
  FieldLabel,
  Select,
  Input,
  TextArea,
} from "../../components/atoms.jsx";
import {
  getExamCountdown,
  saveExamCountdown,
  DEFAULT_EXAM_COUNTDOWN,
} from "../../firebase/db.js";

const EXAM_TYPES = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];

export default function ExamSettings() {
  const [examType, setExamType] = useState(DEFAULT_EXAM_COUNTDOWN.examType);
  const [startDate, setStartDate] = useState(DEFAULT_EXAM_COUNTDOWN.startDate);
  const [endDate, setEndDate] = useState(DEFAULT_EXAM_COUNTDOWN.endDate);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getExamCountdown();
        if (!cancelled) {
          setExamType(s.examType);
          setStartDate(s.startDate);
          setEndDate(s.endDate);
          setLabel(s.label ?? "");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message ? `Settings load nahi hui: ${e.message}` : "Settings load nahi hui.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const valid = startDate && endDate && startDate <= endDate;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveExamCountdown({
        examType,
        startDate,
        endDate,
        label: label.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e?.message ? `Save nahi hua: ${e.message}` : "Save nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      active="exam"
      title="Exam Countdown"
      subtitle="Home page ka exam banner — yahin se control karo"
      badge={0}
    >
      {error && (
        <div className="mb-4 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-4 rounded-[10px] border border-moss/40 bg-moss/5 px-4 py-3 text-sm text-moss">
          Save ho gaya — Home page banner turant update ho jayega.
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-text-dim">Loading…</p>
      ) : (
        <Card className="max-w-xl p-4 md:p-5">
          <MicroLabel>Countdown settings</MicroLabel>

          <div className="mt-4 space-y-4">
            <div>
              <FieldLabel htmlFor="exam-type">Exam</FieldLabel>
              <Select
                id="exam-type"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="exam-start">Start date</FieldLabel>
                <Input
                  id="exam-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <FieldLabel htmlFor="exam-end">End date</FieldLabel>
                <Input
                  id="exam-end"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            {!valid && startDate && endDate && (
              <p className="text-[13px] text-brick">
                End date start date se pehle nahi ho sakti.
              </p>
            )}

            <div>
              <FieldLabel htmlFor="exam-label">
                Custom label <span className="text-text-dim">(optional)</span>
              </FieldLabel>
              <TextArea
                id="exam-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. 31 Oct – 6 Nov 2026 · sab slots"
                rows={2}
              />
              <p className="mt-1 text-xs text-text-dim">
                Khali chhodo to date range se auto-generate hoga.
              </p>
            </div>

            <Button
              onClick={save}
              disabled={saving || !valid}
              className="w-full"
            >
              {saving ? "Saving…" : "Save countdown"}
            </Button>
          </div>
        </Card>
      )}
    </AdminShell>
  );
}
