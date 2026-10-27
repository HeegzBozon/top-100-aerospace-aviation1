import { Award, BookOpen, BookUser, LayoutGrid, ListChecks, Plane, Trophy, Users } from "lucide-react";

// The start screen: the platform as a title screen, the surfaces a Fellow meets,
// in order. The dashboard is the map; everything else is one step off it. Every
// tile routes to a surface that already exists — the start screen holds the menu,
// the surfaces hold the work.
//
// The committee stands as two surfaces rather than one drawer: nominating is the
// work of putting names in, voting is the work of measuring them, and a Fellow
// arriving at the title screen is almost always there for one of the two. Both land
// inside the hub itself — the tab is the deep link, so neither waits behind the
// title card in front of it.
//
// The game stands at the end of the row on purpose: it is the one surface built
// for play, and it belongs beside the institution's work rather than inside it.
export const START_MENU = [
  { key: "read", index: "00", label: "Read", to: "/mission-briefing", icon: BookOpen },
  { key: "nominate", index: "01", label: "Nominate", to: "/selection-committee?tab=nominate", icon: Award },
  { key: "vote-surface", index: "02", label: "Vote", to: "/selection-committee?tab=vote", icon: ListChecks },
  { key: "passport", index: "03", label: "Passport", to: "/Profile", icon: BookUser },
  { key: "dashboard", index: "04", label: "Dashboard", to: "/board", icon: LayoutGrid },
  { key: "results", index: "05", label: "Results", to: "/Top100Women2025", icon: Trophy },
  { key: "networking", index: "06", label: "AeroSync", to: "/networking", icon: Users },
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