import {
  Compass, Handshake, KeyRound, PenTool, Rocket, ShoppingBag, Sprout, Store, TrendingUp,
} from "lucide-react";

// The Chamber of Commerce: the house's trading floor. Two counters stand on it — the
// shelf of tools cut from a Fellow's own record, and the shop that prints the house's
// mark on objects — and behind them the offices the institution does business from.
//
// Every entry opens somewhere real. The three practices have their own desk under
// /chamber; membership, partnership and the raise open the surfaces that already carry
// them, and the round opens the Wefunder page itself rather than a page describing it.

export const CHAMBER_COUNTERS = [
  {
    key: "app-store",
    index: "1",
    label: "App Store",
    blurb: "The shelf of micro-tools, each doing one job on your own record and handing back an artifact.",
    to: "/app-store",
    icon: Store,
  },
  {
    key: "gift-shop",
    index: "2",
    label: "Gift Shop",
    blurb: "The house's own objects — the collection, the drops, and the list to be told when it opens.",
    to: "/gift-shop",
    icon: ShoppingBag,
  },
];

export const CHAMBER_OFFICES = [
  {
    key: "consulting",
    index: "3",
    label: "Consulting",
    blurb: "The house's practitioners, engaged for a defined piece of work.",
    to: "/chamber/consulting",
    icon: Compass,
  },
  {
    key: "creative-agency",
    index: "4",
    label: "Creative Agency",
    blurb: "Identity, editorial and film made to the standard the publication is printed at.",
    to: "/chamber/creative-agency",
    icon: PenTool,
  },
  {
    key: "incubator",
    index: "5",
    label: "Incubator",
    blurb: "Early ventures housed inside the institution, with the record behind them.",
    to: "/chamber/incubator",
    icon: Sprout,
  },
  {
    key: "accelerator",
    index: "6",
    label: "Accelerator",
    blurb: "The cohort programme for ventures already in the air.",
    to: "/AcceleratorHub",
    icon: Rocket,
  },
  {
    key: "membership",
    index: "7",
    label: "Membership",
    blurb: "Standing in the institution, read on one axis from public to patron.",
    to: "/Membership",
    icon: KeyRound,
  },
  {
    key: "sponsorship",
    index: "8",
    label: "Sponsorship",
    blurb: "Partnership with the record — patron of the work, never of the measurement.",
    to: "/SponsorPitch",
    icon: Handshake,
  },
  {
    key: "fundraising",
    index: "9",
    label: "Fundraising",
    blurb: "The round, open to the community on Wefunder.",
    href: "https://wefunder.com/top.100.aerospace.aviation",
    icon: TrendingUp,
  },
];