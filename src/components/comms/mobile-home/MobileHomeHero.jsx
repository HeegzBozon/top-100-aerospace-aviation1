import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Send, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { brandColors } from "@/components/core/brandTheme";

export default function MobileHomeHero({ isDarkMode, onNominationsClick }) {
  const { data: seasons = [] } = useQuery({
    queryKey: ["mobile-home-season"],
    queryFn: () => base44.entities.Season.list("-created_date", 3),
    staleTime: 5 * 60 * 1000,
  });

  const activeSeason = seasons.find(s =>
    s.status === "nominations_open" || s.name?.toLowerCase().includes("season 4")
  ) || seasons[0];

  const daysLeft = activeSeason?.nomination_end
    ? Math.max(0, Math.floor((new Date(activeSeason.nomination_end) - Date.now()) / 86400000))
    : null;

  const isNominationsOpen = daysLeft !== null && daysLeft >= 0;

  const heroBg = "linear-gradient(135deg, #1e3a5a 0%, #0f2a42 100%)";

  return (
    <div className="mx-4 mt-4 mb-3 rounded-2xl overflow-hidden shadow-lg relative" style={{ background: heroBg }}>
      {/* Ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${brandColors.goldPrestige}, transparent 70%)` }}
      />

      <div className="relative px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(201,168,124,0.85)" }}>
          {activeSeason?.name || "Season 4"}
        </p>
        <h2
          className="text-xl font-bold text-white leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Mission Control
        </h2>

        {isNominationsOpen && (
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onNominationsClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md"
              style={{ background: brandColors.goldPrestige }}
            >
              <Send className="w-4 h-4" />
              Submit Nomination
            </motion.button>
            {daysLeft !== null && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs font-medium text-white/60">{daysLeft}d left</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}