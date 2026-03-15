import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Lock } from "lucide-react";

const CRP_STAGES = {
  FORM: {
    label: "Exploration",
    tasks: [
      { step: 1,  name: "Hypothesize",          desc: "Clear hypothesis" },
      { step: 2,  name: "Collaborate & Research", desc: "Specific intel" },
      { step: 3,  name: "Architect",             desc: "First signal designed" },
      { step: 4,  name: "Synthesize",            desc: "Recognition confirmed" },
    ],
    // Purge-safe static strings
    border:    "border-indigo-500/40",
    bg:        "bg-indigo-950/30",
    bar:       "bg-indigo-400",
    icon:      "text-indigo-400",
    headerText:"text-indigo-300",
    activeBtnBorder: "border-indigo-500/50",
    activeBtnBg:     "bg-indigo-950/40",
  },
  STORM: {
    label: "Integration",
    tasks: [
      { step: 5,  name: "Develop",          desc: "Question sequence" },
      { step: 6,  name: "Build",             desc: "Core pain in their words" },
      { step: 7,  name: "Test End-to-End",   desc: "Shared problem confirmed" },
      { step: 8,  name: "Stage",             desc: "Proposal signal sent" },
    ],
    border:    "border-amber-600/40",
    bg:        "bg-amber-950/20",
    bar:       "bg-amber-400",
    icon:      "text-amber-400",
    headerText:"text-amber-300",
    activeBtnBorder: "border-amber-600/50",
    activeBtnBg:     "bg-amber-950/30",
  },
  NORM: {
    label: "Deployment",
    tasks: [
      { step: 9,  name: "Deploy",   desc: "Named proposal on table" },
      { step: 10, name: "Verify",   desc: "Objections surfaced" },
      { step: 11, name: "Monitor",  desc: "Certainty gap identified" },
      { step: 12, name: "Respond",  desc: "Certainty raised" },
    ],
    border:    "border-rose-500/40",
    bg:        "bg-rose-950/20",
    bar:       "bg-rose-400",
    icon:      "text-rose-400",
    headerText:"text-rose-300",
    activeBtnBorder: "border-rose-500/50",
    activeBtnBg:     "bg-rose-950/30",
  },
  PERFORM: {
    label: "Release & Learn",
    tasks: [
      { step: 13, name: "Release",   desc: "Direct ask made" },
      { step: 14, name: "Stabilize", desc: "Commitment confirmed" },
      { step: 15, name: "Measure",   desc: "Outcome vs. hypothesis" },
      { step: 16, name: "Learn",     desc: "Next cycle calibrated" },
    ],
    border:    "border-amber-400/30",
    bg:        "bg-amber-950/15",
    bar:       "bg-amber-300",
    icon:      "text-amber-300",
    headerText:"text-amber-200",
    activeBtnBorder: "border-amber-400/40",
    activeBtnBg:     "bg-amber-950/25",
  },
};

const STAGE_KEYS = ["FORM", "STORM", "NORM", "PERFORM"];

