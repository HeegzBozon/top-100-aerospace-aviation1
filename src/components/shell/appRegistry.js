import {
  Award, BookOpen, Briefcase, Calendar, CalendarCheck, Compass, GraduationCap,
  Globe2, Heart, Info, Landmark, Layers, LayoutGrid, LogIn, LogOut, Mail,
  MessageCircle, Network, Newspaper, Radar, Rocket, Scissors, Send, Shield,
  ShoppingBag, Ticket, Trophy, User, UserPlus, Users,
} from "lucide-react";

// THE APPLICATIONS THIS MACHINE RUNS.
//
// One registry, two presentations: the desk draws it as a shelf and an index drawer, the
// glass draws it as the console's navigator groups. A surface is added here once and is
// then reachable on both machines — that is the whole point of the file. Never declare an
// application inside a launcher again.
//
// Entry shape:
//   label         what the machine calls the surface
//   to            the route it opens
//   icon          its mark in the well
//   shelf         true = stands on the desk's shelf (the five a hand reaches for)
//   membersOnly   a Fellow's own record — not drawn for a visitor
//   adminOnly     the operator's surfaces
//   visitorsOnly  the way in, offered where a member is offered the ballot
//   action        "signin" | "join" | "logout" — an action rather than a route
//
// Governance: nothing here may be ordered, filtered, or featured by transaction,
// availability, or sponsorship state. The shelf is a launcher, not a placement.
export const APP_GROUPS = [
  {
    key: "identity",
    label: "Identity",
    membersOnly: true,
    items: [
      { label: "Dashboard", to: "/board", icon: LayoutGrid },
      { label: "My Profile", to: "/Profile", icon: User },
      { label: "The Bulletin", to: "/Profile?board=fellow", icon: LayoutGrid },
      { label: "Mission Rooms", to: "/Profile?board=conference", icon: Radar },
      { label: "Ribbon Cuttings", to: "/Profile?board=ribbon", icon: Scissors },
    ],
  },
  {
    key: "affiliation",
    label: "Affiliation",
    items: [
      { label: "Selection Committee", to: "/selection-committee", icon: Award, shelf: true },
      { label: "TOP 100 Women 2025", to: "/women-2025", icon: Trophy, shelf: true },
      { label: "Season Archive", to: "/ArchiveLanding", icon: BookOpen },
      { label: "Top Viral Posts", to: "/viralpost2026", icon: Newspaper },
      { label: "Patrons", to: "/Sponsors", icon: Heart },
    ],
  },
  {
    key: "availability",
    label: "Availability",
    membersOnly: true,
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
      { label: "Comms", to: "/Comms", icon: MessageCircle, membersOnly: true },
      { label: "Calendar", to: "/events", icon: Calendar, shelf: true },
      { label: "AeroSync CRM", to: "/aerosync", icon: Users, membersOnly: true },
      { label: "Operation Moon Joy", to: "/hangouts", icon: Rocket },
      { label: "Local Legends", to: "/local-legends", icon: Users },
      { label: "Mission Theatre", to: "/LaunchParty", icon: Ticket },
      { label: "2030 Vision", to: "/2030-vision", icon: Landmark },
      { label: "About", to: "/about", icon: Info },
    ],
  },
  {
    key: "intelligence",
    label: "Intelligence",
    items: [
      { label: "Intelligence Globe", to: "/intelligence-globe", icon: Globe2 },
      { label: "Global Intelligence", to: "/GlobalIntelligence", icon: Compass },
      { label: "Magazine Studio", to: "/magazine-studio", icon: BookOpen, membersOnly: true },
      { label: "Platform Board", to: "/platform-board", icon: Layers },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { label: "Shop", to: "/Shop", icon: ShoppingBag, shelf: true },
      { label: "Subscribe", to: "/subscribe", icon: Mail, shelf: true },
      { label: "RSVP", to: "/rsvp", icon: CalendarCheck },
      // The way in, in both readings — signing in, and making the account a visitor has
      // not got yet — standing where a member finds the way out.
      { label: "Log in", action: "signin", icon: LogIn, visitorsOnly: true },
      { label: "Join", action: "join", icon: UserPlus, visitorsOnly: true },
      { label: "Log out", action: "logout", icon: LogOut, membersOnly: true },
      { label: "Admin Portal", to: "/Admin", icon: Shield, adminOnly: true },
    ],
  },
];

// The desk's shelf, in registry order: the five surfaces a hand reaches for without
// opening the index.
export const SHELF = APP_GROUPS.flatMap((group) => group.items).filter((item) => item.shelf);

// The same applications read as an index: grouped, and only the entries that open
// somewhere (the way in and the way out are actions, and stand in the account menu).
export const INDEX_GROUPS = APP_GROUPS.map((group) => ({
  key: group.key,
  label: group.label,
  membersOnly: group.membersOnly,
  items: group.items.filter((item) => item.to),
})).filter((group) => group.items.length > 0);