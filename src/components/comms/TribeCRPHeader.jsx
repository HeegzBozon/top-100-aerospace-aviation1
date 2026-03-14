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

export default function TribeCRPHeader({ conversation, isExpanded = false, onToggleExpand }) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [selectedStage, setSelectedStage] = useState("FORM");
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

  const handleToggle = () => {
    setExpanded(v => !v);
    onToggleExpand?.();
  };

  const handleDotClick = () => {
    // Dots only expand, never collapse
    if (!expanded) {
      setExpanded(true);
      onToggleExpand?.();
    }
  };

  return (
    <div
      style={{ background: theme.crpBg, borderColor: theme.crpBorder }}
      className="backdrop-blur-sm"
      role="region"
      aria-label="CRP Pipeline"
    >
      {/* Always-visible milestone timeline - only collapse on outer area, dots expand only */}
      <div
        className="px-4 py-3"
        aria-expanded={expanded}
        aria-controls="crp-panel"
      >
        <div
          onClick={handleToggle}
          className="cursor-pointer hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
        >
          <MilestoneTracker completedTasks={completedTasksMap} selectedStage={selectedStage} onStageSelect={setSelectedStage} onClickDot={(e) => {
            e.stopPropagation();
            handleDotClick();
          }} />
        </div>
      </div>

      {/* Expanded panel with CRP details */}
      {expanded && (
        <div id="crp-panel" className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5">
          <div className="h-px bg-white/5" aria-hidden="true" />
          <CRPPipeline
            completedTasks={completedTasksMap}
            initialStage={selectedStage}
            onToggleStep={handleToggleStep}
          />
        </div>
      )}

    </div>
  );
}