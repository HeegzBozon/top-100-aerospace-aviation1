import React, { useCallback, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import CRPPipeline from "./CRPPipeline";
import MilestoneTracker from "./MilestoneTracker";
import { useCommsTheme } from "@/components/contexts/CommsThemeContext";

function stageForStep(step) {
  if (step <= 4)  return "FORM";
  if (step <= 8)  return "STORM";
  if (step <= 12) return "NORM";
  return "PERFORM";
}

const STAGE_COLORS = {
  FORM:    { pill: "border-indigo-500/40 text-indigo-300 bg-indigo-500/10", bar: "bg-indigo-400/30" },
  STORM:   { pill: "border-amber-500/40 text-amber-300 bg-amber-500/10",   bar: "bg-amber-400/30" },
  NORM:    { pill: "border-rose-500/40 text-rose-300 bg-rose-500/10",       bar: "bg-rose-400/30" },
  PERFORM: { pill: "border-amber-400/40 text-amber-200 bg-amber-400/10",   bar: "bg-amber-300/30" },
};

const PROGRESS_WIDTHS = ["w-0","w-[6%]","w-[13%]","w-[19%]","w-[25%]","w-[31%]","w-[38%]","w-[44%]","w-[50%]","w-[56%]","w-[63%]","w-[69%]","w-[75%]","w-[81%]","w-[88%]","w-[94%]","w-full"];

export default function TribeCRPHeader({ conversation }) {
  const [expanded, setExpanded] = useState(true);
  const { theme } = useCommsTheme();
  const queryClient = useQueryClient();

  // --- Optimistic local state so clicks update instantly ---
  const [localCompleted, setLocalCompleted] = useState(
    () => (conversation?.crp_completed_steps || []).map(Number)
  );

  // Sync when the conversation prop changes (e.g. after remote refresh)
  useEffect(() => {
    setLocalCompleted((conversation?.crp_completed_steps || []).map(Number));
  }, [conversation?.crp_completed_steps]);

  const localStage = localCompleted.length
    ? stageForStep(Math.max(...localCompleted))
    : "FORM";

  const completedCount = localCompleted.length;
  const stageColor = STAGE_COLORS[localStage] || STAGE_COLORS.FORM;

  const completedTasksMap = localCompleted.reduce((acc, s) => {
    acc[s] = true;
    return acc;
  }, {});

  const updateConversation = useMutation({
    mutationFn: (patch) => base44.entities.Conversation.update(conversation.id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleToggleStep = useCallback((step) => {
    const stepNum = Number(step);
    const isCompleted = localCompleted.includes(stepNum);
    const nextCompleted = isCompleted
      ? localCompleted.filter(s => s !== stepNum)
      : [...localCompleted, stepNum];
    const maxCompleted = nextCompleted.length ? Math.max(...nextCompleted) : 0;
    const nextStage = maxCompleted > 0 ? stageForStep(maxCompleted) : "FORM";

    // Optimistic update first
    setLocalCompleted(nextCompleted);

    // Then persist
    updateConversation.mutate({
      crp_completed_steps: nextCompleted,
      crp_current_step: maxCompleted + 1,
      rrf_stage: nextStage,
    });
  }, [localCompleted, updateConversation]);

  if (!conversation) return null;

  return (
    <div
      style={{ background: theme.crpBg, borderColor: theme.crpBorder }}
      className="border-b backdrop-blur-sm"
      role="region"
      aria-label="CRP Pipeline"
    >
      {/* Collapsed bar — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        aria-expanded={expanded}
        aria-controls="crp-panel"
      >
        {/* Progress bar track */}
        <div className="relative flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              stageColor.bar,
              PROGRESS_WIDTHS[Math.min(completedCount, 16)]
            )}
          />
        </div>

        {/* Stage pill */}
        <span className={cn(
          "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
          stageColor.pill
        )}>
          {localStage}
        </span>

        {/* Step count */}
        <span className="shrink-0 text-[10px] font-bold tabular-nums text-white/40">
          {completedCount}/16
        </span>

        <ChevronDown
          className={cn("w-3.5 h-3.5 text-white/30 transition-transform duration-300 shrink-0", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div id="crp-panel" className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5">
          <MilestoneTracker completedTasks={completedTasksMap} />
          <div className="h-px bg-white/5" aria-hidden="true" />
          <CRPPipeline
            completedTasks={completedTasksMap}
            initialStage={localStage}
            onToggleStep={handleToggleStep}
          />
        </div>
      )}
    </div>
  );
}