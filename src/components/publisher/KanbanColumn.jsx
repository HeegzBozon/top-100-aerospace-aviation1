import React from "react";
import { Plus } from "lucide-react";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({ stage, ideas, onMoveCard, onEditCard, onAddCard, allStages }) {
  return (
    <div
      className="flex flex-col rounded-2xl border overflow-hidden shrink-0 w-[240px]"
      style={{ background: stage.bg, borderColor: stage.border }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: stage.border }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
          <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.label}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(232,220,200,0.4)" }}
          >
            {ideas.length}
          </span>
        </div>
        <button
          onClick={onAddCard}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: stage.color }}
          aria-label={`Add to ${stage.label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 min-h-[200px]">
        {ideas.map(idea => (
          <KanbanCard
            key={idea.id}
            idea={idea}
            stageColor={stage.color}
            onEdit={() => onEditCard(idea)}
            onMove={(targetStage) => onMoveCard(idea.id, targetStage)}
            allStages={allStages}
            currentStage={stage.id}
          />
        ))}
        {ideas.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-[10px] italic" style={{ color: "rgba(232,220,200,0.2)" }}>
              {stage.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}