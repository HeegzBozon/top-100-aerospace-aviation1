import React, { useCallback, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import CRPPipeline from "./CRPPipeline";
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

// Vibrant spectrum gradient — high contrast, changes through progression
const SPECTRUM_GRADIENTS = [
  "from-indigo-500 via-indigo-500 to-indigo-500",      // 0/16 - indigo
  "from-indigo-500 via-purple-500 to-indigo-500",      // 1/16
  "from-purple-500 via-violet-500 to-purple-500",      // 2/16
  "from-violet-500 via-fuchsia-500 to-violet-500",     // 3/16
  "from-fuchsia-500 via-pink-500 to-fuchsia-500",      // 4/16 - pink
  "from-pink-500 via-rose-500 to-pink-500",            // 5/16
  "from-rose-500 via-red-500 to-rose-500",             // 6/16
  "from-red-500 via-orange-500 to-red-500",            // 7/16 - red-orange
  "from-orange-500 via-amber-500 to-orange-500",       // 8/16 - orange
  "from-amber-500 via-yellow-400 to-amber-500",        // 9/16
  "from-yellow-400 via-lime-400 to-yellow-400",        // 10/16
  "from-lime-400 via-green-500 to-lime-400",           // 11/16
  "from-green-500 via-emerald-500 to-green-500",       // 12/16 - green
  "from-emerald-500 via-teal-500 to-emerald-500",      // 13/16
  "from-teal-500 via-cyan-500 to-teal-500",            // 14/16
  "from-cyan-500 via-blue-500 to-cyan-500",            // 15/16
  "from-blue-500 via-indigo-500 to-blue-500",          // 16/16 - blue-indigo
];

export default function TribeCRPHeader({ conversation }) {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useCommsTheme();
  const queryClient = useQueryClient();

  const [localCompleted, setLocalCompleted] = useState(
    () => (conversation?.crp_completed_steps || []).map(Number)
  );

  useEffect(() => {
    setLocalCompleted((conversation?.crp_completed_steps || []).map(Number));
  }, [conversation?.crp_completed_steps]);

  const completedTasksMap = localCompleted.reduce((acc, s) => {
    acc[s] = true;
    return acc;
  }, {});

  // Find the highest completed step to determine which steps are available
  const highestCompleted = localCompleted.length ? Math.max(...localCompleted) : 0;

  const totalCompleted = localCompleted.length;
  const stageColor = STAGE_COLORS.FORM;

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

    setLocalCompleted(nextCompleted);
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
      className="backdrop-blur-sm"
      role="region"
      aria-label="CRP Pipeline"
    >
      {/* Header - always visible, clickable to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
        aria-expanded={expanded}
        aria-controls="crp-expanded-panel"
      >
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-bold uppercase tracking-wider", stageColor.pill)}>
            Progress: {totalCompleted}/16
          </span>
          <span className="text-xs text-white/50">{expanded ? "▼" : "▶"}</span>
        </div>

        {/* Progress bar with stage dots */}
        <div className="mt-3 space-y-2">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-300"
              style={{ 
                width: `${Math.round((totalCompleted / 16) * 100)}%`,
                boxShadow: `0 0 12px rgba(255, 255, 255, 0.2)`
              }}
            />
            {/* Stage dots on progress bar */}
            {["FORM", "STORM", "NORM", "PERFORM"].map((stage, idx) => {
              const dotPos = ((idx + 1) * 25);
              const isComplete = stageComplete[stage];
              const isUnlocked = unlockedStages.includes(stage);
              return (
                <div
                  key={stage}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-300",
                    isComplete
                      ? "border-white/80 bg-white/40 shadow-lg shadow-white/50"
                      : isUnlocked
                      ? "border-white/50 bg-white/20"
                      : "border-white/20 bg-white/5"
                  )}
                  style={{ left: `${dotPos}%`, transform: "translate(-50%, -50%)" }}
                  title={`${stage}: ${isComplete ? "Complete" : isUnlocked ? "Unlocked" : "Locked"}`}
                  aria-hidden="true"
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>FORM</span>
            <span>STORM</span>
            <span>NORM</span>
            <span>PERFORM</span>
          </div>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div id="crp-expanded-panel" className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5">
          <CRPPipeline
            completedTasks={completedTasksMap}
            initialStage="FORM"
            onToggleStep={handleToggleStep}
            highestCompleted={highestCompleted}
          />
        </div>
      )}
    </div>
  );
}