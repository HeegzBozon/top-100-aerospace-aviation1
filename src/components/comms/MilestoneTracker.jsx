import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Sparkle animation styles
const SPARKLE_STYLES = `
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scale(1) translate(var(--tx), var(--ty)); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(217, 119, 6, 0.6), inset 0 0 6px rgba(217, 119, 6, 0.3); }
  50% { box-shadow: 0 0 16px rgba(217, 119, 6, 1), inset 0 0 12px rgba(217, 119, 6, 0.5); }
}

@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.sparkle { animation: sparkle 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
`;

if (typeof document !== 'undefined' && !document.getElementById('milestone-sparkle-styles')) {
  const style = document.createElement('style');
  style.id = 'milestone-sparkle-styles';
  style.textContent = SPARKLE_STYLES;
  document.head.appendChild(style);
}

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

// Rose-gold + vibrant spectrum for completed dots
const STAGE_DOT_ACTIVE = {
  FORM:    "border-indigo-300 bg-indigo-400/40 shadow-lg shadow-indigo-400/50",
  STORM:   "border-amber-400 bg-amber-500/40 shadow-lg shadow-amber-400/60",
  NORM:    "border-rose-300 bg-rose-400/40 shadow-lg shadow-rose-400/50",
  PERFORM: "border-yellow-300 bg-yellow-400/30 shadow-lg shadow-yellow-300/50",
};

// Rose-gold glow for active/focused dots
const STAGE_DOT_GLOW = {
  FORM:    "shadow-lg shadow-indigo-400/80",
  STORM:   "shadow-lg shadow-amber-400/80",
  NORM:    "shadow-lg shadow-rose-400/80",
  PERFORM: "shadow-lg shadow-yellow-300/80",
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
  const [sparkles, setSparkles] = useState([]);

  // Trigger sparkle burst when progress increases
  useEffect(() => {
    if (completedCount > 0) {
      const newSparkles = Array.from({ length: 6 }).map(() => ({
        id: Math.random(),
        left: Math.random() * 100,
        top: Math.random() * 50 - 25,
      }));
      setSparkles(newSparkles);
      const timer = setTimeout(() => setSparkles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [completedCount]);

  return (
    <div className="space-y-2" role="group" aria-label="16-step pipeline progress">
      {/* Header with sparkle container */}
      <div className="flex items-center justify-between relative">
        <p className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-transparent">
          Relationship Building Progress
        </p>
        <div className="relative">
          <p className="text-xs font-bold tabular-nums text-rose-300 drop-shadow-lg">
            {completedCount}/16
          </p>
          {sparkles.map(sparkle => (
            <div
              key={sparkle.id}
              className="sparkle absolute pointer-events-none text-rose-300"
              style={{
                left: `${sparkle.left}%`,
                top: `${sparkle.top}px`,
                '--tx': `${(Math.random() - 0.5) * 60}px`,
                '--ty': `${(Math.random() - 0.5) * 60}px`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>

      {/* Step dots row */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide pb-0.5">
        {MILESTONES.map((milestone, idx) => {
          const isCompleted = !!completedTasks[milestone.step];
          const isLast = idx === MILESTONES.length - 1;

          return (
            <React.Fragment key={milestone.step}>
              {/* Dot with animations */}
              <div className="relative group flex-shrink-0">
                <div
                  role="img"
                  aria-label={`Step ${milestone.step}: ${milestone.name}${isCompleted ? " (completed)" : ""}`}
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-default",
                    isCompleted
                      ? cn(STAGE_DOT_ACTIVE[milestone.stage], "bounce-in group-hover:pulse-glow")
                      : "border-white/20 bg-white/5 group-hover:border-white/40 group-hover:bg-white/10"
                  )}
                >
                  {isCompleted && (
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", {
                      "bg-indigo-300":  milestone.stage === "FORM",
                      "bg-amber-400":   milestone.stage === "STORM",
                      "bg-rose-300":    milestone.stage === "NORM",
                      "bg-yellow-300":  milestone.stage === "PERFORM",
                    })} />
                  )}
                </div>

                {/* Tooltip with rose-gold styling */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                >
                  <div className="rounded px-2 py-1 text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-rose-900/90 to-amber-900/90 border border-rose-400/40 text-rose-100 backdrop-blur-sm">
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


    </div>
  );
}