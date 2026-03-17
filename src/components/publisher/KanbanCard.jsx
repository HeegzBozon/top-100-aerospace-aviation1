import React from "react";
import { MoreVertical, ArrowRight, ArrowLeft, Edit2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PLATFORM_DOTS = {
  linkedin:  "#7b9fd4",
  instagram: "#c9a87c",
  threads:   "rgba(232,220,200,0.5)",
  all:       "#6dbf8a",
};

const PRIORITY_STYLES = {
  high:   { color: "#e07a5f", label: "High" },
  medium: { color: "#c9a87c", label: "Med" },
  low:    { color: "rgba(232,220,200,0.3)", label: "Low" },
};

export default function KanbanCard({ idea, stageColor, onEdit, onMove, allStages, currentStage }) {
  const stageIdx    = allStages.findIndex(s => s.id === currentStage);
  const prevStage   = stageIdx > 0 ? allStages[stageIdx - 1] : null;
  const nextStage   = stageIdx < allStages.length - 1 ? allStages[stageIdx + 1] : null;
  const dotColor    = PLATFORM_DOTS[idea.platform] || PLATFORM_DOTS.all;
  const priorityCfg = PRIORITY_STYLES[idea.priority] || PRIORITY_STYLES.medium;

  return (
    <div
      className="group rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01]"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.07)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onEdit()}
      aria-label={`Edit: ${idea.title}`}
    >
      {/* Title */}
      <p className="text-xs font-semibold leading-snug line-clamp-2 mb-2" style={{ color: "rgba(232,220,200,0.85)" }}>
        {idea.title}
      </p>

      {/* Body preview */}
      {idea.body && (
        <p className="text-[10px] leading-relaxed line-clamp-2 mb-2" style={{ color: "rgba(232,220,200,0.4)" }}>
          {idea.body}
        </p>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1.5">
          {/* Platform dot */}
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} title={idea.platform} />
          {/* Priority */}
          <span className="text-[9px] font-bold" style={{ color: priorityCfg.color }}>
            {priorityCfg.label}
          </span>
          {/* Tags */}
          {idea.tags?.slice(0, 1).map(tag => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,220,200,0.35)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions dropdown — stop propagation so it doesn't trigger onEdit */}
        <div onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                style={{ color: "rgba(232,220,200,0.5)" }}
                aria-label="Card actions"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem onClick={onEdit} className="gap-2 text-xs">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {prevStage && (
                <DropdownMenuItem onClick={() => onMove(prevStage.id)} className="gap-2 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5" /> Move to {prevStage.label}
                </DropdownMenuItem>
              )}
              {nextStage && (
                <DropdownMenuItem onClick={() => onMove(nextStage.id)} className="gap-2 text-xs font-semibold" style={{ color: stageColor }}>
                  <ArrowRight className="w-3.5 h-3.5" /> Move to {nextStage.label}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {allStages.filter(s => s.id !== currentStage).map(s => (
                <DropdownMenuItem key={s.id} onClick={() => onMove(s.id)} className="gap-2 text-xs" style={{ color: s.color }}>
                  → {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}