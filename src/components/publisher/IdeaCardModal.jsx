import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { X, Trash2, Save, Lightbulb } from "lucide-react";

const PLATFORMS = ["linkedin", "instagram", "threads", "all"];
const PRIORITIES = ["low", "medium", "high"];

export default function IdeaCardModal({ idea, defaultStage, userEmail, stages, onClose }) {
  const isEditing = !!idea;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title:        idea?.title        || "",
    body:         idea?.body         || "",
    stage:        idea?.stage        || defaultStage,
    platform:     idea?.platform     || "linkedin",
    priority:     idea?.priority     || "medium",
    tags:         idea?.tags?.join(", ") || "",
    review_notes: idea?.review_notes || "",
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        user_email: userEmail,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "rgba(201,168,124,0.6)" }}>
              Title / Hook *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="What's the big idea?"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all min-h-[44px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(232,220,200,0.9)",
              }}
              autoFocus
            />
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
              rows={5}
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
              disabled={!form.title.trim() || saveMutation.isPending}
              className="gap-2 min-h-[40px] text-xs font-bold rounded-xl border-0"
              style={{
                background: "linear-gradient(135deg, #c9a87c 0%, #b8935c 100%)",
                color: "#0b1120",
                boxShadow: "0 4px 14px rgba(201,168,124,0.2)",
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