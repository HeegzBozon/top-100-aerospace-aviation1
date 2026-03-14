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

const STAGES = [
  { stage: "FORM",    name: "Form" },
  { stage: "STORM",   name: "Storm" },
  { stage: "NORM",    name: "Norm" },
  { stage: "PERFORM", name: "Perform" },
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

// Spectrum gradient fills aligned with milestone progress
const SPECTRUM_GRADIENT_WIDTHS = ["w-0","w-[6%]","w-[13%]","w-[19%]","w-[25%]","w-[31%]","w-[38%]","w-[44%]","w-[50%]","w-[56%]","w-[63%]","w-[69%]","w-[75%]","w-[81%]","w-[88%]","w-[94%]","w-full"];

const SPECTRUM_GRADIENTS = [
  "from-indigo-500 via-indigo-500 to-indigo-500",
  "from-indigo-500 via-purple-500 to-indigo-500",
  "from-purple-500 via-violet-500 to-purple-500",
  "from-violet-500 via-fuchsia-500 to-violet-500",
  "from-fuchsia-500 via-pink-500 to-fuchsia-500",
  "from-pink-500 via-rose-500 to-pink-500",
  "from-rose-500 via-red-500 to-rose-500",
  "from-red-500 via-orange-500 to-red-500",
  "from-orange-500 via-amber-500 to-orange-500",
  "from-amber-500 via-yellow-400 to-amber-500",
  "from-yellow-400 via-lime-400 to-yellow-400",
  "from-lime-400 via-green-500 to-lime-400",
  "from-green-500 via-emerald-500 to-green-500",
  "from-emerald-500 via-teal-500 to-emerald-500",
  "from-teal-500 via-cyan-500 to-teal-500",
  "from-cyan-500 via-blue-500 to-cyan-500",
  "from-blue-500 via-indigo-500 to-blue-500",
];

const GLOW_COLORS = ["#6366f1","#a855f7","#8b5cf6","#d946ef","#ec4899","#f43f5e","#ef4444","#f97316","#f59e0b","#facc15","#84cc16","#22c55e","#10b981","#14b8a6","#06b6d4","#3b82f6","#6366f1"];

export default function MilestoneTracker({ completedTasks = {}, onStageSelect, selectedStage }) {
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const completedStages = new Set(Object.entries(completedTasks).filter(([_, isCompleted]) => isCompleted).map(([step]) => {
    const stepNum = Number(step);
    if (stepNum <= 4) return "FORM";
    if (stepNum <= 8) return "STORM";
    if (stepNum <= 12) return "NORM";
    return "PERFORM";
  }));
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
    <div className="space-y-2" role="group" aria-label="4-stage pipeline progress">
      {/* Header with sparkle container */}
      <div className="flex items-center justify-between relative">
        <p className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-transparent">
          Relationship Building Progress
        </p>
        <div className="relative">
          <p className="text-xs font-bold tabular-nums text-rose-300 drop-shadow-lg">
            {completedStages.size}/4
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

      {/* Unified progress bar flowing through 4 stage dots - equal distribution */}
      <div className="flex items-center w-full">
        {STAGES.map((stageItem, idx) => {
          const isStageCompleted = completedStages.has(stageItem.stage);
          const isLast = idx === STAGES.length - 1;
          const isSelected = selectedStage === stageItem.stage;

          return (
            <React.Fragment key={stageItem.stage}>
              {/* Stage dot - clickable */}
              <div className="flex-1 flex justify-start">
                <button
                  onClick={() => onStageSelect?.(stageItem.stage)}
                  className="relative group flex-shrink-0"
                  aria-label={`${stageItem.name}${isStageCompleted ? " (completed)" : ""}`}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer",
                      isStageCompleted
                        ? cn(STAGE_DOT_ACTIVE[stageItem.stage], "bounce-in group-hover:pulse-glow")
                        : "border-white/20 bg-white/5 group-hover:border-white/40 group-hover:bg-white/10",
                      isSelected && "ring-2 ring-offset-1 ring-rose-400/60"
                    )}
                  >
                    {isStageCompleted && (
                      <div className={cn("w-2 h-2 rounded-full animate-pulse", {
                        "bg-indigo-300":  stageItem.stage === "FORM",
                        "bg-amber-400":   stageItem.stage === "STORM",
                        "bg-rose-300":    stageItem.stage === "NORM",
                        "bg-yellow-300":  stageItem.stage === "PERFORM",
                      })} />
                    )}
                  </div>

                  {/* Tooltip */}
                  <div
                    aria-hidden="true"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30"
                  >
                    <div className="rounded px-2 py-1 text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-rose-900/90 to-amber-900/90 border border-rose-400/40 text-rose-100 backdrop-blur-sm">
                      {stageItem.name}
                    </div>
                  </div>
                </button>
              </div>

              {/* Connector line with spectrum gradient */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className="flex-1 h-2 bg-black/20 transition-all duration-700 overflow-hidden"
                  style={{
                    background: isStageCompleted
                      ? `linear-gradient(to right, ${GLOW_COLORS[idx]}, ${GLOW_COLORS[idx + 1]})`
                      : "rgba(255, 255, 255, 0.1)"
                  }}
                >
                  {isStageCompleted && (
                    <div
                      className={cn(
                        "h-full transition-all duration-700 bg-gradient-to-r rounded-full",
                        SPECTRUM_GRADIENTS[idx * 4]
                      )}
                      style={{
                        width: "100%",
                        boxShadow: `0 0 12px ${GLOW_COLORS[idx]}60`
                      }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}