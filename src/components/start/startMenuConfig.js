import { Award, BookOpen, Landmark, ListChecks, LogIn, Shield, UserPlus } from "lucide-react";

// The start screen: the platform as a title screen, the surfaces a Fellow meets,
// in order. The dashboard is the map; everything else is one step off it. Every
// tile routes to a surface that already exists — the start screen holds the menu,
// the surfaces hold the work.
//
// The order is the order a Fellow arrives in: the committee's two acts first — nominating
// and measuring — because that is the work the cycle is asking for, then Review, which is
// the machine as something to look at rather than something to do, and the Chamber last.
//
// Review gathers what a Fellow comes back to rather than a program of work. It was
// three keys, then four: the orientation, the Fellow's own network cartridge, their
// record, and the archive of closed cycles are one surface with four tabs (see
// pages/Review), so the title screen does not spend a key on any of them.
//
// Orientation, nominating and the published edition are the platform's public work: anyone
// may do them. Measuring is a Fellow's — the ballot needs an account — and so are the
// surfaces that hold a person's own record, so they carry the member flag and are simply
// not drawn for a visitor.
export const START_MENU = [
  // The committee's first act: putting names in. A Fellow arrives here to nominate, not
  // to file a ballot — the ballot has its own key, and its own pill on the cycle band.
  { key: "nominate", index: "01", label: "Nominate", to: "/selection-committee?tab=nominate", icon: Award },
  // The committee's second act: a Fellow putting their own hundred in order.
  { key: "vote-surface", index: "02", label: "Vote", to: "/selection-committee?tab=vote", icon: ListChecks, membersOnly: true },
  // Review, closing the committee's row: the surface a Fellow comes back to look at rather
  // than to do. Its own tabs are the deep links — orientation, My Network, the record, the
  // published edition and the archive — so nothing waits behind the key in front of it.
  { key: "review", index: "03", label: "Review", to: "/review", icon: BookOpen },
  // The house's trading floor, closing the row: the App Store and the Gift Shop under one
  // roof rather than as two keys on a menu that only has room for programs. It is itself a
  // menu — turn to walk its two counters, # to open one. Public: every artifact on the
  // shelf is composed from the reader's own record, so there is nothing behind this key a
  // visitor cannot be shown.
  { key: "chamber", index: "04", label: "Chamber of Commerce", to: "/chamber", icon: Landmark },
];

// Administration, held back from the row: the surface the few who run the platform
// need, offered at the end of the menu so the titles a Fellow meets read the same
// whatever they are entitled to.
export const ADMIN_MENU = {
  key: "admin",
  index: "05",
  label: "Admin",
  to: "/Admin",
  icon: Shield,
};

// The row as it is drawn for whoever is reading it: what they are entitled to, and the
// administration held at the end for the few who run it.
export const startMenuFor = ({ isAdmin = false, isSignedIn = false } = {}) => [
  ...START_MENU.filter((item) => !item.membersOnly || isSignedIn),
  ...(isAdmin ? [ADMIN_MENU] : []),
];

// The two ways in, offered to a visitor where a member is offered the ballot — the title
// screen's own row — and again in the machine's drawers, so the door is never further
// than one press from anywhere in the building. Both are the platform's own door: it
// signs a Fellow in and opens the account a visitor has not made yet.
export const ACCOUNT_KEYS = [
  { key: "login", label: "Log in", action: "signin", icon: LogIn, visitorsOnly: true },
  { key: "join", label: "Join", action: "join", icon: UserPlus, visitorsOnly: true },
];

export const accountKeysFor = (isSignedIn) => (isSignedIn ? [] : ACCOUNT_KEYS);

// The ballot: the one action the cycle is asking for, offered under the countdown so the
// closing date and the way to vote are read in one line.
export const VOTE_OPTION = {
  key: "vote",
  label: "Vote now",
  // Straight onto the ballot: the vote tab itself, with the title card in front
  // of the Selection Committee skipped.
  to: "/selection-committee?tab=vote",
};

// The publishing alert: the other thing the title screen asks for, standing under the
// day the results go live. It is not a surface — the ring opens the field where it
// stands — so it is only reached through the console's cursor.
export const NOTIFY_OPTION = {
  key: "notify",
  label: "Get notified",
};

export const START_LOGO =
  "/brand/top100-mark-128.png";