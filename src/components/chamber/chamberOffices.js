import { Briefcase, GraduationCap, Network, Scissors, Send } from "lucide-react";

// The desks the Chamber actually runs. A counter sells, an office is a department of the
// house — a desk is where the work of a member is done: a role put up, an introduction
// asked for and answered, a practice method to read, a community of practice to join, a
// milestone to be present at.
//
// Each one opens under /chamber/office and is served by the surface already built against
// its canonical entity — Job, Service and IntroRequest, CareerResource, DomainNetwork,
// Event. Nothing here introduces a second model; the desk is only the address the member
// can reach it from.
export const CHAMBER_DESKS = [
  {
    key: "opportunities",
    index: "3",
    label: "Opportunities",
    blurb: "Roles Fellows have put up, and the introduction that answers them.",
    to: "/chamber/office/opportunities",
    icon: Briefcase,
  },
  {
    key: "introductions",
    index: "4",
    label: "Introductions",
    blurb: "What members make themselves available for — and the requests sitting in your own desk.",
    to: "/chamber/office/introductions",
    icon: Send,
  },
  {
    key: "career",
    index: "5",
    label: "Career Center",
    blurb: "The curated credential and practice library, kept by the house.",
    to: "/chamber/office/career",
    icon: GraduationCap,
  },
  {
    key: "networks",
    index: "6",
    label: "Domain Networks",
    blurb: "The standing communities of practice — one to a domain.",
    to: "/chamber/office/networks",
    icon: Network,
  },
  {
    key: "milestones",
    index: "7",
    label: "Ribbon Cuttings",
    blurb: "Member milestones — openings, demo days, cohort launches — with the room to be there.",
    to: "/chamber/office/milestones",
    icon: Scissors,
  },
];

export const chamberDesk = (key) => CHAMBER_DESKS.find((desk) => desk.key === key) || null;