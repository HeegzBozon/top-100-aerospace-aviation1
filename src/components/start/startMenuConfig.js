import { Award, BadgeCheck, BookOpen, LayoutGrid, Plane, Trophy, Users } from "lucide-react";

// The start screen: the platform as a title screen, the surfaces a Fellow meets,
// in order. The dashboard is the map; everything else is one step off it. Every
// tile routes to a surface that already exists — the start screen holds the menu,
// the surfaces hold the work.
//
// The game stands at the end of the row on purpose: it is the one surface built
// for play, and it belongs beside the institution's work rather than inside it.
export const START_MENU = [
  { key: "dashboard", index: "01", label: "Dashboard", to: "/board", icon: LayoutGrid },
  { key: "committee", index: "02", label: "Selection Committee", to: "/selection-committee", icon: Award },
  { key: "briefing", index: "03", label: "Mission Briefing", to: "/mission-briefing", icon: BookOpen },
  { key: "networking", index: "04", label: "Networking", to: "/networking", icon: Users },
  { key: "publication", index: "05", label: "The Publication", to: "/Top100Women2025", icon: Trophy },
  { key: "membership", index: "06", label: "Membership", to: "/Membership", icon: BadgeCheck },
  { key: "frontier", index: "07", label: "Aero-Frontier", to: "/aero-frontier", icon: Plane },
];

// The ballot: the one action the cycle is asking for, offered beside the
// countdown so the closing date and the way to vote are read in one line.
export const VOTE_OPTION = {
  key: "vote",
  label: "Vote now",
  // Straight onto the ballot: the vote tab itself, with the title card in front
  // of the Selection Committee skipped.
  to: "/selection-committee?tab=vote",
};

export const START_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";