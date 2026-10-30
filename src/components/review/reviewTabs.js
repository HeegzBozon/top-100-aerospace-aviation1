import { Archive, Info, PenLine } from "lucide-react";

// Review: the three things a Fellow comes back to the machine for that are not a
// program of work — how the platform runs, the record that stands for them, and the
// cycles already closed. They were three keys on the title screen and read as three
// errands; here they are one surface with three tabs, so the machine answers "where
// do I go to look at something about me or about the record" with one key.
//
// The order is the order they are read in: what this is, then their own entry in it,
// then everything it has already printed. A visitor gets the two the platform makes
// public; the record's own tab is drawn only for a Fellow, because there is nothing
// behind it for anyone else.
export const REVIEW_TABS = [
  {
    key: "orientation",
    index: "1",
    label: "Orientation",
    blurb: "How the platform runs: the cycle, how names are measured, and what a Fellow is asked for.",
    to: "/mission-briefing",
    icon: Info,
  },
  {
    key: "record",
    index: "2",
    label: "Edit profile",
    blurb: "Your own record — the six checklists behind your profile, from the business card to the inbox.",
    to: "/record",
    icon: PenLine,
    membersOnly: true,
  },
  {
    key: "archive",
    index: "3",
    label: "Archive",
    blurb: "The volumes already closed. Every cycle since the first, kept as the record it is.",
    to: "/archive/6a6b70136ccb7c358f77dd7f",
    icon: Archive,
  },
];

export const reviewTabsFor = (isSignedIn = false) =>
  REVIEW_TABS.filter((tab) => !tab.membersOnly || isSignedIn);