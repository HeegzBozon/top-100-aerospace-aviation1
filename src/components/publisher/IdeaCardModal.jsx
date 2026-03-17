import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { X, Trash2, Save, Lightbulb, Plus, Minus, Info } from "lucide-react";

const PLATFORMS = ["linkedin", "instagram", "threads", "all"];
const PRIORITIES = ["low", "medium", "high"];
const MAX_PITCH_SENTENCES = 5;

const PITCH_HINTS = [
  "Who is this for and what problem do they have?",
  "What's the insight or surprising truth you're sharing?",
  "Why does it matter right now — what's the stakes?",
  "What will the reader walk away knowing or feeling?",
  "What's your call to action or invitation?",
];

function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export default function IdeaCardModal({ idea, defaultStage, userEmail, stages, onClose }) {
  const isEditing = !!idea;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title:           idea?.title            || "",
    elevator_pitch:  idea?.elevator_pitch?.length ? idea.elevator_pitch : [""],
    body:            idea?.body             || "",
    stage:           idea?.stage            || defaultStage,
    platform:        idea?.platform         || "linkedin",
    priority:        idea?.priority         || "medium",
    tags:            idea?.tags?.join(", ") || "",
    review_notes:    idea?.review_notes     || "",
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const titleWordCount = useMemo(() => countWords(form.title), [form.title]);
  const titleValid     = titleWordCount === 6;
  const titleColor     = titleWordCount === 0
    ? "rgba(255,255,255,0.08)"
    : titleValid
      ? "rgba(109,191,138,0.5)"
      : "rgba(224,122,95,0.5)";

  // Elevator pitch helpers
  const setPitchLine = (idx, val) => {
    const updated = [...form.elevator_pitch];
    updated[idx] = val;
    set("elevator_pitch", updated);
  };
  const addPitchLine = () => {
    if (form.elevator_pitch.length < MAX_PITCH_SENTENCES) {
      set("elevator_pitch", [...form.elevator_pitch, ""]);
    }
  };
  const removePitchLine = (idx) => {
    if (form.elevator_pitch.length <= 1) return;
    set("elevator_pitch", form.elevator_pitch.filter((_, i) => i !== idx));
  };

  const pitchValid = form.elevator_pitch[0]?.trim().length > 0;

  const canSave = titleValid && pitchValid;

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        user_email: userEmail,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        elevator_pitch: form.elevator_pitch.filter(s => s.trim()),
      };
      return isEditing
        ? base44.entities.ContentIdea.update(idea.id, payload)
        : base44.entities.ContentIdea.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-ideas", userEmail] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.ContentIdea.delete(idea.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-ideas", userEmail] });
      onClose();
    },
  });

  const activeStage = stages.find(s => s.id === form.stage);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Edit idea" : "New idea"}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92vh] overflow-hidden border"
        style={{
          background: "linear-gradient(160deg, #101828 0%, #0f1a2e 100%)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: activeStage?.bg, border: `1px solid ${activeStage?.border}` }}
            >
              <Lightbulb className="w-3.5 h-3.5" style={{ color: activeStage?.color }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: "rgba(232,220,200,0.85)" }}>
              {isEditing ? "Edit Idea" : "New Idea"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "rgba(232,220,200,0.4)" }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Six-Word Story */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(201,168,124,0.6)" }}>
                Six-Word Story <span style={{ color: "rgba(201,168,124,0.9)" }}>*</span>
              </label>
              <span
                className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full transition-colors"
                style={{
                  background: titleColor,
                  color: titleValid ? "#6dbf8a" : titleWordCount === 0 ? "rgba(232,220,200,0.3)" : "#e07a5f",
                }}
              >
                {titleWordCount} / 6 words
              </span>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Rockets built by ordinary determined people"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all min-h-[44px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${titleColor}`,
                color: "rgba(232,220,200,0.9)",
              }}
              autoFocus
              aria-describedby="title-hint"
            />
            <p id="title-hint" className="mt-1 text-[10px]" style={{ color: "rgba(232,220,200,0.25)" }}>
              Hemingway's constraint: six words, one complete story. Your scroll-stopper.
            </p>
          </div>

          {/* Elevator Pitch */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(201,168,124,0.6)" }}>
                Elevator Pitch <span style={{ color: "rgba(201,168,124,0.9)" }}>*</span>
              </label>
              <span className="text-[10px]" style={{ color: "rgba(232,220,200,0.25)" }}>
                {form.elevator_pitch.filter(s => s.trim()).length} / {MAX_PITCH_SENTENCES} sentences
              </span>
            </div>

            {/* Hint banner */}
            <div
              className="flex items-start gap-2 rounded-xl p-3 mb-3"
              style={{ background: "rgba(123,159,212,0.07)", border: "1px solid rgba(123,159,212,0.15)" }}
            >
              <Info className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "rgba(123,159,212,0.7)" }} />
              <p className="text-[10px] leading-relaxed" style={{ color: "rgba(123,159,212,0.7)" }}>
                Craft up to 5 sentences that answer: <em>Who is it for? What's the insight? Why now? What will they learn? What's the CTA?</em>
              </p>
            </div>

            <div className="space-y-2">
              {form.elevator_pitch.map((sentence, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1 pt-2.5 shrink-0">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: idx === 0 ? "rgba(201,168,124,0.2)" : "rgba(255,255,255,0.05)",
                        color: idx === 0 ? "#c9a87c" : "rgba(232,220,200,0.3)",
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={sentence}
                      onChange={e => setPitchLine(idx, e.target.value)}
                      placeholder={PITCH_HINTS[idx]}
                      rows={2}
                      className="w-full rounded-xl px-3 py-2 text-xs outline-none resize-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: idx === 0 && !sentence.trim()
                          ? "1px solid rgba(224,122,95,0.3)"
                          : "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(232,220,200,0.85)",
                      }}
                      aria-label={`Pitch sentence ${idx + 1}`}
                    />
                  </div>
                  {form.elevator_pitch.length > 1 && (
                    <button
                      onClick={() => removePitchLine(idx)}
                      className="w-7 h-7 mt-2 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 shrink-0"
                      style={{ color: "rgba(224,100,100,0.5)" }}
                      aria-label="Remove sentence"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {form.elevator_pitch.length < MAX_PITCH_SENTENCES && (
              <button
                onClick={addPitchLine}
                className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5 min-h-[32px]"
                style={{ color: "rgba(201,168,124,0.5)" }}
              >
                <Plus className="w-3 h-3" />
                Add sentence
              </button>
            )}
          </div>

          {/* Body */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "rgba(201,168,124,0.6)" }}>
              Content / Notes
            </label>
            <textarea
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Draft copy, talking points, research links…"
              rows={4}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(232,220,200,0.9)",
              }}
            />
          </div>

          {/* Stage + Platform + Priority row */}
          <div className="grid grid-cols-3 gap-3">
            <FieldGroup label="Stage">
              <select
                value={form.stage}
                onChange={e => set("stage", e.target.value)}
                className="w-full rounded-xl px-2 py-2 text-xs outline-none min-h-[40px]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,220,200,0.8)" }}
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Platform">
              <select
                value={form.platform}
                onChange={e => set("platform", e.target.value)}
                className="w-full rounded-xl px-2 py-2 text-xs outline-none min-h-[40px] capitalize"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,220,200,0.8)" }}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Priority">
              <select
                value={form.priority}
                onChange={e => set("priority", e.target.value)}
                className="w-full rounded-xl px-2 py-2 text-xs outline-none min-h-[40px] capitalize"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,220,200,0.8)" }}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </FieldGroup>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "rgba(201,168,124,0.6)" }}>
              Tags <span className="normal-case font-normal" style={{ color: "rgba(232,220,200,0.25)" }}>(comma separated)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={e => set("tags", e.target.value)}
              placeholder="thought-leadership, season4, launch…"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(232,220,200,0.9)",
              }}
            />
          </div>

          {/* Review Notes — show when in review or revisions */}
          {(form.stage === "in_review" || form.stage === "revisions") && (
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#e07a5f" }}>
                Review Notes
              </label>
              <textarea
                value={form.review_notes}
                onChange={e => set("review_notes", e.target.value)}
                placeholder="What needs to change? Specific feedback…"
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  background: "rgba(224,122,95,0.06)",
                  border: "1px solid rgba(224,122,95,0.2)",
                  color: "rgba(232,220,200,0.9)",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 border-t shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          {isEditing ? (
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors hover:bg-red-500/10 min-h-[40px]"
              style={{ color: "rgba(224,100,100,0.7)" }}
              aria-label="Delete idea"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-h-[40px] text-xs rounded-xl"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(232,220,200,0.5)", background: "transparent" }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!canSave || saveMutation.isPending}
              className="gap-2 min-h-[40px] text-xs font-bold rounded-xl border-0"
              style={{
                background: canSave
                  ? "linear-gradient(135deg, #c9a87c 0%, #b8935c 100%)"
                  : "rgba(255,255,255,0.06)",
                color: canSave ? "#0b1120" : "rgba(232,220,200,0.2)",
                boxShadow: canSave ? "0 4px 14px rgba(201,168,124,0.2)" : "none",
              }}
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Idea"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "rgba(201,168,124,0.6)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}