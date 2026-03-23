import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, LayoutGrid } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import IdeaCardModal from "./IdeaCardModal";

export const STAGES = [
  {
    id: "idea",
    label: "Ideas",
    color: "#c9a87c",
    bg: "rgba(201,168,124,0.08)",
    border: "rgba(201,168,124,0.2)",
    description: "Raw sparks & concepts",
  },
  {
    id: "draft",
    label: "Drafts",
    color: "rgba(232,220,200,0.65)",
    bg: "rgba(232,220,200,0.05)",
    border: "rgba(232,220,200,0.1)",
    description: "Being written",
  },
  {
    id: "in_review",
    label: "In Review",
    color: "#7b9fd4",
    bg: "rgba(123,159,212,0.08)",
    border: "rgba(123,159,212,0.2)",
    description: "Awaiting feedback",
  },
  {
    id: "revisions",
    label: "Revisions",
    color: "#e07a5f",
    bg: "rgba(224,122,95,0.08)",
    border: "rgba(224,122,95,0.2)",
    description: "Needs edits",
  },
  {
    id: "approved",
    label: "Approved",
    color: "#6dbf8a",
    bg: "rgba(109,191,138,0.08)",
    border: "rgba(109,191,138,0.2)",
    description: "Cleared to publish",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
    description: "Date & time set",
  },
  {
    id: "published",
    label: "Published",
    color: "rgba(232,220,200,0.35)",
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.06)",
    description: "Live",
  },
];

export default function EditorialKanban({ userEmail }) {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState({ open: false, idea: null, defaultStage: "idea" });

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["content-ideas", userEmail],
    queryFn: () => base44.entities.ContentIdea.filter({ user_email: userEmail }, "-created_date", 200),
    enabled: !!userEmail,
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, stage }) => base44.entities.ContentIdea.update(id, { stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content-ideas", userEmail] }),
  });

  const ideasByStage = useMemo(() => {
    const map = {};
    STAGES.forEach(s => { map[s.id] = []; });
    ideas.forEach(idea => {
      if (map[idea.stage]) map[idea.stage].push(idea);
    });
    return map;
  }, [ideas]);

  const openCreate = (defaultStage = "idea") => setModalState({ open: true, idea: null, defaultStage });
  const openEdit   = (idea) => setModalState({ open: true, idea, defaultStage: idea.stage });
  const closeModal = () => {
    setModalState({ open: false, idea: null, defaultStage: "idea" });
    queryClient.invalidateQueries({ queryKey: ["content-ideas", userEmail] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(201,168,124,0.4)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Board header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" style={{ color: "rgba(201,168,124,0.6)" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(201,168,124,0.6)" }}>
            Editorial Pipeline
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,124,0.1)", color: "rgba(201,168,124,0.7)" }}>
            {ideas.length} total
          </span>
        </div>
        <button
          onClick={() => openCreate("idea")}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:scale-[1.02] min-h-[36px]"
          style={{
            background: "linear-gradient(135deg, #c9a87c 0%, #b8935c 100%)",
            color: "#0b1120",
            boxShadow: "0 4px 14px rgba(201,168,124,0.2)",
          }}
          aria-label="Add new idea"
        >
          <Plus className="w-3.5 h-3.5" />
          New Idea
        </button>
      </div>

      {/* Kanban columns — horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            ideas={ideasByStage[stage.id] || []}
            onMoveCard={(id, targetStage) => moveMutation.mutate({ id, stage: targetStage })}
            onEditCard={openEdit}
            onAddCard={() => openCreate(stage.id)}
            allStages={STAGES}
          />
        ))}
      </div>

      {modalState.open && (
        <IdeaCardModal
          idea={modalState.idea}
          defaultStage={modalState.defaultStage}
          userEmail={userEmail}
          stages={STAGES}
          onClose={closeModal}
        />
      )}
    </div>
  );
}