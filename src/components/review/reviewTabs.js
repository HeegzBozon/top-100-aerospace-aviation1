import { Archive, Info, PenLine, Users } from "lucide-react";

// Review: the things a Fellow comes back to the machine for that are not a program of
// work — how the platform runs, the people they have met and kept, the record that
// stands for them, and the cycles already closed. They were keys on the title screen and
// read as errands; here they are one surface with four tabs, so the machine answers
// "where do I go to look at something about me or about the record" with one key.
//
// The order is the order they are read in: what this is, then who is here with you, then
// your own entry in it, then everything it has already printed. A visitor gets the two
// the platform makes public; the network cartridge and the record are drawn only for a
// Fellow, because there is nothing behind them for anyone else.
export const REVIEW_TABS = [
  {
    key: "faq",
    index: "1",
    label: "FAQ",
    blurb: "The FAQ, the knowledge base behind the record, and the way to reach the desk.",
    to: "/mission-briefing",
    icon: Info,
  },
  {
    key: "network",
    index: "2",
    label: "My Network",
    blurb: "The people you have met and kept — the rolodex, the boards, and the desk that puts work in front of them.",
    to: "/aerosync",
    icon: Users,
    membersOnly: true,
  },
  {
    key: "record",
    index: "3",
    label: "Edit profile",
    blurb: "Your own record — the six checklists behind your profile, from the business card to the inbox.",
    to: "/record",
    icon: PenLine,
    membersOnly: true,
  },
  {
    key: "archive",
    index: "4",
    label: "Archive",
    blurb: "The volumes already closed. Every cycle since the first, kept as the record it is.",
    to: "/archive/6a6b70136ccb7c358f77dd7f",
    icon: Archive,
  },
];

export const reviewTabsFor = (isSignedIn = false) =>
  REVIEW_TABS.filter((tab) => !tab.membersOnly || isSignedIn);