export default function CRPPipeline({ completedTasks: externalCompleted, initialStage, onToggleStep, highestCompleted = 0 }) {
  const isControlled = !!onToggleStep;
  const [selectedStage, setSelectedStage] = useState(initialStage || "FORM");
  const [internalCompleted, setInternalCompleted] = useState({});

  const completedTasks = isControlled ? (externalCompleted || {}) : internalCompleted;

  const config = CRP_STAGES[selectedStage];
  const totalSteps = 16;
  const totalCompleted = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = Math.round((totalCompleted / totalSteps) * 100);
  const stageCompletedCount = config.tasks.filter(t => completedTasks[t.step]).length;

  // Determine if the entire selected stage is locked (none of its steps are reachable)
  const stageFirstStep = config.tasks[0].step;
  const isStageLocked = stageFirstStep > highestCompleted + 1;
  const prevStageKey = STAGE_KEYS[STAGE_KEYS.indexOf(selectedStage) - 1];

  const toggleTask = (step) => {
    // Only allow completing the next sequential step
    if (step === highestCompleted + 1 || completedTasks[step]) {
      if (isControlled) {
        onToggleStep(step);
      } else {
        setInternalCompleted(prev => ({ ...prev, [step]: !prev[step] }));
      }
    }
  };

  return (
    <div className="space-y-3" role="region" aria-label="CRP pipeline stages">


      {/* Stage tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {STAGE_KEYS.map(stage => {
          const isActive = selectedStage === stage;
          return (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={cn(
                "px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                isActive
                  ? cn("border-b-2 pb-1.5", {
                      "border-indigo-400 text-indigo-300": stage === "FORM",
                      "border-amber-400 text-amber-300": stage === "STORM",
                      "border-rose-400 text-rose-300": stage === "NORM",
                      "border-yellow-300 text-yellow-200": stage === "PERFORM",
                    })
                  : "text-white/50 hover:text-white/70"
              )}
            >
              {stage}
            </button>
          );
        })}
      </div>

      {/* Stage Panel */}
      <div
        id={`crp-panel-${selectedStage}`}
        role="tabpanel"
        aria-label={`${selectedStage}: ${config.label}`}
        className={cn(
          "rounded-lg border p-3 space-y-3 transition-colors duration-200",
          config.bg, config.border
        )}
      >
        {/* Progress count - shows both stage and total */}
         <div className="flex justify-end gap-3">
           <span className={cn("text-xs font-bold tabular-nums", config.headerText)}>
             {stageCompletedCount}/{config.tasks.length}
           </span>
           <span className="text-xs font-bold tabular-nums text-white/40">
             {totalCompleted}/16
           </span>
         </div>

        {/* Progress bar - continuous across all 16 steps with spectrum gradient */}
        <div
          className="w-full h-2 rounded-full bg-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Total CRP progress"
        >
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-300"
            style={{ 
              width: `${progressPct}%`,
              boxShadow: `0 0 12px rgba(255, 255, 255, 0.2)`
            }}
          />
        </div>

        {/* Locked stage hint */}
        {isStageLocked && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-white/5 border border-white/10">
            <Lock className="w-3.5 h-3.5 shrink-0 text-white/40 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-white/40 leading-snug">
              Complete all steps in{" "}
              <span className="font-semibold text-white/60">{prevStageKey}</span>{" "}
              to unlock this stage. Steps must be completed sequentially.
            </p>
          </div>
        )}

        {/* Task grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {config.tasks.map((task) => {
            const isCompleted = !!completedTasks[task.step];
            const isAvailable = task.step === highestCompleted + 1 || isCompleted;
            return (
              <button
                key={task.step}
                onClick={() => toggleTask(task.step)}
                disabled={!isAvailable}
                aria-pressed={isCompleted}
                aria-label={`${task.name}${isCompleted ? ", completed" : isAvailable ? "" : ", locked"}`}
                title={task.desc}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-md",
                  "border min-h-[44px] transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
                  isCompleted
                    ? cn(config.bg, "border-white/30 shadow-lg hover:scale-105 active:scale-95 cursor-pointer", {
                      "shadow-indigo-500/20": selectedStage === "FORM",
                      "shadow-amber-500/20": selectedStage === "STORM",
                      "shadow-rose-500/20": selectedStage === "NORM",
                      "shadow-amber-400/20": selectedStage === "PERFORM",
                    })
                    : isAvailable
                    ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0 animate-pulse", config.icon)} aria-hidden="true" />
                ) : isAvailable ? (
                  <Circle className="w-3.5 h-3.5 shrink-0 text-white/50" aria-hidden="true" />
                ) : (
                  <Circle className="w-3.5 h-3.5 shrink-0 text-white/20" aria-hidden="true" />
                )}
                <p className={cn(
                  "text-xs font-semibold leading-tight text-center break-words w-full transition-all duration-300",
                  isCompleted ? "text-white/40 line-through" : isAvailable ? "text-white/80" : "text-white/30"
                )}>
                  {task.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}