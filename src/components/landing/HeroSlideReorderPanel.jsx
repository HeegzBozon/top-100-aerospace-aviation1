import React from "react";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeroSlideReorderPanel({ slides, order, onReorder }) {
  const move = (idx, dir) => {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onReorder(next);
  };

  return (
    <div className="mx-3 md:mx-4 mt-2 rounded-xl border border-amber-400/30 bg-amber-950/20 backdrop-blur-sm px-4 py-3">
      <p className="text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-2">
        Admin · Slide Order
      </p>
      <div className="flex flex-col gap-1">
        {order.map((slideIdx, pos) => {
          const slide = slides[slideIdx];
          if (!slide) return null;
          return (
            <div
              key={slideIdx}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                "bg-white/5 border border-white/10"
              )}
            >
              <GripVertical className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <span className="flex-1 text-white/80 font-medium truncate">
                <span className="text-amber-400/70 mr-1.5">{pos + 1}.</span>
                {slide.tag}
                {slide.isLaunch && (
                  <span className="ml-1.5 text-amber-300 text-[9px] font-bold">🚀 LIVE</span>
                )}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => move(pos, -1)}
                  disabled={pos === 0}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move slide up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(pos, 1)}
                  disabled={pos === order.length - 1}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move slide down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}