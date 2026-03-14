import React, { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Conversation } from "@/entities/Conversation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import CRPPipeline from "./CRPPipeline";
import MilestoneTracker from "./MilestoneTracker";

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

export default function TribeCRPHeader({ conversation }) {
  const [expanded, setExpanded] = useState(true);
  const queryClient = useQueryClient();

  const completedSteps = conversation?.crp_completed_steps || [];
  const currentStage   = conversation?.rrf_stage || "FORM";
  const completedCount = completedSteps.length;
  const stageColor = STAGE_COLORS[currentStage] || STAGE_COLORS.FORM;

  const completedTasksMap = completedSteps.reduce((acc, s) => {
    acc[s] = true;
    return acc;
  }, {});

  const updateConversation = useMutation({
    mutationFn: (patch) => Conversation.update(conversation.id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["conversation", conversation.id]);
    },
  });

  const handleToggleStep = useCallback((step) => {
    const isCompleted = completedSteps.includes(step);
    const nextCompleted = isCompleted
      ? completedSteps.filter(s => s !== step)
      : [...completedSteps, step];
    const maxCompleted = nextCompleted.length ? Math.max(...nextCompleted) : 0;
    const nextStage = maxCompleted > 0 ? stageForStep(maxCompleted) : "FORM";
    updateConversation.mutate({
      crp_completed_steps: nextCompleted,
      crp_current_step: maxCompleted + 1,
      rrf_stage: nextStage,
    });
  }, [completedSteps, updateConversation]);

  if (!conversation) return null;

  return (
    <div
      className="border-b border-white/10 bg-gradient-to-r from-[#0f1f33]/80 to-[#1e3a5a]/60 backdrop-blur-sm"
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
              completedCount === 0  && "w-0",
              completedCount === 1  && "w-[6%]",
              completedCount === 2  && "w-[13%]",
              completedCount === 3  && "w-[19%]",
              completedCount === 4  && "w-[25%]",
              completedCount === 5  && "w-[31%]",
              completedCount === 6  && "w-[38%]",
              completedCount === 7  && "w-[44%]",
              completedCount === 8  && "w-[50%]",
              completedCount === 9  && "w-[56%]",
              completedCount === 10 && "w-[63%]",
              completedCount === 11 && "w-[69%]",
              completedCount === 12 && "w-[75%]",
              completedCount === 13 && "w-[81%]",
              completedCount === 14 && "w-[88%]",
              completedCount === 15 && "w-[94%]",
              completedCount === 16 && "w-full",
            )}
          />
        </div>

        {/* Stage pill */}
        <span className={cn(
          "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
          stageColor.pill
        )}>
          {currentStage}
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
        <div
          id="crp-panel"
          className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5"
        >
          <MilestoneTracker completedTasks={completedTasksMap} />
          <div className="h-px bg-white/5" aria-hidden="true" />
          <CRPPipeline
            completedTasks={completedTasksMap}
            initialStage={currentStage}
            onToggleStep={handleToggleStep}
          />
        </div>
      )}
    </div>
  );
}