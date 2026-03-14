import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

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

export default function CRPPipeline({ completedTasks: externalCompleted, initialStage, onToggleStep }) {
  const isControlled = !!onToggleStep;
  const [selectedStage, setSelectedStage] = useState(initialStage || "FORM");
  const [internalCompleted, setInternalCompleted] = useState({});

  const completedTasks = isControlled ? (externalCompleted || {}) : internalCompleted;

  const config = CRP_STAGES[selectedStage];
  // Track total progress across ALL 16 steps, not just current stage
  const totalSteps = 16;
  const totalCompleted = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = Math.round((totalCompleted / totalSteps) * 100);
  const stageCompletedCount = config.tasks.filter(t => completedTasks[t.step]).length;

  const toggleTask = (step) => {
    if (isControlled) {
      onToggleStep(step);
    } else {
      setInternalCompleted(prev => ({ ...prev, [step]: !prev[step] }));
    }
  };

  return (
    <div className="space-y-3" role="region" aria-label="CRP pipeline stages">


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

        {/* Task grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {config.tasks.map((task) => {
            const isCompleted = !!completedTasks[task.step];
            return (
              <button
                key={task.step}
                onClick={() => toggleTask(task.step)}
                aria-pressed={isCompleted}
                aria-label={`${task.name}${isCompleted ? ", completed" : ""}`}
                title={task.desc}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-md",
                  "border min-h-[44px] transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
                  "hover:scale-105 active:scale-95",
                  isCompleted
                    ? cn(config.bg, "border-white/30 shadow-lg", {
                      "shadow-indigo-500/20": selectedStage === "FORM",
                      "shadow-amber-500/20": selectedStage === "STORM",
                      "shadow-rose-500/20": selectedStage === "NORM",
                      "shadow-amber-400/20": selectedStage === "PERFORM",
                    })
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0 animate-pulse", config.icon)} aria-hidden="true" />
                ) : (
                  <Circle className="w-3.5 h-3.5 shrink-0 text-white/30" aria-hidden="true" />
                )}
                <p className={cn(
                  "text-xs font-semibold leading-tight text-center break-words w-full transition-all duration-300",
                  isCompleted ? "text-white/40 line-through" : "text-white/80 group-hover:text-white/100"
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