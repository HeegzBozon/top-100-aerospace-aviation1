import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    key: "FORM",
    label: "Forming",
    emoji: "👋",
    tagline: "Nice to meet you!",
    color: "indigo",
    borderClass: "border-indigo-500/40",
    bgClass: "bg-indigo-500/10",
    textClass: "text-indigo-300",
    dotClass: "bg-indigo-400",
    desc: "Team members are polite and cautious. Harmony is superficial — trust is still forming and performance is low. Everyone is feeling each other out.",
    leaderTip: "Set clear goals, assign responsibilities, and create opportunities for people to connect informally.",
  },
  {
    key: "STORM",
    label: "Storming",
    emoji: "⚡",
    tagline: "Batten down the hatches.",
    color: "amber",
    borderClass: "border-amber-500/40",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-300",
    dotClass: "bg-amber-400",
    desc: "Conflict and competition emerge as members push their own agendas. Discord is high, but this is healthy — it means people are opening up and engaging.",
    leaderTip: "Allow healthy conflict to play out. Set boundaries against personal attacks, and push disagreements toward definitive outcomes.",
  },
  {
    key: "NORM",
    label: "Norming",
    emoji: "🤝",
    tagline: "Love is in the air.",
    color: "rose",
    borderClass: "border-rose-500/40",
    bgClass: "bg-rose-500/10",
    textClass: "text-rose-300",
    dotClass: "bg-rose-400",
    desc: "Disagreements resolve, trust deepens, and performance visibly improves. A shared identity and working rhythm begin to emerge.",
    leaderTip: "Watch for messy compromises. Push toward best solutions, not just convenient ones. Build psychological safety.",
  },
  {
    key: "PERFORM",
    label: "Performing",
    emoji: "🚀",
    tagline: "We're really flying now.",
    color: "emerald",
    borderClass: "border-emerald-500/40",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-300",
    dotClass: "bg-emerald-400",
    desc: "High trust, high performance. The team operates fluidly, leverages individual strengths, and sustains momentum through continuous growth.",
    leaderTip: "Step back and empower. Celebrate wins, invest in growth, and prepare the team to mentor others.",
  },
];

export default function TuckmanInfoPanel({ open, onClose }) {
  const [activeStage, setActiveStage] = useState("FORM");
  const stage = STAGES.find(s => s.key === activeStage);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="tuckman-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="px-4 pt-3 pb-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                Tuckman's Stages of Team Development
              </p>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close Tuckman info"
              >
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>

            {/* Stage tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {STAGES.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveStage(s.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 min-h-[36px]",
                    activeStage === s.key
                      ? cn(s.bgClass, s.borderClass, s.textClass)
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8"
                  )}
                  aria-pressed={activeStage === s.key}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Stage detail card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "rounded-xl border p-3.5 space-y-2.5",
                  stage.bgClass,
                  stage.borderClass
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stage.emoji}</span>
                  <div>
                    <p className={cn("text-sm font-bold", stage.textClass)}>{stage.label}</p>
                    <p className="text-[11px] text-white/40 italic">{stage.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{stage.desc}</p>
                <div className="pt-1 border-t border-white/8">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Leader tip</p>
                  <p className="text-xs text-white/55 leading-relaxed">{stage.leaderTip}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <p className="text-[10px] text-white/25 text-center">
              Based on Tuckman (1965) — <span className="italic">Developmental Sequence in Small Groups</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}