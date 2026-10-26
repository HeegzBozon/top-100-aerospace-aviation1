import { Award, BadgeCheck, BookOpen, LayoutGrid, Trophy, Users } from "lucide-react";

// The start screen: the platform as a title screen, six surfaces, in the order a
// Fellow meets them. The dashboard is the map; everything else is one step off
// it. Every tile routes to a surface that already exists — the start screen
// holds the menu, the surfaces hold the work.
export const START_MENU = [
  { index: "01", label: "Dashboard", to: "/board", icon: LayoutGrid },
  { index: "02", label: "Selection Committee", to: "/selection-committee", icon: Award },
  { index: "03", label: "Mission Briefing", to: "/mission-briefing", icon: BookOpen },
  { index: "04", label: "Networking", to: "/networking", icon: Users },
  { index: "05", label: "The Publication", to: "/Top100Women2025", icon: Trophy },
  { index: "06", label: "Membership", to: "/Membership", icon: BadgeCheck },
];

export const START_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";