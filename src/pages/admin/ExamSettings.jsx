/**
 * PaperVault — Admin Exam Countdown Settings (Direction A "Archive Noir").
 * 100% original. Mobile-first.
 * Route: /admin/exam
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
  getModerationMode,
  saveModerationMode,
  DEFAULT_MODERATION,
} from "../../firebase/db.js";

const EXAM_TYPES = ["CAT-1", "CAT-2", "FAT", "Lab FAT"];
const MODES = [
  { id: "ai", label: "AI", hint: "AI unique papers ko auto-approve karega (admin queue me AI badge ke saath aayega)." },
  { id: "manual", label: "Manual", hint: "Har upload admin approve karega — AI sirf duplicate check karega." },
];

export default function ExamSettings() {
  const [examType, setExamType] = useState(DEFAULT_EXAM_COUNTDOWN.examType);
  const [startDate, setStartDate] = useState(DEFAULT_EXAM_COUNTDOWN.startDate);
  const [endDate, setEndDate] = useState(DEFAULT_EXAM_COUNTDOWN.endDate);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Moderation mode (AI vs Manual)
  const [mode, setMode] = useState(DEFAULT_MODERATION.mode);
  const [modeSaving, setModeSaving] = useState(false);
  const [modeSaved, setModeSaved] = useState(false);
  const [modeError, setModeError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, m] = await Promise.all([getExamCountdown(), getModerationMode()]);
        if (!cancelled) {
          setExamType(s.examType);
          setStartDate(s.startDate);
          setEndDate(s.endDate);
          setLabel(s.label ?? "");
          setMode(m.mode === "manual" ? "manual" : "ai");
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

  const saveMode = async (next) => {
    if (modeSaving || next === mode) return;
    setModeSaving(true);
    setModeError("");
    setModeSaved(false);
    try {
      await saveModerationMode(next);
      setMode(next);
      setModeSaved(true);
      setTimeout(() => setModeSaved(false), 2500);
    } catch (e) {
      setModeError(e?.message ? `Mode save nahi hua: ${e.message}` : "Mode save nahi hua.");
    } finally {
      setModeSaving(false);
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

      {!loading && (
        <Card className="mt-4 max-w-xl p-4 md:p-5">
          <MicroLabel>Moderation mode</MicroLabel>
          <p className="mt-1 text-xs text-text-dim">
            Upload ke baad paper kaise approve hoga — AI ya manual?
          </p>

          {modeError && (
            <div className="mt-3 rounded-[10px] border border-brick/40 bg-brick/5 px-4 py-3 text-sm text-brick">
              {modeError}
            </div>
          )}
          {modeSaved && (
            <div className="mt-3 rounded-[10px] border border-moss/40 bg-moss/5 px-4 py-3 text-sm text-moss">
              Mode save ho gaya — naye uploads isi mode se honge.
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {MODES.map((m) => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => saveMode(m.id)}
                  disabled={modeSaving}
                  aria-pressed={isActive}
                  className={`rounded-[10px] border p-3.5 text-left transition-colors ${
                    isActive
                      ? "border-accent bg-accent/10"
                      : "border-hairline bg-surface-plus hover:border-text-dim"
                  }`}
                >
                  <p className={`text-sm font-bold ${isActive ? "text-accent" : "text-text"}`}>
                    {m.label}
                    {isActive && modeSaving && "…"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-text-dim">{m.hint}</p>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-text-dim">
            Note: Gemini fail ho jaye ya key na ho to upload hamesha manual review me jayega — chahe mode kuch bhi ho.
          </p>
        </Card>
      )}
    </AdminShell>
  );
}
