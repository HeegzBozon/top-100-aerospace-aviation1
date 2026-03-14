import React from "react";
import { cn } from "@/lib/utils";

const MILESTONES = [
  { step: 1,  stage: "FORM",    name: "Hypothesize" },
  { step: 2,  stage: "FORM",    name: "Collaborate" },
  { step: 3,  stage: "FORM",    name: "Architect" },
  { step: 4,  stage: "FORM",    name: "Synthesize" },
  { step: 5,  stage: "STORM",   name: "Develop" },
  { step: 6,  stage: "STORM",   name: "Build" },
  { step: 7,  stage: "STORM",   name: "Test" },
  { step: 8,  stage: "STORM",   name: "Stage" },
  { step: 9,  stage: "NORM",    name: "Deploy" },
  { step: 10, stage: "NORM",    name: "Verify" },
  { step: 11, stage: "NORM",    name: "Monitor" },
  { step: 12, stage: "NORM",    name: "Respond" },
  { step: 13, stage: "PERFORM", name: "Release" },
  { step: 14, stage: "PERFORM", name: "Stabilize" },
  { step: 15, stage: "PERFORM", name: "Measure" },
  { step: 16, stage: "PERFORM", name: "Learn" },
];

// Purge-safe: static class strings
const STAGE_DOT_ACTIVE = {
  FORM:    "border-indigo-400 bg-indigo-400/30",
  STORM:   "border-amber-500 bg-amber-500/30",
  NORM:    "border-rose-400 bg-rose-400/30",
  PERFORM: "border-amber-300 bg-amber-300/30",
};

const STAGE_ICON_COLOR = {
  FORM:    "text-indigo-400",
  STORM:   "text-amber-500",
  NORM:    "text-rose-400",
  PERFORM: "text-amber-300",
};

// Stage label widths: 4 groups of 4 steps each = 25% each
const STAGE_LABELS = ["FORM", "STORM", "NORM", "PERFORM"];

export default function MilestoneTracker({ completedTasks = {} }) {
  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  return (
    <div className="space-y-2" role="group" aria-label="16-step pipeline progress">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300/60">
          Relationship Building Progress
        </p>
        <p className="text-xs font-bold tabular-nums text-amber-300/80">
          {completedCount}/16
        </p>
      </div>

      {/* Step dots row */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide pb-0.5">
        {MILESTONES.map((milestone, idx) => {
          const isCompleted = !!completedTasks[milestone.step];
          const isLast = idx === MILESTONES.length - 1;

          return (
            <React.Fragment key={milestone.step}>
              {/* Dot */}
              <div className="relative group flex-shrink-0">
                <div
                  role="img"
                  aria-label={`Step ${milestone.step}: ${milestone.name}${isCompleted ? " (completed)" : ""}`}
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                    isCompleted
                      ? STAGE_DOT_ACTIVE[milestone.stage]
                      : "border-white/20 bg-white/5"
                  )}
                >
                  {isCompleted && (
                    <div className={cn("w-2 h-2 rounded-full", {
                      "bg-indigo-400":  milestone.stage === "FORM",
                      "bg-amber-500":   milestone.stage === "STORM",
                      "bg-rose-400":    milestone.stage === "NORM",
                      "bg-amber-300":   milestone.stage === "PERFORM",
                    })} />
                  )}
                </div>

                {/* Tooltip */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                >
                  <div className="rounded px-2 py-1 text-xs font-semibold whitespace-nowrap bg-navy-950 border border-amber-300/20 text-amber-300/90 bg-slate-950">
                    {milestone.step}. {milestone.name}
                  </div>
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "flex-1 h-px min-w-0 transition-colors duration-300",
                    isCompleted
                      ? milestone.stage === "FORM"    ? "bg-indigo-400/50"
                      : milestone.stage === "STORM"   ? "bg-amber-500/50"
                      : milestone.stage === "NORM"    ? "bg-rose-400/50"
                      : "bg-amber-300/50"
                      : "bg-white/10"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage labels — evenly spaced under their 4 dots each */}
      <div aria-hidden="true" className="grid grid-cols-4 text-xs font-bold uppercase tracking-wider text-amber-300/50">
        {STAGE_LABELS.map(label => (
          <span key={label} className="truncate">{label}</span>
        ))}
      </div>
    </div>
  );
}