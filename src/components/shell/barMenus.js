import {
  Briefcase, Home, LayoutGrid, ListChecks, LogIn, Radar, Send, Shield, UserCog,
} from "lucide-react";
import { START_MENU } from "@/components/start/startMenuConfig";

// The two menus the bar leads with, on both machines. File holds the way home and
// the platform's surfaces — the documents this machine opens. Edit holds everything a
// Fellow authors about themselves, so changing your own record is never more than one
// press from anywhere in the building: the profile first, then the Eight, the
// bulletins, the availability, the roles you have posted and the rooms you run.
//
// The flags are the journey drawer's own, resolved here rather than in the UI, so a
// visitor is offered the way in and nothing else.
export const FILE_GROUPS = [
  {
    key: "machine",
    label: "The machine",
    items: [{ label: "Front screen", to: "/", icon: Home }],
  },
  {
    key: "surfaces",
    label: "Surfaces",
    items: START_MENU.map(({ label, to, icon }) => ({ label, to, icon })),
  },
];

export const EDIT_GROUPS = [
  {
    key: "you",
    label: "You",
    items: [
      { label: "Edit my profile", to: "/Profile", icon: UserCog, membersOnly: true },
      { label: "My Eight", to: "/selection-committee", icon: ListChecks, membersOnly: true },
      { label: "My bulletins", to: "/Profile?board=fellow", icon: LayoutGrid, membersOnly: true },
      { label: "My availability", to: "/Profile?board=intros", icon: Send, membersOnly: true },
      { label: "My job posts", to: "/Profile?board=jobs", icon: Briefcase, membersOnly: true },
      { label: "My mission rooms", to: "/Profile?board=conference", icon: Radar, membersOnly: true },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { label: "Sign in", action: "signin", icon: LogIn, visitorsOnly: true },
      { label: "Admin portal", to: "/Admin", icon: Shield, adminOnly: true },
    ],
  },
];

const allowed = (item, { isSignedIn, isAdmin }) => {
  if (item.visitorsOnly) return !isSignedIn;
  if (item.membersOnly) return isSignedIn;
  if (item.adminOnly) return !!isAdmin;
  return true;
};

// The groups one of the two menus shows, for whoever is looking at it.
export function menuGroups(kind, state) {
  const groups = kind === "file" ? FILE_GROUPS : EDIT_GROUPS;
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => allowed(item, state)) }))
    .filter((group) => group.items.length > 0);
}