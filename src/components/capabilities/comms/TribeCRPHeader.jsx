import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import CRPPipeline from "./CRPPipeline";
import MilestoneTracker from "./MilestoneTracker";

const STAGE_ORDER = ["FORM", "STORM", "NORM", "PERFORM"];

// Derive which stage a given step belongs to
function stageForStep(step) {
  if (step <= 4)  return "FORM";
  if (step <= 8)  return "STORM";
  if (step <= 12) return "NORM";
  return "PERFORM";
}

export default function TribeCRPHeader({ conversation }) {
  const queryClient = useQueryClient();

  const completedSteps = conversation?.crp_completed_steps || [];
  const currentStage   = conversation?.rrf_stage || "FORM";

  // Build the completedTasks map expected by MilestoneTracker / CRPPipeline
  const completedTasksMap = completedSteps.reduce((acc, s) => {
    acc[s] = true;
    return acc;
  }, {});

  const updateConversation = useMutation({
    mutationFn: (patch) => base44.entities.Conversation.update(conversation.id, patch),
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

    // Auto-advance rrf_stage to match the highest completed step's stage
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative overflow-clip rounded-2xl p-4 md:p-5 bg-gradient-to-br from-[#1e3a5a] to-[#0f1f33]"
      role="region"
      aria-label="Tribe CRP Pipeline"
    >
      {/* Decorative glows */}
      <div aria-hidden="true" className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none bg-amber-400" />
      <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-5 pointer-events-none bg-amber-200" />

      <div className="relative z-10 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-amber-200 font-bold text-base border-2 border-amber-400/60 bg-amber-400/10"
            >
              ◆
            </motion.div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-300/50 leading-none mb-0.5">
                16-Step Pipeline
              </p>
              <h2 className="text-sm font-bold text-white leading-snug truncate">
                Continuous Relationship
              </h2>
            </div>
          </div>

          {/* Stage pill */}
          <div className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-400/30 text-amber-300 bg-amber-400/10">
            {currentStage}
          </div>
        </div>

        <div className="h-px bg-amber-400/10" aria-hidden="true" />

        {/* Live milestone tracker */}
        <MilestoneTracker completedTasks={completedTasksMap} />

        <div className="h-px bg-amber-400/10" aria-hidden="true" />

        {/* Live interactive CRP pipeline */}
        <CRPPipeline
          completedTasks={completedTasksMap}
          initialStage={currentStage}
          onToggleStep={handleToggleStep}
        />
      </div>
    </motion.div>
  );
}