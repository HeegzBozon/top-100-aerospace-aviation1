import {
  Home, MessageCircle, Trophy, Award, Users, Calendar, Rocket, Send, Briefcase,
  GraduationCap, Network, Radar, LayoutGrid, Globe2, Compass, Newspaper,
  ShoppingBag, BadgeCheck, Mail, CalendarCheck, Shield, LogIn, LogOut,
  Scissors, Layers, BookOpen, Gamepad2, Heart,
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { CORE_NAV_ITEMS } from "@/components/layout/navConfig";
import { iconMap, DefaultIcon } from "@/components/icons";

// The handheld's destination model. ADMIN-owned rail items stay the command
// rail (the D-pad cycles them); the curated groups below give every surface a
// home in the journey map. Boards deep-link into the Bulletin Board cluster.
export const NAVIGATOR_GROUPS = [
  {
    key: "identity",
    label: "Identity",
    items: [
      { label: "Dashboard", to: "/board", icon: LayoutGrid },
      { label: "My Profile", to: "/Profile", icon: Home },
      { label: "The Bulletin", to: "/Profile?board=fellow", icon: LayoutGrid },
      { label: "Mission Rooms", to: "/Profile?board=conference", icon: Radar },
      { label: "Ribbon Cuttings", to: "/Profile?board=ribbon", icon: Scissors },
    ],
  },
  {
    key: "affiliation",
    label: "Affiliation",
    items: [
      { label: "Selection Committee", to: "/selection-committee", icon: Award },
      { label: "The Publication", to: "/Top100Women2025", icon: Trophy },
      { label: "Season Archive", to: "/ArchiveLanding", icon: BookOpen },
      { label: "Top Viral Posts", to: "/viralpost2026", icon: Newspaper },
      { label: "Patrons", to: "/Sponsors", icon: Heart },
    ],
  },
  {
    key: "availability",
    label: "Availability",
    items: [
      { label: "Introductions", to: "/Profile?board=intros", icon: Send },
      { label: "Job Board", to: "/Profile?board=jobs", icon: Briefcase },
      { label: "Career Center", to: "/Profile?board=career", icon: GraduationCap },
      { label: "Domain Networks", to: "/Profile?board=networks", icon: Network },
    ],
  },
  {
    key: "community",
    label: "Community",
    items: [
      { label: "Comms", to: "/Comms", icon: MessageCircle },
      { label: "Calendar", to: "/events", icon: Calendar },
      { label: "Networking", to: "/networking", icon: Users },
      { label: "Operation Moon Joy", to: "/hangouts", icon: Rocket },
      { label: "Local Legends", to: "/local-legends", icon: Users },
    ],
  },
  {
    key: "intelligence",
    label: "Intelligence",
    items: [
      { label: "Intelligence Globe", to: "/intelligence-globe", icon: Globe2 },
      { label: "Global Intelligence", to: "/GlobalIntelligence", icon: Compass },
      { label: "Magazine Studio", to: "/magazine-studio", icon: BookOpen },
      { label: "Platform Board", to: "/platform-board", icon: Layers },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { label: "Shop", to: "/Shop", icon: ShoppingBag },
      { label: "Membership", to: "/Membership", icon: BadgeCheck },
      { label: "Subscribe", to: "/subscribe", icon: Mail },
      { label: "RSVP", to: "/rsvp", icon: CalendarCheck },
      { label: "Sign in", action: "signin", icon: LogIn, visitorsOnly: true },
      { label: "Log out", action: "logout", icon: LogOut, membersOnly: true },
      { label: "Admin Portal", to: "/Admin", icon: Shield, adminOnly: true },
    ],
  },
];

// Used when no RailItem records are configured, mirroring the legacy dock.
export const RAIL_FALLBACK = CORE_NAV_ITEMS.map((item) => ({
  label: item.label,
  to: item.query ? `${createPageUrl(item.pageName)}?${item.query}` : createPageUrl(item.pageName),
  icon: iconMap[item.icon] || DefaultIcon,
}));

export const MORE_FALLBACK = [
  { label: "Profile", to: "/Profile", icon: Home },
  { label: "Play", to: "/Arcade", icon: Gamepad2 },
  { label: "Launch Party", to: "/LaunchParty", icon: Rocket },
];

const pathOf = (to = "") => to.split("?")[0];

export function destinationTo(record) {
  const page = record.page || record.pageName;
  if (!page) return null;
  const base = createPageUrl(page);
  return record.query ? `${base}?${record.query}` : base;
}

// Builds the ordered group list: command rail, the curated journey groups, then
// any admin-flagged overflow items.
export function buildGroups({ rail, more, isSignedIn, isAdmin }) {
  const visible = (item) => {
    if (item.visitorsOnly) return !isSignedIn;
    if (item.membersOnly) return isSignedIn;
    if (item.adminOnly) return !!isAdmin;
    return true;
  };

  const railGroup = {
    key: "rail",
    label: "Command Rail",
    items: rail.filter(visible),
  };

  const groups = [railGroup, ...NAVIGATOR_GROUPS.map((g) => ({ ...g, items: g.items.filter(visible) }))];

  if (more.length) {
    groups.push({ key: "more", label: "More", items: more.filter(visible) });
  }

  return groups.filter((g) => g.items.length > 0);
}

// Best-effort name for the surface currently on the screen.
export function surfaceLabel(location, groups) {
  if (!location) return "TOP 100";
  const exact = groups
    .flatMap((g) => g.items)
    .find((item) => item.to && item.to === `${location.pathname}${location.search}`);
  const loose = groups
    .flatMap((g) => g.items)
    .find((item) => item.to && pathOf(item.to) === location.pathname);
  if (exact) return exact.label;
  if (loose) return loose.label;
  const segment = location.pathname.split("/").filter(Boolean).pop() || "HOME";
  return segment.replace(/[-_]/g, " ").toUpperCase();
}