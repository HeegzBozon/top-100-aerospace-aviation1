import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Diamond } from "lucide-react";

const STAGES = [
  { key: "FORM",    steps: [1, 2, 3, 4],     color: "text-indigo-300",  activeBg: "bg-indigo-500/20 border-indigo-500/50" },
  { key: "STORM",   steps: [5, 6, 7, 8],     color: "text-amber-300",   activeBg: "bg-amber-500/20 border-amber-500/50" },
  { key: "NORM",    steps: [9, 10, 11, 12],  color: "text-rose-300",    activeBg: "bg-rose-500/20 border-rose-500/50" },
  { key: "PERFORM", steps: [13, 14, 15, 16], color: "text-amber-200",   activeBg: "bg-amber-400/20 border-amber-400/50" },
];

export default function CrpStepPickerButton({ activeCrpStep, onSelect }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (step) => {
    onSelect(activeCrpStep === step ? null : step);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={activeCrpStep ? `Tagged to CRP step ${activeCrpStep}` : "Tag message to a CRP step"}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-all duration-200",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
            activeCrpStep
              ? "bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25"
              : "border-amber-400/20 text-amber-400/50 hover:text-amber-400/80 hover:border-amber-400/40"
          )}
        >
          <Diamond className="w-2.5 h-2.5" aria-hidden="true" />
          {activeCrpStep ? `Step ${activeCrpStep}` : "Step"}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        className="w-64 p-3 bg-gray-950 border border-gray-700/60 shadow-2xl backdrop-blur-lg"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Tag CRP Step
        </p>
        <div className="space-y-2">
          {STAGES.map(({ key, steps, color, activeBg }) => (
            <div key={key}>
              <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-1", color)}>
                {key}
              </p>
              <div className="grid grid-cols-4 gap-1">
                {steps.map((step) => {
                  const isActive = activeCrpStep === step;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleSelect(step)}
                      aria-pressed={isActive}
                      aria-label={`CRP Step ${step}`}
                      className={cn(
                        "h-8 rounded text-xs font-bold border transition-all duration-150",
                        "focus-visible:outline-2 focus-visible:outline-amber-400/60",
                        isActive
                          ? cn(activeBg, "text-white")
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                      )}
                    >
                      {step}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {activeCrpStep && (
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false); }}
            className="mt-2 w-full text-[10px] text-gray-600 hover:text-gray-400 transition-colors py-1 rounded"
          >
            Clear step tag
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}