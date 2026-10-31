import {
  MessageCircle, Trophy, Award, Users, Calendar, Rocket, Send, Briefcase,
  GraduationCap, Network, Radar, LayoutGrid, Globe2, Compass, Newspaper,
  ShoppingBag, Mail, CalendarCheck, Shield, LogIn, LogOut, UserPlus,
  Scissors, Layers, BookOpen, Gamepad2, Heart,
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { CORE_NAV_ITEMS } from "@/components/layout/navConfig";
import { iconMap, DefaultIcon } from "@/components/icons";
import { APP_GROUPS } from "@/components/shell/appRegistry";

// The handheld's destination model. ADMIN-owned rail items stay the command
// rail (the D-pad cycles them); the curated groups below give every surface a
// home in the journey map. Boards deep-link into the Bulletin Board cluster.
// The journey map, as it is walked. The platform reads the same for everyone; what
// changes for a visitor is only what is drawn in it. A group marked membersOnly is a
// Fellow's own record — their dashboard, their bulletins, their availability — and is
// simply not there for someone who has no record yet, while the platform's published
// work (the edition, the archive, the chamber) is offered to both, so a newcomer walks
// the same machine a Fellow does and is offered the way in at the end of it.
// The applications this machine runs: the same registry the desk shelf draws from, so a
// surface added once is reachable on both machines — shelf, index drawer and navigator.
export const NAVIGATOR_GROUPS = APP_GROUPS;

// Used when no RailItem records are configured, mirroring the legacy dock.
export const RAIL_FALLBACK = CORE_NAV_ITEMS.map((item) => ({
  label: item.label,
  to: item.query ? `${createPageUrl(item.pageName)}?${item.query}` : createPageUrl(item.pageName),
  icon: iconMap[item.icon] || DefaultIcon,
}));

export const MORE_FALLBACK = [
  { label: "Play", to: "/Arcade", icon: Gamepad2 },
  { label: "Launch Party", to: "/LaunchParty", icon: Rocket },
];

// A surface the platform has renamed: the bar names what the platform calls it, not
// the route it happens to live on.
const SURFACE_NAMES = {
  "/mission-briefing": "FAQ",
};

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

  // A group that belongs to a Fellow's own record goes whole: the flag stands on the
  // group rather than being repeated on every entry inside it.
  const groups = [
    railGroup,
    ...NAVIGATOR_GROUPS.filter((g) => !g.membersOnly || isSignedIn).map((g) => ({
      ...g,
      items: g.items.filter(visible),
    })),
  ];

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
  if (SURFACE_NAMES[location.pathname]) return SURFACE_NAMES[location.pathname];
  const segment = location.pathname.split("/").filter(Boolean).pop() || "HOME";
  return segment.replace(/[-_]/g, " ").toUpperCase();
}