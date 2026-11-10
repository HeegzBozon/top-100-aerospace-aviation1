import {
  BookOpen, Briefcase, ChevronsDown, ChevronsUp, Disc, Home, LayoutGrid, ListChecks, LogIn, Radar, Radio,
  Send, Shield, UserCog, UserPlus, Wand2,
} from "lucide-react";
import { START_MENU } from "@/components/start/startMenuConfig";
import { AUTO, RADIO, WHEEL } from "@/components/handheld/consoleMode";

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
    // The surfaces carry the title screen's own flags, so a visitor is offered the
    // platform's public work here and nothing that would ask them for an account.
    items: START_MENU.map(({ label, to, icon, membersOnly }) => ({ label, to, icon, membersOnly })),
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
      // The way in, in both of its readings: the returning Fellow signing in, and the
      // visitor making the account they do not have yet.
      { label: "Log in", action: "signin", icon: LogIn, visitorsOnly: true },
      { label: "Join", action: "join", icon: UserPlus, visitorsOnly: true },
      { label: "Admin portal", to: "/Admin", icon: Shield, adminOnly: true },
      { label: "Magazine Studio", to: "/magazine-studio", icon: BookOpen, adminOnly: true },
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

// View is the machine's own menu: what is standing on the picture, and the face it is
// wearing while it stands there. File says where you are and Edit says what you have
// written; View is about the apparatus itself, so the key that used to float alone on
// the glass and the MODE key that used to be the only way to change face both live here
// now — one list, in the bar, on both machines.
//
// The face is only offered where there is one to change: a desk has no wheel to turn, so
// it is never shown the choice. Whatever the machine is already standing in carries the
// same Now mark the lists give the surface you are reading.
export function viewGroups({ hardwareOn, onToggleHardware, face = null }) {
  const groups = [
    {
      key: "machine",
      label: "The machine",
      items: [
        {
          label: hardwareOn ? "Put the console away" : "Bring the console back",
          icon: hardwareOn ? ChevronsDown : ChevronsUp,
          now: !hardwareOn,
          onSelect: onToggleHardware,
        },
      ],
    },
  ];

  if (face) {
    const options = [
      { key: AUTO, label: `Automatic · ${face.mode === RADIO ? "Radio" : "Wheel"}`, icon: Wand2 },
      { key: WHEEL, label: "Click wheel", icon: Disc },
      { key: RADIO, label: "Radio keypad", icon: Radio },
    ];
    groups.push({
      key: "face",
      label: "Face",
      items: options.map((option) => ({
        label: option.label,
        icon: option.icon,
        now: face.chosen === option.key,
        onSelect: () => face.onChoose(option.key),
      })),
    });
  }

  return groups;
}