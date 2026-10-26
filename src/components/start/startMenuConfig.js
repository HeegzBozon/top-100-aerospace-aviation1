import { Award, BadgeCheck, Compass, Home, LayoutGrid, Trophy } from "lucide-react";

// The start screen: the platform as a title screen, six surfaces deep, in the
// order a Fellow meets them. The dashboard is the map; everything else is one
// step off it. Every row routes to a surface that already exists — the start
// screen holds the menu, the surfaces hold the work.
export const START_MENU = [
  {
    index: "01",
    label: "Dashboard",
    to: "/board",
    icon: LayoutGrid,
    blurb: "Check in, then four directions across.",
  },
  {
    index: "02",
    label: "Selection Committee",
    to: "/selection-committee",
    icon: Award,
    blurb: "Your eight, in order. Position 1 reads as position 1.",
  },
  {
    index: "03",
    label: "My Profile",
    to: "/Profile",
    icon: Home,
    blurb: "Credentials, flightography and the deck that carries them.",
  },
  {
    index: "04",
    label: "The Publication",
    to: "/Top100Women2025",
    icon: Trophy,
    blurb: "The editorial record of who was measured, and how.",
  },
  {
    index: "05",
    label: "Global Intelligence",
    to: "/GlobalIntelligence",
    icon: Compass,
    blurb: "The live picture: launches, traffic and watch.",
  },
  {
    index: "06",
    label: "Membership",
    to: "/Membership",
    icon: BadgeCheck,
    blurb: "What standing on the platform gives you, tier by tier.",
  },
];

export const START_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";