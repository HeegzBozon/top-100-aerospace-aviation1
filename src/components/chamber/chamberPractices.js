import { Compass, PenTool, Sprout } from "lucide-react";

// The three practices the house keeps its own desk for. Each is a full page under
// /chamber: what the practice is for, what it takes on, how it is engaged, and the form
// that starts a conversation. Copy is the institution's own reading of the work — it
// describes a practice, never a person, and promises nothing it cannot stand behind.
export const CHAMBER_PRACTICES = [
  {
    key: "consulting",
    slug: "consulting",
    label: "Consulting",
    kicker: "Practice 01",
    icon: Compass,
    headline: "Counsel from people who have flown the programme.",
    summary:
      "The house keeps its own practitioners — engineers, programme leads, commercial and policy people who have carried aerospace work from concept to operation. They are engaged for a defined piece of work, and they leave a written record of it behind.",
    offer: [
      {
        title: "Diagnostic",
        detail: "One question, examined properly: where a programme, a team or a market actually stands, and what the first move is.",
      },
      {
        title: "Programme review",
        detail: "An independent reading of a live programme — the schedule logic, the risk that matters, and the decisions waiting on someone.",
      },
      {
        title: "Commercial and policy counsel",
        detail: "Pricing, positioning, procurement route and regulatory posture, argued against evidence rather than opinion.",
      },
    ],
    engagements: ["Single engagement", "Retained advisory", "Programme review"],
    briefPrompt: "What the work is, and what decision it has to inform.",
  },
  {
    key: "creative-agency",
    slug: "creative-agency",
    label: "Creative Agency",
    kicker: "Practice 02",
    icon: PenTool,
    headline: "Identity and editorial at the standard of the publication.",
    summary:
      "The house already publishes — a magazine, a record, an archive. That same studio takes commissioned work: identity systems, film, photography and editorial for organisations that need to be taken seriously by people who read carefully.",
    offer: [
      {
        title: "Identity and editorial systems",
        detail: "A mark, a type hierarchy and the page rules that hold them together across print, screen and the room.",
      },
      {
        title: "Film and photography",
        detail: "Portraiture and documentary made on site, cut for the record rather than for the feed.",
      },
      {
        title: "Publication and campaign",
        detail: "Magazines, annual records, launch editions and the campaign that carries them.",
      },
    ],
    engagements: ["Project", "Publication", "Annual retainer"],
    briefPrompt: "What is being made, and who has to take it seriously.",
  },
  {
    key: "incubator",
    slug: "incubator",
    label: "Incubator",
    kicker: "Practice 03",
    icon: Sprout,
    headline: "Early ventures, housed inside the institution.",
    summary:
      "For ventures before the first customer: a desk inside the house, the network that already reads the record, and the discipline of being measured against something written down. The earliest stage is the one where the surrounding matters most.",
    offer: [
      {
        title: "The desk",
        detail: "A place in the house — the boards, the introductions, the practitioners, and the room to be early in.",
      },
      {
        title: "The record",
        detail: "A written thesis, milestone by milestone, so progress is a matter of evidence rather than narrative.",
      },
      {
        title: "The route onward",
        detail: "A path into the accelerator cohort, or into the raise, or into a first customer introduced by the network.",
      },
    ],
    engagements: ["Founder residency", "Venture studio", "Milestone programme"],
    briefPrompt: "The venture, the stage it is at, and what it needs in the next ninety days.",
  },
];

export const practiceBySlug = (slug) =>
  CHAMBER_PRACTICES.find((practice) => practice.slug === slug) || null;